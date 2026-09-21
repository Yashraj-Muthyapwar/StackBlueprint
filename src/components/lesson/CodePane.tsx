import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";

/**
 * Renders Python code with line numbers and a sliding highlight bar
 * that animates to the currently-executing line.
 */
export function CodePane({ code, activeLine }: { code: string; activeLine: number }) {
  const lines = useMemo(() => code.split("\n"), [code]);
  const [copied, setCopied] = useState(false);
  const LINE_H = 26; // px per line

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-hairline bg-surface">
      <div className="flex items-center justify-between border-b border-hairline px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-rose/60" />
            <span className="size-2.5 rounded-full bg-amber/60" />
            <span className="size-2.5 rounded-full bg-mint/60" />
          </div>
          <span className="ml-2 font-mono text-[11px] text-muted-foreground">solution.py</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={copy}
            className="flex items-center gap-1 rounded border border-hairline px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground transition hover:border-mint/60 hover:text-mint"
            aria-label="Copy code"
          >
            {copied ? <Check size={11} /> : <Copy size={11} />}
            {copied ? "copied" : "copy"}
          </button>
          <span className="rounded border border-hairline px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            python
          </span>
        </div>
      </div>

      <div className="relative flex-1 overflow-auto">
        <div className="relative font-mono text-[13px] leading-[26px]">
          {/* sliding highlight bar */}
          <motion.div
            className="pointer-events-none absolute left-0 right-0 rounded-md"
            style={{
              height: LINE_H,
              background:
                "linear-gradient(90deg, color-mix(in oklab, var(--mint) 18%, transparent), color-mix(in oklab, var(--mint) 4%, transparent))",
              borderLeft: "2px solid var(--mint)",
            }}
            animate={{ y: (activeLine - 1) * LINE_H }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          />

          {lines.map((line, i) => {
            const lineNo = i + 1;
            const isActive = lineNo === activeLine;
            return (
              <div
                key={i}
                className="grid grid-cols-[3rem_1fr] items-center"
                style={{ height: LINE_H }}
              >
                <span
                  className={`select-none pr-3 text-right font-mono text-[11px] ${
                    isActive ? "text-mint" : "text-muted-foreground/40"
                  }`}
                >
                  {lineNo}
                </span>
                <pre
                  className={`whitespace-pre pr-4 ${
                    isActive ? "text-foreground" : "text-foreground/70"
                  }`}
                  style={{ fontVariantLigatures: "none" }}
                >
                  {highlight(line)}
                </pre>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const KEYWORDS = new Set([
  "def",
  "return",
  "while",
  "if",
  "elif",
  "else",
  "for",
  "in",
  "and",
  "or",
  "not",
  "None",
  "True",
  "False",
  "len",
  "range",
]);

function highlight(line: string): React.ReactNode {
  // Tokenize a single line — keywords, numbers, strings, comments.
  const out: React.ReactNode[] = [];
  // Comments
  const commentIdx = line.indexOf("#");
  const codePart = commentIdx >= 0 ? line.slice(0, commentIdx) : line;
  const comment = commentIdx >= 0 ? line.slice(commentIdx) : "";

  // Group multi-char operators (!=, ==, <=, >=, +=, -=, *=, /=, //, **, ->) so
  // font ligatures never fuse `!=` into a ≠ glyph across adjacent single-char spans.
  const re =
    /(\s+|[A-Za-z_][A-Za-z0-9_]*|\d+|".*?"|'.*?'|!=|==|<=|>=|\+=|-=|\*=|\/=|\/\/|\*\*|->|[^\s\w])/g;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(codePart)) !== null) {
    const tok = m[0];
    if (/^\s+$/.test(tok)) {
      out.push(tok);
    } else if (KEYWORDS.has(tok)) {
      out.push(
        <span key={k++} style={{ color: "var(--violet)" }}>
          {tok}
        </span>,
      );
    } else if (/^\d+$/.test(tok)) {
      out.push(
        <span key={k++} style={{ color: "var(--amber)" }}>
          {tok}
        </span>,
      );
    } else if (/^["']/.test(tok)) {
      out.push(
        <span key={k++} style={{ color: "var(--mint)" }}>
          {tok}
        </span>,
      );
    } else if (/^[A-Za-z_]/.test(tok)) {
      out.push(<span key={k++}>{tok}</span>);
    } else {
      out.push(
        <span
          key={k++}
          style={{ color: "color-mix(in oklab, var(--foreground) 60%, transparent)" }}
        >
          {tok}
        </span>,
      );
    }
  }
  if (comment) {
    out.push(
      <span key="c" style={{ color: "color-mix(in oklab, var(--foreground) 40%, transparent)" }}>
        {comment}
      </span>,
    );
  }
  return out;
}
