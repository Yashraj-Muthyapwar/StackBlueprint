import { useMemo } from "react";
import { AnimatePresence, motion } from "motion/react";

/**
 * Lesson-specific SQL animations for Track 02 (Querying Data).
 * Each variant renders:
 *   - a real query (multi-line SQL with the active clause highlighted)
 *   - the real source table(s) with sample rows
 *   - a step-by-step execution: predicates apply, groups form, joins build, etc.
 */

export type QueryingVariant =
  | "q-bool"
  | "q-range"
  | "q-like"
  | "q-null3vl"
  | "q-aggr"
  | "q-grpby"
  | "q-having"
  | "q-cube"
  | "q-venn"
  | "q-self"
  | "q-semianti"
  | "q-algos"
  | "q-scalar"
  | "q-corr"
  | "q-existsin"
  | "q-setops";

export const QUERYING_STEP_COUNTS: Record<QueryingVariant, number> = {
  "q-bool": 4,
  "q-range": 4,
  "q-like": 4,
  "q-null3vl": 4,
  "q-aggr": 5,
  "q-grpby": 4,
  "q-having": 5,
  "q-cube": 4,
  "q-venn": 4,
  "q-self": 4,
  "q-semianti": 3,
  "q-algos": 3,
  "q-scalar": 3,
  "q-corr": 4,
  "q-existsin": 3,
  "q-setops": 4,
};

export function QueryingAnimation({
  variant,
  step,
}: {
  variant: QueryingVariant;
  step: number;
}) {
  switch (variant) {
    case "q-bool": return <BoolLogic step={step} />;
    case "q-range": return <RangeSet step={step} />;
    case "q-like": return <LikePattern step={step} />;
    case "q-null3vl": return <Null3VL step={step} />;
    case "q-aggr": return <Aggregates step={step} />;
    case "q-grpby": return <GroupByHash step={step} />;
    case "q-having": return <HavingTower step={step} />;
    case "q-cube": return <GroupingCube step={step} />;
    case "q-venn": return <JoinVenn step={step} />;
    case "q-self": return <SelfJoinTree step={step} />;
    case "q-semianti": return <SemiAnti step={step} />;
    case "q-algos": return <JoinAlgos step={step} />;
    case "q-scalar": return <ScalarSub step={step} />;
    case "q-corr": return <Correlated step={step} />;
    case "q-existsin": return <ExistsVsIn step={step} />;
    case "q-setops": return <SetOpsDetail step={step} />;
  }
}

// ============================================================
// Shared layout & helpers
// ============================================================

const KEYWORDS = new Set([
  "SELECT","FROM","WHERE","AND","OR","NOT","NULL","IS","IN","BETWEEN","LIKE","ILIKE",
  "GROUP","BY","HAVING","ORDER","LIMIT","ON","JOIN","INNER","LEFT","RIGHT","FULL",
  "OUTER","CROSS","UNION","ALL","DISTINCT","AS","EXISTS","CASE","WHEN","THEN","ELSE","END",
  "COUNT","SUM","AVG","MIN","MAX","ROLLUP","CUBE","GROUPING","SETS","WITH","INTERSECT","EXCEPT",
]);

function hl(line: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let i = 0, key = 0;
  while (i < line.length) {
    const c = line[i];
    if (c === "-" && line[i + 1] === "-") {
      out.push(<span key={key++} className="text-muted-foreground/60">{line.slice(i)}</span>);
      break;
    }
    if (c === "'") {
      const end = line.indexOf("'", i + 1);
      const stop = end === -1 ? line.length : end + 1;
      out.push(<span key={key++} className="text-amber">{line.slice(i, stop)}</span>);
      i = stop;
      continue;
    }
    if (/[A-Za-z_]/.test(c)) {
      let j = i + 1;
      while (j < line.length && /[A-Za-z0-9_]/.test(line[j])) j++;
      const w = line.slice(i, j);
      out.push(
        KEYWORDS.has(w.toUpperCase())
          ? <span key={key++} className="text-mint">{w}</span>
          : <span key={key++}>{w}</span>
      );
      i = j;
      continue;
    }
    if (/[0-9]/.test(c)) {
      let j = i + 1;
      while (j < line.length && /[0-9.]/.test(line[j])) j++;
      out.push(<span key={key++} className="text-violet">{line.slice(i, j)}</span>);
      i = j;
      continue;
    }
    out.push(<span key={key++}>{c}</span>);
    i++;
  }
  return out;
}

