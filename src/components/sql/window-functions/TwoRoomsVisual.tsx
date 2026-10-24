import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Eye, Pause, Play, RotateCcw, User } from "lucide-react";
import { ClientOnly } from "@/components/lesson/ClientOnly";

type Room = {
  name: string;
  salaries: number[];
  tone: "mint" | "amber";
};

const ROOMS: Room[] = [
  { name: "IT Department", salaries: [5000, 6000], tone: "mint" },
  { name: "HR Department", salaries: [4000, 4500], tone: "amber" },
];

const TONE = {
  mint: { box: "border-mint/40 bg-mint/5", text: "text-mint", chip: "border-mint/40 bg-mint/10 text-mint" },
  amber: { box: "border-amber/40 bg-amber/5", text: "text-amber", chip: "border-amber/40 bg-amber/10 text-amber" },
} as const;

const money = (n: number) => `$${n.toLocaleString("en-US")}`;
const total = (room: Room) => room.salaries.reduce((a, b) => a + b, 0);

const STEPS = [
  {
    label: "Four employees, two rooms",
    note: "Imagine four employees standing in two rooms.",
  },
  {
    label: "Each room has a total",
    note: "Each room adds up its own salaries: IT is $11,000 and HR is $8,500.",
  },
  {
    label: "GROUP BY",
    note: "GROUP BY combines the people in each room into one result per department. Four employees become two rows.",
  },
  {
    label: "Window function",
    note: "A window function keeps every employee. Each one looks through the window and sees the total of their own department.",
  },
] as const;

function Person({ salary, seen, tone }: { salary: number; seen?: number; tone: Room["tone"] }) {
  const t = TONE[tone];
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.6 }}
      transition={{ duration: 0.3 }}
      className="flex w-24 flex-col items-center gap-1.5"
    >
      <div className="flex h-7 items-center">
        <AnimatePresence>
          {seen !== undefined ? (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[11px] ${t.chip}`}
            >
              <Eye className="size-3" />
              {money(seen)}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
      <div className={`grid size-12 place-items-center rounded-full border ${t.box} ${t.text}`}>
        <User className="size-6" />
      </div>
      <div className="font-mono text-[12px] text-foreground/85">{money(salary)}</div>
    </motion.div>
  );
}

function RoomView({ room, step }: { room: Room; step: number }) {
  const t = TONE[room.tone];
  const sum = total(room);
  return (
    <div className={`flex min-h-[250px] flex-1 flex-col rounded-xl border p-4 ${t.box}`}>
      <div className={`font-mono text-[11px] uppercase tracking-[0.14em] ${t.text}`}>{room.name}</div>
      <div className="flex flex-1 items-center justify-center">
        <AnimatePresence mode="wait" initial={false}>
          {step === 2 ? (
            <motion.div
              key="grouped"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className={`rounded-lg border px-5 py-3 text-center font-mono ${t.chip}`}
            >
              <div className="text-[11px] uppercase tracking-[0.14em]">One result</div>
              <div className="mt-1 text-lg">{room.name.split(" ")[0]} | {money(sum)}</div>
            </motion.div>
          ) : (
            <motion.div key="people" className="flex gap-3" exit={{ opacity: 0 }}>
              {room.salaries.map((s, i) => (
                <Person key={i} salary={s} tone={room.tone} seen={step === 3 ? sum : undefined} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="flex h-8 items-center justify-center">
        <AnimatePresence>
          {step === 1 || step === 3 ? (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`font-mono text-[12px] ${t.text}`}
            >
              Total: {money(sum)}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Stage() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const count = STEPS.length;

  useEffect(() => {
    if (!playing) return;
    const id = window.setTimeout(() => setStep((s) => (s + 1) % count), 3200);
    return () => window.clearTimeout(id);
  }, [playing, step, count]);

  useEffect(() => {
    const stop = () => setPlaying(false);
    window.addEventListener("quiz-started", stop);
    return () => window.removeEventListener("quiz-started", stop);
  }, []);

  const go = useCallback(
    (delta: number) => {
      setPlaying(false);
      setStep((s) => (s + delta + count) % count);
    },
    [count],
  );

  const btn =
    "rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground";

  return (
    <div className="flex flex-col">
      <div className="px-5 py-6 lg:px-7 lg:py-8">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-mint/40 bg-mint/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-mint">
            {STEPS[step].label}
          </span>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          {ROOMS.map((room) => (
            <RoomView key={room.name} room={room} step={step} />
          ))}
        </div>
        <p className="lesson-supporting mt-4 min-h-[3.5rem] text-foreground/85">{STEPS[step].note}</p>
      </div>
      <div className="flex items-center justify-between border-t border-hairline bg-surface-2/40 px-4 py-2.5">
        <div className="flex items-center gap-1">
          <button type="button" className={btn} aria-label="Restart" onClick={() => { setPlaying(false); setStep(0); }}>
            <RotateCcw className="size-3.5" />
          </button>
          <button type="button" className={btn} aria-label="Previous step" onClick={() => go(-1)}>
            <ChevronLeft className="size-3.5" />
          </button>
          <button type="button" className={btn} aria-label={playing ? "Pause" : "Play"} onClick={() => setPlaying((p) => !p)}>
            {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
          </button>
          <button type="button" className={btn} aria-label="Next step" onClick={() => go(1)}>
            <ChevronRight className="size-3.5" />
          </button>
        </div>
        <div className="flex items-center gap-1.5">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-1 rounded-full transition-all ${i === step ? "w-6 bg-mint" : i < step ? "w-2 bg-mint" : "w-2 bg-hairline"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function TwoRoomsVisual({ caption }: { caption?: string }) {
  return (
    <figure className="relative overflow-hidden rounded-xl border border-hairline bg-slate-50 dark:bg-surface shadow-sm">
      {caption ? (
        <figcaption className="relative z-10 border-b border-hairline bg-surface/50 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground backdrop-blur">
          {caption}
        </figcaption>
      ) : null}
      <ClientOnly fallback={<div className="h-[430px] animate-pulse bg-surface-2/40" />}>
        <Stage />
      </ClientOnly>
    </figure>
  );
}
