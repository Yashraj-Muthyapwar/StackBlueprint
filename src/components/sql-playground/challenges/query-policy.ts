import { splitStatements } from "../db/db-client";
import type { QueryErrorCategory } from "./types";

export type PolicyOutcome =
  | { valid: true; sql: string }
  | { valid: false; category: QueryErrorCategory; detail?: string };

/** Longest query a learner may submit. Real exercises are a few hundred characters. */
export const MAX_QUERY_LENGTH = 5000;

/**
 * Words that may not appear anywhere in a challenge query. They are checked
 * after comments and quoted text are removed, so a data-changing statement
 * cannot hide inside `WITH x AS (DELETE ... RETURNING *) SELECT ...`.
 * INTO blocks SELECT ... INTO new_table.
 */
const BANNED_WORDS = new Set([
  "insert", "update", "delete", "merge", "into", "copy", "call", "do",
  "execute", "prepare", "listen", "notify", "vacuum", "lock", "reset",
]);

/** First words of statements that change data, schema, settings or transactions. */
const WRITE_STARTERS = new Set([
  "insert", "update", "delete", "merge", "create", "alter", "drop", "truncate", "call", "do",
  "copy", "attach", "detach", "install", "load", "begin", "start", "commit", "rollback", "end",
  "savepoint", "grant", "revoke", "set", "reset", "vacuum", "analyze", "lock", "listen", "notify",
  "prepare", "execute", "refresh", "comment", "explain",
]);

/** Functions that sleep, read the host, change settings, or run SQL held in a string. */
const BANNED_FUNCTION = /^(pg_sleep|pg_read_|pg_ls_|pg_stat_file|pg_terminate_|pg_cancel_|pg_reload_|pg_switch_|pg_advisory|pg_notify|pg_logical|pg_create_|pg_drop_|pg_promote|lo_|dblink|set_config|current_setting_|query_to_xml|query_to_xmlschema|query_to_xml_and_xmlschema|table_to_xml|schema_to_xml|database_to_xml|cursor_to_xml|xmlquery|txid_|nextval|setval)/;

/**
 * Replace comments, string literals, quoted identifiers and $$ bodies with a
 * space, leaving only SQL tokens. An unterminated quote swallows the rest of
 * the text; the database rejects such a query anyway.
 */
export function stripQuotedText(sql: string): string {
  let out = "";
  let i = 0;
  while (i < sql.length) {
    const ch = sql[i];
    const next = sql[i + 1];

    if (ch === "-" && next === "-") {
      const nl = sql.indexOf("\n", i);
      i = nl === -1 ? sql.length : nl;
      out += " ";
      continue;
    }
    if (ch === "/" && next === "*") {
      // PostgreSQL block comments nest.
      let depth = 1;
      i += 2;
      while (i < sql.length && depth > 0) {
        if (sql[i] === "/" && sql[i + 1] === "*") { depth++; i += 2; }
        else if (sql[i] === "*" && sql[i + 1] === "/") { depth--; i += 2; }
        else i++;
      }
      out += " ";
      continue;
    }
    if (ch === "'" || ch === '"') {
      // E'...' strings treat backslash as an escape character.
      const prev = sql[i - 1];
      const escapeString = ch === "'" && (prev === "E" || prev === "e") && !/[A-Za-z0-9_]/.test(sql[i - 2] ?? " ");
      let j = i + 1;
      while (j < sql.length) {
        if (escapeString && sql[j] === "\\") { j += 2; continue; }
        if (sql[j] === ch) {
          if (sql[j + 1] === ch) { j += 2; continue; }
          break;
        }
        j++;
      }
      i = j + 1;
      out += " ";
      continue;
    }
    if (ch === "$") {
      const tag = /^\$[A-Za-z_]*\$/.exec(sql.slice(i));
      if (tag) {
        const close = sql.indexOf(tag[0], i + tag[0].length);
        i = close === -1 ? sql.length : close + tag[0].length;
        out += " ";
        continue;
      }
    }
    out += ch;
    i++;
  }
  return out;
}

export function enforceQueryPolicy(sql: string): PolicyOutcome {
  if (sql.length > MAX_QUERY_LENGTH) {
    return { valid: false, category: "unknown", detail: `Queries are limited to ${MAX_QUERY_LENGTH} characters.` };
  }

  const statements = splitStatements(sql);

  if (statements.length === 0) {
    return { valid: false, category: "empty" };
  }

  if (statements.length > 1) {
    return { valid: false, category: "multiple-statements" };
  }

  const stmt = statements[0];
  const tokens = stripQuotedText(stmt).toLowerCase().match(/[a-z_][a-z0-9_$]*/g) ?? [];

  const first = tokens[0];
  if (!first) {
    return { valid: false, category: "empty" };
  }

  if (first !== "select" && first !== "with") {
    // A real write or schema command is read-only trouble. Anything else is
    // most likely a typo such as SELEC, so point at the keyword instead.
    return WRITE_STARTERS.has(first)
      ? { valid: false, category: "not-read-only", detail: first.toUpperCase() }
      : { valid: false, category: "syntax", detail: first };
  }

  for (const token of tokens) {
    if (BANNED_WORDS.has(token) || BANNED_FUNCTION.test(token)) {
      return { valid: false, category: "not-read-only", detail: token.toUpperCase() };
    }
  }

  return { valid: true, sql: stmt };
}
