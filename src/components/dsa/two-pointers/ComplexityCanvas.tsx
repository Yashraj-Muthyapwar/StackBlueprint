import { motion } from "motion/react";
import type { Step } from "@/lessons/types";

export function ComplexityCanvas({ data }: { data: NonNullable<Step["complexity"]> }) {
  const { title, metric, blocks, activeBlock, formula, n, checks } = data;
  return (
    <div
      className="absolute inset-0 overflow-y-auto px-5 pb-5 pt-12"
      aria-label="Complexity explanation"
    >
      <p className="font-mono text-[10px] uppercase tracking-wider text-violet">
        {metric === "time" ? "Time: count executions" : "Space: count stored values"}
      </p>
      <h3 className="mt-2 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Follow the highlighted Python block and its cost label.
      </p>
      <div className="mt-4 space-y-2">
        {blocks.map((block, index) => (
          <motion.div
            key={`${metric}-${block.line}`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: index * 0.04 }}
            className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm ${index === activeBlock ? "border-mint/40 bg-mint/10 text-foreground" : "border-hairline text-muted-foreground"}`}
          >
            <div>
              <span className="mr-2 font-mono text-xs">
                L{block.line}
                {block.end && block.end !== block.line ? `–${block.end}` : ""}
              </span>
              {block.label}
            </div>
            <span className="shrink-0 font-mono text-xs text-mint">{block.cost}</span>
          </motion.div>
        ))}
      </div>
      <motion.div
        key={formula}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 rounded-xl border border-violet/30 bg-violet/10 px-3 py-3 font-mono text-sm text-foreground"
      >
        {formula}
      </motion.div>
      {metric === "time" && (
        <p className="mt-3 text-xs text-muted-foreground">
          This run: n = {n}; loop body executed {checks} times.
        </p>
      )}
    </div>
  );
}
