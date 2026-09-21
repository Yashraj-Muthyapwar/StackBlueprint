import { createFileRoute } from "@tanstack/react-router";
import { CATEGORY_BY_SLUG } from "@/lessons/roadmap";
import { TrackIndexLayout } from "@/components/learning-paths/TrackIndexLayout";
import mongoDbLogo from "@/images/logos/MongoDB_Logomark_ForestGreen.png";

export const Route = createFileRoute("/mongodb/")({
  head: () => ({
    meta: [
      { title: "MongoDB — StackBlueprint" },
      {
        name: "description",
        content: "Master MongoDB: from NoSQL concepts to aggregations and Python integration.",
      },
      { property: "og:title", content: "MongoDB — StackBlueprint" },
      {
        property: "og:description",
        content:
          "Interactive, visual MongoDB roadmap: document model, CRUD operations, indexes, aggregation pipelines, and Python integration.",
      },
    ],
  }),
  component: MongoDbIndex,
});

function MongoDbIndex() {
  const category = CATEGORY_BY_SLUG["mongodb"]!;

  return (
    <TrackIndexLayout
      title={category.title}
      blurb={category.blurb}
      logoSrc={mongoDbLogo}
      logoAlt="MongoDB Logo"
      sections={category.sections}
      patterns={category.patterns}
      basePath="/mongodb"
    />
  );
}
