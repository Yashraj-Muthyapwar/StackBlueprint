/**
 * DnsVisuals.tsx
 *
 * Animated diagrams for the "Domain Name System (DNS)" lesson.
 *
 * Everything is drawn as inline SVG in a fixed design space so that text,
 * icons and stroke weights scale together on small screens. Colour comes from
 * Tailwind `fill-*` / `stroke-*` utilities with `dark:` variants, so the
 * diagrams follow the site theme without any JS theme detection.
 *
 * Wired into SectionRenderer as:
 *
 *   case "dns-resolution-walkthrough": return <DnsResolutionWalkthrough />;
 *   case "dns-hierarchy-diagram":      return <DnsHierarchyDiagram />;
 *   case "dns-query-types-diagram":    return <DnsQueryTypesDiagram />;
 *   case "dns-record-explorer":        return <DnsRecordExplorer />;
 *   case "dns-cache-journey":          return <DnsCacheJourney />;
 */

import React, { useEffect, useMemo, useState } from "react";
// `motion` is the package this project declares; `framer-motion` is only present
// transitively. Importing both into one tree loads two independent copies of the
// library and AnimatePresence exit animations silently stop completing.
import { motion } from "motion/react";
import { FileText, Clock } from "lucide-react";

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
      <h4 className="mt-0.5 text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h4>
    </div>
    <div className="p-5">{children}</div>
    {footnote && (
      <figcaption className="border-t border-slate-200 bg-slate-50 px-5 py-2.5 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400">
        {footnote}
      </figcaption>
    )}
  </figure>
);

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
        ? "rounded-md bg-blue-600 px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/25 transition hover:bg-blue-700 disabled:opacity-40"
        : "rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-100 disabled:opacity-40 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
    }
  >
    {children}
  </button>
);

const Pill: React.FC<{
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`rounded-full border px-4 py-2 text-xs font-bold shadow-sm transition ${
      active
        ? "border-blue-600 bg-blue-600 text-white shadow-blue-500/30"
        : "border-slate-300 bg-white text-slate-600 hover:border-blue-400 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-blue-500"
    }`}
  >
    {children}
  </button>
);

/** Stage chrome shared by every SVG diagram. */
const Stage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-gradient-to-b from-white to-slate-50/60 shadow-[0_2px_24px_-12px_rgba(15,23,42,0.25)] dark:border-slate-800 dark:from-[#0B1120] dark:to-[#0B1120]">
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
        backgroundSize: "24px 24px",
        color: "rgb(148 163 184 / 0.35)",
        maskImage: "linear-gradient(180deg, black, transparent)",
        WebkitMaskImage: "linear-gradient(180deg, black, transparent)",
      }}
    />
    <div className="relative">{children}</div>
  </div>
);

/* ── Inline icon glyphs ────────────────────────────────────────────────
   Drawn in a 24×24 local space and scaled, so they stay crisp and scale
   with the diagram instead of fighting it like an HTML overlay would.   */

type GlyphName = "monitor" | "hub" | "globe" | "layers" | "server" | "router" | "cpu";

const GLYPHS: Record<GlyphName, React.ReactNode> = {
  monitor: (
    <>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </>
  ),
  hub: (
    <>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.6 10.5l6.8-4M8.6 13.5l6.8 4" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18z" />
    </>
  ),
  layers: (
    <>
      <path d="M12 2l10 5-10 5L2 7z" />
      <path d="M2 12l10 5 10-5" />
      <path d="M2 17l10 5 10-5" />
    </>
  ),
  server: (
    <>
      <rect x="2" y="3" width="20" height="7" rx="2" />
      <rect x="2" y="14" width="20" height="7" rx="2" />
      <path d="M6 6.5h.01M6 17.5h.01" />
    </>
  ),
  router: (
    <>
      <rect x="2" y="13" width="20" height="8" rx="2" />
      <path d="M6 17h.01M10 17h.01" />
      <path d="M12 9a5 5 0 0 0-3.5 1.5M12 5a9 9 0 0 0-6.4 2.6" />
    </>
  ),
  cpu: (
    <>
      <rect x="5" y="5" width="14" height="14" rx="2" />
      <rect x="9" y="9" width="6" height="6" rx="1" />
      <path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" />
    </>
  ),
};

const Glyph: React.FC<{
  name: GlyphName;
  x: number;
  y: number;
  size: number;
  className: string;
}> = ({ name, x, y, size, className }) => (
  <g
    transform={`translate(${x - size / 2} ${y - size / 2}) scale(${size / 24})`}
    fill="none"
    strokeWidth={1.9}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {GLYPHS[name]}
  </g>
);

/* ── Cubic bezier helpers ─────────────────────────────────────────────── */

type Pt = [number, number];

function bez(t: number, p: Pt[]): Pt {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return [
    a * p[0][0] + b * p[1][0] + c * p[2][0] + d * p[3][0],
    a * p[0][1] + b * p[1][1] + c * p[2][1] + d * p[3][1],
  ];
}

const pathOf = (p: Pt[]) =>
  `M ${p[0][0]} ${p[0][1]} C ${p[1][0]} ${p[1][1]}, ${p[2][0]} ${p[2][1]}, ${p[3][0]} ${p[3][1]}`;

/* ══════════════════════════════════════════════════════════════════════
   1. RESOLUTION WALKTHROUGH
   ══════════════════════════════════════════════════════════════════════ */

type NodeId = "browser" | "resolver" | "root" | "tld" | "auth";
type HopKind = "query" | "referral" | "answer" | "cache" | "connect";

type Hop = {
  from: NodeId;
  to: NodeId;
  kind: HopKind;
  badge: string;
  title: string;
  wire: string;
  detail: string;
  ms: number;
  /** What the resolver learns and stores once this hop completes. */
  cacheAdd?: string;
};

const COLD: Hop[] = [
  {
    from: "browser",
    to: "resolver",
    kind: "query",
    badge: "?",
    title: "Browser asks its resolver",
    wire: "blog.example.com.  IN  A ?     →  1.1.1.1   [RD=1]",
    detail:
      "The browser checked its own cache and the operating system stub resolver. Both missed. It now sends one question to the configured recursive resolver with the RD (recursion desired) flag set, which means: you go do all the work, come back with a real answer.",
    ms: 1,
  },
  {
    from: "resolver",
    to: "root",
    kind: "query",
    badge: "?",
    title: "Resolver starts at a root server",
    wire: "blog.example.com.  IN  A ?     →  a.root-servers.net",
    detail:
      "The resolver's cache is empty too, so it starts at the only place it is born knowing: the root hints file. There are 13 root server identities (a through m), served by hundreds of physical machines sharing those addresses via anycast routing.",
    ms: 12,
  },
  {
    from: "root",
    to: "resolver",
    kind: "referral",
    badge: "NS",
    title: "Root replies with a referral, not an answer",
    wire: "↳ AUTHORITY:  com.  NS  a.gtld-servers.net.  (192.5.6.30)",
    detail:
      "The root server has never heard of example.com and never will. All it knows is who runs .com. That is a referral, not the address you asked for. This single design choice is why DNS scales: no server anywhere has to know every name.",
    ms: 0,
    cacheAdd: "com.  NS  a.gtld-servers.net",
  },
  {
    from: "resolver",
    to: "tld",
    kind: "query",
    badge: "?",
    title: "Resolver asks the .com TLD server",
    wire: "blog.example.com.  IN  A ?     →  a.gtld-servers.net",
    detail:
      "The .com top-level domain is operated by Verisign under ICANN/IANA delegation. Its zone holds one entry per registered .com domain: which nameservers are authoritative for it. It does not hold your website's IP address.",
    ms: 25,
  },
  {
    from: "tld",
    to: "resolver",
    kind: "referral",
    badge: "NS",
    title: "TLD replies with another referral",
    wire: "↳ AUTHORITY:  example.com.  NS  ns1.exampledns.net.  (198.51.100.7)",
    detail:
      "One level deeper, same shape of answer. When you change nameservers at your registrar, this is the record that changes. Until the TLD updates, the rest of the internet keeps being sent to your old provider.",
    ms: 0,
    cacheAdd: "example.com.  NS  ns1.exampledns.net",
  },
  {
    from: "resolver",
    to: "auth",
    kind: "query",
    badge: "?",
    title: "Resolver asks the authoritative nameserver",
    wire: "blog.example.com.  IN  A ?     →  ns1.exampledns.net",
    detail:
      "This server is the source of truth. It holds the zone file for example.com: every A, AAAA, CNAME, MX and TXT record for the domain and its subdomains. It is the only server on earth entitled to answer for this name.",
    ms: 30,
  },
  {
    from: "auth",
    to: "resolver",
    kind: "answer",
    badge: "A",
    title: "Authoritative answer",
    wire: "↳ ANSWER:  blog.example.com.  300  IN  A  93.184.216.34   [AA=1]",
    detail:
      "A real answer at last, with the AA (authoritative answer) bit set and a TTL of 300 seconds. If the name did not exist, this same server would return NXDOMAIN, and only this server has the standing to say so.",
    ms: 0,
    cacheAdd: "blog.example.com.  A  93.184.216.34",
  },
  {
    from: "resolver",
    to: "browser",
    kind: "answer",
    badge: "A",
    title: "Answer returned, and three things are now cached",
    wire: "93.184.216.34     (cached: com. NS, example.com. NS, and the A record)",
    detail:
      "Look at the resolver's cache panel. It stored three separate things, each with its own TTL. The next person who asks for anything under .com skips the root entirely, and the next person who asks for this exact name skips everything.",
    ms: 2,
  },
  {
    from: "browser",
    to: "browser",
    kind: "connect",
    badge: "→",
    title: "DNS is finished — now the real request starts",
    wire: "TCP SYN → 93.184.216.34:443     then TLS, then GET /",
    detail:
      "Everything above happened before a single byte of your page was requested. DNS resolves a name to an address; it does not fetch anything. The browser now opens a TCP connection to that address, completes the TLS handshake, and finally sends the HTTP request.",
    ms: 0,
  },
];

