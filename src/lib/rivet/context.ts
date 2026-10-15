import type { LessonBuilder } from "@/lessons/types";

const TEXT_KEYS = [
  "heading",
  "title",
  "body",
  "text",
  "content",
  "items",
  "points",
  "description",
  "caption",
  "steps",
  "label",
  "headers",
  "rows",
  "alt",
  "subtext",
  "output",
];
/** Example and starter code, shared as fenced blocks. Solutions and test code are never shared. */
const CODE_KEYS = ["code", "initialCode", "starterCode", "example", "command", "ascii"];
const MAX_CHARS = 8000;
/** Per-section cap when sections are picked by relevance, so one long section cannot crowd out the rest. */
const MAX_SECTION_CHARS = 2500;
const INTRO_CHARS = 700;
/** Room kept for the list of left-out sections, inside MAX_CHARS. */
const OMITTED_BUDGET = 600;
const MAX_HEADING_CHARS = 80;

const STOPWORDS = new Set(
  "the and for are but not you your with this that what why how when where which can does did from have has into its was were will would should could about them they then than there their these those just like also more most some such only very use used using make made want need help explain".split(
    " ",
  ),
);

function collect(value: unknown, out: string[], depth = 0) {
  if (depth > 6) return;
  if (typeof value === "string" || typeof value === "number") {
    const t = String(value).trim();
    if (t) out.push(t);
  } else if (Array.isArray(value)) {
    value.forEach((v) => collect(v, out, depth + 1));
  } else if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    for (const key of TEXT_KEYS) collect(record[key], out, depth + 1);
    for (const key of CODE_KEYS) {
      const code = record[key];
      if (typeof code === "string" && code.trim()) out.push("```\n" + code.trim() + "\n```");
    }
    // Nested blocks (tabs, columns, carousels) keep their content under these keys.
    for (const key of ["sections", "blocks", "tabs", "slides", "children"]) {
      if (Array.isArray(record[key])) collect(record[key], out, depth + 1);
    }
  }
}

const isQuiz = (s: unknown) => {
  const section = s as { kind?: unknown; type?: unknown } | null;
  return /quiz/i.test(String(section?.kind ?? "")) || /quiz/i.test(String(section?.type ?? ""));
};

interface LessonSection {
  index: number;
  heading: string;
  text: string;
}

/** Splits a lesson into labelled plain-text sections. Quiz sections are skipped. */
function lessonSections(sections: unknown[]): LessonSection[] {
  const out: LessonSection[] = [];
  sections.forEach((s, i) => {
    if (isQuiz(s)) return;
    const parts: string[] = [];
    collect(s, parts);
    if (!parts.length) return;
    const r = (s ?? {}) as Record<string, unknown>;
    const heading = [r.heading, r.title].find((h) => typeof h === "string" && h.trim()) as
      string | undefined;
    out.push({ index: i + 1, heading: heading?.trim() ?? "", text: parts.join("\n") });
  });
  return out;
}

const words = (text: string) =>
  new Set(
    text
      .toLowerCase()
      .split(/[^a-z0-9_]+/)
      .filter((w) => w.length > 2 && !STOPWORDS.has(w)),
  );

const shorten = (text: string, max: number) =>
  text.length > max ? `${text.slice(0, max - 1)}…` : text;
const label = (s: LessonSection) =>
  s.heading
    ? `[Lesson heading: ${shorten(s.heading, MAX_HEADING_CHARS)}]`
    : "[Lesson content block]";
const clip = (text: string, max: number) =>
  text.length > max ? `${text.slice(0, max)}\n[section shortened]` : text;

/**
 * Flattens a lesson's sections into labelled text for Rivet, including its
 * example code. Quiz sections are skipped on purpose so the tutor never sees
 * unanswered questions or answers. When the lesson is too long to send whole,
 * the sections most related to `query` are chosen (plus the introduction), and
 * the headings of the left-out sections are listed so Rivet knows they exist.
 */
