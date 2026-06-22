# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:

- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:

- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

---

## Project

A GitHub **template repository** for bootstrapping AI SaaS projects: a working Next.js 15 app + a `create-ai-template` CLI wizard + BMAD/GSD agent tooling + a full CI/CD + auto-bugfix pipeline that downstream projects inherit.

**Stack:** Next.js 15 (App Router, React 19) · TypeScript (strict) · Tailwind v4 + shadcn/ui · Zod · Vitest (unit) + Playwright (e2e) · Biome (lint/format) · PostgreSQL.
Auth (Better Auth | Clerk) and ORM (Prisma | Drizzle) are **wizard-selectable alternatives, not both active at once** — check the active config before editing `src/lib/auth.ts` or `src/lib/db.ts`.

**Orientation:** read [.planning/PROJECT-MAP.md](.planning/PROJECT-MAP.md) first — it explains signal vs. noise. ~95% of tracked files are AI-agent scaffolding (`_bmad/`, `.claude/`, `.gemini/`, `.agent/`, `.opencode/`, `.planning/`); treat those as vendored — don't audit unless asked. The real project is `src/` (app), `wizard/` (separate package), `.github/workflows/`, `prisma/`, `scripts/`, `e2e/`.

### Web UI (`src/app/`)

- `/` — public landing: **Skill Chooser** (hero + panel) and Dev Setup Helper strip
- `/sign-in`, `/sign-up` — auth pages (`(auth)` route group)
- `/dashboard` — protected; shell in `src/components/shared/` (Sidebar, Navbar, DashboardHeader)

### Commands

```bash
npm run dev            # Next.js dev (Turbopack)
npm run build          # production build
npm run lint           # biome check src/   (NOT eslint)
npm run lint:fix       # biome check --write src/  (auto-fix)
npm run test           # vitest (watch)
npm run test:coverage  # vitest run --coverage  (85%/80% gate)
npm run type-check     # tsc --noEmit
npm run db:seed        # tsx prisma/seed.ts
npm run verify:bmad    # confirm BMAD agents present
npm run template:update# pull latest template scaffolding into a downstream repo
```

### Gotchas

- `npm run dev` serves on `http://localhost:3000`, but falls back to `3001` if 3000 is busy.
- **`npm ci --legacy-peer-deps` is required** everywhere (better-auth ↔ drizzle-kit peer conflict). Plain `npm ci` fails.
- Lint/format is **Biome**, not ESLint — ignore any stray ESLint references.
- CI build needs stub env (`SKIP_ENV_VALIDATION=1` + stub `DATABASE_URL`/`NEXTAUTH_*`).
- `CHANGELOG.md` is **auto-generated** by `conventional-changelog` on release — never hand-edit it.
- `.bak` twins (`auth.ts.bak`, `db.ts.bak`, …) are pre-existing wizard leftovers — not yours to delete.
- Tests are co-located: `src/foo.ts` → `src/foo.test.ts` / `__tests__/`.
