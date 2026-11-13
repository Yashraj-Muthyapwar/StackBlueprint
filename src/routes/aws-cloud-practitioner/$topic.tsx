import { Outlet, createFileRoute } from "@tanstack/react-router";
import { CATEGORY_BY_SLUG, sectionPatterns } from "@/lessons/roadmap";

export const Route = createFileRoute("/aws-cloud-practitioner/$topic")({
  head: ({ params }) => {
    const cat = CATEGORY_BY_SLUG["aws-cloud-practitioner"];
    const t =
      cat?.patterns.find((p) => p.slug === params.topic) ||
      cat?.sections?.flatMap(sectionPatterns).find((p) => p.slug === params.topic);
    if (!t) return { meta: [{ title: "Topic — AWS Cloud Practitioner" }] };
    return {
      meta: [
        { title: `${t.title} — AWS Cloud Practitioner` },
        { name: "description", content: t.blurb },
        { property: "og:title", content: `${t.title} — AWS Cloud Practitioner` },
        { property: "og:description", content: t.blurb },
      ],
    };
  },
  component: () => <Outlet />,
});
