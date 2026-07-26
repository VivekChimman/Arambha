"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "Which path should I start with?",
  "I can’t afford this — what are my options?",
  "What exactly do I do in week 1?",
];

/**
 * Follow-up chat about one saved report. Costs no report credit — the server
 * answers from the report itself and refuses anything off-topic.
 */
export function ReportChat({ reportId, initial }: { reportId: string; initial: Msg[] }) {
  const [messages, setMessages] = useState<Msg[]>(initial);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messages.length > initial.length) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, initial.length]);

  async function send(text: string) {
    const question = text.trim();
    if (!question || busy) return;

    setInput("");
    setError("");
    setBusy(true);
    setMessages((m) => [...m, { role: "user", content: question }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, message: question }),
      });
      const data = await res.json();
      if (!res.ok || !data.reply) {
        setError(data.error ?? "That didn’t go through. Please try again.");
        return;
      }
      setMessages((m) => [...m, { role: "assistant", content: data.reply as string }]);
    } catch {
      setError("We couldn’t reach the server. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-14" aria-labelledby="followups">
      <h3 id="followups" className="font-mono text-xs uppercase tracking-[0.2em] text-fg-mute">
        Ask about this plan
      </h3>
      <p className="mt-3 text-sm text-fg-mute">
        Follow-up questions are free — they don’t use a report.
      </p>

      <div className="mt-5 rounded-card border border-line bg-surface/50">
        <div className="max-h-[26rem] space-y-4 overflow-y-auto p-5" role="log" aria-live="polite">
          {messages.length === 0 && (
            <p className="text-sm text-fg-mute">
              Ask anything about your paths, costs, or first steps.
            </p>
          )}

          {messages.map((m, i) => (
            <div
              key={i}
              className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
            >
              <p
                className={`max-w-[85%] whitespace-pre-wrap rounded-card px-4 py-3 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-surface-2 text-fg"
                    : "border border-line bg-bg text-fg-dim"
                }`}
              >
                {m.content}
              </p>
            </div>
          ))}

          {busy && (
            <p className="text-sm text-fg-mute" role="status">
              Thinking…
            </p>
          )}
          <div ref={endRef} />
        </div>

        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2 border-t border-line p-4">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                disabled={busy}
                className="rounded-pill border border-line px-3 py-1.5 text-xs text-fg-dim transition-colors hover:border-fg-mute/40 hover:text-fg disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-center gap-3 border-t border-line p-4"
        >
          <label htmlFor="chat-input" className="sr-only">
            Your question
          </label>
          <input
            id="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your roadmap…"
            maxLength={1000}
            disabled={busy}
            className="h-11 flex-1 rounded-card border border-line bg-surface px-4 text-sm text-fg placeholder:text-fg-mute focus:border-fg-mute/50 focus:outline-none disabled:opacity-50"
          />
          <Button type="submit" disabled={busy || !input.trim()}>
            Ask
          </Button>
        </form>
      </div>

      {error && <p className="mt-3 text-sm text-accent">{error}</p>}
    </section>
  );
}
