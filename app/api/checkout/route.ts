import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { createCheckoutSession, dodoConfigured } from "@/lib/dodo";
import { setSubscription } from "@/lib/subscription";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/checkout — start the ₹199/month subscription (must be signed in).
 *
 * Creates a DODO hosted subscription checkout for the current user; the webhook
 * activates the subscription on payment. When DODO is unconfigured, DEMO mode
 * activates the subscription immediately so the flow is testable without payments.
 */
export async function POST() {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
    }

    const returnUrl = `${env.appUrl}/dashboard?subscribed=1`;

    if (!dodoConfigured()) {
      // Demo mode — no real payment. Activate a subscription and return to dashboard.
      await setSubscription({
        userId: user.id,
        dodoSubscriptionId: `demo_${user.id}`,
        status: "active",
        resetUsage: true,
      });
      return NextResponse.json({ url: returnUrl, demo: true });
    }

    const url = await createCheckoutSession({ userId: user.id, email: user.email, returnUrl });
    return NextResponse.json({ url, demo: false });
  } catch (e) {
    console.error("[checkout] error:", e instanceof Error ? e.message : e);
    return NextResponse.json(
      { error: "We couldn’t start checkout just now. Please try again." },
      { status: 502 },
    );
  }
}
