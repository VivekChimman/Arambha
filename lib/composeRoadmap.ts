/**
 * Deterministic roadmap composer — the always-available fallback path.
 *
 * Given validated intake answers, it shortlists ELIGIBLE pathways from
 * lib/pathways.ts (the only source), then picks a mix of three — one to earn
 * from, one to build, one to grow into — and lays them across 90 days.
 *
 * This never calls a network or an LLM, so it never fails the user. When the AI
 * layer lands it will re-rank/rewrite on top of this, but the grounding check
 * still forces every returned id to exist in the eligible shortlist.
 */

import { AGE_MIN, LEVEL_ORDER, type IntakeAnswers } from "@/lib/intake";
import { PATHWAYS, type Cashflow, type Pathway, type PathwayKind } from "@/lib/pathways";

const KIND_LABEL: Record<PathwayKind, string> = {
  study: "Study",
  skill: "Skill",
  exam: "Exam",
  job: "Job",
  parttime: "Part-time",
  ownwork: "Own work",
};

const HOURS_NUM: Record<string, number> = { few: 4, ten: 10, twenty: 20, fulltime: 45 };
const CASHFLOW_RANK: Record<Cashflow, number> = { now: 0, weeks: 1, later: 2 };

const INTEREST_KINDS: Record<string, PathwayKind[]> = {
  study: ["study"],
  skill: ["skill"],
  job: ["job", "parttime"],
  ownwork: ["ownwork"],
  unsure: [],
};

const SITUATION_BOOST: Record<string, PathwayKind[]> = {
  "left-school": ["study", "skill", "job"],
  "dropped-out": ["skill", "study", "ownwork"],
  "grad-no-job": ["skill", "job", "exam"],
  homemaker: ["parttime", "ownwork", "skill"],
  "working-stuck": ["skill", "study", "exam"],
};

export interface ChosenPath {
  kindLabel: string; // display tag: "Job" | "Skill" | "Exam" | "Business" | ...
  title: string;
  summary: string;
  why?: string; // why it fits THEM (LLM layers)
  role: "Earn" | "Build" | "Grow";
  scamWarning: boolean;
  // Deterministic-only (pathways.ts):
  id?: string;
  kind?: PathwayKind;
  // Researched-only (deep-research engine):
  cost?: string;
  eligibility?: string;
  sourceUrl?: string;
  firstSteps?: string[];
}

export interface RoadmapSource {
  title: string;
  url: string;
}

export interface Phase {
  weeks: string;
  role: "Earn" | "Build" | "Grow";
  pathTitle: string;
  actions: string[];
}

export interface Roadmap {
  summaryLine: string;
  paths: ChosenPath[];
  phases: Phase[];
  cashflowTip: string;
  warnings: string[];
  groundedFrom: number; // deterministic: eligible-shortlist size · researched: sources used
  researched?: boolean; // true when produced by the deep-research engine
  sources?: RoadmapSource[]; // citations (researched only)
  modelId?: string; // which selected model produced it
}

/** Pathways this person is actually eligible for — the grounding source of truth. */
export function eligiblePathways(a: IntakeAnswers): Pathway[] {
  const userLevel = LEVEL_ORDER.indexOf(a.level as (typeof LEVEL_ORDER)[number]);
  const ageMin = AGE_MIN[a.age] ?? 18;

  return PATHWAYS.filter((p) => {
    if (!p.regions.includes(a.region as "india" | "global")) return false;
    if (p.minLevel && userLevel < LEVEL_ORDER.indexOf(p.minLevel)) return false;
    if (p.maxLevel && userLevel > LEVEL_ORDER.indexOf(p.maxLevel)) return false;
    if (p.maxAge !== undefined && ageMin > p.maxAge) return false;
    return true;
  });
}

function score(p: Pathway, a: IntakeAnswers): number {
  let s = 0;
  const userHours = HOURS_NUM[a.hours] ?? 10;

  // Feasibility: reward paths that fit inside the hours they have.
  if (p.hoursPerWeek <= userHours) s += 6;
  else s -= Math.min(6, p.hoursPerWeek - userHours);

  // Income urgency vs how soon a path pays.
  if (a.income === "urgent") s += (2 - CASHFLOW_RANK[p.cashflow]) * 4;
  else if (a.income === "building") s += CASHFLOW_RANK[p.cashflow] * 2;

  // Stated interest.
  if (a.interest && INTEREST_KINDS[a.interest]?.includes(p.kind)) s += 8;

  // Situation nudge (earlier kinds weighted higher).
  const boost = SITUATION_BOOST[a.situation] ?? [];
  const bi = boost.indexOf(p.kind);
  if (bi >= 0) s += 5 - bi;

  return s;
}

