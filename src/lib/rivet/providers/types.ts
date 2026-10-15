export type ProviderId = "gemini" | "groq" | "openrouter" | "nvidia";

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface ProviderConfig {
  key: string;
  model: string;
}

export interface StreamArgs extends ProviderConfig {
  system: string;
  turns: ChatTurn[];
  signal?: AbortSignal;
  /** Output cap for this request. Defaults to MAX_OUTPUT_TOKENS. */
  maxTokens?: number;
  /** Lower values suit short scope decisions. Defaults to 0.4. */
  temperature?: number;
}

/** Why a stream ended. "length": the output cap was hit; "filtered": the provider withheld the rest. */
export type FinishReason = "stop" | "length" | "filtered";

export type StreamPart = { text: string } | { finish: FinishReason };

export interface TestResult {
  models: string[];
  /** True when the check itself needed a valid key (a public model list proves nothing). */
  keyVerified: boolean;
}

export interface ProviderDef {
  id: ProviderId;
  name: string;
  tagline: string;
  keyUrl?: string;
  /** Short how-to for getting a key, shown in settings. */
  setupSteps: string[];
  /** Plain note on limits and possible costs. */
  costNote: string;
  /** Used until the live model list has loaded. Empty when the provider has no sensible default. */
  fallbackModels: string[];
  /** Requests pass through StackBlueprint's relay rather than going straight to the provider. */
  viaRelay?: boolean;
  stream(args: StreamArgs): AsyncGenerator<StreamPart>;
  listModels(cfg: ProviderConfig, signal?: AbortSignal): Promise<string[]>;
  /** Checks the key as far as the provider allows without generating anything. */
  test(cfg: ProviderConfig, signal?: AbortSignal): Promise<TestResult>;
  /** Models worth probing when the preferred one is unavailable (most likely first). */
  probeOrder?(models: string[]): string[];
}

/** Rivet's replies are short tutoring answers; this bounds cost and runaway output. */
export const MAX_OUTPUT_TOKENS = 2048;
