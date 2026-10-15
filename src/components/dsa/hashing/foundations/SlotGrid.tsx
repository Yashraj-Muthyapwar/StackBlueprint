import { cn } from "@/lib/utils";

import { SLOTS } from "./hash-slots";

/** The ten-slot teaching table. `target` lights one slot, `matched` turns it green. */
export function SlotGrid({
  target,
  matched,
  showTarget = true,
}: {
  target: number | null;
  matched?: boolean;
  showTarget?: boolean;
}) {
  return (
    <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
      {SLOTS.map((id, slot) => {
        const active = showTarget && target === slot;
        return (
          <div key={slot} className="text-center">
            <div
              className={cn(
                "flex h-12 items-center justify-center rounded-lg border-2 font-mono text-sm font-bold transition-colors duration-300",
                id === null && "border-dashed border-hairline text-muted-foreground/40",
                id !== null && "border-hairline bg-background text-foreground/85",
                active &&
                  !matched &&
                  "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400",
                active && matched && "border-mint bg-mint/15 text-mint",
              )}
            >
              {id ?? "empty"}
            </div>
            <span className="mt-1 block font-mono text-[11px] text-muted-foreground">[{slot}]</span>
          </div>
        );
      })}
    </div>
  );
}
