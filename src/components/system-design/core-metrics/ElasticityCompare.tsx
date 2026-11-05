import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/*
 * The same day of traffic handled two ways. Scaling permanently keeps five servers running all
 * day. Elasticity adds servers for the peak and removes them when demand falls, so capacity follows
 * demand. Each server handles 1,000 RPS.
 */

const PER_SERVER = 1000;
const SLOTS = [
  { name: "Morning", rps: 1000 },
  { name: "Noon", rps: 1000 },
  { name: "Afternoon", rps: 2000 },
  { name: "Sale starts", rps: 4000 },
  { name: "Peak", rps: 5000 },
  { name: "Winding down", rps: 3000 },
  { name: "Evening", rps: 1500 },
  { name: "Night", rps: 1000 },
];
const FIXED = 5;
const ROWS = 5;

const needed = (rps: number) => Math.ceil(rps / PER_SERVER);

export function ElasticityCompare() {
  const [elastic, setElastic] = useState(true);
  const running = SLOTS.map((s) => (elastic ? needed(s.rps) : FIXED));
  const total = running.reduce((a, b) => a + b, 0);
  const asNeeded = SLOTS.reduce((a, s) => a + needed(s.rps), 0);

  return (
    <section
      aria-label="The same day of traffic handled by five permanent servers or by servers that are added and removed as demand changes"
      className="@container relative overflow-clip rounded-2xl border border-hairline bg-slate-50 shadow-sm dark:bg-surface"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline bg-surface-2/40 px-4 py-3 sm:px-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          One day of traffic, 1,000 RPS per server
        </p>
        <div role="group" aria-label="How capacity is added" className="flex gap-1.5">
          <Button
            type="button"
            size="sm"
            variant={!elastic ? "default" : "outline"}
            aria-pressed={!elastic}
            className="h-7 px-2.5 text-xs"
            onClick={() => setElastic(false)}
          >
            Scale permanently to 5
          </Button>
          <Button
            type="button"
            size="sm"
            variant={elastic ? "default" : "outline"}
            aria-pressed={elastic}
            className="h-7 px-2.5 text-xs"
            onClick={() => setElastic(true)}
          >
            Elastic
          </Button>
        </div>
      </div>

      <div className="px-4 pt-4 sm:px-6">
        <ul className="grid grid-cols-8 gap-1.5 sm:gap-3">
          {SLOTS.map((slot, i) => {
            const need = needed(slot.rps);
            return (
              <li
                key={slot.name}
                aria-label={`${slot.name}: ${slot.rps} requests per second, ${running[i]} servers running`}
                className="min-w-0"
              >
                <div className="flex h-36 flex-col-reverse gap-1">
                  {Array.from({ length: ROWS }, (_, row) => {
                    const on = row < running[i];
                    const used = row < need;
                    return (
                      <div
                        key={row}
                        className={cn(
                          "flex-1 rounded-sm border",
                          !on
                            ? "border-dashed border-hairline bg-transparent"
                            : used
                              ? "border-mint/60 bg-mint/60"
                              : "border-amber/50 bg-amber/25",
                        )}
                      />
                    );
                  })}
                </div>
                <p className="mt-1.5 text-center font-mono text-[11px] font-semibold tabular-nums text-foreground">
                  {(slot.rps / 1000).toFixed(slot.rps % 1000 ? 1 : 0)}K
                </p>
                <p className="truncate text-center text-[10px] text-muted-foreground sm:text-[11px]">
                  {slot.name}
                </p>
              </li>
            );
          })}
        </ul>

        <ul className="flex flex-wrap gap-x-5 gap-y-1 pb-1 pt-3 text-xs text-muted-foreground">
          <li className="flex items-center gap-1.5">
            <span className="size-3 rounded-sm bg-mint/60" /> Server doing needed work
          </li>
          <li className="flex items-center gap-1.5">
            <span className="size-3 rounded-sm bg-amber/25 ring-1 ring-amber/50" /> Server running
            but not needed
          </li>
          <li className="flex items-center gap-1.5">
            <span className="size-3 rounded-sm border border-dashed border-hairline" /> No server
          </li>
        </ul>
      </div>

      <div className="flex flex-wrap gap-2 px-4 pb-3 pt-2 sm:px-5">
        <Stat label="Server-slots running" value={`${total}`} tone="text-violet" />
        <Stat label="Needed for the traffic" value={`${asNeeded}`} tone="text-mint" />
        <Stat
          label="Spare"
          value={`${total - asNeeded}`}
          tone={total === asNeeded ? "text-mint" : "text-amber-600 dark:text-amber-400"}
        />
      </div>

      <p className="px-4 pb-4 text-center text-sm text-foreground/90 sm:px-5">
        {elastic
          ? "Capacity follows demand: servers are added for the peak and removed afterwards."
          : "Five servers cover the peak, but most of the day some of them sit idle."}
      </p>
    </section>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <span className="flex items-baseline gap-1.5 rounded-md border border-hairline bg-surface-2/60 px-2 py-1 font-mono">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <strong className={cn("text-[13px]", tone)}>{value}</strong>
    </span>
  );
}
