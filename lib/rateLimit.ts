import { createHash } from "crypto";
import { serverEnv } from "@/lib/env";
import { redisAvailable, redisIncrInWindow, redisSetNx, redisDel } from "@/lib/redis";

/**
 * Rate limiting for the endpoints that cost us money.
 *
 * FAILS OPEN by design (product rule #2): if Redis is unset, down, or slow, the
 * user is let through. A limiter that breaks the app is worse than no limiter.
 *
 * Raw IPs are never stored — they're salted with IP_HASH_SALT and hashed, so
 * Redis only ever sees an opaque key.
 */

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

const ALLOW: RateLimitResult = { allowed: true, retryAfterSeconds: 0 };

/** Limits per endpoint. Windows are short so a stuck key self-heals quickly. */
export const LIMITS = {
  // The researched report: costs a search + extract + LLM call on every run.
  report: { limit: 5, windowSeconds: 60 * 60 },
  // The free deterministic teaser: cheap, but public and unauthenticated.
  roadmap: { limit: 20, windowSeconds: 60 * 60 },
  // Checkout: no LLM cost, but no reason for a burst either.
  checkout: { limit: 10, windowSeconds: 60 * 60 },
  // Follow-up chat: one LLM call per turn, no research — generous but capped.
  chat: { limit: 40, windowSeconds: 60 * 60 },
  // Account actions (export / cancel / delete) — no legitimate reason to repeat.
  account: { limit: 10, windowSeconds: 60 * 60 },
} as const;

/** Salted + hashed client identifier. Never returns anything reversible to an IP. */
export function clientKey(request: Request, userId?: string): string {
  if (userId) return `u:${userId}`;
  const forwarded = request.headers.get("x-forwarded-for") ?? "";
  const ip = forwarded.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  const hash = createHash("sha256")
    .update(`${serverEnv.ipHashSalt}:${ip}`)
    .digest("hex")
    .slice(0, 32);
  return `ip:${hash}`;
}

/**
 * Fixed-window limit. `bucket` names the endpoint, `key` the caller.
 * Any failure returns allowed — see the fail-open note above.
 */
export async function rateLimit(
  bucket: keyof typeof LIMITS,
  key: string,
): Promise<RateLimitResult> {
  if (!redisAvailable()) return ALLOW;
  const { limit, windowSeconds } = LIMITS[bucket];
  try {
    const count = await redisIncrInWindow(`arambha:rl:${bucket}:${key}`, windowSeconds);
    if (count > limit) return { allowed: false, retryAfterSeconds: windowSeconds };
    return ALLOW;
  } catch {
    return ALLOW; // Redis down → let them through.
  }
}

/**
 * Single-flight lock for report generation. Two parallel submissions could both
 * pass the quota pre-check and each spend a credit; this lets only the first
 * through. Fails open (no Redis → no lock), and the TTL matches the route's
 * maxDuration so a crashed request can't lock a user out.
 */
export async function acquireReportLock(userId: string): Promise<boolean> {
  if (!redisAvailable()) return true;
  try {
    return await redisSetNx(`arambha:lock:report:${userId}`, 70);
  } catch {
    return true;
  }
}

export async function releaseReportLock(userId: string): Promise<void> {
  if (!redisAvailable()) return;
  try {
    await redisDel(`arambha:lock:report:${userId}`);
  } catch {
    // Nothing to do — the TTL clears it.
  }
}
