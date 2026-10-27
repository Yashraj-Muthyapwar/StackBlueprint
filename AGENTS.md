## Course & Content Creation Guidelines

When acting on requests to create lessons, chapters, or tracks in this project, you MUST adhere to the following rules to ensure uniformity, high quality, and architectural consistency:

### 1. Global UI & Component Uniformity
* **Reusable Core Components**: We use a unified design system. Before creating custom UI elements from scratch, always look for and use existing main components (like standard chips, buttons, cards, progress bars) to ensure consistency across the website without making a complex new setup.
* **Progress Bars**: Every chapter in a course MUST have a progress bar that is uniform in design across the entire website.
* **Chips, Buttons, and Cards**: All chips, buttons, cards, and similar UI elements used within chapters and lessons must follow the exact same visual language and be uniform across the entire website.

### 2. Lesson Creation
* **Component Architecture**: Always create a separate components folder under `src/components/[course-name]` for that specific course for any unique elements. However, prioritize using the global reusable components whenever possible. Custom animations or section renders specific to the course should be placed in this folder.
* **Content Quality**: 
  * The lesson content must be perfect, 100% free from plagiarism, and strictly avoid "AI Slop" or generic filler text.
  * Do NOT use em dashes in the lesson text.
* **Images**: Whenever an image is included in a lesson, you must use the project's main image component (e.g., the zoomable image component) to enable the standard on-click expansion effect. **You MUST also always include a descriptive `caption` string alongside every `image` block.**
* **Multiple Images**: When a single lesson section needs to display multiple related images, you MUST use the `image-carousel` section type to combine them into a single slider component for a uniform UX. Do NOT stack multiple separate `image` kinds consecutively.
* **Key Takeaways**: Every lesson must end with a clearly defined "Key Takeaways" section.
* **Quizzes & Completion**: 
  * A Quiz section should be added if appropriate for the lesson content, though it can be skipped if not applicable.
  * If a quiz is present, it MUST ALWAYS be placed at the very end of the lesson content (i.e., AFTER the Key Takeaways section).
  * You MUST ALWAYS add a button to mark the lesson as completed at the end of the lesson, regardless of whether a quiz is present.
* **Placeholders**: If a lesson is just a placeholder (i.e., its content is coming soon), its `sections` array MUST be completely empty (`sections: []`). Do NOT add prose sections that say "Placeholder...". This ensures the global `LessonLayout` correctly intercepts the state and renders the stylized "Lesson Content Coming Soon" UI.

### 3. Track Creation
* **Design Uniformity**: When creating a new learning track, you must strictly follow the design and layout patterns of existing tracks (e.g., the Data Engineering track, typically at `/data-engineering`).
* **Required Elements**: Ensure the new track includes:
  * Uniform cards for displaying topics/modules.
  * Consistent scroll behaviors.
  * Standard side headers.
  * Appropriate logos matching the UI system.
* **Goal**: The layout, feel, and functionality must be perfectly uniform across all tracks in the application.

### 4. Navigation, Visibility & Registration Checklist
Whenever you are asked to add, create, or rewrite a lesson (from any module or track), you MUST automatically complete the following checklist to ensure the new content is visible, routes correctly, and renders perfectly:
- [ ] **Global Roadmap (`src/lessons/roadmap.ts`)**: Update the roadmap array with the new lesson slug, title, and exact `path` (e.g. `path: "/python/file-handling/file-basics"`). This powers the global sidebar navigation.
- [ ] **Track Index (`src/routes/[track-name]/index.tsx`)**: If the track has a local `[TRACK]_SECTIONS` registry, you MUST update it with the new lesson and **ensure the `path` attribute is included**. Missing the `path` attribute will break the module cards and breadcrumb navigation (`track > module > 01 / 10`).
- [ ] **Content Registry (`src/lessons/[track-name]/[module]-content.ts`)**: Add the lesson content ensuring `slug` and structure matches the roadmap.
- [ ] **Section Renderer (`src/components/[track-name]/SectionRenderer.tsx`)**: Ensure the track's `SectionRenderer` properly implements all required section types used in your content (especially `quiz`, `image-carousel`, `takeaways`). Do not assume they are implemented by default; verify and add them if they are missing.

