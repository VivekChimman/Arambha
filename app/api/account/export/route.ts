import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { exportUserData } from "@/lib/account";
import { rateLimit, clientKey } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/account/export — a JSON copy of everything we hold (DPDP: right to access). */
export async function GET(request: Request) {
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
      return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
    }

    const limited = await rateLimit("account", clientKey(request, user.id));
    if (!limited.allowed) {
      return NextResponse.json(
        { error: "Too many downloads at once. Please try again in a little while." },
        { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } },
      );
    }

    const data = await exportUserData(user.id, user.email);
    const date = new Date().toISOString().slice(0, 10);

    return new NextResponse(JSON.stringify(data, null, 2), {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "content-disposition": `attachment; filename="arambha-my-data-${date}.json"`,
        "cache-control": "no-store",
      },
    });
  } catch (e) {
    console.error("[account/export] error:", e instanceof Error ? e.message : e);
    return NextResponse.json(
      { error: "We couldn’t build your download just now. Please try again." },
      { status: 500 },
    );
  }
}
