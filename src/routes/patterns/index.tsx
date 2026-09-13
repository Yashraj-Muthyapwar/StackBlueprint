import { createFileRoute } from "@tanstack/react-router";
import dsaLogo from "@/images/logos/dsa-logo.png";
import { TrackIndexLayout } from "@/components/learning-paths/TrackIndexLayout";
import { CATEGORY_BY_SLUG } from "@/lessons/roadmap";

export const Route = createFileRoute("/patterns/")({
  head: () => ({
    meta: [
      { title: "Patterns (DSA) — StackBlueprint" },
      {
        name: "description",
        content:
          "Interview-grade DSA patterns visualized step-by-step across arrays, strings, and hash maps.",
      },
      { property: "og:title", content: "Patterns (DSA) — StackBlueprint" },
      {
        property: "og:description",
        content: "Visual, animated DSA pattern lessons for interview-ready problem solving.",
      },
    ],
  }),
  component: PatternsIndex,
});

function PatternsIndex() {
  const category = CATEGORY_BY_SLUG["patterns-dsa"]!;

  return (
    <TrackIndexLayout
      title="DSA Patterns"
      blurb="Learn the repeatable problem-solving patterns behind great interview solutions, with code and visualizations that move together."
      logoSrc={dsaLogo}
      logoAlt="DSA Patterns Logo"
      sections={category.sections}
      patterns={category.patterns}
      basePath="/patterns"
    />
  );
}
