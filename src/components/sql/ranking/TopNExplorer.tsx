import { useState } from "react";
import { ClientOnly } from "@/components/lesson/ClientOnly";
import { highlightSql } from "@/components/sql/SectionRenderer";

type Fn = "ROW_NUMBER" | "RANK" | "DENSE_RANK";

const EMPLOYEES = [
  { id: 101, dept: "Engineering", salary: 120000 },
  { id: 102, dept: "Engineering", salary: 110000 },
  { id: 103, dept: "Engineering", salary: 110000 },
  { id: 104, dept: "Engineering", salary: 90000 },
  { id: 201, dept: "Sales", salary: 100000 },
  { id: 202, dept: "Sales", salary: 95000 },
  { id: 203, dept: "Sales", salary: 95000 },
  { id: 204, dept: "Sales", salary: 80000 },
];

const FUNCTIONS: Fn[] = ["ROW_NUMBER", "RANK", "DENSE_RANK"];
const LIMITS = [1, 2, 3];

function ranked(fn: Fn) {
  return EMPLOYEES.map((e) => {
    const same = EMPLOYEES.filter((o) => o.dept === e.dept);
    const higher = same.filter((o) => o.salary > e.salary);
    const rank =
      fn === "ROW_NUMBER"
        ? 1 + higher.length + same.filter((o) => o.salary === e.salary && o.id < e.id).length
        : fn === "RANK"
          ? 1 + higher.length
          : 1 + new Set(higher.map((o) => o.salary)).size;
    return { ...e, rank };
  });
}

function Chips<T extends string | number>({
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
            key={String(o)}
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
  const [fn, setFn] = useState<Fn>("DENSE_RANK");
  const [limit, setLimit] = useState(2);
  const rows = ranked(fn);
  const chosen = rows.filter((row) => row.rank <= limit).length;
  const order = fn === "ROW_NUMBER" ? "    ORDER BY salary DESC, employee_id" : "    ORDER BY salary DESC";
  const code = [`${fn}() OVER (`, "    PARTITION BY department", order, ")"];

  return (
    <div className="flex flex-col gap-4 px-5 py-5">
      <p className="lesson-supporting font-medium text-foreground">Compare Top-N selection rules</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Chips label="Ranking function" value={fn} options={FUNCTIONS} render={(o) => o} onChange={setFn} />
        <Chips label="Top N" value={limit} options={LIMITS} render={(o) => `Top ${o}`} onChange={setLimit} />
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
              {["Employee", "Department", "Salary", "Rank"].map((h) => (
                <th key={h} className="border-b border-hairline px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const on = row.rank <= limit;
              return (
                <tr key={row.id} className={`border-b border-hairline/60 last:border-b-0 ${on ? "bg-mint/10" : ""}`}>
                  <td className="px-4 py-2 font-mono text-[12.5px] text-foreground">{row.id}</td>
                  <td className="px-4 py-2 font-mono text-[12.5px] text-foreground/85">{row.dept}</td>
                  <td className="px-4 py-2 font-mono text-[12.5px] text-foreground/85">{row.salary}</td>
                  <td className={`px-4 py-2 font-mono text-[12.5px] font-semibold ${on ? "text-mint" : "text-muted-foreground"}`}>{row.rank}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="lesson-supporting text-foreground/85">
        {chosen} employees selected by <span className="font-mono">{fn.toLowerCase()} &lt;= {limit}</span>.
      </p>
    </div>
  );
}

export function TopNExplorer({ caption }: { caption?: string }) {
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
