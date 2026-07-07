import { useEffect, useRef, useState } from "react";
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
  mid: "color-mix(in oklab, var(--violet) 28%, transparent)",
  high: "color-mix(in oklab, var(--amber) 14%, transparent)",
};
const PARTITION_BORDER: Record<"low" | "mid" | "high", string> = {
  low: "color-mix(in oklab, var(--mint) 50%, transparent)",
  mid: "color-mix(in oklab, var(--violet) 75%, transparent)",
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
  if (n <= 14) return { CELL: 44, GAP: 6 };
  return { CELL: 34, GAP: 5 };
}

export function ArrayCanvas({ step }: { step: ArrayStep }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      setContainerWidth(entries[0].contentRect.width);
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const array = step.array ?? [];
  const pointers = step.pointers ?? [];
  const partitions = step.partitions ?? [];
  const highlight = step.highlight;
  const n = array.length;
  const { CELL, GAP } = sizing(Math.max(1, n));
  const desiredWidth = n * CELL + (n - 1) * GAP;
  const padding = 48; // px-6 is 24px each side
  const scale =
    containerWidth > 0 && desiredWidth > containerWidth - padding
      ? (containerWidth - padding) / desiredWidth
      : 1;

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
    <div ref={containerRef} className="relative h-full w-full overflow-hidden">
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

      <div className="absolute inset-0 flex items-center justify-center">
        {(() => {
          // Vertical layout (pre-scale):
          //   0..14   index ruler
          //   18..50  above-caret zone (label + downward triangle)
          //   54..54+CELL   cells row
          //   58+CELL..    below-caret zone (upward triangle + label)
          const RULER_H = 14;
          const ABOVE_ZONE = 36;
          const CELLS_TOP = RULER_H + 4 + ABOVE_ZONE; // 54
          const BELOW_ZONE = 36;
          const totalHeight = CELLS_TOP + CELL + 4 + BELOW_ZONE;
          return (
            <div
              className="relative origin-center shrink-0"
              style={{
                width: desiredWidth,
                height: totalHeight,
                transform: `scale(${scale})`,
              }}
            >
              {/* partition bands — aligned to the cells row */}
              {partitions.map((p, i) => {
                if (p.to < p.from) return null;
                const left = p.from * (CELL + GAP) - 4;
                const width = (p.to - p.from + 1) * CELL + (p.to - p.from) * GAP + 8;
                return (
                  <div
                    key={`${p.tone}-${i}`}
                    className="absolute rounded-xl"
                    style={{
                      left,
                      width,
                      top: CELLS_TOP - 4,
                      height: CELL + 8,
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
                  </div>
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
              <div className="absolute left-0 flex" style={{ gap: GAP, top: CELLS_TOP }}>
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
                      className={cn(
                        "relative grid place-items-center rounded-xl bg-surface-2 font-mono text-xl font-medium text-foreground",
                      )}
                      style={{
                        width: CELL,
                        height: CELL,
                        boxShadow: `inset 0 0 0 1px var(--hairline), 0 0 0 2px ${ringColor}`,
                      }}
                      animate={{ scale: isMatch ? 1.06 : isSwap ? 1.04 : 1 }}
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

              {/* above pointers — sit ABOVE the cells, triangle pointing DOWN */}
              {[...aboveByIdx.entries()].map(([idx, ps]) => (
                <PointerCaret
                  key={`above-${idx}`}
                  ps={ps}
                  x={idx * (CELL + GAP) + CELL / 2}
                  anchorY={CELLS_TOP - 2}
                  direction="above"
                />
              ))}
              {/* below pointers — sit BELOW the cells, triangle pointing UP */}
              {[...belowByIdx.entries()].map(([idx, ps]) => (
                <PointerCaret
                  key={`below-${idx}`}
                  ps={ps}
                  x={idx * (CELL + GAP) + CELL / 2}
                  anchorY={CELLS_TOP + CELL + 2}
                  direction="below"
                />
              ))}
            </div>
          );
        })()}
      </div>
    </div>
  );
}

function PointerCaret({
  ps,
  x,
  anchorY,
  direction,
}: {
  ps: Pointer[];
  x: number;
  /** y-coordinate the triangle tip points to */
  anchorY: number;
  /** "above" = caret above the cell (triangle ↓); "below" = caret below the cell (triangle ↑) */
  direction: "above" | "below";
}) {
  // Outer wrapper handles absolute positioning so motion's transforms don't
  // override the horizontal centering. The inner motion.div animates entry.
  return (
    <div
      className="pointer-events-none absolute"
      style={{
        left: x,
        top: anchorY,
        transform: direction === "above" ? "translate(-50%, -100%)" : "translateX(-50%)",
      }}
    >
      <motion.div
        key={`${direction}-${ps.map((p) => p.name).join("|")}`}
        initial={{ opacity: 0, y: direction === "above" ? -4 : 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="flex flex-col items-center"
      >
        {direction === "below" && (
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
        {direction === "above" && (
          <svg width="14" height="10" viewBox="0 0 14 10" className="-mt-px">
            <path d="M7 10 L13 0 L1 0 Z" fill={COLOR_MAP[ps[0].color]} />
          </svg>
        )}
      </motion.div>
    </div>
  );
}
