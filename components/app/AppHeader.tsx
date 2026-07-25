import Link from "next/link";

/** Header for the signed-in app area: brand + nav + sign out. */
export function AppHeader({ email }: { email?: string | null }) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/70 backdrop-blur-xl">
      <div className="shell flex h-16 items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 font-display text-lg text-fg">
          <span aria-hidden className="grid h-7 w-7 place-items-center rounded-lg bg-accent-gradient text-sm font-semibold text-bg">
            A
          </span>
          Arambha
        </Link>
        <div className="flex items-center gap-5 text-sm">
          <Link href="/history" className="text-fg-dim transition-colors hover:text-fg">
            History
          </Link>
          {email && <span className="hidden text-fg-mute sm:inline">{email}</span>}
          <form action="/auth/signout" method="post">
            <button type="submit" className="text-fg-mute transition-colors hover:text-fg">
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
