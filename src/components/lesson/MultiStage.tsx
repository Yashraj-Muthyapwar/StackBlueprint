import { useMemo } from "react";
import { AnimatePresence, motion } from "motion/react";

/**
 * Generic multi-stage SQL animation engine.
 *
 * A variant (e.g. "q-bool") decomposes into an ordered list of Stages, where each
 * stage isolates ONE sub-concept (AND, OR, NOT, combined precedence, …) with its
 * own SQL query, sample table and per-step row states.
 *
 * The global step index flows across stages — stage banners switch automatically.
 */

export type Tone = "mint" | "rose" | "amber" | "violet" | "neutral";

export type RowState = "pending" | "kept" | "dropped" | "added";

export type Row = {
  key: string | number;
  cells: (string | number | null)[];
};

export type StageStep = {
  /** Indices of SQL lines to highlight as the active clause. */
  activeLines?: number[];
  /** Per-row final state after this step runs. */
  rowState?: (row: Row, idx: number) => RowState | undefined;
  /** Column indices to bathe in mint. */
  highlightCols?: number[];
  /** Optional override of the rows rendered (for derived/result projections). */
  rowsOverride?: Row[];
  /** Engineering note shown to the side. */
  note: string;
  noteTone?: Tone;
  /** Optional alternative cols when rowsOverride changes the shape. */
  colsOverride?: string[];
  /** Optional secondary panel (e.g. aggregate result card, bucket cards). */
  side?: React.ReactNode;

  // ---- DUAL-TABLE (join) layout ----
  /** Per-row states for the LEFT source table in a dual layout. */
  leftStates?: (RowState | undefined)[];
  /** Per-row states for the RIGHT source table in a dual layout. */
  rightStates?: (RowState | undefined)[];
  /** Result rows produced by joining the two source tables this step. */
  resultRows?: Row[];
  /** Column headers for the result panel. */
  resultCols?: string[];
  /** Title for the result panel. Defaults to "result". */
  resultTitle?: string;
};

export type Stage = {
  /** Short concept label, e.g. "AND" or "Hash Bucketing". */
  name: string;
  /** One-line subtitle shown under the banner. */
  blurb?: string;
  /**
   * A lesson-specific desktop reserve for the animation body. Use this only
   * when a custom font or a tall derived-result step would otherwise make the
   * canvas grow during its first playback. Narrow layouts can still grow past it.
   */
  canvasMinHeight?: number;
  /** Give a deliberately wide source table the full animation width. */
  layout?: "default" | "wide";
  sql: string[];
  /** Single source table (default layout). */
  table?: { name: string; cols: string[]; rows: Row[]; columnTemplate?: string };
  /** Left source table (dual / join layout). */
  leftTable?: { name: string; cols: string[]; rows: Row[] };
  /** Right source table (dual / join layout). */
  rightTable?: { name: string; cols: string[]; rows: Row[] };
  steps: StageStep[];
};

export function totalSteps(stages: Stage[]): number {
  return stages.reduce((n, s) => n + s.steps.length, 0);
}

export function locate(stages: Stage[], step: number): { stageIdx: number; local: number } {
  let n = step;
  for (let i = 0; i < stages.length; i++) {
    if (n < stages[i].steps.length) return { stageIdx: i, local: n };
    n -= stages[i].steps.length;
  }
  const last = stages.length - 1;
  return { stageIdx: last, local: stages[last].steps.length - 1 };
}

// ============================================================
// SQL syntax highlighter
// ============================================================

const KEYWORDS = new Set([
  "SELECT","FROM","WHERE","AND","OR","NOT","NULL","IS","IN","BETWEEN","LIKE","ILIKE",
  "GROUP","BY","HAVING","ORDER","LIMIT","OFFSET","ON","JOIN","INNER","LEFT","RIGHT","FULL",
  "OUTER","CROSS","UNION","ALL","DISTINCT","AS","EXISTS","CASE","WHEN","THEN","ELSE","END",
  "COUNT","SUM","AVG","MIN","MAX","CONCAT","SUBSTRING","LEFT","RIGHT","LENGTH","ROLLUP","CUBE","GROUPING","SETS","WITH","INTERSECT","EXCEPT",
  "VALUES","INSERT","INTO","UPDATE","SET","DELETE","CREATE","TABLE","PRIMARY","KEY","FOREIGN",
  "REFERENCES","CHECK","UNIQUE","DEFAULT","ASC","DESC","NULLS","FIRST","LAST",
]);

