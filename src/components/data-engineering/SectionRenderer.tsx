import type { Section } from "@/lessons/types";
import { AlertTriangle, CheckCircle2, Info, Brain } from "lucide-react";
import { ZoomableImage } from "@/components/ui/zoomable-image";
import { Quiz } from "@/components/lesson/Quiz";

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
      return <code key={i} className="rounded bg-red-50 dark:bg-red-500/10 px-1.5 py-0.5 font-mono text-[0.85em] text-red-600 dark:text-red-400 font-medium">{part.slice(1, -1)}</code>;
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
            <h2 className="text-xl font-semibold tracking-tight lg:text-2xl">
              {section.heading}
            </h2>
          ) : null}
          {section.body.map((p, i) => {
            if (p.startsWith('### ')) {
              return (
                <h3 key={i} className="mt-8 mb-2 text-lg font-semibold tracking-tight text-foreground lg:text-xl">
                  {parseInlineMarkdown(p.replace('### ', ''))}
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
          <div className="w-full flex justify-center bg-surface-2/30 py-4">
            <ZoomableImage src={section.src} alt={section.alt} className="h-auto w-full max-w-full object-contain px-4 lg:max-w-4xl" />
          </div>
          {section.caption ? (
            <figcaption className="border-t border-hairline px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              {section.caption}
            </figcaption>
          ) : null}
        </figure>
      );

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
          <ul className="list-disc space-y-1.5 pl-6 text-muted-foreground lg:text-lg">
            {section.items.map((it, i) => {
              if (typeof it === "string") {
                return (
                  <li key={i} className="leading-relaxed">
                    {parseInlineMarkdown(it)}
                  </li>
                );
              }
              return (
                <li key={i} className="leading-relaxed">
                  {parseInlineMarkdown(it.text)}
                  <ul className="list-[circle] space-y-1.5 pl-6 mt-1.5">
                    {it.subitems.map((sub, j) => (
                      <li key={j} className="leading-relaxed">
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
      return <Quiz data={{ questions: section.questions, isFinalQuiz: section.isFinalQuiz }} onActiveChange={onQuizActiveChange} />;
      
    default:
      return null;
  }
}
