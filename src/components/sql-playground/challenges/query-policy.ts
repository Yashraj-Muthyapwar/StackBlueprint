import { splitStatements, stripNoise } from "../db/db-client";
import type { QueryErrorCategory } from "./types";

export type PolicyOutcome = 
  | { valid: true; sql: string }
  | { valid: false; category: QueryErrorCategory; detail?: string };

const BANNED_KEYWORDS = [
  "INSERT", "UPDATE", "DELETE", "MERGE",
  "CREATE", "ALTER", "DROP", "TRUNCATE",
  "CALL", "COPY", "ATTACH", "INSTALL", "LOAD",
  "BEGIN", "COMMIT", "ROLLBACK", "GRANT", "REVOKE"
];

function getFirstKeyword(sql: string): string | null {
  const clean = stripNoise(sql);
  const match = clean.match(/^([a-zA-Z]+)/);
  return match ? match[1].toUpperCase() : null;
}

export function enforceQueryPolicy(sql: string): PolicyOutcome {
  const statements = splitStatements(sql);
  
  if (statements.length === 0) {
    return { valid: false, category: "empty" };
  }
  
  if (statements.length > 1) {
    return { valid: false, category: "multiple-statements" };
  }
  
  const stmt = statements[0];
  const firstKeyword = getFirstKeyword(stmt);
  
  if (!firstKeyword) {
    return { valid: false, category: "empty" };
  }
  
  if (firstKeyword !== "SELECT" && firstKeyword !== "WITH") {
    if (BANNED_KEYWORDS.includes(firstKeyword)) {
      return { valid: false, category: "not-read-only" };
    }
    // If it's something else not explicitly allowed
    return { valid: false, category: "not-read-only" };
  }
  
  return { valid: true, sql: stmt };
}
