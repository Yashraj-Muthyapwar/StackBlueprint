import { useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { LucideIcon } from "lucide-react";
import {
  Boxes,
  Car,
  Check,
  RotateCcw,
  Route,
  Ruler,
  Shuffle,
  X,
  Zap,
} from "lucide-react";

import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/* Data                                                                       */
/* -------------------------------------------------------------------------- */

type TabId = "taxi" | "sort" | "steps" | "nfr" | "examples";

const TABS: {
  id: TabId;
  label: string;
  icon: LucideIcon;
  title: string;
  question: string;
  definition: string;
  remember: string;
}[] = [
    {
      id: "taxi",
      label: "Taxi test",
      icon: Car,
      title: "The two kinds",
      question: "Is a feature list enough?",
      definition:
        "Functional requirements say WHAT the system does. Non-functional requirements say HOW WELL it does it. A good system needs both.",
      remember:
        "A taxi that reaches the airport late and at a high fare is a bad ride. A system can fail in the same way.",
    },
    {
      id: "sort",
      label: "Sort it",
      icon: Shuffle,
      title: "Feature or quality?",
      question: "Does it say WHAT or HOW WELL?",
      definition:
        "A functional requirement is a feature. A non-functional requirement is a quality standard. Most qualities match one SCALED letter.",
      remember: "Security has no letter in SCALED. Ask about it as well.",
    },
    {
      id: "steps",
      label: "3 steps",
      icon: Route,
      title: "The interview framework",
      question: "How do you start a design interview?",
      definition:
        "Set the scope of the features. Measure the qualities with numbers. Choose a winner when two qualities conflict.",
      remember:
        "Start with requirements. A clear scope saves time later.",
    },
    {
      id: "nfr",
      label: "NFR types",
      icon: Ruler,
      title: "Common NFRs",
      question: "Which qualities can you ask about?",
      definition:
        "There are five groups: speed, reliability, growth, security, and operations. Each group has metrics that you can measure.",
      remember: "Ask for numbers. For example: p95 below 300 ms, or 99.9% uptime.",
    },
    {
      id: "examples",
      label: "Real systems",
      icon: Boxes,
      title: "Requirements in practice",
      question: "What do real requirements look like?",
      definition:
        "Compare the features and the quality targets of real products. Then match each quality to SCALED.",
      remember: "The match shows which qualities a product must protect.",
    },
  ];

type Letter = "S" | "C" | "A" | "L" | "E" | "D";
const LETTER_NAME: Record<Letter, string> = {
  S: "Scalability",
  C: "Consistency",
  A: "Availability",
  L: "Latency",
  E: "Efficiency",
  D: "Durability",
};

/* -------------------------------------------------------------------------- */
/* Shared parts                                                               */
/* -------------------------------------------------------------------------- */

const SEG_BASE = "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors";
const SEG_ON = "border-mint/60 bg-mint/15 text-mint";
const SEG_OFF = "border-hairline text-muted-foreground hover:bg-muted/50 hover:text-foreground";

function Seg({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={cn(SEG_BASE, on ? SEG_ON : SEG_OFF)}
    >
      {children}
    </button>
  );
}

function Status({
  tone,
  children,
}: {
  tone: "ok" | "warn" | "bad" | "info";
  children: ReactNode;
}) {
  return (
    <p
      className={cn(
        "rounded-lg border px-2.5 py-1.5 text-xs font-medium",
        tone === "ok"
          ? "border-mint/40 bg-mint/10 text-mint"
          : tone === "warn"
            ? "border-amber/40 bg-amber/10 text-amber"
            : tone === "bad"
              ? "border-rose/40 bg-rose/10 text-rose"
              : "border-violet/30 bg-violet/10 text-foreground/90",
      )}
    >
      {children}
    </p>
  );
}

function LetterBadge({ letter }: { letter: Letter | null }) {
  return letter ? (
    <span
      title={LETTER_NAME[letter]}
      className="shrink-0 rounded border border-violet/40 bg-violet/10 px-1.5 py-px font-mono text-[10px] font-bold text-violet"
    >
      {letter} {LETTER_NAME[letter]}
    </span>
  ) : (
    <span className="shrink-0 rounded border border-dashed border-hairline px-1.5 py-px font-mono text-[10px] text-muted-foreground">
      no SCALED letter
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Taxi test                                                                  */
/* -------------------------------------------------------------------------- */

const TAXI_FR = [
  { t: "Collect at home", d: "The taxi picks up the passenger" },
  { t: "Drive to the airport", d: "The route ends at the airport" },
  { t: "Carry 2 people, 3 bags", d: "The car is large enough" },
  { t: "Take a card payment", d: "The passenger pays by card" },
];
const TAXI_NFR = [
  { t: "Arrive in under 40 min", d: "Time limit" },
  { t: "Fare below $45", d: "Budget limit" },
  { t: "Car stays clean", d: "Comfort" },
  { t: "Obey the speed limit", d: "Safety" },
];

function TaxiDemo() {
  const [met, setMet] = useState<boolean[]>(Array(8).fill(true));
  const toggle = (k: number) => setMet((m) => m.map((v, i) => (i === k ? !v : v)));
  const fr = met.slice(0, 4).filter(Boolean).length;
  const nfr = met.slice(4).filter(Boolean).length;

  const verdict =
    fr === 4 && nfr === 4
      ? { tone: "ok" as const, text: "A good ride. Both kinds of requirement are met." }
      : fr === 4
        ? {
          tone: "bad" as const,
          text: "The route is right, but the ride is poor. All features pass. A quality target fails. This is a failed ride.",
        }
        : nfr === 4
          ? { tone: "bad" as const, text: "A feature is missing. This is not the ride that the customer booked." }
          : { tone: "bad" as const, text: "Both kinds fail. The trip is wrong and the ride is poor." };

  const col = (title: string, hint: string, items: typeof TAXI_FR, offset: number, count: number) => (
    <div className="flex min-w-0 flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {title} <span className="normal-case tracking-normal">({hint})</span>
        </p>
        <span className="font-mono text-[11px] text-foreground">{count}/4</span>
      </div>
      {items.map((it, k) => {
        const ok = met[offset + k];
        return (
          <button
            key={it.t}
            type="button"
            aria-pressed={ok}
            onClick={() => toggle(offset + k)}
            className={cn(
              "flex items-center gap-2 rounded-lg border px-2 py-1.5 text-left transition-colors",
              ok ? "border-mint/40 bg-mint/10" : "border-rose/50 bg-rose/10",
            )}
          >
            {ok ? (
              <Check className="size-3.5 shrink-0 text-mint" />
            ) : (
              <X className="size-3.5 shrink-0 text-rose" />
            )}
            <span className="min-w-0">
              <span className="block truncate text-xs font-semibold text-foreground">{it.t}</span>
              <span className="block truncate text-[10px] text-muted-foreground">{it.d}</span>
            </span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="flex h-full flex-col gap-2.5">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="font-mono text-[11px] text-muted-foreground">Click a row to break it.</span>
        <button
          type="button"
          onClick={() => setMet([true, true, true, true, false, false, true, true])}
          className="ml-auto rounded-md border border-rose/40 px-2.5 py-1 text-xs font-medium text-rose transition-colors hover:bg-rose/10"
        >
          Fare $90 + 70 minutes
        </button>
        <button
          type="button"
          aria-label="Reset"
          title="Reset"
          onClick={() => setMet(Array(8).fill(true))}
          className="grid size-7 place-items-center rounded-md border border-hairline text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
        >
          <RotateCcw className="size-3.5" />
        </button>
      </div>
      <div className="grid flex-1 grid-cols-2 gap-2.5">
        {col("Functional", "WHAT", TAXI_FR, 0, fr)}
        {col("Non-functional", "HOW WELL", TAXI_NFR, 4, nfr)}
      </div>
      <Status tone={verdict.tone}>{verdict.text}</Status>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Sort it                                                                    */
/* -------------------------------------------------------------------------- */

type Item = { t: string; kind: "fr" | "nfr"; letter?: Letter | null };

const DECKS: { name: string; items: Item[] }[] = [
  {
    name: "Food delivery",
    items: [
      { t: "Browse the menu", kind: "fr" },
      { t: "The menu loads in under 1 second", kind: "nfr", letter: "L" },
      { t: "Place an order", kind: "fr" },
      { t: "50,000 orders each hour at peak", kind: "nfr", letter: "S" },
      { t: "Card data is encrypted", kind: "nfr", letter: null },
      { t: "Track the courier on a map", kind: "fr" },
      { t: "The app is up 99.95% of the time", kind: "nfr", letter: "A" },
      { t: "Rate the restaurant", kind: "fr" },
      { t: "No paid order is lost", kind: "nfr", letter: "D" },
      { t: "Cancel an order", kind: "fr" },
    ],
  },
  {
    name: "Concert tickets",
    items: [
      { t: "Search events by city", kind: "fr" },
      { t: "The seat map loads in under 2 seconds", kind: "nfr", letter: "L" },
      { t: "Select a seat", kind: "fr" },
      { t: "Two buyers never get the same seat", kind: "nfr", letter: "C" },
      { t: "Pay by card", kind: "fr" },
      { t: "200,000 buyers when a sale opens", kind: "nfr", letter: "S" },
      { t: "Send the ticket by email", kind: "fr" },
      { t: "Card data follows card industry rules", kind: "nfr", letter: null },
      { t: "A paid ticket is never lost", kind: "nfr", letter: "D" },
    ],
  },
];

function SortDemo() {
  const [deck, setDeck] = useState(0);
  const [i, setI] = useState(0);
  const [pick, setPick] = useState<"fr" | "nfr" | null>(null);
  const [score, setScore] = useState(0);

  const items = DECKS[deck].items;
  const done = i >= items.length;
  const item = items[Math.min(i, items.length - 1)];
  const right = pick !== null && pick === item.kind;

  const reset = (d: number) => {
    setDeck(d);
    setI(0);
    setPick(null);
    setScore(0);
  };
  const choose = (k: "fr" | "nfr") => {
    if (pick) return;
    setPick(k);
    if (k === item.kind) setScore((s) => s + 1);
  };
  const next = () => {
    setPick(null);
    setI((x) => x + 1);
  };

  return (
    <div className="flex h-full flex-col gap-2.5">
      <div className="flex flex-wrap items-center gap-1.5">
        {DECKS.map((d, k) => (
          <Seg key={d.name} on={deck === k} onClick={() => reset(k)}>
            {d.name}
          </Seg>
        ))}
        <span className="ml-auto font-mono text-[11px] text-muted-foreground">
          {Math.min(i + (pick ? 1 : 0), items.length)} of {items.length} · score {score}
        </span>
      </div>

      {done ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-hairline bg-muted/10 p-3 text-center">
          <p className="font-mono text-3xl font-bold text-mint">
            {score}/{items.length}
          </p>
          <p className="text-sm text-muted-foreground">
            {score === items.length ? "All correct." : "Try again to get them all."}
          </p>
          <button
            type="button"
            onClick={() => reset(deck)}
            className="flex h-7 items-center gap-1.5 rounded-md bg-mint px-3 text-xs font-semibold text-primary-foreground transition-colors hover:bg-mint/90"
          >
            <RotateCcw className="size-3.5" /> Play again
          </button>
        </div>
      ) : (
        <>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${deck}-${i}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex flex-1 items-center justify-center rounded-lg border border-hairline bg-muted/10 p-3 text-center"
            >
              <p className="text-base font-semibold text-foreground">{item.t}</p>
            </motion.div>
          </AnimatePresence>

          <div className="grid grid-cols-2 gap-2">
            {(
              [
                ["fr", "Functional (WHAT)"],
                ["nfr", "Non-functional (HOW WELL)"],
              ] as const
            ).map(([k, label]) => (
              <button
                key={k}
                type="button"
                disabled={!!pick}
                onClick={() => choose(k)}
                className={cn(
                  "rounded-lg border px-2 py-2 text-xs font-semibold transition-colors",
                  pick
                    ? k === item.kind
                      ? "border-mint/60 bg-mint/10 text-mint"
                      : pick === k
                        ? "border-rose/60 bg-rose/10 text-rose"
                        : "border-hairline text-muted-foreground opacity-60"
                    : "border-hairline text-foreground hover:bg-muted/50",
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {pick ? (
            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-1">
                <Status tone={right ? "ok" : "bad"}>
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    {right ? "Correct." : "Not quite."}{" "}
                    {item.kind === "fr" ? (
                      <span>This is a feature. It says what the system does.</span>
                    ) : (
                      <>
                        <span>This is a quality standard.</span>
                        <LetterBadge letter={item.letter ?? null} />
                      </>
                    )}
                  </span>
                </Status>
              </div>
              <button
                type="button"
                onClick={next}
                className="h-8 shrink-0 rounded-md bg-mint px-3 text-xs font-semibold text-primary-foreground transition-colors hover:bg-mint/90"
              >
                {i + 1 >= items.length ? "Finish" : "Next"}
              </button>
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-hairline px-2.5 py-1.5 text-xs text-muted-foreground">
              Choose one answer.
            </p>
          )}
        </>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 3 steps                                                                    */
/* -------------------------------------------------------------------------- */

const STEP1 = [
  ["Who will use the system?", "The answer sets the size of the problem."],
  ["Which features must exist on day one?", "The answer keeps the design small and clear."],
  ["What will we not build?", "The answer stops extra work."],
  ["How does a user move through the product?", "The answer shows how the features link."],
];
const STEP2 = [
  ["Speed", "How many requests arrive each second? How long can a user wait?"],
  ["Reliability", "How long can the system be down in a year? How fast must it recover?"],
  ["Growth", "How many users exist now? How many in two years? What is the peak?"],
  ["Security", "Which data is private? Which laws or card rules apply?"],
  ["Operations", "How often do we release? How fast must we find a fault?"],
];
const STEP3 = [
  {
    pair: "Consistency or availability",
    sides: [
      { name: "Consistency", gain: "Users always see the newest data.", cost: "During a network fault, some requests fail." },
      { name: "Availability", gain: "The app keeps working in a fault.", cost: "Some data can be a few seconds old." },
    ],
    say: "In a network fault, the app still shows the menu. A restaurant rating can be a few seconds old.",
  },
  {
    pair: "Speed or freshness",
    sides: [
      { name: "Speed", gain: "Pages load fast from a cache.", cost: "Data can be up to 1 minute old." },
      { name: "Freshness", gain: "Data is always new.", cost: "Each request is slower." },
    ],
    say: "The menu comes from a cache. The cache refreshes each minute.",
  },
  {
    pair: "Cost or speed",
    sides: [
      { name: "Cost", gain: "Fewer servers. The bill is lower.", cost: "Latency rises at peak time." },
      { name: "Speed", gain: "Extra servers always run. Peak traffic stays fast.", cost: "The bill is higher." },
    ],
    say: "We start extra servers only at dinner time. This saves money.",
  },
];

function StepsDemo() {
  const [step, setStep] = useState(1);
  const [t, setT] = useState(0);
  const [win, setWin] = useState<number | null>(null);

  return (
    <div className="flex h-full flex-col gap-2.5">
      <div className="flex flex-wrap items-center gap-1.5">
        <Seg on={step === 1} onClick={() => setStep(1)}>
          1. Scope
        </Seg>
        <Seg on={step === 2} onClick={() => setStep(2)}>
          2. Measure
        </Seg>
        <Seg on={step === 3} onClick={() => setStep(3)}>
          3. Choose
        </Seg>
      </div>

      <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto">
        {step === 1 &&
          STEP1.map(([q, why]) => (
            <div key={q} className="rounded-lg border border-hairline bg-muted/10 px-2.5 py-1.5">
              <p className="text-xs font-semibold text-foreground">&quot;{q}&quot;</p>
              <p className="text-[11px] text-muted-foreground">{why}</p>
            </div>
          ))}
        {step === 2 &&
          STEP2.map(([c, q]) => (
            <div key={c} className="rounded-lg border border-hairline bg-muted/10 px-2.5 py-1.5">
              <p className="text-xs font-semibold text-foreground">{c}</p>
              <p className="text-[11px] text-muted-foreground">{q}</p>
            </div>
          ))}
        {step === 3 && (
          <>
            <p className="font-mono text-[11px] text-muted-foreground">
              Ask: &quot;If two qualities conflict, which one wins?&quot;
            </p>
            <div className="flex flex-wrap gap-1.5">
              {STEP3.map((s3, k) => (
                <Seg
                  key={s3.pair}
                  on={t === k}
                  onClick={() => {
                    setT(k);
                    setWin(null);
                  }}
                >
                  {s3.pair}
                </Seg>
              ))}
            </div>
            <p className="font-mono text-[11px] text-muted-foreground">Click the quality that wins.</p>
            <div className="grid grid-cols-2 gap-2">
              {STEP3[t].sides.map((side, k) => {
                const on = win === k;
                const lose = win !== null && !on;
                return (
                  <button
                    key={side.name}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setWin(k)}
                    className={cn(
                      "flex flex-col gap-1.5 rounded-lg border px-2.5 py-2 text-left transition-colors",
                      on
                        ? "border-mint/60 bg-mint/10"
                        : lose
                          ? "border-hairline opacity-60"
                          : "border-hairline bg-muted/10 hover:bg-muted/30",
                    )}
                  >
                    <span className="text-xs font-semibold text-foreground">{side.name} wins</span>
                    <span className="text-[11px] text-mint">+ {side.gain}</span>
                    <span className="text-[11px] text-rose">− {side.cost}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      <Status tone="info">
        {step === 1 && (
          <>
            <span className="font-mono text-[10px] uppercase tracking-wider text-violet">Example </span>
            The first version has menus, orders, payment, and courier tracking. A dashboard for restaurants is out of scope.
          </>
        )}
        {step === 2 && (
          <>
            <span className="font-mono text-[10px] uppercase tracking-wider text-violet">Example </span>
            The app serves 2 million orders each day. The p95 menu load time is below 1 second. The app is up 99.95% of the time. No paid order is lost.
          </>
        )}
        {step === 3 && (
          <>
            <span className="font-mono text-[10px] uppercase tracking-wider text-violet">Example </span>
            {win === null ? STEP3[t].say : `${STEP3[t].sides[win].name} wins. The cost: ${STEP3[t].sides[win].cost.charAt(0).toLowerCase()}${STEP3[t].sides[win].cost.slice(1)} Give the reason for your choice.`}
          </>
        )}
      </Status>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* NFR types                                                                  */
/* -------------------------------------------------------------------------- */

const NFR_GROUPS: { name: string; rows: [string, string, string][] }[] = [
  {
    name: "Speed",
    rows: [
      ["Response time", "Time to answer one request", "p95 below 300 ms"],
      ["Throughput", "Requests handled each second", "2,000 requests each second"],
      ["Page load", "Time until a page is usable", "Under 2 s on 4G"],
    ],
  },
  {
    name: "Reliability",
    rows: [
      ["Availability", "Share of time the system works", "99.9% each month"],
      ["Recovery time", "Time to restore service", "RTO 15 minutes"],
      ["Data loss limit", "Most data you accept to lose", "RPO 5 minutes"],
    ],
  },
  {
    name: "Growth",
    rows: [
      ["User growth", "More people use the system", "10 times more users in 2 years"],
      ["Data growth", "Stored data gets larger", "5 TB more each year"],
      ["Peak load", "Highest short traffic", "3 times the daily average"],
    ],
  },
  {
    name: "Security",
    rows: [
      ["Sign-in", "Prove who the user is", "Two-step sign-in"],
      ["Access", "Limit what each user can do", "Admin and customer roles"],
      ["Data protection", "Hide data from outsiders", "Encrypted in transit and at rest"],
    ],
  },
  {
    name: "Operations",
    rows: [
      ["Release speed", "How often you ship changes", "Two releases each day"],
      ["Monitoring", "See faults quickly", "Alert within 1 minute"],
      ["Rollback", "Undo a bad release", "Rollback in 5 minutes"],
    ],
  },
];

function NfrDemo() {
  const [g, setG] = useState(0);
  const group = NFR_GROUPS[g];
  return (
    <div className="flex h-full flex-col gap-2.5">
      <div className="flex flex-wrap gap-1.5">
        {NFR_GROUPS.map((x, k) => (
          <Seg key={x.name} on={g === k} onClick={() => setG(k)}>
            {x.name}
          </Seg>
        ))}
      </div>
      <div className="flex min-h-0 flex-1 flex-col justify-center gap-1.5">
        <div className="grid grid-cols-[6.5rem_minmax(0,1fr)_minmax(0,1fr)] gap-2 px-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          <span>Metric</span>
          <span>Meaning</span>
          <span>Example</span>
        </div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={group.name}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="space-y-1.5"
          >
            {group.rows.map(([m, d, e]) => (
              <div
                key={m}
                className="grid grid-cols-[6.5rem_minmax(0,1fr)_minmax(0,1fr)] items-center gap-2 rounded-lg border border-hairline bg-muted/10 px-2 py-2"
              >
                <span className="text-xs font-semibold text-foreground">{m}</span>
                <span className="text-xs text-muted-foreground">{d}</span>
                <span className="font-mono text-[11px] text-mint">{e}</span>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
      <Status tone="info">Pick the targets that fit the product. Do not list them all.</Status>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Real systems                                                               */
/* -------------------------------------------------------------------------- */

const SYSTEMS: {
  name: string;
  fr: string[];
  nfr: { t: string; letter: Letter | null }[];
}[] = [
    {
      name: "Food delivery",
      fr: ["Browse the menu", "Place an order", "Pay by card", "Track the courier", "Cancel an order"],
      nfr: [
        { t: "Menu loads in under 1 s", letter: "L" },
        { t: "50,000 orders each hour", letter: "S" },
        { t: "99.95% uptime", letter: "A" },
        { t: "No paid order is lost", letter: "D" },
        { t: "Card data is encrypted", letter: null },
      ],
    },
    {
      name: "Concert tickets",
      fr: ["Search events by city", "Select a seat", "Pay by card", "Send the ticket by email"],
      nfr: [
        { t: "Seat map loads in under 2 s", letter: "L" },
        { t: "No seat sold twice", letter: "C" },
        { t: "200,000 buyers at sale start", letter: "S" },
        { t: "Card industry rules", letter: null },
      ],
    },
    {
      name: "Video calls",
      fr: ["Start a call", "Join with a link", "Share a screen", "Chat during a call"],
      nfr: [
        { t: "Audio delay under 150 ms", letter: "L" },
        { t: "10 million calls each day", letter: "S" },
        { t: "Call hour costs under $0.02", letter: "E" },
        { t: "Recordings are never lost", letter: "D" },
        { t: "Calls are encrypted", letter: null },
      ],
    },
  ];

function ExamplesDemo() {
  const [s, setS] = useState(0);
  const sys = SYSTEMS[s];
  return (
    <div className="flex h-full flex-col gap-2.5">
      <div className="flex flex-wrap gap-1.5">
        {SYSTEMS.map((x, k) => (
          <Seg key={x.name} on={s === k} onClick={() => setS(k)}>
            {x.name}
          </Seg>
        ))}
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-2.5 overflow-y-auto">
        <div className="space-y-1.5">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Functional
          </p>
          {sys.fr.map((f) => (
            <p
              key={f}
              className="rounded-lg border border-hairline bg-muted/10 px-2 py-1.5 text-xs text-foreground"
            >
              {f}
            </p>
          ))}
        </div>
        <div className="space-y-1.5">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Non-functional
          </p>
          {sys.nfr.map((n) => (
            <div
              key={n.t}
              className="flex flex-col gap-1 rounded-lg border border-hairline bg-muted/10 px-2 py-1.5"
            >
              <p className="text-xs text-foreground">{n.t}</p>
              <div>
                <LetterBadge letter={n.letter} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main component                                                             */
/* -------------------------------------------------------------------------- */

const PANEL_H = "lg:h-[19rem]";

function Demo({ id }: { id: TabId }) {
  switch (id) {
    case "taxi":
      return <TaxiDemo />;
    case "sort":
      return <SortDemo />;
    case "steps":
      return <StepsDemo />;
    case "nfr":
      return <NfrDemo />;
    case "examples":
      return <ExamplesDemo />;
  }
}

export function RequirementsExplorer() {
  const [tab, setTab] = useState<TabId>("taxi");
  const idx = TABS.findIndex((t) => t.id === tab);
  const cur = TABS[idx];
  const Icon = cur.icon;

  const go = (k: number) => setTab(TABS[(k + TABS.length) % TABS.length].id);
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
            Explore the two kinds
          </p>
        </div>
      </div>

      <div className="space-y-2.5 p-3 sm:p-4">
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Requirement topics">
          {TABS.map((t) => {
            const TabIcon = t.icon;
            const on = t.id === tab;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                  on ? SEG_ON : SEG_OFF,
                )}
              >
                <TabIcon className="size-3.5" />
                {t.label}
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
              "overflow-y-auto rounded-xl border border-hairline bg-background p-3",
              PANEL_H,
            )}
          >
            <div className="mb-2 flex items-center gap-2.5">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-mint/10 text-mint">
                <Icon className="size-4" />
              </span>
              <div className="min-w-0">
                <h4 className="text-base font-semibold leading-tight text-foreground">{cur.title}</h4>
                <p className="text-xs font-medium text-mint">{cur.question}</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">{cur.definition}</p>
            <div className="mt-2.5 rounded-lg border border-violet/30 bg-violet/10 px-2.5 py-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-violet">Remember</p>
              <p className="mt-0.5 text-[13px] leading-relaxed text-foreground/90">{cur.remember}</p>
            </div>
            <div className="mt-2.5 grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-hairline bg-muted/20 px-2.5 py-1.5">
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Functional
                </p>
                <p className="text-xs font-semibold text-foreground">WHAT it does</p>
              </div>
              <div className="rounded-lg border border-hairline bg-muted/20 px-2.5 py-1.5">
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Non-functional
                </p>
                <p className="text-xs font-semibold text-foreground">HOW WELL it does it</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground">
          Click a tab. Use the controls. Click the box, then use ← → to change the tab.
        </p>
      </div>
    </section>
  );
}