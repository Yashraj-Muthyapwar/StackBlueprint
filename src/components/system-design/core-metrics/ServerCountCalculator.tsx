import { useState } from "react";
import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/*
 * The e-commerce API from the lesson, adjustable. The idealised answer is target / per-server
 * capacity. The shared database limit shows why that count cannot guarantee the target: the system
 * sustains only the smallest capacity along the path.
 */

const DEFAULTS = { target: 10000, perServer: 1000, dbLimit: 4000 };

const SLIDERS = [
  { key: "target", label: "Target traffic", min: 1000, max: 20000, step: 500 },
  { key: "perServer", label: "Capacity per server", min: 500, max: 2000, step: 100 },
  { key: "dbLimit", label: "Shared database limit", min: 2000, max: 20000, step: 500 },
] as const;

const fmt = (n: number) => n.toLocaleString("en-US");

export function ServerCountCalculator() {
  const [v, setV] = useState(DEFAULTS);

  const servers = Math.ceil(v.target / v.perServer);
  const appCapacity = servers * v.perServer;
  const sustained = Math.min(appCapacity, v.dbLimit);
  const limited = sustained < v.target;
  const scale = Math.max(v.target, appCapacity, v.dbLimit);
  const changed =
    v.target !== DEFAULTS.target ||
    v.perServer !== DEFAULTS.perServer ||
    v.dbLimit !== DEFAULTS.dbLimit;

  const bars = [
    { label: "Target traffic", value: v.target, bar: "bg-sky-500/70" },
    { label: `${servers} application servers`, value: appCapacity, bar: "bg-mint/70" },
    { label: "Database limit", value: v.dbLimit, bar: "bg-violet/70" },
  ];

  return (
    <section
      aria-label="Server count calculator: change the target traffic, the capacity of one server and the shared database limit to see how many servers the idealised formula gives and what the system can really sustain"
      className="@container relative overflow-clip rounded-2xl border border-hairline bg-slate-50 shadow-sm dark:bg-surface"
    >
      <div className="flex items-center justify-between gap-3 border-b border-hairline bg-surface-2/40 px-4 py-3 sm:px-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          Plan the sale
        </p>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-7 gap-1.5 px-2 text-xs"
          disabled={!changed}
          onClick={() => setV(DEFAULTS)}
        >
          <RotateCcw className="size-3.5" /> Reset
        </Button>
      </div>

      <div className="grid gap-x-6 gap-y-3 px-4 pt-4 sm:px-5 @min-[40rem]:grid-cols-3">
        {SLIDERS.map((s) => (
          <label key={s.key} className="block min-w-0">
            <span className="flex items-baseline justify-between gap-2 text-xs text-muted-foreground">
              <span>{s.label}</span>
              <span className="font-mono text-xs font-semibold tabular-nums text-foreground">
                {fmt(v[s.key])} RPS
              </span>
            </span>
            <input
              type="range"
              min={s.min}
              max={s.max}
              step={s.step}
              value={v[s.key]}
              onChange={(e) => setV({ ...v, [s.key]: Number(e.target.value) })}
              aria-label={`${s.label} in requests per second`}
              className="mt-1 h-1.5 w-full cursor-pointer accent-[var(--mint)]"
            />
          </label>
        ))}
      </div>

      <div className="px-4 pt-4 sm:px-5">
        <p className="font-mono text-sm text-muted-foreground">
          {fmt(v.target)} / {fmt(v.perServer)} ={" "}
          <strong className="text-base text-foreground">{servers} servers</strong>{" "}
          <span className="text-xs">(theoretical minimum)</span>
        </p>
        <ul className="mt-3 space-y-2">
          {bars.map((b) => (
            <li key={b.label} className="flex items-center gap-3">
              <span className="w-36 shrink-0 text-xs text-muted-foreground @min-[40rem]:w-44">
                {b.label}
              </span>
              <div className="relative h-5 flex-1 overflow-hidden rounded-md bg-surface-2">
                <div
                  className={cn("h-full rounded-md transition-[width]", b.bar)}
                  style={{ width: `${(b.value / scale) * 100}%` }}
                />
              </div>
              <span className="w-16 shrink-0 text-right font-mono text-xs font-semibold tabular-nums">
                {fmt(b.value)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div
        className={cn(
          "m-4 rounded-xl border px-4 py-3 text-sm sm:mx-5",
          limited
            ? "border-amber/40 bg-amber/10 text-foreground"
            : "border-mint/40 bg-mint/10 text-foreground",
        )}
      >
        {limited ? (
          <>
            <strong>The system sustains only {fmt(sustained)} RPS.</strong> The {servers}{" "}
            application servers could take {fmt(appCapacity)} RPS, but the shared database saturates
            at {fmt(v.dbLimit)} RPS. Scale the bottleneck, not just the number of servers.
          </>
        ) : (
          <>
            <strong>The target is within reach.</strong> Every part of the path can carry{" "}
            {fmt(v.target)} RPS under these idealised assumptions. Real plans add spare capacity and
            are load tested.
          </>
        )}
      </div>
    </section>
  );
}
