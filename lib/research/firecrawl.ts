import { serverEnv } from "@/lib/env";

interface FirecrawlResponse {
  success?: boolean;
  data?: {
    markdown?: string;
    metadata?: { title?: string; sourceURL?: string; url?: string };
  };
}

/**
 * Deep-extract one page's main content as markdown. Returns null on any failure
 * (the Tavily snippet still stands as the source), so extraction is best-effort.
 */
export async function firecrawlScrape(
  url: string,
  signal: AbortSignal,
): Promise<{ title: string; url: string; markdown: string } | null> {
  try {
    const res = await fetch("https://api.firecrawl.dev/v2/scrape", {
      method: "POST",
      signal,
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${serverEnv.firecrawlKey}`,
      },
      body: JSON.stringify({ url, formats: ["markdown"], onlyMainContent: true }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as FirecrawlResponse;
    const md = data.data?.markdown;
    if (!md) return null;
    return {
      title: data.data?.metadata?.title || url,
      url: data.data?.metadata?.sourceURL || url,
      markdown: md.slice(0, 8000),
    };
  } catch {
    return null;
  }
}
