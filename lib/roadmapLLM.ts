/**
 * The request-time LLM layer — "constrained select + personalize".
 *
 * It may ONLY choose pathway ids from the eligible shortlist and write copy; it
 * cannot invent pathways, courses, prices or exam names. Anything it returns is
 * validated against the shortlist, and ANY problem (bad id, bad JSON, provider
 * failure) makes this return null so the caller keeps the deterministic roadmap.
 * The grounded firstSteps and the scam-warning text are never touched by the LLM.
 */

import { INTAKE_QUESTIONS, type IntakeAnswers } from "@/lib/intake";
import { assembleRoadmap, eligiblePathways, type Roadmap } from "@/lib/composeRoadmap";
import { generate, llmAvailable } from "@/lib/llm";
import type { Pathway } from "@/lib/pathways";

export { llmAvailable };

function describeAnswers(a: IntakeAnswers): string {
  return INTAKE_QUESTIONS.map((q) => {
    const opt = q.options.find((o) => o.value === a[q.id]);
    return opt ? `- ${q.title} ${opt.label}` : null;
  })
    .filter(Boolean)
    .join("\n");
}

function shortlistLines(pool: Pathway[]): string {
  return pool
    .map(
      (p) =>
        `- id:${p.id} | ${p.kind} | pays:${p.cashflow} | ~${p.hoursPerWeek}h/wk | ${p.title} — ${p.summary}`,
    )
    .join("\n");
}

const SYSTEM = `You are Arambha's roadmap personaliser, helping an adult (22–40) restart after years of being stuck.
Rules you must not break:
- Choose ONLY from the provided pathway ids. Never invent a pathway, course, price, provider, or exam name.
- Pick exactly THREE that fit this person best, ordered: first to earn from soonest, second to build a skill/qualification, third to grow into.
- Tone: respectful and hopeful, never pitying, never "results-day". Do not assume free time or family support.
Return ONLY a JSON object, no prose around it:
{"pathIds":["id","id","id"],"summaryLine":"one warm sentence","cashflowTip":"one sentence on funding the restart","why":{"id":"one short reason this fits THEM"}}`;

interface LLMChoice {
  pathIds: string[];
  summaryLine?: string;
  cashflowTip?: string;
  why?: Record<string, string>;
}

function parse(text: string): LLMChoice | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    const obj = JSON.parse(text.slice(start, end + 1));
    if (!obj || !Array.isArray(obj.pathIds)) return null;
    return obj as LLMChoice;
  } catch {
    return null;
  }
}

/** Returns a personalised, still-grounded roadmap, or null to use the fallback. */
export async function enhanceRoadmap(a: IntakeAnswers): Promise<Roadmap | null> {
  const eligible = eligiblePathways(a);
  if (eligible.length < 3) return null; // let the deterministic backfill handle thin cases

  const byId = new Map(eligible.map((p) => [p.id, p]));

  let result;
  try {
    result = await generate({
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content: `This person:\n${describeAnswers(a)}\n\nEligible pathways (choose 3 ids from here only):\n${shortlistLines(
            eligible,
          )}`,
        },
      ],
    });
  } catch {
    return null; // every provider failed — fall back
  }

  const choice = parse(result.text);
  if (!choice) return null;

  // GROUNDING: every id must be a distinct, eligible pathway.
  const ids = choice.pathIds.slice(0, 3);
  if (ids.length !== 3 || new Set(ids).size !== 3) return null;
  const ordered: Pathway[] = [];
  for (const id of ids) {
    const p = byId.get(id);
    if (!p) return null; // hallucinated / ineligible id → reject the whole result
    ordered.push(p);
  }

  return assembleRoadmap(ordered, a, eligible.length, {
    summaryLine: choice.summaryLine?.trim() || undefined,
    cashflowTip: choice.cashflowTip?.trim() || undefined,
    whyById: choice.why,
  });
}
