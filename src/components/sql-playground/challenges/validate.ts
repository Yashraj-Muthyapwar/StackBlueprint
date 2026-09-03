import type { QueryResult } from "../db/db-client";
import type { CheckOutcome, ResultValidator } from "./types";

function valuesEqual(a: any, b: any, tolerance: number = 0): boolean {
  if (a === b) return true;
  if (a === null || b === null || a === undefined || b === undefined) return false;

  const numA = Number(a);
  const numB = Number(b);
  if (!Number.isNaN(numA) && !Number.isNaN(numB)) {
    return Math.abs(numA - numB) <= tolerance;
  }

  return String(a) === String(b);
}

function rowsEqual(rowA: any, rowB: any, columns: string[], tolerance: number = 0): boolean {
  for (const col of columns) {
    // Case-insensitive property lookup
    const keyA = Object.keys(rowA).find((k) => k.toLowerCase() === col.toLowerCase());
    const keyB = Object.keys(rowB).find((k) => k.toLowerCase() === col.toLowerCase());

    const valA = keyA ? rowA[keyA] : undefined;
    const valB = keyB ? rowB[keyB] : undefined;

    if (!valuesEqual(valA, valB, tolerance)) {
      return false;
    }
  }
  return true;
}

export function validateResult(
  actual: QueryResult,
  expected: QueryResult,
  validator: ResultValidator,
): CheckOutcome {
  if (actual.rows.length === 0 && expected.rows.length > 0) {
    return { state: "incorrect", reason: "zero-rows" };
  }

  const actualColsLower = actual.fields.map((f) => f.name.toLowerCase());

  if (validator.kind === "numeric-range") {
    const reqColsLower = validator.requiredColumns.map((c) => c.toLowerCase());
    const stableColsLower = validator.stableColumns.map((c) => c.toLowerCase());

    for (const col of reqColsLower) {
      if (!actualColsLower.includes(col)) {
        return { state: "incorrect", reason: "missing-column", detail: col };
      }
    }

    for (const col of actualColsLower) {
      if (!reqColsLower.includes(col)) {
        return { state: "incorrect", reason: "extra-column", detail: col };
      }
    }

    if (actual.rows.length < validator.rowCount) {
      return { state: "incorrect", reason: "missing-rows" };
    }

    if (actual.rows.length > validator.rowCount) {
      return { state: "incorrect", reason: "extra-rows" };
    }

    if (validator.rowOrder === "exact") {
      for (let index = 0; index < actual.rows.length; index++) {
        if (!rowsEqual(actual.rows[index], expected.rows[index], stableColsLower)) {
          return { state: "incorrect", reason: "wrong-order" };
        }
      }
    } else if (!checkMultisetEquality(actual.rows, expected.rows, stableColsLower, 0)) {
      return { state: "incorrect", reason: "wrong-value" };
    }

    for (const range of validator.ranges) {
      const matchingField = actual.fields.find(
        (field) => field.name.toLowerCase() === range.field.toLowerCase(),
      );
      if (!matchingField) {
        return { state: "incorrect", reason: "missing-column", detail: range.field };
      }

      for (const row of actual.rows) {
        const value = Number(row[matchingField.name]);
        if (
          !Number.isFinite(value) ||
          value < range.minInclusive ||
          value > range.maxInclusive ||
          (range.integer && !Number.isInteger(value))
        ) {
          return { state: "incorrect", reason: "wrong-value", detail: range.field };
        }
      }
    }

    return { state: "passed", rowCount: actual.rows.length };
  }

  if (validator.kind === "result-set") {
    const reqColsLower = validator.requiredColumns.map((c) => c.toLowerCase());

    // Check missing columns
    for (const col of reqColsLower) {
      if (!actualColsLower.includes(col)) {
        return { state: "incorrect", reason: "missing-column", detail: col };
      }
    }

    // Check extra columns
    for (const col of actualColsLower) {
      if (!reqColsLower.includes(col)) {
        return { state: "incorrect", reason: "extra-column", detail: col };
      }
    }

    if (actual.rows.length < expected.rows.length) {
      return { state: "incorrect", reason: "missing-rows" };
    }

    if (actual.rows.length > expected.rows.length) {
      // Check if it might be duplicate rows or just extra wrong rows
      // We'll just say extra-rows for now unless we can prove duplicates.
      return { state: "incorrect", reason: "extra-rows" };
    }

    const tolerance = validator.numericTolerance || 0;

    if (validator.rowOrder === "exact") {
      for (let i = 0; i < expected.rows.length; i++) {
        if (!rowsEqual(actual.rows[i], expected.rows[i], reqColsLower, tolerance)) {
          // Could be wrong order or just wrong values. Let's do a multiset check to see if it's just order.
          const isMultisetEqual = checkMultisetEquality(
            actual.rows,
            expected.rows,
            reqColsLower,
            tolerance,
          );
          if (isMultisetEqual) {
            return { state: "incorrect", reason: "wrong-order" };
          }
          return { state: "incorrect", reason: "wrong-value" };
        }
      }
    } else {
      const isMultisetEqual = checkMultisetEquality(
        actual.rows,
        expected.rows,
        reqColsLower,
        tolerance,
      );
      if (!isMultisetEqual) {
        // Did they mess up an aggregate?
        if (
          validator.expectedSql.postgres?.includes("SUM") ||
          validator.expectedSql.postgres?.includes("COUNT")
        ) {
          return { state: "incorrect", reason: "aggregate-mismatch" };
        }
        return { state: "incorrect", reason: "wrong-value" };
      }
    }

    return { state: "passed", rowCount: actual.rows.length };
  } else {
    // scalar
    const fieldLower = validator.field.toLowerCase();
    if (!actualColsLower.includes(fieldLower)) {
      return { state: "incorrect", reason: "missing-column", detail: validator.field };
    }

    if (actual.rows.length > 1) {
      return { state: "incorrect", reason: "extra-rows" };
    }

    const tolerance = validator.numericTolerance || 0;
    const actualVal =
      actual.rows[0]?.[actual.fields.find((f) => f.name.toLowerCase() === fieldLower)!.name];
    const expectedVal =
      expected.rows[0]?.[expected.fields.find((f) => f.name.toLowerCase() === fieldLower)!.name];

    if (!valuesEqual(actualVal, expectedVal, tolerance)) {
      return { state: "incorrect", reason: "wrong-value" };
    }

    return { state: "passed", rowCount: 1 };
  }
}

function checkMultisetEquality(
  actualRows: any[],
  expectedRows: any[],
  columns: string[],
  tolerance: number,
): boolean {
  if (actualRows.length !== expectedRows.length) return false;

  const used = new Array(expectedRows.length).fill(false);

  for (const act of actualRows) {
    let found = false;
    for (let i = 0; i < expectedRows.length; i++) {
      if (!used[i] && rowsEqual(act, expectedRows[i], columns, tolerance)) {
        used[i] = true;
        found = true;
        break;
      }
    }
    if (!found) return false;
  }

  return true;
}
