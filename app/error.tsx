"use client";

import { useEffect } from "react";
import { Button, LinkButton } from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Client-visible errors are logged, never leaked raw to the user.
    console.error(error);
  }, [error]);

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-bg px-6">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-radial-glow" />
      <div className="relative max-w-md text-center">
        <p className="eyebrow justify-center">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          Something broke, not you
        </p>
        <h1 className="mt-5 text-display-md text-fg">A page didn’t load right.</h1>
        <p className="mt-4 text-base leading-relaxed text-fg-dim">
          This is on us. Nothing you did caused it, and nothing was lost. Try again, or head back
          to the start.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button onClick={reset} size="lg">
            Try again
          </Button>
          <LinkButton href="/" variant="outline" size="lg">
            Back to home
          </LinkButton>
        </div>
      </div>
    </main>
  );
}
