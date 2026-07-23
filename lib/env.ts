/**
 * The ONLY module that reads process.env (see CLAUDE.md). Everything in app/ and
 * lib/ imports from here. Secret values are never logged.
 *
 * `env`        — safe anywhere (URLs + presence booleans only).
 * `serverEnv`  — raw secret values. SERVER-ONLY: never import from a client
 *                component, or the keys would land in the browser bundle.
 */
const str = (v: string | undefined, fallback = ""): string =>
  v && v.length > 0 ? v : fallback;

export const env = {
  appUrl: str(process.env.NEXT_PUBLIC_APP_URL, "http://localhost:3000"),

  // Selected model (a registry id from lib/config.ts). Empty → DEFAULT_MODEL_ID.
  selectedModelId: str(process.env.ARAMBHA_LLM_MODEL),

  // Presence flags — safe to expose; used to decide the degraded path.
  hasAnthropic: Boolean(process.env.ANTHROPIC_API_KEY),
  hasOpenai: Boolean(process.env.OPENAI_API_KEY),
  hasGemini: Boolean(process.env.GEMINI_API_KEY),
  hasGroq: Boolean(process.env.GROQ_API_KEY),
  hasMistral: Boolean(process.env.MISTRAL_API_KEY),
  hasSarvam: Boolean(process.env.SARVAM_API_KEY),
  hasTavily: Boolean(process.env.TAVILY_API_KEY),
  hasFirecrawl: Boolean(process.env.FIRECRAWL_API_KEY),
  hasSearxng: Boolean(process.env.SEARXNG_URL),
  hasSerper: Boolean(process.env.SERPER_API_KEY),
  // Free self-hosted search fallback base URL (not a secret).
  searxngUrl: str(process.env.SEARXNG_URL),
  hasRedis: Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
  ),
  hasSupabase: Boolean(
    process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  ),
} as const;

/** SERVER-ONLY raw secrets. Do not import from client components. */
export const serverEnv = {
  arambhaModel: str(process.env.ARAMBHA_MODEL),

  anthropicKey: str(process.env.ANTHROPIC_API_KEY),
  openaiKey: str(process.env.OPENAI_API_KEY),
  geminiKey: str(process.env.GEMINI_API_KEY),
  groqKey: str(process.env.GROQ_API_KEY),
  mistralKey: str(process.env.MISTRAL_API_KEY),
  sarvamKey: str(process.env.SARVAM_API_KEY),

  tavilyKey: str(process.env.TAVILY_API_KEY),
  firecrawlKey: str(process.env.FIRECRAWL_API_KEY),
  serperKey: str(process.env.SERPER_API_KEY),

  supabaseUrl: str(process.env.SUPABASE_URL),
  supabaseAnonKey: str(process.env.SUPABASE_ANON_KEY),
  supabaseServiceKey: str(process.env.SUPABASE_SERVICE_ROLE_KEY),

  redisUrl: str(process.env.UPSTASH_REDIS_REST_URL),
  redisToken: str(process.env.UPSTASH_REDIS_REST_TOKEN),
  ipHashSalt: str(process.env.IP_HASH_SALT),
} as const;
