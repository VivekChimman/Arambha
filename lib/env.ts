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

// Normalise a base URL to its origin — tolerates a pasted `/rest/v1/` or trailing
// slash (a common Supabase copy-paste mistake) that would break client paths.
const originOf = (v: string | undefined): string => {
  if (!v) return "";
  try {
    return new URL(v).origin;
  } catch {
    return v.replace(/\/+$/, "");
  }
};

// Canonical origin. NEXT_PUBLIC_APP_URL wins; otherwise fall back to the URL
// Vercel injects, so a forgotten env var can never silently become localhost in
// production again — that bug shipped a localhost og:url AND a localhost DODO
// return URL. Both reads (layout metadata, checkout) are server-side, where the
// non-public VERCEL_* vars are available.
const vercelOrigin = (): string => {
  const host =
    process.env.VERCEL_PROJECT_PRODUCTION_URL || // stable production domain
    process.env.VERCEL_URL; // per-deployment (previews)
  return host ? `https://${host}` : "";
};

export const env = {
  appUrl: str(process.env.NEXT_PUBLIC_APP_URL, vercelOrigin() || "http://localhost:3000"),

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
  // Supabase URL + anon key are safe to expose (anon is RLS-protected).
  supabaseUrl: originOf(process.env.NEXT_PUBLIC_SUPABASE_URL),
  supabaseAnonKey: str(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  hasSupabase: Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  ),
  // DODO is "configured" only with an API key AND a product id. Absent → demo mode.
  hasDodo: Boolean(process.env.DODO_PAYMENTS_API_KEY && process.env.DODO_PRO_PRODUCT_ID),
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

  supabaseServiceKey: str(process.env.SUPABASE_SERVICE_ROLE_KEY),

  redisUrl: str(process.env.UPSTASH_REDIS_REST_URL),
  redisToken: str(process.env.UPSTASH_REDIS_REST_TOKEN),
  ipHashSalt: str(process.env.IP_HASH_SALT),

  dodoApiKey: str(process.env.DODO_PAYMENTS_API_KEY),
  // Respect the env; DODO SDK only accepts these two literals.
  dodoEnvironment: process.env.DODO_PAYMENTS_ENVIRONMENT === "live_mode" ? "live_mode" : "test_mode",
  dodoWebhookSecret: str(process.env.DODO_PAYMENTS_WEBHOOK_SECRET),
  dodoProductId: str(process.env.DODO_PRO_PRODUCT_ID),
  dodoReturnUrl: str(process.env.DODO_PAYMENTS_RETURN_URL),
} as const;
