import { useSyncExternalStore } from "react";
import { resetSettings } from "./settings";

/**
 * Per-lesson conversation history for Rivet. Threads live in memory so they
 * survive closing the panel, and are mirrored to localStorage (this device
 * only) so they survive reloads. The models are stateless, so a later phase
 * resends the recent turns of a thread with every request.
 */

export interface ChatMessage {
  id: number;
  /** "divider" is a label such as "New quiz attempt", never sent to a model. */
  role: "user" | "rivet" | "divider";
  text: string;
}

const THREAD_PREFIX = "rivet:chat:";
const PREFS_KEY = "rivet:prefs";
const MAX_MESSAGES = 40;
const MAX_THREADS = 30;
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
const PERSIST_DELAY_MS = 400;

const EMPTY: ChatMessage[] = [];
const threads = new Map<string, ChatMessage[]>();
const listeners = new Set<() => void>();
const persistTimers = new Map<string, number>();
let remember: boolean | null = null;
let pruned = false;

const notify = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};

/* localStorage can throw (private mode, blocked storage, quota), so every touch is guarded. */
function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}
function writeStorage(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* history just stays in memory */
  }
}
function removeStorage(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* nothing to remove */
  }
}
function storageKeys(prefix: string): string[] {
  try {
    return Object.keys(window.localStorage).filter((k) => k.startsWith(prefix));
  } catch {
    return [];
  }
}

function rememberEnabled() {
  if (remember === null) {
    try {
      remember = JSON.parse(readStorage(PREFS_KEY) ?? "{}").remember !== false;
    } catch {
      remember = true;
    }
  }
  return remember;
}

/** Drops threads older than 30 days and keeps only the 30 most recently used. */
function pruneOnce() {
  if (pruned) return;
  pruned = true;
  const entries = storageKeys(THREAD_PREFIX).map((k) => {
    let updatedAt = 0;
    try {
      updatedAt = JSON.parse(readStorage(k) ?? "{}").updatedAt ?? 0;
    } catch {
      /* unreadable thread: treated as expired */
    }
    return { k, updatedAt };
  });
  entries.sort((a, b) => b.updatedAt - a.updatedAt);
  entries.forEach(({ k, updatedAt }, i) => {
    if (i >= MAX_THREADS || Date.now() - updatedAt > MAX_AGE_MS) removeStorage(k);
  });
}

function load(key: string): ChatMessage[] {
  const cached = threads.get(key);
  if (cached) return cached;
  let messages = EMPTY;
  if (typeof window !== "undefined" && rememberEnabled()) {
    pruneOnce();
    try {
      const parsed = JSON.parse(readStorage(THREAD_PREFIX + key) ?? "null");
      if (Array.isArray(parsed?.messages)) messages = parsed.messages;
    } catch {
      /* corrupt thread: start fresh */
    }
  }
  threads.set(key, messages);
  return messages;
}

function persist(key: string) {
  if (!rememberEnabled()) return;
  window.clearTimeout(persistTimers.get(key));
  persistTimers.set(
    key,
    window.setTimeout(() => {
      const messages = threads.get(key) ?? EMPTY;
      if (messages.length === 0) removeStorage(THREAD_PREFIX + key);
      else writeStorage(THREAD_PREFIX + key, JSON.stringify({ updatedAt: Date.now(), messages }));
    }, PERSIST_DELAY_MS),
  );
}

/** Writes pending threads right away so a quick reload or navigation loses nothing. */
function flushPending() {
  persistTimers.forEach((t, key) => {
    window.clearTimeout(t);
    const messages = threads.get(key) ?? EMPTY;
    if (messages.length)
      writeStorage(THREAD_PREFIX + key, JSON.stringify({ updatedAt: Date.now(), messages }));
  });
  persistTimers.clear();
}
if (typeof window !== "undefined") window.addEventListener("pagehide", flushPending);

function set(key: string, messages: ChatMessage[]) {
  threads.set(key, messages.length > MAX_MESSAGES ? messages.slice(-MAX_MESSAGES) : messages);
  persist(key);
  notify();
}

function nextId(messages: ChatMessage[]) {
  return messages.reduce((max, m) => Math.max(max, m.id), 0) + 1;
}

export function appendMessage(key: string, role: ChatMessage["role"], text: string): number {
  const messages = load(key);
  const id = nextId(messages);
  set(key, [...messages, { id, role, text }]);
  return id;
}

export function updateMessage(key: string, id: number, text: string) {
  set(
    key,
    load(key).map((m) => (m.id === id ? { ...m, text } : m)),
  );
}

export function getThread(key: string): ChatMessage[] {
  return load(key);
}

export function removeMessage(key: string, id: number) {
  set(
    key,
    load(key).filter((m) => m.id !== id),
  );
}

export function clearThread(key: string) {
  set(key, []);
}

/** Adds a labelled divider unless the thread is empty or already ends with one. */
export function addDivider(key: string, label: string) {
  const messages = load(key);
  if (messages.length === 0 || messages[messages.length - 1].role === "divider") return;
  appendMessage(key, "divider", label);
}

export function useRivetThread(key: string): ChatMessage[] {
  return useSyncExternalStore(
    subscribe,
    () => load(key),
    () => EMPTY,
  );
}

export function useRememberConversations(): boolean {
  return useSyncExternalStore(subscribe, rememberEnabled, () => true);
}

export function setRememberConversations(value: boolean) {
  remember = value;
  writeStorage(PREFS_KEY, JSON.stringify({ remember: value }));
  if (value) {
    threads.forEach((_, key) => persist(key));
  } else {
    // Turning it off also wipes what was already saved on this device.
    persistTimers.forEach((t) => window.clearTimeout(t));
    persistTimers.clear();
    storageKeys(THREAD_PREFIX).forEach(removeStorage);
  }
  notify();
}

/** Removes every conversation and every other `rivet:` entry (settings, preferences, nudge flags). */
export function clearAllRivetData() {
  persistTimers.forEach((t) => window.clearTimeout(t));
  persistTimers.clear();
  storageKeys("rivet:").forEach(removeStorage);
  try {
    window.sessionStorage.removeItem("rivet:nudge-dismissed");
    window.sessionStorage.removeItem("rivet:keys");
  } catch {
    /* nothing to remove */
  }
  threads.clear();
  remember = null;
  pruned = false;
  resetSettings();
  notify();
}
