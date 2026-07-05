import type { Section } from "@/lessons/docker/foundations-content";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { LessonAnimation } from "@/components/docker/LessonAnimation";
import { TerminalAnimation } from "@/components/docker/TerminalAnimation";
import DockerRunUnderTheHood from "@/components/docker/DockerRunUnderTheHood";
import { Quiz } from "@/components/sql/Quiz";
import { useState, useEffect } from "react";

export function highlightShell(line: string) {
  const KEYWORDS = new Set([
    "docker", "run", "build", "pull", "push", "ps", "stop", "start", "exec",
    "systemctl", "sudo", "open", "uname", "FROM", "WORKDIR", "COPY", "CMD",
    "RUN", "ENV", "EXPOSE", "VOLUME", "ENTRYPOINT",
  ]);
  const nodes: React.ReactNode[] = [];
  let i = 0;
  let key = 0;
  while (i < line.length) {
    const ch = line[i];
    if (ch === "#") {
      nodes.push(
        <span key={key++} className="text-muted-foreground/70">
          {line.slice(i)}
        </span>,
      );
      break;
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

function ZoomableImage({ src, alt }: { src: string; alt?: string }) {
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    if (isZoomed) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isZoomed]);

  return (
    <>
      <img
        src={src}
        alt={alt}
        onClick={() => setIsZoomed(true)}
        className="h-auto w-full max-w-full object-contain px-4 lg:max-w-4xl cursor-zoom-in transition-transform duration-200 hover:scale-[1.015]"
      />
      {isZoomed && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md cursor-zoom-out"
          onClick={() => setIsZoomed(false)}
        >
          <button 
            className="absolute right-6 top-6 z-10 rounded-full bg-black/50 p-2 text-white hover:bg-black/80 transition-colors"
            onClick={(e) => { e.stopPropagation(); setIsZoomed(false); }}
            aria-label="Close fullscreen image"
          >
            <X className="size-6" />
          </button>
          <img
            src={src}
            alt={alt}
            className="max-h-[90vh] max-w-[95vw] rounded-lg object-contain shadow-2xl"
            onClick={(e) => { e.stopPropagation(); setIsZoomed(false); }}
          />
        </div>
      )}
    </>
  );
}

export function SectionRenderer({ section }: { section: Section }) {
  switch (section.kind) {
    case "prose":
      return (
        <section className="space-y-3">
          {section.heading ? (
            <h2 className="text-xl font-semibold tracking-tight lg:text-2xl">
              {section.heading}
            </h2>
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
                  <span className="text-foreground/90">{highlightShell(line)}</span>
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
        <aside
          className={`flex gap-3 rounded-xl ${tone.bg} p-4 ring-1 ${tone.ring}`}
        >
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
            <ZoomableImage src={section.src} alt={section.alt} />
          </div>
          {section.caption ? (
            <figcaption className="border-t border-hairline px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              {section.caption}
            </figcaption>
          ) : null}
        </figure>
      );

    case "animation":
      return (
        <LessonAnimation
          variant={section.variant as import("@/components/docker/animation-stages").AnyVariant}
          caption={section.caption}
        />
      );

    case "terminal-animation":
      return <TerminalAnimation section={section} />;

    case "docker-run-under-the-hood":
      return (
        <div className="my-8">
          <DockerRunUnderTheHood />
        </div>
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
      return <Quiz data={{ questions: section.questions }} />;
  }
}
