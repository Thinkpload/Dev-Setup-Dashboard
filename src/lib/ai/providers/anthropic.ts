import Anthropic from '@anthropic-ai/sdk';
import type { ChatCompletionOptions } from '../index';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function createAnthropicCompletion({
  messages,
  model = 'claude-haiku-4-5-20251001',
  maxTokens = 1024,
}: ChatCompletionOptions): Promise<string> {
  const systemMessage = messages.find((m) => m.role === 'system');
  const userMessages = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

  const response = await client.messages.create({
    model,
    max_tokens: maxTokens,
    messages: userMessages,
    ...(systemMessage ? { system: systemMessage.content } : {}),
  });

  const firstContent = response.content[0];
  return firstContent?.type === 'text' ? firstContent.text : '';
}
