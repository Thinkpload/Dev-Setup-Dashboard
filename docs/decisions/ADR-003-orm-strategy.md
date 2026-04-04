# ADR-003: ORM Strategy

**Date:** 2026-04-04
**Status:** Accepted

## Context

ORM choice significantly impacts developer experience, type safety, migration workflow, and runtime performance. A starter template must choose a sensible default while remaining swappable for teams with strong preferences. The two primary contenders are Prisma (mature, schema-first, excellent DX) and Drizzle (lightweight, SQL-first, faster runtime). Both have strong TypeScript support.

The template targets beginner-to-intermediate developers as primary users, making developer ergonomics and documentation quality key selection factors alongside technical performance.

## Decision

Prisma is the default ORM. It offers the best developer experience for onboarding, a rich ecosystem of integrations, a visual schema editor (Prisma Studio), and battle-tested migration tooling. The schema lives at `prisma/schema.prisma`. Migrations are managed via `prisma migrate dev` (development) and `prisma migrate deploy` (production). Drizzle is available as a swappable alternative via the CLI wizard (`wizard/src/steps/orm.ts`).

## Consequences

**Positive:**

- Prisma's intuitive schema syntax reduces the learning curve for developers new to ORMs.
- `prisma migrate` provides a reliable, auditable migration history in `prisma/migrations/`.
- Prisma Studio enables visual database inspection without external tools during development.
- Rich ecosystem: integrations with Supabase, PlanetScale, Neon, Railway, and others.

**Negative:**

- Prisma's query engine adds runtime overhead (Rust binary) compared to Drizzle's zero-overhead approach.
- Prisma Client generation step (`prisma generate`) required after schema changes.
- Drizzle's SQL-first approach may be preferred by teams with strong SQL expertise.

**How to swap to Drizzle:**
Run the CLI wizard and select Drizzle at the ORM step. The wizard modifies `wizard/src/steps/orm.ts`, installs Drizzle dependencies, removes Prisma, and scaffolds the Drizzle schema. Follow the guide in `docs/guides/choosing-orm.md`.

## Alternatives Considered

| Option                           | Reason Not Chosen                                                                                                    |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Drizzle                          | Steeper learning curve for beginners; less documentation and ecosystem at time of decision; no built-in migration UI |
| Raw SQL (node-postgres / mysql2) | No type safety; too much boilerplate for a starter template                                                          |
| Kysely                           | Niche adoption; less beginner-friendly; smaller community for support                                                |
| TypeORM                          | Aging codebase; decorator-heavy API conflicts with Next.js App Router server components                              |
