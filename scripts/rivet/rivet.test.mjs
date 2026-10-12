import assert from "node:assert/strict";
import { test } from "node:test";
import vm from "node:vm";
import { build } from "esbuild";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as jsxRuntime from "react/jsx-runtime";

const tick = () => new Promise((resolve) => setImmediate(resolve));
const encoder = new TextEncoder();

class Clock {
  now = 1_800_000_000_000;
  timers = new Map();
  next = 0;
  setTimeout = (fn, ms) => {
    const id = ++this.next;
    this.timers.set(id, { fn, at: this.now + ms });
    return id;
  };
  clearTimeout = (id) => this.timers.delete(id);
  async advance(ms) {
    const end = this.now + ms;
    for (;;) {
      const next = [...this.timers]
        .filter(([, t]) => t.at <= end)
        .sort((a, b) => a[1].at - b[1].at)[0];
      if (!next) break;
      this.now = next[1].at;
      this.timers.delete(next[0]);
      next[1].fn();
      await tick();
    }
    this.now = end;
    await tick();
  }
  globals() {
    const clock = this;
    class ClockDate extends Date {
      static now() {
        return clock.now;
      }
    }
    return { Date: ClockDate, setTimeout: this.setTimeout, clearTimeout: this.clearTimeout };
  }
}

function storage() {
  const data = new Map();
  let deny = "";
  const api = new Proxy(
    {
      getItem(key) {
        if (deny === "read") throw Error("blocked");
        return data.get(key) ?? null;
      },
      setItem(key, value) {
        if (deny === "write") throw Error("blocked");
        data.set(key, String(value));
      },
      removeItem(key) {
        if (deny === "remove") throw Error("blocked");
        data.delete(key);
      },
    },
    {
      ownKeys() {
        if (deny === "enumerate") throw Error("blocked");
        return [...data.keys()];
      },
      getOwnPropertyDescriptor() {
        return { enumerable: true, configurable: true };
      },
    },
  );
  return {
    api,
    block: (operation) => {
      deny = operation;
    },
  };
}

function tabs() {
  const ls = storage();
  let tail = Promise.resolve();
  const locks = {
    request(_name, work) {
      const result = tail.then(work);
      tail = result.catch(() => {});
      return result;
    },
  };
  const make = () => {
    const clock = new Clock();
    const events = new Map();
    const window = {
      localStorage: ls.api,
      sessionStorage: storage().api,
      setTimeout: clock.setTimeout,
      clearTimeout: clock.clearTimeout,
      addEventListener(name, fn) {
        events.set(name, [...(events.get(name) ?? []), fn]);
      },
      location: { origin: "https://site.example" },
    };
    return {
      window,
      clock,
      navigator: { locks },
      fire: (name, event) => events.get(name)?.forEach((fn) => fn(event)),
      globals() {
        return { window, navigator: this.navigator, ...clock.globals() };
      },
    };
  };
  return { ls, make };
}

async function moduleAt(entry, globals = {}, production = false, actualReact = false) {
  const result = await build({
    ...(entry.includes("export ")
      ? { stdin: { contents: entry, resolveDir: process.cwd() } }
      : { entryPoints: [entry] }),
    bundle: true,
    write: false,
    platform: "node",
    format: "cjs",
    external: ["react", "@tanstack/react-router"],
    define: { "import.meta.env.PROD": String(production) },
    loader: { ".png": "dataurl", ".svg": "dataurl", ".jpg": "dataurl", ".webp": "dataurl" },
    logLevel: "silent",
  });
  const module = { exports: {} };
  vm.runInNewContext(result.outputFiles[0].text, {
    module,
    exports: module.exports,
    require: (id) => {
      if (id === "react")
        return actualReact ? React : { ...React, useSyncExternalStore: (_subscribe, get) => get() };
      if (id === "react/jsx-runtime") return jsxRuntime;
      if (id === "@tanstack/react-router")
        return {
          createFileRoute: () => (config) => config,
          Link: ({ to, children, ...props }) =>
            React.createElement("a", { ...props, href: to }, children),
        };
      throw Error(`Unexpected external module ${id}`);
    },
    Request,
    Response,
    Headers,
    URL,
    TextEncoder,
    TextDecoder,
    ReadableStream,
    DOMException,
    AbortController,
    crypto,
    btoa,
    console,
    setTimeout,
    clearTimeout,
    process: { env: {} },
    fetch: () => {
      throw Error("Tests must never call real providers");
    },
    ...globals,
  });
  return module.exports;
}

