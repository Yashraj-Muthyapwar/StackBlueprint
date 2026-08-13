import { Outlet, createFileRoute } from "@tanstack/react-router";
import { FOUNDATION_TOPICS } from "@/lessons/data-warehouses/foundations-content";

export const Route = createFileRoute("/data-warehouses/foundations/$topic")({
  head: ({ params }) => {
    const t = FOUNDATION_TOPICS[params.topic];
    if (!t) return { meta: [{ title: "Foundations — Data Warehouses" }] };
    return {
      meta: [
        { title: `${t.title} — Data Warehouses Foundations` },
        { name: "description", content: t.blurb },
        { property: "og:title", content: `${t.title} — Data Warehouses Foundations` },
        { property: "og:description", content: t.blurb },
      ],
    };
  },
  component: () => <Outlet />,
});
