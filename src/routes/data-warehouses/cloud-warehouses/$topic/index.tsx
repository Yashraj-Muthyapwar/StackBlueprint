import { Link, createFileRoute } from "@tanstack/react-router";
import { CATEGORY_BY_SLUG } from "@/lessons/roadmap";
import { ChapterIndexLayout } from "@/components/learning-paths/ChapterIndexLayout";

export const Route = createFileRoute("/data-warehouses/cloud-warehouses/$topic/")({
  component: DataWarehousesTopicPage,
});

function DataWarehousesTopicPage() {
  const { topic } = Route.useParams();
  const cat = CATEGORY_BY_SLUG["data-warehouses"];
  const t = cat?.patterns.find((p) => p.slug === topic) || cat?.sections?.flatMap(s => s.patterns).find(p => p.slug === topic);

  return (
    <ChapterIndexLayout
      trackTitle="Data Warehouses"
      trackPath="/data-warehouses"
      topic={t as any}
    />
  );
}
