import { useSyncExternalStore } from "react";
import { resetSettings } from "./settings";
import { broadcast, onBroadcast } from "./sync";

/**
 * Per-lesson conversation history for Rivet. Threads live in memory so they
 * survive closing the panel, and are mirrored to localStorage (this device
 * only) so they survive reloads. The models are stateless, so every request
 * resends the recent turns of a thread.
 *
 * Retention is enforced whenever history is read or written: threads unused
 * for 30 days are deleted, only the 30 most recent are kept, and each thread
 * is capped in size. Nothing runs while the site is closed, so old threads are
 * removed the next time Rivet is used.
 */

export interface ChatMessage {
  id: number;
  /** "divider" is a label such as "New quiz attempt", never sent to a model. */
  role: "user" | "rivet" | "divider";
  text: string;
  /** Set on replies that did not finish normally. */
  status?: "interrupted" | "truncated";
}

const THREAD_PREFIX = "rivet:chat:";
const PREFS_KEY = "rivet:prefs";
const CONTROL_KEY = "rivet:history-control";
const MAX_MESSAGES = 40;
const MAX_THREADS = 30;
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
const MAX_MESSAGE_CHARS = 20_000;
/** Per stored thread. 30 threads at this size stay well inside a 5 MB storage quota. */
const MAX_THREAD_CHARS = 100_000;
const PERSIST_DELAY_MS = 400;

const EMPTY: ChatMessage[] = [];
const threads = new Map<string, ChatMessage[]>();
const versions = new Map<string, number>();
const revisions = new Map<string, string>();
const listeners = new Set<() => void>();
const persistTimers = new Map<string, number>();
let remember: boolean | null = null;
let pruned = false;
let storageError: string | null = null;
let persistenceBlocked = false;

export interface CleanupResult {
  ok: boolean;
  message: string | null;
}

const CLEANUP_WARNING =
  "This browser could not confirm removal of saved Rivet data. Clear this site's data in your browser settings. Revoke a remembered key in the provider's console if needed.";

function storageFailed() {
  storageError = CLEANUP_WARNING;
  persistenceBlocked = true;
}

// Web Locks serialize writes and privacy changes across tabs. Without that API,
// keep chat in memory rather than promise race-safe persistent history.
function withHistoryLock<T>(work: () => T): Promise<T> {
  if (typeof navigator !== "undefined" && navigator.locks) {
    let entered = false;
    return navigator.locks
      .request("rivet-history", () => {
        entered = true;
        return work();
      })
      .catch((error: unknown) => {
        if (entered) throw error;
        storageFailed();
        // Saving is now blocked; still attempt explicit removal and report failure.
        return work();
      });
  }
  return Promise.resolve(work());
}

function canPersist() {
  return typeof navigator !== "undefined" && !!navigator.locks && !persistenceBlocked;
}

type Control = { epoch: string; deleted: Record<string, string> };
function control(): Control {
  try {
    const raw = JSON.parse(window.localStorage.getItem(CONTROL_KEY) ?? "null");
    if (!raw) return { epoch: "0", deleted: {} };
    if (typeof raw.epoch !== "string" || !raw.deleted || typeof raw.deleted !== "object")
      throw new Error("Invalid history control");
    return raw;
  } catch {
    storageFailed();
    return { epoch: "unreadable", deleted: {} };
  }
}
const newRevision = () => `${Date.now()}-${Math.random()}`;
const revision = (c: Control, key: string) => `${c.epoch}/${c.deleted[key] ?? "0"}`;

function invalidate(key: string) {
  cancelPending(key);
  versions.set(key, (versions.get(key) ?? 0) + 1);
  threads.delete(key);
  revisions.delete(key);
}

function refresh(key: string) {
  const next = revision(control(), key);
  if (revisions.has(key) && revisions.get(key) !== next) invalidate(key);
  revisions.set(key, next);
}