const historySource = "src/lib/rivet/history.ts";
const combined =
  'export * from "./src/lib/rivet/chat.ts"; export * from "./src/lib/rivet/history.ts"; export * from "./src/lib/rivet/settings.ts";';

test("a rejected browser lock blocks persistence and reports cleanup failure", async () => {
  const shared = tabs(),
    tab = shared.make();
  const h = await moduleAt(historySource, {
    ...tab.globals(),
    navigator: { locks: { request: () => Promise.reject(Error("blocked")) } },
  });
  const result = await h.clearThread("/lesson");
  assert.equal(result.ok, false);
  h.appendMessage("/lesson", "user", "private");
  await tab.clock.advance(400);
  assert.equal(shared.ls.api.getItem("rivet:chat:/lesson"), null);
});

test("chat first-token deadline aborts upstream and clears all timers", async () => {
  const tab = tabs().make();
  let aborted = false;
  const api = await moduleAt(combined, {
    ...tab.globals(),
    fetch: (_url, init) =>
      new Promise((_, reject) => {
        init.signal.addEventListener("abort", () => {
          aborted = true;
          reject(new DOMException("cancelled", "AbortError"));
        });
      }),
  });
  api.saveProviderKey("gemini", "DUMMY-TEST-KEY", "saved");
  api.appendMessage("/lesson", "user", "hello");
  const result = assert.rejects(async () => {
    for await (const _ of api.streamReply(
      "/lesson",
      { trackTitle: "Test", topicTitle: "Test", lessonTitle: "Test" },
      new AbortController().signal,
    )) {
    }
  }, /did not start answering in time/);
  await tab.clock.advance(45000);
  await result;
  assert.equal(aborted, true);
  assert.equal(tab.clock.timers.size, 0);
});

test("chat caps oversized output and marks it truncated", async () => {
  const tab = tabs().make();
  const api = await moduleAt(combined, {
    ...tab.globals(),
    fetch: async () =>
      new Response(
        `data: ${JSON.stringify({ candidates: [{ content: { parts: [{ text: "x".repeat(20000) }] }, finishReason: "STOP" }] })}\n\n`,
      ),
  });
  api.saveProviderKey("gemini", "DUMMY-TEST-KEY", "saved");
  api.appendMessage("/lesson", "user", "hello");
  let text = "",
    finish;
  for await (const part of api.streamReply(
    "/lesson",
    { trackTitle: "Test", topicTitle: "Test", lessonTitle: "Test" },
    new AbortController().signal,
  )) {
    if ("text" in part) text += part.text;
    else finish = part.finish;
  }
  assert.equal(text.length, 16000);
  assert.equal(finish, "length");
  await tab.clock.advance(400); // drain the separate history persistence debounce
  assert.equal(tab.clock.timers.size, 0);
});

test("cleared conversations cannot be resurrected by a stale tab, even before storage events arrive", async () => {
  const shared = tabs(),
    a = shared.make(),
    b = shared.make();
  const ha = await moduleAt(historySource, a.globals()),
    hb = await moduleAt(historySource, b.globals());
  ha.appendMessage("/lesson", "user", "private old message");
  await a.clock.advance(400);
  assert.equal(hb.getThread("/lesson").length, 1);
  const oldVersion = hb.threadVersion("/lesson");
  await ha.clearThread("/lesson");
  assert.ok(hb.threadVersion("/lesson") > oldVersion);
  hb.appendMessage("/lesson", "user", "new message");
  await b.clock.advance(400);
  assert.ok(!shared.ls.api.getItem("rivet:chat:/lesson").includes("private old"));
});

test("queued persistence and pagehide cannot undo a clear or history opt-out", async () => {
  const shared = tabs(),
    a = shared.make(),
    b = shared.make();
  const ha = await moduleAt(historySource, a.globals()),
    hb = await moduleAt(historySource, b.globals());
  hb.appendMessage("/lesson", "user", "pending secret");
  await ha.clearThread("/lesson");
  b.fire("pagehide");
  await tick();
  assert.equal(shared.ls.api.getItem("rivet:chat:/lesson"), null);
  hb.appendMessage("/lesson", "user", "another pending secret");
  await ha.setRememberConversations(false);
  b.fire("pagehide");
  await tick();
  assert.equal(shared.ls.api.getItem("rivet:chat:/lesson"), null);
  assert.equal(hb.useRememberConversations(), false);
});

