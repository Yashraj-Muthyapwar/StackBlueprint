import { Link, createFileRoute } from "@tanstack/react-router";
import { Outlet } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

export const Route = createFileRoute("/patterns/two-pointers")({
  component: () => <Outlet />,
});
