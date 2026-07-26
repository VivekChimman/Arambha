/**
 * Turns any auth failure into copy that is safe to show a user.
 *
 * Product rule #2: no raw provider/library error ever reaches the client. A
 * library message like "@supabase/ssr: Your project's URL and API key are
 * required…" is a config bug — the user must never see it.
 *
 * Known Supabase auth codes get our own wording. An unrecognised auth-API
 * message is passed through only if it still reads like a plain user-facing
 * sentence. Anything else degrades to a generic line.
 */

export const AUTH_GENERIC = "Something went wrong on our side. Please try again in a moment.";
export const AUTH_OFFLINE = "We couldn’t reach the sign-in service. Check your connection and try again.";
export const AUTH_UNAVAILABLE = "Accounts are temporarily unavailable. Please try again shortly.";

const BY_CODE: Record<string, string> = {
  invalid_credentials: "That email or password isn’t right.",
  email_not_confirmed: "Please confirm your email first — check your inbox for the link.",
  user_already_exists: "An account with that email already exists. Sign in instead.",
  email_exists: "An account with that email already exists. Sign in instead.",
  user_banned: "This account can’t be used right now. Please contact support.",
  weak_password: "Please choose a stronger password — at least 8 characters.",
  validation_failed: "Please check the email and password you entered.",
  over_request_rate_limit: "Too many attempts. Please wait a minute and try again.",
  over_email_send_rate_limit: "Too many emails sent. Please wait a few minutes and try again.",
  signup_disabled: "New sign-ups are paused right now. Please try again later.",
  provider_disabled: "That sign-in method isn’t available right now.",
};

/** A message is only passed through if it still looks like plain user-facing copy. */
function looksUserFacing(message: string): boolean {
  if (!message || message.length > 140) return false;
  return !/@supabase|https?:\/\/|process\.env|[{}<>]|api[ _-]?key/i.test(message);
}

type MaybeAuthError = {
  name?: string;
  code?: string;
  status?: number;
  message?: string;
};

export function friendlyAuthError(err: unknown): string {
  // Always keep the real error for us — console only, never rendered.
  console.error("[auth]", err);

  const e = (err ?? {}) as MaybeAuthError;

  // Our own "Supabase isn't configured" sentinel, and the library's own version of it.
  if (e.name === "SupabaseNotConfiguredError") return AUTH_UNAVAILABLE;

  // Network / fetch failures (AuthRetryableFetchError, TypeError: Failed to fetch).
  if (e.name === "AuthRetryableFetchError" || e.name === "TypeError") return AUTH_OFFLINE;

  if (e.code && BY_CODE[e.code]) return BY_CODE[e.code];

  // Unknown but genuinely from the auth API (has an HTTP status) — safe-ish, filtered.
  const isAuthApi = e.name === "AuthApiError" || e.name === "AuthWeakPasswordError";
  if (isAuthApi && typeof e.message === "string" && looksUserFacing(e.message)) {
    return e.message;
  }

  return AUTH_GENERIC;
}