function hl(line: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let i = 0, key = 0;
  while (i < line.length) {
    const c = line[i];
    if (c === "-" && line[i + 1] === "-") {
      out.push(<span key={key++} className="text-muted-foreground/60">{line.slice(i)}</span>);
      break;
    }
    if (c === "'") {
      const end = line.indexOf("'", i + 1);
      const stop = end === -1 ? line.length : end + 1;
      out.push(<span key={key++} className="text-amber">{line.slice(i, stop)}</span>);
      i = stop;
      continue;
    }
    if (/[A-Za-z_]/.test(c)) {
      let j = i + 1;
      while (j < line.length && /[A-Za-z0-9_]/.test(line[j])) j++;
      const w = line.slice(i, j);
      out.push(
        KEYWORDS.has(w.toUpperCase())
          ? <span key={key++} className="text-mint">{w}</span>
          : <span key={key++}>{w}</span>
      );
      i = j;
      continue;
    }
    if (/[0-9]/.test(c)) {
      let j = i + 1;
      while (j < line.length && /[0-9.]/.test(line[j])) j++;
      out.push(<span key={key++} className="text-violet">{line.slice(i, j)}</span>);
      i = j;
      continue;
    }
    out.push(<span key={key++}>{c}</span>);
    i++;
  }
  return out;
}

// ============================================================
// Primitives — exported so stage configs can build side panels
// ============================================================

export function QueryBlock({ lines, activeLines = [] }: { lines: string[]; activeLines?: number[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-hairline bg-slate-50 dark:bg-surface-2/50 shadow-sm">
      <div className="border-b border-hairline px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        query
      </div>
      <pre className="m-0 px-3 py-2 font-mono text-[12.5px] leading-relaxed whitespace-pre-wrap break-words">
        {lines.map((ln, i) => {
          const active = activeLines.includes(i);
          return (
            <motion.div
              key={i}
              animate={{
                backgroundColor: active ? "rgba(64,224,180,0.10)" : "rgba(0,0,0,0)",
                opacity: activeLines.length === 0 || active ? 1 : 0.55,
              }}
              transition={{ duration: 0.25 }}
              className={`rounded px-1 ${active ? "ring-1 ring-mint/30" : ""}`}
            >
              {hl(ln.padEnd(1, " "))}
            </motion.div>
          );
        })}
      </pre>
    </div>
  );
}

export function MiniTable({
  title,
  cols,
  rows,
  states,
  highlightCols = [],
  columnTemplate,
}: {
  title?: string;
  cols: string[];
  rows: Row[];
  states?: (RowState | undefined)[];
  highlightCols?: number[];
  /** Explicit widths for tables containing naturally wide fields such as email. */
  columnTemplate?: string;
}) {
  const gridTemplateColumns = columnTemplate ?? `repeat(${cols.length}, minmax(0,1fr))`;
  return (
    <div className="overflow-hidden rounded-lg border border-hairline bg-slate-50 dark:bg-transparent shadow-sm">
      {title ? (
        <div className="flex items-center justify-between border-b border-hairline bg-surface-2/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          <span>{title}</span>
          <span>
            {(states ? states.filter((s) => s !== "dropped").length : rows.length)} rows
          </span>
        </div>
      ) : null}
      <div
        className="grid border-b border-hairline bg-surface-2/40 font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground"
        style={{ gridTemplateColumns }}
      >
        {cols.map((c, i) => (
          <div
            key={c}
            className={`min-w-0 truncate px-2.5 py-1.5 ${highlightCols.includes(i) ? "text-mint" : ""}`}
            title={c}
          >
            {c}
          </div>
        ))}
      </div>
      <AnimatePresence initial={false}>
        {rows.map((r, idx) => {
          const st = states?.[idx];
          const bg =
            st === "kept" || st === "added" ? "bg-mint/5" :
            st === "dropped" ? "bg-rose/5" : "";
          return (
            <motion.div
              key={r.key}
              layout
              initial={{ opacity: 0, y: 4 }}
              animate={{
                opacity: st === "dropped" ? 0.3 : 1,
                y: 0,
                filter: st === "dropped" ? "grayscale(0.7)" : "grayscale(0)",
              }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3 }}
              className={`grid border-b border-hairline/60 last:border-b-0 ${bg}`}
              style={{ gridTemplateColumns }}
            >
              {r.cells.map((c, i) => {
                const isNull = c === null;
                const hi = highlightCols.includes(i);
                return (
                  <div
                    key={i}
                    className={`min-w-0 truncate px-2.5 py-1.5 font-mono text-[12px] ${
                      hi ? "bg-mint/15 text-mint" :
                      isNull ? "text-amber" :
                      st === "dropped" ? "text-muted-foreground line-through" :
                      "text-foreground/85"
                    }`}
                    title={isNull ? "NULL" : String(c)}
                  >
                    {isNull ? "NULL" : String(c)}
                  </div>
                );
              })}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export function Note({ tone = "mint", children }: { tone?: Tone; children: React.ReactNode }) {
  const cls =
    tone === "rose" ? "border-rose/40 bg-rose/10 text-rose" :
    tone === "amber" ? "border-amber/40 bg-amber/10 text-amber" :
    tone === "violet" ? "border-violet/40 bg-violet/10 text-violet" :
    tone === "neutral" ? "border-hairline bg-surface-2/40 text-muted-foreground" :
    "border-mint/40 bg-mint/10 text-mint";
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`rounded-md border px-3 py-2 text-[12.5px] shadow-sm ${cls}`}
    >
      {children}
    </motion.div>
  );
}

// ============================================================
// Stage banner — switches when the global step crosses a boundary
// ============================================================

function StageBanner({
  stages,
  stageIdx,
}: {
  stages: Stage[];
  stageIdx: number;
}) {
  const s = stages[stageIdx];
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-hairline bg-slate-50 dark:bg-surface-2/40 px-3 py-2 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <span className="shrink-0 rounded-md bg-violet/15 px-2 py-0.5 font-mono text-[10.5px] uppercase tracking-[0.16em] text-violet">
          Concept {stageIdx + 1} / {stages.length}
        </span>
        <span className="font-mono text-[13px] text-foreground/90">{s.name}</span>
        {s.blurb ? (
          <span className="text-[12.5px] text-muted-foreground">— {s.blurb}</span>
        ) : null}
      </div>
      <div className="flex items-center gap-1">
        {stages.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 w-1.5 rounded-full ${i === stageIdx ? "bg-violet" : i < stageIdx ? "bg-mint" : "bg-hairline"}`}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Runner
// ============================================================

export function MultiStage({ stages, step }: { stages: Stage[]; step: number }) {
  const { stageIdx, local } = useMemo(() => locate(stages, step), [stages, step]);
  const s = stages[stageIdx];
  const stepCfg = s.steps[local];
  const isDual = !!(s.leftTable && s.rightTable);
  const panel = isDual ? (
    <DualPanel stage={s} step={stepCfg} stageIdx={stageIdx} local={local} />
  ) : (
    <SinglePanel stage={s} step={stepCfg} stageIdx={stageIdx} local={local} />
  );
  const note = (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${stageIdx}-${local}-note`}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.2 }}
      >
        <Note tone={stepCfg.noteTone}>{stepCfg.note}</Note>
      </motion.div>
    </AnimatePresence>
  );

  return (
    <div className="grid gap-3">
      <StageBanner stages={stages} stageIdx={stageIdx} />
      {s.layout === "wide" ? (
        <div className="space-y-3 min-w-0">
          <QueryBlock lines={s.sql} activeLines={stepCfg.activeLines ?? []} />
          {panel}
          {stepCfg.side ? <div>{stepCfg.side}</div> : null}
          {note}
        </div>
      ) : (
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px] min-w-0">
        <div className="space-y-3 min-w-0">
          <QueryBlock lines={s.sql} activeLines={stepCfg.activeLines ?? []} />
          {panel}
          {stepCfg.side ? <div>{stepCfg.side}</div> : null}
        </div>
        {note}
      </div>
      )}
    </div>
  );
}

