import { motion } from "motion/react";
import { VisualPlayer } from "../window-functions/VisualPlayer";

type Entry = { id: number; salary: number };

const ENGINEERING: Entry[] = [
  { id: 101, salary: 120000 },
  { id: 102, salary: 110000 },
  { id: 103, salary: 110000 },
  { id: 104, salary: 90000 },
];

const STEPS = [
  { label: "A department is a competition", note: "Think of each department as a separate competition. Engineering has four employees, and two of them tie at 110k." },
  {
    label: "Exactly 2 employees",
    note: "ROW_NUMBER() returns two employees, even when others have the same salary. Employee 103 is left out.",
  },
  {
    label: "Top 2 salary levels",
    note: "DENSE_RANK() returns three employees because two share the second salary level.",
  },
] as const;

const selected = (step: number, e: Entry) => (step === 1 ? e.id <= 102 : step === 2 ? e.id <= 103 : false);

function Body({ step }: { step: number }) {
  const title = step === 1 ? "ROW_NUMBER(): exactly 2 employees" : step === 2 ? "DENSE_RANK(): top 2 salary levels" : "Engineering";
  const count = step === 1 ? 2 : step === 2 ? 3 : null;
  return (
    <div className="rounded-xl border border-dashed border-hairline p-4">
      <div className="mb-3 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        <span>{title}</span>
        <span>{count === null ? "" : `${count} selected`}</span>
      </div>
      <div className="flex flex-col gap-2">
        {ENGINEERING.map((e) => {
          const on = selected(step, e);
          const tie = e.salary === 110000;
          return (
            <motion.div
              key={e.id}
              layout
              className={`flex items-center justify-between rounded-lg border px-3 py-2 font-mono text-[13px] transition-colors ${
                on
                  ? "border-mint/50 bg-mint/10 text-foreground"
                  : step > 0
                    ? "border-hairline bg-surface/40 text-muted-foreground"
                    : tie
                      ? "border-amber/40 bg-amber/5 text-foreground"
                      : "border-hairline bg-surface/70 text-foreground"
              }`}
            >
              <span>Employee {e.id}</span>
              <span>{e.salary === 110000 ? "110k" : e.salary === 120000 ? "120k" : "90k"}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export function TopNCompetitionVisual({ caption }: { caption?: string }) {
  return <VisualPlayer caption={caption} steps={STEPS} renderStep={(step) => <Body step={step} />} placeholderHeight={380} />;
}
