import { createFileRoute, Link } from "@tanstack/react-router";
import { useProgress } from "@/hooks/use-progress";
import { PANDAS_SECTIONS } from "../index";
import { LessonLayout } from "@/components/learning-paths/LessonLayout";

export const Route = createFileRoute("/pandas/$topic/$lesson")({
  component: PandasLessonPlaceholder,
});

function PandasLessonPlaceholder() {
  const { topic, lesson } = Route.useParams();
  const { isCompleted, markComplete, markIncomplete } = useProgress();

  const t = PANDAS_SECTIONS.flatMap((s) => s.patterns).find((p) => p.slug === topic);
  const idx = t?.lessons?.findIndex((x) => x.slug === lesson) ?? -1;
  const l = idx >= 0 ? t!.lessons![idx] : undefined;

  if (!t || !l) {
    return (
      <div className="px-6 py-16 text-center text-muted-foreground">
        Lesson not found.{" "}
        <Link to="/pandas" className="text-mint underline-offset-4 hover:underline">
          Back to Pandas
        </Link>
      </div>
    );
  }

  const lessonSlug = `${topic}-${lesson}`;

  return (
    <LessonLayout
      trackTitle="Pandas"
      trackPath="/pandas"
      topic={t as any}
      lesson={l}
      isCompleted={isCompleted(lessonSlug)}
      onToggleComplete={() =>
        isCompleted(lessonSlug) ? markIncomplete(lessonSlug) : markComplete(lessonSlug)
      }
      isPlaceholder={true}
    >
      {null}
    </LessonLayout>
  );
}
