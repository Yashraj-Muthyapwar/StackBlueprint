import { useSyncExternalStore } from "react";

/**
 * Shares the problem picked in a `PatternVisualizer` with the `PatternExample` further down
 * the same lesson. Selections are keyed by problem set, so lessons never affect each other.
 */
const selected = new Map<string, string>();
const listeners = new Set<() => void>();

export function setSelectedProblem(problemSet: string, problemId: string) {
  if (selected.get(problemSet) === problemId) return;
  selected.set(problemSet, problemId);
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** The selected problem id for a set, or `fallbackId` until the learner picks one. */
export function useSelectedProblem(problemSet: string, fallbackId: string): string {
  return useSyncExternalStore(
    subscribe,
    () => selected.get(problemSet) ?? fallbackId,
    () => fallbackId,
  );
}
