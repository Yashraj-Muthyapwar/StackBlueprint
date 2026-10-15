/**
 * Tells other open tabs of this site about removals, so a key removed or data
 * cleared in one tab is dropped from memory in the others too. Messages never
 * carry keys or conversation text.
 */
export type RivetSyncMessage =
  | { type: "key-removed"; providerId: string }
  | { type: "clear-all" }
  | { type: "thread-cleared"; lessonKey: string }
  | { type: "history-preference"; remember: boolean };

const CHANNEL = "rivet";
let channel: BroadcastChannel | null | undefined;

function getChannel(): BroadcastChannel | null {
  if (channel === undefined) {
    try {
      channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel(CHANNEL) : null;
    } catch {
      channel = null;
    }
  }
  return channel;
}

/**
 * Storage events are the fallback for browsers without BroadcastChannel: each
 * message is also written to this key (with a unique stamp so repeats still
 * fire), and other tabs of the site receive a `storage` event for it.
 */
const STORAGE_SIGNAL = "rivet:sync";

function parse(data: unknown): RivetSyncMessage | null {
  const m = data as Partial<RivetSyncMessage> | null;
  if (m?.type === "clear-all") return { type: "clear-all" };
  if (m?.type === "key-removed" && typeof m.providerId === "string")
    return { type: "key-removed", providerId: m.providerId };
  if (m?.type === "thread-cleared" && typeof m.lessonKey === "string")
    return { type: "thread-cleared", lessonKey: m.lessonKey };
  if (m?.type === "history-preference" && typeof m.remember === "boolean")
    return { type: "history-preference", remember: m.remember };
  return null;
}

export function broadcast(message: RivetSyncMessage) {
  try {
    getChannel()?.postMessage(message);
  } catch {
    /* the storage signal below still reaches other tabs */
  }
  try {
    window.localStorage.setItem(
      STORAGE_SIGNAL,
      JSON.stringify({ ...message, stamp: `${Date.now()}-${Math.random()}` }),
    );
  } catch {
    /* storage blocked: BroadcastChannel is the only path */
  }
}

/** Handlers must be idempotent: a message can arrive through both paths. */
export function onBroadcast(handler: (message: RivetSyncMessage) => void) {
  getChannel()?.addEventListener("message", (e: MessageEvent) => {
    const m = parse(e.data);
    if (m) handler(m);
  });
  window.addEventListener("storage", (e) => {
    if (e.key !== STORAGE_SIGNAL || !e.newValue) return;
    try {
      const m = parse(JSON.parse(e.newValue));
      if (m) handler(m);
    } catch {
      /* malformed signal: ignore */
    }
  });
}
