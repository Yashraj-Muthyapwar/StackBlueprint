import { listOpenAIModels, streamOpenAI, type OpenAIEndpoint } from "./openai";
import type { ProviderConfig, ProviderDef } from "./types";

const BASE = "https://api.groq.com/openai/v1";
const SKIP = /whisper|guard|tts|playai|orpheus|embed/i;

const endpoint = (cfg: ProviderConfig): OpenAIEndpoint => ({
  name: "Groq",
  chatUrl: `${BASE}/chat/completions`,
  modelsUrl: `${BASE}/models`,
  headers: { authorization: `Bearer ${cfg.key}` },
});

export const groq: ProviderDef = {
  id: "groq",
  name: "Groq",
  tagline: "Very fast, free rate-limited tier",
  keyUrl: "https://console.groq.com/keys",
  setupSteps: [
    "Sign in at console.groq.com.",
    "Open API Keys and choose Create API Key.",
    "Copy the key (it is shown only once) and paste it here.",
  ],
  costNote:
    "The free plan has per-minute and daily limits. If you add billing to your Groq account, usage beyond the free plan can be charged.",
  fallbackModels: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"],
  stream: (args) => streamOpenAI(endpoint(args), args),
  async listModels(cfg, signal) {
    return (await listOpenAIModels(endpoint(cfg), cfg.key, signal))
      .filter((id) => !SKIP.test(id))
      .sort();
  },
  async test(cfg, signal) {
    // Groq's model list requires a valid key.
    return { models: await this.listModels(cfg, signal), keyVerified: true };
  },
};
