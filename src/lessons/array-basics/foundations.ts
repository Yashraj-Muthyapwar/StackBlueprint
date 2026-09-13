import { Box, Grid2X2, Layers3 } from "lucide-react";
import { useState } from "react";

type Dimension = "one" | "two" | "three";

const oneDimensional = [5, 4, 10, 11, 8];
const matrix = [
  [1, 33, 55, 91, 20],
  [5, 4, 10, 11, 8],
  [24, 50, 37, 40, 48],
];

function cubeValue(depth: number, row: number, column: number) {
  return depth * 9 + row * 3 + column + 1;
}

const tabs: { id: Dimension; label: string; Icon: typeof Layers3 }[] = [
  { id: "one", label: "1D array", Icon: Layers3 },
  { id: "two", label: "2D matrix", Icon: Grid2X2 },
  { id: "three", label: "3D cube", Icon: Box },
];

export function ArrayDimensionsExplorer() {
  const [dimension, setDimension] = useState<Dimension>("one");
  const [oneIndex, setOneIndex] = useState(2);
  const [matrixPosition, setMatrixPosition] = useState<[number, number]>([0, 4]);
  const [cubePosition, setCubePosition] = useState<[number, number, number]>([0, 0, 1]);
  const [hoveredDepth, setHoveredDepth] = useState<number | null>(null);
  const visibleDepth = hoveredDepth ?? cubePosition[0];

  return (
    <section className="overflow-hidden rounded-2xl border border-hairline bg-slate-50 shadow-sm dark:bg-surface">
      <div className="border-b border-hairline bg-surface-2/40 px-5 py-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Interactive index explorer
        </p>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Select a value, then read the index expression that locates it.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-hairline px-4 py-3">
        {tabs.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setDimension(id)}
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
              dimension === id
                ? "border-mint/50 bg-mint/10 text-mint"
                : "border-hairline bg-background text-muted-foreground hover:border-mint/30 hover:text-foreground"
            }`}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="min-h-[390px] p-5 sm:p-7">
        {dimension === "one" ? (
          <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-8 py-8">
            <div className="w-full overflow-x-auto px-1 pb-2">
              <div className="mx-auto grid min-w-[430px] grid-cols-5 gap-2">
                {oneDimensional.map((value, index) => {
                  const selected = index === oneIndex;
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setOneIndex(index)}
                      className={`rounded-xl border px-3 py-5 text-center transition-all ${
                        selected
                          ? "border-mint bg-mint/15 text-mint shadow-sm"
                          : "border-hairline bg-background hover:border-mint/50"
                      }`}
                    >
                      <span className="block font-mono text-xl font-semibold">{value}</span>
                      <span className="mt-2 block font-mono text-[11px] text-muted-foreground">
                        [{index}]
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            <IndexReadout expression={`values[${oneIndex}]`} value={oneDimensional[oneIndex]} />
          </div>
        ) : null}

        {dimension === "two" ? (
          <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-7 py-3">
            <div className="w-full overflow-x-auto pb-2">
              <div className="mx-auto grid min-w-[530px] grid-cols-[32px_repeat(5,minmax(72px,1fr))] gap-1.5">
                <div />
                {matrix[0].map((_, column) => (
                  <div
                    key={column}
                    className="py-1 text-center font-mono text-[11px] text-muted-foreground"
                  >
                    column {column}
                  </div>
                ))}
                {matrix.map((row, rowIndex) => (
                  <div key={`row-${rowIndex}`} className="contents">
                    <div className="flex items-center justify-center font-mono text-[11px] text-muted-foreground">
                      {rowIndex}
                    </div>
                    {row.map((value, columnIndex) => {
                      const selected =
                        matrixPosition[0] === rowIndex && matrixPosition[1] === columnIndex;
                      return (
                        <button
                          key={`${rowIndex}-${columnIndex}`}
                          type="button"
                          onClick={() => setMatrixPosition([rowIndex, columnIndex])}
                          className={`aspect-square rounded-lg border font-mono text-base font-semibold transition-all ${
                            selected
                              ? "border-mint bg-mint/15 text-mint shadow-sm"
                              : "border-hairline bg-background hover:border-mint/50"
                          }`}
                        >
                          {value}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
            <IndexReadout
              expression={`matrix[${matrixPosition[0]}][${matrixPosition[1]}]`}
              value={matrix[matrixPosition[0]][matrixPosition[1]]}
            />
            <p className="max-w-xl text-center text-sm leading-relaxed text-muted-foreground">
              The first index chooses a row. The second index chooses a column inside that row.
            </p>
          </div>
        ) : null}

        {dimension === "three" ? (
          <div className="mx-auto max-w-6xl">
            <div className="mb-6 text-center">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-mint">
                Three matrices, one depth axis
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Each panel is a 2D layer. Taken together, the three layers form one 3D array.
              </p>
            </div>
            <MatrixStack
              visibleDepth={visibleDepth}
              selected={cubePosition}
              onHover={setHoveredDepth}
              onSelect={setCubePosition}
            />
            <div className="mt-6">
              <IndexReadout
                expression={`cube[${cubePosition[0]}][${cubePosition[1]}][${cubePosition[2]}]`}
                value={cubeValue(cubePosition[0], cubePosition[1], cubePosition[2])}
              />
              <p className="mt-3 text-center text-sm leading-relaxed text-muted-foreground">
                A 3D array is a stack of matrices. Read an index as{" "}
                <span className="font-medium text-foreground">[depth][row][column]</span>.
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function IndexReadout({ expression, value }: { expression: string; value: number }) {
  return (
    <div className="rounded-xl border border-mint/30 bg-mint/5 px-5 py-3 text-center">
      <code className="font-mono text-sm font-semibold text-mint">{expression}</code>
      <span className="mx-2 text-muted-foreground">=</span>
      <code className="font-mono text-sm font-semibold text-foreground">{value}</code>
    </div>
  );
}

function MatrixStack({
  visibleDepth,
  selected,
  onHover,
  onSelect,
}: {
  visibleDepth: number;
  selected: [number, number, number];
  onHover: (depth: number | null) => void;
  onSelect: (position: [number, number, number]) => void;
}) {
  return (
    <div className="relative mx-auto h-[330px] w-full max-w-[470px]" aria-label="3D matrix stack">
      {[0, 1, 2].map((depth) => {
        const isVisible = visibleDepth === depth;
        const offset = 2 - depth;
        return (
          <section
            key={depth}
            aria-label={`Depth layer ${depth}`}
            onPointerEnter={() => onHover(depth)}
            onPointerLeave={() => onHover(null)}
            className={`absolute grid w-[230px] grid-cols-3 gap-1.5 rounded-2xl border p-3 transition-all duration-200 ${
              isVisible
                ? "z-20 border-mint bg-background shadow-xl"
                : "z-10 border-mint/35 bg-background/70 opacity-70 hover:opacity-100"
            }`}
            style={{
              left: `${42 + offset * 30}px`,
              top: `${24 + offset * 28}px`,
              transform: isVisible ? "scale(1)" : "scale(0.9)",
              transformOrigin: "top left",
            }}
          >
            <div className="col-span-3 mb-1 flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                Depth {depth}
              </span>
              <span className="font-mono text-[10px] text-mint">matrix[{depth}]</span>
            </div>
            {Array.from({ length: 9 }, (_, index) => {
              const row = Math.floor(index / 3);
              const column = index % 3;
              const isSelected =
                selected[0] === depth && selected[1] === row && selected[2] === column;
              return (
                <button
                  key={`${depth}-${row}-${column}`}
                  type="button"
                  onClick={() => onSelect([depth, row, column])}
                  className={`aspect-square rounded-md border font-mono text-sm font-semibold transition-colors ${
                    isSelected
                      ? "border-mint bg-mint text-background"
                      : isVisible
                        ? "border-hairline bg-surface-2/80 hover:border-mint hover:text-mint"
                        : "border-mint/20 bg-surface-2/40 text-transparent"
                  }`}
                  aria-label={`Depth ${depth}, row ${row}, column ${column}`}
                >
                  {cubeValue(depth, row, column)}
                </button>
              );
            })}
          </section>
        );
      })}
      <p className="absolute bottom-0 left-0 right-0 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        Hover a plane to reveal that depth layer
      </p>
    </div>
  );
}
