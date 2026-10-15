import { useSyncExternalStore } from "react";
import {
  getProvider,
  PROVIDERS,
  type ProviderConfig,
  type ProviderDef,
  type ProviderId,
} from "./providers";
import { broadcast, onBroadcast } from "./sync";

/**
 * Provider settings for Rivet.
 *
 * API keys live in this tab's memory by default and are gone on reload. Only
 * when the learner explicitly turns on "Remember my API keys" are they written
 * to localStorage. Anything running in this page, or a browser extension
 * allowed on this site, can read a key either way, so the settings screen says
 * so plainly. Non-secret choices (provider, models, verification status) are
 * always saved.
 */
export type KeyState =
  /** Saved but never checked with the provider. */
  | "saved"
  /** The provider accepted the key (for example it listed models with it). */
  | "verified"
  /** The selected model produced output with this key. */
  | "tested"
  /** The last check hit a rate limit, so it proved nothing. */
  | "rate-limited";

export interface KeyStatus {
  state: KeyState;
  /** The model a "tested" status refers to. */
  model?: string;
  at: number;
}

export interface RivetSettings {
  providerId: ProviderId;
  keys: Partial<Record<ProviderId, string>>;
  models: Partial<Record<ProviderId, string>>;
  /** Explicit opt-in to keep keys in localStorage. Off by default. */
  rememberKeys: boolean;
  status: Partial<Record<ProviderId, KeyStatus>>;
  /** Set when browser storage could not be updated as requested. Never persisted. */
  storageError: string | null;
  /** One-off explanation shown in settings (for example after a migration). Never persisted. */
  notice: string | null;
}

const STORAGE_KEY = "rivet:settings";
const LEGACY_SESSION_KEYS = "rivet:keys";
const VERSION = 2;
const MAX_KEY_LENGTH = 512;
const MAX_MODEL_LENGTH = 200;
const KEY_STATES: KeyState[] = ["saved", "verified", "tested", "rate-limited"];

const DEFAULTS: RivetSettings = {
  providerId: "gemini",
  keys: {},
  models: {},
  rememberKeys: false,
  status: {},
  storageError: null,
  notice: null,
};

let current: RivetSettings = DEFAULTS;
let loaded = false;
const keyRevisions = new Map<ProviderId, number>();
export const providerKeyRevision = (id: ProviderId) => keyRevisions.get(id) ?? 0;
const bumpKeyRevision = (id: ProviderId) => keyRevisions.set(id, providerKeyRevision(id) + 1);
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

const isProviderId = (v: unknown): v is ProviderId => PROVIDERS.some((p) => p.id === v);
const isKey = (v: unknown): v is string =>
  typeof v === "string" && v.length > 0 && v.length <= MAX_KEY_LENGTH && /^[\x21-\x7e]+$/.test(v);
const isModel = (v: unknown): v is string =>
  typeof v === "string" && v.length > 0 && v.length <= MAX_MODEL_LENGTH;

function pick<T>(raw: unknown, valid: (v: unknown) => v is T): Partial<Record<ProviderId, T>> {
  const out: Partial<Record<ProviderId, T>> = {};
  if (raw && typeof raw === "object") {
    for (const [id, v] of Object.entries(raw as Record<string, unknown>)) {
      if (isProviderId(id) && valid(v)) out[id] = v;
    }
  }
  return out;
}

const isStatus = (v: unknown): v is KeyStatus => {
  const s = v as Partial<KeyStatus> | null;
  return (
    !!s &&
    typeof s === "object" &&
    KEY_STATES.includes(s.state as KeyState) &&
    typeof s.at === "number" &&
    (s.model === undefined || isModel(s.model))
  );
};

function readPersisted(): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "null");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null; // corrupt or unreadable: start from defaults
  }
}

/** Validates a stored record. Keys are only taken from it when the learner opted in. */
function fromPersisted(
  raw: Record<string, unknown>,
): Omit<RivetSettings, "storageError" | "notice"> {
  const rememberKeys = raw.v === VERSION && raw.rememberKeys === true;
  return {
    providerId: isProviderId(raw.providerId) ? raw.providerId : DEFAULTS.providerId,
    rememberKeys,
    keys: rememberKeys ? pick(raw.keys, isKey) : {},
    models: pick(raw.models, isModel),
    status: pick(raw.status, isStatus),
  };
}

function serialize(s: RivetSettings): string {
  return JSON.stringify({
    v: VERSION,
    providerId: s.providerId,
    models: s.models,
    status: s.status,
    rememberKeys: s.rememberKeys,
    ...(s.rememberKeys ? { keys: s.keys } : {}),
  });
}

/** Writes settings and checks the write took. Returns a learner-facing error or null. */
function writeStorage(s: RivetSettings): string | null {
  try {
    window.localStorage.setItem(STORAGE_KEY, serialize(s));
    window.sessionStorage.removeItem(LEGACY_SESSION_KEYS);
    if (!s.rememberKeys && readPersisted()?.keys) throw new Error("keys still stored");
    return null;
  } catch {
    if (!s.rememberKeys)
      return "This browser blocked an update to its storage, so a key saved earlier may still be on this device. Use Clear all Rivet data, or clear this site's data in your browser settings.";
    return "This browser blocked saving to its storage, so your key will only last until you reload this tab.";
  }
}

