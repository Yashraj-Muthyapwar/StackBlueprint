import { useState, useEffect } from "react";
import { Play, RotateCcw } from "lucide-react";
import { highlightShell } from "./SectionRenderer";
import type { Section } from "@/lessons/types";

type TerminalSection = Extract<Section, { kind: "terminal-animation" }>;

export function TerminalAnimation({ section }: { section: TerminalSection }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [charsTyped, setCharsTyped] = useState(0);
  const [outputLinesShown, setOutputLinesShown] = useState(0);

  const totalChars = section.command.length;
  // Normalize newlines and remove trailing empty lines to avoid awkward pauses
  const outputLines = section.output.replace(/\r\n/g, "\n").replace(/\n$/, "").split("\n");
  const totalOutputLines = outputLines.length;
  const isDone = charsTyped === totalChars && outputLinesShown === totalOutputLines;

  useEffect(() => {
    if (!isPlaying) return;

    if (charsTyped < totalChars) {
      const id = window.setTimeout(() => {
        setCharsTyped((c) => c + 1);
      }, Math.random() * 20 + 30); // Random typing speed
      return () => window.clearTimeout(id);
    } else if (charsTyped === totalChars && outputLinesShown < totalOutputLines) {
      const currentLine = outputLines[outputLinesShown] || "";
      const isPulling = currentLine.toLowerCase().includes("pull") || currentLine.toLowerCase().includes("download");
      const isStep = currentLine.startsWith("Step");
      
      // Calculate a realistic delay
      let delay = Math.random() * 40 + 20; // fast default
      if (outputLinesShown === 0) delay = 400; // Initial delay before output
      else if (isPulling) delay = Math.random() * 400 + 300; // Network operations take time
      else if (isStep) delay = 800; // Emulate a step taking time

      const id = window.setTimeout(() => {
        setOutputLinesShown((l) => l + 1);
      }, delay);
      return () => window.clearTimeout(id);
    }
  }, [isPlaying, charsTyped, totalChars, outputLinesShown, totalOutputLines, outputLines]);

  const handlePlay = () => {
    if (isDone) {
      setCharsTyped(0);
      setOutputLinesShown(0);
      setIsPlaying(true);
    } else if (!isPlaying) {
      setIsPlaying(true);
    }
  };

  const currentCommand = section.command.slice(0, charsTyped);
  const currentOutput = outputLinesShown > 0 
    ? outputLines.slice(0, outputLinesShown).join("\n") + "\n" 
    : "";

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
          {isDone ? <RotateCcw className="size-3" /> : <Play className="size-3" />}
          {isDone ? "Replay" : section.buttonLabel || "Run"}
        </button>
      </div>
      <div className="min-h-[140px] p-4 text-[13px] bg-slate-900 dark:bg-transparent">
        <pre className="font-mono leading-relaxed text-slate-100 dark:text-foreground/90">
          <div className="flex">
            <span className="mr-4 inline-block select-none text-slate-500 dark:text-muted-foreground/50">$</span>
            <span className="relative">
              {highlightShell(currentCommand)}
              <span 
                className={`absolute -right-2.5 top-0.5 h-[1.1em] w-1.5 bg-slate-400 dark:bg-foreground/50 ${!isPlaying && charsTyped === 0 ? 'animate-pulse' : ''} ${charsTyped === totalChars ? 'hidden' : ''}`}
              />
            </span>
          </div>
        </pre>
        
        {charsTyped === totalChars && (
          <pre className="mt-2 font-mono leading-relaxed text-slate-300 dark:text-foreground/80 overflow-x-auto whitespace-pre-wrap text-[12.5px]">
            {currentOutput}
            {!isDone && outputLinesShown < totalOutputLines && (
              <span className="inline-block h-[1.1em] w-1.5 bg-slate-400 dark:bg-foreground/50 align-middle -mt-1" />
            )}
          </pre>
        )}

        {isDone && (
          <div className="flex mt-2 font-mono leading-relaxed text-slate-100 dark:text-foreground/90 text-[13px]">
            <span className="mr-4 inline-block select-none text-slate-500 dark:text-muted-foreground/50">$</span>
            <span className="relative">
              <span className="absolute -left-1 top-0.5 h-[1.1em] w-1.5 bg-slate-400 dark:bg-foreground/50 animate-pulse" />
            </span>
          </div>
        )}
      </div>
    </figure>
  );
}
