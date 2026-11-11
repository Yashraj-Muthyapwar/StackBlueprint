import { useState } from "react";
import { SalaryBoundaryRadar } from "./SalaryBoundaryRadar";
import { ClientOnly } from "@/components/lesson/ClientOnly";
import { highlightSql } from "../SectionRenderer";

export const SALARIES = [
  { id: 101, department: "Engineering", salary: 120000 },
  { id: 102, department: "Engineering", salary: 100000 },
  { id: 103, department: "Engineering", salary: 80000 },
  { id: 201, department: "Sales", salary: 90000 },
  { id: 202, department: "Sales", salary: 70000 },
];

const k = (n: number) => `$${n / 1000}k`;

export function SalaryBoundariesVisual({ caption }: { caption?: string }) {
  return <SalaryBoundaryRadar employees={SALARIES} caption={caption} />;
}

// ----- Explorer: choose the statistic and the partition rule -----
type Scope = "department" | "all";
type Stat = "MIN" | "MAX" | "GAP";
const SCOPES: Scope[] = ["department", "all"];
const STATS: Stat[] = ["MIN", "MAX", "GAP"];

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
      <div className="mb-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </div>
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
  const [scope, setScope] = useState<Scope>("department");
  const [stat, setStat] = useState<Stat>("MAX");
  const fn = stat === "MIN" ? "MIN" : "MAX";
  const over = scope === "department" ? "PARTITION BY department" : "";
  const code = `${fn}(salary) OVER (${over})${stat === "GAP" ? " - salary" : ""}`;

  const rows = SALARIES.map((e) => {
    const pool = SALARIES.filter((x) => scope === "all" || x.department === e.department).map(
      (x) => x.salary,
    );
    const boundary = stat === "MIN" ? Math.min(...pool) : Math.max(...pool);
    const on = stat === "GAP" ? e.salary === boundary : e.salary === boundary;
    return { ...e, value: stat === "GAP" ? boundary - e.salary : boundary, on };
  });

  return (
    <div className="flex flex-col gap-4 px-5 py-5">
      <p className="lesson-supporting font-medium text-foreground">Explore partition comparisons</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Chips
          label="Calculation scope"
          value={scope}
          options={SCOPES}
          render={(o) => (o === "department" ? "Per department" : "All employees")}
          onChange={setScope}
        />
        <Chips
          label="Statistic"
          value={stat}
          options={STATS}
          render={(o) => (o === "GAP" ? "Gap from MAX" : o)}
          onChange={setStat}
        />
      </div>

      <pre className="overflow-x-auto rounded-lg border border-hairline bg-surface-2/50 px-3 py-2 font-mono text-[12.5px] leading-relaxed text-foreground/90">
        <code>{highlightSql(code)}</code>
      </pre>

      <div className="overflow-x-auto rounded-lg border border-hairline">
        <table className="lesson-supporting w-full">
          <thead className="bg-surface-2 text-left text-muted-foreground">
            <tr>
              {["Employee", "Dept", "Salary", "Result"].map((h) => (
                <th
                  key={h}
                  className="border-b border-hairline px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em]"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className={`border-b border-hairline/60 last:border-b-0 ${stat !== "GAP" && row.on ? "bg-mint/10" : ""}`}
              >
                <td className="px-4 py-2 font-mono text-[12.5px] text-foreground">{row.id}</td>
                <td className="px-4 py-2 font-mono text-[12.5px] text-foreground/85">
                  {row.department}
                </td>
                <td className="px-4 py-2 font-mono text-[12.5px] text-foreground/85">
                  {k(row.salary)}
                </td>
                <td className="px-4 py-2 font-mono text-[12.5px] font-semibold text-mint">
                  {k(row.value)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="lesson-supporting text-foreground/85">
        Changing the partition changes which rows contribute to the minimum or maximum. All five
        employee rows remain visible.
      </p>
    </div>
  );
}

export function SalaryComparisonExplorer({ caption }: { caption?: string }) {
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