test("clear-all stops queued writes and leaves history saving off across tabs", async () => {
  const shared = tabs(),
    a = shared.make(),
    b = shared.make();
  const ha = await moduleAt(historySource, a.globals()),
    hb = await moduleAt(historySource, b.globals());
  hb.appendMessage("/lesson", "user", "pending secret");
  await ha.clearAllRivetData();
  await b.clock.advance(400);
  assert.equal(shared.ls.api.getItem("rivet:chat:/lesson"), null);
  assert.equal(hb.getThread("/lesson").length, 0);
  assert.equal(hb.useRememberConversations(), false);
});

test("deletion failures are reported and old records stay invalid after reload", async () => {
  const shared = tabs(),
    a = shared.make();
  const h = await moduleAt(historySource, a.globals());
  h.appendMessage("/lesson", "user", "private text");
  await a.clock.advance(400);
  shared.ls.block("remove");
  const result = await h.clearThread("/lesson");
  assert.equal(result.ok, false);
  assert.match(result.message, /could not confirm removal/);
  assert.ok(h.useHistoryStorageError());
  const reloaded = await moduleAt(historySource, shared.make().globals());
  assert.equal(reloaded.getThread("/lesson").length, 0);
});

test("enumeration and preference failures never report successful cleanup", async () => {
  for (const operation of ["enumerate", "write", "read"]) {
    const shared = tabs(),
      tab = shared.make();
    const h = await moduleAt(historySource, tab.globals());
    shared.ls.block(operation);
    assert.equal((await h.clearAllRivetData()).ok, false);
    assert.equal(h.useRememberConversations(), false);
  }
});

test("browsers without cross-tab locks use memory-only history", async () => {
  const shared = tabs(),
    tab = shared.make();
  const h = await moduleAt(historySource, { ...tab.globals(), navigator: {} });
  h.appendMessage("/lesson", "user", "hello");
  await tab.clock.advance(400);
  assert.equal(shared.ls.api.getItem("rivet:chat:/lesson"), null);
  assert.equal(h.getThread("/lesson").length, 1);
  assert.match(h.useHistoryStorageError(), /stay in memory/);
});

test("history retention still caps persisted threads at 30 with tied timestamps", async () => {
  const shared = tabs(),
    tab = shared.make();
  const h = await moduleAt(historySource, tab.globals());
  for (let i = 0; i < 35; i++) h.appendMessage(`/lesson-${i}`, "user", "test");
  await tab.clock.advance(400);
  assert.equal(Object.keys(shared.ls.api).filter((k) => k.startsWith("rivet:chat:")).length, 30);
});

test("merged unanswered history stays bounded and keeps the newest question", async () => {
  const chat = await moduleAt("src/lib/rivet/chat.ts");
  const input = Array.from({ length: 40 }, (_, i) => ({
    id: i + 1,
    role: "user",
    text: "x".repeat(3990) + `latest-${i}`,
  }));
  const turns = chat.turnsForModel(input);
  assert.ok(turns.reduce((n, t) => n + t.content.length, 0) <= 16000);
  assert.ok(turns.at(-1).content.endsWith("latest-39"));
  assert.ok(turns.every((t) => t.content.length <= 4000));
});

test("quiz dividers and interrupted replies do not leak into resent history", async () => {
  const chat = await moduleAt("src/lib/rivet/chat.ts");
  const turns = chat.turnsForModel([
    { id: 1, role: "user", text: "old question" },
    { id: 2, role: "divider", text: "new attempt" },
    { id: 3, role: "user", text: "new question" },
    { id: 4, role: "rivet", text: "partial", status: "interrupted" },
  ]);
  assert.equal(turns.length, 1);
  assert.equal(turns[0].content, "new question");
});

