/**
 * The deep-research roadmap engine (request-time).
 *
 *   intake → queries → Tavily/SearXNG/Serper → selected LLM → JSON →
 *   GROUNDING VALIDATION (every cited url must be in the retrieved set) → Roadmap
 *
 * Any failure — no search results, provider error, bad JSON, nothing grounded —
 * returns null so the caller keeps the deterministic roadmap. The LLM can only
 * cite urls we actually retrieved; hallucinated citations are dropped.
 */

import type { IntakeAnswers } from "@/lib/intake";
import type { ChosenPath, Phase, Roadmap, RoadmapSource } from "@/lib/composeRoadmap";
import { generate, llmAvailable, selectedModel } from "@/lib/llm";
import { researchAvailable, runDeepResearch, type Source } from "@/lib/research";
import { buildResearchPlan } from "@/lib/roadmap/queryBuilder";
import { systemPrompt } from "@/lib/roadmap/prompts";

const WINDOWS = ["Weeks 1–2", "Weeks 3–8", "Weeks 9–13"];
const ROLE_RANK: Record<string, number> = { Earn: 0, Build: 1, Grow: 2 };
const SCAM_WARNING =
  "A genuine job or platform never asks you to pay a registration, training, or placement fee. If it does, walk away.";

export function researchEngineReady(): boolean {
  return researchAvailable() && llmAvailable();
}

interface RawPath {
  role?: string;
  kindLabel?: string;
  title?: string;
  why?: string;
  cost?: string;
  eligibility?: string;
  firstSteps?: unknown;
  sourceUrl?: string;
  scamWarning?: boolean;
}

function parseJson(text: string): Record<string, unknown> | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    const obj = JSON.parse(text.slice(start, end + 1));
    return obj && typeof obj === "object" ? (obj as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function sourcesBlock(sources: Source[]): string {
  return sources
    .slice(0, 10)
    .map(
      (s, i) =>
        `[${i + 1}] ${s.title}\nurl: ${s.url}\n${s.content.slice(0, 1500)}`,
    )
    .join("\n\n---\n\n");
}

export async function generateResearchedRoadmap(
  a: IntakeAnswers,
  debug?: string[],
): Promise<Roadmap | null> {
  if (!researchEngineReady()) {
    debug?.push("engine-not-ready");
    return null;
  }

  // 1) Retrieve.
  const plan = buildResearchPlan(a);
  const sources = await runDeepResearch(plan).catch((e) => {
    console.error("[research] search error:", e instanceof Error ? e.message : e);
    debug?.push(`search-error: ${e instanceof Error ? e.message : e}`);
    return [] as Source[];
  });
  debug?.push(`sources: ${sources.length}`);
  if (sources.length < 3) return null; // too little to ground on → fallback

  const allowed = new Map(sources.map((s) => [s.url, s]));

  // 2) Synthesize with the ONE selected model.
  let out;
  try {
    out = await generate({
      system: systemPrompt(a.mode),
      messages: [
        {
          role: "user",
          content: `SEARCH RESULTS (cite by url — only these urls are allowed):\n\n${sourcesBlock(
            sources,
          )}\n\nBuild the roadmap as specified. Cite each path's sourceUrl from the list above.`,
        },
      ],
    });
  } catch (e) {
    console.error("[research] llm error:", e instanceof Error ? e.message : e);
    debug?.push(`llm-error: ${e instanceof Error ? e.message : e}`);
    return null;
  }
  debug?.push(`out-len: ${out.text.length}`);

  const parsed = parseJson(out.text);
  if (!parsed || !Array.isArray(parsed.paths)) {
    debug?.push("parse-fail");
    return null;
  }

  // 3) GROUNDING VALIDATION — keep only paths that cite a retrieved url.
  const grounded = (parsed.paths as RawPath[])
    .filter((p) => p.title && p.sourceUrl && allowed.has(p.sourceUrl))
    .sort((x, y) => (ROLE_RANK[x.role ?? "Grow"] ?? 2) - (ROLE_RANK[y.role ?? "Grow"] ?? 2))
    .slice(0, 3);
  debug?.push(`grounded: ${grounded.length}`);
  if (grounded.length < 2) return null; // not enough real, cited paths → fallback

  const roles: Array<"Earn" | "Build" | "Grow"> = ["Earn", "Build", "Grow"];
  const paths: ChosenPath[] = grounded.map((p, i) => ({
    kindLabel: (p.kindLabel || "Path").slice(0, 24),
    title: p.title!.slice(0, 140),
    summary: (p.eligibility || p.why || "").slice(0, 300),
    why: p.why?.slice(0, 300),
    role: roles[i] ?? "Grow",
    scamWarning: Boolean(p.scamWarning),
    cost: typeof p.cost === "string" ? p.cost.slice(0, 80) : undefined,
    eligibility: typeof p.eligibility === "string" ? p.eligibility.slice(0, 200) : undefined,
    sourceUrl: p.sourceUrl,
    firstSteps: Array.isArray(p.firstSteps)
      ? p.firstSteps.filter((s): s is string => typeof s === "string").slice(0, 4)
      : undefined,
  }));

  const phases: Phase[] = paths.map((p, i) => ({
    weeks: WINDOWS[i] ?? "Ongoing",
    role: p.role,
    pathTitle: p.title,
    actions: p.firstSteps ?? [],
  }));

  // Citations actually used, mapped back to retrieved titles.
  const usedUrls = [...new Set(paths.map((p) => p.sourceUrl!).filter(Boolean))];
  const citations: RoadmapSource[] = usedUrls.map((url) => ({
    title: allowed.get(url)?.title ?? url,
    url,
  }));

  const warnings = new Set<string>(
    (Array.isArray(parsed.warnings) ? (parsed.warnings as unknown[]) : []).filter(
      (w): w is string => typeof w === "string",
    ),
  );
  if (paths.some((p) => p.scamWarning)) warnings.add(SCAM_WARNING);

  return {
    summaryLine:
      typeof parsed.summaryLine === "string"
        ? parsed.summaryLine
        : "Three grounded paths, sequenced over 90 days.",
    paths,
    phases,
    cashflowTip: typeof parsed.cashflowTip === "string" ? parsed.cashflowTip : "",
    warnings: [...warnings],
    groundedFrom: sources.length,
    researched: true,
    sources: citations,
    modelId: selectedModel().id,
  };
}