function cleanupResult(): CleanupResult {
  notify();
  return { ok: storageError === null, message: storageError };
}

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
    storageFailed();
    return null;
  }
}
function writeStorage(key: string, value: string): boolean {
  try {
    window.localStorage.setItem(key, value);
    if (window.localStorage.getItem(key) !== value) throw new Error("Write could not be verified");
    return true;
  } catch {
    return false; // history just stays in memory
  }
}
function removeStorage(key: string): boolean {
  try {
    window.localStorage.removeItem(key);
    if (window.localStorage.getItem(key) !== null) throw new Error("Removal failed");
    return true;
  } catch {
    storageFailed();
    return false;
  }
}
function storageKeys(prefix: string): string[] {
  try {
    return Object.keys(window.localStorage).filter((k) => k.startsWith(prefix));
  } catch {
    storageFailed();
    return [];
  }
}

function rememberEnabled() {
  if (persistenceBlocked) return false;
  try {
    remember = JSON.parse(window.localStorage.getItem(PREFS_KEY) ?? "{}").remember !== false;
  } catch {
    storageFailed();
    remember = false;
  }
  return remember;
}

/** Keeps only well-formed messages, with bounded text, from untrusted storage. */
function validMessages(raw: unknown): ChatMessage[] {
  if (!Array.isArray(raw)) return EMPTY;
  const out: ChatMessage[] = [];
  const seen = new Set<number>();
  for (const m of raw.slice(-MAX_MESSAGES)) {
    if (!m || typeof m !== "object") continue;
    const { id, role, text, status } = m as Record<string, unknown>;
    if (!Number.isSafeInteger(id) || seen.has(id as number)) continue;
    if (role !== "user" && role !== "rivet" && role !== "divider") continue;
    if (typeof text !== "string") continue;
    seen.add(id as number);
    out.push({
      id: id as number,
      role,
      text: text.slice(0, MAX_MESSAGE_CHARS),
      ...(status === "interrupted" || status === "truncated" ? { status } : {}),
    });
  }
  return out;
}

function readThread(
  storageKey: string,
): { updatedAt: number; messages: unknown; revision: string } | null {
  try {
    const parsed = JSON.parse(readStorage(storageKey) ?? "null");
    if (!parsed || typeof parsed !== "object") return null;
    return {
      updatedAt: Number(parsed.updatedAt) || 0,
      messages: parsed.messages,
      revision: typeof parsed.revision === "string" ? parsed.revision : "0/0",
    };
  } catch {
    return null;
  }
}

