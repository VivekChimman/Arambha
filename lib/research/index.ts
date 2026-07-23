import { RESEARCH } from "@/lib/config";
import { env } from "@/lib/env";
import { tavilySearch } from "@/lib/research/tavily";
import { searxngSearch } from "@/lib/research/searxng";
import { serperSearch } from "@/lib/research/serper";
import { firecrawlScrape } from "@/lib/research/firecrawl";
import type { Source } from "@/lib/research/types";

export type { Source } from "@/lib/research/types";

/** True if any search provider is configured. Firecrawl is optional enrichment. */
export function researchAvailable(): boolean {
  return env.hasTavily || env.hasSearxng || env.hasSerper;
}

/**
 * Ordered search providers. Unlike the LLM (single model, no fallback), SEARCH
 * may fall back: Tavily first (best quality, 1k/mo free), then a free self-hosted
 * SearXNG instance. Each takes (query, signal) and returns Sources or throws.
 */
type SearchFn = (query: string, signal: AbortSignal) => Promise<Source[]>;

function searchProviders(input: ResearchInput): SearchFn[] {
  const providers: SearchFn[] = [];
  if (env.hasTavily) {
    providers.push((q, signal) =>
      tavilySearch(
        q,
        {
          country: input.country,
          includeDomains: input.includeDomains,
          excludeDomains: input.excludeDomains,
        },
        signal,
      ),
    );
  }
  if (env.hasSearxng) providers.push((q, signal) => searxngSearch(q, signal));
  if (env.hasSerper) providers.push((q, signal) => serperSearch(q, input.country, signal));
  return providers;
}

export interface ResearchInput {
  queries: string[];
  country?: string;
  includeDomains?: string[];
  excludeDomains?: string[];
}

/**
 * Deep research: run the queries through Tavily (in parallel), dedupe by url,
 * rank, then deep-extract the top pages with Firecrawl for fuller grounding.
 * Returns the citable Source[] — this IS the grounding allow-list handed to the
 * model. A search that returns nothing yields [] (caller degrades gracefully).
 */
export async function runDeepResearch(input: ResearchInput): Promise<Source[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), RESEARCH.searchTimeoutMs);

  try {
    const queries = input.queries.slice(0, RESEARCH.maxQueries);
    const providers = searchProviders(input);

    // Try each search provider in order; use the first that returns anything.
    let ranked: Source[] = [];
    for (const search of providers) {
      const batches = await Promise.allSettled(
        queries.map((q) => search(q, controller.signal)),
      );
      const byUrl = new Map<string, Source>();
      for (const b of batches) {
        if (b.status !== "fulfilled") continue;
        for (const s of b.value) {
          const existing = byUrl.get(s.url);
          if (!existing || (s.score ?? 0) > (existing.score ?? 0)) byUrl.set(s.url, s);
        }
      }
      if (byUrl.size > 0) {
        ranked = [...byUrl.values()].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
        break;
      }
    }
    if (ranked.length === 0) return [];

    // Deep-extract the top pages (best-effort) to upgrade snippets → full text.
    if (env.hasFirecrawl) {
      const top = ranked.slice(0, RESEARCH.extractTopN);
      const extracted = await Promise.allSettled(
        top.map((s) => firecrawlScrape(s.url, controller.signal)),
      );
      extracted.forEach((r, i) => {
        if (r.status === "fulfilled" && r.value) {
          top[i].content = r.value.markdown;
          top[i].extracted = true;
          if (r.value.title) top[i].title = r.value.title;
        }
      });
    }

    return ranked;
  } finally {
    clearTimeout(timer);
  }
}
