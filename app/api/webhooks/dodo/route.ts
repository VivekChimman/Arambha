import { NextResponse } from "next/server";
import { verifyWebhook } from "@/lib/dodo";
import { setSubscription } from "@/lib/subscription";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/webhooks/dodo — DODO subscription webhook.
 *
 * Verifies the signature (standardwebhooks) and maps subscription lifecycle
 * events onto the user's row (linked via the userId we set in checkout metadata):
 *   active / renewed  → status active (renewal resets the monthly quota)
 *   cancelled / expired / failed → status cancelled
 * Answers fast; never leaks internals.
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
    const type = String(payload.type ?? payload.event_type ?? "");
    const data = (payload.data ?? payload) as Record<string, unknown>;
    const metadata = (data.metadata ?? {}) as Record<string, unknown>;
    const userId = typeof metadata.userId === "string" ? metadata.userId : "";

    const subId =
      (typeof data.subscription_id === "string" && data.subscription_id) ||
      (typeof data.id === "string" && data.id) ||
      "";
    const customerId =
      typeof (data.customer as { customer_id?: string })?.customer_id === "string"
        ? (data.customer as { customer_id?: string }).customer_id
        : undefined;
    const periodEnd =
      (typeof data.next_billing_date === "string" && data.next_billing_date) ||
      (typeof data.current_period_end === "string" && data.current_period_end) ||
      undefined;

    // Only act on subscription events that carry our userId.
    if (userId && /subscription/i.test(type)) {
      const activated = /active|renew|created|paid|success/i.test(type);
      const ended = /cancel|expire|fail|paused|revoked/i.test(type);

      if (activated) {
        await setSubscription({
          userId,
          dodoSubscriptionId: subId || `dodo_${userId}`,
          dodoCustomerId: customerId,
          status: "active",
          currentPeriodEnd: periodEnd,
          resetUsage: true, // activation + renewal both reset the monthly quota
        });
      } else if (ended) {
        await setSubscription({
          userId,
          dodoSubscriptionId: subId || `dodo_${userId}`,
          dodoCustomerId: customerId,
          status: "cancelled",
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch {
    // Signature valid; swallow processing errors so DODO doesn't hammer retries.
    return NextResponse.json({ received: true });
  }
}
