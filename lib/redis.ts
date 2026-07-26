import { env, serverEnv } from "@/lib/env";

/**
 * Minimal Upstash Redis REST client (raw fetch, no SDK — per the stack).
 * Commands are sent as a JSON array to the REST base URL, which safely handles
 * arbitrary string values (we store JSON). Server-only.
 */
export function redisAvailable(): boolean {
  return env.hasRedis;
}

async function command<T = unknown>(cmd: (string | number)[]): Promise<T> {
  const res = await fetch(serverEnv.redisUrl, {
    method: "POST",
    headers: {
      authorization: `Bearer ${serverEnv.redisToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(cmd),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`redis: ${res.status}`);
  const data = (await res.json()) as { result: T };
  return data.result;
}

export async function redisSet(key: string, value: string, ttlSeconds: number): Promise<void> {
  await command(["SET", key, value, "EX", ttlSeconds]);
}

export async function redisGet(key: string): Promise<string | null> {
  return command<string | null>(["GET", key]);
}

export async function redisDel(key: string): Promise<void> {
  await command(["DEL", key]);
}

/**
 * Fixed-window counter: INCR, and set the TTL on the first hit of the window.
 * Not atomic across the two commands — a crash between them would leave a key
 * without a TTL, so the caller keeps windows short and fails open.
 */
export async function redisIncrInWindow(key: string, windowSeconds: number): Promise<number> {
  const count = await command<number>(["INCR", key]);
  if (count === 1) await command(["EXPIRE", key, windowSeconds]);
  return count;
}

/** SET if-not-exists with a TTL. Returns true when the caller took the lock. */
export async function redisSetNx(key: string, ttlSeconds: number): Promise<boolean> {
  const res = await command<string | null>(["SET", key, "1", "NX", "EX", ttlSeconds]);
  return res === "OK";
}
