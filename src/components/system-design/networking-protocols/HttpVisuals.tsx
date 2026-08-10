/**
 * HttpVisuals.tsx
 *
 * Animated diagrams for the "HTTP & HTTPS" lesson.
 * Zero dependencies beyond React. Tailwind classes only.
 *
 * Wire these into your section renderer:
 *
 *   case "http-req-res-viewer":   return <HttpReqResViewer />;
 *   case "tls-handshake-diagram": return <TlsHandshakeDiagram />;
 *   case "http-versions-diagram": return <HttpVersionsDiagram />;
 *   case "http-cache-diagram":    return <HttpCacheDiagram />;   // new, see below
 *
 * The lesson already declares the first three. Add the fourth after the
 * "Caching and Conditional Requests" prose block:
 *
 *   { kind: "http-cache-diagram" },
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Server, Lock, ShieldCheck, Database, Check, AlertTriangle, XCircle, CheckCircle2 } from "lucide-react";

/* ══════════════════════════════════════════════════════════════════════
   Shared shell
   ══════════════════════════════════════════════════════════════════════ */

const Panel: React.FC<{
  label: string;
  title: string;
  children: React.ReactNode;
  footnote?: string;
}> = ({ label, title, children, footnote }) => (
  <figure className="my-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
    <div className="border-b border-slate-200 bg-slate-50 px-5 py-3 dark:border-slate-700 dark:bg-slate-800/60">
      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-600 dark:text-blue-400">
        {label}
      </span>
      <h4 className="mt-0.5 text-base font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </h4>
    </div>
    <div className="p-5">{children}</div>
    {footnote && (
      <figcaption className="border-t border-slate-200 bg-slate-50 px-5 py-2.5 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400">
        {footnote}
      </figcaption>
    )}
  </figure>
);

/** Drives a millisecond clock while `running` is true. */
function useClock(running: boolean, resetKey: unknown, tickMs = 60) {
  const [t, setT] = useState(0);
  const started = useRef<number>(0);

  useEffect(() => {
    setT(0);
  }, [resetKey]);

  useEffect(() => {
    if (!running) return;
    started.current = Date.now() - t;
    const id = setInterval(() => setT(Date.now() - started.current), tickMs);
    return () => clearInterval(id);
    // t deliberately omitted: we only want to re-anchor when running flips
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, resetKey, tickMs]);

  return [t, setT] as const;
}

const Btn: React.FC<{
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
  children: React.ReactNode;
}> = ({ onClick, disabled, primary, children }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={
      primary
        ? "rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-40"
        : "rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-100 disabled:opacity-40 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
    }
  >
    {children}
  </button>
);

/* ══════════════════════════════════════════════════════════════════════
   1. HTTP REQUEST / RESPONSE VIEWER
   Watch a real message go over the wire, line by line.
   ══════════════════════════════════════════════════════════════════════ */

type Tone = "start" | "header" | "blank" | "body";
type Line = { text: string; tone: Tone; hint?: string };

type Scenario = {
  id: string;
  label: string;
  serverMs: number;
  status: "ok" | "warn" | "err" | "cache";
  verdict: string;
  request: Line[];
  response: Line[];
};

const h = (text: string, hint?: string): Line => ({ text, tone: "header", hint });
const s = (text: string, hint?: string): Line => ({ text, tone: "start", hint });
const blank: Line = { text: "", tone: "blank" };
const b = (text: string): Line => ({ text, tone: "body" });

