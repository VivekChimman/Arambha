import type { Config } from "tailwindcss";

/**
 * Arambha design system — v3 "Aurora".
 *
 * A modern, high-craft dark aesthetic (Linear/Vercel/Framer register): a near-black
 * canvas with elevated surfaces, hairline borders, mono eyebrows, and a single warm
 * amber accent used with restraint (gradient text, glows, primary actions).
 *
 * Deliberately NOT the vibe-coder default: no Inter, no cream+orange rounded-card
 * sameness. Layouts vary section to section; depth comes from elevation + light, not
 * from repeating soft cards.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#08080A", // canvas (near-black, faint cool)
        surface: "#111116", // raised panels / cards
        "surface-2": "#181820", // hover / higher elevation
        line: "#26262F", // hairline borders
        "line-soft": "#1B1B22", // quieter dividers
        fg: "#F7F6F3", // primary text (warm white)
        "fg-dim": "#ADADB7", // secondary text
        "fg-mute": "#71717B", // labels / tertiary
        accent: {
          DEFAULT: "#F6B24C", // amber — the one accent
          warm: "#FF7A45", // gradient partner (sunrise)
          deep: "#D68A2A", // pressed / dark accent
        },
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-hanken)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        "display-2xl": ["clamp(3rem, 7.5vw, 6rem)", { lineHeight: "0.94", letterSpacing: "-0.03em" }],
        "display-xl": ["clamp(2.5rem, 5.5vw, 4.5rem)", { lineHeight: "0.98", letterSpacing: "-0.025em" }],
        "display-lg": ["clamp(2rem, 4vw, 3.25rem)", { lineHeight: "1.02", letterSpacing: "-0.02em" }],
        "display-md": ["clamp(1.6rem, 2.6vw, 2.4rem)", { lineHeight: "1.08", letterSpacing: "-0.015em" }],
      },
      maxWidth: {
        prose: "40rem",
        shell: "78rem",
      },
      borderRadius: {
        card: "1rem",
        pill: "999px",
      },
      boxShadow: {
        glow: "0 0 90px -22px rgba(246,178,76,0.5)",
        card: "inset 0 1px 0 0 rgba(255,255,255,0.04), 0 24px 60px -34px rgba(0,0,0,0.85)",
        pop: "0 12px 30px -12px rgba(0,0,0,0.6)",
      },
      backgroundImage: {
        "accent-gradient": "linear-gradient(100deg, #F6B24C 0%, #FF7A45 100%)",
        "radial-glow": "radial-gradient(55% 55% at 50% 0%, rgba(246,178,76,0.16), transparent 72%)",
        "hairline-grid":
          "linear-gradient(to right, rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.035) 1px, transparent 1px)",
      },
      keyframes: {
        rise: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "glow-drift": {
          "0%, 100%": { opacity: "0.7" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        rise: "rise 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "glow-drift": "glow-drift 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
