import Link from "next/link";
import { footer, nav } from "@/lib/content";

export function Footer() {
  return (
    <footer className="border-t border-line bg-bg">
      <div className="shell grid gap-12 py-16 md:grid-cols-[1.6fr_1fr_1fr] md:py-20">
        <div className="max-w-xs">
          <Link href="/" className="flex items-center gap-2 font-display text-2xl text-fg">
            <span
              aria-hidden
              className="grid h-8 w-8 place-items-center rounded-lg bg-accent-gradient text-sm font-semibold text-bg"
            >
              A
            </span>
            {nav.brand}
          </Link>
          <p className="mt-5 text-sm leading-relaxed text-fg-mute">{footer.tagline}</p>
        </div>

        {footer.columns.map((col) => (
          <div key={col.title}>
            <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-fg-mute">
              {col.title}
            </h3>
            <ul className="mt-4 space-y-3">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-fg-dim transition-colors hover:text-fg"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-line-soft">
        <div className="shell flex flex-col items-start justify-between gap-3 py-6 text-xs text-fg-mute sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Arambha. All rights reserved.</p>
          <Link href={footer.parent.href} className="transition-colors hover:text-fg">
            {footer.parent.label}
          </Link>
        </div>
      </div>
    </footer>
  );
}
