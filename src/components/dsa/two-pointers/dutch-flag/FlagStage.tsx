import { motion } from "motion/react";

import type { StageProps } from "@/components/dsa/shared/pattern-canvas-types";
import { cn } from "@/lib/utils";

import type { FlagStep } from "./flag-step";

type Region = "zeros" | "ones" | "unknown" | "twos";

const CELL: Record<Region, string> = {
  zeros: "border-mint/40 bg-mint/10 text-mint/90",
  ones: "border-slate-400/50 bg-slate-400/15 text-foreground/80",
  unknown: "border-hairline bg-background text-foreground/75",
  twos: "border-blue-500/40 bg-blue-500/10 text-blue-500 dark:text-blue-400",
};

const BRACKET: Record<Region, { border: string; text: string }> = {
  zeros: { border: "border-mint", text: "text-mint" },
  ones: { border: "border-slate-400", text: "text-muted-foreground" },
  unknown: { border: "border-dashed border-amber-500", text: "text-amber-600 dark:text-amber-400" },
  twos: { border: "border-blue-500", text: "text-blue-500 dark:text-blue-400" },
};

/**
 * Dutch National Flag stage: one row of cells with the low / mid / high pointers stacked
 * above them, a swap arc, and a bracket under each of the four regions.
 */
export function FlagStage({ step, stepKey, problemId }: StageProps<FlagStep>) {
  const { values, low, mid, high } = step;
  const n = values.length;
  const columns = { gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` };
  const cellFont = { fontSize: `clamp(0.8rem, ${Math.round(42 / n)}cqi, 2rem)` };
  const center = (index: number) => ((index + 0.5) / n) * 100;

  const regionOf = (index: number): Region =>
    index < low ? "zeros" : index < mid ? "ones" : index <= high ? "unknown" : "twos";

  // Brackets: [start, end] inclusive, empty regions are skipped.
  const regions: { id: Region; from: number; to: number }[] = [
    { id: "zeros", from: 0, to: low - 1 },
    { id: "ones", from: low, to: mid - 1 },
    { id: "unknown", from: mid, to: high },
    { id: "twos", from: high + 1, to: n - 1 },
  ]
    .map((region) => ({
      ...region,
      from: Math.max(0, region.from),
      to: Math.min(n - 1, region.to),
    }))
    .filter((region) => region.to >= region.from) as { id: Region; from: number; to: number }[];

  const label = (id: Region, cells: number) => {
    if (id === "unknown") return cells >= 2 ? "unknown" : "?";
    const { short, long } = step.regionLabels[id];
    return cells >= 2 ? long : short;
  };

  const arc =
    step.swapped && step.swapped[0] !== step.swapped[1]
      ? {
          from: center(Math.min(...step.swapped)),
          to: center(Math.max(...step.swapped)),
          label: step.swapLabel ?? "swap",
        }
      : null;

  const pointers = (index: number) =>
    [
      low === index && { id: "low", text: "text-mint" },
      mid === index && { id: "mid", text: "text-amber-600 dark:text-amber-400" },
      high === index && { id: "high", text: "text-blue-500 dark:text-blue-400" },
    ].filter(Boolean) as { id: "low" | "mid" | "high"; text: string }[];

  const cellClass = (index: number) => {
    if (step.swapped?.includes(index))
      return "border-violet bg-violet/15 text-violet ring-2 ring-violet/30";
    if (index === mid && mid <= high)
      return "border-amber-500 bg-amber-500/10 text-amber-600 ring-2 ring-amber-500/30 dark:text-amber-400";
    return CELL[regionOf(index)];
  };

  return (
    <div className="@container relative mx-auto w-full" style={{ maxWidth: `${n * 6}rem` }}>
      {/* Pointer labels: up to three share a cell, stacked above one arrow */}
      <div className="grid items-end" style={columns}>
        {values.map((_, index) => {
          const here = pointers(index);
          return (
            <div
              key={index}
              className="flex h-[3.9rem] flex-col items-center justify-end font-mono text-xs font-bold leading-tight"
            >
              {here.map((pointer) => (
                <motion.span
                  key={pointer.id}
                  layoutId={`${problemId}-${pointer.id}`}
                  transition={{ type: "spring", stiffness: 260, damping: 26 }}
                  className={pointer.text}
                >
                  {pointer.id}
                </motion.span>
              ))}
              {here.length > 0 ? (
                <span className={cn("leading-none", here[here.length - 1].text)} aria-hidden>
                  ▼
                </span>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="mt-1 grid h-[5.5rem] items-center" style={{ ...columns, ...cellFont }}>
        {values.map((value, index) => (
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
                  step.swapped?.includes(index) ? "duration-300 animate-in zoom-in-50" : undefined
                }
              >
                {value}
              </span>
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

      {/* Flow layer: a swap arc, otherwise a bracket under each region */}
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
                d={`M ${arc.from} 2 Q ${(arc.from + arc.to) / 2} 46 ${arc.to} 2`}
                fill="none"
                vectorEffect="non-scaling-stroke"
                strokeWidth={2}
                className="stroke-violet"
              />
            </svg>
            <span
              key={`${stepKey}-label`}
              className="absolute top-5 -translate-x-1/2 whitespace-nowrap rounded-full border border-violet/40 bg-violet/10 px-2.5 py-0.5 font-mono text-xs font-bold text-violet duration-300 animate-in fade-in zoom-in-95"
              style={{ left: `${(arc.from + arc.to) / 2}%` }}
            >
              {arc.label}
            </span>
          </>
        ) : (
          regions.map((region) => {
            const cells = region.to - region.from + 1;
            const style = BRACKET[region.id];
            return (
              <div
                key={region.id}
                className="absolute top-1 transition-all duration-500 ease-out"
                style={{
                  left: `calc(${(region.from / n) * 100}% + 4px)`,
                  width: `calc(${(cells / n) * 100}% - 8px)`,
                }}
              >
                <div className={cn("h-2.5 rounded-b-md border-x-2 border-b-2", style.border)} />
                <p
                  className={cn(
                    "mt-1 whitespace-nowrap text-center text-xs font-medium",
                    style.text,
                  )}
                >
                  {label(region.id, cells)}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
