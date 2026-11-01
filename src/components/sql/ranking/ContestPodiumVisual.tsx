import { AnimatePresence, motion } from "motion/react";
import { Trophy } from "lucide-react";
import { VisualPlayer } from "../window-functions/VisualPlayer";

type Entry = { name: string; salary: number; rank: number; dense: number };

const ENTRIES: Entry[] = [
  { name: "Alice", salary: 9000, rank: 1, dense: 1 },
  { name: "Bob", salary: 8000, rank: 2, dense: 2 },
  { name: "Charlie", salary: 8000, rank: 2, dense: 2 },
  { name: "David", salary: 6000, rank: 4, dense: 3 },
  { name: "Emma", salary: 5000, rank: 5, dense: 4 },
];

const STEPS = [
  {
    label: "Five employees compete",
    note: "Five employees compete in a salary ranking contest. Bob and Charlie earn the same salary.",
  },
  {
    label: "Bob and Charlie tie",
    note: "They tie for second place, so they must share the same rank. This is a peer group.",
  },
  {
    label: "RANK() leaves a gap",
    note: "RANK() gives the same rank to ties and leaves gaps after them: 1, 2, 2, 4, 5.",
  },
  {
    label: "DENSE_RANK() leaves no gap",
    note: "DENSE_RANK() gives the same rank to ties and does not leave gaps: 1, 2, 2, 3, 4.",
  },
] as const;

function Card({ entry, step }: { entry: Entry; step: number }) {
  const tied = entry.salary === 8000;
  const showTie = step >= 1 && tied;
  const value = step === 2 ? entry.rank : step === 3 ? entry.dense : undefined;
  return (
    <div
      className={`flex items-center gap-3 rounded-lg border px-3 py-2 transition-colors ${
        showTie ? "border-amber/50 bg-amber/10" : "border-hairline bg-surface/70"
      }`}
    >
      <div className="flex h-8 w-10 items-center justify-center">
        <AnimatePresence mode="wait">
          {value !== undefined ? (
            <motion.div
              key={`${step}-${value}`}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[13px] font-semibold ${
                step === 2 ? "border-amber/40 bg-amber/10 text-amber" : "border-mint/40 bg-mint/10 text-mint"
              }`}
            >
              {value}
            </motion.div>
          ) : (
            <Trophy className="size-4 text-muted-foreground" />
          )}
        </AnimatePresence>
      </div>
      <div className="flex-1 font-mono text-[13px] text-foreground">{entry.name}</div>
      <div className="font-mono text-[13px] text-foreground/85">{entry.salary}</div>
    </div>
  );
}

function Body({ step }: { step: number }) {
  const title = step === 2 ? "RANK()" : step === 3 ? "DENSE_RANK()" : "Salary contest";
  return (
    <div className="rounded-xl border border-dashed border-hairline p-4">
      <div className="mb-3 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        <span>{title}</span>
        <span>{step >= 2 ? "Ranks" : "Salary"}</span>
      </div>
      <div className="flex flex-col gap-2">
        {ENTRIES.map((entry) => (
          <Card key={entry.name} entry={entry} step={step} />
        ))}
      </div>
      <div className="mt-3 flex h-6 items-center justify-center font-mono text-[12px] text-muted-foreground">
        {step === 2 ? "1 → 2 → 2 → 4 → 5" : step === 3 ? "1 → 2 → 2 → 3 → 4" : ""}
      </div>
    </div>
  );
}

export function ContestPodiumVisual({ caption }: { caption?: string }) {
  return <VisualPlayer caption={caption} steps={STEPS} renderStep={(step) => <Body step={step} />} placeholderHeight={420} />;
}
