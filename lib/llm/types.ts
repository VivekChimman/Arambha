export type ProviderName = "anthropic" | "openai" | "gemini" | "groq" | "mistral" | "sarvam";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface GenerateOptions {
  model: string; // the provider's model id (chosen by the caller, no fallback)
  system: string;
  messages: ChatMessage[];
  maxTokens?: number;
  temperature?: number;
}

export interface Provider {
  name: ProviderName;
  /** True only when this provider's key is present. */
  available: () => boolean;
  /** Returns the model's text, or throws. */
  generate: (opts: GenerateOptions, signal: AbortSignal) => Promise<string>;
}
