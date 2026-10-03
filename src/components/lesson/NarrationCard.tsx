import { AnimatePresence, motion } from "motion/react";

export function NarrationCard({
  stepIndex,
  text,
  proof,
}: {
  stepIndex: number;
  text: string;
  /** Optional "why this move is safe" sentence, shown in its own callout. */
  proof?: string;
}) {
  return (
    <div className="rounded-2xl border border-hairline bg-surface px-5 py-4">
      <div className="mb-1 flex items-center gap-2">
        <div className="size-1.5 rounded-full bg-mint shadow-[0_0_10px_var(--mint)]" />
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          narration
        </span>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={stepIndex}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
        >
          <p className="lesson-supporting text-balance text-foreground">{text}</p>
          {proof && (
            <div className="mt-3 flex items-start gap-3 rounded-xl border border-violet/30 bg-violet/10 px-3.5 py-2.5">
              <span className="mt-1 shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] text-violet">
                why
              </span>
              <p className="lesson-supporting text-foreground/90">{proof}</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
