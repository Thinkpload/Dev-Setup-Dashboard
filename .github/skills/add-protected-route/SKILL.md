---
name: add-protected-route
description: "Protect a new page route behind authentication using the middleware. Use when the user says 'protect [route]', 'require login for [page]', or 'add auth guard to [path]'."
---

# Add a Protected Route

Route protection is centralised in `src/middleware.ts`. The middleware checks for a `better-auth.session_token` cookie and either allows or redirects the request — no per-page auth checks needed.

## How It Works

```
Request → middleware.ts
  └─ /api/*           → rate-limit check (100 req/min), then pass through
  └─ PROTECTED_PATHS  → redirect to /sign-in if no session cookie
  └─ AUTH_PATHS       → redirect to /dashboard if already authenticated
  └─ everything else  → pass through
```

The session cookie is named `better-auth.session_token` and is set by Better Auth on sign-in.

## Step 1 — Add to PROTECTED_PATHS

Edit `src/middleware.ts`:

```typescript
const PROTECTED_PATHS = [
  '/dashboard',
  '/settings', // ← add your path here (prefix match)
];
```

Matching is **prefix-based** (`pathname.startsWith(p)`), so `/settings` protects `/settings`, `/settings/profile`, `/settings/billing`, etc.

For exact matches only, change the guard:

```typescript
// Exact match instead of prefix:
if (PROTECTED_PATHS.includes(pathname) && !sessionToken) {
```

## Step 2 — (Optional) Add to AUTH_PATHS

If the new path is also an auth page (i.e. already-logged-in users should be bounced away from it):

```typescript
const AUTH_PATHS = [
  '/sign-in',
  '/sign-up',
  '/forgot-password', // ← example: add if you create this page
];
```

## Step 3 — Create the Page

Create `src/app/<your-route>/page.tsx`. No auth check needed inside the component — the middleware already guarantees a session exists:

```typescript
export default function YourPage() {
  // Safe — middleware guarantees session cookie is present
  return <main>Protected content</main>;
}
```

If you need the session user object inside a Server Component:

```typescript
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export default async function YourPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  // session.user is available here
  return <main>Hello {session?.user.name}</main>;
}
```

## Current Protected Paths (reference)

| Path         | Type      | Redirects to if no session |
| ------------ | --------- | -------------------------- |
| `/dashboard` | Protected | `/sign-in`                 |

| Path       | Type | Redirects to if authenticated |
| ---------- | ---- | ----------------------------- |
| `/sign-in` | Auth | `/dashboard`                  |
| `/sign-up` | Auth | `/dashboard`                  |

## Checklist

- [ ] Path string added to `PROTECTED_PATHS` in `src/middleware.ts`
- [ ] Prefix vs. exact match considered — adjust guard logic if needed
- [ ] If also an auth page, added to `AUTH_PATHS`
- [ ] Page component created at matching `src/app/` path
- [ ] Middleware `matcher` pattern in `config` does not accidentally exclude your path (it already excludes `_next/*` and `favicon.ico`)
- [ ] Manual test: unauthenticated visit redirects to `/sign-in`
- [ ] Manual test: authenticated visit loads the page
