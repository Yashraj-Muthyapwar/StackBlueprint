import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { SlotGrid } from "./SlotGrid";
import { slotOf } from "./hash-slots";

const KEY = 412;

export type HashingFlowStep = { title: string; text: string };

/** The four hashing steps for the key 412, with the slot table showing what each step does. */
export function HashingFlow({ steps }: { steps: HashingFlowStep[] }) {
  const [active, setActive] = useState(0);
  const slot = slotOf(KEY);
  const detail = [
    `The key is ${KEY}.`,
    `${KEY} % 10 = ${slot}`,
    `The hash value ${slot} selects slot ${slot}.`,
    `Slot ${slot} holds ${KEY}, which matches the key.`,
  ][active];

  return (
    <figure className="overflow-clip rounded-2xl border border-hairline bg-slate-50 shadow-sm dark:bg-surface">
      <div className="flex flex-wrap gap-2 border-b border-hairline px-4 py-3">
        {steps.map((step, i) => (
          <button
            key={step.title}
            type="button"
            onClick={() => setActive(i)}
            aria-pressed={i === active}
            className={cn(
              "flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
              i === active
                ? "border-mint bg-mint/15 text-mint"
                : "border-hairline bg-background text-foreground/80 hover:border-mint/40",
            )}
          >
            <span className="font-mono">{i + 1}</span>
            {step.title}
          </button>
        ))}
      </div>
      <div className="grid gap-5 p-4 sm:p-5 md:grid-cols-[1fr_1.1fr] md:items-center">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Step {active + 1} of {steps.length}
          </p>
          <p
            key={active}
            className="lesson-supporting mt-2 text-foreground/90 duration-300 animate-in fade-in"
          >
            {steps[active].text
              .split("**")
              .map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : part))}
          </p>
          <p className="mt-3 rounded-lg border border-hairline bg-background/70 px-3 py-2 font-mono text-xs">
            {detail}
          </p>
        </div>
        <SlotGrid target={slot} matched={active === 3} showTarget={active >= 2} />
      </div>
      <div className="flex items-center justify-between border-t border-hairline bg-surface-2/30 px-4 py-3">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setActive((a) => Math.max(0, a - 1))}
          disabled={active === 0}
        >
          <ChevronLeft className="size-4" /> Previous
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={() => setActive((a) => Math.min(steps.length - 1, a + 1))}
          disabled={active === steps.length - 1}
        >
          Next <ChevronRight className="size-4" />
        </Button>
      </div>
    </figure>
  );
}
