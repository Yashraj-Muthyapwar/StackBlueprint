import { createFileRoute } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";

import { PythonPlayground } from "@/components/playground/PythonPlayground";

export const Route = createFileRoute("/playground")({
  head: () => ({
    meta: [
      { title: "Python Playground — DataVizCore" },
      {
        name: "description",
        content:
          "Interactive Python playground: write code on the left, watch the call stack, heap, and stdout update step by step on the right. Powered by Pyodide.",
      },
      { property: "og:title", content: "Python Playground — DataVizCore" },
      {
        property: "og:description",
        content: "Step through real CPython execution in your browser.",
      },
    ],
  }),
  component: PlaygroundPage,
});

function PlaygroundPage() {
  return (
    <ClientOnly
      fallback={
        <div className="grid h-[calc(100vh-3rem)] place-items-center font-mono text-xs text-muted-foreground">
          Loading playground…
        </div>
      }
    >
      <PythonPlayground />
    </ClientOnly>
  );
}
