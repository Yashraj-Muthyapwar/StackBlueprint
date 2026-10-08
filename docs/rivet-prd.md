# Rivet: the StackBlueprint AI Tutor (PRD v1.1)

Status: **phases 0 to 2 are built. Rivet streams real answers from Google Gemini, Groq, NVIDIA (via a relay) and OpenRouter, using the learner's own key, with per-lesson history, lesson grounding and quiz-aware tutoring.** The chat path (streaming, history, quiz context, stop, errors) was tested end to end against a local stand-in server, and the real Groq, Gemini and NVIDIA endpoints were tested with invalid keys (error paths, CORS and the relay). Not yet tested with a real working key from each provider.

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
| Provider | Browser-direct? | Notes |
|---|---|---|
| Google Gemini | Yes | Free tier via an AI Studio key. |
| Groq | Yes | OpenAI-compatible, fast, rate-limited free tier. |
| OpenRouter | Yes | OpenAI-compatible, `:free` models available. |
| NVIDIA NIM | Usually no (CORS) | Needs a thin stateless proxy route. |

Keys live only in the user's browser (`localStorage`) and are never stored or logged server-side.

## The character and its UI (built)
- **Persona:** Rivet is a friendly site foreman: amber hard hat with the StackBlueprint logo stripes, big expressive eyes, rosy cheeks and a smile. Drawn in SVG and animated with `motion` (`RivetOrb`).
  - Idle: floats, blinks, soft ground shadow.
  - Eye tracking: pupils follow the cursor and the head tilts toward it (`follow`).
  - Thinking: pupils scan side to side, mouth closes to an "o", three mint thought dots bounce.
  - Speaking: mouth opens and closes, amber sparkles rise (sizes 44px and up).
  - All motion is skipped when the system's reduced-motion setting is on.
- **Tagline:** "Your blueprint buddy, stack by stack". While busy it shows "Drafting your answer…" and "Walking you through it…".
- **Launcher:** floating button on every non-placeholder lesson page (bottom-right on desktop, bottom-left on small screens so it does not collide with the table-of-contents button). Hovering makes Rivet "speak" and reveals the "Ask Rivet" label.
- **Nudge bubble:** appears about 6 seconds into a lesson with a typing indicator, then "Hey, stuck on *lesson*? I've read this lesson with you." Shown at most once per session (dismissal stored in `sessionStorage`), fades after about 15 seconds, pulse ring on the launcher while visible.
- **Panel:** docked card on desktop, bottom sheet on mobile. Empty state shows the lesson, what Rivet can see, and four suggestion cards. Once chatting, suggestions become a compact chip row. Enter sends, Escape closes, Stop button while streaming, clear-conversation button.
- **Settings screen (live):** provider picker with a Connected badge, key field (masked once saved, with Remove key), model dropdown filled from the provider's live model list, "Save and test" that validates the key before saving it, remember-conversations switch and clear-all.

