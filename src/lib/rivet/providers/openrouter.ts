import { errorFromNetwork, errorFromResponse, isAbort } from "./errors";
import { listOpenAIModels, streamOpenAI, type OpenAIEndpoint } from "./openai";
import type { ProviderConfig, ProviderDef } from "./types";

const BASE = "https://openrouter.ai/api/v1";

const endpoint = (cfg: ProviderConfig): OpenAIEndpoint => ({
  name: "OpenRouter",
  chatUrl: `${BASE}/chat/completions`,
  modelsUrl: `${BASE}/models`,
  headers: {
    authorization: `Bearer ${cfg.key}`,
    "x-title": "StackBlueprint",
    ...(typeof window !== "undefined" ? { "http-referer": window.location.origin } : {}),
  },
});

export const openrouter: ProviderDef = {
  id: "openrouter",
  name: "OpenRouter",
  tagline: "Many models, including :free ones",
  keyUrl: "https://openrouter.ai/keys",
  setupSteps: [
    "Sign in at openrouter.ai.",
    "Open Keys and choose Create Key. Set a credit limit on it.",
    "Paste the key here. Rivet only lists models ending in :free.",
  ],
  costNote:
    "Rivet only offers :free models, which have tight daily limits. If the account has credits, set a limit on the key so it cannot be overspent if it leaks.",
  fallbackModels: [],
  stream: (args) => streamOpenAI(endpoint(args), args),
  async listModels(cfg, signal) {
    return (await listOpenAIModels(endpoint(cfg), cfg.key, signal))
      .filter((id) => id.endsWith(":free"))
      .sort();
  },
  async test(cfg, signal) {
    // The model list is public, so check the key against the endpoint that actually requires one.
    let res: Response;
    try {
      res = await fetch(`${BASE}/auth/key`, { headers: endpoint(cfg).headers, signal });
    } catch (e) {
      if (isAbort(e)) throw e;
      throw errorFromNetwork(e, "OpenRouter");
    }
    if (!res.ok) throw await errorFromResponse(res, "OpenRouter", cfg.key);
    return { models: await this.listModels(cfg, signal), keyVerified: true };
  },
};
