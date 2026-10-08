/**
 * Quiz results are shared with Rivet through a window event, so the quiz
 * components stay decoupled from the tutor. Rivet hides while a quiz is in
 * progress and reappears with these results once it is submitted.
 */
export const QUIZ_RESULTS_EVENT = "quiz-results";
export const QUIZ_STARTED_EVENT = "quiz-started";

export interface QuizReviewItem {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  correct: boolean;
  explanation?: string;
}

export interface QuizResults {
  score: number;
  total: number;
  percentage: number;
  items: QuizReviewItem[];
}

export function emitQuizResults(items: QuizReviewItem[]) {
  const score = items.filter((i) => i.correct).length;
  const total = items.length;
  const detail: QuizResults = {
    score,
    total,
    percentage: total ? Math.round((score / total) * 100) : 0,
    items,
  };
  window.dispatchEvent(new CustomEvent<QuizResults>(QUIZ_RESULTS_EVENT, { detail }));
}
