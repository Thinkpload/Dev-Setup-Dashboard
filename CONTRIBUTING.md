# Contributing to !Template_BMAD+auto-CI-CD

Thank you for your interest in contributing! This guide covers everything you need to submit quality PRs and issues.

## Quick Start — Run the Project Locally

1. **Clone the repo**

   ```bash
   git clone https://github.com/Thinkpload/Template-BMAD-auto-CI-CD.git
   cd Template-BMAD-auto-CI-CD
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env and fill in required values
   ```

4. **Start the local database**

   ```bash
   docker-compose up -d
   ```

5. **Start the development server**
   ```bash
   npm run dev
   # App available at http://localhost:3000
   ```

## Commit Format

This project uses **[Conventional Commits](https://www.conventionalcommits.org)**.

Format: `type(scope): description`

| Type       | When to use                            |
| ---------- | -------------------------------------- |
| `feat`     | New feature                            |
| `fix`      | Bug fix                                |
| `chore`    | Maintenance, dependency updates        |
| `docs`     | Documentation only                     |
| `test`     | Adding or updating tests               |
| `refactor` | Code restructuring, no behavior change |
| `ci`       | CI/CD configuration changes            |

Examples:

```
feat(auth): add email verification flow
fix(ci): correct workflow trigger condition
docs: update local setup instructions
```

Commits are linted on push via `commitlint`. Non-conforming commits will be rejected.

## PR Process

1. **Fork** the repository and create a feature branch:

   ```bash
   git checkout -b feat/your-feature-name
   # or
   git checkout -b fix/issue-description
   ```

2. **Implement** your changes following the code standards below.

3. **Test** your changes:

   ```bash
   npm run lint
   npm run type-check
   npm test
   ```

4. **Open a Pull Request** against `main`. Fill in the PR template — especially the checklist.

5. **Code review** — a maintainer will review within 48 hours. Address all feedback.

6. **Merge** — once approved, a maintainer merges your PR.

## Test Requirements

- Test coverage **≥ 85%** (enforced by SonarCloud in CI)
- Run tests with: `npm test`
- Tests are **co-located** with source files: `src/foo.ts` → `src/foo.test.ts`
- Use **Vitest** for unit/integration tests, **Playwright** for E2E

PRs without tests for new logic will be asked to add them before merge.

## Code Standards

- **TypeScript strict mode** — no implicit `any`
- If you must disable a lint rule, add a comment explaining why:
  ```ts
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- external API has unknown shape
  ```
- **Naming**: `camelCase` for TypeScript, `snake_case` for database columns
- **No business logic in React components** — put it in `src/actions/` or `src/lib/`
- **No `console.log` in production code** — use structured logging
- ESLint config: [`eslint.config.mjs`](./eslint.config.mjs)

## Setting up NPM_TOKEN

The publish workflow (`.github/workflows/publish.yml`) requires an `NPM_TOKEN` repository secret to publish to npm. Without this secret the publish job will fail at the `npm publish` step.

### Steps

1. **Create an npm access token**
   - Log in at [npmjs.com](https://www.npmjs.com) → click your avatar → **Access Tokens**
   - Click **Generate New Token** → choose **Granular Access Token**
   - Set token name (e.g., `create-ai-template-publish`)
   - Expiration: choose a rotation period (e.g., 365 days)
   - Packages and scopes: select **Read and write** for the `create-ai-template` package
   - Click **Generate Token** and copy the value immediately (shown once)

2. **Add the secret to the repository**
   - Go to the repo on GitHub → **Settings** → **Secrets and variables** → **Actions**
   - Click **New repository secret**
   - Name: `NPM_TOKEN`
   - Secret: paste the token value from step 1
   - Click **Add secret**

3. **How it is used**
   The publish workflow reads this secret as `NODE_AUTH_TOKEN`, which the `actions/setup-node` action uses to authenticate with the npm registry when `npm publish` runs.

### OIDC upgrade path

npm trusted publishing (OIDC) eliminates the need for a long-lived `NPM_TOKEN` entirely. Once ready, configure a trusted publisher at npmjs.com → package → Settings → Trusted Publishers, then update `publish.yml` to use `id-token: write` permissions and remove the `NODE_AUTH_TOKEN` env var. See the comment in `publish.yml` for details.
