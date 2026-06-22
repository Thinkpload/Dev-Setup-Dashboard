# Project Map — Template: AI Dev + Auto CI/CD

> Orientation doc for Claude. What this repo is, where things live, and what's signal vs. noise.
> Last mapped: 2026-06-22 (branch `main`).

## What this is

A **GitHub Template Repository** for bootstrapping production-ready AI SaaS projects. It is itself a working Next.js app *and* ships a CLI wizard + AI agent tooling + a full CI/CD pipeline that downstream projects inherit. ~6,600 tracked files — but **~95% is AI-agent scaffolding** (see Noise below).

## Signal vs. Noise

**SIGNAL — the actual project (~250 files):**

| Path | What it is |
|------|-----------|
| `src/` (91) | The Next.js 15 / React 19 demo app (App Router) |
| `wizard/` (37) | `create-ai-template` CLI — the interactive scaffolder (separate package) |
| `.github/workflows/` (10) | The CI/CD + auto-bugfix pipeline (the "auto CI/CD" half) |
| `prisma/` | Schema, init migration, seed |
| `scripts/` (13) | Template-update, license/secret checks, changelog, BMAD verify |
| `e2e/` | Playwright specs (auth, dashboard, accessibility) |
| `docs/` | ADRs, guides, superpowers plans/specs |
| root configs | `package.json`, `next.config.ts`, `vitest.config.ts`, `biome.json`, `docker-compose.yml`, `sentry.*.config.ts`, `playwright.config.ts` |

**NOISE — AI tooling, treat as vendored/generated, don't audit unless asked:**
`_bmad/` (1310), `.claude/` (1300), `.gemini/` (1294), `.agent/` (1148), most of `.github/skills/`, `.opencode/`. These are BMAD Method + GSD + skill packs replicated per AI host. `.planning/` is GSD state.

## Stack

- **Framework:** Next.js 15 (App Router, RSC, Server Actions) + React 19, Turbopack dev
- **Styling:** Tailwind v4 + shadcn/ui (`src/components/ui/`), dark-mode default
- **Auth:** Better Auth (default) *or* Clerk — wizard-selectable. `src/lib/auth.ts`
- **ORM:** Prisma (default) *or* Drizzle — wizard-selectable. `src/lib/db.ts` / `db.drizzle.ts`
- **DB:** PostgreSQL (Neon prod / Docker local via `docker-compose.yml`)
- **AI:** `src/lib/ai/` provider abstraction over `anthropic.ts` + `openai.ts`; chat route at `src/app/api/ai/chat/route.ts`
- **Jobs:** Inngest (`src/inngest/`, route `src/app/api/inngest/route.ts`)
- **Infra libs:** Upstash Redis + ratelimit (`src/lib/redis.ts`, `rate-limit.ts`), Sentry (`src/lib/sentry.ts`)
- **Lint/format:** Biome. **Tests:** Vitest (unit, 85%/80% coverage gate) + Playwright (e2e)
- **Validation:** Zod (`src/lib/validations/`)

> Note: `.bak` twins exist for several files (`auth.ts.bak`, `db.ts.bak`, `tsconfig.json.bak`, etc.) — wizard leftovers, pre-existing, not mine to delete.

## src/ layout

- `app/` — routes: `(auth)/sign-in|sign-up`, `dashboard/`, `api/{ai/chat,auth/[...all],inngest}`, root `page.tsx`, error/loading boundaries
- `components/` — `ui/` (shadcn primitives), `shared/` (Navbar, Sidebar, DashboardHeader…), `features/` (SkillChooser*, Autopilot, FeatureCard…)
- `lib/` — `ai/`, `auth.ts`, `db*.ts`, `redis.ts`, `rate-limit.ts`, `sentry.ts`, `validations/`, `utils.ts`
- `actions/` — server actions (`auth.actions.ts`)
- `inngest/`, `hooks/` (`useSidebar`), `stores/` (zustand), `types/`, `middleware.ts`
- Tests colocated in `__tests__/` dirs + `*.test.ts(x)`

## CI/CD pipeline (.github/workflows/)

- **ci.yml** — on push/PR to main: `lint` (biome + tsc + npm audit) → `test` (Node 20 & 22 matrix, coverage→artifact) → `sonarcloud` → `build` (stubbed env). Skips bot commits; cancels in-progress.
- **auto-bugfix.yml** — `workflow_run` after CI; on **failure** + non-bot actor, creates an `auto-bugfix` labelled issue from failed jobs. Pairs with `/fix-issue <N>` in Claude Code.
- Others: `codeql`, `dependency-review`, `dependabot-automerge`, `pr-check-tests`, `labeler`, `release`, `publish`, `version-check`. Renovate via `renovate.json`.

## Wizard (wizard/ — own package)

Entry `src/index.ts` → `wizard.ts` (5-question flow) → `config.ts` → `installer.ts`. Node ≥20 guard first. `registry.ts` + `templates/*` hold swappable modules (auth-better-auth/clerk, orm-prisma/drizzle, biome, husky, vitest, gsd, bmad, autopilot). Built with tsup. Has its own vitest tests in `wizard/tests/`.

## Commands

`npm run dev | build | lint | test | test:coverage | type-check | db:seed | template:update | verify:bmad`
Husky hooks: `.husky/commit-msg` (commitlint), `.husky/pre-commit` (lint-staged).

## Gotchas

- `npm ci --legacy-peer-deps` required everywhere (better-auth ↔ drizzle-kit peer conflict).
- CI build needs stub env (`SKIP_ENV_VALIDATION=1`, stub `DATABASE_URL`/`NEXTAUTH_*`).
- Auth & ORM each have two implementations; check which the active config selected before editing.
- Dashboard demo currently runs on port 3001 (3000 busy) per latest commit.
