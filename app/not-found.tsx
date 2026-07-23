import { LinkButton } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-bg px-6">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-radial-glow" />
      <div className="relative max-w-md text-center">
        <p className="font-display text-7xl">
          <span className="accent-text">404</span>
        </p>
        <h1 className="mt-4 text-display-md text-fg">This path doesn’t exist yet.</h1>
        <p className="mt-4 text-base leading-relaxed text-fg-dim">
          The page you were looking for isn’t here — but your real path still is. Let’s get you
          back on it.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <LinkButton href="/" size="lg">
            Back to home
          </LinkButton>
          <LinkButton href="/start" variant="outline" size="lg">
            Build my roadmap
          </LinkButton>
        </div>
      </div>
    </main>
  );
}
