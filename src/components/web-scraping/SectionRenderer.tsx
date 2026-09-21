import type { Section } from "@/lessons/types";
import { AlertTriangle, CheckCircle2, Info, X, Copy, Check, Brain } from "lucide-react";
import { Quiz } from "@/components/lesson/Quiz";
import { useState } from "react";
import { ZoomableImage } from "@/components/ui/zoomable-image";
import { ImageCarousel } from "@/components/ui/image-carousel";

export function highlightShell(line: string, isTerminal?: boolean) {
  const KEYWORDS = new Set([
    "import",
    "from",
    "def",
    "class",
    "return",
    "if",
    "else",
    "elif",
    "try",
    "except",
    "requests",
    "BeautifulSoup",
    "scrapy",
    "playwright",
    "selenium",
  ]);
  const nodes: React.ReactNode[] = [];
  let i = 0;
  let key = 0;
  while (i < line.length) {
    const ch = line[i];
    if (ch === "#") {
      const newlineIdx = line.indexOf("\n", i);
      const end = newlineIdx === -1 ? line.length : newlineIdx;
      nodes.push(
        <span
          key={key++}
          className={
            isTerminal ? "text-slate-400 italic" : "text-slate-500 dark:text-slate-400 italic"
          }
        >
          {line.slice(i, end)}
        </span>,
      );
      i = end;
      continue;
    }
    if (ch === "$") {
      nodes.push(
        <span key={key++} className="text-mint">
          {ch}
        </span>,
      );
      i++;
      continue;
    }
    if (ch === "'" || ch === '"') {
      const quote = ch;
      const end = line.indexOf(quote, i + 1);
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
      while (j < line.length && /[A-Za-z0-9_\-./:]/.test(line[j])) j++;
      const word = line.slice(i, j);
      const base = word.split(/[/:]/)[0];
      if (KEYWORDS.has(word) || KEYWORDS.has(base)) {
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
      while (j < line.length && /[0-9.mMGK]/.test(line[j])) j++;
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
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em key={i} className="italic text-foreground">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          className="rounded bg-red-50 dark:bg-red-500/10 px-1.5 py-0.5 font-mono text-[0.85em] text-red-600 dark:text-red-400 font-medium"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 rounded-md border border-hairline/60 bg-surface/50 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
      aria-label="Copy code"
    >
      {copied ? (
        <>
          <Check className="size-3.5 text-mint" />
          <span className="text-mint">Copied</span>
        </>
      ) : (
        <>
          <Copy className="size-3.5" />
          <span>Copy</span>
        </>
      )}
    </button>
  );
}

export function SectionRenderer({
  section,
  onQuizActiveChange,
}: {
  section: Section;
  onQuizActiveChange?: (active: boolean) => void;
}) {
  switch (section.kind) {
    case "prose":
      return (
        <section className="space-y-3">
          {section.heading ? (
            <h2 className="text-xl font-semibold tracking-tight lg:text-2xl">{section.heading}</h2>
          ) : null}
          {section.body.map((p, i) => (
            <p key={i} className="leading-relaxed text-muted-foreground lg:text-lg">
              {parseInlineMarkdown(p)}
            </p>
          ))}
        </section>
      );

    case "code": {
      const lines = section.code.split("\n");
      let langLabel = section.language || "python";
      if (section.language === "bash") {
        langLabel = "bash";
      }
      return (
        <figure className="w-full max-w-full overflow-hidden rounded-xl border border-hairline bg-slate-50 dark:bg-surface shadow-sm">
          <div className="flex items-center justify-between border-b border-hairline/60 bg-surface-2/40 px-4 py-2.5 min-w-0">
            <div className="flex items-center gap-1.5">
              <div className="size-2.5 shrink-0 rounded-full bg-rose-500/80 shadow-sm" />
              <div className="size-2.5 shrink-0 rounded-full bg-amber-500/80 shadow-sm" />
              <div className="size-2.5 shrink-0 rounded-full bg-emerald-500/80 shadow-sm" />
              {section.caption ? (
                <span className="ml-2 truncate font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  {section.caption}
                </span>
              ) : null}
            </div>
            {section.language !== "text" && (
              <div className="flex items-center gap-2">
                <CopyButton text={section.code} />
                <div className="rounded-md border border-hairline/60 bg-surface/50 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  {langLabel}
                </div>
              </div>
            )}
          </div>
          <pre className="overflow-x-auto px-4 py-4 font-mono text-[13px] leading-relaxed shadow-inner">
            <code className="block min-w-max">
              {lines.map((line, i) => (
                <div key={i} className="flex">
                  <span className="mr-4 inline-block w-6 shrink-0 select-none text-right text-muted-foreground/50">
                    {i + 1}
                  </span>
                  <span className="text-foreground/90">{highlightShell(line, false)}</span>
                </div>
              ))}
            </code>
          </pre>
        </figure>
      );
    }

    case "table":
      return (
        <figure className="w-full max-w-full overflow-hidden rounded-xl border border-hairline bg-slate-50 dark:bg-surface shadow-sm">
          {section.caption ? (
            <figcaption className="border-b border-hairline px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              {section.caption}
            </figcaption>
          ) : null}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
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
        <aside className={`flex gap-3 rounded-xl ${tone.bg} p-4 ring-1 ${tone.ring}`}>
          <Icon className={`mt-0.5 size-5 shrink-0 ${tone.text}`} />
          <div>
            <p className={`text-sm font-semibold ${tone.text}`}>{section.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-foreground/85">
              {parseInlineMarkdown(section.body)}
            </p>
          </div>
        </aside>
      );
    }

    case "diagram":
      return (
        <figure className="w-full max-w-full overflow-hidden rounded-xl border border-hairline bg-slate-50 dark:bg-surface shadow-sm">
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
            <ZoomableImage
              src={section.src}
              alt={section.alt}
              className="h-auto w-full max-w-full object-contain px-4 lg:max-w-4xl"
            />
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

    case "analogy":
      return (
        <section className="rounded-xl border border-violet/30 bg-violet/5 p-5 shadow-sm">
          <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-violet">
            <Brain className="size-5 text-amber" />
            Analogy: {section.title}
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-foreground/90">
            {parseInlineMarkdown(section.text)}
          </p>
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
              <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-foreground/90">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-mint" />
                <span>{parseInlineMarkdown(it)}</span>
              </li>
            ))}
          </ul>
        </section>
      );

    case "list":
      return (
        <section className="space-y-3">
          {section.heading ? (
            <h2 className="text-xl font-semibold tracking-tight lg:text-2xl">{section.heading}</h2>
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

    case "quiz":
      return <Quiz data={{ questions: section.questions }} onActiveChange={onQuizActiveChange} />;
  }
}
