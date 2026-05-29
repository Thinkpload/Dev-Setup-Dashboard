---
name: add-server-action
description: "Add a new Next.js server action following the project's Zod + ActionResult pattern. Use when the user says 'add a server action', 'create an action for [feature]', or needs a new form/mutation handler."
---

# Add a Server Action

This project's server actions follow a strict pattern: validate with Zod, return `ActionResult<T>`, never throw to the client.

## Pattern Contract

```
src/lib/validations/<feature>.schema.ts   ← Zod schema + inferred types
src/actions/<feature>.actions.ts          ← 'use server' functions
src/actions/<feature>.actions.test.ts     ← Vitest unit tests
```

## Step 1 — Write the Zod Schema

Create or extend `src/lib/validations/<feature>.schema.ts`:

```typescript
import { z } from 'zod';

export const myFeatureSchema = z.object({
  // fields with user-facing error messages
  email: z.string().email('Valid email required'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

export type MyFeatureInput = z.infer<typeof myFeatureSchema>;
```

Rules:

- Every `.min()`, `.max()`, `.email()` etc. must include a human-readable message string.
- Export both the schema and its inferred type.

## Step 2 — Write the Action

Create `src/actions/<feature>.actions.ts`:

```typescript
'use server';

import { myFeatureSchema } from '@/lib/validations/<feature>.schema';
import type { ActionResult } from '@/types';

export async function myFeatureAction(data: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    const parsed = myFeatureSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0].message };
    }

    // implementation here — DB call, external API, etc.
    const result = await db.something.create({ data: parsed.data });

    return { success: true, data: { id: result.id } };
  } catch {
    // Never leak internal error details to the client
    return { success: false, error: 'Something went wrong. Please try again.' };
  }
}
```

Rules:

- Always accept `data: unknown` — never a typed param — to force Zod validation.
- Always return `ActionResult<T>` — never throw.
- Catch block must return a generic message, never `error.message` from external sources.
- Import path for types: `@/types` (resolves to `src/types/index.ts`).

## Step 3 — Write Tests

Create `src/actions/<feature>.actions.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { myFeatureAction } from './myFeature.actions';

describe('myFeatureAction', () => {
  it('returns error for invalid input', async () => {
    const result = await myFeatureAction({ email: 'bad' });
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it('returns success for valid input', async () => {
    const result = await myFeatureAction({ email: 'a@b.com', name: 'Alice' });
    expect(result.success).toBe(true);
  });
});
```

Run tests: `pnpm vitest run src/actions/<feature>.actions.test.ts`

## Checklist

- [ ] Zod schema created in `src/lib/validations/`
- [ ] Schema types exported
- [ ] Action file has `'use server'` directive at top
- [ ] `data: unknown` parameter (not typed)
- [ ] Uses `safeParse`, not `parse`
- [ ] Catch block returns generic message
- [ ] Tests written and passing
