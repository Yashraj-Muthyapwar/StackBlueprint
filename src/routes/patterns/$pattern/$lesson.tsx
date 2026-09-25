import { Link, createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { ClientOnly } from "@/components/lesson/ClientOnly";
import { LessonPlayer } from "@/components/lesson/LessonPlayer";
import { LessonLayout } from "@/components/learning-paths/LessonLayout";
import { SectionRenderer as PythonSectionRenderer } from "@/components/python/SectionRenderer";
import { useProgress } from "@/hooks/use-progress";
import { PATTERN_BY_SLUG } from "@/lessons/roadmap";

export const Route = createFileRoute("/patterns/$pattern/$lesson")({
  head: ({ params }) => {
    const p = PATTERN_BY_SLUG[params.pattern];
    const l = p?.lessons.find((x) => x.builder.slug === params.lesson)?.builder;
    if (!l) return { meta: [{ title: "Lesson" }] };
    return {
      meta: [
        { title: l.title },
        { name: "description", content: l.subtitle },
        { property: "og:title", content: l.title },
        { property: "og:description", content: l.subtitle },
      ],
    };
  },
  component: LessonPage,
  notFoundComponent: () => (
    <div className="px-6 py-16 text-center text-muted-foreground">Lesson not found.</div>
  ),
});

function LessonPage() {
  const { isCompleted, markComplete, markIncomplete } = useProgress();
  const { pattern, lesson } = Route.useParams();
  const p = PATTERN_BY_SLUG[pattern];
  if (!p)
    return <div className="px-6 py-16 text-center text-muted-foreground">Pattern not found.</div>;
  const idx = p.lessons.findIndex((x) => x.builder.slug === lesson);
  if (idx < 0)
    return <div className="px-6 py-16 text-center text-muted-foreground">Lesson not found.</div>;
  const entry = p.lessons[idx];
  const prev = idx > 0 ? p.lessons[idx - 1] : null;
  const next = idx < p.lessons.length - 1 ? p.lessons[idx + 1] : null;
  const categoryAnchor =
    p.category === "Arrays" ? "arrays-matrix" : p.category === "Strings" ? "strings" : "hash-map";

  if (entry.builder.sections) {
    const topicLessons = p.lessons.map((item) => ({
      slug: item.builder.slug,
      title: item.builder.title,
      path: `/patterns/${p.slug}/${item.builder.slug}`,
    }));

    return (
      <LessonLayout
        trackTitle="Patterns"
        trackPath="/patterns"
        topic={{ slug: p.slug, title: p.title, path: `/patterns/${p.slug}`, lessons: topicLessons }}
        lesson={{
          slug: entry.builder.slug,
          title: entry.builder.title,
          subtitle: entry.builder.subtitle,
          path: `/patterns/${p.slug}/${entry.builder.slug}`,
        }}
        sections={entry.builder.sections}
        renderSection={(section, onQuizActiveChange, index) => (
          <PythonSectionRenderer
            section={section}
            onQuizActiveChange={onQuizActiveChange}
            index={index}
          />
        )}
        hasQuiz={entry.builder.sections.some((section) => section.kind === "quiz")}
        isCompleted={isCompleted(entry.builder.slug)}
        onToggleComplete={() =>
          isCompleted(entry.builder.slug)
            ? markIncomplete(entry.builder.slug)
            : markComplete(entry.builder.slug)
        }
      />
    );
  }

  return (
    <div className="px-6 py-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <nav
            aria-label="Breadcrumb"
            className="mb-3 flex flex-wrap items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
          >
            <Link to="/patterns" className="hover:text-foreground">
              Patterns
            </Link>
            <ChevronRight className="size-3" />
            <Link to="/patterns" hash={categoryAnchor} className="hover:text-foreground">
              {p.category}
            </Link>
            <ChevronRight className="size-3" />
            <Link
              to="/patterns/$pattern"
              params={{ pattern: p.slug }}
              className="hover:text-foreground"
            >
              {p.title}
            </Link>
            <ChevronRight className="size-3" />
            <span className="text-foreground">
              {String(idx + 1).padStart(2, "0")} / {String(p.lessons.length).padStart(2, "0")}
            </span>
          </nav>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {p.category} · {p.title} · {String(idx + 1).padStart(2, "0")} /{" "}
            {String(p.lessons.length).padStart(2, "0")}
          </p>
          <h1 className="lesson-title mt-1.5 font-semibold tracking-tight">
            {entry.builder.title}
          </h1>
          <p className="lesson-subtitle mt-2 max-w-3xl text-pretty text-muted-foreground">
            {entry.builder.subtitle}
          </p>
        </div>

        <ClientOnly
          fallback={
            <div className="grid min-h-[420px] place-items-center rounded-2xl border border-hairline bg-surface text-xs text-muted-foreground">
              loading lesson…
            </div>
          }
        >
          <LessonPlayer key={entry.builder.slug} builder={entry.builder} />
        </ClientOnly>

        {entry.builder.spotIt?.length || entry.builder.avoidWhen?.length ? (
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {entry.builder.spotIt?.length ? (
              <div className="rounded-2xl border border-mint/30 bg-mint/[0.04] px-4 py-3">
                <div className="mb-2 flex items-center gap-2">
                  <div className="size-1.5 rounded-full bg-mint shadow-[0_0_10px_var(--mint)]" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-mint">
                    how to spot it in an interview
                  </span>
                </div>
                <ul className="lesson-supporting space-y-1.5 text-foreground/90">
                  {entry.builder.spotIt.map((s, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-2 size-1 shrink-0 rounded-full bg-mint/70" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {entry.builder.avoidWhen?.length ? (
              <div className="rounded-2xl border border-rose/30 bg-rose/[0.04] px-4 py-3">
                <div className="mb-2 flex items-center gap-2">
                  <div className="size-1.5 rounded-full bg-rose shadow-[0_0_10px_var(--rose)]" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-rose">
                    when to avoid this pattern
                  </span>
                </div>
                <ul className="lesson-supporting space-y-1.5 text-foreground/90">
                  {entry.builder.avoidWhen.map((s, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="mt-2 size-1 shrink-0 rounded-full bg-rose/70" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}

        {entry.builder.practiceLadder?.length ? (
          <div className="mt-8 rounded-2xl border border-hairline bg-surface p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Practice Ladder</h2>
            <div className="space-y-4">
              {entry.builder.practiceLadder.map((prob, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-2 rounded-xl border border-hairline bg-background p-4 sm:flex-row sm:items-start sm:gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1.5">
                      {prob.link ? (
                        <a
                          href={prob.link}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-foreground hover:underline hover:text-mint"
                        >
                          {prob.name}
                        </a>
                      ) : (
                        <span className="font-medium text-foreground">{prob.name}</span>
                      )}
                      <Badge
                        variant={
                          prob.difficulty === "easy"
                            ? "secondary"
                            : prob.difficulty === "medium"
                              ? "default"
                              : "destructive"
                        }
                        className="capitalize"
                      >
                        {prob.difficulty}
                      </Badge>
                    </div>
                    <p className="lesson-supporting text-muted-foreground">{prob.hint}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {entry.builder.takeaways?.length ? (
          <section className="mt-8 rounded-2xl border border-mint/30 bg-mint/[0.04] p-6">
            <h2 className="text-lg font-semibold text-foreground">Key Takeaways</h2>
            <ul className="lesson-supporting mt-4 space-y-2 text-foreground/90">
              {entry.builder.takeaways.map((takeaway) => (
                <li key={takeaway} className="flex gap-2">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-mint" />
                  <span>{takeaway}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <div className="mt-8 flex justify-end">
          <Button
            type="button"
            variant={isCompleted(entry.builder.slug) ? "outline" : "default"}
            onClick={() =>
              isCompleted(entry.builder.slug)
                ? markIncomplete(entry.builder.slug)
                : markComplete(entry.builder.slug)
            }
          >
            {isCompleted(entry.builder.slug) ? "Marked complete" : "Mark lesson complete"}
          </Button>
        </div>

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
