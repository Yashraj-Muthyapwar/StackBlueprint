import { Link, createFileRoute } from "@tanstack/react-router";
import { useProgress } from "@/hooks/use-progress";
import { CATEGORY_BY_SLUG } from "@/lessons/roadmap";
import { LessonLayout } from "@/components/learning-paths/LessonLayout";

export const Route = createFileRoute("/ai-engineering/$topic/$lesson")({
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

  return (
    <LessonLayout
      trackTitle="AI Engineering"
      trackPath="/ai-engineering"
      basePath="/ai-engineering"
      topic={t as any}
      lesson={l}
      hasQuiz={false}
      isCompleted={isCompleted(l.slug)}
      onToggleComplete={() =>
        isCompleted(l.slug) ? markIncomplete(l.slug) : markComplete(l.slug)
      }
      isPlaceholder={true}
      sections={undefined}
      renderSection={() => null}
    />
  );
}
