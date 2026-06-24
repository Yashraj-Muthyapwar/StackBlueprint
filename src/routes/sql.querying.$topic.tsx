import { Outlet, createFileRoute } from "@tanstack/react-router";
import { QUERYING_TOPICS } from "@/lessons/sql/querying-content";

export const Route = createFileRoute("/sql/querying/$topic")({
  head: ({ params }) => {
    const t = QUERYING_TOPICS[params.topic];
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