### 5. SQL Lesson Template (follow for every SQL lesson, based on `group-by-vs-window`)
When the user supplies lesson content for a SQL lesson, keep their wording exactly and only format it into this structure. Reference implementation: the `groupByVsWindow` lesson in `src/lessons/sql/window-functions-content.ts`.

**Section order (numbered headings in the same `N. NAME: subtitle` style):**
1. `1. WHY: ...` prose (+ the lesson's data as a `table`), then a `callout` (tone `info`) for the core idea.
2. `2. INTUITION: ...` prose, then a visual (see below), then a `callout` titled "The key difference" using the user's wording.
3. `3. HOW: ...` prose with `A.` / `B.` sub-headings. Each approach gets a `code` block (`language: "sql"`, with a `caption`). Include a syntax `code` block (`language: "text"`) plus a `table` titled "Reading the syntax" (Part / Role / Required?) whenever the lesson introduces new syntax. Explain conceptual steps in `prose` after the code. No animation in this section.
4. `4. EXAMPLE: ...` a short prose lead-in, then the step-by-step SQL `animation` (required), then the outputs as `table`s with captions (one per result, with row counts in the prose).
5. `5. TRADE-OFFS: ...` a `table` (Requirement / Preferred approach), a `callout` (tone `warn`) plus `code` blocks (fails / works) for the main pitfall, and a `list` section titled "Important limitations" for the rest. Never use a table for limitations.
6. `6. PRACTICE: Your turn` a prose section with `body: []`, then one `sql-practice` section. Do not repeat the task text as prose, and never label practice as "Task A" or "Task B".
7. `takeaways` (always last content section), then `quiz`, which is always the very last section. The lesson page adds the mark-complete button.

**Formatting rules:**
- Put SQL keywords, functions and identifiers in backticks inside prose, callouts, list items and takeaways (`GROUP BY`, `OVER`, `WHERE`). Use `**bold**` for the key term being taught. Table cells render plain text, so do not rely on backticks there.
- No em dashes. Use the user's wording; do not add filler.
- Use `list` for bullets (`{ kind: "list", heading, items }`), never a table.

**Visuals (pick what fits, do not use ASCII diagrams):**
- Simple intuition animation: a small React component in `src/components/sql/<topic>/` registered as a `visual` section (see `TwoRoomsVisual.tsx`, people and rooms, not a database table). Add its `id` to the `visual` section type in `foundations-content.ts` and `SectionRenderer.tsx`.
- Step-by-step SQL animation: `animation` section using `Stage[]` in `src/components/sql/<topic>/`, registered in `src/components/sql/animation-registry.ts`.

**Practice (inline SQL sandbox, not a link to the playground):**
1. Add the lesson's small tables to `DDL`, the seed statements, the `tables` info and `SCHEMA_HINT` in `src/components/sql-playground/db/dataset.ts` (Cycle Depot already has `orders` and `employees`, so use new names such as `customer_orders` and `staff_salaries`) and update the dataset stats in `src/components/sql-playground/db/datasets/index.ts`.
2. Add a challenge to `src/components/sql-playground/challenges/definitions.ts` (`group: "windows"` for window lessons) with `starterSql`, three `hints`, `solutionSql`, a hand-indented `solutionDisplay`, and a `result-set` validator. Add a matching entry to `src/components/sql-playground/content/practice.ts`.
3. In the lesson use `{ kind: "sql-practice", challengeId, title, prompt, playgroundHref }`. It runs in `src/components/sql/sandbox/` (isolated worker, read-only transaction, 5 second timeout) and the query check in `challenges/query-policy.ts` blocks writes. Reveal solution stays locked until the learner runs a query once. Do not weaken these.

**Quiz:** 4 questions, include a row-count or output-shape question, a pick-the-right-approach question, a pick-the-correct-query question, and the main pitfall. Give each a unique `id` prefixed with the lesson slug and an `explanation`.

**After writing a lesson:** run `npx tsc --noEmit -p .` and `npm run rivet:lessons`, open the lesson in the dev server, run the practice with a correct and a wrong query, and check dark mode. Then complete the registration checklist in section 4 (roadmap, track index, content registry, SectionRenderer).
