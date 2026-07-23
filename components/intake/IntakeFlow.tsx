"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  INTAKE_QUESTIONS,
  type IntakeAnswers,
  type QuestionId,
} from "@/lib/intake";
import type { Roadmap } from "@/lib/composeRoadmap";
import { ChoiceStep } from "@/components/intake/ChoiceStep";
import { RoadmapView } from "@/components/intake/RoadmapView";
import { Button, LinkButton } from "@/components/ui/Button";

type Phase = "form" | "submitting" | "result" | "error";

const REVIEW_INDEX = INTAKE_QUESTIONS.length;
const TOTAL_STEPS = INTAKE_QUESTIONS.length + 1; // + review

export function IntakeFlow() {
  const [phase, setPhase] = useState<Phase>("form");
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Partial<Record<QuestionId, string>>>({});
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const headingRef = useRef<HTMLDivElement | null>(null);

  // Move focus to the step on change — keyboard + screen-reader friendly.
  useEffect(() => {
    if (phase === "form") headingRef.current?.focus();
  }, [stepIndex, phase]);

  const onReview = stepIndex === REVIEW_INDEX;
  const question = onReview ? null : INTAKE_QUESTIONS[stepIndex];
  const answered = question ? Boolean(answers[question.id]) : true;
  const canProceed = onReview || answered || Boolean(question?.optional);

  const progress = Math.round((stepIndex / TOTAL_STEPS) * 100);

  function select(id: QuestionId, value: string) {
    setAnswers((a) => ({ ...a, [id]: value }));
  }

  function goNext() {
    if (onReview) {
      submit();
      return;
    }
    if (!canProceed) return;
    setStepIndex((i) => Math.min(i + 1, REVIEW_INDEX));
  }

  function goBack() {
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  function skip() {
    if (question) setAnswers((a) => ({ ...a, [question.id]: undefined }));
    setStepIndex((i) => Math.min(i + 1, REVIEW_INDEX));
  }

  async function submit() {
    setPhase("submitting");
    setErrorMsg("");
    try {
      const res = await fetch("/api/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      });
      const data = await res.json();
      if (!res.ok || !data.roadmap) {
        setErrorMsg(data.error ?? "We couldn’t build your roadmap. Please try again.");
        setPhase("error");
        return;
      }
      setRoadmap(data.roadmap as Roadmap);
      setPhase("result");
      window.scrollTo({ top: 0 });
    } catch {
      setErrorMsg("We couldn’t reach the server. Check your connection and try again.");
      setPhase("error");
    }
  }

  function restart() {
    setAnswers({});
    setRoadmap(null);
    setStepIndex(0);
    setPhase("form");
    window.scrollTo({ top: 0 });
  }

  return (
    <div className="relative min-h-screen">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-radial-glow" />

      {/* Slim header + progress */}
      <header className="sticky top-0 z-30 border-b border-line bg-bg/70 backdrop-blur-xl">
        <div className="shell flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-display text-lg text-fg">
            <span
              aria-hidden
              className="grid h-7 w-7 place-items-center rounded-lg bg-accent-gradient text-sm font-semibold text-bg"
            >
              A
            </span>
            Arambha
          </Link>
          {phase !== "result" && (
            <p className="font-mono text-xs uppercase tracking-widest text-fg-mute">
              {onReview ? "Review" : `Step ${stepIndex + 1} of ${TOTAL_STEPS}`}
            </p>
          )}
          <Link href="/" className="text-sm text-fg-mute transition-colors hover:text-fg">
            Exit
          </Link>
        </div>
        {phase === "form" && (
          <div className="h-0.5 w-full bg-line">
            <div
              className="h-full bg-accent-gradient transition-[width] duration-500 ease-out"
              style={{ width: `${Math.max(progress, 4)}%` }}
              role="progressbar"
              aria-valuenow={stepIndex + 1}
              aria-valuemin={1}
              aria-valuemax={TOTAL_STEPS}
              aria-label="Intake progress"
            />
          </div>
        )}
      </header>

      <main id="main" className="shell relative py-14 sm:py-20">
        {phase === "submitting" && <Submitting />}

        {phase === "error" && (
          <div className="mx-auto max-w-xl text-center">
            <p className="font-display text-6xl text-fg-mute">·</p>
            <h1 className="mt-4 text-display-md text-fg">That didn’t go through.</h1>
            <p className="mt-4 text-base leading-relaxed text-fg-dim">{errorMsg}</p>
            <div className="mt-8 flex justify-center gap-3">
              <Button onClick={submit} size="lg">
                Try again
              </Button>
              <LinkButton href="/" variant="outline" size="lg">
                Back to home
              </LinkButton>
            </div>
          </div>
        )}

        {phase === "result" && roadmap && <RoadmapView roadmap={roadmap} onRestart={restart} />}

        {phase === "form" && (
          <form
            className="mx-auto max-w-xl"
            onSubmit={(e) => {
              e.preventDefault();
              goNext();
            }}
          >
            <div ref={headingRef} tabIndex={-1} className="outline-none">
              {question ? (
                <ChoiceStep
                  question={question}
                  value={answers[question.id]}
                  onSelect={(v) => select(question.id, v)}
                />
              ) : (
                <ReviewStep answers={answers} onEdit={(i) => setStepIndex(i)} />
              )}
            </div>

            <div className="mt-10 flex items-center justify-between gap-3">
              <div>
                {stepIndex > 0 ? (
                  <Button type="button" onClick={goBack} variant="ghost" size="lg">
                    ← Back
                  </Button>
                ) : (
                  <Link href="/" className="text-sm text-fg-mute transition-colors hover:text-fg">
                    Cancel
                  </Link>
                )}
              </div>

              <div className="flex items-center gap-3">
                {question?.optional && !answered && (
                  <Button type="button" onClick={skip} variant="ghost" size="lg">
                    Skip
                  </Button>
                )}
                <Button type="submit" size="lg" disabled={!canProceed}>
                  {onReview ? "Build my roadmap" : "Continue"}
                  <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </Button>
              </div>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}

function Submitting() {
  return (
    <div className="grid min-h-[50vh] place-items-center" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-5 text-center">
        <div className="flex items-center gap-1.5" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-2.5 w-2.5 animate-rise rounded-full bg-accent"
              style={{ animationDelay: `${i * 130}ms`, animationDuration: "0.9s" }}
            />
          ))}
        </div>
        <p className="font-display text-xl text-fg">Grounding your three paths…</p>
        <p className="max-w-xs text-sm text-fg-mute">
          Matching your answers against real, eligible options.
        </p>
      </div>
    </div>
  );
}

function ReviewStep({
  answers,
  onEdit,
}: {
  answers: Partial<Record<QuestionId, string>>;
  onEdit: (index: number) => void;
}) {
  return (
    <fieldset>
      <legend className="text-display-md text-fg">Does this look right?</legend>
      <p className="mt-3 text-sm leading-relaxed text-fg-mute">
        A quick check before we build. Edit anything that’s off.
      </p>

      <dl className="mt-8 divide-y divide-line border-y border-line">
        {INTAKE_QUESTIONS.map((q, i) => {
          const val = answers[q.id];
          const opt = q.options.find((o) => o.value === val);
          return (
            <div key={q.id} className="flex items-center justify-between gap-4 py-4">
              <div className="min-w-0">
                <dt className="font-mono text-[11px] uppercase tracking-wider text-fg-mute">
                  {q.title}
                </dt>
                <dd className="mt-1 text-[15px] text-fg">
                  {opt ? opt.label : <span className="text-fg-mute">Skipped</span>}
                </dd>
              </div>
              <button
                type="button"
                onClick={() => onEdit(i)}
                className="shrink-0 text-sm text-accent transition-opacity hover:opacity-80"
              >
                Edit
              </button>
            </div>
          );
        })}
      </dl>
    </fieldset>
  );
}
