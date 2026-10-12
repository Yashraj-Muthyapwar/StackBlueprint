export type RivetErrorKind =
  "auth" | "rate" | "network" | "model" | "server" | "empty" | "timeout" | "notconfigured";

/** An error whose message is safe and useful to show the learner as-is. */
export class RivetError extends Error {
  constructor(
    public kind: RivetErrorKind,
    message: string,
  ) {
    super(message);
    this.name = "RivetError";
  }
}

export const isAbort = (e: unknown) => e instanceof DOMException && e.name === "AbortError";

/** Shapes of common provider credentials, plus long opaque tokens. */
const SECRET_PATTERNS = [
  /AIza[0-9A-Za-z_-]{20,}/g,
  /\bsk-[A-Za-z0-9_-]{10,}/g,
  /\bgsk_[A-Za-z0-9]{10,}/g,
  /\bnvapi-[A-Za-z0-9_-]{10,}/g,
  /\bBearer\s+[A-Za-z0-9._~+/=-]+/gi,
  /\b[A-Za-z0-9_-]{32,}\b/g,
];

/** Removes the submitted key (and anything shaped like a credential) from text shown or logged. */
export function redactSecrets(text: string, key?: string): string {
  let out = text;
  if (key && key.length >= 6) out = out.split(key).join("[redacted]");
  for (const p of SECRET_PATTERNS) out = out.replace(p, "[redacted]");
  return out;
}

/** Turns a provider's error message into a short, key-free hint. */
export function providerDetail(raw: unknown, key?: string): string {
  return redactSecrets(String(raw ?? ""), key)
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200);
}

/** Turns a failed HTTP response into a friendly error. Reads the body for a hint, with keys redacted. */
export async function errorFromResponse(
  res: Response,
  provider: string,
  key?: string,
): Promise<RivetError> {
  let detail = "";
  try {
    const text = (await res.text()).slice(0, 20_000);
    const json = JSON.parse(text);
    detail = providerDetail(json?.error?.message ?? json?.message ?? json?.detail ?? "", key);
  } catch {
    /* body was not JSON */
  }
  if (res.headers.get("x-rivet-relay") === "rate-limited")
    return new RivetError(
      "rate",
      "StackBlueprint's relay is limiting requests right now. Wait a minute and try again.",
    );
  const notEnabled = /not found for account|not.*entitled|no access to/i.test(detail);
  const tail = detail && !notEnabled ? ` (${detail})` : "";
  const badKey = /api[ _-]?key|unauthori[sz]ed|invalid.*(key|token)|permission/i.test(detail);
  if (res.status === 401 || res.status === 403 || (res.status === 400 && badKey))
    return new RivetError(
      "auth",
      `${provider} rejected the key. Check that it is correct and still active.${tail}`,
    );
  if (res.status === 429)
    return new RivetError(
      "rate",
      `${provider} is rate limiting this key. Wait a minute, or pick another model or provider.${tail}`,
    );
  if (notEnabled)
    return new RivetError(
      "model",
      `${provider} has not enabled this model for your account. Pick another model in settings.`,
    );
  if (res.status === 404 || res.status === 400)
    return new RivetError(
      "model",
      `${provider} could not use this model. Try another one in settings.${tail}`,
    );
  return new RivetError(
    "server",
    `${provider} had a problem (${res.status}). Try again in a moment.${tail}`,
  );
}

/** An error object sent inside a stream (after a 200 response) becomes a proper failure. */
export function errorFromStreamFrame(error: unknown, provider: string, key?: string): RivetError {
  const e = (error ?? {}) as { message?: unknown; code?: unknown; status?: unknown };
  const detail = providerDetail(e.message ?? (typeof error === "string" ? error : ""), key);
  const code = String(e.code ?? e.status ?? "");
  const tail = detail ? ` (${detail})` : "";
  if (code === "429" || /RESOURCE_EXHAUSTED|rate/i.test(code))
    return new RivetError("rate", `${provider} hit a rate limit partway through the reply.${tail}`);
  return new RivetError(
    "server",
    `${provider} stopped with an error partway through the reply.${tail}`,
  );
}

/** The stream ended without the provider saying the reply was complete. */
export function cutOff(provider: string): RivetError {
  return new RivetError(
    "network",
    `The connection to ${provider} ended before the reply was complete. Try again.`,
  );
}

export function errorFromNetwork(e: unknown, provider: string): RivetError {
  if (e instanceof RivetError) return e;
  return new RivetError(
    "network",
    `Could not reach ${provider}. Check your connection and try again.`,
  );
}
