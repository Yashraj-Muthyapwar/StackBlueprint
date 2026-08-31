import type { QueryErrorCategory, CheckReason, ChallengeDefinition } from "./types";

export function getErrorCopy(
  category: QueryErrorCategory,
  detail?: string,
  challenge?: ChallengeDefinition
): { title: string; body: string; actionText?: string } {
  switch (category) {
    case "empty":
      return {
        title: "Start with a SELECT query for this challenge.",
        body: "Your query was empty or only contained comments.",
        actionText: "Use starter"
      };
    case "multiple-statements":
      return {
        title: "Run one read-only query at a time in Challenges.",
        body: "We found multiple statements. Please remove the extra ones.",
        actionText: "Check semicolons"
      };
    case "not-read-only":
      return {
        title: "Challenges check query results, so use SELECT or WITH ... SELECT.",
        body: "Data modification or schema changes are not allowed in challenges."
      };
    case "syntax":
      return {
        title: `There is a SQL syntax issue${detail ? ` near ${detail}` : ""}.`,
        body: "Check for missing commas, unclosed quotes, or misspelled keywords.",
        actionText: "Show hint"
      };
    case "table-missing": {
      const tables = challenge?.requiredTables.join(", ");
      return {
        title: "That table is not available in this workspace.",
        body: tables ? `Try using one of this challenge's required tables: ${tables}.` : "Check the table name spelling."
      };
    }
    case "column-missing":
      return {
        title: `We could not find the column${detail ? ` ${detail}` : ""}.`,
        body: "Check the spelling or open the table in the Schema Explorer.",
      };
    case "ambiguous-column":
      return {
        title: "This column exists in more than one table.",
        body: "Prefix it with its table alias, for example: o.id.",
      };
    case "grouping":
      return {
        title: "This selected column must be grouped or aggregated.",
        body: "Every non-aggregated column in SELECT must appear in GROUP BY.",
      };
    case "type-mismatch":
      return {
        title: "These values cannot be compared in that form.",
        body: "You might be trying to compare a string to a number, or a date to a boolean.",
      };
    case "timeout":
      return {
        title: "This query is taking too long for the practice environment.",
        body: "Try breaking down the query or checking for a cross join (missing ON clause)."
      };
    case "engine-unavailable":
      return {
        title: "The SQL engine is still loading or could not start.",
        body: "Please wait a moment and try again.",
        actionText: "Retry"
      };
    case "unknown":
    default:
      return {
        title: "We could not run that query.",
        body: detail || "An unexpected error occurred.",
        actionText: "Try again"
      };
  }
}

export function getCheckFeedback(reason: CheckReason, detail?: string): { body: string } {
  switch (reason) {
    case "extra-column":
    case "missing-column":
      return { body: detail ? `Not quite yet. Check the required columns. ${detail} is incorrect.` : `Not quite yet. Make sure you return exactly the requested columns.` };
    case "missing-rows":
      return { body: "Your query ran, but it leaves out some expected rows. Check your JOIN conditions and WHERE filters." };
    case "extra-rows":
      return { body: "Your query includes extra rows that shouldn't be there. Look at the condition that identifies matches." };
    case "wrong-order":
      return { body: "The rows are right. Now sort them as requested in the prompt." };
    case "zero-rows":
      return { body: "Your query ran but returned no rows. Recheck the filter and whether NULL is tested with IS NULL." };
    case "aggregate-mismatch":
      return { body: "The grouping is close, but the totals do not match. Check the join grain before summing values." };
    case "duplicate-rows":
      return { body: "Some rows appear more than once. A join may be multiplying records; inspect the join keys and grouping." };
    case "wrong-value":
      return { body: "The result values don't quite match the expected output. Double check your logic." };
    default:
      return { body: "Not quite yet. Please try again." };
  }
}

export function categorizeEngineError(errorMsg: string): { category: QueryErrorCategory; detail?: string } {
  const msg = errorMsg.toLowerCase();
  
  if (msg.includes("syntax error")) {
    const match = msg.match(/syntax error at or near "([^"]+)"/i) || msg.match(/syntax error near "([^"]+)"/i) || msg.match(/syntax error near ([^\s]+)/i);
    return { category: "syntax", detail: match ? match[1] : undefined };
  }
  
  if (msg.includes("relation") && msg.includes("does not exist") || (msg.includes("catalog error") && msg.includes("table with name"))) {
    return { category: "table-missing" };
  }
  
  if (msg.includes("column") && msg.includes("does not exist")) {
    const match = msg.match(/column "([^"]+)" does not exist/i);
    return { category: "column-missing", detail: match ? match[1] : undefined };
  }
  
  if (msg.includes("ambiguous column") || msg.includes("column reference") && msg.includes("is ambiguous")) {
    return { category: "ambiguous-column" };
  }
  
  if (msg.includes("must appear in the group by") || msg.includes("not found in from clause") || (msg.includes("aggregate") && msg.includes("group by"))) {
    return { category: "grouping" };
  }
  
  if (msg.includes("type mismatch") || msg.includes("cannot compare") || msg.includes("operator does not exist")) {
    return { category: "type-mismatch" };
  }
  
  if (msg.includes("timeout") || msg.includes("memory limit") || msg.includes("aborted")) {
    return { category: "timeout" };
  }
  
  return { category: "unknown", detail: errorMsg };
}
