import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useProgress } from "@/hooks/use-progress";
import { CATEGORY_BY_SLUG } from "@/lessons/roadmap";
import { AI_ENGINEERING_TOPICS } from "@/lessons/ai-engineering/core-concepts-content";
import { SectionRenderer } from "@/components/ai-engineering/SectionRenderer";
import { LessonLayout } from "@/components/learning-paths/LessonLayout";

export const Route = createFileRoute("/ai-engineering/$topic/$lesson")({
  head: ({ params }) => {
    const content = AI_ENGINEERING_TOPICS[
      params.topic as keyof typeof AI_ENGINEERING_TOPICS
    ]?.lessons.find((item) => item.slug === params.lesson);
    return {
      meta: content
        ? [
            { title: `${content.title} · AI Engineering` },
            { name: "description", content: content.subtitle },
          ]
        : [],
    };
  },
  component: AIEngineeringLessonPage,
});

function AIEngineeringLessonPage() {
  const { topic, lesson } = Route.useParams();
  const { isCompleted, markComplete, markIncomplete } = useProgress();

  const cat = CATEGORY_BY_SLUG["ai-engineering"];
  const t =
    cat?.patterns.find((p) => p.slug === topic) ||
    cat?.sections?.flatMap((s) => s.patterns).find((p) => p.slug === topic);
  const idx = t?.lessons?.findIndex((x) => x.slug === lesson) ?? -1;
  const l = idx >= 0 ? t!.lessons![idx] : undefined;
  const content = AI_ENGINEERING_TOPICS[topic as keyof typeof AI_ENGINEERING_TOPICS]?.lessons.find(
    (item) => item.slug === lesson,
  );

  useEffect(() => {
    if (!l) return;
    const handleQuizPassed = () => markComplete(l.slug);
    window.addEventListener("quiz-passed", handleQuizPassed);
    return () => window.removeEventListener("quiz-passed", handleQuizPassed);
  }, [l, markComplete]);

  if (!t || !l) {
    return (
      <div className="px-6 py-16 text-center text-muted-foreground">
        Lesson not found.{" "}
        <Link to="/ai-engineering" className="text-rose-500 underline-offset-4 hover:underline">
          Back to AI Engineering
        </Link>
      </div>
    );
  }

  const hasQuiz = content?.sections.some((section) => section.kind === "quiz") ?? false;

  return (
    <LessonLayout
      trackTitle="AI Engineering"
      trackPath="/ai-engineering"
      basePath="/ai-engineering"
      topic={t}
      lesson={{ ...l, subtitle: content?.subtitle }}
      hasQuiz={hasQuiz}
      isCompleted={isCompleted(l.slug)}
      onToggleComplete={() => (isCompleted(l.slug) ? markIncomplete(l.slug) : markComplete(l.slug))}
      isPlaceholder={!content}
      sections={content?.sections}
      renderSection={(section, onQuizActiveChange) => (
        <SectionRenderer section={section} onQuizActiveChange={onQuizActiveChange} />
      )}
    />
  );
}
