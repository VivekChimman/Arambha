import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { env } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/app/AppHeader";
import { SubscribeButton } from "@/components/app/SubscribeButton";
import { AccountControls } from "@/components/app/AccountControls";
import { LinkButton } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  if (!env.hasSupabase) {
    return (
      <main className="grid min-h-screen place-items-center px-6 text-center">
        <p className="max-w-md text-fg-dim">
          Accounts aren’t configured yet — add the Supabase env vars and run the schema.
        </p>
      </main>
    );
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("status, quota_limit, reports_used, current_period_end")
    .eq("user_id", user.id)
    .maybeSingle();
  const { data: profile } = await supabase
    .from("profiles")
    .select("free_reports_used")
    .eq("id", user.id)
    .maybeSingle();

  const active = sub?.status === "active";
  const freeUsed = profile?.free_reports_used ?? 0;
  const remaining = active
    ? Math.max(0, (sub?.quota_limit ?? 10) - (sub?.reports_used ?? 0))
    : Math.max(0, 1 - freeUsed);

  return (
    <>
      <AppHeader email={user.email} />
      <main className="shell py-14 sm:py-20">
        <p className="eyebrow">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          {active ? "Subscribed" : freeUsed < 1 ? "Free report available" : "Free report used"}
        </p>
        <h1 className="mt-5 text-display-md text-fg">Your dashboard</h1>
        <p className="mt-3 text-sm text-fg-dim">
          {active
            ? `${remaining} of ${sub?.quota_limit ?? 10} reports left this month.`
            : remaining > 0
              ? "You have 1 free researched report — try it, then subscribe for more."
              : "You’ve used your free report. Subscribe for 10 researched reports a month."}
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          <div className="card flex flex-col p-7">
            <h2 className="font-display text-xl text-fg">Build a roadmap</h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-fg-mute">
              Answer a few questions and get a researched 90-day roadmap.
            </p>
            <div className="mt-5">
              <LinkButton href="/start" size="lg">
                New roadmap
              </LinkButton>
            </div>
          </div>

          <div className="card flex flex-col p-7">
            <h2 className="font-display text-xl text-fg">Your history</h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-fg-mute">
              Revisit past reports, or branch a fresh one from an old answer set.
            </p>
            <div className="mt-5">
              <LinkButton href="/history" variant="outline" size="lg">
                View history
              </LinkButton>
            </div>
          </div>
        </div>

        {!active && (
          <div className="ring-accent relative mt-6 overflow-hidden rounded-card border border-line bg-surface p-7">
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-radial-glow" />
            <div className="relative flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="font-display text-xl text-fg">Arambha membership</h2>
                <p className="mt-1 text-sm text-fg-dim">
                  <span className="accent-text font-medium">₹199/month</span> · 10 researched
                  reports, follow-ups, and full history.
                </p>
              </div>
              <SubscribeButton className="shrink-0" />
            </div>
          </div>
        )}

        <AccountControls email={user.email ?? ""} active={active} />
      </main>
    </>
  );
}
