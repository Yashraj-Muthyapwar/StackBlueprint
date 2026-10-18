import { useState } from "react";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const VISITORS = [12, 25, 12];

type Frame = {
  visitor: number;
  /** Which of the guard's two steps is happening: 1 check, 2 record. */
  phase: 1 | 2;
  notebook: number[];
  repeat: boolean;
  text: string;
};

/** Each visitor gets a check frame, then a record frame unless the ID was already written down. */
function buildFrames(): Frame[] {
  const frames: Frame[] = [];
  const notebook: number[] = [];
  VISITORS.forEach((id, visitor) => {
    const repeat = notebook.includes(id);
    frames.push({
      visitor,
      phase: 1,
      notebook: [...notebook],
      repeat,
      text: repeat
        ? `Visitor ${visitor + 1} shows ID ${id}. The guard checks the notebook and finds ${id} already recorded. This visitor has appeared before.`
        : `Visitor ${visitor + 1} shows ID ${id}. The guard checks the notebook. ${id} is not recorded yet.`,
    });
    if (!repeat) {
      notebook.push(id);
      frames.push({
        visitor,
        phase: 2,
        notebook: [...notebook],
        repeat: false,
        text: `Now the guard records ${id} for future checks.`,
      });
    }
  });
  return frames;
}

const FRAMES = buildFrames();

/** The guard's two steps, check then record, shown one visitor at a time. */
export function GuardNotebook() {
  const [index, setIndex] = useState(0);
  const frame = FRAMES[index];
  const go = (next: number) => setIndex(Math.max(0, Math.min(next, FRAMES.length - 1)));

  return (
    <figure className="overflow-clip rounded-2xl border border-hairline bg-slate-50 shadow-sm dark:bg-surface">
      <div className="px-4 pb-4 pt-5 sm:px-6">
        <div className="flex gap-2">
          {VISITORS.map((id, visitor) => (
            <span
              key={visitor}
              className={cn(
                "flex size-12 items-center justify-center rounded-lg border-2 font-mono text-sm font-bold transition-colors duration-300",
                visitor === frame.visitor &&
                  !frame.repeat &&
                  "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400",
                visitor === frame.visitor && frame.repeat && "border-rose bg-rose/10 text-rose",
                visitor < frame.visitor && "border-hairline bg-background text-muted-foreground/60",
                visitor > frame.visitor && "border-hairline bg-background text-foreground/85",
              )}
            >
              {id}
            </span>
          ))}
          <span className="ml-1 self-center text-xs text-muted-foreground">arriving in order</span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1.2fr]">
          <div className="space-y-2">
            {[
              { n: 1, label: "Check whether the ID is already recorded" },
              { n: 2, label: "If not, record the ID" },
            ].map((step) => (
              <div
                key={step.n}
                className={cn(
                  "flex items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors duration-300",
                  frame.phase === step.n
                    ? "border-mint bg-mint/10 text-foreground"
                    : "border-hairline bg-background/60 text-muted-foreground",
                )}
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-current font-mono text-xs font-bold">
                  {step.n}
                </span>
                {step.label}
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-hairline bg-background/60 p-3">
            <p className="text-sm font-semibold">The guard's notebook</p>
            <p className="text-xs text-muted-foreground">A Python set</p>
            <div className="mt-2 flex min-h-10 flex-wrap gap-1.5">
              {frame.notebook.length === 0 ? (
                <span className="text-xs text-muted-foreground/70">Empty</span>
              ) : (
                frame.notebook.map((id) => (
                  <span
                    key={id}
                    className={cn(
                      "rounded-md border px-2.5 py-1 font-mono text-sm font-bold",
                      frame.repeat && frame.phase === 1 && id === VISITORS[frame.visitor]
                        ? "border-rose bg-rose/10 text-rose"
                        : "border-mint/40 bg-mint/10 text-mint",
                    )}
                  >
                    {id}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        <p
          key={index}
          className="lesson-supporting mt-4 min-h-[3.5rem] text-foreground/90 duration-300 animate-in fade-in"
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
            disabled={index === FRAMES.length - 1}
          >
            Next <ChevronRight className="size-4" />
          </Button>
        </div>
        <Button
          type="button"
          size="icon"
          variant="outline"
          className="size-8"
          onClick={() => go(0)}
          aria-label="Reset the scene"
        >
          <RotateCcw className="size-4" />
        </Button>
      </div>
    </figure>
  );
}
