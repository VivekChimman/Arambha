"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const isSignup = mode === "signup";

  async function withEmail(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const supabase = createClient();
      if (isSignup) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
        });
        if (error) throw error;
        setNotice("Check your email to confirm your account, then sign in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push(next);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function withGoogle() {
    setBusy(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    if (error) {
      setError(error.message);
      setBusy(false);
    }
    // On success the browser redirects to Google.
  }

  return (
    <div className="w-full max-w-sm">
      <Link href="/" className="flex items-center gap-2 font-display text-2xl text-fg">
        <span aria-hidden className="grid h-8 w-8 place-items-center rounded-lg bg-accent-gradient text-sm font-semibold text-bg">
          A
        </span>
        Arambha
      </Link>

      <h1 className="mt-8 text-display-md text-fg">
        {isSignup ? "Create your account" : "Welcome back"}
      </h1>
      <p className="mt-2 text-sm text-fg-mute">
        {isSignup
          ? "Sign up to get your first researched report free."
          : "Sign in to your reports and plan."}
      </p>

      <button
        type="button"
        onClick={withGoogle}
        disabled={busy}
        className="mt-8 flex h-11 w-full items-center justify-center gap-3 rounded-pill border border-line bg-surface text-sm font-medium text-fg transition-colors hover:bg-surface-2 disabled:opacity-50"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
          <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z" />
          <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.83.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z" />
          <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z" />
          <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.47.9 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z" />
        </svg>
        Continue with Google
      </button>

      <div className="my-6 flex items-center gap-3 text-xs text-fg-mute">
        <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
      </div>

      <form onSubmit={withEmail} className="space-y-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          autoComplete="email"
          className="h-11 w-full rounded-card border border-line bg-surface px-4 text-sm text-fg placeholder:text-fg-mute focus:border-fg-mute/50 focus:outline-none"
        />
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password (min 8 characters)"
          autoComplete={isSignup ? "new-password" : "current-password"}
          className="h-11 w-full rounded-card border border-line bg-surface px-4 text-sm text-fg placeholder:text-fg-mute focus:border-fg-mute/50 focus:outline-none"
        />

        {error && <p className="text-sm text-accent">{error}</p>}
        {notice && <p className="text-sm text-fg-dim">{notice}</p>}

        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy ? "Please wait…" : isSignup ? "Create account" : "Sign in"}
        </Button>
      </form>

      <p className="mt-6 text-sm text-fg-mute">
        {isSignup ? "Already have an account? " : "New to Arambha? "}
        <Link href={isSignup ? "/login" : "/signup"} className="text-accent hover:opacity-80">
          {isSignup ? "Sign in" : "Create one"}
        </Link>
      </p>
    </div>
  );
}
