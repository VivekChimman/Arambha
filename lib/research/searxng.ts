import { RESEARCH } from "@/lib/config";
import { env } from "@/lib/env";
import type { Source } from "@/lib/research/types";

interface SearxResult {
  title?: string;
  url?: string;
  content?: string;
  score?: number;
}

/**
 * Free fallback search via a self-hosted SearXNG instance (SEARXNG_URL). SearXNG
 * is open-source metasearch — $0 and unlimited when you host it, aggregating
 * Google/Bing/etc. The instance must have the JSON format enabled in its config.
 * Throws on failure so the orchestrator can fall through.
 */
export async function searxngSearch(query: string, signal: AbortSignal): Promise<Source[]> {
  const base = env.searxngUrl.replace(/\/$/, "");
  const url = `${base}/search?q=${encodeURIComponent(query)}&format=json&safesearch=1`;
  const res = await fetch(url, { signal, headers: { accept: "application/json" } });
  if (!res.ok) throw new Error(`searxng: ${res.status}`);
  const data = (await res.json()) as { results?: SearxResult[] };
  return (data.results ?? [])
    .filter((r) => r.url)
    .slice(0, RESEARCH.resultsPerQuery)
    .map((r) => ({
      title: r.title || r.url!,
      url: r.url!,
      content: (r.content || "").slice(0, 4000),
      extracted: false,
      score: r.score,
    }));
}
