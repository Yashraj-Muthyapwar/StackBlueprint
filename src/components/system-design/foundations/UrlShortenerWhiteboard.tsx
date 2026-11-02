import { useId } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { LessonWalkthrough } from "@/components/system-design/LessonWalkthrough";
import { NodeBox, WhiteboardDefs } from "@/components/system-design/whiteboard";
import { cn } from "@/lib/utils";

/* A whiteboard walkthrough of the URL shortener: requirements first, then the basic create and
   redirect flow. The frame and controls come from the shared LessonWalkthrough; this file owns
   the steps and what is drawn inside the stage. */

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

export function UrlShortenerWhiteboard() {
  const reduced = !!useReducedMotion();
  const uid = useId().replace(/:/g, "");

  return (
    <LessonWalkthrough
      ariaLabel="URL shortener requirements and basic flow, drawn on a whiteboard"
      fileName="url_shortener.board"
      label="Requirements and basic flow"
      groups={GROUPS}
      steps={STEPS}
      renderStage={(step, index) => (
        <svg
          viewBox="0 0 760 320"
          role="img"
          aria-label={step.narration}
          className="h-full w-full max-w-[880px]"
        >
          <WhiteboardDefs uid={uid} />

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
      )}
    />
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
