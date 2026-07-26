"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

/**
 * The three data rights in one place: take a copy, stop billing, delete
 * everything. Deletion asks the user to type their own email — it is
 * irreversible and a single mis-click must not be enough.
 */
export function AccountControls({ email, active }: { email: string; active: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"cancel" | "delete" | null>(null);
  const [confirm, setConfirm] = useState("");
  const [showDelete, setShowDelete] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function cancel() {
    setBusy("cancel");
    setError("");
    setNotice("");
    try {
      const res = await fetch("/api/subscription/cancel", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "We couldn’t cancel just now. Please try again.");
        return;
      }
      setNotice(
        data.accessUntilPeriodEnd
          ? "Cancelled. You keep access until the end of the period you’ve paid for."
          : "Cancelled.",
      );
      router.refresh();
    } catch {
      setError("We couldn’t reach the server. Check your connection and try again.");
    } finally {
      setBusy(null);
    }
  }

  async function remove() {
    setBusy("delete");
    setError("");
    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmEmail: confirm }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "We couldn’t delete your account. Please try again.");
        return;
      }
      // Account is gone — leave the app entirely.
      window.location.href = "/";
    } catch {
      setError("We couldn’t reach the server. Check your connection and try again.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="mt-6 rounded-card border border-line bg-surface p-7" aria-labelledby="account">
      <h2 id="account" className="font-display text-xl text-fg">
        Your account and data
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-fg-mute">
        It’s your information. Take a copy whenever you like, and delete it whenever you decide.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href="/api/account/export"
          className="inline-flex h-10 items-center justify-center rounded-pill border border-line px-5 text-sm font-medium text-fg transition-colors hover:bg-surface-2"
        >
          Download my data
        </a>

        {active && (
          <Button onClick={cancel} variant="outline" disabled={busy !== null}>
            {busy === "cancel" ? "Cancelling…" : "Cancel membership"}
          </Button>
        )}

        {!showDelete && (
          <Button onClick={() => setShowDelete(true)} variant="ghost" disabled={busy !== null}>
            Delete my account
          </Button>
        )}
      </div>

      {showDelete && (
        <div className="mt-6 rounded-card border border-accent/30 bg-accent/[0.06] p-5">
          <p className="text-sm leading-relaxed text-fg-dim">
            This deletes your account, your roadmaps, and your messages. It cannot be undone.
            {active && " Your membership will be cancelled at the same time, so you won’t be charged again."}
          </p>
          <label htmlFor="confirm-email" className="mt-4 block text-sm text-fg-mute">
            Type <span className="text-fg">{email}</span> to confirm.
          </label>
          <input
            id="confirm-email"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="off"
            className="mt-2 h-11 w-full max-w-sm rounded-card border border-line bg-surface px-4 text-sm text-fg placeholder:text-fg-mute focus:border-fg-mute/50 focus:outline-none"
          />
          <div className="mt-4 flex flex-wrap gap-3">
            <Button
              onClick={remove}
              disabled={busy !== null || confirm.trim().toLowerCase() !== email.toLowerCase()}
            >
              {busy === "delete" ? "Deleting…" : "Delete everything"}
            </Button>
            <Button
              onClick={() => {
                setShowDelete(false);
                setConfirm("");
                setError("");
              }}
              variant="ghost"
              disabled={busy !== null}
            >
              Keep my account
            </Button>
          </div>
        </div>
      )}

      {error && <p className="mt-4 text-sm text-accent">{error}</p>}
      {notice && <p className="mt-4 text-sm text-fg-dim">{notice}</p>}
    </section>
  );
}
