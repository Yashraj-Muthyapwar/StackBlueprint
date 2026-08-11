import { Outlet, createFileRoute } from "@tanstack/react-router";
import { CATEGORY_BY_SLUG } from "@/lessons/roadmap";

export const Route = createFileRoute("/data-engineering/$topic")({
  head: ({ params }) => {
    const cat = CATEGORY_BY_SLUG["data-engineering"];
    const t = cat?.patterns.find((p) => p.slug === params.topic);
    if (!t) return { meta: [{ title: "Topic — Data Engineering" }] };
    return {
      meta: [
        { title: `${t.title} — Data Engineering` },
        { name: "description", content: t.blurb },
        { property: "og:title", content: `${t.title} — Data Engineering` },
        { property: "og:description", content: t.blurb },
      ],
    };
  },
  component: () => <Outlet />,
});
