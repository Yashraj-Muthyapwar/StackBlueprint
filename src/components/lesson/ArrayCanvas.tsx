import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import type { ArrayStep, Pointer } from "@/lessons/types";

const COLOR_MAP: Record<Pointer["color"], string> = {
  mint: "var(--mint)",
  amber: "var(--amber)",
  violet: "var(--violet)",
  rose: "var(--rose)",
};

const PARTITION_BG: Record<"low" | "mid" | "high", string> = {
  low: "color-mix(in oklab, var(--mint) 14%, transparent)",
  mid: "color-mix(in oklab, var(--violet) 14%, transparent)",
  high: "color-mix(in oklab, var(--amber) 14%, transparent)",
};
const PARTITION_BORDER: Record<"low" | "mid" | "high", string> = {
  low: "color-mix(in oklab, var(--mint) 50%, transparent)",
  mid: "color-mix(in oklab, var(--violet) 50%, transparent)",
  high: "color-mix(in oklab, var(--amber) 55%, transparent)",
};
const PARTITION_LABEL: Record<"low" | "mid" | "high", string> = {
  low: "var(--mint)",
  mid: "var(--violet)",
  high: "var(--amber)",
};

function sizing(n: number) {
  if (n <= 7) return { CELL: 64, GAP: 10 };
  if (n <= 9) return { CELL: 54, GAP: 8 };
  return { CELL: 44, GAP: 6 };
}