/** Removes expired threads and all but the most recent MAX_THREADS, from storage and memory. */
function enforceRetention(keep?: string) {
  const now = Date.now();
  const entries = storageKeys(THREAD_PREFIX).map((k) => {
    // Threads are written with updatedAt first, so it can be read without parsing the whole thread.
    const head = /^\{"updatedAt":(\d+)/.exec(readStorage(k)?.slice(0, 40) ?? "");
    const updatedAt = head ? Number(head[1]) : (readThread(k)?.updatedAt ?? 0); // unreadable: expired
    return { k, updatedAt };
  });
  const kept = keep === undefined ? null : THREAD_PREFIX + keep;
  // The thread being written always ranks first, so it takes one of the MAX_THREADS slots
  // even when timestamps tie; the key is a final tie-breaker for a deterministic order.
  entries.sort(
    (a, b) =>
      Number(b.k === kept) - Number(a.k === kept) ||
      b.updatedAt - a.updatedAt ||
      (a.k < b.k ? -1 : a.k > b.k ? 1 : 0),
  );
  let changed = false;
  entries.forEach(({ k, updatedAt }, i) => {
    if (k === kept) return;
    if (i >= MAX_THREADS || now - updatedAt > MAX_AGE_MS) {
      removeStorage(k);
      // Also drop the in-memory copy so a later write cannot bring it back.
      const key = k.slice(THREAD_PREFIX.length);
      if (threads.delete(key)) changed = true;
    }
  });
  return changed;
}

function load(key: string): ChatMessage[] {
  if (typeof window !== "undefined") refresh(key);
  const cached = threads.get(key);
  if (cached) return cached;
  let messages = EMPTY;
  if (typeof window !== "undefined" && rememberEnabled()) {
    if (!pruned) {
      pruned = true;
      enforceRetention();
    }
    const stored = readThread(THREAD_PREFIX + key);
    if (
      stored &&
      stored.revision === revisions.get(key) &&
      Date.now() - stored.updatedAt <= MAX_AGE_MS
    ) {
      messages = validMessages(stored.messages);
    } else if (stored) {
      removeStorage(THREAD_PREFIX + key);
    }
  }
  threads.set(key, messages);
  return messages;
}

/** Drops the oldest messages until the serialized thread fits the size cap. */
function fitToBudget(messages: ChatMessage[]): ChatMessage[] {
  let fitted = messages;
  while (fitted.length > 1 && JSON.stringify(fitted).length > MAX_THREAD_CHARS) {
    fitted = fitted.slice(1);
  }
  return fitted;
}

function writeThread(key: string, expected: string | undefined) {
  if (!canPersist() || !rememberEnabled()) return;
  refresh(key);
  if (revisions.get(key) !== expected) return;
  const messages = threads.get(key) ?? EMPTY;
  if (messages.length === 0) {
    removeStorage(THREAD_PREFIX + key);
    return;
  }
  if (
    !writeStorage(
      THREAD_PREFIX + key,
      JSON.stringify({
        updatedAt: Date.now(),
        revision: expected,
        messages: fitToBudget(messages),
      }),
    )
  ) {
    storageFailed();
    notify();
  }
  if (enforceRetention(key)) notify();
}

function persist(key: string) {
  if (!canPersist() || !rememberEnabled()) return;
  const expected = revisions.get(key);
  window.clearTimeout(persistTimers.get(key));
  persistTimers.set(
    key,
    window.setTimeout(() => {
      persistTimers.delete(key);
      void withHistoryLock(() => writeThread(key, expected));
    }, PERSIST_DELAY_MS),
  );
}

function cancelPending(key: string) {
  window.clearTimeout(persistTimers.get(key));
  persistTimers.delete(key);
}

/** Writes pending threads (and pending deletions) right away so a quick reload or navigation loses nothing. */
function flushPending() {
  const pending = [...persistTimers.keys()].map((key) => ({ key, expected: revisions.get(key) }));
  persistTimers.forEach((t) => window.clearTimeout(t));
  persistTimers.clear();
  pending.forEach(({ key, expected }) => void withHistoryLock(() => writeThread(key, expected)));
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

/** Changes whenever a thread is cleared, so a reply still streaming can tell it is stale. */
export function threadVersion(key: string): number {
  if (typeof window !== "undefined") refresh(key);
  return versions.get(key) ?? 0;
}

export function appendMessage(key: string, role: ChatMessage["role"], text: string): number {
  const messages = load(key);
  const id = nextId(messages);
  set(key, [...messages, { id, role, text: text.slice(0, MAX_MESSAGE_CHARS) }]);
  return id;
}

/** Updates a message. A message that no longer exists (the thread was cleared) is not recreated. */
export function updateMessage(
  key: string,
  id: number,
  text: string,
  status?: ChatMessage["status"],
) {
  const messages = load(key);
  if (!messages.some((m) => m.id === id)) return;
  set(
    key,
    messages.map((m) => {
      if (m.id !== id) return m;
      const next: ChatMessage = { id: m.id, role: m.role, text: text.slice(0, MAX_MESSAGE_CHARS) };
      if (status) next.status = status;
      return next;
    }),
  );
}

export function getThread(key: string): ChatMessage[] {
  return load(key);
}

export function removeMessage(key: string, id: number) {
  const messages = load(key);
  if (!messages.some((m) => m.id === id)) return;
  set(
    key,
    messages.filter((m) => m.id !== id),
  );
}

/** Clears a thread from memory and storage immediately (no debounce to lose on exit). */
export function clearThread(key: string): Promise<CleanupResult> {
  invalidate(key);
  threads.set(key, EMPTY);
  notify();
  return withHistoryLock(() => {
    const c = control();
    // Keep a secret-free deletion generation so delayed writers cannot restore data.
    if (Object.keys(c.deleted).length >= 1000) {
      c.epoch = newRevision();
      c.deleted = {};
    }
    c.deleted[key] = newRevision();
    if (!writeStorage(CONTROL_KEY, JSON.stringify(c))) storageFailed();
    invalidate(key);
    threads.set(key, EMPTY);
    revisions.set(key, revision(c, key));
    removeStorage(THREAD_PREFIX + key);
    broadcast({ type: "thread-cleared", lessonKey: key });
    return cleanupResult();
  });
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
  return useSyncExternalStore(
    subscribe,
    () => rememberEnabled() && canPersist(),
    () => false,
  );
}

export function useHistoryStorageError(): string | null {
  return useSyncExternalStore(
    subscribe,
    () =>
      storageError ??
      (typeof navigator !== "undefined" && !navigator.locks && rememberEnabled()
        ? "This browser cannot safely synchronize saved history across tabs. Conversations will stay in memory. Use a current browser to enable saving."
        : null),
    () => null,
  );
}

export function setRememberConversations(value: boolean): Promise<CleanupResult> {
  remember = value;
  if (!value) {
    persistTimers.forEach((t) => window.clearTimeout(t));
    persistTimers.clear();
  }
  notify();
  return withHistoryLock(() => {
    if (!writeStorage(PREFS_KEY, JSON.stringify({ remember: value }))) storageFailed();
    if (!value) storageKeys(THREAD_PREFIX).forEach(removeStorage);
    else if (typeof navigator === "undefined" || !navigator.locks) {
      storageError =
        "This browser cannot safely synchronize saved history across tabs. Conversations will stay in memory. Use a current browser to enable saving.";
    } else if (!storageError) persistenceBlocked = false;
    broadcast({ type: "history-preference", remember: value });
    if (value) threads.forEach((_, key) => persist(key));
    return cleanupResult();
  });
}

function forgetEverythingInMemory() {
  persistTimers.forEach((t) => window.clearTimeout(t));
  persistTimers.clear();
  threads.forEach((_, key) => versions.set(key, threadVersion(key) + 1));
  threads.clear();
  revisions.clear();
  remember = null;
  pruned = false;
  resetSettings();
  notify();
}

/** Removes every conversation and every other `rivet:` entry (settings, preferences, nudge flags), in all tabs. */
export function clearAllRivetData(): Promise<CleanupResult> {
  persistTimers.forEach((t) => window.clearTimeout(t));
  persistTimers.clear();
  forgetEverythingInMemory();
  return withHistoryLock(() => {
    storageKeys("rivet:")
      .filter((k) => k !== CONTROL_KEY)
      .forEach(removeStorage);
    if (!writeStorage(CONTROL_KEY, JSON.stringify({ epoch: newRevision(), deleted: {} })))
      storageFailed();
    // Clearing everything leaves history saving off until explicitly enabled again.
    if (!writeStorage(PREFS_KEY, JSON.stringify({ remember: false }))) storageFailed();
    remember = false;
    try {
      for (const key of ["rivet:nudge-dismissed", "rivet:nudged-lessons", "rivet:keys"]) {
        window.sessionStorage.removeItem(key);
        if (window.sessionStorage.getItem(key) !== null) throw new Error("Removal failed");
      }
    } catch {
      storageFailed();
    }
    broadcast({ type: "clear-all" });
    return cleanupResult();
  });
}

if (typeof window !== "undefined") {
  onBroadcast((m) => {
    if (m.type === "clear-all") forgetEverythingInMemory();
    else if (m.type === "thread-cleared") {
      refresh(m.lessonKey);
      notify();
    } else if (m.type === "history-preference") {
      remember = m.remember;
      if (!m.remember) {
        persistTimers.forEach((t) => window.clearTimeout(t));
        persistTimers.clear();
      }
      notify();
    }
  });
  window.addEventListener("storage", (e) => {
    if (e.key === CONTROL_KEY || e.key === null) {
      [...threads.keys()].forEach(refresh);
      notify();
    }
    if (e.key === PREFS_KEY || e.key === null) {
      if (!rememberEnabled()) {
        persistTimers.forEach((t) => window.clearTimeout(t));
        persistTimers.clear();
      }
      notify();
    }
  });
}
