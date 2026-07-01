import { Link, createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { ClientOnly } from "@/components/lesson/ClientOnly";
import { LessonPlayer } from "@/components/lesson/LessonPlayer";
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
  const { pattern, lesson } = Route.useParams();
  const p = PATTERN_BY_SLUG[pattern];
  if (!p) return <div className="px-6 py-16 text-center text-muted-foreground">Pattern not found.</div>;
  const idx = p.lessons.findIndex((x) => x.builder.slug === lesson);
  if (idx < 0) return <div className="px-6 py-16 text-center text-muted-foreground">Lesson not found.</div>;
  const entry = p.lessons[idx];
  const prev = idx > 0 ? p.lessons[idx - 1] : null;
  const next = idx < p.lessons.length - 1 ? p.lessons[idx + 1] : null;

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
            <Link
              to="/patterns/category/$category"
              params={{ category: p.category.toLowerCase() === "arrays" ? "arrays" : p.category.toLowerCase() === "strings" ? "strings" : "hash-map" }}
              className="hover:text-foreground"
            >
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
            {p.category} · {p.title} · {String(idx + 1).padStart(2, "0")} / {String(p.lessons.length).padStart(2, "0")}
          </p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-tight lg:text-3xl">{entry.builder.title}</h1>
          <p className="mt-2 max-w-3xl text-balance text-[15px] text-muted-foreground">{entry.builder.subtitle}</p>
          {entry.builder.problem && (
            <div className="mt-4 max-w-3xl rounded-xl border border-hairline bg-surface/60 px-4 py-3">
              <div className="mb-1 flex items-center gap-2">
                <div className="size-1.5 rounded-full bg-violet shadow-[0_0_10px_var(--violet)]" />
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  problem
                </span>
              </div>
              <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-foreground/90">{entry.builder.problem}</p>
            </div>
          )}
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

        {(entry.builder.spotIt?.length || entry.builder.avoidWhen?.length) ? (
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {entry.builder.spotIt?.length ? (
              <div className="rounded-2xl border border-mint/30 bg-mint/[0.04] px-4 py-3">
                <div className="mb-2 flex items-center gap-2">
                  <div className="size-1.5 rounded-full bg-mint shadow-[0_0_10px_var(--mint)]" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-mint">
                    how to spot it in an interview
                  </span>
                </div>
                <ul className="space-y-1.5 text-[14px] leading-relaxed text-foreground/90">
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
                <ul className="space-y-1.5 text-[14px] leading-relaxed text-foreground/90">
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
