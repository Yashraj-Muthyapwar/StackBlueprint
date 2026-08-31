import type { DatasetId } from "../db/datasets";
import type { Engine } from "../db/db-client";

export type ChallengeEngine = Engine;
export type ChallengeDataset = DatasetId;

export type ChallengeDefinition = {
  id: string;
  version: number;
  title: string;
  group: "start" | "joins" | "aggregation" | "ctes" | "windows";
  difficulty: "beginner" | "intermediate" | "advanced";
  dataset: ChallengeDataset;
  engines: ChallengeEngine[];
  prompt: string;
  requirements: string[];
  requiredTables: string[];
  starterSql?: string;
  hints: string[];
  solutionSql: Partial<Record<ChallengeEngine, string>>;
  validator: ResultValidator;
  success: SuccessCopy;
};

export type ResultValidator =
  | {
      kind: "result-set";
      expectedSql: Partial<Record<ChallengeEngine, string>>;
      requiredColumns: string[];
      columnOrder: "exact" | "any";
      rowOrder: "exact" | "any";
      numericTolerance?: number;
    }
  | {
      kind: "scalar";
      expectedSql: Partial<Record<ChallengeEngine, string>>;
      field: string;
      numericTolerance?: number;
    };

export type SuccessCopy = {
  title: string;
  body: string;
  nextConcept?: string;
};

export type ErrorSpan = { from: number; to: number };

export type QueryErrorCategory =
  | "empty"
  | "multiple-statements"
  | "not-read-only"
  | "syntax"
  | "table-missing"
  | "column-missing"
  | "ambiguous-column"
  | "grouping"
  | "type-mismatch"
  | "timeout"
  | "engine-unavailable"
  | "unknown";

export type CheckReason =
  | "extra-column"
  | "missing-column"
  | "missing-rows"
  | "extra-rows"
  | "wrong-order"
  | "zero-rows"
  | "aggregate-mismatch"
  | "duplicate-rows"
  | "wrong-value";

export type CheckOutcome =
  | { state: "passed"; rowCount: number }
  | { state: "incorrect"; reason: CheckReason; detail?: string }
  | { state: "query-error"; category: QueryErrorCategory; errorSpan?: ErrorSpan; detail?: string }
  | { state: "unavailable"; message: string };

export type ChallengeProgress = {
  version: number;
  completedAt: number;
  attempts: number;
  revealedHintCount: number;
  revealedSolution: boolean;
  needsReview?: boolean;
};
