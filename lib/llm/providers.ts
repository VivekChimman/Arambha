import { LLM } from "@/lib/config";
import { serverEnv } from "@/lib/env";
import type { Provider, ProviderName } from "@/lib/llm/types";

/**
 * Provider adapters. Each speaks its vendor's REST API directly (no SDKs) and
 * returns plain text. Anthropic and Gemini have their own shapes; OpenAI, Groq,
 * Mistral and Sarvam all share the OpenAI chat-completions shape.
 */

async function readError(res: Response): Promise<string> {
  // Read enough to make a thrown message useful in server logs — never the key.
  const body = await res.text().catch(() => "");
  return `${res.status} ${res.statusText} ${body.slice(0, 200)}`.trim();
}

// ── Anthropic ────────────────────────────────────────────────────────────────
const anthropic: Provider = {
  name: "anthropic",
  available: () => Boolean(serverEnv.anthropicKey),
  async generate(opts, signal) {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      signal,
      headers: {
        "content-type": "application/json",
        "x-api-key": serverEnv.anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: opts.model,
        max_tokens: opts.maxTokens ?? LLM.maxTokens,
        temperature: opts.temperature ?? LLM.temperature,
        system: opts.system,
        messages: opts.messages.map((m) => ({ role: m.role, content: m.content })),
      }),
    });
    if (!res.ok) throw new Error(`anthropic: ${await readError(res)}`);
    const data = await res.json();
    const text = data?.content?.[0]?.text;
    if (typeof text !== "string") throw new Error("anthropic: empty response");
    return text;
  },
};

// ── OpenAI-compatible (OpenAI / Groq / Mistral / Sarvam) ─────────────────────
function openAICompatible(
  name: ProviderName,
  baseUrl: string,
  key: () => string,
): Provider {
  return {
    name,
    available: () => Boolean(key()),
    async generate(opts, signal) {
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        signal,
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${key()}`,
        },
        body: JSON.stringify({
          model: opts.model,
          max_tokens: opts.maxTokens ?? LLM.maxTokens,
          temperature: opts.temperature ?? LLM.temperature,
          messages: [
            { role: "system", content: opts.system },
            ...opts.messages.map((m) => ({ role: m.role, content: m.content })),
          ],
        }),
      });
      if (!res.ok) throw new Error(`${name}: ${await readError(res)}`);
      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content;
      if (typeof text !== "string") throw new Error(`${name}: empty response`);
      return text;
    },
  };
}

// ── Gemini ───────────────────────────────────────────────────────────────────
const gemini: Provider = {
  name: "gemini",
  available: () => Boolean(serverEnv.geminiKey),
  async generate(opts, signal) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${opts.model}:generateContent?key=${serverEnv.geminiKey}`;
    const res = await fetch(url, {
      method: "POST",
      signal,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: opts.system }] },
        contents: opts.messages.map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        })),
        generationConfig: {
          temperature: opts.temperature ?? LLM.temperature,
          maxOutputTokens: opts.maxTokens ?? LLM.maxTokens,
        },
      }),
    });
    if (!res.ok) throw new Error(`gemini: ${await readError(res)}`);
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof text !== "string") throw new Error("gemini: empty response");
    return text;
  },
};

export const PROVIDERS: Record<ProviderName, Provider> = {
  anthropic,
  openai: openAICompatible("openai", "https://api.openai.com/v1", () => serverEnv.openaiKey),
  gemini,
  groq: openAICompatible("groq", "https://api.groq.com/openai/v1", () => serverEnv.groqKey),
  mistral: openAICompatible("mistral", "https://api.mistral.ai/v1", () => serverEnv.mistralKey),
  sarvam: openAICompatible("sarvam", "https://api.sarvam.ai/v1", () => serverEnv.sarvamKey),
};
