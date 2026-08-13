import { Outlet, createFileRoute } from "@tanstack/react-router";
import { DISTRIBUTED_SYSTEMS_TOPICS } from "@/lessons/system-design/distributed-systems-content";

export const Route = createFileRoute("/system-design/distributed-systems/$topic")({
  head: ({ params }) => {
    const t = DISTRIBUTED_SYSTEMS_TOPICS[params.topic];
    if (!t) return { meta: [{ title: "Distributed Systems — System Design" }] };
    return {
      meta: [
        { title: `${t.title} — System Design` },
        { name: "description", content: t.blurb },
        { property: "og:title", content: `${t.title} — System Design` },
        { property: "og:description", content: t.blurb },
      ],
    };
  },
  component: () => <Outlet />,
});
