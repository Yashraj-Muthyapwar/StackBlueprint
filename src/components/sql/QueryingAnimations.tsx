import { useMemo } from "react";
import { AnimatePresence, motion } from "motion/react";

/**
 * Lesson-specific animations for SQL Track 02 (Querying Data).
 * Each lesson gets a unique visual tailored to its concept.
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
  "q-having": 4,
  "q-cube": 4,
  "q-venn": 4,
  "q-self": 3,
  "q-semianti": 3,
  "q-algos": 3,
  "q-scalar": 3,
  "q-corr": 3,
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

// ------------ Shared helpers ------------

function Caption({ tone = "mint", title, children }: { tone?: "mint" | "violet" | "amber" | "rose" | "neutral"; title?: string; children: React.ReactNode }) {
  const toneCls =
    tone === "violet" ? "border-violet/40 bg-violet/10 text-violet" :
    tone === "amber" ? "border-amber/40 bg-amber/10 text-amber" :
    tone === "rose" ? "border-rose/40 bg-rose/10 text-rose" :
    "border-mint/40 bg-mint/10 text-mint";
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={title ?? String(children)}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.3 }}
        className={`self-start rounded-lg border p-3 ${toneCls}`}
      >
        {title ? (
          <div className="font-mono text-[11px] uppercase tracking-[0.14em]">{title}</div>
        ) : null}
        <div className="mt-1 text-sm text-foreground/90">{children}</div>
      </motion.div>
    </AnimatePresence>
  );
}

function Chip({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "mint" | "rose" | "amber" | "violet";
}) {
  const cls =
    tone === "mint" ? "bg-mint/15 text-mint ring-mint/40" :
    tone === "rose" ? "bg-rose/15 text-rose ring-rose/40" :
    tone === "amber" ? "bg-amber/15 text-amber ring-amber/40" :
    tone === "violet" ? "bg-violet/15 text-violet ring-violet/40" :
    "bg-surface-2/50 text-muted-foreground ring-hairline";
  return (
    <span className={`rounded-md px-2 py-0.5 font-mono text-[12px] ring-1 ${cls}`}>{children}</span>
  );
}

// ============ 1.1 Boolean Logic ============

function BoolLogic({ step }: { step: number }) {
  // Build truth table progressively: AND, OR, NOT, short-circuit
  const rows = [
    { a: "T", b: "T", and: "T", or: "T" },
    { a: "T", b: "F", and: "F", or: "T" },
    { a: "F", b: "T", and: "F", or: "T" },
    { a: "F", b: "F", and: "F", or: "F" },
  ];
  const showAnd = step >= 0;
  const showOr = step >= 1;
  const showNot = step >= 2;
  const shortCircuit = step >= 3;
  const captions = [
    { title: "AND", body: "AND returns TRUE only when both operands are TRUE." },
    { title: "OR", body: "OR returns TRUE if either operand is TRUE." },
    { title: "NOT", body: "NOT flips the value: NOT TRUE = FALSE, NOT FALSE = TRUE." },
    { title: "SHORT-CIRCUIT", body: "Engines stop evaluating once the result is decided — false AND … skips the rest." },
  ];
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_240px]">
      <div className="overflow-hidden rounded-lg border border-hairline">
        <div className="grid grid-cols-5 border-b border-hairline bg-surface-2/60 font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
          <div className="px-3 py-2">A</div>
          <div className="px-3 py-2">B</div>
          <div className="px-3 py-2">A AND B</div>
          <div className="px-3 py-2">A OR B</div>
          <div className="px-3 py-2">NOT A</div>
        </div>
        {rows.map((r, i) => {
          const skipped = shortCircuit && r.a === "F"; // short-circuit AND: B not eval
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.06 }}
              className="grid grid-cols-5 border-b border-hairline/60 font-mono text-[12.5px] last:border-b-0"
            >
              <div className="px-3 py-2">{r.a}</div>
              <div className={`px-3 py-2 ${skipped ? "text-amber/70 line-through" : ""}`}>{r.b}</div>
              <div className={`px-3 py-2 ${showAnd ? (r.and === "T" ? "text-mint" : "text-rose") : "text-muted-foreground/40"}`}>{showAnd ? r.and : "·"}</div>
              <div className={`px-3 py-2 ${showOr ? (r.or === "T" ? "text-mint" : "text-rose") : "text-muted-foreground/40"}`}>{showOr ? r.or : "·"}</div>
              <div className={`px-3 py-2 ${showNot ? (r.a === "T" ? "text-rose" : "text-mint") : "text-muted-foreground/40"}`}>{showNot ? (r.a === "T" ? "F" : "T") : "·"}</div>
            </motion.div>
          );
        })}
      </div>
      <Caption title={captions[step].title}>{captions[step].body}</Caption>
    </div>
  );
}

// ============ 1.2 Range & Set (IN / BETWEEN) ============

function RangeSet({ step }: { step: number }) {
  const items = [3, 8, 12, 17, 25, 33, 41, 50, 64];
  const inRange = (n: number) => n >= 10 && n <= 40;
  const inSet = (n: number) => [12, 25, 41].includes(n);
  const between = step >= 1;
  const setStep = step >= 2;
  const both = step === 3;
  const captions = [
    { title: "raw values", body: "Unfiltered column values on a number line." },
    { title: "BETWEEN 10 AND 40", body: "Inclusive range — both endpoints survive." },
    { title: "IN (12, 25, 41)", body: "Set membership — only listed values match." },
    { title: "OR vs IN", body: "IN rewrites to a hash probe; long OR chains may stay as sequential checks." },
  ];
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_240px]">
      <div className="space-y-5">
        {/* Number line */}
        <div className="relative h-20 rounded-lg border border-hairline bg-surface-2/40 p-3">
          <div className="absolute inset-x-3 top-1/2 h-px bg-hairline" />
          {between && (
            <motion.div
              layout
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.5 }}
              style={{ originX: 0, left: `${3 + (10 / 70) * 90}%`, width: `${((40 - 10) / 70) * 90}%` }}
              className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-mint/30 ring-1 ring-mint/60"
            />
          )}
          {items.map((n) => {
            const x = ((n - 0) / 70) * 90 + 3;
            const matches = (between && inRange(n)) || (setStep && inSet(n));
            const accent = both ? (inRange(n) && inSet(n)) : matches;
            return (
              <motion.div
                key={n}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.02 * n }}
                style={{ left: `${x}%` }}
                className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
              >
                <div className={`size-7 rounded-full ring-1 grid place-items-center font-mono text-[11px] ${
                  accent ? "bg-mint/20 text-mint ring-mint/50" :
                  matches ? "bg-violet/15 text-violet ring-violet/40" :
                  "bg-surface text-muted-foreground ring-hairline"
                }`}>{n}</div>
              </motion.div>
            );
          })}
        </div>
        {/* Set bucket */}
        {setStep && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg border border-violet/30 bg-violet/5 p-3">
            <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-violet">IN-list hash</div>
            <div className="mt-1.5 flex gap-2">
              {[12, 25, 41].map((x) => <Chip key={x} tone="violet">{x}</Chip>)}
            </div>
          </motion.div>
        )}
      </div>
      <Caption title={captions[step].title}>{captions[step].body}</Caption>
    </div>
  );
}

