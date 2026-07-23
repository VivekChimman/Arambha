import { howItWorks } from "@/lib/content";
import { Reveal } from "@/components/ui/Reveal";

export function HowItWorks() {
  return (
    <section id="how" className="border-t border-line-soft py-20 sm:py-28">
      <div className="shell">
        <div className="max-w-2xl">
          <p className="eyebrow">
            <span className="h-px w-6 bg-accent" />
            {howItWorks.kicker}
          </p>
          <h2 className="mt-5 text-display-md text-fg">{howItWorks.title}</h2>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {howItWorks.steps.map((step, i) => (
            <Reveal key={step.n} delay={i * 100}>
              <div className="card group relative h-full overflow-hidden p-8 transition-colors hover:border-fg-mute/30">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-radial-glow opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                />
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm text-accent">{step.n}</span>
                  <span className="h-8 w-8 rounded-full border border-line" />
                </div>
                <h3 className="mt-6 font-display text-2xl text-fg">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-fg-dim">{step.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
