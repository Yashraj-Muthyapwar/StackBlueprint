import { useEffect, useRef, useState } from "react";
import { AlertCircle, Check, CheckCircle2, ExternalLink, Loader2, ShieldCheck } from "lucide-react";
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
} from "@/lib/rivet/history";
import { isAbort, RivetError } from "@/lib/rivet/providers/errors";
import { getProvider, PROVIDERS, type ProviderId } from "@/lib/rivet/providers";
import {
  removeProviderKey,
  saveProviderKey,
  setRememberKeys,
  setProviderModel,
  updateSettings,
  useRivetSettings,
} from "@/lib/rivet/settings";
import { cn } from "@/lib/utils";

type Status =
  | { kind: "idle" }
  | { kind: "testing" }
  | { kind: "ok"; message: string }
  | { kind: "error"; message: string };

const maskKey = (key: string) => `${key.slice(0, 4)}${"•".repeat(8)}${key.slice(-4)}`;

export function RivetSettings({ onDone }: { onDone: () => void }) {
  const settings = useRivetSettings();
  const remember = useRememberConversations();
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
      provider
        .listModels({ key: savedKey, model: savedModel }, controller.signal)
        .then((list) => list.length && setModels(list))
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
      const { models: list, model: verified } = await provider.test(
        { key, model: savedModel },
        controller.signal,
      );
      if (list.length === 0)
        throw new RivetError(
          "model",
          `${provider.name} connected, but no usable models were found.`,
        );
      if (keyInput.trim()) saveProviderKey(provider.id, key);
      const preferred =
        verified ??
        (list.includes(savedModel)
          ? savedModel
          : (provider.fallbackModels.find((m) => list.includes(m)) ?? list[0]));
      setProviderModel(provider.id, preferred);
      updateSettings({ providerId: provider.id });
      setModels(list);
      setKeyInput("");
      setStatus({
        kind: "ok",
        message: `Connected. ${list.length} model${list.length === 1 ? "" : "s"} available.`,
      });
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

  const isConnected = (id: ProviderId) => Boolean(settings.keys[id]);
  const modelOptions =
    savedModel && !models.includes(savedModel) ? [savedModel, ...models] : models;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
        <div>
          <h3 className="text-sm font-semibold">Connect a free model</h3>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Rivet talks from your browser to the provider you choose. Bring your own free key.
          </p>
        </div>

        <div className="grid gap-2" role="radiogroup" aria-label="Provider">
          {PROVIDERS.map((p) => {
            const active = p.id === provider.id;
            return (
              <button
                key={p.id}
                role="radio"
                aria-checked={active}
                onClick={() => selectProvider(p.id)}
                className={cn(
                  "flex cursor-pointer items-center justify-between rounded-lg border bg-surface px-3 py-2.5 text-left transition-colors hover:bg-surface-2",
                  active && "border-primary bg-surface-2 ring-1 ring-primary/40",
                )}
              >
                <span>
                  <span className="block text-sm font-medium">{p.name}</span>
                  <span className="block text-xs text-muted-foreground">{p.tagline}</span>
                </span>
                {isConnected(p.id) ? (
                  <Badge variant="secondary" className="gap-1 text-[10px] text-mint">
                    <Check className="h-3 w-3" /> Connected
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px]">
                    Free
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
                  Get a free key <ExternalLink className="h-3 w-3" />
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
            {savedKey && !keyInput ? "Test connection" : "Save and test"}
          </Button>

          {status.kind === "ok" && (
            <p className="flex items-start gap-1.5 text-xs text-mint" role="status">
              <CheckCircle2 className="mt-px h-3.5 w-3.5 shrink-0" />
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
              NVIDIA blocks direct browser calls, so requests pass through StackBlueprint's relay.
              It forwards your request to NVIDIA and stores or logs nothing.
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
                Off: keys are forgotten when you close this tab, and never kept in long-term
                storage. Safer on shared computers.
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
                One chat per lesson, kept for 30 days in this browser only. Turn off on a shared
                computer.
              </p>
            </div>
            <Switch
              id="rivet-remember"
              checked={remember}
              onCheckedChange={setRememberConversations}
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
              clearAllRivetData();
              setConfirmClear(false);
              setStatus({ kind: "idle" });
            }}
          >
            {confirmClear ? "Click again to delete all Rivet data" : "Clear all Rivet data"}
          </Button>
        </div>

        <p className="flex gap-2 text-xs leading-relaxed text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          Your key stays in this browser. Your questions, the lesson text and your quiz results go
          only to the provider you choose. Some free tiers may use prompts to improve their models.
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
