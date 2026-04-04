import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { ChatCompletionOptions } from '../index';

// Mock provider modules
vi.mock('../providers/anthropic', () => ({
  createAnthropicCompletion: vi.fn().mockResolvedValue('Anthropic response'),
}));

vi.mock('../providers/openai', () => ({
  createOpenAICompletion: vi.fn().mockResolvedValue('OpenAI response'),
}));

describe('src/lib/ai/index.ts — createChatCompletion', () => {
  const originalEnv = process.env;
  const testMessages: ChatCompletionOptions['messages'] = [{ role: 'user', content: 'Hello' }];

  beforeEach(() => {
    process.env = { ...originalEnv };
    vi.resetModules();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('routes to Anthropic when ANTHROPIC_API_KEY is set', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';
    delete process.env.OPENAI_API_KEY;

    const { createChatCompletion } = await import('../index');
    const { createAnthropicCompletion } = await import('../providers/anthropic');

    const result = await createChatCompletion({ messages: testMessages });
    expect(result).toBe('Anthropic response');
    expect(createAnthropicCompletion).toHaveBeenCalledWith({ messages: testMessages });
  });

  it('routes to OpenAI when only OPENAI_API_KEY is set', async () => {
    delete process.env.ANTHROPIC_API_KEY;
    process.env.OPENAI_API_KEY = 'test-openai-key';

    const { createChatCompletion } = await import('../index');
    const { createOpenAICompletion } = await import('../providers/openai');

    const result = await createChatCompletion({ messages: testMessages });
    expect(result).toBe('OpenAI response');
    expect(createOpenAICompletion).toHaveBeenCalledWith({ messages: testMessages });
  });

  it('throws a clear error when neither key is set', async () => {
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.OPENAI_API_KEY;

    const { createChatCompletion } = await import('../index');

    await expect(createChatCompletion({ messages: testMessages })).rejects.toThrow(
      '[ai] No AI provider configured. Set ANTHROPIC_API_KEY or OPENAI_API_KEY.'
    );
  });

  it('prefers Anthropic over OpenAI when both keys are set', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';
    process.env.OPENAI_API_KEY = 'test-openai-key';

    const { createChatCompletion } = await import('../index');
    const { createAnthropicCompletion } = await import('../providers/anthropic');

    const result = await createChatCompletion({ messages: testMessages });
    expect(result).toBe('Anthropic response');
    expect(createAnthropicCompletion).toHaveBeenCalled();
  });
});
