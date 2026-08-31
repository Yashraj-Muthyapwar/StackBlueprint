import type { Row, RowState, StageStep, Tone } from "@/components/lesson/MultiStage";

export const r = (key: string | number, ...cells: (string | number | null)[]): Row => ({ key, cells });

export const st = (
  activeLines: number[],
  rowState: ((row: Row, i: number) => RowState | undefined) | RowState,
  note: string,
  extra: Partial<StageStep> = {},
): StageStep => ({
  activeLines,
  note,
  rowState: typeof rowState === "function" ? rowState : () => rowState,
  ...extra,
});

export const pass =
  (predicate: (row: Row, i: number) => boolean | null) =>
  (row: Row, index: number): RowState | undefined => {
    const result = predicate(row, index);
    return result === null ? "pending" : result ? "kept" : "dropped";
  };

export const bucketPanel = (groups: { k: string; sum: number }[]) => (
  <div className="grid gap-2">
    {groups.map((group) => (
      <div key={group.k} className="flex items-center justify-between rounded-md border border-violet/40 bg-violet/5 px-3 py-2 font-mono text-[12px]">
        <span className="text-violet">{group.k}</span>
        <span className="text-mint">Σ = ${group.sum}</span>
      </div>
    ))}
  </div>
);

export const sidePanel = (title: string, lines: string[], tone: Tone = "violet") => {
  const toneClasses: Record<Tone, string> = {
    mint: "border-mint/40 bg-mint/10 text-mint",
    rose: "border-rose-500/40 bg-rose-500/10 text-rose-300",
    amber: "border-amber/40 bg-amber/10 text-amber",
    violet: "border-violet/40 bg-violet/10 text-violet",
    neutral: "border-hairline bg-surface-2/40 text-muted-foreground",
  };

  return (
    <div className={`rounded-lg border p-3 ${toneClasses[tone]}`}>
      <div className="font-mono text-[10px] uppercase tracking-[0.14em]">{title}</div>
      {lines.map((line, index) => (
        <div key={index} className="mt-1 font-mono text-[12px] text-foreground/85">{line}</div>
      ))}
    </div>
  );
};
