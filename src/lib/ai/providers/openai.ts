import OpenAI from 'openai';
import type { ChatCompletionOptions } from '../index';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function createOpenAICompletion({
  messages,
  model = 'gpt-4o-mini',
  maxTokens = 1024,
}: ChatCompletionOptions): Promise<string> {
  const response = await client.chat.completions.create({
    model,
    max_tokens: maxTokens,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });

  return response.choices[0]?.message?.content ?? '';
}
