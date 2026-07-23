import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost";
type Size = "md" | "lg";

const base =
  "group inline-flex items-center justify-center gap-2 font-medium tracking-tight transition-all duration-200 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50";

const sizes: Record<Size, string> = {
  md: "h-10 px-5 text-sm rounded-pill",
  lg: "h-12 px-6 text-[15px] rounded-pill",
};

const variants: Record<Variant, string> = {
  // Amber gradient, dark text, lifts with a soft glow on hover.
  primary:
    "bg-accent-gradient text-bg shadow-[0_8px_24px_-10px_rgba(246,178,76,0.6)] hover:shadow-[0_10px_34px_-8px_rgba(246,178,76,0.75)] hover:-translate-y-0.5",
  // Quiet elevated button for secondary actions on dark.
  secondary: "bg-surface text-fg border border-line hover:bg-surface-2 hover:border-fg-mute/40",
  // Transparent, border only.
  outline: "border border-line text-fg hover:bg-surface hover:border-fg-mute/40",
  ghost: "text-fg-dim hover:text-fg",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
};

function classes({ variant = "primary", size = "md", className = "" }: CommonProps) {
  return `${base} ${sizes[size]} ${variants[variant]} ${className}`.trim();
}

type LinkButtonProps = CommonProps & {
  href: string;
} & Omit<ComponentPropsWithoutRef<typeof Link>, "href" | "className">;

export function LinkButton({ href, variant, size, className, children, ...rest }: LinkButtonProps) {
  return (
    <Link href={href} className={classes({ variant, size, className })} {...rest}>
      {children}
    </Link>
  );
}

type ButtonProps = CommonProps & ComponentPropsWithoutRef<"button">;

export function Button({ variant, size, className, children, ...rest }: ButtonProps) {
  return (
    <button className={classes({ variant, size, className })} {...rest}>
      {children}
    </button>
  );
}
