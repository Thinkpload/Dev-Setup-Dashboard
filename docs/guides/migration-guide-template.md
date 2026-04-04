# Template Migration Guide

This document is the authoritative reference for migrating between MAJOR versions of
[Template-BMAD-auto-CI-CD](https://github.com/Thinkpload/Template-BMAD-auto-CI-CD).

**MINOR and PATCH** versions are always backward-compatible — no migration needed.
Only **MAJOR** version bumps may contain breaking changes, and every breaking change
must be documented here before the release ships.

---

## How to Use This Guide

1. Identify your current version: `git describe --tags --exact-match HEAD`
2. Find the relevant migration section below (e.g., `v1.x.x → v2.x.x`)
3. Follow "Migration Steps" in order
4. If anything goes wrong, use the "Rollback" section to restore the previous version

---

## Migration Guide Structure

Each MAJOR release section must contain these four parts:

### (a) What Changed

A concise list of breaking changes — removals, renames, structural shifts.
Example: "The `_bmad/bmm/config.yaml` `user_name` field has been renamed to `author`."

### (b) Who Is Affected

Which users need to act? If you haven't touched a particular feature, you may be able
to skip certain steps.
Example: "Only affects users who customized `_bmad/agents/dev.md` or have automation
that reads `config.yaml` directly."

### (c) Migration Steps

Numbered, actionable steps. Each step should be:

- A single atomic action (run a command, rename a field, update a config value)
- Verifiable (include how to confirm the step succeeded)

### (d) Rollback

If the migration causes unexpected issues, roll back with:

```bash
# Find the last stable tag before the MAJOR upgrade
git log --oneline --tags --simplify-by-decoration

# Reset to that tag (replaces local working tree)
git checkout <prev-major-tag>
```

Or, if you committed the migration changes and want to undo them:

```bash
# Revert to the commit before the migration
git log --oneline -10
git reset --hard <commit-hash-before-migration>
```

---

## v2.0.0 → v2.x.x (Example — Stub)

> ℹ️ This is a placeholder section illustrating the required structure.
> Replace with actual breaking changes when v2.0.0 is released.

### (a) What Changed

- **`_bmad/bmm/config.yaml`**: Field `user_skill_level` now accepts `junior | mid | senior`
  instead of `beginner | intermediate | advanced`. Old values will cause a validation warning.
- **`scripts/template-update.js`**: Now requires Node.js ≥ 22. Node 20 is no longer supported.

### (b) Who Is Affected

- **All users**: The `config.yaml` field rename affects every project using BMAD agents.
- **CI/CD users**: If your pipeline targets Node 20, update your `engines` field and
  GitHub Actions matrix.

### (c) Migration Steps

1. **Update `_bmad/bmm/config.yaml`**

   ```yaml
   # Before (v1.x.x)
   user_skill_level: beginner

   # After (v2.x.x)
   user_skill_level: junior
   ```

   Mapping: `beginner → junior`, `intermediate → mid`, `advanced → senior`

2. **Update Node.js version in CI**

   In `.github/workflows/ci.yml`, update the matrix:

   ```yaml
   # Before
   node-version: ['20.x', '22.x']

   # After
   node-version: ['22.x', '24.x']
   ```

3. **Verify the update**

   ```bash
   npm run template:update
   # Expected: "✅ All tests pass — update is compatible."
   ```

### (d) Rollback

```bash
# Roll back to the last v1.x.x tag
git checkout v1.9.0   # replace with your actual previous tag

# Or undo the migration commit
git log --oneline -5
git reset --hard <hash-before-migration>
```

---

## Backward Compatibility Policy

This project follows [Semantic Versioning](https://semver.org):

| Version type      | Breaking changes allowed?            |
| ----------------- | ------------------------------------ |
| **MAJOR** (x.0.0) | Yes — documented here before release |
| **MINOR** (x.x.0) | No — additive only                   |
| **PATCH** (x.x.x) | No — bug fixes only                  |

Breaking changes in MINOR releases are bugs. Report them at:
<https://github.com/Thinkpload/Template-BMAD-auto-CI-CD/issues>
