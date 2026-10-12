import {
  RivetError,
  cutOff,
  errorFromNetwork,
  errorFromResponse,
  errorFromStreamFrame,
  isAbort,
} from "./errors";
import { sseData } from "./stream";
import { MAX_OUTPUT_TOKENS, type FinishReason, type ProviderDef } from "./types";

interface GeminiModel {
  name?: string;
  supportedGenerationMethods?: string[];
}

const BASE = "https://generativelanguage.googleapis.com/v1beta";
const SKIP = /embedding|aqa|imagen|veo|tts|image|live|audio|robotics|computer-use|learnlm|gemma/i;
const FILTERED = /SAFETY|RECITATION|BLOCKLIST|PROHIBITED_CONTENT|SPII|LANGUAGE|OTHER/;

const rank = (id: string) =>
  id.includes("flash") && !id.includes("lite") ? 0 : id.includes("lite") ? 1 : 2;

export const gemini: ProviderDef = {
  id: "gemini",
  name: "Google Gemini",
  tagline: "Generous free tier via AI Studio",
  keyUrl: "https://aistudio.google.com/apikey",
  setupSteps: [
    "Sign in to Google AI Studio with a Google account.",
    "Choose Get API key, then Create API key.",
    "Copy the key and paste it here.",
  ],
  costNote:
    "The free tier has daily limits and is not offered in every country. If the key's Google Cloud project has billing turned on, usage can be charged.",
  fallbackModels: ["gemini-flash-latest", "gemini-flash-lite-latest"],

  async *stream({ key, model, system, turns, signal, maxTokens }) {
    let res: Response;
    try {
      res = await fetch(
        `${BASE}/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse`,
        {
          method: "POST",
          headers: { "content-type": "application/json", "x-goog-api-key": key },
          signal,
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: system }] },
            contents: turns.map((t) => ({
              role: t.role === "assistant" ? "model" : "user",
              parts: [{ text: t.content }],
            })),
            generationConfig: { temperature: 0.4, maxOutputTokens: maxTokens ?? MAX_OUTPUT_TOKENS },
          }),
        },
      );
    } catch (e) {
      if (isAbort(e)) throw e;
      throw errorFromNetwork(e, "Gemini");
    }
    if (!res.ok || !res.body) throw await errorFromResponse(res, "Gemini", key);

    let finished = false;
    for await (const data of sseData(res.body)) {
      let json: {
        error?: unknown;
        promptFeedback?: { blockReason?: string };
        candidates?: {
          content?: { parts?: { text?: unknown; thought?: unknown }[] };
          finishReason?: string;
        }[];
      };
      try {
        json = JSON.parse(data);
      } catch {
        continue;
      }
      if (json?.error) throw errorFromStreamFrame(json.error, "Gemini", key);
      const block = json?.promptFeedback?.blockReason;
      if (block)
        throw new RivetError("server", `Gemini declined this request (${block}). Try rephrasing.`);
      const candidate = json?.candidates?.[0];
      for (const part of candidate?.content?.parts ?? []) {
        if (typeof part?.text === "string" && part.text && !part.thought) yield { text: part.text };
      }
      const reason = candidate?.finishReason;
      if (reason && reason !== "FINISH_REASON_UNSPECIFIED") {
        finished = true;
        const finish: FinishReason =
          reason === "MAX_TOKENS" ? "length" : FILTERED.test(reason) ? "filtered" : "stop";
        yield { finish };
      }
    }
    // Gemini always sends a finishReason on its last chunk; without one the connection was cut.
    if (!finished) throw cutOff("Gemini");
  },

  async listModels({ key }, signal) {
    let res: Response;
    try {
      res = await fetch(`${BASE}/models?pageSize=200`, {
        headers: { "x-goog-api-key": key },
        signal,
      });
    } catch (e) {
      if (isAbort(e)) throw e;
      throw errorFromNetwork(e, "Gemini");
    }
    if (!res.ok) throw await errorFromResponse(res, "Gemini", key);
    const json = await res.json().catch(() => null);
    const ids: string[] = (json?.models ?? [])
      .filter(
        (m: GeminiModel) =>
          m?.supportedGenerationMethods?.includes("generateContent") &&
          m?.name?.startsWith("models/gemini"),
      )
      .map((m: GeminiModel) => String(m.name).replace("models/", ""))
      .filter((id: string) => !SKIP.test(id));
    return ids.sort((a, b) => rank(a) - rank(b) || b.localeCompare(a));
  },

  async test(cfg, signal) {
    // Listing models requires a valid key.
    return { models: await this.listModels(cfg, signal), keyVerified: true };
  },
};
