import { NextResponse } from "next/server";
import { markPaid } from "@/lib/payments";
import { verifyWebhook } from "@/lib/dodo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/webhooks/dodo — DODO payment webhook.
 *
 * Verifies the signature (standardwebhooks), and on a successful payment marks
 * the order paid using the orderId we put in checkout metadata. Always answers
 * fast; never leaks internals.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const headers = {
    "webhook-id": request.headers.get("webhook-id") ?? "",
    "webhook-signature": request.headers.get("webhook-signature") ?? "",
    "webhook-timestamp": request.headers.get("webhook-timestamp") ?? "",
  };

  const payload = verifyWebhook(rawBody, headers);
  if (!payload) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  try {
    // Defensive extraction — DODO event shapes vary; look for a success signal
    // and the orderId we set in metadata.
    const type = String(payload.type ?? payload.event_type ?? "");
    const data = (payload.data ?? payload) as Record<string, unknown>;
    const status = String((data.status as string) ?? "");
    const metadata = (data.metadata ?? {}) as Record<string, unknown>;
    const orderId = typeof metadata.orderId === "string" ? metadata.orderId : "";

    const succeeded =
      /succeeded|completed|paid/i.test(type) || /succeeded|completed|paid/i.test(status);

    if (succeeded && orderId) {
      await markPaid(orderId);
    }
    return NextResponse.json({ received: true });
  } catch {
    // Signature was valid; swallow processing errors so DODO doesn't hammer retries.
    return NextResponse.json({ received: true });
  }
}
