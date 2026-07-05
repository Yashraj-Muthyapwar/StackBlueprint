import { useState, useEffect, useCallback } from "react";

const PROGRESS_KEY = "stackblueprint-progress";

export function useProgress() {
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  const loadProgress = () => {
    try {
      const data = localStorage.getItem(PROGRESS_KEY);
      if (data) {
        setCompletedLessons(JSON.parse(data));
      }
    } catch (e) {
      console.error("Failed to load progress", e);
    }
  };

  useEffect(() => {
    loadProgress();
    const handleStorage = () => loadProgress();
    
    // Listen for custom event triggered by other components within the same window
    window.addEventListener("lesson-progress-updated", handleStorage);
    // Listen for standard storage event triggered by other tabs
    window.addEventListener("storage", handleStorage);
    
    return () => {
      window.removeEventListener("lesson-progress-updated", handleStorage);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const markComplete = useCallback((slug: string) => {
    setCompletedLessons((prev) => {
      if (prev.includes(slug)) return prev;
      const next = [...prev, slug];
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event("lesson-progress-updated"));
      return next;
    });
  }, []);

  const markIncomplete = useCallback((slug: string) => {
    setCompletedLessons((prev) => {
      const next = prev.filter((s) => s !== slug);
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event("lesson-progress-updated"));
      return next;
    });
  }, []);

  return {
    completedLessons,
    markComplete,
    markIncomplete,
    isCompleted: (slug: string) => completedLessons.includes(slug),
  };
}
