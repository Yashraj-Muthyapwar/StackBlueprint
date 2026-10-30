import { useState } from "react";
import { ClientOnly } from "@/components/lesson/ClientOnly";
import { highlightSql } from "@/components/sql/SectionRenderer";

type Order = { id: number; customer: string; date: string; amount: number };

const ORDERS: Order[] = [
  { id: 101, customer: "A", date: "2026-01-01", amount: 100 },
  { id: 102, customer: "A", date: "2026-01-03", amount: 250 },
  { id: 103, customer: "B", date: "2026-01-02", amount: 150 },
  { id: 104, customer: "B", date: "2026-01-05", amount: 300 },
  { id: 105, customer: "A", date: "2026-01-06", amount: 200 },
];

type Partition = "customer" | "all";
type Ordering = "date" | "amount";

const PARTITIONS: { id: Partition; label: string }[] = [
  { id: "customer", label: "By customer" },
  { id: "all", label: "All orders" },
];
const ORDERINGS: { id: Ordering; label: string }[] = [
  { id: "date", label: "Date ascending" },
  { id: "amount", label: "Amount descending" },
];

const compare = (ordering: Ordering) => (a: Order, b: Order) =>
  ordering === "date" ? a.date.localeCompare(b.date) || a.id - b.id : b.amount - a.amount || a.id - b.id;

function numbered(partition: Partition, ordering: Ordering) {
  const groups = partition === "customer" ? ["A", "B"] : [""];
  return groups.flatMap((group) =>
    ORDERS.filter((o) => partition === "all" || o.customer === group)
      .sort(compare(ordering))
      .map((o, i) => ({ ...o, rowNumber: i + 1 })),
  );
}

function Toggle<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { id: T; label: string }[];
  onChange: (id: T) => void;
}) {
  return (
    <div>
      <div className="mb-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">{label}</div>
      <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            aria-pressed={value === o.id}
            onClick={() => onChange(o.id)}
            className={`rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-wider transition-colors ${
              value === o.id
                ? "border-mint/50 bg-mint/15 text-mint"
                : "border-hairline bg-surface text-muted-foreground hover:border-mint/40 hover:text-foreground"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Explorer() {
  const [partition, setPartition] = useState<Partition>("customer");
  const [ordering, setOrdering] = useState<Ordering>("date");
  const rows = numbered(partition, ordering);
  const code = [
    "ROW_NUMBER() OVER (",
    ...(partition === "customer" ? ["    PARTITION BY customer_id"] : []),
    ordering === "date" ? "    ORDER BY order_date, order_id" : "    ORDER BY amount DESC, order_id",
    ")",
  ];

  return (
    <div className="flex flex-col gap-4 px-5 py-5">
      <p className="lesson-supporting font-medium text-foreground">Change the window definition</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Toggle label="Partition" value={partition} options={PARTITIONS} onChange={setPartition} />
        <Toggle label="Ordering" value={ordering} options={ORDERINGS} onChange={setOrdering} />
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
              {["Order", "Customer", "Amount", "Row #"].map((h) => (
                <th key={h} className="border-b border-hairline px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-hairline/60 last:border-b-0">
                <td className="px-4 py-2 font-mono text-[12.5px] text-foreground">{row.id}</td>
                <td className="px-4 py-2 font-mono text-[12.5px] text-foreground/85">{row.customer}</td>
                <td className="px-4 py-2 font-mono text-[12.5px] text-foreground/85">{row.amount}</td>
                <td className="px-4 py-2 font-mono text-[12.5px] font-semibold text-mint">{row.rowNumber}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="lesson-supporting text-foreground/85">
        This example uses a unique order ID to break ties. The table shows rows sorted by partition and assigned row number for learning.
      </p>
    </div>
  );
}

export function RowNumberExplorer({ caption }: { caption?: string }) {
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
