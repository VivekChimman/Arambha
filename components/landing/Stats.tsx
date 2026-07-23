import { stats } from "@/lib/content";
import { Reveal } from "@/components/ui/Reveal";

export function Stats() {
  return (
    <section className="py-16 sm:py-20">
      <div className="shell">
        <div className="grid gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-3">
          {stats.map((s, i) => (
            <Reveal key={s.k} delay={i * 90} className="bg-surface p-8 sm:p-10">
              <p className="font-display text-5xl tracking-tight text-fg sm:text-6xl">
                <span className="accent-text">{s.k}</span>
              </p>
              <p className="mt-4 max-w-[22ch] text-sm leading-relaxed text-fg-dim">{s.l}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