const SCENARIOS: Scenario[] = [
  {
    id: "get",
    label: "GET an article",
    serverMs: 900,
    status: "ok",
    verdict:
      "A plain read. Safe and idempotent, so any proxy, CDN, or client retry logic can repeat it without asking permission. The ETag in the response is what makes the next request cheap.",
    request: [
      s("GET /api/articles/42 HTTP/1.1", "Method, path, version. The whole intent of the request lives on this line."),
      h("Host: api.stackblueprint.com", "Required in HTTP/1.1. One IP can serve thousands of hostnames."),
      h("Accept: application/json", "Content negotiation. The client states what it can parse."),
      h("Accept-Encoding: gzip, br", "Which compression the client understands."),
      h("Authorization: Bearer eyJhbGciOi...", "HTTP does not authenticate users. This token does."),
      blank,
    ],
    response: [
      s("HTTP/1.1 200 OK", "Status line. 2xx means the server did what was asked."),
      h("Content-Type: application/json", "How to interpret the bytes below."),
      h("Content-Length: 187", "Where the body ends, so the connection can be reused."),
      h('ETag: "a3f19c"', "A version fingerprint. Send it back next time to skip the body entirely."),
      h("Cache-Control: max-age=300", "Any cache may serve this for 5 minutes without asking again."),
      blank,
      b('{ "id": 42, "title": "Designing a VPC",'),
      b('  "author": "yash", "readMinutes": 9 }'),
    ],
  },
  {
    id: "post",
    label: "POST a payment",
    serverMs: 1600,
    status: "ok",
    verdict:
      "POST is neither safe nor idempotent by default. The Idempotency-Key header is what makes a retry after a timeout harmless. Without it, a dropped response means the customer may be charged twice.",
    request: [
      s("POST /api/payments HTTP/1.1", "POST creates or triggers. Repeating it is not automatically safe."),
      h("Host: api.stackblueprint.com", "Target host."),
      h("Content-Type: application/json", "Describes the request body, not the response."),
      h("Idempotency-Key: 7c1e-4b90-a2", "The client generates this once and reuses it on every retry."),
      h("Content-Length: 54", "Body size in bytes."),
      blank,
      b('{ "amountCents": 4900, "currency": "USD",'),
      b('  "customerId": "cus_18f" }'),
    ],
    response: [
      s("HTTP/1.1 201 Created", "A new resource exists. 201 is more precise than a bare 200."),
      h("Location: /api/payments/pay_9d2", "Where the thing that was just created now lives."),
      h("Content-Type: application/json", "Body format."),
      blank,
      b('{ "id": "pay_9d2", "status": "succeeded" }'),
    ],
  },
  {
    id: "304",
    label: "Conditional revalidation",
    serverMs: 350,
    status: "cache",
    verdict:
      "The client already has the body cached and only wants to know whether it is stale. The server compares the ETag, finds a match, and sends a response with no body at all. Roughly 190 bytes instead of several kilobytes.",
    request: [
      s("GET /api/articles/42 HTTP/1.1", "Same request as before."),
      h("Host: api.stackblueprint.com", "Target host."),
      h('If-None-Match: "a3f19c"', "The ETag the client already holds. The whole trick is this one header."),
      blank,
    ],
    response: [
      s("HTTP/1.1 304 Not Modified", "Your copy is still current. Reuse it."),
      h('ETag: "a3f19c"', "Confirms which version is still valid."),
      h("Cache-Control: max-age=300", "Refreshes the freshness window."),
      blank,
    ],
  },
  {
    id: "429",
    label: "Rate limited",
    serverMs: 200,
    status: "warn",
    verdict:
      "4xx means the client did something the server will not accept. Retry-After turns a rejection into a usable instruction: back off for this many seconds. A client that ignores it makes the overload worse.",
    request: [
      s("GET /api/articles/42 HTTP/1.1", "The 61st request this minute."),
      h("Host: api.stackblueprint.com", "Target host."),
      h("Authorization: Bearer eyJhbGciOi...", "Identifies which quota bucket to charge."),
      blank,
    ],
    response: [
      s("HTTP/1.1 429 Too Many Requests", "The client is over its quota."),
      h("Retry-After: 30", "Wait 30 seconds. This is an instruction, not a suggestion."),
      h("X-RateLimit-Limit: 60", "The ceiling per window."),
      h("X-RateLimit-Remaining: 0", "Nothing left in this window."),
      blank,
      b('{ "error": "rate_limit_exceeded" }'),
    ],
  },
  {
    id: "504",
    label: "Upstream timeout",
    serverMs: 3200,
    status: "err",
    verdict:
      "5xx is the server admitting the failure is on its side. A 504 specifically means a gateway gave up waiting on something behind it. This is exactly the failure that cascades when clients have no timeouts of their own.",
    request: [
      s("GET /api/reports/quarterly HTTP/1.1", "An expensive aggregation query."),
      h("Host: api.stackblueprint.com", "Target host."),
      h("Accept: application/json", "Expected format."),
      blank,
    ],
    response: [
      s("HTTP/1.1 504 Gateway Timeout", "The gateway waited for the upstream service and gave up."),
      h("Content-Type: application/json", "Error body format."),
      h("Retry-After: 5", "Backoff hint, if the client bothers to read it."),
      blank,
      b('{ "error": "upstream_timeout",'),
      b('  "upstream": "reporting-svc" }'),
    ],
  },
];

const LINE_MS = 500;
const FLY_MS = 3500;

