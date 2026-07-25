import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { env } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/app/AppHeader";
import { LinkButton } from "@/components/ui/Button";

export const metadata: Metadata = { title: "History" };

export default async function HistoryPage() {
  if (!env.hasSupabase) redirect("/dashboard");

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: reports } = await supabase
    .from("reports")
    .select("id, title, mode, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <>
      <AppHeader email={user.email} />
      <main className="shell py-14 sm:py-20">
        <h1 className="text-display-md text-fg">Your reports</h1>

        {!reports || reports.length === 0 ? (
          <div className="card mt-8 p-10 text-center">
            <p className="text-fg-dim">No reports yet.</p>
            <div className="mt-6 flex justify-center">
              <LinkButton href="/start" size="lg">
                Build your first roadmap
              </LinkButton>
            </div>
          </div>
        ) : (
          <ul className="mt-8 divide-y divide-line border-y border-line">
            {reports.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/history/${r.id}`}
                  className="flex items-center justify-between gap-4 py-5 transition-colors hover:text-accent"
                >
                  <div>
                    <p className="font-display text-lg text-fg">{r.title || "Roadmap"}</p>
                    <p className="mt-0.5 font-mono text-xs uppercase tracking-wider text-fg-mute">
                      {r.mode} · {new Date(r.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span aria-hidden className="text-fg-mute">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
