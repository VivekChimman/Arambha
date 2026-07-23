import { NextResponse } from "next/server";
import { validateAnswers } from "@/lib/intake";
import { composeRoadmap, eligiblePathways } from "@/lib/composeRoadmap";
import { enhanceRoadmap, llmAvailable } from "@/lib/roadmapLLM";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/roadmap — turn intake answers into a grounded 90-day roadmap.
 *
 * Guarantees (CLAUDE.md):
 *  - Every input is validated against the intake whitelist before use.
 *  - GROUNDING CHECK: every path in the response must exist in the eligible
 *    shortlist derived from lib/pathways.ts. Do not weaken this. It is the guard
 *    that stops a desperate user being handed a path that does not exist.
 *  - No raw provider/internal error ever reaches the client.
 *
 * Rate limiting is fail-open: with Upstash unconfigured it is a no-op today.
 */
export async function POST(request: Request) {
  try {
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

    // Deterministic baseline always exists. If the LLM layer is available, let it
    // personalise on top — but any failure/refusal silently keeps the baseline.
    let roadmap = composeRoadmap(answers);
    if (llmAvailable()) {
      const enhanced = await enhanceRoadmap(answers).catch(() => null);
      if (enhanced) roadmap = enhanced;
    }

    // Grounding check — the response may only reference eligible, real pathways.
    // This guards the LLM path too: a hallucinated id here reverts to a safe error.
    const allowed = new Set(eligiblePathways(answers).map((p) => p.id));
    const grounded = roadmap.paths.every((p) => allowed.has(p.id));
    if (!grounded || roadmap.paths.length === 0) {
      // Should be impossible with the deterministic composer; fail safe if it ever isn't.
      return NextResponse.json(
        { error: "We couldn’t build a grounded roadmap from those answers just yet." },
        { status: 422 },
      );
    }

    return NextResponse.json({ roadmap });
  } catch {
    // Never leak internals.
    return NextResponse.json(
      { error: "Something went wrong on our side. Please try again." },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed." }, { status: 405 });
}
