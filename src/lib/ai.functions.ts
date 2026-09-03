/**
 * Server functions (typed RPC) for the four non-chat AI features.
 * The browser calls these; the API key and prompts stay on the server.
 */
import { createServerFn } from "@tanstack/react-start";
import { streamText } from "ai";
import { z } from "zod";

import { AI_MODEL, createLovableAiGatewayProvider, describeAiError, getLovableApiKey } from "./ai-gateway.server";
import {
  buildEmailPrompt,
  buildPlannerPrompt,
  buildResearchPrompt,
  buildSummaryPrompt,
} from "./prompts.server";

/** Runs one prompt through the gateway and returns the finished text. */
async function runPrompt(prompt: string): Promise<string> {
  const gateway = createLovableAiGatewayProvider(getLovableApiKey());
  try {
    // Streaming keeps the connection alive for longer generations; we await the
    // full text because these features show the result all at once.
    const result = streamText({ model: gateway(AI_MODEL), prompt });
    return await result.text;
  } catch (error) {
    console.error("AI request failed:", error);
    throw new Error(describeAiError(error));
  }
}

const emailSchema = z.object({
  recipient: z.string().max(200),
  purpose: z.string().min(1, "Purpose is required").max(2000),
  keyPoints: z.string().max(4000),
  tone: z.enum(["Professional", "Formal", "Friendly", "Persuasive", "Apologetic"]),
  length: z.enum(["Short", "Medium", "Detailed"]),
});

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => emailSchema.parse(d))
  .handler(async ({ data }) => ({ text: await runPrompt(buildEmailPrompt(data)) }));

const summarySchema = z.object({ notes: z.string().min(20, "Please paste some notes first").max(20000) });

export const summariseNotes = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => summarySchema.parse(d))
  .handler(async ({ data }) => ({ text: await runPrompt(buildSummaryPrompt(data)) }));

const plannerSchema = z.object({
  tasks: z
    .array(
      z.object({
        name: z.string(),
        deadline: z.string(),
        duration: z.string(),
        priority: z.string(),
        notes: z.string(),
        status: z.string(),
      }),
    )
    .min(1, "Add at least one task")
    .max(50),
});

export const planTasks = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => plannerSchema.parse(d))
  .handler(async ({ data }) => ({ text: await runPrompt(buildPlannerPrompt(data.tasks)) }));

const researchSchema = z.object({
  topic: z.string().min(1, "Topic is required").max(500),
  question: z.string().max(1000),
  detail: z.enum(["Quick overview", "Detailed", "Executive summary"]),
});

export const runResearch = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => researchSchema.parse(d))
  .handler(async ({ data }) => ({ text: await runPrompt(buildResearchPrompt(data)) }));
