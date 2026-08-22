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
