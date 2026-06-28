import { Link, createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Boxes,
  Braces,
  Calculator,
  Calendar,
  Cog,
  Database,
  Eye,
  FileCode2,
  Filter,
  FunctionSquare as FunctionIcon,
  GitMerge,
  Hash,
  KeyRound,
  Layers,
  Lock,
  LockKeyhole,
  Network,
  Repeat,
  Rows3,
  Save,
  Shield,
  ShieldAlert,
  Sigma,
  Sparkles,
  Table,
  Terminal,
  Timer,
  TrendingUp,
  Workflow,
  Wrench,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const Route = createFileRoute("/sql/")({
  head: () => ({
    meta: [
      { title: "SQL Mastery — DataVizCore" },
      {
        name: "description",
        content:
          "From SELECT to query plans — a 0→1 visual SQL & databases roadmap. Foundations, joins, window functions, CTEs, procedures, triggers, transactions, indexing, and performance tuning.",
      },
      { property: "og:title", content: "SQL Mastery — DataVizCore" },
      {
        property: "og:description",
        content:
          "Interactive, visual SQL roadmap: foundations, joins, windows, CTEs, programmability, integrity, and optimization.",
      },
    ],
  }),
  component: SqlIndex,
});

type Topic = {
  slug: string;
  title: string;
  blurb: string;
  icon: LucideIcon;
  modules: string[];
  unlocked?: boolean;
  routeBase?: "foundations" | "querying";
  to?: string;
};

type Section = {
  group: string;
  groupBlurb: string;
  topics: Topic[];
};


const sections: Section[] = [
  {
    group: "Foundations",
    groupBlurb:
      "The mental model before the syntax — tables, rows, types, and how a query actually runs.",
    topics: [
      {
        slug: "intro",
        title: "Intro to Databases",
        blurb: "What a database is, the families, how an engine answers a query, and how bytes live on disk.",
        icon: Database,
        modules: ["What is a database?", "Types of databases", "How a database works", "How querying works", "How data is stored"],
        unlocked: true,
      },

      {
        slug: "data-types",
        title: "Data Types & Schemas",
        blurb: "Numbers, strings, dates, JSON, NULLs — and designing schemas that stay clean.",
        icon: Database,
        modules: ["Numeric & text", "Dates & timestamps", "JSON / JSONB", "NULL semantics"],
        unlocked: true,
      },
      {
        slug: "database-fundamentals",
        title: "Database Fundamentals",
        blurb: "What is SQL, client-server architecture, types of SQL commands, keys, and normalization.",
        icon: Terminal,
        modules: ["What is SQL?", "Client-Server", "DDL vs DML", "Primary & Foreign keys", "Normalization"],
        unlocked: true,
      },
      {
        slug: "select-fundamentals",
        title: "SELECT Fundamentals",
        blurb: "SELECT, FROM, WHERE, ORDER BY, LIMIT — and the logical order SQL evaluates them.",
        icon: Terminal,
        modules: ["SELECT / FROM", "WHERE filters", "ORDER BY / LIMIT", "Logical query order"],
        unlocked: true,
      },
    ],
  },
  {
    group: "Querying Data",
    groupBlurb: "Slice, dice, and reshape data with the everyday building blocks.",
    topics: [
      {
        slug: "filtering",
        title: "Filtering & Predicates",
        blurb: "AND/OR/NOT, IN, BETWEEN, LIKE, ILIKE, and the NULL three-valued logic trap.",
        icon: Filter,
        modules: ["Boolean logic", "IN / BETWEEN", "Pattern match", "NULL pitfalls"],
        unlocked: true,
        routeBase: "querying",
      },
      {
        slug: "aggregations",
        title: "Aggregations & GROUP BY",
        blurb: "COUNT, SUM, AVG, MIN, MAX, HAVING — and what GROUP BY really does to a row.",
        icon: Sigma,
        modules: ["Aggregate funcs", "GROUP BY", "HAVING", "GROUPING SETS"],
        unlocked: true,
        routeBase: "querying",
      },
      {
        slug: "joins",
        title: "Joins",
        blurb:
          "INNER, LEFT, RIGHT, FULL, SEMI, ANTI, CROSS — pick the right join for the shape of your data.",
        icon: GitMerge,
        modules: ["INNER / OUTER", "Self joins", "Semi & anti", "Join algorithms"],
        unlocked: true,
        routeBase: "querying",
      },
      {
        slug: "subqueries",
        title: "Subqueries & Set Ops",
        blurb: "Scalar, correlated, EXISTS, UNION/INTERSECT/EXCEPT — when a subquery beats a join.",
        icon: Layers,
        modules: ["Scalar subqueries", "Correlated", "EXISTS / IN", "UNION / EXCEPT"],
        unlocked: true,
        routeBase: "querying",
      },
    ],
  },

  {
    group: "Specialized Data Handling",
    groupBlurb:
      "The built-in toolkit every engineer reaches for — string, numeric, date/time, conversions, and safe error handling.",
    topics: [
      {
        slug: "string-functions",
        title: "String Functions",
        blurb:
          "CONCAT, SUBSTRING, TRIM, REPLACE, CHARINDEX/POSITION, and regex patterns for text wrangling.",
        icon: Hash,
        modules: ["CONCAT / SUBSTRING", "TRIM / REPLACE", "POSITION / CHARINDEX", "Regex"],
      },
      {
        slug: "numeric-functions",
        title: "Numeric Functions",
        blurb: "ROUND, CEIL/FLOOR, ABS, MOD/%, POWER/SQRT — the math layer of SQL.",
        icon: Calculator,
        modules: ["ROUND / CEIL / FLOOR", "ABS / SIGN", "MOD / %", "POWER / SQRT"],
      },
      {
        slug: "datetime-functions",
        title: "Date & Time",
        blurb: "Time zones, date arithmetic, DATEDIFF / DATE_TRUNC, and interval handling.",
        icon: Calendar,
        modules: ["Time zones", "Date arithmetic", "DATEDIFF / TRUNC", "Intervals"],
      },
      {
        slug: "conversions",
        title: "Conversions",
        blurb: "CAST and CONVERT — for schema evolution and cross-type operations.",
        icon: Repeat,
        modules: ["CAST", "CONVERT", "Implicit coercion", "Safe casts"],
      },
      {
        slug: "error-handling",
        title: "Error Handling",
        blurb:
          "TRY...CATCH (and equivalents) inside SQL scripts to prevent total failure during batch operations.",
        icon: AlertTriangle,
        modules: ["TRY / CATCH", "RAISE / THROW", "Savepoints", "Batch recovery"],
      },
    ],
  },
  {
    group: "Advanced SQL",
    groupBlurb: "The features that separate analyst SQL from engineer SQL.",
    topics: [
      {
        slug: "window-functions",
        title: "Window Functions",
        blurb: "ROW_NUMBER, RANK, LAG/LEAD, framed aggregates — analytics inside SQL.",
        icon: BarChart3,
        modules: ["ROW_NUMBER / RANK", "LAG / LEAD", "PARTITION BY", "Window frames"],
      },
      {
        slug: "ctes",
        title: "CTEs & Recursion",
        blurb: "Common Table Expressions and recursive CTEs for readable, layered queries.",
        icon: Workflow,
        modules: ["WITH clauses", "Chained CTEs", "Recursive CTEs", "Materialization"],
      },
      {
        slug: "pivoting",
        title: "Pivoting & Reshaping",
        blurb: "CASE pivots, CROSSTAB, UNPIVOT, and turning long ⇄ wide.",
        icon: Repeat,
        modules: ["CASE pivots", "CROSSTAB", "UNPIVOT", "Long ⇄ wide"],
      },
      {
        slug: "json-arrays",
        title: "JSON & Arrays",
        blurb: "JSONB operators, path queries, arrays, and unnesting nested structures.",
        icon: Boxes,
        modules: ["JSONB ops", "Path queries", "Arrays", "Unnest / lateral"],
      },
    ],
  },
  {
    group: "Database Programmability",
    groupBlurb:
      "Move beyond raw queries — encapsulate logic in the engine and react to data events.",
    topics: [
      {
        slug: "stored-procedures",
        title: "Stored Procedures",
        blurb:
          "Encapsulate business logic, reduce round-trips, and handle complex multi-statement tasks.",
        icon: FileCode2,
        modules: ["CREATE PROCEDURE", "Parameters", "Control flow", "When to use"],
      },
      {
        slug: "udfs",
        title: "User-Defined Functions",
        blurb:
          "Scalar functions (return one value) vs. table-valued functions (return a table) for reusable logic.",
        icon: FunctionIcon,
        modules: ["Scalar UDFs", "Table-valued", "Determinism", "Inlining"],
      },
      {
        slug: "triggers",
        title: "Triggers",
        blurb:
          "Automate actions on database events — BEFORE / AFTER / INSTEAD OF INSERT, UPDATE, DELETE.",
        icon: Zap,
        modules: ["BEFORE / AFTER", "INSTEAD OF", "Row vs statement", "Pitfalls"],
      },
      {
        slug: "cursors",
        title: "Cursors",
        blurb:
          "Row-by-row processing — use sparingly, but understand how they work and when set-based fails.",
        icon: Cog,
        modules: ["DECLARE / OPEN", "FETCH loops", "Forward-only", "When to avoid"],
      },
    ],
  },
  {
    group: "Database Objects & Maintenance",
    groupBlurb: "How data is exposed, identified, secured, and recovered.",
    topics: [
      {
        slug: "views",
        title: "Views & Materialized Views",
        blurb:
          "Standard views, materialized views for performance, and updatable vs. read-only semantics.",
        icon: Eye,
        modules: ["Standard views", "Materialized", "Updatable views", "Refresh strategies"],
      },
      {
        slug: "sequences-identity",
        title: "Sequences & Identity",
        blurb: "Auto-incrementing surrogate keys, sequences, and unique identifier strategies.",
        icon: KeyRound,
        modules: ["IDENTITY", "SEQUENCE", "UUID / ULID", "Surrogate vs natural"],
      },
      {
        slug: "security",
        title: "Database Security",
        blurb: "Users, roles, GRANT / REVOKE, schemas, and Row-Level Security (RLS).",
        icon: LockKeyhole,
        modules: ["Roles & users", "GRANT / REVOKE", "Schemas", "Row-Level Security"],
      },
      {
        slug: "backup-recovery",
        title: "Backup & Recovery",
        blurb:
          "Full, differential, and transaction log backups — plus disaster recovery strategies.",
        icon: Save,
        modules: ["Full / diff", "Log backups", "PITR", "Disaster recovery"],
      },
    ],
  },
  {
    group: "Data Integrity & Environment",
    groupBlurb:
      "ACID, isolation, deadlocks, and the locking model that decides what concurrent queries see.",
    topics: [
      {
        slug: "schema-design",
        title: "Schema Design",
        blurb: "1NF → 3NF, surrogate vs natural keys, denormalization, and modeling for reads.",
        icon: Rows3,
        modules: ["Normalization", "Surrogate keys", "Denormalization", "Modeling reads"],
      },
      {
        slug: "constraints",
        title: "Constraints & Integrity",
        blurb: "PK, FK, UNIQUE, CHECK, NOT NULL, DEFAULT — let the database enforce truth.",
        icon: Shield,
        modules: ["Primary / unique", "Foreign keys", "CHECK / DEFAULT", "Cascades"],
      },
      {
        slug: "transactions-isolation",
        title: "Transactions & Isolation",
        blurb:
          "ACID, BEGIN/COMMIT/ROLLBACK, isolation levels, and concurrency anomalies (dirty / non-repeatable / phantom).",
        icon: Braces,
        modules: ["ACID", "Isolation levels", "Anomalies", "Snapshot vs serializable"],
      },
      {
        slug: "deadlocks",
        title: "Deadlock Management",
        blurb:
          "Identify, debug, and avoid deadlocks in high-concurrency systems — and what the engine does about them.",
        icon: ShieldAlert,
        modules: ["Detection", "Common causes", "Avoidance patterns", "Victim selection"],
      },
      {
        slug: "locking",
        title: "Locking Granularity",
        blurb:
          "Table-level vs. row-level locking, shared vs. exclusive, and lock escalation behavior.",
        icon: Lock,
        modules: ["Shared / exclusive", "Row vs table", "Lock escalation", "Hints"],
      },
      {
        slug: "ddl-migrations",
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
        slug: "indexes",
        title: "Indexes",
        blurb: "B-tree, hash, GIN, partial & composite — when an index helps, and when it lies.",
        icon: Network,
        modules: ["B-tree", "Composite", "Partial indexes", "GIN / GiST"],
      },
      {
        slug: "explain",
        title: "EXPLAIN & Plans",
        blurb: "Reading EXPLAIN ANALYZE: seq scan vs index scan, joins, sorts, and row estimates.",
        icon: TrendingUp,
        modules: ["EXPLAIN", "EXPLAIN ANALYZE", "Plan shapes", "Stats & ANALYZE"],
      },
      {
        slug: "optimization",
        title: "Query Optimization",
        blurb:
          "Rewrites that work, predicate pushdown, avoiding N+1, and killing accidental Cartesians.",
        icon: Calculator,
        modules: ["Rewrites", "Pushdown", "Avoid N+1", "Cardinality"],
      },
      {
        slug: "scaling",
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
  const unlockedTopics = sections.reduce(
    (n, s) => n + s.topics.filter((t) => t.unlocked).length,
    0,
  );

  return (
    <div className="relative">
      <div className="grid-bg absolute inset-0 -z-10 opacity-40" />

      {/* Hero */}
      <section className="border-b border-hairline px-8 py-14 lg:px-16 lg:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex flex-wrap items-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-3" />
              Back to roadmap
            </Link>

            <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface/60 px-4 py-1.5 backdrop-blur">
              <Sparkles className="size-3.5 text-mint" />
              <span className="font-mono text-[11px] uppercase leading-relaxed tracking-[0.2em] text-muted-foreground">
                SQL Mastery <span className="mx-1 text-muted-foreground/50">·</span> {unlockedTopics} of {totalTopics} topics unlocked
              </span>
            </div>
          </div>

          <h1 className="text-balance text-3xl font-semibold tracking-tight lg:text-5xl">
            SQL & databases, from{" "}
            <span className="text-mint">SELECT to query plans.</span>
          </h1>
          <p className="mt-3 max-w-2xl text-balance text-muted-foreground lg:text-lg">
            A visual, end-to-end roadmap for SQL — from the relational model to procedures,
            triggers, isolation levels, EXPLAIN plans, and the trade-offs behind every fast query.
            Start with Foundations; the rest lands progressively.
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
                {s.topics.map((t) => {
                  const card = (
                    <div
                      className={`group relative h-full overflow-hidden rounded-2xl border p-5 transition-all duration-300 ${
                        t.unlocked
                          ? "border-hairline bg-surface hover:border-mint/50 hover:shadow-[0_8px_30px_-5px_rgba(94,234,212,0.15)] hover:-translate-y-1"
                          : "border-hairline/60 bg-surface/40 hover:border-foreground/20 hover:shadow-lg hover:-translate-y-1"
                      }`}
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <div
                          className={`grid size-10 place-items-center rounded-md ${
                            t.unlocked
                              ? "bg-mint/15 text-mint ring-1 ring-mint/30"
                              : "bg-surface-2 text-muted-foreground/80 ring-1 ring-hairline"
                          }`}
                        >
                          <t.icon className="size-5" />
                        </div>
                        {t.unlocked ? (
                          <span className="rounded-full border border-mint/30 bg-mint/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-mint">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full border border-hairline px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/80">
                            <Lock className="size-3" />
                            Coming soon
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-medium tracking-tight">{t.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{t.blurb}</p>

                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {t.modules.map((m) => (
                          <span
                            key={m}
                            className={
                              t.unlocked
                                ? "rounded-full border border-mint/30 bg-mint/10 px-2 py-0.5 text-[10px] text-mint"
                                : "rounded-full border border-hairline px-2 py-0.5 text-[10px] text-muted-foreground/80"
                            }
                          >
                            {m}
                          </span>
                        ))}
                      </div>

                      <div className="mt-5 inline-flex items-center gap-1.5 text-sm">
                        {t.unlocked ? (
                          <span className="text-mint">
                            Open topic <ArrowRight className="ml-1 inline size-4" />
                          </span>
                        ) : (
                          <span className="text-muted-foreground">
                            Preview syllabus <ArrowRight className="ml-1 inline size-4" />
                          </span>
                        )}
                      </div>
                    </div>
                  );

                  if (t.unlocked) {
                    const base = t.routeBase ?? "foundations";
                    return base === "querying" ? (
                      <Link
                        key={t.title}
                        to="/sql/querying/$topic"
                        params={{ topic: t.slug }}
                        className="block"
                      >
                        {card}
                      </Link>
                    ) : (
                      <Link
                        key={t.title}
                        to="/sql/foundations/$topic"
                        params={{ topic: t.slug }}
                        className="block"
                      >
                        {card}
                      </Link>
                    );
                  }

                  return (
                    <div key={t.title} aria-disabled className="block cursor-not-allowed">
                      {card}
                    </div>
                  );
                })}
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
