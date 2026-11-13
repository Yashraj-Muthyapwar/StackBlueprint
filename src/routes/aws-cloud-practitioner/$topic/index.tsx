import { createFileRoute } from "@tanstack/react-router";
import { CATEGORY_BY_SLUG, sectionPatterns } from "@/lessons/roadmap";
import { ChapterIndexLayout } from "@/components/learning-paths/ChapterIndexLayout";

export const Route = createFileRoute("/aws-cloud-practitioner/$topic/")({
  component: AwsTopicPage,
});

function AwsTopicPage() {
  const { topic } = Route.useParams();
  const cat = CATEGORY_BY_SLUG["aws-cloud-practitioner"];
  const t =
    cat?.patterns.find((p) => p.slug === topic) ||
    cat?.sections?.flatMap(sectionPatterns).find((p) => p.slug === topic);

  return (
    <ChapterIndexLayout
      trackTitle="AWS Cloud Practitioner"
      trackPath="/aws-cloud-practitioner"
      topic={t as any}
    />
  );
}
