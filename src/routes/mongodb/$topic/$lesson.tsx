import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { MONGODB_TOPICS } from "@/lessons/mongodb/nosql-concepts-content";
import { SectionRenderer } from "@/components/mongodb/SectionRenderer";
import { useProgress } from "@/hooks/use-progress";
import { CATEGORY_BY_SLUG } from "@/lessons/roadmap";
import { LessonLayout } from "@/components/learning-paths/LessonLayout";

export const Route = createFileRoute("/mongodb/$topic/$lesson")({
  head: ({ params }) => {
    const content = MONGODB_TOPICS[params.topic]?.lessons.find(
      (item) => item.slug === params.lesson,
    );
    return {
      meta: content
        ? [
            { title: `${content.title} · MongoDB` },
            { name: "description", content: content.subtitle },
          ]
        : [],
    };
  },
  component: MongoDbLessonPage,
});

function MongoDbLessonPage() {
  const { topic, lesson } = Route.useParams();
  const { isCompleted, markComplete, markIncomplete } = useProgress();

  const cat = CATEGORY_BY_SLUG["mongodb"];
  const t =
    cat?.patterns.find((p) => p.slug === topic) ||
    cat?.sections?.flatMap((s) => s.patterns).find((p) => p.slug === topic);
  const idx = t?.lessons?.findIndex((x) => x.slug === lesson) ?? -1;
  const l = idx >= 0 ? t!.lessons![idx] : undefined;

  const content = MONGODB_TOPICS[topic]?.lessons.find((item) => item.slug === lesson);
  useEffect(() => {
    if (!l || !content?.sections.some((section) => section.kind === "quiz")) return;
    const handleQuizPassed = () => markComplete(l.slug);
    window.addEventListener("quiz-passed", handleQuizPassed);
    return () => window.removeEventListener("quiz-passed", handleQuizPassed);
  }, [l, content, markComplete]);

  if (!t || !l) {
    return (
      <div className="px-6 py-16 text-center text-muted-foreground">
        Lesson not found.{" "}
        <Link to="/mongodb" className="text-green-600 underline-offset-4 hover:underline">
          Back to MongoDB
        </Link>
      </div>
    );
  }

  return (
    <LessonLayout
      trackTitle="MongoDB"
      trackPath="/mongodb"
      basePath="/mongodb"
      key={`${topic}/${lesson}`}
      topic={t}
      lesson={{ ...l, subtitle: content?.subtitle }}
      hasQuiz={content?.sections.some((section) => section.kind === "quiz") ?? false}
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
