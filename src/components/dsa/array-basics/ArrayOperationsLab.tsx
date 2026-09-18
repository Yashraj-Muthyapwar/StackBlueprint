import { useMemo, useState } from "react";

type Backend = "array" | "numpy";
type Operation =
  | "create"
  | "insert"
  | "traverse"
  | "access"
  | "search"
  | "delete"
  | "pop"
  | "remove";

const operations: { id: Operation; label: string }[] = [
  { id: "create", label: "Create" },
  { id: "insert", label: "Insert" },
  { id: "traverse", label: "Traverse" },
  { id: "access", label: "Access" },
  { id: "search", label: "Search" },
  { id: "delete", label: "Delete index" },
  { id: "pop", label: "Pop" },
  { id: "remove", label: "Remove value" },
];

export function ArrayOperationsLab() {
  const [backend, setBackend] = useState<Backend>("array");
  const [operation, setOperation] = useState<Operation>("create");
  const [values, setValues] = useState([4, 8, 15, 16, 23]);
  const [index, setIndex] = useState(2);
  const [value, setValue] = useState(42);
  const [message, setMessage] = useState("Choose an operation, then run it on the values below.");

  const safeIndex = Math.max(0, Math.min(index, values.length));
  const needsIndex = ["insert", "access", "delete"].includes(operation);
  const needsValue = ["insert", "search", "remove"].includes(operation);
  const code = useMemo(
    () => codeFor(backend, operation, safeIndex, value),
    [backend, operation, safeIndex, value],
  );

  const run = () => {
    const current = [...values];
    if (operation === "create") {
      setValues([4, 8, 15, 16, 23]);
      setMessage(`${backend === "array" ? "array.array" : "np.array"} created with 5 values.`);
    }
    if (operation === "insert") {
      current.splice(safeIndex, 0, value);
      setValues(current);
      setMessage(
        `${backend === "array" ? "Inserted" : "Created a new array with"} ${value} at index ${safeIndex}.`,
      );
    }
    if (operation === "traverse") {
      setMessage(`Traversal visits: ${current.join(" → ")}.`);
    }
    if (operation === "access") {
      setMessage(
        safeIndex < current.length
          ? `values[${safeIndex}] = ${current[safeIndex]}`
          : "That index is outside this array.",
      );
    }
    if (operation === "search") {
      const found = current.indexOf(value);
      setMessage(found === -1 ? `${value} is not present.` : `${value} is at index ${found}.`);
    }
    if (operation === "delete") {
      if (safeIndex >= current.length) {
        setMessage("That index is outside this array.");
      } else {
        const removed = current.splice(safeIndex, 1)[0];
        setValues(current);
        setMessage(
          `${backend === "array" ? "Removed" : "Created a new array without"} ${removed} at index ${safeIndex}.`,
        );
      }
    }
    if (operation === "pop") {
      const removed = current.pop();
      setValues(current);
      setMessage(
        `${backend === "array" ? "Popped" : "Created a new array without"} ${removed} from the end.`,
      );
    }
    if (operation === "remove") {
      const found = current.indexOf(value);
      if (found === -1) setMessage(`${value} is not present.`);
      else {
        current.splice(found, 1);
        setValues(current);
        setMessage(
          `${backend === "array" ? "Removed" : "Created a new array without"} the first ${value}.`,
        );
      }
    }
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-hairline bg-slate-50 shadow-sm dark:bg-surface">
      <div className="border-b border-hairline bg-surface-2/40 px-5 py-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Array operations lab
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Switch implementations, choose an operation, and run it.
        </p>
      </div>
      <div className="grid gap-5 p-5 lg:grid-cols-[1fr_310px]">
        <div>
          <div className="flex flex-wrap gap-2">
            {(["array", "numpy"] as Backend[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setBackend(item)}
                className={`rounded-lg border px-3 py-2 font-mono text-xs uppercase tracking-[0.12em] ${backend === item ? "border-mint bg-mint/10 text-mint" : "border-hairline bg-background text-muted-foreground"}`}
              >
                {item === "array" ? "array module" : "NumPy"}
              </button>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {operations.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setOperation(item.id);
                  setValues([4, 8, 15, 16, 23]);
                  setMessage(
                    `Ready to ${item.label.toLowerCase()} with ${backend === "array" ? "array" : "NumPy"}.`,
                  );
                }}
                className={`rounded-md px-2.5 py-1.5 text-xs font-medium ${operation === item.id ? "bg-foreground text-background" : "bg-surface-2 text-muted-foreground hover:text-foreground"}`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="mt-5 rounded-xl border border-hairline bg-background p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              Current values
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {values.map((item, itemIndex) => (
                <div
                  key={`${item}-${itemIndex}`}
                  className={`rounded-lg border px-3 py-2 text-center font-mono font-semibold transition-colors ${cellTone(operation, itemIndex, safeIndex, item, value, values.length)}`}
                >
                  <span>{item}</span>
                  <span className="ml-2 text-[10px] text-muted-foreground">[{itemIndex}]</span>
                </div>
              ))}
            </div>
          </div>
          {needsIndex || needsValue ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {needsIndex ? (
                <label className="text-sm text-muted-foreground">
                  Index
                  <input
                    type="number"
                    min="0"
                    value={index}
                    onChange={(event) => setIndex(Number(event.target.value))}
                    className="mt-1 block w-full rounded-lg border border-hairline bg-background px-3 py-2 text-foreground"
                  />
                </label>
              ) : null}
              {needsValue ? (
                <label className="text-sm text-muted-foreground">
                  Value
                  <input
                    type="number"
                    value={value}
                    onChange={(event) => setValue(Number(event.target.value))}
                    className="mt-1 block w-full rounded-lg border border-hairline bg-background px-3 py-2 text-foreground"
                  />
                </label>
              ) : null}
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              This operation uses the current values directly.
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
        </div>
        <CodePreview code={code} />
      </div>
    </section>
  );
}

function cellTone(
  operation: Operation,
  itemIndex: number,
  index: number,
  item: number,
  value: number,
  length: number,
) {
  if (operation === "traverse") return "border-mint/50 bg-mint/10 text-mint";
  if (operation === "search" && item === value) return "border-amber bg-amber/15 text-amber";
  if ((operation === "access" || operation === "insert") && itemIndex === index)
    return "border-mint bg-mint/10 text-mint";
  if (operation === "delete" && itemIndex === index)
    return "border-rose-400 bg-rose-500/10 text-rose-600";
  if (operation === "pop" && itemIndex === length - 1)
    return "border-rose-400 bg-rose-500/10 text-rose-600";
  if (operation === "remove" && item === value)
    return "border-rose-400 bg-rose-500/10 text-rose-600";
  if (operation === "create") return "border-mint/40 bg-mint/5 text-foreground";
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
    .split(/(#[^\n]*|"[^"]*"|'[^']*'|\b(?:from|import|for|in|del|print)\b|\b\d+\b)/g)
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
      if (/^(from|import|for|in|del|print)$/.test(part))
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

function codeFor(backend: Backend, operation: Operation, index: number, value: number) {
  if (backend === "array") {
    const lines: Record<Operation, string> = {
      create: "# values is created in the line above",
      insert: `values.insert(${index}, ${value})`,
      traverse: "for item in values:\n    print(item)",
      access: `print(values[${index}])`,
      search: `print(values.index(${value}) if ${value} in values else -1)`,
      delete: `del values[${index}]`,
      pop: "removed = values.pop()",
      remove: `values.remove(${value})`,
    };
    return `from array import array\nvalues = array("i", [4, 8, 15, 16, 23])\n\n${lines[operation]}`;
  }
  const lines: Record<Operation, string> = {
    create: "# values is created in the line above",
    insert: `values = np.insert(values, ${index}, ${value})`,
    traverse: "for item in values:\n    print(item)",
    access: `print(values[${index}])`,
    search: `print(np.where(values == ${value})[0])`,
    delete: `values = np.delete(values, ${index})`,
    pop: "removed = values[-1]\nvalues = np.delete(values, -1)",
    remove: `position = np.where(values == ${value})[0][0]\nvalues = np.delete(values, position)`,
  };
  return `import numpy as np\nvalues = np.array([4, 8, 15, 16, 23])\n\n${lines[operation]}`;
}
