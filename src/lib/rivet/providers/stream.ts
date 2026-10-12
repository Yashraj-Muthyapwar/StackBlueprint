import { RivetError } from "./errors";

/** Largest single SSE event Rivet will buffer before giving up on a stream. */
const MAX_EVENT_CHARS = 1_000_000;

/**
 * Yields the data of each Server-Sent Events event. Multi-line `data:` fields
 * are joined with newlines and an event is only dispatched at its blank-line
 * boundary, as the SSE spec describes. Comments and other fields are ignored.
 */
export async function* sseData(body: ReadableStream<Uint8Array>): AsyncGenerator<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let data: string[] = [];
  let dataSize = 0;
  let skipLF = false;

  const field = (line: string) => {
    if (!line.startsWith("data:")) return;
    const value = line.slice(line.startsWith("data: ") ? 6 : 5);
    dataSize += value.length;
    if (dataSize > MAX_EVENT_CHARS)
      throw new RivetError("server", "The model sent a response chunk that was too large.");
    data.push(value);
  };
  const dispatch = () => {
    const event = data.join("\n");
    data = [];
    dataSize = 0;
    return event;
  };

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      if (buffer.length > MAX_EVENT_CHARS)
        throw new RivetError("server", "The model sent a response chunk that was too large.");
      let start = 0;
      for (let i = 0; i < buffer.length; i++) {
        const char = buffer[i];
        if (skipLF) {
          skipLF = false;
          if (char === "\n") {
            start = i + 1;
            continue;
          }
        }
        if (char !== "\r" && char !== "\n") continue;
        const line = buffer.slice(start, i);
        start = i + 1;
        skipLF = char === "\r";
        if (!line) {
          if (data.length) yield dispatch();
        } else field(line);
      }
      buffer = buffer.slice(start);
    }
    buffer += decoder.decode();
    if (buffer) field(buffer);
    if (data.length) yield dispatch();
  } finally {
    reader.cancel().catch(() => {});
  }
}
