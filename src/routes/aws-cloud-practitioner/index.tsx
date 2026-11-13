import { createFileRoute } from "@tanstack/react-router";
import { CATEGORY_BY_SLUG } from "@/lessons/roadmap";
import { TrackIndexLayout } from "@/components/learning-paths/TrackIndexLayout";
import { Cloud } from "lucide-react";

export const Route = createFileRoute("/aws-cloud-practitioner/")({
  head: () => ({
    meta: [
      { title: "AWS Cloud Practitioner — StackBlueprint" },
      {
        name: "description",
        content:
          "Prepare for the AWS Cloud Practitioner exam: cloud concepts, core services, security, pricing, and the Well-Architected Framework.",
      },
      { property: "og:title", content: "AWS Cloud Practitioner — StackBlueprint" },
      {
        property: "og:description",
        content: "A 13-module AWS Cloud Practitioner roadmap, from cloud basics to Well-Architected solutions.",
      },
    ],
  }),
  component: AwsCloudPractitionerIndex,
});

function AwsCloudPractitionerIndex() {
  const category = CATEGORY_BY_SLUG["aws-cloud-practitioner"]!;

  return (
    <TrackIndexLayout
      title={category.title}
      blurb={category.blurb}
      icon={Cloud}
      iconColor="text-amber-500"
      sections={category.sections}
      patterns={category.patterns}
      basePath="/aws-cloud-practitioner"
    />
  );
}
