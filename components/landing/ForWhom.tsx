import { forWhom } from "@/lib/content";
import { Reveal } from "@/components/ui/Reveal";

export function ForWhom() {
  return (
    <section id="who" className="border-t border-line-soft py-20 sm:py-28">
      <div className="shell grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="eyebrow">
            <span className="h-px w-6 bg-accent" />
            {forWhom.kicker}
          </p>
          <h2 className="mt-5 text-display-md text-fg">{forWhom.title}</h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-fg-dim">{forWhom.intro}</p>
        </div>

        <ul className="border-t border-line">
          {forWhom.personas.map((p, i) => (
            <Reveal
              as="li"
              key={p.tag}
              delay={i * 60}
              className="group border-b border-line transition-colors"
            >
              <div className="flex gap-5 rounded-lg px-2 py-6 transition-colors group-hover:bg-surface/50">
                <span className="font-mono text-sm text-accent">{p.tag}</span>
                <div>
                  <h3 className="font-display text-xl text-fg">{p.title}</h3>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-fg-mute">{p.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
