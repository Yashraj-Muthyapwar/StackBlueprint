import { AnimatePresence, motion } from "motion/react";

export function NarrationCard({ stepIndex, text }: { stepIndex: number; text: string }) {
  return (
    <div className="rounded-2xl border border-hairline bg-surface px-5 py-4">
      <div className="mb-1 flex items-center gap-2">
        <div className="size-1.5 rounded-full bg-mint shadow-[0_0_10px_var(--mint)]" />
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          narration
        </span>
      </div>
      <AnimatePresence mode="wait">
        <motion.p
          key={stepIndex}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
          className="text-balance text-[15px] leading-relaxed text-foreground"
        >
          {text}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
