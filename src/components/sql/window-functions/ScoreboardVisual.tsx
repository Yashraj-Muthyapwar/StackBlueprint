import { AnimatePresence, motion } from "motion/react";
import { ArrowDown, Trophy } from "lucide-react";
import { VisualPlayer } from "./VisualPlayer";

const ENTRIES = [
  { date: "Jan 1", amount: 100, running: 100 },
  { date: "Jan 3", amount: 200, running: 300 },
  { date: "Jan 6", amount: 50, running: 350 },
];
const money = (n: number) => `$${n}`;

const STEPS = [
  {
    label: "Customer A's scoreboard",
    note: "Imagine a scoreboard that tracks customer A's purchases. PARTITION BY selects this customer's scoreboard.",
  },
  {
    label: "Jan 1: $100",
    note: "ORDER BY decides the sequence of entries. The first purchase on Jan 1 gives a running total of $100.",
  },
  {
    label: "Jan 3: $200",
    note: "Each new purchase adds to the previous total: $100 + $200 = $300.",
  },
  {
    label: "Jan 6: $50",
    note: "The last purchase adds $50 to the previous total: $300 + $50 = $350.",
  },
] as const;

function Body({ step }: { step: number }) {
  return (
    <div className="rounded-xl border border-mint/40 bg-mint/5 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-mint">
        <span className="flex items-center gap-1.5">
          <Trophy className="size-3.5" />
          Customer A: purchase timeline
        </span>
        <span className="text-muted-foreground">ORDER BY order_date</span>
      </div>

      <div className="flex flex-col gap-2">
        {ENTRIES.map((entry, i) => {
          const shown = step >= i + 1;
          const current = step === i + 1;
          return (
            <div key={entry.date}>
              <div
                className={`grid grid-cols-[3.5rem_1fr_auto] items-center gap-3 rounded-lg border px-3 py-2 transition-colors duration-300 ${
                  current ? "border-mint/60 bg-mint/10" : "border-hairline bg-surface/60"
                }`}
              >
                <span className="font-mono text-[12px] text-muted-foreground">{entry.date}</span>
                <span className="font-mono text-[13px] text-foreground/90">{money(entry.amount)}</span>
                <div className="flex h-7 min-w-[4.5rem] sm:min-w-[9rem] items-center justify-end">
                  <AnimatePresence>
                    {shown ? (
                      <motion.div
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        className="whitespace-nowrap rounded-full border border-violet/40 bg-violet/10 px-2.5 py-0.5 font-mono text-[11.5px] text-violet"
                      >
                        {money(entry.running)}
                        <span className="ml-1 hidden text-[10px] opacity-75 sm:inline">running total</span>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              </div>
              {i < ENTRIES.length - 1 ? (
                <div className="flex justify-center py-0.5 text-muted-foreground/60">
                  <ArrowDown className="size-3.5" />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ScoreboardVisual({ caption }: { caption?: string }) {
  return <VisualPlayer caption={caption} steps={STEPS} renderStep={(step) => <Body step={step} />} placeholderHeight={430} />;
}
