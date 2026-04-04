# ADR-002: Auth Strategy

**Date:** 2026-04-04
**Status:** Accepted

## Context

Authentication is the most frequently swapped component in web application templates. Choosing a default auth library directly impacts developer experience, vendor lock-in risk, and time-to-production. The template must support a default that works out of the box while remaining swappable via the CLI wizard for teams with different requirements.

Key options evaluated: Better Auth (self-hosted, open-source, native Next.js App Router support), Clerk (managed SaaS, excellent DX but vendor lock-in and cost at scale), NextAuth/Auth.js (mature but complex configuration, less actively maintained for App Router at time of decision), custom JWT (maximum control but maximum boilerplate).

## Decision

Better Auth is the default authentication provider. It is open-source, self-hosted, has zero vendor lock-in, and provides first-class Next.js App Router integration with TypeScript support. The CLI wizard (`wizard/src/steps/auth.ts`) exposes Clerk as a swappable alternative for teams that prefer a managed solution.

## Consequences

**Positive:**

- No vendor lock-in — auth data stays in the project's own database.
- Open-source with an active community; no SaaS cost at any scale.
- Full type safety with TypeScript; aligns with the project's type-first philosophy.
- Wizard swap path keeps the template flexible for teams that prefer Clerk.

**Negative:**

- Self-hosting auth means the team is responsible for session management, email providers, and security patches.
- Clerk's pre-built UI components (sign-in widget, etc.) are not available in the default setup.
- Swapping auth after initial setup requires careful migration of session tokens and user records.

**How to swap to Clerk:**
Run the CLI wizard and select Clerk at the auth step. The wizard modifies `wizard/src/steps/auth.ts`, installs the Clerk SDK, and removes Better Auth dependencies. Follow the migration guide in `docs/guides/choosing-auth.md`.

## Alternatives Considered

| Option             | Reason Not Chosen                                                                          |
| ------------------ | ------------------------------------------------------------------------------------------ |
| Clerk              | Vendor lock-in; cost scales with MAU; data stored on third-party infrastructure            |
| NextAuth / Auth.js | Less actively maintained for Next.js App Router at time of decision; complex adapter setup |
| Custom JWT         | Excessive boilerplate for a starter template; high risk of security misconfigurations      |
| Supabase Auth      | Couples the template to Supabase's infrastructure; reduces flexibility                     |
