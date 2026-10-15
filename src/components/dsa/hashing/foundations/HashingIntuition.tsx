import { useState } from "react";

import { cn } from "@/lib/utils";

import { SlotGrid } from "./SlotGrid";
import { slotOf, SLOTS, STUDENT_IDS } from "./hash-slots";

const CHOICES = [...STUDENT_IDS, 777];

/**
 * Side by side: a linear search that checks the array one student at a time, and the simplified
 * hash table that jumps to `id % 10`. Pick an id to see how many checks each approach makes.
 */
export function HashingIntuition() {
  const [target, setTarget] = useState(412);
  const index = STUDENT_IDS.indexOf(target);
  const linearChecks = index === -1 ? STUDENT_IDS.length : index + 1;
  const slot = slotOf(target);
  const present = SLOTS[slot] === target;

  return (
    <figure className="overflow-clip rounded-2xl border border-hairline bg-slate-50 shadow-sm dark:bg-surface">
      <div className="flex flex-wrap items-center justify-center gap-2 border-b border-hairline px-4 py-3">
        <span className="text-xs font-semibold text-muted-foreground">Look for student ID</span>
        {CHOICES.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setTarget(id)}
            aria-pressed={id === target}
            className={cn(
              "rounded-full border px-3 py-1 font-mono text-xs font-semibold transition-colors",
              id === target
                ? "border-mint bg-mint/15 text-mint"
                : "border-hairline bg-background text-foreground/80 hover:border-mint/40",
            )}
          >
            {id}
            {id === 777 ? " (missing)" : ""}
          </button>
        ))}
      </div>

      <div className="grid gap-px bg-hairline md:grid-cols-2">
        <div className="bg-slate-50 p-4 dark:bg-surface sm:p-5">
          <p className="text-sm font-semibold">Linear search</p>
          <p className="lesson-supporting mt-1 text-foreground/80">
            Inspect each student ID in turn until you find the right one.
          </p>
          <div className="mt-4 grid grid-cols-5 gap-1.5 sm:gap-2">
            {STUDENT_IDS.map((id, i) => {
              const checked = index === -1 || i <= index;
              const hit = i === index;
              return (
                <div
                  key={id}
                  className={cn(
                    "flex h-12 items-center justify-center rounded-lg border-2 font-mono text-sm font-bold transition-colors duration-300",
                    hit && "border-mint bg-mint/15 text-mint",
                    checked &&
                      !hit &&
                      "border-amber-500/60 bg-amber-500/10 text-amber-600 dark:text-amber-400",
                    !checked && "border-hairline bg-background text-muted-foreground/50",
                  )}
                >
                  {id}
                </div>
              );
            })}
          </div>
          <p className="mt-4 rounded-lg border border-hairline bg-background/70 px-3 py-2 font-mono text-xs">
            {linearChecks} {linearChecks === 1 ? "check" : "checks"}
            {index === -1 ? ", then the ID is reported missing" : ""}
          </p>
        </div>

        <div className="bg-slate-50 p-4 dark:bg-surface sm:p-5">
          <p className="text-sm font-semibold">Hashing</p>
          <p className="lesson-supporting mt-1 text-foreground/80">
            Calculate a location from the ID and look only there.
          </p>
          <div className="mt-4">
            <SlotGrid target={slot} matched={present} />
          </div>
          <p className="mt-4 rounded-lg border border-hairline bg-background/70 px-3 py-2 font-mono text-xs">
            {target} % 10 = {slot}, so look in slot {slot}:{" "}
            {present ? "found after 1 check" : "empty, so the ID is missing after 1 check"}
          </p>
        </div>
      </div>
    </figure>
  );
}