## Core features
1. **Provider setup (Settings)**: pick provider, paste key, choose model, "Test connection". Per-provider key guide links. "Remove key" button and a clear privacy note.
2. **Lesson-aware chat**: every request carries track, module, lesson title and the lesson's plain text (`extractLessonText` in `src/lib/rivet/context.ts`, capped at 6000 characters, quiz sections excluded) plus optional selected text.
3. **Tutor behaviours** (system prompt): Socratic by default (hint first, full answer on request); never invents lesson claims; short, no filler. Quick actions: *Explain simpler*, *Give an example*, *Quiz me*, *Why does this matter?*
4. **Code and SQL helper**: "Explain this error" and "Review my query" inside the playgrounds. (not built)
5. **Quiz companion** (built, with preview replies):
   - Rivet is **hidden while a quiz is in progress** so it cannot hand out answers, and the lesson's quiz section is never part of its context. Final-quiz lessons (one-shot pages) keep Rivet hidden until submission.
   - On submission, quiz components emit a `quiz-results` window event (`src/lib/rivet/quiz.ts`) carrying score, total and, for every question, the learner's answer, the correct answer and the explanation. Normal, command-style, coding and final quizzes all report.
   - Rivet reappears with a tailored nudge ("You got 2 of 5. Want to go through the 3 you missed?" or "Perfect 5/5!"), shows the score and a pass/fail line per question, states what it can see, and swaps its quick actions for review ones: *Walk me through my mistakes*, *Why was I wrong?*, *What should I re-read?*, *Give me a similar question*.
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
- **What is sent to the model each turn (built, `turnsForModel` in `src/lib/rivet/chat.ts`):** system prompt, lesson text, quiz results if present, then the most recent turns (about the last 10 messages), trimmed to the provider's token budget. Older turns are dropped first; a rolling summary is a possible later upgrade, not v1.
- **Quiz attempts:** results are never persisted into the thread as truth; they are re-injected from the live `quiz-results` event. Starting or retaking a quiz inserts a "New quiz attempt" divider (built). Phase 1 will send only the turns after the last divider to the model, so an old review is readable but not resent.
- **Controls:** "Clear conversation" (exists), a Settings toggle "Remember conversations on this device" (default on), and "Clear all Rivet data" which removes threads and, optionally, keys. This matters on shared computers.
- **Not stored:** API keys never go in thread storage; they stay under `rivet:settings`.

## Architecture
- `src/lib/rivet/providers/` (built): one adapter per provider behind `stream(args) -> AsyncGenerator<string>`, `listModels` and `test`. Groq, OpenRouter and NVIDIA share the OpenAI-compatible adapter (`openai.ts`); Gemini uses its native streaming endpoint (`x-goog-api-key` header). `errors.ts` maps HTTP and network failures to friendly messages; `stream.ts` parses SSE and NDJSON.
- `src/lib/rivet/settings.ts` (built): provider, keys and models in `localStorage` (`rivet:settings`). A key is saved only after a successful test.
- `src/lib/rivet/prompt.ts` (built): the tutor system prompt, lesson text and quiz results.
- `src/lib/rivet/chat.ts` (built): picks the active provider, builds the turns and streams the reply.
- `src/lib/rivet/context.ts`: `extractLessonText` (built).
- `src/lib/rivet/quiz.ts`: quiz result types and the `quiz-results` / `quiz-started` events (built).
- `src/lib/rivet/history.ts`: thread store, persistence, pruning, remember toggle and clear-all (built). Exposes `useRivetThread`, `appendMessage`, `updateMessage`, `clearThread`, `addDivider`.
- `src/components/rivet/`: `RivetOrb`, `RivetCompanion` (launcher and nudge), `RivetPanel`, `RivetSettings`, `RivetMarkdown`. (built)
- `src/components/lesson/Quiz.tsx`: emits quiz results. `src/components/learning-paths/LessonLayout.tsx`: mounts Rivet and tells it whether a quiz is active or pending.
- `src/routes/api/rivet-proxy.ts` (built): stateless relay for NVIDIA only. Accepts only same-origin requests (`Sec-Fetch-Site`), only `https://integrate.api.nvidia.com/v1/*`, never logs or stores keys or bodies, 60 requests per minute per IP (in memory, best effort per server instance). The NVIDIA model list is public, so the key is verified with one-token chat requests, trying up to 8 likely models in turn because the list includes models many accounts cannot call (a "not found for account" reply means that model is not enabled, not that the key is bad). The first model that answers is selected.
- Storage: `rivet:settings`, `rivet:prefs` and `rivet:chat:<lessonPath>` in `localStorage`; `rivet:nudge-dismissed` in `sessionStorage`.

