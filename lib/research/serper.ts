import { RESEARCH } from "@/lib/config";
import { serverEnv } from "@/lib/env";
import type { Source } from "@/lib/research/types";

interface SerperOrganic {
  title?: string;
  link?: string;
  snippet?: string;
  position?: number;
}

// Map our coarse region to Serper's `gl` (2-letter country) where we can.
const GL: Record<string, string> = { india: "in" };

/**
 * Serper.dev — cheap Google-results fallback (2,500 free on signup, then ~$1/1k).
 * Last link in the search chain, after the free options. Throws on failure.
 */
export async function serperSearch(
  query: string,
  country: string | undefined,
  signal: AbortSignal,
): Promise<Source[]> {
  const gl = country ? GL[country] : undefined;
  const res = await fetch("https://google.serper.dev/search", {
    method: "POST",
    signal,
    headers: {
      "content-type": "application/json",
      "X-API-KEY": serverEnv.serperKey,
    },
    body: JSON.stringify({ q: query, num: RESEARCH.resultsPerQuery, ...(gl ? { gl } : {}) }),
  });
  if (!res.ok) throw new Error(`serper: ${res.status}`);
  const data = (await res.json()) as { organic?: SerperOrganic[] };
  return (data.organic ?? [])
    .filter((r) => r.link)
    .map((r) => ({
      title: r.title || r.link!,
      url: r.link!,
      content: (r.snippet || "").slice(0, 4000),
      extracted: false,
      // Rank by position (1 = best) so it merges sensibly with scored providers.
      score: r.position ? 1 / r.position : undefined,
    }));
}
