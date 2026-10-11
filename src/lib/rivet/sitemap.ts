import { roadmap, type RoadmapPattern } from "@/lessons/roadmap";
import { AVAILABLE_LESSONS } from "./available-lessons.generated";

/**
 * The lessons Rivet is allowed to point learners to. Built from the same
 * roadmap that powers the sidebar, then filtered to lessons that really have
 * content (placeholders and locked tracks are left out). The model only ever
 * sees this list, and every link in a reply is checked against it again before
 * it is shown.
 */
export interface LessonLink {
  title: string;
  path: string;
  track: string;
  module: string;
  kind: "lesson" | "module";
}

const available = new Set<string>(AVAILABLE_LESSONS);

export const normalizePath = (path: string) => path.split(/[?#]/)[0].replace(/\/+$/, "") || "/";

function hasContent(path: string): boolean {
  const seg = normalizePath(path).split("/").filter(Boolean);
  if (seg[0] === "patterns") return true; // every DSA pattern lesson is a full lesson
  return seg.length >= 2 && available.has(`${seg[0]}/${seg[seg.length - 1]}`);
}

let cache: { links: LessonLink[]; paths: Set<string> } | null = null;

function build() {
  if (cache) return cache;
  const links: LessonLink[] = [];
  const paths = new Set<string>();
  const add = (link: LessonLink) => {
    const path = normalizePath(link.path);
    if (paths.has(path)) return;
    paths.add(path);
    links.push({ ...link, path });
  };

  for (const category of roadmap) {
    if (category.locked) continue;
    // Most sections hold `patterns`, but a few (Web Scraping) list lessons directly, so accept both shapes.
    const fromSections = (category.sections ?? []).flatMap((section) => {
      const loose = section as { patterns?: RoadmapPattern[]; lessons?: RoadmapPattern["lessons"] };
      return loose.patterns ?? (loose.lessons ? [section as unknown as RoadmapPattern] : []);
    });
    const patterns: RoadmapPattern[] = [...category.patterns, ...fromSections].filter(Boolean);
    for (const pattern of patterns) {
      if (pattern.locked) continue;
      if (pattern.path) {
        add({
          title: pattern.title,
          path: pattern.path,
          track: category.title,
          module: pattern.title,
          kind: "module",
        });
      }
      for (const lesson of pattern.lessons) {
        if (lesson.path && hasContent(lesson.path)) {
          add({
            title: lesson.title,
            path: lesson.path,
            track: category.title,
            module: pattern.title,
            kind: "lesson",
          });
        }
      }
    }
  }
  cache = { links, paths };
  return cache;
}

/** True only for pages that exist and have content. Accepts a trailing slash, query or hash. */
export const isKnownLessonPath = (path: string) => build().paths.has(normalizePath(path));

const STOP = new Set([
  "the",
  "and",
  "for",
  "with",
  "what",
  "how",
  "are",
  "can",
  "you",
  "this",
  "that",
  "about",
  "other",
  "link",
  "links",
  "lesson",
  "lessons",
  "give",
  "show",
  "tell",
  "where",
  "from",
  "does",
  "have",
  "into",
  "your",
]);

const words = (text: string) =>
  text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 3 && !STOP.has(w));

/**
 * Picks the lessons worth showing the model for this question: the learner's
 * current module first, then the rest of the track, then anything whose title
 * matches words in the question. Kept short so the prompt stays small.
 */
export function selectLessonLinks(currentPath: string, question: string, max = 40): LessonLink[] {
  const { links } = build();
  const here = normalizePath(currentPath);
  const track = here.split("/").filter(Boolean)[0];
  const current = links.find((l) => l.path === here);
  const asked = new Set(words(question));

  return links
    .map((link, order) => {
      let score = 0;
      if (current && link.module === current.module && link.track === current.track) score += 100;
      if (link.path.split("/").filter(Boolean)[0] === track) score += 40;
      for (const w of words(`${link.title} ${link.module}`)) if (asked.has(w)) score += 12;
      if (link.kind === "module") score += 2;
      if (link.path === here) score = 0; // do not point at the page they are already on
      return { link, score, order };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.order - b.order)
    .slice(0, max)
    .map((x) => x.link);
}
