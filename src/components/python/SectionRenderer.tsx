import type { Section } from "@/lessons/types";
import { AlertTriangle, CheckCircle2, Info, Brain, ArrowRight } from "lucide-react";
import { LessonAnimation } from "./LessonAnimation";
import { ZoomableImage } from "@/components/ui/zoomable-image";
import { ImageCarousel } from "@/components/ui/image-carousel";
import { Quiz } from "@/components/lesson/Quiz";
import { InteractivePythonBlock } from "@/components/lesson/InteractivePythonBlock";

function highlightPython(line: string) {
  const KEYWORDS = new Set([
    "False", "None", "True", "and", "as", "assert", "async", "await",
    "break", "class", "continue", "def", "del", "elif", "else", "except",
    "finally", "for", "from", "global", "if", "import", "in", "is", "lambda",
    "nonlocal", "not", "or", "pass", "raise", "return", "try", "while", "with", "yield"
  ]);
  const BUILTINS = new Set([
    "print", "open", "read", "write", "close", "int", "str", "float", "list", "dict", "set", "tuple", "len", "type", "range", "enumerate", "zip"
  ]);

  const nodes: React.ReactNode[] = [];
  let i = 0;
  let key = 0;
  while (i < line.length) {
    const ch = line[i];
    // Comment
    if (ch === "#") {
      nodes.push(
        <span key={key++} className="text-muted-foreground/70">
          {line.slice(i)}
        </span>,
      );
      break;
    }
    // String (single or double quotes)
    if (ch === "'" || ch === '"') {
      const end = line.indexOf(ch, i + 1);
      const stop = end === -1 ? line.length : end + 1;
      nodes.push(
        <span key={key++} className="text-amber">
          {line.slice(i, stop)}
        </span>,
      );
      i = stop;
      continue;
    }
    // Keywords & identifiers
    if (/[A-Za-z_]/.test(ch)) {
      let j = i + 1;
      while (j < line.length && /[A-Za-z0-9_]/.test(line[j])) j++;
      const word = line.slice(i, j);
      if (KEYWORDS.has(word)) {
        nodes.push(
          <span key={key++} className="text-mint font-medium">
            {word}
          </span>,
        );
      } else if (BUILTINS.has(word)) {
        nodes.push(
          <span key={key++} className="text-blue-400">
            {word}
          </span>,
        );
      } else {
        nodes.push(<span key={key++}>{word}</span>);
      }
      i = j;
      continue;
    }
    // Numbers
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
  if (!section) return null;

  switch (section.kind) {
    case "prose":
      return (
        <section className="space-y-3">
          {section.heading ? (
            <h2 className="text-xl font-semibold tracking-tight lg:text-2xl">
              {section.heading}
            </h2>
          ) : null}
          {section.body?.map((p, i) => {
            if (p.startsWith("### ")) {
              const text = p.slice(4);
              const targetId = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
              return (
                <h3 key={i} id={targetId} className="mt-4 mb-2 text-lg font-semibold tracking-tight text-foreground scroll-mt-24">
                  {parseInlineMarkdown(text)}
                </h3>
              );
            }
            return (
              <p key={i} className="leading-relaxed text-muted-foreground lg:text-lg">
                {parseInlineMarkdown(p)}
              </p>
            );
          })}
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
          <pre className="overflow-x-auto px-4 py-4 font-mono text-[13px] leading-relaxed shadow-inner">
            <code>
              {lines.map((line, i) => (
                <div key={i} className="flex">
                  <span className="mr-4 inline-block w-6 select-none text-right text-muted-foreground/50">
                    {i + 1}
                  </span>
                  <span className="text-foreground/90">{highlightPython(line)}</span>
                </div>
              ))}
            </code>
          </pre>
        </figure>
      );
    }

    case "interactive-code":
      return <InteractivePythonBlock initialCode={section.code} caption={section.caption} />;

    case "table":
      return (
        <figure className="overflow-hidden rounded-xl border border-hairline bg-slate-50 dark:bg-surface shadow-sm">
          {section.caption ? (
            <figcaption className="border-b border-hairline px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              {section.caption}
            </figcaption>
          ) : null}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-2 text-left text-muted-foreground">
                <tr>
                  {section.headers?.map((h, i) => (
                    <th
                      key={i}
                      className="border-b border-hairline px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em]"
                    >
                      {parseInlineMarkdown(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {section.rows?.map((row, ri) => (
                  <tr key={ri} className="border-b border-hairline/60 last:border-b-0">
                    {row.map((cell, ci) => (
                      <td
                        key={ci}
                        className={
                          "px-4 py-2.5 align-top " +
                          (ci === 0 ? "font-medium text-foreground" : "text-muted-foreground")
                        }
                      >
                        {parseInlineMarkdown(String(cell))}
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
            {section.title && <p className={`text-sm font-semibold ${tone.text}`}>{section.title}</p>}
            <div className="mt-1 space-y-2 text-sm leading-relaxed text-foreground/85">
              {(section.body || "").split("\n").filter(Boolean).map((paragraph, i) => (
                <p key={i} className={paragraph.startsWith("- ") ? "ml-4 list-item list-disc" : ""}>
                  {parseInlineMarkdown(paragraph.replace(/^- /, ''))}
                </p>
              ))}
            </div>
          </div>
        </aside>
      );
    }

    case "diagram":
      return (
        <figure className="overflow-hidden rounded-xl border border-hairline bg-slate-50 dark:bg-surface shadow-sm">
          <pre className="overflow-x-auto px-4 py-4 font-mono text-[12.5px] leading-snug text-foreground/85">
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
      return <LessonAnimation variant={section.variant as any} caption={section.caption} />;

    case "mnemonic": {
      return (
        <p className="my-6 text-center font-mono text-[13px] font-bold uppercase tracking-[0.15em] text-foreground/80">
          {section.text}
        </p>
      );
    }

    case "analogy":
      return (
        <section className="rounded-xl border border-violet/30 bg-violet/5 p-5 shadow-sm">
          <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-violet">
            <Brain className="size-5 text-amber" />
            Analogy: {section.title}
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-foreground/90">
            {parseInlineMarkdown(section.text || "")}
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
            {section.items?.map((it, i) => {
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
                  {it.subitems && it.subitems.length > 0 && (
                    <ul className="list-[circle] space-y-0.5 pl-6 mt-1.5">
                      {it.subitems.map((sub: string, j: number) => (
                        <li key={j} className="leading-normal">
                          {parseInlineMarkdown(sub)}
                        </li>
                      ))}
                    </ul>
                  )}
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
            {section.items?.map((it, i) => (
              <li
                key={i}
                className="flex gap-2.5 text-sm leading-relaxed text-foreground/90"
              >
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-mint" />
                <span>{parseInlineMarkdown(it)}</span>
              </li>
            ))}
          </ul>
        </section>
      );
      
    case "quiz":
      return <Quiz data={{ questions: section.questions, isFinalQuiz: section.isFinalQuiz }} onActiveChange={onQuizActiveChange} />;
      
    default:
      return null;
  }
}
