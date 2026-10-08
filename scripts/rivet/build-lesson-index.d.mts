import type { Plugin } from "vite";

export function generateLessonIndex(): {
  available: number;
  placeholders: number;
  changed: boolean;
};
export function rivetLessonIndex(): Plugin;
