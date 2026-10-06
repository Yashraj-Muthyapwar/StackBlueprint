import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import type { ArrayStep, BoundaryTrack, Partition, Pointer } from "@/lessons/types";

const COLOR_MAP: Record<Pointer["color"], string> = {
  mint: "var(--mint)",
  amber: "var(--amber)",
  violet: "var(--violet)",
  rose: "var(--rose)",
};

const PARTITION_BG: Record<Partition["tone"], string> = {
  low: "color-mix(in oklab, var(--mint) 14%, transparent)",
  mid: "color-mix(in oklab, var(--violet) 28%, transparent)",
  high: "color-mix(in oklab, var(--amber) 14%, transparent)",
  unknown: "color-mix(in oklab, var(--foreground) 5%, transparent)",
};
const PARTITION_BORDER: Record<Partition["tone"], string> = {
  low: "color-mix(in oklab, var(--mint) 50%, transparent)",
  mid: "color-mix(in oklab, var(--violet) 75%, transparent)",
  high: "color-mix(in oklab, var(--amber) 55%, transparent)",
  unknown: "color-mix(in oklab, var(--foreground) 30%, transparent)",
};
const PARTITION_LABEL: Record<Partition["tone"], string> = {
  low: "var(--mint)",
  mid: "var(--violet)",
  high: "var(--amber)",
  unknown: "color-mix(in oklab, var(--foreground) 70%, transparent)",
};

/** Ring color drawn around a highlighted cell, by highlight kind. */
const RING: Record<"compare" | "swap" | "match", string> = {
  compare: "var(--violet)",
  swap: "var(--rose)",
  match: "var(--mint)",
};
const RING_KINDS = ["compare", "swap", "match"] as const;

