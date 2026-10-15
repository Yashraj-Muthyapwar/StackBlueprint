import { Link, createFileRoute } from "@tanstack/react-router";
import { CATEGORY_BY_SLUG, sectionPatterns } from "@/lessons/roadmap";
import { ChapterIndexLayout } from "@/components/learning-paths/ChapterIndexLayout";

export const Route = createFileRoute("/data-engineering/$topic/")({
  component: DataEngineeringTopicPage,
});

function DataEngineeringTopicPage() {
  const { topic } = Route.useParams();
  const cat = CATEGORY_BY_SLUG["data-engineering"];
  const t = cat?.patterns.find((p) => p.slug === topic) || cat?.sections?.flatMap(sectionPatterns).find(p => p.slug === topic);

  return (
    <ChapterIndexLayout
      trackTitle="Data Engineering"
      trackPath="/data-engineering"
      topic={t as any}
    />
  );
}
