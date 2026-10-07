import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import type {
  CellHighlight,
  CellNote,
  CellPointer,
  CellTone,
  MatrixRect,
  PointerColor,
  Step,
} from "@/lessons/types";

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

/** Two grids side by side need smaller cells than one grid alone. */
function dualSizing(rows: number, cols: number) {
  const m = Math.max(rows, cols);
  if (m <= 5) return { CELL: 42, GAP: 5 };
  if (m <= 7) return { CELL: 36, GAP: 4 };
  return { CELL: 30, GAP: 3 };
}

// Chrome around a grid when it is drawn with titles and row/column indices.
const GUTTER = 18; // row index column
const TITLE_H = 20;
const RULER_H = 16; // column index row
const SEPARATOR = 44; // space between the two grids

type GridProps = {
  matrix: (number | null)[][];
  cell: number;
  gap: number;
  highlights?: CellHighlight[];
  pointers?: CellPointer[];
  notes?: CellNote[];
  rects?: MatrixRect[];
  title?: string;
  /** Draw row / column indices and corner badges (dual mode). Off keeps the original single-grid look. */
  decorated: boolean;
  /** Dim row 0 and column 0: the zero border of a prefix matrix. */
  border?: boolean;
};

function gridSize(rows: number, cols: number, cell: number, gap: number, decorated: boolean, hasTitle: boolean) {
  const left = decorated ? GUTTER : 0;
  const top = (hasTitle ? TITLE_H : 0) + (decorated ? RULER_H : 0);
  return {
    left,
    top,
    width: left + cols * cell + Math.max(0, cols - 1) * gap,
    height: top + rows * cell + Math.max(0, rows - 1) * gap,
  };
}

