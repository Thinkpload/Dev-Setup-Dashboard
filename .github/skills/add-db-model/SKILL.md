---
name: add-db-model
description: "Add a new Prisma database model with migration and seed data. Use when the user says 'add a [entity] table', 'create a database model for [feature]', or 'add [entity] to the schema'."
---

# Add a Database Model

The project uses Prisma ORM with PostgreSQL. New models go in `prisma/schema.prisma`, followed by a migration and optional seed data.

## Architecture

```
prisma/
  schema.prisma    ← all models defined here
  migrations/      ← auto-generated migration files (do not hand-edit)
  seed.ts          ← optional seed data for development
src/lib/
  db.ts            ← Prisma client singleton (PrismaClient)
  db.drizzle.ts    ← Drizzle client (used by Better Auth only — do not use for new models)
```

> **Important:** Use `db` from `src/lib/db.ts` (PrismaClient) for all application code. `db.drizzle.ts` is for Better Auth internals only.

## Step 1 — Define the Model

Edit `prisma/schema.prisma`. Add your model after the existing models:

```prisma
model Post {
  id        String   @id @default(cuid())
  title     String
  content   String?
  published Boolean  @default(false)
  authorId  String
  author    User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("post")   // snake_case table name
}
```

### Field Conventions

| Concern         | Convention                                                  |
| --------------- | ----------------------------------------------------------- |
| Primary key     | `id String @id @default(cuid())`                            |
| Timestamps      | Always include `createdAt` and `updatedAt`                  |
| Table name      | `@@map("snake_case_name")` — always lowercase               |
| Foreign keys    | `onDelete: Cascade` for child records, `Restrict` otherwise |
| Optional fields | Use `?` — prefer explicit nullability over omission         |

If adding a relation back-reference on `User`, add the field to the `User` model too:

```prisma
model User {
  // ...existing fields...
  posts    Post[]   // ← add back-relation
}
```

## Step 2 — Create a Migration

```bash
pnpm prisma migrate dev --name add-post-model
```

This generates a new file under `prisma/migrations/` and applies it to the local database.

For CI / production:

```bash
pnpm prisma migrate deploy
```

## Step 3 — Regenerate the Client

Migrations run `prisma generate` automatically. If you only edited the schema without migrating:

```bash
pnpm prisma generate
```

## Step 4 — Use in Application Code

Import from `@/lib/db`:

```typescript
import { db } from '@/lib/db';

// In a server action or route handler:
const post = await db.post.create({
  data: {
    title: 'Hello',
    authorId: session.user.id,
  },
});

const posts = await db.post.findMany({
  where: { published: true },
  orderBy: { createdAt: 'desc' },
});
```

## Step 5 — (Optional) Add Seed Data

Edit `prisma/seed.ts`:

```typescript
import { db } from '../src/lib/db';

async function main() {
  // Existing seed code...

  // Add your seed:
  await db.post.upsert({
    where: { id: 'seed-post-1' },
    update: {},
    create: {
      id: 'seed-post-1',
      title: 'Sample Post',
      authorId: seedUser.id,
      published: true,
    },
  });
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
```

Run seed:

```bash
pnpm prisma db seed
```

## Checklist

- [ ] Model added to `prisma/schema.prisma`
- [ ] `@@map("snake_case")` present
- [ ] `id`, `createdAt`, `updatedAt` fields included
- [ ] Back-relations added on related models
- [ ] Migration created: `pnpm prisma migrate dev --name <descriptive-name>`
- [ ] Client regenerated (happens automatically with `migrate dev`)
- [ ] Application code uses `db` from `@/lib/db` (not `db.drizzle`)
- [ ] Seed data added for development if applicable
- [ ] `db.$disconnect()` called in any standalone scripts
