import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type FlagGroup = { value: number; title: string };

/** The flags in the lesson's example array, in order. */
const FLAGS = [2, 0, 2, 1, 1, 0];

/** Real flag colours: red, white and blue. */
const FLAG_STYLE: Record<number, string> = {
  0: "border-rose/50 bg-rose/10 text-rose",
  1: "border-slate-400/60 bg-slate-400/15 text-foreground/80",
  2: "border-blue-500/50 bg-blue-500/10 text-blue-500 dark:text-blue-400",
};

const GROUP_WORD = ["first", "middle", "last"];

/**
 * Three group bins with the flags waiting above them. Each flag is looked at once and dropped
 * into the bin of its value, which is the idea the three pointers carry out in place.
 */
export function DutchFlagIntuition({ groups }: { groups: FlagGroup[] }) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const finished = step === FLAGS.length;
  const current = finished ? null : FLAGS[step];
  const placed = FLAGS.slice(0, step);

  useEffect(() => {
    if (!playing) return;
    if (finished) {
      setPlaying(false);
      return;
    }
    const timer = setTimeout(() => setStep((s) => s + 1), 1300);
    return () => clearTimeout(timer);
  }, [playing, step, finished]);

  const go = (index: number) => {
    setPlaying(false);
    setStep(Math.max(0, Math.min(index, FLAGS.length)));
  };

  const text =
    current === null
      ? `Every flag is in its group: ${[...FLAGS].sort().join(", ")}. The algorithm does the same job inside the original array, with no second array.`
      : `Flag ${step + 1} shows ${current}, so it goes to the ${GROUP_WORD[current]} group.`;

  return (
    <figure className="overflow-clip rounded-2xl border border-hairline bg-slate-50 shadow-sm dark:bg-surface">
      <div className="px-4 pb-4 pt-5 sm:px-8">
        {/* Flags waiting to be classified */}
        <p className="text-center text-xs font-semibold text-muted-foreground">The array</p>
        <div className="mx-auto mt-2 grid max-w-md grid-cols-6 gap-1.5 sm:gap-2">
          {FLAGS.map((value, index) => {
            const done = index < step;
            const active = index === step;
            return (
              <div
                key={index}
                className={cn(
                  "flex aspect-square items-center justify-center rounded-xl border-2 font-mono text-lg font-bold transition-all duration-300",
                  done
                    ? "border-dashed border-hairline bg-transparent text-transparent"
                    : FLAG_STYLE[value],
                  active && "-translate-y-1 ring-2 ring-amber-500/50",
                )}
              >
                {value}
              </div>
            );
          })}
        </div>

        {/* The three groups */}
        <div className="mx-auto mt-5 grid max-w-xl grid-cols-3 gap-2 sm:gap-3">
          {groups.map((group) => {
            const inside = placed.filter((value) => value === group.value);
            const receiving = current === group.value;
            return (
              <div
                key={group.value}
                className={cn(
                  "rounded-xl border p-2.5 transition-colors duration-300 sm:p-3",
                  receiving
                    ? "border-amber-500/60 bg-amber-500/5"
                    : "border-hairline bg-background/70",
                )}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-lg border font-mono text-sm font-bold",
                      FLAG_STYLE[group.value],
                    )}
                  >
                    {group.value}
                  </span>
                  <span className="min-w-0 text-xs font-semibold leading-tight text-foreground sm:text-sm">
                    {group.title}
                  </span>
                </div>
                <div className="mt-2.5 flex min-h-9 flex-wrap gap-1">
                  {inside.map((value, i) => (
                    <span
                      key={i}
                      className={cn(
                        "flex size-8 items-center justify-center rounded-lg border font-mono text-sm font-bold duration-300 animate-in zoom-in-50",
                        FLAG_STYLE[value],
                      )}
                    >
                      {value}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <p
          key={step}
          className="lesson-supporting mx-auto mt-5 min-h-12 max-w-xl text-center text-foreground/90 duration-300 animate-in fade-in"
        >
          {text}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-hairline bg-surface-2/30 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            onClick={() => {
              if (finished) setStep(0);
              setPlaying((current) => (finished ? true : !current));
            }}
            className="min-w-28"
          >
            {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
            {playing ? "Pause" : finished ? "Replay" : "Play"}
          </Button>
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="size-8"
            onClick={() => go(step - 1)}
            disabled={step === 0}
            aria-label="Previous flag"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="size-8"
            onClick={() => go(step + 1)}
            disabled={finished}
            aria-label="Next flag"
          >
            <ChevronRight className="size-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="size-8"
            onClick={() => go(0)}
            aria-label="Reset the flags"
          >
            <RotateCcw className="size-4" />
          </Button>
        </div>
        <div className="flex gap-1.5">
          {Array.from({ length: FLAGS.length + 1 }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => go(i)}
              aria-label={`Moment ${i + 1}`}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === step ? "w-6 bg-mint" : "w-1.5 bg-hairline hover:bg-muted-foreground/40",
              )}
            />
          ))}
        </div>
      </div>
    </figure>
  );
}