function load(): RivetSettings {
  if (!loaded && typeof window !== "undefined") {
    loaded = true;
    const raw = readPersisted();
    if (raw) current = { ...DEFAULTS, ...fromPersisted(raw) };

    // Older versions saved keys by default (or in sessionStorage). Keep them for this
    // visit only, then remove them from storage until the learner opts in.
    const legacyKeys = raw && raw.v !== VERSION ? pick(raw.keys, isKey) : {};
    let sessionKeys: Partial<Record<ProviderId, string>> = {};
    try {
      sessionKeys = pick(
        JSON.parse(window.sessionStorage.getItem(LEGACY_SESSION_KEYS) ?? "null"),
        isKey,
      );
    } catch {
      /* nothing usable */
    }
    const migrated = { ...sessionKeys, ...legacyKeys };
    if (raw && raw.v !== VERSION) {
      current = { ...current, keys: { ...current.keys, ...migrated } };
      const error = writeStorage(current);
      current = {
        ...current,
        storageError: error,
        notice: Object.keys(legacyKeys).length
          ? "Rivet no longer keeps API keys on this device unless you ask it to. Your key works until you reload; turn on Remember my API keys below to keep it."
          : null,
      };
    } else if (Object.keys(sessionKeys).length) {
      current = { ...current, keys: { ...sessionKeys, ...current.keys } };
      writeStorage(current);
    }
  }
  return current;
}

function commit(next: RivetSettings) {
  const error = writeStorage(next);
  current = { ...next, storageError: error };
  notify();
}

export const getSettings = load;

export function updateSettings(patch: Partial<Pick<RivetSettings, "providerId">>) {
  commit({ ...load(), ...patch });
}

export function saveProviderKey(id: ProviderId, key: string, state: KeyState) {
  const s = load();
  if (!isKey(key)) return;
  bumpKeyRevision(id);
  commit({
    ...s,
    keys: { ...s.keys, [id]: key },
    status: { ...s.status, [id]: { state, at: Date.now() } },
    notice: null,
  });
}

export function removeProviderKey(id: ProviderId) {
  const s = load();
  bumpKeyRevision(id);
  const { [id]: _key, ...keys } = s.keys;
  const { [id]: _status, ...status } = s.status;
  commit({ ...s, keys, status });
  broadcast({ type: "key-removed", providerId: id });
}

/** Opt in or out of keeping keys in localStorage. Turning it off removes stored keys now. */
export function setRememberKeys(value: boolean) {
  commit({ ...load(), rememberKeys: value, notice: null });
}

export function setProviderModel(id: ProviderId, model: string) {
  const s = load();
  if (!isModel(model)) return;
  const st = s.status[id];
  // A "tested" status only vouches for the model it was tested with.
  const status =
    st?.state === "tested" && st.model !== model
      ? { ...s.status, [id]: { state: "verified" as const, at: st.at } }
      : s.status;
  commit({ ...s, models: { ...s.models, [id]: model }, status });
}

export function setKeyStatus(id: ProviderId, state: KeyState, model?: string) {
  const s = load();
  if (!s.keys[id]) return;
  commit({ ...s, status: { ...s.status, [id]: { state, model, at: Date.now() } } });
}

/** Called after a real reply streams successfully. */
export function markModelWorking(id: ProviderId, model: string, usedRevision: number) {
  const s = load();
  if (providerKeyRevision(id) !== usedRevision || !s.keys[id] || s.models[id] !== model) return;
  const st = s.status[id];
  if (st?.state === "tested" && st.model === model) return;
  setKeyStatus(id, "tested", model);
}

/** Drops everything held in memory after "Clear all Rivet data" (storage is cleared by the caller). */
export function resetSettings() {
  // Do not reload credentials left behind by a blocked storage removal.
  loaded = true;
  PROVIDERS.forEach((p) => bumpKeyRevision(p.id));
  current = DEFAULTS;
  notify();
}

if (typeof window !== "undefined") {
  // Another tab saved settings: pick up its persisted changes. A key removed there is
  // dropped here by the key-removed message below.
  window.addEventListener("storage", (e) => {
    if (e.key !== STORAGE_KEY && e.key !== null) return;
    if (!loaded) return;
    const raw = readPersisted();
    if (!raw) {
      resetSettings();
      return;
    }
    const next = fromPersisted(raw);
    // Removals arrive through onBroadcast (BroadcastChannel or its storage-event fallback);
    // here we only add keys the other tab chose to store.
    const keys = next.rememberKeys ? { ...current.keys, ...next.keys } : current.keys;
    PROVIDERS.forEach((p) => {
      if (keys[p.id] !== current.keys[p.id]) bumpKeyRevision(p.id);
    });
    current = { ...current, ...next, keys };
    notify();
  });
  onBroadcast((m) => {
    if (m.type === "clear-all") resetSettings();
    else if (m.type === "key-removed" && isProviderId(m.providerId) && loaded) {
      bumpKeyRevision(m.providerId);
      const { [m.providerId]: _key, ...keys } = current.keys;
      const { [m.providerId]: _status, ...status } = current.status;
      current = { ...current, keys, status };
      notify();
    }
  });
}

export function useRivetSettings(): RivetSettings {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => {
        listeners.delete(l);
      };
    },
    load,
    () => DEFAULTS,
  );
}

export interface ActiveProvider {
  provider: ProviderDef;
  config: ProviderConfig;
  keyRevision: number;
}

/** The provider Rivet will use, or null until a key has been saved for it. */
export function resolveActive(s: RivetSettings): ActiveProvider | null {
  const provider = getProvider(s.providerId);
  const key = s.keys[provider.id] ?? "";
  if (!key) return null;
  const model = s.models[provider.id] ?? provider.fallbackModels[0] ?? "";
  if (!model) return null;
  return { provider, config: { key, model }, keyRevision: providerKeyRevision(provider.id) };
}
