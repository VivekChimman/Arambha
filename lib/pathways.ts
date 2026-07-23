/**
 * ┌───────────────────────────────────────────────────────────────────────────┐
 * │  STARTER DATA — NOT LAUNCH-READY. VIVEK MUST VERIFY BEFORE GOING LIVE.       │
 * │                                                                             │
 * │  These are deliberately CATEGORY-LEVEL routes (no invented vendor courses,   │
 * │  fake prices, or specific exam names) so nothing here is a false claim.      │
 * │  The product rule (CLAUDE.md) is that recommendations may ONLY come from     │
 * │  this file, and every entry must be real and verified. Replace / expand      │
 * │  with vetted, sourced pathways before launch. Do not let the AI layer, when  │
 * │  it lands, return any id that is not present here (the grounding check).     │
 * └───────────────────────────────────────────────────────────────────────────┘
 */

import type { Level } from "@/lib/intake";

export type PathwayKind = "study" | "skill" | "exam" | "job" | "parttime" | "ownwork";

/** How soon a path can realistically produce income. */
export type Cashflow = "now" | "weeks" | "later";

export interface Pathway {
  id: string;
  kind: PathwayKind;
  title: string;
  summary: string;
  regions: ("india" | "global")[];
  minLevel?: Level; // minimum education level required (omit = none)
  maxLevel?: Level; // highest level this still makes sense for (omit = no ceiling)
  maxAge?: number; // hard age ceiling (used for age-limited exams)
  hoursPerWeek: number; // typical realistic commitment
  cashflow: Cashflow;
  cost: "free" | "low" | "moderate";
  scamWarning?: boolean; // job-type paths carry the "never pay to be hired" warning
  firstSteps: string[]; // 2–4 concrete first actions
}

