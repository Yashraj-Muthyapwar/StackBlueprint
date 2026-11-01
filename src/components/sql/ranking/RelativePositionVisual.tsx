import { motion } from "motion/react";
import { VisualPlayer } from "../window-functions/VisualPlayer";

type Student = { name: string; score: number; pr: string; cd: string };

const STUDENTS: Student[] = [
  { name: "Alice", score: 50, pr: "0.00", cd: "0.20" },
  { name: "Bob", score: 70, pr: "0.25", cd: "0.60" },
  { name: "Charlie", score: 70, pr: "0.25", cd: "0.60" },
  { name: "David", score: 90, pr: "0.75", cd: "0.80" },
  { name: "Emma", score: 100, pr: "1.00", cd: "1.00" },
];

const STEPS = [
  { label: "A line of students", note: "Five students stand in a line from the lowest score to the highest score. Bob and Charlie share a score." },
  {
    label: "PERCENT_RANK() asks",
    note: "How far along the rank scale is this student, relative to the first and last rank positions? The first student is 0 and the last is 1.",
  },
  {
    label: "CUME_DIST() asks",
    note: "What fraction of students have scores less than or equal to this student's score? Four of the five students have scores of 90 or below, so David is 4/5, or 0.8.",
  },
] as const;

function Body({ step }: { step: number }) {
  return (
    <div className="rounded-xl border border-dashed border-hairline p-4">
      <div className="mb-3 flex justify-between font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        <span>Lowest score</span>
        <span>Highest score</span>
      </div>
      <div className="grid gap-2 sm:grid-cols-5">
        {STUDENTS.map((s) => {
          const david = s.name === "David";
          const tied = s.score === 70;
          const active = step === 2 && ["Alice", "Bob", "Charlie", "David"].includes(s.name);
          return (
            <motion.div
              key={s.name}
              layout
              className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-3 font-mono transition-colors ${
                step === 2 && david
                  ? "border-mint/60 bg-mint/15"
                  : active
                    ? "border-mint/30 bg-mint/5"
                    : tied && step > 0
                      ? "border-amber/40 bg-amber/5"
                      : "border-hairline bg-surface/70"
              }`}
            >
              <div className="text-[13px] text-foreground">{s.name}</div>
              <div className="text-[12px] text-foreground/75">{s.score}</div>
              <div className="flex h-6 items-center text-[12px] font-semibold">
                {step === 1 ? <span className="text-amber">{s.pr}</span> : null}
                {step === 2 ? <span className="text-mint">{s.cd}</span> : null}
              </div>
            </motion.div>
          );
        })}
      </div>
      <div className="mt-3 flex h-6 items-center justify-center font-mono text-[12px] text-muted-foreground">
        {step === 1 ? "PERCENT_RANK: 0 to 1 along the rank scale" : step === 2 ? "CUME_DIST: 4 of 5 students are at or below 90" : ""}
      </div>
    </div>
  );
}

export function RelativePositionVisual({ caption }: { caption?: string }) {
  return <VisualPlayer caption={caption} steps={STEPS} renderStep={(step) => <Body step={step} />} placeholderHeight={330} />;
}
