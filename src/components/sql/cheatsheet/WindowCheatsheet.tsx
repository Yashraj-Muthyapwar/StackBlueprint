import { Fragment, useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";
import { highlightSql } from "@/components/sql/SectionRenderer";

type Tone = "violet" | "amber" | "mint" | "rose";

const TONE: Record<Tone, string> = {
  violet: "border-violet/40 bg-violet/10 text-violet",
  amber: "border-amber/40 bg-amber/10 text-amber",
  mint: "border-mint/40 bg-mint/10 text-mint",
  rose: "border-rose-500/40 bg-rose-500/10 text-rose-400",
};

function Chip({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span className={`inline-flex shrink-0 items-center rounded-md border px-2 py-0.5 font-mono text-[11px] font-semibold ${TONE[tone]}`}>
      {children}
    </span>
  );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-4 break-inside-avoid rounded-xl border border-hairline bg-surface/60 p-4 shadow-sm">
      <h3 className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-mint">{title}</h3>
      {children}
    </section>
  );
}

const ROW = "grid grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] gap-x-3 gap-y-1 border-t border-hairline/60 py-2 first:border-t-0 first:pt-0 last:pb-0";
const TEXT = "text-[13px] leading-snug text-foreground/90";
const MONO = "font-mono text-[12px] leading-snug text-foreground";

function Snippet({ title, code }: { title: string; code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    let done = false;
    try {
      await navigator.clipboard.writeText(code);
      done = true;
    } catch {
      // Some browsers block the clipboard API. Use the older copy command instead.
      const area = document.createElement("textarea");
      area.value = code;
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      try {
        done = document.execCommand("copy");
      } catch {
        done = false;
      }
      document.body.removeChild(area);
    }
    if (done) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    }
  };
  return (
    <div className="mb-3 last:mb-0">
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-[12px] font-medium text-foreground/90">{title}</span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1 rounded-md border border-hairline bg-surface px-2 py-0.5 font-mono text-[10.5px] text-muted-foreground transition-colors hover:border-mint/40 hover:text-foreground"
          aria-label={`Copy ${title}`}
        >
          {copied ? <Check className="size-3 text-mint" /> : <Copy className="size-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto rounded-lg border border-hairline bg-surface-2/50 px-3 py-2 font-mono text-[12px] leading-relaxed text-foreground/90">
        <code>
          {code.split("\n").map((line, i) => (
            <div key={i}>{highlightSql(line)}</div>
          ))}
        </code>
      </pre>
    </div>
  );
}

const TXNS = [
  { id: 1, date: "Jan 1", amount: 100 },
  { id: 2, date: "Jan 2", amount: 200 },
  { id: 3, date: "Jan 2", amount: 50 },
  { id: 4, date: "Jan 3", amount: 150 },
];

