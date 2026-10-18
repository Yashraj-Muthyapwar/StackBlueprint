import type { StageProps } from "@/components/dsa/shared/pattern-canvas-types";
import { cn } from "@/lib/utils";

import type { SeenStep } from "./seen-step";

/**
 * Seen-so-far stage: the list with the value being read, the set of values remembered so far,
 * and the result once the function returns.
 */
export function SeenStage({ step, stepKey }: StageProps<SeenStep>) {
  const { values, index, seen } = step;
  const n = Math.max(values.length, 1);
  const columns = { gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` };
  const cellFont = { fontSize: `clamp(0.8rem, ${Math.round(40 / n)}cqi, 1.75rem)` };

  const cellClass = (i: number) => {
    if (i === index && step.repeat) return "border-rose bg-rose/10 text-rose ring-2 ring-rose/30";
    if (i === index)
      return "border-amber-500 bg-amber-500/10 text-amber-600 ring-2 ring-amber-500/30 dark:text-amber-400";
    if (index !== null && i < index)
      return "border-hairline bg-background text-muted-foreground/50";
    if (index === null && step.result !== undefined && i < values.length)
      return "border-hairline bg-background text-muted-foreground/60";
    return "border-hairline bg-background text-foreground/75";
  };

  return (
    <div
      className="@container relative mx-auto w-full"
      style={{ maxWidth: `${n * 5.5}rem`, minWidth: "min(100%, 16rem)" }}
    >
      <div className="grid h-5 items-end" style={columns}>
        {values.map((_, i) => (
          <span
            key={i}
            className="text-center font-mono text-xs font-bold leading-none text-amber-600 dark:text-amber-400"
          >
            {i === index ? "value ▼" : ""}
          </span>
        ))}
      </div>
      <div className="mt-1 grid h-[4.25rem] items-center" style={{ ...columns, ...cellFont }}>
        {values.length === 0 ? (
          <div className="col-span-full rounded-xl border border-dashed border-hairline py-4 text-center text-xs text-muted-foreground">
            The list is empty
          </div>
        ) : (
          values.map((value, i) => (
            <div key={i} className="flex justify-center px-0.5 sm:px-1">
              <div
                className={cn(
                  "flex aspect-square w-full max-w-[4.25rem] items-center justify-center rounded-xl border font-mono font-bold transition-all duration-300",
                  cellClass(i),
                )}
              >
                {value}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4 rounded-xl border border-hairline bg-background/60 px-3 py-2">
        <p className="text-xs font-semibold text-muted-foreground">seen (a set)</p>
        <div className="mt-1.5 flex h-[4.1rem] flex-wrap content-start gap-1.5 overflow-y-auto">
          {seen.length === 0 ? (
            <span className="text-xs text-muted-foreground/70">Empty</span>
          ) : (
            seen.map((value) => {
              const hit = step.repeat && index !== null && values[index] === value;
              return (
                <span
                  key={value}
                  className={cn(
                    "h-fit whitespace-nowrap rounded-md border px-2.5 py-1 font-mono text-sm font-bold",
                    hit
                      ? "border-rose bg-rose/10 text-rose"
                      : "border-mint/40 bg-mint/10 text-mint",
                    step.added === value && "duration-300 animate-in zoom-in-75",
                  )}
                >
                  {value}
                </span>
              );
            })
          )}
        </div>
      </div>

      <div className="mt-2 flex h-8 items-center justify-center">
        {step.result !== undefined ? (
          <span
            key={`${stepKey}-result`}
            className={cn(
              "whitespace-nowrap rounded-full border px-3 py-1 font-mono text-xs font-bold duration-300 animate-in fade-in zoom-in-95",
              step.result
                ? "border-rose/40 bg-rose/10 text-rose"
                : "border-mint/40 bg-mint/10 text-mint",
            )}
          >
            {step.result ? "return True: a repeat was found" : "return False: no repeats"}
          </span>
        ) : null}
      </div>
    </div>
  );
}
