import { motion } from "motion/react";

import type { StageProps } from "@/components/dsa/shared/pattern-canvas-types";
import { cn } from "@/lib/utils";

import type { ArrayStep, FlowTone } from "./array-step";

/**
 * Opposite-ends stage: an array of boxes (or bars) with left / right pointers, swap and read
 * arcs, and a bracket over the range still in play. Lesson-owned; `PatternCanvas` only
 * centres it.
 */

const FLOW_STROKE: Record<FlowTone, string> = {
  amber: "stroke-amber-500",
  violet: "stroke-violet",
  mint: "stroke-mint",
  rose: "stroke-rose",
};

const FLOW_CHIP: Record<FlowTone, string> = {
  amber: "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  violet: "border-violet/40 bg-violet/10 text-violet",
  mint: "border-mint/40 bg-mint/10 text-mint",
  rose: "border-rose/40 bg-rose/10 text-rose",
};

export type ArrayStageProps = StageProps<ArrayStep> & {
  view: "cells" | "bars";
  settledStyle: "placed" | "eliminated" | "none";
};

export function ArrayStage({ step, stepKey, problemId, view, settledStyle }: ArrayStageProps) {
  const n = step.items.length;
  // Equal fluid columns keep every cell visible and make the flow-layer percentages exact.
  const columns = { gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` };
  const cellFont = { fontSize: `clamp(0.8rem, ${Math.round(42 / n)}cqi, 2rem)` };
  const center = (index: number) => ((index + 0.5) / n) * 100;
  const maxHeight = Math.max(1, ...step.items.map((item) => item.value));
  const arc =
    step.arc && step.left !== null && step.right !== null
      ? {
          ...step.arc,
          from: center(step.left),
          to: center(step.right),
          mid: (center(step.left) + center(step.right)) / 2,
        }
      : null;

  const cellClass = (index: number) => {
    const isLeft = step.left === index;
    const isRight = step.right === index;
    const settled = step.settled?.includes(index) ?? false;
    if (step.swapped?.includes(index))
      return "border-violet bg-violet/15 text-violet ring-2 ring-violet/30";
    if (step.found && (isLeft || isRight))
      return "border-mint bg-mint/20 text-mint ring-4 ring-mint/30";
    if (step.focus?.includes(index))
      return "border-amber-500 bg-amber-500/10 text-amber-600 ring-2 ring-amber-500/30 dark:text-amber-400";
    if (isLeft) return "border-mint bg-mint/10 text-mint ring-2 ring-mint/30";
    if (isRight)
      return "border-blue-500 bg-blue-500/10 text-blue-500 ring-2 ring-blue-500/30 dark:text-blue-400";
    if (settled && settledStyle === "placed") return "border-mint/40 bg-mint/5 text-mint/80";
    if (settled && settledStyle === "eliminated")
      return "border-hairline bg-background text-muted-foreground/50 line-through opacity-60";
    return "border-hairline bg-background text-foreground/75";
  };

  return (
    <div
      className="@container relative mx-auto w-full"
      style={{ maxWidth: `${n * (view === "bars" ? 4 : 6)}rem` }}
    >
      {/* Pointer labels */}
      <div className="grid" style={columns}>
        {step.items.map((_, index) => {
          const isLeft = step.left === index;
          const isRight = step.right === index;
          return (
            <div key={index} className="flex h-9 items-end justify-center">
              {isLeft && isRight ? (
                <span className="flex flex-col items-center font-mono text-xs font-bold text-violet">
                  L=R<span className="text-xs leading-none">▼</span>
                </span>
              ) : isLeft ? (
                <motion.span
                  layoutId={`${problemId}-left`}
                  transition={{ type: "spring", stiffness: 260, damping: 26 }}
                  className="flex flex-col items-center font-mono text-xs font-bold text-mint"
                >
                  L<span className="text-xs leading-none">▼</span>
                </motion.span>
              ) : isRight ? (
                <motion.span
                  layoutId={`${problemId}-right`}
                  transition={{ type: "spring", stiffness: 260, damping: 26 }}
                  className="flex flex-col items-center font-mono text-xs font-bold text-blue-500 dark:text-blue-400"
                >
                  R<span className="text-xs leading-none">▼</span>
                </motion.span>
              ) : null}
            </div>
          );
        })}
      </div>

      {view === "bars" ? (
        /* Bars with the water trapped above each one */
        <div className="mt-1 grid h-52 items-end" style={columns}>
          {step.items.map((item, index) => {
            const water = step.water?.[index] ?? 0;
            const isLeft = step.left === index;
            const isRight = step.right === index;
            const focus = step.focus?.includes(index);
            return (
              <div key={item.id} className="flex h-full flex-col justify-end px-0.5 sm:px-1">
                <div
                  className="rounded-t-sm bg-sky-400/50 transition-[height] duration-500 dark:bg-sky-400/40"
                  style={{ height: `${(water / maxHeight) * 100}%` }}
                />
                <div
                  className={cn(
                    "rounded-t-md border-2 border-b-0 transition-colors duration-300",
                    focus
                      ? "border-amber-500 bg-amber-500/30"
                      : isLeft
                        ? "border-mint bg-mint/30"
                        : isRight
                          ? "border-blue-500 bg-blue-500/30"
                          : "border-slate-400/60 bg-slate-400/30 dark:border-slate-500 dark:bg-slate-500/40",
                  )}
                  style={{ height: `${(item.value / maxHeight) * 100}%`, minHeight: 3 }}
                />
              </div>
            );
          })}
        </div>
      ) : (
        /* Cells: keyed by identity so a swap animates the values across */
        <div className="mt-1 grid items-center" style={{ ...columns, ...cellFont }}>
          {step.items.map((item, index) => (
            <motion.div
              key={item.id}
              layout
              transition={{ type: "spring", stiffness: 170, damping: 20 }}
              className="flex justify-center px-1 sm:px-1.5"
            >
              <div
                className={cn(
                  "flex aspect-square w-full max-w-[5.5rem] items-center justify-center rounded-xl border font-mono font-bold transition-all duration-300",
                  cellClass(index),
                )}
              >
                {item.value}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="mt-1.5 grid" style={columns}>
        {step.items.map((item, index) => (
          <span key={index} className="text-center font-mono text-xs text-muted-foreground">
            {view === "bars" ? item.value : `[${index}]`}
          </span>
        ))}
      </div>

      {/* Flow layer: an arc between the pointers, otherwise a bracket over a range */}
      <div className="relative mt-1 h-12">
        {arc ? (
          <>
            <svg
              key={stepKey}
              viewBox="0 0 100 40"
              preserveAspectRatio="none"
              className="absolute inset-x-0 top-0 h-8 w-full duration-300 animate-in fade-in"
              aria-hidden
            >
              <path
                d={`M ${arc.from} 2 Q ${arc.mid} 46 ${arc.to} 2`}
                fill="none"
                vectorEffect="non-scaling-stroke"
                strokeWidth={2}
                strokeDasharray={arc.dashed ? "5 4" : undefined}
                className={FLOW_STROKE[arc.tone]}
              />
            </svg>
            <span
              key={`${stepKey}-label`}
              className={cn(
                "absolute top-5 -translate-x-1/2 whitespace-nowrap rounded-full border px-2.5 py-0.5 font-mono text-xs font-bold duration-300 animate-in fade-in zoom-in-95",
                FLOW_CHIP[arc.tone],
              )}
              style={{ left: `${arc.mid}%` }}
            >
              {arc.label}
            </span>
          </>
        ) : step.bracket ? (
          <div
            className="absolute top-1 transition-all duration-500 ease-out"
            style={{
              left: `calc(${(step.bracket.from / n) * 100}% + 6px)`,
              width: `calc(${((step.bracket.to - step.bracket.from + 1) / n) * 100}% - 12px)`,
            }}
          >
            <div
              className={cn(
                "h-2.5 rounded-b-md border-x-2 border-b-2",
                step.bracket.tone === "muted" ? "border-muted-foreground/40" : "border-mint",
              )}
            />
            <p
              className={cn(
                "mt-1 whitespace-nowrap text-center text-xs",
                step.bracket.tone === "muted" ? "text-muted-foreground" : "font-medium text-mint",
              )}
            >
              {step.bracket.label}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
