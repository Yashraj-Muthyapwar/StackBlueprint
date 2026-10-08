// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { rivetLessonIndex } from "./scripts/rivet/build-lesson-index.mjs";

export default defineConfig({
  // Force-enable Nitro when Vercel is building the app, otherwise leave it alone
  nitro: !!process.env.VERCEL,

  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  
  vite: {
    // Keeps Rivet's list of linkable lessons in sync with src/lessons (dev start, file changes, build).
    plugins: [rivetLessonIndex()],
    build: {
      chunkSizeWarningLimit: 1000,
    },
    optimizeDeps: {
      exclude: ["@electric-sql/pglite", "@duckdb/duckdb-wasm", "sql.js"]
    }
  }
});
