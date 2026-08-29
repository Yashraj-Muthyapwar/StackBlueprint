import { useState, useEffect } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { oneDark } from "@codemirror/theme-one-dark";
import { keymap } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";
import { Play, Loader2, Square, RotateCcw } from "lucide-react";
import { getPyodide } from "@/lib/pyodide-loader";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface InteractivePythonBlockProps {
  initialCode: string;
  caption?: string;
  onChange?: (code: string) => void;
  hideRunButton?: boolean;
  hideOutput?: boolean;
  className?: string;
  customFooterAction?: React.ReactNode;
}

export function InteractivePythonBlock({ initialCode, caption, onChange, hideRunButton, hideOutput, className, customFooterAction }: InteractivePythonBlockProps) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);
  const [isLoadingPyodide, setIsLoadingPyodide] = useState(false);

  useEffect(() => {
    setCode(initialCode);
    setOutput("");
    setError("");
  }, [initialCode]);

  const handleRun = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setOutput("");
    setError("");

    try {
      setIsLoadingPyodide(true);
      const pyodide = await getPyodide();
      setIsLoadingPyodide(false);

      pyodide.setStdout({
        batched: (str: string) => setOutput((prev) => prev + str + "\n")
      });
      pyodide.setStderr({
        batched: (str: string) => setError((prev) => prev + str + "\n")
      });

      await pyodide.runPythonAsync(code);
    } catch (e: any) {
      setError((prev) => prev + String(e) + "\n");
    } finally {
      setIsRunning(false);
      setIsLoadingPyodide(false);
    }
  };

  const handleReset = () => {
    setCode(initialCode);
    setOutput("");
    setError("");
  };

  return (
    <figure className={cn("group relative overflow-hidden rounded-xl border border-hairline bg-slate-50 dark:bg-surface shadow-sm my-6", className)}>
      <div className="flex items-center justify-between border-b border-hairline/60 bg-surface-2/40 px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5 mr-2">
            <div className="size-2.5 rounded-full bg-rose-500/80 shadow-[0_0_8px_rgba(244,63,94,0.4)]" />
            <div className="size-2.5 rounded-full bg-amber-500/80 shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
            <div className="size-2.5 rounded-full bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
          </div>
          {caption ? (
            <span className="font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground font-semibold">
              {caption}
            </span>
          ) : (
            <span className="font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground/80 font-semibold flex items-center gap-1.5">
              PYTHON
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleReset} className="h-7 px-2.5 text-xs text-muted-foreground hover:bg-surface-2 transition-colors">
            <RotateCcw className="size-3.5 mr-1.5" />
            Reset
          </Button>
          {!hideRunButton && (
            <Button
              variant="default"
              size="sm"
              onClick={handleRun}
              disabled={isRunning || isLoadingPyodide}
              className="h-7 px-3 text-xs bg-mint/90 hover:bg-mint text-slate-900 font-bold shadow-[0_0_12px_rgba(110,231,183,0.3)] transition-all"
            >
              {isLoadingPyodide ? <Loader2 className="size-3.5 mr-1.5 animate-spin" /> : isRunning ? <Square className="size-3.5 mr-1.5" /> : <Play className="size-3.5 mr-1.5 fill-slate-900" />}
              {isLoadingPyodide ? "Loading..." : isRunning ? "Running" : "Run Code"}
            </Button>
          )}
        </div>
      </div>

      <div className="relative bg-slate-950 border-b border-hairline min-h-[120px]">
        <CodeMirror
          value={code}
          onChange={(v) => {
            setCode(v);
            onChange?.(v);
          }}
          extensions={[python(), keymap.of([indentWithTab])]}
          theme={oneDark}
          basicSetup={{
            lineNumbers: true,
            foldGutter: false,
            highlightActiveLine: false,
          }}
          className="text-[13.5px] font-mono [&_.cm-editor]:bg-slate-950 [&_.cm-gutters]:bg-slate-950 [&_.cm-gutters]:border-r-0 [&_.cm-gutters]:text-[#6E7681] [&_.cm-gutters]:!pr-3 [&_.cm-scroller]:!py-4 selection:bg-mint/20" />
      </div>

      {!hideOutput && (output || error) && (
        <div className="bg-[#0d1117] px-5 py-4 font-mono text-[13px] relative border-t border-hairline/20 max-h-64 overflow-y-auto">
          <div className="text-slate-500 text-[10px] mb-3 uppercase tracking-[0.2em] font-bold flex items-center gap-2">
            <div className="size-1.5 rounded-full bg-mint/70 shadow-[0_0_8px_rgba(110,231,183,0.5)]" />
            Terminal Output
          </div>
          {output && <div className="text-slate-300 whitespace-pre-wrap leading-relaxed">{output}</div>}
          {error && <div className="text-rose-400 whitespace-pre-wrap leading-relaxed mt-2">{error}</div>}
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
