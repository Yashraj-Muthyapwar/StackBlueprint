import type { ChallengeProgress } from "./types";
import type { Engine } from "../db/db-client";
import type { DatasetId } from "../db/datasets";

const PROGRESS_PREFIX = "sqlx.challenge-progress.";
const DRAFT_PREFIX = "sqlx.challenge-draft.";

export function getProgress(challengeId: string): ChallengeProgress | null {
  try {
    const data = localStorage.getItem(`${PROGRESS_PREFIX}${challengeId}`);
    if (data) {
      return JSON.parse(data) as ChallengeProgress;
    }
  } catch {
    // Ignore parse errors
  }
  return null;
}

export function saveProgress(challengeId: string, progress: ChallengeProgress): void {
  try {
    localStorage.setItem(`${PROGRESS_PREFIX}${challengeId}`, JSON.stringify(progress));
    window.dispatchEvent(new Event("sqlx-progress-updated"));
  } catch {
    // Ignore storage errors
  }
}

export function deleteProgress(challengeId: string): void {
  try {
    localStorage.removeItem(`${PROGRESS_PREFIX}${challengeId}`);
    window.dispatchEvent(new Event("sqlx-progress-updated"));
  } catch {
    // Ignore storage errors
  }
}

export function getChallengeDraft(challengeId: string, engine: Engine, dataset: DatasetId): string | null {
  return localStorage.getItem(`${DRAFT_PREFIX}${challengeId}.${engine}.${dataset}`);
}

export function saveChallengeDraft(challengeId: string, engine: Engine, dataset: DatasetId, sql: string): void {
  localStorage.setItem(`${DRAFT_PREFIX}${challengeId}.${engine}.${dataset}`, sql);
}

export function clearChallengeDraft(challengeId: string, engine: Engine, dataset: DatasetId): void {
  localStorage.removeItem(`${DRAFT_PREFIX}${challengeId}.${engine}.${dataset}`);
}
