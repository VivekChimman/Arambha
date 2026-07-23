import type { Metadata, Viewport } from "next";
import { Fraunces, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import { env } from "@/lib/env";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  axes: ["SOFT", "opsz"],
});

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-hanken",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
  weight: ["400", "500"],
});

const APP_URL = env.appUrl;

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Arambha — start again, from exactly where you are",
    template: "%s · Arambha",
  },
  description:
    "A 90-day roadmap of three real paths for adults starting over — grounded in options that actually exist. No false promises, no wishful advice.",
  keywords: [
    "career restart",
    "starting over adults",
    "dropped out what now",
    "90 day plan",
    "second chance career",
  ],
  openGraph: {
    title: "Arambha — start again, from exactly where you are",
    description:
      "A 90-day roadmap of three real, verified paths for adults restarting after years of being stuck.",
    url: APP_URL,
    siteName: "Arambha",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#08080A",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${hanken.variable} ${mono.variable}`}
    >
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-pill focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-bg"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
