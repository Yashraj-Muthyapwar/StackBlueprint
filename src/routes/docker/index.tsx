import { createFileRoute } from "@tanstack/react-router";
import dockerLogo from "@/images/logos/docker-logo.png";
import { CATEGORY_BY_SLUG } from "@/lessons/roadmap";
import { TrackIndexLayout } from "@/components/learning-paths/TrackIndexLayout";

export const Route = createFileRoute("/docker/")({
  head: () => ({
    meta: [
      { title: "Docker — StackBlueprint" },
      { name: "description", content: "Master containerization with Docker." },
    ],
  }),
  component: DockerIndex,
});

function DockerIndex() {
  const category = CATEGORY_BY_SLUG["docker"]!;

  return (
    <TrackIndexLayout
      title={category.title}
      blurb={category.blurb}
      logoSrc={dockerLogo}
      logoAlt="Docker Logo"
      sections={category.sections}
      patterns={category.patterns}
      basePath="/docker"
    />
  );
}
