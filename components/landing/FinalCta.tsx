import { finalCta } from "@/lib/content";
import { LinkButton } from "@/components/ui/Button";

export function FinalCta() {
  return (
    <section className="border-t border-line-soft py-20 sm:py-28">
      <div className="shell">
        <div className="ring-accent relative overflow-hidden rounded-card border border-line bg-surface px-8 py-16 text-center sm:px-16 sm:py-24">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-radial-glow"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-full bg-hairline-grid [background-size:48px_48px] [mask-image:radial-gradient(50%_60%_at_50%_0%,#000,transparent)] opacity-40"
          />
          <div className="relative mx-auto max-w-2xl">
            <p className="eyebrow justify-center">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              {finalCta.kicker}
            </p>
            <h2 className="mt-5 text-display-lg text-fg">{finalCta.title}</h2>
            <p className="mt-5 text-base leading-relaxed text-fg-dim">{finalCta.body}</p>
            <div className="mt-9 flex justify-center">
              <LinkButton href={finalCta.cta.href} size="lg">
                {finalCta.cta.label}
                <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-0.5">
                  →
                </span>
              </LinkButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
