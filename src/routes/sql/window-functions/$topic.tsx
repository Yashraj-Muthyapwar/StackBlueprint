import { Outlet, createFileRoute } from "@tanstack/react-router";
import { WINDOW_FUNCTION_TOPICS } from "@/lessons/sql/window-functions-content";

export const Route = createFileRoute("/sql/window-functions/$topic")({
  head: ({ params }) => {
    const t = WINDOW_FUNCTION_TOPICS[params.topic];
    if (!t) return { meta: [{ title: "Window Functions — SQL Mastery" }] };
    return {
      meta: [
        { title: `${t.title} — Advanced SQL` },
        { name: "description", content: t.blurb },
        { property: "og:title", content: `${t.title} — Advanced SQL` },
        { property: "og:description", content: t.blurb },
      ],
    };
  },
  component: () => <Outlet />,
});