const WARM: Hop[] = [
  COLD[0],
  {
    from: "resolver",
    to: "resolver",
    kind: "cache",
    badge: "✓",
    title: "Root step skipped — .com nameservers already cached",
    wire: "cache HIT:  com.  NS  a.gtld-servers.net.   (ttl 41230s remaining)",
    detail:
      "TLD delegations carry very long TTLs, often two days. A busy resolver has effectively always got them cached, so in practice root servers see far less traffic than the textbook diagram suggests.",
    ms: 0,
  },
  COLD[3],
  COLD[4],
  COLD[5],
  COLD[6],
  COLD[7],
  COLD[8],
];

const HOT: Hop[] = [
  COLD[0],
  {
    from: "resolver",
    to: "resolver",
    kind: "cache",
    badge: "✓",
    title: "Resolver already has the answer",
    wire: "cache HIT:  blog.example.com.  A  93.184.216.34   (ttl 212s remaining)",
    detail:
      "Someone else asked for this name 88 seconds ago and the TTL has not expired. No root, no TLD, no authoritative server is contacted. This is the path the overwhelming majority of real DNS queries take.",
    ms: 0,
  },
  {
    from: "resolver",
    to: "browser",
    kind: "answer",
    badge: "A",
    title: "Non-authoritative answer",
    wire: "93.184.216.34     [AA=0 — served from cache, not from the source]",
    detail:
      "Note the missing AA flag. The answer is correct but it came from a cache, not from the authority. That is also why a record change can take up to a full TTL to be seen everywhere.",
    ms: 2,
  },
  COLD[8],
];

const SCEN = [
  { id: "cold", label: "Cold — nothing cached", hops: COLD, seed: [] as string[] },
  {
    id: "warm",
    label: "Warm — .com cached",
    hops: WARM,
    seed: ["com.  NS  a.gtld-servers.net"],
  },
  {
    id: "hot",
    label: "Hot — answer cached",
    hops: HOT,
    seed: ["blog.example.com.  A  93.184.216.34"],
  },
] as const;

type NodeSpec = {
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  sub: string;
  knows: string;
  glyph: GlyphName;
};

const NODES: Record<NodeId, NodeSpec> = {
  browser: {
    x: 24,
    y: 214,
    w: 172,
    h: 132,
    title: "Browser + OS",
    sub: "blog.example.com",
    knows: "asks once, then waits",
    glyph: "monitor",
  },
  resolver: {
    x: 286,
    y: 188,
    w: 232,
    h: 184,
    title: "Recursive Resolver",
    sub: "1.1.1.1 · ISP or DoH",
    knows: "",
    glyph: "hub",
  },
  root: {
    x: 730,
    y: 46,
    w: 224,
    h: 128,
    title: "Root Server",
    sub: '"." · 13 anycast sets',
    knows: "knows who runs .com",
    glyph: "globe",
  },
  tld: {
    x: 730,
    y: 216,
    w: 224,
    h: 128,
    title: "TLD Server",
    sub: ".com · Verisign",
    knows: "knows who runs example.com",
    glyph: "layers",
  },
  auth: {
    x: 730,
    y: 386,
    w: 224,
    h: 128,
    title: "Authoritative NS",
    sub: "ns1.exampledns.net",
    knows: "knows every record in the zone",
    glyph: "server",
  },
};

const EDGES: Record<string, Pt[]> = {
  "browser|resolver": [
    [196, 280],
    [226, 280],
    [256, 280],
    [286, 280],
  ],
  "resolver|root": [
    [518, 240],
    [612, 234],
    [640, 110],
    [730, 110],
  ],
  "resolver|tld": [
    [518, 280],
    [572, 280],
    [676, 280],
    [730, 280],
  ],
  "resolver|auth": [
    [518, 320],
    [612, 326],
    [640, 450],
    [730, 450],
  ],
};

function edgeFor(from: NodeId, to: NodeId): Pt[] | null {
  const fwd = EDGES[`${from}|${to}`];
  if (fwd) return fwd;
  const back = EDGES[`${to}|${from}`];
  if (back) return [...back].reverse() as Pt[];
  return null;
}

const KIND_FILL: Record<HopKind, string> = {
  query: "fill-blue-600",
  referral: "fill-violet-500",
  answer: "fill-emerald-500",
  cache: "fill-amber-500",
  connect: "fill-rose-500",
};

const KIND_STROKE: Record<HopKind, string> = {
  query: "stroke-blue-500",
  referral: "stroke-violet-500",
  answer: "stroke-emerald-500",
  cache: "stroke-amber-500",
  connect: "stroke-rose-500",
};

const KIND_BAR: Record<HopKind, string> = {
  query: "bg-blue-500",
  referral: "bg-violet-500",
  answer: "bg-emerald-500",
  cache: "bg-amber-500",
  connect: "bg-rose-500",
};

const HOP_MS = 1500;