## Security and privacy
- Keys go only to the chosen provider (or the allowlisted proxy, per request).
- Lesson text and quiz results are sent only to the provider the learner chose, and the panel says what Rivet can see.
- Chat threads stay on the device and can be cleared.
- Model output is rendered as sanitized markdown and never executed.
- Warn that some free tiers may use prompts for training.
- **Rivet can only talk.** It has no tools or function calling, no access to the repo, files, database or the site's content, and the only server route it uses is the relay. Do not add tool use or agent features without a security review.
- The system prompt states Rivet cannot change anything, treats lesson text and quiz answers as reference material and not instructions (prompt-injection defence), and discourages invented links.
- Replies are rendered as React nodes only (no raw HTML), links must be `https://`, and the composer is capped at 4000 characters.
- The relay accepts exactly `POST /v1/chat/completions` and `GET /v1/models` on `integrate.api.nvidia.com`, no query strings, no redirects, bodies up to 512 KB, same-origin browser requests only (the `Sec-Fetch-Site` check does not stop a non-browser client, which can only reach NVIDIA with its own key anyway).

## Lesson links (built)
Rivet can point learners to other StackBlueprint lessons, and it cannot invent a link:
1. `scripts/rivet/build-lesson-index.mjs` parses every file under `src/lessons` and writes `src/lib/rivet/available-lessons.generated.ts`: the lessons whose `sections` is not the literal `[]`. Placeholders are excluded, and a slug that is a placeholder anywhere in the same track is excluded too. It runs on its own as a Vite plugin (`vite.config.ts`): when the dev server starts, whenever a file under `src/lessons` is added, changed or removed while `npm run dev` is running, and at the start of `npm run build`. Nobody has to remember a command. `npm run rivet:lessons` still exists to run it by hand. The file is committed and only rewritten when the list changes.
2. `src/lib/rivet/sitemap.ts` flattens the same `roadmap` that powers the sidebar, drops locked tracks and lessons not in that list, and picks up to 40 links for each question: current module first, then the rest of the track, then title matches. Only that list goes into the system prompt.
3. `RivetMarkdown` re-checks every link in a reply. Only site paths that are in the list become clickable (client-side navigation, and the panel closes on phones). External websites, made-up paths and placeholder lessons render as plain text.
Known gap: lessons whose content lives outside `src/lessons` (none found so far) would not be linkable until the script learns about them.

## Hardening against script injection and relay abuse (built)
- **Keys:** Settings has "Remember my API keys on this device". Off keeps keys in `sessionStorage` only (forgotten when the tab closes, never in `localStorage`). "Clear all Rivet data" removes both.
- **Security headers** (`src/server.ts`, HTML responses only):
  - Enforced: `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'self'` (other sites cannot frame ours), plus `X-Content-Type-Options: nosniff` and a `Referrer-Policy`.
  - Report-only (logs, never blocks): a full policy whose `connect-src` allows only this site, the four provider hosts, jsDelivr (Pyodide) and PyPI. This is the layer that would stop a rogue script from sending a saved key to an unknown server. Browsing the lessons, the Python playground and the SQL playground produced no violations. Watch the browser console for `[Report Only]` messages on staging, then move `connect-src` (and `script-src`) to the enforced header.
  - `frame-ancestors 'self'` is on now that the project is no longer connected to the Lovable editor, which embedded the site in a frame. If you ever need to embed the site elsewhere, allow that origin here.
- **Relay:** a request must carry `Sec-Fetch-Site: same-origin` or a matching `Origin`. Plain scripts and other websites are refused (403). A client that fakes those headers can still call it, so also add a host rate-limit rule on `/api/rivet-proxy` (Cloudflare: Security, WAF, Rate limiting rules; Vercel: Firewall rate limit).
- **Open item:** Pyodide is loaded from the jsDelivr CDN on the page's origin. Self-hosting it, or running it in a Web Worker (which cannot read `localStorage`), would remove the last third-party script from the key's origin.

## Known limits
- The relay's rate limit is per server instance, so it is a courtesy guard, not a hard cap.
- Keys in `localStorage` are readable by any script on the page, so a cross-site scripting bug would expose them. Keep the site free of untrusted HTML.
- The prompt budget is a character cap (6000 characters of lesson text, last 10 turns), not a real token count.

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
