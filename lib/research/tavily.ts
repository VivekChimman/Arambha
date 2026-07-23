import { RESEARCH } from "@/lib/config";
import { serverEnv } from "@/lib/env";
import type { Source } from "@/lib/research/types";

interface TavilyResult {
  title: string;
  url: string;
  content: string;
  score?: number;
  raw_content?: string;
}

/**
 * One Tavily search. Throws on failure; the orchestrator decides how to degrade.
 * `advanced` depth + include_raw_content gives us fuller snippets to ground on.
 * `include_domains` / `exclude_domains` let the query builder steer toward
 * official sources and away from known lead-farms.
 */
export async function tavilySearch(
  query: string,
  opts: { country?: string; includeDomains?: string[]; excludeDomains?: string[] },
  signal: AbortSignal,
): Promise<Source[]> {
  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    signal,
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${serverEnv.tavilyKey}`,
    },
    body: JSON.stringify({
      query,
      search_depth: "advanced",
      max_results: RESEARCH.resultsPerQuery,
      include_raw_content: true,
      include_answer: false,
      ...(opts.country ? { country: opts.country } : {}),
      ...(opts.includeDomains?.length ? { include_domains: opts.includeDomains } : {}),
      ...(opts.excludeDomains?.length ? { exclude_domains: opts.excludeDomains } : {}),
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`tavily: ${res.status} ${body.slice(0, 200)}`);
  }
  const data = (await res.json()) as { results?: TavilyResult[] };
  return (data.results ?? []).map((r) => ({
    title: r.title,
    url: r.url,
    content: (r.raw_content || r.content || "").slice(0, 4000),
    extracted: false,
    score: r.score,
  }));
}
