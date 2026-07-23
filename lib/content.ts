/**
 * Landing content for Arambha, kept as data so copy stays editable without
 * touching layout. Tone rule (see CLAUDE.md): the reader is a 22–40 adult
 * restarting after years stuck — respectful and hopeful, never pitying,
 * never "results-day" framing. English-only, written for a global audience.
 */

export const nav = {
  brand: "Arambha",
  links: [
    { label: "How it works", href: "#how" },
    { label: "Paths", href: "#paths" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ],
  cta: { label: "Build my roadmap", href: "/start" },
} as const;

export const hero = {
  kicker: "The restart engine",
  titleLead: "Start again —",
  titleRest: "from exactly where you are.",
  // The word rendered in the accent gradient.
  accentWord: "again",
  body: "Arambha builds a 90-day roadmap of three real paths — study, a skill, a public exam, a job, or your own small work — grounded only in options that actually exist. No false promises. No wishful advice.",
  primary: { label: "Build my roadmap", href: "/start" },
  secondary: { label: "See how it works", href: "#how" },
  reassurance: [
    "No sign-up to start",
    "No fee to see your paths",
    "Grounded in real options",
  ],
} as const;

export const valueStrip = [
  "Grounded, not guessed",
  "Scam-aware by default",
  "No account needed",
  "Honest about money",
] as const;

export const stats = [
  { k: "18–40", l: "built for adult restarters, not teenagers" },
  { k: "6", l: "route types: study, skill, exam, job, part-time, own work" },
  { k: "0", l: "invented recommendations — everything is verified" },
] as const;

export const forWhom = {
  kicker: "Who this is for",
  title: "For people the system quietly wrote off.",
  intro:
    "Not results day. Not a fresh graduate with time to spare. If life stalled years ago and you have been carrying it since — this was built for you.",
  personas: [
    {
      tag: "01",
      title: "Left school early — years ago",
      body: "You never went back, and the gap kept growing. There is still a way forward that counts.",
    },
    {
      tag: "02",
      title: "Dropped out and stayed stuck",
      body: "College or school ended early. The plan to restart never had a shape. Now it does.",
    },
    {
      tag: "03",
      title: "Graduated, still no job",
      body: "The degree is on paper and nothing moved. We map skill and exam paths that actually hire.",
    },
    {
      tag: "04",
      title: "Running a home, ready to earn",
      body: "You want income that fits a full house and real hours — part-time, remote, or your own.",
    },
  ],
} as const;

export const howItWorks = {
  kicker: "How it works",
  title: "Three steps. About ten honest minutes.",
  steps: [
    {
      n: "01",
      title: "Tell us where you are",
      body: "A short, plain intake — your age band, what happened, how many hours a week you can give, and whether you need money coming in now.",
    },
    {
      n: "02",
      title: "We ground three real paths",
      body: "Every option is pulled from a verified library — study, skill, public exam, job, part-time, or your own small work. Nothing is invented to sound good.",
    },
    {
      n: "03",
      title: "Get your 90-day roadmap",
      body: "Week by week: what to do first, what it costs, what to expect — and a cashflow path so you can fund the restart while you do it.",
    },
  ],
} as const;

export const paths = {
  kicker: "The paths",
  title: "Every route a stuck adult actually has — not just “go study more.”",
  intro:
    "Your roadmap draws from all of these. Most people get a mix: one path to build toward, one to earn from now.",
  items: [
    { label: "Finish your education", note: "Open school, distance degree, equivalency — the routes that still count." },
    { label: "Learn a paying skill", note: "Short, employable skills with real demand — not a certificate wall." },
    { label: "Public & government exams", note: "Filtered to exams you are still eligible for by age and qualification." },
    { label: "Get a job now", note: "Roles that hire your profile today, with the scam-fee warning built in." },
    { label: "Part-time & remote", note: "Income that fits a household and unpredictable hours." },
    { label: "Your own small work", note: "Solo work or a small business you can start lean, from home." },
  ],
} as const;

export const trust = {
  kicker: "Our promise",
  title: "We will never tell you to pay a “registration fee.”",
  body: "The internet is full of people selling stuck adults a course, a placement, a shortcut. Arambha is the opposite of that.",
  points: [
    {
      title: "Grounded, not guessed",
      body: "Recommendations come only from a verified library. If a course or exam is not real, the system cannot suggest it.",
    },
    {
      title: "Scam-aware by default",
      body: "Every job-type path carries the same warning: a genuine job never asks you to pay to be hired.",
    },
    {
      title: "Honest about money",
      body: "We tell you what each path costs and how to fund it — before you commit anything.",
    },
  ],
} as const;

export const pricing = {
  kicker: "Honest pricing",
  title: "Your roadmap is free. The full report is a one-time unlock.",
  free: {
    label: "The roadmap",
    price: "Free",
    sub: "No sign-up to see it",
    features: [
      "Your three grounded paths",
      "A 90-day, week-by-week outline",
      "The right-now cashflow suggestion",
      "Scam warnings on every job path",
    ],
    cta: { label: "Build my roadmap", href: "/start" },
  },
  paid: {
    label: "The full report",
    price: "₹199",
    sub: "One-time · no subscription",
    features: [
      "Everything in the free roadmap",
      "Step-by-step actions for each week",
      "Direct links to real courses & exams",
      "A saved copy you can return to",
    ],
    cta: { label: "See a sample report", href: "/start" },
  },
  footnote:
    "One payment. No auto-renewal, no hidden charges. Pay only if the roadmap is worth keeping.",
} as const;

export const faq = {
  kicker: "Straight answers",
  title: "The questions people actually ask.",
  items: [
    {
      q: "I have been out of studying for 8 years. Is this really for me?",
      a: "Yes — that is exactly who it is built for. Nothing here assumes recent study, free time, or family support. It starts from where you are today.",
    },
    {
      q: "Is this just another site selling courses?",
      a: "No. Arambha does not sell you courses and earns nothing from where you go. Paths come from a verified library, and every option is grounded in something real.",
    },
    {
      q: "Do I have to pay to use it?",
      a: "No. The full roadmap and your three paths are free, with no sign-up. The optional report adds week-by-week actions and direct links — one time, no subscription.",
    },
    {
      q: "I’m not in India — can I still use this?",
      a: "Yes. Arambha maps the kinds of routes that exist almost everywhere — finishing school, a paying skill, a public-service exam, a job, part-time work, or your own small venture. The specifics adapt to where you are.",
    },
  ],
} as const;

export const finalCta = {
  kicker: "Ten minutes from here",
  title: "Your restart can have a date. Let it be today.",
  body: "Ten honest minutes. Three real paths. A plan that assumes you are an adult with a life to run.",
  cta: { label: "Build my roadmap", href: "/start" },
} as const;

export const footer = {
  tagline: "A 90-day restart engine for adults who got stuck — grounded, honest, on your terms.",
  columns: [
    {
      title: "Product",
      links: [
        { label: "How it works", href: "#how" },
        { label: "Paths", href: "#paths" },
        { label: "Pricing", href: "#pricing" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy", href: "/privacy" },
        { label: "Terms", href: "/terms" },
        { label: "Refunds", href: "/refunds" },
      ],
    },
  ],
  parent: { label: "A Vivek AI Group company", href: "#" },
} as const;
