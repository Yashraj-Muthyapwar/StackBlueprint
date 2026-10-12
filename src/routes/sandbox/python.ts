import { createFileRoute } from "@tanstack/react-router";
import { PYODIDE_INDEX_URL, PYTHON_LIMITS } from "@/lib/python-sandbox-config";

/** Each run uses an opaque-origin frame and a disposable worker. Only a private
 * MessagePort can report completion; public worker messages terminate the run. */
const WORKER_SOURCE = String.raw`
(() => {
  "use strict";
  const INDEX = ${JSON.stringify(PYODIDE_INDEX_URL)};
  const LIMIT = ${JSON.stringify(PYTHON_LIMITS)};
  const slice = Function.call.bind(String.prototype.slice);
  const toString = String;
  const minimum = Math.min;
  self.onmessage = async (event) => {
    const port = event.ports[0];
    if (!port) return;
    self.onmessage = null;
    // Capture the native method before any learner JavaScript can change it.
    const send = port.postMessage.bind(port);
    const m = event.data;
    const id = m.id;
    let completed = false;
    let outputSize = 0;
    let pending = "";
    let pendingType = "stdout";
    const flush = () => {
      while (pending.length) {
        const text = slice(pending, 0, LIMIT.chunk);
        pending = slice(pending, LIMIT.chunk);
        send({ type: pendingType, id, text });
      }
    };
    const finish = (ok, result = null, error = null) => {
      if (completed) return;
      completed = true;
      flush();
      send({ type: "done", id, ok, result, error });
    };
    const output = (type, value) => {
      if (completed) return;
      const text = value + "\n";
      if (pendingType !== type) flush();
      pendingType = type;
      const remaining = LIMIT.output - outputSize;
      pending += slice(text, 0, remaining);
      outputSize += minimum(text.length, remaining);
      if (pending.length >= LIMIT.chunk) flush();
      if (text.length > remaining) {
        finish(false, null, "Output limit reached. Reduce the amount printed.");
        throw new Error("Output limit reached");
      }
    };
    try {
      send({ type: "status", id, message: "Downloading Python runtime…" });
      importScripts(INDEX + "pyodide.js");
      send({ type: "status", id, message: "Starting Python…" });
      const py = await loadPyodide({ indexURL: INDEX });
      py.setStdin({ error: true });
      if (m.packages.length) {
        send({ type: "status", id, message: "Loading packages…" });
        await py.loadPackage(m.packages, { messageCallback() {}, errorCallback() {} });
      }
      py.setStdout({ batched: (text) => output("stdout", text) });
      py.setStderr({ batched: (text) => output("stderr", text) });
      for (const [key, value] of Object.entries(m.vars)) py.globals.set(key, value);
      if (m.prelude) await py.runPythonAsync(m.prelude);
      send({ type: "status", id, message: "running" });
      let value;
      try {
        value = await py.runPythonAsync(m.code);
        const result = m.wantResult && value != null ? toString(value) : null;
        if (result !== null && result.length > LIMIT.result)
          finish(false, null, "Result limit reached. Use a smaller example.");
        else finish(true, result);
      } finally {
        if (value && typeof value.destroy === "function") value.destroy();
      }
    } catch (error) {
      finish(false, null, slice(toString(error), 0, LIMIT.chunk));
    }
  };
})();
`;

