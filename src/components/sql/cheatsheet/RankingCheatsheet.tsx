import { Card, Chip, MONO, ROW, Snippet, TEXT } from "./WindowCheatsheet";

const TH = "px-2 py-1.5 font-mono text-[10.5px] uppercase tracking-wider";

const FUNCTIONS: [string, string, string, string][] = [
  ["ROW_NUMBER()", "Tied rows get different numbers", "No gaps", "1, 2, 3, 4, 5"],
  ["RANK()", "Tied rows share a rank", "Gaps after a tie", "1, 2, 2, 4, 5"],
  ["DENSE_RANK()", "Tied rows share a rank", "No gaps", "1, 2, 2, 3, 4"],
  ["NTILE(n)", "Ties can land in different buckets", "Bucket sizes differ by at most 1", "Bucket 1 to n"],
  ["PERCENT_RANK()", "Tied rows share a value", "0 up to 1", "(rank - 1) / (rows - 1)"],
  ["CUME_DIST()", "Tied rows share a value", "Above 0 up to 1", "rows up to the last peer / rows"],
];

// Salaries 9000, 8000, 8000, 6000, 5000 ordered by salary DESC, employee_id.
const SAMPLE_HEAD = ["salary", "row_number", "rank", "dense_rank", "ntile(2)", "percent_rank", "cume_dist"];
const SAMPLE: string[][] = [
  ["9000", "1", "1", "1", "1", "0", "0.2"],
  ["8000", "2", "2", "2", "1", "0.25", "0.6"],
  ["8000", "3", "2", "2", "1", "0.25", "0.6"],
  ["6000", "4", "4", "3", "2", "0.75", "0.8"],
  ["5000", "5", "5", "4", "2", "1", "1"],
];

const EXACTLY_N = `WITH numbered AS (
    SELECT employee_id, department, salary,
           ROW_NUMBER() OVER (
               PARTITION BY department
               ORDER BY salary DESC, employee_id
           ) AS rn
    FROM employees
)
SELECT employee_id, department, salary
FROM numbered
WHERE rn <= 2
ORDER BY department, salary DESC, employee_id;`;

const TOP_LEVELS = `WITH ranked AS (
    SELECT employee_id, department, salary,
           DENSE_RANK() OVER (
               PARTITION BY department
               ORDER BY salary DESC
           ) AS dr
    FROM employees
)
SELECT employee_id, department, salary
FROM ranked
WHERE dr <= 2
ORDER BY department, salary DESC, employee_id;`;

const QUARTILES = `NTILE(4) OVER (
    ORDER BY salary DESC, employee_id
) AS quartile`;

const POSITION = `PERCENT_RANK() OVER (ORDER BY score) AS pr,
CUME_DIST()    OVER (ORDER BY score) AS cd`;

