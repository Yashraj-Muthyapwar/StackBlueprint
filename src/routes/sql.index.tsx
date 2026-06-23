import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Boxes,
  Calculator,
  Database,
  Filter,
  GitMerge,
  KeyRound,
  Layers,
  Lock,
  Network,
  Repeat,
  Rows3,
  Shield,
  Sigma,
  Sparkles,
  Table,
  Terminal,
  Timer,
  TrendingUp,
  Workflow,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const Route = createFileRoute("/sql/")({
  head: () => ({
    meta: [
      { title: "SQL Mastery — DataVizCore" },
      {
        name: "description",
        content:
          "From SELECT to query plans — a 0→1 visual SQL & databases roadmap. Foundations, joins, window functions, CTEs, indexing, transactions, and performance tuning.",
      },
      { property: "og:title", content: "SQL Mastery — DataVizCore" },
      {
        property: "og:description",
        content:
          "Interactive, visual SQL roadmap: foundations, joins, windows, CTEs, indexing, transactions, and optimization.",
      },
    ],
  }),
  component: SqlIndex,
});

type Section = {
  group: string;
  groupBlurb: string;
  topics: Topic[];
};

type Topic = {
  title: string;
  blurb: string;
  icon: LucideIcon;
  modules: string[];
  /** All topics locked for now — kept as a flag for future unlocks. */
  locked?: boolean;
};

const sections: Section[] = [
  {
    group: "Foundations",
    groupBlurb: "The mental model before the syntax — tables, rows, types, and how a query actually runs.",
    topics: [
      {
        title: "Relational Model",
        blurb: "Tables, rows, columns, primary & foreign keys, and why the relational model wins.",
        icon: Table,
        modules: ["Tables & rows", "Primary keys", "Foreign keys", "Normalization basics"],
      },
      {
        title: "Data Types & Schemas",
        blurb: "Numbers, strings, dates, JSON, NULLs — and designing schemas that stay clean.",
        icon: Database,
        modules: ["Numeric & text", "Dates & timestamps", "JSON / JSONB", "NULL semantics"],
      },
      {
        title: "SELECT Fundamentals",
        blurb: "SELECT, FROM, WHERE, ORDER BY, LIMIT — and the logical order SQL evaluates them.",
        icon: Terminal,
        modules: ["SELECT / FROM", "WHERE filters", "ORDER BY / LIMIT", "Logical query order"],
      },
    ],
  },
  {
    group: "Querying Data",
    groupBlurb: "Slice, dice, and reshape data with the everyday building blocks.",
    topics: [
      {
        title: "Filtering & Predicates",
        blurb: "AND/OR/NOT, IN, BETWEEN, LIKE, ILIKE, and the NULL three-valued logic trap.",
        icon: Filter,
        modules: ["Boolean logic", "IN / BETWEEN", "Pattern match", "NULL pitfalls"],
      },
      {
        title: "Aggregations & GROUP BY",
        blurb: "COUNT, SUM, AVG, MIN, MAX, HAVING — and what GROUP BY really does to a row.",
        icon: Sigma,
        modules: ["Aggregate funcs", "GROUP BY", "HAVING", "GROUPING SETS"],
      },
      {
        title: "Joins",
        blurb: "INNER, LEFT, RIGHT, FULL, SEMI, ANTI, CROSS — pick the right join for the shape of your data.",
        icon: GitMerge,
        modules: ["INNER / OUTER", "Self joins", "Semi & anti", "Join algorithms"],
      },
      {
        title: "Subqueries & Set Ops",
        blurb: "Scalar, correlated, EXISTS, UNION/INTERSECT/EXCEPT — when a subquery beats a join.",
        icon: Layers,
        modules: ["Scalar subqueries", "Correlated", "EXISTS / IN", "UNION / EXCEPT"],
      },
    ],
  },
  {
    group: "Advanced SQL",
    groupBlurb: "The features that separate analyst SQL from engineer SQL.",
    topics: [
      {
        title: "Window Functions",
        blurb: "ROW_NUMBER, RANK, LAG/LEAD, framed aggregates — analytics inside SQL.",
        icon: BarChart3,
        modules: ["ROW_NUMBER / RANK", "LAG / LEAD", "PARTITION BY", "Window frames"],
      },
      {
        title: "CTEs & Recursion",
        blurb: "Common Table Expressions and recursive CTEs for readable, layered queries.",
        icon: Workflow,
        modules: ["WITH clauses", "Chained CTEs", "Recursive CTEs", "Materialization"],
      },
      {
        title: "Pivoting & Reshaping",
        blurb: "CASE pivots, CROSSTAB, UNPIVOT, and turning long ⇄ wide.",
        icon: Repeat,
        modules: ["CASE pivots", "CROSSTAB", "UNPIVOT", "Long ⇄ wide"],
      },
      {
        title: "JSON & Arrays",
        blurb: "JSONB operators, path queries, arrays, and unnesting nested structures.",
        icon: Boxes,
        modules: ["JSONB ops", "Path queries", "Arrays", "Unnest / lateral"],
      },
    ],
  },
  {
    group: "Databases & Engineering",
    groupBlurb: "Beyond writing queries — designing, evolving, and protecting your data.",
    topics: [
      {
        title: "Schema Design",
        blurb: "1NF → 3NF, surrogate vs natural keys, denormalization, and modeling for reads.",
        icon: Rows3,
        modules: ["Normalization", "Surrogate keys", "Denormalization", "Modeling reads"],
      },
      {
        title: "Constraints & Integrity",
        blurb: "PK, FK, UNIQUE, CHECK, NOT NULL, DEFAULT — let the database enforce truth.",
        icon: KeyRound,
        modules: ["Primary / unique", "Foreign keys", "CHECK / DEFAULT", "Cascades"],
      },
      {
        title: "Transactions & Isolation",
        blurb: "ACID, BEGIN/COMMIT/ROLLBACK, isolation levels, and concurrency anomalies.",
        icon: Shield,
        modules: ["ACID", "Isolation levels", "Anomalies", "Locking"],
      },
      {
        title: "DDL & Migrations",
        blurb: "CREATE, ALTER, DROP — and how to evolve a live schema without downtime.",
        icon: Wrench,
        modules: ["DDL basics", "Safe ALTER", "Zero-downtime", "Versioned migrations"],
      },
    ],
  },
  {
    group: "Performance",
    groupBlurb: "Make slow queries fast — predictably.",
    topics: [
      {
        title: "Indexes",
        blurb: "B-tree, hash, GIN, partial & composite — when an index helps, and when it lies.",
        icon: Network,
        modules: ["B-tree", "Composite", "Partial indexes", "GIN / GiST"],
      },
      {
        title: "EXPLAIN & Plans",
        blurb: "Reading EXPLAIN ANALYZE: seq scan vs index scan, joins, sorts, and row estimates.",
        icon: TrendingUp,
        modules: ["EXPLAIN", "EXPLAIN ANALYZE", "Plan shapes", "Stats & ANALYZE"],
      },
      {
        title: "Query Optimization",
        blurb: "Rewrites that work, predicate pushdown, avoiding N+1, and killing accidental Cartesians.",
        icon: Calculator,
        modules: ["Rewrites", "Pushdown", "Avoid N+1", "Cardinality"],
      },
      {
        title: "Scaling & Replication",
        blurb: "Read replicas, partitioning, sharding, and when to reach for a warehouse.",
        icon: Timer,
        modules: ["Replicas", "Partitioning", "Sharding", "OLTP vs OLAP"],
      },
    ],
  },
];

