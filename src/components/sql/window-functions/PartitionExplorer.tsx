import { useState } from "react";
import { ClientOnly } from "@/components/lesson/ClientOnly";

type Row = { order_id: number; customer_id: "A" | "B"; amount: number; customer_total: number };

const ROWS: Row[] = [
  { order_id: 101, customer_id: "A", amount: 100, customer_total: 300 },
  { order_id: 102, customer_id: "A", amount: 200, customer_total: 300 },
  { order_id: 103, customer_id: "B", amount: 150, customer_total: 500 },
  { order_id: 104, customer_id: "B", amount: 250, customer_total: 500 },
  { order_id: 105, customer_id: "B", amount: 100, customer_total: 500 },
];

const VIEWS = [
  { id: "all", label: "All rows" },
  { id: "A", label: "Customer A" },
  { id: "B", label: "Customer B" },
] as const;

function Explorer() {
  const [view, setView] = useState<(typeof VIEWS)[number]["id"]>("all");
  const inView = (row: Row) => view === "all" || row.customer_id === view;

  return (
    <div className="flex flex-col gap-4 px-5 py-5">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Explore each partition">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            type="button"
            role="tab"
            aria-selected={view === v.id}
            onClick={() => setView(v.id)}
            className={`rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-wider transition-colors ${
              view === v.id
                ? "border-mint/50 bg-mint/15 text-mint"
                : "border-hairline bg-surface text-muted-foreground hover:border-mint/40 hover:text-foreground"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg border border-hairline">
        <table className="lesson-supporting w-full">
          <thead className="bg-surface-2 text-left text-muted-foreground">
            <tr>
              {["order_id", "customer_id", "amount", "customer_total"].map((h) => (
                <th key={h} className="border-b border-hairline px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr
                key={row.order_id}
                className={`border-b border-hairline/60 transition-opacity last:border-b-0 ${
                  inView(row) ? (view === "all" ? "" : "bg-mint/10") : "opacity-35"
                }`}
              >
                <td className="px-4 py-2 font-mono text-[12.5px] text-foreground">{row.order_id}</td>
                <td className="px-4 py-2 font-mono text-[12.5px] text-foreground/85">{row.customer_id}</td>
                <td className="px-4 py-2 font-mono text-[12.5px] text-foreground/85">{row.amount}</td>
                <td className="px-4 py-2 font-mono text-[12.5px] text-foreground/85">{row.customer_total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="lesson-supporting text-foreground/85">
        This control highlights the partition's rows for learning. The actual SQL query still returns all five rows.
      </p>
    </div>
  );
}

export function PartitionExplorer({ caption }: { caption?: string }) {
  return (
    <figure className="relative overflow-hidden rounded-xl border border-hairline bg-slate-50 dark:bg-surface shadow-sm">
      {caption ? (
        <figcaption className="border-b border-hairline bg-surface/50 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {caption}
        </figcaption>
      ) : null}
      <ClientOnly fallback={<div className="h-72 animate-pulse bg-surface-2/40" />}>
        <Explorer />
      </ClientOnly>
    </figure>
  );
}
