import { createFileRoute } from "@tanstack/react-router";
import dataEngineeringLogo from "@/images/logos/data-engineering-logo.png";
import { CATEGORY_BY_SLUG } from "@/lessons/roadmap";
import { TrackIndexLayout } from "@/components/learning-paths/TrackIndexLayout";

export const Route = createFileRoute("/data-engineering/")({
  head: () => ({
    meta: [
      { title: "Data Engineering — StackBlueprint" },
      {
        name: "description",
        content: "Fundamentals of Data Engineering: Lifecycle, Architecture, and Storage.",
      },
      { property: "og:title", content: "Data Engineering — StackBlueprint" },
      {
        property: "og:description",
        content: "Core principles, lifecycle, architecture, and undercurrents of data engineering.",
      },
    ],
  }),
  component: DataEngineeringIndex,
});

function DataEngineeringIndex() {
  const category = CATEGORY_BY_SLUG["data-engineering"]!;

  return (
    <TrackIndexLayout
      title={category.title}
      blurb={category.blurb}
      logoSrc={dataEngineeringLogo}
      logoAlt="Data Engineering Logo"
      sections={category.sections}
      patterns={category.patterns}
      basePath="/data-engineering"
    />
  );
}
