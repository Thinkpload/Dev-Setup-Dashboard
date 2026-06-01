import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock inngest before importing client
vi.mock('inngest', () => ({
  Inngest: class {
    id: string;
    constructor(config: { id: string }) {
      this.id = config.id;
    }
  },
}));

describe('src/inngest/client.ts', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    vi.resetModules();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('uses INNGEST_APP_NAME env var when set', async () => {
    process.env.INNGEST_APP_NAME = 'my-custom-app';
    const { inngest } = await import('../client');
    expect((inngest as unknown as { id: string }).id).toBe('my-custom-app');
  });

  it('falls back to template-bmad-app when INNGEST_APP_NAME is not set', async () => {
    delete process.env.INNGEST_APP_NAME;
    const { inngest } = await import('../client');
    expect((inngest as unknown as { id: string }).id).toBe('template-bmad-app');
  });
});
