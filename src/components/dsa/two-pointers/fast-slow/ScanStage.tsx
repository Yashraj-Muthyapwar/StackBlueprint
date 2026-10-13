import { motion } from "motion/react";

import type { StageProps } from "@/components/dsa/shared/pattern-canvas-types";
import { cn } from "@/lib/utils";

import type { ScanStep, ScanTone } from "./scan-step";

const ARC_STROKE: Record<ScanTone, string> = {
  amber: "stroke-amber-500",
  violet: "stroke-violet",
  rose: "stroke-rose",
};

const ARC_CHIP: Record<ScanTone, string> = {
  amber: "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  violet: "border-violet/40 bg-violet/10 text-violet",
  rose: "border-rose/40 bg-rose/10 text-rose",
};

/**
 * Same-direction stage: one row of cells, the slow (recorder) and fast (scout) pointers,
 * comparison and copy arcs, and a bracket over the kept prefix.
 */
export function ScanStage({ step, stepKey, problemId }: StageProps<ScanStep>) {
  const n = step.values.length;
  const columns = { gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` };
  const cellFont = { fontSize: `clamp(0.8rem, ${Math.round(42 / n)}cqi, 2rem)` };
  const center = (index: number) => ((index + 0.5) / n) * 100;

  const arc =
    step.fast !== null && step.write
      ? { other: step.write.to, label: step.write.label, tone: "violet" as const, dashed: false }
      : step.fast !== null && step.compare
        ? {
            other: step.compare.with,
            label: step.compare.label,
            tone: step.compare.tone,
            dashed: true,
          }
        : null;
  const arcPoints =
    arc && step.fast !== null
      ? {
          from: center(Math.min(arc.other, step.fast)),
          to: center(Math.max(arc.other, step.fast)),
          mid: (center(arc.other) + center(step.fast)) / 2,
        }
      : null;

  const cellClass = (index: number) => {
    const inPrefix = index <= step.prefixEnd;
    if (step.written === index)
      return "border-violet bg-violet/15 text-violet ring-2 ring-violet/30";
    if (step.fast === index && step.slow === index)
      return "border-violet bg-violet/10 text-violet ring-2 ring-violet/30";
    if (step.fast === index)
      return "border-blue-500 bg-blue-500/10 text-blue-500 ring-2 ring-blue-500/30 dark:text-blue-400";
    if (step.slow === index) return "border-mint bg-mint/10 text-mint ring-2 ring-mint/30";
    if (step.compare?.with === index)
      return "border-amber-500 bg-amber-500/10 text-amber-600 ring-2 ring-amber-500/30 dark:text-amber-400";
    if (inPrefix) return "border-mint/40 bg-mint/5 text-mint/90";
    if (step.done) return "border-dashed border-hairline bg-background text-muted-foreground/50";
    return "border-hairline bg-background text-foreground/75";
  };

  const pointerLabel = (index: number) => {
    const isSlow = step.slow === index;
    const isFast = step.fast === index;
    if (isSlow && isFast)
      return (
        <span className="flex flex-col items-center font-mono text-xs font-bold text-violet">
          slow=fast<span className="text-xs leading-none">▼</span>
        </span>
      );
    if (isSlow)
      return (
        <motion.span
          layoutId={`${problemId}-slow`}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
          className="flex flex-col items-center font-mono text-xs font-bold text-mint"
        >
          slow<span className="text-xs leading-none">▼</span>
        </motion.span>
      );
    if (isFast)
      return (
        <motion.span
          layoutId={`${problemId}-fast`}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
          className="flex flex-col items-center font-mono text-xs font-bold text-blue-500 dark:text-blue-400"
        >
          fast<span className="text-xs leading-none">▼</span>
        </motion.span>
      );
    return null;
  };

  const leftover = step.done && step.prefixEnd < n - 1;

  return (
    <div className="@container relative mx-auto w-full" style={{ maxWidth: `${n * 6}rem` }}>
      <div className="grid" style={columns}>
        {step.values.map((_, index) => (
          <div key={index} className="flex h-9 items-end justify-center">
            {pointerLabel(index)}
          </div>
        ))}
      </div>

      <div className="mt-1 grid items-center" style={{ ...columns, ...cellFont }}>
        {step.values.map((value, index) => (
          <div key={index} className="flex justify-center px-1 sm:px-1.5">
            <div
              className={cn(
                "flex aspect-square w-full max-w-[5.5rem] items-center justify-center rounded-xl border font-mono font-bold transition-all duration-300",
                cellClass(index),
              )}
            >
              <span
                key={`${index}-${value}`}
                className={
                  step.written === index ? "duration-300 animate-in zoom-in-50" : undefined
                }
              >
                {value}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-1.5 grid" style={columns}>
        {step.values.map((_, index) => (
          <span key={index} className="text-center font-mono text-xs text-muted-foreground">
            [{index}]
          </span>
        ))}
      </div>

      {/* Flow layer: a compare or copy arc, otherwise the kept prefix (and leftovers when done) */}
      <div className="relative mt-1 h-12">
        {arc && arcPoints ? (
          <>
            <svg
              key={stepKey}
              viewBox="0 0 100 40"
              preserveAspectRatio="none"
              className="absolute inset-x-0 top-0 h-8 w-full duration-300 animate-in fade-in"
              aria-hidden
            >
              <path
                d={`M ${arcPoints.from} 2 Q ${(arcPoints.from + arcPoints.to) / 2} 46 ${arcPoints.to} 2`}
                fill="none"
                vectorEffect="non-scaling-stroke"
                strokeWidth={2}
                strokeDasharray={arc.dashed ? "5 4" : undefined}
                className={ARC_STROKE[arc.tone]}
              />
            </svg>
            <span
              key={`${stepKey}-label`}
              className={cn(
                "absolute top-5 -translate-x-1/2 whitespace-nowrap rounded-full border px-2.5 py-0.5 font-mono text-xs font-bold duration-300 animate-in fade-in zoom-in-95",
                ARC_CHIP[arc.tone],
              )}
              style={{ left: `${arcPoints.mid}%` }}
            >
              {arc.label}
            </span>
          </>
        ) : (
          <>
            {step.prefixEnd >= 0 ? (
              <div
                className="absolute top-1 transition-all duration-500 ease-out"
                style={{
                  left: "6px",
                  width: `calc(${((step.prefixEnd + 1) / n) * 100}% - 12px)`,
                }}
              >
                <div className="h-2.5 rounded-b-md border-x-2 border-b-2 border-mint" />
                <p className="mt-1 whitespace-nowrap text-center text-xs font-medium text-mint">
                  {step.done ? "✓ " : ""}
                  {step.prefixLabel}
                </p>
              </div>
            ) : null}
            {leftover ? (
              <div
                className="absolute top-1"
                style={{
                  left: `calc(${((step.prefixEnd + 1) / n) * 100}% + 6px)`,
                  width: `calc(${((n - step.prefixEnd - 1) / n) * 100}% - 12px)`,
                }}
              >
                <div className="h-2.5 rounded-b-md border-x-2 border-b-2 border-dashed border-muted-foreground/40" />
                <p className="mt-1 whitespace-nowrap text-center text-xs text-muted-foreground">
                  old values
                </p>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
