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
  fallbackModels: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"],
  stream: (args) => streamOpenAI(endpoint(args), args),
  async listModels(cfg, signal) {
    return (await listOpenAIModels(endpoint(cfg), signal)).filter((id) => !SKIP.test(id)).sort();
  },
  async test(cfg, signal) {
    return { models: await this.listModels(cfg, signal) };
  },
};