function QueryBlock({ lines, activeLines }: { lines: string[]; activeLines: number[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-hairline bg-surface-2/50">
      <div className="border-b border-hairline px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        query
      </div>
      <pre className="m-0 px-3 py-2 font-mono text-[12.5px] leading-relaxed">
        {lines.map((ln, i) => {
          const active = activeLines.includes(i);
          return (
            <motion.div
              key={i}
              animate={{
                backgroundColor: active ? "rgba(64,224,180,0.10)" : "rgba(0,0,0,0)",
                opacity: activeLines.length === 0 || active ? 1 : 0.55,
              }}
              transition={{ duration: 0.25 }}
              className={`rounded px-1 ${active ? "ring-1 ring-mint/30" : ""}`}
            >
              {hl(ln.padEnd(1, " "))}
            </motion.div>
          );
        })}
      </pre>
    </div>
  );
}

type Tone = "mint" | "rose" | "amber" | "violet" | "neutral";

function MiniTable({
  title,
  cols,
  rows,
}: {
  title?: string;
  cols: string[];
  rows: {
    key: string;
    cells: (string | number | null)[];
    state?: "kept" | "dropped" | "pending" | "added";
    highlightCols?: number[];
  }[];
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-hairline">
      {title ? (
        <div className="flex items-center justify-between border-b border-hairline bg-surface-2/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          <span>{title}</span>
          <span>{rows.filter((r) => r.state !== "dropped").length} rows</span>
        </div>
      ) : null}
      <div
        className="grid border-b border-hairline bg-surface-2/40 font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground"
        style={{ gridTemplateColumns: `repeat(${cols.length}, minmax(0,1fr))` }}
      >
        {cols.map((c) => (
          <div key={c} className="px-2.5 py-1.5">{c}</div>
        ))}
      </div>
      <AnimatePresence initial={false}>
        {rows.map((r) => {
          const tone =
            r.state === "kept" || r.state === "added" ? "mint" :
            r.state === "dropped" ? "rose" : "neutral";
          const bg =
            tone === "mint" ? "bg-mint/5" :
            tone === "rose" ? "bg-rose/5" : "";
          return (
            <motion.div
              key={r.key}
              layout
              initial={{ opacity: 0, y: 4 }}
              animate={{
                opacity: r.state === "dropped" ? 0.3 : 1,
                y: 0,
                filter: r.state === "dropped" ? "grayscale(0.7)" : "grayscale(0)",
              }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3 }}
              className={`grid border-b border-hairline/60 last:border-b-0 ${bg}`}
              style={{ gridTemplateColumns: `repeat(${r.cells.length}, minmax(0,1fr))` }}
            >
              {r.cells.map((c, i) => {
                const isNull = c === null;
                const hi = r.highlightCols?.includes(i);
                return (
                  <div
                    key={i}
                    className={`px-2.5 py-1.5 font-mono text-[12px] ${
                      hi ? "bg-mint/15 text-mint" :
                      isNull ? "text-amber" :
                      r.state === "dropped" ? "text-muted-foreground line-through" :
                      "text-foreground/85"
                    }`}
                  >
                    {isNull ? "NULL" : String(c)}
                  </div>
                );
              })}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

function Note({ tone = "mint", children }: { tone?: Tone; children: React.ReactNode }) {
  const cls =
    tone === "rose" ? "border-rose/40 bg-rose/10 text-rose" :
    tone === "amber" ? "border-amber/40 bg-amber/10 text-amber" :
    tone === "violet" ? "border-violet/40 bg-violet/10 text-violet" :
    tone === "neutral" ? "border-hairline bg-surface-2/40 text-muted-foreground" :
    "border-mint/40 bg-mint/10 text-mint";
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={String(children).slice(0, 24)}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.25 }}
        className={`rounded-md border px-3 py-2 text-[12.5px] ${cls}`}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================================
// 1.1 Boolean Logic
// ============================================================

function BoolLogic({ step }: { step: number }) {
  const data = [
    { id: 1, name: "Pen",      price: 3,   stock: true,  cat: "office" },
    { id: 2, name: "Notebook", price: 25,  stock: true,  cat: "office" },
    { id: 3, name: "Keyboard", price: 120, stock: false, cat: "tech"   },
    { id: 4, name: "Monitor",  price: 320, stock: true,  cat: "tech"   },
    { id: 5, name: "Sticker",  price: 2,   stock: true,  cat: "sale"   },
    { id: 6, name: "Mouse",    price: 45,  stock: false, cat: "tech"   },
  ];
  const q = [
    "SELECT id, name, price, stock, cat",
    "FROM   products",
    "WHERE  price > 50",
    "       AND stock = true",
    "       OR cat = 'sale'",
  ];
  const cond1 = (r: typeof data[number]) => r.price > 50;
  const cond2 = (r: typeof data[number]) => r.stock === true;
  const cond3 = (r: typeof data[number]) => r.cat === "sale";
  const pass = (r: typeof data[number]) => {
    if (step === 0) return null; // raw
    if (step === 1) return cond1(r);              // price > 50
    if (step === 2) return cond1(r) && cond2(r);  // AND stock
    return (cond1(r) && cond2(r)) || cond3(r);    // OR cat = sale
  };
  const active = [[0, 1], [2], [2, 3], [2, 3, 4]][step];
  const notes = [
    "Source rows from the products table before any predicate runs.",
    "Apply price > 50 — three rows pass, three are tagged for elimination.",
    "AND short-circuits: the Keyboard already failed price, but Mouse now fails on stock=false.",
    "OR rescues the Sticker — cat='sale' makes the whole predicate TRUE regardless of price/stock.",
  ][step];
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="space-y-3">
        <QueryBlock lines={q} activeLines={active} />
        <MiniTable
          title="products"
          cols={["id", "name", "price", "stock", "cat"]}
          rows={data.map((r) => {
            const p = pass(r);
            return {
              key: `${r.id}`,
              cells: [r.id, r.name, `$${r.price}`, r.stock ? "true" : "false", r.cat],
              state: p === null ? "pending" : p ? "kept" : "dropped",
            };
          })}
        />
      </div>
      <Note>{notes}</Note>
    </div>
  );
}

// ============================================================
// 1.2 Range & Set Filtering (BETWEEN + IN)
// ============================================================

function RangeSet({ step }: { step: number }) {
  const data = [
    { id: 101, customer: "Ada",   total: 45,  status: "paid"    },
    { id: 102, customer: "Linus", total: 120, status: "paid"    },
    { id: 103, customer: "Grace", total: 8,   status: "pending" },
    { id: 104, customer: "Bob",   total: 75,  status: "shipped" },
    { id: 105, customer: "Alan",  total: 250, status: "refund"  },
    { id: 106, customer: "Eve",   total: 180, status: "shipped" },
  ];
  const q = [
    "SELECT id, customer, total, status",
    "FROM   orders",
    "WHERE  total BETWEEN 50 AND 200",
    "       AND status IN ('paid', 'shipped')",
  ];
  const c1 = (r: typeof data[number]) => r.total >= 50 && r.total <= 200;
  const c2 = (r: typeof data[number]) => ["paid", "shipped"].includes(r.status);
  const pass = (r: typeof data[number]) => {
    if (step === 0) return null;
    if (step === 1) return c1(r);
    if (step === 2) return c1(r) && c2(r);
    return c1(r) && c2(r);
  };
  const active = [[0, 1], [2], [3], [2, 3]][step];
  const notes = [
    "Raw orders table — 6 rows before filtering.",
    "BETWEEN 50 AND 200 is inclusive — Ada (45) and Grace (8) fall below; Alan (250) is above.",
    "IN ('paid','shipped') is a hash probe — Bob and Eve survive, no IN-list members rejected.",
    "Final result: 3 rows where BOTH the range AND the set predicate are TRUE.",
  ][step];
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="space-y-3">
        <QueryBlock lines={q} activeLines={active} />
        <MiniTable
          title="orders"
          cols={["id", "customer", "total", "status"]}
          rows={data.map((r) => {
            const p = pass(r);
            return {
              key: `${r.id}`,
              cells: [r.id, r.customer, `$${r.total}`, r.status],
              state: p === null ? "pending" : p ? "kept" : "dropped",
              highlightCols:
                step === 1 ? [2] : step === 2 ? [3] : step === 3 ? [2, 3] : [],
            };
          })}
        />
      </div>
      <Note>{notes}</Note>
    </div>
  );
}

// ============================================================
// 1.3 Pattern Matching (LIKE / ILIKE)
// ============================================================

function LikePattern({ step }: { step: number }) {
  const data = [
    { id: 1, name: "Alice",   email: "alice@gmail.com"    },
    { id: 2, name: "alex",    email: "alex@yahoo.com"     },
    { id: 3, name: "Bob",     email: "bob@gmail.com"      },
    { id: 4, name: "Aria",    email: "aria@outlook.com"   },
    { id: 5, name: "Charlie", email: "charlie@gmail.com"  },
    { id: 6, name: "amber",   email: "amber@protonmail.io"},
  ];
  const q = [
    "SELECT id, name, email",
    "FROM   users",
    "WHERE  email LIKE '%@gmail.com'",
    "       AND name  ILIKE 'a%'",
  ];
  const c1 = (r: typeof data[number]) => r.email.endsWith("@gmail.com");
  const c2 = (r: typeof data[number]) => r.name.toLowerCase().startsWith("a");
  const pass = (r: typeof data[number]) => {
    if (step === 0) return null;
    if (step === 1) return c1(r);
    if (step === 2) return c1(r) && c2(r);
    return c1(r) && c2(r);
  };
  const active = [[0, 1], [2], [3], [2, 3]][step];
  const notes = [
    "Raw users — names mix case (Alice vs alex vs amber).",
    "LIKE '%@gmail.com' has a LEADING wildcard → full scan (B-Tree can't seek mid-string).",
    "ILIKE 'a%' is case-insensitive AND anchored — uppercase 'Alice' & 'Aria' still match.",
    "Final survivors: gmail addresses whose name starts with A or a — 2 rows.",
  ][step];
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="space-y-3">
        <QueryBlock lines={q} activeLines={active} />
        <MiniTable
          title="users"
          cols={["id", "name", "email"]}
          rows={data.map((r) => {
            const p = pass(r);
            return {
              key: `${r.id}`,
              cells: [r.id, r.name, r.email],
              state: p === null ? "pending" : p ? "kept" : "dropped",
              highlightCols: step === 1 ? [2] : step === 2 ? [1] : step === 3 ? [1, 2] : [],
            };
          })}
        />
      </div>
      <Note tone={step === 1 ? "amber" : "mint"}>{notes}</Note>
    </div>
  );
}

// ============================================================
// 1.4 NULL Pitfalls (Three-Valued Logic)
// ============================================================

function Null3VL({ step }: { step: number }) {
  const data = [
    { id: 1, name: "Ada",   manager_id: 0 as number | null },
    { id: 2, name: "Linus", manager_id: 1 },
    { id: 3, name: "Grace", manager_id: null },
    { id: 4, name: "Bob",   manager_id: 2 },
    { id: 5, name: "Eve",   manager_id: null },
  ];
  // step 0: raw, 1: WHERE manager_id <> 1 (NULL rows drop silently), 2: add OR IS NULL fix, 3: explanation
  const q0 = [
    "SELECT id, name, manager_id",
    "FROM   employees",
    "WHERE  manager_id <> 1",
  ];
  const q1 = [
    "SELECT id, name, manager_id",
    "FROM   employees",
    "WHERE  manager_id <> 1",
    "       OR manager_id IS NULL",
  ];
  const lines = step >= 2 ? q1 : q0;
  const active = step === 0 ? [0, 1] : step === 1 ? [2] : step === 2 ? [3] : [2, 3];
  type Eval = "TRUE" | "FALSE" | "UNKNOWN";
  const evalRow = (r: typeof data[number]): Eval => {
    if (r.manager_id === null) return step >= 2 ? "TRUE" : "UNKNOWN";
    return r.manager_id !== 1 ? "TRUE" : "FALSE";
  };
  const pass = (r: typeof data[number]) => {
    if (step === 0) return null;
    const v = evalRow(r);
    return v === "TRUE";
  };
  const notes = [
    "Source: Grace and Eve have NULL manager_id (unknown / unassigned).",
    "WHERE manager_id <> 1 → NULL comparisons return UNKNOWN, NOT TRUE → those rows VANISH silently.",
    "Fix: explicitly OR manager_id IS NULL — IS NULL is the only test that returns TRUE for NULL.",
    "Lesson: every nullable column needs an explicit NULL branch in WHERE / NOT IN / CHECK.",
  ][step];
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="space-y-3">
        <QueryBlock lines={lines} activeLines={active} />
        <MiniTable
          title="employees"
          cols={["id", "name", "manager_id", "<> 1 ?"]}
          rows={data.map((r) => {
            const v = step === 0 ? "—" : evalRow(r);
            const p = pass(r);
            return {
              key: `${r.id}`,
              cells: [r.id, r.name, r.manager_id, v],
              state: p === null ? "pending" : p ? "kept" : "dropped",
            };
          })}
        />
      </div>
      <Note tone={step === 1 ? "rose" : step >= 2 ? "mint" : "neutral"}>{notes}</Note>
    </div>
  );
}

// ============================================================
// 2.1 Aggregate Functions
// ============================================================

function Aggregates({ step }: { step: number }) {
  const data = [
    { id: 1, region: "EU",   amount: 40 as number | null },
    { id: 2, region: "US",   amount: null },
    { id: 3, region: "EU",   amount: 25 },
    { id: 4, region: "APAC", amount: 90 },
    { id: 5, region: "US",   amount: 110 },
    { id: 6, region: "EU",   amount: null },
  ];
  const vals = data.map((r) => r.amount).filter((v): v is number => v !== null);
  const fns = [
    { agg: "COUNT(*)",      val: data.length,                                        note: "Counts EVERY row, NULLs included → 6." },
    { agg: "COUNT(amount)", val: vals.length,                                        note: "Counts non-NULL values only → NULLs in 'amount' are skipped." },
    { agg: "SUM(amount)",   val: `$${vals.reduce((a, b) => a + b, 0)}`,             note: "Sum of non-NULL values. SUM of an all-NULL column is NULL, not 0!" },
    { agg: "AVG(amount)",   val: `$${(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2)}`, note: "SUM / COUNT(amount), NOT COUNT(*). AVG silently excludes NULL rows." },
    { agg: "MIN/MAX(amount)", val: `${Math.min(...vals)} / ${Math.max(...vals)}`,    note: "Extremes over non-NULL values only." },
  ];
  const q = [
    "SELECT COUNT(*),",
    "       COUNT(amount),",
    "       SUM(amount),",
    "       AVG(amount),",
    "       MIN(amount), MAX(amount)",
    "FROM   sales;",
  ];
  const active = [[0], [1], [2], [3], [4]][step];
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="space-y-3">
        <QueryBlock lines={q} activeLines={active} />
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px]">
          <MiniTable
            title="sales"
            cols={["id", "region", "amount"]}
            rows={data.map((r) => ({
              key: `${r.id}`,
              cells: [r.id, r.region, r.amount === null ? null : `$${r.amount}`],
              state: step >= 1 && r.amount === null ? "dropped" : "pending",
            }))}
          />
          <div className="space-y-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className="rounded-lg border border-mint/40 bg-mint/10 p-3"
              >
                <div className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-mint">{fns[step].agg}</div>
                <div className="mt-1 font-mono text-2xl text-mint">= {fns[step].val}</div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
      <Note tone={step === 1 || step === 3 ? "amber" : "mint"}>{fns[step].note}</Note>
    </div>
  );
}

