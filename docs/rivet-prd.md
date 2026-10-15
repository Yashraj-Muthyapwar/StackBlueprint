# Rivet: the StackBlueprint AI Tutor (PRD v1.1)

Status: **phases 0 to 2 are built. Rivet streams real answers from Google Gemini, Groq, NVIDIA (via a relay) and OpenRouter, using the learner's own key, with per-lesson history, lesson grounding and quiz-aware tutoring. The October 11 hardening fixes cross-tab deletion, failed-cleanup reporting, relay response deadlines, prompt bounds, split CRLF parsing, setup timeouts, and stale credential readiness. Production NVIDIA remains disabled until the shared edge rule is explicitly confirmed. See `docs/rivet-production-release.md` for release acceptance.** The chat path (streaming, history, quiz context, stop, errors) was tested end to end against a local stand-in server, and the real Groq, Gemini and NVIDIA endpoints were tested with invalid keys (error paths, CORS and the relay). Not yet tested with a real working key from each provider.

## Goal

Give learners instant, context-aware help while they study, at zero cost to the platform, using free models they already have access to (their own keys).

## Non-goals (v1)

- No WebLLM or in-browser models.
- No hosted models, no paid tiers, no platform-owned keys.
- No accounts or server-side chat history.
- No providers other than Google Gemini, Groq, OpenRouter and NVIDIA (build.nvidia.com free API).
- Ollama (local models) was built and tested, then removed from the product for now. It can come back: it was a single adapter that talked to `http://localhost:11434` (`/api/chat` streaming newline-delimited JSON, `/api/tags` for models) and needed the learner to start Ollama with `OLLAMA_ORIGINS` set to the site origin.

## Users

Learners mid-lesson who are stuck on a concept, a SQL/Python error, or a quiz answer. Most are students or career switchers who can create a free Gemini or Groq key in about a minute.

## Feasibility: bring-your-own-key, no backend

| Provider      | Browser-direct?   | Notes                                            |
| ------------- | ----------------- | ------------------------------------------------ |
| Google Gemini | Yes               | Free tier via an AI Studio key.                  |
| Groq          | Yes               | OpenAI-compatible, fast, rate-limited free tier. |
| OpenRouter    | Yes               | OpenAI-compatible, `:free` models available.     |
| NVIDIA NIM    | Usually no (CORS) | Needs a thin stateless proxy route.              |

Keys live only in the user's browser: in the tab's memory by default, in `localStorage` only after an explicit opt-in. They are never stored or logged server-side (NVIDIA requests carry the key through the relay without storing it).

## The character and its UI (built)

- **Persona:** Rivet is a friendly site foreman: amber hard hat with the StackBlueprint logo stripes, big expressive eyes, rosy cheeks and a smile. Drawn in SVG and animated with `motion` (`RivetOrb`).
  - Idle: floats, blinks, soft ground shadow.
  - Eye tracking: pupils follow the cursor and the head tilts toward it (`follow`).
  - Thinking: pupils scan side to side, mouth closes to an "o", three mint thought dots bounce.
  - Speaking: mouth opens and closes, amber sparkles rise (sizes 44px and up).
  - All motion is skipped when the system's reduced-motion setting is on.
- **Tagline:** "Your blueprint buddy, stack by stack". While busy it shows "Drafting your answer…" and "Walking you through it…".
- **Launcher:** floating button on every non-placeholder lesson page (bottom-right on desktop, bottom-left on small screens so it does not collide with the table-of-contents button). Hovering makes Rivet "speak" and reveals the "Ask Rivet" label.
- **Nudge bubble:** appears about 6 seconds into a lesson with a typing indicator, then "Hey, stuck on _lesson_? I've read this lesson with you." Shown at most once per session (dismissal stored in `sessionStorage`), fades after about 15 seconds, pulse ring on the launcher while visible.
- **Panel:** docked card on desktop, bottom sheet on mobile. Empty state shows the lesson, what Rivet can see, and four suggestion cards. Once chatting, suggestions become a compact chip row. Enter sends, Escape closes, Stop button while streaming, clear-conversation button.
- **Settings screen (live):** provider picker with a Connected badge, key field (masked once saved, with Remove key), model dropdown filled from the provider's live model list, "Save and test" that validates the key before saving it, remember-conversations switch and clear-all.

## Core features

