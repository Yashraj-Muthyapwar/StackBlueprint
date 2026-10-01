import { useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useProgress } from "@/hooks/use-progress";
import { PYTHON_SECTIONS } from "../index";
import { LessonLayout } from "@/components/learning-paths/LessonLayout";
import { FILE_HANDLING_TOPICS } from "@/lessons/python/file-handling-content";
import { OOP_TOPICS } from "@/lessons/python/oop-content";
import { BASICS_TOPICS } from "@/lessons/python/basics-content";
import { CONTROL_FLOW_TOPICS } from "@/lessons/python/control-flow-content";
import { DATA_STRUCTURES_TOPICS } from "@/lessons/python/data-structures-content";
import { FUNCTIONS_TOPICS } from "@/lessons/python/functions-content";
import { SectionRenderer } from "@/components/python/SectionRenderer";

export const Route = createFileRoute("/python/$topic/$lesson")({
  head: ({ params }) => {
    const t = PYTHON_SECTIONS.flatMap(s => s.patterns).find(p => p.slug === params.topic);
    const l = t?.lessons?.find((x) => x.slug === params.lesson);
    if (!t || !l) return { meta: [{ title: "Lesson — Python" }] };
    return {
      meta: [
        { title: `${l.title} — ${t.title}` },
        { name: "description", content: "Python lesson" },
        { property: "og:title", content: `${l.title} — ${t.title}` },
      ],
    };
  },
  component: PythonLessonPage,
});

const ALL_PYTHON_TOPICS: Record<string, any> = {
  ...BASICS_TOPICS,
  ...CONTROL_FLOW_TOPICS,
  ...DATA_STRUCTURES_TOPICS,
  ...FUNCTIONS_TOPICS,
  ...FILE_HANDLING_TOPICS,
  ...OOP_TOPICS,
};

function PythonLessonPage() {
  const { topic, lesson } = Route.useParams();
  const { isCompleted, markComplete, markIncomplete } = useProgress();
  
  const t = PYTHON_SECTIONS.flatMap(s => s.patterns).find(p => p.slug === topic);
  const idx = t?.lessons?.findIndex((x) => x.slug === lesson) ?? -1;
  const l = idx >= 0 ? t!.lessons![idx] : undefined;

  const content = ALL_PYTHON_TOPICS[topic]?.lessons.find((x: any) => x.slug === lesson);
  const hasQuiz = content?.sections.some((s: any) => s.kind === "quiz") ?? false;

  useEffect(() => {
    if (!l) return;
    const handleQuizPassed = () => {
      markComplete(lesson);
    };
    window.addEventListener("quiz-passed", handleQuizPassed);
    return () => window.removeEventListener("quiz-passed", handleQuizPassed);
  }, [l, topic, lesson, markComplete]);

  if (!t || !l) {
    return (
      <div className="px-6 py-16 text-center text-muted-foreground">
        Lesson not found.{" "}
        <Link to="/python" className="text-mint underline-offset-4 hover:underline">
          Back to Python
        </Link>
      </div>
    );
  }

  // Python lessons originally saved progress as "topic-lesson", while the
  // track cards and sidebar use the lesson slug. Keep recognizing the legacy
  // key so existing learner progress remains visible, but store new progress
  // with the shared lesson slug convention used across the application.
  const legacyLessonSlug = `${topic}-${lesson}`;
  const isLessonCompleted = isCompleted(lesson) || isCompleted(legacyLessonSlug);

  return (
    <LessonLayout
      trackTitle="Python"
      trackPath="/python"
      topic={t as any}
      lesson={l}
      hasQuiz={hasQuiz}
      isCompleted={isLessonCompleted}
      onToggleComplete={() => {
        if (isLessonCompleted) {
          markIncomplete(lesson);
          markIncomplete(legacyLessonSlug);
        } else {
          markComplete(lesson);
        }
      }}
      isPlaceholder={!content}
      sections={content?.sections}
      renderSection={(s, onQuizActiveChange, i) => <SectionRenderer section={s} onQuizActiveChange={onQuizActiveChange} index={i} />}
    >
      {null}
    </LessonLayout>
  );
}
