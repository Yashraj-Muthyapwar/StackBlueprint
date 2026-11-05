import { useState } from "react";
import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/*
 * The product-search API from the lesson, with its three numbers adjustable. From latency,
 * throughput and payload size it works out the network load (bandwidth) and the average number of
 * requests in the system (Little's Law), so the three metrics can be seen to move together.
 */

const LINK_MBPS = 1000;
const DEFAULTS = { latencyMs: 200, rps: 1000, payloadKb: 50 };

const SLIDERS = [
  { key: "latencyMs", label: "Average latency", unit: "ms", min: 20, max: 1000, step: 10 },
  { key: "rps", label: "Throughput", unit: "RPS", min: 100, max: 5000, step: 100 },
  { key: "payloadKb", label: "Response payload", unit: "KB", min: 5, max: 500, step: 5 },
] as const;

export function ApiLoadCalculator() {
  const [v, setV] = useState(DEFAULTS);

  // Decimal units: 1 KB = 1,000 bytes and 1 byte = 8 bits.
  const mbps = (v.rps * v.payloadKb * 8) / 1000;
  const inSystem = v.rps * (v.latencyMs / 1000);
  const use = mbps / LINK_MBPS;
  const changed =
    v.latencyMs !== DEFAULTS.latencyMs ||
    v.rps !== DEFAULTS.rps ||
    v.payloadKb !== DEFAULTS.payloadKb;
  const level = use > 1 ? "over" : use > 0.8 ? "high" : "ok";

  return (
    <section
      aria-label="Calculator for the product-search API: change latency, throughput and payload size to see the network load and the average number of requests in progress"
      className="@container relative overflow-clip rounded-2xl border border-hairline bg-slate-50 shadow-sm dark:bg-surface"
    >
      <div className="flex items-center justify-between gap-3 border-b border-hairline bg-surface-2/40 px-4 py-3 sm:px-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          Change the three numbers
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
                {v[s.key].toLocaleString("en-US")} {s.unit}
              </span>
            </span>
            <input
              type="range"
              min={s.min}
              max={s.max}
              step={s.step}
              value={v[s.key]}
              onChange={(e) => setV({ ...v, [s.key]: Number(e.target.value) })}
              aria-label={`${s.label} in ${s.unit}`}
              className="mt-1 h-1.5 w-full cursor-pointer accent-[var(--mint)]"
            />
          </label>
        ))}
      </div>

      <div className="grid gap-3 px-4 py-4 sm:px-5 @min-[40rem]:grid-cols-2">
        <div className="rounded-xl border border-hairline bg-background/70 px-4 py-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            Network load
          </p>
          <p className="mt-1 font-mono text-sm text-muted-foreground">
            {v.rps.toLocaleString("en-US")} x {v.payloadKb} KB ={" "}
            <strong className="text-base text-foreground">
              {Math.round(mbps).toLocaleString("en-US")} Mbps
            </strong>
          </p>
          <div
            role="img"
            aria-label={`${Math.round(use * 100)} percent of a 1 Gbps link`}
            className="mt-2 h-2.5 overflow-hidden rounded-full bg-surface-2"
          >
            <div
              className={cn(
                "h-full rounded-full transition-[width]",
                level === "over" ? "bg-rose-500" : level === "high" ? "bg-amber" : "bg-mint",
              )}
              style={{ width: `${Math.min(use, 1) * 100}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            {Math.round(use * 100)}% of a 1 Gbps link.{" "}
            {level === "over"
              ? "More than the link can carry, so the network is the bottleneck."
              : level === "high"
                ? "Close to the limit once overhead and other traffic are counted."
                : "Room left, before overhead and other traffic."}
          </p>
        </div>

        <div className="rounded-xl border border-hairline bg-background/70 px-4 py-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            Requests in the system
          </p>
          <p className="mt-1 font-mono text-sm text-muted-foreground">
            {v.rps.toLocaleString("en-US")} x {(v.latencyMs / 1000).toFixed(2).replace(/0$/, "")} s
            ={" "}
            <strong className="text-base text-foreground">
              {Math.round(inSystem).toLocaleString("en-US")}
            </strong>
          </p>
          <p className="mt-1.5 text-xs text-muted-foreground">
            The long-run average number of requests in progress at once, for a stable system.
          </p>
        </div>
      </div>
    </section>
  );
}
