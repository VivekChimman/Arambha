import { paths } from "@/lib/content";
import { Reveal } from "@/components/ui/Reveal";

export function Paths() {
  return (
    <section id="paths" className="border-t border-line-soft py-20 sm:py-28">
      <div className="shell">
        <div className="max-w-3xl">
          <p className="eyebrow">
            <span className="h-px w-6 bg-accent" />
            {paths.kicker}
          </p>
          <h2 className="mt-5 text-display-md text-fg">{paths.title}</h2>
          <p className="mt-5 max-w-prose text-base leading-relaxed text-fg-dim">{paths.intro}</p>
        </div>

        {/* Bento of routes — a directory feel, varied from the step cards above */}
        <div className="mt-12 grid gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-2">
          {paths.items.map((item, i) => (
            <Reveal key={item.label} delay={(i % 2) * 60}>
              <div className="group flex h-full items-start gap-4 bg-surface p-7 transition-colors hover:bg-surface-2">
                <span className="mt-1 font-mono text-xs text-fg-mute">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-display text-xl text-fg transition-colors group-hover:text-accent">
                      {item.label}
                    </h3>
                    <span
                      aria-hidden
                      className="text-fg-mute transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-accent"
                    >
                      →
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-fg-mute">{item.note}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
