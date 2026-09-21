import { roadmap, type RoadmapPattern } from "@/lessons/roadmap";

export type SearchItem = {
  id: string;
  title: string;
  context: string;
  track: string;
  path: string;
  kind: "topic" | "lesson";
  terms: string;
};

// Jargon that appears in NO title and NO slug. Keyed by lesson/pattern slug.
const ALIASES: Record<string, string[]> = {
  "outer-joins-null": ["left join", "right join", "full outer join", "left outer join"],
  "inner-joins-conditions": ["inner join"],
  "exists-vs-in": ["not exists", "not in"],
  "set-ops": ["union all", "minus"],
  "grouping-sets": ["rollup", "cube"],
  "order-limit": ["distinct", "offset", "fetch first", "top n"],
  "keys-in-relational-databases": ["primary key", "foreign key", "composite key"],
  "null-pitfalls": ["is null", "is not null", "three valued logic"],
  "correlated-subqueries": ["cte", "common table expression", "with clause"],
  "cast-to-char": ["convert", "type cast"],
  "join-order-internals": ["hash join", "nested loop", "merge join"],
};

const slugWords = (s: string) => s.replace(/[-_/]+/g, " ");

function pushPattern(out: SearchItem[], p: RoadmapPattern, track: string, ctx: string) {
  if (p.locked) return;
  if (p.path) {
    out.push({
      id: p.path,
      title: p.title,
      context: ctx,
      track,
      path: p.path,
      kind: "topic",
      terms: [
        p.title,
        ctx,
        p.blurb,
        slugWords(p.slug),
        ...(p.keywords ?? []),
        ...(ALIASES[p.slug] ?? []),
      ]
        .join(" ")
        .toLowerCase(),
    });
  }
  for (const l of p.lessons ?? []) {
    out.push({
      id: l.path,
      title: l.title,
      context: `${ctx} › ${p.title}`,
      track,
      path: l.path,
      kind: "lesson",
      terms: [
        l.title,
        p.title,
        ctx,
        slugWords(l.slug),
        ...(l.keywords ?? []),
        ...(ALIASES[l.slug] ?? []),
      ]
        .join(" ")
        .toLowerCase(),
    });
  }
}

export function buildSearchItems(): SearchItem[] {
  const out: SearchItem[] = [];
  for (const c of roadmap) {
    if (c.locked) continue;
    const seen = new Set<RoadmapPattern>();
    const visit = (p: RoadmapPattern, ctx: string) => {
      if (seen.has(p)) return;
      seen.add(p);
      pushPattern(out, p, c.title, ctx);
    };
    if (c.sections?.length) {
      for (const s of c.sections)
        for (const p of s.patterns ?? []) visit(p, `${c.title} › ${s.title}`);
    } else {
      for (const p of c.patterns ?? []) visit(p, c.title);
    }
  }
  const byId = new Set<string>();
  return out.filter((i) => (byId.has(i.id) ? false : (byId.add(i.id), true)));
}

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function score(i: SearchItem, q: string): number {
  const query = q.trim().toLowerCase();
  const toks = query.split(/\s+/).filter(Boolean);
  if (!toks.length || !toks.every((t) => i.terms.includes(t))) return 0;
  const title = i.title.toLowerCase();
  let s: number;
  if (title === query) s = 1000;
  else if (title === query + "s" || title + "s" === query) s = 900;
  else if (title.startsWith(query)) s = 500;
  else if (new RegExp(`\\b${esc(query)}`).test(title)) s = 300;
  else if (title.includes(query)) s = 200;
  else if (toks.every((t) => new RegExp(`\\b${esc(t)}`).test(title))) s = 150;
  else s = 50; // matched only via slug / alias / context

  let finalScore = s + (i.kind === "lesson" ? 10 : 0);
  if (i.kind === "topic" && (title === query || title === query + "s" || title + "s" === query)) {
    finalScore += 20; // Topic exact match beats lesson exact match
  }
  return finalScore;
}

export function searchItems(items: SearchItem[], q: string, limit = 40): SearchItem[] {
  return items
    .map((i) => [i, score(i, q)] as const)
    .filter(([, s]) => s > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([i]) => i);
}
