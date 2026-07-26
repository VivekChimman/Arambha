import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cancelSubscription, dodoConfigured } from "@/lib/dodo";
import { rateLimit, clientKey } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/subscription/cancel — stop the next renewal, keep the account.
 *
 * Cancels at the next billing date rather than immediately: the user keeps the
 * access they already paid for. DODO's webhook flips our row to `cancelled`;
 * demo-mode subscriptions (no DODO counterpart) are updated directly.
 */
export async function POST(request: Request) {
  try {
    if (!env.hasSupabase) {
      return NextResponse.json(
        { error: "Accounts are temporarily unavailable. Please try again shortly." },
        { status: 503 },
      );
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
    }

    const limited = await rateLimit("account", clientKey(request, user.id));
    if (!limited.allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again in a little while." },
        { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } },
      );
    }

    const { data: sub } = await supabase
      .from("subscriptions")
      .select("status, dodo_subscription_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (sub?.status !== "active") {
      return NextResponse.json({ error: "You don’t have an active membership." }, { status: 400 });
    }

    const dodoId = typeof sub.dodo_subscription_id === "string" ? sub.dodo_subscription_id : "";
    const isDemo = dodoId === "" || dodoId.startsWith("demo_");

    if (!isDemo && dodoConfigured()) {
      await cancelSubscription(dodoId, { immediate: false });
      // The webhook writes the final state; we don't pre-empt it.
      return NextResponse.json({ cancelled: true, accessUntilPeriodEnd: true });
    }

    // Demo mode — no DODO subscription exists, so update our own record.
    const admin = createAdminClient();
    await admin
      .from("subscriptions")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("user_id", user.id);

    return NextResponse.json({ cancelled: true, accessUntilPeriodEnd: false, demo: true });
  } catch (e) {
    console.error("[subscription/cancel] error:", e instanceof Error ? e.message : e);
    return NextResponse.json(
      { error: "We couldn’t cancel just now. Please try again, or email us." },
      { status: 502 },
    );
  }
}
