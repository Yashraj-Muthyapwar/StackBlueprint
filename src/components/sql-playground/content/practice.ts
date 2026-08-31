import type { Engine } from "../db/db-client";
import type { DatasetId } from "../db/datasets";

export interface PlaygroundPractice {
  id: string;
  title: string;
  prompt: string;
  dataset: DatasetId;
  engine: Engine;
  /** When present, loading this lesson exercise enables checked Challenge Mode. */
  challengeId?: string;
  starterSql: string;
}

/**
 * Short, trusted exercises launched from SQL lessons. IDs, rather than raw SQL
 * in the URL, keep links compact and make every launchable exercise reviewable.
 */
const PRACTICES: Record<string, PlaygroundPractice> = {
  "cycledepot-customer-projection": {
    id: "cycledepot-customer-projection",
    title: "Build a customer directory",
    prompt:
      "Return every customer's id, name, and country. Rename name to customer_name. The result should have 60 rows and the columns id, customer_name, and country.",
    dataset: "cycledepot",
    engine: "postgres",
    challengeId: "cycle-depot-customer-directory",
    starterSql: `-- Cycle Depot practice: build a customer directory.
-- Return id, name as customer_name, and country from customers.
-- Write your SELECT query below, then choose Run and check.`,
  },
};

export function getPractice(id: string | null): PlaygroundPractice | null {
  return id ? (PRACTICES[id] ?? null) : null;
}
