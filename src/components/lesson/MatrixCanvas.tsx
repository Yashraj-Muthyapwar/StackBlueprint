import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import type { CellPointer, CellTone, Step, PointerColor } from "@/lessons/types";

const COLOR_MAP: Record<PointerColor, string> = {
  mint: "var(--mint)",
  amber: "var(--amber)",
  violet: "var(--violet)",
  rose: "var(--rose)",
};

const TONE_RING: Record<CellTone, string> = {
  compare: "var(--violet)",
  swap: "var(--rose)",
  match: "var(--mint)",
  visit: "var(--amber)",
};

const TONE_BG: Record<CellTone, string> = {
  compare: "color-mix(in oklab, var(--violet) 18%, transparent)",
  swap: "color-mix(in oklab, var(--rose) 22%, transparent)",
  match: "color-mix(in oklab, var(--mint) 22%, transparent)",
  visit: "color-mix(in oklab, var(--amber) 16%, transparent)",
};

function sizing(rows: number, cols: number) {
  const m = Math.max(rows, cols);
  if (m <= 4) return { CELL: 54, GAP: 6 };
  if (m <= 6) return { CELL: 44, GAP: 5 };
  if (m <= 8) return { CELL: 36, GAP: 4 };
  return { CELL: 30, GAP: 3 };
}

export function MatrixCanvas({ step }: { step: Step }) {
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

  const matrix = step.matrix ?? [];
  const rows = matrix.length;
  const cols = matrix[0]?.length ?? 0;
  const { CELL, GAP } = sizing(rows, cols);

  const highlightMap = new Map<string, CellTone>();
  for (const h of step.cellHighlights ?? []) highlightMap.set(`${h.r}-${h.c}`, h.tone);

  const pointerMap = new Map<string, CellPointer[]>();
  for (const p of step.cellPointers ?? []) {
    const k = `${p.r}-${p.c}`;
    if (!pointerMap.has(k)) pointerMap.set(k, []);
    pointerMap.get(k)!.push(p);
  }

  const width = cols * CELL + (cols - 1) * GAP;
  const height = rows * CELL + (rows - 1) * GAP;

  const rect = step.matrixRect;
  const rectTone = rect?.tone ?? "violet";

  const padding = 48; // px-6 is 24px each side
  const scale =
    containerWidth > 0 && width > containerWidth - padding
      ? (containerWidth - padding) / width
      : 1;

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden">
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
        <div className="relative origin-center shrink-0" style={{ width, height, transform: `scale(${scale})` }}>
          {/* rect overlay */}
          {rect && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="pointer-events-none absolute rounded-lg"
              style={{
                left: rect.c1 * (CELL + GAP) - 3,
                top: rect.r1 * (CELL + GAP) - 3,
                width: (rect.c2 - rect.c1 + 1) * CELL + (rect.c2 - rect.c1) * GAP + 6,
                height: (rect.r2 - rect.r1 + 1) * CELL + (rect.r2 - rect.r1) * GAP + 6,
                border: `1.5px dashed color-mix(in oklab, var(--${rectTone}) 70%, transparent)`,
                background: `color-mix(in oklab, var(--${rectTone}) 10%, transparent)`,
              }}
            />
          )}

          {matrix.map((row, r) =>
            row.map((v, c) => {
              const k = `${r}-${c}`;
              const tone = highlightMap.get(k);
              const ring = tone ? TONE_RING[tone] : "transparent";
              const bg = tone ? TONE_BG[tone] : undefined;
              const ps = pointerMap.get(k) ?? [];
              return (
                <motion.div
                  key={k}
                  layout
                  className="absolute grid place-items-center rounded-md bg-surface-2 font-mono font-medium text-foreground"
                  style={{
                    left: c * (CELL + GAP),
                    top: r * (CELL + GAP),
                    width: CELL,
                    height: CELL,
                    fontSize: CELL < 36 ? 11 : 14,
                    background: bg ?? "var(--surface-2)",
                    boxShadow: `inset 0 0 0 1px var(--hairline), 0 0 0 2px ${ring}`,
                  }}
                  animate={{ scale: tone === "match" ? 1.06 : tone === "swap" ? 1.04 : 1 }}
                  transition={{ type: "spring", stiffness: 280, damping: 22 }}
                >
                  <motion.span key={String(v) + "-" + k} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {v}
                  </motion.span>
                  {ps.length > 0 && (
                    <div className="absolute -top-3.5 left-1/2 flex -translate-x-1/2 gap-0.5">
                      {ps.map((p) => (
                        <span
                          key={p.name}
                          className="rounded px-1 py-px font-mono text-[9px] font-semibold uppercase tracking-wider"
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
                  )}
                </motion.div>
              );
            }),
          )}
        </div>
      </div>
    </div>
  );
}