export default function RankingCheatsheet() {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-hairline bg-surface/40 px-4 py-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Colors</span>
        <Chip tone="violet">Groups</Chip>
        <Chip tone="amber">Order and ties</Chip>
        <Chip tone="mint">Result</Chip>
        <span className="ml-auto text-[12.5px] text-muted-foreground">Ranking functions need an ORDER BY inside OVER. Ties are peers.</span>
      </div>

      <div className="gap-4 lg:columns-2">
        <Card title="The six functions">
          <div>
            {FUNCTIONS.map(([name, ties, shape, out]) => (
              <div key={name} className="space-y-1 border-t border-hairline/60 py-2 first:border-t-0 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Chip tone="mint">{name}</Chip>
                  <span className={MONO}>{out}</span>
                </div>
                <p className={TEXT}>
                  {ties}. {shape}.
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Same rows, every function">
          <div className="mb-3 overflow-x-auto rounded-lg border border-hairline">
            <table className="w-full text-left">
              <thead className="bg-surface-2 text-muted-foreground">
                <tr>
                  {SAMPLE_HEAD.map((h) => (
                    <th key={h} className={TH}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="font-mono text-[12px]">
                {SAMPLE.map((row, i) => (
                  <tr key={i} className={`border-t border-hairline/60 ${row[0] === "8000" ? "bg-amber/10" : ""}`}>
                    {row.map((cell, j) => (
                      <td key={j} className="px-2 py-1 text-foreground/90">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={TEXT}>
            The two 8000 rows are peers. Window ORDER BY is <code className="font-mono text-[12px] text-mint">salary DESC, employee_id</code>{" "}
            for ROW_NUMBER and NTILE, and <code className="font-mono text-[12px] text-mint">salary DESC</code> for the rest.
          </p>
        </Card>

        <Card title="Pick the tool">
          <div>
            {[
              ["Exactly N rows per group", "ROW_NUMBER() with a tie-breaker"],
              ["Everyone tied at the top N places", "RANK() <= N"],
              ["Everyone in the top N distinct values", "DENSE_RANK() <= N"],
              ["Equal-sized groups such as quartiles", "NTILE(n)"],
              ["Relative position from 0 to 1", "PERCENT_RANK()"],
              ["Share of rows at or below this one", "CUME_DIST()"],
            ].map(([need, use]) => (
              <div key={need} className={ROW}>
                <span className={TEXT}>{need}</span>
                <span className={MONO}>{use}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Formulas">
          <div>
            {[
              ["PERCENT_RANK()", "(rank - 1) / (rows in partition - 1). One row gives 0."],
              ["CUME_DIST()", "rows up to and including the last peer / rows in partition"],
              ["NTILE(n)", "Extra rows go to the first buckets. 10 rows into 3 buckets gives 4, 3, 3."],
            ].map(([name, rule]) => (
              <div key={name} className={ROW}>
                <span className={MONO}>{name}</span>
                <span className={TEXT}>{rule}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Top-N per group">
          <p className={`${TEXT} mb-3`}>
            <code className="font-mono text-[12px] text-mint">LIMIT N</code> applies to the whole result. For N rows per group, rank inside each group,
            then filter.
          </p>
          <ol className="mb-3 space-y-1.5 text-[13px] leading-snug text-foreground/90">
            {[
              ["Partition", "Split the rows into groups with PARTITION BY."],
              ["Order", "Sort each group from highest to lowest by the business metric."],
              ["Rank", "Assign a position or rank with a window function."],
              ["Filter", "Keep the ranks you want in an outer query over a CTE."],
              ["Sort", "Set the display order with the final ORDER BY."],
            ].map(([step, what], i) => (
              <li key={step} className="flex items-start gap-2">
                <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border border-mint/40 bg-mint/10 font-mono text-[10px] text-mint">
                  {i + 1}
                </span>
                <span>
                  <strong className="font-semibold">{step}.</strong> {what}
                </span>
              </li>
            ))}
          </ol>
          <div className="mb-3">
            {[
              ["Exactly N rows per group", "ROW_NUMBER()"],
              ["Top N competition-rank positions, ties included", "RANK()"],
              ["Top N distinct metric levels, ties included", "DENSE_RANK()"],
            ].map(([need, use]) => (
              <div key={need} className={ROW}>
                <span className={TEXT}>{need}</span>
                <span className={MONO}>{use}</span>
              </div>
            ))}
          </div>
          <div className="mb-3 grid gap-2">
            <div className="rounded-lg border border-hairline bg-surface-2/50 p-2.5">
              <Chip tone="mint">Exactly N</Chip>
              <pre className="mt-2 overflow-x-auto font-mono text-[11.5px] leading-relaxed text-foreground/90">
                {"ROW_NUMBER() OVER (\n  PARTITION BY department\n  ORDER BY salary DESC,\n           employee_id\n)"}
              </pre>
              <p className={`${TEXT} mt-1.5`}>The unique key makes the pick deterministic.</p>
            </div>
            <div className="rounded-lg border border-hairline bg-surface-2/50 p-2.5">
              <Chip tone="amber">Keep ties</Chip>
              <pre className="mt-2 overflow-x-auto font-mono text-[11.5px] leading-relaxed text-foreground/90">
                {"DENSE_RANK() OVER (\n  PARTITION BY department\n  ORDER BY salary DESC\n)"}
              </pre>
              <p className={`${TEXT} mt-1.5`}>The metric alone keeps equal values together.</p>
            </div>
          </div>
          <ul className="list-disc space-y-1.5 pl-5 text-[13px] leading-snug text-foreground/90 marker:text-mint">
            <li>
              Use the unique key only in the final <code className="font-mono text-[12px] text-mint">ORDER BY</code> when ties must stay together.
            </li>
            <li>A group with fewer than N rows returns all the rows it has.</li>
            <li>
              Large tables may need sorting inside partitions. Check plans with{" "}
              <code className="font-mono text-[12px] text-mint">EXPLAIN (ANALYZE, BUFFERS)</code>.
            </li>
          </ul>
        </Card>

        <Card title="Top 2 on 100, 100, 90, 80">
          <div>
            {[
              ["ROW_NUMBER() <= 2", "2 rows", "One of the two 100s is chosen by the tie-breaker"],
              ["RANK() <= 2", "2 rows", "Both 100s. Ranks are 1, 1, 3, 4"],
              ["DENSE_RANK() <= 2", "3 rows", "Both 100s and the 90. Ranks are 1, 1, 2, 3"],
            ].map(([rule, count, why]) => (
              <div key={rule} className="space-y-1 border-t border-hairline/60 py-2 first:border-t-0 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={MONO}>{rule}</span>
                  <Chip tone="amber">{count}</Chip>
                </div>
                <p className={TEXT}>{why}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Patterns to copy">
          <Snippet title="Exactly 2 per group" code={EXACTLY_N} />
          <Snippet title="Top 2 distinct levels, ties kept" code={TOP_LEVELS} />
          <Snippet title="Quartiles" code={QUARTILES} />
          <Snippet title="Relative position" code={POSITION} />
        </Card>

        <Card title="Check before you run">
          <ol className="space-y-2 text-[13px] leading-snug text-foreground/90">
            {[
              "Should ties stay together? Then keep any unique key out of the window ORDER BY.",
              "Do you need exactly N rows? Use ROW_NUMBER() and add a unique tie-breaker.",
              "Which column makes the groups? Put it in PARTITION BY.",
              "Do you need to filter on the rank? Use a CTE, then WHERE.",
              "Add a final ORDER BY. Only it sets the output order.",
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
              ["ROW_NUMBER() on tied rows is stable.", "Without a tie-breaker the order of tied rows is not guaranteed."],
              ["RANK() <= N returns N rows.", "It can return more, because ties share a rank."],
              ["A unique key in DENSE_RANK() is harmless.", "It splits equal values, so the ties disappear."],
              ["NTILE(4) splits the value range in four.", "It splits the rows into four ordered buckets."],
              ["NTILE keeps ties in one bucket.", "Tied rows can fall into different buckets."],
              ["A rank can be filtered in WHERE.", "It cannot. Use a CTE, then filter."],
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
