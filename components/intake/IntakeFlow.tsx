"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  INTAKE_QUESTIONS,
  type IntakeAnswers,
  type Mode,
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
  const [mode, setMode] = useState<Mode | null>(null);
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
    if (stepIndex === 0) {
      setMode(null); // back out to the track chooser
      return;
    }
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
        body: JSON.stringify({ ...answers, mode: mode ?? "seeker" }),
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
    setMode(null);
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
              {mode === null
                ? "Choose a track"
                : onReview
                  ? "Review"
                  : `Step ${stepIndex + 1} of ${TOTAL_STEPS}`}
            </p>
          )}
          <Link href="/" className="text-sm text-fg-mute transition-colors hover:text-fg">
            Exit
          </Link>
        </div>
        {phase === "form" && mode !== null && (
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
        {phase === "submitting" && <Submitting mode={mode ?? "seeker"} />}

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

        {phase === "form" && mode === null && (
          <ModeSelect
            onChoose={(m) => {
              setMode(m);
              setStepIndex(0);
            }}
          />
        )}

        {phase === "form" && mode !== null && (
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
                <Button type="button" onClick={goBack} variant="ghost" size="lg">
                  ← Back
                </Button>
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

function ModeSelect({ onChoose }: { onChoose: (mode: Mode) => void }) {
  const options: { mode: Mode; title: string; body: string; tag: string }[] = [
    {
      mode: "seeker",
      tag: "Find work",
      title: "A way to earn or work",
      body: "Jobs, a paying skill, a public exam, study, or small work — grounded in real, current options and matched to where you are.",
    },
    {
      mode: "builder",
      tag: "Build my own",
      title: "Something of my own to build",
      body: "A small business, service, or online venture you can start lean and monetize — fitted to your situation, with real demand and first steps.",
    },
  ];

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-display-md text-fg">What are you here for?</h1>
      <p className="mt-3 text-sm leading-relaxed text-fg-mute">
        Pick a track. You can switch anytime — both build you a grounded 90-day roadmap.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {options.map((o) => (
          <button
            key={o.mode}
            type="button"
            onClick={() => onChoose(o.mode)}
            className="card group flex flex-col p-6 text-left transition-all hover:border-fg-mute/40 hover:bg-surface-2"
          >
            <span className="font-mono text-[11px] uppercase tracking-widest text-accent">{o.tag}</span>
            <h2 className="mt-3 font-display text-xl text-fg">{o.title}</h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-fg-mute">{o.body}</p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-fg">
              Choose this
              <span aria-hidden className="text-accent transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Submitting({ mode }: { mode: Mode }) {
  // Staged progress mirroring the real pipeline: query → search → extract →
  // ground → synthesize. Advanced on a timer (the backend doesn't stream), and
  // the last stage holds until the response lands.
  const stages = [
    "Understanding where you are",
    mode === "builder"
      ? "Searching for real demand and what people pay for"
      : "Searching the web for real, current options",
    "Reading and verifying the sources",
    "Grounding your three paths",
    "Writing your 90-day plan",
  ];
  const [active, setActive] = useState(0);

  useEffect(() => {
    const marks = [1600, 5000, 10000, 14000]; // advance to stage 1..4
    const timers = marks.map((ms, i) => setTimeout(() => setActive(i + 1), ms));
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="mx-auto max-w-md py-10" role="status" aria-live="polite">
      <p className="eyebrow">
        <span className="h-1.5 w-1.5 rounded-full bg-accent" />
        Researching live
      </p>
      <h1 className="mt-5 text-display-md text-fg">Building your roadmap.</h1>
      <p className="mt-3 text-sm leading-relaxed text-fg-mute">
        We’re reading real sources for this — not guessing. It takes a few seconds.
      </p>

      <ul className="mt-8 space-y-4">
        {stages.map((label, i) => {
          const done = i < active;
          const current = i === active;
          return (
            <li key={label} className="flex items-center gap-3">
              <span
                aria-hidden
                className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border transition-colors ${
                  done
                    ? "border-accent bg-accent text-bg"
                    : current
                      ? "border-accent text-accent"
                      : "border-line text-fg-mute"
                }`}
              >
                {done ? (
                  <svg width="12" height="12" viewBox="0 0 14 14">
                    <path
                      d="M2 7.5L5.5 11L12 3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : current ? (
                  <span className="h-2 w-2 animate-ping rounded-full bg-accent" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                )}
              </span>
              <span
                className={`text-sm transition-colors ${
                  done ? "text-fg-dim" : current ? "text-fg" : "text-fg-mute"
                }`}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ul>
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
