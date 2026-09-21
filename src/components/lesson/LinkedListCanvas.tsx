import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import type { LinkedListShape, LinkedListStep, Pointer } from "@/lessons/types";

const COLOR_MAP: Record<Pointer["color"], string> = {
  mint: "var(--mint)",
  amber: "var(--amber)",
  violet: "var(--violet)",
  rose: "var(--rose)",
};

function sizing(n: number) {
  if (n <= 5) return { NODE: 52, GAP_X: 30 };
  if (n <= 7) return { NODE: 40, GAP_X: 22 };
  if (n <= 10) return { NODE: 34, GAP_X: 16 };
  return { NODE: 28, GAP_X: 12 };
}

export function LinkedListCanvas({
  step,
  shape,
}: {
  step: LinkedListStep;
  shape: LinkedListShape;
}) {
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
  const n = shape.nodes;
  const labels = shape.labels ?? Array.from({ length: n }, (_, i) => String(i));
  const { NODE, GAP_X } = sizing(n);

  const totalWidth = n * NODE + (n - 1) * GAP_X;
  const positions = Array.from({ length: n }, (_, i) => i * (NODE + GAP_X) + NODE / 2);

  // group pointers by node index
  const above: Pointer[][] = positions.map(() => []);
  const below: Pointer[][] = positions.map(() => []);
  for (const p of step.pointers) {
    if (p.index < 0 || p.index >= n) continue;
    (p.placement === "below" ? below : above)[p.index].push(p);
  }

  const padding = 48; // px-6 is 24px each side
  const desiredWidth = totalWidth + 40;
  const scale =
    containerWidth > 0 && desiredWidth > containerWidth - padding
      ? (containerWidth - padding) / desiredWidth
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
        <div
          className="relative origin-center shrink-0"
          style={{ width: desiredWidth, height: 260, transform: `scale(${scale})` }}
        >
          <svg
            width={desiredWidth}
            height={260}
            className="absolute inset-0"
            style={{ overflow: "visible" }}
          >
            {/* straight arrows i -> i+1 */}
            {positions.map((cx, i) => {
              if (i === n - 1) return null;
              const x1 = cx + NODE / 2 + 20;
              const x2 = positions[i + 1] - NODE / 2 + 20;
              const y = 130;
              return (
                <g key={`arr-${i}`}>
                  <line
                    x1={x1}
                    y1={y}
                    x2={x2 - 8}
                    y2={y}
                    stroke="var(--hairline)"
                    strokeWidth="1.5"
                  />
                  <polygon
                    points={`${x2 - 8},${y - 4} ${x2 - 8},${y + 4} ${x2 - 1},${y}`}
                    fill="var(--hairline)"
                  />
                </g>
              );
            })}

            {/* cycle arrow from last node back to cycleTo */}
            {shape.cycleTo >= 0 &&
              (() => {
                const from = positions[n - 1] + 20;
                const to = positions[shape.cycleTo] + 20;
                const top = 130;
                const arcY = 210;
                const d = `M ${from} ${top + NODE / 2 - 4} C ${from} ${arcY}, ${to} ${arcY}, ${to} ${top + NODE / 2 - 4}`;
                return (
                  <g>
                    <path
                      d={d}
                      fill="none"
                      stroke="var(--violet)"
                      strokeOpacity="0.6"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                    />
                    <polygon
                      points={`${to - 4},${top + NODE / 2 - 4} ${to + 4},${top + NODE / 2 - 4} ${to},${top + NODE / 2 + 3}`}
                      fill="var(--violet)"
                    />
                  </g>
                );
              })()}
          </svg>

          {/* nodes */}
          {positions.map((cx, i) => {
            const hit =
              step.highlight && step.highlight.indices.includes(i) ? step.highlight.kind : null;
            const ring =
              hit === "match" ? "var(--mint)" : hit === "compare" ? "var(--violet)" : "transparent";
            return (
              <motion.div
                key={i}
                className="absolute grid place-items-center rounded-full bg-surface-2 font-mono text-base font-medium text-foreground"
                style={{
                  left: cx - NODE / 2 + 20,
                  top: 130 - NODE / 2,
                  width: NODE,
                  height: NODE,
                  boxShadow: `inset 0 0 0 1px var(--hairline), 0 0 0 2px ${ring}`,
                }}
                animate={{ scale: hit === "match" ? 1.08 : 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
              >
                {labels[i]}
                {hit === "match" && (
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    initial={{ opacity: 0.6, scale: 1 }}
                    animate={{ opacity: 0, scale: 1.5 }}
                    transition={{ duration: 0.9, repeat: Infinity }}
                    style={{ border: "2px solid var(--mint)" }}
                  />
                )}
              </motion.div>
            );
          })}

          {/* above pointers — sit clearly above the node */}
          {above.map((ps, i) =>
            ps.length === 0 ? null : (
              <PointerCaret
                key={`above-${i}`}
                ps={ps}
                x={positions[i] + 20}
                y={130 - NODE / 2 - 26}
                direction="down"
              />
            ),
          )}
          {/* below pointers — sit clearly below the node */}
          {below.map((ps, i) =>
            ps.length === 0 ? null : (
              <PointerCaret
                key={`below-${i}`}
                ps={ps}
                x={positions[i] + 20}
                y={130 + NODE / 2 + 26}
                direction="up"
              />
            ),
          )}
        </div>
      </div>
    </div>
  );
}

function PointerCaret({
  ps,
  x,
  y,
  direction,
}: {
  ps: Pointer[];
  x: number;
  y: number;
  direction: "up" | "down";
}) {
  return (
    <motion.div
      layoutId={`ll-caret-${ps.map((p) => p.name).join("|")}-${direction}`}
      className="absolute flex flex-col items-center"
      style={{
        left: x,
        top: y,
        transform: "translate(-50%, " + (direction === "down" ? "-100%" : "0") + ")",
      }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
    >
      {direction === "down" && (
        <svg width="14" height="10" viewBox="0 0 14 10">
          <path d="M7 10 L13 0 L1 0 Z" fill={COLOR_MAP[ps[0].color]} />
        </svg>
      )}
      <div className="flex flex-col items-center gap-0.5 py-0.5">
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
      {direction === "up" && (
        <svg width="14" height="10" viewBox="0 0 14 10">
          <path d="M7 0 L13 10 L1 10 Z" fill={COLOR_MAP[ps[0].color]} />
        </svg>
      )}
    </motion.div>
  );
}
