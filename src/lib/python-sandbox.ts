import { PYTHON_SANDBOX_PATH, PYTHON_LIMITS as LIMIT } from "./python-sandbox-config";

/** Runs are bounded, queued, and isolated from both the host page and other runs.
 * Each run discards its frame and interpreter, including after successful execution. */
export interface PythonRunOptions {
  code: string;
  packages?: string[];
  prelude?: string;
  vars?: Record<string, string>;
  wantResult?: boolean;
  timeoutMs?: number;
  signal?: AbortSignal;
  onStdout?: (text: string) => void;
  onStderr?: (text: string) => void;
  onStatus?: (message: string) => void;
}

export interface PythonRunResult {
  ok: boolean;
  result: string | null;
  error: string | null;
  stopped: "timeout" | "cancelled" | null;
}

const failure = (error: string): PythonRunResult => ({
  ok: false,
  result: null,
  error,
  stopped: null,
});
const stopped = (reason: "timeout" | "cancelled"): PythonRunResult => ({
  ok: false,
  result: null,
  error: null,
  stopped: reason,
});

function validate(opts: PythonRunOptions): string | null {
  if (typeof opts.code !== "string" || opts.code.length > LIMIT.code)
    return "Code limit reached (100,000 characters).";
  if (
    opts.prelude !== undefined &&
    (typeof opts.prelude !== "string" || opts.prelude.length > LIMIT.prelude)
  )
    return "Python prelude limit reached.";
  if (
    opts.timeoutMs !== undefined &&
    (!Number.isFinite(opts.timeoutMs) || opts.timeoutMs <= 0 || opts.timeoutMs > LIMIT.timeoutMs)
  )
    return "Invalid Python timeout.";
  if (
    opts.packages !== undefined &&
    (!Array.isArray(opts.packages) ||
      opts.packages.length > LIMIT.packages ||
      !opts.packages.every((p) => typeof p === "string" && /^[A-Za-z0-9_.-]{1,64}$/.test(p)))
  )
    return "Invalid Python packages.";
  if (opts.vars !== undefined) {
    if (!opts.vars || typeof opts.vars !== "object" || Array.isArray(opts.vars))
      return "Invalid Python variables.";
    const entries = Object.entries(opts.vars);
    if (
      entries.length > 16 ||
      !entries.every(
        ([k, v]) => /^[A-Za-z_][A-Za-z0-9_]{0,63}$/.test(k) && typeof v === "string",
      ) ||
      entries.reduce((n, [, v]) => n + v.length, 0) > LIMIT.vars
    )
      return "Python variable limit reached.";
  }
  return null;
}

let nextId = 1;
interface Job {
  opts: PythonRunOptions;
  resolve: (result: PythonRunResult) => void;
  unlisten: () => void;
}
const waiting: Job[] = [];
let busy = false;

function safeCall<T>(fn: ((value: T) => void) | undefined, value: T) {
  try {
    fn?.(value);
  } catch {
    /* UI callbacks must not break cleanup or scheduling. */
  }
}