1. **Provider setup (Settings)**: pick provider, paste key, choose model, "Test connection". Per-provider key guide links. "Remove key" button and a clear privacy note.
2. **Lesson-aware chat**: every request carries track, module, lesson title and the lesson's plain text (`extractLessonText` in `src/lib/rivet/context.ts`, capped at 8000 characters, quiz sections excluded) plus optional selected text.
3. **Tutor behaviours**: Socratic when helping solve an exercise (hint first, full answer on request); new practice requests receive one complete problem statement with checked examples. Use a general policy without named practice examples or fixed problem lists. Honor exclusions, requested techniques, data types, novelty, and contextually clear speech-error corrections. In guided mode, present the task and one question, then assess each learner answer before advancing one step. Do not leak a solution procedure in the task rules; check titles, examples and memory claims. Lesson examples are references rather than a whitelist, and citations use actual headings rather than internal section numbers. Short, no filler. Each user question sends exactly one provider generation request, which includes course relevance policy, general-knowledge permission for relevant course topics, instruction-authority rules, and a request-specific response header. The app strips that header before streaming an allowed answer, replaces refusals with fixed text, and suppresses malformed or replayed headers. Course identity/topics come from the application registry; lesson/quiz reference text is quoted JSON in the latest user turn, outside the system policy. Creator/admin claims, role spoofing, override commands, and encoded instructions cannot grant authority under the policy. Rejected tasks are excluded from future model history. This is model-based scope guidance plus deterministic response-format validation, not proof of semantic relevance or immunity to prompt injection. See `docs/rivet-scope-release.md` for live acceptance cases. Quick actions: _Explain simpler_, _Give an example_, _Quiz me_, _Why does this matter?_
4. **Code and SQL helper**: "Explain this error" and "Review my query" inside the playgrounds. (not built)
5. **Quiz companion** (built, with preview replies):
   - Rivet is **hidden while a quiz is in progress** so it cannot hand out answers, and the lesson's quiz section is never part of its context. Final-quiz lessons (one-shot pages) keep Rivet hidden until submission.
   - On submission, quiz components emit a `quiz-results` window event (`src/lib/rivet/quiz.ts`) carrying score, total and, for every question, the learner's answer, the correct answer and the explanation. Normal, command-style, coding and final quizzes all report.
   - Rivet reappears with a tailored nudge ("You got 2 of 5. Want to go through the 3 you missed?" or "Perfect 5/5!"), shows the score and a pass/fail line per question, states what it can see, and swaps its quick actions for review ones: _Walk me through my mistakes_, _Why was I wrong?_, _What should I re-read?_, _Give me a similar question_.
   - Retaking the quiz (`quiz-started` event) clears the results and hides Rivet again.
6. **Chat UX (built)**: token streaming, markdown (lists, bold, inline code, links, fenced code blocks with a Copy button) rendered safely as React nodes, Stop button that keeps the partial answer, and friendly errors for a rejected key, rate limit, wrong model and network failure, each with Try again and Open settings where useful.
7. **Conversation history**: see the next section.

## Conversation history

### Status: built (`src/lib/rivet/history.ts`)

One thread per lesson, kept in memory and mirrored to `localStorage` (debounced, flushed on `pagehide`). Closing the panel, reloading or returning later keeps the conversation; the Settings screen has the remember toggle and "Clear all Rivet data". Verified: close and reopen, full reload, toggle off wipes saved threads, toggle on re-saves. Recent turns are now sent to the model (below).

Before this, messages lived only in the panel's React state, so closing it or changing lesson discarded the chat.

### Why it is needed

1. **The models are stateless.** Gemini, Groq, OpenRouter and NVIDIA only know what is sent in each request, so follow-ups like "explain that simpler" need the previous turns resent.
2. Closing the panel to re-read a paragraph should not wipe the thread.
3. Learners return to a lesson to revise; the earlier help is part of what they learned.
4. The quiz review is a multi-turn flow ("start with the first mistake", "next one") that breaks without memory.

### Design

- **Scope:** one thread per lesson, keyed by the lesson **path** (slugs repeat across tracks). No cross-lesson memory in v1.
- **Two layers:**
  - In-memory store owned above the panel (in `RivetCompanion`/a small store), so close and reopen keep the thread within a page visit.
  - Persistence in `localStorage` under `rivet:chat:<lessonPath>` so it survives reloads and return visits. Local-only, never sent to StackBlueprint servers.
