import { useEffect } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, ChevronRight, Construction, CheckCircle2 } from "lucide-react";
import { useProgress } from "@/hooks/use-progress";
import { CATEGORY_BY_SLUG } from "@/lessons/roadmap";
import { SectionRenderer } from "@/components/data-engineering/SectionRenderer";
import { FOUNDATION_TOPICS } from "@/lessons/data-engineering/foundations-content";

export const Route = createFileRoute("/data-engineering/$topic/$lesson")({
  head: ({ params }) => {
    const cat = CATEGORY_BY_SLUG["data-engineering"];
    const t = cat?.patterns.find((p) => p.slug === params.topic) || cat?.sections?.flatMap(s => s.patterns).find(p => p.slug === params.topic);
    const l = t?.lessons?.find((x) => x.slug === params.lesson);
    if (!t || !l) return { meta: [{ title: "Lesson — Data Engineering" }] };
    return {
      meta: [
        { title: `${l.title} — ${t.title}` },
        { name: "description", content: "Data Engineering lesson" },
        { property: "og:title", content: `${l.title} — ${t.title}` },
      ],
    };
  },
  component: DataEngineeringLessonPage,
});

function DataEngineeringLessonPage() {
  const { topic, lesson } = Route.useParams();
  const { isCompleted, markComplete, markIncomplete } = useProgress();

  const cat = CATEGORY_BY_SLUG["data-engineering"];
  const t = cat?.patterns.find((p) => p.slug === topic) || cat?.sections?.flatMap(s => s.patterns).find(p => p.slug === topic);
  const idx = t?.lessons?.findIndex((x) => x.slug === lesson) ?? -1;
  const l = idx >= 0 ? t!.lessons![idx] : undefined;

  const content = FOUNDATION_TOPICS[topic]?.lessons.find(x => x.slug === lesson);
  const hasQuiz = content?.sections.some(s => s.kind === "quiz") ?? false;

  useEffect(() => {
    if (!l) return;
    const handleQuizPassed = () => {
      markComplete(l.slug);
    };
    window.addEventListener("quiz-passed", handleQuizPassed);
    return () => window.removeEventListener("quiz-passed", handleQuizPassed);
  }, [l?.slug, markComplete]);

  if (!t || !l) {
    return (
      <div className="px-6 py-16 text-center text-muted-foreground">
        Lesson not found.{" "}
        <Link to="/data-engineering" className="text-mint underline-offset-4 hover:underline">
          Back to Data Engineering
        </Link>
      </div>
    );
  }

  const prev = idx > 0 ? t.lessons![idx - 1] : undefined;
  const next = idx < t.lessons!.length - 1 ? t.lessons![idx + 1] : undefined;

  return (
    <div className="px-6 py-10 lg:px-12 lg:py-14">
      <div className="mx-auto max-w-3xl lg:max-w-4xl xl:max-w-5xl">
        <nav
          aria-label="Breadcrumb"
          className="mb-4 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
        >
          <Link to="/data-engineering" className="hover:text-foreground">
            Data Engineering
          </Link>
          <ChevronRight className="size-3" />
          <Link
            to="/data-engineering/$topic"
            params={{ topic: t.slug }}
            className="hover:text-foreground"
          >
            {t.title}
          </Link>
          <ChevronRight className="size-3" />
          <span className="text-foreground">
            {String(idx + 1).padStart(2, "0")} / {String(t.lessons!.length).padStart(2, "0")}
          </span>
        </nav>

        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Chapter · {t.title} · Lesson {idx + 1} of {t.lessons!.length}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight lg:text-4xl">
          {l.title}
        </h1>

        {lesson === "data-landscape" ? (
          <div className="mt-12 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-10 space-y-4">
              <p className="leading-relaxed text-muted-foreground lg:text-lg">
                The data engineering ecosystem is vast and constantly evolving. Every year, FirstMark Capital publishes the <strong>MAD (Machine Learning, AI, and Data) Landscape</strong> to map out the thousands of tools, frameworks, and companies that make up the modern data ecosystem.
              </p>
              <p className="leading-relaxed text-muted-foreground lg:text-lg">
                Explore the interactive map below to get a sense of how expansive the field has become. Don't worry if it feels overwhelming, throughout this track, we will focus on the fundamental concepts rather than trying to memorize every single tool.
              </p>
            </div>
            
            <div className="overflow-hidden rounded-2xl border border-hairline bg-surface shadow-xl">
              <div className="border-b border-hairline bg-surface-2 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="size-3 rounded-full bg-red-400/20 ring-1 ring-inset ring-red-400/50" />
                    <div className="size-3 rounded-full bg-amber-400/20 ring-1 ring-inset ring-amber-400/50" />
                    <div className="size-3 rounded-full bg-mint/20 ring-1 ring-inset ring-mint/50" />
                  </div>
                  <span className="ml-2 font-mono text-[10px] text-muted-foreground">mad.firstmark.com</span>
                </div>
                <a 
                  href="https://mad.firstmark.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-mono text-[10px] uppercase tracking-wider text-mint hover:underline"
                >
                  Open in new tab
                </a>
              </div>
              <iframe 
                src="https://mad.firstmark.com" 
                className="h-[750px] w-full bg-white" 
                title="MAD Landscape"
                loading="lazy"
              />
            </div>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Source: <a href="https://mad.firstmark.com" target="_blank" rel="noopener noreferrer" className="text-mint hover:underline">MAD (Machine Learning, AI, Data) Landscape</a>. All rights reserved by FirstMark.
            </p>
          </div>
        ) : FOUNDATION_TOPICS[topic]?.lessons.find(x => x.slug === lesson) ? (
          <div className="mt-10 space-y-7">
            {FOUNDATION_TOPICS[topic].lessons.find(x => x.slug === lesson)!.sections.map((s, i) => (
              <SectionRenderer key={i} section={s} />
            ))}
          </div>
        ) : (
          <div className="mt-16 flex flex-col items-center justify-center rounded-2xl border border-dashed border-mint/30 bg-mint/5 px-6 py-20 text-center">
            <div className="mb-4 grid size-16 place-items-center rounded-full bg-mint/10 text-mint ring-4 ring-mint/10">
              <Construction className="size-8" />
            </div>
            <h2 className="text-xl font-medium tracking-tight">Lesson Content Coming Soon</h2>
            <p className="mt-2 max-w-md text-balance text-muted-foreground">
              We are actively working on writing the content for the <strong>{l.title}</strong> lesson. Check back later!
            </p>
          </div>
        )}

        <nav className="mt-14 flex flex-col gap-3 border-t border-hairline pt-6 sm:flex-row sm:items-center sm:justify-between">
          {prev ? (
            <Link
              to="/data-engineering/$topic/$lesson"
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

          {l && (
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
          )}
          {next ? (
            <Link
              to="/data-engineering/$topic/$lesson"
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
