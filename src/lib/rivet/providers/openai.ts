import {
  RivetError,
  cutOff,
  errorFromNetwork,
  errorFromResponse,
  errorFromStreamFrame,
  isAbort,
} from "./errors";
import { sseData } from "./stream";
import { MAX_OUTPUT_TOKENS, type ChatTurn, type FinishReason, type StreamPart } from "./types";

export interface OpenAIEndpoint {
  name: string;
  /** Full chat-completions URL (or the relay URL). */
  chatUrl: string;
  modelsUrl: string;
  headers: Record<string, string>;
  /** Extra headers for the chat call only (the relay uses this to name the call). */
  chatHeaders?: Record<string, string>;
  modelsHeaders?: Record<string, string>;
}

const FINISH: Record<string, FinishReason> = {
  stop: "stop",
  length: "length",
  content_filter: "filtered",
};

/** Streams tokens from any OpenAI-compatible chat-completions endpoint (Groq, OpenRouter, NVIDIA). */
export async function* streamOpenAI(
  ep: OpenAIEndpoint,
  args: {
    key: string;
    model: string;
    system: string;
    turns: ChatTurn[];
    signal?: AbortSignal;
    maxTokens?: number;
  },
): AsyncGenerator<StreamPart> {
  let res: Response;
  try {
    res = await fetch(ep.chatUrl, {
      method: "POST",
      headers: { "content-type": "application/json", ...ep.headers, ...ep.chatHeaders },
      signal: args.signal,
      body: JSON.stringify({
        model: args.model,
        stream: true,
        temperature: 0.4,
        max_tokens: args.maxTokens ?? MAX_OUTPUT_TOKENS,
        messages: [{ role: "system", content: args.system }, ...args.turns],
      }),
    });
  } catch (e) {
    if (isAbort(e)) throw e;
    throw errorFromNetwork(e, ep.name);
  }
  if (!res.ok || !res.body) throw await errorFromResponse(res, ep.name, args.key);

  // A reply only counts as complete with a finish reason or the [DONE] marker.
  // Anything else is a cut connection, and must not pass for a full answer.
  let finished = false;
  for await (const data of sseData(res.body)) {
    if (data === "[DONE]") return;
    let json: {
      error?: unknown;
      choices?: { delta?: { content?: unknown }; finish_reason?: unknown }[];
    };
    try {
      json = JSON.parse(data);
    } catch {
      continue; // keep-alive or a non-JSON comment
    }
    // Providers report mid-stream failures as an error object inside a normal 200 stream.
    if (json?.error) throw errorFromStreamFrame(json.error, ep.name, args.key);
    const choice = json?.choices?.[0];
    const token = choice?.delta?.content;
    if (typeof token === "string" && token) yield { text: token };
    if (choice?.finish_reason === "error")
      throw new RivetError("server", `${ep.name} stopped with an error partway through the reply.`);
    if (typeof choice?.finish_reason === "string" && choice.finish_reason) {
      finished = true;
      yield { finish: FINISH[choice.finish_reason] ?? "stop" };
    }
  }
  if (!finished) throw cutOff(ep.name);
}

export async function listOpenAIModels(
  ep: OpenAIEndpoint,
  key: string,
  signal?: AbortSignal,
): Promise<string[]> {
  let res: Response;
  try {
    res = await fetch(ep.modelsUrl, { headers: { ...ep.headers, ...ep.modelsHeaders }, signal });
  } catch (e) {
    if (isAbort(e)) throw e;
    throw errorFromNetwork(e, ep.name);
  }
  if (!res.ok) throw await errorFromResponse(res, ep.name, key);
  const json = await res.json().catch(() => null);
  const ids: unknown = json?.data?.map((m: { id?: unknown }) => m.id);
  if (!Array.isArray(ids))
    throw new RivetError("server", `${ep.name} returned an unexpected model list.`);
  return ids.filter((id): id is string => typeof id === "string" && id.length <= 200);
}