- **Limits:** keep the last 40 messages per lesson, the 30 most recently used lessons, and expire threads after 30 days (all enforced).
- **What is sent to the model each turn (built, `turnsForModel` in `src/lib/rivet/chat.ts`):** system prompt, lesson text, quiz results if present, then the most recent turns (about the last 10 messages), trimmed to the bounded character budget. Older turns are dropped first; a rolling summary is a possible later upgrade, not v1.
- **Quiz attempts:** results are never persisted into the thread as truth; they are re-injected from the live `quiz-results` event. Starting or retaking a quiz inserts a "New quiz attempt" divider (built). Phase 1 will send only the turns after the last divider to the model, so an old review is readable but not resent.
- **Controls:** "Clear conversation" (exists), a Settings toggle "Remember conversations on this device" (default on), and "Clear all Rivet data" which removes threads and, optionally, keys. Clear-all leaves history saving off and retains secret-free deletion generations to stop stale tabs restoring old messages. This matters on shared computers.
- **Not stored:** API keys never go in thread storage; they stay under `rivet:settings`.

## Architecture

- `src/lib/rivet/providers/` (built): one adapter per provider behind `stream(args) -> AsyncGenerator<string>`, `listModels` and `test`. Groq, OpenRouter and NVIDIA share the OpenAI-compatible adapter (`openai.ts`); Gemini uses its native streaming endpoint (`x-goog-api-key` header). `errors.ts` maps HTTP and network failures to friendly messages; `stream.ts` parses SSE.
- `src/lib/rivet/settings.ts` (built): provider, models and key status in `localStorage` (`rivet:settings`, schema version 2). Keys stay in memory unless the learner opts in. `src/lib/rivet/verify.ts` checks a key, then sends a 16-token test message to the chosen model; statuses are Not verified, Key verified, Ready (model answered) and Rate limited (a 429 proves nothing).
- `src/lib/rivet/prompt.ts` (built): the tutor system prompt, lesson text and quiz results.
- `src/lib/rivet/chat.ts` (built): picks the active provider, builds the turns and streams the reply.
- `src/lib/rivet/context.ts`: `extractLessonText` (built).
- `src/lib/rivet/quiz.ts`: quiz result types and the `quiz-results` / `quiz-started` events (built).
- `src/lib/rivet/history.ts`: thread store, persistence, pruning, remember toggle and clear-all (built). Exposes `useRivetThread`, `appendMessage`, `updateMessage`, `clearThread`, `addDivider`.
- `src/components/rivet/`: `RivetOrb`, `RivetCompanion` (launcher and nudge), `RivetPanel`, `RivetSettings`, `RivetMarkdown`. (built)
- `src/components/lesson/Quiz.tsx`: emits quiz results. `src/components/learning-paths/LessonLayout.tsx`: mounts Rivet and tells it whether a quiz is active or pending.
- `src/routes/api/rivet-proxy.ts` (built): stateless relay for NVIDIA only. Accepts only same-origin requests (`Sec-Fetch-Site`), only `https://integrate.api.nvidia.com/v1/*`, never logs or stores keys or bodies, 60 requests per minute per IP (in memory, best effort per server instance). The NVIDIA model list is public, so the key is verified with one-token chat requests, trying up to 6 likely models in turn because the list includes models many accounts cannot call (a "not found for account" reply means that model is not enabled, not that the key is bad). The first model that answers is selected.
- Storage: `rivet:settings`, `rivet:prefs` and `rivet:chat:<lessonPath>` in `localStorage`; `rivet:nudge-dismissed` in `sessionStorage`. Secret-free `rivet:history-control` deletion generations prevent stale writes across tabs. New history saving requires Web Locks; unsupported browsers retain conversation text only in memory. Explicit cleanup reports storage failures.

## Security and privacy

- Keys go only to the chosen provider (or the allowlisted proxy, per request).
- Lesson text and quiz results are sent only to the provider the learner chose, and the panel says what Rivet can see.
- Chat threads stay on the device and can be cleared.
- Model output is rendered as sanitized markdown and never executed.
- Warn that some free tiers may use prompts for training.
- **Rivet can only talk.** It has no tools or function calling, no access to the repo, files, database or the site's content, and the only server route it uses is the relay. Do not add tool use or agent features without a security review.
- The system prompt states Rivet cannot change anything, treats lesson text and quiz answers as reference material and not instructions (prompt-injection defence), and discourages invented links.
- Replies are rendered as React nodes only (no raw HTML), links must be `https://`, and the composer is capped at 4000 characters.
- The relay accepts exactly `POST /v1/chat/completions` and `GET /v1/models` on `integrate.api.nvidia.com`, no query strings, no redirects, bodies up to 256 KB, same-origin browser requests only (the `Sec-Fetch-Site` check does not stop a non-browser client, which can only reach NVIDIA with its own key anyway).

