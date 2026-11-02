import { useState } from "react";
import { useAnimationFrame, useReducedMotion } from "motion/react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/*
 * One server handling requests that each take 200 ms. With one worker the requests queue behind
 * each other: 5 finish per second. With four workers they overlap: 20 finish per second. Every
 * single request still takes 200 ms, so concurrency raises throughput and leaves latency alone.
 */

const REQUEST_MS = 200;
const WINDOW_MS = 1000;
const MAX_WORKERS = 4;
const PERIOD = 4.5; // seconds for the playhead to cross the window

export function ConcurrencyLanes() {
  const reduced = !!useReducedMotion();
  const [workers, setWorkers] = useState(1);
  const [now, setNow] = useState(reduced ? WINDOW_MS : 0);

  useAnimationFrame((time) => {
    if (!reduced) setNow((((time / 1000) % PERIOD) / PERIOD) * WINDOW_MS);
  });

  const perWorker = WINDOW_MS / REQUEST_MS;
  const done = Math.min(workers * perWorker, Math.floor(now / REQUEST_MS) * workers);

  return (
    <section
      aria-label="Requests handled one at a time versus several at once: more workers finish more requests per second, but each request still takes 200 milliseconds"
      className="@container relative overflow-clip rounded-2xl border border-hairline bg-slate-50 shadow-sm dark:bg-surface"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline bg-surface-2/40 px-4 py-3 sm:px-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          One second of requests, 200 ms each
        </p>
        <div
          role="group"
          aria-label="Requests handled at once"
          className="flex items-center gap-1.5"
        >
          {Array.from({ length: MAX_WORKERS }, (_, i) => i + 1).map((n) => (
            <Button
              key={n}
              type="button"
              size="sm"
              variant={workers === n ? "default" : "outline"}
              aria-pressed={workers === n}
              className="h-7 px-2.5 text-xs"
              onClick={() => setWorkers(n)}
            >
              {n} at once
            </Button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4 sm:px-6">
        <div className="relative">
          <div className="space-y-1.5">
            {Array.from({ length: MAX_WORKERS }, (_, lane) => {
              const active = lane < workers;
              return (
                <div key={lane} className="flex items-center gap-2">
                  <span className="w-14 shrink-0 font-mono text-[11px] text-muted-foreground">
                    {active ? `Worker ${lane + 1}` : "Idle"}
                  </span>
                  <div
                    className={cn(
                      "relative h-6 flex-1 overflow-hidden rounded-md border border-hairline",
                      active ? "bg-surface-2" : "bg-background/60",
                    )}
                  >
                    {active
                      ? Array.from({ length: perWorker }, (_, i) => {
                          const finished = (i + 1) * REQUEST_MS <= now;
                          return (
                            <div
                              key={i}
                              className={cn(
                                "absolute inset-y-0.5 rounded-[5px] border text-center font-mono text-[10px] leading-5",
                                finished
                                  ? "border-mint/60 bg-mint/50 text-foreground"
                                  : "border-hairline bg-sky-500/20 text-muted-foreground",
                              )}
                              style={{
                                left: `calc(${(i / perWorker) * 100}% + 2px)`,
                                width: `calc(${100 / perWorker}% - 4px)`,
                              }}
                            >
                              200 ms
                            </div>
                          );
                        })
                      : null}
                  </div>
                </div>
              );
            })}
          </div>
          <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 left-16 -my-1">
            <div
              className="absolute inset-y-0 w-0.5 rounded bg-violet"
              style={{ left: `${(now / WINDOW_MS) * 100}%` }}
            />
          </div>
        </div>
        <div className="mt-1.5 flex justify-between pl-16 font-mono text-[11px] text-muted-foreground">
          <span>0 ms</span>
          <span>500 ms</span>
          <span>1,000 ms</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 px-4 pb-3 pt-3 sm:px-5">
        <Stat label="Latency per request" value={`${REQUEST_MS} ms`} tone="text-mint" />
        <Stat
          label="Throughput"
          value={`${workers * perWorker} requests/second`}
          tone="text-violet"
        />
        <Stat label="Finished so far" value={`${done}`} tone="text-foreground" />
      </div>

      <p className="px-4 pb-4 text-center text-sm text-foreground/90 sm:px-5">
        Handling requests at the same time raises throughput. Each request still takes 200 ms.
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
