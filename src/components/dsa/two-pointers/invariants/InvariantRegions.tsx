import { useState } from "react";

import { cn } from "@/lib/utils";

export type InvariantRule = {
  region: "zeros" | "ones" | "unknown" | "twos";
  text: string;
};

/** A snapshot of Dutch National Flag part way through: low, mid and high split the array. */
const VALUES = [0, 0, 1, 1, 2, 0, 1, 2, 2];
const LOW = 2;
const MID = 4;
const HIGH = 6;

type Region = InvariantRule["region"];

const REGION_STYLE: Record<Region, { cell: string; rule: string; label: string }> = {
  zeros: {
    cell: "border-rose/50 bg-rose/10 text-rose",
    rule: "border-rose/40 bg-rose/5",
    label: "Before low",
  },
  ones: {
    cell: "border-slate-400/60 bg-slate-400/15 text-foreground/80",
    rule: "border-slate-400/40 bg-slate-400/5",
    label: "low to mid - 1",
  },
  unknown: {
    cell: "border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    rule: "border-amber-500/40 bg-amber-500/5",
    label: "mid to high",
  },
  twos: {
    cell: "border-blue-500/50 bg-blue-500/10 text-blue-500 dark:text-blue-400",
    rule: "border-blue-500/40 bg-blue-500/5",
    label: "After high",
  },
};

const regionOf = (index: number): Region =>
  index < LOW ? "zeros" : index < MID ? "ones" : index <= HIGH ? "unknown" : "twos";

const POINTERS: Record<number, string[]> = { [LOW]: ["low"], [MID]: ["mid"], [HIGH]: ["high"] };

/**
 * One frozen moment of Dutch National Flag with its regions coloured. Choosing a rule lights up
 * the part of the array that rule is about, so the learner sees what "stays true" covers.
 */
export function InvariantRegions({ rules }: { rules: InvariantRule[] }) {
  const [active, setActive] = useState<Region | null>(null);
  const columns = { gridTemplateColumns: `repeat(${VALUES.length}, minmax(0, 1fr))` };

  return (
    <figure className="overflow-clip rounded-2xl border border-hairline bg-slate-50 shadow-sm dark:bg-surface">
      <div className="px-4 pb-4 pt-5 sm:px-8">
        <p className="text-center text-xs font-semibold text-muted-foreground">
          Dutch National Flag, partway through
        </p>
        <div className="mx-auto mt-3 max-w-lg">
          <div className="grid h-9 items-end" style={columns}>
            {VALUES.map((_, index) => (
              <span
                key={index}
                className="text-center font-mono text-[11px] font-bold leading-tight text-foreground sm:text-xs"
              >
                {(POINTERS[index] ?? []).join(" ")}
              </span>
            ))}
          </div>
          <div className="mt-1 grid gap-0" style={columns}>
            {VALUES.map((value, index) => {
              const region = regionOf(index);
              const dim = active !== null && active !== region;
              return (
                <div key={index} className="flex justify-center px-0.5 sm:px-1">
                  <div
                    className={cn(
                      "flex aspect-square w-full max-w-14 items-center justify-center rounded-xl border-2 font-mono text-base font-bold transition-all duration-300 sm:text-lg",
                      REGION_STYLE[region].cell,
                      dim && "opacity-25",
                      active === region && "ring-2 ring-foreground/20",
                    )}
                  >
                    {region === "unknown" ? "?" : value}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-1.5 grid" style={columns}>
            {VALUES.map((_, index) => (
              <span key={index} className="text-center font-mono text-xs text-muted-foreground">
                [{index}]
              </span>
            ))}
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Choose a rule to see the part of the array it covers.
        </p>
      </div>

      <div className="grid gap-2 border-t border-hairline bg-surface-2/30 p-3 sm:grid-cols-2 sm:p-4">
        {rules.map((rule) => (
          <button
            key={rule.region}
            type="button"
            onClick={() => setActive((current) => (current === rule.region ? null : rule.region))}
            aria-pressed={active === rule.region}
            className={cn(
              "rounded-xl border p-3 text-left transition-colors",
              REGION_STYLE[rule.region].rule,
              active === rule.region ? "ring-2 ring-foreground/20" : "hover:bg-foreground/5",
            )}
          >
            <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {REGION_STYLE[rule.region].label}
            </span>
            <span className="lesson-supporting mt-1 block text-foreground/90">{rule.text}</span>
          </button>
        ))}
      </div>
    </figure>
  );
}
