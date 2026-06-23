import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/patterns/$pattern/")({
  component: () => {
    const { pattern } = Route.useParams();
    return <div style={{ padding: 40 }}>STUB IDX {pattern}</div>;
  },
});
