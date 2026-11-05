import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/*
 * Downtime permitted per year by each availability target, in minutes (365 days). Each extra nine
 * cuts the allowance by ten, so the bars collapse quickly on a linear scale. A log scale keeps the
 * small ones visible.
 */

const BARS = [
  { target: "99%", minutes: 5256, text: "3.65 days" },
  { target: "99.9%", minutes: 525.6, text: "8 hr 45 min" },
  { target: "99.99%", minutes: 52.56, text: "52 min 34 sec" },
  { target: "99.999%", minutes: 5.256, text: "5 min 15 sec" },
];
const LINEAR = [
  { v: 6000, label: "6K minutes" },
  { v: 4500, label: "4.5K minutes" },
  { v: 3000, label: "3K minutes" },
  { v: 1500, label: "1.5K minutes" },
  { v: 0, label: "0 minutes" },
];
const LOG = [
  { v: 10000, label: "10K minutes" },
  { v: 1000, label: "1K minutes" },
  { v: 100, label: "100 minutes" },
  { v: 10, label: "10 minutes" },
  { v: 1, label: "1 minute" },
];

export function DowntimeBars() {
  const [log, setLog] = useState(false);
  const ticks = log ? LOG : LINEAR;
  const frac = (m: number) =>
    log ? Math.max(Math.log10(m) / Math.log10(10000), 0.02) : Math.max(m / 6000, 0.004);

  return (
    <section
      aria-label="Bar chart of the downtime each availability target allows per year: 99 percent allows 3.65 days, 99.9 percent 8 hours 45 minutes, 99.99 percent 52 minutes 34 seconds, and 99.999 percent 5 minutes 15 seconds"
      className="@container relative overflow-clip rounded-2xl border border-hairline bg-slate-50 shadow-sm dark:bg-surface"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline bg-surface-2/40 px-4 py-3 sm:px-5">
        <div>
          <p className="text-sm font-semibold text-foreground">Why percentages matter</p>
          <p className="text-xs text-muted-foreground">Illustrative maximum yearly downtime</p>
        </div>
        <Button
          type="button"
          size="sm"
          variant={log ? "default" : "outline"}
          aria-pressed={log}
          className="h-7 px-2.5 text-xs"
          onClick={() => setLog((l) => !l)}
        >
          Log scale
        </Button>
      </div>

      <div className="p-4 sm:p-6">
        <p className="text-base font-semibold text-foreground">
          Downtime permitted by availability target
        </p>
        <p className="mb-3 text-sm text-muted-foreground">
          Values use 365 days per year and are expressed in minutes.
        </p>

        <div className="flex gap-3">
          <ul
            aria-hidden
            className="flex h-48 w-24 shrink-0 flex-col justify-between text-right font-mono text-[11px] text-muted-foreground"
          >
            {ticks.map((t) => (
              <li key={t.v} className="leading-none">
                {t.label}
              </li>
            ))}
          </ul>
          <div className="relative min-w-0 flex-1">
            <div aria-hidden className="absolute inset-0 flex flex-col justify-between">
              {ticks.map((t) => (
                <div key={t.v} className="border-t border-dashed border-hairline" />
              ))}
            </div>
            <ul className="relative flex h-48 items-end justify-around gap-3 sm:gap-8">
              {BARS.map((b) => (
                <li
                  key={b.target}
                  aria-label={`${b.target}: ${b.text} of downtime per year`}
                  className="flex h-full max-w-24 flex-1 flex-col justify-end"
                >
                  <p className="mb-1 text-center font-mono text-[10.5px] font-semibold text-foreground">
                    {b.text}
                  </p>
                  <div
                    className={cn(
                      "w-full rounded-t-md bg-sky-500/70 transition-[height] duration-500",
                    )}
                    style={{ height: `${frac(b.minutes) * 85}%` }}
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
        <ul className="mt-1.5 flex justify-around gap-3 pl-[6.75rem] sm:gap-8">
          {BARS.map((b) => (
            <li
              key={b.target}
              className="max-w-24 flex-1 text-center font-mono text-xs font-semibold text-foreground"
            >
              {b.target}
            </li>
          ))}
        </ul>

        <p className="mt-4 text-sm text-muted-foreground">
          The precise measurement depends on the service-level indicator, measurement window, and
          definition of a successful request.
        </p>
      </div>
    </section>
  );
}
