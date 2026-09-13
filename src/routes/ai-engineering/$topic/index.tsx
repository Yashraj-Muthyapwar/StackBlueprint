import { createFileRoute } from "@tanstack/react-router";
import { CATEGORY_BY_SLUG } from "@/lessons/roadmap";
import { ChapterIndexLayout } from "@/components/learning-paths/ChapterIndexLayout";

export const Route = createFileRoute("/ai-engineering/$topic/")({
  component: AIEngineeringTopicPage,
});

function AIEngineeringTopicPage() {
  const { topic } = Route.useParams();
  const cat = CATEGORY_BY_SLUG["ai-engineering"];
  const t =
    cat?.patterns.find((p) => p.slug === topic) ||
    cat?.sections?.flatMap((s) => s.patterns).find((p) => p.slug === topic);

  return (
    <ChapterIndexLayout trackTitle="AI Engineering" trackPath="/ai-engineering" topic={t as any} />
  );
}
