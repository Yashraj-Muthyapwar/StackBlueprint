import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Pause, Play, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { ClientOnly } from "@/components/lesson/ClientOnly";
import {
  QueryingAnimation,
  QUERYING_STEP_COUNTS,
  type QueryingVariant,
} from "@/components/sql/QueryingAnimations";

export type AnimationVariant =
  | "pipeline"
  | "select-projection"
  | "table-build"
  | "foreign-key"
  | "null-truth"
  | "type-sizes"
  | "where-filter"
  | "group-by-agg"
  | "join-types"
  | "set-ops"
  | QueryingVariant;

export function LessonAnimation({
  variant,
  caption,
}: {
  variant: AnimationVariant;
  caption?: string;
}) {
  return (
    <figure className="overflow-hidden rounded-xl border border-hairline bg-surface">
      {caption ? (
        <figcaption className="border-b border-hairline px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {caption}
        </figcaption>
      ) : null}
      <ClientOnly
        fallback={
          <div className="h-[360px] animate-pulse bg-surface-2/40" />
        }
      >
        <AnimationStage variant={variant} />
      </ClientOnly>
    </figure>
  );
}

function AnimationStage({ variant }: { variant: AnimationVariant }) {
  const stepsCount = STEP_COUNTS[variant];
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing) return;
    const id = window.setTimeout(
      () => setStep((s) => (s + 1) % stepsCount),
      variant === "pipeline" ? 2200 : 1900,
    );
    return () => window.clearTimeout(id);
  }, [playing, step, stepsCount, variant]);

  const go = useCallback(
    (delta: number) => {
      setPlaying(false);
      setStep((s) => (s + delta + stepsCount) % stepsCount);
    },
    [stepsCount],
  );

  return (
    <div className="flex flex-col">
      <div className="relative min-h-[320px] px-5 py-6 lg:px-7 lg:py-8">
        {variant === "pipeline" && <PipelineAnim step={step} />}
        {variant === "select-projection" && <ProjectionAnim step={step} />}
        {variant === "table-build" && <TableBuildAnim step={step} />}
        {variant === "foreign-key" && <ForeignKeyAnim step={step} />}
        {variant === "null-truth" && <NullTruthAnim step={step} />}
        {variant === "type-sizes" && <TypeSizesAnim step={step} />}
        {variant === "where-filter" && <WhereFilterAnim step={step} />}
        {variant === "group-by-agg" && <GroupByAggAnim step={step} />}
        {variant === "join-types" && <JoinTypesAnim step={step} />}
        {variant === "set-ops" && <SetOpsAnim step={step} />}
        {variant.startsWith("q-") && <QueryingAnimation variant={variant as QueryingVariant} step={step} />}
      </div>
      <div className="flex items-center justify-between border-t border-hairline bg-surface-2/40 px-4 py-2.5">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setPlaying(false);
              setStep(0);
            }}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
            aria-label="Restart"
          >
            <RotateCcw className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => go(-1)}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
            aria-label="Previous step"
          >
            <ChevronLeft className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
            aria-label="Next step"
          >
            <ChevronRight className="size-3.5" />
          </button>
        </div>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: stepsCount }).map((_, i) => (
            <span
              key={i}
              className={
                "h-1 rounded-full transition-all " +
                (i === step ? "w-6 bg-mint" : "w-2 bg-hairline")
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const STEP_COUNTS: Record<AnimationVariant, number> = {
  pipeline: 7,
  "select-projection": 3,
  "table-build": 4,
  "foreign-key": 3,
  "null-truth": 4,
  "type-sizes": 4,
  "where-filter": 4,
  "group-by-agg": 4,
  "join-types": 4,
  "set-ops": 3,
};

// ---------- PIPELINE: SELECT logical query order ----------

type Row = {
  id: number;
  customer: string;
  total: number;
  placed_at: string;
};

const ORDERS: Row[] = [
  { id: 1, customer: "Ada", total: 45, placed_at: "2026-06-01" },
  { id: 2, customer: "Linus", total: 120, placed_at: "2026-06-05" },
  { id: 3, customer: "Ada", total: 80, placed_at: "2026-06-10" },
  { id: 4, customer: "Grace", total: 30, placed_at: "2026-05-02" },
  { id: 5, customer: "Alan", total: 50, placed_at: "2026-06-18" },
  { id: 6, customer: "Linus", total: 75, placed_at: "2026-06-20" },
  { id: 7, customer: "Bob", total: 105, placed_at: "2026-06-15" },
];

const PIPELINE_STEPS = [
  { label: "1. FROM", desc: "Load the source relation: orders" },
  { label: "2. WHERE", desc: "Keep rows where placed_at >= '2026-06-01'" },
  { label: "3. GROUP BY", desc: "Collapse rows into groups by customer" },
  { label: "4. HAVING", desc: "Drop groups where SUM(total) < 100" },
  { label: "5. SELECT", desc: "Project customer, SUM(total) AS revenue" },
  { label: "6. ORDER BY", desc: "Sort by revenue DESC" },
  { label: "7. LIMIT", desc: "Keep the top 2 rows" },
];

function PipelineAnim({ step }: { step: number }) {
  const passesWhere = (r: Row) => r.placed_at >= "2026-06-01";
  const groups = useMemo(() => {
    const m = new Map<string, { customer: string; revenue: number; rows: Row[] }>();
    ORDERS.filter(passesWhere).forEach((r) => {
      const g = m.get(r.customer) ?? { customer: r.customer, revenue: 0, rows: [] };
      g.revenue += r.total;
      g.rows.push(r);
      m.set(r.customer, g);
    });
    return Array.from(m.values());
  }, []);

  const havingPass = groups.filter((g) => g.revenue >= 100);
  const ordered = [...havingPass].sort((a, b) => b.revenue - a.revenue);
  const limited = ordered.slice(0, 2);

  const meta = PIPELINE_STEPS[step];

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
      <div className="min-h-[260px]">
        {step <= 1 && (
          <RowGrid
            cols={["id", "customer", "total", "placed_at"]}
            rows={ORDERS.map((r) => ({
              key: `r-${r.id}`,
              cells: [r.id, r.customer, `$${r.total}`, r.placed_at],
              dimmed: step === 1 && !passesWhere(r),
              highlightCol: step === 1 ? 3 : -1,
            }))}
          />
        )}
        {step === 2 && (
          <div className="space-y-2">
            {groups.map((g) => (
              <motion.div
                key={g.customer}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-violet/30 bg-violet/5 p-3"
              >
                <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-violet">
                  group: {g.customer}
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {g.rows.map((r) => (
                    <span
                      key={r.id}
                      className="rounded-md bg-surface px-2 py-1 font-mono text-[11px] text-muted-foreground ring-1 ring-hairline"
                    >
                      #{r.id} · ${r.total}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
        {step === 3 && (
          <RowGrid
            cols={["customer", "SUM(total)", "passes HAVING?"]}
            rows={groups.map((g) => ({
              key: g.customer,
              cells: [
                g.customer,
                `$${g.revenue}`,
                g.revenue >= 100 ? "✓ keep" : "✗ drop",
              ],
              dimmed: g.revenue < 100,
              accent: g.revenue >= 100 ? "mint" : "rose",
            }))}
          />
        )}
        {step === 4 && (
          <RowGrid
            cols={["customer", "revenue"]}
            rows={havingPass.map((g) => ({
              key: g.customer,
              cells: [g.customer, `$${g.revenue}`],
              accent: "mint",
            }))}
          />
        )}
        {step === 5 && (
          <RowGrid
            cols={["customer", "revenue"]}
            rows={ordered.map((g) => ({
              key: g.customer,
              cells: [g.customer, `$${g.revenue}`],
              accent: "mint",
            }))}
          />
        )}
        {step === 6 && (
          <RowGrid
            cols={["customer", "revenue"]}
            rows={ordered.map((g) => ({
              key: g.customer,
              cells: [g.customer, `$${g.revenue}`],
              dimmed: !limited.includes(g),
              accent: limited.includes(g) ? "mint" : undefined,
            }))}
          />
        )}
      </div>
      <div className="flex flex-col gap-3">
        <div className="rounded-lg border border-hairline bg-surface-2/50 p-3 font-mono text-[11px] leading-relaxed text-muted-foreground">
          <div className="text-mint">SELECT</div>
          <div className="pl-3">customer, SUM(total) AS revenue</div>
          <div className="text-mint">FROM</div>
          <div className="pl-3">orders</div>
          <div className="text-mint">WHERE</div>
          <div className="pl-3">placed_at &gt;= '2026-06-01'</div>
          <div className="text-mint">GROUP BY</div>
          <div className="pl-3">customer</div>
          <div className="text-mint">HAVING</div>
          <div className="pl-3">SUM(total) &gt;= 100</div>
          <div className="text-mint">ORDER BY</div>
          <div className="pl-3">revenue DESC</div>
          <div className="text-mint">LIMIT</div>
          <div className="pl-3">2;</div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
            className="rounded-lg border border-mint/40 bg-mint/10 p-3"
          >
            <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-mint">
              {meta.label}
            </div>
            <div className="mt-1 text-sm text-foreground/90">{meta.desc}</div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ---------- Reusable animated grid ----------

type GridRow = {
  key: string;
  cells: (string | number)[];
  dimmed?: boolean;
  highlightCol?: number;
  accent?: "mint" | "rose" | "violet" | "amber";
};

function RowGrid({ cols, rows }: { cols: string[]; rows: GridRow[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-hairline">
      <div
        className="grid border-b border-hairline bg-surface-2/60 font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground"
        style={{ gridTemplateColumns: `repeat(${cols.length}, minmax(0,1fr))` }}
      >
        {cols.map((c) => (
          <div key={c} className="px-3 py-2">
            {c}
          </div>
        ))}
      </div>
      <div>
        <AnimatePresence initial={false}>
          {rows.map((r) => (
            <motion.div
              key={r.key}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{
                opacity: r.dimmed ? 0.25 : 1,
                y: 0,
                filter: r.dimmed ? "grayscale(0.6)" : "grayscale(0)",
              }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35 }}
              className={
                "grid border-b border-hairline/60 text-sm last:border-b-0 " +
                (r.accent === "mint"
                  ? "bg-mint/5"
                  : r.accent === "rose"
                    ? "bg-rose/5"
                    : r.accent === "violet"
                      ? "bg-violet/5"
                      : r.accent === "amber"
                        ? "bg-amber/5"
                        : "")
              }
              style={{
                gridTemplateColumns: `repeat(${r.cells.length}, minmax(0,1fr))`,
              }}
            >
              {r.cells.map((c, i) => (
                <div
                  key={i}
                  className={
                    "px-3 py-2 font-mono text-[12.5px] " +
                    (i === r.highlightCol
                      ? "bg-mint/15 text-mint"
                      : "text-foreground/85")
                  }
                >
                  {c}
                </div>
              ))}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ---------- SELECT * vs columns ----------

function ProjectionAnim({ step }: { step: number }) {
  const users = [
    { id: 1, email: "ada@ex.com", created_at: "2026-01-04", password_hash: "0xa9…" },
    { id: 2, email: "linus@ex.com", created_at: "2026-01-05", password_hash: "0xc4…" },
    { id: 3, email: "grace@ex.com", created_at: "2026-02-11", password_hash: "0x18…" },
  ];
  const cols = ["id", "email", "created_at", "password_hash"];
  const keep = step === 0 ? [0, 1, 2, 3] : step === 1 ? [0, 1] : [1];

  const labels = [
    { code: "SELECT *", note: "Returns every column — including ones you don't want." },
    { code: "SELECT id, email", note: "Narrow the projection to what you actually need." },
    { code: "SELECT email", note: "Only the columns you read — smallest network payload." },
  ];

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_240px]">
      <div className="overflow-hidden rounded-lg border border-hairline">
        <div
          className="grid border-b border-hairline bg-surface-2/60 font-mono text-[10.5px] uppercase tracking-[0.14em]"
          style={{ gridTemplateColumns: `repeat(${cols.length}, minmax(0,1fr))` }}
        >
          {cols.map((c, i) => (
            <motion.div
              key={c}
              animate={{
                opacity: keep.includes(i) ? 1 : 0.18,
                color: keep.includes(i) ? "var(--mint)" : undefined,
              }}
              transition={{ duration: 0.4 }}
              className="px-3 py-2 text-muted-foreground"
            >
              {c}
            </motion.div>
          ))}
        </div>
        {users.map((u) => (
          <div
            key={u.id}
            className="grid border-b border-hairline/60 last:border-b-0"
            style={{ gridTemplateColumns: `repeat(${cols.length}, minmax(0,1fr))` }}
          >
            {[u.id, u.email, u.created_at, u.password_hash].map((c, i) => (
              <motion.div
                key={i}
                animate={{ opacity: keep.includes(i) ? 1 : 0.15 }}
                transition={{ duration: 0.4 }}
                className={
                  "px-3 py-2 font-mono text-[12.5px] " +
                  (keep.includes(i) ? "text-foreground/90" : "text-muted-foreground")
                }
              >
                {c}
              </motion.div>
            ))}
          </div>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3 }}
          className="rounded-lg border border-mint/40 bg-mint/10 p-3"
        >
          <div className="font-mono text-xs text-mint">{labels[step].code}</div>
          <div className="mt-1.5 text-sm text-foreground/90">{labels[step].note}</div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ---------- Database -> table -> rows build ----------

function TableBuildAnim({ step }: { step: number }) {
  const rows = [
    { id: 1, email: "ada@ex.com" },
    { id: 2, email: "linus@ex.com" },
    { id: 3, email: "grace@ex.com" },
    { id: 4, email: "alan@ex.com" },
  ];
  const stepNotes = [
    "A database is a container for schemas.",
    "A schema holds tables — each one a typed shape.",
    "Rows arrive and must match the schema exactly.",
    "Constraints (UNIQUE, NOT NULL) enforce integrity at write time.",
  ];

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_240px]">
      <div className="relative mx-auto w-full max-w-[420px]">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="rounded-xl border border-violet/30 bg-violet/5 p-4"
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-violet">
              database · app
            </span>
            <span className="font-mono text-[10.5px] text-muted-foreground">postgres</span>
          </div>

          <AnimatePresence>
            {step >= 1 && (
              <motion.div
                key="table"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.45 }}
                className="rounded-lg border border-hairline bg-surface"
              >
                <div className="flex items-center justify-between border-b border-hairline px-3 py-2">
                  <span className="font-mono text-[11px] text-mint">users</span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    id BIGSERIAL · email TEXT UNIQUE
                  </span>
                </div>
                <div className="grid grid-cols-2 border-b border-hairline bg-surface-2/60 font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
                  <div className="px-3 py-1.5">id</div>
                  <div className="px-3 py-1.5">email</div>
                </div>
                <div className="min-h-[140px]">
                  <AnimatePresence>
                    {step >= 2 &&
                      rows.map((r, i) => (
                        <motion.div
                          key={r.id}
                          initial={{ x: -16, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: i * 0.08, duration: 0.3 }}
                          className="grid grid-cols-2 border-b border-hairline/60 last:border-b-0"
                        >
                          <div className="px-3 py-1.5 font-mono text-[12.5px]">{r.id}</div>
                          <motion.div
                            className="px-3 py-1.5 font-mono text-[12.5px]"
                            animate={
                              step === 3
                                ? {
                                    backgroundColor: [
                                      "rgba(0,0,0,0)",
                                      "color-mix(in oklch, var(--mint) 18%, transparent)",
                                      "rgba(0,0,0,0)",
                                    ],
                                  }
                                : {}
                            }
                            transition={{ delay: 0.2 + i * 0.06, duration: 0.9 }}
                          >
                            {r.email}
                          </motion.div>
                        </motion.div>
                      ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3 }}
          className="self-start rounded-lg border border-mint/40 bg-mint/10 p-3 text-sm text-foreground/90"
        >
          {stepNotes[step]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ---------- Foreign key arrows ----------

function ForeignKeyAnim({ step }: { step: number }) {
  const customers = [
    { id: 1, name: "Ada" },
    { id: 2, name: "Linus" },
    { id: 3, name: "Grace" },
  ];
  const orders = [
    { id: 101, customer_id: 1, total: 45 },
    { id: 102, customer_id: 2, total: 120 },
    { id: 103, customer_id: 1, total: 80 },
    { id: 104, customer_id: 3, total: 30 },
  ];
  const notes = [
    "Two independent tables — no relationship yet.",
    "orders.customer_id REFERENCES customers(id) — every child must point at a real parent.",
    "ON DELETE CASCADE: removing a customer removes all their orders atomically.",
  ];
  const deletedParent = step === 2 ? 1 : null;

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_220px]">
      <div className="grid grid-cols-2 gap-5">
        <div className="overflow-hidden rounded-lg border border-hairline">
          <div className="border-b border-hairline bg-surface-2/60 px-3 py-2 font-mono text-[11px] text-violet">
            customers
          </div>
          {customers.map((c) => (
            <motion.div
              key={c.id}
              animate={{
                opacity: deletedParent === c.id ? 0.2 : 1,
                x: deletedParent === c.id ? -8 : 0,
              }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-2 border-b border-hairline/60 px-3 py-2 font-mono text-[12.5px] last:border-b-0"
            >
              <span className="text-mint">{c.id}</span>
              <span>{c.name}</span>
            </motion.div>
          ))}
        </div>
        <div className="overflow-hidden rounded-lg border border-hairline">
          <div className="border-b border-hairline bg-surface-2/60 px-3 py-2 font-mono text-[11px] text-violet">
            orders
          </div>
          {orders.map((o) => {
            const orphaned = deletedParent === o.customer_id;
            return (
              <motion.div
                key={o.id}
                animate={{
                  opacity: orphaned ? 0.15 : 1,
                  x: orphaned ? 12 : 0,
                }}
                transition={{ duration: 0.45 }}
                className="grid grid-cols-3 border-b border-hairline/60 px-3 py-2 font-mono text-[12.5px] last:border-b-0"
              >
                <span>{o.id}</span>
                <motion.span
                  animate={{
                    color:
                      step >= 1
                        ? "var(--mint)"
                        : "color-mix(in oklch, var(--foreground) 70%, transparent)",
                  }}
                >
                  →{o.customer_id}
                </motion.span>
                <span>${o.total}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3 }}
          className="self-start rounded-lg border border-mint/40 bg-mint/10 p-3 text-sm text-foreground/90"
        >
          {notes[step]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ---------- NULL three-valued logic ----------

function NullTruthAnim({ step }: { step: number }) {
  const cases = [
    { a: "'x'", b: "'x'", r: "TRUE", tone: "mint" as const },
    { a: "'x'", b: "'y'", r: "FALSE", tone: "rose" as const },
    { a: "'x'", b: "NULL", r: "NULL", tone: "amber" as const },
    { a: "NULL", b: "NULL", r: "NULL", tone: "amber" as const },
  ];
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_240px]">
      <div className="space-y-2">
        {cases.map((c, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{
              opacity: i <= step ? 1 : 0.15,
              x: 0,
            }}
            transition={{ duration: 0.35 }}
            className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-3 rounded-lg border border-hairline bg-surface-2/40 px-4 py-2.5 font-mono text-sm"
          >
            <span>{c.a}</span>
            <span className="text-muted-foreground">=</span>
            <span>{c.b}</span>
            <span className="text-muted-foreground">→</span>
            <motion.span
              animate={{
                scale: i === step ? [0.9, 1.08, 1] : 1,
              }}
              transition={{ duration: 0.5 }}
              className={
                "justify-self-start rounded-md px-2 py-0.5 text-[12px] " +
                (c.tone === "mint"
                  ? "bg-mint/15 text-mint"
                  : c.tone === "rose"
                    ? "bg-rose/15 text-rose"
                    : "bg-amber/15 text-amber")
              }
            >
              {c.r}
            </motion.span>
          </motion.div>
        ))}
      </div>
      <div className="self-start rounded-lg border border-amber/30 bg-amber/5 p-3 text-sm text-foreground/90">
        NULL means <em className="text-amber not-italic">unknown</em>. Any
        comparison involving NULL returns NULL — not TRUE, not FALSE. Use{" "}
        <code className="rounded bg-surface px-1 font-mono text-xs">IS NULL</code>{" "}
        to test for it.
      </div>
    </div>
  );
}

// ---------- Type sizes bars ----------

function TypeSizesAnim({ step }: { step: number }) {
  const types = [
    { name: "SMALLINT", bytes: 2, range: "±32K", note: "Tiny counters" },
    { name: "INTEGER", bytes: 4, range: "±2.1B", note: "Most counts / IDs" },
    { name: "BIGINT", bytes: 8, range: "±9.2 × 10¹⁸", note: "PKs, big counters" },
    { name: "NUMERIC(p,s)", bytes: 16, range: "exact decimal", note: "Money, rates" },
  ];
  const visible = step + 1;
  return (
    <div className="space-y-3">
      {types.slice(0, visible).map((t, i) => (
        <motion.div
          key={t.name}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: i === step ? 0.05 : 0 }}
          className="grid grid-cols-[120px_1fr_auto] items-center gap-3"
        >
          <div className="font-mono text-[12.5px] text-mint">{t.name}</div>
          <div className="h-7 rounded-md bg-surface-2/60 ring-1 ring-hairline">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(t.bytes / 16) * 100}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex h-full items-center justify-end rounded-md bg-gradient-to-r from-violet/40 to-mint/60 px-2 font-mono text-[11px] text-foreground"
            >
              {t.bytes}B
            </motion.div>
          </div>
          <div className="text-right font-mono text-[11px] text-muted-foreground">
            {t.range}
          </div>
        </motion.div>
      ))}
      <div className="pt-2 text-sm text-muted-foreground">
        Smaller type → smaller index → faster query. Pick the smallest type that
        fits the real range of your data.
      </div>
    </div>
  );
}

// ---------- WHERE filter cascade ----------

function WhereFilterAnim({ step }: { step: number }) {
  const products = [
    { id: 1, name: "Pen", price: 3, category: 3, deleted: false },
    { id: 2, name: "Pencil", price: 2, category: 3, deleted: false },
    { id: 3, name: "Notebook", price: 25, category: 5, deleted: false },
    { id: 4, name: "Keyboard", price: 120, category: 7, deleted: false },
    { id: 5, name: "Old Pen", price: 1, category: 3, deleted: true },
    { id: 6, name: "Mouse", price: 45, category: 7, deleted: false },
  ];
  // Step 0: all rows. 1: price BETWEEN 10 AND 100. 2: + category IN (5,7). 3: + deleted_at IS NULL
  const pass = (r: (typeof products)[number]) => {
    if (step >= 1 && !(r.price >= 10 && r.price <= 100)) return false;
    if (step >= 2 && !([5, 7].includes(r.category))) return false;
    if (step >= 3 && r.deleted) return false;
    return true;
  };
  const predicates = [
    { label: "no filter", note: "All rows from the FROM relation." },
    { label: "price BETWEEN 10 AND 100", note: "Drop rows outside the price band." },
    { label: "AND category_id IN (5, 7)", note: "Keep only matching categories." },
    { label: "AND deleted_at IS NULL", note: "Soft-deleted rows fall away." },
  ];
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_240px]">
      <RowGrid
        cols={["id", "name", "price", "cat", "deleted"]}
        rows={products.map((r) => ({
          key: `p-${r.id}`,
          cells: [r.id, r.name, `$${r.price}`, r.category, r.deleted ? "✓" : "—"],
          dimmed: !pass(r),
          accent: pass(r) ? "mint" : undefined,
        }))}
      />
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3 }}
          className="self-start rounded-lg border border-mint/40 bg-mint/10 p-3"
        >
          <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-mint">
            WHERE
          </div>
          <div className="mt-1 font-mono text-[12.5px] text-foreground/90">
            {predicates[step].label}
          </div>
          <div className="mt-2 text-sm text-muted-foreground">{predicates[step].note}</div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ---------- GROUP BY collapse ----------

function GroupByAggAnim({ step }: { step: number }) {
  const sales = [
    { id: 1, region: "EU", amount: 40 },
    { id: 2, region: "US", amount: 90 },
    { id: 3, region: "EU", amount: 25 },
    { id: 4, region: "APAC", amount: 60 },
    { id: 5, region: "US", amount: 110 },
    { id: 6, region: "EU", amount: 55 },
  ];
  const groups = useMemo(() => {
    const m = new Map<string, { region: string; rows: typeof sales; sum: number; count: number; avg: number }>();
    sales.forEach((r) => {
      const g = m.get(r.region) ?? { region: r.region, rows: [], sum: 0, count: 0, avg: 0 };
      g.rows.push(r);
      g.sum += r.amount;
      g.count += 1;
      g.avg = g.sum / g.count;
      m.set(r.region, g);
    });
    return Array.from(m.values());
  }, []);
  const havingPass = groups.filter((g) => g.sum >= 100);
  const notes = [
    "Start: raw rows from `sales`.",
    "GROUP BY region — rows fall into buckets by region.",
    "SELECT region, SUM, COUNT, AVG — one row per group.",
    "HAVING SUM(amount) >= 100 — drop groups that don't meet the bar.",
  ];

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_240px]">
      <div className="min-h-[260px]">
        {step === 0 && (
          <RowGrid
            cols={["id", "region", "amount"]}
            rows={sales.map((r) => ({ key: `s-${r.id}`, cells: [r.id, r.region, `$${r.amount}`] }))}
          />
        )}
        {step === 1 && (
          <div className="space-y-2">
            {groups.map((g) => (
              <motion.div
                key={g.region}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-violet/30 bg-violet/5 p-3"
              >
                <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-violet">
                  group: {g.region}
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {g.rows.map((r) => (
                    <span
                      key={r.id}
                      className="rounded-md bg-surface px-2 py-1 font-mono text-[11px] text-muted-foreground ring-1 ring-hairline"
                    >
                      #{r.id} · ${r.amount}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
        {step === 2 && (
          <RowGrid
            cols={["region", "SUM", "COUNT", "AVG"]}
            rows={groups.map((g) => ({
              key: g.region,
              cells: [g.region, `$${g.sum}`, g.count, `$${g.avg.toFixed(1)}`],
              accent: "mint",
            }))}
          />
        )}
        {step === 3 && (
          <RowGrid
            cols={["region", "SUM", "passes HAVING?"]}
            rows={groups.map((g) => ({
              key: g.region,
              cells: [g.region, `$${g.sum}`, g.sum >= 100 ? "✓ keep" : "✗ drop"],
              dimmed: g.sum < 100,
              accent: g.sum >= 100 ? "mint" : "rose",
            }))}
          />
        )}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3 }}
          className="self-start rounded-lg border border-mint/40 bg-mint/10 p-3 text-sm text-foreground/90"
        >
          {notes[step]}
          {step === 3 && havingPass.length === 0 ? " (no group survived)" : ""}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ---------- Join types ----------

function JoinTypesAnim({ step }: { step: number }) {
  const users = [
    { id: 1, name: "Ada" },
    { id: 2, name: "Linus" },
    { id: 3, name: "Grace" },
  ];
  const orders = [
    { id: 101, user_id: 1, total: 40 },
    { id: 102, user_id: 1, total: 60 },
    { id: 104, user_id: 2, total: 25 },
    { id: 105, user_id: 4, total: 90 }, // orphan
  ];
  const meta = [
    { label: "INNER JOIN", note: "Only matched pairs survive — Grace and the orphan vanish." },
    { label: "LEFT JOIN", note: "Every user; orders that don't match become NULLs on the right." },
    { label: "RIGHT JOIN", note: "Every order; users without orders become NULLs on the left." },
    { label: "FULL OUTER JOIN", note: "Union of LEFT and RIGHT — every unmatched side gets NULLs." },
  ];

  // Build joined rows per variant
  type Pair = { u: typeof users[number] | null; o: typeof orders[number] | null };
  let pairs: Pair[] = [];
  if (step === 0) {
    pairs = orders
      .map((o): Pair => ({ u: users.find((u) => u.id === o.user_id) ?? null, o }))
      .filter((p) => p.u !== null);
  } else if (step === 1) {
    pairs = users.flatMap((u): Pair[] => {
      const matches = orders.filter((o) => o.user_id === u.id);
      return matches.length ? matches.map((o) => ({ u, o })) : [{ u, o: null }];
    });
  } else if (step === 2) {
    pairs = orders.map((o): Pair => ({ u: users.find((u) => u.id === o.user_id) ?? null, o }));
  } else {
    const seen = new Set<number>();
    pairs = users.flatMap((u): Pair[] => {
      const matches = orders.filter((o) => o.user_id === u.id);
      matches.forEach((o) => seen.add(o.id));
      return matches.length ? matches.map((o) => ({ u, o })) : [{ u, o: null }];
    });
    orders.filter((o) => !seen.has(o.id)).forEach((o) => pairs.push({ u: null, o }));
  }


  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_240px]">
      <div className="overflow-hidden rounded-lg border border-hairline">
        <div className="grid grid-cols-4 border-b border-hairline bg-surface-2/60 font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
          <div className="px-3 py-2">user.id</div>
          <div className="px-3 py-2">user.name</div>
          <div className="px-3 py-2">order.id</div>
          <div className="px-3 py-2">order.total</div>
        </div>
        <AnimatePresence initial={false}>
          {pairs.map((p, i) => (
            <motion.div
              key={`${step}-${i}`}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-4 border-b border-hairline/60 font-mono text-[12.5px] last:border-b-0"
            >
              <div className={`px-3 py-2 ${p.u ? "" : "text-amber"}`}>{p.u?.id ?? "NULL"}</div>
              <div className={`px-3 py-2 ${p.u ? "" : "text-amber"}`}>{p.u?.name ?? "NULL"}</div>
              <div className={`px-3 py-2 ${p.o ? "" : "text-amber"}`}>{p.o?.id ?? "NULL"}</div>
              <div className={`px-3 py-2 ${p.o ? "" : "text-amber"}`}>
                {p.o ? `$${p.o.total}` : "NULL"}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3 }}
          className="self-start rounded-lg border border-mint/40 bg-mint/10 p-3"
        >
          <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-mint">
            {meta[step].label}
          </div>
          <div className="mt-1.5 text-sm text-foreground/90">{meta[step].note}</div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ---------- Set operations ----------

function SetOpsAnim({ step }: { step: number }) {
  const A = [1, 2, 3, 4];
  const B = [3, 4, 5, 6];
  const variants = [
    { label: "UNION", result: Array.from(new Set([...A, ...B])).sort((a, b) => a - b), note: "Combine both sets; UNION removes duplicates (UNION ALL keeps them)." },
    { label: "INTERSECT", result: A.filter((x) => B.includes(x)), note: "Rows present in BOTH sets." },
    { label: "EXCEPT", result: A.filter((x) => !B.includes(x)), note: "Rows in A that are NOT in B (a.k.a. MINUS)." },
  ];
  const v = variants[step];
  const inResult = (x: number) => v.result.includes(x);
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_240px]">
      <div className="space-y-4">
        <SetRow label="A" items={A} highlight={inResult} />
        <SetRow label="B" items={B} highlight={(x) => v.label === "UNION" ? inResult(x) : v.label === "INTERSECT" ? inResult(x) : false} />
        <div className="border-t border-hairline pt-3">
          <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.14em] text-mint">
            {v.label}
          </div>
          <div className="flex flex-wrap gap-2">
            <AnimatePresence initial={false}>
              {v.result.map((x) => (
                <motion.span
                  key={`${step}-${x}`}
                  layout
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-md bg-mint/15 px-2.5 py-1 font-mono text-[12.5px] text-mint ring-1 ring-mint/40"
                >
                  {x}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3 }}
          className="self-start rounded-lg border border-mint/40 bg-mint/10 p-3 text-sm text-foreground/90"
        >
          {v.note}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function SetRow({
  label,
  items,
  highlight,
}: {
  label: string;
  items: number[];
  highlight: (x: number) => boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-8 font-mono text-[11px] uppercase tracking-[0.14em] text-violet">
        {label}
      </span>
      <div className="flex flex-wrap gap-2">
        {items.map((x) => (
          <span
            key={x}
            className={
              "rounded-md px-2.5 py-1 font-mono text-[12.5px] ring-1 " +
              (highlight(x)
                ? "bg-mint/10 text-mint ring-mint/40"
                : "bg-surface-2/50 text-muted-foreground ring-hairline")
            }
          >
            {x}
          </span>
        ))}
      </div>
    </div>
  );
}