function SinglePanel({
  stage,
  step,
  stageIdx,
  local,
}: { stage: Stage; step: StageStep; stageIdx: number; local: number }) {
  if (!stage.table) return null;
  const cols = step.colsOverride ?? stage.table.cols;
  const baseRows = step.rowsOverride ?? stage.table.rows;
  const states = step.rowsOverride
    ? baseRows.map(() => "added" as RowState)
    : baseRows.map((r, i) => step.rowState?.(r, i));
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={`${stageIdx}-${step.rowsOverride ? "o" : "b"}`}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.2 }}
      >
        <MiniTable
          title={step.rowsOverride ? `${stage.table.name} → result` : stage.table.name}
          cols={cols}
          rows={baseRows}
          states={states}
          highlightCols={step.highlightCols}
          columnTemplate={stage.table.columnTemplate}
        />
      </motion.div>
    </AnimatePresence>
  );
}

function DualPanel({
  stage,
  step,
  stageIdx,
  local,
}: { stage: Stage; step: StageStep; stageIdx: number; local: number }) {
  const left = stage.leftTable!;
  const right = stage.rightTable!;
  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        <MiniTable title={left.name} cols={left.cols} rows={left.rows} states={step.leftStates} />
        <MiniTable title={right.name} cols={right.cols} rows={right.rows} states={step.rightStates} />
      </div>
      {step.resultRows ? (
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${stageIdx}-${local}-res`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
          >
            <MiniTable
              title={step.resultTitle ?? "result"}
              cols={step.resultCols ?? []}
              rows={step.resultRows}
              states={step.resultRows.map(() => "added" as RowState)}
            />
          </motion.div>
        </AnimatePresence>
      ) : (
        <div className="rounded-lg border border-dashed border-hairline px-3 py-4 text-center font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          result · 0 rows
        </div>
      )}
    </div>
  );
}
