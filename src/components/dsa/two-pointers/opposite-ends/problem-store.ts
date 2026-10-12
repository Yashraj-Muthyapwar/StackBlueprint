import { useSyncExternalStore } from "react";

import type { ProblemId } from "./trace";

/** Shares the problem picked in the visualizer with the runnable example further down the lesson. */
let current: ProblemId = "reverse";
const listeners = new Set<() => void>();

export function setOppositeEndsProblem(id: ProblemId) {
  if (id === current) return;
  current = id;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useOppositeEndsProblem(): ProblemId {
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => "reverse",
  );
}
