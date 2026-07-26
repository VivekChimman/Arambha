import type { Roadmap } from "@/lib/composeRoadmap";
import { generate, llmAvailable } from "@/lib/llm";
import type { ChatMessage } from "@/lib/llm/types";
import { chatSystemPrompt, OFF_TOPIC_REPLY } from "@/lib/chat/prompt";

/**
 * One chat turn, scoped to a saved report. No web research runs here.
 *
 * The guardrail is enforced TWICE: the prompt tells the model to refuse off-topic
 * questions, and this code checks the reply it actually produced. Trusting the
 * prompt alone would leave a general-purpose chatbot on our LLM bill, and would
 * make the refusal unverifiable from our side.
 */

export interface ChatTurn {
  reply: string;
  refused: boolean;
  degraded: boolean; // true when the LLM was unavailable or unusable
}

const UNAVAILABLE =
  "I can’t answer follow-ups right now. Your roadmap above is still complete — please try again in a little while.";

/** Same tolerant extraction the roadmap engine uses (models like to add prose). */
function parseJson(text: string): Record<string, unknown> | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    const obj = JSON.parse(text.slice(start, end + 1));
    return obj && typeof obj === "object" ? (obj as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/** Every url in the reply must already be cited by the report. */
function citesOnlyKnownUrls(reply: string, roadmap: Roadmap): boolean {
  const known = new Set<string>();
  for (const s of roadmap.sources ?? []) known.add(s.url);
  for (const p of roadmap.paths) if (p.sourceUrl) known.add(p.sourceUrl);

  const found = reply.match(/https?:\/\/[^\s)<>"']+/g) ?? [];
  return found.every((url) => {
    const clean = url.replace(/[.,;:]+$/, "");
    return [...known].some((k) => k.startsWith(clean) || clean.startsWith(k));
  });
}

export async function chatTurn(params: {
  roadmap: Roadmap;
  history: ChatMessage[]; // prior turns, oldest first
  message: string;
}): Promise<ChatTurn> {
  if (!llmAvailable()) return { reply: UNAVAILABLE, refused: false, degraded: true };

  let text: string;
  try {
    const out = await generate({
      system: chatSystemPrompt(params.roadmap),
      messages: [...params.history, { role: "user", content: params.message }],
      maxTokens: 1200,
      temperature: 0.4,
    });
    text = out.text;
  } catch (e) {
    console.error("[chat] llm failed:", e instanceof Error ? e.message : e);
    return { reply: UNAVAILABLE, refused: false, degraded: true };
  }

  const parsed = parseJson(text);
  if (!parsed) return { reply: UNAVAILABLE, refused: false, degraded: true };

  // GUARDRAIL 1 — the model's own on-topic verdict, checked rather than trusted:
  // anything that isn't an explicit `true` refuses.
  if (parsed.onTopic !== true) {
    return { reply: OFF_TOPIC_REPLY, refused: true, degraded: false };
  }

  const reply = typeof parsed.reply === "string" ? parsed.reply.trim() : "";
  if (!reply) return { reply: UNAVAILABLE, refused: false, degraded: true };

  // GUARDRAIL 2 — grounding: no links the report doesn't already cite.
  if (!citesOnlyKnownUrls(reply, params.roadmap)) {
    console.error("[chat] reply cited an unknown url — refused");
    return {
      reply:
        "I don’t have a verified answer for that yet. I can only point you to what your roadmap already checked — build a fresh roadmap if your situation has changed.",
      refused: true,
      degraded: false,
    };
  }

  return { reply, refused: false, degraded: false };
}
