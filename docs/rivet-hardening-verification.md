# Rivet hardening verification

Date: October 11, 2026.

The reproduced code defects from the production-readiness review have been fixed. This document records local verification; it does not certify a deployed hosting account or working provider credentials.

## Changes

- History persistence and privacy changes are serialized with Web Locks. Secret-free deletion generations invalidate stale threads before writing, including queued writes and page exit. History opt-out is checked again at persistence time. Browsers without cross-tab locks retain new conversations only in memory.
- Storage removal, enumeration, and preference-write failures return a cleanup result and show an alert. Clear-all clears in-memory credentials even when persisted removal fails, turns history saving off, and preserves only secret-free synchronization records.
- Relay streams have an independent total deadline that survives backpressure, an idle deadline, disconnect cancellation, a response-byte cap, and idempotent slot cleanup. Uploads remain bounded. Conflicting origin evidence is rejected.
- Merged history turns are clipped again while preserving the latest question. Lesson excerpts, quiz review, link lists, and the combined request have bounded sizes. The combined system prompt and resent conversation ceiling is 32,000 characters, not an exact provider token count.
- SSE parsing preserves CRLF state across network chunks. Verification and model discovery have deadlines, cancellation, and stale-result guards. Already-aborted requests do not start provider calls. Readiness updates require the same credential revision and model.
- The error page reload control works with CSP, and catastrophic error responses retain security headers. Rivet's launcher now has its focus ref attached, restoring keyboard focus after Escape.
- Eight unrelated TypeScript diagnostics in Python/SQL components and SQL lesson type imports were corrected without rewriting lesson content.
- Production NVIDIA is disabled until the operator confirms a shared edge rule with `RIVET_EDGE_RATE_LIMITED=1`. Runtime relay and build-time assistant disable switches support rollback.

## Passing verification

| Check | Result |
| --- | --- |
| `npm ci --dry-run --ignore-scripts --offline` | Package/lock compatibility passed; this is not a clean dependency download |
| `npm run typecheck` | Passed, zero diagnostics |
| `npm run lint:rivet` | Passed |
| `npm run test:rivet` | 27 assertion-based tests passed |
| `npm run build` | Passed |
| `npm run test:production` | All 330 recommendation destinations and the Python sandbox returned HTTP 200 with enforced CSP and matching inline nonces |
| Playwright against local production build | Panel/settings opened; Escape restored launcher focus; settings panel fit a 390 by 844 viewport |

The regression suite includes stale cross-tab writes, delayed privacy events, queued persistence/page exit, blocked storage and locks, retention ties, credential replacement, pre-aborted signals, first-token deadlines, reply caps, whole-prompt bounds, Unicode/chunked SSE parsing, provider stream errors, stalled uploads, unread relay responses, idle/disconnect cleanup, request validation, production relay gating, and hostile model markup.

CI runs type checking, focused lint, the assertion-based suite, the build, and production route/header checks. Tests use dummy keys and mocked providers.

## Required deployment acceptance

Follow `docs/rivet-production-release.md` before public launch. Successful generation and recovery with working keys for all four providers, shared edge enforcement, overwritten trusted-IP headers, deployed response streaming/disconnect handling, function duration, HTTPS/CSP, and host/tracing redaction remain unverified here. The relay enable flag is an operator assertion; it cannot install or prove a firewall rule.

Memory-only operation does not protect an entered key from a sufficiently privileged browser extension. Remembered keys are opt-in plaintext browser storage. Rivet renders model replies as inert React content and has no model tools, but prompt instructions cannot guarantee model accuracy or prevent every hostile instruction.

Local QA evidence is under `output/rivet-production-fix` and `output/playwright/rivet-review`; it is intentionally excluded from the source ZIP. No Git commit or GitHub push was made because this workspace has no Git metadata.
