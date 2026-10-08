import { RivetError, errorFromNetwork, errorFromResponse, isAbort } from "./errors";
import { sseData } from "./stream";
import type { ProviderDef } from "./types";

interface GeminiModel {
  name?: string;
  supportedGenerationMethods?: string[];
}

const BASE = "https://generativelanguage.googleapis.com/v1beta";
const SKIP = /embedding|aqa|imagen|veo|tts|image|live|audio|robotics|computer-use|learnlm|gemma/i;

const rank = (id: string) =>
  id.includes("flash") && !id.includes("lite") ? 0 : id.includes("lite") ? 1 : 2;

export const gemini: ProviderDef = {
  id: "gemini",
  name: "Google Gemini",
  tagline: "Generous free tier via AI Studio",
  keyUrl: "https://aistudio.google.com/apikey",
  fallbackModels: ["gemini-flash-latest", "gemini-flash-lite-latest"],

  async *stream({ key, model, system, turns, signal }) {
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
            generationConfig: { temperature: 0.4 },
          }),
        },
      );
    } catch (e) {
      if (isAbort(e)) throw e;
      throw errorFromNetwork(e, "Gemini");
    }
    if (!res.ok || !res.body) throw await errorFromResponse(res, "Gemini");

    for await (const data of sseData(res.body)) {
      try {
        const json = JSON.parse(data);
        const block = json?.promptFeedback?.blockReason;
        if (block)
          throw new RivetError(
            "server",
            `Gemini declined this request (${block}). Try rephrasing.`,
          );
        for (const part of json?.candidates?.[0]?.content?.parts ?? []) {
          if (typeof part?.text === "string" && !part.thought) yield part.text;
        }
      } catch (e) {
        if (e instanceof RivetError) throw e;
      }
    }
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
    if (!res.ok) throw await errorFromResponse(res, "Gemini");
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
    return { models: await this.listModels(cfg, signal) };
  },
};
