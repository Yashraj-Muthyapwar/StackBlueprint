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
  matrixRect?: {
    r1: number;
    c1: number;
    r2: number;
    c2: number;
    tone?: "violet" | "mint" | "amber";
  };
  // optional water levels for elevation-map
  waterLevels?: number[];
};

export type View = "array" | "linked-list" | "matrix" | "elevation-map";

export type InputField =
  | { key: string; label: string; kind: "intArray"; help?: string; hidden?: (v: any) => boolean }
  | {
      key: string;
      label: string;
      kind: "int";
      min?: number;
      max?: number;
      help?: string;
      hidden?: (v: any) => boolean;
    }
  | { key: string; label: string; kind: "intMatrix"; help?: string; hidden?: (v: any) => boolean }
  | { key: string; label: string; kind: "intPairs"; help?: string; hidden?: (v: any) => boolean }
  | { key: string; label: string; kind: "string"; help?: string; hidden?: (v: any) => boolean }
  | {
      key: string;
      label: string;
      kind: "select";
      options: { value: string; label: string }[];
      help?: string;
      hidden?: (v: any) => boolean;
    };

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
  /** Short lesson recap rendered after the interactive walkthrough. */
  takeaways?: string[];
  /** Optional concept-lesson content rendered with the standard lesson layout. */
  sections?: Section[];
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
  interactiveCode?: boolean;
  initialCode?: string;
  testCode?: string;
  expectedOutput?: string;
  packages?: string[];
};

export type Section =
  | { kind: "prose"; heading?: string; body: string[] }
  | { kind: "code"; language?: string; caption?: string; code: string }
  | { kind: "interactive-code"; code: string; caption?: string; packages?: string[] }
  | { kind: "array-dimensions-explorer" }
  | { kind: "array-slice-explorer" }
  | { kind: "array-operations-lab" }
  | { kind: "matrix-operations-lab" }
  | { kind: "string-character-explorer" }
  | { kind: "table"; caption?: string; headers: string[]; rows: (string | number)[][] }
  | { kind: "callout"; tone: "info" | "warn" | "success" | "violet"; title: string; body: string }
  | { kind: "analogy"; title: string; text: string }
  | { kind: "diagram"; ascii: string; caption?: string }
  | { kind: "image"; src: string; alt: string; caption?: string; className?: string }
  | { kind: "image-carousel"; images: { src: string; alt: string; caption?: string }[] }
  | { kind: "animation"; variant: string; caption?: string }
  | { kind: "system-design-evolution" }
  | { kind: "system-design-clarification-practice" }
  | { kind: "system-design-delivery-framework" }
  | { kind: "system-design-feed-strategy" }
  | { kind: "system-design-whatsapp-requirements" }
  | { kind: "system-design-estimation-walkthrough" }
  | { kind: "system-design-scalability-loop" }
  | { kind: "mnemonic"; text: string; title?: string; subtext?: string }
  | {
      kind: "terminal-animation";
      command: string;
      output: string;
      buttonLabel?: string;
      caption?: string;
    }
  | { kind: "docker-run-under-the-hood" }
  | { kind: "ipv4-diagram" }
  | { kind: "ports-diagram" }
  | { kind: "osi-model-diagram" }
  | { kind: "tcp-udp-diagram" }
  | { kind: "availability-diagram" }
  | { kind: "reliability-diagram" }
  | { kind: "consistency-diagram" }
  | { kind: "cap-theorem-diagram" }
  | { kind: "cap-consistency-diagram" }
  | { kind: "cap-availability-diagram" }
  | { kind: "cap-partition-diagram" }
  | { kind: "pacelc-theorem-diagram" }
  | { kind: "osi-tcp-mapping-diagram" }
  | { kind: "cidr-calculator-diagram" }
  | { kind: "cidr-explorer" }
  | { kind: "subnet-math-steps" }
  | { kind: "reserved-ips-diagram" }
  | { kind: "vpc-carve-diagram" }
  | { kind: "vpc-architecture-diagram" }
  | { kind: "http-req-res-viewer" }
  | { kind: "tls-handshake-diagram" }
  | { kind: "http-versions-diagram" }
  | { kind: "http-cache-diagram" }
  | { kind: "dns-resolution-walkthrough" }
  | { kind: "dns-hierarchy-diagram" }
  | { kind: "dns-query-types-diagram" }
  | { kind: "dns-record-explorer" }
  | { kind: "dns-cache-journey" }
  | {
      kind: "cloud-provider-grid";
      items: { provider: "AWS" | "Google Cloud" | "Azure"; content: string }[];
    }
  | { kind: "pipeline-flow"; steps: { title: string; description: string }[] }
  | { kind: "takeaways"; items: string[] }
  | {
      kind: "list";
      heading?: string;
      body?: string[];
      items: (string | { text: string; subitems: string[] })[];
    }
  | { kind: "quiz"; questions: QuizQuestion[]; isFinalQuiz?: boolean };

export type LessonContent = {
  slug: string;
  title: string;
  subtitle: string;
  sections: Section[];
};
