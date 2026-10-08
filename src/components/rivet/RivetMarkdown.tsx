import { createContext, Fragment, useContext, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { isKnownLessonPath } from "@/lib/rivet/sitemap";

/**
 * Small, safe markdown renderer for model replies. It builds React nodes
 * (never HTML strings), supports paragraphs, lists, headings, bold, italics,
 * inline code, links and fenced code blocks, and tolerates the half-written
 * markdown seen while a reply is still streaming.
 *
 * Links are checked, not trusted: only links to StackBlueprint lessons that
 * exist and have content become clickable (and navigate inside the app). Any
 * other link, including every external website and any lesson path the model
 * made up, is shown as plain text.
 */
const NavigateContext = createContext<() => void>(() => {});

/** Turns a model-written href into a site path, or null when it points somewhere else. */
function toSitePath(href: string): string | null {
  if (href.startsWith("/") && !href.startsWith("//")) return href;
  try {
    const url = new URL(href);
    return url.origin === window.location.origin ? url.pathname : null;
  } catch {
    return null;
  }
}

function RivetLink({ href, label }: { href: string; label: string }) {
  const onNavigate = useContext(NavigateContext);
  const path = toSitePath(href);
  if (!path || !isKnownLessonPath(path)) return <>{label}</>;
  return (
    <Link
      to={path as never}
      onClick={onNavigate}
      className="text-primary underline underline-offset-2"
    >
      {label}
    </Link>
  );
}

function inline(text: string): ReactNode[] {
  return text
    .split(
      /(`[^`\n]+`|\*\*[^*\n]+\*\*|\[[^\]\n]+\]\((?:https?:\/\/|\/(?!\/))[^)\s]+\)|\*[^*\s][^*\n]*\*)/g,
    )
    .map((part, i) => {
      if (part.startsWith("`") && part.endsWith("`") && part.length > 2)
        return (
          <code
            key={i}
            className="rounded bg-mint/10 px-1 py-0.5 font-mono text-[0.85em] text-mint"
          >
            {part.slice(1, -1)}
          </code>
        );
      if (part.startsWith("**") && part.endsWith("**") && part.length > 4)
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      const link = part.match(/^\[([^\]]+)\]\(((?:https?:\/\/|\/(?!\/))[^)\s]+)\)$/);
      if (link) return <RivetLink key={i} href={link[2]} label={link[1]} />;
      if (part.startsWith("*") && part.endsWith("*") && part.length > 2)
        return <em key={i}>{part.slice(1, -1)}</em>;
      return <Fragment key={i}>{part}</Fragment>;
    });
}

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="my-2 overflow-hidden rounded-lg border bg-background">
      <div className="flex items-center justify-between border-b px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        <span>{lang || "code"}</span>
        <button
          className="flex cursor-pointer items-center gap-1 hover:text-foreground"
          onClick={() => {
            navigator.clipboard?.writeText(code).then(() => {
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1500);
            });
          }}
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto px-3 py-2 font-mono text-xs leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function Block({ text }: { text: string }) {
  const lines = text.split("\n");
  if (lines.every((l) => /^\s*[-*•]\s+/.test(l)))
    return (
      <ul className="my-1.5 list-disc space-y-0.5 pl-5">
        {lines.map((l, i) => (
          <li key={i}>{inline(l.replace(/^\s*[-*•]\s+/, ""))}</li>
        ))}
      </ul>
    );
  if (lines.every((l) => /^\s*\d+[.)]\s+/.test(l)))
    return (
      <ol className="my-1.5 list-decimal space-y-0.5 pl-5">
        {lines.map((l, i) => (
          <li key={i}>{inline(l.replace(/^\s*\d+[.)]\s+/, ""))}</li>
        ))}
      </ol>
    );
  if (/^#{1,4}\s+/.test(lines[0]))
    return (
      <>
        <p className="mt-2 font-semibold">{inline(lines[0].replace(/^#{1,4}\s+/, ""))}</p>
        {lines.length > 1 && <Block text={lines.slice(1).join("\n")} />}
      </>
    );
  return (
    <p className="my-1.5">
      {lines.map((l, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {inline(l)}
        </Fragment>
      ))}
    </p>
  );
}

export function RivetMarkdown({
  text,
  className,
  onNavigate,
}: {
  text: string;
  className?: string;
  /** Called when the learner follows a lesson link (for example to close the panel on phones). */
  onNavigate?: () => void;
}) {
  const segments: ReactNode[] = [];
  const fence = /```([\w+-]*)\n?([\s\S]*?)(```|$)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  const prose = (chunk: string, key: string) =>
    chunk
      .split(/\n{2,}/)
      .filter((b) => b.trim())
      .forEach((b, i) =>
        segments.push(<Block key={`${key}-${i}`} text={b.replace(/^\n+|\n+$/g, "")} />),
      );

  while ((m = fence.exec(text)) !== null) {
    if (m.index > last) prose(text.slice(last, m.index), `p${last}`);
    segments.push(<CodeBlock key={`c${m.index}`} lang={m[1]} code={m[2].replace(/\n$/, "")} />);
    last = m.index + m[0].length;
    if (m[0].length === 0) fence.lastIndex++;
  }
  if (last < text.length) prose(text.slice(last), `p${last}`);

  return (
    <NavigateContext.Provider value={onNavigate ?? (() => {})}>
      <div
        className={cn(
          "text-sm leading-relaxed [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
          className,
        )}
      >
        {segments}
      </div>
    </NavigateContext.Provider>
  );
}
