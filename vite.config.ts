import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";
import { rivetLessonIndex } from "./scripts/rivet/build-lesson-index.mjs";

const codemirrorPackages = [
  "@codemirror/state",
  "@codemirror/view",
  "@codemirror/language",
  "@codemirror/commands",
  "@codemirror/lint",
  "@codemirror/theme-one-dark",
  "@codemirror/lang-sql",
  "@codemirror/lang-python",
  "@uiw/react-codemirror",
];

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    dedupe: [
      ...codemirrorPackages,
      "react",
      "react-dom",
      "@tanstack/react-router",
      "@tanstack/react-start",
    ],
  },
  plugins: [
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    tanstackStart({ server: { entry: "server" } }),
    viteReact(),
    tailwindcss(),
    // Only build the Nitro server output when Vercel is building the app.
    ...(process.env.VERCEL ? [nitro()] : []),
    // Keeps Rivet's list of linkable lessons in sync with src/lessons (dev start, file changes, build).
    rivetLessonIndex(),
  ],
  server: {
    port: 8081,
  },
  build: {
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    exclude: ["@electric-sql/pglite", "@duckdb/duckdb-wasm", "sql.js"],
    include: codemirrorPackages,
  },
});
