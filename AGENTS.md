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
* **Images**: Whenever an image is included in a lesson, you must use the project's main image component (e.g., the zoomable image component) to enable the standard on-click expansion effect.
* **Key Takeaways**: Every lesson must end with a clearly defined "Key Takeaways" section.
* **Quizzes & Completion**: 
  * A Quiz section should be added if appropriate for the lesson content, though it can be skipped if not applicable.
  * If a quiz is present, it MUST ALWAYS be placed at the very end of the lesson content (i.e., AFTER the Key Takeaways section).
  * You MUST ALWAYS add a button to mark the lesson as completed at the end of the lesson, regardless of whether a quiz is present.

### 3. Track Creation
* **Design Uniformity**: When creating a new learning track, you must strictly follow the design and layout patterns of existing tracks (e.g., the Data Engineering track, typically at `/data-engineering`).
* **Required Elements**: Ensure the new track includes:
  * Uniform cards for displaying topics/modules.
  * Consistent scroll behaviors.
  * Standard side headers.
  * Appropriate logos matching the UI system.
* **Goal**: The layout, feel, and functionality must be perfectly uniform across all tracks in the application.