test("whole prompts remain bounded even with large quiz results, links, and Unicode", async () => {
  const shared = tabs(),
    tab = shared.make();
  let sent;
  const api = await moduleAt(combined, {
    ...tab.globals(),
    fetch: async (_url, init) => {
      sent = JSON.parse(init.body);
      return new Response(
        'data: {"candidates":[{"content":{"parts":[{"text":"OK"}]},"finishReason":"STOP"}]}\n\n',
      );
    },
  });
  api.saveProviderKey("gemini", "DUMMY-TEST-KEY", "saved");
  api.appendMessage("/lesson", "user", "🧱".repeat(2000));
  const huge = "🧱".repeat(10000);
  for await (const part of api.streamReply(
    "/lesson",
    {
      trackTitle: huge,
      topicTitle: huge,
      lessonTitle: huge,
      lessonText: huge,
      quiz: {
        score: 0,
        total: 100,
        percentage: 0,
        items: Array.from({ length: 100 }, () => ({
          question: huge,
          userAnswer: huge,
          correctAnswer: huge,
          explanation: huge,
          correct: false,
        })),
      },
    },
    new AbortController().signal,
  ))
    assert.ok(part);
  const chars =
    sent.systemInstruction.parts[0].text.length +
    sent.contents.reduce((n, t) => n + t.parts[0].text.length, 0);
  assert.ok(chars <= api.MAX_REQUEST_CHARS);
});

test("pre-aborted chat and verification never start a provider request", async () => {
  const shared = tabs(),
    tab = shared.make();
  let requests = 0;
  const api = await moduleAt(combined, {
    ...tab.globals(),
    fetch: () => {
      requests++;
    },
  });
  const verifier = await moduleAt("src/lib/rivet/verify.ts");
  const aborted = new AbortController();
  aborted.abort();
  await assert.rejects(
    async () => {
      for await (const _ of api.streamReply("/lesson", {}, aborted.signal)) {
      }
    },
    { name: "AbortError" },
  );
  await assert.rejects(
    verifier.verifyProvider(
      {
        test: () => {
          requests++;
        },
      },
      "DUMMY",
      "",
      aborted.signal,
    ),
    { name: "AbortError" },
  );
  assert.equal(requests, 0);
});

test("stale completions cannot certify a replacement or re-added key", async () => {
  const tab = tabs().make(),
    api = await moduleAt("src/lib/rivet/settings.ts", tab.globals());
  api.saveProviderKey("gemini", "DUMMY-OLD-KEY", "saved");
  api.setProviderModel("gemini", "test-model");
  const old = api.providerKeyRevision("gemini");
  api.removeProviderKey("gemini");
  api.saveProviderKey("gemini", "DUMMY-OLD-KEY", "saved");
  api.markModelWorking("gemini", "test-model", old);
  assert.equal(api.getSettings().status.gemini.state, "saved");
  api.markModelWorking("gemini", "test-model", api.providerKeyRevision("gemini"));
  assert.equal(api.getSettings().status.gemini.state, "tested");
});

test("keys remain memory-only by default and clear-all does not reload failed removals", async () => {
  const shared = tabs(),
    tab = shared.make();
  const api = await moduleAt(combined, tab.globals());
  api.saveProviderKey("gemini", "DUMMY-TEST-KEY", "saved");
  assert.ok(!shared.ls.api.getItem("rivet:settings").includes("DUMMY-TEST-KEY"));
  api.setRememberKeys(true);
  assert.ok(shared.ls.api.getItem("rivet:settings").includes("DUMMY-TEST-KEY"));
  shared.ls.block("remove");
  assert.equal((await api.clearAllRivetData()).ok, false);
  assert.equal(api.getSettings().keys.gemini, undefined);
});

test("SSE decoding is invariant at every UTF-8 and CRLF chunk boundary", async () => {
  const parser = await moduleAt("src/lib/rivet/providers/stream.ts");
  for (const newline of ["\n", "\r", "\r\n"]) {
    const bytes = encoder.encode(
      `: comment${newline}data: first 🧱${newline}data: second${newline}${newline}data: [DONE]${newline}${newline}`,
    );
    for (let split = 1; split < bytes.length; split++) {
      const actual = [];
      const stream = new ReadableStream({
        start(c) {
          c.enqueue(bytes.slice(0, split));
          c.enqueue(bytes.slice(split));
          c.close();
        },
      });
      for await (const data of parser.sseData(stream)) actual.push(data);
      assert.deepEqual(actual, ["first 🧱\nsecond", "[DONE]"], `${newline} at byte ${split}`);
    }
  }
});

