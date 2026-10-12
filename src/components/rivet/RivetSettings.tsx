import { useEffect, useRef, useState } from "react";
import { AlertCircle, Check, CheckCircle2, ExternalLink, Loader2, ShieldCheck } from "lucide-react";
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

const STATUS_BADGE: Record<
  KeyStatus["state"],
  { label: string; className: string; check?: boolean }
> = {
  tested: { label: "Ready", className: "text-mint", check: true },
  verified: { label: "Key verified", className: "text-primary" },
  saved: { label: "Not verified", className: "text-amber" },
  "rate-limited": { label: "Rate limited", className: "text-amber" },
};

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
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  // When switching provider, reset the form and quietly refresh the model list if we can.
  useEffect(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setKeyInput("");
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

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
        <div>
          <h3 className="text-sm font-semibold">Connect a model</h3>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Bring your own key from one of these providers. Use a dedicated key with a spending
            limit, and revoke it in the provider's console if you think it has leaked.
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

        <div className="grid gap-2" role="radiogroup" aria-label="Provider" onKeyDown={onRadioKey}>
          {PROVIDERS.map((p) => {
            const active = p.id === provider.id;
            const st = settings.keys[p.id] ? settings.status[p.id] : undefined;
            const badge = settings.keys[p.id] ? STATUS_BADGE[st?.state ?? "saved"] : null;
            return (
              <button
                key={p.id}
                ref={(el) => {
                  radioRefs.current[p.id] = el;
                }}
                role="radio"
                aria-checked={active}
                tabIndex={active ? 0 : -1}
                onClick={() => selectProvider(p.id)}
                className={cn(
                  "flex cursor-pointer items-center justify-between rounded-lg border bg-surface px-3 py-2.5 text-left transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active && "border-primary bg-surface-2 ring-1 ring-primary/40",
                )}
              >
                <span>
                  <span className="block text-sm font-medium">{p.name}</span>
                  <span className="block text-xs text-muted-foreground">
                    {p.tagline}
                    {p.viaRelay ? " · via our relay" : ""}
                  </span>
                </span>
                {badge ? (
                  <Badge
                    variant="secondary"
                    className={cn("shrink-0 gap-1 whitespace-nowrap text-[10px]", badge.className)}
                  >
                    {badge.check && <Check className="h-3 w-3" />} {badge.label}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="shrink-0 whitespace-nowrap text-[10px]">
                    Free tier
                  </Badge>
                )}
              </button>
            );
          })}
        </div>

        <div className="space-y-3 rounded-lg border bg-surface p-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="rivet-key" className="text-xs">
                {provider.name} API key
              </Label>
              {provider.keyUrl && (
                <a
                  href={provider.keyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  Get a key <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
            {savedKey && !keyInput ? (
              <div className="flex items-center justify-between rounded-md border bg-background px-3 py-2">
                <span className="font-mono text-xs text-muted-foreground">{maskKey(savedKey)}</span>
                <button
                  className="cursor-pointer text-xs text-destructive hover:underline"
                  onClick={() => {
                    removeProviderKey(provider.id);
                    setStatus({ kind: "idle" });
                  }}
                >
                  Remove key
                </button>
              </div>
            ) : null}
            <Input
              id="rivet-key"
              type="password"
              autoComplete="off"
              spellCheck={false}
              placeholder={savedKey ? "Paste a new key to replace it" : "Paste your key"}
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void connect()}
            />
          </div>

          {!savedKey && (
            <div className="space-y-1.5 rounded-md bg-background px-3 py-2">
              <ol className="list-decimal space-y-0.5 pl-4 text-[11px] leading-snug text-muted-foreground">
                {provider.setupSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <p className="text-[11px] leading-snug text-muted-foreground">{provider.costNote}</p>
            </div>
          )}

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

          <Button
            variant="secondary"
            size="sm"
            className="w-full"
            disabled={status.kind === "testing"}
            onClick={() => void connect()}
          >
            {status.kind === "testing" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {status.kind === "testing"
              ? "Checking the key and model…"
              : savedKey && !keyInput
                ? "Test connection"
                : "Save and test"}
          </Button>
          {status.kind === "testing" && (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                abortRef.current?.abort();
                setStatus({ kind: "idle" });
              }}
            >
              Cancel connection test
            </Button>
          )}

          {status.kind === "ok" && (
            <p className="flex items-start gap-1.5 text-xs text-mint" role="status">
              <CheckCircle2 className="mt-px h-3.5 w-3.5 shrink-0" />
              {status.message}
            </p>
          )}
          {status.kind === "warn" && (
            <p className="flex items-start gap-1.5 text-xs text-amber" role="status">
              <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" />
              {status.message}
            </p>
          )}
          {status.kind === "error" && (
            <p className="flex items-start gap-1.5 text-xs text-destructive" role="alert">
              <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" />
              {status.message}
            </p>
          )}
          {provider.id === "nvidia" && (
            <p className="text-[11px] leading-snug text-muted-foreground">
              NVIDIA blocks direct browser calls, so your key and messages pass through
              StackBlueprint's server on the way to NVIDIA. The relay code does not store or log
              them, though the hosting platform may keep basic request records such as time and
              address.
            </p>
          )}
        </div>

        <div className="rounded-lg border bg-surface p-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Label htmlFor="rivet-remember-keys" className="text-xs">
                Remember my API keys on this device
              </Label>
              <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
                Off (recommended): your key is kept only in this tab's memory and is gone when you
                reload or close it. On: it is saved in this browser's storage until you remove it.
                Either way, a browser extension allowed on this site can read it.
              </p>
            </div>
            <Switch
              id="rivet-remember-keys"
              checked={settings.rememberKeys}
              onCheckedChange={setRememberKeys}
            />
          </div>
        </div>

        <div className="space-y-3 rounded-lg border bg-surface p-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Label htmlFor="rivet-remember" className="text-xs">
                Remember conversations on this device
              </Label>
              <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
                One chat per lesson, in this browser only. Chats unused for 30 days, and all but the
                30 most recent, are deleted the next time you use Rivet. Turn off on a shared
                computer.
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
          <Button
            variant={confirmClear ? "destructive" : "outline"}
            size="sm"
            className="w-full"
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
            {confirmClear ? "Click again to delete all Rivet data" : "Clear all Rivet data"}
          </Button>
          {historyStorageError && (
            <p role="alert" className="text-xs text-destructive">
              {historyStorageError}
            </p>
          )}
        </div>

        <p className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span>
            <span className="font-medium text-foreground">What is shared.</span> Each message sends
            your question, recent messages from this chat, excerpts of the lesson and, after you
            submit a quiz, your quiz answers. Gemini, Groq and OpenRouter requests go straight from
            your browser to that provider. NVIDIA requests pass through our relay. Your key is
            stored on this device only if you turn on Remember. Some free tiers use prompts to
            improve their models. See the{" "}
            <a
              href="/privacy"
              target="_blank"
              rel="noreferrer"
              className="text-primary underline underline-offset-2"
            >
              Privacy Policy
            </a>
            .
          </span>
        </p>
      </div>
      <div className="border-t px-4 py-3">
        <Button className="w-full" onClick={onDone}>
          Back to chat
        </Button>
      </div>
    </div>
  );
}
