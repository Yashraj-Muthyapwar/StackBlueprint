import { createFileRoute } from "@tanstack/react-router";
import { CATEGORY_BY_SLUG, sectionPatterns } from "@/lessons/roadmap";
import { ChapterIndexLayout } from "@/components/learning-paths/ChapterIndexLayout";

export const Route = createFileRoute("/mongodb/$topic/")({
  component: MongoDbTopicPage,
});

function MongoDbTopicPage() {
  const { topic } = Route.useParams();
  const cat = CATEGORY_BY_SLUG["mongodb"];
  const t =
    cat?.patterns.find((p) => p.slug === topic) ||
    cat?.sections?.flatMap(sectionPatterns).find((p) => p.slug === topic);

  return (
    <ChapterIndexLayout
      trackTitle="MongoDB"
      trackPath="/mongodb"
      topic={t as any}
    />
  );
}
