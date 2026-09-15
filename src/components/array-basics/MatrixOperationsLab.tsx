import { useMemo, useState } from "react";

type Operation = "create" | "insert" | "traverse" | "access" | "search" | "delete";

const initialMatrix = [
  [4, 8, 15],
  [16, 23, 42],
  [50, 60, 70],
];

const operations: { id: Operation; label: string }[] = [
  { id: "create", label: "Create" },
  { id: "insert", label: "Insert row" },
  { id: "traverse", label: "Traverse" },
  { id: "access", label: "Access" },
  { id: "search", label: "Search" },
  { id: "delete", label: "Delete row" },
];

export function MatrixOperationsLab() {
  const [operation, setOperation] = useState<Operation>("create");
  const [matrix, setMatrix] = useState(initialMatrix);
  const [row, setRow] = useState(1);
  const [column, setColumn] = useState(1);
  const [value, setValue] = useState(42);
  const [message, setMessage] = useState("Choose an operation, then run it on the matrix below.");
  const [output, setOutput] = useState("");

  const safeRow = Math.max(0, Math.min(row, matrix.length));
  const safeColumn = Math.max(0, Math.min(column, (matrix[0]?.length ?? 1) - 1));
  const code = useMemo(
    () => codeFor(operation, safeRow, safeColumn, value),
    [operation, safeRow, safeColumn, value],
  );
  const needsCoordinates = operation === "access";
  const needsRow = operation === "insert" || operation === "delete";
  const needsValue = operation === "search";

  const resetForOperation = (next: Operation) => {
    setOperation(next);
    setMatrix(initialMatrix);
    setOutput("");
    setMessage(
      `Ready to ${operations.find((item) => item.id === next)?.label.toLowerCase()} with NumPy.`,
    );
  };

  const run = () => {
    if (operation === "create") {
      setMatrix(initialMatrix);
      setOutput("");
      setMessage("Created a 3 × 3 NumPy matrix.");
      return;
    }
    if (operation === "insert") {
      const inserted = [...matrix];
      inserted.splice(safeRow, 0, [90, 91, 92]);
      setMatrix(inserted);
      setOutput("");
      setMessage(`Inserted row [90, 91, 92] at row index ${safeRow}.`);
      return;
    }
    if (operation === "traverse") {
      setOutput(matrix.flat().join(" → "));
      setMessage(
        `Traversal visits ${matrix.length * (matrix[0]?.length ?? 0)} cells in row-major order.`,
      );
      return;
    }
    if (operation === "access") {
      setOutput("");
      if (safeRow >= matrix.length) {
        setMessage("That row is outside this matrix.");
      } else {
        setMessage(`matrix[${safeRow}, ${safeColumn}] = ${matrix[safeRow][safeColumn]}`);
      }
      return;
    }
    if (operation === "search") {
      setOutput("");
      const found = matrix.flatMap((items, rowIndex) =>
        items.flatMap((item, columnIndex) => (item === value ? [[rowIndex, columnIndex]] : [])),
      );
      setMessage(
        found.length
          ? `${value} found at ${found.map(([r, c]) => `(${r}, ${c})`).join(", ")}.`
          : `${value} is not present.`,
      );
      return;
    }
    if (safeRow >= matrix.length) {
      setMessage("That row is outside this matrix.");
      return;
    }
    const deleted = matrix.filter((_, rowIndex) => rowIndex !== safeRow);
    setMatrix(deleted);
    setOutput("");
    setMessage(`Deleted row index ${safeRow}. NumPy returns a new matrix.`);
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-hairline bg-slate-50 shadow-sm dark:bg-surface">
      <div className="border-b border-hairline bg-surface-2/40 px-5 py-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          2D NumPy operations lab
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose an operation, adjust its inputs, and run it on a matrix.
        </p>
      </div>
      <div className="grid gap-5 p-5 lg:grid-cols-[1fr_310px]">
        <div>
          <div className="inline-flex rounded-lg border border-mint bg-mint/10 px-3 py-2 font-mono text-xs uppercase tracking-[0.12em] text-mint">
            NumPy matrix
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {operations.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => resetForOperation(item.id)}
                className={`rounded-md px-2.5 py-1.5 text-xs font-medium ${operation === item.id ? "bg-foreground text-background" : "bg-surface-2 text-muted-foreground hover:text-foreground"}`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="mt-5 rounded-xl border border-hairline bg-background p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              Current matrix
            </p>
            <div
              className="mt-3 inline-grid gap-1.5"
              style={{ gridTemplateColumns: `repeat(${matrix[0]?.length ?? 1}, minmax(0, 1fr))` }}
            >
              {matrix.flatMap((items, rowIndex) =>
                items.map((item, columnIndex) => (
                  <div
                    key={`${rowIndex}-${columnIndex}`}
                    className={`min-w-16 rounded-lg border px-3 py-2 text-center font-mono font-semibold ${cellTone(operation, rowIndex, columnIndex, safeRow, safeColumn, item, value)}`}
                  >
                    <span>{item}</span>
                    <span className="ml-1 text-[10px] text-muted-foreground">
                      [{rowIndex},{columnIndex}]
                    </span>
                  </div>
                )),
              )}
            </div>
          </div>
          {needsCoordinates || needsRow || needsValue ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {(needsCoordinates || needsRow) && (
                <NumberInput label="Row index" value={row} onChange={setRow} />
              )}
              {needsCoordinates && (
                <NumberInput label="Column index" value={column} onChange={setColumn} />
              )}
              {needsValue && <NumberInput label="Target value" value={value} onChange={setValue} />}
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              This operation uses the current matrix directly.
            </p>
          )}
          <button
            type="button"
            onClick={run}
            className="mt-4 rounded-lg bg-mint px-4 py-2.5 font-medium text-background"
          >
            Run {operations.find((item) => item.id === operation)?.label}
          </button>
          <p className="mt-3 rounded-lg border border-mint/25 bg-mint/5 px-3 py-2 text-sm text-foreground">
            {message}
          </p>
          {output ? (
            <div className="mt-3 rounded-lg border border-hairline bg-slate-950 px-3 py-2.5 text-slate-100">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate-400">
                Output
              </p>
              <pre className="mt-1 overflow-x-auto font-mono text-sm text-mint">{output}</pre>
            </div>
          ) : null}
        </div>
        <CodePreview code={code} />
      </div>
    </section>
  );
}

function NumberInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="text-sm text-muted-foreground">
      {label}
      <input
        type="number"
        min="0"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-1 block w-full rounded-lg border border-hairline bg-background px-3 py-2 text-foreground"
      />
    </label>
  );
}

function cellTone(
  operation: Operation,
  row: number,
  column: number,
  targetRow: number,
  targetColumn: number,
  item: number,
  value: number,
) {
  if (operation === "traverse") return "border-mint/50 bg-mint/10 text-mint";
  if (operation === "search" && item === value) return "border-amber bg-amber/15 text-amber";
  if (operation === "access" && row === targetRow && column === targetColumn)
    return "border-mint bg-mint/10 text-mint";
  if (operation === "delete" && row === targetRow)
    return "border-rose-400 bg-rose-500/10 text-rose-600";
  if (operation === "insert" && row === targetRow) return "border-mint bg-mint/10 text-mint";
  return "border-hairline bg-surface-2";
}

function CodePreview({ code }: { code: string }) {
  return (
    <pre className="min-w-0 overflow-hidden rounded-xl border border-hairline bg-slate-950 p-4 font-mono text-[13px] leading-relaxed text-slate-100">
      <code className="whitespace-pre-wrap break-words">
        {code.split("\n").map((line, index) => (
          <span key={index} className="block">
            {highlightCode(line) || " "}
          </span>
        ))}
      </code>
    </pre>
  );
}

function highlightCode(line: string) {
  return line
    .split(/(#[^\n]*|"[^"]*"|'[^']*'|\b(?:as|for|import|in|print)\b|\b\d+\b)/g)
    .map((part, index) => {
      if (part.startsWith("#"))
        return (
          <span key={index} className="text-slate-400">
            {part}
          </span>
        );
      if (part.startsWith('"') || part.startsWith("'"))
        return (
          <span key={index} className="text-amber-300">
            {part}
          </span>
        );
      if (/^(as|for|import|in|print)$/.test(part))
        return (
          <span key={index} className="text-fuchsia-300">
            {part}
          </span>
        );
      if (/^\d+$/.test(part))
        return (
          <span key={index} className="text-violet-300">
            {part}
          </span>
        );
      return part;
    });
}

function codeFor(operation: Operation, row: number, column: number, value: number) {
  const lines: Record<Operation, string> = {
    create: "# matrix is created in the line above",
    insert: `matrix = np.insert(matrix, ${row}, [[90, 91, 92]], axis=0)`,
    traverse: "for row in matrix:\n    for item in row:\n        print(item)",
    access: `print(matrix[${row}, ${column}])`,
    search: `print(np.argwhere(matrix == ${value}))`,
    delete: `matrix = np.delete(matrix, ${row}, axis=0)`,
  };
  return `import numpy as np\n\nmatrix = np.array([[4, 8, 15], [16, 23, 42], [50, 60, 70]])\n\n${lines[operation]}`;
}
