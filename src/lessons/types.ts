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
  // optional water levels for elevation-map
  waterLevels?: number[];
};

export type View = "array" | "linked-list" | "matrix" | "elevation-map";

export type InputField =
  | { key: string; label: string; kind: "intArray"; help?: string; hidden?: (v: any) => boolean }
  | { key: string; label: string; kind: "int"; min?: number; max?: number; help?: string; hidden?: (v: any) => boolean }
  | { key: string; label: string; kind: "intMatrix"; help?: string; hidden?: (v: any) => boolean }
  | { key: string; label: string; kind: "intPairs"; help?: string; hidden?: (v: any) => boolean }
  | { key: string; label: string; kind: "string"; help?: string; hidden?: (v: any) => boolean }
  | { key: string; label: string; kind: "select"; options: { value: string; label: string }[]; help?: string; hidden?: (v: any) => boolean };

export type PracticeProblem = {
  name: string;
  difficulty: "easy" | "medium" | "hard";
  hint: string;
  link?: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type LessonBuilder<TInputs extends Record<string, any> = any> = {
  slug: string;
  title: string;
  subtitle: string;
  /** Concise problem statement shown under the lesson title. */
  problem?: string | ((inputs: TInputs) => string);
  /** Signals in an interview prompt that hint this pattern applies. */
  spotIt?: string[];
  /** Situations where this pattern is the wrong tool. */
  avoidWhen?: string[];
  variant: string;
  view: View | ((inputs: TInputs) => View);
  code: string;
  /** Optional per-input override; falls back to `code` when absent. */
  codeFor?: (inputs: Record<string, unknown>) => string;
  defaultInputs: TInputs;
  inputs: InputField[];
  validate?: (inputs: TInputs) => string[];
  build: (inputs: TInputs) => Step[];
  shape?: (inputs: TInputs) => LinkedListShape;
  /** Optional reaction to a single field change: returns raw-string overrides
   *  for any other fields (e.g. swap default array when a mode select changes). */
  onInputChange?: (
    changedKey: string,
    newValue: string,
    currentRaw: Record<string, string>,
  ) => Record<string, string> | null;
  /** Ordered practice problems, easiest first. Render as a ladder with difficulty badges. */
  practiceLadder?: PracticeProblem[];
};


// Backwards-compat alias for existing canvases.
export type ArrayStep = Step;
export type LinkedListStep = Pick<
  Step,
  "line" | "narration" | "status" | "pointers" | "highlight"
> & { pointers: Pointer[] };

// ============= Lesson content sections (SQL / Data Warehouses) =============

export type QuizQuestion = {
  id: string;
  question: string;
  options?: string[];
  correctIndex?: number;
  commandAnswer?: string | string[];
  explanation?: string;
};

export type Section =
  | { kind: "prose"; heading?: string; body: string[] }
  | { kind: "code"; language?: string; caption?: string; code: string }
  | { kind: "table"; caption?: string; headers: string[]; rows: (string | number)[][] }
  | { kind: "callout"; tone: "info" | "warn" | "success" | "violet"; title: string; body: string }
  | { kind: "analogy"; title: string; text: string }
  | { kind: "diagram"; ascii: string; caption?: string }
  | { kind: "image"; src: string; alt: string; caption?: string }
  | { kind: "animation"; variant: string; caption?: string }
  | { kind: "terminal-animation"; command: string; output: string; buttonLabel?: string; caption?: string }
  | { kind: "docker-run-under-the-hood" }
  | { kind: "ipv4-diagram" }
  | { kind: "ports-diagram" }
  | { kind: "osi-model-diagram" }
  | { kind: "tcp-udp-diagram" }
  | { kind: "osi-tcp-mapping-diagram" }
  | { kind: "takeaways"; items: string[] }
  | { kind: "quiz"; questions: QuizQuestion[] };

export type LessonContent = {
  slug: string;
  title: string;
  subtitle: string;
  sections: Section[];
};
