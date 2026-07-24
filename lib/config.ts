/**
 * Model + retrieval config. Model ids live here, never hardcoded into logic.
 *
 * Model picker (per Vivek): ONE selected model does all the work — there is NO
 * model-to-model fallback. Selection comes from ARAMBHA_LLM_MODEL (a registry id
 * below); if unset, DEFAULT_MODEL_ID is used. The picker UI shows `label` only —
 * ids never surface to the user.
 *
 * `pro: true` = shown as "PRO · SOON" and NOT selectable yet.
 * Ids verified 2026-07-23 against each provider's docs.
 */
import type { ProviderName } from "@/lib/llm/types";

export interface ModelChoice {
  id: string; // stable registry id (what ARAMBHA_LLM_MODEL is set to)
  provider: ProviderName;
  model: string; // the provider's model id (sent to the API)
  label: string; // shown in the picker UI
  pro?: boolean; // "PRO · SOON" — displayed but not selectable
}

export const MODELS: ModelChoice[] = [
  { id: "gpt-5-5", provider: "openai", model: "gpt-5.5", label: "GPT-5.5", pro: true },
  { id: "gpt-5-4", provider: "openai", model: "gpt-5.4", label: "GPT-5.4", pro: true },
  { id: "gpt-5-4-mini", provider: "openai", model: "gpt-5.4-mini", label: "GPT-5.4 Mini", pro: true },
  { id: "gemini-3-5-flash", provider: "gemini", model: "gemini-3.5-flash", label: "Gemini 3.5 Flash" },
  { id: "gemini-2-5-flash", provider: "gemini", model: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { id: "claude-opus-4-8", provider: "anthropic", model: "claude-opus-4-8", label: "Claude Opus 4.8", pro: true },
  { id: "mistral-large-3", provider: "mistral", model: "mistral-large-2512", label: "Mistral Large 3" },
  { id: "mixtral-8x22b", provider: "mistral", model: "open-mixtral-8x22b", label: "Mixtral 8×22B" },
  { id: "ministral-8b", provider: "mistral", model: "ministral-8b-2512", label: "Ministral 8B" },
  { id: "ministral-14b", provider: "mistral", model: "ministral-14b-2512", label: "Ministral 14B" },
  { id: "sarvam-105b", provider: "sarvam", model: "sarvam-105b", label: "Sarvam 105B", pro: true },
  { id: "sarvam-30b", provider: "sarvam", model: "sarvam-30b", label: "Sarvam 30B" },
  { id: "llama-3-3-70b", provider: "groq", model: "llama-3.3-70b-versatile", label: "Llama 3.3 70B" },
];

/** Used when nothing is selected. Must be a non-pro entry. */
export const DEFAULT_MODEL_ID = "gemini-3-5-flash";

export const LLM = {
  timeoutMs: 60_000, // deep-research synthesis can be long
  maxTokens: 8000, // headroom: Gemini "thinking" models spend part of this on reasoning
  temperature: 0.4,
} as const;

/**
 * Retrieval (deep research) settings. Deep research is reserved for the PAID
 * report, so per-run cost lands on paying users only.
 */
export const RESEARCH = {
  maxQueries: 5, // search queries built from one intake
  resultsPerQuery: 5, // results kept per query
  extractTopN: 6, // pages Firecrawl deep-extracts (optional enrichment)
  searchTimeoutMs: 20_000,
} as const;
