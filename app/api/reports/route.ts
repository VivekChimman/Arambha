import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { validateAnswers, INTAKE_QUESTIONS, type IntakeAnswers } from "@/lib/intake";
import { composeRoadmap, eligiblePathways, type Roadmap } from "@/lib/composeRoadmap";
import { generateResearchedRoadmap } from "@/lib/roadmap/generate";
import { createClient } from "@/lib/supabase/server";
import { getQuota, consumeQuota } from "@/lib/subscription";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Deep research runs here — allow the long function duration (Hobby max).
export const maxDuration = 60;

/**
 * POST /api/reports — the researched report for a SIGNED-IN user.
 *
 * Gated server-side on account + quota (free trial, or 10/month subscription).
 * Runs deep research, saves the report for history, and consumes a credit ONLY
 * when the research actually succeeded — a degraded (deterministic) roadmap is
 * never charged for.
 *
 * Anonymous users stay on the free deterministic teaser at /api/roadmap.
 */
export async function POST(request: Request) {
  try {
    if (!env.hasSupabase) {
      return NextResponse.json(
        { error: "Accounts are temporarily unavailable. Please try again shortly." },
        { status: 503 },
      );
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Please sign in first.", signInRequired: true }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "We couldn’t read that request." }, { status: 400 });
    }

    const answers = validateAnswers(body);
    if (!answers) {
      return NextResponse.json(
        { error: "Some answers were missing or invalid. Please start again." },
        { status: 400 },
      );
    }

    // ── Quota gate (server-side, never the client) ──────────────────────────
    const quota = await getQuota(user.id);
    if (!quota.allowed) {
      return NextResponse.json(
        {
          error: quota.active
            ? "You’ve used all 10 reports this month. Your quota resets on your next renewal."
            : "You’ve used your free report. Subscribe for 10 researched reports a month.",
          needsSubscription: !quota.active,
          quotaExhausted: true,
        },
        { status: 402 },
      );
    }

    // ── Generate. Research first; degrade to the deterministic composer. ─────
    const researched = await generateResearchedRoadmap(answers).catch(() => null);
    const roadmap: Roadmap = researched ?? composeRoadmap(answers);

    // GROUNDING CHECK. The researched path is already validated inside
    // generateResearchedRoadmap (cited urls ⊆ retrieved set); the deterministic
    // path must only contain ids from the eligible shortlist.
    if (!roadmap.researched) {
      const allowed = new Set(eligiblePathways(answers).map((p) => p.id));
      const grounded =
        roadmap.paths.length > 0 && roadmap.paths.every((p) => p.id != null && allowed.has(p.id));
      if (!grounded) {
        return NextResponse.json(
          { error: "We couldn’t build a grounded roadmap from those answers just yet." },
          { status: 422 },
        );
      }
    }

    // ── Save for history (RLS: a user can only insert their own rows) ────────
    const { data: saved, error: saveError } = await supabase
      .from("reports")
      .insert({
        user_id: user.id,
        title: reportTitle(answers),
        mode: answers.mode,
        answers,
        roadmap,
      })
      .select("id")
      .single();

    if (saveError || !saved) {
      console.error("[reports] save failed:", saveError?.message);
      // The roadmap is good — return it inline rather than losing the user's work.
      return NextResponse.json({ roadmap, saved: false, researched: Boolean(roadmap.researched) });
    }

    // Charge only for a genuinely researched report.
    if (roadmap.researched) {
      await consumeQuota(user.id, quota.viaFree).catch((e) =>
        console.error("[reports] quota consume failed:", e instanceof Error ? e.message : e),
      );
    }

    return NextResponse.json({
      id: saved.id,
      saved: true,
      researched: Boolean(roadmap.researched),
    });
  } catch (e) {
    console.error("[reports] error:", e instanceof Error ? e.message : e);
    return NextResponse.json(
      { error: "Something went wrong on our side. Please try again." },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed." }, { status: 405 });
}

/** A short human label for the history list, built from the user's own answers. */
function reportTitle(a: IntakeAnswers): string {
  const label = (id: "situation" | "interest", value?: string) =>
    INTAKE_QUESTIONS.find((q) => q.id === id)?.options.find((o) => o.value === value)?.label;

  const focus = label("interest", a.interest) ?? label("situation", a.situation);
  const track = a.mode === "builder" ? "Build my own" : "Find work";
  return focus ? `${track} · ${focus}` : track;
}
