// Tiny parsers + validators used by lesson inputs.

export function parseIntArray(raw: string): number[] {
  const cleaned = raw.replace(/[\[\]]/g, "").trim();
  if (!cleaned) return [];
  return cleaned
    .split(/[,\s]+/)
    .filter(Boolean)
    .map((s) => {
      const n = Number(s);
      if (!Number.isFinite(n)) throw new Error(`"${s}" is not a number`);
      return n;
    });
}

export function stringifyIntArray(arr: number[]): string {
  return arr.join(", ");
}

export function parseIntMatrix(raw: string): number[][] {
  // rows separated by ; or newline, cells by , or space
  const rows = raw
    .split(/[;\n]+/)
    .map((r) => r.trim())
    .filter(Boolean);
  const out = rows.map(parseIntArray);
  if (out.length === 0) return [];
  const w = out[0].length;
  for (const r of out) {
    if (r.length !== w) throw new Error("Matrix rows must have the same length");
  }
  return out;
}

export function stringifyIntMatrix(m: number[][]): string {
  return m.map((r) => r.join(", ")).join("; ");
}

export function parseIntPairs(raw: string): [number, number][] {
  // "0,3; 2,5; 1,4"
  return raw
    .split(/[;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      const parts = s.split(/[,\s]+/).filter(Boolean).map(Number);
      if (parts.length !== 2 || parts.some((n) => !Number.isFinite(n))) {
        throw new Error(`"${s}" is not a pair`);
      }
      return [parts[0], parts[1]] as [number, number];
    });
}

export function stringifyIntPairs(p: [number, number][]): string {
  return p.map(([a, b]) => `${a},${b}`).join("; ");
}

export function isSortedAsc(arr: number[]): boolean {
  for (let i = 1; i < arr.length; i++) if (arr[i] < arr[i - 1]) return false;
  return true;
}

export function isAllIn(arr: number[], set: number[]): boolean {
  const s = new Set(set);
  return arr.every((x) => s.has(x));
}
