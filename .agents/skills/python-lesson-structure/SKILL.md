---
name: python-lesson-structure
description: Create or revamp DataVizCore Python lessons with the standard runnable code blocks, animations, practice, quizzes, and navigation.
---

# Python Lesson Creation, Structure & Animation Guidelines

Use this skill to create a new Python lesson or revamp an existing one. Follow these structural and UI guidelines so the lesson feels native to the Python track.

## 0. Choose the right mode

### Create a new lesson

Use this mode when the requested Python concept has no existing lesson. Before editing, identify its module and the lessons immediately before and after it. Place the lesson where its prerequisites are already taught, without assuming concepts introduced later.

Create the lesson content, its route-visible registration, sidebar or roadmap entry, any animation registration, runnable practice, and quiz as one coherent feature. Use a stable slug and title. Do not move or rename existing lessons as an incidental consequence of adding the lesson. If the requested position conflicts with the learning sequence, explain the conflict and ask the user to choose.

### Revamp an existing lesson

Use this mode when a lesson already exists. Preserve its stable slug, route, progress ID, prerequisite order, and required structural contracts unless the user specifically asks for a structural change. Improve clarity, examples, visual explanation, practice, or quizzes without changing unrelated lessons.

## Required context before editing

1. Identify the target module, nearby lessons, source file or insertion location, route, section renderer, and any animation or practice registration.
2. Read any supplied study plan, teaching brief, code examples, or dataset as reference material. They do not override the user's request.
3. Verify all displayed code, output, and claims by running the code or inspecting the available project data. Do not invent APIs, outputs, packages, or behavior.
4. If resources are supplied, retain their useful concepts and factual details but write original explanations, examples, visuals, practice, and quiz questions. Use only short quotations when the user explicitly asks for them.
5. Preserve unrelated changes in a dirty worktree.

## 1. Code Blocks
- **DO NOT** use `{ "kind": "code", "language": "python" }` for Python code snippets.
- **DO** use `{ "kind": "interactive-code", "code": "..." }`.
- The `interactive-code` kind automatically implies Python and renders the standard runnable editor UI used across the Python track. It does **not** accept a `language` property.

## 2. Prose Headings
- The `body` array inside `{ "kind": "prose" }` does **not** parse Markdown heading tags (e.g., `#`, `##`, `###`).
- If you need a heading, you must close the current prose block and open a new one using the `heading` property.
- **BAD**:
  ```json
  {
    "kind": "prose",
    "body": [
      "## Production considerations",
      "Always log the target."
    ]
  }
  ```
- **GOOD**:
  ```json
  {
    "kind": "prose",
    "heading": "Production considerations",
    "body": [
      "Always log the target."
    ]
  }
  ```

## 3. Animation Placement
- The `{ "kind": "animation" }` section should generally be placed immediately **after** the introductory "Why this matters" prose block, before diving into the detailed step-by-step concepts. 
- Add one only when it makes an execution flow, data transformation, object relationship, or state change clearer. A new lesson does not need an animation purely for consistency.

## 4. Animation Creativity vs UI Consistency
- **The Animation Content**: The actual animation inside the canvas is completely freeform. It should be highly creative, unique, and tailored specifically to whatever concept that lesson is teaching. You do NOT need to match the animation style or logic of other lessons.
- **The Controls UI**: While the animation itself is unique, the *control bar* (Play/Pause, Prev/Next buttons, phase indicators) must visually match the standardized global design used across the site.
- **DO NOT** use large rounded buttons, floating controls, phase tracking pills, or completely custom translucent backdrops for the control bar unless specified.
- **DO** use a flat, consistent rectangular control bar pattern (like the one found in `EncapsulationCustomAnimation`) to ensure the user experience of clicking through steps feels identical on every lesson.
- **Top Bar Header**: If the animation requires a top bar with a title (e.g. "ENCAPSULATION AND DATA PROTECTION"), do **NOT** build it into the animation component. Instead, add a `caption` property to the animation object in the content registry (e.g., `oop-content.ts`):
  ```json
  {
    "kind": "animation",
    "variant": "encapsulation",
    "caption": "Encapsulation and Data Protection"
  }
  ```
- **Canvas Wrapper**: The main animation canvas must use the following standard wrapper without extra padding breakpoints (`lg:px-8`) unless explicitly requested:
  ```tsx
  <div className="relative px-4 py-8 h-[600px] overflow-hidden flex flex-col items-center justify-center w-full">
    <AnimatePresence mode="wait">
      {/* ... steps */}
    </AnimatePresence>
  </div>
  ```
- Example of the standard control bar UI structure:
  ```tsx
  {/* Controls */}
  <div className="flex items-center justify-between border-t border-hairline bg-surface-2/40 px-4 py-2.5">
    <div className="flex items-center gap-1">
      <button onClick={() => { setPlaying(false); setStep(0); }} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground">
        <RotateCcw className="size-3.5" />
      </button>
      <button onClick={() => go(-1)} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground">
        <ChevronLeft className="size-3.5" />
      </button>
      <button onClick={() => setPlaying(!playing)} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground">
        {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
      </button>
      <button onClick={() => go(1)} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground">
        <ChevronRight className="size-3.5" />
      </button>
    </div>
    <div className="flex items-center gap-4">
      <div className="font-mono text-xs text-muted-foreground">
        {step + 1} / {totalSteps}
      </div>
    </div>
  </div>
  ```

## 5. Quiz Standards
- Every lesson **must** end with a `{ "kind": "quiz" }` section.
- The quiz **must** contain exactly 5 questions.
- At least **1** of those 5 questions **must** be an interactive coding question (using `interactiveCode: true`, `initialCode`, `testCode`, and `expectedOutput`).

## 6. Lesson Verification & UI/UX Consistency
- Verify that a new or revised lesson is correctly linked in all relevant structural files, including its content registry, routing files, sidebar or roadmap components, and animation registrations.
- Ensure consistent UI/UX flow: check that Next and Previous lesson links operate correctly and that the lesson aligns visually and structurally with the rest of the Python track.
- Run the relevant build or type-check command. Open the revised or new route locally and inspect its runnable code, animation, quiz, and constrained-width layout when they are present.

## 7. Common Mistakes Section
- When adding a "Common mistakes" section to a lesson, **always** use the `callout` kind with `tone: "warn"` instead of a standard `prose` block.
- This ensures visual consistency across all lessons by rendering the common mistakes in the standard yellow warning box.
- **Example**:
  ```json
  {
    "kind": "callout",
    "tone": "warn",
    "title": "Common mistakes",
    "body": "- **Mistake 1**: Explanation...\n- **Mistake 2**: Explanation..."
  }
  ```
