import { useState } from "react";
import { ClientOnly } from "@/components/lesson/ClientOnly";
import { highlightSql } from "@/components/sql/SectionRenderer";

type Fn = "SUM" | "AVG" | "COUNT";
type Scope = "customer" | "table";

const ORDERS = [
  { id: 101, customer: "A", amount: 100 },
  { id: 102, customer: "A", amount: 200 },
  { id: 103, customer: "A", amount: 300 },
  { id: 104, customer: "B", amount: 400 },
  { id: 105, customer: "B", amount: 600 },
];

const FUNCTIONS: Fn[] = ["SUM", "AVG", "COUNT"];
const SCOPES: Scope[] = ["customer", "table"];

function calc(fn: Fn, amounts: number[]) {
  const sum = amounts.reduce((a, b) => a + b, 0);
  return fn === "SUM" ? sum : fn === "AVG" ? sum / amounts.length : amounts.length;
}

function Chips<T extends string>({
  label,
  value,
  options,
  render,
  onChange,
}: {
  label: string;
  value: T;
  options: T[];
  render: (o: T) => string;
  onChange: (o: T) => void;
}) {
  return (
    <div>
      <div className="mb-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">{label}</div>
      <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
        {options.map((o) => (
          <button
            key={o}
            type="button"
            aria-pressed={value === o}
            onClick={() => onChange(o)}
            className={`rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-wider transition-colors ${
              value === o
                ? "border-mint/50 bg-mint/15 text-mint"
                : "border-hairline bg-surface text-muted-foreground hover:border-mint/40 hover:text-foreground"
            }`}
          >
            {render(o)}
          </button>
        ))}
      </div>
    </div>
  );
}

function Explorer() {
  const [fn, setFn] = useState<Fn>("SUM");
  const [scope, setScope] = useState<Scope>("customer");
  const arg = fn === "COUNT" ? "*" : "amount";
  const code = scope === "customer" ? `${fn}(${arg}) OVER (PARTITION BY customer_id)` : `${fn}(${arg}) OVER ()`;
  const rows = ORDERS.map((o) => {
    const group = scope === "customer" ? ORDERS.filter((x) => x.customer === o.customer) : ORDERS;
    return { ...o, value: calc(fn, group.map((x) => x.amount)) };
  });

  return (
    <div className="flex flex-col gap-4 px-5 py-5">
      <p className="lesson-supporting font-medium text-foreground">Change the aggregation and the partition rule</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Chips label="Aggregate function" value={fn} options={FUNCTIONS} render={(o) => o} onChange={setFn} />
        <Chips label="Window partition" value={scope} options={SCOPES} render={(o) => (o === "customer" ? "By customer" : "Entire table")} onChange={setScope} />
      </div>

      <pre className="overflow-x-auto rounded-lg border border-hairline bg-surface-2/50 px-3 py-2 font-mono text-[12.5px] leading-relaxed text-foreground/90">
        <code>{highlightSql(code)}</code>
      </pre>

      <div className="overflow-x-auto rounded-lg border border-hairline">
        <table className="lesson-supporting w-full">
          <thead className="bg-surface-2 text-left text-muted-foreground">
            <tr>
              {["Order", "Customer", "Amount", fn].map((h) => (
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
                <td className="px-4 py-2 font-mono text-[12.5px] font-semibold text-mint">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="lesson-supporting text-foreground/85">
        All five order rows remain visible. Only the calculated aggregate values change.
      </p>
    </div>
  );
}

export function AggregateExplorer({ caption }: { caption?: string }) {
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
