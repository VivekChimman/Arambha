import { hero } from "@/lib/content";
import { LinkButton } from "@/components/ui/Button";

export function Hero() {
  const [before, after] = hero.titleLead.split(hero.accentWord);

  return (
    <section className="relative overflow-hidden">
      {/* Ambient light + faint grid — depth without a card */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-radial-glow" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-hairline-grid [background-size:56px_56px] [mask-image:radial-gradient(60%_60%_at_50%_0%,#000,transparent)]"
      />

      <div className="shell relative grid items-center gap-12 pb-20 pt-16 sm:pt-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:pb-28 lg:pt-28">
        <div className="max-w-2xl">
          <span className="pill animate-rise">
            <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_10px_2px_rgba(246,178,76,0.6)]" />
            {hero.kicker}
          </span>

          <h1 className="mt-6 text-display-2xl text-fg">
            {before}
            <span className="accent-text italic">{hero.accentWord}</span>
            {after}
            <br />
            <span className="text-fg-dim">{hero.titleRest}</span>
          </h1>

          <p className="mt-7 max-w-prose text-lg leading-relaxed text-fg-dim">{hero.body}</p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <LinkButton href={hero.primary.href} size="lg">
              {hero.primary.label}
              <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-0.5">
                →
              </span>
            </LinkButton>
            <LinkButton href={hero.secondary.href} variant="outline" size="lg">
              {hero.secondary.label}
            </LinkButton>
          </div>

          <ul className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-fg-mute">
            {hero.reassurance.map((r) => (
              <li key={r} className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden className="text-accent">
                  <path
                    d="M2 7.5L5.5 11L12 3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {r}
              </li>
            ))}
          </ul>
        </div>

        {/* Product mock — a refined "roadmap" preview, not a stock image */}
        <div className="relative lg:pt-2">
          <div
            aria-hidden
            className="absolute -inset-6 -z-10 bg-radial-glow opacity-70"
          />
          <div className="ring-accent card overflow-hidden shadow-card">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent-gradient text-xs font-semibold text-bg">
                  A
                </span>
                <div>
                  <p className="text-sm font-medium text-fg">Your 90-day roadmap</p>
                  <p className="font-mono text-[11px] uppercase tracking-widest text-fg-mute">
                    Preview
                  </p>
                </div>
              </div>
              <span className="rounded-pill border border-line bg-surface-2 px-2.5 py-1 text-xs text-accent">
                3 paths
              </span>
            </div>

            <ol className="divide-y divide-line-soft">
              {[
                { w: "Weeks 1–2", tag: "Earn", t: "Part-time that fits your hours" },
                { w: "Weeks 3–8", tag: "Build", t: "A paying skill with real demand" },
                { w: "Weeks 9–13", tag: "Qualify", t: "The exam you’re still eligible for" },
              ].map((row) => (
                <li key={row.w} className="flex items-center gap-4 px-5 py-4">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-fg-mute">
                    {row.w}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-fg">{row.t}</p>
                  </div>
                  <span className="shrink-0 rounded-pill bg-accent/10 px-2.5 py-1 text-[11px] font-medium text-accent">
                    {row.tag}
                  </span>
                </li>
              ))}
            </ol>

            <div className="border-t border-line bg-surface-2/50 px-5 py-3.5">
              <p className="text-xs text-fg-mute">A sample. Yours is built from your own answers.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
