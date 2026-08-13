import { Outlet, createFileRoute } from "@tanstack/react-router";
import { FUNDAMENTALS_TOPICS } from "@/lessons/system-design/fundamentals-content";

export const Route = createFileRoute("/system-design/fundamentals/$topic")({
  head: ({ params }) => {
    const t = FUNDAMENTALS_TOPICS[params.topic];
    if (!t) return { meta: [{ title: "Fundamentals — System Design" }] };
    return {
      meta: [
        { title: `${t.title} — System Design Fundamentals` },
        { name: "description", content: t.blurb },
        { property: "og:title", content: `${t.title} — System Design Fundamentals` },
        { property: "og:description", content: t.blurb },
      ],
    };
  },
  component: () => <Outlet />,
});
