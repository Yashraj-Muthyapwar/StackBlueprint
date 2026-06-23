export type PointerColor = "mint" | "amber" | "violet" | "rose";

export type Pointer = {
  name: string;
  index: number;
  color: PointerColor;
  /** "above" caret floats above the cell, "below" floats beneath */
  placement?: "above" | "below";
};

export type Partition = {
  from: number;
  to: number; // inclusive; if to < from, no band drawn
  tone: "low" | "mid" | "high";
  label?: string;
};

export type Highlight = {
  kind: "compare" | "swap" | "match";
  indices: number[];
};

export type ArrayStep = {
  line: number;
  array: number[];
  pointers: Pointer[];
  partitions?: Partition[];
  highlight?: Highlight;
  narration: string;
  /** Optional status pill text, e.g. "sum = 12 > 9" */
  status?: string;
};

export type LinkedListStep = {
  line: number;
  /** pointer name -> node index (or -1 for null) */
  pointers: Pointer[];
  highlight?: Highlight;
  narration: string;
  status?: string;
};

export type LinkedListShape = {
  /** node count */
  nodes: number;
  /** index that the last node's .next points back to (-1 = null / no cycle) */
  cycleTo: number;
  labels?: string[];
};

export type Lesson<TStep = ArrayStep> = {
  slug: string;
  title: string;
  subtitle: string;
  variant: "opposite-ends" | "fast-slow" | "dutch-flag";
  code: string;
  steps: TStep[];
};
