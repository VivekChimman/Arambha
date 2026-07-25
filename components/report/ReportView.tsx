"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Roadmap } from "@/lib/composeRoadmap";
import { RoadmapView } from "@/components/intake/RoadmapView";
import { LinkButton } from "@/components/ui/Button";

type Status = "working" | "confirming" | "ready" | "error";

const STAGES = [
  "Confirming your unlock",
  "Searching the web for your options",
  "Reading and verifying the sources",
  "Writing your 90-day report",
];

export function ReportView({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("working");
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [stage, setStage] = useState(0);
  const retries = useRef(0);

  const fetchReport = useCallback(async () => {
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      if (res.status === 402) {
        // Payment not confirmed yet (webhook in flight) — retry a few times.
        if (retries.current++ < 10) {
          setStatus("confirming");
          setTimeout(fetchReport, 3000);
          return;
        }
        setStatus("error");
        return;
      }
      if (!res.ok) {
        setStatus("error");
        return;
      }
      const data = await res.json();
      if (data.roadmap) {
        setRoadmap(data.roadmap as Roadmap);
        setStatus("ready");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }, [orderId]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // Advance the staged loader while research runs.
  useEffect(() => {
    if (status !== "working") return;
    const marks = [4000, 9000, 14000];
    const timers = marks.map((ms, i) => setTimeout(() => setStage(i + 1), ms));
    return () => timers.forEach(clearTimeout);
  }, [status]);

  return (
    <div className="relative min-h-screen">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-radial-glow" />
      <header className="sticky top-0 z-30 border-b border-line bg-bg/70 backdrop-blur-xl">
        <div className="shell flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-display text-lg text-fg">
            <span
              aria-hidden
              className="grid h-7 w-7 place-items-center rounded-lg bg-accent-gradient text-sm font-semibold text-bg"
            >
              A
            </span>
            Arambha
          </Link>
          <Link href="/" className="text-sm text-fg-mute transition-colors hover:text-fg">
            Home
          </Link>
        </div>
      </header>

      <main id="main" className="shell relative py-14 sm:py-20">
        {(status === "working" || status === "confirming") && (
          <div className="mx-auto max-w-md py-10" role="status" aria-live="polite">
            <p className="eyebrow">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              {status === "confirming" ? "Confirming payment" : "Researching live"}
            </p>
            <h1 className="mt-5 text-display-md text-fg">Building your report.</h1>
            <p className="mt-3 text-sm leading-relaxed text-fg-mute">
              {status === "confirming"
                ? "Just confirming your payment — this only takes a moment."
                : "We’re reading real sources for your situation — not guessing."}
            </p>
            <ul className="mt-8 space-y-4">
              {STAGES.map((label, i) => {
                const done = i < stage;
                const current = i === stage;
                return (
                  <li key={label} className="flex items-center gap-3">
                    <span
                      aria-hidden
                      className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border transition-colors ${
                        done
                          ? "border-accent bg-accent text-bg"
                          : current
                            ? "border-accent text-accent"
                            : "border-line text-fg-mute"
                      }`}
                    >
                      {done ? (
                        <svg width="12" height="12" viewBox="0 0 14 14">
                          <path d="M2 7.5L5.5 11L12 3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : current ? (
                        <span className="h-2 w-2 animate-ping rounded-full bg-accent" />
                      ) : (
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      )}
                    </span>
                    <span className={`text-sm transition-colors ${done ? "text-fg-dim" : current ? "text-fg" : "text-fg-mute"}`}>
                      {label}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {status === "error" && (
          <div className="mx-auto max-w-xl text-center">
            <h1 className="text-display-md text-fg">We couldn’t load your report.</h1>
            <p className="mt-4 text-base leading-relaxed text-fg-dim">
              If you were charged, your report is saved — reload this page in a moment. Otherwise,
              start again from your roadmap.
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <button
                onClick={() => {
                  retries.current = 0;
                  setStatus("working");
                  fetchReport();
                }}
                className="inline-flex h-12 items-center rounded-pill bg-accent-gradient px-6 text-[15px] font-medium text-bg"
              >
                Try again
              </button>
              <LinkButton href="/start" variant="outline" size="lg">
                Back to start
              </LinkButton>
            </div>
          </div>
        )}

        {status === "ready" && roadmap && (
          <RoadmapView roadmap={roadmap} onRestart={() => router.push("/start")} />
        )}
      </main>
    </div>
  );
}
