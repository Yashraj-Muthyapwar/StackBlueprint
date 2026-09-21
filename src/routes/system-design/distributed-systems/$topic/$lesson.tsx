import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { LessonLayout } from "@/components/learning-paths/LessonLayout";
import { DISTRIBUTED_SYSTEMS_TOPICS } from "@/lessons/system-design/distributed-systems-content";
import { SectionRenderer } from "@/components/system-design/SectionRenderer";
import { useProgress } from "@/hooks/use-progress";

export const Route = createFileRoute("/system-design/distributed-systems/$topic/$lesson")({
  head: ({ params }) => {
    const t = DISTRIBUTED_SYSTEMS_TOPICS[params.topic];
    const l = t?.lessons.find((x) => x.slug === params.lesson);
    if (!t || !l) return { meta: [{ title: "Lesson — System Design" }] };
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
  const t = DISTRIBUTED_SYSTEMS_TOPICS[topic];
  const { isCompleted, markComplete, markIncomplete } = useProgress();
  const idx = t?.lessons.findIndex((x) => x.slug === lesson) ?? -1;
  const l = idx >= 0 ? t!.lessons[idx] : undefined;

  useEffect(() => {
    if (!l) return;
    const handleQuizPassed = () => {
      markComplete(l.slug);
    };
    window.addEventListener("quiz-passed", handleQuizPassed);
    return () => window.removeEventListener("quiz-passed", handleQuizPassed);
  }, [l, markComplete]);

  if (!t || !l) {
    return (
      <div className="px-6 py-16 text-center text-muted-foreground">
        Lesson not found.{" "}
        <Link to="/system-design" className="text-mint underline-offset-4 hover:underline">
          Back to System Design
        </Link>
      </div>
    );
  }

  const prev = idx > 0 ? t.lessons[idx - 1] : undefined;
  const next = idx < t.lessons.length - 1 ? t.lessons[idx + 1] : undefined;

  const hasQuiz = l.sections.some((s) => s.kind === "quiz");

  return (
    <LessonLayout
      trackTitle="Distributed Systems"
      trackPath="/system-design/distributed-systems"
      topic={t as any}
      lesson={l}
      hasQuiz={hasQuiz}
      isCompleted={isCompleted(l.slug)}
      onToggleComplete={() => (isCompleted(l.slug) ? markIncomplete(l.slug) : markComplete(l.slug))}
      sections={l.sections}
      renderSection={(s, onQuizActiveChange) => (
        <SectionRenderer section={s} onQuizActiveChange={onQuizActiveChange} />
      )}
    />
  );
}
