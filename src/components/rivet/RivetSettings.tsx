import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  ExternalLink,
  Eye,
  EyeOff,
  Info,
  KeyRound,
  Loader2,
  MessageSquareText,
  Route,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import type React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  clearAllRivetData,
  setRememberConversations,
  useRememberConversations,
  useHistoryStorageError,
} from "@/lib/rivet/history";
import { isAbort, RivetError } from "@/lib/rivet/providers/errors";
import { getProvider, PROVIDERS, type ProviderId } from "@/lib/rivet/providers";
import {
  removeProviderKey,
  saveProviderKey,
  setKeyStatus,
  setRememberKeys,
  setProviderModel,
  updateSettings,
  useRivetSettings,
  type KeyStatus,
} from "@/lib/rivet/settings";
import { verifyProvider, discoverModels } from "@/lib/rivet/verify";
import { cn } from "@/lib/utils";

type Status =
  | { kind: "idle" }
  | { kind: "testing" }
  | { kind: "ok"; message: string }
  | { kind: "warn"; message: string }
  | { kind: "error"; message: string };

const STATUS_BADGE: Record<KeyStatus["state"], { label: string; dot: string; text: string }> = {
  tested: { label: "Ready", dot: "bg-mint", text: "text-mint" },
  verified: { label: "Key verified", dot: "bg-primary", text: "text-primary" },
  saved: { label: "Not verified", dot: "bg-amber", text: "text-amber" },
  "rate-limited": { label: "Rate limited", dot: "bg-amber", text: "text-amber" },
};

/** Short tile captions; the full taglines are too long for a two-column grid. */
const TILE_CAPTION: Record<ProviderId, string> = {
  gemini: "Google AI Studio",
  groq: "Very fast replies",
  nvidia: "build.nvidia.com",
  openrouter: ":free models",
};

const STEP_LABEL =
  "flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground";

function StepNumber({ n }: { n: number }) {
  return (
    <span className="grid h-4 w-4 place-items-center rounded-full bg-primary/15 text-[9px] font-semibold text-primary">
      {n}
    </span>
  );
}

const STATUS_STYLE = {
  ok: { box: "border-mint/30 bg-mint/10 text-foreground", icon: "text-mint", Icon: CheckCircle2 },
  warn: {
    box: "border-amber/40 bg-amber/10 text-foreground",
    icon: "text-amber",
    Icon: AlertCircle,
  },
  error: {
    box: "border-destructive/30 bg-destructive/5 text-foreground",
    icon: "text-destructive",
    Icon: AlertCircle,
  },
} as const;

const maskKey = (key: string) => `${key.slice(0, 4)}${"•".repeat(8)}${key.slice(-4)}`;