const BOOT_SOURCE = String.raw`
(() => {
  "use strict";
  const LIMIT = ${JSON.stringify(PYTHON_LIMITS)};
  const parentWin = window.parent;
  if (parentWin === window) return;
  const ancestors = window.location.ancestorOrigins;
  const target = ancestors && ancestors.length ? ancestors[0] : "*";
  const send = (msg) => parentWin.postMessage(msg, target);
  let started = false;
  let ended = false;
  let worker = null;
  let port = null;
  let url = null;
  let timer;
  let id;
  let outputSize = 0;
  let messages = 0;
  const cleanup = () => {
    clearTimeout(timer);
    if (worker) worker.terminate();
    if (port) port.close();
    if (url) URL.revokeObjectURL(url);
  };
  const finish = (ok, result = null, error = null, stopped = null) => {
    if (ended) return;
    ended = true;
    // Terminate first, even on success: no timers, tasks or Python state survive.
    cleanup();
    send({ type: "done", id, ok, result, error, stopped });
  };
  window.addEventListener("pagehide", cleanup);
  window.addEventListener("message", (event) => {
    if (event.source !== parentWin || started) return;
    const m = event.data;
    if (!m || m.type !== "run" || !Number.isSafeInteger(m.id) || m.id <= 0) return;
    id = m.id;
    started = true;
    const valid = typeof m.code === "string" && m.code.length <= LIMIT.code &&
      typeof m.prelude === "string" && m.prelude.length <= LIMIT.prelude &&
      typeof m.wantResult === "boolean" &&
      Number.isFinite(m.timeoutMs) && m.timeoutMs > 0 && m.timeoutMs <= LIMIT.timeoutMs &&
      Array.isArray(m.packages) && m.packages.length <= LIMIT.packages &&
      m.packages.every((p) => typeof p === "string" && /^[A-Za-z0-9_.-]{1,64}$/.test(p)) &&
      m.vars && typeof m.vars === "object" && !Array.isArray(m.vars) &&
      Object.keys(m.vars).length <= 16 && Object.entries(m.vars).every(([k,v]) =>
        /^[A-Za-z_][A-Za-z0-9_]{0,63}$/.test(k) && typeof v === "string") &&
      Object.values(m.vars).reduce((n,v) => n + v.length, 0) <= LIMIT.vars;
    if (!valid) { finish(false, null, "Invalid Python run request."); return; }
    timer = setTimeout(() => finish(false, null, null, "timeout"), m.timeoutMs);
    try {
      url = URL.createObjectURL(new Blob([${JSON.stringify(WORKER_SOURCE)}], { type: "text/javascript" }));
      worker = new Worker(url);
      const channel = new MessageChannel();
      port = channel.port1;
      port.onmessage = (event) => {
        if (ended) return;
        if (++messages > LIMIT.messages) { finish(false, null, "Python message limit reached."); return; }
        const data = event.data;
        if (!data || data.id !== id) { finish(false, null, "Invalid Python response."); return; }
        if (data.type === "stdout" || data.type === "stderr") {
          if (typeof data.text !== "string" || data.text.length > LIMIT.chunk ||
              outputSize + data.text.length > LIMIT.output) {
            finish(false, null, "Python output limit reached."); return;
          }
          outputSize += data.text.length;
          send({ type: data.type, id, text: data.text });
        } else if (data.type === "status" && typeof data.message === "string") {
          send({ type: "status", id, message: data.message.slice(0, 200) });
        } else if (data.type === "done" && typeof data.ok === "boolean" &&
                   (data.result === null || (typeof data.result === "string" && data.result.length <= LIMIT.result)) &&
                   (data.error === null || (typeof data.error === "string" && data.error.length <= LIMIT.chunk))) {
          finish(data.ok, data.result, data.error);
        } else finish(false, null, "Invalid Python response.");
      };
      port.onmessageerror = () => finish(false, null, "Unreadable Python response.");
      worker.onerror = (event) => {
        event.preventDefault();
        finish(false, null, "The Python runtime failed. Please try again.");
      };
      // Never forward public messages. Stop their producer before it can flood the frame.
      worker.onmessage = () => finish(false, null, "Untrusted Python worker message blocked.");
      worker.postMessage(m, [channel.port2]);
    } catch (_) {
      finish(false, null, "This browser cannot start an isolated Python worker. Please try a supported browser.");
    }
  });
  send({ type: "ready" });
})();
`;

function sandboxResponse(): Response {
  const nonce = crypto.randomUUID().replace(/-/g, "");
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Python sandbox</title></head><body><script nonce="${nonce}">${BOOT_SOURCE}</script></body></html>`;
  const csp = [
    "sandbox allow-scripts",
    "default-src 'none'",
    `script-src 'nonce-${nonce}' 'unsafe-eval' 'wasm-unsafe-eval' ${PYODIDE_INDEX_URL}`,
    `connect-src ${PYODIDE_INDEX_URL}`,
    "worker-src blob:",
    "frame-ancestors 'self'",
    "base-uri 'none'",
    "form-action 'none'",
  ].join("; ");
  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "content-security-policy": csp,
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      "referrer-policy": "no-referrer",
    },
  });
}

export const Route = createFileRoute("/sandbox/python")({
  server: { handlers: { GET: () => sandboxResponse() } },
});
