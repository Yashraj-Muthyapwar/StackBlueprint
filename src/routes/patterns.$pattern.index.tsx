import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { PATTERN_BY_SLUG } from "@/lessons/roadmap";

export const Route = createFileRoute("/patterns/$pattern/")({
  head: ({ params }) => {
    const p = PATTERN_BY_SLUG[params.pattern];
    if (!p) return { meta: [{ title: "Pattern" }] };
    return {
      meta: [
        { title: `${p.title} — visual lessons` },
        { name: "description", content: p.blurb },
        { property: "og:title", content: `${p.title} — visual lessons` },
        { property: "og:description", content: p.blurb },
      ],
    };
  },
  loader: ({ params }) => {
    const p = PATTERN_BY_SLUG[params.pattern];
    if (!p) throw notFound();
    return { pattern: p };
  },
  component: PatternIndex,
});

function PatternIndex() {
  const { pattern: p } = Route.useLoaderData();
  return (
    <div className="px-6 py-10 lg:px-12 lg:py-14">
      <div className="mx-auto max-w-6xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {p.category} · Pattern
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight lg:text-5xl">{p.title}</h1>
        <p className="mt-4 max-w-2xl text-balance text-muted-foreground lg:text-lg">{p.blurb}</p>

        <div className="mt-10 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {p.lessons.map((les, i) => (
            <Link
              key={les.builder.slug}
              to="/patterns/$pattern/$lesson"
              params={{ pattern: p.slug, lesson: les.builder.slug }}
              className="group relative overflow-hidden rounded-2xl border border-hairline bg-surface p-5 transition-colors hover:border-mint/40"
            >
              <div className="flex items-center justify-between">
                <div className="grid size-10 place-items-center rounded-md bg-mint/15 text-mint ring-1 ring-mint/30">
                  <les.icon className="size-5" />
                </div>
                <span className="font-mono text-[11px] text-muted-foreground">
                  {String(i + 1).padStart(2, "0")} / {String(p.lessons.length).padStart(2, "0")}
                </span>
              </div>
              <h2 className="mt-4 text-base font-medium">{les.builder.title.replace(/^[^—]+—\s*/, "")}</h2>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{les.builder.subtitle}</p>
              <div className="mt-5 inline-flex items-center gap-1.5 text-sm text-mint">
                Open lesson
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
