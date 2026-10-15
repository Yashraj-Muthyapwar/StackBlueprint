import { RivetError, isAbort } from "./providers/errors";
import type { ProviderDef } from "./providers";
import type { KeyState } from "./settings";
import { withDeadline } from "./deadline";

const PROBE_TIMEOUT_MS = 30_000;
const MAX_PROBES = 6;

export interface VerifyResult {
  /** Status to store with the key. */
  state: KeyState;
  models: string[];
  /** The model to select: one that answered, or the best guess when none could be tested. */
  model: string;
  /** Learner-facing summary of what was and was not confirmed. */
  message: string;
  warning: boolean;
}

/**
 * Sends a minimal, bounded generation request to one model. It only counts as
 * working when the model produced text, or stopped because it hit the token
 * cap (reasoning models can spend a 16-token budget before writing anything,
 * which still proves the key can generate with that model). An empty reply, a
 * filtered reply or a stream that ends without either proves nothing.
 */
async function probe(
  provider: ProviderDef,
  key: string,
  model: string,
  signal: AbortSignal,
): Promise<"answered" | "generated"> {
  return withDeadline(
    signal,
    PROBE_TIMEOUT_MS,
    `${provider.name} did not answer in time.`,
    async (probeSignal) => {
      for await (const part of provider.stream({
        key,
        model,
        system: "Reply with the single word OK.",
        turns: [{ role: "user", content: "Say OK." }],
        maxTokens: 16,
        signal: probeSignal,
      })) {
        if ("text" in part && part.text.trim()) return "answered";
        if ("finish" in part) {
          if (part.finish === "length") return "generated";
          throw new RivetError(
            "empty",
            part.finish === "filtered"
              ? `${provider.name} withheld the reply to a test message.`
              : `${model} returned an empty reply to a test message.`,
          );
        }
      }
      throw new RivetError("empty", `${model} returned no reply to a test message.`);
    },
  );
}

/**
 * Checks a key in two steps: whatever key check the provider offers, then a
 * tiny generation with the model the learner will use. A rate limit is never
 * treated as success, because it proves nothing about the key (and the relay
 * can produce one on its own).
 */
export async function verifyProvider(
  provider: ProviderDef,
  key: string,
  preferredModel: string,
  signal: AbortSignal,
): Promise<VerifyResult> {
  return withDeadline(signal, 90_000, "The connection test took too long. Try again.", (bounded) =>
    verifyWithin(provider, key, preferredModel, bounded),
  );
}

export function discoverModels(
  provider: ProviderDef,
  key: string,
  model: string,
  signal: AbortSignal,
) {
  return withDeadline(
    signal,
    20_000,
    `${provider.name} did not return its model list in time.`,
    (bounded) => provider.listModels({ key, model }, bounded),
  );
}

async function verifyWithin(
  provider: ProviderDef,
  key: string,
  preferredModel: string,
  signal: AbortSignal,
): Promise<VerifyResult> {
  const { models, keyVerified } = await withDeadline(
    signal,
    20_000,
    `${provider.name} did not finish checking the key and model list in time.`,
    (bounded) => provider.test({ key, model: preferredModel }, bounded),
  );
  if (models.length === 0)
    throw new RivetError(
      "model",
      `${provider.name} accepted the key, but no usable models were found.`,
    );

  const first =
    (preferredModel && models.includes(preferredModel) && preferredModel) ||
    provider.fallbackModels.find((m) => models.includes(m)) ||
    models[0];
  const extra = provider.probeOrder ? provider.probeOrder(models) : [];
  const candidates = [first, ...extra.filter((m) => m !== first)].slice(0, MAX_PROBES);

  let modelProblem: RivetError | null = null;
  for (const model of candidates) {
    try {
      const outcome = await probe(provider, key, model, signal);
      return {
        state: "tested",
        models,
        model,
        message:
          outcome === "answered"
            ? `Connected. ${model} answered a test message.`
            : `Connected. ${model} accepted a test message and started generating.`,
        warning: false,
      };
    } catch (e) {
      if (isAbort(e)) throw e;
      if (!(e instanceof RivetError)) throw e;
      if (e.kind === "auth") throw e;
      // A model that cannot be used, or that gave back nothing, proves nothing: try the next one.
      if (e.kind === "model" || e.kind === "empty") {
        modelProblem = e;
        continue;
      }
      if (e.kind === "rate")
        return {
          state: "rate-limited",
          models,
          model: first,
          message: `Key saved but not confirmed: ${e.message} Rivet will try it when you send a message.`,
          warning: true,
        };
      // Network trouble or a timeout: the key may be fine, but nothing was proven by the probe.
      if (keyVerified)
        return {
          state: "verified",
          models,
          model: first,
          message: `${provider.name} accepted the key, but the test message failed: ${e.message}`,
          warning: true,
        };
      throw e;
    }
  }
  if (keyVerified)
    return {
      state: "verified",
      models,
      model: first,
      message: `${provider.name} accepted the key, but ${first} could not answer. ${modelProblem?.message ?? ""} Pick another model below.`,
      warning: true,
    };
  throw new RivetError(
    "model",
    `Rivet could not confirm that any ${provider.name} model works with this key. ${modelProblem?.message ?? ""} Check that a chat model is enabled for your account on the provider's site, then try again.`,
  );
}
