import { Outlet, createFileRoute } from "@tanstack/react-router";
import { FOUNDATION_TOPICS } from "@/lessons/sql/foundations-content";

export const Route = createFileRoute("/sql/foundations/$topic")({
  head: ({ params }) => {
    const t = FOUNDATION_TOPICS[params.topic];
    if (!t) return { meta: [{ title: "Foundations — SQL Mastery" }] };
    return {
      meta: [
        { title: `${t.title} — SQL Foundations` },
        { name: "description", content: t.blurb },
        { property: "og:title", content: `${t.title} — SQL Foundations` },
        { property: "og:description", content: t.blurb },
      ],
    };
  },
  component: () => <Outlet />,
});
