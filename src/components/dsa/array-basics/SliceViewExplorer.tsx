import { useMemo, useState } from "react";

type Collection = "list" | "numpy";
type SlicePreset = "middle" | "first" | "step" | "reverse";

const originalValues = [4, 8, 15, 16, 23, 42];

const presets: { id: SlicePreset; expression: string; indices: number[] }[] = [
  { id: "middle", expression: "values[1:4]", indices: [1, 2, 3] },
  { id: "first", expression: "values[:3]", indices: [0, 1, 2] },
  { id: "step", expression: "values[::2]", indices: [0, 2, 4] },
  { id: "reverse", expression: "values[::-1]", indices: [5, 4, 3, 2, 1, 0] },
];

export function SliceViewExplorer() {
  const [collection, setCollection] = useState<Collection>("list");
  const [presetId, setPresetId] = useState<SlicePreset>("middle");
  const [source, setSource] = useState(originalValues);
  const [copiedFirstValue, setCopiedFirstValue] = useState<number | null>(null);

  const preset = useMemo(
    () => presets.find((item) => item.id === presetId) ?? presets[0],
    [presetId],
  );
  const result = preset.indices.map((sourceIndex, resultIndex) =>
    collection === "list" && resultIndex === 0 && copiedFirstValue !== null
      ? copiedFirstValue
      : source[sourceIndex],
  );

  const reset = () => {
    setSource(originalValues);
    setCopiedFirstValue(null);
  };

  const selectCollection = (next: Collection) => {
    setCollection(next);
    reset();
  };

  const selectPreset = (next: SlicePreset) => {
    setPresetId(next);
    reset();
  };

  const changeFirstSliceValue = () => {
    const firstSourceIndex = preset.indices[0];
    if (collection === "numpy") {
      setSource((current) =>
        current.map((value, index) => (index === firstSourceIndex ? 99 : value)),
      );
      return;
    }
    setCopiedFirstValue(99);
  };

  const isNumpy = collection === "numpy";

  return (
    <section className="overflow-hidden rounded-2xl border border-hairline bg-slate-50 shadow-sm dark:bg-surface">
      <div className="border-b border-hairline bg-surface-2/40 px-5 py-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Slice copy and view explorer
        </p>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Choose a basic slice, then change its first result value to see whether the source
          changes.
        </p>
      </div>

      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap gap-2">
          {(["list", "numpy"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => selectCollection(option)}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                collection === option
                  ? "border-mint bg-mint/10 text-mint"
                  : "border-hairline bg-background text-muted-foreground hover:border-mint/40 hover:text-foreground"
              }`}
            >
              {option === "list" ? "Python list" : "NumPy array"}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {presets.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => selectPreset(item.id)}
              className={`rounded-lg border px-3 py-2 font-mono text-sm transition-colors ${
                preset.id === item.id
                  ? "border-violet bg-violet/10 text-violet"
                  : "border-hairline bg-background text-muted-foreground hover:border-violet/40 hover:text-foreground"
              }`}
            >
              {item.expression}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <ArrayStrip
            title={isNumpy ? "Source NumPy array" : "Source Python list"}
            values={source}
            indices={originalValues.map((_, index) => index)}
            selectedIndices={preset.indices}
          />
          <ArrayStrip
            title={isNumpy ? "Slice view" : "Copied list slice"}
            values={result}
            indices={result.map((_, index) => index)}
            selectedIndices={[0]}
            accent
          />
        </div>

        <div
          className={`mt-5 rounded-xl border p-4 ${isNumpy ? "border-violet/30 bg-violet/5" : "border-mint/30 bg-mint/5"}`}
        >
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-foreground">
            {isNumpy ? "NumPy basic slice: view" : "Python list slice: copy"}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {isNumpy
              ? "This basic NumPy slice shares the original data buffer. Creating the view is O(1) time and uses O(1) extra data storage."
              : "This list slice allocates a new list containing its selected values. Creating it takes O(k) time and O(k) extra space for k selected values."}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={changeFirstSliceValue}
              className="rounded-lg bg-mint px-3 py-2 text-sm font-medium text-background transition-colors hover:bg-mint/85"
            >
              Set slice[0] = 99
            </button>
            <button
              type="button"
              onClick={reset}
              className="rounded-lg border border-hairline bg-background px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-mint/40 hover:text-foreground"
            >
              Reset
            </button>
            <span className="text-sm text-muted-foreground">
              {isNumpy
                ? "The matching source cell changes because the slice is a view."
                : "Only the copied result changes. The source list stays the same."}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function ArrayStrip({
  title,
  values,
  indices,
  selectedIndices,
  accent = false,
}: {
  title: string;
  values: number[];
  indices: number[];
  selectedIndices: number[];
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-hairline bg-background p-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
        {title}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {values.map((value, position) => {
          const selected = accent ? position === 0 : selectedIndices.includes(position);
          return (
            <div
              key={`${position}-${value}`}
              className={`min-w-16 rounded-lg border px-3 py-2 text-center ${
                selected ? "border-mint bg-mint/10" : "border-hairline bg-surface-2/70"
              }`}
            >
              <span className="block font-mono text-base font-semibold text-foreground">
                {value}
              </span>
              <span className="mt-1 block font-mono text-[10px] text-muted-foreground">
                [{indices[position]}]
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
