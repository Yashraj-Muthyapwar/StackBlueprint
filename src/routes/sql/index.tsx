import { createFileRoute } from "@tanstack/react-router";
import { useProgress } from "@/hooks/use-progress";
import { TrackCard } from "@/components/learning-paths/TrackCard";
import { FOUNDATION_TOPICS } from "@/lessons/sql/foundations-content";
import { QUERYING_TOPICS } from "@/lessons/sql/querying-content";
import { SPECIALIZED_TOPICS } from "@/lessons/sql/specialized-content";
import sqlLogo from "@/images/logos/sql-logo.png";
import {
  AlertTriangle,
  ArrowLeft,
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
      { title: "SQL Mastery — StackBlueprint" },
      {
        name: "description",
        content:
          "Master SQL: from database foundations to complex querying and performance tuning.",
      },
      { property: "og:title", content: "SQL Mastery — StackBlueprint" },
      {
        property: "og:description",
        content:
          "Master SQL: from database foundations to complex querying and performance tuning.",
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
  routeBase?: "foundations" | "querying" | "specialized";
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
        slug: "database-fundamentals",
        title: "Database Fundamentals",
        blurb: "What is SQL, client-server architecture, types of SQL commands, keys, and normalization.",
        icon: Terminal,
        modules: ["What is a database?", "How databases work", "SQL & Client-Server", "DDL vs DML", "Keys & Normalization"],
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
        slug: "sql-querying-fundamentals",
        title: "SQL Querying Fundamentals",
        blurb: "SELECT, FROM, WHERE, ORDER BY, LIMIT — and the logical order SQL evaluates them.",
        icon: Table,
        modules: [
          "SELECT / FROM",
          "Comments, calculations & aliases",
          "SQL operators",
          "WHERE filters",
          "CASE WHEN: labels & buckets",
          "DISTINCT, ORDER BY & LIMIT",
          "Logical query order",
        ],
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
        modules: ["Aggregate funcs", "GROUP BY", "HAVING", "Final quiz"],
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
        modules: [
          "CONCAT / SUBSTRING",
          "LEFT / RIGHT / LENGTH",
          "UPPER / LOWER",
          "TRIM / REPLACE",
          "POSITION / SPLIT_PART",
          "CAST / TO_CHAR",
          "Regex",
        ],
        unlocked: true,
        routeBase: "specialized",
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
        blurb: "Advanced analytical SQL, beginning with GROUPING SETS, ROLLUP, and CUBE.",
        icon: BarChart3,
        modules: ["GROUPING SETS / ROLLUP / CUBE"],
        unlocked: true,
        routeBase: "querying",
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
  const { isCompleted } = useProgress();

  return (
    <div className="flex w-full flex-col font-sans">
      <div className="border-b border-hairline bg-card/30 px-6 py-12 lg:px-12 lg:py-16">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mx-auto mb-6 flex justify-center">
            <img src={sqlLogo} alt="SQL Mastery Logo" className="size-16 object-contain drop-shadow-sm lg:size-20" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
            SQL Mastery
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground lg:text-xl">
            Master SQL: from database foundations to complex querying and performance tuning.
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-5xl px-6 py-16 lg:px-12 lg:py-20">
        <div className="flex flex-col gap-24">
          {sections.map((sec, i) => (
            <div key={sec.group} className="flex flex-col lg:flex-row lg:items-start lg:gap-16">
              <div className="mb-8 w-full shrink-0 lg:sticky lg:top-24 lg:mb-0 lg:w-64 xl:w-72">
                <div className="flex items-center gap-3">
                  <div className="grid size-6 place-items-center rounded-full bg-border text-xs font-bold text-foreground">
                    {i + 1}
                  </div>
                  <h2 className="text-xl font-bold tracking-tight text-foreground">
                    {sec.group}
                  </h2>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {sec.groupBlurb}
                </p>
              </div>

              <div className="flex w-full flex-col gap-4">
                {sec.topics.map((t) => {
                  const Icon = t.icon;
                  const isLocked = !t.unlocked;

                  let realTopic;
                  if (t.routeBase === "specialized") {
                    realTopic = SPECIALIZED_TOPICS[t.slug as keyof typeof SPECIALIZED_TOPICS];
                  } else if (t.routeBase === "querying") {
                    realTopic = QUERYING_TOPICS[t.slug as keyof typeof QUERYING_TOPICS];
                  } else {
                    realTopic = FOUNDATION_TOPICS[t.slug as keyof typeof FOUNDATION_TOPICS];
                  }

                  const completedCount = realTopic
                    ? realTopic.lessons.filter(l => isCompleted(l.slug)).length
                    : 0;
                  const totalCount = realTopic ? realTopic.lessons.length : t.modules.length;

                  const toPath = t.to || `/sql/${t.routeBase || "foundations"}/${t.slug}`;
                  return (
                    <TrackCard
                      key={t.slug}
                      title={t.title}
                      blurb={t.blurb}
                      icon={Icon}
                      isLocked={isLocked}
                      lessons={t.modules.map((title, moduleIndex) => ({
                        slug: `${t.slug}-${moduleIndex}`,
                        title,
                      }))}
                      completedCount={completedCount}
                      totalCount={totalCount}
                      href={isLocked ? undefined : toPath}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
