import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Database, Lock, Table, Terminal } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type FoundationTopic = {
  slug: string;
  title: string;
  category: string;
  blurb: string;
  icon: LucideIcon;
  lessons: { slug: string; title: string; subtitle: string }[];
};

const FOUNDATION_TOPICS: Record<string, FoundationTopic> = {
  "relational-model": {
    slug: "relational-model",
    title: "Relational Model",
    category: "Foundations",
    icon: Table,
    blurb:
      "The mental model behind every database — tables, tuples, keys, and the relationships that turn data into meaning.",
    lessons: [
      {
        slug: "tables-and-rows",
        title: "Tables, Rows & Columns",
        subtitle: "Why relations are sets of tuples, and how that shapes everything else.",
      },
      {
        slug: "primary-keys",
        title: "Primary Keys",
        subtitle: "What makes a key, why every table needs one, and natural vs surrogate.",
      },
      {
        slug: "foreign-keys",
        title: "Foreign Keys & Relationships",
        subtitle: "1:1, 1:N, N:M — modeling links between entities without losing integrity.",
      },
      {
        slug: "normalization",
        title: "Normalization Basics",
        subtitle: "1NF → 3NF in plain English: kill duplicates, kill update anomalies.",
      },
    ],
  },
  "data-types": {
    slug: "data-types",
    title: "Data Types & Schemas",
    category: "Foundations",
    icon: Database,
    blurb:
      "The right type is half the schema — pick precisely and your queries get faster, smaller, and safer.",
    lessons: [
      {
        slug: "numeric-text",
        title: "Numeric & Text Types",
        subtitle: "INT vs BIGINT, NUMERIC precision, VARCHAR vs TEXT — and why it matters.",
      },
      {
        slug: "dates-timestamps",
        title: "Dates, Timestamps & Time Zones",
        subtitle: "TIMESTAMP vs TIMESTAMPTZ, intervals, and the eternal UTC question.",
      },
      {
        slug: "json-jsonb",
        title: "JSON & JSONB",
        subtitle: "When semi-structured columns earn their keep — and when they don't.",
      },
      {
        slug: "null-semantics",
        title: "NULL Semantics",
        subtitle: "Three-valued logic, NULL propagation, and the comparisons that silently fail.",
      },
    ],
  },
  "select-fundamentals": {
    slug: "select-fundamentals",
    title: "SELECT Fundamentals",
    category: "Foundations",
    icon: Terminal,
    blurb:
      "Every query you'll ever write starts here — and the logical execution order is the key that unlocks the rest.",
    lessons: [
      {
        slug: "select-from",
        title: "SELECT & FROM",
        subtitle: "Projecting columns, aliasing, and the difference between * and explicit lists.",
      },
      {
        slug: "where",
        title: "WHERE Filters",
        subtitle: "Predicates, short-circuiting, sargable vs non-sargable conditions.",
      },
      {
        slug: "order-limit",
        title: "ORDER BY & LIMIT",
        subtitle: "Deterministic ordering, NULLS FIRST / LAST, and pagination pitfalls.",
      },
      {
        slug: "logical-order",
        title: "Logical Query Order",
        subtitle: "FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT. Memorize this.",
      },
    ],
  },
};

export const Route = createFileRoute("/sql/foundations/$topic")({
  head: ({ params }) => {
    const t = FOUNDATION_TOPICS[params.topic];
    if (!t) return { meta: [{ title: "Foundations — SQL Mastery" }] };
    return {
      meta: [
        { title: `${t.title} — SQL Foundations` },
        { name: "description", content: t.blurb },
        { property: "og:title", content: `${t.title} — SQL Foundations` },
        { property: "og:description", content: t.blurb },
      ],
    };
  },
  component: FoundationTopicPage,
});

function FoundationTopicPage() {
  const { topic } = Route.useParams();
  const t = FOUNDATION_TOPICS[topic];

  if (!t) {
    return (
      <div className="px-6 py-16 text-center text-muted-foreground">
        Topic not found.{" "}
        <Link to="/sql" className="text-mint underline-offset-4 hover:underline">
          Back to SQL Mastery
        </Link>
      </div>
    );
  }

  return (
    <div className="px-6 py-10 lg:px-12 lg:py-14">
      <div className="mx-auto max-w-6xl">
        <Link
          to="/sql"
          className="mb-6 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3" />
          Back to SQL Mastery
        </Link>

        <div className="flex items-center gap-3">
          <div className="grid size-12 place-items-center rounded-md bg-mint/15 text-mint ring-1 ring-mint/30">
            <t.icon className="size-6" />
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              {t.category} · Topic
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight lg:text-4xl">{t.title}</h1>
          </div>
        </div>
        <p className="mt-4 max-w-2xl text-balance text-muted-foreground lg:text-lg">{t.blurb}</p>

        <div className="mt-10 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {t.lessons.map((les, i) => (
            <div
              key={les.slug}
              aria-disabled
              className="group relative cursor-not-allowed overflow-hidden rounded-2xl border border-hairline/60 bg-surface/40 p-5 transition-colors hover:border-foreground/20"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] text-muted-foreground">
                  {String(i + 1).padStart(2, "0")} / {String(t.lessons.length).padStart(2, "0")}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-hairline px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/80">
                  <Lock className="size-3" />
                  Coming soon
                </span>
              </div>
              <h2 className="mt-4 text-base font-medium">{les.title}</h2>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{les.subtitle}</p>
              <div className="mt-5 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                Preview lesson
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