export const HttpReqResViewer: React.FC = () => {
  const [idx, setIdx] = useState(0);
  const [running, setRunning] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const sc = SCENARIOS[idx];

  const marks = useMemo(() => {
    const reqEnd = sc.request.length * LINE_MS;
    const flyEnd = reqEnd + FLY_MS;
    const thinkEnd = flyEnd + sc.serverMs;
    const backEnd = thinkEnd + FLY_MS;
    const resEnd = backEnd + sc.response.length * LINE_MS;
    return { reqEnd, flyEnd, thinkEnd, backEnd, resEnd };
  }, [sc]);

  const [t, setT] = useClock(running, sc.id);

  useEffect(() => {
    if (running && t >= marks.resEnd) setRunning(false);
  }, [t, running, marks.resEnd]);

  useEffect(() => {
    setRunning(false);
    setHint(null);
  }, [idx]);

  const reqShown = Math.min(Math.floor(t / LINE_MS), sc.request.length);
  const resShown =
    t <= marks.backEnd
      ? 0
      : Math.min(Math.floor((t - marks.backEnd) / LINE_MS), sc.response.length);

  const phase =
    t === 0
      ? "idle"
      : t < marks.reqEnd
      ? "writing"
      : t < marks.flyEnd
      ? "sending"
      : t < marks.thinkEnd
      ? "processing"
      : t < marks.backEnd
      ? "returning"
      : t < marks.resEnd
      ? "reading"
      : "done";

  // Packet position across the wire, 0 = client, 1 = server.
  let pos = 0;
  let visible = false;
  if (phase === "sending") {
    pos = (t - marks.reqEnd) / FLY_MS;
    visible = true;
  } else if (phase === "returning") {
    pos = 1 - (t - marks.thinkEnd) / FLY_MS;
    visible = true;
  }

  const statusColor =
    sc.status === "ok"
      ? "text-emerald-400"
      : sc.status === "cache"
      ? "text-sky-400"
      : sc.status === "warn"
      ? "text-amber-400"
      : "text-red-400";

  const renderLines = (lines: Line[], shown: number, isRes: boolean) => (
    <div className="min-h-[210px] rounded-lg bg-slate-950 p-4 font-mono text-[12px] leading-6">
      {lines.slice(0, shown).map((ln, i) => {
        if (ln.tone === "blank")
          return <div key={i} className="h-3" aria-hidden />;
        const color =
          ln.tone === "start"
            ? isRes
              ? statusColor
              : "text-blue-400"
            : ln.tone === "body"
            ? "text-slate-400"
            : "text-slate-300";
        return (
          <div
            key={i}
            onMouseEnter={() => ln.hint && setHint(ln.hint)}
            onMouseLeave={() => setHint(null)}
            className={`${color} ${
              ln.hint ? "cursor-help rounded px-1 -mx-1 hover:bg-white/10" : ""
            } ${ln.tone === "start" ? "font-semibold" : ""}`}
          >
            {ln.tone === "header" ? (
              <>
                <span className="text-violet-400">
                  {ln.text.slice(0, ln.text.indexOf(":") + 1)}
                </span>
                {ln.text.slice(ln.text.indexOf(":") + 1)}
              </>
            ) : (
              ln.text
            )}
          </div>
        );
      })}
      {shown < lines.length && shown > 0 && (
        <span className="inline-block h-4 w-2 animate-pulse bg-slate-500 align-middle" />
      )}
    </div>
  );

  return (
    <Panel
      label="Animated"
      title="An HTTP exchange, line by line"
      footnote="Hover any line for what it does. Every request is text with a start line, headers, a blank line, and an optional body. That is the entire format."
    >
      <div className="mb-6 flex flex-wrap gap-2">
        {SCENARIOS.map((x, i) => (
          <button
            key={x.id}
            onClick={() => setIdx(i)}
            className={`rounded-full px-4 py-2 text-xs font-bold transition shadow-sm border ${
              i === idx
                ? "border-blue-600 bg-blue-600 text-white shadow-blue-500/30"
                : "border-slate-300 bg-white text-slate-600 hover:border-blue-400 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-blue-500"
            }`}
          >
            {x.label}
          </button>
        ))}
      </div>

      {/* The wire */}
      <div className="relative mb-6 flex items-center gap-4 rounded-2xl border border-slate-200/60 bg-white p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] dark:border-slate-800/80 dark:bg-[#0B1120] overflow-hidden">
        
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[url('https://play.tailwindcss.com/img/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-10 dark:opacity-5" />

        <div className="relative z-10 w-28 shrink-0 flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
          <Globe className="h-6 w-6 text-blue-500" />
          <div className="text-center">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">Client</div>
            <div className="text-[9px] font-medium text-slate-500">browser</div>
          </div>
        </div>

        <div className="relative h-[2px] flex-1 rounded bg-slate-200 dark:bg-slate-800">
          <div className="absolute inset-0 border-b-2 border-dashed border-slate-300 dark:border-slate-700" />
          <div
            style={{ left: `calc(${Math.min(Math.max(pos, 0), 1) * 100}% - 24px)` }}
            className={`absolute top-1/2 -translate-y-1/2 flex h-8 items-center rounded-full px-4 text-xs font-black tracking-widest text-white shadow-[0_0_15px_rgba(0,0,0,0.3)] ring-2 ring-white dark:ring-[#0B1120] transition-none z-20 ${
              visible ? "opacity-100 scale-100" : "opacity-0 scale-75"
            } ${phase === "returning" ? "bg-emerald-500 shadow-emerald-500/50" : "bg-blue-600 shadow-blue-500/50"}`}
          >
            {phase === "returning" ? "RES" : "REQ"}
          </div>
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 rounded-full bg-slate-100 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 shadow-sm dark:bg-slate-800 dark:text-slate-400">
            {phase === "processing" ? "server working" : phase}
          </span>
        </div>

        <div
          className={`relative z-10 w-28 shrink-0 flex flex-col items-center gap-2 rounded-xl border p-3 transition-colors duration-500 shadow-sm ${
            phase === "processing"
              ? "border-amber-400 bg-amber-50 dark:border-amber-500/50 dark:bg-amber-950/40"
              : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/80"
          }`}
        >
          <Server className={`h-6 w-6 transition-colors duration-500 ${phase === "processing" ? "text-amber-500" : "text-emerald-500"}`} />
          <div className="text-center">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">Server</div>
            <div className={`text-[9px] font-medium transition-colors duration-500 ${phase === "processing" ? "text-amber-600 dark:text-amber-400" : "text-slate-500"}`}>
              {phase === "processing" ? `${sc.serverMs} ms` : "api"}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col">
          <div className="mb-2 flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-blue-100 text-[10px] text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">▶</span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Request</span>
          </div>
          <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50/50 p-1 shadow-sm dark:border-slate-800 dark:bg-slate-900/50 backdrop-blur-sm overflow-hidden">
             {renderLines(sc.request, reqShown, false)}
          </div>
        </div>
        <div className="flex flex-col">
          <div className="mb-2 flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-emerald-100 text-[10px] text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400">◀</span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Response</span>
          </div>
          <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50/50 p-1 shadow-sm dark:border-slate-800 dark:bg-slate-900/50 backdrop-blur-sm overflow-hidden">
            {renderLines(sc.response, resShown, true)}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3 rounded-lg border-l-4 border-blue-500 bg-blue-50 px-5 py-4 shadow-sm dark:bg-blue-950/30">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
           {hint ?? (phase === "done" ? sc.verdict : "Hover a line to see what it does.")}
        </p>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Btn primary onClick={() => { setT(0); setRunning(true); }}>
          {running ? "Sending…" : "Send request"}
        </Btn>
        <Btn onClick={() => { setRunning(false); setT(marks.resEnd); }}>
          Skip to result
        </Btn>
        <Btn onClick={() => { setRunning(false); setT(0); }}>Reset</Btn>
      </div>
    </Panel>
  );
};

/* ══════════════════════════════════════════════════════════════════════
   2. TLS HANDSHAKE
   TCP setup, then TLS, with the round trip cost made visible.
   ══════════════════════════════════════════════════════════════════════ */

type HsStep = {
  dir: "c2s" | "s2c";
  title: string;
  detail: string;
  layer: "tcp" | "tls" | "app";
  encrypted?: boolean;
  rtt: number;
};

const TLS13: HsStep[] = [
  { dir: "c2s", layer: "tcp", rtt: 1, title: "SYN", detail: "TCP asks to open a connection. Nothing about security has happened yet." },
  { dir: "s2c", layer: "tcp", rtt: 1, title: "SYN-ACK", detail: "The server agrees and picks its own sequence number." },
  { dir: "c2s", layer: "tcp", rtt: 1, title: "ACK", detail: "TCP is established. One full round trip is already spent." },
  { dir: "c2s", layer: "tls", rtt: 2, title: "ClientHello + key share", detail: "Supported TLS versions, cipher suites, SNI (the hostname, in plaintext), and a guess at the key exchange parameters. That guess is what saves a round trip in TLS 1.3." },
  { dir: "s2c", layer: "tls", rtt: 2, title: "ServerHello + key share", detail: "The server picks a cipher suite and returns its own key share. Both sides can now derive the same secret." },
  { dir: "s2c", layer: "tls", rtt: 2, encrypted: true, title: "Certificate + CertificateVerify", detail: "The certificate chain proves the server is allowed to use this hostname. CertificateVerify proves it holds the matching private key. In TLS 1.3 this is already encrypted." },
  { dir: "s2c", layer: "tls", rtt: 2, encrypted: true, title: "Finished", detail: "A MAC over the whole handshake, so a tampered handshake fails here." },
  { dir: "c2s", layer: "tls", rtt: 2, encrypted: true, title: "Finished", detail: "The client confirms it derived the same keys." },
  { dir: "c2s", layer: "app", rtt: 2, encrypted: true, title: "GET /api/articles/42", detail: "Only now does any HTTP travel, and every byte of it is encrypted: method, path, headers, cookies, body." },
];

const TLS12: HsStep[] = [
  { dir: "c2s", layer: "tcp", rtt: 1, title: "SYN", detail: "TCP connection request." },
  { dir: "s2c", layer: "tcp", rtt: 1, title: "SYN-ACK", detail: "Server agrees." },
  { dir: "c2s", layer: "tcp", rtt: 1, title: "ACK", detail: "TCP established." },
  { dir: "c2s", layer: "tls", rtt: 2, title: "ClientHello", detail: "Versions, cipher suites, random. No key share yet, which is why 1.2 needs an extra trip." },
  { dir: "s2c", layer: "tls", rtt: 2, title: "ServerHello + Certificate", detail: "Chosen cipher, certificate chain, server random. All in plaintext in TLS 1.2." },
  { dir: "s2c", layer: "tls", rtt: 2, title: "ServerHelloDone", detail: "The server has said everything it plans to say for now." },
  { dir: "c2s", layer: "tls", rtt: 3, title: "ClientKeyExchange", detail: "The client sends the material needed to derive the shared secret. This is the extra round trip 1.3 removed." },
  { dir: "c2s", layer: "tls", rtt: 3, encrypted: true, title: "ChangeCipherSpec + Finished", detail: "Everything after this point is encrypted." },
  { dir: "s2c", layer: "tls", rtt: 3, encrypted: true, title: "ChangeCipherSpec + Finished", detail: "The server switches too and confirms." },
  { dir: "c2s", layer: "app", rtt: 3, encrypted: true, title: "GET /api/articles/42", detail: "The first HTTP byte, three round trips in." },
];

export const TlsHandshakeDiagram: React.FC = () => {
  const [version, setVersion] = useState<"1.3" | "1.2">("1.3");
  const [i, setI] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const steps = version === "1.3" ? TLS13 : TLS12;

  useEffect(() => {
    setI(-1);
    setPlaying(false);
  }, [version]);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setI((prev) => {
        if (prev >= steps.length - 1) {
          setPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1800);
    return () => clearInterval(id);
  }, [playing, steps.length]);

  const rtts = version === "1.3" ? 2 : 3;
  const secured = i >= steps.findIndex((x) => x.encrypted);
  const active = i >= 0 ? steps[i] : null;

  return (
    <Panel
      label="Animated Sequence"
      title="What happens before the first HTTP byte"
      footnote="TLS 1.3 removed a full round trip and encrypts the certificate exchange. The hostname in SNI is still sent in the clear, which is why a network observer knows which site you visited even over HTTPS."
    >
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="inline-flex overflow-hidden rounded-md border border-slate-300 dark:border-slate-600">
          {(["1.3", "1.2"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setVersion(v)}
              className={`px-4 py-2 text-xs font-bold transition ${
                version === v
                  ? "bg-blue-600 text-white"
                  : "bg-transparent text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              TLS {v}
            </button>
          ))}
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300 shadow-sm border border-slate-200 dark:border-slate-700">
          {rtts} round trips before any HTTP
        </span>
        <span
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all duration-500 shadow-sm border ${
            secured
              ? "bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800/50"
              : "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800/50"
          }`}
        >
          {secured ? <Lock size={12}/> : <Lock size={12} className="opacity-50"/>}
          {secured ? "encrypted" : "plaintext"}
        </span>
      </div>

      <div className="relative w-full rounded-2xl border border-slate-200/60 bg-white shadow-[0_2px_20px_-8px_rgba(0,0,0,0.1)] dark:border-slate-800/80 dark:bg-[#0B1120] overflow-hidden font-sans pb-12">
        
        {/* Subtle grid background for modern feel */}
        <div className="absolute inset-0 bg-[url('https://play.tailwindcss.com/img/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20 dark:opacity-10" />

        {/* Top Headers */}
        <div className="absolute top-8 left-[20%] -translate-x-1/2 flex flex-col items-center">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-b from-blue-50 to-blue-100/50 text-blue-600 shadow-[0_0_0_1px_rgba(37,99,235,0.2)] dark:from-blue-900/40 dark:to-blue-900/10 dark:text-blue-400 dark:shadow-[0_0_0_1px_rgba(59,130,246,0.3)] z-10">
            <Globe size={26} strokeWidth={1.5} />
            <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-[3px] ring-white dark:ring-[#0B1120]" />
          </div>
          <span className="mt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Client</span>
        </div>

        <div className="absolute top-8 left-[80%] -translate-x-1/2 flex flex-col items-center">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-b from-emerald-50 to-emerald-100/50 text-emerald-600 shadow-[0_0_0_1px_rgba(16,185,129,0.2)] dark:from-emerald-900/40 dark:to-emerald-900/10 dark:text-emerald-400 dark:shadow-[0_0_0_1px_rgba(16,185,129,0.3)] z-10">
            <Server size={26} strokeWidth={1.5} />
            <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-[3px] ring-white dark:ring-[#0B1120]" />
          </div>
          <span className="mt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Server</span>
        </div>

        {/* Vertical Lifelines */}
        <div className="absolute top-32 bottom-4 left-[20%] border-l-[1.5px] border-dashed border-slate-200 dark:border-slate-800" />
        <div className="absolute top-32 bottom-4 left-[80%] border-l-[1.5px] border-dashed border-slate-200 dark:border-slate-800" />

        {/* Dynamic Sequence Steps */}
        <div className="pt-[150px] space-y-7">
          <AnimatePresence>
          {steps.map((st, n) => {
            const shown = n <= i;
            if (!shown) return <div key={n} className="h-7" />; // placeholder
            
            const isC2S = st.dir === "c2s";
            
            let color = "bg-slate-400 shadow-slate-400/50";
            let textColor = "text-slate-700 dark:text-slate-300";
            
            if (st.layer === "tls") {
              if (st.encrypted) {
                color = "bg-emerald-500 shadow-emerald-500/50";
                textColor = "text-emerald-700 dark:text-emerald-400";
              } else {
                color = "bg-violet-500 shadow-violet-500/50";
                textColor = "text-violet-700 dark:text-violet-400";
              }
            }
            if (st.layer === "app") {
              color = "bg-rose-500 shadow-rose-500/50";
              textColor = "text-rose-700 dark:text-rose-400";
            }
            
            return (
              <div key={n} className="relative h-7 w-full z-10">
                <div className="absolute left-[20%] right-[20%] h-full flex items-center">
                  
                  {/* Subtle track background */}
                  <div className="absolute inset-0 top-1/2 -translate-y-1/2 h-[1px] bg-slate-100 dark:bg-slate-800/60" />
                  
                  {/* The moving packet pill */}
                  <motion.div 
                    initial={{ left: isC2S ? "0%" : "100%", width: "0%" }} 
                    animate={{ left: isC2S ? "0%" : "0%", width: "100%" }} 
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    className={`absolute top-1/2 -translate-y-1/2 h-[3px] rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)] ${color}`}
                  />
                  
                  {/* Floating badge for the label */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8, y: 0 }} 
                    animate={{ opacity: 1, scale: 1, y: 0 }} 
                    transition={{ delay: 0.4, type: "spring", stiffness: 200, damping: 20 }}
                    className="absolute top-1/2 -translate-y-1/2 w-full flex justify-center pointer-events-none"
                  >
                    <div className={`flex items-center gap-1.5 px-3 py-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-full shadow-sm border border-slate-200/60 dark:border-slate-700/60 text-[10px] font-bold tracking-wide ${textColor}`}>
                      {st.encrypted && <ShieldCheck size={14} strokeWidth={2.5} />}
                      {st.title}
                    </div>
                  </motion.div>
                </div>
              </div>
            );
          })}
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Btn primary onClick={() => { setI(-1); setPlaying(true); }}>
          {playing ? "Playing…" : "Play handshake"}
        </Btn>
        <Btn onClick={() => { setPlaying(false); setI((p) => Math.max(-1, p - 1)); }} disabled={i < 0}>
          Back
        </Btn>
        <Btn onClick={() => { setPlaying(false); setI((p) => Math.min(steps.length - 1, p + 1)); }} disabled={i >= steps.length - 1}>
          Next
        </Btn>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Step {Math.max(i + 1, 0)} of {steps.length}
        </span>
      </div>

      <div className="mt-4 min-h-[72px] rounded-lg border-l-4 border-violet-500 bg-violet-50 px-5 py-4 shadow-sm dark:bg-violet-950/30">
        {active ? (
          <motion.div key={active.title} initial={{opacity: 0, x: -10}} animate={{opacity:1, x:0}}>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              {active.layer.toUpperCase()}: {active.title} {active.encrypted && <ShieldCheck size={14} className="text-emerald-600"/>}
            </p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {active.detail}
            </p>
          </motion.div>
        ) : (
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            Press play. Notice how much happens before a single byte of HTTP
            moves, and why connection reuse matters so much.
          </p>
        )}
      </div>
    </Panel>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   3. HTTP VERSIONS
   Six assets, three protocols, one packet loss toggle.
   ══════════════════════════════════════════════════════════════════════ */

type Seg = { start: number; end: number; stalled?: boolean };
type Stream = { name: string; segs: Seg[] };

const ASSETS = ["app.js", "style.css", "hero.jpg", "font.woff2", "logo.svg", "data.json"];
const LOSS_AT = 3;
const LOSS_LEN = 3;
const XFER = 6;

function buildStreams(version: "1.1" | "2" | "3", loss: boolean): Stream[] {
  if (version === "1.1") {
    // Two connections, strictly serialized on each. Browsers open ~6, but the
    // point is the same: concurrency comes from opening more sockets.
    // A stall on a connection pushes every later request behind it.
    return ASSETS.map((name, i) => {
      const lane = i % 2;
      const slot = Math.floor(i / 2);
      const shift = loss && lane === 0 && slot > 0 ? LOSS_LEN : 0;
      const start = slot * 4 + shift;
      let segs: Seg[] = [{ start, end: start + 4 }];
      if (loss && lane === 0 && slot === 0) {
        segs = [
          { start, end: LOSS_AT },
          { start: LOSS_AT, end: LOSS_AT + LOSS_LEN, stalled: true },
          { start: LOSS_AT + LOSS_LEN, end: 4 + LOSS_LEN },
        ];
      }
      return { name: `${name}  (conn ${lane + 1})`, segs };
    });
  }

  if (version === "2") {
    // One TCP connection. A lost segment stalls every stream on it.
    return ASSETS.map((name) => {
      if (!loss) return { name, segs: [{ start: 0, end: XFER }] };
      return {
        name,
        segs: [
          { start: 0, end: LOSS_AT },
          { start: LOSS_AT, end: LOSS_AT + LOSS_LEN, stalled: true },
          { start: LOSS_AT + LOSS_LEN, end: XFER + LOSS_LEN },
        ],
      };
    });
  }

  // HTTP/3 over QUIC. Streams are independent, so loss hits one stream only.
  return ASSETS.map((name, i) => {
    if (!loss || i !== 2) return { name, segs: [{ start: 0, end: XFER }] };
    return {
      name,
      segs: [
        { start: 0, end: LOSS_AT },
        { start: LOSS_AT, end: LOSS_AT + LOSS_LEN, stalled: true },
        { start: LOSS_AT + LOSS_LEN, end: XFER + LOSS_LEN },
      ],
    };
  });
}

const VERSION_META = {
  "1.1": { label: "HTTP/1.1", transport: "TCP", color: "bg-slate-400", note: "One response at a time per connection. Concurrency means opening more sockets." },
  "2": { label: "HTTP/2", transport: "TCP", color: "bg-blue-500", note: "All streams multiplexed on one TCP connection. Solves HTTP head of line blocking." },
  "3": { label: "HTTP/3", transport: "QUIC over UDP", color: "bg-violet-500", note: "Independent streams. A lost packet stalls only the stream it belonged to." },
} as const;

const TICK_MS = 170;

export const HttpVersionsDiagram: React.FC = () => {
  const [loss, setLoss] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [clock, setClock] = useState(0);

  const lanes = useMemo(
    () =>
      (["1.1", "2", "3"] as const).map((v) => ({
        v,
        streams: buildStreams(v, loss),
      })),
    [loss]
  );

  const total = useMemo(
    () =>
      Math.max(
        ...lanes.flatMap((l) => l.streams.flatMap((s) => s.segs.map((g) => g.end)))
      ),
    [lanes]
  );

  useEffect(() => {
    setClock(0);
    setPlaying(false);
  }, [loss]);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setClock((c) => {
        if (c >= total) {
          setPlaying(false);
          return total;
        }
        return c + 0.25;
      });
    }, TICK_MS / 4);
    return () => clearInterval(id);
  }, [playing, total]);

  // The interesting number is not just the last finish. Under packet loss,
  // HTTP/2 and HTTP/3 both end at the same tick, but H2 stalls all six streams
  // while H3 stalls exactly one. The summary has to say that out loud.
  const summarise = (streams: Stream[]) => {
    const finishes = streams
      .map((s) => s.segs[s.segs.length - 1].end)
      .sort((a, b) => a - b);
    const first = finishes[0];
    const last = finishes[finishes.length - 1];
    const nFirst = finishes.filter((f) => f === first).length;
    return {
      last,
      text:
        first === last
          ? `all ${finishes.length} finish at t=${last}`
          : `${nFirst} finish at t=${first}, last at t=${last}`,
    };
  };

  return (
    <Panel
      label="Animated"
      title="Loading six assets over each protocol version"
      footnote="Turn on packet loss and watch the difference. HTTP/2 fixed blocking at the HTTP layer but still rides one TCP connection, so a single lost segment stalls every stream. QUIC gives each stream its own delivery guarantee."
    >
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Btn primary onClick={() => { setClock(0); setPlaying(true); }}>
          {playing ? "Loading…" : "Run the load"}
        </Btn>
        <label className="flex cursor-pointer items-center gap-2 rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 dark:border-slate-600 dark:text-slate-300">
          <input
            type="checkbox"
            checked={loss}
            onChange={(e) => setLoss(e.target.checked)}
            className="h-3.5 w-3.5 accent-red-500"
          />
          Drop a packet mid-transfer
        </label>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          t = {clock.toFixed(1)} / {total}
        </span>
      </div>

      <div className="space-y-5">
        {lanes.map(({ v, streams }) => {
          const meta = VERSION_META[v];
          const summary = summarise(streams);
          const done = clock >= summary.last;
          return (
            <div
              key={v}
              className="rounded-lg border border-slate-200 p-3 dark:border-slate-700"
            >
              <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {meta.label}
                  </span>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    {meta.transport}
                  </span>
                </div>
                <span
                  className={`font-mono text-xs transition-colors duration-300 ${
                    done
                      ? "font-semibold text-emerald-600 dark:text-emerald-400"
                      : "text-slate-400"
                  }`}
                >
                  {summary.text}
                </span>
              </div>

              <div className="relative space-y-1">
                {streams.map((st) => (
                  <div key={st.name} className="flex items-center gap-2">
                    <span className="w-32 shrink-0 truncate font-mono text-[10px] text-slate-500 dark:text-slate-400">
                      {st.name}
                    </span>
                    <div className="relative h-3.5 flex-1 rounded bg-slate-100 dark:bg-slate-800">
                      {st.segs.map((g, gi) => {
                        const visEnd = Math.min(clock, g.end);
                        if (visEnd <= g.start) return null;
                        return (
                          <div
                            key={gi}
                            style={{
                              left: `${(g.start / total) * 100}%`,
                              width: `${((visEnd - g.start) / total) * 100}%`,
                            }}
                            className={`absolute top-0 h-4 rounded-sm shadow-sm transition-all duration-300 ${
                              g.stalled
                                ? "bg-red-500/80 animate-pulse bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,rgba(0,0,0,0.15)_4px,rgba(0,0,0,0.15)_8px)]"
                                : `${meta.color} bg-gradient-to-b from-white/20 to-transparent border border-black/10`
                            }`}
                            title={g.stalled ? "stalled waiting for retransmit" : "transferring"}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Playhead. Offset by the label column so the percentage is
                    measured against the bar track, not the whole row. */}
                <div className="pointer-events-none absolute inset-y-0 right-0 left-[8.5rem]">
                  <div
                    style={{ left: `${(Math.min(clock, total) / total) * 100}%` }}
                    className="absolute top-0 h-full w-px bg-slate-900/40 dark:bg-white/40"
                  />
                </div>
              </div>

              <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                {meta.note}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-5 rounded-sm bg-blue-500" /> transferring
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-5 rounded-sm bg-red-500/70" /> stalled on retransmit
        </span>
      </div>
    </Panel>
  );
};

/* ══════════════════════════════════════════════════════════════════════
   4. CACHE + CONDITIONAL REQUESTS
   Cold miss, revalidation, and a fresh hit, side by side.
   ══════════════════════════════════════════════════════════════════════ */

type CacheCase = {
  id: string;
  label: string;
  reqLine: string;
  resLine: string;
  hitsNetwork: boolean;
  hitsOrigin: boolean;
  bytes: number;
  ms: number;
  tone: string;
  explain: string;
};

const CACHE_CASES: CacheCase[] = [
  {
    id: "cold",
    label: "Cold miss",
    reqLine: "GET /api/articles/42",
    resLine: "200 OK  +  full body  +  ETag \"a3f19c\"",
    hitsNetwork: true,
    hitsOrigin: true,
    bytes: 18400,
    ms: 240,
    tone: "bg-red-500",
    explain:
      "Nothing cached yet. Full round trip to the origin and the entire body comes back. The response carries Cache-Control: max-age=300 and an ETag, which is what makes the next two cases possible.",
  },
  {
    id: "revalidate",
    label: "Stale, revalidate",
    reqLine: "GET /api/articles/42  +  If-None-Match: \"a3f19c\"",
    resLine: "304 Not Modified  +  no body",
    hitsNetwork: true,
    hitsOrigin: true,
    bytes: 190,
    ms: 60,
    tone: "bg-amber-500",
    explain:
      "The 5 minute freshness window expired, so the cache asks whether its copy is still good. The ETag matches, the server returns 304 with no body, and the cached bytes get reused. About 99 percent of the bytes saved for one small round trip.",
  },
  {
    id: "fresh",
    label: "Fresh hit",
    reqLine: "(no request leaves the client)",
    resLine: "served from cache",
    hitsNetwork: false,
    hitsOrigin: false,
    bytes: 0,
    ms: 1,
    tone: "bg-emerald-500",
    explain:
      "Still inside max-age, so the cache answers without touching the network at all. This is the only case that also survives the origin being down.",
  },
];

const MAX_BYTES = 18400;
const MAX_MS = 240;

export const HttpCacheDiagram: React.FC = () => {
  const [idx, setIdx] = useState(0);
  const [running, setRunning] = useState(false);
  const c = CACHE_CASES[idx];
  const [t] = useClock(running, c.id, 50);

  const DUR = 1800;
  useEffect(() => {
    if (running && t >= DUR) setRunning(false);
  }, [t, running]);

  const p = Math.min(t / DUR, 1);
  // Hop reveal: client -> cache -> (network) -> origin -> back
  const stage = c.hitsNetwork
    ? p < 0.2
      ? 0
      : p < 0.45
      ? 1
      : p < 0.7
      ? 2
      : 3
    : p < 0.35
    ? 0
    : 3;

  const nodes = c.hitsNetwork
    ? ["Client", "Cache / CDN", "Origin server"]
    : ["Client", "Cache / CDN"];

  return (
    <Panel
      label="Animated"
      title="What an ETag actually saves you"
      footnote="Caching is not only a speed optimisation. A fresh hit is the one path that still works when the origin is down, which is why Cache-Control is a resilience decision as much as a performance one."
    >
      <div className="mb-6 flex flex-wrap gap-2">
        {CACHE_CASES.map((x, i) => (
          <button
            key={x.id}
            onClick={() => setIdx(i)}
            className={`rounded-full px-4 py-2 text-xs font-bold transition shadow-sm border ${
              i === idx
                ? "border-blue-600 bg-blue-600 text-white shadow-blue-500/30"
                : "border-slate-300 bg-white text-slate-600 hover:border-blue-400 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-blue-500"
            }`}
          >
            {x.label}
          </button>
        ))}
      </div>

      {/* Path */}
      <div className="relative rounded-2xl border border-slate-200/60 bg-white px-6 py-8 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] dark:border-slate-800/80 dark:bg-[#0B1120] overflow-hidden">
        
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[url('https://play.tailwindcss.com/img/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-10 dark:opacity-5" />
        
        <div className="relative z-10 flex items-center justify-between gap-4">
          {nodes.map((n, i) => {
            const isClient = i === 0;
            const isCache = i === 1;
            const isOrigin = i === 2;
            const active = stage >= i;
            
            return (
              <React.Fragment key={n}>
                <div
                  className={`relative flex flex-col items-center justify-center flex-1 rounded-xl border p-4 transition-all duration-500 shadow-sm ${
                    active
                      ? isOrigin ? "border-amber-400 bg-amber-50 dark:border-amber-500/50 dark:bg-amber-950/40" 
                        : isCache ? "border-emerald-400 bg-emerald-50 dark:border-emerald-500/50 dark:bg-emerald-950/40"
                        : "border-blue-400 bg-blue-50 dark:border-blue-500/50 dark:bg-blue-950/40"
                      : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/60"
                  }`}
                >
                  <div className={`mb-2 p-2 rounded-full ${
                    active 
                      ? isOrigin ? "bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400"
                        : isCache ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400"
                        : "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400"
                      : "bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600"
                  } transition-colors duration-500`}>
                    {isClient && <Globe size={20} />}
                    {isCache && <Database size={20} />}
                    {isOrigin && <Server size={20} />}
                  </div>
                  <div className={`text-[11px] font-bold uppercase tracking-wider ${active ? "text-slate-800 dark:text-slate-100" : "text-slate-400 dark:text-slate-500"}`}>
                    {n}
                  </div>
                  {isCache && !c.hitsOrigin && stage >= 1 && (
                    <div className="absolute -bottom-3 rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-700 border border-emerald-200 shadow-sm dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800">
                      answers directly
                    </div>
                  )}
                </div>
                {i < nodes.length - 1 && (
                  <div className="relative h-[2px] w-12 shrink-0 bg-slate-200 dark:bg-slate-800">
                    <div className="absolute inset-0 border-b-2 border-dashed border-slate-300 dark:border-slate-700" />
                    <span
                      className={`absolute top-1/2 -translate-y-1/2 h-2.5 w-4 rounded-full transition-all duration-500 motion-reduce:transition-none shadow-[0_0_8px_rgba(0,0,0,0.3)] ${
                        i === 0 ? "bg-blue-500 shadow-blue-500/50" : "bg-emerald-500 shadow-emerald-500/50"
                      } ${
                        stage > i ? "left-[calc(100%-16px)] opacity-100 scale-100" : "left-0 opacity-0 scale-75"
                      }`}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div className="relative z-10 mt-8 rounded-xl bg-slate-950 p-4 font-mono text-[11px] leading-relaxed text-slate-300 shadow-inner">
          <div className={`flex gap-3 transition-opacity duration-300 ${p > 0.1 ? "opacity-100" : "opacity-0"}`}>
            <span className="text-blue-400 font-bold shrink-0">→</span>
            <span className="text-slate-300">{c.reqLine}</span>
          </div>
          <div className={`flex gap-3 transition-opacity duration-300 mt-2 ${p > 0.75 ? "opacity-100" : "opacity-0"}`}>
            <span className="text-emerald-400 font-bold shrink-0">←</span>
            <span className="text-slate-300">{c.resLine}</span>
          </div>
        </div>
      </div>

      {/* Cost bars */}
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        {[
          { k: "Bytes over the network", v: c.bytes, max: MAX_BYTES, unit: "B" },
          { k: "Time to first byte", v: c.ms, max: MAX_MS, unit: "ms" },
        ].map((bar) => (
          <div key={bar.k}>
            <div className="mb-2 flex items-baseline justify-between text-xs">
              <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide text-[10px]">{bar.k}</span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                {bar.v.toLocaleString("en-US")} {bar.unit}
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 shadow-inner dark:bg-slate-800">
              <div
                style={{ width: `${(bar.v / bar.max) * 100 * (p > 0.75 ? 1 : 0)}%` }}
                className={`h-full rounded-full transition-all duration-1000 ease-out motion-reduce:transition-none shadow-sm bg-gradient-to-r ${
                  c.tone === "bg-red-500" ? "from-red-600 to-red-400" :
                  c.tone === "bg-amber-500" ? "from-amber-600 to-amber-400" :
                  "from-emerald-600 to-emerald-400"
                }`}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Btn primary onClick={() => setRunning(true)}>
          {running ? "Running…" : "Run this case"}
        </Btn>
      </div>

      <div className="mt-5 rounded-lg border-l-4 border-violet-500 bg-violet-50 px-5 py-4 shadow-sm dark:bg-violet-950/30">
        <p className="text-sm font-medium leading-relaxed text-slate-700 dark:text-slate-200">
          {c.explain}
        </p>
      </div>
    </Panel>
  );
};

export default {
  HttpReqResViewer,
  TlsHandshakeDiagram,
  HttpVersionsDiagram,
  HttpCacheDiagram,
};
