import { AnimatePresence, motion } from "motion/react";
import { Calculator } from "lucide-react";
import { VisualPlayer } from "./VisualPlayer";

const EMPLOYEES = [
  { id: "E1", salary: 5000 },
  { id: "E2", salary: 6000 },
  { id: "E3", salary: 4000 },
  { id: "E4", salary: 4500 },
];
const TOTAL = EMPLOYEES.reduce((sum, e) => sum + e.salary, 0);
const money = (n: number) => `$${n.toLocaleString("en-US")}`;

const STEPS = [
  {
    label: "Every employee holds a calculator",
    note: "Imagine that every employee holds a calculator. Each one knows only their own salary.",
  },
  {
    label: "One shared window",
    note: "OVER () opens one shared window across the table. With empty parentheses, the window includes all available rows.",
  },
  {
    label: "SUM(salary) OVER ()",
    note: "SUM() tells PostgreSQL what to calculate. OVER () tells it which rows to use. All four rows give $19,500.",
  },
  {
    label: "Result on every row",
    note: "The result is available on every employee row, and all four rows are still there.",
  },
] as const;

function Body({ step }: { step: number }) {
  const windowOpen = step >= 1;
  return (
    <div
      className={`relative rounded-xl border-2 p-4 transition-colors duration-500 ${
        windowOpen ? "border-dashed border-violet/60 bg-violet/5" : "border-transparent"
      }`}
    >
      <div className="mb-3 flex min-h-[3.25rem] flex-wrap items-start justify-between gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-violet sm:min-h-6 sm:items-center">
        <span>{windowOpen ? "One shared window across the table" : "All employees"}</span>
        <AnimatePresence>
          {step === 2 ? (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-md border border-violet/40 bg-violet/10 px-2 py-0.5 normal-case tracking-normal"
            >
              Calculated across all four rows
            </motion.span>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {EMPLOYEES.map((e) => (
          <div
            key={e.id}
            className="flex flex-col items-center gap-2 rounded-lg border border-hairline bg-surface/60 px-2 py-3"
          >
            <div className="grid size-11 place-items-center rounded-full border border-mint/40 bg-mint/10 text-mint">
              <Calculator className="size-5" />
            </div>
            <div className="font-mono text-[11px] text-muted-foreground">{e.id}</div>
            <div className="font-mono text-[13px] text-foreground/90">{money(e.salary)}</div>
            <div className="flex h-6 items-center">
              <AnimatePresence>
                {step === 3 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="rounded-full border border-violet/40 bg-violet/10 px-2 py-0.5 font-mono text-[11px] text-violet"
                  >
                    {money(TOTAL)}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex h-14 items-center justify-center">
        <AnimatePresence>
          {step === 2 ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-lg border border-violet/50 bg-violet/10 px-5 py-2 text-center font-mono text-violet"
            >
              <div className="text-[11px]">SUM(salary) OVER ()</div>
              <div className="text-lg">{money(TOTAL)}</div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function CalculatorWindowVisual({ caption }: { caption?: string }) {
  return <VisualPlayer caption={caption} steps={STEPS} renderStep={(step) => <Body step={step} />} placeholderHeight={400} />;
}
