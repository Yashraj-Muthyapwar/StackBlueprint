import { Outlet, createFileRoute } from "@tanstack/react-router";
import { CATEGORY_BY_SLUG } from "@/lessons/roadmap";

export const Route = createFileRoute("/data-warehouses/foundations/$topic")({
  head: ({ params }) => {
    const cat = CATEGORY_BY_SLUG["data-warehouses"];
    const t = cat?.patterns.find((p) => p.slug === params.topic) || cat?.sections?.flatMap(s => s.patterns).find(p => p.slug === params.topic);
    if (!t) return { meta: [{ title: "Topic — Data Warehouses" }] };
    return {
      meta: [
        { title: `${t.title} — Data Warehouses` },
        { name: "description", content: t.blurb },
        { property: "og:title", content: `${t.title} — Data Warehouses` },
        { property: "og:description", content: t.blurb },
      ],
    };
  },
  component: () => <Outlet />,
});
