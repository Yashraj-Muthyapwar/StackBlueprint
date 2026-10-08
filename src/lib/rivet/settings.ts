import { useSyncExternalStore } from "react";
import {
  getProvider,
  PROVIDERS,
  type ProviderConfig,
  type ProviderDef,
  type ProviderId,
} from "./providers";

/**
 * Provider settings live in this browser and are only ever sent to the
 * provider the learner chose (or our stateless proxy for NVIDIA). API keys go
 * to localStorage, or, when "remember keys" is off, to sessionStorage so they
 * are forgotten when the tab closes and never sit in long-term storage.
 */
export interface RivetSettings {
  providerId: ProviderId;
  keys: Partial<Record<ProviderId, string>>;
  models: Partial<Record<ProviderId, string>>;
  rememberKeys: boolean;
}

const STORAGE_KEY = "rivet:settings";
const SESSION_KEYS = "rivet:keys";
const DEFAULTS: RivetSettings = {
  providerId: "gemini",
  keys: {},
  models: {},
  rememberKeys: true,
};

let current: RivetSettings = DEFAULTS;
let loaded = false;
const listeners = new Set<() => void>();

function readSessionKeys(): RivetSettings["keys"] {
  try {
    return JSON.parse(window.sessionStorage.getItem(SESSION_KEYS) ?? "{}") ?? {};
  } catch {
    return {};
  }
}

function load(): RivetSettings {
  if (!loaded && typeof window !== "undefined") {
    loaded = true;
    try {
      const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "null");
      if (parsed && typeof parsed === "object") {
        current = {
          // A provider that no longer exists (for example one saved before it was removed) falls back to the default.
          providerId: PROVIDERS.some((p) => p.id === parsed.providerId)
            ? parsed.providerId
            : DEFAULTS.providerId,
          rememberKeys: parsed.rememberKeys !== false,
          keys: parsed.rememberKeys !== false ? (parsed.keys ?? {}) : readSessionKeys(),
          models: parsed.models ?? {},
        };
      }
    } catch {
      /* corrupt settings: start from defaults */
    }
  }
  return current;
}

function commit(next: RivetSettings) {
  current = next;
  try {
    // Keys are only written to long-term storage when the learner chose to remember them.
    const { keys, ...rest } = next;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next.rememberKeys ? next : rest));
    if (next.rememberKeys) window.sessionStorage.removeItem(SESSION_KEYS);
    else window.sessionStorage.setItem(SESSION_KEYS, JSON.stringify(keys));
  } catch {
    /* settings just stay in memory for this visit */
  }
  listeners.forEach((l) => l());
}

export const getSettings = load;

export function updateSettings(patch: Partial<RivetSettings>) {
  commit({ ...load(), ...patch });
}

export function saveProviderKey(id: ProviderId, key: string) {
  const s = load();
  commit({ ...s, keys: { ...s.keys, [id]: key } });
}

export function removeProviderKey(id: ProviderId) {
  const s = load();
  const { [id]: _removed, ...keys } = s.keys;
  commit({ ...s, keys });
}

/** Turning this off moves saved keys out of localStorage; they last until the tab closes. */
export function setRememberKeys(value: boolean) {
  commit({ ...load(), rememberKeys: value });
}

export function setProviderModel(id: ProviderId, model: string) {
  const s = load();
  commit({ ...s, models: { ...s.models, [id]: model } });
}

/** Re-reads storage after "Clear all Rivet data". */
export function resetSettings() {
  loaded = false;
  current = DEFAULTS;
  listeners.forEach((l) => l());
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
}

/** The provider Rivet will use, or null until a key has been saved for it. */
export function resolveActive(s: RivetSettings): ActiveProvider | null {
  const provider = getProvider(s.providerId);
  const key = s.keys[provider.id] ?? "";
  if (!key) return null;
  const model = s.models[provider.id] ?? provider.fallbackModels[0] ?? "";
  if (!model) return null;
  return { provider, config: { key, model } };
}