/** Deterministic pick: highest score, ties broken by id for stable output. */
function best(pool: Pathway[], a: IntakeAnswers): Pathway | undefined {
  return [...pool].sort((x, y) => score(y, a) - score(x, a) || x.id.localeCompare(y.id))[0];
}

export function composeRoadmap(a: IntakeAnswers): Roadmap {
  const eligible = eligiblePathways(a);
  const used = new Set<string>();
  const take = (p?: Pathway) => {
    if (p) used.add(p.id);
    return p;
  };
  const remaining = () => eligible.filter((p) => !used.has(p.id));

  // Three roles: something to earn from, something to build, something to grow into.
  // When income is urgent, the earn slot must be a genuine pay-now path if one exists,
  // so an interesting-but-slow skill can't masquerade as immediate income.
  const nowPool = remaining().filter((p) => p.cashflow === "now");
  const earnPool =
    a.income === "urgent" && nowPool.length > 0
      ? nowPool
      : remaining().filter((p) => p.cashflow !== "later");
  const earn = take(best(earnPool, a));
  const build = take(best(remaining().filter((p) => p.kind === "skill" || p.kind === "study"), a));
  const grow = take(
    best(remaining().filter((p) => ["exam", "ownwork", "study"].includes(p.kind)), a),
  );

  // Backfill any empty slot from whatever eligible pathways are left.
  const chosen = [earn, build, grow].filter(Boolean) as Pathway[];
  while (chosen.length < 3) {
    const next = take(best(remaining(), a));
    if (!next) break;
    chosen.push(next);
  }

  // Order by how fast each pays, then hand off to the shared assembler.
  const ordered = [...chosen].sort((x, y) => CASHFLOW_RANK[x.cashflow] - CASHFLOW_RANK[y.cashflow]);
  return assembleRoadmap(ordered, a, eligible.length);
}

const ROLES: Array<"Earn" | "Build" | "Grow"> = ["Earn", "Build", "Grow"];
const WINDOWS = ["Weeks 1–2", "Weeks 3–8", "Weeks 9–13"];

const SCAM_WARNING =
  "A genuine job or platform never asks you to pay a registration, training, or placement fee. If it does, walk away.";

/**
 * Turns an ordered list of chosen pathways into a Roadmap. Shared by the
 * deterministic composer and the LLM layer so both produce an identical shape.
 * `overrides` lets the LLM supply personalised prose; the scam warning text and
 * the grounded firstSteps are NEVER overridable — those are safety-critical.
 */
export function assembleRoadmap(
  ordered: Pathway[],
  a: IntakeAnswers,
  groundedFrom: number,
  overrides?: { summaryLine?: string; cashflowTip?: string; whyById?: Record<string, string> },
): Roadmap {
  const paths: ChosenPath[] = ordered.map((p, i) => ({
    id: p.id,
    kind: p.kind,
    kindLabel: KIND_LABEL[p.kind],
    title: p.title,
    summary: p.summary,
    why: overrides?.whyById?.[p.id],
    role: ROLES[i] ?? "Grow",
    scamWarning: Boolean(p.scamWarning),
  }));

  const phases: Phase[] = ordered.map((p, i) => ({
    weeks: WINDOWS[i] ?? "Ongoing",
    role: ROLES[i] ?? "Grow",
    pathTitle: p.title,
    actions: p.firstSteps,
  }));

  const earnPath = ordered[0];
  const cashflowTip =
    overrides?.cashflowTip ??
    (a.income === "urgent"
      ? `Start with “${earnPath.title}” — it can bring money in the soonest while the rest builds.`
      : `You don’t need to earn immediately, so “${earnPath.title}” stays a steady base while you build the other two.`);

  return {
    summaryLine: overrides?.summaryLine ?? summarise(a, ordered),
    paths,
    phases,
    cashflowTip,
    warnings: ordered.some((p) => p.scamWarning) ? [SCAM_WARNING] : [],
    groundedFrom,
  };
}

function summarise(a: IntakeAnswers, chosen: Pathway[]): string {
  const kinds = chosen.map((p) => KIND_LABEL[p.kind].toLowerCase());
  const mix = kinds.slice(0, 3).join(", ").replace(/, ([^,]*)$/, " and $1");
  const urgency =
    a.income === "urgent"
      ? "money coming in first"
      : a.income === "building"
        ? "room to build"
        : "a steady base";
  return `Three grounded paths — ${mix} — sequenced over 90 days, with ${urgency}.`;
}
