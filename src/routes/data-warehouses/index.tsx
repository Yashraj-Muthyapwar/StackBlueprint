import { createFileRoute } from "@tanstack/react-router";
import dataWarehousesLogo from "@/images/logos/data-warehouses-logo.png";
import { CATEGORY_BY_SLUG } from "@/lessons/roadmap";
import { TrackIndexLayout } from "@/components/learning-paths/TrackIndexLayout";

export const Route = createFileRoute("/data-warehouses/")({
  head: () => ({
    meta: [
      { title: "Data Warehousing — StackBlueprint" },
      { name: "description", content: "Master data warehousing architectures." },
    ],
  }),
  component: DataWarehousesIndex,
});

function DataWarehousesIndex() {
  const category = CATEGORY_BY_SLUG["data-warehouses"]!;

  return (
    <TrackIndexLayout
      title={category.title}
      blurb={category.blurb}
      logoSrc={dataWarehousesLogo}
      logoAlt="Data Warehouses Logo"
      sections={category.sections}
      patterns={category.patterns}
      basePath="/data-warehouses"
    />
  );
}
