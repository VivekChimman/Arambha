import { DEFAULT_MODEL_ID, LLM, MODELS, type ModelChoice } from "@/lib/config";
import { env } from "@/lib/env";
import { PROVIDERS } from "@/lib/llm/providers";
import type { ChatMessage } from "@/lib/llm/types";

export interface GenerateResult {
  text: string;
  modelId: string;
}

/** The one selected model. Picker → ARAMBHA_LLM_MODEL; falls back to the default.
 *  PRO ("SOON") models are not selectable, so they resolve to the default. */
export function selectedModel(): ModelChoice {
  return (
    MODELS.find((m) => m.id === env.selectedModelId && !m.pro) ??
    MODELS.find((m) => m.id === DEFAULT_MODEL_ID) ??
    MODELS.find((m) => !m.pro) ??
    MODELS[0]
  );
}

/** True if the selected model's provider has a key. No cross-provider fallback. */
export function llmAvailable(): boolean {
  return PROVIDERS[selectedModel().provider].available();
}

/**
 * Generate with the ONE selected model. There is deliberately no model-to-model
 * fallback (per Vivek): if the selected model fails, this throws and the caller
 * decides how to degrade — it never silently switches to another model.
 */
export async function generate(opts: {
  system: string;
  messages: ChatMessage[];
  maxTokens?: number;
  temperature?: number;
}): Promise<GenerateResult> {
  const choice = selectedModel();
  const provider = PROVIDERS[choice.provider];
  if (!provider.available()) {
    throw new Error(`Selected model '${choice.id}' has no API key configured.`);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), LLM.timeoutMs);
  try {
    const text = await provider.generate(
      {
        model: choice.model,
        system: opts.system,
        messages: opts.messages,
        maxTokens: opts.maxTokens ?? LLM.maxTokens,
        temperature: opts.temperature ?? LLM.temperature,
      },
      controller.signal,
    );
    return { text, modelId: choice.id };
  } finally {
    clearTimeout(timer);
  }
}
