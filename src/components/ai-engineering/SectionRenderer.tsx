import type { ReactNode } from "react";
import { AlertTriangle, Brain, CheckCircle2, Info } from "lucide-react";
import { Quiz } from "@/components/lesson/Quiz";
import type { AIEngineeringSection } from "@/lessons/ai-engineering/core-concepts-content";
import { AttentionWorkbench } from "./core-concepts/AttentionWorkbench";
import { TransformerExplorer } from "./core-concepts/TransformerExplorer";

function inline(text: string): ReactNode[] {
  return text.split(/(\*\*.*?\*\*|`.*?`)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return (
        <strong key={index} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    if (part.startsWith("`") && part.endsWith("`"))
      return (
        <code
          key={index}
          className="rounded bg-mint/10 px-1.5 py-0.5 font-mono text-[0.85em] font-medium text-mint"
        >
          {part.slice(1, -1)}
        </code>
      );
    return <span key={index}>{part}</span>;
  });
}

export function SectionRenderer({
  section,
  onQuizActiveChange,
}: {
  section: AIEngineeringSection;
  onQuizActiveChange?: (active: boolean) => void;
}) {
  switch (section.kind) {
    case "prose":
      return (
        <section className="space-y-3">
          {section.heading ? (
            <h2 className="lesson-section-title font-semibold tracking-tight">{section.heading}</h2>
          ) : null}
          {section.body.map((paragraph, index) => (
            <p key={index} className="lesson-prose text-muted-foreground">
              {inline(paragraph)}
            </p>
          ))}
        </section>
      );
    case "table":
      return (
        <figure className="overflow-hidden rounded-xl border border-hairline bg-slate-50 shadow-sm dark:bg-surface">
          {section.caption ? (
            <figcaption className="border-b border-hairline px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              {section.caption}
            </figcaption>
          ) : null}
          <div className="overflow-x-auto">
            <table className="lesson-supporting w-full">
              <thead className="bg-surface-2 text-left text-muted-foreground">
                <tr>
                  {section.headers.map((header) => (
                    <th
                      key={header}
                      className="border-b border-hairline px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em]"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {section.rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-b border-hairline/60 last:border-b-0">
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className={`px-4 py-3 align-top leading-relaxed ${cellIndex === 0 ? "font-medium text-foreground" : "text-muted-foreground"}`}
                      >
                        {inline(cell)}
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
          ? { bg: "bg-amber/10", ring: "ring-amber/40", text: "text-amber", Icon: AlertTriangle }
          : section.tone === "success"
            ? { bg: "bg-mint/10", ring: "ring-mint/40", text: "text-mint", Icon: CheckCircle2 }
            : section.tone === "violet"
              ? { bg: "bg-violet/10", ring: "ring-violet/40", text: "text-violet", Icon: Info }
              : { bg: "bg-sky-500/10", ring: "ring-sky-500/40", text: "text-sky-500", Icon: Info };
      const Icon = tone.Icon;
      return (
        <aside className={`flex gap-3 rounded-xl p-4 ring-1 ${tone.bg} ${tone.ring}`}>
          <Icon className={`mt-0.5 size-5 shrink-0 ${tone.text}`} />
          <div>
            <p className={`text-sm font-semibold ${tone.text}`}>{section.title}</p>
            <p className="lesson-supporting mt-1 text-foreground/85">
              {inline(section.body)}
            </p>
          </div>
        </aside>
      );
    }
    case "analogy":
      return (
        <section className="rounded-xl border border-violet/30 bg-violet/5 p-5 shadow-sm">
          <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-violet">
            <Brain className="size-5 text-amber" />
            Analogy: {section.title}
          </p>
          <p className="lesson-supporting mt-3 text-foreground/90">
            {inline(section.text)}
          </p>
        </section>
      );
    case "diagram":
      return (
        <figure className="overflow-hidden rounded-xl border border-hairline bg-slate-50 shadow-sm dark:bg-surface">
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
    case "code":
      return (
        <figure className="overflow-hidden rounded-xl border border-hairline bg-slate-50 shadow-sm dark:bg-surface">
          <figcaption className="border-b border-hairline px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {section.caption ?? section.language}
          </figcaption>
          <pre className="lesson-code overflow-x-auto px-4 py-4 font-mono text-foreground/90">
            <code>{section.code}</code>
          </pre>
        </figure>
      );
    case "transformer-explorer":
      return (
        <figure className="overflow-hidden rounded-xl border border-hairline bg-slate-50 shadow-sm dark:bg-surface">
          {section.caption ? (
            <figcaption className="border-b border-hairline px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              {section.caption}
            </figcaption>
          ) : null}
          <TransformerExplorer />
        </figure>
      );
    case "attention-workbench":
      return (
        <figure className="overflow-hidden rounded-xl border border-hairline bg-slate-50 shadow-sm dark:bg-surface">
          {section.caption ? (
            <figcaption className="border-b border-hairline px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              {section.caption}
            </figcaption>
          ) : null}
          <AttentionWorkbench />
        </figure>
      );
    case "takeaways":
      return (
        <section className="rounded-xl border border-mint/30 bg-mint/5 p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-mint">
            Key takeaways
          </p>
          <ul className="mt-3 space-y-2">
            {section.items.map((item) => (
              <li key={item} className="lesson-supporting flex gap-2.5 text-foreground/90">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-mint" />
                <span>{inline(item)}</span>
              </li>
            ))}
          </ul>
        </section>
      );
    case "quiz":
      return <Quiz data={{ questions: section.questions }} onActiveChange={onQuizActiveChange} />;
  }
}