function FrameExplorer() {
  const [mode, setMode] = useState<"default" | "rows">("default");
  const [current, setCurrent] = useState(1);
  const lastPeer = TXNS.reduce((last, t, i) => (t.date === TXNS[current].date ? i : last), current);
  const end = mode === "default" ? lastPeer : current;
  const total = TXNS.slice(0, end + 1).reduce((sum, t) => sum + t.amount, 0);
  return (
    <div>
      <div className="mb-3 inline-flex rounded-lg border border-hairline bg-surface p-0.5" role="group" aria-label="Frame type">
        {(
          [
            ["default", "Default frame"],
            ["rows", "ROWS frame"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setMode(key)}
            aria-pressed={mode === key}
            className={`rounded-md px-2.5 py-1 font-mono text-[11px] transition-colors ${
              mode === key ? "bg-mint/15 font-semibold text-mint" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="mb-3 overflow-hidden rounded-lg border border-hairline">
        <table className="w-full text-left">
          <thead className="bg-surface-2 text-muted-foreground">
            <tr>
              {["txn", "date", "amount", "frame"].map((h) => (
                <th key={h} className="px-2 py-1.5 font-mono text-[10.5px] uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="font-mono text-[12px]">
            {TXNS.map((t, i) => {
              const inFrame = i <= end;
              return (
                <tr
                  key={t.id}
                  onClick={() => setCurrent(i)}
                  className={`cursor-pointer border-t border-hairline/60 transition-colors ${
                    inFrame ? "bg-mint/10" : ""
                  } ${i === current ? "outline outline-1 -outline-offset-1 outline-amber/70" : ""}`}
                >
                  <td className="px-2 py-1 text-foreground/90">{t.id}</td>
                  <td className="px-2 py-1 text-foreground/90">{t.date}</td>
                  <td className="px-2 py-1 text-foreground/90">{t.amount}</td>
                  <td className={`px-2 py-1 ${inFrame ? "text-mint" : "text-muted-foreground"}`}>
                    {i === current ? "current row" : inFrame ? (t.date === TXNS[current].date && i > current ? "peer" : "in frame") : "outside"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mb-3 text-[12.5px] text-muted-foreground" aria-live="polite">
        Click a row. Running total for transaction {TXNS[current].id}: <span className="font-mono font-semibold text-mint">{total}</span>
      </p>
      <ul className="space-y-1.5 text-[13px] leading-snug text-foreground/90">
        <li>
          <strong className="font-semibold">Peers</strong> have equal values in the window ORDER BY. Transactions 2 and 3 are peers.
        </li>
        <li>
          The default frame is <code className="font-mono text-[12px] text-mint">RANGE</code>. It includes all peers of the current row.
        </li>
        <li>
          <code className="font-mono text-[12px] text-mint">ROWS</code> counts physical rows. Add a unique key to ORDER BY.
        </li>
      </ul>
    </div>
  );
}

const STEPS = [
  "FROM and JOIN",
  "WHERE",
  "GROUP BY",
  "HAVING",
  "Window functions",
  "SELECT",
  "DISTINCT, ORDER BY, LIMIT",
];

const GROUP_TOTAL = `SELECT order_id, customer_id, amount,
       SUM(amount) OVER (
           PARTITION BY customer_id
       ) AS customer_total
FROM orders;`;

const RUNNING_TOTAL = `SUM(amount) OVER (
    PARTITION BY account_id
    ORDER BY txn_date, txn_id
    ROWS BETWEEN UNBOUNDED PRECEDING
             AND CURRENT ROW
)`;

const FILTER_WINDOW = `WITH stats AS (
    SELECT employee_id, salary,
           AVG(salary) OVER (
               PARTITION BY department
           ) AS department_avg
    FROM employees
)
SELECT employee_id, salary, department_avg
FROM stats
WHERE salary > department_avg
ORDER BY employee_id;`;

export default function WindowCheatsheet() {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-hairline bg-surface/40 px-4 py-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Colors</span>
        <Chip tone="violet">Groups</Chip>
        <Chip tone="amber">Order</Chip>
        <Chip tone="mint">Rows used</Chip>
        <span className="ml-auto text-[12.5px] text-muted-foreground">A window function adds a value to every row. It never removes rows.</span>
      </div>

      <div className="gap-4 lg:columns-2">
        <Card title="The pattern">
          <pre className="mb-3 overflow-x-auto rounded-lg border border-hairline bg-surface-2/50 px-3 py-2 font-mono text-[12.5px] leading-relaxed text-foreground/90">
            <code>
              <div>
                <span className="text-foreground">function(arguments) OVER (</span>
              </div>
              <div>
                {"    "}
                <span className="text-violet">PARTITION BY</span> group_columns
              </div>
              <div>
                {"    "}
                <span className="text-amber">ORDER BY</span> sort_columns
              </div>
              <div>
                {"    "}
                <span className="text-mint">ROWS</span> or <span className="text-mint">RANGE</span> frame
              </div>
              <div>
                <span className="text-foreground">)</span>
              </div>
            </code>
          </pre>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Chip tone="violet">PARTITION BY</Chip>
              <span className={TEXT}>Defines the groups of rows.</span>
            </div>
            <div className="flex items-start gap-2">
              <Chip tone="amber">ORDER BY</Chip>
              <span className={TEXT}>Defines their logical order.</span>
            </div>
            <div className="flex items-start gap-2">
              <Chip tone="mint">Frame</Chip>
              <span className={TEXT}>Defines which rows the calculation uses.</span>
            </div>
          </div>
          <p className={`${TEXT} mt-3 text-muted-foreground`}>
            Every part after OVER is optional. <code className="font-mono text-[12px] text-mint">OVER ()</code> uses all available rows.
          </p>
        </Card>

        <Card title="Pick the tool">
          <div>
            {[
              ["One row for each group", "GROUP BY"],
              ["The group total on every row", "SUM(x) OVER (PARTITION BY g)"],
              ["The grand total on every row", "SUM(x) OVER ()"],
              ["A running total", "ORDER BY and a ROWS frame"],
              ["A filter on a window result", "A CTE, then WHERE"],
            ].map(([need, use]) => (
              <div key={need} className={ROW}>
                <span className={TEXT}>{need}</span>
                <span className={MONO}>{use}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Rows the window uses">
          <div>
            {[
              ["OVER ()", "All rows"],
              ["PARTITION BY a", "The rows of the same partition"],
              ["ORDER BY b", "The first row through the last peer of the current row"],
              ["ORDER BY b ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW", "The first row through the current row"],
            ].map(([window, rows]) => (
              <div key={window} className={ROW}>
                <span className={MONO}>{window}</span>
                <span className={TEXT}>{rows}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Peers and frames">
          <FrameExplorer />
        </Card>

        <Card title="Order of operations">
          <ol className="mb-3 space-y-1">
            {STEPS.map((step, i) => (
              <Fragment key={step}>
                <li
                  className={`flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-[12.5px] ${
                    i === 4 ? "border-mint/60 bg-mint/15 font-semibold text-mint" : "border-hairline bg-surface text-foreground/85"
                  }`}
                >
                  <span className="w-3 font-mono text-[10px] text-muted-foreground">{i + 1}</span>
                  {step}
                  {i === 4 && <span className="ml-auto font-mono text-[10px] uppercase tracking-wider">window step</span>}
                </li>
                {i < STEPS.length - 1 && <div className="ml-4 h-1.5 w-px bg-hairline" aria-hidden />}
              </Fragment>
            ))}
          </ol>
          <div className="mb-3 flex flex-wrap items-center gap-1.5 text-[12px]">
            <span className="text-muted-foreground">Window function allowed in</span>
            <Chip tone="mint">SELECT</Chip>
            <Chip tone="mint">final ORDER BY</Chip>
            <span className="text-muted-foreground">Not allowed in</span>
            <Chip tone="rose">WHERE</Chip>
            <Chip tone="rose">GROUP BY</Chip>
            <Chip tone="rose">HAVING</Chip>
          </div>
          <p className={TEXT}>
            Window functions run after WHERE, GROUP BY, and HAVING. They run before the final ORDER BY and LIMIT.
          </p>
        </Card>

        <Card title="Patterns to copy">
          <Snippet title="Group total on every row" code={GROUP_TOTAL} />
          <Snippet title="Running total, one row at a time" code={RUNNING_TOTAL} />
          <Snippet title="Filter on a window result" code={FILTER_WINDOW} />
        </Card>

        <Card title="Check before you run">
          <ol className="space-y-2 text-[13px] leading-snug text-foreground/90">
            {[
              "Which rows enter the window? Check WHERE, GROUP BY, and HAVING first.",
              "Which column makes the groups? Put it in PARTITION BY.",
              "Does the order need a tie breaker? Add a unique key.",
              "Which frame do you want? Default RANGE or an explicit ROWS frame.",
              "Do you need to filter the result? Use a CTE, then WHERE.",
            ].map((q, i) => (
              <li key={q} className="flex items-start gap-2">
                <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border border-mint/40 bg-mint/10 font-mono text-[10px] text-mint">
                  {i + 1}
                </span>
                <span>{q}</span>
              </li>
            ))}
          </ol>
        </Card>

        <Card title="Common mistakes">
          <div>
            {[
              ["The window ORDER BY sorts the output.", "Only the final ORDER BY sets the output order."],
              ["PARTITION BY removes rows.", "It keeps every row."],
              ["OVER () uses the whole table.", "It uses the rows left after WHERE, GROUP BY, and HAVING."],
              ["Tied dates give different running totals.", "With the default frame, peers get the same total."],
              ["ROWS removes ties.", "It does not. Add a unique key to ORDER BY."],
              ["A window function can go in WHERE.", "It cannot. Use a CTE, then filter."],
            ].map(([wrong, right]) => (
              <div key={wrong} className={ROW}>
                <span className="flex items-start gap-1.5 text-[13px] leading-snug text-foreground/70">
                  <span className="mt-0.5 font-mono text-[11px] font-bold text-rose-400">NO</span>
                  <span>{wrong}</span>
                </span>
                <span className="flex items-start gap-1.5 text-[13px] leading-snug text-foreground/90">
                  <span className="mt-0.5 font-mono text-[11px] font-bold text-mint">YES</span>
                  <span>{right}</span>
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
