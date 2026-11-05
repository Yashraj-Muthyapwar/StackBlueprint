import { cn } from "@/lib/utils";

/*
 * Illustrative p50, p95 and p99 of one API. The bars share one scale, so the gap between the
 * typical request and the slow tail is visible at a glance.
 */

const MAX = 1000;
const TICKS = [1000, 750, 500, 250, 0];
const BARS = [
  { label: "p50", value: 100, bar: "bg-sky-500/70" },
  { label: "p95", value: 350, bar: "bg-violet/70" },
  { label: "p99", value: 800, bar: "bg-amber/80" },
];

const tickLabel = (ms: number) => (ms === 1000 ? "1K ms" : `${ms} ms`);

export function PercentileBars() {
  return (
    <section
      aria-label="Bar chart of example API latency: p50 is 100 milliseconds, p95 is 350 milliseconds and p99 is 800 milliseconds"
      className="@container relative overflow-clip rounded-2xl border border-hairline bg-slate-50 shadow-sm dark:bg-surface"
    >
      <div className="border-b border-hairline bg-surface-2/40 px-4 py-3 sm:px-5">
        <p className="text-sm font-semibold text-foreground">Example API latency percentiles</p>
        <p className="text-xs text-muted-foreground">
          Illustrative measurements for a request workload.
        </p>
      </div>

      <div className="p-4 sm:p-6">
        <div className="flex gap-3">
          <ul
            aria-hidden
            className="flex h-44 w-14 shrink-0 flex-col justify-between text-right font-mono text-[11px] text-muted-foreground"
          >
            {TICKS.map((tick) => (
              <li key={tick} className="leading-none">
                {tickLabel(tick)}
              </li>
            ))}
          </ul>

          <div className="relative min-w-0 flex-1">
            <div aria-hidden className="absolute inset-0 flex flex-col justify-between">
              {TICKS.map((tick) => (
                <div key={tick} className="border-t border-dashed border-hairline" />
              ))}
            </div>
            <ul className="relative flex h-44 items-end justify-around gap-3 sm:gap-8">
              {BARS.map((b) => (
                <li
                  key={b.label}
                  aria-label={`${b.label}: ${b.value} milliseconds`}
                  className="flex h-full max-w-24 flex-1 items-end"
                >
                  <div
                    className={cn("w-full rounded-t-md", b.bar)}
                    style={{ height: `${(b.value / MAX) * 100}%` }}
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
        <ul className="mt-1.5 flex justify-around gap-3 pl-[4.25rem] sm:gap-8">
          {BARS.map((b) => (
            <li
              key={b.label}
              className="max-w-24 flex-1 text-center font-mono text-xs font-semibold text-foreground"
            >
              {b.label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
