# DSA Patterns — Visual Explainer

A small note on design directions: the directions tool requires a screenshot of an existing UI to riff on, and this is a greenfield build, so I'm committing to one strong direction up front. After v1 ships you'll be able to see real screens, and we can then generate 3 redesign directions to refine the look.

## Design direction (committed)

**"Debugger Exhibit"** — a debugger meets a museum exhibit.

- Deep ink background (`#0B0D12`), soft surface panels (`#11141B`), hairline borders (`#1F232C`).
- Accent: electric mint `#5EEAD4` for the left pointer, warm amber `#F5A524` for the right pointer, violet `#A78BFA` for the "mid" / Dutch-flag pivot, muted rose `#FB7185` for swap/compare flashes.
- Typography: `Geist Sans` for UI, `JetBrains Mono` for code and array cell labels. Tight tracking on headings.
- Motion: spring-eased pointer glides, arc-tween swaps, color-wash partitions, sliding code-line highlight bar. Powered by Framer Motion.

No gradients-on-white, no purple-indigo SaaS look, no cartoon icons. Tools-for-thought feel — Linear chrome, Cursor editor surface, 3Blue1Brown precision.

## What gets built

### Routes
```
/                              Landing — roadmap overview with pattern cards
/patterns/two-pointers         Pattern intro + 3 variant cards
/patterns/two-pointers/opposite-ends
/patterns/two-pointers/fast-slow
/patterns/two-pointers/dutch-flag
```
Other categories (Sliding Window, Binary Search, BFS/DFS, DP…) appear in the sidebar as **locked** items with a subtle lock glyph, so the extension story is visible from day one.

### Layout
- Persistent collapsible left **roadmap sidebar** (shadcn sidebar), grouped by category, active lesson highlighted, locked items dimmed with tooltip "Coming soon".
- Lesson page = split workspace:
  - **Left pane (~55%)**: animated array — labeled monospace tiles, pointer carets above/below with name labels (`L`, `R`, `slow`, `fast`, `low`, `mid`, `high`), partition tint bands, swap arcs, compare-flash ring.
  - **Right pane (~45%)**: Python code with line numbers, language pill, **active-line highlight bar** that slides in sync with the step.
- Below workspace: **transport bar** — Prev / Play-Pause / Next / Reset, speed slider (0.5×–2×), step counter `Step 7 / 24`.
- Below transport: **narration card** — one-sentence plain-English description of what just happened ("Sum is 14, target is 13 — move right pointer left.").

### The sync engine (the core abstraction)

Each lesson is a pure data file: a Python source string + an array of **steps**. Every step is the atomic unit of "what the code is doing right now":

```ts
type Step = {
  line: number;              // code line to highlight
  array: number[];           // array snapshot at this step
  pointers: { name: string; index: number; color: 'mint'|'amber'|'violet' }[];
  partitions?: { from: number; to: number; tone: 'low'|'mid'|'high' }[];
  highlight?: { kind: 'compare'|'swap'|'match'; indices: number[] };
  narration: string;         // plain-English explanation
};
```

A single `LessonPlayer` component consumes `{ code, steps }` and drives both panes from one `stepIndex`. This is the contract that makes extension to hundreds of patterns trivial — new lesson = new `steps[]`.

### The three Two Pointers lessons (Python)

1. **Opposite Ends** — Two-Sum on sorted array. `L` and `R` converge; compare→move→match. ~20 steps on `[1,3,4,5,7,10,11]`, target 9.
2. **Fast & Slow (Tortoise & Hare)** — cycle detection on a linked list rendered as positioned nodes; `slow` and `fast` chase until they meet, or `fast` falls off the end. ~25 steps with two example lists (cycle / no cycle).
3. **Dutch Flag** — partition `[2,0,2,1,1,0,0,2,1]` into <1, =1, >1 zones using `low/mid/high`. Partition bands tint as boundaries move; swap arcs on every swap. ~30 steps.

### Controls behavior
- **Play** auto-advances at the slider speed; pauses at end.
- **Next/Prev** scrub manually; spacebar toggles play/pause; ←/→ scrub.
- **Reset** returns to step 0.

## Technical details

- **Stack**: TanStack Start (already configured), Tailwind v4 tokens in `src/styles.css`, shadcn primitives, Framer Motion for animation, `react-syntax-highlighter` (Prism, one-dark-pro tweaked) for the Python pane.
- **Animation primitives**: `motion.div` with `layout` + `layoutId` for pointer carets and array tiles so swaps animate as arc tweens automatically. Code-line highlight is a single absolutely-positioned `motion.div` that animates `y` to the active line's offset.
- **Files added**
  ```
  src/routes/index.tsx                                  (replaces placeholder — landing)
  src/routes/patterns.two-pointers.tsx                  (variant index)
  src/routes/patterns.two-pointers.opposite-ends.tsx
  src/routes/patterns.two-pointers.fast-slow.tsx
  src/routes/patterns.two-pointers.dutch-flag.tsx
  src/components/app-sidebar.tsx                        (roadmap sidebar)
  src/components/lesson/LessonPlayer.tsx                (orchestrator)
  src/components/lesson/ArrayCanvas.tsx                 (left pane, array variant)
  src/components/lesson/LinkedListCanvas.tsx            (left pane, fast/slow variant)
  src/components/lesson/CodePane.tsx                    (right pane, synced highlight)
  src/components/lesson/TransportBar.tsx
  src/components/lesson/NarrationCard.tsx
  src/lessons/two-pointers/opposite-ends.ts             (code + steps[])
  src/lessons/two-pointers/fast-slow.ts
  src/lessons/two-pointers/dutch-flag.ts
  src/lessons/roadmap.ts                                (sidebar tree + locked items)
  src/routes/__root.tsx                                 (wrap in SidebarProvider, set fonts)
  src/styles.css                                        (tokens + fonts)
  ```
- **Fonts**: install `@fontsource-variable/geist`, `@fontsource-variable/jetbrains-mono` and import in `src/main.tsx` (or root) — no Google Fonts CDN.
- No backend needed for v1 (no Lovable Cloud).
- SEO: per-route `head()` with lesson-specific title + description.

## Out of scope (v1)
- User accounts, progress tracking, custom array inputs (locked future items show "Coming soon").
- More than the 3 Two Pointers variants.
- Mobile-optimized split pane (we'll stack on `<lg` but the experience is desktop-first).

## After approval
Once this lands and you've used it, I'll capture screenshots and run `create_directions` to give you 3 refined visual takes you can choose from before we scale to more patterns.
