import { createFileRoute } from "@tanstack/react-router";

/**
 * Stateless relay for providers that block browser calls (CORS). The browser
 * names one of two fixed NVIDIA calls; it never supplies a URL. The relay does
 * not store or log keys, bodies or responses.
 *
 * Abuse controls here are per server instance (memory resets on restart and is
 * not shared between instances). Production also needs a shared limit at the
 * edge (Vercel Firewall or Cloudflare rate-limiting rule on /api/rivet-proxy),
 * and request logging that does not record the Authorization header or bodies.
 */
const CALLS = {
  chat: { method: "POST", url: "https://integrate.api.nvidia.com/v1/chat/completions" },
  models: { method: "GET", url: "https://integrate.api.nvidia.com/v1/models" },
} as const;
type CallName = keyof typeof CALLS;

const MAX_BODY_BYTES = 256 * 1024;
const MAX_MESSAGES = 64;
const MAX_MESSAGE_CHARS = 100_000;
const MAX_TOKENS = 4096;
const PER_CLIENT_LIMIT = 60; // requests per window
const GLOBAL_LIMIT = 1200; // requests per window, per instance
const WINDOW_MS = 60_000;
const PER_CLIENT_CONCURRENCY = 3;
const GLOBAL_CONCURRENCY = 64;
const HEADERS_TIMEOUT_MS = 30_000;
const BODY_IDLE_TIMEOUT_MS = 5_000;
const BODY_TOTAL_TIMEOUT_MS = 15_000;
const IDLE_TIMEOUT_MS = 30_000;
const TOTAL_TIMEOUT_MS = 180_000;

const hits = new Map<string, { count: number; resetAt: number }>();
let globalWindow = { count: 0, resetAt: 0 };
const active = new Map<string, number>();
let activeTotal = 0;

const env = (name: string) => (typeof process !== "undefined" ? process.env?.[name] : undefined);

/**
 * The client address from a header the hosting platform sets and overwrites,
 * so a caller cannot reset its own limit by sending a different value.
 * Without a trusted header every caller shares one bucket (safe, but strict).
 */
function clientId(request: Request): string {
  const header = env("RIVET_TRUSTED_IP_HEADER") ?? (env("VERCEL") ? "x-real-ip" : "");
  const value = header ? request.headers.get(header)?.split(",")[0]?.trim() : "";
  return value || "shared";
}

function rateLimited(id: string): boolean {
  const now = Date.now();
  if (globalWindow.resetAt < now) globalWindow = { count: 0, resetAt: now + WINDOW_MS };
  if (++globalWindow.count > GLOBAL_LIMIT) return true;
  const entry = hits.get(id);
  if (!entry || entry.resetAt < now) {
    hits.set(id, { count: 1, resetAt: now + WINDOW_MS });
    if (hits.size > 5000) for (const [k, v] of hits) if (v.resetAt < now) hits.delete(k);
    return false;
  }
  entry.count += 1;
  return entry.count > PER_CLIENT_LIMIT;
}

/** Reserves a concurrency slot; the returned release is safe to call more than once. */
function acquire(id: string): (() => void) | null {
  if (activeTotal >= GLOBAL_CONCURRENCY || (active.get(id) ?? 0) >= PER_CLIENT_CONCURRENCY)
    return null;
  activeTotal += 1;
  active.set(id, (active.get(id) ?? 0) + 1);
  let released = false;
  return () => {
    if (released) return;
    released = true;
    activeTotal -= 1;
    const n = (active.get(id) ?? 1) - 1;
    if (n <= 0) active.delete(id);
    else active.set(id, n);
  };
}

const json = (status: number, message: string, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify({ error: { message } }), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store", ...extra },
  });

