import { useEffect } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useProgress } from "@/hooks/use-progress";
import { CATEGORY_BY_SLUG } from "@/lessons/roadmap";
import { FOUNDATION_TOPICS } from "@/lessons/docker/foundations-content";
import { IMAGES_CONTAINERS_TOPICS } from "@/lessons/docker/images-containers-content";
import { SectionRenderer } from "@/components/docker/SectionRenderer";

const ALL_DOCKER_TOPICS = {
  ...FOUNDATION_TOPICS,
  ...IMAGES_CONTAINERS_TOPICS,
};
import { LessonLayout } from "@/components/learning-paths/LessonLayout";

export const Route = createFileRoute("/docker/foundations/$topic/$lesson")({
  component: DockerLessonPage,
});

function DockerLessonPage() {
  const { topic, lesson } = Route.useParams();
  const { isCompleted, markComplete, markIncomplete } = useProgress();

  const cat = CATEGORY_BY_SLUG["docker"];
  const t =
    cat?.patterns.find((p) => p.slug === topic) ||
    cat?.sections?.flatMap((s) => s.patterns).find((p) => p.slug === topic);
  const idx = t?.lessons?.findIndex((x) => x.slug === lesson) ?? -1;
  const l = idx >= 0 ? t!.lessons![idx] : undefined;

  const content = ALL_DOCKER_TOPICS[topic]?.lessons.find((x) => x.slug === lesson);
  const hasQuiz = content?.sections.some((s) => s.kind === "quiz") ?? false;

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
        <Link to="/docker" className="text-mint underline-offset-4 hover:underline">
          Back to Docker
        </Link>
      </div>
    );
  }

  return (
    <LessonLayout
      trackTitle="Docker"
      trackPath="/docker"
      basePath="/docker/foundations"
      topic={t as any}
      lesson={l}
      hasQuiz={hasQuiz}
      isCompleted={isCompleted(l.slug)}
      onToggleComplete={() => (isCompleted(l.slug) ? markIncomplete(l.slug) : markComplete(l.slug))}
      isPlaceholder={!content}
      sections={content?.sections}
      renderSection={(s, onQuizActiveChange) => (
        <SectionRenderer section={s} onQuizActiveChange={onQuizActiveChange} />
      )}
    />
  );
}
