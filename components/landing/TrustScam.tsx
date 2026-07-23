import { trust } from "@/lib/content";
import { Reveal } from "@/components/ui/Reveal";

export function TrustScam() {
  return (
    <section className="border-t border-line-soft py-20 sm:py-28">
      <div className="shell">
        <div className="ring-accent relative overflow-hidden rounded-card border border-line bg-surface px-6 py-14 sm:px-12 sm:py-16">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-radial-glow"
          />
          <div className="relative grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
            <div>
              <p className="eyebrow">
                <span className="h-px w-6 bg-accent" />
                {trust.kicker}
              </p>
              <h2 className="mt-5 text-display-md text-fg">{trust.title}</h2>
              <p className="mt-6 max-w-md text-base leading-relaxed text-fg-dim">{trust.body}</p>
            </div>

            <ul className="space-y-px self-center">
              {trust.points.map((point, i) => (
                <Reveal
                  as="li"
                  key={point.title}
                  delay={i * 80}
                  className="border-b border-line py-6 first:border-t"
                >
                  <div className="flex gap-4">
                    <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line bg-surface-2 text-accent">
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                        <path
                          d="M9 1.5L15.5 4v4.5c0 4-2.7 6.6-6.5 8-3.8-1.4-6.5-4-6.5-8V4L9 1.5Z"
                          stroke="currentColor"
                          strokeWidth="1.4"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M6.2 9l1.9 1.9L11.8 7"
                          stroke="currentColor"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <div>
                      <h3 className="font-display text-xl text-fg">{point.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-fg-mute">{point.body}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
