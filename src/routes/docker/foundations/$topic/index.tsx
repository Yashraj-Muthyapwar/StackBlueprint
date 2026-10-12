import { Link, createFileRoute } from "@tanstack/react-router";
import { CATEGORY_BY_SLUG, sectionPatterns } from "@/lessons/roadmap";
import { ChapterIndexLayout } from "@/components/learning-paths/ChapterIndexLayout";

export const Route = createFileRoute("/docker/foundations/$topic/")({
  component: DockerTopicPage,
});

function DockerTopicPage() {
  const { topic } = Route.useParams();
  const cat = CATEGORY_BY_SLUG["docker"];
  const t = cat?.patterns.find((p) => p.slug === topic) || cat?.sections?.flatMap(sectionPatterns).find(p => p.slug === topic);

  return (
    <ChapterIndexLayout
      trackTitle="Docker"
      trackPath="/docker"
      topic={t as any}
    />
  );
}
