"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { nav } from "@/lib/content";
import { LinkButton } from "@/components/ui/Button";

export function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled || open
          ? "border-b border-line bg-bg/70 backdrop-blur-xl"
          : "border-b border-transparent"
      }`}
    >
      <nav className="shell flex h-16 items-center justify-between" aria-label="Primary">
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-xl tracking-tight text-fg"
          onClick={() => setOpen(false)}
        >
          <span
            aria-hidden
            className="grid h-7 w-7 place-items-center rounded-lg bg-accent-gradient text-sm font-semibold text-bg"
          >
            A
          </span>
          {nav.brand}
        </Link>

        <ul className="hidden items-center gap-8 md:flex">
          {nav.links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-sm text-fg-dim transition-colors hover:text-fg"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          <LinkButton href={nav.cta.href} size="md">
            {nav.cta.label}
          </LinkButton>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="relative z-50 flex h-10 w-10 items-center justify-center md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          <div className="relative h-4 w-6">
            <span
              className={`absolute left-0 h-0.5 w-6 bg-fg transition-all duration-300 ${
                open ? "top-1.5 rotate-45" : "top-0"
              }`}
            />
            <span
              className={`absolute left-0 top-1.5 h-0.5 w-6 bg-fg transition-opacity duration-200 ${
                open ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute left-0 h-0.5 w-6 bg-fg transition-all duration-300 ${
                open ? "top-1.5 -rotate-45" : "top-3"
              }`}
            />
          </div>
        </button>
      </nav>

      {/* Mobile panel */}
      <div
        id="mobile-menu"
        className={`overflow-hidden border-t bg-bg/95 backdrop-blur-xl md:hidden ${
          open ? "max-h-[80vh] border-line" : "max-h-0 border-transparent"
        } transition-[max-height] duration-300 ease-out`}
      >
        <ul className="shell flex flex-col gap-1 py-4">
          {nav.links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={() => setOpen(false)}
                className="block border-b border-line-soft py-3.5 font-display text-lg text-fg"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li className="pt-4">
            <LinkButton
              href={nav.cta.href}
              size="lg"
              className="w-full"
              onClick={() => setOpen(false)}
            >
              {nav.cta.label}
            </LinkButton>
          </li>
        </ul>
      </div>
    </header>
  );
}
