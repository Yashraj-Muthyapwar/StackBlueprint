import { createFileRoute } from "@tanstack/react-router";
import { CATEGORY_BY_SLUG } from "@/lessons/roadmap";
import { TrackIndexLayout } from "@/components/learning-paths/TrackIndexLayout";

export const Route = createFileRoute("/ai-engineering/")({
  head: () => ({
    meta: [
      { title: "AI Engineering — StackBlueprint" },
      {
        name: "description",
        content:
          "Learn the fundamentals of Large Language Models and build your own AI applications.",
      },
      { property: "og:title", content: "AI Engineering — StackBlueprint" },
    ],
  }),
  component: AIEngineeringIndex,
});

function AIEngineeringIndex() {
  const category = CATEGORY_BY_SLUG["ai-engineering"]!;

  return (
    <TrackIndexLayout
      title={category.title}
      blurb={category.blurb}
      icon={category.icon}
      iconColor={category.iconColor}
      sections={category.sections}
      patterns={category.patterns}
      basePath="/ai-engineering"
    />
  );
}
