import { NextResponse } from "next/server";
import { composeRoadmap } from "@/lib/composeRoadmap";
import { cacheReport, getCachedReport, getOrder } from "@/lib/payments";
import { generateResearchedRoadmap } from "@/lib/roadmap/generate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Deep research runs here (paid) — allow the long function duration.
export const maxDuration = 60;

/**
 * POST /api/report — the PAID deep-research report. SERVER-SIDE GATED.
 *
 * Runs the costly deep research ONLY when the order is paid. Caches the result so
 * re-visits don't re-run (and re-cost) research. If research fails, the buyer
 * still gets the deterministic roadmap rather than nothing.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as { orderId?: unknown };
    const orderId = typeof body.orderId === "string" ? body.orderId : "";
    if (!orderId) {
      return NextResponse.json({ error: "Missing order." }, { status: 400 });
    }

    const order = await getOrder(orderId);
    if (!order) {
      return NextResponse.json({ status: "not_found" }, { status: 404 });
    }
    if (!order.paid) {
      // Payment not confirmed yet (webhook may still be in flight).
      return NextResponse.json({ status: "pending" }, { status: 402 });
    }

    // Serve the cached report if we've already generated it.
    const cached = await getCachedReport(orderId);
    if (cached) return NextResponse.json({ status: "ready", roadmap: cached });

    // Gated deep research. On failure the buyer still gets a grounded roadmap.
    const researched = await generateResearchedRoadmap(order.answers).catch(() => null);
    const roadmap = researched ?? composeRoadmap(order.answers);
    await cacheReport(orderId, roadmap);

    return NextResponse.json({ status: "ready", roadmap });
  } catch {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
