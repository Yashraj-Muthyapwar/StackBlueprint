/** Pinned Pyodide build. Changing it also changes the sandbox page's CSP allowlist. */
export const PYODIDE_VERSION = "0.26.4";
export const PYODIDE_INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;
export const PYTHON_SANDBOX_PATH = "/sandbox/python";

/** Bounds are checked before crossing each message boundary. Counts are UTF-16 characters. */
export const PYTHON_LIMITS = {
  code: 100_000,
  prelude: 50_000,
  vars: 200_000,
  packages: 16,
  output: 100_000,
  chunk: 4_000,
  result: 2_000_000,
  messages: 512,
  queue: 8,
  timeoutMs: 60_000,
  readyMs: 20_000,
} as const;