export const DnsResolutionWalkthrough: React.FC = () => {
  const [sIdx, setSIdx] = useState(0);
  const [step, setStep] = useState(-1);
  const [prog, setProg] = useState(0);
  const [playing, setPlaying] = useState(false);
  const scen = SCEN[sIdx];
  const hops = scen.hops;

  useEffect(() => {
    setStep(-1);
    setProg(0);
    setPlaying(false);
  }, [sIdx]);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setProg((p) => Math.min(1, p + 40 / HOP_MS)), 40);
    return () => clearInterval(id);
  }, [playing, step]);

  useEffect(() => {
    if (!playing || prog < 1) return;
    if (step >= hops.length - 1) {
      setPlaying(false);
      return;
    }
    const id = setTimeout(() => {
      setStep((s) => s + 1);
      setProg(0);
    }, 380);
    return () => clearTimeout(id);
  }, [prog, playing, step, hops.length]);

  const active = step >= 0 ? hops[step] : null;
  const elapsed = hops.slice(0, step + 1).reduce((n, h) => n + h.ms, 0);
  const total = hops.reduce((n, h) => n + h.ms, 0);

  const touched = useMemo(() => {
    const s = new Set<NodeId>(["browser", "resolver"]);
    hops.forEach((h) => {
      s.add(h.from);
      s.add(h.to);
    });
    return s;
  }, [hops]);

  const visited = useMemo(() => {
    const s = new Set<NodeId>();
    hops.slice(0, step + 1).forEach((h) => {
      s.add(h.from);
      s.add(h.to);
    });
    return s;
  }, [hops, step]);

  const cache = useMemo(() => {
    const out = [...scen.seed];
    hops.slice(0, step + 1).forEach((h) => {
      if (h.cacheAdd) out.push(h.cacheAdd);
    });
    return out;
  }, [hops, step, scen.seed]);

  const pts = active && active.from !== active.to ? edgeFor(active.from, active.to) : null;
  const head = pts ? bez(prog, pts) : null;
  const trail: Pt[] = pts ? [0.05, 0.1, 0.16].map((d) => bez(Math.max(0, prog - d), pts)) : [];

  const start = () => {
    setStep(0);
    setProg(0);
    setPlaying(true);
  };

  return (
    <Panel
      label="Animated Walkthrough"
      title="One name, five machines: a DNS lookup end to end"
      footnote="Every hop is a separate UDP question on port 53. Watch the resolver's cache panel fill up — that is the state which makes the next lookup nearly free."
    >
      <div className="mb-5 flex flex-wrap gap-2">
        {SCEN.map((s, i) => (
          <Pill key={s.id} active={i === sIdx} onClick={() => setSIdx(i)}>
            {s.label}
          </Pill>
        ))}
      </div>

      <Stage>
        <svg viewBox="0 0 980 560" className="w-full" role="img" aria-label="DNS resolution path">
          {/* ── Connections ── */}
          {(
            [
              ["browser", "resolver"],
              ["resolver", "root"],
              ["resolver", "tld"],
              ["resolver", "auth"],
            ] as [NodeId, NodeId][]
          ).map(([a, b]) => {
            const p = EDGES[`${a}|${b}`];
            const inScenario = touched.has(a) && touched.has(b);
            const live =
              !!active &&
              ((active.from === a && active.to === b) || (active.from === b && active.to === a));
            return (
              <g key={`${a}-${b}`} opacity={inScenario ? 1 : 0.25}>
                <path
                  d={pathOf(p)}
                  fill="none"
                  strokeWidth={live ? 3 : 2}
                  strokeLinecap="round"
                  strokeDasharray={live ? "9 12" : "3 9"}
                  strokeDashoffset={live ? -prog * 160 : 0}
                  className={
                    live ? KIND_STROKE[active!.kind] : "stroke-slate-300 dark:stroke-slate-700"
                  }
                />
              </g>
            );
          })}

          {/* ── Nodes ── */}
          {(Object.keys(NODES) as NodeId[]).map((id) => {
            const n = NODES[id];
            const isActive = active ? active.from === id || active.to === id : false;
            const seen = visited.has(id);
            const dim = !touched.has(id);
            const cx = n.x + n.w / 2;

            const shell = isActive
              ? "fill-blue-50 stroke-blue-500 dark:fill-blue-950/70 dark:stroke-blue-400"
              : seen
                ? "fill-emerald-50/80 stroke-emerald-300 dark:fill-emerald-950/30 dark:stroke-emerald-700"
                : "fill-white stroke-slate-200 dark:fill-slate-900/80 dark:stroke-slate-700";
            const ink = isActive
              ? "stroke-blue-600 dark:stroke-blue-300"
              : seen
                ? "stroke-emerald-600 dark:stroke-emerald-400"
                : "stroke-slate-400 dark:stroke-slate-500";

            return (
              <g key={id} opacity={dim ? 0.3 : 1}>
                {/* arrival pulse */}
                {isActive && active!.to === id && prog > 0.72 && (
                  <rect
                    x={n.x - (prog - 0.72) * 60}
                    y={n.y - (prog - 0.72) * 60}
                    width={n.w + (prog - 0.72) * 120}
                    height={n.h + (prog - 0.72) * 120}
                    rx={26}
                    fill="none"
                    strokeWidth={2}
                    opacity={(1 - prog) * 2.6}
                    className={KIND_STROKE[active!.kind]}
                  />
                )}

                <rect
                  x={n.x}
                  y={n.y}
                  width={n.w}
                  height={n.h}
                  rx={18}
                  strokeWidth={isActive ? 2.5 : 1.5}
                  className={shell}
                />
                {/* top sheen */}
                <rect
                  x={n.x + 1}
                  y={n.y + 1}
                  width={n.w - 2}
                  height={n.h / 2}
                  rx={17}
                  className="fill-white/50 dark:fill-white/[0.03]"
                />

                <Glyph name={n.glyph} x={cx} y={n.y + 38} size={26} className={ink} />
                <text
                  x={cx}
                  y={n.y + 72}
                  textAnchor="middle"
                  className="fill-slate-900 text-[15px] font-bold dark:fill-slate-50"
                >
                  {n.title}
                </text>
                <text
                  x={cx}
                  y={n.y + 91}
                  textAnchor="middle"
                  className="fill-slate-500 font-mono text-[11px] dark:fill-slate-400"
                >
                  {n.sub}
                </text>

                {id !== "resolver" && (
                  <text
                    x={cx}
                    y={n.y + 114}
                    textAnchor="middle"
                    className="fill-slate-400 text-[10.5px] font-medium dark:fill-slate-500"
                  >
                    {n.knows}
                  </text>
                )}

                {/* Resolver cache panel */}
                {id === "resolver" && (
                  <>
                    <rect
                      x={n.x + 14}
                      y={n.y + 100}
                      width={n.w - 28}
                      height={70}
                      rx={10}
                      className="fill-slate-900/[0.04] stroke-slate-200 dark:fill-black/30 dark:stroke-slate-700"
                      strokeWidth={1}
                    />
                    <text
                      x={n.x + 26}
                      y={n.y + 116}
                      className="fill-violet-600 text-[9px] font-bold uppercase tracking-[0.16em] dark:fill-violet-400"
                    >
                      cache
                    </text>
                    <text
                      x={n.x + n.w - 26}
                      y={n.y + 116}
                      textAnchor="end"
                      className="fill-slate-400 font-mono text-[9px] dark:fill-slate-500"
                    >
                      {cache.length} {cache.length === 1 ? "entry" : "entries"}
                    </text>
                    {cache.slice(-3).map((c, i) => (
                      <text
                        key={c + i}
                        x={n.x + 26}
                        y={n.y + 134 + i * 14}
                        className="fill-emerald-600 font-mono text-[8.5px] dark:fill-emerald-400"
                      >
                        {c.length > 32 ? c.slice(0, 31) + "…" : c}
                      </text>
                    ))}
                    {cache.length === 0 && (
                      <text
                        x={n.x + 26}
                        y={n.y + 136}
                        className="fill-slate-400 font-mono text-[9px] italic dark:fill-slate-600"
                      >
                        empty — must ask upstream
                      </text>
                    )}
                  </>
                )}
              </g>
            );
          })}

          {/* cache-hit halo */}
          {active?.kind === "cache" && (
            <circle
              cx={NODES.resolver.x + NODES.resolver.w / 2}
              cy={NODES.resolver.y + NODES.resolver.h / 2}
              r={104 + prog * 24}
              fill="none"
              strokeWidth={2.5}
              opacity={1 - prog}
              className="stroke-amber-500"
            />
          )}

          {/* ── Packet with comet trail ── */}
          {head && (
            <g>
              {trail.map((t, i) => (
                <circle
                  key={i}
                  cx={t[0]}
                  cy={t[1]}
                  r={12 - i * 2.6}
                  opacity={0.28 - i * 0.08}
                  className={KIND_FILL[active!.kind]}
                />
              ))}
              <circle
                cx={head[0]}
                cy={head[1]}
                r={22}
                opacity={0.16}
                className={KIND_FILL[active!.kind]}
              />
              <circle cx={head[0]} cy={head[1]} r={15} className={KIND_FILL[active!.kind]} />
              <text
                x={head[0]}
                y={head[1] + 5}
                textAnchor="middle"
                className="fill-white text-[13px] font-black"
              >
                {active!.badge}
              </text>
            </g>
          )}
        </svg>
      </Stage>

      {/* ── Time-spent rail: doubles as a step scrubber ── */}
      <div className="mt-5">
        <div className="mb-1.5 flex items-baseline justify-between">
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
            Where the time goes — click any segment
          </span>
          <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
            {elapsed} / {total} ms
          </span>
        </div>
        <div className="flex gap-[3px]">
          {hops.map((h, i) => (
            <button
              key={i}
              title={`${i + 1}. ${h.title} — ${h.ms} ms`}
              onClick={() => {
                setPlaying(false);
                setStep(i);
                setProg(1);
              }}
              style={{ flexGrow: h.ms + 4 }}
              className={`h-2.5 rounded-full transition-all ${
                i <= step
                  ? `${KIND_BAR[h.kind]} ${i === step ? "ring-2 ring-slate-900/20 dark:ring-white/30" : ""}`
                  : "bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Btn primary onClick={start}>
          {playing ? "Resolving…" : "Resolve blog.example.com"}
        </Btn>
        <Btn
          onClick={() => {
            setPlaying(false);
            setStep((s) => Math.max(0, s - 1));
            setProg(1);
          }}
          disabled={step <= 0}
        >
          Back
        </Btn>
        <Btn
          onClick={() => {
            setPlaying(false);
            setStep((s) => Math.min(hops.length - 1, s + 1));
            setProg(1);
          }}
          disabled={step >= hops.length - 1}
        >
          Next
        </Btn>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Step {Math.max(step + 1, 0)} of {hops.length}
        </span>
      </div>

      <div className="mt-4 rounded-xl bg-slate-950 p-4 font-mono text-[11.5px] leading-6 ring-1 ring-slate-800">
        {step < 0 ? (
          <span className="text-slate-500">
            $ dig blog.example.com A +trace&nbsp;<span className="animate-pulse">▌</span>
          </span>
        ) : (
          hops.slice(0, step + 1).map((h, i) => (
            <div
              key={i}
              className={
                h.kind === "answer"
                  ? "text-emerald-400"
                  : h.kind === "referral"
                    ? "text-violet-400"
                    : h.kind === "cache"
                      ? "text-amber-400"
                      : h.kind === "connect"
                        ? "text-rose-400"
                        : "text-slate-300"
              }
            >
              {h.wire}
            </div>
          ))
        )}
      </div>

      <div className="mt-4 min-h-[84px] rounded-lg border-l-4 border-violet-500 bg-violet-50 px-5 py-4 shadow-sm dark:bg-violet-950/30">
        {active ? (
          <motion.div
            key={`${sIdx}-${step}`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {step + 1}. {active.title}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {active.detail}
            </p>
          </motion.div>
        ) : (
          <p className="text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-300">
            Press resolve. Watch two things: the first two servers never answer the question, they
            only say who to ask next — and the resolver's cache panel filling up as it learns.
          </p>
        )}
      </div>
    </Panel>
  );
};

/* ══════════════════════════════════════════════════════════════════════
   2. NAMESPACE HIERARCHY
   ══════════════════════════════════════════════════════════════════════ */

type TreeNode = {
  id: string;
  label: string;
  parent: string | null;
  x: number;
  y: number;
  level: string;
  managedBy: string;
  note: string;
};

const NW = 108;
const NH = 42;

const TREE: TreeNode[] = [
  {
    id: "root",
    label: ".",
    parent: null,
    x: 490,
    y: 56,
    level: "Root zone",
    managedBy: "ICANN, served by 13 root server identities (a–m)",
    note: "The empty label at the end of every fully qualified name. It knows nothing about individual websites — only which organisation runs each top-level domain.",
  },
  {
    id: "com",
    label: ".com",
    parent: "root",
    x: 290,
    y: 176,
    level: "Generic top-level domain (gTLD)",
    managedBy: "Verisign, under IANA/ICANN delegation",
    note: "Generic TLDs include .com, .org, .net, .edu and .gov. The .com zone holds one delegation per registered domain — around 160 million of them — and no website addresses at all.",
  },
  {
    id: "org",
    label: ".org",
    parent: "root",
    x: 500,
    y: 176,
    level: "Generic top-level domain (gTLD)",
    managedBy: "Public Interest Registry",
    note: "A different registry, a different business, the same protocol. That independence is the whole point of splitting the namespace at this level.",
  },
  {
    id: "uk",
    label: ".uk",
    parent: "root",
    x: 700,
    y: 176,
    level: "Country-code top-level domain (ccTLD)",
    managedBy: "Nominet UK",
    note: "Country-code TLDs such as .uk, .us, .ru and .jp are delegated to national registries, each with its own rules about who may register a name.",
  },
  {
    id: "example",
    label: "example",
    parent: "com",
    x: 190,
    y: 296,
    level: "Second-level domain",
    managedBy: "You, via your registrar and DNS provider",
    note: "This is the part you buy. Registering it writes an NS delegation into the .com zone pointing at your authoritative nameservers. From here down, you control everything.",
  },
  {
    id: "google",
    label: "google",
    parent: "com",
    x: 380,
    y: 296,
    level: "Second-level domain",
    managedBy: "Google LLC",
    note: "A sibling of example under the same TLD. The .com servers hold a referral for each of them and nothing more.",
  },
  {
    id: "wikipedia",
    label: "wikipedia",
    parent: "org",
    x: 510,
    y: 296,
    level: "Second-level domain",
    managedBy: "Wikimedia Foundation",
    note: "Same shape of ownership, different registry above it.",
  },
  {
    id: "co",
    label: "co",
    parent: "uk",
    x: 700,
    y: 296,
    level: "Second-level domain (registry-operated)",
    managedBy: "Nominet UK",
    note: "Some ccTLDs sell names one level lower. Under .uk you register bbc.co.uk, not bbc.uk, so co.uk behaves like a TLD in practice.",
  },
  {
    id: "www",
    label: "www",
    parent: "example",
    x: 90,
    y: 416,
    level: "Subdomain",
    managedBy: "You — it is just a record in your zone file",
    note: "A subdomain costs nothing and needs no registrar. It is one more line in the zone file you already control.",
  },
  {
    id: "blog",
    label: "blog",
    parent: "example",
    x: 258,
    y: 416,
    level: "Subdomain",
    managedBy: "You — it is just a record in your zone file",
    note: "Subdomains let you point different parts of a product at completely different infrastructure: blog at a static host, api at a load balancer, support at a SaaS vendor.",
  },
  {
    id: "mail",
    label: "mail",
    parent: "google",
    x: 400,
    y: 416,
    level: "Subdomain",
    managedBy: "Google LLC",
    note: "mail.google.com is a subdomain, not a separate domain. It inherits the delegation of google.com.",
  },
  {
    id: "bbc",
    label: "bbc",
    parent: "co",
    x: 700,
    y: 416,
    level: "Registered name under co.uk",
    managedBy: "BBC",
    note: "bbc.co.uk reads right to left like every name: root, then uk, then co, then bbc.",
  },
];

const ROWS: [number, string][] = [
  [56, "root zone"],
  [176, "top-level domains"],
  [296, "domains you register"],
  [416, "subdomains you create"],
];

const byId = (id: string) => TREE.find((n) => n.id === id)!;

function pathToRoot(id: string): string[] {
  const out: string[] = [];
  let cur: string | null = id;
  while (cur) {
    out.push(cur);
    cur = byId(cur).parent;
  }
  return out;
}

export const DnsHierarchyDiagram: React.FC = () => {
  const [sel, setSel] = useState("blog");
  const path = useMemo(() => pathToRoot(sel), [sel]);
  const onPath = (id: string) => path.includes(id);
  const node = byId(sel);

  const fqdn = useMemo(
    () =>
      path
        .filter((id) => id !== "root")
        .map((id) => byId(id).label.replace(/^\./, ""))
        .join(".") + ".",
    [path],
  );

  return (
    <Panel
      label="Interactive"
      title="The namespace is a tree, and every name is a path through it"
      footnote="Click any label. Each hop down the tree is a delegation: the parent zone does not store the child's records, it only stores who to ask."
    >
      <Stage>
        <svg viewBox="0 0 980 470" className="w-full" role="img" aria-label="DNS namespace tree">
          {/* row bands + labels */}
          {ROWS.map(([y, label]) => (
            <g key={label}>
              <rect
                x={0}
                y={y - 58}
                width={980}
                height={116}
                className="fill-slate-500/[0.03] dark:fill-white/[0.015]"
              />
              <text
                x={16}
                y={y - 36}
                className="fill-slate-400 text-[10px] font-bold uppercase tracking-[0.18em] dark:fill-slate-600"
              >
                {label}
              </text>
            </g>
          ))}

          {/* edges */}
          {TREE.filter((n) => n.parent).map((n) => {
            const p = byId(n.parent!);
            const lit = onPath(n.id) && onPath(p.id);
            const y1 = p.y + NH / 2;
            const y2 = n.y - NH / 2;
            const mid = (y1 + y2) / 2;
            const d = `M ${p.x} ${y1} C ${p.x} ${mid}, ${n.x} ${mid}, ${n.x} ${y2}`;
            return (
              <path
                key={`e-${n.id}`}
                d={d}
                fill="none"
                strokeLinecap="round"
                strokeWidth={lit ? 3 : 1.5}
                className={
                  lit
                    ? "stroke-blue-500 dark:stroke-blue-400"
                    : "stroke-slate-200 dark:stroke-slate-800"
                }
              />
            );
          })}

          {/* "delegates to" tag on the lit path */}
          {TREE.filter((n) => n.parent && onPath(n.id) && onPath(n.parent!)).map((n) => {
            const p = byId(n.parent!);
            const my = (p.y + NH / 2 + n.y - NH / 2) / 2;
            const mx = (p.x + n.x) / 2;
            return (
              <g key={`t-${n.id}`}>
                <rect
                  x={mx - 40}
                  y={my - 10}
                  width={80}
                  height={20}
                  rx={10}
                  className="fill-blue-50 stroke-blue-200 dark:fill-blue-950 dark:stroke-blue-800"
                  strokeWidth={1}
                />
                <text
                  x={mx}
                  y={my + 4}
                  textAnchor="middle"
                  className="fill-blue-600 text-[9px] font-bold uppercase tracking-[0.1em] dark:fill-blue-300"
                >
                  delegates
                </text>
              </g>
            );
          })}

          {/* nodes */}
          {TREE.map((n) => {
            const lit = onPath(n.id);
            const isSel = n.id === sel;
            return (
              <g
                key={n.id}
                onClick={() => setSel(n.id)}
                className="cursor-pointer"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setSel(n.id);
                }}
              >
                <rect
                  x={n.x - NW / 2}
                  y={n.y - NH / 2}
                  width={NW}
                  height={NH}
                  rx={NH / 2}
                  strokeWidth={isSel ? 0 : 1.5}
                  className={
                    isSel
                      ? "fill-blue-600"
                      : lit
                        ? "fill-blue-50 stroke-blue-400 dark:fill-blue-950/70 dark:stroke-blue-600"
                        : "fill-white stroke-slate-200 hover:stroke-slate-400 dark:fill-slate-900/80 dark:stroke-slate-700"
                  }
                />
                <rect
                  x={n.x - NW / 2 + 1}
                  y={n.y - NH / 2 + 1}
                  width={NW - 2}
                  height={NH / 2}
                  rx={NH / 2}
                  className={isSel ? "fill-white/20" : "fill-white/60 dark:fill-white/[0.03]"}
                />
                <text
                  x={n.x}
                  y={n.y + 5}
                  textAnchor="middle"
                  className={
                    isSel
                      ? "pointer-events-none fill-white font-mono text-[15px] font-bold"
                      : lit
                        ? "pointer-events-none fill-blue-700 font-mono text-[15px] font-bold dark:fill-blue-300"
                        : "pointer-events-none fill-slate-500 font-mono text-[15px] dark:fill-slate-400"
                  }
                >
                  {n.label}
                </text>
              </g>
            );
          })}
        </svg>
      </Stage>

      {/* FQDN strip, coloured segment by segment */}
      <div className="mt-5 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/60">
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
          Fully qualified name
        </span>
        <code className="rounded-md bg-white px-3 py-1.5 font-mono text-sm font-bold text-slate-900 shadow-sm ring-1 ring-slate-200 dark:bg-slate-950 dark:text-slate-100 dark:ring-slate-700">
          {fqdn}
        </code>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          resolved right to left — the trailing dot is the root
        </span>
      </div>

      <motion.div
        key={sel}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 rounded-lg border-l-4 border-blue-500 bg-blue-50 px-5 py-4 shadow-sm dark:bg-blue-950/30"
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-600 dark:text-blue-400">
          {node.level}
        </p>
        <p className="mt-1 text-sm font-bold text-slate-900 dark:text-slate-100">
          Controlled by: {node.managedBy}
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          {node.note}
        </p>
      </motion.div>
    </Panel>
  );
};

/* ══════════════════════════════════════════════════════════════════════
   3. QUERY TYPES — a real sequence diagram per mode
   ══════════════════════════════════════════════════════════════════════ */

type Arrow = {
  from: number;
  to: number;
  label: string;
  tone: "ask" | "refer" | "answer" | "self";
  note: string;
};

type QueryMode = {
  id: string;
  label: string;
  lanes: string[];
  arrows: Arrow[];
  summary: string;
  note: string;
};

const QUERY_MODES: QueryMode[] = [
  {
    id: "recursive",
    label: "Recursive",
    lanes: ["Client", "Resolver", "Root / TLD / Auth"],
    arrows: [
      {
        from: 0,
        to: 1,
        label: "blog.example.com A?  [RD=1]",
        tone: "ask",
        note: "The client sets the recursion-desired flag: do the whole job for me.",
      },
      {
        from: 1,
        to: 2,
        label: "…3 iterative queries…",
        tone: "self",
        note: "All of the walking happens here, invisible to the client.",
      },
      {
        from: 2,
        to: 1,
        label: "93.184.216.34",
        tone: "answer",
        note: "The authority finally hands over the address.",
      },
      {
        from: 1,
        to: 0,
        label: "93.184.216.34  (or NXDOMAIN / SERVFAIL)",
        tone: "answer",
        note: "One question in, one finished answer out. Never a referral.",
      },
    ],
    summary:
      "The client hands over the whole problem. The resolver must come back with the finished answer or an error — never with a shrug.",
    note: "This is what your laptop, phone and browser always do. They are stub resolvers: they know how to ask one question and wait, nothing more.",
  },
  {
    id: "iterative",
    label: "Iterative",
    lanes: ["Resolver", "Root", ".com TLD", "Authoritative"],
    arrows: [
      {
        from: 0,
        to: 1,
        label: "A?  [RD=0]",
        tone: "ask",
        note: "No recursion requested — just tell me what you know.",
      },
      {
        from: 1,
        to: 0,
        label: "referral → .com NS",
        tone: "refer",
        note: "The root hands back a pointer, not an answer.",
      },
      {
        from: 0,
        to: 2,
        label: "A?  [RD=0]",
        tone: "ask",
        note: "The resolver asks again, one level deeper.",
      },
      {
        from: 2,
        to: 0,
        label: "referral → example.com NS",
        tone: "refer",
        note: "Another pointer. The work stays with the resolver.",
      },
      {
        from: 0,
        to: 3,
        label: "A?  [RD=0]",
        tone: "ask",
        note: "Third question, now to the source of truth.",
      },
      {
        from: 3,
        to: 0,
        label: "93.184.216.34  [AA=1]",
        tone: "answer",
        note: "Authoritative answer. The walk is over.",
      },
    ],
    summary:
      "Each server answers with the best it has. Usually that is a referral: 'not me, but ask these servers next.' The asker keeps the work.",
    note: "Root and TLD servers deliberately refuse recursion. If they did the work for everyone, a handful of machines would have to answer for the entire internet.",
  },
  {
    id: "nonrecursive",
    label: "Non-recursive",
    lanes: ["Client", "Resolver (cache)"],
    arrows: [
      { from: 0, to: 1, label: "blog.example.com A?", tone: "ask", note: "An ordinary question." },
      {
        from: 1,
        to: 1,
        label: "cache HIT — ttl 212s left",
        tone: "self",
        note: "No packet leaves the resolver at all.",
      },
      {
        from: 1,
        to: 0,
        label: "93.184.216.34  [AA=0]",
        tone: "answer",
        note: "Correct, but from a cache — so no authoritative-answer flag.",
      },
    ],
    summary:
      "The answer is already known, either from cache or because this server is authoritative for the zone. No other server is contacted.",
    note: "The cheapest possible lookup, and by a wide margin the most common one in production. Caching is what keeps the whole system standing up.",
  },
];

const ARROW_STROKE = {
  ask: "stroke-blue-500",
  refer: "stroke-violet-500",
  answer: "stroke-emerald-500",
  self: "stroke-amber-500",
} as const;

const ARROW_TEXT = {
  ask: "fill-blue-600 dark:fill-blue-300",
  refer: "fill-violet-600 dark:fill-violet-300",
  answer: "fill-emerald-600 dark:fill-emerald-300",
  self: "fill-amber-600 dark:fill-amber-300",
} as const;

export const DnsQueryTypesDiagram: React.FC = () => {
  const [idx, setIdx] = useState(0);
  const [shown, setShown] = useState(0);
  const m = QUERY_MODES[idx];

  useEffect(() => {
    setShown(0);
  }, [idx]);

  // One timeout per arrow, driven off `shown` itself. Keeping the stop
  // condition in the effect body rather than inside a state updater means no
  // side effect runs during a render pass, so the final arrow always lands.
  useEffect(() => {
    if (shown >= m.arrows.length) return;
    const id = setTimeout(() => setShown((n) => n + 1), 720);
    return () => clearTimeout(id);
  }, [shown, m.arrows.length]);

  const W = 980;
  const laneX = (i: number) => 110 + (i * (W - 220)) / Math.max(m.lanes.length - 1, 1);
  const rowY = (i: number) => 132 + i * 52;
  const H = rowY(m.arrows.length - 1) + 70;
  const active = shown > 0 ? m.arrows[shown - 1] : null;

  return (
    <Panel
      label="Interactive"
      title="Three query types, and who is doing the work in each"
      footnote="One real lookup contains all three: a recursive query from the client, iterative queries from the resolver, and non-recursive answers for everyone who asks afterwards."
    >
      <div className="mb-5 flex flex-wrap gap-2">
        {QUERY_MODES.map((x, i) => (
          <Pill key={x.id} active={i === idx} onClick={() => setIdx(i)}>
            {x.label}
          </Pill>
        ))}
      </div>

      <Stage>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full"
          role="img"
          aria-label={`${m.label} query sequence`}
        >
          {/* lifelines */}
          {m.lanes.map((l, i) => (
            <g key={l}>
              <line
                x1={laneX(i)}
                y1={92}
                x2={laneX(i)}
                y2={H - 20}
                strokeWidth={1.5}
                strokeDasharray="4 8"
                className="stroke-slate-200 dark:stroke-slate-800"
              />
              <rect
                x={laneX(i) - 88}
                y={38}
                width={176}
                height={38}
                rx={19}
                strokeWidth={1.5}
                className="fill-white stroke-slate-200 dark:fill-slate-900 dark:stroke-slate-700"
              />
              <text
                x={laneX(i)}
                y={62}
                textAnchor="middle"
                className="fill-slate-700 text-[13px] font-bold dark:fill-slate-200"
              >
                {l}
              </text>
            </g>
          ))}

          {/* arrows */}
          {m.arrows.map((a, i) => {
            if (i >= shown) return null;
            const y = rowY(i);
            const isSelf = a.from === a.to;
            const x1 = laneX(a.from);
            const x2 = laneX(a.to);
            const isLast = i === shown - 1;

            if (isSelf) {
              const d = `M ${x1} ${y - 12} C ${x1 + 70} ${y - 14}, ${x1 + 70} ${y + 14}, ${x1} ${y + 12}`;
              return (
                <g key={i} opacity={isLast ? 1 : 0.55}>
                  <path
                    d={d}
                    fill="none"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    className={ARROW_STROKE[a.tone]}
                  />
                  <text
                    x={x1 + 84}
                    y={y + 5}
                    className={`text-[12px] font-semibold ${ARROW_TEXT[a.tone]}`}
                  >
                    {a.label}
                  </text>
                </g>
              );
            }

            const dir = x2 > x1 ? 1 : -1;
            const tip = x2 - dir * 8;
            return (
              <g key={i} opacity={isLast ? 1 : 0.55}>
                <line
                  x1={x1 + dir * 8}
                  y1={y}
                  x2={tip}
                  y2={y}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  className={ARROW_STROKE[a.tone]}
                />
                <path
                  d={`M ${tip} ${y} l ${-dir * 11} -6 l 0 12 z`}
                  className={ARROW_STROKE[a.tone].replace("stroke-", "fill-")}
                />
                <text
                  x={(x1 + x2) / 2}
                  y={y - 11}
                  textAnchor="middle"
                  className={`text-[12px] font-semibold ${ARROW_TEXT[a.tone]}`}
                >
                  {a.label}
                </text>
              </g>
            );
          })}
        </svg>
      </Stage>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_20rem]">
        <div className="rounded-lg border-l-4 border-blue-500 bg-blue-50 px-5 py-4 dark:bg-blue-950/30">
          <p className="min-h-[40px] text-sm leading-relaxed text-slate-700 dark:text-slate-200">
            {active ? active.note : "Reading the sequence…"}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">{m.summary}</p>
          <p className="mt-3 border-t border-slate-200 pt-3 text-xs leading-relaxed text-slate-500 dark:border-slate-800 dark:text-slate-400">
            {m.note}
          </p>
        </div>
      </div>
    </Panel>
  );
};

/* ══════════════════════════════════════════════════════════════════════
   4. ZONE FILE / RECORD EXPLORER
   ══════════════════════════════════════════════════════════════════════ */

type ZoneLine = { text: string; type?: string; comment?: boolean };

const ZONE: ZoneLine[] = [
  { text: "$ORIGIN example.com." },
  { text: "$TTL    3600" },
  { text: "" },
  { text: "; who owns this zone, and how failures age out", comment: true },
  { text: "@       IN  SOA   ns1.exampledns.net. admin.example.com. (", type: "SOA" },
  { text: "                  2026080501 ; serial — bump this on every edit", type: "SOA" },
  { text: "                  7200 3600 1209600 300 )", type: "SOA" },
  { text: "" },
  { text: "; who is allowed to answer for this zone", comment: true },
  { text: "@       IN  NS    ns1.exampledns.net.", type: "NS" },
  { text: "@       IN  NS    ns2.exampledns.net.", type: "NS" },
  { text: "" },
  { text: "; addresses", comment: true },
  { text: "@       300 IN  A     93.184.216.34", type: "A" },
  { text: "www     300 IN  A     93.184.216.34", type: "A" },
  { text: "api     60  IN  A     198.51.100.42", type: "A" },
  { text: "@       300 IN  AAAA  2606:2800:220:1:248:1893:25c8:1946", type: "AAAA" },
  { text: "" },
  { text: "; aliases — a name pointing at another name", comment: true },
  { text: "blog    300 IN  CNAME hosting.netlify.app.", type: "CNAME" },
  { text: "shop    300 IN  CNAME shops.myshopify.com.", type: "CNAME" },
  { text: "" },
  { text: "; mail routing — lowest preference number wins", comment: true },
  { text: "@       3600 IN MX 10 mx1.mailprovider.com.", type: "MX" },
  { text: "@       3600 IN MX 20 mx2.mailprovider.com.", type: "MX" },
  { text: "" },
  { text: "; free-form text, mostly used to prove you own the domain", comment: true },
  { text: '@       3600 IN TXT   "v=spf1 include:mailprovider.com ~all"', type: "TXT" },
  { text: '@       3600 IN TXT   "google-site-verification=8fJ2p..."', type: "TXT" },
  { text: "" },
  { text: "; a service, including the port it listens on", comment: true },
  { text: "_sip._tcp 3600 IN SRV 10 60 5060 sip.example.com.", type: "SRV" },
  { text: "" },
  { text: "; a public key certificate published in DNS", comment: true },
  { text: "@       3600 IN CERT  PKIX 1 RSASHA256 MIIC7TCCAd...", type: "CERT" },
  { text: "" },
  { text: "; ── separate reverse zone: 216.184.93.in-addr.arpa ──", comment: true },
  { text: "34      3600 IN PTR   www.example.com.", type: "PTR" },
];

/** A node in the "what does this record point at" mini diagram. */
type ChainNode = { label: string; kind: "name" | "ip" | "host" | "data" };

type RecMeta = {
  id: string;
  name: string;
  purpose: string;
  gotcha: string;
  dig: string;
  answer: string[];
  chain: ChainNode[];
  edges: string[];
  /** Optional second target, drawn branching off the first hop. */
  branch?: { label: string; edge: string; kind: ChainNode["kind"] };
};

const RECORDS: RecMeta[] = [
  {
    id: "A",
    name: "A — Address",
    purpose:
      "Maps a name to a 32-bit IPv4 address. This is the record that actually gets you to a server.",
    gotcha:
      "Multiple A records for one name is legal and common: the resolver returns them all and the client picks one. That is round-robin load balancing, and it has no health checking whatsoever.",
    dig: "dig example.com A +short",
    answer: ["93.184.216.34"],
    chain: [
      { label: "example.com", kind: "name" },
      { label: "93.184.216.34", kind: "ip" },
    ],
    edges: ["A"],
  },
  {
    id: "AAAA",
    name: "AAAA — IPv6 Address",
    purpose:
      "The same idea as A, but for a 128-bit IPv6 address. Four times the bits, hence four As.",
    gotcha:
      "A dual-stack client asks for A and AAAA at the same time and races the two connections (Happy Eyeballs). A broken AAAA record shows up as a mysterious delay, not as a clean failure.",
    dig: "dig example.com AAAA +short",
    answer: ["2606:2800:220:1:248:1893:25c8:1946"],
    chain: [
      { label: "example.com", kind: "name" },
      { label: "2606:2800:220:1::25c8:1946", kind: "ip" },
    ],
    edges: ["AAAA"],
  },
  {
    id: "CNAME",
    name: "CNAME — Canonical Name",
    purpose:
      "Points one name at another name. The resolver restarts the lookup on the target and returns that result.",
    gotcha:
      "A CNAME cannot coexist with any other record on the same name, which is exactly why you cannot put one on a bare domain that already needs SOA and NS records. Providers work around this with ALIAS or ANAME records.",
    dig: "dig blog.example.com +short",
    answer: ["hosting.netlify.app.", "75.2.60.5"],
    chain: [
      { label: "blog.example.com", kind: "name" },
      { label: "hosting.netlify.app", kind: "name" },
      { label: "75.2.60.5", kind: "ip" },
    ],
    edges: ["CNAME", "A"],
  },
  {
    id: "MX",
    name: "MX — Mail Exchanger",
    purpose:
      "Names the mail servers that accept email for the domain, each with a preference number.",
    gotcha:
      "Lower preference wins, so 10 is tried before 20. An MX must point at a hostname, never at an IP address and never at a CNAME.",
    dig: "dig example.com MX +short",
    answer: ["10 mx1.mailprovider.com.", "20 mx2.mailprovider.com."],
    chain: [
      { label: "example.com", kind: "name" },
      { label: "mx1.mailprovider.com", kind: "host" },
    ],
    edges: ["MX 10"],
    branch: { label: "mx2.mailprovider.com", edge: "MX 20", kind: "host" },
  },
  {
    id: "TXT",
    name: "TXT — Text",
    purpose:
      "Arbitrary text attached to a name. In practice: SPF, DKIM and DMARC email policy, plus domain ownership proofs.",
    gotcha:
      "Anyone can read your TXT records. They are a public bulletin board, so never put anything secret in one.",
    dig: "dig example.com TXT +short",
    answer: ['"v=spf1 include:mailprovider.com ~all"', '"google-site-verification=8fJ2p..."'],
    chain: [
      { label: "example.com", kind: "name" },
      { label: '"v=spf1 include:… ~all"', kind: "data" },
    ],
    edges: ["TXT"],
  },
  {
    id: "NS",
    name: "NS — Name Server",
    purpose:
      "Declares which servers are authoritative for a zone. This is the record that performs delegation.",
    gotcha:
      "NS records exist in two places: in your own zone, and in the parent zone at the registry. When those two disagree you get intermittent failures that are miserable to debug.",
    dig: "dig example.com NS +short",
    answer: ["ns1.exampledns.net.", "ns2.exampledns.net."],
    chain: [
      { label: "example.com zone", kind: "name" },
      { label: "ns1.exampledns.net", kind: "host" },
    ],
    edges: ["NS"],
    branch: { label: "ns2.exampledns.net", edge: "NS", kind: "host" },
  },
  {
    id: "SOA",
    name: "SOA — Start of Authority",
    purpose:
      "One per zone. Holds the primary nameserver, the admin contact, a serial number, and the timers that govern zone transfers.",
    gotcha:
      "The last number is the negative caching TTL: how long a resolver remembers that a name does not exist. Set it high and a typo fix appears to take forever.",
    dig: "dig example.com SOA +short",
    answer: ["ns1.exampledns.net. admin.example.com. 2026080501 7200 3600 1209600 300"],
    chain: [
      { label: "example.com zone", kind: "name" },
      { label: "primary NS + admin + timers", kind: "data" },
    ],
    edges: ["SOA"],
  },
  {
    id: "SRV",
    name: "SRV — Service Location",
    purpose:
      "Locates a named service: its host, its port, plus priority and weight. Used by SIP, XMPP, LDAP and Kubernetes.",
    gotcha:
      "SRV is the only common record type that carries a port number. The underscore-prefixed name format (_service._proto) is required, not decorative.",
    dig: "dig _sip._tcp.example.com SRV +short",
    answer: ["10 60 5060 sip.example.com."],
    chain: [
      { label: "_sip._tcp.example.com", kind: "name" },
      { label: "sip.example.com : 5060", kind: "host" },
    ],
    edges: ["SRV"],
  },
  {
    id: "PTR",
    name: "PTR — Pointer (reverse DNS)",
    purpose:
      "Maps an IP address back to a name. Lives in the special in-addr.arpa (IPv4) or ip6.arpa (IPv6) zone.",
    gotcha:
      "Only the owner of the IP block can set it, which normally means your hosting provider rather than you. Receiving mail servers check that forward and reverse agree, so a missing PTR is a fast route into a spam folder.",
    dig: "dig -x 93.184.216.34 +short",
    answer: ["www.example.com."],
    chain: [
      { label: "34.216.184.93.in-addr.arpa", kind: "ip" },
      { label: "www.example.com", kind: "name" },
    ],
    edges: ["PTR"],
  },
  {
    id: "CERT",
    name: "CERT — Certificate",
    purpose:
      "Publishes a public key certificate in DNS so that other parties can fetch it by name.",
    gotcha:
      "Rare in practice. Most certificate distribution happens in the TLS handshake instead; the DNS-based relatives you are more likely to meet are TLSA and CAA.",
    dig: "dig example.com CERT +short",
    answer: ["PKIX 1 RSASHA256 MIIC7TCCAd..."],
    chain: [
      { label: "example.com", kind: "name" },
      { label: "PKIX certificate blob", kind: "data" },
    ],
    edges: ["CERT"],
  },
];

const CHAIN_STYLE: Record<ChainNode["kind"], { box: string; text: string }> = {
  name: {
    box: "fill-blue-50 stroke-blue-300 dark:fill-blue-950/60 dark:stroke-blue-700",
    text: "fill-blue-700 dark:fill-blue-300",
  },
  ip: {
    box: "fill-emerald-50 stroke-emerald-300 dark:fill-emerald-950/50 dark:stroke-emerald-700",
    text: "fill-emerald-700 dark:fill-emerald-300",
  },
  host: {
    box: "fill-violet-50 stroke-violet-300 dark:fill-violet-950/50 dark:stroke-violet-700",
    text: "fill-violet-700 dark:fill-violet-300",
  },
  data: {
    box: "fill-amber-50 stroke-amber-300 dark:fill-amber-950/40 dark:stroke-amber-700",
    text: "fill-amber-700 dark:fill-amber-300",
  },
};

const ChainDiagram: React.FC<{ rec: RecMeta }> = ({ rec }) => {
  const W = 900;
  const n = rec.chain.length;
  const boxW = n >= 3 ? 250 : 300;
  const gap = (W - 40 - n * boxW) / Math.max(n - 1, 1);
  const xOf = (i: number) => 20 + i * (boxW + gap);
  const H = rec.branch ? 168 : 96;
  const midY = 50;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="record target diagram">
      {rec.chain.map((c, i) => {
        const st = CHAIN_STYLE[c.kind];
        return (
          <g key={i}>
            <rect
              x={xOf(i)}
              y={midY - 25}
              width={boxW}
              height={50}
              rx={12}
              strokeWidth={1.5}
              className={st.box}
            />
            <text
              x={xOf(i) + boxW / 2}
              y={midY + 5}
              textAnchor="middle"
              className={`font-mono text-[15px] font-semibold ${st.text}`}
            >
              {c.label}
            </text>
          </g>
        );
      })}

      {rec.edges.map((e, i) => {
        if (i >= n - 1) return null;
        const x1 = xOf(i) + boxW;
        const x2 = xOf(i + 1);
        return (
          <g key={`e${i}`}>
            <line
              x1={x1 + 6}
              y1={midY}
              x2={x2 - 12}
              y2={midY}
              strokeWidth={2}
              className="stroke-slate-400 dark:stroke-slate-500"
            />
            <path
              d={`M ${x2 - 6} ${midY} l -12 -6 l 0 12 z`}
              className="fill-slate-400 dark:fill-slate-500"
            />
            <rect
              x={(x1 + x2) / 2 - 34}
              y={midY - 34}
              width={68}
              height={22}
              rx={11}
              className="fill-slate-100 stroke-slate-300 dark:fill-slate-800 dark:stroke-slate-600"
              strokeWidth={1}
            />
            <text
              x={(x1 + x2) / 2}
              y={midY - 19}
              textAnchor="middle"
              className="fill-slate-600 font-mono text-[11px] font-bold dark:fill-slate-300"
            >
              {e}
            </text>
          </g>
        );
      })}

      {rec.branch && (
        <g>
          <path
            d={`M ${xOf(0) + boxW + 6} ${midY} C ${xOf(0) + boxW + 60} ${midY}, ${xOf(1) - 60} ${midY + 72}, ${xOf(1) - 12} ${midY + 72}`}
            fill="none"
            strokeWidth={2}
            className="stroke-slate-400 dark:stroke-slate-500"
          />
          <path
            d={`M ${xOf(1) - 6} ${midY + 72} l -12 -6 l 0 12 z`}
            className="fill-slate-400 dark:fill-slate-500"
          />
          <rect
            x={xOf(1)}
            y={midY + 47}
            width={boxW}
            height={50}
            rx={12}
            strokeWidth={1.5}
            className={CHAIN_STYLE[rec.branch.kind].box}
          />
          <text
            x={xOf(1) + boxW / 2}
            y={midY + 77}
            textAnchor="middle"
            className={`font-mono text-[15px] font-semibold ${CHAIN_STYLE[rec.branch.kind].text}`}
          >
            {rec.branch.label}
          </text>
          <rect
            x={xOf(0) + boxW + 40}
            y={midY + 40}
            width={68}
            height={22}
            rx={11}
            className="fill-slate-100 stroke-slate-300 dark:fill-slate-800 dark:stroke-slate-600"
            strokeWidth={1}
          />
          <text
            x={xOf(0) + boxW + 74}
            y={midY + 55}
            textAnchor="middle"
            className="fill-slate-600 font-mono text-[11px] font-bold dark:fill-slate-300"
          >
            {rec.branch.edge}
          </text>
        </g>
      )}
    </svg>
  );
};

export const DnsRecordExplorer: React.FC = () => {
  const [sel, setSel] = useState("A");
  const [digShown, setDigShown] = useState(0);
  const rec = RECORDS.find((r) => r.id === sel)!;

  useEffect(() => {
    setDigShown(0);
  }, [sel]);

  useEffect(() => {
    if (digShown >= rec.answer.length) return;
    const id = setTimeout(() => setDigShown((n) => n + 1), 420);
    return () => clearTimeout(id);
  }, [digShown, rec.answer.length]);

  return (
    <Panel
      label="Interactive"
      title="A zone file, and what each record type actually points at"
      footnote="A zone file is the whole configuration of a domain in plain text. Every managed DNS console — Route 53, Cloudflare, Azure DNS — is a form that edits exactly these lines."
    >
      <div className="mb-5 flex flex-wrap gap-1.5">
        {RECORDS.map((r) => (
          <button
            key={r.id}
            onClick={() => setSel(r.id)}
            className={`rounded-md border px-3 py-1.5 font-mono text-xs font-bold transition ${
              sel === r.id
                ? "border-blue-600 bg-blue-600 text-white shadow-sm shadow-blue-600/25"
                : "border-slate-300 bg-white text-slate-600 hover:border-blue-400 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-blue-500"
            }`}
          >
            {r.id}
          </button>
        ))}
      </div>

      {/* what it points at */}
      <Stage>
        <div className="px-4 py-4">
          <motion.div key={sel} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <ChainDiagram rec={rec} />
          </motion.div>
        </div>
      </Stage>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.15fr_1fr]">
        <div className="overflow-hidden rounded-xl bg-slate-950 ring-1 ring-slate-800">
          <div className="flex items-center gap-2 border-b border-slate-800 px-4 py-2">
            <FileText className="h-3.5 w-3.5 text-slate-500" />
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">
              db.example.com
            </span>
          </div>
          <pre className="max-h-[420px] overflow-auto px-4 py-3 font-mono text-[11px] leading-[1.7]">
            {ZONE.map((l, i) => {
              const match = l.type === sel;
              return (
                <div
                  key={i}
                  className={`-mx-2 rounded px-2 transition-colors duration-300 ${
                    match ? "bg-blue-500/25 text-blue-50 ring-1 ring-inset ring-blue-500/40" : ""
                  }`}
                >
                  <span
                    className={
                      match
                        ? "text-blue-50"
                        : l.comment
                          ? "italic text-slate-500"
                          : l.type
                            ? "text-slate-400"
                            : "text-amber-500/80"
                    }
                  >
                    {l.text || " "}
                  </span>
                </div>
              );
            })}
          </pre>
        </div>

        <div className="flex flex-col gap-4">
          <motion.div
            key={sel}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60"
          >
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{rec.name}</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {rec.purpose}
            </p>
            <div className="mt-3 rounded-lg border-l-4 border-amber-500 bg-amber-50 px-3 py-2.5 dark:bg-amber-950/30">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-amber-600 dark:text-amber-400">
                What trips people up
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-700 dark:text-slate-200">
                {rec.gotcha}
              </p>
            </div>
          </motion.div>

          <div className="rounded-xl bg-slate-950 p-4 font-mono text-[11.5px] leading-6 ring-1 ring-slate-800">
            <div className="text-slate-300">
              <span className="text-emerald-400">$</span> {rec.dig}
            </div>
            {rec.answer.slice(0, digShown).map((a, i) => (
              <motion.div
                key={`${sel}-${i}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-blue-300"
              >
                {a}
              </motion.div>
            ))}
            {digShown < rec.answer.length && (
              <span className="inline-block h-4 w-2 animate-pulse bg-slate-600 align-middle" />
            )}
          </div>
        </div>
      </div>
    </Panel>
  );
};

