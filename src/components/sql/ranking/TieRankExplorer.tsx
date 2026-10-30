import { useState } from "react";
import { ClientOnly } from "@/components/lesson/ClientOnly";
import { highlightSql } from "@/components/sql/SectionRenderer";

type Person = { id: number; name: string; salary: number };

const PEOPLE: Person[] = [
  { id: 1, name: "Alice", salary: 9000 },
  { id: 2, name: "Bob", salary: 8000 },
  { id: 3, name: "Charlie", salary: 8000 },
  { id: 4, name: "David", salary: 6000 },
  { id: 5, name: "Emma", salary: 5000 },
];

type Ordering = "salary" | "tiebreak";

const ORDERINGS: { id: Ordering; label: string }[] = [
  { id: "salary", label: "salary DESC" },
  { id: "tiebreak", label: "salary DESC, employee_id" },
];

// Two rows are peers when every column in the window ORDER BY is equal.
const samePeer = (ordering: Ordering, a: Person, b: Person) =>
  a.salary === b.salary && (ordering === "salary" || a.id === b.id);

function ranked(ordering: Ordering) {
  return PEOPLE.map((p, i) => {
    const rank = 1 + PEOPLE.filter((o) => o.salary > p.salary || (ordering === "tiebreak" && o.salary === p.salary && o.id < p.id)).length;
    const peerFirst = PEOPLE.filter((o) => samePeer(ordering, o, p));
    const dense =
      PEOPLE.filter((o, j, all) => {
        const before = o.salary > p.salary || (ordering === "tiebreak" && o.salary === p.salary && o.id < p.id);
        // Count each earlier peer group once: keep the first row of its group.
        return before && all.findIndex((x) => samePeer(ordering, x, o)) === j;
      }).length + 1;
    return { ...p, rowNumber: i + 1, rank, dense, shared: peerFirst.length > 1 };
  });
}

function Toggle({ value, onChange }: { value: Ordering; onChange: (id: Ordering) => void }) {
  return (
    <div>
      <div className="mb-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
        Window ORDER BY
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Window ORDER BY">
        {ORDERINGS.map((o) => (
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
  const [ordering, setOrdering] = useState<Ordering>("salary");
  const rows = ranked(ordering);
  const orderBy = ordering === "salary" ? "ORDER BY salary DESC" : "ORDER BY salary DESC, employee_id";
  const code = ["RANK() OVER (", `    ${orderBy}`, ")"];

  return (
    <div className="flex flex-col gap-4 px-5 py-5">
      <p className="lesson-supporting font-medium text-foreground">Change the window ORDER BY list</p>
      <Toggle value={ordering} onChange={setOrdering} />

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
              {["Name", "Salary", "RANK", "DENSE_RANK"].map((h) => (
                <th key={h} className="border-b border-hairline px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className={`border-b border-hairline/60 last:border-b-0 ${row.shared ? "bg-amber/5" : ""}`}>
                <td className="px-4 py-2 font-mono text-[12.5px] text-foreground">{row.name}</td>
                <td className="px-4 py-2 font-mono text-[12.5px] text-foreground/85">{row.salary}</td>
                <td className="px-4 py-2 font-mono text-[12.5px] font-semibold text-amber">{row.rank}</td>
                <td className="px-4 py-2 font-mono text-[12.5px] font-semibold text-mint">{row.dense}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="lesson-supporting text-foreground/85">
        {ordering === "salary"
          ? "Bob and Charlie are peers, so they share a rank. RANK() skips 3 and DENSE_RANK() does not."
          : "employee_id is unique, so Bob and Charlie are no longer peers. The salary tie disappears."}
      </p>
    </div>
  );
}

export function TieRankExplorer({ caption }: { caption?: string }) {
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
