import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/patterns/$pattern")({
  component: () => <Outlet />,
});
