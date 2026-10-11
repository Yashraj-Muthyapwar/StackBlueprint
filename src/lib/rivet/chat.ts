import { getThread, type ChatMessage } from "./history";
import { buildSystemPrompt, type PromptContext } from "./prompt";
import { RivetError } from "./providers/errors";
import { selectLessonLinks } from "./sitemap";
import type { ChatTurn } from "./providers";
import { getSettings, resolveActive } from "./settings";

const MAX_TURNS = 10;

/**
 * Models are stateless, so every request resends the recent conversation.
 * Only turns after the last divider are sent (a new quiz attempt starts a
 * fresh context), and consecutive messages from the same side are merged so
 * a Stop or an error never leaves two user turns back to back.
 */
export function turnsForModel(messages: ChatMessage[], max = MAX_TURNS): ChatTurn[] {
  const lastDivider = messages.map((m) => m.role).lastIndexOf("divider");
  const turns: ChatTurn[] = [];
  for (const m of messages.slice(lastDivider + 1)) {
    if (m.role === "divider" || !m.text.trim()) continue;
    const role = m.role === "user" ? "user" : "assistant";
    const prev = turns[turns.length - 1];
    if (prev && prev.role === role) prev.content += `\n\n${m.text}`;
    else turns.push({ role, content: m.text });
  }
  const recent = turns.slice(-max);
  while (recent.length && recent[0].role !== "user") recent.shift();
  return recent;
}

/** Streams Rivet's reply to the latest message in a lesson's thread. */
export function streamReply(
  lessonKey: string,
  context: PromptContext,
  signal?: AbortSignal,
): AsyncGenerator<string> {
  const active = resolveActive(getSettings());
  if (!active)
    throw new RivetError(
      "notconfigured",
      "Connect a free model in settings to start chatting with Rivet.",
    );
  const turns = turnsForModel(getThread(lessonKey));
  const lastQuestion =
    [...getThread(lessonKey)].reverse().find((m) => m.role === "user")?.text ?? "";
  const links = selectLessonLinks(lessonKey, lastQuestion);
  return active.provider.stream({
    ...active.config,
    system: buildSystemPrompt({ ...context, links }),
    turns,
    signal,
  });
}
