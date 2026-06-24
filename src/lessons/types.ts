export type PointerColor = "mint" | "amber" | "violet" | "rose";

export type Pointer = {
  name: string;
  index: number;
  color: PointerColor;
  placement?: "above" | "below";
};

export type Partition = {
  from: number;
  to: number;
  tone: "low" | "mid" | "high";
  label?: string;
};

export type Highlight = {
  kind: "compare" | "swap" | "match";
  indices: number[];
};

export type CellTone = "compare" | "swap" | "match" | "visit";
export type CellHighlight = { r: number; c: number; tone: CellTone };
export type CellPointer = { name: string; r: number; c: number; color: PointerColor };

export type LinkedListShape = {
  nodes: number;
  cycleTo: number;
  labels?: string[];
};

export type SecondaryArray = {
  label: string;
  array: (number | string)[];
  highlight?: Highlight;
  pointers?: Pointer[];
};

export type Step = {
  line: number;
  narration: string;
  status?: string;
  // array view
  array?: (number | string)[];
  pointers?: Pointer[];
  partitions?: Partition[];
  highlight?: Highlight;
  // optional secondary strip (prefix/deque/output)
  secondary?: SecondaryArray;
  // matrix view
  matrix?: number[][];
  cellHighlights?: CellHighlight[];
  cellPointers?: CellPointer[];
  // matrix rect overlay (e.g. 2D prefix query rect)
  matrixRect?: { r1: number; c1: number; r2: number; c2: number; tone?: "violet" | "mint" | "amber" };
};

export type View = "array" | "linked-list" | "matrix";

export type InputField =
  | { key: string; label: string; kind: "intArray"; help?: string }
  | { key: string; label: string; kind: "int"; min?: number; max?: number; help?: string }
  | { key: string; label: string; kind: "intMatrix"; help?: string }
  | { key: string; label: string; kind: "intPairs"; help?: string }
  | { key: string; label: string; kind: "string"; help?: string };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type LessonBuilder<TInputs extends Record<string, any> = any> = {
  slug: string;
  title: string;
  subtitle: string;
  /** Concise problem statement shown under the lesson title. */
  problem?: string;
  /** Signals in an interview prompt that hint this pattern applies. */
  spotIt?: string[];
  /** Situations where this pattern is the wrong tool. */
  avoidWhen?: string[];
  variant: string;
  view: View;
  code: string;
  defaultInputs: TInputs;
  inputs: InputField[];
  validate?: (inputs: TInputs) => string[];
  build: (inputs: TInputs) => Step[];
  shape?: (inputs: TInputs) => LinkedListShape;
};


// Backwards-compat alias for existing canvases.
export type ArrayStep = Step;
export type LinkedListStep = Pick<
  Step,
  "line" | "narration" | "status" | "pointers" | "highlight"
> & { pointers: Pointer[] };
