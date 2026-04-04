import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock @sentry/nextjs before importing sentry module
vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
  init: vi.fn(),
}));

describe('src/lib/sentry.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('re-exports Sentry from @sentry/nextjs', async () => {
    const { Sentry } = await import('../sentry');
    expect(Sentry).toBeDefined();
    expect(typeof Sentry.captureException).toBe('function');
  });

  it('captureException is callable without throwing', async () => {
    const { Sentry } = await import('../sentry');
    expect(() => Sentry.captureException(new Error('test'))).not.toThrow();
  });
});
