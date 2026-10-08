import { createFileRoute } from "@tanstack/react-router";

/**
 * Stateless relay for providers that block browser calls (CORS). It only
 * forwards to an allowlisted host, never stores or logs keys, bodies or
 * responses, and only accepts requests from this site's own pages.
 */
const ALLOWED_HOSTS = new Set(["integrate.api.nvidia.com"]);
/** Exactly the two calls Rivet makes. Anything else on the allowed host is refused. */
const ALLOWED_CALLS = new Set(["POST /v1/chat/completions", "GET /v1/models"]);
const MAX_BODY_BYTES = 512 * 1024;
const LIMIT = 60;
const WINDOW_MS = 60_000;
const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimited(ip: string) {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || entry.resetAt < now) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    if (hits.size > 5000) for (const [k, v] of hits) if (v.resetAt < now) hits.delete(k);
    return false;
  }
  entry.count += 1;
  return entry.count > LIMIT;
}

const json = (status: number, message: string) =>
  new Response(JSON.stringify({ error: { message } }), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

function isSameSiteRequest(request: Request): boolean {
  if (request.headers.get("sec-fetch-site") === "same-origin") return true;
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

async function relay(request: Request): Promise<Response> {
  // Browsers always label a same-site fetch with Sec-Fetch-Site, and send Origin on POSTs. Requiring
  // one of them blocks other websites and casual scripts. A determined non-browser client can fake
  // headers, so the hard limits live in the host's rate-limit rules (see docs/rivet-prd.md).
  if (!isSameSiteRequest(request)) return json(403, "Not allowed.");

  let target: URL;
  try {
    target = new URL(request.headers.get("x-rivet-target") ?? "");
  } catch {
    return json(400, "Missing or invalid target.");
  }
  if (
    target.protocol !== "https:" ||
    !ALLOWED_HOSTS.has(target.hostname) ||
    !ALLOWED_CALLS.has(`${request.method} ${target.pathname}`) ||
    target.search ||
    target.username ||
    target.password
  ) {
    return json(400, "Target is not allowed.");
  }

  const ip =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";
  if (rateLimited(ip)) return json(429, "Too many requests. Slow down for a minute.");

  const body = request.method === "POST" ? await request.text() : undefined;
  if (body !== undefined && new TextEncoder().encode(body).length > MAX_BODY_BYTES) {
    return json(413, "Request is too large.");
  }

  const headers = new Headers();
  const auth = request.headers.get("authorization");
  if (auth) headers.set("authorization", auth);
  headers.set("accept", request.headers.get("accept") ?? "application/json");
  if (request.method === "POST") headers.set("content-type", "application/json");

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method: request.method,
      headers,
      body,
      redirect: "error", // never follow a redirect off the allowed host
      signal: request.signal,
    });
  } catch {
    return json(502, "Could not reach the provider.");
  }

  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      "content-type": upstream.headers.get("content-type") ?? "application/json",
      "cache-control": "no-store",
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
