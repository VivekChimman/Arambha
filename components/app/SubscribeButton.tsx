"use client";

import { useState } from "react";

export function SubscribeButton({
  className = "",
  label = "Subscribe — ₹199/month",
}: {
  className?: string;
  label?: string;
}) {
  const [busy, setBusy] = useState(false);

  async function subscribe() {
    setBusy(true);
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url; // DODO checkout, or /dashboard in demo mode
        return;
      }
      setBusy(false);
    } catch {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={subscribe}
      disabled={busy}
      className={`inline-flex h-12 items-center justify-center rounded-pill bg-accent-gradient px-6 text-[15px] font-medium text-bg transition-all hover:-translate-y-0.5 disabled:opacity-50 ${className}`}
    >
      {busy ? "Starting checkout…" : label}
    </button>
  );
}
