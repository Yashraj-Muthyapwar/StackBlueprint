import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (
    request: Request,
    opts?: { context?: { nonce?: string } },
  ) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!body.includes('"unhandled":true') || !body.includes('"message":"HTTPError"')) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

/**
 * Security headers for pages.
 *
 * Production enforces a nonce-based script policy: only scripts from this site,
 * scripts carrying this response's nonce (TanStack Start stamps it on its own
 * inline scripts, see router.tsx), and the pinned DuckDB bundle may run.
 * `connect-src` lists every host the page legitimately talks to, so injected
 * code cannot quietly send data elsewhere, and `img-src` is not open to every
 * https host (an <img> is an easy exfiltration channel).
 *
 * Development keeps the same policy as report-only, because Vite injects
 * inline scripts without a nonce. Set CSP_REPORT_ONLY=1 to roll production
 * back to report-only without a code change.
 *
 * A route that sends its own Content-Security-Policy (the Python sandbox) keeps it.
 */
const DUCKDB_CDN = "https://cdn.jsdelivr.net/npm/@duckdb/";
const PROVIDER_HOSTS = [
  "https://generativelanguage.googleapis.com",
  "https://api.groq.com",
  "https://openrouter.ai",
];

function pagePolicy(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'wasm-unsafe-eval' ${DUCKDB_CDN}`,
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data:",
    "img-src 'self' data: blob:",
    `connect-src 'self' ${PROVIDER_HOSTS.join(" ")} ${DUCKDB_CDN}`,
    "worker-src 'self' blob:",
    "frame-src 'self' https://mad.firstmark.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
  ].join("; ");
}

const env = (name: string) => (typeof process !== "undefined" ? process.env?.[name] : undefined);
const enforce = import.meta.env.PROD && env("CSP_REPORT_ONLY") !== "1";

function withSecurityHeaders(response: Response, nonce: string): Response {
  if (!(response.headers.get("content-type") ?? "").includes("text/html")) return response;
  const headers = new Headers(response.headers);
  if (!headers.has("content-security-policy")) {
    const policy = pagePolicy(nonce);
    if (enforce) headers.set("Content-Security-Policy", policy);
    else {
      // Still block plugins, <base> hijacking and framing while the full policy only reports.
      headers.set(
        "Content-Security-Policy",
        "object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'",
      );
      headers.set("Content-Security-Policy-Report-Only", policy);
    }
  }
  headers.set("X-Content-Type-Options", "nosniff");
  if (!headers.has("referrer-policy"))
    headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function createNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes));
}

export default {
  async fetch(request: Request) {
    const nonce = createNonce();
    try {
      const handler = await getServerEntry();
      // The nonce reaches the router through the request context (see getCspNonce in router.tsx).
      const response = await handler.fetch(request, { context: { nonce } });
      return withSecurityHeaders(await normalizeCatastrophicSsrResponse(response), nonce);
    } catch (error) {
      console.error(error);
      return withSecurityHeaders(
        new Response(renderErrorPage(), {
          status: 500,
          headers: { "content-type": "text/html; charset=utf-8" },
        }),
        nonce,
      );
    }
  },
};