const BAND_SPRING = { type: "spring" as const, stiffness: 260, damping: 28 };

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
  const dimmed = new Set(step.dimmed ?? []);
  const badges = step.badges ?? [];
  const track = step.track;
  const n = array.length;
  const { CELL, GAP } = sizing(Math.max(1, n));
  const rowWidth = n * CELL + (n - 1) * GAP;
  // Boundary chips hang half a cell past each end of the row, so reserve room for them.
  const PAD = track ? Math.ceil(CELL / 2) + 2 : 0;
  const desiredWidth = rowWidth + 2 * PAD;
  const padding = 48; // px-6 is 24px each side
  const scale =
    containerWidth > 0 && desiredWidth > containerWidth - padding
      ? (containerWidth - padding) / desiredWidth
      : 1;

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden">
      {/* Status pill */}
      {step.status && (
        <div className="pointer-events-none absolute inset-x-3 top-3 z-20 flex justify-center">
          <motion.div
            key={step.status}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-full rounded-full border border-hairline bg-surface/90 px-3 py-1 text-center font-mono text-xs text-foreground backdrop-blur"
          >
            {step.status}
          </motion.div>
        </div>
      )}

      <div className="absolute inset-0 flex items-center justify-center">
        {(() => {
          // Vertical layout (pre-scale):
          //   0..24            band label lane (label text + bracket)
          //   26..40           index ruler
          //   44..80           above-caret zone (label + downward triangle)
          //   80..80+CELL      cells row
          //   +4..+48          below-caret zone, link bracket, badges
          const LABEL_H = 24;
          const RULER_TOP = LABEL_H + 2;
          const RULER_H = 14;
          const ABOVE_ZONE = 36;
          const CELLS_TOP = RULER_TOP + RULER_H + 4 + ABOVE_ZONE; // 80
          const BELOW_ZONE = 44;
          // Boundary track sits under the badge zone: chip row, index row, caption.
          const TRACK_TOP = CELLS_TOP + CELL + 36;
          const CHIP_H = 30;
          const totalHeight = track
            ? TRACK_TOP + CHIP_H + 42
            : CELLS_TOP + CELL + 4 + BELOW_ZONE;
          const bandGeom = (p: Partition) => ({
            left: p.from * (CELL + GAP) - 4,
            width: (p.to - p.from + 1) * CELL + (p.to - p.from) * GAP + 8,
          });
          return (
            <div
              className="relative origin-center shrink-0"
              style={{
                width: desiredWidth,
                height: totalHeight,
                transform: `scale(${scale})`,
              }}
            >
              <div className="absolute" style={{ left: PAD, top: 0, width: rowWidth, height: totalHeight }}>
              {/* partition bands — aligned to the cells row, they glide when they move */}
              {partitions.map((p, i) => {
                if (p.to < p.from) return null;
                const { left, width } = bandGeom(p);
                return (
                  <motion.div
                    key={`${p.tone}-${i}`}
                    className="absolute rounded-xl"
                    initial={false}
                    animate={{ left, width }}
                    transition={BAND_SPRING}
                    style={{
                      top: CELLS_TOP - 4,
                      height: CELL + 8,
                      background: PARTITION_BG[p.tone],
                      border: `1px dashed ${PARTITION_BORDER[p.tone]}`,
                    }}
                  />
                );
              })}

              {/* band labels — drawn in their own lane above everything, as a bracket
                  reaching down to the band, so they never hide behind cells or carets */}
              {partitions.map((p, i) => {
                if (p.to < p.from || !p.label) return null;
                const { left, width } = bandGeom(p);
                const edge = PARTITION_BORDER[p.tone];
                return (
                  <motion.div
                    key={`label-${p.tone}-${i}`}
                    className="pointer-events-none absolute"
                    initial={false}
                    animate={{ left, width }}
                    transition={BAND_SPRING}
                    style={{ top: 0, height: CELLS_TOP - 4 }}
                  >
                    <div className="absolute inset-x-0 top-0 flex justify-center">
                      <span
                        className="whitespace-nowrap rounded-md bg-surface/90 px-1.5 py-0.5 font-mono text-xs font-semibold"
                        style={{ color: PARTITION_LABEL[p.tone] }}
                      >
                        {p.label}
                      </span>
                    </div>
                    <div
                      className="absolute inset-x-0 bottom-0"
                      style={{
                        top: 22,
                        borderTop: `1.5px solid ${edge}`,
                        borderLeft: `1.5px dotted ${edge}`,
                        borderRight: `1.5px dotted ${edge}`,
                        borderTopLeftRadius: 6,
                        borderTopRightRadius: 6,
                      }}
                    />
                  </motion.div>
                );
              })}

              {/* index ruler */}
              <div className="absolute left-0 right-0" style={{ top: RULER_TOP }}>
                <div className="flex" style={{ gap: GAP }}>
                  {array.map((_, i) => (
                    <div
                      key={i}
                      className="text-center font-mono text-[11px] text-muted-foreground"
                      style={{ width: CELL, opacity: dimmed.has(i) ? 0.35 : 1 }}
                    >
                      {i}
                    </div>
                  ))}
                </div>
              </div>

              {/* cells */}
              <div className="absolute left-0 flex" style={{ gap: GAP, top: CELLS_TOP }}>
                {array.map((v, i) => {
                  const kind = highlight && highlight.indices.includes(i) ? highlight.kind : null;
                  const isMatch = kind === "match";
                  const isSwap = kind === "swap";
                  const isDead = dimmed.has(i);
                  // Position within the highlighted group, used to stagger the one-shot pulse left to right.
                  const rank = highlight ? Math.max(0, highlight.indices.indexOf(i)) : 0;
                  return (
                    <motion.div
                      key={i}
                      className={cn(
                        "relative grid place-items-center rounded-xl bg-surface-2 font-mono text-xl font-medium text-foreground",
                      )}
                      style={{
                        width: CELL,
                        height: CELL,
                        boxShadow: "inset 0 0 0 1px var(--hairline)",
                      }}
                      animate={{
                        scale: isMatch ? 1.05 : isSwap ? 1.04 : isDead ? 0.94 : 1,
                        opacity: isDead ? 0.25 : 1,
                      }}
                      transition={{ type: "spring", stiffness: 300, damping: 22 }}
                    >
                      {/* highlight rings: one overlay per kind, crossfaded so changes never snap */}
                      {RING_KINDS.map((k) => (
                        <motion.span
                          key={k}
                          aria-hidden
                          className="pointer-events-none absolute -inset-[2px] rounded-[14px]"
                          initial={false}
                          animate={{ opacity: kind === k ? 1 : 0 }}
                          transition={{ duration: 0.22, ease: "easeOut" }}
                          style={{
                            border: `2px solid ${RING[k]}`,
                            boxShadow:
                              k === "match"
                                ? "0 0 14px color-mix(in oklab, var(--mint) 40%, transparent)"
                                : undefined,
                          }}
                        />
                      ))}

                      <motion.span
                        key={v + "-" + i}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={isDead ? "line-through decoration-2" : ""}
                      >
                        {v}
                      </motion.span>

                      {/* badges under the cell, e.g. "+7" entering / "−2" leaving a window */}
                      {badges
                        .filter((b) => b.index === i)
                        .map((b) => (
                          <motion.span
                            key={`${b.tone}-${b.text}`}
                            initial={{ opacity: 0, y: -6, scale: 0.85 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ type: "spring", stiffness: 320, damping: 24 }}
                            className="pointer-events-none absolute -bottom-7 left-1/2 whitespace-nowrap rounded-md px-1.5 py-0.5 font-mono text-[11px] font-semibold"
                            style={{
                              x: "-50%",
                              color: COLOR_MAP[b.tone],
                              background: `color-mix(in oklab, ${COLOR_MAP[b.tone]} 14%, transparent)`,
                              border: `1px solid color-mix(in oklab, ${COLOR_MAP[b.tone]} 45%, transparent)`,
                            }}
                          >
                            {b.text}
                          </motion.span>
                        ))}

                      {/* one-shot pulse when a cell becomes a match (no endless blinking) */}
                      {isMatch && (
                        <motion.span
                          key="pulse"
                          aria-hidden
                          className="pointer-events-none absolute inset-0 rounded-xl"
                          initial={{ opacity: 0, scale: 1 }}
                          animate={{ opacity: [0.55, 0], scale: [1, 1.3] }}
                          transition={{ duration: 0.7, ease: "easeOut", delay: rank * 0.07 }}
                          style={{ border: "2px solid var(--mint)" }}
                        />
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* sum-vs-target bracket under the two compared cells */}
              {step.link && (() => {
                const x1 = step.link.from * (CELL + GAP) + CELL / 2;
                const x2 = step.link.to * (CELL + GAP) + CELL / 2;
                const y = CELLS_TOP + CELL + 8;
                return (
                  <motion.svg
                    key={`${step.link.from}-${step.link.to}-${step.link.label}`}
                    className="pointer-events-none absolute left-0 top-0 overflow-visible"
                    width={rowWidth}
                    height={totalHeight}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <path
                      d={`M${x1} ${y} v10 H${x2} v-10`}
                      fill="none"
                      stroke="var(--violet)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <text
                      x={(x1 + x2) / 2}
                      y={y + 30}
                      textAnchor="middle"
                      className="fill-foreground font-mono text-[12px]"
                    >
                      {step.link.label}
                    </text>
                  </motion.svg>
                );
              })()}

              {/* boundary track: prefix values live on the gaps between cells */}
              {track && (
                <BoundaryTrackView
                  track={track}
                  n={n}
                  cell={CELL}
                  gap={GAP}
                  cellsTop={CELLS_TOP}
                  trackTop={TRACK_TOP}
                  chipH={CHIP_H}
                  rowWidth={rowWidth}
                />
              )}

              {/* pointers — one caret per pointer, keyed by name so it glides between indices */}
              {pointers.map((p) => {
                const dir: "above" | "below" = p.placement === "below" ? "below" : "above";
                const stack = pointers
                  .filter((q) => (q.placement === "below") === (dir === "below") && q.index === p.index)
                  .indexOf(p);
                return (
                  <PointerCaret
                    key={p.name}
                    p={p}
                    stack={stack}
                    direction={dir}
                    x={p.index * (CELL + GAP) + CELL / 2}
                    anchorY={dir === "above" ? CELLS_TOP - 2 : CELLS_TOP + CELL + 2}
                  />
                );
              })}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

function PointerCaret({
  p,
  x,
  anchorY,
  direction,
  stack,
}: {
  p: Pointer;
  /** x-coordinate of the cell center the caret points to */
  x: number;
  /** y-coordinate the triangle tip points to */
  anchorY: number;
  /** "above" = caret above the cell (triangle ↓); "below" = caret below the cell (triangle ↑) */
  direction: "above" | "below";
  /** 0 for the first pointer on this cell, 1+ when several pointers share an index */
  stack: number;
}) {
  const offset = stack * 20 * (direction === "above" ? -1 : 1);
  const color = COLOR_MAP[p.color];
  return (
    <motion.div
      className="pointer-events-none absolute flex flex-col items-center"
      style={{ x: "-50%", y: direction === "above" ? "-100%" : 0 }}
      initial={false}
      animate={{ left: x, top: anchorY + offset }}
      transition={{ type: "spring", stiffness: 260, damping: 26 }}
    >
      {direction === "below" && stack === 0 && (
        <svg width="14" height="10" viewBox="0 0 14 10" className="-mb-px">
          <path d="M7 0 L13 10 L1 10 Z" fill={color} />
        </svg>
      )}
      <span
        className="rounded-md px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider"
        style={{
          color,
          background: `color-mix(in oklab, ${color} 14%, transparent)`,
          border: `1px solid color-mix(in oklab, ${color} 45%, transparent)`,
        }}
      >
        {p.name}
      </span>
      {direction === "above" && stack === 0 && (
        <svg width="14" height="10" viewBox="0 0 14 10" className="-mt-px">
          <path d="M7 10 L13 0 L1 0 Z" fill={color} />
        </svg>
      )}
    </motion.div>
  );
}

function BoundaryTrackView({
  track,
  n,
  cell,
  gap,
  cellsTop,
  trackTop,
  chipH,
  rowWidth,
}: {
  track: BoundaryTrack;
  n: number;
  cell: number;
  gap: number;
  cellsTop: number;
  trackTop: number;
  chipH: number;
  rowWidth: number;
}) {
  const marks = new Map((track.marks ?? []).map((m) => [m.index, m]));
  // Boundary j is the gap just before arr[j]; boundary n is the right edge of the last cell.
  const cx = (j: number) => j * (cell + gap) - gap / 2;
  const count = n + 1;
  const fontSize = cell < 40 ? 11 : 14;

  return (
    <>
      {/* boundary lines: faint ticks everywhere, a bold line up through the array for marked boundaries */}
      {Array.from({ length: count }, (_, j) => {
        const mark = marks.get(j);
        const color = mark ? COLOR_MAP[mark.tone] : "var(--hairline)";
        const top = mark ? cellsTop - 8 : cellsTop + cell;
        return (
          <motion.div
            key={`line-${j}`}
            aria-hidden
            className="pointer-events-none absolute"
            initial={false}
            animate={{ top, height: trackTop - top, backgroundColor: color, opacity: mark ? 0.9 : 0.7 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            style={{ left: cx(j) - (mark ? 1 : 0.5), width: mark ? 2 : 1 }}
          />
        );
      })}

      {Array.from({ length: count }, (_, j) => {
        const v = track.values[j] ?? null;
        const mark = marks.get(j);
        const color = mark ? COLOR_MAP[mark.tone] : null;
        const empty = v === null;
        return (
          <div
            key={`chip-${j}`}
            className="absolute"
            style={{ left: cx(j) - cell / 2, top: trackTop, width: cell, height: chipH }}
          >
            <motion.div
              className="relative grid h-full w-full place-items-center rounded-lg font-mono font-medium text-foreground"
              initial={false}
              animate={{ scale: mark ? 1.08 : 1 }}
              transition={{ type: "spring", stiffness: 320, damping: 22 }}
              style={{
                fontSize,
                background: empty
                  ? "transparent"
                  : color
                    ? `color-mix(in oklab, ${color} 16%, var(--surface-2))`
                    : "var(--surface-2)",
                boxShadow: empty
                  ? undefined
                  : color
                    ? `inset 0 0 0 1.5px ${color}`
                    : "inset 0 0 0 1px var(--hairline)",
                border: empty ? `1.5px dashed ${color ?? "var(--hairline)"}` : undefined,
              }}
            >
              {empty ? (
                <span style={{ color: color ?? undefined }} className={color ? "" : "text-muted-foreground/40"}>
                  {color ? "?" : "·"}
                </span>
              ) : (
                <motion.span
                  key={String(v)}
                  initial={{ opacity: 0, y: -6, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 340, damping: 24 }}
                >
                  {v}
                </motion.span>
              )}
              {mark?.sign && color && (
                <motion.span
                  key={mark.sign}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute -right-2 -top-2 grid size-4 place-items-center rounded-full font-mono text-[11px] font-bold leading-none"
                  style={{ background: color, color: "var(--background)" }}
                >
                  {mark.sign}
                </motion.span>
              )}
            </motion.div>
            <div
              className="absolute left-0 right-0 text-center font-mono text-[11px] text-muted-foreground"
              style={{ top: chipH + 4 }}
            >
              {j}
            </div>
          </div>
        );
      })}

      <div
        className="pointer-events-none absolute left-0 text-center font-mono text-[11px] text-muted-foreground"
        style={{ top: trackTop + chipH + 24, width: rowWidth }}
      >
        {track.label}
      </div>
    </>
  );
}
