import { Redis } from '@upstash/redis';

let redis: Redis | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
} else {
  console.warn('[redis] UPSTASH_REDIS_REST_URL not set — rate limiting disabled (no-op mode)');
}

export { redis };
