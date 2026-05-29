---
name: add-ai-provider
description: "Add a new AI provider to the multi-provider system (Anthropic/OpenAI). Use when the user says 'add [provider] support', 'integrate [LLM]', or 'add a new AI provider'."
---

# Add an AI Provider

The project uses a provider-agnostic AI layer with dynamic imports. Adding a provider requires three changes: a provider module, registration in the dispatcher, and an env var.

## Architecture

```
src/lib/ai/
  index.ts                ← dispatcher — priority order, public API
  providers/
    anthropic.ts          ← Anthropic SDK wrapper
    openai.ts             ← OpenAI SDK wrapper
    <new-provider>.ts     ← your new provider here
```

The dispatcher in `index.ts` checks env vars in priority order and dynamically imports only the active provider's SDK.

## Step 1 — Install the SDK

```bash
pnpm add <provider-sdk-package>
```

## Step 2 — Create the Provider Module

Create `src/lib/ai/providers/<provider>.ts`:

```typescript
import ProviderClient from '<provider-sdk-package>';
import type { ChatCompletionOptions } from '../index';

const client = new ProviderClient({ apiKey: process.env.PROVIDER_API_KEY });

export async function createProviderCompletion({
  messages,
  model = 'provider-default-model',
  maxTokens = 1024,
}: ChatCompletionOptions): Promise<string> {
  // map the shared ChatMessage[] → provider-specific format
  const response = await client.someCompletionMethod({
    model,
    max_tokens: maxTokens,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });

  // extract and return the text string
  return response.someField ?? '';
}
```

Rules:

- Accept `ChatCompletionOptions` (from `../index`) — never define your own interface.
- Return `Promise<string>` — the raw text content, no wrapping.
- Read the API key from `process.env`, never hardcode or accept as parameter.
- Default model should be the provider's cost-effective option.

## Step 3 — Register in the Dispatcher

Edit `src/lib/ai/index.ts`. Add your provider to the priority chain **before** the final error throw:

```typescript
export async function createChatCompletion(options: ChatCompletionOptions): Promise<string> {
  if (process.env.ANTHROPIC_API_KEY) {
    const { createAnthropicCompletion } = await import('./providers/anthropic');
    return createAnthropicCompletion(options);
  }

  if (process.env.OPENAI_API_KEY) {
    const { createOpenAICompletion } = await import('./providers/openai');
    return createOpenAICompletion(options);
  }

  // ADD YOUR PROVIDER HERE — e.g. after OpenAI:
  if (process.env.PROVIDER_API_KEY) {
    const { createProviderCompletion } = await import('./providers/<provider>');
    return createProviderCompletion(options);
  }

  throw new Error('[ai] No AI provider configured. Set ANTHROPIC_API_KEY or OPENAI_API_KEY.');
}
```

Update the error message to list your new env var.

## Step 4 — Add to .env.example

```env
# AI Providers — set ONE
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
PROVIDER_API_KEY=        # ← add this
```

## Step 5 — Write Tests

Create `src/lib/ai/__tests__/<provider>.test.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest';

vi.mock('<provider-sdk-package>', () => ({
  default: vi.fn().mockImplementation(() => ({
    someCompletionMethod: vi.fn().mockResolvedValue({ someField: 'Hello' }),
  })),
}));

describe('createProviderCompletion', () => {
  it('returns text from provider response', async () => {
    process.env.PROVIDER_API_KEY = 'test-key';
    const { createProviderCompletion } = await import('../providers/<provider>');
    const result = await createProviderCompletion({
      messages: [{ role: 'user', content: 'hi' }],
    });
    expect(result).toBe('Hello');
  });
});
```

## Checklist

- [ ] Provider SDK installed
- [ ] `src/lib/ai/providers/<provider>.ts` created
- [ ] Accepts `ChatCompletionOptions`, returns `Promise<string>`
- [ ] API key read from `process.env`
- [ ] Dispatcher in `index.ts` updated with new `if` branch
- [ ] Error message in dispatcher updated
- [ ] `.env.example` updated
- [ ] Tests written and passing