export function RivetSettings({ onDone }: { onDone: () => void }) {
  const settings = useRivetSettings();
  const remember = useRememberConversations();
  const historyStorageError = useHistoryStorageError();
  const provider = getProvider(settings.providerId);
  const savedKey = settings.keys[provider.id] ?? "";
  const savedModel = settings.models[provider.id] ?? "";
  const [keyInput, setKeyInput] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [models, setModels] = useState<string[]>(provider.fallbackModels);
  const [confirmClear, setConfirmClear] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [stepsOpen, setStepsOpen] = useState(!savedKey);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  // When switching provider, reset the form and quietly refresh the model list if we can.
  useEffect(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setKeyInput("");
    setShowKey(false);
    setStepsOpen(!savedKey);
    setStatus({ kind: "idle" });
    setModels(provider.fallbackModels);
    if (savedKey) {
      discoverModels(provider, savedKey, savedModel, controller.signal)
        .then((list) => !controller.signal.aborted && list.length && setModels(list))
        .catch(() => {});
    }
    return () => controller.abort();
    // Only re-run when the provider changes; key edits and model picks must not refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider.id]);

  const connect = async () => {
    const key = keyInput.trim() || savedKey;
    if (!key) {
      setStatus({ kind: "error", message: "Paste your API key first." });
      return;
    }
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setStatus({ kind: "testing" });
    try {
      const result = await verifyProvider(provider, key, savedModel, controller.signal);
      controller.signal.throwIfAborted();
      if (abortRef.current !== controller) return;
      if (keyInput.trim()) saveProviderKey(provider.id, key, result.state);
      setProviderModel(provider.id, result.model);
      setKeyStatus(provider.id, result.state, result.state === "tested" ? result.model : undefined);
      updateSettings({ providerId: provider.id });
      setModels(result.models);
      setKeyInput("");
      setShowKey(false);
      setStepsOpen(false);
      setStatus({ kind: result.warning ? "warn" : "ok", message: result.message });
    } catch (e) {
      if (isAbort(e)) return;
      setStatus({
        kind: "error",
        message: e instanceof RivetError ? e.message : "Could not connect. Try again.",
      });
    }
  };

  const selectProvider = (id: ProviderId) => {
    if (id !== provider.id) updateSettings({ providerId: id });
  };

  const radioRefs = useRef<Partial<Record<ProviderId, HTMLButtonElement | null>>>({});
  /** Arrow keys, Home and End move the selection, as in a native radio group. */
  const onRadioKey = (e: React.KeyboardEvent) => {
    const i = PROVIDERS.findIndex((p) => p.id === provider.id);
    const next =
      e.key === "ArrowDown" || e.key === "ArrowRight"
        ? (i + 1) % PROVIDERS.length
        : e.key === "ArrowUp" || e.key === "ArrowLeft"
          ? (i - 1 + PROVIDERS.length) % PROVIDERS.length
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? PROVIDERS.length - 1
              : -1;
    if (next < 0) return;
    e.preventDefault();
    const id = PROVIDERS[next].id;
    selectProvider(id);
    radioRefs.current[id]?.focus();
  };
  const modelOptions =
    savedModel && !models.includes(savedModel) ? [savedModel, ...models] : models;

  const testing = status.kind === "testing";
  const savedStatus = savedKey
    ? STATUS_BADGE[settings.status[provider.id]?.state ?? "saved"]
    : null;
  const shownStatus = status.kind === "ok" || status.kind === "warn" || status.kind === "error";

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4">
        <div>
          <h3 className="text-sm font-semibold">Connect a model</h3>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Rivet runs on your own API key. Each provider below has a free tier.
          </p>
        </div>

        {settings.notice && (
          <p
            className="flex items-start gap-1.5 rounded-lg border border-amber/40 bg-amber/10 px-3 py-2 text-xs leading-snug"
            role="status"
          >
            <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0 text-amber" />
            {settings.notice}
          </p>
        )}
        {settings.storageError && (
          <p
            className="flex items-start gap-1.5 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs leading-snug text-destructive"
            role="alert"
          >
            <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" />
            {settings.storageError}
          </p>
        )}

        {/* Step 1: provider */}
        <section className="space-y-2">
          <p className={STEP_LABEL}>
            <StepNumber n={1} /> Provider
          </p>
          <div
            className="grid grid-cols-2 gap-2"
            role="radiogroup"
            aria-label="Provider"
            onKeyDown={onRadioKey}
          >
            {PROVIDERS.map((p) => {
              const active = p.id === provider.id;
              const badge = settings.keys[p.id]
                ? STATUS_BADGE[settings.status[p.id]?.state ?? "saved"]
                : null;
              return (
                <button
                  key={p.id}
                  ref={(el) => {
                    radioRefs.current[p.id] = el;
                  }}
                  role="radio"
                  aria-checked={active}
                  aria-description={[
                    p.tagline,
                    p.viaRelay ? "Requests pass through our relay" : "",
                    badge?.label ?? "",
                  ]
                    .filter(Boolean)
                    .join(". ")}
                  tabIndex={active ? 0 : -1}
                  onClick={() => selectProvider(p.id)}
                  className={cn(
                    "relative flex min-h-[3.75rem] cursor-pointer flex-col justify-between rounded-lg border bg-surface px-3 py-2 text-left transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    active && "border-primary bg-primary/5 ring-1 ring-primary/40",
                  )}
                >
                  <span className="flex items-center justify-between gap-1.5">
                    <span className="truncate text-[13px] font-medium">
                      {p.name.replace("Google ", "")}
                    </span>
                    {badge && (
                      <span
                        className={cn("h-2 w-2 shrink-0 rounded-full", badge.dot)}
                        aria-hidden
                      />
                    )}
                  </span>
                  <span className="mt-0.5 flex items-center gap-1 text-[11px] leading-tight text-muted-foreground">
                    <span className="truncate">{badge ? badge.label : TILE_CAPTION[p.id]}</span>
                    {p.viaRelay && (
                      <span className="shrink-0 rounded bg-muted px-1 py-px font-mono text-[9px] uppercase tracking-wide">
                        relay
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Step 2: key */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <p className={STEP_LABEL}>
              <StepNumber n={2} /> {provider.name} key
            </p>
            {provider.keyUrl && (
              <a
                href={provider.keyUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                Get a key <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>

          <div className="space-y-3 rounded-xl border bg-surface p-3 shadow-sm">
            {savedKey && !keyInput && savedStatus && (
              <div className="flex items-center gap-2.5 rounded-lg border bg-background px-3 py-2">
                <KeyRound className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-xs">{maskKey(savedKey)}</p>
                  <p
                    className={cn("mt-0.5 flex items-center gap-1.5 text-[11px]", savedStatus.text)}
                  >
                    <span className={cn("h-1.5 w-1.5 rounded-full", savedStatus.dot)} />
                    {savedStatus.label}
                    <span className="text-muted-foreground">
                      · {settings.rememberKeys ? "saved on this device" : "this tab only"}
                    </span>
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => {
                    removeProviderKey(provider.id);
                    setStatus({ kind: "idle" });
                  }}
                >
                  Remove
                </Button>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="rivet-key" className={cn("text-xs", savedKey ? "" : "sr-only")}>
                {savedKey ? "Replace key" : `${provider.name} API key`}
              </Label>
              <div className="relative">
                <Input
                  id="rivet-key"
                  type={showKey ? "text" : "password"}
                  autoComplete="off"
                  spellCheck={false}
                  placeholder={savedKey ? "Paste a new key" : "Paste your API key"}
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !testing && void connect()}
                  className="pr-10 font-mono text-sm placeholder:font-sans"
                />
                {keyInput && (
                  <button
                    type="button"
                    onClick={() => setShowKey((v) => !v)}
                    aria-label={showKey ? "Hide key" : "Show key"}
                    aria-pressed={showKey}
                    className="absolute inset-y-0 right-0 grid w-10 cursor-pointer place-items-center rounded-r-md text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                )}
              </div>
            </div>

            {modelOptions.length > 0 && savedKey && (
              <div className="space-y-1.5">
                <Label className="text-xs">Model</Label>
                <Select
                  value={savedModel || undefined}
                  onValueChange={(m) => setProviderModel(provider.id, m)}
                >
                  <SelectTrigger className="h-9 font-mono text-xs">
                    <SelectValue placeholder="Choose a model" />
                  </SelectTrigger>
                  <SelectContent className="z-[70]">
                    {modelOptions.map((m) => (
                      <SelectItem key={m} value={m} className="font-mono text-xs">
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {testing ? (
              <div className="flex gap-2">
                <Button size="sm" className="flex-1" disabled>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Testing key and model…
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    abortRef.current?.abort();
                    setStatus({ kind: "idle" });
                  }}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                variant={savedKey && !keyInput ? "outline" : "default"}
                className="w-full"
                disabled={!keyInput.trim() && !savedKey}
                onClick={() => void connect()}
              >
                {savedKey && !keyInput ? "Test again" : "Save and test"}
              </Button>
            )}

            {shownStatus && (
              <div
                role={status.kind === "error" ? "alert" : "status"}
                className={cn(
                  "flex items-start gap-2 rounded-lg border px-3 py-2 text-xs leading-snug",
                  STATUS_STYLE[status.kind].box,
                )}
              >
                {(() => {
                  const { Icon, icon } = STATUS_STYLE[status.kind];
                  return <Icon className={cn("mt-px h-3.5 w-3.5 shrink-0", icon)} />;
                })()}
                <span>{status.message}</span>
              </div>
            )}

            {provider.id === "nvidia" && (
              <p className="flex items-start gap-2 text-[11px] leading-snug text-muted-foreground">
                <Route className="mt-px h-3.5 w-3.5 shrink-0" />
                NVIDIA blocks browser calls, so your key and messages pass through our relay on the
                way to NVIDIA. The relay does not store or log them; the host may keep basic request
                records such as time and address.
              </p>
            )}

            <Collapsible open={stepsOpen} onOpenChange={setStepsOpen} className="border-t pt-2">
              <CollapsibleTrigger className="group flex w-full cursor-pointer items-center justify-between rounded-md py-1 text-xs font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                How to get a {provider.name.replace("Google ", "")} key
                <ChevronDown className="h-3.5 w-3.5 transition-transform group-data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 pt-1.5">
                <ol className="space-y-1.5">
                  {provider.setupSteps.map((step, i) => (
                    <li
                      key={step}
                      className="flex gap-2 text-[11px] leading-snug text-muted-foreground"
                    >
                      <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full border text-[9px] font-semibold text-foreground">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
                <p className="flex items-start gap-2 rounded-md bg-muted/60 px-2.5 py-2 text-[11px] leading-snug text-muted-foreground">
                  <Info className="mt-px h-3.5 w-3.5 shrink-0" />
                  <span>
                    {provider.costNote} Use a dedicated key with a spending limit, and revoke it in
                    the provider's console if it leaks.
                  </span>
                </p>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </section>

        {/* Privacy and storage */}
        <section className="space-y-2">
          <p className={STEP_LABEL}>
            <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Privacy and storage
          </p>
          <div className="divide-y rounded-xl border bg-surface">
            <div className="flex items-start justify-between gap-3 p-3">
              <div>
                <Label htmlFor="rivet-remember-keys" className="text-xs">
                  Remember API keys
                </Label>
                <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                  Off keeps your key in this tab only, gone on reload. A browser extension allowed
                  on this site can read it either way.
                </p>
              </div>
              <Switch
                id="rivet-remember-keys"
                checked={settings.rememberKeys}
                onCheckedChange={setRememberKeys}
              />
            </div>
            <div className="flex items-start justify-between gap-3 p-3">
              <div>
                <Label htmlFor="rivet-remember" className="text-xs">
                  Remember conversations
                </Label>
                <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                  One chat per lesson, in this browser. Chats unused for 30 days are removed the
                  next time you use Rivet.
                </p>
              </div>
              <Switch
                id="rivet-remember"
                checked={remember}
                onCheckedChange={(value) => {
                  void setRememberConversations(value);
                }}
              />
            </div>
            <div className="flex items-center justify-between gap-3 px-3 py-2">
              <p className="text-[11px] text-muted-foreground">
                {confirmClear
                  ? "Delete keys, settings and every chat?"
                  : "Keys, settings and chats"}
              </p>
              <Button
                variant={confirmClear ? "destructive" : "ghost"}
                size="sm"
                className={cn(
                  "h-7 gap-1.5 px-2 text-xs",
                  !confirmClear &&
                    "text-destructive hover:bg-destructive/10 hover:text-destructive",
                )}
                onClick={() => {
                  if (!confirmClear) {
                    setConfirmClear(true);
                    window.setTimeout(() => setConfirmClear(false), 4000);
                    return;
                  }
                  void clearAllRivetData();
                  setConfirmClear(false);
                  setStatus({ kind: "idle" });
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
                {confirmClear ? "Yes, delete all" : "Clear all data"}
              </Button>
            </div>
          </div>
          {historyStorageError && (
            <p role="alert" className="text-xs text-destructive">
              {historyStorageError}
            </p>
          )}
        </section>

        {/* What is sent */}
        <section className="space-y-2 rounded-xl bg-muted/50 p-3">
          <p className="text-xs font-medium">What each message sends</p>
          <ul className="space-y-1.5 text-[11px] leading-snug text-muted-foreground">
            <li className="flex items-start gap-2">
              <MessageSquareText className="mt-px h-3.5 w-3.5 shrink-0 text-primary" />
              Your question and recent messages from this chat
            </li>
            <li className="flex items-start gap-2">
              <BookOpen className="mt-px h-3.5 w-3.5 shrink-0 text-primary" />
              Excerpts of the lesson you are on
            </li>
            <li className="flex items-start gap-2">
              <ClipboardCheck className="mt-px h-3.5 w-3.5 shrink-0 text-primary" />
              Your quiz answers, only after you submit a quiz
            </li>
          </ul>
          <p className="border-t pt-2 text-[11px] leading-snug text-muted-foreground">
            Gemini, Groq and OpenRouter get it straight from your browser; NVIDIA through our relay.
            Some free tiers use prompts to improve their models.{" "}
            <a
              href="/privacy"
              target="_blank"
              rel="noreferrer"
              className="text-primary underline underline-offset-2"
            >
              Privacy Policy
            </a>
          </p>
        </section>
      </div>
      <div className="border-t px-4 py-3">
        <Button className="w-full" variant={savedKey ? "default" : "outline"} onClick={onDone}>
          {savedKey ? "Start chatting" : "Back to chat"}
        </Button>
      </div>
    </div>
  );
}
