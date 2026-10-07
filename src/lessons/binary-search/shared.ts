/** 1-based line number of the nth line containing `needle`, so highlights can never drift from the code. */
export function lineOf(code: string, needle: string, nth = 0): number {
  let seen = 0;
  const lines = code.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(needle)) {
      if (seen === nth) return i + 1;
      seen += 1;
    }
  }
  throw new Error(`"${needle}" not found in code (occurrence ${nth})`);
}

/** How many halvings a range of `n` cells needs in the worst case. */
export const maxProbes = (n: number) => (n <= 0 ? 0 : Math.floor(Math.log2(n)) + 1);
