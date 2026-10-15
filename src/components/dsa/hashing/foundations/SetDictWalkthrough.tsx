import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NUMBERS = [4, 7, 4, 9, 7];

type Frame = {
  processed: number | null;
  unique: number[];
  frequency: [number, number][];
  /** The key whose count just changed, drawn highlighted. */
  touched: number | null;
  text: string;
};

function buildFrames(): Frame[] {
  const frames: Frame[] = [
    {
      processed: null,
      unique: [],
      frequency: [],
      touched: null,
      text: "Both data structures start empty.",
    },
  ];
  const unique: number[] = [];
  const frequency = new Map<number, number>();
  NUMBERS.forEach((num, index) => {
    const seen = frequency.has(num);
    if (!unique.includes(num)) unique.push(num);
    frequency.set(num, (frequency.get(num) ?? 0) + 1);
    frames.push({
      processed: index,
      unique: [...unique],
      frequency: [...frequency.entries()],
      touched: num,
      text: seen
        ? `${num} is already in frequency, so its count becomes ${frequency.get(num)}. The set already holds ${num}, so it does not change.`
        : `${num} is new. The set adds it, and frequency stores ${num} with a count of 1.`,
    });
  });
  return frames;
}

/** Steps through the lesson's loop and shows the set and the dictionary side by side. */
export function SetDictWalkthrough() {
  const frames = useMemo(buildFrames, []);
  const [index, setIndex] = useState(0);
  const frame = frames[index];
  const go = (next: number) => setIndex(Math.max(0, Math.min(next, frames.length - 1)));

  return (
    <figure className="overflow-clip rounded-2xl border border-hairline bg-slate-50 shadow-sm dark:bg-surface">
      <div className="px-4 pb-4 pt-5 sm:px-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Iteration {index} of {NUMBERS.length}
        </p>
        <p className="mt-1 font-mono text-xs text-muted-foreground">
          Processing:{" "}
          <span className="font-bold text-foreground">
            {frame.processed === null ? "none yet" : NUMBERS[frame.processed]}
          </span>
        </p>

        <div className="mt-3 flex gap-2">
          {NUMBERS.map((value, i) => (
            <span
              key={i}
              className={cn(
                "flex size-11 items-center justify-center rounded-lg border-2 font-mono text-sm font-bold transition-colors duration-300",
                i === frame.processed &&
                  "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400",
                frame.processed !== null &&
                  i < frame.processed &&
                  "border-hairline bg-background text-muted-foreground/60",
                (frame.processed === null || i > frame.processed) &&
                  "border-hairline bg-background text-foreground/85",
              )}
            >
              {value}
            </span>
          ))}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-hairline bg-background/60 p-3">
            <p className="text-sm font-semibold">Set</p>
            <p className="text-xs text-muted-foreground">Unique elements</p>
            <div className="mt-2 flex min-h-10 flex-wrap gap-1.5">
              {frame.unique.length === 0 ? (
                <span className="text-xs text-muted-foreground/70">Empty</span>
              ) : (
                frame.unique.map((value) => (
                  <span
                    key={value}
                    className="rounded-md border border-mint/40 bg-mint/10 px-2.5 py-1 font-mono text-sm font-bold text-mint"
                  >
                    {value}
                  </span>
                ))
              )}
            </div>
          </div>
          <div className="rounded-xl border border-hairline bg-background/60 p-3">
            <p className="text-sm font-semibold">Dictionary</p>
            <p className="text-xs text-muted-foreground">Number → Count</p>
            <div className="mt-2 min-h-10 space-y-1">
              {frame.frequency.length === 0 ? (
                <span className="text-xs text-muted-foreground/70">Empty</span>
              ) : (
                frame.frequency.map(([key, count]) => (
                  <div
                    key={key}
                    className={cn(
                      "flex items-center justify-between rounded-md border px-2.5 py-1 font-mono text-sm transition-colors duration-300",
                      key === frame.touched
                        ? "border-mint bg-mint/15 text-mint"
                        : "border-hairline bg-background text-foreground/80",
                    )}
                  >
                    <span className="font-bold">{key}</span>
                    <span>→</span>
                    <span className="font-bold">{count}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <p
          key={index}
          className="lesson-supporting mt-4 min-h-[3rem] text-foreground/90 duration-300 animate-in fade-in"
        >
          {frame.text}
        </p>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-hairline bg-surface-2/30 px-4 py-3">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => go(index - 1)}
            disabled={index === 0}
          >
            <ChevronLeft className="size-4" /> Previous
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => go(index + 1)}
            disabled={index === frames.length - 1}
          >
            Next step <ChevronRight className="size-4" />
          </Button>
        </div>
        <Button
          type="button"
          size="icon"
          variant="outline"
          className="size-8"
          onClick={() => go(0)}
          aria-label="Reset the walkthrough"
        >
          <RotateCcw className="size-4" />
        </Button>
      </div>
    </figure>
  );
}
