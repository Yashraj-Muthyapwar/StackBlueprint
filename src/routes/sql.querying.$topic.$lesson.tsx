import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, ChevronRight, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { QUERYING_TOPICS } from "@/lessons/sql/querying-content";
import { SectionRenderer } from "@/components/sql/SectionRenderer";
import { useProgress } from "@/hooks/use-progress";

export const Route = createFileRoute("/sql/querying/$topic/$lesson")({
  head: ({ params }) => {
    const t = QUERYING_TOPICS[params.topic];
    const l = t?.lessons.find((x) => x.slug === params.lesson);
    if (!t || !l) return { meta: [{ title: "Lesson — SQL Mastery" }] };
    return {
      meta: [
        { title: `${l.title} — ${t.title}` },
        { name: "description", content: l.subtitle },
        { property: "og:title", content: `${l.title} — ${t.title}` },
        { property: "og:description", content: l.subtitle },
      ],
    };
  },
  component: LessonPage,
});

function LessonPage() {
  const { topic, lesson } = Route.useParams();
  const t = QUERYING_TOPICS[topic];
  const { isCompleted, markComplete, markIncomplete } = useProgress();
  const [isQuizActive, setIsQuizActive] = useState(false);
  const idx = t?.lessons.findIndex((x) => x.slug === lesson) ?? -1;
  const l = idx >= 0 ? t!.lessons[idx] : undefined;

  if (!t || !l) {
    return (
      <div className="px-6 py-16 text-center text-muted-foreground">
        Lesson not found.{" "}
        <Link to="/sql" className="text-mint underline-offset-4 hover:underline">
          Back to SQL Mastery
        </Link>
      </div>
    );
  }

  const prev = idx > 0 ? t.lessons[idx - 1] : undefined;
  const next = idx < t.lessons.length - 1 ? t.lessons[idx + 1] : undefined;

  const hasQuiz = l.sections.some((s) => s.kind === "quiz");

  useEffect(() => {
    const handleQuizPassed = () => {
      markComplete(l.slug);
    };
    window.addEventListener("quiz-passed", handleQuizPassed);
    return () => window.removeEventListener("quiz-passed", handleQuizPassed);
  }, [l.slug, markComplete]);

  return (
    <div className="px-6 py-10 lg:px-12 lg:py-14">
      <div className="mx-auto max-w-3xl">
        <nav
          aria-label="Breadcrumb"
          className="mb-4 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
        >
          <Link to="/sql" className="hover:text-foreground">
            SQL Mastery
          </Link>
          <ChevronRight className="size-3" />
          <Link to="/sql" className="hover:text-foreground">
            {t.category}
          </Link>
          <ChevronRight className="size-3" />
          <Link
            to="/sql/querying/$topic"
            params={{ topic: t.slug }}
            className="hover:text-foreground"
          >
            {t.title}
          </Link>
          <ChevronRight className="size-3" />
          <span className="text-foreground">
            {String(idx + 1).padStart(2, "0")} / {String(t.lessons.length).padStart(2, "0")}
          </span>
        </nav>

        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {t.category} · {t.title} · Lesson {idx + 1} of {t.lessons.length}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight lg:text-4xl">
          {l.title}
        </h1>
        <p className="mt-3 text-balance text-muted-foreground lg:text-lg">
          {l.subtitle.split(/`([^`]+)`/g).map((part, i) =>
            i % 2 === 1 ? (
              <code
                key={i}
                className="rounded-md bg-background px-1.5 py-0.5 font-mono text-[0.85em] text-foreground ring-1 ring-inset ring-hairline"
              >
                {part}
              </code>
            ) : (
              part
            )
          )}
        </p>

        <div className="mt-10 space-y-7">
          {l.sections.map((s, i) => (
            <div 
              key={i} 
              className={`transition-all duration-500 ${isQuizActive && s.kind !== "quiz" ? "blur-md pointer-events-none opacity-40 select-none" : ""}`}
            >
              <SectionRenderer section={s} onQuizActiveChange={setIsQuizActive} />
            </div>
          ))}
        </div>

        <nav className="mt-14 flex flex-col gap-3 border-t border-hairline pt-6 sm:flex-row sm:items-center sm:justify-between">
          {prev ? (
            <Link
              to="/sql/querying/$topic/$lesson"
              params={{ topic: t.slug, lesson: prev.slug }}
              className="group inline-flex items-center gap-2 rounded-lg border border-hairline/70 px-4 py-3 transition-colors hover:border-mint/40 hover:bg-surface/60"
            >
              <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
              <div className="text-left">
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Previous
                </div>
                <div className="text-sm font-medium">{prev.title}</div>
              </div>
            </Link>
          ) : (
            <div className="hidden sm:block sm:flex-1" />
          )}

          <div className="flex shrink-0 justify-center sm:mx-4">
            <button
              onClick={() => isCompleted(l.slug) ? markIncomplete(l.slug) : markComplete(l.slug)}
              disabled={hasQuiz && !isCompleted(l.slug)}
              className={`group inline-flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-medium transition-colors ${
                hasQuiz && !isCompleted(l.slug)
                  ? "border-hairline/50 bg-surface/10 text-muted-foreground/50 cursor-not-allowed"
                  : isCompleted(l.slug) 
                    ? "border-mint/30 bg-mint/10 text-mint hover:bg-mint/20" 
                    : "border-hairline/70 bg-surface/30 text-muted-foreground hover:bg-surface/60 hover:text-foreground"
              }`}
            >
              <CheckCircle2 className={`size-4 ${isCompleted(l.slug) ? "" : "opacity-50"}`} />
              {isCompleted(l.slug) 
                ? "Completed" 
                : hasQuiz 
                  ? "Pass Quiz to Complete" 
                  : "Mark as Complete"}
            </button>
          </div>

          {next ? (
            <Link
              to="/sql/querying/$topic/$lesson"
              params={{ topic: t.slug, lesson: next.slug }}
              className="group inline-flex items-center gap-2 rounded-lg border border-hairline/70 px-4 py-3 text-right transition-colors hover:border-mint/40 hover:bg-surface/60"
            >
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Next
                </div>
                <div className="text-sm font-medium">{next.title}</div>
              </div>
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          ) : (
            <div className="hidden sm:block sm:flex-1" />
          )}
        </nav>
      </div>
    </div>
  );
}
