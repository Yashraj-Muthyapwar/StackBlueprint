import type { Section } from "@/lessons/data-warehouses/foundations-content";
import { AlertTriangle, CheckCircle2, Info, Brain } from "lucide-react";
import { LessonAnimation } from "@/components/data-warehouses/LessonAnimation";
import { ZoomableImage } from "@/components/ui/zoomable-image";
import { ImageCarousel } from "@/components/ui/image-carousel";

function highlightSql(line: string) {
  const KEYWORDS = new Set([
    "SELECT","FROM","WHERE","AND","OR","NOT","NULL","IS","IN","BETWEEN","LIKE","ILIKE",
    "GROUP","BY","HAVING","ORDER","LIMIT","OFFSET","AS","ON","JOIN","INNER","LEFT","RIGHT",
    "FULL","OUTER","CROSS","UNION","ALL","DISTINCT","INSERT","INTO","VALUES","UPDATE","SET",
    "DELETE","CREATE","TABLE","ALTER","ADD","DROP","COLUMN","CONSTRAINT","PRIMARY","KEY",
    "FOREIGN","REFERENCES","UNIQUE","CHECK","DEFAULT","INDEX","USING","GIN","BTREE","WITH",
    "RECURSIVE","CASE","WHEN","THEN","ELSE","END","BEGIN","COMMIT","ROLLBACK","SAVEPOINT",
    "TRUNCATE","RENAME","MERGE","MATCHED","GRANT","REVOKE","TO","INTERVAL","EXTRACT","AT",
    "TIME","ZONE","CASCADE","RESTRICT","NULLS","FIRST","LAST","DESC","ASC","COALESCE",
    "EXISTS","ARRAY","RETURNING","IF","TRUE","FALSE","BIGSERIAL","SERIAL","BIGINT","INT",
    "INTEGER","SMALLINT","TEXT","VARCHAR","CHAR","NUMERIC","REAL","DOUBLE","PRECISION",
    "TIMESTAMP","TIMESTAMPTZ","DATE","JSON","JSONB","BOOLEAN","SCHEMA","PRIVILEGES",
    "PUBLIC","ROLE",
  ]);
  const nodes: React.ReactNode[] = [];
  let i = 0;
  let key = 0;
  while (i < line.length) {
    const ch = line[i];
    if (ch === "-" && line[i + 1] === "-") {
      nodes.push(
        <span key={key++} className="text-muted-foreground/70">
          {line.slice(i)}
        </span>,
      );
      break;
    }
    if (ch === "'") {
      const end = line.indexOf("'", i + 1);
      const stop = end === -1 ? line.length : end + 1;
      nodes.push(
        <span key={key++} className="text-amber">
          {line.slice(i, stop)}
        </span>,
      );
      i = stop;
      continue;
    }
    if (/[A-Za-z_]/.test(ch)) {
      let j = i + 1;
      while (j < line.length && /[A-Za-z0-9_]/.test(line[j])) j++;
      const word = line.slice(i, j);
      if (KEYWORDS.has(word.toUpperCase())) {
        nodes.push(
          <span key={key++} className="text-mint">
            {word}
          </span>,
        );
      } else {
        nodes.push(<span key={key++}>{word}</span>);
      }
      i = j;
      continue;
    }
    if (/[0-9]/.test(ch)) {
      let j = i + 1;
      while (j < line.length && /[0-9.]/.test(line[j])) j++;
      nodes.push(
        <span key={key++} className="text-violet">
          {line.slice(i, j)}
        </span>,
      );
      i = j;
      continue;
    }
    nodes.push(<span key={key++}>{ch}</span>);
    i++;
  }
  return nodes;
}

function parseInlineMarkdown(text: string) {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i} className="italic text-foreground">{part.slice(1, -1)}</em>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} className="rounded bg-mint/10 text-mint px-1.5 py-0.5 font-mono text-[0.85em] font-medium">{part.slice(1, -1)}</code>;
    }
    return part;
  });
}



