import { useEffect, useId, useMemo, useState } from "react";
import type { KeyboardEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* A whiteboard walkthrough of the URL shortener: requirements first, then the
   basic create and redirect flow. It uses the same frame and controls as the
   pattern lessons (window chrome, status card, transport bar) without a code
   panel. The stage has a fixed height, so the page never jumps while it plays. */

const FUNCTIONAL = ["Create short URLs", "Redirect to original URLs"];
const NON_FUNCTIONAL = [
  "Redirect latency p95 ≤ 200 ms",
  "Availability ≥ 99.9%",
  "10,000 redirect requests/s",
];
const OUT_OF_SCOPE = ["User accounts", "Click analytics"];

/* Node geometry shared by every flow step */
const USER = { x: 24, y: 76, w: 140, h: 150 };
const SERVICE = { x: 310, y: 76, w: 140, h: 150 };
const DB = { x: 596, y: 76, w: 140, h: 150 };
const TOP = 134;
const BOTTOM = 186;
const UX = USER.x + USER.w / 2;
const SX = SERVICE.x + SERVICE.w / 2;
const DX = DB.x + DB.w / 2;
const MID1 = (USER.x + USER.w + SERVICE.x) / 2;
const MID2 = (SERVICE.x + SERVICE.w + DB.x) / 2;
const ABOVE = USER.y - 16;
const BELOW = USER.y + USER.h + 18;

const ARROWS: { from: number; to: number; y: number }[] = [
  { from: USER.x + USER.w, to: SERVICE.x, y: TOP },
  { from: SERVICE.x + SERVICE.w, to: DB.x, y: TOP },
  { from: DB.x, to: SERVICE.x + SERVICE.w, y: BOTTOM },
  { from: SERVICE.x, to: USER.x + USER.w, y: BOTTOM },
];

type Stat = { label: string; value: string; tone?: "mint" | "violet" | "amber" };

type Step = {
  stage: "board" | "create" | "redirect";
  group: string;
  phase: string;
  narration: string;
  stats: Stat[];
  /* board */
  fr?: boolean;
  nfr?: boolean;
  oos?: boolean;
  check?: "fr" | "both";
  /* flow */
  at?: [number, number];
  label?: string;
  arrows?: number[];
  code?: boolean;
  row?: boolean;
  lookup?: boolean;
  browser?: boolean;
  userSub?: string;
};

const GROUPS = ["Requirements", "Create", "Redirect", "Check"] as const;

const CODE_STATS: Stat[] = [
  { label: "code", value: "a7Bx9", tone: "mint" },
  { label: "rows", value: "1", tone: "violet" },
];
const HIT_STATS: Stat[] = [
  { label: "code", value: "a7Bx9", tone: "mint" },
  { label: "hit", value: "yes", tone: "violet" },
];
const EMPTY_STATS: Stat[] = [
  { label: "code", value: "·" },
  { label: "rows", value: "0" },
];

const STEPS: Step[] = [
  {
    stage: "board",
    group: "Requirements",
    phase: "Ask before you draw",
    narration:
      'Interviewer: "Design a URL shortening system like Bitly." You: "Before I draw anything, I will write down what it must do and how well."',
    stats: [
      { label: "FR", value: "0" },
      { label: "NFR", value: "0" },
    ],
  },
  {
    stage: "board",
    group: "Requirements",
    phase: "Functional requirements",
    narration:
      "What must users be able to do? They create short URLs and open them to reach the original address.",
    fr: true,
    stats: [
      { label: "FR", value: "2", tone: "mint" },
      { label: "NFR", value: "0" },
    ],
  },
  {
    stage: "board",
    group: "Requirements",
    phase: "Non-functional requirements",
    narration:
      "How well must it work? Redirects are fast, the service stays up, and it copes with heavy traffic.",
    fr: true,
    nfr: true,
    stats: [
      { label: "FR", value: "2", tone: "mint" },
      { label: "NFR", value: "3", tone: "violet" },
    ],
  },
  {
    stage: "board",
    group: "Requirements",
    phase: "Out of scope",
    narration:
      "To stay focused, user accounts and click analytics are left out of this design for now.",
    fr: true,
    nfr: true,
    oos: true,
    stats: [
      { label: "FR", value: "2", tone: "mint" },
      { label: "NFR", value: "3", tone: "violet" },
      { label: "Out", value: "2" },
    ],
  },
  /* Create */
  {
    stage: "create",
    group: "Create",
    phase: "Create a short URL",
    narration: 'Interviewer: "How does a short URL get made?" The user starts with a long URL.',
    at: [UX, ABOVE],
    label: "long URL",
    arrows: [],
    userSub: "long URL",
    stats: EMPTY_STATS,
  },
  {
    stage: "create",
    group: "Create",
    phase: "Send the long URL",
    narration: "The user sends the long URL to the service.",
    at: [MID1, TOP],
    label: "POST long URL",
    arrows: [0],
    userSub: "long URL",
    stats: EMPTY_STATS,
  },
  {
    stage: "create",
    group: "Create",
    phase: "Make a short code",
    narration: "The service creates a short code for this URL.",
    at: [SX, ABOVE],
    label: "a7Bx9",
    arrows: [],
    code: true,
    userSub: "long URL",
    stats: [
      { label: "code", value: "a7Bx9", tone: "mint" },
      { label: "rows", value: "0" },
    ],
  },
  {
    stage: "create",
    group: "Create",
    phase: "Send the mapping on",
    narration: "The code and the original URL travel to the database.",
    at: [MID2, TOP],
    label: "a7Bx9 → URL",
    arrows: [1],
    code: true,
    userSub: "long URL",
    stats: [
      { label: "code", value: "a7Bx9", tone: "mint" },
      { label: "rows", value: "0" },
    ],
  },
  {
    stage: "create",
    group: "Create",
    phase: "Store the mapping",
    narration: "The database stores a7Bx9 → Original URL.",
    at: [DX, ABOVE],
    label: "stored",
    arrows: [],
    code: true,
    row: true,
    userSub: "long URL",
    stats: CODE_STATS,
  },
  {
    stage: "create",
    group: "Create",
    phase: "Return the short URL",
    narration: "The service answers with the short URL, and the user can share it.",
    at: [MID1, BOTTOM],
    label: "short.ly/a7Bx9",
    arrows: [2, 3],
    code: true,
    row: true,
    userSub: "short.ly/a7Bx9",
    stats: CODE_STATS,
  },
  /* Redirect */
  {
    stage: "redirect",
    group: "Redirect",
    phase: "Open a short URL",
    narration: 'Interviewer: "And when someone opens the short URL?" Another user opens it.',
    at: [UX, ABOVE],
    label: "open short URL",
    arrows: [],
    row: true,
    userSub: "short.ly/a7Bx9",
    stats: CODE_STATS,
  },
  {
    stage: "redirect",
    group: "Redirect",
    phase: "Send the request",
    narration: "The request GET /a7Bx9 reaches the service.",
    at: [MID1, TOP],
    label: "GET /a7Bx9",
    arrows: [0],
    row: true,
    userSub: "short.ly/a7Bx9",
    stats: CODE_STATS,
  },
  {
    stage: "redirect",
    group: "Redirect",
    phase: "Look up the code",
    narration: "The service asks the database which address belongs to a7Bx9.",
    at: [MID2, TOP],
    label: "look up a7Bx9",
    arrows: [1],
    row: true,
    userSub: "short.ly/a7Bx9",
    stats: CODE_STATS,
  },
  {
    stage: "redirect",
    group: "Redirect",
    phase: "Find the mapping",
    narration: "The database finds the stored mapping and returns the original URL.",
    at: [DX, ABOVE],
    label: "found",
    arrows: [],
    row: true,
    lookup: true,
    userSub: "short.ly/a7Bx9",
    stats: HIT_STATS,
  },
  {
    stage: "redirect",
    group: "Redirect",
    phase: "Send the redirect",
    narration: "The service answers with a redirect that points to the original address.",
    at: [MID1, BOTTOM],
    label: "redirect",
    arrows: [2, 3],
    row: true,
    lookup: true,
    userSub: "short.ly/a7Bx9",
    stats: HIT_STATS,
  },
  {
    stage: "redirect",
    group: "Redirect",
    phase: "Reach the original URL",
    narration: "The user lands on the original address.",
    at: [UX, BELOW],
    label: "original URL",
    arrows: [],
    row: true,
    lookup: true,
    browser: true,
    userSub: "short.ly/a7Bx9",
    stats: HIT_STATS,
  },
  /* Check */
  {
    stage: "board",
    group: "Check",
    phase: "Check the functions",
    narration:
      'Interviewer: "Does this design meet the requirements?" Both functions are covered by the flow.',
    fr: true,
    nfr: true,
    oos: true,
    check: "fr",
    stats: [
      { label: "FR covered", value: "2/2", tone: "mint" },
      { label: "NFR proven", value: "0/3", tone: "amber" },
    ],
  },
  {
    stage: "board",
    group: "Check",
    phase: "Check the qualities",
    narration:
      "This design implements a function. It does not yet prove that the system can meet its performance or availability targets.",
    fr: true,
    nfr: true,
    oos: true,
    check: "both",
    stats: [
      { label: "FR covered", value: "2/2", tone: "mint" },
      { label: "NFR proven", value: "0/3", tone: "amber" },
    ],
  },
];

const TONE: Record<NonNullable<Stat["tone"]>, string> = {
  mint: "text-mint",
  violet: "text-violet",
  amber: "text-amber-600 dark:text-amber-400",
};

const firstStepOf = (group: string) => STEPS.findIndex((s) => s.group === group);

export function UrlShortenerWhiteboard() {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<0.5 | 1 | 2>(1);
  const reduced = !!useReducedMotion();
  const uid = useId().replace(/:/g, "");

  const step = STEPS[index];
  const last = index >= STEPS.length - 1;
  const reservedNarrations = useMemo(
    () =>
      [...new Set(STEPS.map((s) => s.narration))].sort((a, b) => b.length - a.length).slice(0, 4),
    [],
  );

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(
      () =>
        setIndex((current) => {
          if (current >= STEPS.length - 1) {
            setPlaying(false);
            return current;
          }
          return current + 1;
        }),
      Math.round(2000 / speed),
    );
    return () => clearInterval(timer);
  }, [playing, speed]);

  useEffect(() => {
    const pause = () => setPlaying(false);
    window.addEventListener("quiz-started", pause);
    return () => window.removeEventListener("quiz-started", pause);
  }, []);

  const goTo = (i: number) => {
    setPlaying(false);
    setIndex(Math.max(0, Math.min(i, STEPS.length - 1)));
  };
  const stepBy = (d: number) => goTo(index + d);
  const togglePlay = () => {
    if (last) {
      setIndex(0);
      setPlaying(true);
    } else setPlaying((p) => !p);
  };
  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      stepBy(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      stepBy(-1);
    } else if (e.key === " ") {
      e.preventDefault();
      togglePlay();
    }
  };

  return (
    <section
      tabIndex={0}
      onKeyDown={onKeyDown}
      aria-label="URL shortener requirements and basic flow, drawn on a whiteboard"
      className="@container relative overflow-clip rounded-2xl border border-hairline bg-slate-50 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-mint/50 dark:bg-surface"
    >
      <div className="pointer-events-none absolute -left-20 -top-20 size-56 rounded-full bg-mint/10 blur-[70px]" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 size-56 rounded-full bg-blue-500/10 blur-[70px]" />

      {/* Window chrome */}
      <div className="relative space-y-3 border-b border-hairline bg-surface-2/40 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2.5 whitespace-nowrap">
          <div className="flex shrink-0 items-center gap-1.5">
            <div className="size-2.5 rounded-full bg-rose-500/80" />
            <div className="size-2.5 rounded-full bg-amber-500/80" />
            <div className="size-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <div className="h-3.5 w-px shrink-0 bg-hairline" />
          <Sparkles className="size-3.5 shrink-0 text-mint" />
          <span className="font-mono text-[13px] font-semibold text-foreground">
            url_shortener.board
          </span>
          <span className="hidden min-w-0 truncate text-[13px] text-muted-foreground @min-[30rem]:inline">
            Requirements and basic flow
          </span>
        </div>
        <div className="-mx-1 flex min-w-0 items-center gap-2 overflow-x-auto px-1 py-0.5 [scrollbar-width:none]">
          {GROUPS.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => goTo(firstStepOf(g))}
              className={cn(
                "h-8 shrink-0 whitespace-nowrap rounded-full border px-3 text-xs font-medium transition-colors",
                step.group === g
                  ? "border-mint bg-mint/10 text-mint"
                  : "border-hairline bg-background text-muted-foreground hover:text-foreground",
              )}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div className="relative flex min-w-0 flex-col gap-4 p-4 sm:p-6">
        {/* Stage */}
        <div className="flex h-[17.5rem] items-center justify-center rounded-xl border border-hairline bg-background/60 bg-[radial-gradient(circle,_var(--hairline)_1px,_transparent_1px)] [background-size:22px_22px] px-2">
          <svg
            viewBox="0 0 760 320"
            role="img"
            aria-label={step.narration}
            className="h-full w-full max-w-[880px]"
          >
            <defs>
              <filter id={`${uid}-rough`} x="-5%" y="-5%" width="110%" height="110%">
                <feTurbulence type="fractalNoise" baseFrequency="0.025" numOctaves="2" seed="4" />
                <feDisplacementMap in="SourceGraphic" scale="2.6" />
              </filter>
              <marker
                id={`${uid}-arrow`}
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M0 0 L10 5 L0 10 z" className="fill-muted-foreground" />
              </marker>
              <marker
                id={`${uid}-arrow-on`}
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M0 0 L10 5 L0 10 z" className="fill-mint" />
              </marker>
            </defs>

            <AnimatePresence mode="wait" initial={false}>
              {step.stage === "board" ? (
                <motion.g
                  key="board"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <Board uid={uid} step={step} reduced={reduced} />
                </motion.g>
              ) : (
                <motion.g
                  key={step.stage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <Flow uid={uid} stage={step.stage} index={index} reduced={reduced} />
                </motion.g>
              )}
            </AnimatePresence>
          </svg>
        </div>

        {/* Status card */}
        <div
          className={cn(
            "rounded-xl border px-4 py-3 transition-colors duration-300",
            last ? "border-mint/40 bg-mint/5" : "border-hairline bg-background/70",
          )}
        >
          <div className="flex items-center gap-2.5">
            {last ? (
              <CheckCircle2 className="size-5 shrink-0 text-mint" />
            ) : (
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-hairline font-mono text-[10px] font-bold text-muted-foreground">
                {index + 1}
              </span>
            )}
            <span className="min-w-0 truncate text-[13px] font-semibold text-mint">
              {step.phase}
            </span>
          </div>
          <div className="mt-1.5 grid min-h-[3.2rem] text-sm leading-relaxed">
            {reservedNarrations.map((text) => (
              <p key={text} aria-hidden className="invisible [grid-area:1/1]">
                {text}
              </p>
            ))}
            <p
              key={index}
              className="text-foreground/90 duration-300 animate-in fade-in [grid-area:1/1]"
            >
              {step.narration}
            </p>
          </div>
          <div className="mt-3 flex gap-1.5 overflow-x-auto [scrollbar-width:none]">
            {step.stats.map((stat) => (
              <span
                key={stat.label}
                className="flex shrink-0 items-baseline gap-1.5 rounded-md border border-hairline bg-surface-2/60 px-2 py-1 font-mono"
              >
                <span className="text-[11px] text-muted-foreground">{stat.label}</span>
                <strong
                  className={cn("text-[13px]", stat.tone ? TONE[stat.tone] : "text-foreground")}
                >
                  {stat.value}
                </strong>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Transport controls */}
      <div className="relative flex items-center gap-2 border-t border-hairline bg-surface-2/30 px-4 py-3 sm:px-5">
        <div className="absolute inset-x-0 top-0 h-0.5 bg-hairline/60">
          <div
            className="h-full bg-mint transition-[width] duration-300"
            style={{ width: `${((index + 1) / STEPS.length) * 100}%` }}
          />
        </div>
        <Button
          type="button"
          size="sm"
          onClick={togglePlay}
          className="h-9 min-w-[6.5rem] @min-[30rem]:min-w-28"
        >
          {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
          {playing ? "Pause" : last ? "Replay" : "Autoplay"}
        </Button>
        <Button
          type="button"
          size="icon"
          variant="outline"
          className="size-9"
          onClick={() => stepBy(-1)}
          disabled={index === 0}
          aria-label="Previous step"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="outline"
          className="size-9"
          onClick={() => stepBy(1)}
          disabled={last}
          aria-label="Next step"
        >
          <ChevronRight className="size-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="outline"
          className="size-9"
          onClick={() => goTo(0)}
          aria-label="Reset to the first step"
        >
          <RotateCcw className="size-4" />
        </Button>
        <span className="ml-1 whitespace-nowrap font-mono text-xs text-muted-foreground">
          {index + 1} / {STEPS.length}
        </span>
        <div className="ml-auto hidden items-center gap-3 @min-[34rem]:flex">
          <span className="hidden whitespace-nowrap font-mono text-[11px] text-muted-foreground @min-[60rem]:inline">
            ← → step · space play
          </span>
          <div className="flex items-center rounded-lg border border-hairline bg-background p-0.5 font-mono text-[11px]">
            {([0.5, 1, 2] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setSpeed(option)}
                className={cn(
                  "rounded-md px-2 py-1 font-semibold transition-colors",
                  speed === option
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
                aria-label={`Playback speed ${option}x`}
              >
                {option}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------- Board --------------------------------- */

function Board({ uid, step, reduced }: { uid: string; step: Step; reduced: boolean }) {
  const cols = [
    {
      x: 12,
      w: 236,
      title: "Functional",
      sub: "What does it do?",
      tone: "mint",
      items: FUNCTIONAL,
      show: !!step.fr,
      mark: step.check ? "ok" : null,
    },
    {
      x: 262,
      w: 270,
      title: "Non-functional",
      sub: "How well must it operate?",
      tone: "violet",
      items: NON_FUNCTIONAL,
      show: !!step.nfr,
      mark: step.check === "both" ? "warn" : null,
    },
    {
      x: 546,
      w: 202,
      title: "Out of scope",
      sub: "Not for now",
      tone: "muted",
      items: OUT_OF_SCOPE,
      show: !!step.oos,
      mark: null,
    },
  ] as const;

  return (
    <g>
      {cols.map((col, ci) => {
        const stroke =
          col.tone === "mint"
            ? "stroke-mint"
            : col.tone === "violet"
              ? "stroke-violet"
              : "stroke-muted-foreground";
        const text =
          col.tone === "mint"
            ? "fill-mint"
            : col.tone === "violet"
              ? "fill-violet"
              : "fill-muted-foreground";
        return (
          <g key={col.title}>
            <motion.rect
              x={col.x}
              y={14}
              width={col.w}
              height={292}
              rx={14}
              fill="none"
              strokeWidth={2.2}
              pathLength={1}
              strokeDasharray={col.tone === "muted" ? "0.04 0.025" : undefined}
              className={stroke}
              filter={`url(#${uid}-rough)`}
              initial={{ pathLength: reduced ? 1 : 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                delay: reduced ? 0 : ci * 0.2,
                duration: reduced ? 0 : 0.8,
                ease: "easeInOut",
              }}
            />
            <text x={col.x + 18} y={50} className={cn("text-[18px] font-semibold", text)}>
              {col.title}
            </text>
            <text x={col.x + 18} y={71} className="fill-muted-foreground text-[12px]">
              {col.sub}
            </text>
            <line
              x1={col.x + 18}
              x2={col.x + col.w - 18}
              y1={84}
              y2={84}
              strokeWidth={1.5}
              strokeLinecap="round"
              className={cn(stroke, "opacity-50")}
            />
            {col.show
              ? col.items.map((item, ii) => {
                  const y = 122 + ii * 50;
                  return (
                    <motion.g
                      key={item}
                      initial={{ opacity: 0, x: reduced ? 0 : -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: reduced ? 0 : ii * 0.25, duration: 0.35 }}
                    >
                      {col.mark ? (
                        <Verdict x={col.x + 26} y={y} ok={col.mark === "ok"} reduced={reduced} />
                      ) : (
                        <circle
                          cx={col.x + 26}
                          cy={y - 5}
                          r={3.5}
                          className={col.tone === "muted" ? "fill-muted-foreground" : text}
                        />
                      )}
                      <text
                        x={col.x + 46}
                        y={y}
                        className={cn(
                          "text-[14px]",
                          col.tone === "muted" ? "fill-muted-foreground" : "fill-foreground",
                        )}
                      >
                        {item}
                      </text>
                    </motion.g>
                  );
                })
              : null}
            {col.mark === "ok" ? (
              <text x={col.x + 18} y={286} className="fill-mint text-[12.5px]">
                Covered by the flow
              </text>
            ) : null}
            {col.mark === "warn" ? (
              <text x={col.x + 18} y={286} className="fill-amber text-[12.5px]">
                Not proven by this design yet
              </text>
            ) : null}
          </g>
        );
      })}
    </g>
  );
}

function Verdict({ x, y, ok, reduced }: { x: number; y: number; ok: boolean; reduced: boolean }) {
  return (
    <motion.g
      initial={{ scale: reduced ? 1 : 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: reduced ? 0 : 0.15, type: "spring", stiffness: 380, damping: 18 }}
      style={{ transformOrigin: `${x}px ${y - 5}px`, transformBox: "view-box" }}
    >
      <circle cx={x} cy={y - 5} r={11} className={ok ? "fill-mint/20" : "fill-amber/20"} />
      {ok ? (
        <path
          d={`M${x - 5} ${y - 5} l4 4 l7 -8`}
          fill="none"
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="stroke-mint"
        />
      ) : (
        <text x={x} y={y - 0.5} textAnchor="middle" className="fill-amber text-[14px] font-bold">
          ?
        </text>
      )}
    </motion.g>
  );
}

/* ---------------------------------- Flow ---------------------------------- */

function Flow({
  uid,
  stage,
  index,
  reduced,
}: {
  uid: string;
  stage: "create" | "redirect";
  index: number;
  reduced: boolean;
}) {
  const step = STEPS[index];
  const b = { at: step.at ?? [UX, ABOVE], label: step.label ?? "", arrows: step.arrows ?? [] };
  const chipW = Math.max(70, b.label.length * 7.4 + 22);

  return (
    <g>
      <text
        x={380}
        y={34}
        textAnchor="middle"
        className="fill-foreground text-[16px] font-semibold"
      >
        {stage === "create" ? "Create a short URL" : "Open a short URL"}
      </text>

      <NodeBox {...USER} uid={uid} tone="muted" title="User" sub={step.userSub ?? ""} icon="user" />
      <NodeBox
        {...SERVICE}
        uid={uid}
        tone="mint"
        title="URL Shortener"
        sub={step.code ? "code: a7Bx9" : "Service"}
        icon="server"
        highlight={!!step.code}
      />
      <NodeBox
        {...DB}
        uid={uid}
        tone="violet"
        title="Database"
        sub=""
        icon="db"
        highlight={!!step.lookup}
      />

      <motion.g
        animate={{ opacity: step.row ? 1 : 0.25 }}
        transition={{ duration: reduced ? 0 : 0.5 }}
      >
        <rect
          x={DB.x + 10}
          y={DB.y + DB.h - 30}
          width={DB.w - 20}
          height={22}
          rx={5}
          className={cn(
            step.lookup ? "fill-violet/25 stroke-violet" : "fill-violet/10 stroke-violet/40",
          )}
          strokeWidth={1.2}
        />
        <text
          x={DB.x + DB.w / 2}
          y={DB.y + DB.h - 15}
          textAnchor="middle"
          className="fill-foreground font-mono text-[10.5px]"
        >
          a7Bx9 → URL
        </text>
      </motion.g>

      {ARROWS.map((a, i) => {
        const on = b.arrows.includes(i);
        return (
          <path
            key={i}
            d={`M${a.from} ${a.y} L${a.to} ${a.y}`}
            strokeWidth={on ? 2.6 : 2}
            fill="none"
            strokeLinecap="round"
            className={on ? "stroke-mint" : "stroke-muted-foreground/60"}
            markerEnd={`url(#${uid}-arrow${on ? "-on" : ""})`}
          />
        );
      })}

      <motion.g
        initial={false}
        animate={{ x: b.at[0], y: b.at[1] }}
        transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 18 }}
      >
        <rect x={-chipW / 2} y={-13} width={chipW} height={26} rx={13} className="fill-mint" />
        <text
          x={0}
          y={4.5}
          textAnchor="middle"
          className="fill-background font-mono text-[11.5px] font-semibold"
        >
          {b.label}
        </text>
      </motion.g>

      <AnimatePresence>
        {step.browser ? (
          <motion.g
            initial={{ opacity: 0, y: reduced ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <rect
              x={24}
              y={256}
              width={300}
              height={48}
              rx={8}
              className="fill-background stroke-muted-foreground"
              strokeWidth={1.6}
              filter={`url(#${uid}-rough)`}
            />
            <circle cx={40} cy={269} r={3.2} className="fill-rose" />
            <circle cx={52} cy={269} r={3.2} className="fill-amber" />
            <circle cx={64} cy={269} r={3.2} className="fill-mint" />
            <text x={36} y={293} className="fill-foreground font-mono text-[11.5px]">
              example.com/products/electronics/laptops
            </text>
          </motion.g>
        ) : null}
      </AnimatePresence>
    </g>
  );
}

function NodeBox({
  x,
  y,
  w,
  h,
  uid,
  tone,
  title,
  sub,
  icon,
  highlight,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  uid: string;
  tone: "mint" | "violet" | "muted";
  title: string;
  sub: string;
  icon: "user" | "server" | "db";
  highlight?: boolean;
}) {
  const stroke =
    tone === "mint"
      ? "stroke-mint"
      : tone === "violet"
        ? "stroke-violet"
        : "stroke-muted-foreground";
  const fill =
    tone === "mint" ? "fill-mint" : tone === "violet" ? "fill-violet" : "fill-foreground";
  const strokeOnly =
    tone === "mint" ? "stroke-mint" : tone === "violet" ? "stroke-violet" : "stroke-foreground";
  const cx = x + w / 2;
  return (
    <g>
      <motion.rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={14}
        strokeWidth={2.2}
        className={cn(
          stroke,
          highlight ? (tone === "violet" ? "fill-violet/10" : "fill-mint/10") : "fill-background",
        )}
        filter={`url(#${uid}-rough)`}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
      />
      <g
        className={strokeOnly}
        fill="none"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {icon === "user" ? (
          <>
            <circle cx={cx} cy={y + 30} r={9} />
            <path d={`M${cx - 18} ${y + 62} Q${cx} ${y + 40} ${cx + 18} ${y + 62}`} />
          </>
        ) : null}
        {icon === "server" ? (
          <>
            <rect x={cx - 20} y={y + 16} width={40} height={16} rx={4} />
            <rect x={cx - 20} y={y + 36} width={40} height={16} rx={4} />
            <circle cx={cx - 11} cy={y + 24} r={1.6} className={fill} />
            <circle cx={cx - 11} cy={y + 44} r={1.6} className={fill} />
          </>
        ) : null}
        {icon === "db" ? (
          <>
            <ellipse cx={cx} cy={y + 20} rx={20} ry={7} />
            <path
              d={`M${cx - 20} ${y + 20} V${y + 46} C${cx - 20} ${y + 56} ${cx + 20} ${y + 56} ${cx + 20} ${y + 46} V${y + 20}`}
            />
            <path
              d={`M${cx - 20} ${y + 33} C${cx - 20} ${y + 43} ${cx + 20} ${y + 43} ${cx + 20} ${y + 33}`}
            />
          </>
        ) : null}
      </g>
      <text x={cx} y={y + 88} textAnchor="middle" className={cn("text-[15px] font-semibold", fill)}>
        {title}
      </text>
      <text x={cx} y={y + 106} textAnchor="middle" className="fill-muted-foreground text-[11.5px]">
        {sub}
      </text>
    </g>
  );
}
