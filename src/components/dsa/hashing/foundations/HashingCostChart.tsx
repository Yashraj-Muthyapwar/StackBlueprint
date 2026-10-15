const SIZES = [10, 100, 1000, 10000];

/** Bars for the worst-case linear search and the idealized average hash lookup at four sizes. */
export function HashingCostChart() {
  const max = SIZES[SIZES.length - 1];
  return (
    <figure className="rounded-2xl border border-hairline bg-slate-50 p-4 shadow-sm dark:bg-surface sm:p-5">
      <figcaption className="text-sm font-semibold">Explore the complexity</figcaption>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-amber-500/70" /> Linear search, worst case
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-mint" /> Hash lookup, idealized average
        </span>
      </div>
      <div className="mt-4 space-y-4">
        {SIZES.map((n) => (
          <div key={n}>
            <p className="font-mono text-xs text-muted-foreground">
              n = {n.toLocaleString("en-US")}
            </p>
            <div className="mt-1.5 space-y-1.5">
              <Bar label="Linear search, worst case" value={n} max={max} tone="amber" />
              <Bar label="Hash lookup, idealized average" value={1} max={max} tone="mint" />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        Illustrative operation counts, not measured Python execution times.
      </p>
    </figure>
  );
}

function Bar({
  label,
  value,
  max,
  tone,
}: {
  label: string;
  value: number;
  max: number;
  tone: "amber" | "mint";
}) {
  const width = Math.max((value / max) * 100, 0.8);
  return (
    <div className="flex items-center gap-3">
      <div className="h-5 min-w-0 flex-1 overflow-clip rounded bg-background/70">
        <div
          className={tone === "amber" ? "h-full bg-amber-500/70" : "h-full bg-mint"}
          style={{ width: `${width}%` }}
        />
      </div>
      <span className="w-14 shrink-0 text-right font-mono text-xs font-semibold">
        {value.toLocaleString("en-US")}
      </span>
      <span className="sr-only">{label}</span>
    </div>
  );
}
