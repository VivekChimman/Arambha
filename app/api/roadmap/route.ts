import { NextResponse } from "next/server";
import { validateAnswers } from "@/lib/intake";
import { composeRoadmap, eligiblePathways } from "@/lib/composeRoadmap";
import { rateLimit, clientKey } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/roadmap — the FREE teaser.
 *
 * Returns the deterministic 3-path roadmap only (costs us nothing). The costly
 * deep-research report is gated behind payment and lives in /api/report. Keeping
 * research out of the free path is deliberate: it protects per-run cost.
 *
 * Grounding: every returned path id must be an eligible, real pathway.
 */
export async function POST(request: Request) {
  try {
    // Anonymous endpoint — limit by salted IP hash (never the raw IP).
    const limited = await rateLimit("roadmap", clientKey(request));
    if (!limited.allowed) {
      return NextResponse.json(
        { error: "You’ve built a few roadmaps already. Please try again in a little while." },
        { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } },
      );
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

    const roadmap = composeRoadmap(answers);

    const allowed = new Set(eligiblePathways(answers).map((p) => p.id));
    const grounded =
      roadmap.paths.length > 0 && roadmap.paths.every((p) => p.id != null && allowed.has(p.id));
    if (!grounded) {
      return NextResponse.json(
        { error: "We couldn’t build a grounded roadmap from those answers just yet." },
        { status: 422 },
      );
    }

    return NextResponse.json({ roadmap });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong on our side. Please try again." },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed." }, { status: 405 });
}
