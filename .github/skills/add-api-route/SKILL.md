---
name: add-api-route
description: "Add a new Next.js API route with rate limiting applied. Use when the user says 'add an API endpoint', 'create a route for [feature]', or 'expose [feature] as an API'."
---

# Add an API Route

All API routes in this project automatically receive rate limiting from the middleware (100 req/min per IP). For routes needing tighter limits, apply a custom limiter directly in the handler.

## Architecture

```
src/app/api/
  inngest/route.ts        ← Inngest webhook (do not modify)
  ai/chat/route.ts        ← AI chat endpoint (reference example)
  <feature>/route.ts      ← add new routes here
```

## Step 1 — Create the Route Handler

Create `src/app/api/<feature>/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(_request: NextRequest) {
  // implementation
  return NextResponse.json({ data: [] });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { field?: unknown };

    // Validate input — always validate before using
    if (!body.field) {
      return NextResponse.json({ error: 'field is required' }, { status: 400 });
    }

    const result = /* your logic */ null;
    return NextResponse.json({ data: result }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

## Step 2 — Add Custom Rate Limiting (if needed)

For routes that need stricter limits than the global 100 req/min:

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createRateLimit } from '@/lib/rate-limit';

// Stricter limit — e.g. 10 requests per minute for expensive operations
const routeRateLimit = createRateLimit({ limit: 10, window: '1 m' });

export async function POST(request: NextRequest) {
  const { success } = await routeRateLimit(request);
  if (!success) {
    return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
  }

  // ... rest of handler
}
```

### `createRateLimit` Options

| Option   | Type       | Default | Description                             |
| -------- | ---------- | ------- | --------------------------------------- |
| `limit`  | `number`   | `100`   | Max requests per window                 |
| `window` | `Duration` | `'1 m'` | Time window (`'1 s'`, `'1 m'`, `'1 h'`) |

> When `UPSTASH_REDIS_REST_URL` is not set, rate limiting is a no-op — all requests pass through. This is intentional for local dev.

## Step 3 — Response Conventions

| Situation         | Status | Body                                 |
| ----------------- | ------ | ------------------------------------ |
| Success (read)    | 200    | `{ data: ... }`                      |
| Success (created) | 201    | `{ data: ... }`                      |
| Validation error  | 400    | `{ error: 'human message' }`         |
| Unauthorized      | 401    | `{ error: 'Unauthorized' }`          |
| Rate limited      | 429    | `{ error: 'Too Many Requests' }`     |
| Server error      | 500    | `{ error: 'Internal server error' }` |

Never expose internal error details, stack traces, or DB error messages in responses.

## Step 4 — Write Tests

Create `src/app/api/<feature>/__tests__/route.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { GET, POST } from '../route';

function makeRequest(body?: unknown): Request {
  return new Request('http://localhost/api/<feature>', {
    method: body ? 'POST' : 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
}

describe('GET /api/<feature>', () => {
  it('returns 200 with data array', async () => {
    const res = await GET(makeRequest() as never);
    expect(res.status).toBe(200);
    const json = (await res.json()) as { data: unknown };
    expect(Array.isArray(json.data)).toBe(true);
  });
});

describe('POST /api/<feature>', () => {
  it('returns 400 for missing field', async () => {
    const res = await POST(makeRequest({}) as never);
    expect(res.status).toBe(400);
  });
});
```

## Checklist

- [ ] Route file at `src/app/api/<feature>/route.ts`
- [ ] Only exports named HTTP method handlers (`GET`, `POST`, etc.)
- [ ] Input validated before use
- [ ] Custom rate limiter applied if endpoint is expensive
- [ ] Error responses never leak internal details
- [ ] Response status codes follow the conventions table
- [ ] Tests written and passing
