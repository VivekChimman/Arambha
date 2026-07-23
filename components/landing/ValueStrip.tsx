import { valueStrip } from "@/lib/content";

export function ValueStrip() {
  return (
    <div className="border-y border-line-soft bg-surface/30">
      <ul className="shell flex flex-wrap items-center justify-center gap-x-8 gap-y-3 py-5 sm:justify-between">
        {valueStrip.map((v) => (
          <li key={v} className="flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.14em] text-fg-mute">
            <svg width="13" height="13" viewBox="0 0 14 14" aria-hidden className="text-accent">
              <path
                d="M2 7.5L5.5 11L12 3"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {v}
          </li>
        ))}
      </ul>
    </div>
  );
}
