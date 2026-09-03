/**
 * Server-only helper that connects the Vercel AI SDK to the Lovable AI Gateway.
 *
 * The API key lives in `process.env.LOVABLE_API_KEY` and is NEVER sent to the
 * browser. Every AI call in this app goes through a server function or a server
 * route that uses this provider.
 */
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export const AI_MODEL = "google/gemini-3.7-flash";

export function getLovableApiKey(): string {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("Missing LOVABLE_API_KEY on the server.");
  return key;
}

export function createLovableAiGatewayProvider(apiKey: string) {
  return createOpenAICompatible({
    name: "lovable-ai-gateway",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    headers: {
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "vercel-ai-sdk",
    },
  });
}

/** Turns gateway HTTP failures into messages the UI can show to the user. */
export function describeAiError(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error);
  if (raw.includes("429")) return "The AI service is rate limited right now. Please wait a moment and try again.";
  if (raw.includes("402")) return "AI credits have run out for this workspace. Add credits to continue.";
  if (raw.includes("403")) return "AI access is blocked for this workspace.";
  if (raw.includes("401")) return "The AI service is not configured correctly (missing key).";
  return "The AI request failed. Please try again.";
}
