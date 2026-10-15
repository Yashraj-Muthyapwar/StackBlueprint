# Python execution and playgrounds

Python runs in the learner's browser through Pyodide WebAssembly. The server serves an isolated execution page; it does not execute learner Python.

## Isolation and lifecycle

`src/lib/python-sandbox.ts` queues requests and creates a new hidden iframe for each run. The iframe points at `/sandbox/python` and uses `sandbox="allow-scripts"`, without `allow-same-origin`. The route sends the same restriction in its enforced Content-Security-Policy. The frame and its blob worker have an opaque origin, separating them from the application's DOM, cookies, localStorage, sessionStorage, and IndexedDB.

The route permits scripts and network connections only to the pinned Pyodide distribution in `src/lib/python-sandbox-config.ts`. Package names are validated before loading through Pyodide's package loader. Arbitrary package URLs and network connections are blocked by CSP. The runtime's virtual filesystem is available during execution.

Each run gets a fresh interpreter and virtual filesystem. Definitions, files, modified built-ins, and scheduled JavaScript tasks do not carry over to another block, question, or run. Examples that need setup must include it in the same run. Browser HTTP caching can reuse downloaded runtime and package assets.

The iframe transfers a private MessagePort into the worker before learner code starts. The worker captures its native sending method inside a closure. Public worker `postMessage` messages terminate the run without being forwarded, so learner code cannot forge a completion message through Pyodide's JavaScript bridge. Both the iframe and parent validate the protocol, IDs, types, and limits. The parent additionally checks the frame's window and opaque origin.

On completion or failure, the iframe terminates its worker and closes the channel before reporting completion. The parent removes the iframe and listeners. The iframe has an execution watchdog, and the parent has a fallback deadline. Stop or cancellation removes the execution frame; queued cancellation settles immediately without waiting for another run. Runtime startup failures are recoverable because the next request creates a new frame and worker.

## Limits

The shared limits in `python-sandbox-config.ts` count UTF-16 characters rather than bytes.

| Resource                                        | Limit                                                   |
| ----------------------------------------------- | ------------------------------------------------------- |
| Learner code                                    | 100,000 characters                                      |
| Trusted prelude                                 | 50,000 characters                                       |
| Injected string variables                       | 16 variables; 200,000 characters combined               |
| Packages                                        | 16 validated names                                      |
| Combined stdout and stderr                      | 100,000 characters                                      |
| Output message                                  | 4,000 characters                                        |
| Result                                          | 2,000,000 characters                                    |
| Messages per run                                | 512                                                     |
| Waiting runs                                    | 8; one active run                                       |
| Frame startup                                   | 20 seconds                                              |
| Execution, runtime download and package loading | Up to 60 seconds; playground and grading use 30 seconds |

The worker batches output and stops reporting once its budget is exhausted. The iframe enforces an independent output and message budget before forwarding anything to React. Output callbacks receive chunks that already include their newlines. Exceeding output or result limits produces an execution error, rather than a successful truncated answer.

Browser workers do not provide a hard memory quota. A large allocation can exhaust browser memory before a watchdog fires, and background-tab timer throttling can delay a timeout. These limits protect normal interactive use and bound accepted messages; they do not provide server-grade resource guarantees for hostile programs.

## Lesson blocks and quizzes

`InteractivePythonBlock.tsx` uses CodeMirror, Run, Stop, Reset, and text-only terminal output. Reset and content changes cancel an active request. Unmounting cancels execution and prevents stale results from changing component state.

`Quiz.tsx` runs each answer and its test code together in a fresh interpreter. Expected output comparisons use the same captured output as before. Quizzes support stopping evaluation and cancel pending execution when their component is removed. Browser-side grading is a learning aid; learners control their browser and can inspect expected answers or modify client-side scores.

## Playground tracing

`PythonPlayground.tsx` submits the tracer prelude from `python-tracer.ts`, the source string, and a request for the serialized trace result. It supports Stop and cancellation on navigation or sample changes. It validates the returned JSON structure before the visualizer traverses it.

The tracer captures line, call, and return events with stack frames, local variables, object references, and stdout. Limits are:

- 400 snapshots and approximately 1,000,000 characters of serialized snapshots.
- 10,000 characters of captured stdout.
- 20 frames, 50 locals per frame, and 200 heap objects per snapshot.
- 50 entries per collection, depth 6, and 1,000 visited values per snapshot.

Cycles reuse object IDs. Large integers and nonfinite floats have display-safe representations. Collections are sampled without copying the whole collection. Playback, breakpoints, memory diffing, alias indicators, and prediction mode consume the checked snapshots.

## Verification

Run the regression suite from the repository root:

```sh
node --test scripts/python-sandbox/sandbox.test.mjs
npm run build
```

The regression suite uses mocked runtime dependencies to exercise the real generated worker/frame scripts and the client module. It covers message forgery, cleanup, request/output/result limits, timeouts, download recovery, queue bounds, immediate queued cancellation, callback failures, and invalid traces. Its tracer check uses local `python3` when available. It does not replace browser checks with real Pyodide.

Browser checks must cover normal execution, Pyodide package loading, forged public worker messages, storage denial, blocked off-allowlist network requests, output floods, timeouts, Stop, recovery, filesystem isolation, and tracing. Verify that no sandbox iframe remains after each completed run.

## Deployment

Deploy the TanStack Start server build, including the `/sandbox/python` GET handler. A static-files-only deployment cannot serve the execution endpoint correctly. Preserve `src/server.ts` and its security-header handling: it must retain the route's own CSP rather than replace it with the parent page's policy.

Before releasing on a hosting provider:

1. Verify `/sandbox/python` returns HTTP 200, HTML, enforced `Content-Security-Policy` with `sandbox allow-scripts`, the pinned CDN path, and `Cache-Control: no-store`.
2. Verify the hosting proxy does not strip or replace those headers and that the parent page permits its same-origin frame.
3. Repeat the browser checks on the staging deployment and supported Chrome, Firefox, and Safari versions, including a cold download and a failed download followed by retry.
4. Keep the Pyodide version pinned. Review a runtime upgrade and its compatibility separately; changing the version also changes the CSP allowlist.
