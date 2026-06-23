import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { LessonPlayer } from "@/components/lesson/LessonPlayer";
import { PATTERN_BY_SLUG } from "@/lessons/roadmap";

export const Route = createFileRoute("/patterns/$pattern/$lesson")({
  head: ({ params }) => {
    const p = PATTERN_BY_SLUG[params.pattern];
    const l = p?.lessons.find((x) => x.builder.slug === params.lesson)?.builder;
    if (!l) return { meta: [{ title: "Lesson" }] };
    return {
      meta: [
        { title: `${l.title}` },
        { name: "description", content: l.subtitle },
        { property: "og:title", content: l.title },
        { property: "og:description", content: l.subtitle },
      ],
    };
  },
  loader: ({ params }) => {
    const p = PATTERN_BY_SLUG[params.pattern];
    if (!p) throw notFound();
    if (!p.lessons.find((x) => x.builder.slug === params.lesson)) throw notFound();
    return null;
  },
  component: LessonPage,
});

function LessonPage() {
  const { pattern, lesson } = Route.useParams();
  const p = PATTERN_BY_SLUG[pattern];
  const idx = p.lessons.findIndex((x) => x.builder.slug === lesson);
  const entry = p.lessons[idx];
  const prev = idx > 0 ? p.lessons[idx - 1] : null;
  const next = idx < p.lessons.length - 1 ? p.lessons[idx + 1] : null;

  return (
    <div className="px-6 py-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {p.category} · {p.title} · {String(idx + 1).padStart(2, "0")} / {String(p.lessons.length).padStart(2, "0")}
          </p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-tight lg:text-3xl">{entry.builder.title}</h1>
          <p className="mt-2 max-w-3xl text-balance text-[15px] text-muted-foreground">{entry.builder.subtitle}</p>
        </div>

        <LessonPlayer key={entry.builder.slug} builder={entry.builder} />

        <div className="mt-8 flex items-center justify-between gap-3">
          {prev ? (
            <Link
              to="/patterns/$pattern/$lesson"
              params={{ pattern: p.slug, lesson: prev.builder.slug }}
              className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-surface px-4 py-2 text-sm text-foreground transition-colors hover:border-mint/40"
            >
              <ChevronLeft className="size-4" /> {prev.builder.title.replace(/^[^—]+—\s*/, "")}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              to="/patterns/$pattern/$lesson"
              params={{ pattern: p.slug, lesson: next.builder.slug }}
              className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-surface px-4 py-2 text-sm text-foreground transition-colors hover:border-mint/40"
            >
              {next.builder.title.replace(/^[^—]+—\s*/, "")} <ChevronRight className="size-4" />
            </Link>
          ) : (
            <span />
          )}
        </div>
      </div>
    </div>
  );
}
