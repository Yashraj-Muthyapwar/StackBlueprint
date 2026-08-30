/**
 * Work out which part of the SQL an engine error is complaining about.
 *
 * PostgreSQL usually reports a 1-based character position, which is exact.
 * DuckDB does sometimes, and otherwise both engines name the offending
 * identifier in the message, which is enough to underline the right token.
 */

export interface ErrorSpan {
  from: number;
  to: number;
}

/** Skip matches inside comments and string literals. */
function isInLiteral(sql: string, index: number): boolean {
  let inLine = false;
  let inBlock = false;
  let quote: string | null = null;

  for (let i = 0; i < index; i++) {
    const ch = sql[i];
    const next = sql[i + 1];
    if (inLine) {
      if (ch === "\n") inLine = false;
      continue;
    }
    if (inBlock) {
      if (ch === "*" && next === "/") {
        inBlock = false;
        i++;
      }
      continue;
    }
    if (quote) {
      if (ch === quote) {
        if (next === quote) i++;
        else quote = null;
      }
      continue;
    }
    if (ch === "-" && next === "-") {
      inLine = true;
      i++;
      continue;
    }
    if (ch === "/" && next === "*") {
      inBlock = true;
      i++;
      continue;
    }
    if (ch === "'" || ch === '"') quote = ch;
  }
  return inLine || inBlock || quote !== null;
}

/** Find `token` as a whole word, ignoring comments and literals. */
function findToken(sql: string, token: string): ErrorSpan | null {
  if (!token) return null;
  const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(?<![A-Za-z0-9_])${escaped}(?![A-Za-z0-9_])`, "gi");
  let match: RegExpExecArray | null;
  while ((match = re.exec(sql)) !== null) {
    if (!isInLiteral(sql, match.index)) {
      return { from: match.index, to: match.index + match[0].length };
    }
  }
  return null;
}

/** Widen an offset to cover the word sitting at it. */
function wordAt(sql: string, offset: number): ErrorSpan {
  const clamped = Math.max(0, Math.min(offset, Math.max(0, sql.length - 1)));
  let from = clamped;
  let to = clamped;
  while (from > 0 && /[A-Za-z0-9_.$"]/.test(sql[from - 1])) from--;
  while (to < sql.length && /[A-Za-z0-9_.$"]/.test(sql[to])) to++;
  if (to === from) to = Math.min(sql.length, from + 1);
  return { from, to };
}

/**
 * @param sql       the exact text that was executed
 * @param message   the engine's error message
 * @param position  1-based character position, when the driver supplied one
 */
export function locateError(sql: string, message: string, position?: number): ErrorSpan | null {
  if (!sql) return null;

  // 1. An explicit position from the driver is authoritative.
  if (typeof position === "number" && position > 0 && position <= sql.length + 1) {
    return wordAt(sql, position - 1);
  }

  // 2. Some messages carry "Position: 42" or "LINE 3: ... " markers.
  const posInMessage = /\bposition:?\s*(\d+)/i.exec(message);
  if (posInMessage) {
    const n = Number(posInMessage[1]);
    if (n > 0 && n <= sql.length + 1) return wordAt(sql, n - 1);
  }

  // 3. Named identifiers: column "revenue" does not exist, near "QUALIFY", etc.
  const quoted = [...message.matchAll(/"([^"]{1,64})"/g)].map((m) => m[1]);
  for (const token of quoted) {
    const found = findToken(sql, token);
    if (found) return found;
  }

  // 4. Unquoted forms DuckDB likes: Referenced column "x" / Table with name X.
  const named =
    /(?:column|table|relation|function|type)\s+(?:with\s+name\s+)?([A-Za-z_][A-Za-z0-9_.]*)/i.exec(
      message,
    );
  if (named) {
    const found = findToken(sql, named[1]);
    if (found) return found;
  }

  // 5. "LINE 3:" without a position: underline that whole line.
  const line = /\bLINE\s+(\d+)\s*:/i.exec(message);
  if (line) {
    const wanted = Number(line[1]);
    let offset = 0;
    const lines = sql.split("\n");
    for (let i = 0; i < lines.length; i++) {
      if (i + 1 === wanted) {
        const trimmed = lines[i].trimStart();
        const lead = lines[i].length - trimmed.length;
        return { from: offset + lead, to: offset + lines[i].length };
      }
      offset += lines[i].length + 1;
    }
  }

  return null;
}
