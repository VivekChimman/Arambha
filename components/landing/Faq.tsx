import { faq } from "@/lib/content";

export function Faq() {
  return (
    <section id="faq" className="border-t border-line-soft py-20 sm:py-28">
      <div className="shell grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="eyebrow">
            <span className="h-px w-6 bg-accent" />
            {faq.kicker}
          </p>
          <h2 className="mt-5 text-display-md text-fg">{faq.title}</h2>
        </div>

        {/* Native details/summary — keyboard-accessible, works without JS */}
        <div className="border-t border-line">
          {faq.items.map((item) => (
            <details key={item.q} className="group border-b border-line">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-display text-lg text-fg marker:content-none">
                {item.q}
                <span
                  aria-hidden
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-line text-fg-dim transition-all duration-200 group-open:rotate-45 group-open:border-accent group-open:text-accent"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12">
                    <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </span>
              </summary>
              <p className="max-w-prose pb-6 pr-10 text-sm leading-relaxed text-fg-mute">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
