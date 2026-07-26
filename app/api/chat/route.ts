import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { chatTurn } from "@/lib/chat/generate";
import type { Roadmap } from "@/lib/composeRoadmap";
import type { ChatMessage } from "@/lib/llm/types";
import { rateLimit, clientKey } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30; // one LLM call, no research

const MAX_MESSAGE = 1000;
const HISTORY_TURNS = 12;

/**
 * POST /api/chat — a follow-up question about ONE saved report.
 *
 * Costs a single LLM call (no web research), so it doesn't consume a report
 * credit. Guardrails live in lib/chat/generate.ts: off-topic questions are
 * refused, and the reply may not cite a url the report doesn't already have.
 */
export async function POST(request: Request) {
  try {
    if (!env.hasSupabase) {
      return NextResponse.json(
        { error: "Chat is temporarily unavailable. Please try again shortly." },
        { status: 503 },
      );
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
    }

    const limited = await rateLimit("chat", clientKey(request, user.id));
    if (!limited.allowed) {
      return NextResponse.json(
        { error: "You’re asking faster than I can keep up. Please try again shortly." },
        { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } },
      );
    }

    const body = (await request.json().catch(() => ({}))) as {
      reportId?: unknown;
      message?: unknown;
    };
    const reportId = typeof body.reportId === "string" ? body.reportId : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!reportId || !message) {
      return NextResponse.json({ error: "Please type a question first." }, { status: 400 });
    }
    if (message.length > MAX_MESSAGE) {
      return NextResponse.json(
        { error: "That’s a long one — please shorten it a little." },
        { status: 400 },
      );
    }

    // The report is the scope. RLS restricts it to the owner; we filter too.
    const { data: report } = await supabase
      .from("reports")
      .select("id, roadmap")
      .eq("id", reportId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!report) {
      return NextResponse.json({ error: "We couldn’t find that report." }, { status: 404 });
    }

    const { data: past } = await supabase
      .from("chat_messages")
      .select("role, content")
      .eq("report_id", reportId)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(HISTORY_TURNS);

    const history: ChatMessage[] = (past ?? [])
      .reverse()
      .map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content }));

    const turn = await chatTurn({
      roadmap: report.roadmap as Roadmap,
      history,
      message,
    });

    // Persist the exchange (skip when the LLM was unavailable — nothing was said).
    if (!turn.degraded) {
      await supabase.from("chat_messages").insert([
        { user_id: user.id, report_id: reportId, role: "user", content: message },
        { user_id: user.id, report_id: reportId, role: "assistant", content: turn.reply },
      ]);
    }

    return NextResponse.json({ reply: turn.reply, refused: turn.refused });
  } catch (e) {
    console.error("[chat] error:", e instanceof Error ? e.message : e);
    return NextResponse.json(
      { error: "Something went wrong on our side. Please try again." },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed." }, { status: 405 });
}
