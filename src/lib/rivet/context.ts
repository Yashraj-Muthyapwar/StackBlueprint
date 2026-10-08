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
];
const MAX_CHARS = 6000;

function collect(value: unknown, out: string[]) {
  if (typeof value === "string") {
    const t = value.trim();
    if (t) out.push(t);
  } else if (Array.isArray(value)) {
    value.forEach((v) => collect(v, out));
  } else if (value && typeof value === "object") {
    for (const key of TEXT_KEYS) collect((value as Record<string, unknown>)[key], out);
  }
}

/**
 * Flattens a lesson's sections into plain text for Rivet. Quiz sections are
 * skipped on purpose so the tutor never sees unanswered questions or answers.
 */
export function extractLessonText(sections?: unknown[]): string {
  if (!sections?.length) return "";
  const parts: string[] = [];
  for (const s of sections) {
    const section = s as { kind?: string; type?: string } | null;
    if (section?.kind === "quiz" || section?.type === "quiz") continue;
    collect(s, parts);
  }
  return parts.join("\n").slice(0, MAX_CHARS);
}
