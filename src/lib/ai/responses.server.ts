import { createOpenAI } from "@ai-sdk/openai";
import { APICallError, streamText, type ModelMessage, type UIMessage } from "ai";

import {
  createLovableAiGatewayRunIdFetch,
  getLovableAiGatewayRunId,
  withLovableAiGatewayRunIdHeader,
} from "./run-id.ts";

type ResponsesConfig = { baseURL: string; apiKey: string; model: string };

type ResponseOptions = {
  originalMessages: UIMessage[];
  onComplete: (messages: UIMessage[]) => Promise<void>;
  onGatewayError?: (status: number, message: string) => Promise<void>;
};

function describeError(error: unknown) {
  if (APICallError.isInstance(error)) {
    const status = error.statusCode ?? 500;
    let message = `The AI service returned an error (${status}).`;
    try {
      const parsed = JSON.parse(error.responseBody ?? "{}");
      message = String(parsed?.error?.message || parsed?.message || message);
    } catch {
      /* keep generic message */
    }
    if (status === 429) message = "Codesynux AI is busy right now. Please wait a moment and try again.";
    if (status === 402) message = message || "AI credits are exhausted. The account owner needs to add credits.";
    return { status, message };
  }
  return { status: 500, message: "The answer was interrupted. Please try again." };
}

export function createResponsesCall(
  request: Request,
  config: ResponsesConfig,
  messages: ModelMessage[],
  instructions?: string,
) {
  const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
  const provider = createOpenAI({
    baseURL: `${config.baseURL.replace(/\/+$/, "").replace(/\/v1$/, "")}/v1`,
    apiKey: config.apiKey,
    headers: { "Lovable-API-Key": config.apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });
  const reasoning = config.model !== "openai/chat-latest";
  const result = streamText({
    model: provider.responses(config.model),
    ...(instructions ? { instructions } : {}),
    tools: { web_search: provider.tools.webSearch({}) },
    maxRetries: 0,
    messages,
    abortSignal: request.signal,
    providerOptions: {
      openai: {
        store: false,
        ...(reasoning
          ? {
              forceReasoning: true,
              reasoningEffort: "medium",
              reasoningSummary: "auto",
              include: ["reasoning.encrypted_content"],
            }
          : {}),
      },
    },
  });
  return {
    result,
    response: (options: ResponseOptions) =>
      withLovableAiGatewayRunIdHeader(
        result.toUIMessageStreamResponse({
          originalMessages: options.originalMessages,
          sendReasoning: true,
          sendSources: true,
          onError: (error) => {
            const { status, message } = describeError(error);
            if (options.onGatewayError) void options.onGatewayError(status, message);
            return message;
          },
          onFinish: async ({ messages: completed, isAborted }) => {
            if (isAborted && completed.at(-1)?.role !== "assistant") return;
            await options.onComplete(completed);
          },
        }),
        runIdFetch,
      ),
  };
}
