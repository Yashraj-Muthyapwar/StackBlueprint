export type RivetErrorKind =
  "auth" | "rate" | "network" | "model" | "server" | "empty" | "notconfigured";

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

/** Turns a failed HTTP response into a friendly error. Reads the body for a hint but never echoes keys. */
export async function errorFromResponse(res: Response, provider: string): Promise<RivetError> {
  let detail = "";
  try {
    const text = await res.text();
    const json = JSON.parse(text);
    detail = String(json?.error?.message ?? json?.message ?? json?.detail ?? "").slice(0, 200);
  } catch {
    /* body was not JSON */
  }
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
      `${provider}'s free limit was hit. Wait a minute, or pick another model or provider.${tail}`,
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

export function errorFromNetwork(e: unknown, provider: string): RivetError {
  if (e instanceof RivetError) return e;
  return new RivetError(
    "network",
    `Could not reach ${provider}. Check your connection and try again.`,
  );
}
