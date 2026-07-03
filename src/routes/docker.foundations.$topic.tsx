import { Outlet, createFileRoute } from "@tanstack/react-router";
import { FOUNDATION_TOPICS } from "@/lessons/docker/foundations-content";

export const Route = createFileRoute("/docker/foundations/$topic")({
  head: ({ params }) => {
    const t = FOUNDATION_TOPICS[params.topic];
    if (!t) return { meta: [{ title: "Foundations — Docker" }] };
    return {
      meta: [
        { title: `${t.title} — Docker Foundations` },
        { name: "description", content: t.blurb },
        { property: "og:title", content: `${t.title} — Docker Foundations` },
        { property: "og:description", content: t.blurb },
      ],
    };
  },
  component: () => <Outlet />,
});
