import type { ComponentType } from "react";

/**
 * Data contract for `PatternCanvas`, the shared frame for pattern lessons.
 *
 * The frame owns everything around the stage: the file-name dropdown, presets and input
 * fields, the status card, transport controls, and the Python / Algorithm listing with live
 * values. A lesson owns the stage: each problem supplies a `Stage` component that draws one
 * step however the pattern needs (array, string, linked list, recursion tree, grid...).
 */

/** Colour role of a token or identifier. Fixed across the site: left mint, right blue. */
export type Tone = "left" | "right" | "value" | "result" | "plain";
export type Token = { text: string; tone?: Tone };

/** Fields every step needs. A lesson extends this with whatever its stage draws. */
export type PatternStep = {
  /** Short status shown at the top of the status card, e.g. "Swapping values". */
  phase: string;
  /** Python lines (1-based) highlighted in the code view. */
  codeLines: number[];
  /** The last highlighted Python line rewritten with the current values. */
  codeNote: Token[];
  /** Pseudocode line (1-based) highlighted in the algorithm view. */
  algoLine: number;
  algoNote: Token[];
  /** One or two sentences on what happens and why. */
  narration: string;
  /** Live variables shown as chips. Keep the same labels on every step of a problem. */
  stats: { label: string; value: string | number; tone?: Tone }[];
};

export type StageProps<TStep extends PatternStep> = {
  step: TStep;
  /** Changes on every step and input; use it as a React key to replay enter animations. */
  stepKey: string;
  /** Prefix for motion `layoutId`s so problems never share animated elements. */
  problemId: string;
};

export type InputField = {
  key: string;
  /** Visible label before the field; omit for the main field. */
  label?: string;
  placeholder?: string;
  /** "wide" grows to fill the row; "narrow" fits a short value such as a target. */
  size?: "wide" | "narrow";
};

export type PatternProblem<TStep extends PatternStep = PatternStep, TInput = unknown> = {
  /** Stable id, unique within its problem set. */
  id: string;
  /** Human name shown beside the file name, e.g. "Two Sum (Sorted)". */
  label: string;
  /** File name shown as the dropdown trigger, e.g. "two_sum.py". */
  file: string;
  python: string[];
  algorithm: string[];
  complexity: { time: string; space: string };
  /** Runnable example for `PatternExample`; `output` is checked when verifying the lesson. */
  example: { call: string; output: string };
  /** Identifiers coloured in both listings, e.g. `{ left: "left", right: "right" }`. */
  identifiers?: Record<string, Tone>;
  /** Preset inputs shown as chips; the first is loaded initially. */
  presets: { label: string; input: TInput }[];
  /** Optional free-form input. Omit all three to show presets only. */
  inputFields?: InputField[];
  formatInput?: (input: TInput) => Record<string, string>;
  /** Returns the parsed input, or an error message for the learner. */
  parseInput?: (fields: Record<string, string>) => TInput | string;
  build: (input: TInput) => TStep[];
  /** Draws one step. It is centred in a stage of fixed minimum height. */
  Stage: ComponentType<StageProps<TStep>>;
};

/** A problem of any step and input type, for problem sets that mix several. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyPatternProblem = PatternProblem<any, any>;

/** Token helpers for `codeNote` / `algoNote`: left, right, value, result, plain. */
export const L = (text: string): Token => ({ text, tone: "left" });
export const R = (text: string): Token => ({ text, tone: "right" });
export const V = (text: string): Token => ({ text, tone: "value" });
export const OUT = (text: string): Token => ({ text, tone: "result" });
export const P = (text: string): Token => ({ text });
