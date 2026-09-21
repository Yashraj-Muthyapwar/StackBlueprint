import { Link, createFileRoute } from "@tanstack/react-router";
import { CATEGORY_BY_SLUG } from "@/lessons/roadmap";
import { ChapterIndexLayout } from "@/components/learning-paths/ChapterIndexLayout";

export const Route = createFileRoute("/docker/orchestration/$topic/")({
  component: DockerTopicPage,
});

function DockerTopicPage() {
  const { topic } = Route.useParams();
  const cat = CATEGORY_BY_SLUG["docker"];
  const t =
    cat?.patterns.find((p) => p.slug === topic) ||
    cat?.sections?.flatMap((s) => s.patterns).find((p) => p.slug === topic);

  return <ChapterIndexLayout trackTitle="Docker" trackPath="/docker" topic={t as any} />;
}
