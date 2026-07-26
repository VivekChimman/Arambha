import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Subscription + report quota. A user may generate a researched report if they
 * have an active subscription with quota left (10/mo), OR they still have their
 * 1 free report. Writes go through the admin client (service role).
 */
export interface QuotaStatus {
  allowed: boolean;
  viaFree: boolean; // consuming the free report vs the subscription quota
  remaining: number;
  active: boolean; // has an active subscription
  quotaLimit: number;
}

export async function getQuota(userId: string): Promise<QuotaStatus> {
  const supabase = createClient();
  const [{ data: sub }, { data: profile }] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("status, quota_limit, reports_used")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase.from("profiles").select("free_reports_used").eq("id", userId).maybeSingle(),
  ]);

  const active = sub?.status === "active";
  if (active) {
    const quotaLimit = sub?.quota_limit ?? 10;
    const remaining = Math.max(0, quotaLimit - (sub?.reports_used ?? 0));
    return { allowed: remaining > 0, viaFree: false, remaining, active: true, quotaLimit };
  }

  const remaining = Math.max(0, 1 - (profile?.free_reports_used ?? 0));
  return { allowed: remaining > 0, viaFree: true, remaining, active: false, quotaLimit: 1 };
}

/** Increment the right counter after a report is generated. */
export async function consumeQuota(userId: string, viaFree: boolean): Promise<void> {
  const admin = createAdminClient();
  const now = new Date().toISOString();
  if (viaFree) {
    const { data } = await admin
      .from("profiles")
      .select("free_reports_used")
      .eq("id", userId)
      .maybeSingle();
    await admin
      .from("profiles")
      .update({ free_reports_used: (data?.free_reports_used ?? 0) + 1, updated_at: now })
      .eq("id", userId);
  } else {
    const { data } = await admin
      .from("subscriptions")
      .select("reports_used")
      .eq("user_id", userId)
      .maybeSingle();
    await admin
      .from("subscriptions")
      .update({ reports_used: (data?.reports_used ?? 0) + 1, updated_at: now })
      .eq("user_id", userId);
  }
}

/**
 * Upsert a user's subscription from a DODO webhook (one row per user). Called by
 * the webhook with the service-role client.
 */
export async function setSubscription(params: {
  userId: string;
  dodoSubscriptionId: string;
  dodoCustomerId?: string;
  status: string; // active | cancelled | past_due | inactive
  currentPeriodEnd?: string;
  resetUsage?: boolean; // true on activation/renewal
}): Promise<void> {
  const admin = createAdminClient();
  const row: Record<string, unknown> = {
    user_id: params.userId,
    dodo_subscription_id: params.dodoSubscriptionId,
    dodo_customer_id: params.dodoCustomerId ?? null,
    status: params.status,
    current_period_end: params.currentPeriodEnd ?? null,
    updated_at: new Date().toISOString(),
  };
  if (params.resetUsage) row.reports_used = 0;

  const { data: existing } = await admin
    .from("subscriptions")
    .select("id")
    .eq("user_id", params.userId)
    .order("created_at", { ascending: false })
    .limit(1);

  if (existing && existing.length > 0) {
    await admin.from("subscriptions").update(row).eq("id", existing[0].id);
  } else {
    await admin.from("subscriptions").insert(row);
  }
}
