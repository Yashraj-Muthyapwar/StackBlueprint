# Rivet release instructions

The hardening changes fix the reproduced application defects. Release approval still requires the deployed provider and hosting checks below. A passing local build cannot verify account credentials or hosting configuration.

## Push the files

The delivery ZIP contains the changed source files with repository-relative paths. Extract it into your Git checkout, review the changes, and commit only the files in `FILES_TO_PUSH.txt`. Do not push `dist`, `node_modules`, local audit output, or the ZIP itself. This working folder has no Git metadata, so no commit or push was made here.

Run these checks from the repository root with Node 22:

```sh
npm ci
npm run typecheck
npm run lint:rivet
npm run test:rivet
npm run build
npm run test:production
```

CI runs the same Rivet assertions and production route/CSP checks. Unit tests mock providers and use dummy credentials; they do not spend API credits.

## Configure hosting before enabling NVIDIA

1. Configure a shared edge rate-limit rule on `/api/rivet-proxy`, covering both GET and POST, before requests reach the function. Start with 60 requests per client IP per minute and tune to measured legitimate demand. Check the host's firewall logs to verify the rule actually blocks a burst. Per-instance counters in the relay are additional safeguards, not shared limits.
2. Verify the platform overwrites its trusted client-IP header. On Vercel the relay uses `x-real-ip`. On another host set `RIVET_TRUSTED_IP_HEADER` only to a header that host overwrites. Do not point it at a client-controlled header.
3. Confirm streaming support and set the deployed function's maximum duration above Rivet's 180-second request deadline, for example 210 seconds or longer if supported by your plan. Check that the hosting adapter forwards disconnects and does not buffer the entire reply. Configure the generated Nitro server function using the platform's supported function settings.
4. Ensure request logging, tracing, and error reporting do not capture Authorization headers or request/response bodies. NVIDIA credentials pass through the relay transiently.
5. Confirm `CSP_REPORT_ONLY` is unset or is not `1`. Verify deployed HTML has an enforced nonce CSP and the Python sandbox keeps its opaque-origin sandbox policy. Serve over HTTPS.
6. After verifying steps 1 to 5, set `RIVET_EDGE_RATE_LIMITED=1` in the production environment and redeploy. Without this flag, production NVIDIA requests return 503. It is an operator assertion, not automatic verification of the firewall.

See [Vercel WAF rate limiting](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting) and [function duration configuration](https://vercel.com/docs/functions/configuring-functions/duration).

## Verify live behavior

Use a dedicated revocable key with the lowest practical quota for each provider: Gemini, Groq, OpenRouter, and NVIDIA. Send one question and a follow-up. Check Stop, panel close, lesson navigation, a revoked key, a rate-limited response, and interrupted connectivity. Confirm a failed setup returns control and can be cancelled.

Open the same lesson in two tabs. Clear its conversation in one and confirm the other does not restore it. Disable remembered conversations and check that neither tab persists new messages. Clear all data and verify remembered keys disappear in both tabs. Inspect error metrics without recording keys or conversation text. Check mobile and keyboard access, including returning focus to the launcher after Escape.

API keys are memory-only by default; opt-in remembered keys remain plaintext browser storage. A browser extension permitted on the site can capture keys. Prompt limits are bounded characters, not an exact token estimate for every provider. Rivet has no model tools and never executes reply HTML.

## Disable or roll back

- Set `RIVET_RELAY_DISABLED=1` and redeploy to disable the NVIDIA relay.
- Set `VITE_RIVET_ENABLED=false` and rebuild/redeploy to hide Rivet across lesson pages. Set the relay flag too if all assistant traffic should stop.
- If provider or error rates rise after launch, disable the affected functionality and investigate using metadata such as status code and latency. Keep credentials and prompt text out of telemetry.

History saving uses Web Locks to serialize privacy changes and persistence across tabs. Unsupported browsers keep new conversations in memory. Clear-all deliberately leaves history saving off and retains only secret-free preference/deletion records. Storage cleanup failures are surfaced; they may require clearing browser site data or revoking a provider key.