/* ══════════════════════════════════════════════════════════════════════
   5. CACHE JOURNEY
   ══════════════════════════════════════════════════════════════════════ */

type Layer = {
  id: string;
  name: string;
  sub: string;
  ms: number;
  glyph: GlyphName;
};

const LAYERS: Layer[] = [
  {
    id: "browser",
    name: "Browser cache",
    sub: "Chrome keeps its own, ~60s by default",
    ms: 0,
    glyph: "monitor",
  },
  {
    id: "os",
    name: "OS stub resolver",
    sub: "systemd-resolved, dnsmasq, Windows client",
    ms: 1,
    glyph: "cpu",
  },
  {
    id: "router",
    name: "Router cache",
    sub: "shared by every device on the network",
    ms: 2,
    glyph: "router",
  },
  {
    id: "resolver",
    name: "Recursive resolver",
    sub: "your ISP, 1.1.1.1 or 8.8.8.8",
    ms: 18,
    glyph: "hub",
  },
  {
    id: "auth",
    name: "Authoritative nameserver",
    sub: "the source of truth — root, TLD, then here",
    ms: 70,
    glyph: "server",
  },
];

type CacheScenario = { id: string; label: string; hitAt: number; explain: string };

const CACHE_SCENARIOS: CacheScenario[] = [
  {
    id: "cold",
    label: "First visit ever",
    hitAt: 4,
    explain:
      "Nothing anywhere has this name. The request falls through every layer and triggers the full root → TLD → authoritative walk. Watch the return trip: every layer it passes stores a copy, each honouring the TTL that came with the record.",
  },
  {
    id: "reload",
    label: "You reload the page",
    hitAt: 0,
    explain:
      "The browser answers itself. No system call, no packet, no network. This is why a DNS change can look like it has not taken effect even after you flush the OS cache — the browser is holding its own copy.",
  },
  {
    id: "newtab",
    label: "New app, same machine",
    hitAt: 1,
    explain:
      "A different program has a different browser cache, so the lookup reaches the operating system stub resolver, which still remembers. Roughly a millisecond, and still no packet leaves the machine.",
  },
  {
    id: "phone",
    label: "Your phone, same Wi-Fi",
    hitAt: 2,
    explain:
      "Different device, so the first two layers are empty. The home router has been caching for the whole household and answers on the local network. Shared caches are why the second person to visit a site has a faster experience than the first.",
  },
  {
    id: "expired",
    label: "TTL expired locally",
    hitAt: 3,
    explain:
      "The local copies aged out, but the resolver serving millions of users still has a valid entry. One round trip to the resolver and back — no root, no TLD, no authoritative server involved.",
  },
];

