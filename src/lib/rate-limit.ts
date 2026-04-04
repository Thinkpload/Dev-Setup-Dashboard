import { Ratelimit, type Duration } from '@upstash/ratelimit';
import { redis } from './redis';
import type { NextRequest } from 'next/server';

interface RateLimitOptions {
  limit?: number;
  window?: Duration;
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export function createRateLimit(options: RateLimitOptions = {}) {
  const { limit = 100, window = '1 m' as Duration } = options;

  if (!redis) {
    return async (_req: NextRequest): Promise<RateLimitResult> => ({
      success: true,
      limit,
      remaining: limit,
      reset: 0,
    });
  }

  const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, window),
  });

  return async (req: NextRequest): Promise<RateLimitResult> => {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1';
    const result = await ratelimit.limit(ip);
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  };
}
