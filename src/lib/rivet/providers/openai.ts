import { RivetError, errorFromNetwork, errorFromResponse, isAbort } from "./errors";
import { sseData } from "./stream";
import type { ChatTurn } from "./types";

export interface OpenAIEndpoint {
  name: string;
  /** Full chat-completions URL (or the proxy URL). */
  chatUrl: string;
  modelsUrl: string;
  headers: Record<string, string>;
}

/** Streams tokens from any OpenAI-compatible chat-completions endpoint (Groq, OpenRouter, NVIDIA). */
export async function* streamOpenAI(
  ep: OpenAIEndpoint,
  args: { model: string; system: string; turns: ChatTurn[]; signal?: AbortSignal },
): AsyncGenerator<string> {
  let res: Response;
  try {
    res = await fetch(ep.chatUrl, {
      method: "POST",
      headers: { "content-type": "application/json", ...ep.headers },
      signal: args.signal,
      body: JSON.stringify({
        model: args.model,
        stream: true,
        temperature: 0.4,
        messages: [{ role: "system", content: args.system }, ...args.turns],
      }),
    });
  } catch (e) {
    if (isAbort(e)) throw e;
    throw errorFromNetwork(e, ep.name);
  }
  if (!res.ok || !res.body) throw await errorFromResponse(res, ep.name);

  for await (const data of sseData(res.body)) {
    if (data === "[DONE]") return;
    try {
      const token = JSON.parse(data)?.choices?.[0]?.delta?.content;
      if (typeof token === "string" && token) yield token;
    } catch {
      /* keep-alive or partial frame */
    }
  }
}

export async function listOpenAIModels(
  ep: OpenAIEndpoint,
  signal?: AbortSignal,
): Promise<string[]> {
  let res: Response;
  try {
    res = await fetch(ep.modelsUrl, { headers: ep.headers, signal });
  } catch (e) {
    if (isAbort(e)) throw e;
    throw errorFromNetwork(e, ep.name);
  }
  if (!res.ok) throw await errorFromResponse(res, ep.name);
  const json = await res.json().catch(() => null);
  const ids: unknown = json?.data?.map((m: { id?: unknown }) => m.id);
  if (!Array.isArray(ids))
    throw new RivetError("server", `${ep.name} returned an unexpected model list.`);
  return ids.filter((id): id is string => typeof id === "string");
}