// ============================================================
// 2.2 GROUP BY — hash bucket
// ============================================================

function GroupByHash({ step }: { step: number }) {
  const data = [
    { id: 1, region: "EU",   amount: 40 },
    { id: 2, region: "US",   amount: 90 },
    { id: 3, region: "EU",   amount: 25 },
    { id: 4, region: "APAC", amount: 60 },
    { id: 5, region: "US",   amount: 110 },
    { id: 6, region: "EU",   amount: 55 },
  ];
  const q = [
    "SELECT region, SUM(amount) AS total",
    "FROM   sales",
    "GROUP  BY region;",
  ];
  const active = [[0, 1], [2], [2], [0, 2]][step];
  const buckets = useMemo(() => {
    const m = new Map<string, { region: string; rows: typeof data; sum: number }>();
    data.forEach((r) => {
      const b = m.get(r.region) ?? { region: r.region, rows: [], sum: 0 };
      b.rows.push(r); b.sum += r.amount;
      m.set(r.region, b);
    });
    return Array.from(m.values());
  }, []);
  const notes = [
    "Scan sales — 6 raw rows on the way to the GROUP BY operator.",
    "Hash each row by region → 3 buckets (EU, US, APAC) fill up.",
    "Reduce each bucket: SUM(amount) over its row list.",
    "One output row per group — region is now a key, total is the aggregate.",
  ][step];
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="space-y-3">
        <QueryBlock lines={q} activeLines={active} />
        <div className="grid gap-3 lg:grid-cols-2">
          <MiniTable
            title="sales (scan)"
            cols={["id", "region", "amount"]}
            rows={data.map((r) => ({
              key: `${r.id}`,
              cells: [r.id, r.region, `$${r.amount}`],
              state: step === 0 ? "pending" : "kept",
              highlightCols: step >= 1 ? [1] : [],
            }))}
          />
          {step >= 1 && (
            <div className="space-y-2">
              <div className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
                {step === 3 ? "result" : "hash buckets"}
              </div>
              {step < 3 ? (
                buckets.map((b) => (
                  <motion.div
                    key={b.region}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-md border border-violet/40 bg-violet/5 p-2"
                  >
                    <div className="flex items-center justify-between font-mono text-[11.5px]">
                      <span className="text-violet">region = {b.region}</span>
                      {step >= 2 && <span className="text-mint">Σ = ${b.sum}</span>}
                    </div>
                    {step === 1 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {b.rows.map((r) => (
                          <span key={r.id} className="rounded-md bg-surface px-1.5 py-0.5 font-mono text-[10.5px] text-muted-foreground ring-1 ring-hairline">
                            #{r.id}·${r.amount}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))
              ) : (
                <MiniTable
                  cols={["region", "total"]}
                  rows={buckets.map((b) => ({
                    key: b.region, cells: [b.region, `$${b.sum}`], state: "added",
                  }))}
                />
              )}
            </div>
          )}
        </div>
      </div>
      <Note>{notes}</Note>
    </div>
  );
}

// ============================================================
// 2.3 HAVING — 5-stage pipeline with real rows
// ============================================================

function HavingTower({ step }: { step: number }) {
  const data = [
    { id: 1, customer: "Ada",   total: 45,  status: "paid"    },
    { id: 2, customer: "Linus", total: 120, status: "paid"    },
    { id: 3, customer: "Grace", total: 30,  status: "pending" },
    { id: 4, customer: "Ada",   total: 80,  status: "paid"    },
    { id: 5, customer: "Bob",   total: 50,  status: "paid"    },
    { id: 6, customer: "Linus", total: 75,  status: "paid"    },
  ];
  const q = [
    "SELECT customer, SUM(total) AS revenue",
    "FROM   orders                             -- 1. FROM",
    "WHERE  status = 'paid'                    -- 2. WHERE",
    "GROUP  BY customer                        -- 3. GROUP BY",
    "HAVING SUM(total) >= 100;                 -- 4. HAVING",
  ];
  const active = [[1], [2], [3], [4], [0, 4]][step];

  // Stage results
  const afterWhere = data.filter((r) => step < 1 ? true : r.status === "paid");
  const grouped = useMemo(() => {
    if (step < 2) return [] as { customer: string; revenue: number }[];
    const src = data.filter((r) => r.status === "paid");
    const m = new Map<string, number>();
    src.forEach((r) => m.set(r.customer, (m.get(r.customer) ?? 0) + r.total));
    return Array.from(m, ([customer, revenue]) => ({ customer, revenue }));
  }, [step]);
  const afterHaving = grouped.filter((g) => g.revenue >= 100);

  const notes = [
    "1. FROM loads the orders relation — all 6 raw rows.",
    "2. WHERE runs row-by-row BEFORE grouping. Grace's pending order drops.",
    "3. GROUP BY collapses the surviving rows into one bucket per customer.",
    "4. HAVING filters GROUPS — Bob's $50 falls below the threshold.",
    "Final SELECT projects the surviving aggregates. Note SELECT runs LAST.",
  ][step];

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="space-y-3">
        <QueryBlock lines={q} activeLines={active} />
        {step <= 1 ? (
          <MiniTable
            title={step === 0 ? "orders (FROM)" : "after WHERE"}
            cols={["id", "customer", "total", "status"]}
            rows={data.map((r) => ({
              key: `${r.id}`,
              cells: [r.id, r.customer, `$${r.total}`, r.status],
              state: step === 0 ? "pending" : r.status === "paid" ? "kept" : "dropped",
              highlightCols: step === 1 ? [3] : [],
            }))}
          />
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            <MiniTable
              title="after WHERE"
              cols={["id", "customer", "total"]}
              rows={afterWhere.map((r) => ({
                key: `${r.id}`,
                cells: [r.id, r.customer, `$${r.total}`],
                state: "kept",
              }))}
            />
            <MiniTable
              title={step === 2 ? "after GROUP BY" : step === 3 ? "after HAVING" : "SELECT result"}
              cols={["customer", "revenue"]}
              rows={(step === 2 ? grouped : afterHaving.length ? afterHaving : grouped).map((g) => ({
                key: g.customer,
                cells: [g.customer, `$${g.revenue}`],
                state: step >= 3 && g.revenue < 100 ? "dropped" : "kept",
              }))}
            />
          </div>
        )}
      </div>
      <Note>{notes}</Note>
    </div>
  );
}

// ============================================================
// 2.4 GROUPING SETS / ROLLUP / CUBE
// ============================================================

function GroupingCube({ step }: { step: number }) {
  const data = [
    { region: "EU", product: "Pen",      amount: 40 },
    { region: "EU", product: "Notebook", amount: 60 },
    { region: "US", product: "Pen",      amount: 90 },
    { region: "US", product: "Notebook", amount: 110 },
  ];
  // Step 0: per (region,product). 1: per region. 2: per product. 3: grand total.
  const tiers = [
    { title: "GROUP BY region, product", rows: data.map((r) => ({ region: r.region, product: r.product, amt: r.amount })) },
    { title: "ROLLUP → subtotal per region",
      rows: Array.from(
        data.reduce((m, r) => m.set(r.region, (m.get(r.region) ?? 0) + r.amount), new Map<string, number>()),
        ([region, amt]) => ({ region, product: "∅" as string | "∅", amt })
      ) },
    { title: "CUBE → subtotal per product",
      rows: Array.from(
        data.reduce((m, r) => m.set(r.product, (m.get(r.product) ?? 0) + r.amount), new Map<string, number>()),
        ([product, amt]) => ({ region: "∅" as string, product, amt })
      ) },
    { title: "GRAND TOTAL",
      rows: [{ region: "∅", product: "∅", amt: data.reduce((s, r) => s + r.amount, 0) }] },
  ];
  const q = [
    "SELECT region, product, SUM(amount)",
    "FROM   sales",
    "GROUP  BY CUBE (region, product);",
  ];
  const notes = [
    "Leaf level: one row per (region, product) — the detail cells.",
    "ROLLUP collapses 'product' into a subtotal per region (product = NULL marker).",
    "CUBE additionally produces every other dimension subset — per product across all regions.",
    "And the grand total — both dimensions collapsed (region = NULL, product = NULL).",
  ][step];
  const t = tiers[step];
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="space-y-3">
        <QueryBlock lines={q} activeLines={[2]} />
        <MiniTable
          title="sales (source)"
          cols={["region", "product", "amount"]}
          rows={data.map((r, i) => ({
            key: `s${i}`,
            cells: [r.region, r.product, `$${r.amount}`],
            state: "pending",
          }))}
        />
        <MiniTable
          title={t.title}
          cols={["region", "product", "SUM"]}
          rows={t.rows.map((r, i) => ({
            key: `${step}-${i}`,
            cells: [r.region, r.product, `$${r.amt}`],
            state: "added",
          }))}
        />
      </div>
      <Note tone="violet">{notes}</Note>
    </div>
  );
}

// ============================================================
// 3.1 Join shapes (INNER / LEFT / RIGHT / FULL) on real tables
// ============================================================

function JoinVenn({ step }: { step: number }) {
  const users = [
    { id: 1, name: "Ada"   },
    { id: 2, name: "Linus" },
    { id: 3, name: "Grace" },
  ];
  const orders = [
    { id: 101, user_id: 1, total: 40 },
    { id: 102, user_id: 2, total: 90 },
    { id: 103, user_id: 4, total: 25 }, // orphan
  ];
  const kinds = ["INNER", "LEFT", "RIGHT", "FULL OUTER"];
  const q = [
    "SELECT u.name, o.id AS order_id, o.total",
    `FROM   users  u`,
    `${kinds[step]} JOIN orders o ON o.user_id = u.id;`,
  ];
  type Row = { u: typeof users[number] | null; o: typeof orders[number] | null };
  const result: Row[] = useMemo(() => {
    if (step === 0) {
      return orders
        .map((o): Row => ({ u: users.find((u) => u.id === o.user_id) ?? null, o }))
        .filter((p) => p.u !== null);
    }
    if (step === 1) {
      return users.flatMap((u): Row[] => {
        const ms = orders.filter((o) => o.user_id === u.id);
        return ms.length ? ms.map((o) => ({ u, o })) : [{ u, o: null }];
      });
    }
    if (step === 2) {
      return orders.map((o): Row => ({ u: users.find((u) => u.id === o.user_id) ?? null, o }));
    }
    const seen = new Set<number>();
    const acc: Row[] = users.flatMap((u): Row[] => {
      const ms = orders.filter((o) => o.user_id === u.id);
      ms.forEach((o) => seen.add(o.id));
      return ms.length ? ms.map((o) => ({ u, o })) : [{ u, o: null }];
    });
    orders.filter((o) => !seen.has(o.id)).forEach((o) => acc.push({ u: null, o }));
    return acc;
  }, [step]);
  const notes = [
    "INNER: only matched pairs survive — Grace (no orders) and order 103 (orphan user_id=4) vanish.",
    "LEFT: every user is kept — Grace appears with NULL order columns.",
    "RIGHT: every order is kept — orphan order 103 appears with NULL user columns.",
    "FULL OUTER: union of LEFT and RIGHT — Grace AND the orphan order both appear with NULLs.",
  ][step];
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="space-y-3">
        <QueryBlock lines={q} activeLines={[2]} />
        <div className="grid gap-3 lg:grid-cols-2">
          <MiniTable
            title="users (u)"
            cols={["id", "name"]}
            rows={users.map((u) => ({ key: `u${u.id}`, cells: [u.id, u.name], state: "pending" }))}
          />
          <MiniTable
            title="orders (o)"
            cols={["id", "user_id", "total"]}
            rows={orders.map((o) => ({ key: `o${o.id}`, cells: [o.id, o.user_id, `$${o.total}`], state: "pending" }))}
          />
        </div>
        <MiniTable
          title={`${kinds[step]} JOIN result`}
          cols={["u.name", "o.id", "o.total"]}
          rows={result.map((p, i) => ({
            key: `${step}-${i}`,
            cells: [p.u?.name ?? null, p.o?.id ?? null, p.o ? `$${p.o.total}` : null],
            state: "added",
          }))}
        />
      </div>
      <Note>{notes}</Note>
    </div>
  );
}

// ============================================================
// 3.2 Self join — employee → manager via aliasing
// ============================================================

function SelfJoinTree({ step }: { step: number }) {
  const emp = [
    { id: 1, name: "Ada",   manager_id: null as number | null },
    { id: 2, name: "Linus", manager_id: 1 },
    { id: 3, name: "Grace", manager_id: 1 },
    { id: 4, name: "Bob",   manager_id: 2 },
    { id: 5, name: "Alan",  manager_id: 2 },
  ];
  const q = [
    "SELECT e.name AS employee,",
    "       m.name AS manager",
    "FROM   employees e",
    "LEFT JOIN employees m ON e.manager_id = m.id;",
  ];
  const active = [[0, 1, 2], [3], [3], [0, 1, 3]][step];
  const joined = emp.map((e) => ({
    employee: e.name,
    manager: emp.find((m) => m.id === e.manager_id)?.name ?? null,
  }));
  const notes = [
    "Single table — manager_id is a FK back into the same table (Ada is the CEO, NULL).",
    "Aliasing the same table TWICE (as e and as m) lets us treat it as two logical tables.",
    "Join condition: e.manager_id = m.id — each employee row pairs with its manager row.",
    "Result reconstructs the org chart. Ada's manager is NULL (LEFT JOIN preserves her).",
  ][step];
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="space-y-3">
        <QueryBlock lines={q} activeLines={active} />
        {step <= 0 && (
          <MiniTable
            title="employees"
            cols={["id", "name", "manager_id"]}
            rows={emp.map((e) => ({ key: `${e.id}`, cells: [e.id, e.name, e.manager_id], state: "pending" }))}
          />
        )}
        {step >= 1 && step < 3 && (
          <div className="grid gap-3 lg:grid-cols-2">
            <MiniTable
              title="employees e (left)"
              cols={["id", "name", "manager_id"]}
              rows={emp.map((e) => ({ key: `e${e.id}`, cells: [e.id, e.name, e.manager_id], state: "pending", highlightCols: step === 2 ? [2] : [] }))}
            />
            <MiniTable
              title="employees m (right)"
              cols={["id", "name"]}
              rows={emp.map((e) => ({ key: `m${e.id}`, cells: [e.id, e.name], state: "pending", highlightCols: step === 2 ? [0] : [] }))}
            />
          </div>
        )}
        {step === 3 && (
          <MiniTable
            title="result"
            cols={["employee", "manager"]}
            rows={joined.map((r, i) => ({ key: `r${i}`, cells: [r.employee, r.manager], state: "added" }))}
          />
        )}
      </div>
      <Note tone="violet">{notes}</Note>
    </div>
  );
}

// ============================================================
// 3.3 Semi / Anti joins via EXISTS / NOT EXISTS
// ============================================================

function SemiAnti({ step }: { step: number }) {
  const users = [
    { id: 1, name: "Ada"   },
    { id: 2, name: "Linus" },
    { id: 3, name: "Grace" },
    { id: 4, name: "Alan"  },
  ];
  const orders = [
    { id: 101, user_id: 1, total: 40 },
    { id: 102, user_id: 1, total: 60 },
    { id: 103, user_id: 2, total: 25 },
  ];
  const hasOrder = new Set(orders.map((o) => o.user_id));
  const semiQ = [
    "SELECT u.id, u.name",
    "FROM   users u",
    "WHERE  EXISTS (",
    "         SELECT 1 FROM orders o WHERE o.user_id = u.id",
    "       );",
  ];
  const antiQ = [
    "SELECT u.id, u.name",
    "FROM   users u",
    "WHERE  NOT EXISTS (",
    "         SELECT 1 FROM orders o WHERE o.user_id = u.id",
    "       );",
  ];
  const lines = step === 2 ? antiQ : semiQ;
  const notes = [
    "Source: 4 users, 3 orders. Ada and Linus have orders; Grace and Alan don't.",
    "SEMI (EXISTS) — keep the LEFT row as soon as ONE inner match is found. No row duplication.",
    "ANTI (NOT EXISTS) — keep the LEFT row only when ZERO inner matches exist. Opposite filter.",
  ][step];
  const pass = (u: typeof users[number]) => {
    if (step === 0) return null;
    if (step === 1) return hasOrder.has(u.id);
    return !hasOrder.has(u.id);
  };
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="space-y-3">
        <QueryBlock lines={lines} activeLines={step === 0 ? [0, 1] : [2, 3]} />
        <div className="grid gap-3 lg:grid-cols-2">
          <MiniTable
            title="users (left)"
            cols={["id", "name", "has order?"]}
            rows={users.map((u) => {
              const p = pass(u);
              return {
                key: `${u.id}`,
                cells: [u.id, u.name, hasOrder.has(u.id) ? "yes" : "no"],
                state: p === null ? "pending" : p ? "kept" : "dropped",
              };
            })}
          />
          <MiniTable
            title="orders (inner)"
            cols={["id", "user_id", "total"]}
            rows={orders.map((o) => ({ key: `o${o.id}`, cells: [o.id, o.user_id, `$${o.total}`], state: "pending" }))}
          />
        </div>
      </div>
      <Note tone={step === 2 ? "rose" : "mint"}>{notes}</Note>
    </div>
  );
}

