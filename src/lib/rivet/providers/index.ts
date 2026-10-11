import { gemini } from "./gemini";
import { groq } from "./groq";
import { nvidia } from "./nvidia";
import { openrouter } from "./openrouter";
import type { ProviderDef, ProviderId } from "./types";

export const PROVIDERS: ProviderDef[] = [gemini, groq, nvidia, openrouter];

export const getProvider = (id: ProviderId): ProviderDef =>
  PROVIDERS.find((p) => p.id === id) ?? gemini;

export type { ChatTurn, ProviderConfig, ProviderDef, ProviderId } from "./types";
