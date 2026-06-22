# Template: AI Dev + Auto CI/CD

[![CI](https://github.com/Thinkpload/Template-AI-dev-autoCI-CD/actions/workflows/ci.yml/badge.svg)](https://github.com/Thinkpload/Template-AI-dev-autoCI-CD/actions/workflows/ci.yml)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FThinkpload%2FTemplate-AI-dev-autoCI-CD)

> One command. Five questions. Production-ready AI dev environment.

A GitHub Template Repository for new SaaS projects. Ships with **BMAD Method v6** agent workflows, an interactive CLI wizard, a full **CI/CD quality pipeline**, and a self-healing **auto-bugfix** system out of the box.

---

## What's included

| Layer              | Tool                                 | Purpose                                     |
| ------------------ | ------------------------------------ | ------------------------------------------- |
| App Framework      | Next.js 15 + React 19                | App Router, RSC, Server Actions             |
| Styling            | Tailwind CSS v4 + shadcn/ui          | Direction D purple theme, dark mode default |
| Auth               | Better Auth / Clerk (your choice)    | Self-hosted or managed auth                 |
| ORM                | Prisma / Drizzle (your choice)       | Schema-first or code-first DB               |
| Database           | PostgreSQL (Neon prod, Docker local) | Serverless-ready                            |
| AI Workflows       | BMAD Method v6                       | PM, Architect, Dev, QA, SM agents           |
| CI/CD              | GitHub Actions                       | Lint → Test → SonarCloud → Build            |
| Auto Bugfix        | `/fix-issue <N>` in Claude Code      | AI-generated fix PR on CI failure           |
| Dependency Updates | Renovate                             | Weekly grouped PRs, automerge               |
| Security           | CodeQL + npm audit + license scan    | Automated on every push                     |

---

## Quick Start

### 1. Use this template

Click **"Use this template"** → **"Create a new repository"** on GitHub.

> **Repository Setup (maintainers only):** After creating the template repo, go to **Settings → General** and check **"Template repository"** to enable the "Use this template" button.

### 2. Run the interactive wizard

```bash
git clone https://github.com/Thinkpload/Template-AI-dev-autoCI-CD.git
cd Template-AI-dev-autoCI-CD
npx create-ai-template
```

The wizard will:

- Ask 5 questions with educational hints (AI methodology, auth, ORM, optional modules)
- Install only what you chose and remove the rest
- Show real-time progress per module
- Display next steps and auto-bugfix preview on success

Or use defaults non-interactively:

```bash
npx create-ai-template --yes
```

> Requires Node.js ≥ 20

### 3. Configure environment

```bash
cp .env.example .env
# Fill in your values — see comments in .env.example
```

### 4. Start local development

```bash
docker-compose up -d   # Start local PostgreSQL
npx prisma migrate dev # Apply initial schema
npm run dev            # Start Next.js on http://localhost:3000
```

### 5. Add GitHub Secrets

Go to **Settings → Secrets and variables → Actions**:

| Secret         | Where to get it                                                                 |
| -------------- | ------------------------------------------------------------------------------- |
| `SONAR_TOKEN`  | [sonarcloud.io](https://sonarcloud.io) → My Account → Security → Generate token |
| `GITHUB_TOKEN` | Provided automatically by GitHub Actions                                        |

---

## Demo App / Web UI

After `npm run dev`, the template ships a working demo app (dark theme, Tailwind v4 + shadcn/ui) so you can see the stack wired end-to-end. Routes live in `src/app/` (App Router).

### Pages

| Route | Access | What's there |
| ----- | ------ | ------------ |
| `/` | Public | Landing page: `Navbar` → **Skill Chooser** (hero + interactive panel) → **Helper feature strip** → footer |
| `/sign-in`, `/sign-up` | Public | Auth pages (`(auth)` route group, shared auth layout) |
| `/dashboard` | Protected | App shell (`Sidebar`, `Navbar`, `DashboardHeader`, `Breadcrumb`) with an `EmptyState` welcome — your starting canvas |

> The landing page renders at `http://localhost:3000` (falls back to `3001` if the port is busy).

### Skill Chooser (landing page)

The hero + panel are an interactive recommender. Pick three things and it suggests where to start:

- **Intent** — Shape a new idea · Build something quickly · Write a structured plan · Debug an issue · Review existing work
- **Guidance level** — Fast · Balanced · Rigorous
- **Project type** — Web app · API · AI feature · Brownfield improvement

It returns a recommended path, suggested starting point, and concrete next steps. The **Helper feature strip** below it maps those choices to setup lanes (new product → `npx create-ai-template`, brownfield → `systematic-debugging`, quality → `npm run verify:bmad`).

### API routes (`src/app/api/`)

| Route | Purpose |
| ----- | ------- |
| `POST /api/ai/chat` | Streaming AI chat over the provider abstraction (`src/lib/ai/` — Anthropic / OpenAI) |
| `/api/auth/[...all]` | Auth handler (Better Auth catch-all; replaced by Clerk if selected) |
| `/api/inngest` | Inngest background-job endpoint (`src/inngest/`) |

### Key UI source

- `src/components/features/` — `SkillChooserHero`, `SkillChooserPanel`, `HelperFeatureStrip`, `FeatureCard`, `GradientHero`, `CodeBlock`, `SetupStatusBadge` (data in `skill-chooser-data.ts`)
- `src/components/shared/` — `Navbar`, `Sidebar`, `DashboardHeader`, `Breadcrumb`, `EmptyState`
- `src/components/ui/` — shadcn/ui primitives (do not edit by hand)

---

## Auto-Bugfix Pipeline

The template's killer feature: when CI fails, a structured GitHub Issue is created automatically.

```
CI fails → GitHub Issue created (job + error log + SHA + branch)
         → Run /fix-issue <N> in Claude Code
         → AI reads the issue, applies a targeted fix
         → Opens a PR with [skip ci] commit (prevents infinite loop)
         → After 3 failed attempts → needs-human label, stops
```

### How to use `/fix-issue`

1. **CI fails** on a push or PR — the `auto-bugfix.yml` workflow creates a GitHub Issue labeled `auto-bugfix` with the failing job name, last 50 lines of the error log, commit SHA, and branch.
2. **Open the issue** in your GitHub repository and note the issue number (e.g., `#42`).
3. **Open Claude Code** in your project directory.
4. **Run the command:**
   ```
   /fix-issue 42
   ```
5. Claude Code reads the issue, locates the relevant code, applies the minimal fix, runs tests, commits with `[skip ci]`, and opens a PR targeting the failing branch.
6. **Review and merge** the PR if the fix looks correct.

**Safety mechanisms built in:**

- `[skip ci]` on fix commits prevents re-triggering the auto-bugfix loop.
- Bot actor guard in `auto-bugfix.yml` prevents Dependabot/Renovate from triggering new issues.
- After **3 failed fix attempts**, the issue is labeled `needs-human` and no further automated PRs are opened — a comment "Auto-fix limit reached. Manual investigation required." is posted.

---

## BMAD AI Agents

All 8 BMAD agents are available as slash commands immediately after cloning — no setup required:

| Agent        | Slash Command       | Role                       |
| ------------ | ------------------- | -------------------------- |
| Orchestrator | `/bmad-help`        | Routes tasks across agents |
| PM           | `/bmad-pm`          | PRD and planning           |
| Architect    | `/bmad-architect`   | Technical architecture     |
| UX Designer  | `/bmad-ux-designer` | UI/UX specifications       |
| Dev          | `/bmad-dev`         | Implementation guidance    |
| QA           | `/bmad-qa`          | Testing strategy           |
| Scrum Master | `/bmad-sm`          | Sprint planning            |
| Tech Writer  | `/bmad-tech-writer` | Documentation              |

**Config auto-detection:** Each agent reads project context from `_bmad/bmm/config.yaml` (checked into the repo). No manual configuration needed after cloning.

**Team consistency:** Because `_bmad/bmm/config.yaml` is shared via version control, all developers on the same team get identical agent behaviour — same architecture patterns, same reasoning, same project context.

To verify all agents are present after cloning:

```bash
npm run verify:bmad
```

---

## Copilot Skills

The repository ships with GitHub Copilot skills for every major development pattern. These are loaded automatically when working in VS Code with GitHub Copilot.

| Skill | Trigger phrase | What it does |
| ----- | -------------- | ------------ |
| `add-server-action` | "add a server action" | Zod schema → `ActionResult<T>` → `'use server'` function |
| `add-ai-provider` | "add [LLM] support" | Provider module → dispatcher → env var |
| `add-inngest-function` | "add a background job" | Function file → registration → `inngest.send()` |
| `add-api-route` | "add an API endpoint" | Route handler → rate limiting → response conventions |
| `add-protected-route` | "protect [route]" | `PROTECTED_PATHS` in middleware |
| `add-db-model` | "add a [entity] table" | Prisma schema → migration → seed |
| `add-ci-cd-pipeline` | "add CI/CD pipeline" | CI checks, auto-issues, hotfixes, releases |

Skills live in `.github/skills/` and follow the project's exact file paths, naming conventions, and code patterns.

---

## Project Structure

```
your-project/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/             # Sign-in / Sign-up
│   │   ├── dashboard/          # Protected dashboard
│   │   └── api/                # Route Handlers
│   ├── components/
│   │   ├── ui/                 # shadcn/ui (do not edit)
│   │   └── shared/             # Shared components
│   ├── lib/
│   │   ├── db.ts               # Database client (Prisma or Drizzle)
│   │   ├── auth.ts             # Auth configuration
│   │   ├── validations/        # Zod schemas
│   │   └── utils/              # Utility functions
│   ├── actions/                # Server Actions
│   ├── hooks/                  # Custom React hooks
│   └── stores/                 # Zustand stores
├── prisma/                     # Prisma schema + migrations
├── drizzle/                    # Drizzle schema (removed if Prisma chosen)
├── e2e/                        # Playwright E2E tests
├── docs/
│   ├── decisions/              # Architecture Decision Records (ADRs)
│   └── guides/                 # Integration + migration guides
├── wizard/                     # npx create-ai-template package
├── _bmad/                      # BMAD agents & config
├── .github/workflows/          # CI/CD pipelines
├── .env.example                # Environment variable template
└── setup.sh                    # Passthrough to wizard
```

---

## CI/CD Pipeline

**Triggers:** push or PR to `main`

```
Checkout → Setup Node → npm ci → Security Audit → Lint → Tests + Coverage → SonarCloud → Build
                                                                                    ↓ (on failure)
                                                                       GitHub Issue auto-created
```

Coverage threshold: ≥ 85% (blocks merge if below).

---

## Keeping Your Project Updated

```bash
npm run template:update
```

- Fetches latest `_bmad/`, `.github/`, and root config improvements
- Runs `npm install` and full test suite automatically
- **MINOR versions:** always backward-compatible (your `src/` is never touched)
- **MAJOR versions:** migration guide provided, previous version tagged for rollback

See the full guide: [docs/guides/template-update.md](docs/guides/template-update.md)

---

## Deployment

### Vercel (one-click)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FThinkpload%2FTemplate-AI-dev-autoCI-CD)

Set `DATABASE_URL` to your Neon PostgreSQL connection string in Vercel environment variables.

### Self-hosted (AWS / GCP / fly.io)

See `docs/guides/deployment.md` for step-by-step guides.

---

## Releasing

Maintainers can publish a new release in three steps:

```bash
# Patch release (bug fixes only)
npm run release:patch

# Minor release (new features, backward compatible)
npm run release:minor

# Major release (breaking changes — prepare migration guide first)
npm run release:major
```

Each command bumps the version in `package.json`, pushes the commit, and pushes the tag. The `release.yml` workflow then auto-generates `CHANGELOG.md` and creates a GitHub Release with the changelog as release notes.

See [docs/guides/release-process.md](docs/guides/release-process.md) for the full weekly release checklist.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on submitting issues and PRs.

- Commit format: [Conventional Commits](https://www.conventionalcommits.org/)
- Test coverage: ≥ 85% required
- PR review: within 48 hours
