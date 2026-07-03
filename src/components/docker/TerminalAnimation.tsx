import { useState, useEffect } from "react";
import { Play, RotateCcw } from "lucide-react";
import { highlightShell } from "./SectionRenderer";
import type { Section } from "@/lessons/types";

type TerminalSection = Extract<Section, { kind: "terminal-animation" }>;

export function TerminalAnimation({ section }: { section: TerminalSection }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [charsTyped, setCharsTyped] = useState(0);
  const [showOutput, setShowOutput] = useState(false);

  const totalChars = section.command.length;

  useEffect(() => {
    if (!isPlaying) return;

    if (charsTyped < totalChars) {
      const id = window.setTimeout(() => {
        setCharsTyped((c) => c + 1);
      }, Math.random() * 20 + 30); // Random typing speed
      return () => window.clearTimeout(id);
    } else if (charsTyped === totalChars && !showOutput) {
      const id = window.setTimeout(() => {
        setShowOutput(true);
      }, 500); // Delay before showing output
      return () => window.clearTimeout(id);
    }
  }, [isPlaying, charsTyped, totalChars, showOutput]);

  const handlePlay = () => {
    if (showOutput || (charsTyped === totalChars)) {
      setCharsTyped(0);
      setShowOutput(false);
      setIsPlaying(true);
    } else if (!isPlaying) {
      setIsPlaying(true);
    }
  };

  const currentCommand = section.command.slice(0, charsTyped);

  return (
    <figure className="overflow-hidden rounded-xl border border-hairline bg-slate-50 dark:bg-surface shadow-sm">
      <div className="flex items-center justify-between border-b border-hairline/60 bg-surface-2/40 px-4 py-2.5">
        <div className="flex items-center gap-1.5">
          <div className="size-2.5 rounded-full bg-rose-500/80 shadow-sm" />
          <div className="size-2.5 rounded-full bg-amber-500/80 shadow-sm" />
          <div className="size-2.5 rounded-full bg-emerald-500/80 shadow-sm" />
          {section.caption ? (
            <span className="ml-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              {section.caption}
            </span>
          ) : null}
        </div>
        <button
          onClick={handlePlay}
          className="flex items-center gap-1.5 rounded bg-mint/10 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-mint transition-colors hover:bg-mint/20"
        >
          {showOutput ? <RotateCcw className="size-3" /> : <Play className="size-3" />}
          {showOutput ? "Replay" : section.buttonLabel || "Run"}
        </button>
      </div>
      <div className="min-h-[140px] p-4 text-[13px] bg-slate-900 dark:bg-transparent">
        <pre className="font-mono leading-relaxed text-slate-100 dark:text-foreground/90">
          <div className="flex">
            <span className="mr-4 inline-block select-none text-slate-500 dark:text-muted-foreground/50">$</span>
            <span className="relative">
              {highlightShell(currentCommand)}
              <span 
                className={`absolute -right-2.5 top-0.5 h-[1.1em] w-1.5 bg-slate-400 dark:bg-foreground/50 ${!isPlaying && !showOutput ? 'animate-pulse' : ''} ${showOutput ? 'hidden' : ''}`}
              />
            </span>
          </div>
        </pre>
        {showOutput && (
          <pre className="mt-2 font-mono leading-relaxed text-slate-300 dark:text-foreground/80 overflow-x-auto whitespace-pre-wrap text-[12.5px]">
            {section.output}
            <div className="flex mt-2">
              <span className="mr-4 inline-block select-none text-slate-500 dark:text-muted-foreground/50">$</span>
              <span className="relative">
                <span className="absolute -right-2.5 top-0.5 h-[1.1em] w-1.5 bg-slate-400 dark:bg-foreground/50 animate-pulse" />
              </span>
            </div>
          </pre>
        )}
      </div>
    </figure>
  );
}
