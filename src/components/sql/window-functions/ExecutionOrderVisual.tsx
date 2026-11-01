import { AnimatePresence, motion } from "motion/react";
import { VisualPlayer } from "./VisualPlayer";

type Employee = { id: number; department: string; salary: number };

const EMPLOYEES: Employee[] = [
  { id: 1, department: "IT", salary: 5000 },
  { id: 2, department: "IT", salary: 6000 },
  { id: 3, department: "IT", salary: 7000 },
  { id: 4, department: "HR", salary: 4000 },
  { id: 5, department: "HR", salary: 4500 },
];

const STATIONS = [
  { name: "FROM / JOIN", job: "Collect and combine data" },
  { name: "WHERE", job: "Remove rows that do not meet the filter" },
  { name: "GROUP BY", job: "Make summary groups if requested" },
  { name: "HAVING", job: "Remove groups that do not meet the filter" },
  { name: "Window Functions", job: "Calculate values across the remaining rows" },
  { name: "SELECT", job: "Produce the requested output expressions" },
  { name: "DISTINCT / ORDER BY / LIMIT", job: "Remove duplicate results, sort and limit output" },
] as const;

const THRESHOLD = 5000;
const AVERAGE = 6000;

const STEPS = [
  {
    label: "Employee records",
    note: "Imagine that a factory processes employees in several stages. Five employee records are waiting at the start.",
  },
  {
    label: "1. FROM / JOIN",
    note: "FROM provides the employee records. A join would combine data from more than one table here.",
  },
  {
    label: "2. WHERE",
    note: "WHERE salary >= 5000 removes the two HR employees before any window function exists. Three rows remain.",
  },
  {
    label: "3. GROUP BY",
    note: "This query has no GROUP BY, so the rows pass through unchanged.",
  },
  {
    label: "4. HAVING",
    note: "HAVING filters groups. With no groups, nothing changes.",
  },
  {
    label: "5. Window functions",
    note: "AVG(salary) OVER () is calculated now, across only the three remaining rows: (5000 + 6000 + 7000) / 3 = 6000.",
  },
  {
    label: "6. SELECT",
    note: "SELECT produces the requested output columns, including the window result.",
  },
  {
    label: "7. ORDER BY / LIMIT",
    note: "ORDER BY employee_id sorts the final rows. Window functions finish before this final ordering and limiting.",
  },
] as const;

/** Which station is lit for each step. Step 0 lights none. */
const activeStation = (step: number) => step - 1;

function Body({ step }: { step: number }) {
  const active = activeStation(step);
  const whereDone = step >= 2;
  const windowDone = step >= 5;

  return (
    <div className="grid gap-4 md:grid-cols-[1.1fr_1fr]">
      <ol className="flex flex-col gap-1 md:gap-1.5">
        {STATIONS.map((station, i) => {
          const isActive = i === active;
          const passed = i < active;
          return (
            <li
              key={station.name}
              className={`flex items-center gap-3 rounded-lg border px-3 py-1 transition-colors duration-300 md:py-1.5 ${
                isActive
                  ? "border-mint/60 bg-mint/15"
                  : passed
                    ? "border-violet/30 bg-violet/5"
                    : "border-hairline bg-surface/60 opacity-70"
              }`}
            >
              <span
                className={`grid size-5 shrink-0 place-items-center rounded-full font-mono text-[10px] ${
                  isActive ? "bg-mint text-background" : passed ? "bg-violet/30 text-violet" : "bg-hairline text-muted-foreground"
                }`}
              >
                {i + 1}
              </span>
              <div className="min-w-0">
                <div className={`font-mono text-[11.5px] ${isActive ? "text-mint" : "text-foreground/90"}`}>{station.name}</div>
                <div className="hidden truncate text-[11px] text-muted-foreground md:block">{station.job}</div>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="rounded-xl border border-hairline bg-surface/40 p-3">
        <div className="mb-2 font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
          Rows in the factory
        </div>
        <div className="flex flex-col gap-1">
          {EMPLOYEES.map((e) => {
            const removed = whereDone && e.salary < THRESHOLD;
            return (
              <motion.div
                key={e.id}
                layout
                animate={{ opacity: removed ? 0.25 : 1 }}
                transition={{ duration: 0.35 }}
                className={`grid grid-cols-[1.5rem_1fr_auto_auto] items-center gap-2 rounded-md border px-2 py-1.5 font-mono text-[11.5px] ${
                  removed ? "border-rose-500/30 bg-rose-500/5 line-through" : "border-hairline bg-surface/70"
                }`}
              >
                <span className="text-muted-foreground">{e.id}</span>
                <span>{e.department}</span>
                <span className="text-foreground/90">{`$${e.salary.toLocaleString("en-US")}`}</span>
                <span className="flex h-5 min-w-[3.4rem] items-center justify-end">
                  <AnimatePresence>
                    {windowDone && !removed ? (
                      <motion.span
                        initial={{ opacity: 0, x: 6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        className="rounded-full border border-violet/40 bg-violet/10 px-2 py-0.5 text-[10.5px] text-violet"
                      >
                        {`avg ${AVERAGE}`}
                      </motion.span>
                    ) : null}
                  </AnimatePresence>
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function ExecutionOrderVisual({ caption }: { caption?: string }) {
  return <VisualPlayer caption={caption} steps={STEPS} renderStep={(step) => <Body step={step} />} placeholderHeight={470} />;
}
