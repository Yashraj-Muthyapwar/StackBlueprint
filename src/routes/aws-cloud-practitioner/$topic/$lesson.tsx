import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { AWS_TOPICS } from "@/lessons/aws-cloud-practitioner/introduction-to-the-cloud-content";
import { SectionRenderer } from "@/components/aws-cloud-practitioner/SectionRenderer";
import { useProgress } from "@/hooks/use-progress";
import { CATEGORY_BY_SLUG, sectionPatterns } from "@/lessons/roadmap";
import { LessonLayout } from "@/components/learning-paths/LessonLayout";

export const Route = createFileRoute("/aws-cloud-practitioner/$topic/$lesson")({
  head: ({ params }) => {
    const content = AWS_TOPICS[params.topic]?.lessons.find(
      (item) => item.slug === params.lesson,
    );
    return {
      meta: content
        ? [
            { title: `${content.title} · AWS Cloud Practitioner` },
            { name: "description", content: content.subtitle },
          ]
        : [],
    };
  },
  component: AwsLessonPage,
});

function AwsLessonPage() {
  const { topic, lesson } = Route.useParams();
  const { isCompleted, markComplete, markIncomplete } = useProgress();

  const cat = CATEGORY_BY_SLUG["aws-cloud-practitioner"];
  const t =
    cat?.patterns.find((p) => p.slug === topic) ||
    cat?.sections?.flatMap(sectionPatterns).find((p) => p.slug === topic);
  const idx = t?.lessons?.findIndex((x) => x.slug === lesson) ?? -1;
  const l = idx >= 0 ? t!.lessons![idx] : undefined;

  const content = AWS_TOPICS[topic]?.lessons.find((item) => item.slug === lesson);
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
        <Link to="/aws-cloud-practitioner" className="text-mint underline-offset-4 hover:underline">
          Back to AWS Cloud Practitioner
        </Link>
      </div>
    );
  }

  return (
    <LessonLayout
      trackTitle="AWS Cloud Practitioner"
      trackPath="/aws-cloud-practitioner"
      basePath="/aws-cloud-practitioner"
      key={`${topic}/${lesson}`}
      topic={t}
      lesson={{ ...l, subtitle: content?.subtitle }}
      hasQuiz={content?.sections.some((section) => section.kind === "quiz") ?? false}
      isCompleted={isCompleted(l.slug)}
      onToggleComplete={() => (isCompleted(l.slug) ? markIncomplete(l.slug) : markComplete(l.slug))}
      isPlaceholder={!content || content.sections.length === 0}
      sections={content?.sections.length ? content.sections : undefined}
      renderSection={(section, onQuizActiveChange) => (
        <SectionRenderer section={section} onQuizActiveChange={onQuizActiveChange} />
      )}
    />
  );
}
