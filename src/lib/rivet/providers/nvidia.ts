import { listOpenAIModels, streamOpenAI, type OpenAIEndpoint } from "./openai";
import type { ProviderConfig, ProviderDef } from "./types";

/**
 * NVIDIA's API does not allow browser calls (CORS), so requests go through
 * StackBlueprint's relay (routes/api/rivet-proxy.ts). The relay only knows two
 * fixed NVIDIA endpoints; the browser names which one, never a URL.
 */
const RELAY = "/api/rivet-proxy";
const LIKELY_CHAT =
  /llama|gpt-oss|nemotron|mistral|gemma|qwen|deepseek|kimi|glm|phi-3\.5|granite.*instruct/i;
const SKIP =
  /embed|rerank|guard|safety|reward|clip|parse|retriever|vision|vlm|image|asr|tts|riva|nemoretriever|nv-/i;

const endpoint = (cfg: ProviderConfig): OpenAIEndpoint => ({
  name: "NVIDIA",
  chatUrl: RELAY,
  modelsUrl: RELAY,
  headers: { authorization: `Bearer ${cfg.key}` },
  chatHeaders: { "x-rivet-call": "chat" },
  modelsHeaders: { "x-rivet-call": "models" },
});

export const nvidia: ProviderDef = {
  id: "nvidia",
  name: "NVIDIA",
  tagline: "Free hosted models at build.nvidia.com",
  keyUrl: "https://build.nvidia.com",
  setupSteps: [
    "Sign in at build.nvidia.com.",
    "Open a chat model's page and choose Get API Key.",
    "Paste the key (it starts with nvapi-) here.",
  ],
  costNote:
    "Free access comes with limited credits and rate limits, and not every model is enabled for every account.",
  fallbackModels: [
    "nvidia/llama-3.1-nemotron-70b-instruct",
    "openai/gpt-oss-20b",
    "mistralai/mistral-large-2-instruct",
  ],
  viaRelay: true,
  stream: (args) => streamOpenAI(endpoint(args), args),
  async listModels(cfg, signal) {
    return (await listOpenAIModels(endpoint(cfg), cfg.key, signal))
      .filter((id) => !SKIP.test(id))
      .sort();
  },
  async test(cfg, signal) {
    // NVIDIA's model list is public and includes models many accounts cannot call,
    // so it proves nothing about the key; the generation probe does that.
    return { models: await this.listModels(cfg, signal), keyVerified: false };
  },
  probeOrder(models) {
    const likely = models.filter((m) => LIKELY_CHAT.test(m) && !this.fallbackModels.includes(m));
    return [...this.fallbackModels.filter((m) => models.includes(m)), ...likely];
  },
};
