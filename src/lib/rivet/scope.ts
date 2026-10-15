export type ScopeDecision = "ALLOW" | "REDIRECT" | "CLARIFY";

/** A response framing token, not an authorization secret or proof of relevance. */
export function createScopeProtocol() {
  const id = Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  return {
    ALLOW: `[[RIVET:${id}:ALLOW]]`,
    REDIRECT: `[[RIVET:${id}:REDIRECT]]`,
    CLARIFY: `[[RIVET:${id}:CLARIFY]]`,
  };
}

export type ScopeProtocol = ReturnType<typeof createScopeProtocol>;

/** Never show a malformed header, refusal body, or partial framing token. */
export function createScopeGate(protocol: ScopeProtocol) {
  const headers = (Object.keys(protocol) as ScopeDecision[]).flatMap((decision) => [
    { decision, value: `${protocol[decision]}\n` },
    { decision, value: `${protocol[decision]}\r\n` },
  ]);
  let pending = "";
  let decision: ScopeDecision | null = null;
  return {
    push(text: string): { decision: ScopeDecision | null; text: string } {
      if (decision) return { decision, text: decision === "ALLOW" ? text : "" };
      // At most one header is retained between chunks; long invalid output is discarded.
      const candidate = pending + text;
      const header = headers.find((item) => candidate.startsWith(item.value));
      if (header) {
        decision = header.decision;
        pending = "";
        return {
          decision,
          text: decision === "ALLOW" ? candidate.slice(header.value.length) : "",
        };
      }
      if (headers.some((item) => item.value.startsWith(candidate))) pending = candidate;
      else {
        decision = "CLARIFY";
        pending = "";
      }
      return { decision, text: "" };
    },
    finish(): ScopeDecision {
      return decision ?? "CLARIFY";
    },
  };
}

export function scopeRedirect(decision: Exclude<ScopeDecision, "ALLOW">): string {
  return decision === "REDIRECT"
    ? "I can help with this course, relevant examples and exercises, quiz review, and finding StackBlueprint lessons. I can't take on unrelated tasks or general app reviews. Ask a question connected to the course."
    : "How does your question connect to this course? Share the topic you are learning and a relevant example so I can help.";
}

export function isScopeRedirect(text: string): boolean {
  return (
    text === scopeRedirect("REDIRECT") ||
    text === scopeRedirect("CLARIFY") ||
    // Preserve filtering for refusals saved by the earlier two-request version.
    text ===
      "I can help with this lesson, its exercises, quiz review, and finding StackBlueprint courses. I can't take on unrelated tasks or general app reviews. Ask about a concept or exercise from this lesson." ||
    text ===
      "Which concept or exercise from this lesson does your question relate to? Share that connection and a small relevant example so I can help."
  );
}
