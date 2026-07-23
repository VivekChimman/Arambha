import { INTAKE_QUESTIONS, type IntakeAnswers, type QuestionId } from "@/lib/intake";
import { RESEARCH } from "@/lib/config";
import type { ResearchInput } from "@/lib/research";

/** Human label for a chosen option value. */
function label(id: QuestionId, value: string | undefined): string {
  if (!value) return "";
  const q = INTAKE_QUESTIONS.find((x) => x.id === id);
  return q?.options.find((o) => o.value === value)?.label ?? value;
}

const YEAR = new Date().getFullYear();

/**
 * Build the search plan from intake + mode. Queries are phrased the way a person
 * actually searches, tuned by situation / level / urgency / region so retrieval
 * surfaces specific, current, local options — the raw material the prompt grounds on.
 */
export function buildResearchPlan(a: IntakeAnswers): ResearchInput {
  const region = a.region === "india" ? "India" : "";
  const place = region || "online remote"; // global → lean on remote/online
  const country = a.region === "india" ? "india" : undefined;
  const level = label("level", a.level);
  const situation = label("situation", a.situation).toLowerCase();

  const queries =
    a.mode === "builder" ? builderQueries(a, place) : seekerQueries(a, place, level, situation);

  return {
    queries: queries.filter(Boolean).slice(0, RESEARCH.maxQueries),
    country,
  };
}

function seekerQueries(a: IntakeAnswers, place: string, level: string, situation: string): string[] {
  const urgent = a.income === "urgent";
  const q: string[] = [];

  // Earn now — weighted first when income is urgent.
  q.push(
    urgent
      ? `jobs hiring now no experience ${level} in ${place} ${YEAR}`
      : `entry level jobs for ${level} in ${place} ${YEAR}`,
  );

  // Build a paying skill.
  q.push(`short skill courses that lead to jobs for ${level} in ${place} ${YEAR}`);

  // Grow — exams / education, gated by level and region.
  if (a.region === "india") {
    q.push(`government exams eligible after ${level} in ${place} ${YEAR}`);
  }
  if (["below-10", "10th"].includes(a.level)) {
    q.push(`open schooling finish 10th 12th admission ${place} ${YEAR}`);
  }

  // Situation-specific angle.
  if (a.situation === "homemaker") {
    q.push(`legit work from home earning options for homemakers in ${place} ${YEAR}`);
  } else if (a.situation === "grad-no-job") {
    q.push(`jobs for unemployed graduates skills in demand ${place} ${YEAR}`);
  } else {
    q.push(`part time and remote work options in ${place} ${YEAR}`);
  }

  // Interest override, if given.
  if (a.interest === "study") q.push(`distance and online degree options ${place} ${YEAR}`);
  if (a.interest === "ownwork") q.push(`small business ideas low investment ${place} ${YEAR}`);

  return q;
}

function builderQueries(a: IntakeAnswers, place: string): string[] {
  const q: string[] = [
    `profitable small business ideas low investment ${place} ${YEAR}`,
    `in demand services people pay for ${place} ${YEAR}`,
    `online business ideas to start with no money ${place} ${YEAR}`,
    `how to get first paying customers small business ${place}`,
  ];
  if (a.situation === "homemaker") {
    q.push(`home based business ideas for homemakers ${place} ${YEAR}`);
  }
  if (a.interest === "skill") q.push(`freelance skills in high demand ${place} ${YEAR}`);
  return q;
}
