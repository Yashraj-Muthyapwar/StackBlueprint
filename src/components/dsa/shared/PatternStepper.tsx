import { useState } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type StepperTone = "left" | "right" | "mid" | "accent";

export type PatternStepperStep = {
  title: string;
  /** Tab and heading label; defaults to "Step N". Use it when steps are not numbered from 1. */
  label?: string;
  /** Cell contents: numbers, characters, or short labels. */
  cells: (string | number)[];
  /** Named pointers drawn above cells, e.g. `{ index: 0, label: "left", tone: "left" }`. */
  pointers: { index: number; label: string; tone: StepperTone }[];
  /** Explanation under the cells; `backticks` render as inline code. */
  note: string;
};

const TONE: Record<StepperTone, { text: string; cell: string }> = {
  left: { text: "text-mint", cell: "border-mint bg-mint/10 text-mint ring-2 ring-mint/30" },
  right: {
    text: "text-blue-500 dark:text-blue-400",
    cell: "border-blue-500 bg-blue-500/10 text-blue-500 ring-2 ring-blue-500/30 dark:text-blue-400",
  },
  mid: {
    text: "text-violet",
    cell: "border-violet bg-violet/10 text-violet ring-2 ring-violet/30",
  },
  accent: {
    text: "text-amber-600 dark:text-amber-400",
    cell: "border-amber-500 bg-amber-500/10 text-amber-600 ring-2 ring-amber-500/30 dark:text-amber-400",
  },
};

function renderInline(text: string) {
  return text.split(/(`[^`]+`)/g).map((part, i) =>
    part.startsWith("`") && part.endsWith("`") ? (
      <code
        key={i}
        className="rounded bg-mint/10 px-1.5 py-0.5 font-mono text-[0.85em] font-medium text-mint"
      >
        {part.slice(1, -1)}
      </code>
    ) : (
      part
    ),
  );
}

/** A stepper of snapshots: tabs per step, the cells with their pointers, and a note. */
export function PatternStepper({ steps }: { steps: PatternStepperStep[] }) {
  const [active, setActive] = useState(0);
  const step = steps[active];
  const n = step.cells.length;
  const columns = { gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` };
  const pointerAt = (index: number) => step.pointers.filter((p) => p.index === index);
  // When several pointers share a cell, the most specific role colours it.
  const TONE_PRIORITY: StepperTone[] = ["accent", "mid", "left", "right"];
  const cellTone = (index: number) =>
    TONE_PRIORITY.find((tone) => pointerAt(index).some((p) => p.tone === tone));

  return (
    <section className="overflow-clip rounded-2xl border border-hairline bg-slate-50 shadow-sm dark:bg-surface">
      <div className="flex flex-wrap gap-2 border-b border-hairline bg-surface-2/40 px-5 py-3">
        {steps.map((item, i) => (
          <button
            key={item.title}
            type="button"
            onClick={() => setActive(i)}
            className={cn(
              "flex h-8 items-center gap-2 rounded-full border px-3 text-xs font-medium transition-colors",
              i === active
                ? "border-mint bg-mint/10 text-mint"
                : "border-hairline bg-background text-muted-foreground hover:text-foreground",
            )}
          >
            <span className="font-semibold">{item.label ?? `Step ${i + 1}`}</span>
            <span className="hidden sm:inline">{item.title}</span>
          </button>
        ))}
      </div>

      <motion.div
        key={active}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="px-5 py-6"
      >
        <p className="text-xs font-semibold text-muted-foreground">
          {step.label ?? `Step ${active + 1}`}
        </p>
        <h3 className="lesson-subsection-title mt-1 font-semibold tracking-tight text-foreground">
          {step.title}
        </h3>

        <div className="mx-auto mt-6 w-full" style={{ maxWidth: `${n * 5.5}rem` }}>
          <div className="grid items-end" style={columns}>
            {step.cells.map((_, index) => {
              const here = pointerAt(index);
              // One pointer reads "left ▼"; several stack as lines above a single arrow.
              return (
                <span
                  key={`ptr-${index}`}
                  className="flex min-h-5 flex-col items-center justify-end leading-tight"
                >
                  {here.map((p) => (
                    <span
                      key={p.label}
                      className={cn(
                        "whitespace-nowrap font-mono text-xs font-bold",
                        TONE[p.tone].text,
                      )}
                    >
                      {p.label}
                      {here.length === 1 ? " ▼" : ""}
                    </span>
                  ))}
                  {here.length > 1 ? (
                    <span
                      className={cn(
                        "font-mono text-xs leading-none",
                        TONE[cellTone(index) ?? here[0].tone].text,
                      )}
                    >
                      ▼
                    </span>
                  ) : null}
                </span>
              );
            })}
          </div>
          <div className="mt-1 grid" style={columns}>
            {step.cells.map((value, index) => {
              const tone = cellTone(index);
              return (
                <div key={`cell-${index}`} className="flex justify-center px-1 sm:px-1.5">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.04 }}
                    className={cn(
                      "flex aspect-square w-full max-w-20 items-center justify-center rounded-xl border font-mono text-lg font-bold sm:text-2xl",
                      tone ? TONE[tone].cell : "border-hairline bg-background text-foreground/80",
                    )}
                  >
                    {value}
                  </motion.div>
                </div>
              );
            })}
          </div>
          <div className="mt-1.5 grid" style={columns}>
            {step.cells.map((_, index) => (
              <span
                key={`idx-${index}`}
                className="text-center font-mono text-xs text-muted-foreground"
              >
                {index}
              </span>
            ))}
          </div>
        </div>

        <p className="lesson-prose mt-6 text-center text-muted-foreground">
          {renderInline(step.note)}
        </p>
      </motion.div>

      <div className="flex items-center justify-between border-t border-hairline bg-surface-2/30 px-5 py-3">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setActive((i) => Math.max(0, i - 1))}
          disabled={active === 0}
        >
          <ChevronLeft className="size-4" /> Previous
        </Button>
        <div className="flex gap-1.5">
          {steps.map((item, i) => (
            <span
              key={item.title}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === active ? "w-6 bg-mint" : "w-1.5 bg-hairline",
              )}
            />
          ))}
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setActive((i) => Math.min(steps.length - 1, i + 1))}
          disabled={active === steps.length - 1}
        >
          Next <ChevronRight className="size-4" />
        </Button>
      </div>
    </section>
  );
}