export const PATHWAYS: Pathway[] = [
  // ── Study ──────────────────────────────────────────────────────────────────
  {
    id: "open-schooling",
    kind: "study",
    title: "Finish 10th / 12th through open schooling",
    summary:
      "Complete the schooling you missed at your own pace, with a certificate that counts for jobs and further study.",
    regions: ["india", "global"],
    maxLevel: "10th", // only relevant to those who haven't passed 12th yet
    hoursPerWeek: 8,
    cashflow: "later",
    cost: "low",
    firstSteps: [
      "Find your region’s open-schooling board and the next enrolment window",
      "Pick the subjects that keep the most doors open",
      "Set a fixed 1-hour study slot on the days you can protect",
    ],
  },
  {
    id: "distance-degree",
    kind: "study",
    title: "A recognised distance / online degree",
    summary:
      "Earn a graduate qualification without leaving work or home, from an accredited distance programme.",
    regions: ["india", "global"],
    minLevel: "12th",
    hoursPerWeek: 10,
    cashflow: "later",
    cost: "moderate",
    firstSteps: [
      "Shortlist accredited programmes (check the accreditation, not the ads)",
      "Compare total cost and exam schedule against your hours",
      "Talk to one current student before you enrol",
    ],
  },

  // ── Skill ──────────────────────────────────────────────────────────────────
  {
    id: "digital-basics",
    kind: "skill",
    title: "Core digital skills for office & remote work",
    summary:
      "Spreadsheets, documents, email and basic data work — the baseline that unlocks entry-level office and remote roles.",
    regions: ["india", "global"],
    minLevel: "10th",
    hoursPerWeek: 8,
    cashflow: "weeks",
    cost: "free",
    firstSteps: [
      "Learn spreadsheets first — it’s the highest-leverage skill",
      "Practise on a real task (a budget, a simple tracker)",
      "Build one small sample you can show an employer",
    ],
  },
  {
    id: "skilled-trade",
    kind: "skill",
    title: "A hands-on trade",
    summary:
      "A practical trade — electrical, tailoring, beauty, mobile/appliance repair — that pays from local demand.",
    regions: ["india", "global"],
    hoursPerWeek: 12,
    cashflow: "weeks",
    cost: "low",
    firstSteps: [
      "Pick a trade with steady demand where you live",
      "Find a short certified course or a paid apprenticeship",
      "Do three practice jobs for friends before charging",
    ],
  },
  {
    id: "spoken-english",
    kind: "skill",
    title: "Workplace English & communication",
    summary:
      "The confidence to speak, write and interview in English — a multiplier on almost every other path.",
    regions: ["india", "global"],
    hoursPerWeek: 6,
    cashflow: "later",
    cost: "free",
    firstSteps: [
      "Speak 10 minutes a day out loud, even alone",
      "Learn the 100 words your target job actually uses",
      "Practise one mock interview a week",
    ],
  },

  // ── Exam ───────────────────────────────────────────────────────────────────
  {
    id: "public-service-exam",
    kind: "exam",
    title: "Public-service / government exams you’re still eligible for",
    summary:
      "Stable public-sector roles via competitive exams — filtered to the ones your age and qualification still allow.",
    regions: ["india"],
    minLevel: "12th",
    maxAge: 35,
    hoursPerWeek: 15,
    cashflow: "later",
    cost: "low",
    firstSteps: [
      "List exams you’re still eligible for by age and qualification",
      "Download the official syllabus — study only that",
      "Attempt one past paper this week to set a baseline",
    ],
  },
  {
    id: "uniformed-services",
    kind: "exam",
    title: "Uniformed & frontline government recruitment",
    summary:
      "Police, defence and allied recruitment with physical and written stages — age-bound, so timing matters.",
    regions: ["india"],
    minLevel: "10th",
    maxAge: 28,
    hoursPerWeek: 12,
    cashflow: "later",
    cost: "low",
    firstSteps: [
      "Confirm the age window before anything else",
      "Start the physical standard now — it takes months",
      "Follow only the official recruitment board for dates",
    ],
  },

  // ── Job (carry scam warning) ─────────────────────────────────────────────────
  {
    id: "frontline-job",
    kind: "job",
    title: "Entry roles hiring right now",
    summary:
      "Retail, delivery, warehouse and front-desk roles that hire on attitude and availability — income this month.",
    regions: ["india", "global"],
    hoursPerWeek: 40,
    cashflow: "now",
    cost: "free",
    scamWarning: true,
    firstSteps: [
      "Apply to five local openings this week",
      "Keep a one-page list of where you applied and when",
      "Never pay a ‘registration’ or ‘training’ fee to get hired",
    ],
  },
  {
    id: "support-backoffice-job",
    kind: "job",
    title: "Customer-support & back-office roles",
    summary:
      "Support, data and back-office jobs that value clear communication over a degree — many now remote.",
    regions: ["india", "global"],
    minLevel: "12th",
    hoursPerWeek: 40,
    cashflow: "now",
    cost: "free",
    scamWarning: true,
    firstSteps: [
      "Polish a simple one-page CV focused on reliability",
      "Apply to remote and local support roles both",
      "A real employer pays you — never the other way round",
    ],
  },

  // ── Part-time / remote (carry scam warning) ──────────────────────────────────
  {
    id: "parttime-remote",
    kind: "parttime",
    title: "Part-time & remote micro-work",
    summary:
      "Flexible remote work — data entry, moderation, virtual assistance — that fits around a household.",
    regions: ["india", "global"],
    minLevel: "10th",
    hoursPerWeek: 15,
    cashflow: "now",
    cost: "free",
    scamWarning: true,
    firstSteps: [
      "Set up on one reputable platform, complete the profile fully",
      "Start with small tasks to build a rating",
      "Ignore anything that asks you to pay to start",
    ],
  },

  // ── Own work ─────────────────────────────────────────────────────────────────
  {
    id: "local-service",
    kind: "ownwork",
    title: "A small local service of your own",
    summary:
      "Something you run yourself — tiffin, tutoring, home repairs, reselling — started lean, from home.",
    regions: ["india", "global"],
    hoursPerWeek: 15,
    cashflow: "weeks",
    cost: "low",
    firstSteps: [
      "Pick one service you can deliver well today",
      "Get your first three paying customers by word of mouth",
      "Reinvest the first earnings, don’t borrow to start",
    ],
  },
  {
    id: "online-selling",
    kind: "ownwork",
    title: "Selling online",
    summary:
      "Reselling, handmade goods or print-on-demand through online marketplaces — low upfront cost, real reach.",
    regions: ["india", "global"],
    minLevel: "10th",
    hoursPerWeek: 12,
    cashflow: "weeks",
    cost: "low",
    firstSteps: [
      "Choose one product and one marketplace to start",
      "List five items with clear photos and honest prices",
      "Handle one order end-to-end before scaling up",
    ],
  },
];

/** Fast lookup by id — used by the grounding check. */
export const PATHWAY_IDS = new Set(PATHWAYS.map((p) => p.id));
