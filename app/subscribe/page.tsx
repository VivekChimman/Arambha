import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { env } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/app/AppHeader";
import { SubscribeButton } from "@/components/app/SubscribeButton";

export const metadata: Metadata = { title: "Subscribe" };

export default async function SubscribePage() {
  if (!env.hasSupabase) redirect("/dashboard");
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <>
      <AppHeader email={user.email} />
      <main className="shell py-14 sm:py-20">
        <div className="mx-auto max-w-md">
          <h1 className="text-display-md text-fg">Arambha membership</h1>
          <div className="ring-accent relative mt-8 overflow-hidden rounded-card border border-line bg-surface p-8">
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-radial-glow" />
            <div className="relative">
              <p className="font-display text-4xl">
                <span className="accent-text">₹199</span>
                <span className="text-lg text-fg-mute"> / month</span>
              </p>
              <ul className="mt-6 space-y-3 text-sm text-fg-dim">
                {[
                  "10 researched reports every month",
                  "Follow-up questions on any report",
                  "Edit your details and re-research",
                  "Full history, saved and searchable",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <svg width="15" height="15" viewBox="0 0 14 14" aria-hidden className="mt-0.5 shrink-0 text-accent">
                      <path d="M2 7.5L5.5 11L12 3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <SubscribeButton className="w-full" />
              </div>
              <p className="mt-3 text-center text-xs text-fg-mute">
                One-tap cancel anytime. Billed monthly by DODO (global cards + UPI).
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
