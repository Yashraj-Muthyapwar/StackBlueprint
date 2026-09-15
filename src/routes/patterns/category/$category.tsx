import { createFileRoute, redirect } from "@tanstack/react-router";

// The category collections now live directly on the Patterns overview. Keep
// legacy category URLs working without maintaining a duplicate interface.
export const Route = createFileRoute("/patterns/category/$category")({
  beforeLoad: ({ params }) => {
    const anchorByCategory: Record<string, string> = {
      arrays: "arrays-matrix",
      strings: "strings",
      "hash-map": "hash-map",
    };
    throw redirect({ to: "/patterns", hash: anchorByCategory[params.category] });
  },
  component: () => null,
});
