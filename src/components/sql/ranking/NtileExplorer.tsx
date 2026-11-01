import { useState } from "react";
import { ClientOnly } from "@/components/lesson/ClientOnly";
import { highlightSql } from "@/components/sql/SectionRenderer";

const CUSTOMERS = [
  { id: "A", spent: 1000 },
  { id: "B", spent: 900 },
  { id: "C", spent: 800 },
  { id: "D", spent: 700 },
  { id: "E", spent: 600 },
  { id: "F", spent: 500 },
  { id: "G", spent: 400 },
  { id: "H", spent: 300 },
];
const COUNTS = [2, 3, 4, 5, 8];

// Bucket sizes differ by at most one row, and larger buckets come first.
function bucketSizes(rows: number, buckets: number) {
  const base = Math.floor(rows / buckets);
  const extra = rows % buckets;
  return Array.from({ length: buckets }, (_, i) => base + (i < extra ? 1 : 0));
}

function assign(buckets: number) {
  const sizes = bucketSizes(CUSTOMERS.length, buckets);
  return CUSTOMERS.flatMap((c, i) => {
    let seen = 0;
    const bucket = sizes.findIndex((s) => (seen += s) > i) + 1;
    return [{ ...c, bucket }];
  });
}

function Explorer() {
  const [buckets, setBuckets] = useState(5);
  const rows = assign(buckets);
  const code = [`NTILE(${buckets}) OVER (`, "    ORDER BY total_spent DESC, customer_id", ")"];
  const sizes = bucketSizes(CUSTOMERS.length, buckets);

  return (
    <div className="flex flex-col gap-4 px-5 py-5">
      <p className="lesson-supporting font-medium text-foreground">Change the number of buckets</p>
      <div>
        <div className="mb-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">Buckets</div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Buckets">
          {COUNTS.map((n) => (
            <button
              key={n}
              type="button"
              aria-pressed={buckets === n}
              onClick={() => setBuckets(n)}
              className={`rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-wider transition-colors ${
                buckets === n
                  ? "border-mint/50 bg-mint/15 text-mint"
                  : "border-hairline bg-surface text-muted-foreground hover:border-mint/40 hover:text-foreground"
              }`}
            >
              {n} buckets
            </button>
          ))}
        </div>
      </div>

      <pre className="overflow-x-auto rounded-lg border border-hairline bg-surface-2/50 px-3 py-2 font-mono text-[12.5px] leading-relaxed text-foreground/90">
        <code>
          {code.map((line, i) => (
            <div key={i}>{highlightSql(line)}</div>
          ))}
        </code>
      </pre>

      <div className="overflow-x-auto rounded-lg border border-hairline">
        <table className="lesson-supporting w-full">
          <thead className="bg-surface-2 text-left text-muted-foreground">
            <tr>
              {["Customer", "Spending", "Bucket"].map((h) => (
                <th key={h} className="border-b border-hairline px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className={`border-b border-hairline/60 last:border-b-0 ${row.bucket % 2 === 1 ? "" : "bg-amber/5"}`}>
                <td className="px-4 py-2 font-mono text-[12.5px] text-foreground">{row.id}</td>
                <td className="px-4 py-2 font-mono text-[12.5px] text-foreground/85">{row.spent}</td>
                <td className="px-4 py-2 font-mono text-[12.5px] font-semibold text-mint">{row.bucket}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="lesson-supporting text-foreground/85">Bucket sizes: {sizes.join(" / ")} rows.</p>
    </div>
  );
}

export function NtileExplorer({ caption }: { caption?: string }) {
  return (
    <figure className="relative overflow-hidden rounded-xl border border-hairline bg-slate-50 dark:bg-surface shadow-sm">
      {caption ? (
        <figcaption className="border-b border-hairline bg-surface/50 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {caption}
        </figcaption>
      ) : null}
      <ClientOnly fallback={<div className="h-96 animate-pulse bg-surface-2/40" />}>
        <Explorer />
      </ClientOnly>
    </figure>
  );
}
