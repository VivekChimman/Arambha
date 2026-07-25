import Link from "next/link";
import type { Roadmap } from "@/lib/composeRoadmap";
import { Button } from "@/components/ui/Button";

const ROLE_STYLE: Record<string, string> = {
  Earn: "bg-accent/15 text-accent",
  Build: "bg-fg/10 text-fg",
  Grow: "bg-fg/10 text-fg-dim",
};

export function RoadmapView({
  roadmap,
  onRestart,
  onUnlock,
  unlocking,
}: {
  roadmap: Roadmap;
  onRestart: () => void;
  onUnlock?: () => void;
  unlocking?: boolean;
}) {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <span className="pill">
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        Your roadmap is ready
      </span>
      <h1 className="mt-6 text-display-lg text-fg">Three real paths, sequenced over 90 days.</h1>
      <p className="mt-4 max-w-prose text-lg leading-relaxed text-fg-dim">{roadmap.summaryLine}</p>

      {/* Scam warnings — surfaced before anything else that involves a job */}
      {roadmap.warnings.map((w) => (
        <div
          key={w}
          className="mt-6 flex items-start gap-3 rounded-card border border-accent/30 bg-accent/[0.06] p-4"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden className="mt-0.5 shrink-0 text-accent">
            <path d="M9 6.5v3.2M9 12.2v.05M9 2 2 15h14L9 2Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="text-sm leading-relaxed text-fg-dim">{w}</p>
        </div>
      ))}

      {/* The three paths */}
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {roadmap.paths.map((p, i) => (
          <div key={`${p.title}-${i}`} className="card flex flex-col p-6">
            <div className="flex items-center justify-between">
              <span className={`rounded-pill px-2.5 py-1 text-xs font-medium ${ROLE_STYLE[p.role]}`}>
                {p.role}
              </span>
              <span className="font-mono text-[11px] uppercase tracking-wider text-fg-mute">
                {p.kindLabel}
              </span>
            </div>
            <h2 className="mt-4 font-display text-xl leading-snug text-fg">{p.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-fg-mute">{p.summary}</p>
            {p.why && (
              <p className="mt-3 border-t border-line-soft pt-3 text-sm leading-relaxed text-fg-dim">
                <span className="font-mono text-[10px] uppercase tracking-wider text-accent">
                  Why this fits you
                </span>
                <span className="mt-1 block">{p.why}</span>
              </p>
            )}
            <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
              {p.cost && (
                <span className="rounded-pill bg-surface-2 px-2.5 py-1 text-[11px] text-fg-dim">
                  {p.cost}
                </span>
              )}
              {p.sourceUrl && (
                <a
                  href={p.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-pill border border-line px-2.5 py-1 text-[11px] text-accent transition-colors hover:bg-surface-2"
                >
                  Source ↗
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 90-day timeline */}
      <h3 className="mt-14 font-mono text-xs uppercase tracking-[0.2em] text-fg-mute">
        Your 90 days
      </h3>
      <ol className="mt-5 space-y-4">
        {roadmap.phases.map((phase) => (
          <li key={phase.weeks} className="card p-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className={`rounded-pill px-2.5 py-1 text-xs font-medium ${ROLE_STYLE[phase.role]}`}>
                {phase.role}
              </span>
              <span className="font-mono text-xs uppercase tracking-wider text-fg-mute">
                {phase.weeks}
              </span>
              <span className="font-display text-lg text-fg">{phase.pathTitle}</span>
            </div>
            <ul className="mt-4 space-y-2.5">
              {phase.actions.map((a) => (
                <li key={a} className="flex items-start gap-3 text-sm text-fg-dim">
                  <svg width="15" height="15" viewBox="0 0 14 14" aria-hidden className="mt-0.5 shrink-0 text-accent">
                    <path d="M2 7.5L5.5 11L12 3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {a}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>

      {/* Cashflow note */}
      {roadmap.cashflowTip && (
        <div className="mt-6 rounded-card border border-line bg-surface/50 p-5">
          <p className="font-mono text-[11px] uppercase tracking-widest text-accent">Funding the restart</p>
          <p className="mt-2 text-sm leading-relaxed text-fg-dim">{roadmap.cashflowTip}</p>
        </div>
      )}

      {/* Sources — researched roadmaps only */}
      {roadmap.sources && roadmap.sources.length > 0 && (
        <div className="mt-8">
          <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-fg-mute">Sources</h3>
          <ul className="mt-4 space-y-2">
            {roadmap.sources.map((s, i) => (
              <li key={s.url} className="flex gap-3 text-sm">
                <span className="font-mono text-xs text-fg-mute">{String(i + 1).padStart(2, "0")}</span>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate text-fg-dim underline decoration-line underline-offset-2 transition-colors hover:text-accent"
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Report upsell — only on the free teaser (hidden once it's the paid report) */}
      {!roadmap.researched && onUnlock && (
        <div className="ring-accent relative mt-10 overflow-hidden rounded-card border border-line bg-surface p-8">
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-radial-glow" />
          <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div className="max-w-md">
              <h3 className="font-display text-2xl text-fg">Unlock your researched report</h3>
              <p className="mt-2 text-sm leading-relaxed text-fg-dim">
                We’ll research the web live for <span className="text-fg">your</span> situation —
                specific courses, exams and jobs with real links and costs, cited so you can check
                them. One-time <span className="accent-text font-medium">₹199</span>, no subscription.
              </p>
            </div>
            <Button size="lg" className="shrink-0" onClick={onUnlock} disabled={unlocking}>
              {unlocking ? "Starting checkout…" : "Unlock — ₹199"}
            </Button>
          </div>
        </div>
      )}

      {roadmap.researched && (
        <div className="mt-10 flex items-center gap-3 rounded-card border border-accent/30 bg-accent/[0.06] p-4">
          <svg width="16" height="16" viewBox="0 0 14 14" aria-hidden className="shrink-0 text-accent">
            <path d="M2 7.5L5.5 11L12 3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="text-sm text-fg-dim">Your full report — researched live and yours to keep.</p>
        </div>
      )}

      <p className="mt-6 text-xs text-fg-mute">
        {roadmap.researched
          ? `Researched live from ${roadmap.groundedFrom} sources and grounded in the ones linked above — nothing invented.`
          : `Grounded from ${roadmap.groundedFrom} options you’re actually eligible for. Nothing here was invented.`}
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button onClick={onRestart} variant="outline" size="lg">
          Start over
        </Button>
        <Link
          href="/"
          className="inline-flex h-12 items-center justify-center rounded-pill px-6 text-[15px] font-medium text-fg-dim transition-colors hover:text-fg"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
