import { createAdminClient } from "@/lib/supabase/admin";
import { cancelSubscription, dodoConfigured } from "@/lib/dodo";

/**
 * Account-level data rights (DPDP): export what we hold, and delete all of it.
 *
 * Deletion removes the auth user; every table (`profiles`, `subscriptions`,
 * `reports`, `chat_messages`) is `on delete cascade` from `auth.users`, so the
 * database clears them in one operation — there is no manual ordering to get
 * wrong and no orphan rows left behind.
 */

export interface ExportedAccount {
  exportedAt: string;
  account: { id: string; email?: string };
  profile: unknown;
  subscription: unknown;
  reports: unknown[];
  chatMessages: unknown[];
}

/** Everything we hold for this user, as plain JSON. */
export async function exportUserData(
  userId: string,
  email?: string,
): Promise<ExportedAccount> {
  const admin = createAdminClient();

  const [profile, subscription, reports, chat] = await Promise.all([
    admin.from("profiles").select("*").eq("id", userId).maybeSingle(),
    admin.from("subscriptions").select("*").eq("user_id", userId).maybeSingle(),
    admin.from("reports").select("*").eq("user_id", userId).order("created_at"),
    admin.from("chat_messages").select("*").eq("user_id", userId).order("created_at"),
  ]);

  return {
    exportedAt: new Date().toISOString(),
    account: { id: userId, email },
    profile: profile.data ?? null,
    subscription: subscription.data ?? null,
    reports: reports.data ?? [],
    chatMessages: chat.data ?? [],
  };
}

export type DeleteOutcome =
  | { ok: true; cancelledSubscription: boolean }
  | { ok: false; reason: "billing" };

/**
 * Delete the account and everything in it.
 *
 * An active subscription is cancelled at DODO **first**, immediately. If that
 * call fails we abort rather than delete: leaving a live subscription against a
 * deleted account would keep charging someone who has no way left to stop it.
 * Demo-mode subscriptions have no DODO counterpart, so they're skipped.
 */
export async function deleteAccount(userId: string): Promise<DeleteOutcome> {
  const admin = createAdminClient();

  const { data: sub } = await admin
    .from("subscriptions")
    .select("status, dodo_subscription_id")
    .eq("user_id", userId)
    .maybeSingle();

  const dodoId = typeof sub?.dodo_subscription_id === "string" ? sub.dodo_subscription_id : "";
  const needsCancel =
    sub?.status === "active" && dodoConfigured() && dodoId !== "" && !dodoId.startsWith("demo_");

  let cancelledSubscription = false;
  if (needsCancel) {
    try {
      await cancelSubscription(dodoId, { immediate: true });
      cancelledSubscription = true;
    } catch (e) {
      console.error("[account] cancel before delete failed:", e instanceof Error ? e.message : e);
      return { ok: false, reason: "billing" };
    }
  }

  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) throw new Error(`delete user: ${error.message}`);

  return { ok: true, cancelledSubscription };
}