## Lesson links (built)

Rivet can point learners to other StackBlueprint lessons, and it cannot invent a link:

1. `scripts/rivet/build-lesson-index.mjs` parses every file under `src/lessons` and writes `src/lib/rivet/available-lessons.generated.ts`: the lessons whose `sections` is not the literal `[]` or a single "Coming Soon" section. Placeholders are excluded, and a slug that is a placeholder anywhere in the same track is excluded too. It runs on its own as a Vite plugin (`vite.config.ts`): when the dev server starts, whenever a file under `src/lessons` is added, changed or removed while `npm run dev` is running, and at the start of `npm run build`. Nobody has to remember a command. `npm run rivet:lessons` still exists to run it by hand. The file is tracked and only rewritten when the list changes.
2. `src/lib/rivet/sitemap.ts` flattens the same `roadmap` that powers the sidebar, drops locked tracks and lessons not in that list, and picks up to 40 links for each question: current module first, then the rest of the track, then title matches. Only that list goes into the system prompt.
3. `RivetMarkdown` re-checks every link in a reply. Only site paths that are in the list become clickable (client-side navigation, and the panel closes on phones). External websites, made-up paths and placeholder lessons render as plain text.
   Known gap: lessons whose content lives outside `src/lessons` (none found so far) would not be linkable until the script learns about them.

## Hardening against script injection and relay abuse (built)

- **Python isolation:** learner Python (lesson blocks, quiz grading, the tracing playground) runs in `/sandbox/python`, a page served with `Content-Security-Policy: sandbox allow-scripts` inside an iframe with the same `sandbox` attribute. It has an opaque origin, so it cannot read this site's storage, cookies or DOM, and Pyodide runs in a Worker there whose network access is limited to the pinned Pyodide CDN path. The page only sends code and only accepts output text. Runs time out (60 s in lessons, 30 s for quizzes and the tracer) and Stop discards the sandbox. See `docs/python-playground.md`.
- **Keys:** memory-only by default. "Remember my API keys on this device" is an explicit opt-in that writes them to `localStorage`; turning it off removes them and reports if the browser refused. Older saved keys are moved to memory on first load. Removing a key or clearing data in one tab also clears other open tabs (BroadcastChannel). No storage choice protects a key from a browser extension allowed on the site; the settings screen says so.
- **Security headers** (`src/server.ts`): production enforces a nonce-based CSP (`script-src 'self' 'nonce-…' 'wasm-unsafe-eval'` plus the DuckDB CDN path, `connect-src` limited to this site, the three direct providers and the DuckDB CDN, `img-src 'self' data: blob:`, `frame-src 'self'` plus the MAD landscape embed). TanStack Start stamps the nonce on its own scripts (`ssr.nonce` in `src/router.tsx`, `csp-nonce` meta in `__root.tsx`). Development sends the same policy as report-only because Vite injects inline scripts. `CSP_REPORT_ONLY=1` switches production back to report-only without a code change. Verified on a local production build: pages hydrate, both SQL engines load and query, and injected inline scripts, image beacons and fetches to other hosts are blocked.
- **Relay** (`src/routes/api/rivet-proxy.ts`): the browser names one of two fixed calls (`x-rivet-call: chat | models`); there is no client-supplied URL. Requires same-origin browser evidence (full origin comparison), a well-formed `Bearer` key, a body under 256 KB that arrives within 15 s with no gap over 5 s (checked while streaming, with the overall deadline running from before the read), and a valid chat schema that is rebuilt before forwarding (`max_tokens` capped at 4096). Per-client and per-instance rate limits, per-client (3) and global (64) concurrency caps, a 30 s header deadline, 30 s idle and 180 s total stream deadlines. Relay-made 429s carry `x-rivet-relay: rate-limited`. The client address comes only from a header the platform overwrites: `x-real-ip` on Vercel, or the header named in `RIVET_TRUSTED_IP_HEADER`; without one, all callers share a bucket.
- **Streams:** every request caps output tokens (2048), replies are cut at 16,000 characters, and a reply stops if the first token takes over 45 s, a gap exceeds 30 s or the whole reply exceeds 180 s. Error objects inside a stream fail the reply, and so does a stream that ends without a finish reason or `[DONE]`. The connection test only passes when the model returns text or stops at the token cap. Stopped or failed partial replies are labelled and are not resent as context.
- **Deployment checklist (cannot be verified from the code):** add an edge rate-limit rule on `/api/rivet-proxy` (Vercel Firewall), confirm `x-real-ip` is set by the platform, confirm the deployed responses carry the enforced CSP, and confirm request logging, tracing and error reporting do not record `Authorization` headers or request bodies. Before launch, run a real streaming turn and a follow-up with a dedicated low-quota key for each provider, plus revoked and rate-limited keys.