function SqlIndex() {
  const totalTopics = sections.reduce((n, s) => n + s.topics.length, 0);

  return (
    <div className="relative">
      <div className="grid-bg absolute inset-0 -z-10 opacity-40" />

      {/* Hero */}
      <section className="border-b border-hairline px-8 py-14 lg:px-16 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <Link
            to="/"
            className="mb-6 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3" />
            Back to roadmap
          </Link>

          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-hairline bg-surface/60 px-3 py-1 backdrop-blur">
            <Sparkles className="size-3.5 text-mint" />
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              SQL Mastery · {totalTopics} topics · 0 → 1
            </span>
          </div>
          <h1 className="text-balance text-3xl font-semibold tracking-tight lg:text-5xl">
            SQL & databases, from{" "}
            <span className="text-mint">SELECT to query plans.</span>
          </h1>
          <p className="mt-3 max-w-2xl text-balance text-muted-foreground lg:text-lg">
            A visual, end-to-end roadmap for SQL — starting at the relational model and ending at
            indexes, EXPLAIN plans, and the trade-offs behind every fast query. Lessons land
            progressively; the syllabus below is the full path.
          </p>
        </div>
      </section>

      {/* Sections */}
      <section className="px-8 py-12 lg:px-16">
        <div className="mx-auto max-w-6xl space-y-14">
          {sections.map((s, idx) => (
            <div key={s.group}>
              <div className="mb-5 flex items-baseline justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <h2 className="text-xl font-semibold tracking-tight">{s.group}</h2>
                  </div>
                  <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{s.groupBlurb}</p>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {s.topics.length} topics
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {s.topics.map((t) => (
                  <div
                    key={t.title}
                    aria-disabled
                    className="group relative h-full cursor-not-allowed overflow-hidden rounded-2xl border border-hairline/60 bg-surface/40 p-5 transition-colors hover:border-foreground/20"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="grid size-10 place-items-center rounded-md bg-surface-2 text-muted-foreground/80 ring-1 ring-hairline">
                        <t.icon className="size-5" />
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full border border-hairline px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/80">
                        <Lock className="size-3" />
                        Coming soon
                      </span>
                    </div>
                    <h3 className="text-base font-medium tracking-tight">{t.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{t.blurb}</p>

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {t.modules.map((m) => (
                        <span
                          key={m}
                          className="rounded-full border border-hairline px-2 py-0.5 text-[10px] text-muted-foreground/80"
                        >
                          {m}
                        </span>
                      ))}
                    </div>

                    <div className="mt-5 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                      Preview syllabus
                      <ArrowRight className="ml-1 inline size-4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* In the meantime */}
          <div className="rounded-2xl border border-mint/30 bg-mint/5 p-6">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 size-4 text-mint" />
              <div>
                <h3 className="text-sm font-medium text-foreground">
                  In the meantime — explore Patterns (DSA)
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  The Arrays / Matrix track is fully unlocked with interactive, step-by-step
                  visualizations.
                </p>
                <Link
                  to="/patterns"
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-mint px-4 py-2 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02]"
                >
                  Open Patterns (DSA)
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
