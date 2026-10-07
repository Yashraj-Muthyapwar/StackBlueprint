import { motion } from "motion/react";

import type { BitsView, PointerColor } from "@/lessons/types";

const COLOR_MAP: Record<PointerColor, string> = {
  mint: "var(--mint)",
  amber: "var(--amber)",
  violet: "var(--violet)",
  rose: "var(--rose)",
};

/**
 * Binary breakdown stacked like column arithmetic. Every operand row is drawn above a
 * rule and the result row under it, so XOR reads column by column: equal bits give 0,
 * different bits give 1.
 */
export function BitsStrip({ data }: { data: BitsView }) {
  const { width, rows } = data;
  const CELL = width <= 6 ? 30 : width <= 9 ? 26 : 22;
  const GAP = 4;

  return (
    <div className="rounded-2xl border border-hairline bg-surface px-4 py-3">
      <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        in binary
      </div>
      <div className="overflow-x-auto pb-1">
        <div className="inline-flex min-w-max flex-col gap-1">
          {rows.map((row, ri) => {
            const color = row.tone ? COLOR_MAP[row.tone] : "var(--foreground)";
            const known = row.value !== null;
            return (
              <div key={ri}>
                {row.result && (
                  <div
                    className="mb-1 ml-[calc(8.5rem+1.5rem)] h-px"
                    style={{ width: width * (CELL + GAP) - GAP, background: "var(--hairline)" }}
                  />
                )}
                <div className="flex items-center">
                  <span className="w-[8.5rem] truncate pr-2 text-right font-mono text-xs text-muted-foreground">
                    {row.label}
                  </span>
                  <span className="w-6 text-center font-mono text-xs text-muted-foreground">
                    {row.op ?? ""}
                  </span>
                  <div className="flex" style={{ gap: GAP }}>
                    {Array.from({ length: width }, (_, bi) => {
                      const bitPos = width - 1 - bi;
                      const bit = known ? ((row.value as number) >> bitPos) & 1 : null;
                      const on = bit === 1;
                      return (
                        <motion.div
                          key={`${ri}-${bi}-${row.value}`}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.18, delay: bi * 0.015 }}
                          className="grid place-items-center rounded-md font-mono text-xs font-semibold"
                          style={{
                            width: CELL,
                            height: CELL - 6,
                            color: on ? "var(--background)" : "var(--muted-foreground)",
                            background: on ? color : known ? "var(--surface-2)" : "transparent",
                            boxShadow: on
                              ? `0 0 10px color-mix(in oklab, ${color} 35%, transparent)`
                              : `inset 0 0 0 1px var(--hairline)`,
                          }}
                        >
                          {bit === null ? "?" : bit}
                        </motion.div>
                      );
                    })}
                  </div>
                  <span className="ml-3 w-14 font-mono text-xs text-foreground/80">
                    {known ? `= ${row.value}` : "= ?"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