async function runNow(opts: PythonRunOptions): Promise<PythonRunResult> {
  if (opts.signal?.aborted) return stopped("cancelled");
  return new Promise((resolve) => {
    const id = nextId++;
    let iframe: HTMLIFrameElement | null = null;
    let settled = false;
    let ready = false;
    let outputSize = 0;
    let messages = 0;
    let timer: number | undefined;
    const finish = (result: PythonRunResult) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      window.removeEventListener("message", onMessage);
      window.removeEventListener("pagehide", onAbort);
      opts.signal?.removeEventListener("abort", onAbort);
      iframe?.remove();
      resolve(result);
    };
    const onAbort = () => finish(stopped("cancelled"));
    const onMessage = (event: MessageEvent) => {
      if (settled || !iframe || event.source !== iframe.contentWindow || event.origin !== "null")
        return;
      const m = event.data;
      if (!m || typeof m !== "object") return;
      if (!ready && m.type === "ready") {
        ready = true;
        window.clearTimeout(timer);
        timer = window.setTimeout(
          () => finish(stopped("timeout")),
          (opts.timeoutMs ?? LIMIT.timeoutMs) + 1_000,
        );
        iframe.contentWindow?.postMessage(
          {
            type: "run",
            id,
            code: opts.code,
            packages: opts.packages ?? [],
            prelude: opts.prelude ?? "",
            vars: opts.vars ?? {},
            wantResult: Boolean(opts.wantResult),
            timeoutMs: opts.timeoutMs ?? LIMIT.timeoutMs,
          },
          "*",
        ); // Required for an opaque-origin recipient.
        return;
      }
      if (!ready || m.id !== id) return;
      if (++messages > LIMIT.messages) {
        finish(failure("Python message limit reached."));
        return;
      }
      if (m.type === "status" && typeof m.message === "string" && m.message.length <= 200)
        safeCall(opts.onStatus, m.message);
      else if (
        (m.type === "stdout" || m.type === "stderr") &&
        typeof m.text === "string" &&
        m.text.length <= LIMIT.chunk &&
        outputSize + m.text.length <= LIMIT.output
      ) {
        outputSize += m.text.length;
        safeCall(m.type === "stdout" ? opts.onStdout : opts.onStderr, m.text);
      } else if (
        m.type === "done" &&
        typeof m.ok === "boolean" &&
        (m.result === null || (typeof m.result === "string" && m.result.length <= LIMIT.result)) &&
        (m.error === null || (typeof m.error === "string" && m.error.length <= LIMIT.chunk)) &&
        (m.stopped === null || m.stopped === "timeout")
      ) {
        finish({ ok: m.ok, result: m.result, error: m.error, stopped: m.stopped });
      } else finish(failure("Invalid Python sandbox response."));
    };
    try {
      iframe = document.createElement("iframe");
      iframe.setAttribute("sandbox", "allow-scripts");
      iframe.setAttribute("aria-hidden", "true");
      iframe.setAttribute("tabindex", "-1");
      iframe.referrerPolicy = "no-referrer";
      iframe.title = "Python sandbox";
      iframe.style.cssText = "position:absolute;width:0;height:0;border:0;visibility:hidden";
      window.addEventListener("message", onMessage);
      window.addEventListener("pagehide", onAbort);
      opts.signal?.addEventListener("abort", onAbort, { once: true });
      iframe.addEventListener(
        "error",
        () => finish(failure("The Python sandbox failed to load.")),
        { once: true },
      );
      timer = window.setTimeout(
        () =>
          finish(failure("The Python sandbox did not start. Check your connection and try again.")),
        LIMIT.readyMs,
      );
      iframe.src = PYTHON_SANDBOX_PATH;
      document.body.appendChild(iframe);
    } catch {
      finish(failure("The Python sandbox could not start. Please try again."));
    }
  });
}

function drain() {
  if (busy) return;
  const job = waiting.shift();
  if (!job) return;
  busy = true;
  job.unlisten();
  runNow(job.opts)
    .catch(() => failure("Python execution failed. Please try again."))
    .then((result) => {
      busy = false;
      job.resolve(result);
      drain();
    });
}

/** Never rejects. Cancelling a queued run settles it immediately. */
export function runPython(opts: PythonRunOptions): Promise<PythonRunResult> {
  if (typeof window === "undefined")
    return Promise.resolve(failure("Python runs in the browser only."));
  if (opts.signal?.aborted) return Promise.resolve(stopped("cancelled"));
  const error = validate(opts);
  if (error) return Promise.resolve(failure(error));
  if (waiting.length >= LIMIT.queue)
    return Promise.resolve(failure("Too many Python runs are queued. Wait for a run to finish."));
  // Copy mutable inputs now so a queued request cannot change after validation.
  const request = { ...opts, packages: [...(opts.packages ?? [])], vars: { ...(opts.vars ?? {}) } };
  return new Promise((resolve) => {
    const abort = () => {
      const index = waiting.indexOf(job);
      if (index < 0) return;
      waiting.splice(index, 1);
      job.unlisten();
      resolve(stopped("cancelled"));
    };
    const job: Job = {
      opts: request,
      resolve,
      unlisten: () => {
        request.signal?.removeEventListener("abort", abort);
        window.removeEventListener("pagehide", abort);
      },
    };
    request.signal?.addEventListener("abort", abort, { once: true });
    window.addEventListener("pagehide", abort, { once: true });
    waiting.push(job);
    safeCall(opts.onStatus, "Queued…");
    drain();
  });
}

export function stoppedMessage(
  result: PythonRunResult,
  timeoutMs: number = LIMIT.timeoutMs,
): string {
  if (result.stopped === "timeout")
    return `Stopped after ${Math.round(timeoutMs / 1000)} seconds. Check for an infinite loop.`;
  if (result.stopped === "cancelled") return "Stopped.";
  return "";
}