export function extractLessonText(sections?: unknown[], query = ""): string {
  if (!sections?.length) return "";
  const all = lessonSections(sections);
  const full = all.map((s) => `${label(s)}\n${s.text}`).join("\n\n");
  if (full.length <= MAX_CHARS) return full;

  const q = words(query);
  const scored = all.map((s, order) => {
    const w = words(`${s.heading} ${s.heading} ${s.text}`);
    let score = 0;
    q.forEach((t) => w.has(t) && (score += 1));
    return { s, order, score };
  });

  const chosen = new Map<number, string>();
  let used = 0;
  const add = (s: LessonSection, max: number) => {
    if (chosen.has(s.index)) return;
    const block = `${label(s)}\n${clip(s.text, max)}`;
    if (used + block.length > MAX_CHARS - OMITTED_BUDGET) return;
    chosen.set(s.index, block);
    used += block.length + 2;
  };
  if (all[0]) add(all[0], INTRO_CHARS);
  [...scored]
    .sort((a, b) => b.score - a.score || a.order - b.order)
    .forEach(({ s }) => add(s, MAX_SECTION_CHARS));

  const omitted = all.filter((s) => !chosen.has(s.index));
  const body = all
    .filter((s) => chosen.has(s.index))
    .map((s) => chosen.get(s.index))
    .join("\n\n");
  // The final text never exceeds MAX_CHARS, whatever the headings look like.
  return omitted.length ? `${body}\n\n${omittedNote(omitted)}`.slice(0, MAX_CHARS) : body;
}

/** A capped list of left-out section names, so the model knows they exist. */
function omittedNote(omitted: LessonSection[]): string {
  const names: string[] = [];
  let size = 0;
  for (const s of omitted) {
    const name = shorten(s.heading || "Unnamed lesson content", MAX_HEADING_CHARS);
    if (size + name.length + 2 > OMITTED_BUDGET - 60) break;
    names.push(name);
    size += name.length + 2;
  }
  const more = omitted.length - names.length;
  return `[Not included here: ${names.join("; ")}${more ? `; and ${more} more` : ""}]`;
}

/**
 * Plain text for the animated pattern lessons (the step-by-step walkthrough
 * pages), which are described by a builder rather than by `sections`. Includes
 * what the lesson says about when to use the pattern, the algorithm's code and
 * the narration of its default walkthrough. The builder's quiz is left out.
 */
export function extractBuilderText(builder: LessonBuilder): string {
  const parts: string[] = [`${builder.title}`, builder.subtitle];
  const inputs = builder.defaultInputs;
  const safe = <T>(fn: () => T): T | undefined => {
    try {
      return fn();
    } catch {
      return undefined;
    }
  };

  const problem =
    typeof builder.problem === "function"
      ? safe(() => (builder.problem as (i: unknown) => string)(inputs))
      : builder.problem;
  if (problem) parts.push(`Problem: ${problem}`);
  if (builder.spotIt?.length) parts.push(`How to spot it:\n${builder.spotIt.join("\n")}`);
  if (builder.avoidWhen?.length) parts.push(`When to avoid it:\n${builder.avoidWhen.join("\n")}`);
  if (builder.takeaways?.length) parts.push(`Takeaways:\n${builder.takeaways.join("\n")}`);
  if (builder.practiceLadder?.length) {
    parts.push(
      `Practice problems:\n${builder.practiceLadder.map((p) => `${p.name} (${p.difficulty}): ${p.hint}`).join("\n")}`,
    );
  }
  for (const extra of [builder.walkthroughIntro, builder.walkthroughReview]) {
    const sections = typeof extra === "function" ? safe(() => extra(inputs)) : extra;
    const text = extractLessonText(sections);
    if (text) parts.push(text);
  }
  if (builder.code) parts.push(`Algorithm code:\n\`\`\`\n${builder.code}\n\`\`\``);
  const steps = safe(() => builder.build(inputs));
  if (steps?.length) {
    parts.push(
      `Walkthrough narration:\n${steps.map((s, i) => `${i + 1}. ${s.narration}${s.proof ? ` (why: ${s.proof})` : ""}`).join("\n")}`,
    );
  }
  return parts.join("\n\n").slice(0, MAX_CHARS);
}
