import assert from "node:assert/strict";
import vm from "node:vm";
import { createRequire } from "node:module";
import { build } from "esbuild";
import server from "../../dist/server/server.js";

const require = createRequire(import.meta.url);
const bundled = await build({
  stdin: {
    contents:
      'export { roadmap } from "./src/lessons/roadmap.ts"; export { isKnownLessonPath } from "./src/lib/rivet/sitemap.ts";',
    resolveDir: process.cwd(),
  },
  bundle: true,
  write: false,
  platform: "node",
  format: "cjs",
  external: ["react"],
  loader: { ".png": "dataurl", ".svg": "dataurl", ".jpg": "dataurl", ".webp": "dataurl" },
  logLevel: "silent",
});
const module = { exports: {} };
vm.runInNewContext(bundled.outputFiles[0].text, { module, exports: module.exports, require });
const paths = new Set(),
  seen = new Set();
function visit(value) {
  if (!value || typeof value !== "object" || seen.has(value)) return;
  seen.add(value);
  if (typeof value.path === "string" && module.exports.isKnownLessonPath(value.path))
    paths.add(value.path);
  Object.values(value).forEach(visit);
}
visit(module.exports.roadmap);
assert.ok(paths.size > 0, "No recommendation destinations were discovered");
for (const path of [...paths, "/sandbox/python"]) {
  const response = await server.fetch(new Request(`https://site.example${path}`));
  assert.equal(response.status, 200, `${path} must render`);
  const policy = response.headers.get("content-security-policy") ?? "";
  assert.match(policy, /'nonce-[^']+'/, `${path} must enforce nonce CSP`);
  assert.equal(response.headers.has("content-security-policy-report-only"), false);
  const html = await response.text();
  assert.ok(!html.includes("Lesson Content Coming Soon"), `${path} must have real content`);
  const nonce = policy.match(/'nonce-([^']+)'/)[1];
  for (const script of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (!script[1].includes("src="))
      assert.ok(
        script[1].includes(`nonce="${nonce}"`),
        `${path} inline script must have the response nonce`,
      );
  }
}
console.log(
  `Production smoke check passed: ${paths.size} recommendation routes, Python sandbox, and enforced CSP/nonces.`,
);