function Grid({ matrix, cell, gap, highlights, pointers, notes, rects, title, decorated, border }: GridProps) {
  const rows = matrix.length;
  const cols = matrix[0]?.length ?? 0;
  const { left, top, width, height } = gridSize(rows, cols, cell, gap, decorated, !!title);
  const stride = cell + gap;

  const highlightMap = new Map<string, CellTone>();
  for (const h of highlights ?? []) highlightMap.set(`${h.r}-${h.c}`, h.tone);

  const pointerMap = new Map<string, CellPointer[]>();
  for (const p of pointers ?? []) {
    const k = `${p.r}-${p.c}`;
    if (!pointerMap.has(k)) pointerMap.set(k, []);
    pointerMap.get(k)!.push(p);
  }

  const noteMap = new Map<string, CellNote>();
  for (const n of notes ?? []) noteMap.set(`${n.r}-${n.c}`, n);

  return (
    <div className="relative shrink-0" style={{ width, height }}>
      {title && (
        <div
          className="absolute font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground"
          style={{ left, top: 0, whiteSpace: "nowrap" }}
        >
          {title}
        </div>
      )}

      {decorated &&
        Array.from({ length: cols }, (_, c) => (
          <div
            key={`ci-${c}`}
            className="absolute text-center font-mono text-[10px] text-muted-foreground"
            style={{ left: left + c * stride, top: title ? TITLE_H : 0, width: cell, lineHeight: `${RULER_H}px` }}
          >
            {c}
          </div>
        ))}
      {decorated &&
        Array.from({ length: rows }, (_, r) => (
          <div
            key={`ri-${r}`}
            className="absolute pr-1 text-right font-mono text-[10px] text-muted-foreground"
            style={{ left: 0, top: top + r * stride, width: GUTTER, lineHeight: `${cell}px` }}
          >
            {r}
          </div>
        ))}

      <div className="absolute" style={{ left, top }}>
        {/* rect overlays */}
        {rects?.map((rect, i) => {
          const tone = rect.tone ?? "violet";
          const w = (rect.c2 - rect.c1 + 1) * cell + (rect.c2 - rect.c1) * gap + 6;
          const h = (rect.r2 - rect.r1 + 1) * cell + (rect.r2 - rect.r1) * gap + 6;
          return (
            <motion.div
              key={`rect-${i}-${tone}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, left: rect.c1 * stride - 3, top: rect.r1 * stride - 3, width: w, height: h }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              className="pointer-events-none absolute rounded-lg"
              style={{
                border: `${rect.outline ? 2 : 1.5}px dashed color-mix(in oklab, var(--${tone}) ${rect.outline ? 85 : 70}%, transparent)`,
                background: rect.outline ? "transparent" : `color-mix(in oklab, var(--${tone}) 18%, transparent)`,
              }}
            />
          );
        })}

        {matrix.map((row, r) =>
          row.map((v, c) => {
            const k = `${r}-${c}`;
            const tone = highlightMap.get(k);
            const ring = tone ? TONE_RING[tone] : "transparent";
            const bg = tone ? TONE_BG[tone] : undefined;
            const ps = pointerMap.get(k) ?? [];
            const empty = v === null;
            const isBorder = !!border && (r === 0 || c === 0);
            return (
              <motion.div
                key={k}
                layout
                className="absolute grid place-items-center rounded-md font-mono font-medium text-foreground"
                style={{
                  left: c * stride,
                  top: r * stride,
                  width: cell,
                  height: cell,
                  fontSize: cell < 36 ? 11 : 14,
                  background: bg ?? (empty ? "transparent" : "var(--surface-2)"),
                  boxShadow: `inset 0 0 0 1px var(--hairline), 0 0 0 2px ${ring}`,
                  opacity: isBorder && !tone ? 0.55 : 1,
                }}
                animate={{ scale: tone === "match" ? 1.06 : tone === "swap" ? 1.04 : 1 }}
                transition={{ type: "spring", stiffness: 280, damping: 22 }}
              >
                {empty ? (
                  <span className="text-muted-foreground/40">{tone ? "?" : "·"}</span>
                ) : (
                  <motion.span key={String(v) + "-" + k} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}>
                    {v}
                  </motion.span>
                )}
                {noteMap.has(k) && (
                  <span
                    className="pointer-events-none absolute bottom-0.5 right-1 font-mono font-semibold leading-none"
                    style={{
                      fontSize: cell < 36 ? 8 : 10,
                      color: COLOR_MAP[noteMap.get(k)!.color ?? "amber"],
                    }}
                  >
                    {noteMap.get(k)!.text}
                  </span>
                )}
                {ps.length > 0 && !decorated && (
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
                {ps.length > 0 && decorated && (
                  <div className="absolute -right-2 -top-2 z-10 flex gap-0.5">
                    {ps.map((p) => (
                      <motion.span
                        key={p.name}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="grid min-w-4 place-items-center rounded-full px-1 font-mono text-[11px] font-bold leading-4"
                        style={{ background: COLOR_MAP[p.color], color: "var(--background)" }}
                      >
                        {p.name}
                      </motion.span>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          }),
        )}
      </div>
    </div>
  );
}

export function MatrixCanvas({ step }: { step: Step }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const r = entries[0].contentRect;
      setBox({ w: r.width, h: r.height });
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const matrix = step.matrix ?? [];
  const matrix2 = step.matrix2;
  const dual = !!matrix2 && matrix2.length > 0;
  const rows = matrix.length;
  const cols = matrix[0]?.length ?? 0;

  const rects: MatrixRect[] = [...(step.matrixRect ? [step.matrixRect] : []), ...(step.matrixRects ?? [])];

  let content: React.ReactNode;
  let width: number;
  let height: number;

  if (dual && matrix2) {
    const rows2 = matrix2.length;
    const cols2 = matrix2[0]?.length ?? 0;
    const { CELL, GAP } = dualSizing(Math.max(rows, rows2), Math.max(cols, cols2));
    const g1 = gridSize(rows, cols, CELL, GAP, true, true);
    const g2 = gridSize(rows2, cols2, CELL, GAP, true, true);
    // The prefix grid has one more row, so the input grid sits one row lower. That puts input
    // row r at the same height as prefix row r + 1, which is exactly the cell it feeds.
    const aligned = step.matrix2Layout === "aligned";
    const shift = aligned ? 0 : CELL + GAP;
    width = g1.width + SEPARATOR + g2.width;
    height = aligned ? Math.max(g1.height, g2.height) : Math.max(g2.height, g1.height + shift);
    content = (
      <>
        <div className="absolute left-0" style={{ top: shift }}>
          <Grid
            matrix={matrix}
            cell={CELL}
            gap={GAP}
            highlights={step.cellHighlights}
            pointers={step.cellPointers}
            notes={step.cellNotes}
            rects={rects}
            title={step.matrixLabel ?? "matrix"}
            decorated
          />
        </div>
        <div className="absolute top-0" style={{ left: g1.width + SEPARATOR }}>
          <Grid
            matrix={matrix2}
            cell={CELL}
            gap={GAP}
            highlights={step.cellHighlights2}
            pointers={step.cellPointers2}
            notes={step.cellNotes2}
            title={step.matrix2Label ?? "prefix"}
            decorated
            border={step.matrix2Border}
          />
        </div>
      </>
    );
  } else {
    const { CELL, GAP } = sizing(rows, cols);
    const indexed = !!step.matrixIndices;
    const g = gridSize(rows, cols, CELL, GAP, indexed, !!step.matrixLabel);
    width = g.width;
    height = g.height;
    content = (
      <Grid
        matrix={matrix}
        cell={CELL}
        gap={GAP}
        highlights={step.cellHighlights}
        pointers={step.cellPointers}
        notes={step.cellNotes}
        rects={rects}
        title={step.matrixLabel}
        decorated={indexed}
      />
    );
  }

  const padX = 48;
  const padY = 72; // status pill on top, breathing room below
  const scale = Math.min(
    1,
    box.w > 0 && width > box.w - padX ? (box.w - padX) / width : 1,
    box.h > 0 && height > box.h - padY ? (box.h - padY) / height : 1,
  );

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden">
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
      <div className="absolute inset-0 flex items-center justify-center pt-8">
        <div className="relative origin-center shrink-0" style={{ width, height, transform: `scale(${scale})` }}>
          {content}
        </div>
      </div>
    </div>
  );
}