// ============ 1.3 LIKE / ILIKE ============

function LikePattern({ step }: { step: number }) {
  const names = ["alpha", "alphabet", "Alpine", "beta", "alpaca"];
  const patterns = [
    { title: "anchored — 'al%'", expr: "name LIKE 'al%'", test: (s: string) => s.toLowerCase().startsWith("al"), index: "B-Tree index seek ✓", tone: "mint" as const },
    { title: "leading wildcard — '%pha'", expr: "name LIKE '%pha'", test: (s: string) => s.toLowerCase().endsWith("pha"), index: "Full scan — B-Tree useless ✗", tone: "rose" as const },
    { title: "ILIKE — case-insensitive", expr: "name ILIKE 'ALP%'", test: (s: string) => s.toLowerCase().startsWith("alp"), index: "Use citext / expression index", tone: "amber" as const },
    { title: "underscore — single char", expr: "name LIKE 'al_ha'", test: (s: string) => /^al.ha$/i.test(s), index: "Anchored prefix still seekable", tone: "mint" as const },
  ];
  const p = patterns[step];
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_240px]">
      <div className="space-y-3">
        <div className="rounded-lg border border-hairline bg-surface-2/40 p-3 font-mono text-[12.5px] text-foreground/90">
          WHERE <span className="text-mint">{p.expr}</span>
        </div>
        <div className="space-y-1.5">
          {names.map((n) => {
            const match = p.test(n);
            return (
              <motion.div
                key={n}
                layout
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-center gap-3 rounded-md border px-3 py-1.5 font-mono text-[12.5px] ${
                  match ? "border-mint/40 bg-mint/5 text-mint" : "border-hairline bg-surface text-muted-foreground"
                }`}
              >
                <span className="w-5">{match ? "✓" : "·"}</span>
                <span>{n}</span>
              </motion.div>
            );
          })}
        </div>
        <div className={`rounded-md px-3 py-2 font-mono text-[11px] ring-1 ${
          p.tone === "mint" ? "bg-mint/10 text-mint ring-mint/40" :
          p.tone === "rose" ? "bg-rose/10 text-rose ring-rose/40" :
          "bg-amber/10 text-amber ring-amber/40"
        }`}>{p.index}</div>
      </div>
      <Caption title={p.title} tone={p.tone}>
        {step === 0 && "Anchored prefix lets the optimizer walk the B-Tree directly to matches."}
        {step === 1 && "A leading % forces a full table scan — the B-Tree can't seek mid-string."}
        {step === 2 && "ILIKE folds case; use citext or LOWER(col) expression index to stay seekable."}
        {step === 3 && "Underscore matches exactly one character; prefix anchoring is preserved."}
      </Caption>
    </div>
  );
}

// ============ 1.4 NULL 3-Valued Logic ============

function Null3VL({ step }: { step: number }) {
  // Show NULL behavior: comparison, AND, OR, IS NULL
  const tabs = [
    { title: "= NULL", body: "Returns UNKNOWN — never TRUE. Use IS NULL instead.", rows: [["1", "= NULL", "UNKNOWN"], ["NULL", "= NULL", "UNKNOWN"], ["NULL", "IS NULL", "TRUE"]] },
    { title: "AND with NULL", body: "TRUE AND NULL = NULL. FALSE AND NULL = FALSE (short-circuits).", rows: [["TRUE", "AND NULL", "NULL"], ["FALSE", "AND NULL", "FALSE"], ["NULL", "AND NULL", "NULL"]] },
    { title: "OR with NULL", body: "TRUE OR NULL = TRUE (short-circuits). FALSE OR NULL = NULL.", rows: [["TRUE", "OR NULL", "TRUE"], ["FALSE", "OR NULL", "NULL"], ["NULL", "OR NULL", "NULL"]] },
    { title: "WHERE drops UNKNOWN", body: "Only TRUE rows survive WHERE — UNKNOWN rows vanish silently.", rows: [["x = 5", "→ TRUE", "kept"], ["x = NULL", "→ UNKNOWN", "dropped"], ["x IS NULL", "→ TRUE", "kept"]] },
  ];
  const t = tabs[step];
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_240px]">
      <div className="overflow-hidden rounded-lg border border-hairline">
        <div className="grid grid-cols-3 border-b border-hairline bg-surface-2/60 font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
          <div className="px-3 py-2">A</div>
          <div className="px-3 py-2">op</div>
          <div className="px-3 py-2">result</div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={step}>
            {t.rows.map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="grid grid-cols-3 border-b border-hairline/60 font-mono text-[12.5px] last:border-b-0"
              >
                <div className="px-3 py-2">{r[0]}</div>
                <div className="px-3 py-2 text-muted-foreground">{r[1]}</div>
                <div className={`px-3 py-2 ${
                  r[2] === "TRUE" || r[2] === "kept" ? "text-mint" :
                  r[2] === "FALSE" || r[2] === "dropped" ? "text-rose" :
                  "text-amber"
                }`}>{r[2]}</div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
      <Caption title={t.title} tone="amber">{t.body}</Caption>
    </div>
  );
}

// ============ 2.1 Aggregate Functions ============

function Aggregates({ step }: { step: number }) {
  const rows = [
    { id: 1, v: 40 as number | null },
    { id: 2, v: null },
    { id: 3, v: 25 },
    { id: 4, v: 90 },
    { id: 5, v: 15 },
  ];
  const vals = rows.map((r) => r.v).filter((v): v is number => v !== null);
  const fns = [
    { title: "COUNT(*)", value: rows.length, body: "Counts every row — NULLs included." },
    { title: "COUNT(v)", value: vals.length, body: "Counts NON-NULL values only — NULL rows are skipped." },
    { title: "SUM(v)", value: vals.reduce((a, b) => a + b, 0), body: "Sums non-NULL values. SUM of all NULLs = NULL (not 0!)." },
    { title: "AVG(v)", value: +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2), body: "SUM / COUNT(v), not COUNT(*). AVG silently excludes NULL." },
    { title: "MIN / MAX", value: `${Math.min(...vals)} / ${Math.max(...vals)}`, body: "Extremes over non-NULL values." },
  ];
  const fn = fns[step];
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_240px]">
      <div className="space-y-3">
        <div className="overflow-hidden rounded-lg border border-hairline">
          <div className="grid grid-cols-2 border-b border-hairline bg-surface-2/60 font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
            <div className="px-3 py-2">id</div>
            <div className="px-3 py-2">v</div>
          </div>
          {rows.map((r) => {
            const skipped = step >= 1 && r.v === null;
            return (
              <motion.div
                key={r.id}
                animate={{ opacity: skipped ? 0.3 : 1 }}
                className="grid grid-cols-2 border-b border-hairline/60 font-mono text-[12.5px] last:border-b-0"
              >
                <div className="px-3 py-2">{r.id}</div>
                <div className={`px-3 py-2 ${r.v === null ? "text-amber" : ""}`}>{r.v === null ? "NULL" : r.v}</div>
              </motion.div>
            );
          })}
        </div>
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-lg border border-mint/40 bg-mint/10 px-4 py-3"
        >
          <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-mint">{fn.title}</div>
          <div className="mt-1 font-mono text-2xl text-mint">= {fn.value}</div>
        </motion.div>
      </div>
      <Caption title="result">{fn.body}</Caption>
    </div>
  );
}

// ============ 2.2 GROUP BY (hash bucket) ============

function GroupByHash({ step }: { step: number }) {
  const rows = [
    { id: 1, k: "EU", v: 40 },
    { id: 2, k: "US", v: 90 },
    { id: 3, k: "EU", v: 25 },
    { id: 4, k: "APAC", v: 60 },
    { id: 5, k: "US", v: 110 },
  ];
  const seenUpTo = Math.min(rows.length, [1, 3, 5, 5][step]);
  const buckets = useMemo(() => {
    const m = new Map<string, { k: string; rows: typeof rows; sum: number }>();
    rows.slice(0, seenUpTo).forEach((r) => {
      const b = m.get(r.k) ?? { k: r.k, rows: [], sum: 0 };
      b.rows.push(r);
      b.sum += r.v;
      m.set(r.k, b);
    });
    return Array.from(m.values());
  }, [seenUpTo]);
  const captions = [
    "Hash the key of row 1 → bucket created.",
    "More rows hash into matching buckets.",
    "All rows distributed across hash buckets.",
    "Collapse each bucket → one output row per group.",
  ];
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_240px]">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="mb-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">incoming rows</div>
          <div className="space-y-1">
            {rows.map((r, i) => (
              <motion.div
                key={r.id}
                animate={{ opacity: i < seenUpTo ? 1 : 0.3, x: i < seenUpTo ? 0 : -6 }}
                className="flex items-center justify-between rounded-md border border-hairline bg-surface px-2.5 py-1 font-mono text-[12px]"
              >
                <span>#{r.id}</span>
                <Chip tone={i < seenUpTo ? "violet" : "neutral"}>{r.k}</Chip>
                <span className="text-muted-foreground">${r.v}</span>
              </motion.div>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">hash buckets</div>
          <div className="space-y-2">
            <AnimatePresence>
              {buckets.map((b) => (
                <motion.div
                  key={b.k}
                  layout
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-md border border-mint/40 bg-mint/5 p-2"
                >
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-mint">{b.k}</span>
                    {step >= 3 ? <span className="text-mint">Σ ${b.sum}</span> : <span className="text-muted-foreground">{b.rows.length} rows</span>}
                  </div>
                  {step < 3 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {b.rows.map((r) => <Chip key={r.id}>#{r.id}</Chip>)}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
      <Caption>{captions[step]}</Caption>
    </div>
  );
}

// ============ 2.3 HAVING tower (pipeline order) ============

function HavingTower({ step }: { step: number }) {
  const stages = [
    { name: "FROM", note: "Load orders table — 7 rows." },
    { name: "WHERE", note: "Row-level filter: status = 'paid' → 5 rows survive." },
    { name: "GROUP BY", note: "Collapse into buckets by customer → 3 groups." },
    { name: "HAVING", note: "Group-level filter: SUM(total) >= 100 → 2 groups remain." },
  ];
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_240px]">
      <div className="space-y-2">
        {stages.map((s, i) => {
          const active = i === step;
          const done = i < step;
          return (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`flex items-center gap-3 rounded-lg border px-3 py-2 ${
                active ? "border-mint/50 bg-mint/10" :
                done ? "border-hairline bg-surface-2/40" :
                "border-hairline/50 bg-surface opacity-50"
              }`}
            >
              <div className={`grid size-7 place-items-center rounded-md font-mono text-[11px] ${
                active ? "bg-mint text-bg" : done ? "bg-mint/20 text-mint" : "bg-surface-2 text-muted-foreground"
              }`}>{i + 1}</div>
              <div className="flex-1">
                <div className={`font-mono text-[12.5px] ${active ? "text-mint" : "text-foreground/90"}`}>{s.name}</div>
                <div className="text-[11.5px] text-muted-foreground">{s.note}</div>
              </div>
              {i < stages.length - 1 && (
                <div className="font-mono text-muted-foreground/60">↓</div>
              )}
            </motion.div>
          );
        })}
      </div>
      <Caption title={stages[step].name}>
        HAVING runs <em className="not-italic text-mint">after</em> GROUP BY, so it can reference aggregates. Predicates that don't need aggregates belong in WHERE for early pruning.
      </Caption>
    </div>
  );
}

// ============ 2.4 GROUPING SETS / ROLLUP / CUBE ============

function GroupingCube({ step }: { step: number }) {
  // Show which dimension combinations are computed
  const dims = ["region", "product"];
  const sets = [
    { title: "GROUP BY region", combos: [["region"]] },
    { title: "GROUPING SETS ((region),(product))", combos: [["region"], ["product"]] },
    { title: "ROLLUP (region, product)", combos: [["region", "product"], ["region"], []] },
    { title: "CUBE (region, product)", combos: [["region", "product"], ["region"], ["product"], []] },
  ];
  const s = sets[step];
  const allCombos = [["region", "product"], ["region"], ["product"], []];
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_240px]">
      <div className="space-y-3">
        <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">dimension lattice</div>
        <div className="grid grid-cols-4 gap-2">
          {allCombos.map((c) => {
            const included = s.combos.some((sc) => sc.length === c.length && sc.every((x, i) => x === c[i]));
            return (
              <motion.div
                key={c.join("|") || "∅"}
                animate={{
                  scale: included ? 1 : 0.92,
                  opacity: included ? 1 : 0.35,
                }}
                className={`rounded-lg border p-3 text-center ${
                  included ? "border-mint/50 bg-mint/10" : "border-hairline bg-surface"
                }`}
              >
                <div className={`font-mono text-[11px] ${included ? "text-mint" : "text-muted-foreground"}`}>
                  {c.length === 0 ? "GRAND TOTAL" : c.join(" × ")}
                </div>
                <div className="mt-1 text-[10.5px] text-muted-foreground/70">
                  {c.length === 0 ? "1 row" : c.length === 1 ? "per-dim" : "leaf"}
                </div>
              </motion.div>
            );
          })}
        </div>
        <div className="rounded-md bg-surface-2/40 px-3 py-2 font-mono text-[11.5px] text-foreground/85">
          {s.title}
        </div>
      </div>
      <Caption title="lattice">
        {step === 0 && "Single bucket per region — one level only."}
        {step === 1 && "Two independent grouping sets unioned in one pass."}
        {step === 2 && "ROLLUP walks up the hierarchy: detail → sub-totals → grand total."}
        {step === 3 && "CUBE computes every combination — 2ⁿ groupings for n columns."}
      </Caption>
    </div>
  );
}

// ============ 3.1 Join shapes (Venn) ============

function JoinVenn({ step }: { step: number }) {
  const types = [
    { title: "INNER JOIN", left: false, mid: true, right: false, note: "Intersection only — matched pairs survive." },
    { title: "LEFT JOIN", left: true, mid: true, right: false, note: "Every left row; right side NULLs when unmatched." },
    { title: "RIGHT JOIN", left: false, mid: true, right: true, note: "Every right row; left side NULLs when unmatched." },
    { title: "FULL OUTER", left: true, mid: true, right: true, note: "Union — every unmatched side fills with NULLs." },
  ];
  const t = types[step];
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_240px]">
      <div className="relative h-[220px] rounded-lg border border-hairline bg-surface-2/30">
        <svg viewBox="0 0 320 200" className="absolute inset-0 h-full w-full">
          <defs>
            <mask id="leftOnly"><rect width="320" height="200" fill="white" /><circle cx="200" cy="100" r="70" fill="black" /></mask>
            <mask id="rightOnly"><rect width="320" height="200" fill="white" /><circle cx="120" cy="100" r="70" fill="black" /></mask>
          </defs>
          {/* left circle base */}
          <circle cx="120" cy="100" r="70" className="fill-violet/10 stroke-violet/40" />
          <circle cx="200" cy="100" r="70" className="fill-mint/10 stroke-mint/40" />
          {/* highlights */}
          {t.left && <circle cx="120" cy="100" r="70" className="fill-violet/40" mask="url(#leftOnly)" />}
          {t.right && <circle cx="200" cy="100" r="70" className="fill-mint/40" mask="url(#rightOnly)" />}
          {t.mid && (
            <g>
              <circle cx="120" cy="100" r="70" className="fill-amber/40" mask="url(#leftOnly)" style={{ display: "none" }} />
              {/* intersection: draw both circles clipped */}
              <clipPath id="clipL"><circle cx="120" cy="100" r="70" /></clipPath>
              <circle cx="200" cy="100" r="70" className="fill-amber/40" clipPath="url(#clipL)" />
            </g>
          )}
          <text x="80" y="105" textAnchor="middle" className="fill-violet font-mono text-[11px]">users</text>
          <text x="240" y="105" textAnchor="middle" className="fill-mint font-mono text-[11px]">orders</text>
        </svg>
      </div>
      <Caption title={t.title}>{t.note}</Caption>
    </div>
  );
}

// ============ 3.2 Self joins (employee tree) ============

function SelfJoinTree({ step }: { step: number }) {
  // Show table -> aliased self-join -> hierarchy
  const emp = [
    { id: 1, name: "Ada", mgr: null },
    { id: 2, name: "Linus", mgr: 1 },
    { id: 3, name: "Grace", mgr: 1 },
    { id: 4, name: "Bob", mgr: 2 },
    { id: 5, name: "Alan", mgr: 2 },
  ];
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_240px]">
      {step === 0 && (
        <div className="overflow-hidden rounded-lg border border-hairline">
          <div className="grid grid-cols-3 border-b border-hairline bg-surface-2/60 font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
            <div className="px-3 py-2">id</div><div className="px-3 py-2">name</div><div className="px-3 py-2">manager_id</div>
          </div>
          {emp.map((e) => (
            <div key={e.id} className="grid grid-cols-3 border-b border-hairline/60 font-mono text-[12.5px] last:border-b-0">
              <div className="px-3 py-2">{e.id}</div>
              <div className="px-3 py-2">{e.name}</div>
              <div className={`px-3 py-2 ${e.mgr === null ? "text-amber" : ""}`}>{e.mgr ?? "NULL"}</div>
            </div>
          ))}
        </div>
      )}
      {step === 1 && (
        <div className="grid grid-cols-2 gap-3">
          {["e (employee)", "m (manager)"].map((alias) => (
            <div key={alias} className="rounded-lg border border-violet/40 bg-violet/5 p-2">
              <div className="mb-1 font-mono text-[11px] text-violet">{alias}</div>
              {emp.map((x) => (
                <div key={x.id} className="font-mono text-[12px] text-foreground/80">#{x.id} {x.name}</div>
              ))}
            </div>
          ))}
        </div>
      )}
      {step === 2 && (
        <div className="space-y-2">
          {[1].map((rootId) => (
            <Tree key={rootId} id={rootId} emp={emp} depth={0} />
          ))}
        </div>
      )}
      <Caption title={["raw table", "two aliases", "hierarchy"][step]}>
        {step === 0 && "Single table — the manager_id is a foreign key back into the same table."}
        {step === 1 && "Aliasing the same table twice (e, m) lets us join row-to-row within itself."}
        {step === 2 && "Joining e.manager_id = m.id reconstructs the org tree."}
      </Caption>
    </div>
  );
}

function Tree({ id, emp, depth }: { id: number; emp: { id: number; name: string; mgr: number | null }[]; depth: number }) {
  const me = emp.find((x) => x.id === id);
  if (!me) return null;
  const kids = emp.filter((x) => x.mgr === id);
  return (
    <div style={{ marginLeft: depth * 18 }}>
      <motion.div
        initial={{ opacity: 0, x: -6 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: depth * 0.1 }}
        className="inline-flex items-center gap-2 rounded-md border border-mint/40 bg-mint/5 px-2 py-1 font-mono text-[12px] text-mint"
      >
        {depth > 0 && <span className="text-muted-foreground">└</span>}
        #{me.id} {me.name}
      </motion.div>
      <div className="mt-1 space-y-1">
        {kids.map((k) => <Tree key={k.id} id={k.id} emp={emp} depth={depth + 1} />)}
      </div>
    </div>
  );
}

// ============ 3.3 Semi/Anti joins ============

function SemiAnti({ step }: { step: number }) {
  const users = [
    { id: 1, name: "Ada" },
    { id: 2, name: "Linus" },
    { id: 3, name: "Grace" },
    { id: 4, name: "Alan" },
  ];
  const orderUserIds = new Set([1, 2]);
  const variants = [
    { title: "all users", filter: () => true, tone: "neutral" as const },
    { title: "SEMI — EXISTS (has order)", filter: (u: typeof users[number]) => orderUserIds.has(u.id), tone: "mint" as const },
    { title: "ANTI — NOT EXISTS (no order)", filter: (u: typeof users[number]) => !orderUserIds.has(u.id), tone: "rose" as const },
  ];
  const v = variants[step];
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_240px]">
      <div className="space-y-1.5">
        {users.map((u) => {
          const kept = v.filter(u);
          return (
            <motion.div
              key={u.id}
              animate={{ opacity: kept ? 1 : 0.3, x: kept ? 0 : -6 }}
              className={`flex items-center gap-3 rounded-md border px-3 py-1.5 font-mono text-[12.5px] ${
                kept && step === 1 ? "border-mint/40 bg-mint/5 text-mint" :
                kept && step === 2 ? "border-rose/40 bg-rose/5 text-rose" :
                "border-hairline bg-surface text-foreground/80"
              }`}
            >
              <span className="w-5">{kept ? "✓" : "·"}</span>
              <span>#{u.id} {u.name}</span>
              <span className="ml-auto text-[11px] text-muted-foreground">
                {orderUserIds.has(u.id) ? "has order" : "no order"}
              </span>
            </motion.div>
          );
        })}
      </div>
      <Caption title={v.title} tone={v.tone}>
        {step === 0 && "Start with the left side — every user row."}
        {step === 1 && "EXISTS keeps a row as soon as ONE match is found — no duplication, no widening."}
        {step === 2 && "NOT EXISTS keeps rows with zero matches — the opposite filter, also dedup-safe."}
      </Caption>
    </div>
  );
}

// ============ 3.4 Join algorithms ============

function JoinAlgos({ step }: { step: number }) {
  const algos = [
    {
      title: "Nested Loop",
      body: "For each row in outer, scan inner. O(N×M). Wins on tiny inputs or when inner has an index lookup.",
      tone: "amber" as const,
    },
    {
      title: "Hash Join",
      body: "Build hash table from smaller side, probe with larger. O(N+M). Default for big equi-joins.",
      tone: "mint" as const,
    },
    {
      title: "Sort-Merge",
      body: "Sort both sides on join key, then zipper-merge. O(N log N). Wins when inputs are already sorted.",
      tone: "violet" as const,
    },
  ];
  const a = algos[step];
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_240px]">
      <div className="h-[220px] rounded-lg border border-hairline bg-surface-2/30 p-4">
        {step === 0 && (
          <div className="grid h-full grid-cols-2 gap-4">
            <div className="space-y-1">
              {[1, 2, 3].map((i) => (
                <motion.div key={i} animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.3 }} className="rounded-md bg-amber/15 px-2 py-1 font-mono text-[12px] text-amber ring-1 ring-amber/40">outer #{i}</motion.div>
              ))}
            </div>
            <div className="space-y-1">
              {[1, 2, 3, 4, 5].map((j) => (
                <motion.div key={j} animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 0.5, repeat: Infinity, delay: j * 0.1 }} className="rounded-md bg-surface px-2 py-1 font-mono text-[12px] text-muted-foreground ring-1 ring-hairline">inner #{j}</motion.div>
              ))}
            </div>
          </div>
        )}
        {step === 1 && (
          <div className="grid h-full grid-cols-2 gap-4">
            <div>
              <div className="mb-1 font-mono text-[11px] text-mint">hash table</div>
              {["A→1", "B→2", "C→3"].map((x) => (
                <motion.div key={x} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-md bg-mint/10 px-2 py-1 font-mono text-[12px] text-mint ring-1 ring-mint/40">{x}</motion.div>
              ))}
            </div>
            <div>
              <div className="mb-1 font-mono text-[11px] text-muted-foreground">probe stream</div>
              {["A", "C", "B", "A"].map((p, i) => (
                <motion.div key={i} initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.2 }} className="mb-1 rounded-md bg-surface px-2 py-1 font-mono text-[12px] ring-1 ring-hairline">{p} → hit</motion.div>
              ))}
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="grid h-full grid-cols-2 gap-4">
            {[["1", "2", "3", "5"], ["1", "3", "4", "5"]].map((arr, idx) => (
              <div key={idx} className="space-y-1">
                <div className="font-mono text-[11px] text-violet">sorted side {idx + 1}</div>
                {arr.map((n, i) => (
                  <motion.div key={i} initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.1 }} className="rounded-md bg-violet/10 px-2 py-1 font-mono text-[12px] text-violet ring-1 ring-violet/40">{n}</motion.div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
      <Caption title={a.title} tone={a.tone}>{a.body}</Caption>
    </div>
  );
}

// ============ 4.1 Scalar subqueries ============

function ScalarSub({ step }: { step: number }) {
  const steps = [
    { title: "inner runs", outer: "SELECT name, (SELECT AVG(salary) FROM emp) AS avg", inner: "MATERIALIZE → 67500", body: "The scalar subquery executes once and produces a single value." },
    { title: "value plugged", outer: "SELECT name, 67500 AS avg", inner: "constant fold", body: "The planner substitutes the result into the outer projection." },
    { title: "cardinality trap", outer: "SELECT name, (SELECT salary FROM emp WHERE dept='ENG')", inner: "ERROR: more than one row", body: "Scalar context demands ≤1 row — multiple rows trigger a runtime error." },
  ];
  const s = steps[step];
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_240px]">
      <div className="space-y-3">
        <div className="rounded-lg border border-hairline bg-surface-2/40 p-3 font-mono text-[12.5px] text-foreground/85">
          {s.outer}
        </div>
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`rounded-lg border p-3 font-mono text-[12.5px] ${
            step === 2 ? "border-rose/40 bg-rose/10 text-rose" : "border-mint/40 bg-mint/10 text-mint"
          }`}
        >
          ↳ inner: {s.inner}
        </motion.div>
      </div>
      <Caption title={s.title} tone={step === 2 ? "rose" : "mint"}>{s.body}</Caption>
    </div>
  );
}

// ============ 4.2 Correlated subqueries (O(N²)) ============

function Correlated({ step }: { step: number }) {
  const rows = [1, 2, 3, 4, 5];
  const captions = [
    { title: "outer scan", body: "Outer query reads 5 rows from the orders table." },
    { title: "inner runs per row", body: "Inner subquery re-executes for EACH outer row — O(N²) blowup." },
    { title: "rewrite as JOIN", body: "Most correlated subqueries can be rewritten as a single JOIN + GROUP BY." },
  ];
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_240px]">
      <div className="space-y-2">
        {rows.map((r, i) => (
          <motion.div
            key={r}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-3"
          >
            <div className="grid size-7 place-items-center rounded-md bg-violet/15 font-mono text-[11px] text-violet ring-1 ring-violet/40">o{r}</div>
            {step >= 1 && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "auto", opacity: 1 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex items-center gap-1 overflow-hidden"
              >
                <span className="text-muted-foreground">→</span>
                {[1, 2, 3].map((j) => (
                  <span key={j} className={`rounded-md px-1.5 py-0.5 font-mono text-[10px] ring-1 ${
                    step === 2 ? "bg-mint/10 text-mint ring-mint/30" : "bg-rose/10 text-rose ring-rose/30"
                  }`}>q</span>
                ))}
                <span className="ml-1 font-mono text-[11px] text-muted-foreground">
                  {step === 2 ? "joined" : "× N executions"}
                </span>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
      <Caption title={captions[step].title} tone={step === 1 ? "rose" : "mint"}>{captions[step].body}</Caption>
    </div>
  );
}

// ============ 4.3 EXISTS vs IN ============

function ExistsVsIn({ step }: { step: number }) {
  const captions = [
    { title: "IN — materialize list", body: "Inner query produces a value list; outer scans and tests membership." },
    { title: "EXISTS — short circuit", body: "Inner stops on the FIRST match per outer row — often faster on large inner sets." },
    { title: "NOT IN — NULL trap", body: "If the inner list contains a NULL, NOT IN returns UNKNOWN for every row → empty result." },
  ];
  const c = captions[step];
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_240px]">
      <div className="space-y-3">
        {step === 0 && (
          <div className="rounded-lg border border-violet/40 bg-violet/5 p-3">
            <div className="font-mono text-[11px] text-violet">materialized list</div>
            <div className="mt-1.5 flex flex-wrap gap-1.5">{[10, 20, 30, 40, 50].map((x) => <Chip key={x} tone="violet">{x}</Chip>)}</div>
          </div>
        )}
        {step === 1 && (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }} className="flex items-center gap-2 rounded-md border border-mint/40 bg-mint/5 px-3 py-1.5 font-mono text-[12px] text-mint">
                row #{i} → probe inner → <span className="text-mint">first hit ✓</span> → stop
              </motion.div>
            ))}
          </div>
        )}
        {step === 2 && (
          <div className="space-y-2">
            <div className="rounded-md border border-rose/40 bg-rose/5 p-2 font-mono text-[12px] text-rose">
              inner: {`{10, 20, NULL}`}
            </div>
            <div className="rounded-md border border-rose/40 bg-rose/10 p-3 font-mono text-[12px] text-rose">
              x NOT IN (10, 20, NULL) ≡ x ≠ 10 AND x ≠ 20 AND x ≠ NULL → UNKNOWN
            </div>
            <div className="font-mono text-[11px] text-amber">→ entire WHERE filters out everything (zero rows)</div>
          </div>
        )}
      </div>
      <Caption title={c.title} tone={step === 2 ? "rose" : step === 1 ? "mint" : "violet"}>{c.body}</Caption>
    </div>
  );
}

// ============ 4.4 Set operations detail ============

function SetOpsDetail({ step }: { step: number }) {
  const A = [1, 2, 2, 3];
  const B = [2, 3, 3, 4];
  const ops = [
    { title: "UNION", note: "Concatenate then DEDUPLICATE (hash/sort). Hidden cost.", result: Array.from(new Set([...A, ...B])).sort() },
    { title: "UNION ALL", note: "Pure append — keeps duplicates. Fastest set op.", result: [...A, ...B] },
    { title: "INTERSECT", note: "Rows present in BOTH, deduplicated.", result: Array.from(new Set(A.filter((x) => B.includes(x)))) },
    { title: "EXCEPT", note: "Rows in A not in B, deduplicated.", result: Array.from(new Set(A.filter((x) => !B.includes(x)))) },
  ];
  const o = ops[step];
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_240px]">
      <div className="space-y-3">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="mb-1 font-mono text-[11px] text-violet">A (bag)</div>
            <div className="flex flex-wrap gap-1.5">{A.map((x, i) => <Chip key={i} tone="violet">{x}</Chip>)}</div>
          </div>
          <div className="flex-1">
            <div className="mb-1 font-mono text-[11px] text-amber">B (bag)</div>
            <div className="flex flex-wrap gap-1.5">{B.map((x, i) => <Chip key={i} tone="amber">{x}</Chip>)}</div>
          </div>
        </div>
        <div className="rounded-lg border border-mint/40 bg-mint/5 p-3">
          <div className="font-mono text-[11px] text-mint">{o.title} result</div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <AnimatePresence initial={false}>
              {o.result.map((x, i) => (
                <motion.span key={`${step}-${i}`} layout initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="rounded-md bg-mint/15 px-2 py-1 font-mono text-[12px] text-mint ring-1 ring-mint/40">{x}</motion.span>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
      <Caption title={o.title} tone={step === 1 ? "mint" : "violet"}>{o.note}</Caption>
    </div>
  );
}
