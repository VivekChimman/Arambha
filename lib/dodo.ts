import DodoPayments from "dodopayments";
import { Webhook } from "standardwebhooks";
import { env, serverEnv } from "@/lib/env";

/**
 * DODO Payments — hosted Checkout Session for the one-time ₹199 report unlock.
 * When unconfigured (no API key / product id) the caller runs in DEMO mode and
 * never touches DODO. Server-only.
 */
export function dodoConfigured(): boolean {
  return env.hasDodo;
}

function client(): DodoPayments {
  // Set the base URL explicitly. The SDK otherwise defaults to the LIVE URL (and
  // would ignore `environment`), so test_mode requests wrongly hit live. Passing
  // baseURL alone (not `environment` too) avoids the SDK's "ambiguous URL" error.
  const baseURL =
    serverEnv.dodoEnvironment === "live_mode"
      ? "https://live.dodopayments.com"
      : "https://test.dodopayments.com";
  return new DodoPayments({ bearerToken: serverEnv.dodoApiKey, baseURL });
}

/** Create a hosted checkout session for an order; returns the checkout URL. */
export async function createCheckoutSession(opts: {
  orderId: string;
  returnUrl: string;
}): Promise<string> {
  const session = await client().checkoutSessions.create({
    // Field names per DODO docs; the SDK's exact param types aren't pinned here.
    product_cart: [{ product_id: serverEnv.dodoProductId, quantity: 1 }],
    return_url: opts.returnUrl,
    metadata: { orderId: opts.orderId },
  } as never);
  const url = (session as { checkout_url?: string }).checkout_url;
  if (!url) throw new Error("dodo: no checkout_url in session");
  return url;
}

/** Verify a webhook (standardwebhooks). Returns the parsed payload or null. */
export function verifyWebhook(
  rawBody: string,
  headers: { "webhook-id": string; "webhook-signature": string; "webhook-timestamp": string },
): Record<string, unknown> | null {
  try {
    const wh = new Webhook(serverEnv.dodoWebhookSecret);
    return wh.verify(rawBody, headers) as Record<string, unknown>;
  } catch {
    return null;
  }
}
