---
name: add-inngest-function
description: "Create a new Inngest background job function. Use when the user says 'add a background job', 'create an Inngest function', 'run [task] asynchronously', or 'schedule [task]'."
---

# Add an Inngest Function

Inngest handles background jobs, scheduled tasks, and event-driven workflows. Adding a function requires two steps: creating the function file and registering it in the API route.

## Architecture

```
src/inngest/
  client.ts                      ← shared Inngest client (do not modify)
  functions/
    hello-world.ts               ← example function
    <your-function>.ts           ← add new functions here
src/app/api/inngest/route.ts     ← register ALL functions here
```

## Step 1 — Create the Function

Create `src/inngest/functions/<your-function>.ts`:

```typescript
import { inngest } from '../client';

// Define your event payload type inline
interface YourEventData {
  userId: string;
  // ...other fields
}

export const yourFunction = inngest.createFunction(
  { id: 'your-function-id' }, // unique kebab-case ID
  { event: 'your-domain/event.name' }, // event name to trigger on
  async ({ event, step }) => {
    // Use step.run() for any work you want retried independently
    const result = await step.run('fetch-user', async () => {
      const data = event.data as YourEventData;
      return await db.user.findUnique({ where: { id: data.userId } });
    });

    // step.sleep() for delays
    await step.sleep('wait-before-notify', '5s');

    // Multiple steps run sequentially and each is individually retried on failure
    await step.run('send-notification', async () => {
      // send email, push notification, etc.
    });

    return { success: true, userId: (event.data as YourEventData).userId };
  }
);
```

### Step Rules

- Use `step.run('descriptive-name', async () => { ... })` for every distinct unit of work.
- Step names must be unique within a function and should be human-readable (shown in Inngest DevServer).
- `event.data` is `unknown` — always cast it to your typed interface.
- Return value is stored and visible in Inngest DevServer logs — return something useful.

### Event Naming Convention

```
<domain>/<noun>.<verb>
demo/hello.world        ← example
user/account.created    ← user domain
payment/invoice.paid    ← payment domain
email/digest.requested  ← email domain
```

## Step 2 — Register in the API Route

Edit `src/app/api/inngest/route.ts` — add your function to the `functions` array:

```typescript
import { serve } from 'inngest/next';
import { inngest } from '../../../inngest/client';
import { helloWorld } from '../../../inngest/functions/hello-world';
import { yourFunction } from '../../../inngest/functions/<your-function>'; // ← add

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    helloWorld,
    yourFunction, // ← add
  ],
});
```

## Step 3 — Trigger the Function (from a Server Action or API Route)

```typescript
import { inngest } from '@/inngest/client';

// In a server action or route handler:
await inngest.send({
  name: 'your-domain/event.name',
  data: {
    userId: '123',
    // ...matches YourEventData
  },
});
```

## Step 4 — Write Tests

Create `src/inngest/__tests__/<your-function>.test.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { yourFunction } from '../functions/<your-function>';

// Inngest functions expose a .run() helper for testing
describe('yourFunction', () => {
  it('processes event and returns success', async () => {
    const mockStep = {
      run: vi.fn().mockImplementation((_name: string, fn: () => unknown) => fn()),
      sleep: vi.fn().mockResolvedValue(undefined),
    };

    const result = await yourFunction.run({
      event: { name: 'your-domain/event.name', data: { userId: 'u1' } },
      step: mockStep as never,
    });

    expect(result).toEqual({ success: true, userId: 'u1' });
  });
});
```

## Local Development

Start the Inngest DevServer to test functions locally:

```bash
npx inngest-cli@latest dev
```

Trigger events via the DevServer UI at `http://localhost:8288`.

## Checklist

- [ ] Function file created in `src/inngest/functions/`
- [ ] Event payload typed as an interface
- [ ] Each unit of work wrapped in `step.run()`
- [ ] Function ID is unique kebab-case
- [ ] Event name follows `domain/noun.verb` convention
- [ ] Registered in `src/app/api/inngest/route.ts`
- [ ] `inngest.send()` call added at trigger point
- [ ] Tests written and passing
