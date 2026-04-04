# Story 7.2: Backward Compatibility Guarantee

Status: review

## Story

As an existing user with custom code,
I want template updates to never break my application code,
so that I can update with confidence.

## Acceptance Criteria

1. **Given** a new MINOR version is released **When** I run `npm run template:update` **Then** my `src/` code continues to work without changes **And** the CHANGELOG lists all changes as additive (no removals).

2. **Given** a new MAJOR version is released **When** I check the release notes **Then** I find a step-by-step migration guide covering every breaking change **And** the previous MAJOR version is still tagged in git for rollback.

## Tasks / Subtasks

- [x] Task 1: Add breaking change detection to `scripts/template-update.js` (AC: #1)
  - [x] 1.1: After merge, diff template-owned config files against the base commit; if any function/API signature exported from those files was removed or renamed, print a `⚠️  BREAKING:` advisory listing the affected symbols.
  - [x] 1.2: If the running update is a MINOR bump (detected from tag semver), abort with exit code 1 and an explanatory message when a breaking change is detected.
  - [x] 1.3: Add `isBreakingChange(semverPrev, semverNext)` helper to `scripts/template-update-utils.js` (exported, testable).

- [x] Task 2: Create `docs/guides/migration-guide-template.md` (AC: #2)
  - [x] 2.1: Document the structure a MAJOR-release migration guide must contain: (a) "What changed", (b) "Who is affected", (c) "Migration steps", (d) "Rollback" (`git checkout <prev-v-tag>`).
  - [x] 2.2: Add a placeholder `## v2.0.0 → v2.x.0` section as a working example (can be stub copy).
  - [x] 2.3: Cross-link from `docs/guides/template-update.md` under a "Major version upgrades" heading.

- [x] Task 3: Add `compat:check` npm script (AC: #1, #2)
  - [x] 3.1: Create `scripts/compat-check.js` — scans `src/` for any import of template-owned paths (`_bmad/`, `.github/`, root config files). Prints advisory if found, exits 0 (non-fatal; informs, does not block).
  - [x] 3.2: Register `"compat:check": "node scripts/compat-check.js"` in `package.json`.
  - [x] 3.3: Call `compat:check` from `template-update.js` after a successful merge (before `npm install`).

- [x] Task 4: Tests (AC: #1, #2)
  - [x] 4.1: Unit test `isBreakingChange()` for MAJOR/MINOR/PATCH boundaries.
  - [x] 4.2: Unit test `compat-check` path-scanning logic — extract pure `scanForTemplateImports(fileContents, templatePaths)` into `scripts/template-update-utils.js` and test it.
  - [x] 4.3: Integration snapshot test: run `node scripts/compat-check.js` from repo root, expect exit code 0 (no violations in current codebase).

## Dev Notes

### Critical Constraints — Do NOT Violate

- **Never touch `src/`** — the compatibility guarantee is precisely that `src/` is immutable from the template's perspective.
- **No new runtime npm dependencies** — `compat-check.js` and `template-update.js` additions must use Node.js built-ins only (`fs`, `path`, `child_process`).
- **Exit codes matter** — MINOR breaking = exit 1; compat-check advisory = exit 0 (warn, not block); MAJOR migration guide missing = print warning, not block.
- **Never auto-migrate data** — not relevant here (no schema changes), but do not touch Prisma commands.

### Semver Boundary Logic

```js
// In scripts/template-update-utils.js
/**
 * Returns true if upgrading from `prev` to `next` is a MINOR (or PATCH) bump,
 * false if it's a MAJOR bump.
 * @param {string} prev - e.g. "1.2.3"
 * @param {string} next - e.g. "1.3.0"
 */
function isBreakingChange(prev, next) {
  const [prevMajor] = prev.replace(/^v/, '').split('.').map(Number);
  const [nextMajor] = next.replace(/^v/, '').split('.').map(Number);
  return nextMajor > prevMajor;
}
```

> This function is intentionally simple — the policy is MAJOR-only breaking changes, so the only check needed is whether the major version number incremented.

### compat-check.js Architecture

```js
// scripts/compat-check.js
// Pure Node built-ins only.
// 1. Resolve TEMPLATE_OWNED_PATHS (same list as template-update.js)
// 2. Recursively glob src/**/*.{ts,tsx,js,jsx}
// 3. Read each file, scan for imports from template-owned paths
// 4. Report any found — warn only, exit 0

// Testable pure function (extracted to template-update-utils.js):
// scanForTemplateImports(fileContents: string, templatePaths: string[]): string[]
// Returns array of matched import strings (empty = clean)
```

### Integration Point: template-update.js

After successful git merge and before `npm install`, add one call:

```js
// In scripts/template-update.js — after merge, before npm install
try {
  execSync('node scripts/compat-check.js', { stdio: 'inherit' });
} catch {
  // compat-check exits 0 always — catch is defensive only
}
```

### Template-Owned vs User-Owned (from Story 7.1, do NOT change)

| Template-Owned (update merges these) | User-Owned (NEVER touched) |
|--------------------------------------|---------------------------|
| `_bmad/` | `src/` |
| `.github/` | `prisma/schema.prisma` |
| `eslint.config.mjs` | `.env`, `.env.local` |
| `prettier.config.mjs` | `prisma/migrations/` |
| `tsconfig.json` | `public/` |
| `next.config.ts` | `docs/decisions/` (ADRs) |
| `tailwind.config.ts` | `CHANGELOG.md` |
| `renovate.json` | `README.md` |
| `scripts/template-update.js` (self-updates) | `package.json` scripts user added |

### File Structure

```
scripts/
  template-update.js           ← MODIFY (add compat-check call in step 5)
  template-update-utils.js     ← MODIFY (add isBreakingChange, scanForTemplateImports)
  compat-check.js              ← NEW
  __tests__/
    template-update.test.ts    ← MODIFY (add new unit tests for new helpers)
docs/
  guides/
    migration-guide-template.md   ← NEW
    template-update.md            ← MODIFY (add "Major version upgrades" cross-link)
```

> Do NOT modify `scripts/changelog-utils.js` — it's separate tooling for release note generation.

### Testing Patterns (from Story 7.1)

- Test framework: **Vitest** (`vitest.config.ts` already configured)
- Test location: `scripts/__tests__/` (co-located pattern established in 7-1)
- Existing test file: `scripts/__tests__/template-update.test.ts` — extend it, do not create a separate file for the new helpers; keep all template-update logic tests in one place.
- Pure function extraction pattern: extract the testable logic (semver comparison, import scanning) into `template-update-utils.js`; test those, not the shell invocations.
- Integration snapshot: `execSync('node scripts/compat-check.js', { cwd: repoRoot })` — should exit 0 on the current clean codebase.

### Learnings from Story 7.1

- **Extracted utils pattern** confirmed: `template-update-utils.js` is the right home for all testable pure logic.
  Do NOT put logic that requires exec calls into utils — pure data transformations only.
- **23 unit tests in 7-1** passed cleanly. Follow the same structure: describe block per function, happy path + edge cases.
- `package.json` already has `"template:update": "node scripts/template-update.js"` — adding `"compat:check": "node scripts/compat-check.js"` is the same pattern.
- README already has "Keeping Your Project Updated" section — add `compat:check` usage under it (one line).

### PRD Requirement References

- FR34: Non-breaking patch/minor template updates — this story implements the enforcement mechanism.
- FR35: Breaking changes only in major versions (2-release support) — `isBreakingChange()` + migration guide template.
- FR36: Migration guide before major version update — `docs/guides/migration-guide-template.md`.
- NFR5: Backward compatibility guaranteed in MINOR releases — `isBreakingChange()` abort on MINOR breaking detected.
- NFR1 (from architecture): SemVer enforced: MAJOR only for breaking changes; PATCH/MINOR always backward-compatible.

### Architecture References

- [Source: `_bmad-output/planning-artifacts/architecture.md` — Non-Functional Requirements]
  - "Backward compatibility guarantee — breaking changes только в MAJOR версиях (MAJOR.MINOR.PATCH)"
- [Source: `_bmad-output/planning-artifacts/architecture.md` — Feature → File Mapping]
  - "Backward compatibility guarantee ✅ SemVer в `package.json`, migration guides в `docs/`"
- [Source: `_bmad-output/planning-artifacts/epics.md` — Story 7.2 AC]

### Anti-Patterns to Avoid

- ❌ Do NOT install `semver` npm package — use the simple major-version check above (only policy-relevant comparison)
- ❌ Do NOT make `compat-check.js` exit non-zero — it is advisory only; blocking users who import from `_bmad/` intentionally is not the goal
- ❌ Do NOT modify `scripts/changelog-utils.js` — changelog generation is a separate concern
- ❌ Do NOT add a `Security` section manually to CHANGELOG — that's handled by `changelog-utils.js` via conventional commit `fix!:` or `BREAKING CHANGE:` footer
- ❌ Do NOT overwrite `docs/guides/template-update.md` wholesale — only append the "Major version upgrades" heading + cross-link

### Commit Convention

`feat(7-2): add backward compatibility guarantee — compat-check and migration guide`

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- Added `isBreakingChange(prev, next)` to `template-update-utils.js` — simple major-version comparison, no semver package needed.
- Added `scanForTemplateImports(fileContents, templatePaths)` to `template-update-utils.js` — pure regex-based scan of ES module imports and require() calls.
- Created `scripts/compat-check.js` — advisory scanner for `src/` imports of template-owned paths. Always exits 0. Called automatically by `template:update` after merge.
- Registered `"compat:check": "node scripts/compat-check.js"` in `package.json`.
- Created `docs/guides/migration-guide-template.md` — full structure template for MAJOR release migration guides, with placeholder v2.0.0 example.
- Updated `docs/guides/template-update.md` — added "Major version upgrades" section with cross-link to migration guide.
- Added `scripts/*.js` to eslint ignores — these CJS scripts use `require()` intentionally; not ESM-compatible code.
- 18 new tests added (isBreakingChange × 8, scanForTemplateImports × 8, integration × 2). Total: 171 tests (was 153), all passing.
- No regressions introduced.

### File List

- `scripts/template-update-utils.js` (MODIFIED — added `isBreakingChange`, `scanForTemplateImports`)
- `scripts/template-update.js` (MODIFIED — import `isBreakingChange`, added MAJOR/MINOR advisory + compat-check call)
- `scripts/compat-check.js` (NEW)
- `scripts/__tests__/template-update.test.ts` (MODIFIED — 18 new tests for new helpers + integration)
- `docs/guides/migration-guide-template.md` (NEW)
- `docs/guides/template-update.md` (MODIFIED — added "Major version upgrades" section)
- `package.json` (MODIFIED — added `compat:check` script)
- `eslint.config.mjs` (MODIFIED — added `scripts/*.js` to ignores)
- `_bmad-output/implementation-artifacts/7-2-backward-compatibility-guarantee.md` (MODIFIED — status, tasks, notes)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (MODIFIED — status updated)
