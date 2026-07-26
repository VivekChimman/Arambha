import { randomUUID } from "crypto";
import type { IntakeAnswers } from "@/lib/intake";
import type { Roadmap } from "@/lib/composeRoadmap";
import { redisAvailable, redisGet, redisSet } from "@/lib/redis";

/**
 * Order store for the ₹199 report unlock. Redis-backed when configured; falls
 * back to an in-memory map so the flow is testable locally without Redis.
 *
 * NOTE: the in-memory fallback does NOT survive across serverless invocations —
 * production MUST have Upstash Redis, or paid state won't persist between the
 * checkout redirect and the webhook. `redisAvailable()` gates that.
 */
export interface Order {
  answers: IntakeAnswers;
  paid: boolean;
  createdAt: number;
}

const TTL = 60 * 60 * 24; // 24h — matches DODO checkout session validity
const mem = new Map<string, string>(); // fallback store (dev/demo only)

async function put(key: string, value: string): Promise<void> {
  if (redisAvailable()) await redisSet(key, value, TTL);
  else mem.set(key, value);
}
async function read(key: string): Promise<string | null> {
  if (redisAvailable()) return redisGet(key);
  return mem.get(key) ?? null;
}

// Namespaced so this project can share one Upstash database with another
// project without any chance of a key collision.
const orderKey = (id: string) => `arambha:order:${id}`;
const reportKey = (id: string) => `arambha:report:${id}`;

/** Create a pending order holding the intake answers; returns its id. */
export async function createOrder(answers: IntakeAnswers): Promise<string> {
  const id = randomUUID();
  const order: Order = { answers, paid: false, createdAt: Date.now() };
  await put(orderKey(id), JSON.stringify(order));
  return id;
}

export async function getOrder(id: string): Promise<Order | null> {
  const raw = await read(orderKey(id));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Order;
  } catch {
    return null;
  }
}

export async function markPaid(id: string): Promise<void> {
  const order = await getOrder(id);
  if (!order) return;
  order.paid = true;
  await put(orderKey(id), JSON.stringify(order));
}

/** Cache the generated report so re-visits don't re-run (and re-pay for) research. */
export async function getCachedReport(id: string): Promise<Roadmap | null> {
  const raw = await read(reportKey(id));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Roadmap;
  } catch {
    return null;
  }
}

export async function cacheReport(id: string, roadmap: Roadmap): Promise<void> {
  await put(reportKey(id), JSON.stringify(roadmap));
}