export function ArrayCanvas({ step }: { step: ArrayStep }) {
  const { array, pointers, partitions = [], highlight } = step;
  const n = array.length;

  const aboveSlots: Pointer[] = [];
  const belowSlots: Pointer[] = [];
  for (const p of pointers) {
    if (p.placement === "below") belowSlots.push(p);
    else aboveSlots.push(p);
  }

  // group above/below pointers by index for vertical stacking when they overlap
  const groupBy = (ps: Pointer[]) => {
    const m = new Map<number, Pointer[]>();
    for (const p of ps) {
      if (!m.has(p.index)) m.set(p.index, []);
      m.get(p.index)!.push(p);
    }
    return m;
  };
  const aboveByIdx = groupBy(aboveSlots);
  const belowByIdx = groupBy(belowSlots);

  return (
    <div className="relative h-full w-full">
      {/* Status pill */}
      {step.status && (
        <div className="absolute left-1/2 top-3 z-20 -translate-x-1/2">
          <motion.div
            key={step.status}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-full border border-hairline bg-surface/90 px-3 py-1 font-mono text-xs text-foreground backdrop-blur"
          >
            {step.status}
          </motion.div>
        </div>
      )}

      <div className="grid h-full place-items-center px-6">
        <div
          className="relative"
          style={{
            width: n * CELL + (n - 1) * GAP,
            minHeight: 220,
          }}
        >
          {/* partition bands */}
          {partitions.map((p, i) => {
            if (p.to < p.from) return null;
            const left = p.from * (CELL + GAP) - 6;
            const width = (p.to - p.from + 1) * CELL + (p.to - p.from) * GAP + 12;
            return (
              <motion.div
                key={`${p.tone}-${i}`}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 30 }}
                className="absolute rounded-xl"
                style={{
                  left,
                  width,
                  top: 32,
                  height: 88,
                  background: PARTITION_BG[p.tone],
                  border: `1px dashed ${PARTITION_BORDER[p.tone]}`,
                }}
              >
                {p.label && (
                  <span
                    className="absolute -top-2 left-2 rounded bg-background px-1.5 font-mono text-[10px] uppercase tracking-widest"
                    style={{ color: PARTITION_LABEL[p.tone] }}
                  >
                    {p.label}
                  </span>
                )}
              </motion.div>
            );
          })}

          {/* index ruler */}
          <div className="absolute left-0 right-0" style={{ top: 0 }}>
            <div className="flex" style={{ gap: GAP }}>
              {array.map((_, i) => (
                <div
                  key={i}
                  className="text-center font-mono text-[10px] text-muted-foreground/70"
                  style={{ width: CELL }}
                >
                  {i}
                </div>
              ))}
            </div>
          </div>

          {/* cells */}
          <div className="flex" style={{ gap: GAP, marginTop: 18 }}>
            {array.map((v, i) => {
              const isCompare = highlight?.kind === "compare" && highlight.indices.includes(i);
              const isSwap = highlight?.kind === "swap" && highlight.indices.includes(i);
              const isMatch = highlight?.kind === "match" && highlight.indices.includes(i);
              const ringColor = isMatch
                ? "var(--mint)"
                : isSwap
                  ? "var(--rose)"
                  : isCompare
                    ? "var(--violet)"
                    : "transparent";
              return (
                <motion.div
                  key={i}
                  layout
                  className={cn(
                    "relative grid place-items-center rounded-xl bg-surface-2 font-mono text-xl font-medium text-foreground",
                  )}
                  style={{
                    width: CELL,
                    height: CELL,
                    boxShadow: `inset 0 0 0 1px var(--hairline), 0 0 0 2px ${ringColor}`,
                  }}
                  animate={{
                    scale: isMatch ? 1.06 : isSwap ? 1.04 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                >
                  <motion.span
                    key={v + "-" + i}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {v}
                  </motion.span>
                  {isMatch && (
                    <motion.div
                      className="absolute inset-0 rounded-xl"
                      initial={{ opacity: 0.6, scale: 1 }}
                      animate={{ opacity: 0, scale: 1.4 }}
                      transition={{ duration: 0.9, repeat: Infinity }}
                      style={{ border: "2px solid var(--mint)" }}
                    />
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* above pointers */}
          {[...aboveByIdx.entries()].map(([idx, ps]) => (
            <PointerCaret
              key={`above-${idx}`}
              ps={ps}
              x={idx * (CELL + GAP) + CELL / 2}
              top={CELL + 18 + 8}
              direction="up"
            />
          ))}
          {/* below pointers */}
          {[...belowByIdx.entries()].map(([idx, ps]) => (
            <PointerCaret
              key={`below-${idx}`}
              ps={ps}
              x={idx * (CELL + GAP) + CELL / 2}
              top={18 - 18}
              direction="down"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function PointerCaret({
  ps,
  x,
  top,
  direction,
}: {
  ps: Pointer[];
  x: number;
  top: number;
  direction: "up" | "down";
}) {
  // Stack labels vertically
  return (
    <motion.div
      layoutId={`caret-${ps.map((p) => p.name).join("|")}-${direction}`}
      className="absolute flex flex-col items-center"
      style={{
        left: x,
        top: direction === "up" ? top : undefined,
        bottom: direction === "down" ? 220 - top : undefined,
        transform: "translateX(-50%)",
      }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
    >
      {direction === "up" && (
        <svg width="14" height="10" viewBox="0 0 14 10" className="-mb-px">
          <path d="M7 0 L13 10 L1 10 Z" fill={COLOR_MAP[ps[0].color]} />
        </svg>
      )}
      <div className="flex flex-col items-center gap-0.5">
        {ps.map((p) => (
          <span
            key={p.name}
            className="rounded-md px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider"
            style={{
              color: COLOR_MAP[p.color],
              background: `color-mix(in oklab, ${COLOR_MAP[p.color]} 14%, transparent)`,
              border: `1px solid color-mix(in oklab, ${COLOR_MAP[p.color]} 45%, transparent)`,
            }}
          >
            {p.name}
          </span>
        ))}
      </div>
      {direction === "down" && (
        <svg width="14" height="10" viewBox="0 0 14 10" className="-mt-px">
          <path d="M7 10 L13 0 L1 0 Z" fill={COLOR_MAP[ps[0].color]} />
        </svg>
      )}
    </motion.div>
  );
}
