import { Outlet, createFileRoute } from "@tanstack/react-router";
import { SPECIALIZED_TOPICS } from "@/lessons/sql/specialized-content";

export const Route = createFileRoute("/sql/specialized/$topic")({
  head: ({ params }) => {
    const t = SPECIALIZED_TOPICS[params.topic];
    if (!t) return { meta: [{ title: "Querying — SQL Mastery" }] };
    return {
      meta: [
        { title: `${t.title} — SQL Querying` },
        { name: "description", content: t.blurb },
        { property: "og:title", content: `${t.title} — SQL Querying` },
        { property: "og:description", content: t.blurb },
      ],
    };
  },
  component: () => <Outlet />,
});
