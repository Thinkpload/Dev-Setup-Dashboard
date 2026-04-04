export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatCompletionOptions {
  messages: ChatMessage[];
  model?: string;
  maxTokens?: number;
}

/**
 * Provider-agnostic chat completion.
 * Priority: ANTHROPIC_API_KEY → OPENAI_API_KEY → error.
 * Uses dynamic imports so only the active provider's SDK is loaded.
 */
export async function createChatCompletion(options: ChatCompletionOptions): Promise<string> {
  if (process.env.ANTHROPIC_API_KEY) {
    const { createAnthropicCompletion } = await import('./providers/anthropic');
    return createAnthropicCompletion(options);
  }

  if (process.env.OPENAI_API_KEY) {
    const { createOpenAICompletion } = await import('./providers/openai');
    return createOpenAICompletion(options);
  }

  throw new Error('[ai] No AI provider configured. Set ANTHROPIC_API_KEY or OPENAI_API_KEY.');
}
