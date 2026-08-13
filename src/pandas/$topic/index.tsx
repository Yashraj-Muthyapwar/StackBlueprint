import { createFileRoute } from "@tanstack/react-router";
import { PANDAS_SECTIONS } from "../index";
import { ChapterIndexLayout } from "@/components/learning-paths/ChapterIndexLayout";

export const Route = createFileRoute("/pandas/$topic/")({
  component: PandasTopicPage,
});

function PandasTopicPage() {
  const { topic } = Route.useParams();
  const t = PANDAS_SECTIONS.flatMap((s) => s.patterns).find((p) => p.slug === topic);

  return (
    <ChapterIndexLayout
      trackTitle="Pandas"
      trackPath="/pandas"
      topic={t as any}
    />
  );
}