/** Browsers label same-site fetches with Sec-Fetch-Site and send Origin on POSTs. */
function isSameSiteRequest(request: Request): boolean {
  const site = request.headers.get("sec-fetch-site");
  if (site && site !== "same-origin") return false;
  const origin = request.headers.get("origin");
  if (!origin) return site === "same-origin";
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

type BodyResult = { ok: true; text: string } | { ok: false; reason: "too-large" | "timeout" };

/**
 * Reads the body as text, refusing it as soon as it passes the size limit, and
 * giving up on uploads that stall or drag on, so a slow sender cannot hold a
 * concurrency slot open.
 */
async function readBody(request: Request, signal: AbortSignal): Promise<BodyResult> {
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (declared > MAX_BODY_BYTES) return { ok: false, reason: "too-large" };
  if (!request.body) return { ok: true, text: "" };
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  const started = Date.now();
  try {
    for (;;) {
      const wait = Math.min(BODY_IDLE_TIMEOUT_MS, BODY_TOTAL_TIMEOUT_MS - (Date.now() - started));
      if (wait <= 0 || signal.aborted) return { ok: false, reason: "timeout" };
      let timer: ReturnType<typeof setTimeout> | undefined;
      let stop!: () => void;
      const timeout = new Promise<"timeout">((resolve) => {
        stop = () => resolve("timeout");
        timer = setTimeout(stop, wait);
      });
      const onAbort = () => stop(); // the caller disconnected
      signal.addEventListener("abort", onAbort, { once: true });
      const result = await Promise.race([reader.read(), timeout]).finally(() => {
        clearTimeout(timer);
        signal.removeEventListener("abort", onAbort);
      });
      if (result === "timeout") return { ok: false, reason: "timeout" };
      if (result.done) break;
      size += result.value.byteLength;
      if (size > MAX_BODY_BYTES) return { ok: false, reason: "too-large" };
      chunks.push(result.value);
    }
  } finally {
    // Stops reading a body we refused or gave up on; harmless once it is fully read.
    reader.cancel().catch(() => {});
  }
  const all = new Uint8Array(size);
  let offset = 0;
  for (const c of chunks) {
    all.set(c, offset);
    offset += c.byteLength;
  }
  return { ok: true, text: new TextDecoder().decode(all) };
}

/** Accepts only the chat-completions fields Rivet sends, and rebuilds the body from them. */
function validateChat(text: string): string | null {
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(text);
  } catch {
    return null;
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const { model, messages, stream, temperature, max_tokens } = body;
  if (typeof model !== "string" || !/^[\w.:/-]{1,200}$/.test(model)) return null;
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES)
    return null;
  const clean: { role: string; content: string }[] = [];
  for (const m of messages) {
    const { role, content } = (m ?? {}) as Record<string, unknown>;
    if (role !== "system" && role !== "user" && role !== "assistant") return null;
    if (typeof content !== "string" || content.length > MAX_MESSAGE_CHARS) return null;
    clean.push({ role, content });
  }
  const tokens =
    typeof max_tokens === "number" && Number.isFinite(max_tokens)
      ? Math.min(Math.max(1, Math.floor(max_tokens)), MAX_TOKENS)
      : MAX_TOKENS;
  return JSON.stringify({
    model,
    messages: clean,
    stream: stream === true,
    temperature:
      typeof temperature === "number" && temperature >= 0 && temperature <= 2 ? temperature : 0.4,
    max_tokens: tokens,
  });
}

/**
 * Passes the upstream body through while enforcing an idle gap and a total
 * deadline, and releases the concurrency slot however the stream ends.
 */
function guardedBody(
  upstream: ReadableStream<Uint8Array>,
  abort: () => void,
  release: () => void,
  deadline: number,
  signal: AbortSignal,
): ReadableStream<Uint8Array> {
  const reader = upstream.getReader();
  let idle: ReturnType<typeof setTimeout> | undefined;
  let total: ReturnType<typeof setTimeout> | undefined;
  let ended = false;
  let output!: ReadableStreamDefaultController<Uint8Array>;
  let bytes = 0;
  const cleanup = () => {
    clearTimeout(idle);
    clearTimeout(total);
    signal.removeEventListener("abort", cancelled);
    release();
  };
  const terminate = (reason: string) => {
    if (ended) return;
    ended = true;
    cleanup();
    output.error(new Error(reason));
    abort();
    reader.cancel().catch(() => {});
  };
  const cancelled = () => terminate("The request was cancelled.");
  return new ReadableStream<Uint8Array>({
    start(controller) {
      output = controller;
      signal.addEventListener("abort", cancelled, { once: true });
      // This timer survives downstream backpressure and does not depend on pull().
      total = setTimeout(
        () => terminate("Response deadline exceeded."),
        Math.max(0, deadline - Date.now()),
      );
      if (signal.aborted) cancelled();
    },
    async pull(controller) {
      if (ended) return;
      clearTimeout(idle);
      idle = setTimeout(() => terminate("Provider response stalled."), IDLE_TIMEOUT_MS);
      try {
        const { done, value } = await reader.read();
        clearTimeout(idle);
        if (ended) return;
        if (done) {
          ended = true;
          cleanup();
          controller.close();
        } else {
          bytes += value.byteLength;
          if (bytes > 4 * 1024 * 1024) terminate("Provider response is too large.");
          else controller.enqueue(value);
        }
      } catch {
        terminate("Provider response ended unexpectedly.");
      }
    },
    cancel() {
      if (ended) return;
      ended = true;
      cleanup();
      abort();
      reader.cancel().catch(() => {});
    },
  });
}

