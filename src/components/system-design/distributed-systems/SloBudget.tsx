import { useState } from "react";

import { cn } from "@/lib/utils";

/*
 * SLI, SLO and SLA on one month. The learner sets how many minutes the service was down. The SLI is
 * what was measured, the SLO is the internal target (99.9%), and the SLA is a looser promise made to
 * customers (99.5%, an example). The downtime the SLO allows is its error budget.
 */

const MONTH_MIN = 30 * 24 * 60;
const SLO = 99.9;
const SLA = 99.5;
const budget = (target: number) => (MONTH_MIN * (100 - target)) / 100;

export function SloBudget() {
  const [down, setDown] = useState(20);

  const sli = (1 - down / MONTH_MIN) * 100;
  const sloBudget = budget(SLO);
  const slaBudget = budget(SLA);
  const sloMet = sli >= SLO;
  const slaMet = sli >= SLA;
  const used = Math.min(down / sloBudget, 1);

  return (
    <section
      aria-label="Service level indicator, objective and agreement for one 30-day month: set the minutes of downtime to see which targets are met"
      className="@container relative overflow-clip rounded-2xl border border-hairline bg-slate-50 shadow-sm dark:bg-surface"
    >
      <div className="border-b border-hairline bg-surface-2/40 px-4 py-3 sm:px-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          One 30-day month
        </p>
      </div>

      <div className="px-4 pt-4 sm:px-5">
        <label className="block">
          <span className="flex items-baseline justify-between text-xs text-muted-foreground">
            <span>Minutes of downtime this month</span>
            <span className="font-mono text-xs font-semibold text-foreground">{down} min</span>
          </span>
          <input
            type="range"
            min={0}
            max={300}
            step={1}
            value={down}
            onChange={(e) => setDown(Number(e.target.value))}
            aria-label="Minutes of downtime this month"
            className="mt-1 h-1.5 w-full cursor-pointer accent-[var(--mint)]"
          />
        </label>

        <div className="mt-4">
          <div className="flex items-baseline justify-between text-xs text-muted-foreground">
            <span>SLO error budget: {sloBudget.toFixed(1)} min of downtime</span>
            <span className="font-mono font-semibold text-foreground">
              {Math.max(sloBudget - down, 0).toFixed(1)} min left
            </span>
          </div>
          <div
            role="img"
            aria-label={`${Math.round(used * 100)} percent of the error budget used`}
            className="mt-1 h-2.5 overflow-hidden rounded-full bg-surface-2"
          >
            <div
              className={cn(
                "h-full rounded-full transition-[width]",
                down > sloBudget ? "bg-rose-500" : used > 0.7 ? "bg-amber" : "bg-mint",
              )}
              style={{ width: `${used * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-3 px-4 py-4 sm:px-5 @min-[40rem]:grid-cols-3">
        <Card
          term="SLI"
          name="Service Level Indicator"
          question="What we measure"
          value={`${sli.toFixed(3)}%`}
          note="Measured availability"
        />
        <Card
          term="SLO"
          name="Service Level Objective"
          question="What target we aim to meet"
          value={`≥ ${SLO}%`}
          note={sloMet ? "Met" : "Missed"}
          good={sloMet}
        />
        <Card
          term="SLA"
          name="Service Level Agreement"
          question="What we promise customers"
          value={`≥ ${SLA}%`}
          note={slaMet ? "Kept" : `Missed: consequences apply (past ${slaBudget.toFixed(0)} min)`}
          good={slaMet}
        />
      </div>
      <p className="px-4 pb-4 text-center text-xs text-muted-foreground sm:px-5">
        Illustrative targets. The SLA is deliberately looser than the SLO, so the team notices a
        problem before it breaks a promise.
      </p>
    </section>
  );
}

function Card({
  term,
  name,
  question,
  value,
  note,
  good,
}: {
  term: string;
  name: string;
  question: string;
  value: string;
  note: string;
  good?: boolean;
}) {
  return (
    <div className="rounded-xl border border-hairline bg-background/70 px-4 py-3">
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        {term}
      </p>
      <p className="text-sm font-semibold text-foreground">{name}</p>
      <p className="text-xs text-muted-foreground">{question}</p>
      <p className="mt-2 font-mono text-lg font-bold text-foreground">{value}</p>
      <p
        className={cn(
          "text-xs font-semibold",
          good === undefined
            ? "text-muted-foreground"
            : good
              ? "text-mint"
              : "text-rose-600 dark:text-rose-400",
        )}
      >
        {note}
      </p>
    </div>
  );
}
