/**
 * Intake schema — the single source of truth for both the UI (what to render)
 * and the API (what to accept). Every accepted value is enumerated here, so the
 * server can validate answers against this whitelist before use.
 */

export type QuestionId =
  | "age"
  | "situation"
  | "level"
  | "hours"
  | "income"
  | "region"
  | "interest";

export interface Option {
  value: string;
  label: string;
  hint?: string;
}

export interface Question {
  id: QuestionId;
  title: string;
  help?: string;
  optional?: boolean;
  options: Option[];
}

export const INTAKE_QUESTIONS: Question[] = [
  {
    id: "age",
    title: "How old are you?",
    help: "This filters age-limited exams — nothing else. Arambha is for adults (18+).",
    options: [
      { value: "18-24", label: "18–24" },
      { value: "25-30", label: "25–30" },
      { value: "31-40", label: "31–40" },
      { value: "40+", label: "Over 40" },
    ],
  },
  {
    id: "situation",
    title: "Where are you starting from?",
    help: "Whatever happened, it happened. This just helps us start in the right place.",
    options: [
      { value: "left-school", label: "Left school early", hint: "Didn’t finish 10th or 12th" },
      { value: "dropped-out", label: "Dropped out of college", hint: "Started, didn’t finish" },
      { value: "grad-no-job", label: "Graduated, no job yet", hint: "Degree done, nothing moved" },
      { value: "homemaker", label: "Running a home, want to earn", hint: "Ready for income that fits" },
      { value: "working-stuck", label: "Working, but stuck", hint: "A job, but no way up" },
    ],
  },
  {
    id: "level",
    title: "Highest level you’ve completed?",
    help: "This decides which routes you’re eligible for — we never assume.",
    options: [
      { value: "below-10", label: "Below 10th" },
      { value: "10th", label: "Passed 10th" },
      { value: "12th", label: "Passed 12th" },
      { value: "diploma", label: "Diploma / ITI" },
      { value: "graduate", label: "Graduate" },
    ],
  },
  {
    id: "hours",
    title: "How much time can you give each week?",
    help: "Be honest — a real plan is built around your real hours, not ideal ones.",
    options: [
      { value: "few", label: "A few hours", hint: "Under 5 a week" },
      { value: "ten", label: "About 10 hours" },
      { value: "twenty", label: "About 20 hours" },
      { value: "fulltime", label: "Most of the day", hint: "40+ a week" },
    ],
  },
  {
    id: "income",
    title: "Do you need money coming in now?",
    help: "If yes, we put an earning path first and build the rest around it.",
    options: [
      { value: "urgent", label: "Yes — urgently" },
      { value: "soon", label: "Soon, within a few weeks" },
      { value: "building", label: "No — I can focus on building first" },
    ],
  },
  {
    id: "region",
    title: "Where are you based?",
    help: "Routes and exams differ by place. This keeps recommendations relevant.",
    options: [
      { value: "india", label: "India" },
      { value: "global", label: "Outside India" },
    ],
  },
  {
    id: "interest",
    title: "What pulls you most right now?",
    help: "Optional — a nudge, not a cage. You can skip this.",
    optional: true,
    options: [
      { value: "study", label: "Finishing my education" },
      { value: "skill", label: "Learning a paying skill" },
      { value: "job", label: "Getting a job" },
      { value: "ownwork", label: "Working for myself" },
      { value: "unsure", label: "Honestly, not sure yet" },
    ],
  },
];

export type Mode = "seeker" | "builder";

export interface IntakeAnswers {
  mode: Mode; // "seeker" = find work · "builder" = build & monetize own thing
  age: string;
  situation: string;
  level: string;
  hours: string;
  income: string;
  region: string;
  interest?: string;
}

/** Ordered education levels, low → high, for eligibility comparisons. */
export const LEVEL_ORDER = ["below-10", "10th", "12th", "diploma", "graduate"] as const;
export type Level = (typeof LEVEL_ORDER)[number];

/** Lower bound of each age band, used against a pathway's maxAge. */
export const AGE_MIN: Record<string, number> = {
  "18-24": 18,
  "25-30": 25,
  "31-40": 31,
  "40+": 40,
};

const values = (id: QuestionId): string[] =>
  INTAKE_QUESTIONS.find((q) => q.id === id)!.options.map((o) => o.value);

/**
 * Whitelist validation. Returns clean answers or null — never trusts the client.
 * Required questions must be present and in-set; `interest` is optional.
 */
export function validateAnswers(input: unknown): IntakeAnswers | null {
  if (!input || typeof input !== "object") return null;
  const raw = input as Record<string, unknown>;

  const required: QuestionId[] = ["age", "situation", "level", "hours", "income", "region"];
  const clean: Record<string, string> = {};

  for (const id of required) {
    const v = raw[id];
    if (typeof v !== "string" || !values(id).includes(v)) return null;
    clean[id] = v;
  }

  if (raw.interest !== undefined) {
    if (typeof raw.interest !== "string" || !values("interest").includes(raw.interest)) {
      return null;
    }
    clean.interest = raw.interest;
  }

  // Mode is optional on the wire; defaults to seeker until the UI toggle lands.
  clean.mode = raw.mode === "builder" ? "builder" : "seeker";

  return clean as unknown as IntakeAnswers;
}
