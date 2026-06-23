import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/patterns/$pattern/$lesson")({
  component: () => {
    const { lesson } = Route.useParams();
    return <div style={{ padding: 40 }}>STUB {lesson}</div>;
  },
});