// ============================================================
// 3.4 Join algorithms — same query, different plans
// ============================================================

function JoinAlgos({ step }: { step: number }) {
  const a = [{ id: 1 }, { id: 2 }, { id: 3 }];
  const b = [{ a_id: 1, v: "x" }, { a_id: 2, v: "y" }, { a_id: 2, v: "z" }];
  const q = [
    "SELECT a.id, b.v",
    "FROM   a",
    "JOIN   b ON b.a_id = a.id;",
  ];
  const plans = [
    { name: "Nested Loop", body: "For EACH row in a (outer), scan b (inner). 3 × 3 = 9 probes. Good for tiny inputs or indexed inner.", tone: "amber" as Tone },
    { name: "Hash Join",   body: "Build hash table from smaller side (a), probe with b in O(N+M). Default for large equi-joins.", tone: "mint" as Tone },
    { name: "Sort-Merge",  body: "Sort both sides on join key, zipper-merge in O(N log N). Wins when inputs already sorted (indexed scan).", tone: "violet" as Tone },
  ];
  const p = plans[step];
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="space-y-3">
        <QueryBlock lines={q} activeLines={[2]} />
        <div className="grid gap-3 lg:grid-cols-2">
          <MiniTable title="a" cols={["id"]} rows={a.map((r) => ({ key: `a${r.id}`, cells: [r.id], state: "pending" }))} />
          <MiniTable title="b" cols={["a_id", "v"]} rows={b.map((r, i) => ({ key: `b${i}`, cells: [r.a_id, r.v], state: "pending" }))} />
        </div>
        <div className={`rounded-lg border p-3 ${
          p.tone === "amber" ? "border-amber/40 bg-amber/5" :
          p.tone === "mint" ? "border-mint/40 bg-mint/5" :
          "border-violet/40 bg-violet/5"
        }`}>
          <div className={`font-mono text-[11px] uppercase tracking-[0.14em] ${
            p.tone === "amber" ? "text-amber" : p.tone === "mint" ? "text-mint" : "text-violet"
          }`}>plan: {p.name}</div>
          {step === 0 && (
            <div className="mt-2 grid grid-cols-3 gap-1.5 font-mono text-[11px]">
              {a.flatMap((ar) => b.map((br, i) => (
                <motion.div
                  key={`${ar.id}-${i}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: (ar.id - 1) * 0.15 + i * 0.04 }}
                  className={`rounded px-1.5 py-0.5 ring-1 ${
                    ar.id === br.a_id ? "bg-mint/15 text-mint ring-mint/40" : "bg-surface text-muted-foreground ring-hairline"
                  }`}
                >a{ar.id}·b{i}</motion.div>
              )))}
            </div>
          )}
          {step === 1 && (
            <div className="mt-2 grid grid-cols-2 gap-3 font-mono text-[11.5px]">
              <div>
                <div className="text-mint/70">hash(a)</div>
                {a.map((ar) => <div key={ar.id} className="text-mint">{ar.id} → ✓</div>)}
              </div>
              <div>
                <div className="text-muted-foreground">probe b</div>
                {b.map((br, i) => <div key={i} className="text-foreground/85">b{i} → a{br.a_id}</div>)}
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="mt-2 grid grid-cols-2 gap-3 font-mono text-[11.5px]">
              <div>
                <div className="text-violet/70">sorted a</div>
                {[1, 2, 3].map((x) => <div key={x} className="text-violet">{x}</div>)}
              </div>
              <div>
                <div className="text-violet/70">sorted b.a_id</div>
                {[1, 2, 2].map((x, i) => <div key={i} className="text-violet">{x}</div>)}
              </div>
            </div>
          )}
        </div>
      </div>
      <Note tone={p.tone}>{p.body}</Note>
    </div>
  );
}

// ============================================================
// 4.1 Scalar Subqueries
// ============================================================

function ScalarSub({ step }: { step: number }) {
  const emp = [
    { id: 1, name: "Ada",   dept: "ENG", salary: 80 },
    { id: 2, name: "Linus", dept: "ENG", salary: 90 },
    { id: 3, name: "Grace", dept: "OPS", salary: 60 },
    { id: 4, name: "Bob",   dept: "ENG", salary: 70 },
  ];
  const avg = +(emp.reduce((s, e) => s + e.salary, 0) / emp.length).toFixed(2);
  const q = [
    "SELECT name, salary,",
    "       (SELECT AVG(salary) FROM employees) AS avg_pay",
    "FROM   employees;",
  ];
  const active = [[1], [1], [0, 2]][step];
  const notes = [
    "Step 1 — the planner runs the inner query first: SELECT AVG(salary) FROM employees.",
    `Step 2 — the inner produces a single scalar value (${avg}) and folds it as a constant.`,
    "Step 3 — outer SELECT projects each row alongside the cached scalar. One inner execution, total.",
  ][step];
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="space-y-3">
        <QueryBlock lines={q} activeLines={active} />
        <MiniTable
          title="employees"
          cols={["id", "name", "dept", "salary"]}
          rows={emp.map((e) => ({
            key: `${e.id}`,
            cells: [e.id, e.name, e.dept, `$${e.salary}`],
            state: "pending",
            highlightCols: step === 0 ? [3] : [],
          }))}
        />
        {step >= 1 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-lg border border-mint/40 bg-mint/10 p-3 font-mono text-[12.5px] text-mint"
          >
            inner result → <span className="text-foreground">{avg}</span> (constant, used for every outer row)
          </motion.div>
        )}
        {step === 2 && (
          <MiniTable
            title="result"
            cols={["name", "salary", "avg_pay"]}
            rows={emp.map((e) => ({
              key: `r${e.id}`,
              cells: [e.name, `$${e.salary}`, `$${avg}`],
              state: "added",
            }))}
          />
        )}
      </div>
      <Note>{notes}</Note>
    </div>
  );
}

// ============================================================
// 4.2 Correlated subqueries — O(N²)
// ============================================================

function Correlated({ step }: { step: number }) {
  const orders = [
    { id: 1, customer: "Ada"   },
    { id: 2, customer: "Linus" },
    { id: 3, customer: "Grace" },
  ];
  const items = [
    { order_id: 1, sku: "A" },
    { order_id: 1, sku: "B" },
    { order_id: 2, sku: "C" },
    { order_id: 3, sku: "D" },
    { order_id: 3, sku: "E" },
    { order_id: 3, sku: "F" },
  ];
  const slowQ = [
    "SELECT o.id, o.customer,",
    "       (SELECT COUNT(*) FROM items i",
    "        WHERE i.order_id = o.id) AS item_count",
    "FROM   orders o;",
  ];
  const fastQ = [
    "SELECT o.id, o.customer, COUNT(i.order_id) AS item_count",
    "FROM   orders o",
    "LEFT JOIN items i ON i.order_id = o.id",
    "GROUP BY o.id, o.customer;",
  ];
  const lines = step === 3 ? fastQ : slowQ;
  const active = step === 0 ? [0, 3] : step === 1 ? [1, 2] : step === 2 ? [1, 2] : [1, 2, 3];
  const visibleRow = step === 1 ? 0 : step === 2 ? orders.length - 1 : -1;
  const counts = orders.map((o) => items.filter((i) => i.order_id === o.id).length);
  const notes = [
    "Outer scan: read each order. The inner subquery references o.id — that's the 'correlation'.",
    "Row 1 → inner SELECT COUNT(*) FROM items WHERE order_id = 1 runs and returns 2.",
    "Row N → inner runs AGAIN for each outer row. N outer × inner cost = O(N × M) per scan.",
    "Rewrite as a single LEFT JOIN + GROUP BY. Planner reads each table ONCE.",
  ][step];
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="space-y-3">
        <QueryBlock lines={lines} activeLines={active} />
        <div className="grid gap-3 lg:grid-cols-2">
          <MiniTable
            title="orders o (outer)"
            cols={["id", "customer", "count"]}
            rows={orders.map((o, i) => ({
              key: `${o.id}`,
              cells: [o.id, o.customer, step >= 1 && (step === 3 || i <= visibleRow) ? counts[i] : "·"],
              state: step >= 1 && i === visibleRow ? "kept" : "pending",
            }))}
          />
          <MiniTable
            title="items i (inner)"
            cols={["order_id", "sku"]}
            rows={items.map((it, i) => ({
              key: `i${i}`,
              cells: [it.order_id, it.sku],
              state: step === 1 && it.order_id === 1 ? "kept" :
                     step === 2 && it.order_id === orders[orders.length - 1].id ? "kept" : "pending",
            }))}
          />
        </div>
      </div>
      <Note tone={step === 2 ? "rose" : step === 3 ? "mint" : "neutral"}>{notes}</Note>
    </div>
  );
}

// ============================================================
// 4.3 EXISTS vs IN
// ============================================================

function ExistsVsIn({ step }: { step: number }) {
  const users = [
    { id: 1, name: "Ada"   },
    { id: 2, name: "Linus" },
    { id: 3, name: "Grace" },
    { id: 4, name: "Alan"  },
  ];
  const orders = [
    { id: 101, user_id: 1 },
    { id: 102, user_id: 1 },
    { id: 103, user_id: 2 },
    { id: 104, user_id: null as number | null },
  ];
  const inQ = [
    "SELECT id, name",
    "FROM   users",
    "WHERE  id IN (SELECT user_id FROM orders);",
  ];
  const existsQ = [
    "SELECT id, name",
    "FROM   users u",
    "WHERE  EXISTS (SELECT 1 FROM orders o",
    "               WHERE o.user_id = u.id);",
  ];
  const notInQ = [
    "SELECT id, name",
    "FROM   users",
    "WHERE  id NOT IN (SELECT user_id FROM orders);   -- contains NULL!",
  ];
  const lines = step === 0 ? inQ : step === 1 ? existsQ : notInQ;
  const matched = new Set(orders.filter((o) => o.user_id !== null).map((o) => o.user_id as number));
  const result =
    step === 2
      ? [] // NOT IN poisoned by NULL — empty
      : users.filter((u) => matched.has(u.id));
  const notes = [
    "IN materializes the inner result {1, 1, 2, NULL}, then probes each outer id against it.",
    "EXISTS stops on the FIRST inner match per outer row → never materializes the full inner set.",
    "NOT IN with a NULL in the inner set returns UNKNOWN for every row → result is EMPTY. Use NOT EXISTS.",
  ][step];
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="space-y-3">
        <QueryBlock lines={lines} activeLines={[2]} />
        <div className="grid gap-3 lg:grid-cols-2">
          <MiniTable
            title="users (outer)"
            cols={["id", "name"]}
            rows={users.map((u) => ({
              key: `u${u.id}`,
              cells: [u.id, u.name],
              state: step === 2 ? "dropped" : matched.has(u.id) ? "kept" : "dropped",
            }))}
          />
          <MiniTable
            title="orders.user_id (inner)"
            cols={["user_id"]}
            rows={orders.map((o, i) => ({
              key: `o${i}`,
              cells: [o.user_id],
              state: step === 2 && o.user_id === null ? "kept" : "pending",
            }))}
          />
        </div>
        {step !== 2 && (
          <MiniTable
            title="result"
            cols={["id", "name"]}
            rows={result.map((u) => ({ key: `r${u.id}`, cells: [u.id, u.name], state: "added" }))}
          />
        )}
      </div>
      <Note tone={step === 2 ? "rose" : step === 1 ? "mint" : "violet"}>{notes}</Note>
    </div>
  );
}

// ============================================================
// 4.4 Set Operations
// ============================================================

function SetOpsDetail({ step }: { step: number }) {
  const A = [
    { id: 1, email: "a@x.com" },
    { id: 2, email: "b@x.com" },
    { id: 3, email: "c@x.com" },
    { id: 2, email: "b@x.com" }, // duplicate
  ];
  const B = [
    { id: 3, email: "c@x.com" },
    { id: 4, email: "d@x.com" },
    { id: 5, email: "e@x.com" },
  ];
  const ops = [
    { name: "UNION",     body: "Combine then DEDUPLICATE (sort/hash) → unique rows only. Hidden CPU cost.",
      rows: dedupe([...A, ...B]) },
    { name: "UNION ALL", body: "Pure append — keeps duplicates → fastest set op, no sort/hash.",
      rows: [...A, ...B] },
    { name: "INTERSECT", body: "Rows present in BOTH sides, deduplicated.",
      rows: dedupe(A.filter((a) => B.some((b) => b.id === a.id))) },
    { name: "EXCEPT",    body: "Rows in A NOT in B (a.k.a. MINUS), deduplicated.",
      rows: dedupe(A.filter((a) => !B.some((b) => b.id === a.id))) },
  ];
  const o = ops[step];
  const q = [
    "SELECT id, email FROM customers_eu",
    `${o.name}`,
    "SELECT id, email FROM customers_us;",
  ];
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="space-y-3">
        <QueryBlock lines={q} activeLines={[1]} />
        <div className="grid gap-3 lg:grid-cols-2">
          <MiniTable
            title="customers_eu (A)"
            cols={["id", "email"]}
            rows={A.map((r, i) => ({ key: `a${i}`, cells: [r.id, r.email], state: "pending" }))}
          />
          <MiniTable
            title="customers_us (B)"
            cols={["id", "email"]}
            rows={B.map((r, i) => ({ key: `b${i}`, cells: [r.id, r.email], state: "pending" }))}
          />
        </div>
        <MiniTable
          title={`${o.name} → ${o.rows.length} rows`}
          cols={["id", "email"]}
          rows={o.rows.map((r, i) => ({ key: `${step}-${i}`, cells: [r.id, r.email], state: "added" }))}
        />
      </div>
      <Note tone={step === 1 ? "mint" : "violet"}>{o.body}</Note>
    </div>
  );
}

function dedupe<T extends { id: number; email: string }>(rows: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const r of rows) {
    const k = `${r.id}|${r.email}`;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(r);
  }
  return out;
}
