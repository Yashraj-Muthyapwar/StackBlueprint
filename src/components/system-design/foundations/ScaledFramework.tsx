import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { LucideIcon } from "lucide-react";
import {
  Archive,
  ArrowLeftRight,
  ArrowRight,
  Check,
  Clock,
  Copy,
  Database,
  Gauge,
  Globe,
  Layers,
  Lock,
  RotateCcw,
  Scale,
  ScrollText,
  Server,
  ShieldCheck,
  Split,
  Target,
  Timer,
  Users,
  X,
  Zap,
} from "lucide-react";

import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/* Data                                                                       */
/* -------------------------------------------------------------------------- */

type TabId = "S" | "C" | "A" | "L" | "E" | "D" | "T" | "Y";

type TabDef = {
  id: TabId;
  short: string;
  name: string;
  icon: LucideIcon;
  question: string;
  definition: string;
  metric: string;
  interview: string;
};

const TABS: TabDef[] = [
  {
    id: "S",
    short: "S",
    name: "Scalability",
    icon: Layers,
    question: "Can it grow without breaking?",
    definition:
      "Scalability is the ability to handle more load when you add resources. Scale up adds power to one machine. Scale out adds more machines.",
    metric: "Users, requests per second, data volume",
    interview: "How would you handle 10x traffic tomorrow?",
  },
  {
    id: "C",
    short: "C",
    name: "Consistency",
    icon: ArrowLeftRight,
    question: "Do all users see the same data at the same time?",
    definition:
      "Consistency means that every read gets the most recent write. Strong consistency updates all nodes at once. Eventual consistency updates them a little later.",
    metric: "Strong or eventual",
    interview: "Should your system prioritize consistency or availability?",
  },
  {
    id: "A",
    short: "A",
    name: "Availability",
    icon: ShieldCheck,
    question: "Is the system there when you need it?",
    definition:
      "Availability is the share of time that the system works. We measure it in nines. Each extra nine cuts the downtime by 10 times.",
    metric: "Uptime % (nines)",
    interview: "What is your availability target and how do you reach it?",
  },
  {
    id: "L",
    short: "L",
    name: "Latency",
    icon: Timer,
    question: "Is it fast enough for users?",
    definition:
      "Latency is the time for a request to go from the client to the server and back. Users feel a delay above 100 ms. The slowest requests (p99) matter as much as the typical one (p50).",
    metric: "p50, p95, p99 response time",
    interview: "How would you reduce latency in this system?",
  },
  {
    id: "E",
    short: "E",
    name: "Efficiency",
    icon: Gauge,
    question: "Does it use resources well?",
    definition:
      "Efficiency means the most output for the least resources: compute, storage, network, and cost. Idle servers waste money. Too few servers drop requests.",
    metric: "Cost per request, utilization",
    interview: "How would you cut the cost of this system by 50%?",
  },
  {
    id: "D",
    short: "D",
    name: "Durability",
    icon: Database,
    question: "Does the data stay safe?",
    definition:
      "Durability means that saved data is not lost, even when a part of the system fails. Each strategy protects against a different failure.",
    metric: "RPO, RTO, backup frequency",
    interview: "How do you make sure that a server crash loses zero data?",
  },
  {
    id: "T",
    short: "⇄",
    name: "Trade-offs",
    icon: Scale,
    question: "Can a system have all six?",
    definition:
      "No. You cannot maximize all six superpowers at once. Each design choice picks some and gives up others. Say which ones you pick and why.",
    metric: "Match the choice to the business need",
    interview: "Why did you choose this trade-off?",
  },
  {
    id: "Y",
    short: "?",
    name: "Your turn",
    icon: Target,
    question: "Can you choose the right trade-off?",
    definition:
      "Read the scenario. Mark two superpowers to prioritize and one to give up. Then check your answer.",
    metric: "2 to prioritize, 1 to give up",
    interview: "Which superpowers do you prioritize for this system, and why?",
  },
];

/* -------------------------------------------------------------------------- */
/* Small shared parts                                                         */
/* -------------------------------------------------------------------------- */

const SEG_BASE = "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors";
const SEG_ON = "border-mint/60 bg-mint/15 text-mint";
const SEG_OFF = "border-hairline text-muted-foreground hover:bg-muted/50 hover:text-foreground";

function Seg({
  on,
  onClick,
  children,
  title,
}: {
  on: boolean;
  onClick: () => void;
  children: ReactNode;
  title?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-pressed={on}
      onClick={onClick}
      className={cn(SEG_BASE, on ? SEG_ON : SEG_OFF)}
    >
      {children}
    </button>
  );
}

