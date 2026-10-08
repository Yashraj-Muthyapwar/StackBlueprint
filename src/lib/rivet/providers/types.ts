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
}

export interface TestResult {
  models: string[];
  /** A model confirmed to work for this key. */
  model?: string;
}

export interface ProviderDef {
  id: ProviderId;
  name: string;
  tagline: string;
  keyUrl?: string;
  /** Used until the live model list has loaded. Empty when the provider has no sensible default. */
  fallbackModels: string[];
  stream(args: StreamArgs): AsyncGenerator<string>;
  listModels(cfg: ProviderConfig, signal?: AbortSignal): Promise<string[]>;
  /**
   * Verifies the key (or server) works. Resolves with the models it found and,
   * when it had to try several, one model it confirmed this account can use.
   */
  test(cfg: ProviderConfig, signal?: AbortSignal): Promise<TestResult>;
}
