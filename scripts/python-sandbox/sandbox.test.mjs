import assert from "node:assert/strict";
import { test } from "node:test";
import fs from "node:fs";
import vm from "node:vm";
import { createRequire } from "node:module";
import { webcrypto } from "node:crypto";
import { MessageChannel } from "node:worker_threads";
import { spawnSync } from "node:child_process";

const require = createRequire(import.meta.url);
const ts = require("typescript");
function loadTs(path, globals = {}, imports = {}) {
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync(path, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const context = vm.createContext({
    exports,
    require: (name) => imports[name] ?? require(name),
    ...globals,
  });
  vm.runInContext(source, context);
  return exports;
}
const config = loadTs("src/lib/python-sandbox-config.ts");
const route = loadTs(
  "src/routes/sandbox/python.ts",
  { crypto: webcrypto, Response },
  {
    "@tanstack/react-router": { createFileRoute: () => (options) => options },
    "@/lib/python-sandbox-config": config,
  },
);
const response = route.Route.server.handlers.GET();
const html = await response.text();
const boot = html.match(/<script nonce="[^"]+">([\s\S]+)<\/script>/)[1];
const tick = () => new Promise((resolve) => setTimeout(resolve, 5));

async function iframeRun(code, options = {}) {
  const received = [];
  let resolveDone;
  const done = new Promise((resolve) => {
    resolveDone = resolve;
  });
  let terminated = false;
  let revoked = false;
  let publicMessages = 0;
  let handler;
  let workerSource;
  const parent = {
    postMessage(message) {
      received.push(message);
      if (message.type === "done") resolveDone(message);
    },
  };
  const workerErrors = [];
  class Worker {
    constructor() {
      const self = {};
      let stdout;
      const py = {
        setStdin() {},
        setStdout(options) {
          stdout = options.batched;
        },
        setStderr() {},
        globals: { set() {} },
        async loadPackage() {},
        async runPythonAsync(source) {
          if (source === "spoof")
            vm.runInContext('postMessage({type:"done",id:1,ok:true,result:"forged"})', thisContext);
          if (source === "flood") for (let i = 0; i < 100_001; i++) stdout("x");
          if (source === "large-result") return "x".repeat(config.PYTHON_LIMITS.result + 1);
          if (source === "hang") return new Promise(() => {});
          return "actual";
        },
      };
      const thisContext = vm.createContext({
        self,
        importScripts() {},
        loadPyodide: async () => {
          if (options.failBoot) throw new Error("temporary download failure");
          return py;
        },
        postMessage: (message) => {
          publicMessages++;
          this.onmessage?.({ data: message });
        },
      });
      vm.runInContext(workerSource, thisContext);
      this.self = self;
    }
    postMessage(data, ports) {
      this.self.onmessage({ data, ports }).catch((error) => workerErrors.push(error));
    }
    terminate() {
      terminated = true;
    }
  }
  const window = {
    parent,
    location: { ancestorOrigins: ["https://host.example"] },
    addEventListener(type, fn) {
      if (type === "message") handler = fn;
    },
  };
  vm.runInNewContext(boot, {
    window,
    Worker,
    MessageChannel,
    setTimeout,
    clearTimeout,
    Blob: class {
      constructor(parts) {
        workerSource = parts[0];
      }
    },
    URL: {
      createObjectURL() {
        return "blob:test";
      },
      revokeObjectURL() {
        revoked = true;
      },
    },
  });
  handler({
    source: parent,
    data: {
      type: "run",
      id: 1,
      code,
      prelude: "",
      vars: {},
      packages: [],
      wantResult: true,
      timeoutMs: 100,
      ...(options.request ?? {}),
    },
  });
  const result = await done;
  assert.equal(workerErrors.length, 0);
  return { result, received, terminated, revoked, publicMessages };
}

test("route enforces isolation, network allowlist and no-store caching", () => {
  const csp = response.headers.get("content-security-policy");
  assert.match(csp, /sandbox allow-scripts;/);
  assert.doesNotMatch(csp, /allow-same-origin/);
  assert.ok(csp.includes(`connect-src ${config.PYODIDE_INDEX_URL}`));
  assert.equal(response.headers.get("cache-control"), "no-store");
});
test("public worker messages cannot spoof completion and terminate their producer", async () => {
  const run = await iframeRun("spoof");
  assert.equal(run.publicMessages, 1);
  assert.equal(run.result.result, null);
  assert.equal(run.result.ok, false);
  assert.match(run.result.error, /Untrusted/);
  assert.equal(run.received.filter((m) => m.type === "done").length, 1);
  assert.equal(run.terminated, true);
  assert.equal(run.revoked, true);
});
test("print flood is bounded before crossing the frame boundary", async () => {
  const run = await iframeRun("flood");
  const output = run.received.filter((m) => m.type === "stdout");
  assert.ok(output.length < 30);
  assert.ok(output.reduce((n, m) => n + m.text.length, 0) <= config.PYTHON_LIMITS.output);
  assert.ok(output.every((m) => m.text.length <= config.PYTHON_LIMITS.chunk));
  assert.equal(run.result.ok, false);
  assert.match(run.result.error, /Output limit/);
  assert.equal(run.terminated, true);
});
test("oversized results fail without sending the large result", async () => {
  const run = await iframeRun("large-result");
  assert.equal(run.result.result, null);
  assert.match(run.result.error, /Result limit/);
});
test("frame watchdog terminates an unresponsive worker", async () => {
  const run = await iframeRun("hang");
  assert.equal(run.result.stopped, "timeout");
  assert.equal(run.terminated, true);
});
test("next run recovers after a failed runtime download", async () => {
  const failed = await iframeRun("print", { failBoot: true });
  assert.equal(failed.result.ok, false);
  assert.equal(failed.terminated, true);
  const recovered = await iframeRun("print");
  assert.equal(recovered.result.ok, true);
});
test("frame rejects oversized requests before creating a worker", async () => {
  const run = await iframeRun("x".repeat(config.PYTHON_LIMITS.code + 1));
  assert.equal(run.result.ok, false);
  assert.match(run.result.error, /Invalid Python run/);
});

function client() {
  const listeners = new Set();
  const frames = [];
  let mode = "hold";
  let failCreate = false;
  const window = {
    setTimeout,
    clearTimeout,
    addEventListener(type, fn) {
      if (type === "message") listeners.add(fn);
    },
    removeEventListener(type, fn) {
      if (type === "message") listeners.delete(fn);
    },
  };
  const send = (frame, data, origin = "null") => {
    for (const fn of listeners) fn({ source: frame.contentWindow, origin, data });
  };
  const document = {
    createElement() {
      if (failCreate) throw new Error("DOM unavailable");
      const frame = {
        setAttribute() {},
        style: {},
        addEventListener() {},
        remove() {
          this.removed = true;
        },
        contentWindow: {
          postMessage(request) {
            frame.request = request;
            if (mode === "done")
              queueMicrotask(() =>
                send(frame, {
                  type: "done",
                  id: request.id,
                  ok: true,
                  result: null,
                  error: null,
                  stopped: null,
                }),
              );
          },
        },
      };
      frames.push(frame);
      return frame;
    },
    body: {
      appendChild(frame) {
        queueMicrotask(() => send(frame, { type: "ready" }));
      },
    },
  };
  const api = loadTs(
    "src/lib/python-sandbox.ts",
    { window, document },
    { "./python-sandbox-config": config },
  );
  return {
    ...api,
    frames,
    send,
    listeners,
    setMode(value) {
      mode = value;
    },
    failCreate() {
      failCreate = true;
    },
  };
}
test("queued cancellation settles while active run remains queued; queue has a fixed bound", async () => {
  const c = client();
  const activeController = new AbortController();
  const active = c.runPython({ code: "", signal: activeController.signal });
  await tick();
  const controller = new AbortController();
  const queued = c.runPython({ code: "", signal: controller.signal });
  controller.abort();
  assert.equal((await queued).stopped, "cancelled");
  assert.equal(c.frames.length, 1);
  const waiting = Array.from({ length: config.PYTHON_LIMITS.queue }, () =>
    c.runPython({ code: "" }),
  );
  assert.match((await c.runPython({ code: "" })).error, /Too many/);
  c.setMode("done");
  activeController.abort();
  await active;
  await Promise.all(waiting);
  assert.ok(c.frames.every((f) => f.removed));
  assert.equal(c.listeners.size, 0);
});
test("host rejects forged/mismatched IDs and accepts only the expected frame origin", async () => {
  const c = client();
  const run = c.runPython({ code: "" });
  await tick();
  const frame = c.frames[0];
  const valid = {
    type: "done",
    id: frame.request.id,
    ok: true,
    result: "actual",
    error: null,
    stopped: null,
  };
  c.send(frame, { ...valid, id: null });
  c.send(frame, valid, "https://attacker.example");
  assert.equal(frame.removed, undefined);
  c.send(frame, valid);
  assert.equal((await run).result, "actual");
  assert.equal(frame.removed, true);
});
test("callback exceptions and DOM failures settle without leaking the frame", async () => {
  const c = client();
  c.setMode("done");
  assert.equal(
    (
      await c.runPython({
        code: "",
        onStatus() {
          throw new Error("UI failure");
        },
      })
    ).ok,
    true,
  );
  c.failCreate();
  assert.equal((await c.runPython({ code: "" })).ok, false);
  assert.equal(c.listeners.size, 0);
});
test("trace parser rejects malformed and oversized data", () => {
  const tracer = loadTs("src/lib/python-tracer.ts");
  assert.throws(() => tracer.parsePythonTrace('{"snapshots":[{"frames":null}]}'), /Invalid/);
  assert.throws(() => tracer.parsePythonTrace("x".repeat(2_000_001)), /too large/);
});
test("tracer bounds large output and preserves cyclic objects and nonfinite floats", (t) => {
  const tracer = loadTs("src/lib/python-tracer.ts");
  const result = spawnSync(
    "python3",
    [
      "-c",
      `import json, sys\nns={}\nexec(json.loads(sys.stdin.readline()), ns)\nprint(ns['_run_traced'](json.loads(sys.stdin.readline())))`,
    ],
    {
      input:
        JSON.stringify(tracer.TRACER_PY) +
        "\n" +
        JSON.stringify('a=[]\na.append(a)\nx=float("nan")\nprint("x"*100000)') +
        "\n",
      encoding: "utf8",
    },
  );
  if (result.error?.code === "ENOENT") {
    t.skip("python3 is required for the tracer check");
    return;
  }
  assert.equal(result.status, 0, result.stderr);
  const data = tracer.parsePythonTrace(result.stdout.trim());
  assert.ok(data.stdout.length <= 10_000);
  assert.ok(result.stdout.length < 1_050_000);
  assert.match(data.error, /output limit/);
  assert.ok(
    data.snapshots.some((snap) => Object.values(snap.heap).some((obj) => obj.type === "list")),
  );
});
