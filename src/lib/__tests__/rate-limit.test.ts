import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { NextRequest } from 'next/server';

function mockRequest(ip?: string): NextRequest {
  const headers = new Headers();
  if (ip) headers.set('x-forwarded-for', ip);
  return { headers } as unknown as NextRequest;
}

describe('createRateLimit — no-op when redis is null', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.doMock('../redis', () => ({ redis: null }));
  });

  it('always returns success: true when redis is null', async () => {
    const { createRateLimit } = await import('../rate-limit');
    const check = createRateLimit();
    const result = await check(mockRequest());
    expect(result.success).toBe(true);
  });

  it('returns configured limit in response even in no-op mode', async () => {
    const { createRateLimit } = await import('../rate-limit');
    const check = createRateLimit({ limit: 50 });
    const result = await check(mockRequest());
    expect(result.limit).toBe(50);
    expect(result.remaining).toBe(50);
  });

  it('uses default limit 100 when no options provided', async () => {
    const { createRateLimit } = await import('../rate-limit');
    const check = createRateLimit();
    const result = await check(mockRequest());
    expect(result.limit).toBe(100);
  });
});

describe('createRateLimit — with live redis mock', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('extracts IP from x-forwarded-for header', async () => {
    const limitFn = vi
      .fn()
      .mockResolvedValue({ success: true, limit: 100, remaining: 99, reset: 0 });
    vi.doMock('@upstash/ratelimit', () => ({
      Ratelimit: Object.assign(
        vi.fn().mockImplementation(() => ({ limit: limitFn })),
        { slidingWindow: vi.fn().mockReturnValue('sliding') }
      ),
    }));
    vi.doMock('../redis', () => ({ redis: { type: 'mock' } }));

    const { createRateLimit } = await import('../rate-limit');
    const check = createRateLimit({ limit: 100, window: '1 m' });
    await check(mockRequest('192.168.1.1, 10.0.0.1'));

    expect(limitFn).toHaveBeenCalledWith('192.168.1.1');
  });

  it('falls back to 127.0.0.1 when no x-forwarded-for header', async () => {
    const limitFn = vi
      .fn()
      .mockResolvedValue({ success: true, limit: 100, remaining: 99, reset: 0 });
    vi.doMock('@upstash/ratelimit', () => ({
      Ratelimit: Object.assign(
        vi.fn().mockImplementation(() => ({ limit: limitFn })),
        { slidingWindow: vi.fn().mockReturnValue('sliding') }
      ),
    }));
    vi.doMock('../redis', () => ({ redis: { type: 'mock' } }));

    const { createRateLimit } = await import('../rate-limit');
    const check = createRateLimit();
    await check(mockRequest());

    expect(limitFn).toHaveBeenCalledWith('127.0.0.1');
  });

  it('returns 429-compatible shape when limit exceeded', async () => {
    const limitFn = vi
      .fn()
      .mockResolvedValue({ success: false, limit: 100, remaining: 0, reset: Date.now() + 60000 });
    vi.doMock('@upstash/ratelimit', () => ({
      Ratelimit: Object.assign(
        vi.fn().mockImplementation(() => ({ limit: limitFn })),
        { slidingWindow: vi.fn().mockReturnValue('sliding') }
      ),
    }));
    vi.doMock('../redis', () => ({ redis: { type: 'mock' } }));

    const { createRateLimit } = await import('../rate-limit');
    const check = createRateLimit({ limit: 100 });
    const result = await check(mockRequest('1.2.3.4'));

    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });
});
