# Template Update Guide

This guide explains how to receive the latest template improvements using `npm run template:update`.

## Overview

The `template:update` script fetches the newest version from the upstream
[Template-BMAD-auto-CI-CD](https://github.com/Thinkpload/Template-BMAD-auto-CI-CD) repository
and merges template-owned files into your project. Your application code is never touched.

---

## What Gets Merged

| Template-Owned (merged automatically) | User-Owned (never touched)    |
| ------------------------------------- | ----------------------------- |
| `_bmad/` — BMAD agent configs         | `src/` — your app code        |
| `.github/` — workflows, templates     | `prisma/schema.prisma`        |
| `eslint.config.mjs`                   | `prisma/migrations/`          |
| `prettier.config.mjs`                 | `.env`, `.env.local`          |
| `tsconfig.json`                       | `public/`                     |
| `next.config.ts`                      | `docs/decisions/` (ADRs)      |
| `tailwind.config.ts`                  | `CHANGELOG.md`                |
| `renovate.json`                       | `README.md`                   |
| `scripts/template-update.js`          | custom `package.json` scripts |

---

## Running the Update

```bash
npm run template:update
```

The script will:

1. Check for uncommitted changes (warns but does not abort)
2. Fetch the latest tag from the upstream template repository
3. Merge template-owned paths only
4. Detect Prisma schema changes (prints advisory — **never auto-migrates**)
5. Run `npm install` to update dependencies
6. Run the full test suite to validate compatibility
7. Print a summary of what changed

**Time budget:** The script is designed to complete in ≤ 2 minutes.

---

## Prisma Schema Changes

If the template update includes a Prisma schema change, you will see:

```
⚠️  Schema changes detected. Run 'npx prisma migrate dev' to apply.
```

Review the schema diff before running migrations:

```bash
git diff HEAD -- prisma/schema.prisma
npx prisma migrate dev --name <descriptive-name>
```

---

## Conflict Resolution

If a conflict is detected, the script will **abort** the merge and print the conflicting files:

```
❌ Merge conflict detected. Cannot auto-resolve the following files:

    • _bmad/config.yaml

Please resolve conflicts manually:
  1. Re-run: git merge template/<tag> -- _bmad/ .github/ ...
  2. Resolve conflicts in each file listed above
  3. Stage resolved files: git add <file>
  4. Complete the merge: git commit
```

### Step-by-step conflict resolution

```bash
# 1. Re-apply the merge targeting only template-owned paths
git merge template/<latest-tag> --no-commit --no-ff -- \
  _bmad/ .github/ eslint.config.mjs prettier.config.mjs \
  tsconfig.json next.config.ts tailwind.config.ts renovate.json \
  scripts/template-update.js scripts/template-update-utils.js

# 2. Open each conflicting file and resolve (look for <<<<<<< markers)
# Accept "ours" (your version), "theirs" (template), or a blend

# 3. Stage each resolved file
git add _bmad/config.yaml   # example

# 4. Commit the merge
git commit -m "chore: merge template <tag> (manual conflict resolution)"
```

### Accepting the template version entirely

If you want to keep the template's version of a file wholesale:

```bash
git checkout --theirs -- _bmad/config.yaml
git add _bmad/config.yaml
```

### Keeping your version entirely

```bash
git checkout --ours -- _bmad/config.yaml
git add _bmad/config.yaml
```

---

## Rollback Instructions

If you need to revert an update:

```bash
# Find the commit before the merge
git log --oneline -5

# Hard reset to the pre-merge commit (DESTRUCTIVE — loses uncommitted changes)
git reset --hard <commit-hash-before-merge>
```

Or, if you tagged your project before updating:

```bash
git checkout <your-pre-update-tag>
```

To restore a single template-owned file to its previous state:

```bash
git show HEAD~1:_bmad/config.yaml > _bmad/config.yaml
git add _bmad/config.yaml
git commit -m "chore: revert _bmad/config.yaml to pre-update version"
```

---

## Major Version Upgrades

When `npm run template:update` detects a MAJOR version bump (e.g., `v1.x.x → v2.x.x`),
it will print a warning and point you to the migration guide:

```
⚠️  This is a MAJOR version upgrade (v1.9.0 → v2.0.0).
    Breaking changes may have been introduced.
    Review the migration guide before proceeding: docs/guides/migration-guide-template.md
```

**Always read the migration guide before accepting a MAJOR upgrade.**
The migration guide documents every breaking change, who is affected, and
step-by-step instructions to update your project safely.

→ See: [docs/guides/migration-guide-template.md](./migration-guide-template.md)

---

## FAQ

**Q: Will my `src/` code be modified?**
No. The script only merges the paths listed in the "Template-Owned" table above.

**Q: What if I've customized `eslint.config.mjs`?**
The merge will attempt to combine both versions. If there is a conflict, follow the
conflict resolution steps above.

**Q: The tests failed after update — what do I do?**
Check the test output. The template's changes may conflict with your customizations.
Inspect `git diff HEAD~1` to see what changed, then fix the failing tests.

**Q: Can I skip the test suite during update?**
No — the test run is a safety gate. If tests are too slow, ensure you haven't
accidentally run `npm run test:coverage` instead of `npm test`.