export function SectionRenderer({ section, onQuizActiveChange }: { section: Section; onQuizActiveChange?: (active: boolean) => void }) {
  switch (section.kind) {
    case "prose":
      return (
        <section className="space-y-3">
          {section.heading ? (
            <h2 className="lesson-section-title font-semibold tracking-tight">
              {section.heading}
            </h2>
          ) : null}
          {section.body.map((p, i) => (
            <p key={i} className="lesson-prose text-muted-foreground">
              {parseInlineMarkdown(p)}
            </p>
          ))}
        </section>
      );

    case "code": {
      const lines = section.code.split("\n");
      return (
        <figure className="overflow-hidden rounded-xl border border-hairline bg-slate-50 dark:bg-surface shadow-sm">
          <div className="flex items-center gap-1.5 border-b border-hairline/60 bg-surface-2/40 px-4 py-2.5">
            <div className="size-2.5 rounded-full bg-rose-500/80 shadow-sm" />
            <div className="size-2.5 rounded-full bg-amber-500/80 shadow-sm" />
            <div className="size-2.5 rounded-full bg-emerald-500/80 shadow-sm" />
            {section.caption ? (
              <span className="ml-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                {section.caption}
              </span>
            ) : null}
          </div>
          <pre className="lesson-code overflow-x-auto px-4 py-4 font-mono shadow-inner">
            <code>
              {lines.map((line, i) => (
                <div key={i} className="flex">
                  <span className="mr-4 inline-block w-6 select-none text-right text-muted-foreground/50">
                    {i + 1}
                  </span>
                  <span className="text-foreground/90">{highlightSql(line)}</span>
                </div>
              ))}
            </code>
          </pre>
        </figure>
      );
    }

    case "table":
      return (
        <figure className="overflow-hidden rounded-xl border border-hairline bg-slate-50 dark:bg-surface shadow-sm">
          {section.caption ? (
            <figcaption className="border-b border-hairline px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              {section.caption}
            </figcaption>
          ) : null}
          <div className="overflow-x-auto">
            <table className="lesson-supporting w-full">
              <thead className="bg-surface-2 text-left text-muted-foreground">
                <tr>
                  {section.headers.map((h, i) => (
                    <th
                      key={i}
                      className="border-b border-hairline px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {section.rows.map((row, ri) => (
                  <tr key={ri} className="border-b border-hairline/60 last:border-b-0">
                    {row.map((cell, ci) => (
                      <td
                        key={ci}
                        className={
                          "px-4 py-2.5 align-top " +
                          (ci === 0 ? "font-medium text-foreground" : "text-muted-foreground")
                        }
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </figure>
      );

    case "callout": {
      const tone =
        section.tone === "warn"
          ? {
              bg: "bg-amber/10",
              ring: "ring-amber/40",
              text: "text-amber",
              Icon: AlertTriangle,
            }
          : section.tone === "success"
            ? {
                bg: "bg-mint/10",
                ring: "ring-mint/40",
                text: "text-mint",
                Icon: CheckCircle2,
              }
            : {
                bg: "bg-violet/10",
                ring: "ring-violet/40",
                text: "text-violet",
                Icon: Info,
              };
      const Icon = tone.Icon;
      return (
        <aside
          className={`flex gap-3 rounded-xl ${tone.bg} p-4 ring-1 ${tone.ring}`}
        >
          <Icon className={`mt-0.5 size-5 shrink-0 ${tone.text}`} />
          <div>
            <p className={`text-sm font-semibold ${tone.text}`}>{section.title}</p>
            <p className="lesson-supporting mt-1 text-foreground/85">
              {parseInlineMarkdown(section.body)}
            </p>
          </div>
        </aside>
      );
    }

    case "diagram":
      return (
        <figure className="overflow-hidden rounded-xl border border-hairline bg-slate-50 dark:bg-surface shadow-sm">
          <pre className="lesson-code overflow-x-auto px-4 py-4 font-mono text-foreground/85">
            {section.ascii}
          </pre>
          {section.caption ? (
            <figcaption className="border-t border-hairline px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              {section.caption}
            </figcaption>
          ) : null}
        </figure>
      );

    case "image":
      return (
        <figure className="overflow-hidden rounded-xl border border-hairline bg-slate-50 dark:bg-surface shadow-sm">
          <div className="flex w-full justify-center bg-surface-2/30 py-4">
            <ZoomableImage src={section.src} alt={section.alt} className="h-auto w-full max-w-full object-contain px-4 lg:max-w-4xl" />
          </div>
          {section.caption ? (
            <figcaption className="border-t border-hairline px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              {section.caption}
            </figcaption>
          ) : null}
        </figure>
      );

    case "image-carousel":
      return <ImageCarousel images={section.images} />;

    case "animation":
      return <LessonAnimation variant={section.variant} caption={section.caption} />;

    case "analogy":
      return (
        <section className="rounded-xl border border-violet/30 bg-violet/5 p-5 shadow-sm">
          <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-violet">
            <Brain className="size-5 text-amber" />
            Analogy: {section.title}
          </p>
          <p className="lesson-supporting mt-3 text-foreground/90">
            {parseInlineMarkdown(section.text)}
          </p>
        </section>
      );

    case "list":
      return (
        <section className="space-y-3">
          {section.heading ? (
            <h2 className="text-xl font-semibold tracking-tight lg:text-2xl">
              {section.heading}
            </h2>
          ) : null}
          {section.body?.map((p, i) => (
            <p key={i} className="leading-relaxed text-muted-foreground lg:text-lg">
              {parseInlineMarkdown(p)}
            </p>
          ))}
          <ul className="list-disc space-y-0.5 pl-6 text-muted-foreground lg:text-lg !mt-1 !mb-1">
            {section.items.map((it, i) => {
              if (typeof it === "string") {
                return (
                  <li key={i} className="leading-normal">
                    {parseInlineMarkdown(it)}
                  </li>
                );
              }
              return (
                <li key={i} className="leading-normal">
                  {parseInlineMarkdown(it.text)}
                  <ul className="list-[circle] space-y-0.5 pl-6 mt-1.5">
                    {it.subitems.map((sub, j) => (
                      <li key={j} className="leading-normal">
                        {parseInlineMarkdown(sub)}
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        </section>
      );

    case "takeaways":
      return (
        <section className="rounded-xl border border-mint/30 bg-mint/5 p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-mint">
            Key takeaways
          </p>
          <ul className="mt-3 space-y-2">
            {section.items.map((it, i) => (
              <li
                key={i}
                className="lesson-supporting flex gap-2.5 text-foreground/90"
              >
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-mint" />
                <span>{parseInlineMarkdown(it)}</span>
              </li>
            ))}
          </ul>
        </section>
      );
  }
}
