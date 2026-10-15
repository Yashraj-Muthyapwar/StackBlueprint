import { useState, useEffect, useRef } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { oneDark } from "@codemirror/theme-one-dark";
import { pythonEditorBehaviour } from "./python-editor-extensions";
import { Play, Loader2, Square, RotateCcw } from "lucide-react";
import { runPython, stoppedMessage } from "@/lib/python-sandbox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface InteractivePythonBlockProps {
  initialCode: string;
  caption?: string;
  packages?: string[];
  onChange?: (code: string) => void;
  hideRunButton?: boolean;
  hideOutput?: boolean;
  className?: string;
  customFooterAction?: React.ReactNode;
}

export function InteractivePythonBlock({
  initialCode,
  caption,
  packages = [],
  onChange,
  hideRunButton,
  hideOutput,
  className,
  customFooterAction,
}: InteractivePythonBlockProps) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);
  const [isLoadingPyodide, setIsLoadingPyodide] = useState(false);

  useEffect(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsRunning(false);
    setIsLoadingPyodide(false);
    setCode(initialCode);
    setOutput("");
    setError("");
  }, [initialCode]);

  const abortRef = useRef<AbortController | null>(null);
  useEffect(
    () => () => {
      abortRef.current?.abort();
      abortRef.current = null;
    },
    [],
  );

  const handleRun = async () => {
    if (isRunning) return;
    const controller = new AbortController();
    abortRef.current = controller;
    setIsRunning(true);
    setIsLoadingPyodide(true);
    setOutput("");
    setError("");

    // Runs in an isolated sandbox frame: no access to this page, its storage or Rivet's keys.
    const result = await runPython({
      code,
      packages,
      signal: controller.signal,
      onStatus: (m) => !controller.signal.aborted && m === "running" && setIsLoadingPyodide(false),
      onStdout: (str) => !controller.signal.aborted && setOutput((prev) => prev + str),
      onStderr: (str) => !controller.signal.aborted && setError((prev) => prev + str),
    });
    if (abortRef.current !== controller) return;
    if (result.stopped) setError((prev) => prev + stoppedMessage(result) + "\n");
    else if (!result.ok && result.error) setError((prev) => prev + result.error + "\n");
    if (abortRef.current === controller) abortRef.current = null;
    setIsRunning(false);
    setIsLoadingPyodide(false);
  };

  const handleStop = () => abortRef.current?.abort();

  const handleReset = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsRunning(false);
    setIsLoadingPyodide(false);
    setCode(initialCode);
    setOutput("");
    setError("");
  };

  return (
    <figure
      className={cn(
        "group relative overflow-hidden rounded-xl border border-hairline bg-slate-50 dark:bg-surface shadow-sm my-6",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-2 border-b border-hairline/60 bg-surface-2/40 px-3 sm:px-4 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <div className="hidden min-[400px]:flex gap-1.5 mr-1 shrink-0">
            <div className="size-2.5 rounded-full bg-rose-500/80 shadow-[0_0_8px_rgba(244,63,94,0.4)]" />
            <div className="size-2.5 rounded-full bg-amber-500/80 shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
            <div className="size-2.5 rounded-full bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
          </div>
          {caption ? (
            <span className="truncate font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground font-semibold">
              {caption}
            </span>
          ) : (
            <span className="font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground/80 font-semibold flex items-center gap-1.5">
              PYTHON
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-7 px-2 sm:px-2.5 text-xs text-muted-foreground hover:bg-surface-2 transition-colors"
          >
            <RotateCcw className="size-3.5 mr-1" />
            Reset
          </Button>
          {!hideRunButton && (
            <Button
              variant="default"
              size="sm"
              onClick={isRunning ? handleStop : handleRun}
              aria-label={isRunning ? "Stop running code" : "Run code"}
              className="h-7 px-2.5 sm:px-3 text-xs bg-mint/90 hover:bg-mint text-slate-900 font-bold shadow-[0_0_12px_rgba(110,231,183,0.3)] transition-all shrink-0"
            >
              {isLoadingPyodide ? (
                <Loader2 className="size-3.5 mr-1.5 animate-spin" />
              ) : isRunning ? (
                <Square className="size-3.5 mr-1.5 fill-slate-900" />
              ) : (
                <Play className="size-3.5 mr-1.5 fill-slate-900" />
              )}
              {isRunning ? (isLoadingPyodide ? "Loading… (Stop)" : "Stop") : "Run Code"}
            </Button>
          )}
        </div>
      </div>

      <div className="relative bg-slate-950 border-b border-hairline">
        <CodeMirror
          value={code}
          onChange={(v) => {
            setCode(v);
            onChange?.(v);
          }}
          extensions={[python(), ...pythonEditorBehaviour]}
          theme={oneDark}
          basicSetup={{
            lineNumbers: true,
            foldGutter: false,
            highlightActiveLine: false,
          }}
          className="text-[13.5px] font-mono [&_.cm-editor]:bg-slate-950 [&_.cm-gutters]:bg-slate-950 [&_.cm-gutters]:border-r-0 [&_.cm-gutters]:text-[#6E7681] [&_.cm-gutters]:!pr-3 [&_.cm-scroller]:!py-4 selection:bg-mint/20"
        />
      </div>

      {!hideOutput && (output || error) && (
        <div className="bg-[#0d1117] px-5 py-4 font-mono text-[13px] relative border-t border-hairline/20 max-h-64 overflow-y-auto">
          <div className="text-slate-500 text-[10px] mb-3 uppercase tracking-[0.2em] font-bold flex items-center gap-2">
            <div className="size-1.5 rounded-full bg-mint/70 shadow-[0_0_8px_rgba(110,231,183,0.5)]" />
            Terminal Output
          </div>
          {output && (
            <div className="text-slate-300 whitespace-pre-wrap leading-relaxed">{output}</div>
          )}
          {error && (
            <div className="text-rose-400 whitespace-pre-wrap leading-relaxed mt-2">{error}</div>
          )}
        </div>
      )}

      {customFooterAction && (
        <div className="bg-surface-2/40 border-t border-hairline/60 px-4 py-3 flex justify-end">
          {customFooterAction}
        </div>
      )}
    </figure>
  );
}
