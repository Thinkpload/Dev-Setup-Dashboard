import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock @upstash/redis to avoid real HTTP calls
vi.mock('@upstash/redis', () => ({
  Redis: class {
    type = 'mock-redis';
  },
}));

describe('redis singleton', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('exports null when UPSTASH_REDIS_REST_URL is not set', async () => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    const { redis } = await import('../redis');
    expect(redis).toBeNull();
  });

  it('exports null when only UPSTASH_REDIS_REST_URL is set but not TOKEN', async () => {
    process.env.UPSTASH_REDIS_REST_URL = 'https://example.upstash.io';
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    const { redis } = await import('../redis');
    expect(redis).toBeNull();
  });

  it('exports Redis instance when both env vars are set', async () => {
    process.env.UPSTASH_REDIS_REST_URL = 'https://example.upstash.io';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token';
    const { redis } = await import('../redis');
    expect(redis).not.toBeNull();
  });

  it('logs a warning when env vars are missing', async () => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await import('../redis');
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('UPSTASH_REDIS_REST_URL not set'));
    warnSpy.mockRestore();
  });
});
