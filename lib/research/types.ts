/** A retrieved, citable source. `url` is the grounding key — the LLM may only
 *  cite urls that appear in the Source[] handed to it. */
export interface Source {
  title: string;
  url: string;
  content: string; // snippet (Tavily) or full extracted text (Firecrawl)
  extracted: boolean; // true if Firecrawl fetched the full page
  score?: number; // Tavily relevance score, when available
}
