import { motion } from "motion/react";

import type { StageProps } from "@/components/dsa/shared/pattern-canvas-types";
import { cn } from "@/lib/utils";

import { triplet, type TripletStep } from "./triplet-step";

const POINTER_STYLE = {
  i: "text-violet",
  left: "text-mint",
  right: "text-blue-500 dark:text-blue-400",
} as const;

/**
 * 3-Sum stage: the sorted array with the fixed number `i`, the `left` and `right` pointers
 * stacked above it, the running sum under it, and the triplets saved so far.
 */
export function TripletStage({ step, stepKey, problemId }: StageProps<TripletStep>) {
  const { values, i, left, right } = step;
  const n = values.length;
  const columns = { gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` };
  const cellFont = { fontSize: `clamp(0.8rem, ${Math.round(40 / n)}cqi, 1.75rem)` };

  const pointersAt = (index: number) =>
    [i === index && "i", left === index && "left", right === index && "right"].filter(Boolean) as (
      "i" | "left" | "right"
    )[];

  const cellClass = (index: number) => {
    const selected = pointersAt(index);
    if (step.found && selected.length)
      return "border-mint bg-mint/20 text-mint ring-4 ring-mint/30";
    if (step.skipped?.includes(index))
      return "border-dashed border-rose/60 bg-rose/5 text-rose/80 line-through";
    if (selected.includes("i"))
      return "border-violet bg-violet/15 text-violet ring-2 ring-violet/30";
    if (selected.includes("left")) return "border-mint bg-mint/10 text-mint ring-2 ring-mint/30";
    if (selected.includes("right"))
      return "border-blue-500 bg-blue-500/10 text-blue-500 ring-2 ring-blue-500/30 dark:text-blue-400";
    if (i !== null && index < i) return "border-hairline bg-background text-muted-foreground/50";
    return "border-hairline bg-background text-foreground/75";
  };

  return (
    <div className="@container relative mx-auto w-full" style={{ maxWidth: `${n * 5.5}rem` }}>
      {/* Pointer labels: i, left and right stack above one arrow when they share a cell */}
      <div className="grid items-end" style={columns}>
        {values.map((_, index) => {
          const here = pointersAt(index);
          return (
            <div
              key={index}
              className="flex h-[2.9rem] flex-col items-center justify-end font-mono text-xs font-bold leading-tight"
            >
              {here.map((pointer) => (
                <motion.span
                  key={pointer}
                  layoutId={`${problemId}-${pointer}`}
                  transition={{ type: "spring", stiffness: 260, damping: 26 }}
                  className={POINTER_STYLE[pointer]}
                >
                  {pointer === "i" ? "i" : pointer === "left" ? "L" : "R"}
                </motion.span>
              ))}
              {here.length > 0 ? (
                <span
                  className={cn("leading-none", POINTER_STYLE[here[here.length - 1]])}
                  aria-hidden
                >
                  ▼
                </span>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="mt-1 grid h-[4.75rem] items-center" style={{ ...columns, ...cellFont }}>
        {values.map((value, index) => (
          <div key={index} className="flex justify-center px-0.5 sm:px-1">
            <div
              className={cn(
                "flex aspect-square w-full max-w-[4.75rem] items-center justify-center rounded-xl border font-mono font-bold transition-all duration-300",
                cellClass(index),
              )}
            >
              {value}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-1.5 grid" style={columns}>
        {values.map((_, index) => (
          <span key={index} className="text-center font-mono text-xs text-muted-foreground">
            [{index}]
          </span>
        ))}
      </div>

      {/* The running sum of the three selected values */}
      <div className="mt-2 flex h-8 items-center justify-center">
        {step.total ? (
          <span
            key={`${stepKey}-sum`}
            className={cn(
              "whitespace-nowrap rounded-full border px-3 py-1 font-mono text-xs font-bold duration-300 animate-in fade-in zoom-in-95",
              step.total.tone === "mint"
                ? "border-mint/40 bg-mint/10 text-mint"
                : "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400",
            )}
          >
            {step.total.label}
          </span>
        ) : null}
      </div>

      {/* Triplets saved so far */}
      <div className="mt-2 rounded-xl border border-hairline bg-background/60 px-3 py-2">
        <p className="text-xs font-semibold text-muted-foreground">
          Triplets found{step.results.length ? ` (${step.results.length})` : ""}
        </p>
        <div className="mt-1.5 flex h-[3.4rem] flex-wrap content-start gap-1.5 overflow-y-auto">
          {step.results.length === 0 ? (
            <span className="text-xs text-muted-foreground/70">None yet</span>
          ) : (
            step.results.map((result, index) => (
              <span
                key={`${index}-${result.join(",")}`}
                className="h-fit whitespace-nowrap rounded-md border border-mint/40 bg-mint/10 px-2 py-0.5 font-mono text-xs font-semibold text-mint duration-300 animate-in zoom-in-75"
              >
                {triplet(result)}
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