test("SSE rejects oversized events and cancels its reader", async () => {
  const parser = await moduleAt("src/lib/rivet/providers/stream.ts");
  let cancelled = false;
  const stream = new ReadableStream({
    start(c) {
      c.enqueue(encoder.encode("data: " + "x".repeat(1_000_001)));
    },
    cancel() {
      cancelled = true;
    },
  });
  await assert.rejects(async () => {
    for await (const _ of parser.sseData(stream)) {
    }
  }, /too large/);
  assert.equal(cancelled, true);
});

test("connection discovery, refresh, and cancellation have bounded lifetimes", async () => {
  const clock = new Clock(),
    verify = await moduleAt("src/lib/rivet/verify.ts", clock.globals());
  const provider = {
    name: "Mock",
    test: () => new Promise(() => {}),
    listModels: () => new Promise(() => {}),
  };
  const pending = assert.rejects(
    verify.verifyProvider(provider, "DUMMY", "", new AbortController().signal),
    /in time/,
  );
  await clock.advance(20000);
  await pending;
  assert.equal(clock.timers.size, 0);
  const refresh = assert.rejects(
    verify.discoverModels(provider, "DUMMY", "", new AbortController().signal),
    /in time/,
  );
  await clock.advance(20000);
  await refresh;
  const controller = new AbortController();
  const cancelled = assert.rejects(
    verify.verifyProvider(provider, "DUMMY", "", controller.signal),
    { name: "AbortError" },
  );
  controller.abort();
  await cancelled;
  assert.equal(clock.timers.size, 0);
});

test("midstream errors and incomplete streams are failures, with secrets redacted", async () => {
  for (const end of ['data: {"error":{"message":"DUMMY-SECRET-KEY failed"}}\n\n', ""]) {
    const provider = await moduleAt("src/lib/rivet/providers/openai.ts", {
      fetch: async () =>
        new Response('data: {"choices":[{"delta":{"content":"partial"}}]}\n\n' + end),
    });
    const ep = { name: "Mock", chatUrl: "https://example.test", headers: {} };
    await assert.rejects(
      async () => {
        for await (const _ of provider.streamOpenAI(ep, {
          key: "DUMMY-SECRET-KEY",
          model: "mock",
          system: "",
          turns: [],
        })) {
        }
      },
      (error) => !error.message.includes("DUMMY-SECRET-KEY"),
    );
  }
});

const relayHeaders = {
  "sec-fetch-site": "same-origin",
  authorization: "Bearer DUMMY-RELAY-KEY",
  "x-rivet-call": "models",
};

test("relay cancels stalled uploads and releases their concurrency slots", async () => {
  const clock = new Clock();
  let cancelled = false;
  const relay = await moduleAt("src/routes/api/rivet-proxy.ts", {
    ...clock.globals(),
    fetch: async () => new Response("{}"),
  });
  const body = new ReadableStream({
    cancel() {
      cancelled = true;
    },
  });
  const request = new Request("https://site.example/api/rivet-proxy", {
    method: "POST",
    headers: { ...relayHeaders, "x-rivet-call": "chat" },
    body,
    duplex: "half",
  });
  const pending = relay.Route.server.handlers.POST({ request });
  await clock.advance(5000);
  assert.equal((await pending).status, 408);
  assert.equal(cancelled, true);
  assert.equal(clock.timers.size, 0);
});
function request(headers = relayHeaders, options = {}) {
  return new Request("https://site.example/api/rivet-proxy", { headers, ...options });
}

test("relay releases unread responses on its independent total deadline", async () => {
  const clock = new Clock();
  let aborted = 0,
    cancelled = 0;
  const relay = await moduleAt("src/routes/api/rivet-proxy.ts", {
    ...clock.globals(),
    fetch: async (_url, init) => {
      init.signal.addEventListener("abort", () => aborted++);
      return new Response(
        new ReadableStream({
          start(c) {
            c.enqueue(encoder.encode("data: test\n\n"));
          },
          cancel() {
            cancelled++;
          },
        }),
      );
    },
  });
  const responses = [];
  for (let i = 0; i < 3; i++)
    responses.push(await relay.Route.server.handlers.GET({ request: request() }));
  await tick();
  const limited = await relay.Route.server.handlers.GET({ request: request() });
  assert.equal(limited.status, 429);
  await clock.advance(181000);
  assert.equal(aborted, 3);
  assert.equal(cancelled, 3);
  assert.equal(clock.timers.size, 0);
  const next = await relay.Route.server.handlers.GET({ request: request() });
  assert.equal(next.status, 200);
  await next.body.cancel();
  assert.equal(clock.timers.size, 0);
  for (const response of responses) await assert.rejects(response.text(), /deadline/);
});

