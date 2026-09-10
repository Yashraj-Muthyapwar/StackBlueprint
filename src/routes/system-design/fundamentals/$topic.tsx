import { Outlet, createFileRoute } from "@tanstack/react-router";
import { FOUNDATIONS_TOPICS } from "@/lessons/system-design/foundations-content";

export const Route = createFileRoute("/system-design/foundations/$topic")({
  head: ({ params }) => {
    const t = FOUNDATIONS_TOPICS[params.topic];
    if (!t) return { meta: [{ title: "Foundations — System Design" }] };
    return {
      meta: [
        { title: `${t.title} — System Design Foundations` },
        { name: "description", content: t.blurb },
        { property: "og:title", content: `${t.title} — System Design Foundations` },
        { property: "og:description", content: t.blurb },
      ],
    };
  },
  component: () => <Outlet />,
});
