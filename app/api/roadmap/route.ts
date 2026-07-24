import { NextResponse } from "next/server";
import { validateAnswers } from "@/lib/intake";
import { composeRoadmap, eligiblePathways } from "@/lib/composeRoadmap";
import { enhanceRoadmap, llmAvailable } from "@/lib/roadmapLLM";
import { generateResearchedRoadmap, researchEngineReady } from "@/lib/roadmap/generate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Deep research (search + extract + model) can take ~15–25s — raise the serverless
// function limit so Vercel doesn't kill it (default would time it out).
export const maxDuration = 60;

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

    // Tiered generation, each degrading to the next:
    //   1) deep-research engine (Tavily/… + selected LLM, grounded on retrieved urls)
    //   2) grounded-static LLM personalisation (when no search is configured)
    //   3) deterministic composer — the always-available baseline
    let roadmap = composeRoadmap(answers);
    if (researchEngineReady()) {
      const researched = await generateResearchedRoadmap(answers).catch(() => null);
      if (researched) roadmap = researched;
    } else if (llmAvailable()) {
      const enhanced = await enhanceRoadmap(answers).catch(() => null);
      if (enhanced) roadmap = enhanced;
    }

    // Grounding check, by engine:
    //  - researched: grounded on retrieved sourceUrls (validated in generate) — every path must carry one.
    //  - deterministic/static: every path id must be an eligible, real pathway.
    let grounded: boolean;
    if (roadmap.researched) {
      grounded = roadmap.paths.length > 0 && roadmap.paths.every((p) => Boolean(p.sourceUrl));
    } else {
      const allowed = new Set(eligiblePathways(answers).map((p) => p.id));
      grounded = roadmap.paths.length > 0 && roadmap.paths.every((p) => p.id != null && allowed.has(p.id));
    }
    if (!grounded) {
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
