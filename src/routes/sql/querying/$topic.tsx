import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { QUERYING_TOPICS } from "@/lessons/sql/querying-content";

export const Route = createFileRoute("/sql/querying/$topic")({
  // Window functions moved to /sql/window-functions. Keep old links working.
  beforeLoad: ({ params, location }) => {
    if (params.topic === "window-functions") {
      const rest = location.pathname.split("/sql/querying/window-functions")[1] ?? "";
      const lesson = rest.replace(/^\//, "");
      throw redirect({
        href: lesson
          ? `/sql/window-functions/multi-dimensional-aggregations/${lesson}`
          : "/sql/window-functions/multi-dimensional-aggregations",
        replace: true,
      });
    }
  },
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
