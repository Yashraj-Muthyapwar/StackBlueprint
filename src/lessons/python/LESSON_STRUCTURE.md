---
name: python-lesson-structure
description: Standards and guidelines for creating or editing Python lesson schemas and animations
---

# Python Lesson Structure & Animation Guidelines

When creating or editing lessons in this project (specifically in `file-handling-content.ts` or other Python modules), you must strictly follow these structural and UI guidelines to ensure consistency.

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

## 4. Animation Creativity vs UI Consistency
- **The Animation Content**: The actual animation inside the canvas is completely freeform. It should be highly creative, unique, and tailored specifically to whatever concept that lesson is teaching. You do NOT need to match the animation style or logic of other lessons.
- **The Controls UI**: While the animation itself is unique, the *control bar* (Play/Pause, Prev/Next buttons, phase indicators) must visually match the standardized global design used across the site.
- **DO NOT** use large rounded buttons, floating controls, or completely custom translucent backdrops for the control bar.
- **DO** use a flat, consistent rectangular control bar pattern (like the one found in `PickleModuleCustomAnimation`) to ensure the user experience of clicking through steps feels identical on every lesson. Example of the standard control bar UI structure:
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
      <div className="text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-1 rounded bg-surface border border-hairline text-muted-foreground shadow-sm">
        Phase: {getPhaseName()}
      </div>
      <div className="font-mono text-xs text-muted-foreground">
        {step + 1} / {totalSteps}
      </div>
    </div>
  </div>
  ```