test("relay disconnect and idle timeouts release slots and cancel upstream", async () => {
  const clock = new Clock();
  let cancels = 0;
  const relay = await moduleAt("src/routes/api/rivet-proxy.ts", {
    ...clock.globals(),
    fetch: async () =>
      new Response(
        new ReadableStream({
          cancel() {
            cancels++;
          },
        }),
      ),
  });
  const controller = new AbortController();
  const response = await relay.Route.server.handlers.GET({
    request: request(relayHeaders, { signal: controller.signal }),
  });
  controller.abort();
  await assert.rejects(response.text(), /cancelled/);
  assert.equal(clock.timers.size, 0);
  const idle = await relay.Route.server.handlers.GET({ request: request() });
  const result = assert.rejects(idle.text(), /stalled/);
  await clock.advance(30000);
  await result;
  assert.equal(cancels, 2);
  assert.equal(clock.timers.size, 0);
});

test("relay rejects invalid origins, arbitrary targets, malformed/oversized bodies and bounds tokens", async () => {
  const clock = new Clock();
  let sent, target;
  const relay = await moduleAt("src/routes/api/rivet-proxy.ts", {
    ...clock.globals(),
    fetch: async (url, init) => {
      target = url;
      sent = JSON.parse(init.body);
      return new Response("{}");
    },
  });
  const run = (req) => relay.Route.server.handlers[req.method]({ request: req });
  assert.equal(
    (await run(request({ ...relayHeaders, origin: "https://attacker.example" }))).status,
    403,
  );
  assert.equal((await run(request({ ...relayHeaders, "x-rivet-call": "unknown" }))).status, 400);
  assert.equal((await run(request(relayHeaders, { signal: AbortSignal.abort() }))).status, 499);
  const headers = { ...relayHeaders, "x-rivet-call": "chat" };
  assert.equal((await run(request(headers, { method: "POST", body: "{}" }))).status, 400);
  assert.equal(
    (await run(request(headers, { method: "POST", body: "x".repeat(256 * 1024 + 1) }))).status,
    413,
  );
  const valid = await run(
    request(headers, {
      method: "POST",
      body: JSON.stringify({
        model: "mock",
        messages: [{ role: "user", content: "hi" }],
        max_tokens: 99999,
        tools: [{ bad: true }],
      }),
    }),
  );
  await valid.text();
  assert.equal(sent.max_tokens, 4096);
  assert.equal(sent.tools, undefined);
  assert.equal(target, "https://integrate.api.nvidia.com/v1/chat/completions");
  assert.equal(clock.timers.size, 0);
});

test("production relay stays disabled until shared edge protection is explicitly configured", async () => {
  const relay = await moduleAt("src/routes/api/rivet-proxy.ts", {}, true);
  assert.equal((await relay.Route.server.handlers.GET({ request: request() })).status, 503);
  const disabled = await moduleAt(
    "src/routes/api/rivet-proxy.ts",
    { process: { env: { RIVET_RELAY_DISABLED: "1", RIVET_EDGE_RATE_LIMITED: "1" } } },
    true,
  );
  assert.equal((await disabled.Route.server.handlers.GET({ request: request() })).status, 503);
});

test("hostile model HTML and external or invented links remain inert", async () => {
  const renderer = await moduleAt(
    "src/components/rivet/RivetMarkdown.tsx",
    { window: { location: { origin: "https://site.example" } } },
    false,
    true,
  );
  const html = renderToStaticMarkup(
    React.createElement(renderer.RivetMarkdown, {
      text: '<script>alert(1)</script>\n\n<img src="https://attacker.example">\n\n[bad](javascript:alert(1)) [external](https://attacker.example) [unknown](/invented/lesson)',
    }),
  );
  assert.ok(!html.includes("<script"));
  assert.ok(!html.includes("<img"));
  assert.ok(!html.includes('href="https://attacker.example'));
  assert.ok(!html.includes('href="/invented/lesson'));
});

test("error-page recovery uses a link compatible with enforced CSP", async () => {
  const error = await moduleAt("src/lib/error-page.ts");
  assert.ok(!error.renderErrorPage().includes("onclick="));
  assert.match(error.renderErrorPage(), /href="">Try again/);
});
