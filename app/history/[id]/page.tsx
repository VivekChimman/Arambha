import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { env } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { Roadmap } from "@/lib/composeRoadmap";
import { AppHeader } from "@/components/app/AppHeader";
import { RoadmapView } from "@/components/intake/RoadmapView";
import { ReportChat } from "@/components/chat/ReportChat";

export const metadata: Metadata = { title: "Your report" };
export const dynamic = "force-dynamic";

/** A saved report. RLS already scopes reads to the owner; we also filter by user. */
export default async function ReportPage({ params }: { params: { id: string } }) {
  if (!env.hasSupabase) redirect("/dashboard");

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/history/${params.id}`)}`);

  const { data: report } = await supabase
    .from("reports")
    .select("id, title, roadmap, created_at")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!report) notFound();

  const roadmap = report.roadmap as Roadmap;

  // Prior follow-ups for this report, oldest first.
  const { data: chat } = await supabase
    .from("chat_messages")
    .select("role, content")
    .eq("report_id", report.id)
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(50);

  return (
    <>
      <AppHeader email={user.email} />
      <main className="relative shell py-14 sm:py-20">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-radial-glow" />
        <div className="relative">
          <p className="font-mono text-xs uppercase tracking-wider text-fg-mute">
            {report.title || "Roadmap"} · {new Date(report.created_at).toLocaleDateString()}
          </p>
          <div className="mt-6">
            <RoadmapView roadmap={roadmap} showUpsell={false} />
          </div>

          <div className="mx-auto w-full max-w-3xl">
            <ReportChat
              reportId={report.id}
              initial={(chat ?? []).map((m) => ({
                role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
                content: m.content,
              }))}
            />
          </div>
        </div>
      </main>
    </>
  );
}
