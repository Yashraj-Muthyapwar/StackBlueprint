import { createFileRoute } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import { SqlPlayground } from "@/components/sql-playground/SqlPlayground";

export const Route = createFileRoute("/sql-playground")({
  head: () => ({
    meta: [
      { title: "SQL Flow Lab — StackBlueprint" },
      {
        name: "description",
        content:
          "Write SQL against real PostgreSQL and DuckDB engines running in your browser. Five datasets including AdventureWorks, Olist and TPC-H, with per-engine query libraries, a live clause-by-clause row trace, and execution plans.",
      },
      { property: "og:title", content: "SQL Flow Lab — StackBlueprint" },
      {
        property: "og:description",
        content:
          "AdventureWorks, Olist, Bike Store and TPC-H, queried in the browser on PostgreSQL and DuckDB.",
      },
    ],
  }),
  component: SqlPlaygroundPage,
});

function SqlPlaygroundPage() {
  return (
    <ClientOnly
      fallback={
        <div className="grid h-[calc(100vh-3rem)] place-items-center font-mono text-xs text-muted-foreground">
          Loading SQL environment…
        </div>
      }
    >
      <div className="mx-auto h-[calc(100vh-3rem)] w-full max-w-[1600px] p-3 sm:p-4">
        <SqlPlayground />
      </div>
    </ClientOnly>
  );
}
