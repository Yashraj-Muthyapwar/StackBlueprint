import { useEffect } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useProgress } from "@/hooks/use-progress";
import { CATEGORY_BY_SLUG } from "@/lessons/roadmap";
import { FOUNDATION_TOPICS } from "@/lessons/data-engineering/foundations-content";
import { SectionRenderer } from "@/components/data-engineering/SectionRenderer";
import { LessonLayout } from "@/components/learning-paths/LessonLayout";

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

  return (
    <LessonLayout
      trackTitle="Data Engineering"
      trackPath="/data-engineering"
      topic={t as any}
      lesson={l}
      hasQuiz={hasQuiz}
      isCompleted={isCompleted(l.slug)}
      onToggleComplete={() => isCompleted(l.slug) ? markIncomplete(l.slug) : markComplete(l.slug)}
      showKeyTakeaways={lesson !== "data-landscape"}
      isPlaceholder={!content && lesson !== "data-landscape"}
    >
      {lesson === "data-landscape" ? (
        <>
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
        </>
      ) : content ? (
        <SectionRenderer sections={content.sections} />
      ) : null}
    </LessonLayout>
  );
}