function Tile({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "ok" | "warn" | "bad";
}) {
  return (
    <div className="min-w-0 rounded-lg border border-hairline bg-muted/20 px-2.5 py-1.5">
      <p className="truncate font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "truncate font-mono text-sm font-semibold",
          tone === "ok"
            ? "text-mint"
            : tone === "warn"
              ? "text-amber"
              : tone === "bad"
                ? "text-rose"
                : "text-foreground",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function Range({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block font-mono text-[11px] text-muted-foreground">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer accent-mint"
      />
    </label>
  );
}

function Status({ tone, children }: { tone: "ok" | "warn" | "bad"; children: ReactNode }) {
  return (
    <p
      className={cn(
        "rounded-lg border px-2.5 py-1.5 text-xs font-medium",
        tone === "ok"
          ? "border-mint/40 bg-mint/10 text-mint"
          : tone === "warn"
            ? "border-amber/40 bg-amber/10 text-amber"
            : "border-rose/40 bg-rose/10 text-rose",
      )}
    >
      {children}
    </p>
  );
}

/** Dots that travel along a line. More load gives more dots and faster travel. */
function Flow({
  count,
  speed,
  tone,
  width = "w-16 sm:w-24",
}: {
  count: number;
  speed: number;
  tone: "mint" | "rose";
  width?: string;
}) {
  const reduce = !!useReducedMotion();
  return (
    <div className={cn("relative h-6 shrink-0", width)} aria-hidden>
      <span className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-foreground/20" />
      {!reduce &&
        Array.from({ length: count }, (_, k) => (
          <motion.span
            key={k}
            className={cn(
              "absolute top-1/2 size-1.5 -translate-y-1/2 rounded-full",
              tone === "mint" ? "bg-mint" : "bg-rose",
            )}
            initial={{ left: "0%", opacity: 0 }}
            animate={{ left: ["0%", "100%"], opacity: [0, 1, 1, 0] }}
            transition={{
              duration: 1.6 / speed,
              delay: (k * 1.6) / speed / count,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* S: Scalability                                                             */
/* -------------------------------------------------------------------------- */

const SIZES = [
  { ram: 8, cap: 150 },
  { ram: 16, cap: 300 },
  { ram: 32, cap: 450 },
  { ram: 64, cap: 600 },
];
const NODE_CAP = 150;

function ScalabilityDemo() {
  const [mode, setMode] = useState<"up" | "out">("up");
  const [load, setLoad] = useState(3);
  const rps = load * 100;

  const size = SIZES.find((s) => s.cap >= rps);
  const nodes = Math.ceil(rps / NODE_CAP);
  const overloaded = mode === "up" && !size;
  const capacity = mode === "up" ? (size?.cap ?? SIZES[SIZES.length - 1].cap) : nodes * NODE_CAP;
  const util = Math.min(100, Math.round((rps / capacity) * 100));

  return (
    <div className="flex h-full flex-col gap-2.5">
      <div className="flex flex-wrap items-center gap-1.5">
        <Seg on={mode === "up"} onClick={() => setMode("up")} title="Add power to one machine">
          Scale up
        </Seg>
        <Seg on={mode === "out"} onClick={() => setMode("out")} title="Add more machines">
          Scale out
        </Seg>
        <span className="ml-auto font-mono text-[11px] text-muted-foreground">
          {mode === "up" ? "One bigger machine" : "More machines behind a load balancer"}
        </span>
      </div>

      <Range
        label={`Traffic: ${load}x (${rps} requests per second)`}
        value={load}
        min={1}
        max={10}
        onChange={setLoad}
      />

      <div className="flex min-h-0 flex-1 items-center justify-center gap-1 rounded-lg border border-hairline bg-muted/10 p-2">
        <div className="flex flex-col items-center gap-0.5">
          <span className="grid size-9 place-items-center rounded-full border border-hairline bg-background text-muted-foreground">
            <Users className="size-4" />
          </span>
          <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
            Users
          </span>
        </div>
        <Flow count={Math.min(6, load + 1)} speed={0.7 + load * 0.15} tone={overloaded ? "rose" : "mint"} />

        {mode === "up" ? (
          <motion.div
            animate={{ scale: size ? 0.8 + SIZES.indexOf(size) * 0.18 : 1.35 }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
            className={cn(
              "flex flex-col items-center gap-0.5 rounded-xl border px-5 py-2",
              overloaded
                ? "border-rose/60 bg-rose/10 text-rose"
                : "border-violet/60 bg-violet/10 text-violet",
            )}
          >
            <Server className="size-6" />
            <span className="font-mono text-[11px] font-semibold">
              {size ? `${size.ram} GB RAM` : "64 GB RAM (limit)"}
            </span>
          </motion.div>
        ) : (
          <>
            <div className="flex flex-col items-center gap-0.5">
              <span className="grid size-9 place-items-center rounded-lg border border-violet/50 bg-violet/10 text-violet">
                <Split className="size-4" />
              </span>
              <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                Balancer
              </span>
            </div>
            <Flow count={Math.min(5, nodes)} speed={1.1} tone="mint" width="w-8 sm:w-12" />
            <div className="grid max-w-[11rem] grid-cols-4 gap-1">
              <AnimatePresence initial={false}>
                {Array.from({ length: nodes }, (_, k) => (
                  <motion.span
                    key={k}
                    initial={{ opacity: 0, scale: 0.4 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.4 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="grid size-8 place-items-center rounded-lg border border-amber/60 bg-amber/10 text-amber"
                  >
                    <Server className="size-4" />
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Tile label="Load" value={`${rps} req/s`} />
        <Tile label="Capacity" value={`${capacity} req/s`} tone={overloaded ? "bad" : "ok"} />
        <Tile
          label={mode === "up" ? "Machine use" : "Machines"}
          value={mode === "up" ? `${util}%` : String(nodes)}
          tone={overloaded ? "bad" : "default"}
        />
      </div>
      {overloaded ? (
        <Status tone="bad">
          Overloaded. One machine has a hardware limit. You cannot add more power.
        </Status>
      ) : mode === "up" ? (
        <Status tone="ok">The machine handles the load. Scaling up has a limit.</Status>
      ) : (
        <Status tone="ok">
          {nodes} {nodes === 1 ? "machine handles" : "machines handle"} the load. Add more machines
          for more load.
        </Status>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* C: Consistency                                                             */
/* -------------------------------------------------------------------------- */

type Trio = [number, number, number];
type Flags = [boolean, boolean, boolean];

function ConsistencyDemo() {
  const reduce = !!useReducedMotion();
  const [mode, setMode] = useState<"strong" | "eventual">("strong");
  const [vals, setVals] = useState<Trio>([10, 10, 10]);
  const [pending, setPending] = useState<Flags>([false, false, false]);
  const [target, setTarget] = useState(10);
  const [locked, setLocked] = useState(false);
  const [read, setRead] = useState<{ node: number; text: string; tone: "ok" | "warn" | "bad" } | null>(
    null,
  );
  const timers = useRef<number[]>([]);

  const clear = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };
  useEffect(() => clear, []);

  const reset = (m: "strong" | "eventual") => {
    clear();
    setMode(m);
    setVals([10, 10, 10]);
    setPending([false, false, false]);
    setTarget(10);
    setLocked(false);
    setRead(null);
  };

  const write = () => {
    if (locked) return;
    const next = target + 1;
    setTarget(next);
    setRead(null);
    const at = (ms: number, fn: () => void) => {
      timers.current.push(window.setTimeout(fn, reduce ? 0 : ms));
    };
    const land = (i: number) => {
      setVals((v) => {
        const c: Trio = [v[0], v[1], v[2]];
        c[i] = next;
        return c;
      });
      setPending((p) => {
        const c: Flags = [p[0], p[1], p[2]];
        c[i] = false;
        return c;
      });
    };
    if (mode === "strong") {
      setLocked(true);
      setPending([true, true, true]);
      at(1100, () => {
        setVals([next, next, next]);
        setPending([false, false, false]);
        setLocked(false);
      });
    } else {
      land(0);
      setPending([false, true, true]);
      at(900, () => land(1));
      at(1800, () => land(2));
    }
  };

  const doRead = (i: number) => {
    if (locked) {
      setRead({
        node: i,
        text: "The read waits. Strong consistency blocks reads until the write ends.",
        tone: "warn",
      });
      return;
    }
    const v = vals[i];
    setRead(
      v === target
        ? { node: i, text: `Node ${"ABC"[i]} returns ${v}. This is the latest value.`, tone: "ok" }
        : {
          node: i,
          text: `Node ${"ABC"[i]} returns ${v}. The latest value is ${target}. This is an old read.`,
          tone: "bad",
        },
    );
  };

  return (
    <div className="flex h-full flex-col gap-2.5">
      <div className="flex flex-wrap items-center gap-1.5">
        <Seg on={mode === "strong"} onClick={() => reset("strong")}>
          Strong
        </Seg>
        <Seg on={mode === "eventual"} onClick={() => reset("eventual")}>
          Eventual
        </Seg>
        <button
          type="button"
          onClick={write}
          disabled={locked}
          className="ml-auto flex h-7 items-center gap-1.5 rounded-md bg-mint px-3 text-xs font-semibold text-primary-foreground transition-colors hover:bg-mint/90 disabled:opacity-50"
        >
          Add 1 like (write to A)
        </button>
      </div>

      <div className="grid flex-1 grid-cols-3 gap-2">
        {vals.map((v, i) => {
          const old = !locked && v < target;
          return (
            <div
              key={i}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-lg border px-2 py-2 text-center transition-colors",
                locked
                  ? "border-amber/50 bg-amber/10"
                  : old
                    ? "border-rose/50 bg-rose/10"
                    : "border-mint/40 bg-mint/10",
              )}
            >
              <Database
                className={cn("size-4", locked ? "text-amber" : old ? "text-rose" : "text-mint")}
              />
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Node {"ABC"[i]}
              </p>
              <motion.p
                key={v}
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
                className="font-mono text-xl font-semibold text-foreground"
              >
                {v}
              </motion.p>
              <p
                className={cn(
                  "flex items-center gap-1 font-mono text-[10px]",
                  locked ? "text-amber" : old ? "text-rose" : "text-mint",
                )}
              >
                {locked ? (
                  <>
                    <Lock className="size-3" /> locked
                  </>
                ) : pending[i] ? (
                  <motion.span
                    animate={reduce ? undefined : { opacity: [1, 0.35, 1] }}
                    transition={{ duration: 0.9, repeat: Infinity }}
                  >
                    syncing…
                  </motion.span>
                ) : old ? (
                  "old value"
                ) : (
                  <>
                    <Check className="size-3" /> latest
                  </>
                )}
              </p>
              <button
                type="button"
                onClick={() => doRead(i)}
                className={cn(
                  "rounded border px-2 py-0.5 text-[10px] font-medium transition-colors",
                  read?.node === i
                    ? "border-mint/50 bg-mint/10 text-mint"
                    : "border-hairline text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )}
              >
                Read
              </button>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Tile
          label="Write time (example)"
          value={mode === "strong" ? "about 120 ms" : "about 15 ms"}
          tone={mode === "strong" ? "warn" : "ok"}
        />
        <Tile
          label="Read can be old?"
          value={mode === "strong" ? "No" : "Yes, for a short time"}
          tone={mode === "strong" ? "ok" : "warn"}
        />
      </div>

      {read ? (
        <Status tone={read.tone}>{read.text}</Status>
      ) : (
        <Status tone={mode === "strong" ? "ok" : "warn"}>
          {mode === "strong"
            ? "Strong: the write waits. All nodes change together. Add a like. Then click Read."
            : "Eventual: the write returns at once. Add a like. Then click Read on node C fast."}
        </Status>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* A: Availability                                                            */
/* -------------------------------------------------------------------------- */

const NINES = [
  { pct: "99%", name: "two nines", down: "3.65 days", mins: 5256, example: "Personal blog" },
  { pct: "99.9%", name: "three nines", down: "8.76 hours", mins: 525.6, example: "Business apps" },
  { pct: "99.99%", name: "four nines", down: "52.6 minutes", mins: 52.56, example: "E-commerce" },
  {
    pct: "99.999%",
    name: "five nines",
    down: "5.26 minutes",
    mins: 5.256,
    example: "Banking, healthcare",
  },
];

function fmtMins(m: number) {
  if (m >= 1440) return `${(m / 1440).toFixed(1)} days`;
  if (m >= 60) return `${(m / 60).toFixed(1)} hours`;
  if (m >= 1) return `${m.toFixed(1)} min`;
  return `${Math.round(m * 60)} sec`;
}

function AvailabilityDemo() {
  const [sel, setSel] = useState(1);
  const lo = Math.log10(5.256);
  const span = Math.log10(5256) - lo;
  const cur = NINES[sel];

  return (
    <div className="flex h-full flex-col gap-2.5">
      <p className="font-mono text-[11px] text-muted-foreground">
        Downtime in one year. Click a row. The bars use a log scale.
      </p>
      <div className="flex flex-1 flex-col justify-center gap-1.5">
        {NINES.map((n, k) => {
          const w = 18 + (82 * (Math.log10(n.mins) - lo)) / span;
          return (
            <button
              key={n.pct}
              type="button"
              aria-pressed={sel === k}
              onClick={() => setSel(k)}
              className={cn(
                "grid grid-cols-[4.2rem_minmax(0,1fr)_5.6rem] items-center gap-2 rounded-lg border px-2 py-1.5 text-left transition-colors",
                sel === k ? "border-mint/60 bg-mint/10" : "border-hairline hover:bg-muted/40",
              )}
            >
              <span className="font-mono text-xs font-semibold text-foreground">{n.pct}</span>
              <span className="h-2 rounded-full bg-muted">
                <motion.span
                  className={cn("block h-2 rounded-full", sel === k ? "bg-mint" : "bg-rose/60")}
                  initial={false}
                  animate={{ width: `${w}%` }}
                  transition={{ type: "spring", stiffness: 160, damping: 22 }}
                />
              </span>
              <span className="text-right font-mono text-[11px] text-muted-foreground">
                {n.down}
              </span>
            </button>
          );
        })}
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Tile label="Target" value={cur.name} />
        <Tile label="Typical use" value={cur.example} />
        <Tile label="Per month" value={fmtMins(cur.mins / 12)} tone={sel === 0 ? "bad" : "default"} />
        <Tile label="Per day" value={fmtMins(cur.mins / 365)} />
      </div>
      <Status tone="ok">
        Each extra nine cuts the downtime by 10 times. It also costs more to build.
      </Status>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* L: Latency                                                                 */
/* -------------------------------------------------------------------------- */

function latencyTier(ms: number) {
  if (ms < 100) return { label: "Instant", example: "Google Search", tone: "ok" as const };
  if (ms < 300)
    return { label: "Slight delay", example: "E-commerce checkout", tone: "ok" as const };
  if (ms <= 1000)
    return { label: "Noticeable", example: "Acceptable for complex queries", tone: "warn" as const };
  return { label: "Frustrating", example: "Users start to leave", tone: "bad" as const };
}

function LatencyDemo() {
  const reduce = !!useReducedMotion();
  const [ms, setMs] = useState(80);
  const p95 = Math.round(ms * 2.2);
  const p99 = Math.round(ms * 3.5);
  const tier = latencyTier(ms);
  const loss = ms / 100;

  return (
    <div className="flex h-full flex-col gap-2.5">
      <Range
        label={`Typical latency (p50): ${ms} ms`}
        value={ms}
        min={20}
        max={1500}
        step={10}
        onChange={setMs}
      />

      <div className="relative flex min-h-0 flex-1 items-center rounded-lg border border-hairline bg-muted/10 px-3">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-violet/10 text-violet">
          <Clock className="size-4" />
        </span>
        <div className="relative mx-2 h-8 flex-1">
          <span className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-foreground/20" />
          <motion.span
            key={ms}
            className={cn(
              "absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full",
              tier.tone === "ok" ? "bg-mint" : tier.tone === "warn" ? "bg-amber" : "bg-rose",
            )}
            initial={{ left: "0%" }}
            animate={reduce ? { left: "50%" } : { left: ["0%", "100%", "0%"] }}
            transition={{
              duration: Math.max(0.4, ms / 400),
              repeat: reduce ? 0 : Infinity,
              ease: "linear",
            }}
          />
        </div>
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-amber/10 text-amber">
          <Server className="size-4" />
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Tile label="p50" value={`${ms} ms`} tone={tier.tone} />
        <Tile label="p95 (example)" value={`${p95} ms`} tone={latencyTier(p95).tone} />
        <Tile label="p99 (example)" value={`${p99} ms`} tone={latencyTier(p99).tone} />
        <Tile
          label="Sales lost (estimate)"
          value={`${loss.toFixed(1)}%`}
          tone={loss >= 3 ? "bad" : "default"}
        />
      </div>
      <Status tone={tier.tone}>
        {tier.label} for most users. {tier.example}. Amazon found that every 100 ms of latency
        costs 1% of sales.
      </Status>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* E: Efficiency                                                              */
/* -------------------------------------------------------------------------- */

const E_LOAD = 1000;
const E_CAP = 250;
const E_COST = 100;

function EfficiencyDemo() {
  const [n, setN] = useState(6);
  const [cut, setCut] = useState<{ from: number; to: number } | null>(null);
  const capacity = n * E_CAP;
  const served = Math.min(E_LOAD, capacity);
  const util = Math.round((served / capacity) * 100);
  const dropped = E_LOAD - served;
  const perHour = n * E_COST;
  const per1k = perHour / (served * 3.6);

  const tone = dropped > 0 ? "bad" : util >= 80 ? "ok" : "warn";
  const saved = cut ? Math.round((1 - cut.to / cut.from) * 100) : 0;

  return (
    <div className="flex h-full flex-col gap-2.5">
      <div className="flex items-end gap-2">
        <div className="min-w-0 flex-1">
          <Range
            label={`Servers: ${n} ($${perHour} per hour). Traffic: ${E_LOAD} req/s`}
            value={n}
            min={1}
            max={8}
            onChange={(v) => {
              setCut(null);
              setN(v);
            }}
          />
        </div>
        <button
          type="button"
          onClick={() => {
            const to = Math.max(1, Math.round(n / 2));
            setCut({ from: n, to });
            setN(to);
          }}
          className="shrink-0 rounded-md border border-amber/50 px-2.5 py-1 text-xs font-medium text-amber transition-colors hover:bg-amber/10"
        >
          Cut cost 50%
        </button>
      </div>

      <div className="flex min-h-0 flex-1 items-end justify-center gap-1.5 rounded-lg border border-hairline bg-muted/10 p-2">
        {Array.from({ length: n }, (_, k) => (
          <div key={k} className="flex flex-col items-center gap-1">
            <div className="relative h-14 w-8 overflow-hidden rounded-md border border-amber/50 bg-amber/5">
              <motion.span
                className={cn(
                  "absolute inset-x-0 bottom-0",
                  util >= 80 ? "bg-mint/60" : "bg-amber/50",
                )}
                initial={false}
                animate={{ height: `${util}%` }}
                transition={{ type: "spring", stiffness: 160, damping: 22 }}
              />
            </div>
            <Server className="size-3.5 text-amber" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Tile label="Throughput" value={`${served}/s`} tone={dropped > 0 ? "bad" : "ok"} />
        <Tile label="Utilization" value={`${util}%`} tone={util >= 80 ? "ok" : "warn"} />
        <Tile label="Cost / 1,000 req" value={`$${per1k.toFixed(3)}`} />
        <Tile label="Dropped" value={`${dropped}/s`} tone={dropped > 0 ? "bad" : "ok"} />
      </div>
      <Status tone={tone}>
        {cut && saved > 0 ? `You cut the cost by ${saved}%. ` : ""}
        {dropped > 0
          ? "Too few servers. Some requests wait or fail. A cost cut must not break the service."
          : util >= 80
            ? "A good fit. The servers do useful work."
            : "Too many servers. You pay for idle capacity. Cut servers until the use is high."}{" "}
        <span className="font-normal opacity-80">Example numbers.</span>
      </Status>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* D: Durability                                                              */
/* -------------------------------------------------------------------------- */

type DId = "replication" | "backups" | "wal" | "geo";
type Fail = "server" | "region";

const D_OPTIONS: { id: DId; label: string; icon: LucideIcon; note: string }[] = [
  { id: "replication", label: "Replication", icon: Copy, note: "Copies on other servers" },
  { id: "backups", label: "Backups", icon: Archive, note: "Snapshots at set times" },
  { id: "wal", label: "Write-ahead log", icon: ScrollText, note: "Log a change first" },
  { id: "geo", label: "Geo-redundancy", icon: Globe, note: "Copies in other regions" },
];

function durabilityOutcome(on: Set<DId>, fail: Fail, rpo: number) {
  const partial = {
    tone: "warn" as const,
    text: `Some data lost. Up to ${rpo} ${rpo === 1 ? "hour" : "hours"} of data since the last backup is gone (RPO).`,
  };
  if (fail === "server") {
    if (on.has("replication") || on.has("geo"))
      return { tone: "ok" as const, text: "Safe. Another server has a copy." };
    if (on.has("wal"))
      return { tone: "ok" as const, text: "Safe. The server replays the log after a restart." };
    if (on.has("backups")) return partial;
    return { tone: "bad" as const, text: "Data lost. Nothing keeps a copy." };
  }
  if (on.has("geo")) return { tone: "ok" as const, text: "Safe. Another region has a copy." };
  if (on.has("backups")) return partial;
  if (on.has("replication") || on.has("wal"))
    return { tone: "bad" as const, text: "Data lost. All copies are in the failed region." };
  return { tone: "bad" as const, text: "Data lost. Nothing keeps a copy." };
}

function DurabilityDemo() {
  const [on, setOn] = useState<Set<DId>>(new Set());
  const [fail, setFail] = useState<Fail | null>(null);
  const [rpo, setRpo] = useState(6);

  const toggle = (id: DId) => {
    setFail(null);
    setOn((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const copies: { key: string; label: string; gone: (f: Fail) => boolean }[] = [
    { key: "primary", label: "Primary", gone: () => true },
    ...(on.has("replication")
      ? [{ key: "rep", label: "Replica", gone: (f: Fail) => f === "region" }]
      : []),
    ...(on.has("backups")
      ? [{ key: "bak", label: `Backup (${rpo} h)`, gone: (f: Fail) => f === "region" }]
      : []),
    ...(on.has("wal") ? [{ key: "wal", label: "Log", gone: (f: Fail) => f === "region" }] : []),
    ...(on.has("geo") ? [{ key: "geo", label: "Other region", gone: () => false }] : []),
  ];
  const result = fail ? durabilityOutcome(on, fail, rpo) : null;

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="grid grid-cols-2 gap-1.5">
        {D_OPTIONS.map((o) => {
          const Icon = o.icon;
          const active = on.has(o.id);
          return (
            <button
              key={o.id}
              type="button"
              aria-pressed={active}
              onClick={() => toggle(o.id)}
              className={cn(
                "flex min-w-0 items-center gap-2 rounded-lg border px-2 py-1.5 text-left transition-colors",
                active ? "border-mint/60 bg-mint/10" : "border-hairline hover:bg-muted/40",
              )}
            >
              <Icon
                className={cn("size-3.5 shrink-0", active ? "text-mint" : "text-muted-foreground")}
              />
              <span className="min-w-0">
                <span className="block truncate text-xs font-semibold text-foreground">
                  {o.label}
                </span>
                <span className="block truncate text-[10px] text-muted-foreground">{o.note}</span>
              </span>
            </button>
          );
        })}
      </div>

      {on.has("backups") && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-mono text-[11px] text-muted-foreground">Backup every:</span>
          {[1, 6, 24].map((h) => (
            <Seg
              key={h}
              on={rpo === h}
              onClick={() => {
                setFail(null);
                setRpo(h);
              }}
            >
              {h} h
            </Seg>
          ))}
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-wrap content-center items-center justify-center gap-1.5 rounded-lg border border-hairline bg-muted/10 p-2">
        <AnimatePresence initial={false}>
          {copies.map((c) => {
            const gone = fail ? c.gone(fail) : false;
            return (
              <motion.span
                key={c.key}
                layout
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: gone ? 0.55 : 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                className={cn(
                  "flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-[11px]",
                  gone
                    ? "border-rose/50 bg-rose/10 text-rose line-through"
                    : fail
                      ? "border-mint/60 bg-mint/10 text-mint"
                      : "border-violet/50 bg-violet/10 text-violet",
                )}
              >
                {gone ? <X className="size-3" /> : <Database className="size-3" />}
                {c.label}
              </motion.span>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="font-mono text-[11px] text-muted-foreground">Cause a failure:</span>
        <button
          type="button"
          onClick={() => setFail("server")}
          className="rounded-md border border-rose/40 px-2.5 py-1 text-xs font-medium text-rose transition-colors hover:bg-rose/10"
        >
          Server crash
        </button>
        <button
          type="button"
          onClick={() => setFail("region")}
          className="rounded-md border border-rose/40 px-2.5 py-1 text-xs font-medium text-rose transition-colors hover:bg-rose/10"
        >
          Region outage
        </button>
      </div>
      {result ? (
        <Status tone={result.tone}>{result.text}</Status>
      ) : (
        <p className="rounded-lg border border-dashed border-hairline px-2.5 py-1.5 text-xs text-muted-foreground">
          Turn on some strategies. Then cause a failure.
        </p>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Trade-offs                                                                 */
/* -------------------------------------------------------------------------- */

type Letter = "S" | "C" | "A" | "L" | "E" | "D";
const LETTERS: { id: Letter; name: string }[] = [
  { id: "S", name: "Scalability" },
  { id: "C", name: "Consistency" },
  { id: "A", name: "Availability" },
  { id: "L", name: "Latency" },
  { id: "E", name: "Efficiency" },
  { id: "D", name: "Durability" },
];

type Corner = "C" | "A" | "P";

const SYSTEMS: {
  id: string;
  name: string;
  high: Letter[];
  gives: Letter;
  picks: [Corner, Corner];
  why: string;
}[] = [
    {
      id: "whatsapp",
      name: "WhatsApp",
      high: ["S", "L", "A", "D"],
      gives: "C",
      picks: ["A", "P"],
      why: "Your message arrives in milliseconds. The seen tick can come later. The app stays up when the network has faults.",
    },
    {
      id: "bank",
      name: "Banking app",
      high: ["C", "D"],
      gives: "L",
      picks: ["C", "A"],
      why: "Money must be exact, even if the app is a little slow.",
    },
    {
      id: "netflix",
      name: "Netflix",
      high: ["A", "L"],
      gives: "C",
      picks: ["A", "P"],
      why: "The video must play. View counts can lag.",
    },
    {
      id: "google",
      name: "Google Search",
      high: ["L", "A"],
      gives: "C",
      picks: ["A", "P"],
      why: "Speed matters. The index can be a little old.",
    },
    {
      id: "stocks",
      name: "Stock trading",
      high: ["C", "L"],
      gives: "E",
      picks: ["C", "P"],
      why: "Every millisecond and every cent matters. The cost is high.",
    },
    {
      id: "instagram",
      name: "Instagram",
      high: ["A", "S"],
      gives: "C",
      picks: ["A", "P"],
      why: "Like counts can be approximate. The app must stay up and grow.",
    },
  ];

const CORNER_POS: Record<Corner, { x: number; y: number; label: string }> = {
  C: { x: 60, y: 14, label: "Consistency" },
  A: { x: 12, y: 92, label: "Availability" },
  P: { x: 108, y: 92, label: "Performance" },
};

function Triangle({ picks }: { picks: [Corner, Corner] }) {
  const a = CORNER_POS[picks[0]];
  const b = CORNER_POS[picks[1]];
  return (
    <svg
      viewBox="0 0 120 112"
      className="h-full max-h-[7.5rem] w-full"
      role="img"
      aria-label="Trade-off triangle"
    >
      <polygon
        points={`${CORNER_POS.C.x},${CORNER_POS.C.y} ${CORNER_POS.A.x},${CORNER_POS.A.y} ${CORNER_POS.P.x},${CORNER_POS.P.y}`}
        className="fill-none stroke-foreground/20"
        strokeWidth={1}
      />
      <motion.line
        key={`${picks[0]}${picks[1]}`}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5 }}
        x1={a.x}
        y1={a.y}
        x2={b.x}
        y2={b.y}
        className="stroke-mint"
        strokeWidth={3}
        strokeLinecap="round"
      />
      {(Object.keys(CORNER_POS) as Corner[]).map((c) => {
        const p = CORNER_POS[c];
        const on = picks.includes(c);
        return (
          <g key={c}>
            <circle cx={p.x} cy={p.y} r={5} className={on ? "fill-mint" : "fill-muted"} />
            <text
              x={p.x}
              y={c === "C" ? p.y - 8 : p.y + 14}
              textAnchor={c === "A" ? "start" : c === "P" ? "end" : "middle"}
              dx={c === "A" ? -8 : c === "P" ? 8 : 0}
              className={cn("text-[8px]", on ? "fill-foreground" : "fill-muted-foreground")}
            >
              {p.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function TradeoffDemo() {
  const [sel, setSel] = useState(0);
  const sys = SYSTEMS[sel];

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex flex-wrap gap-1.5">
        {SYSTEMS.map((s, k) => (
          <Seg key={s.id} on={sel === k} onClick={() => setSel(k)}>
            {s.name}
          </Seg>
        ))}
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_7.5rem] gap-2">
        <div className="grid grid-cols-3 gap-1.5">
          {LETTERS.map((l) => {
            const state = sys.high.includes(l.id)
              ? "high"
              : sys.gives === l.id
                ? "gives"
                : "normal";
            return (
              <motion.div
                key={l.id}
                layout
                className={cn(
                  "flex flex-col items-center justify-center rounded-lg border px-1 py-1 text-center transition-colors",
                  state === "high"
                    ? "border-mint/60 bg-mint/10"
                    : state === "gives"
                      ? "border-rose/60 bg-rose/10"
                      : "border-dashed border-hairline",
                )}
              >
                <span
                  className={cn(
                    "font-mono text-lg font-bold leading-none",
                    state === "high"
                      ? "text-mint"
                      : state === "gives"
                        ? "text-rose"
                        : "text-muted-foreground",
                  )}
                >
                  {l.id}
                </span>
                <span className="mt-0.5 truncate text-[10px] text-foreground/80">{l.name}</span>
                <span
                  className={cn(
                    "font-mono text-[9px] uppercase tracking-wider",
                    state === "high"
                      ? "text-mint"
                      : state === "gives"
                        ? "text-rose"
                        : "text-muted-foreground",
                  )}
                >
                  {state === "high" ? "High" : state === "gives" ? "Gives up" : "Normal"}
                </span>
              </motion.div>
            );
          })}
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg border border-hairline bg-muted/10 p-1">
          <Triangle picks={sys.picks} />
          <p className="text-center font-mono text-[9px] leading-tight text-muted-foreground">
            Pick 2 of 3
          </p>
        </div>
      </div>

      <Status tone="ok">{sys.why}</Status>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Your turn                                                                  */
/* -------------------------------------------------------------------------- */

type Mark = "none" | "high" | "gives";

const SCENARIOS: {
  name: string;
  prompt: string;
  high: [Letter, Letter];
  gives: Letter;
  why: string;
}[] = [
    {
      name: "Banking app",
      prompt: "A banking app moves money between accounts.",
      high: ["C", "D"],
      gives: "L",
      why: "Money must be exact and safe, even if the app is a little slow.",
    },
    {
      name: "Video app",
      prompt: "A video app streams to millions of viewers.",
      high: ["A", "L"],
      gives: "C",
      why: "The video must play fast. View counts can lag.",
    },
    {
      name: "Stock trading",
      prompt: "A platform trades stocks in real time.",
      high: ["C", "L"],
      gives: "E",
      why: "Every millisecond and every cent matters. The cost is high.",
    },
    {
      name: "Photo app",
      prompt: "A photo app shows like counts to a large user base.",
      high: ["A", "S"],
      gives: "C",
      why: "The app must stay up and grow. Like counts can be approximate.",
    },
    {
      name: "Search engine",
      prompt: "A search engine answers queries from the whole web.",
      high: ["L", "A"],
      gives: "C",
      why: "Speed matters. The index can be a little old.",
    },
  ];

const emptyMarks = (): Record<Letter, Mark> => ({
  S: "none",
  C: "none",
  A: "none",
  L: "none",
  E: "none",
  D: "none",
});

function YourTurnDemo() {
  const [sc, setSc] = useState(0);
  const [marks, setMarks] = useState<Record<Letter, Mark>>(emptyMarks);
  const [checked, setChecked] = useState(false);
  const s = SCENARIOS[sc];

  const highs = LETTERS.filter((l) => marks[l.id] === "high").length;
  const gives = LETTERS.filter((l) => marks[l.id] === "gives").length;
  const ready = highs === 2 && gives === 1;

  const expected = (l: Letter): Mark =>
    s.high.includes(l) ? "high" : s.gives === l ? "gives" : "none";
  const correct = LETTERS.every((l) => marks[l.id] === expected(l.id));

  const cycle = (l: Letter) => {
    if (checked) return;
    setMarks((prev) => {
      const cur = prev[l];
      const order: Mark[] = ["none", "high", "gives"];
      const hCount = LETTERS.filter((x) => prev[x.id] === "high").length;
      const gCount = LETTERS.filter((x) => prev[x.id] === "gives").length;
      let next = order[(order.indexOf(cur) + 1) % 3];
      for (let k = 0; k < 3; k++) {
        const blocked =
          (next === "high" && cur !== "high" && hCount >= 2) ||
          (next === "gives" && cur !== "gives" && gCount >= 1);
        if (!blocked) break;
        next = order[(order.indexOf(next) + 1) % 3];
      }
      return { ...prev, [l]: next };
    });
  };

  const pick = (k: number) => {
    setSc(k);
    setMarks(emptyMarks());
    setChecked(false);
  };

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex flex-wrap gap-1.5">
        {SCENARIOS.map((x, k) => (
          <Seg key={x.name} on={sc === k} onClick={() => pick(k)}>
            {x.name}
          </Seg>
        ))}
      </div>

      <p className="rounded-lg border border-hairline bg-muted/10 px-2.5 py-1.5 text-sm font-semibold text-foreground">
        {s.prompt}
      </p>
      <p className="font-mono text-[11px] text-muted-foreground">
        Click a letter to cycle: normal, prioritize (max 2), give up (max 1).
      </p>

      <div className="grid min-h-0 flex-1 grid-cols-3 gap-1.5">
        {LETTERS.map((l) => {
          const m = marks[l.id];
          const exp = expected(l.id);
          const wrong = checked && m !== exp;
          return (
            <button
              key={l.id}
              type="button"
              onClick={() => cycle(l.id)}
              className={cn(
                "flex flex-col items-center justify-center rounded-lg border px-1 py-1 text-center transition-colors",
                checked
                  ? wrong
                    ? "border-rose/60 bg-rose/10"
                    : exp === "none"
                      ? "border-dashed border-hairline"
                      : "border-mint/60 bg-mint/10"
                  : m === "high"
                    ? "border-mint/60 bg-mint/10"
                    : m === "gives"
                      ? "border-rose/60 bg-rose/10"
                      : "border-dashed border-hairline hover:bg-muted/40",
              )}
            >
              <span
                className={cn(
                  "font-mono text-lg font-bold leading-none",
                  m === "high" ? "text-mint" : m === "gives" ? "text-rose" : "text-muted-foreground",
                )}
              >
                {l.id}
              </span>
              <span className="mt-0.5 truncate text-[10px] text-foreground/80">{l.name}</span>
              <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                {checked && wrong
                  ? `answer: ${exp === "high" ? "high" : exp === "gives" ? "give up" : "normal"}`
                  : m === "high"
                    ? "prioritize"
                    : m === "gives"
                      ? "give up"
                      : "normal"}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          {checked ? (
            <Status tone={correct ? "ok" : "bad"}>
              {correct ? "Correct. " : "Not quite. "}
              {s.why}
            </Status>
          ) : (
            <p className="rounded-lg border border-dashed border-hairline px-2.5 py-1.5 text-xs text-muted-foreground">
              Mark 2 to prioritize and 1 to give up.
            </p>
          )}
        </div>
        {checked ? (
          <button
            type="button"
            onClick={() => {
              setMarks(emptyMarks());
              setChecked(false);
            }}
            className="flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-hairline px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
          >
            <RotateCcw className="size-3.5" /> Try again
          </button>
        ) : (
          <button
            type="button"
            disabled={!ready}
            onClick={() => setChecked(true)}
            className="h-8 shrink-0 rounded-md bg-mint px-3 text-xs font-semibold text-primary-foreground transition-colors hover:bg-mint/90 disabled:opacity-40"
          >
            Check
          </button>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main component                                                             */
/* -------------------------------------------------------------------------- */

const PANEL_H = "lg:h-[19.5rem]";

function Demo({ id }: { id: TabId }) {
  switch (id) {
    case "S":
      return <ScalabilityDemo />;
    case "C":
      return <ConsistencyDemo />;
    case "A":
      return <AvailabilityDemo />;
    case "L":
      return <LatencyDemo />;
    case "E":
      return <EfficiencyDemo />;
    case "D":
      return <DurabilityDemo />;
    case "T":
      return <TradeoffDemo />;
    case "Y":
      return <YourTurnDemo />;
  }
}

export function ScaledFramework() {
  const [tab, setTab] = useState<TabId>("S");
  const [seen, setSeen] = useState<Set<TabId>>(new Set<TabId>(["S"]));
  const idx = TABS.findIndex((t) => t.id === tab);
  const cur = TABS[idx];
  const Icon = cur.icon;
  const nextTab = TABS[(idx + 1) % TABS.length];

  const open = (id: TabId) => {
    setTab(id);
    setSeen((s) => (s.has(id) ? s : new Set(s).add(id)));
  };
  const go = (k: number) => open(TABS[(k + TABS.length) % TABS.length].id);

  const onKeyDown = (e: ReactKeyboardEvent<HTMLElement>) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(idx + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(idx - 1);
    }
  };

  return (
    <section
      tabIndex={0}
      onKeyDown={onKeyDown}
      className="my-6 overflow-hidden rounded-2xl border border-hairline bg-card/50 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-mint/50"
    >
      <div className="border-b border-hairline bg-muted/20 px-3 py-2 sm:px-4">
        <div className="flex items-center gap-2">
          <Zap className="size-4 text-mint" />
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Try the SCALED superpowers
          </p>
          <span className="ml-auto font-mono text-[11px] text-muted-foreground">
            {seen.size} of {TABS.length} explored
          </span>
        </div>
      </div>

      <div className="space-y-2.5 p-3 sm:p-4">
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="SCALED superpowers">
          {TABS.map((t) => {
            const on = t.id === tab;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => open(t.id)}
                className={cn(
                  "relative flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                  on ? SEG_ON : SEG_OFF,
                )}
              >
                <span className="font-mono text-sm font-bold">{t.short}</span>
                <span className="hidden sm:inline">{t.name}</span>
                {!on && seen.has(t.id) && (
                  <span className="absolute -right-0.5 -top-0.5 size-1.5 rounded-full bg-mint" />
                )}
              </button>
            );
          })}
        </div>

        <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr]">
          <div
            className={cn(
              "overflow-y-auto rounded-xl border border-hairline bg-background p-3",
              PANEL_H,
            )}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="h-full"
              >
                <Demo id={tab} />
              </motion.div>
            </AnimatePresence>
          </div>

          <div
            className={cn(
              "flex flex-col overflow-y-auto rounded-xl border border-hairline bg-background p-3",
              PANEL_H,
            )}
          >
            <div className="mb-2 flex items-center gap-2.5">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-mint/10 text-mint">
                <Icon className="size-4" />
              </span>
              <div className="min-w-0">
                <h4 className="text-base font-semibold leading-tight text-foreground">
                  {cur.name}
                </h4>
                <p className="text-xs font-medium text-mint">{cur.question}</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">{cur.definition}</p>
            <p className="mt-2 font-mono text-[11px] text-muted-foreground">
              <span className="uppercase tracking-wider">Metric:</span>{" "}
              <span className="text-foreground">{cur.metric}</span>
            </p>
            <div className="mt-2.5 rounded-lg border border-violet/30 bg-violet/10 px-2.5 py-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-violet">
                Interview question
              </p>
              <p className="mt-0.5 text-[13px] leading-relaxed text-foreground/90">
                {cur.interview}
              </p>
            </div>
            <button
              type="button"
              onClick={() => open(nextTab.id)}
              className="mt-auto flex items-center gap-1.5 self-end pt-2 text-xs font-medium text-mint transition-colors hover:text-mint/80"
            >
              Next: {nextTab.name} <ArrowRight className="size-3.5" />
            </button>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground">
          Click a tab. Change the controls. Click the box, then use ← → to change the tab.
        </p>
      </div>
    </section>
  );
}