const CARD_H = 84;
const CARD_GAP = 22;
const TOP = 34;
const SPINE_X = 92;
const CARD_X = 138;
const CARD_W = 812;

const rowTop = (i: number) => TOP + i * (CARD_H + CARD_GAP);
const rowMid = (i: number) => rowTop(i) + CARD_H / 2;

const STEP_MS = 620;

export const DnsCacheJourney: React.FC = () => {
  const [sIdx, setSIdx] = useState(0);
  const [pos, setPos] = useState(-1);
  const [phase, setPhase] = useState<"idle" | "down" | "up" | "done">("idle");
  const [ttl, setTtl] = useState(300);
  const sc = CACHE_SCENARIOS[sIdx];

  useEffect(() => {
    setPos(-1);
    setPhase("idle");
  }, [sIdx]);

  useEffect(() => {
    if (phase !== "down" && phase !== "up") return;
    const id = setTimeout(() => {
      if (phase === "down") {
        if (pos >= sc.hitAt) setPhase("up");
        else setPos((p) => p + 1);
      } else {
        if (pos <= 0) setPhase("done");
        else setPos((p) => p - 1);
      }
    }, STEP_MS);
    return () => clearTimeout(id);
  }, [phase, pos, sc.hitAt]);

  const run = () => {
    setPos(0);
    setPhase("down");
  };

  const cost = LAYERS[sc.hitAt].ms;
  const H = rowTop(LAYERS.length - 1) + CARD_H + 30;

  const RESOLVERS = 4000;
  const qpd = Math.round((86400 / ttl) * RESOLVERS);
  const ttlLabel =
    ttl >= 3600
      ? `${Math.round(ttl / 3600)} h`
      : ttl >= 60
        ? `${Math.round(ttl / 60)} min`
        : `${ttl} s`;

  return (
    <Panel
      label="Animated"
      title="Where the answer really comes from"
      footnote="A DNS answer is cached at four independent layers before it ever reaches your code. Each one has its own idea of when it expires, which is why 'DNS propagation' is really 'waiting for other people's TTLs'."
    >
      <div className="mb-5 flex flex-wrap gap-2">
        {CACHE_SCENARIOS.map((s, i) => (
          <Pill key={s.id} active={i === sIdx} onClick={() => setSIdx(i)}>
            {s.label}
          </Pill>
        ))}
      </div>

      <Stage>
        <svg viewBox={`0 0 980 ${H}`} className="w-full" role="img" aria-label="DNS cache layers">
          {/* spine */}
          <line
            x1={SPINE_X}
            y1={rowMid(0)}
            x2={SPINE_X}
            y2={rowMid(LAYERS.length - 1)}
            strokeWidth={3}
            strokeLinecap="round"
            className="stroke-slate-200 dark:stroke-slate-800"
          />
          <line
            x1={SPINE_X}
            y1={rowMid(0)}
            x2={SPINE_X}
            y2={rowMid(Math.max(pos, 0))}
            strokeWidth={3}
            strokeLinecap="round"
            opacity={phase === "idle" ? 0 : 1}
            className={
              phase === "up" || phase === "done" ? "stroke-emerald-500" : "stroke-blue-500"
            }
          />

          {LAYERS.map((l, i) => {
            const reached = pos >= i || (phase === "done" && i <= sc.hitAt);
            const isHit = reached && i === sc.hitAt;
            const isMiss = reached && i < sc.hitAt;
            const isCurrent = pos === i && phase !== "idle" && phase !== "done";
            const cached = (phase === "up" || phase === "done") && i <= sc.hitAt;
            const y = rowTop(i);

            const shell = isHit
              ? "fill-emerald-50 stroke-emerald-400 dark:fill-emerald-950/40 dark:stroke-emerald-600"
              : isMiss
                ? "fill-red-50/70 stroke-red-300 dark:fill-red-950/25 dark:stroke-red-900"
                : isCurrent
                  ? "fill-blue-50 stroke-blue-400 dark:fill-blue-950/50 dark:stroke-blue-600"
                  : "fill-white stroke-slate-200 dark:fill-slate-900/80 dark:stroke-slate-800";
            const ink = isHit
              ? "stroke-emerald-600 dark:stroke-emerald-400"
              : isMiss
                ? "stroke-red-500 dark:stroke-red-400"
                : "stroke-slate-400 dark:stroke-slate-500";

            return (
              <g key={l.id}>
                {/* spine node */}
                <circle
                  cx={SPINE_X}
                  cy={rowMid(i)}
                  r={9}
                  strokeWidth={3}
                  className={
                    isHit
                      ? "fill-emerald-500 stroke-emerald-200 dark:stroke-emerald-900"
                      : reached
                        ? "fill-red-400 stroke-red-100 dark:stroke-red-950"
                        : "fill-slate-300 stroke-white dark:fill-slate-700 dark:stroke-slate-900"
                  }
                />

                <rect
                  x={CARD_X}
                  y={y}
                  width={CARD_W}
                  height={CARD_H}
                  rx={16}
                  strokeWidth={isCurrent || isHit ? 2.5 : 1.5}
                  className={shell}
                />

                <Glyph
                  name={l.glyph}
                  x={CARD_X + 46}
                  y={y + CARD_H / 2}
                  size={26}
                  className={ink}
                />

                <text
                  x={CARD_X + 84}
                  y={y + 36}
                  className="fill-slate-900 text-[16px] font-bold dark:fill-slate-50"
                >
                  {l.name}
                </text>
                <text
                  x={CARD_X + 84}
                  y={y + 58}
                  className="fill-slate-500 text-[12.5px] dark:fill-slate-400"
                >
                  {l.sub}
                </text>

                {/* cached-copy chip appears on the return trip */}
                {cached && (
                  <g>
                    <rect
                      x={CARD_X + CARD_W - 300}
                      y={y + CARD_H / 2 - 14}
                      width={112}
                      height={28}
                      rx={14}
                      className="fill-emerald-100 stroke-emerald-300 dark:fill-emerald-950 dark:stroke-emerald-800"
                      strokeWidth={1}
                    />
                    <text
                      x={CARD_X + CARD_W - 244}
                      y={y + CARD_H / 2 + 5}
                      textAnchor="middle"
                      className="fill-emerald-700 text-[11px] font-bold dark:fill-emerald-300"
                    >
                      ✓ stored
                    </text>
                  </g>
                )}

                <text
                  x={CARD_X + CARD_W - 150}
                  y={y + CARD_H / 2 + 5}
                  textAnchor="end"
                  className="fill-slate-400 font-mono text-[13px] dark:fill-slate-500"
                >
                  ~{l.ms} ms
                </text>

                {/* verdict chip */}
                <g opacity={reached ? 1 : 0} style={{ transition: "opacity 250ms" }}>
                  <rect
                    x={CARD_X + CARD_W - 118}
                    y={y + CARD_H / 2 - 16}
                    width={92}
                    height={32}
                    rx={16}
                    className={isHit ? "fill-emerald-500" : "fill-red-500"}
                  />
                  <text
                    x={CARD_X + CARD_W - 72}
                    y={y + CARD_H / 2 + 6}
                    textAnchor="middle"
                    className="fill-white text-[13px] font-black uppercase tracking-wider"
                  >
                    {isHit ? "hit" : "miss"}
                  </text>
                </g>
              </g>
            );
          })}

          {/* travelling token */}
          {phase !== "idle" && pos >= 0 && (
            <g>
              <circle
                cx={SPINE_X}
                cy={rowMid(pos)}
                r={20}
                opacity={0.18}
                className={
                  phase === "up" || phase === "done" ? "fill-emerald-500" : "fill-blue-600"
                }
              />
              <circle
                cx={SPINE_X}
                cy={rowMid(pos)}
                r={14}
                className={
                  phase === "up" || phase === "done" ? "fill-emerald-500" : "fill-blue-600"
                }
              />
              <text
                x={SPINE_X}
                y={rowMid(pos) + 5}
                textAnchor="middle"
                className="fill-white text-[13px] font-black"
              >
                {phase === "up" || phase === "done" ? "A" : "?"}
              </text>
            </g>
          )}
        </svg>
      </Stage>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Btn primary onClick={run} disabled={phase === "down" || phase === "up"}>
          {phase === "down" || phase === "up" ? "Looking up…" : "Look up blog.example.com"}
        </Btn>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold transition ${
            phase === "done"
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
              : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
          }`}
        >
          {phase === "done"
            ? `answered in ~${cost} ms by ${LAYERS[sc.hitAt].name}`
            : `costs ~${cost} ms`}
        </span>
      </div>

      <div className="mt-4 rounded-lg border-l-4 border-violet-500 bg-violet-50 px-5 py-4 shadow-sm dark:bg-violet-950/30">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">{sc.explain}</p>
      </div>

      {/* TTL tradeoff */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-600 dark:text-blue-400">
            The TTL tradeoff
          </p>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          TTL is the only lever you have over other people's caches. Short means you can move
          traffic quickly; long means fewer queries and less exposure if your nameservers go down.
          Drag it.
        </p>

        <input
          type="range"
          min={0}
          max={5}
          step={1}
          value={[30, 60, 300, 3600, 21600, 86400].indexOf(ttl)}
          onChange={(e) => setTtl([30, 60, 300, 3600, 21600, 86400][Number(e.target.value)])}
          className="mt-4 w-full accent-blue-600"
          aria-label="TTL"
        />
        <div className="flex justify-between font-mono text-[10px] text-slate-400 dark:text-slate-500">
          {["30s", "60s", "5m", "1h", "6h", "24h"].map((x) => (
            <span key={x}>{x}</span>
          ))}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            { k: "TTL", v: ttlLabel, tone: "text-slate-900 dark:text-slate-100" },
            {
              k: "Queries/day to your NS",
              v: qpd.toLocaleString("en-US"),
              tone:
                ttl <= 60
                  ? "text-red-600 dark:text-red-400"
                  : "text-emerald-600 dark:text-emerald-400",
            },
            {
              k: "Worst-case failover delay",
              v: ttlLabel,
              tone:
                ttl >= 21600
                  ? "text-red-600 dark:text-red-400"
                  : "text-emerald-600 dark:text-emerald-400",
            },
          ].map((b) => (
            <div
              key={b.k}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 dark:border-slate-800 dark:bg-slate-950"
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {b.k}
              </div>
              <div className={`mt-0.5 font-mono text-lg font-bold ${b.tone}`}>{b.v}</div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          Estimated against roughly {RESOLVERS.toLocaleString("en-US")} distinct resolvers asking
          for one popular name. The standard trick before a planned migration is to drop the TTL to
          60 seconds a day ahead, cut over, then raise it back.
        </p>
      </div>
    </Panel>
  );
};

export default {
  DnsResolutionWalkthrough,
  DnsHierarchyDiagram,
  DnsQueryTypesDiagram,
  DnsRecordExplorer,
  DnsCacheJourney,
};