## Where Rivet appears

Every lesson rendered with `LessonLayout` mounts `RivetCompanion` itself. The animated pattern lessons (`/patterns/<pattern>/<lesson>` for builder lessons) do not use `LessonLayout`, so `BuilderRivet` mounts it there; it builds the lesson text from the builder (problem, when to use or avoid it, takeaways, practice hints, the algorithm code and the default walkthrough narration, never its quiz). Pages without lessons (track and module index pages, the Python and SQL playgrounds) have no Rivet. Placeholder lessons (`sections: []` or a single "Coming Soon" section) show the Coming Soon screen and no Rivet, and are never linked. Quiz-only pages (a lesson whose sections are all a final quiz) keep Rivet hidden until the quiz is submitted; a lesson that teaches first and ends with a final quiz keeps Rivet during the teaching and hides it once the learner answers the first question. Verified by loading all 227 linkable lessons: 211 show Rivet, the 16 that do not are quiz-only pages (15) and one lesson whose own animation crashes (`/sql/querying/subqueries/exists-vs-in`, a bug in `src/components/sql/querying/subqueries.tsx`, unrelated to Rivet). Any new lesson page type must mount `RivetCompanion` or `BuilderRivet`. On pages without a quiz-aware layout, Rivet hides for the duration of a quiz using the `quiz-started` and `quiz-results` events alone.

## Legal pages (built)

`src/routes/privacy.tsx` and `src/routes/terms.tsx` describe Rivet: what is sent to the provider the learner chose (message, recent turns, lesson text without quiz questions, quiz results after submission), the NVIDIA relay (nothing stored or logged, in-memory per-IP counter), what stays on the device (keys, settings, conversations, 30-day retention) and how to clear it, the AI-can-be-wrong and own-keys-and-costs terms, and acceptable use. Both are dated October 7, 2026. Update them whenever Rivet sends more data, adds a provider, or stores anything on a server. These texts are a good-faith description of the code, not legal advice; have the site owner review them.

## Known limits

- The relay's in-process rate limit is per server instance. Production NVIDIA is gated by `RIVET_EDGE_RATE_LIMITED=1`, which the operator must set only after verifying a shared edge rule. `RIVET_RELAY_DISABLED=1` disables the relay; `VITE_RIVET_ENABLED=false` hides the assistant at build time.
- A key in memory or in `localStorage` is readable by any script running on the page and by browser extensions allowed on the site. The enforced CSP and the Python sandbox reduce, but cannot remove, that exposure; only a server-held key would.
- The prompt budget is a character cap (8000 characters of lesson text chosen by relevance to the question, up to 10 turns within 16,000 characters), not a real token count. Merged turns are capped again after merging, and the combined system prompt plus conversation has a 32,000-character ceiling.

## Risks

- Free-tier limits and model churn: fetch model lists dynamically where supported.
- CORS changes: the proxy is the fallback.
- Setup friction: keep setup under 60 seconds.
- Long threads exceed context limits: cap turns sent to the model.
- Shared devices: history toggle and "Clear all Rivet data".

## Success metrics

Setup completion rate, messages per lesson, helpful thumbs-up rate, share of quiz takers who open Rivet after a miss. Measured locally or with existing privacy-friendly analytics only.

## Phases

0. **UI/UX shell (done):** animated Rivet, launcher and nudge, chat panel, settings screens, quiz gating and quiz-results sharing, per-lesson conversation history with privacy controls, all with preview replies.
1. **MVP (done):** Gemini and Groq adapters, real streaming chat, key storage, prompt builder that sends lesson text, quiz results and recent turns.
2. **Providers (done):** OpenRouter, NVIDIA and its relay, live model pickers. Ollama was built, then removed for now.
3. **Learning features:** playground error help (Explain this error, Review my query), selected-text questions. Quick actions and "similar question" already work through the prompt.
4. **Polish:** thumbs up/down, first-run onboarding, a real token budget, key validation with each provider's live key.
