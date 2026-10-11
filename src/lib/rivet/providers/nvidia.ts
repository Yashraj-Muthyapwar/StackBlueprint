import { RivetError, errorFromNetwork, errorFromResponse, isAbort } from "./errors";
import { listOpenAIModels, streamOpenAI, type OpenAIEndpoint } from "./openai";
import type { ProviderConfig, ProviderDef } from "./types";

/** NVIDIA's API does not allow browser calls (CORS), so requests go through our stateless proxy. */
const PROXY = "/api/rivet-proxy";
const UPSTREAM = "https://integrate.api.nvidia.com/v1";
const MAX_PROBES = 8;
const LIKELY_CHAT =
  /llama|gpt-oss|nemotron|mistral|gemma|qwen|deepseek|kimi|glm|phi-3\.5|granite.*instruct/i;
const SKIP =
  /embed|rerank|guard|safety|reward|clip|parse|retriever|vision|vlm|image|asr|tts|riva|nemoretriever|nv-/i;

const endpoint = (cfg: ProviderConfig, path: string): OpenAIEndpoint => ({
  name: "NVIDIA",
  chatUrl: PROXY,
  modelsUrl: PROXY,
  headers: { authorization: `Bearer ${cfg.key}`, "x-rivet-target": `${UPSTREAM}${path}` },
});

export const nvidia: ProviderDef = {
  id: "nvidia",
  name: "NVIDIA",
  tagline: "Free hosted models at build.nvidia.com",
  keyUrl: "https://build.nvidia.com",
  fallbackModels: [
    "nvidia/llama-3.1-nemotron-70b-instruct",
    "openai/gpt-oss-20b",
    "mistralai/mistral-large-2-instruct",
  ],
  stream: (args) => streamOpenAI(endpoint(args, "/chat/completions"), args),
  async listModels(cfg, signal) {
    return (await listOpenAIModels(endpoint(cfg, "/models"), signal))
      .filter((id) => !SKIP.test(id))
      .sort();
  },
  async test(cfg, signal) {
    // The model list is public and includes models many accounts cannot call, so
    // prove the key with one-token chat requests, trying likely models in turn.
    const models = await this.listModels(cfg, signal);
    const likely = models.filter((m) => LIKELY_CHAT.test(m) && !this.fallbackModels.includes(m));
    const candidates = [...this.fallbackModels.filter((m) => models.includes(m)), ...likely].slice(
      0,
      MAX_PROBES,
    );
    const ep = endpoint(cfg, "/chat/completions");

    for (const model of candidates) {
      let res: Response;
      try {
        res = await fetch(ep.chatUrl, {
          method: "POST",
          headers: { "content-type": "application/json", ...ep.headers },
          signal,
          body: JSON.stringify({
            model,
            max_tokens: 1,
            messages: [{ role: "user", content: "hi" }],
          }),
        });
      } catch (e) {
        if (isAbort(e)) throw e;
        throw errorFromNetwork(e, "NVIDIA");
      }
      // A rate limit means the key itself is fine.
      if (res.ok || res.status === 429)
        return { models: [model, ...models.filter((m) => m !== model)], model };
      const err = await errorFromResponse(res, "NVIDIA");
      if (err.kind !== "model") throw err; // rejected key or server trouble: no point trying more models
    }
    throw new RivetError(
      "model",
      "Your key works, but none of the models I tried are enabled for your NVIDIA account. Open build.nvidia.com, pick a model and generate its API key, then try again.",
    );
  },
};