async function relay(request: Request): Promise<Response> {
  if (env("RIVET_RELAY_DISABLED") === "1")
    return json(503, "Rivet's relay is temporarily unavailable.");
  // Production must have a shared edge rule; in-process counters cannot enforce it.
  // Set this only after configuring and verifying the rule in the hosting console.
  if (import.meta.env.PROD && env("RIVET_EDGE_RATE_LIMITED") !== "1")
    return json(503, "Rivet's NVIDIA relay has not been enabled for this deployment.");
  // Origin evidence blocks other websites and casual scripts. It is not authentication:
  // a non-browser client can set any header, which is why the limits below exist.
  if (!isSameSiteRequest(request)) return json(403, "Not allowed.");

  const callName = request.headers.get("x-rivet-call");
  if (callName !== "chat" && callName !== "models") return json(400, "Unknown call.");
  const call = CALLS[callName as CallName];
  if (request.method !== call.method) return json(405, "Method not allowed.");

  const auth = request.headers.get("authorization") ?? "";
  if (!/^Bearer [\x21-\x7e]{8,512}$/.test(auth)) return json(401, "Missing or malformed API key.");

  const id = clientId(request);
  if (rateLimited(id))
    return json(429, "Too many requests. Slow down for a minute.", {
      "x-rivet-relay": "rate-limited",
      "retry-after": "60",
    });
  const slot = acquire(id);
  if (!slot)
    return json(429, "Too many requests at once.", {
      "x-rivet-relay": "rate-limited",
      "retry-after": "60",
    });

  // The deadline covers the whole request, starting before the upload is read.
  const controller = new AbortController();
  const abort = () => controller.abort();
  const release = () => {
    request.signal.removeEventListener("abort", abort);
    slot();
  };
  request.signal?.addEventListener("abort", abort);
  if (request.signal.aborted) abort();
  const deadline = Date.now() + TOTAL_TIMEOUT_MS;

  let body: string | undefined;
  try {
    if (call.method === "POST") {
      const read = await readBody(request, controller.signal);
      if (!read.ok) {
        release();
        return read.reason === "too-large"
          ? json(413, "Request is too large.")
          : json(408, "The request took too long to arrive.");
      }
      const valid = validateChat(read.text);
      if (valid === null) {
        release();
        return json(400, "Request is not a valid chat request.");
      }
      body = valid;
    }
  } catch {
    release();
    return json(400, "Could not read the request.");
  }
  if (controller.signal.aborted) {
    release();
    return json(499, "The request was cancelled.");
  }
  const headersTimer = setTimeout(abort, HEADERS_TIMEOUT_MS);

  const headers = new Headers({
    authorization: auth,
    accept: "application/json, text/event-stream",
  });
  if (body !== undefined) headers.set("content-type", "application/json");

  let upstream: Response;
  try {
    upstream = await fetch(call.url, {
      method: call.method,
      headers,
      body,
      redirect: "error", // never follow a redirect off the fixed endpoint
      signal: controller.signal,
    });
  } catch {
    clearTimeout(headersTimer);
    release();
    return json(502, "Could not reach the provider.");
  } finally {
    clearTimeout(headersTimer);
  }

  const type = upstream.headers.get("content-type") ?? "";
  const contentType = type.startsWith("text/event-stream")
    ? "text/event-stream"
    : "application/json";
  if (!upstream.body) {
    release();
    return new Response(null, {
      status: upstream.status,
      headers: { "cache-control": "no-store" },
    });
  }
  return new Response(guardedBody(upstream.body, abort, release, deadline, controller.signal), {
    status: upstream.status,
    headers: {
      "content-type": contentType,
      "cache-control": "no-store",
      "x-accel-buffering": "no",
    },
  });
}

export const Route = createFileRoute("/api/rivet-proxy")({
  server: {
    handlers: {
      GET: ({ request }) => relay(request),
      POST: ({ request }) => relay(request),
    },
  },
});
