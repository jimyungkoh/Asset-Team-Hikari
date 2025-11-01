// ============================================================
// Modified: See CHANGELOG.md for complete modification history
// Last Updated: 2025-11-02
// Modified By: jimyungkoh<aqaqeqeq0511@gmail.com>
// ============================================================

import { Injectable, Logger } from "@nestjs/common";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatCompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  reasoningTokens?: number;
  reasoningEffort?: "none" | "low" | "medium" | "high";
  enableReasoning?: boolean;
}

@Injectable()
export class OpenRouterAiClient {
  private readonly logger = new Logger(OpenRouterAiClient.name);
  private readonly apiKey = process.env.OPENROUTER_API_KEY;
  private readonly baseUrl =
    process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1";
  private readonly defaultModel =
    process.env.OPENROUTER_SUMMARY_MODEL ?? "anthropic/claude-haiku-4.5";

  get isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  async createChatCompletion(
    messages: ChatMessage[],
    options?: ChatCompletionOptions
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error("OPENROUTER_API_KEY is not configured");
    }

    const model = options?.model ?? this.defaultModel;
    const temperature =
      typeof options?.temperature === "number" ? options.temperature : 0.2;
    const payload: Record<string, unknown> = {
      model,
      temperature,
      messages,
    };

    if (typeof options?.maxTokens === "number") {
      payload["max_tokens"] = options.maxTokens;
    }

    const reasoningEffort = options?.reasoningEffort ?? "high";
    const reasoningTokens =
      typeof options?.reasoningTokens === "number" &&
      options.reasoningTokens > 0
        ? options.reasoningTokens
        : undefined;
    const enableReasoning =
      options?.enableReasoning ?? Boolean(reasoningTokens || reasoningEffort);

    if (enableReasoning) {
      payload["reasoning"] = {
        effort: reasoningEffort,
        tokens: reasoningTokens,
      };
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      this.logger.error(
        `OpenRouter request failed (${response.status}): ${errorText}`
      );
      throw new Error(
        `OpenRouter request failed with status ${response.status}`
      );
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("OpenRouter response did not contain any content");
    }

    return content.trim();
  }
}
