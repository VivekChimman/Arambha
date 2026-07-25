import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { validateAnswers } from "@/lib/intake";
import { createOrder, markPaid } from "@/lib/payments";
import { createCheckoutSession, dodoConfigured } from "@/lib/dodo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/checkout — start the ₹199 report unlock.
 *
 * Stores the intake answers as a pending order, then either creates a DODO
 * hosted checkout session or, when DODO is unconfigured, DEMO-completes the
 * order so the flow is fully testable without real payments. Returns a `url`
 * the client redirects to (DODO checkout, or straight to the report in demo).
 */
export async function POST(request: Request) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "We couldn’t read that request." }, { status: 400 });
    }

    const answers = validateAnswers(body);
    if (!answers) {
      return NextResponse.json({ error: "Please complete the intake first." }, { status: 400 });
    }

    const orderId = await createOrder(answers);
    const returnUrl = `${env.appUrl}/report/${orderId}`;

    if (!dodoConfigured()) {
      // Demo mode — no real payment. Mark paid and send straight to the report.
      await markPaid(orderId);
      return NextResponse.json({ url: returnUrl, orderId, demo: true });
    }

    const url = await createCheckoutSession({ orderId, returnUrl });
    return NextResponse.json({ url, orderId, demo: false });
  } catch (e) {
    console.error("[checkout] error:", e instanceof Error ? e.message : e);
    // Configured but the payment provider failed — never grant free access.
    return NextResponse.json(
      { error: "We couldn’t start checkout just now. Please try again." },
      { status: 502 },
    );
  }
}
