import { useState } from "react";
import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

/*
 * RTO and RPO on one timeline. The failure happens at time zero. The recovery point objective
 * reaches back from the failure: changes newer than that may be lost. The recovery time objective
 * reaches forward: the service should be back by then. Both are targets, not guarantees.
 */

const DEFAULTS = { rpo: 1, rto: 5 };
const FROM = -12;
const TO = 32;

const pct = (t: number) => ((t - FROM) / (TO - FROM)) * 100;

export function RecoveryObjectives() {
  const [v, setV] = useState(DEFAULTS);
  const changed = v.rpo !== DEFAULTS.rpo || v.rto !== DEFAULTS.rto;

  return (
    <section
      aria-label="Recovery objectives on a timeline: the recovery point objective reaches back from the failure and the recovery time objective reaches forward"
      className="@container relative overflow-clip rounded-2xl border border-hairline bg-slate-50 shadow-sm dark:bg-surface"
    >
      <div className="flex items-center justify-between gap-3 border-b border-hairline bg-surface-2/40 px-4 py-3 sm:px-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          Set the two objectives
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

      <div className="grid gap-x-6 gap-y-3 px-4 pt-4 sm:px-5 @min-[36rem]:grid-cols-2">
        <label className="block">
          <span className="flex items-baseline justify-between text-xs text-muted-foreground">
            <span>Recovery Point Objective (RPO)</span>
            <span className="font-mono font-semibold text-foreground">{v.rpo} min</span>
          </span>
          <input
            type="range"
            min={0}
            max={10}
            step={1}
            value={v.rpo}
            onChange={(e) => setV({ ...v, rpo: Number(e.target.value) })}
            aria-label="Recovery point objective in minutes"
            className="mt-1 h-1.5 w-full cursor-pointer accent-[var(--mint)]"
          />
        </label>
        <label className="block">
          <span className="flex items-baseline justify-between text-xs text-muted-foreground">
            <span>Recovery Time Objective (RTO)</span>
            <span className="font-mono font-semibold text-foreground">{v.rto} min</span>
          </span>
          <input
            type="range"
            min={1}
            max={30}
            step={1}
            value={v.rto}
            onChange={(e) => setV({ ...v, rto: Number(e.target.value) })}
            aria-label="Recovery time objective in minutes"
            className="mt-1 h-1.5 w-full cursor-pointer accent-[var(--mint)]"
          />
        </label>
      </div>

      <div className="px-4 pb-1 pt-6 sm:px-6">
        <div className="relative h-14">
          <div className="absolute inset-x-0 top-6 h-2 rounded-full bg-surface-2" />
          <div
            className="absolute top-6 h-2 rounded-l-full bg-rose-500/60 transition-all"
            style={{ left: `${pct(-v.rpo)}%`, width: `${pct(0) - pct(-v.rpo)}%` }}
          />
          <div
            className="absolute top-6 h-2 bg-amber/70 transition-all"
            style={{ left: `${pct(0)}%`, width: `${pct(v.rto) - pct(0)}%` }}
          />
          <div
            className="absolute top-6 h-2 rounded-r-full bg-mint/60 transition-all"
            style={{ left: `${pct(v.rto)}%`, right: 0 }}
          />
          {/* failure marker */}
          <div
            className="absolute top-2 bottom-0 w-0.5 bg-foreground"
            style={{ left: `${pct(0)}%` }}
          />
          <span
            className="absolute top-0 -translate-x-1/2 font-mono text-[11px] font-semibold text-foreground"
            style={{ left: `${pct(0)}%` }}
          >
            Failure
          </span>
          <span
            className="absolute top-10 -translate-x-1/2 whitespace-nowrap font-mono text-[10.5px] text-muted-foreground"
            style={{ left: `${pct(v.rto)}%` }}
          >
            Service restored
          </span>
          {v.rpo > 0 ? (
            <span
              className="absolute top-10 -translate-x-1/2 whitespace-nowrap font-mono text-[10.5px] text-muted-foreground"
              style={{ left: `${pct(-v.rpo)}%` }}
            >
              Last safe copy
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 px-4 pb-3 pt-3 sm:px-5">
        <Chip
          dot="bg-rose-500/60"
          label="Data changes at risk"
          value={v.rpo === 0 ? "none targeted" : `up to ${v.rpo} min`}
        />
        <Chip dot="bg-amber/70" label="Service down for up to" value={`${v.rto} min`} />
      </div>
      <p className="px-4 pb-4 text-center text-sm text-foreground/90 sm:px-5">
        These are objectives, not automatic guarantees. A design has to be built, and tested, to
        meet them.
      </p>
    </section>
  );
}

function Chip({ dot, label, value }: { dot: string; label: string; value: string }) {
  return (
    <span className="flex items-center gap-1.5 rounded-md border border-hairline bg-surface-2/60 px-2 py-1 font-mono">
      <span className={`size-2.5 rounded-full ${dot}`} />
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <strong className="text-[13px] text-foreground">{value}</strong>
    </span>
  );
}
