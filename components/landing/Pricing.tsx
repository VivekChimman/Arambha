import { pricing } from "@/lib/content";
import { LinkButton } from "@/components/ui/Button";

function Tier({
  tier,
  featured,
}: {
  tier: typeof pricing.free | typeof pricing.paid;
  featured?: boolean;
}) {
  return (
    <div
      className={`relative flex flex-col rounded-card p-8 ${
        featured
          ? "ring-accent border border-transparent bg-surface shadow-glow"
          : "border border-line bg-surface/60"
      }`}
    >
      {featured && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-40 rounded-t-card bg-radial-glow"
        />
      )}
      <div className="relative flex items-center justify-between">
        <h3 className="font-display text-xl text-fg">{tier.label}</h3>
        {featured && (
          <span className="rounded-pill bg-accent-gradient px-2.5 py-1 text-xs font-medium text-bg">
            Optional
          </span>
        )}
      </div>

      <div className="relative mt-5 flex items-end gap-2">
        <span className={`font-display text-5xl tracking-tight ${featured ? "accent-text" : "text-fg"}`}>
          {tier.price}
        </span>
        <span className="pb-1.5 text-sm text-fg-mute">{tier.sub}</span>
      </div>

      <ul className="relative mt-7 flex-1 space-y-3.5">
        {tier.features.map((f) => (
          <li key={f} className="flex items-start gap-3 text-sm">
            <svg width="16" height="16" viewBox="0 0 14 14" aria-hidden className="mt-0.5 shrink-0 text-accent">
              <path
                d="M2 7.5L5.5 11L12 3"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-fg-dim">{f}</span>
          </li>
        ))}
      </ul>

      <div className="relative mt-8">
        <LinkButton
          href={tier.cta.href}
          size="lg"
          variant={featured ? "primary" : "secondary"}
          className="w-full"
        >
          {tier.cta.label}
        </LinkButton>
      </div>
    </div>
  );
}

export function Pricing() {
  return (
    <section id="pricing" className="border-t border-line-soft py-20 sm:py-28">
      <div className="shell">
        <div className="max-w-2xl">
          <p className="eyebrow">
            <span className="h-px w-6 bg-accent" />
            {pricing.kicker}
          </p>
          <h2 className="mt-5 text-display-md text-fg">{pricing.title}</h2>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          <Tier tier={pricing.free} />
          <Tier tier={pricing.paid} featured />
        </div>

        <p className="mt-6 max-w-prose text-sm text-fg-mute">{pricing.footnote}</p>
      </div>
    </section>
  );
}
