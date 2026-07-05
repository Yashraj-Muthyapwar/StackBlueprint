import { useState } from "react";
import { AlertTriangle, Pause, Play, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { InputField, LessonBuilder } from "@/lessons/types";
import {
  parseIntArray,
  parseIntMatrix,
  parseIntPairs,
  stringifyIntArray,
  stringifyIntMatrix,
  stringifyIntPairs,
} from "@/lessons/util";

type RawValues = Record<string, string>;

function defaultsToRaw(builder: LessonBuilder): RawValues {
  const out: RawValues = {};
  for (const f of builder.inputs) {
    const v = (builder.defaultInputs as Record<string, unknown>)[f.key];
    if (f.kind === "intArray") out[f.key] = stringifyIntArray((v as number[]) ?? []);
    else if (f.kind === "intMatrix") out[f.key] = stringifyIntMatrix((v as number[][]) ?? []);
    else if (f.kind === "intPairs") out[f.key] = stringifyIntPairs((v as [number, number][]) ?? []);
    else if (f.kind === "string") out[f.key] = String(v ?? "");
    else out[f.key] = String(v ?? "");
  }
  return out;
}

function parseRaw(builder: LessonBuilder, raw: RawValues): { inputs?: Record<string, unknown>; error?: string } {
  const out: Record<string, unknown> = {};
  try {
    for (const f of builder.inputs) {
      const r = raw[f.key] ?? "";
      if (f.kind === "intArray") out[f.key] = parseIntArray(r);
      else if (f.kind === "intMatrix") out[f.key] = parseIntMatrix(r);
      else if (f.kind === "intPairs") out[f.key] = parseIntPairs(r);
      else if (f.kind === "string") out[f.key] = r;
      else if (f.kind === "select") out[f.key] = r;
      else if (f.kind === "int") {
        const n = Number(r);
        if (!Number.isFinite(n)) throw new Error(`${f.label} must be a number`);
        out[f.key] = n;
      }
    }
    return { inputs: out };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

export function LessonControls({
  builder,
  onRun,
  playing,
  onPlayToggle,
}: {
  builder: LessonBuilder;
  onRun: (inputs: Record<string, unknown>, warnings: string[], autoPlay?: boolean) => void;
  playing: boolean;
  onPlayToggle: () => void;
}) {
  const [raw, setRaw] = useState<RawValues>(() => defaultsToRaw(builder));
  const [isDirty, setIsDirty] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);

  const run = () => {
    const { inputs, error } = parseRaw(builder, raw);
    if (error || !inputs) {
      setParseError(error ?? "Invalid input");
      return;
    }
    setParseError(null);
    const w = builder.validate ? builder.validate(inputs) : [];
    setWarnings(w);
    setIsDirty(false);
    onRun(inputs, w, true);
  };

  const reset = () => {
    setRaw(defaultsToRaw(builder));
    setParseError(null);
    const w = builder.validate ? builder.validate(builder.defaultInputs as Record<string, unknown>) : [];
    setWarnings(w);
    setIsDirty(false);
    onRun(builder.defaultInputs as Record<string, unknown>, w, false);
  };

  return (
    <div className="rounded-2xl border border-hairline bg-surface">
      <div className="flex items-center justify-between border-b border-hairline px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="size-1.5 rounded-full bg-amber shadow-[0_0_10px_var(--amber)]" />
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            inputs · edit, then run
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Button size="sm" variant="ghost" onClick={reset} title="Reset to default">
            <RotateCcw className="mr-1 size-3.5" /> Default
          </Button>
          {isDirty ? (
            <Button size="sm" onClick={run} className="bg-mint text-primary-foreground hover:bg-mint/90">
              <Play className="mr-1 size-3.5" /> Run
            </Button>
          ) : playing ? (
            <Button size="sm" onClick={onPlayToggle} className="bg-amber text-primary-foreground hover:bg-amber/90">
              <Pause className="mr-1 size-3.5" /> Pause
            </Button>
          ) : (
            <Button size="sm" onClick={onPlayToggle} className="bg-mint text-primary-foreground hover:bg-mint/90">
              <Play className="mr-1 size-3.5" /> Play
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 px-4 py-3 md:grid-cols-2">
        {builder.inputs.map((f) => {
          if (f.hidden?.(raw)) return null;
          return (
            <FieldEditor
              key={f.key}
              field={f}
              value={raw[f.key] ?? ""}
              onChange={(v) => {
                const next = { ...raw, [f.key]: v };
                const overrides = builder.onInputChange?.(f.key, v, next);
                const finalRaw = overrides ? { ...next, ...overrides } : next;
                setRaw(finalRaw);
                setIsDirty(true);

                if (f.kind === "select") {
                const { inputs, error } = parseRaw(builder, finalRaw);
                if (!error && inputs) {
                  setParseError(null);
                  const w = builder.validate ? builder.validate(inputs) : [];
                  setWarnings(w);
                  setIsDirty(false);
                  onRun(inputs, w, true);
                } else {
                  setParseError(error ?? "Invalid input");
                }
              }
            }}
          />
          );
        })}
      </div>

      {(parseError || warnings.length > 0) && (
        <div className="border-t border-hairline px-4 py-2.5">
          {parseError && (
            <div className="flex items-start gap-2 rounded-md border border-rose/40 bg-rose/10 px-3 py-2 text-xs text-foreground">
              <AlertTriangle className="mt-px size-3.5 shrink-0 text-rose" />
              <span>
                <span className="font-mono text-rose">parse error</span> · {parseError}
              </span>
            </div>
          )}
          {warnings.length > 0 && !parseError && (
            <div className="space-y-1.5">
              {warnings.map((w, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 rounded-md border border-amber/40 bg-amber/10 px-3 py-2 text-xs text-foreground"
                >
                  <AlertTriangle className="mt-px size-3.5 shrink-0 text-amber" />
                  <span>
                    <span className="font-mono text-amber">warning</span> · {w}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FieldEditor({
  field,
  value,
  onChange,
}: {
  field: InputField;
  value: string;
  onChange: (v: string) => void;
}) {
  const isLarge = field.kind === "intMatrix";
  const isSelect = field.kind === "select";
  return (
    <label className="block">
      <div className="mb-1 flex items-baseline justify-between">
        <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{field.label}</span>
        {field.help && <span className="text-[10px] text-muted-foreground/60">{field.help}</span>}
      </div>
      {isSelect ? (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="h-9 font-mono text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {field.options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="font-mono text-xs">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : isLarge ? (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[68px] font-mono text-xs"
          spellCheck={false}
        />
      ) : (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 font-mono text-xs"
          spellCheck={false}
        />
      )}
    </label>
  );
}
