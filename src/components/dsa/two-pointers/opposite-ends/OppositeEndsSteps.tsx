import { useState } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type StepCard = { title: string; array: number[]; left: number; right: number; note: string };

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

/** A small stepper of array snapshots, each with the left and right pointers marked. */
export function OppositeEndsSteps({ steps }: { steps: StepCard[] }) {
  const [active, setActive] = useState(0);
  const step = steps[active];

  return (
    <section className="overflow-clip rounded-2xl border border-hairline bg-slate-50 shadow-sm dark:bg-surface">
      <div className="flex flex-wrap gap-2 border-b border-hairline bg-surface-2/40 px-5 py-3">
        {steps.map((item, i) => (
          <button
            key={item.title}
            type="button"
            onClick={() => setActive(i)}
            className={cn(
              "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              i === active
                ? "border-mint bg-mint/10 text-mint"
                : "border-hairline bg-background text-muted-foreground hover:text-foreground",
            )}
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.14em]">Step {i + 1}</span>
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
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Step {active + 1}
        </p>
        <h3 className="lesson-subsection-title mt-1 font-semibold tracking-tight text-foreground">
          {step.title}
        </h3>

        <div className="mt-6 overflow-x-auto pb-1">
          <div className="mx-auto grid w-max grid-cols-5 gap-3 sm:gap-4">
            {step.array.map((_, index) => (
              <span
                key={`ptr-${index}`}
                className={cn(
                  "h-5 text-center font-mono text-[11px] font-bold",
                  index === step.left && "text-mint",
                  index === step.right && "text-blue-500 dark:text-blue-400",
                )}
              >
                {index === step.left ? "left ▼" : index === step.right ? "right ▼" : ""}
              </span>
            ))}
            {step.array.map((value, index) => (
              <motion.div
                key={`cell-${index}`}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.04 }}
                className={cn(
                  "flex size-16 items-center justify-center rounded-xl border font-mono text-xl font-bold sm:size-20 sm:text-2xl",
                  index === step.left
                    ? "border-mint bg-mint/10 text-mint ring-2 ring-mint/30"
                    : index === step.right
                      ? "border-blue-500 bg-blue-500/10 text-blue-500 ring-2 ring-blue-500/30 dark:text-blue-400"
                      : "border-hairline bg-background text-foreground/80",
                )}
              >
                {value}
              </motion.div>
            ))}
            {step.array.map((_, index) => (
              <span
                key={`idx-${index}`}
                className="text-center font-mono text-[11px] text-muted-foreground"
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
