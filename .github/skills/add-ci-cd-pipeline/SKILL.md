---
name: add-ci-cd-pipeline
description: "Add or extend GitHub Actions CI/CD workflows including test gates, auto-issue creation on failure, hotfix branching, and releases. Use when the user says 'add CI/CD pipeline', 'set up GitHub Actions', 'add hotfix workflow', 'automate issue creation', or 'add release pipeline'."
---

# Add / Extend the CI/CD Pipeline

This project uses a layered GitHub Actions pipeline. Each workflow has a single responsibility. Understand the existing jobs before adding new ones — duplication is the main failure mode.

## Existing Workflow Map

```
.github/workflows/
  ci.yml                  → lint → test (Node 20 & 22) → SonarCloud → build
  auto-bugfix.yml         → opens GitHub Issues when CI fails (workflow_run trigger)
  pr-check-tests.yml      → comments on PRs missing tests
  labeler.yml             → auto-labels PRs by changed paths (.github/labeler.yml)
  release.yml             → generates CHANGELOG + GitHub Release on semver tag
  publish.yml             → smoke-tests wizard on 3 OS, then publishes to npm
  codeql.yml              → CodeQL security scan on push/PR/weekly schedule
  dependabot-automerge.yml→ auto-merges patch Dependabot PRs after CI
  version-check.yml       → weekly dependency drift check, opens PR if outdated
```

---

## Pattern 1 — Add a New CI Check

Add a job to `ci.yml` **after** the existing `lint` job and **before** `build`, following the dependency chain:

```yaml
# In ci.yml — inside the jobs: block
my-new-check:
  name: My New Check
  needs: lint # depends on lint passing
  runs-on: ubuntu-latest
  timeout-minutes: 5
  permissions:
    contents: read

  steps:
    - uses: actions/checkout@v4

    - uses: actions/setup-node@v4
      with:
        node-version: '20.x'
        cache: 'npm'

    - run: npm ci --legacy-peer-deps

    - name: Run my check
      run: npm run my-check-script
```

### CI Job Rules

- Always set `timeout-minutes` — prevents runaway jobs burning CI minutes.
- Always set minimum `permissions` — principle of least privilege.
- Add `if: github.actor != 'github-actions[bot]'` to skip bot-triggered runs (prevents loops).
- Use `--legacy-peer-deps` on `npm ci` — required for better-auth/drizzle-kit peer dep conflict.
- If the job produces an artifact consumed downstream, use `actions/upload-artifact@v4` / `actions/download-artifact@v4`.

### Concurrency (already set at workflow level — do not add per-job)

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

---

## Pattern 2 — Auto-Issue Creation on Failure

The `auto-bugfix.yml` workflow fires after CI via `workflow_run`. To trigger issue creation for a **different** workflow, add a new file following this skeleton:

```yaml
name: Auto-Issue on <Workflow> Failure

on:
  workflow_run:
    workflows: ["<Exact Workflow Name>"]   # must match `name:` in the target file
    types: [completed]

jobs:
  create-issue:
    runs-on: ubuntu-latest
    if: |
      github.event.workflow_run.conclusion == 'failure' &&
      !endsWith(github.event.workflow_run.actor.login, '[bot]')
    permissions:
      issues: write
      actions: read
      contents: read

    steps:
      - name: Ensure label exists
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          gh label create "auto-bugfix" \
            --color "E4E669" \
            --description "Automatically created from CI failure" \
            --repo "${{ github.repository }}" || true

      - name: Get failed jobs
        id: failed-jobs
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          RUN_ID: ${{ github.event.workflow_run.id }}
        run: |
          FAILED=$(gh api \
            "/repos/${{ github.repository }}/actions/runs/${RUN_ID}/jobs" \
            --jq '[.jobs[] | select(.conclusion == "failure") | {name: .name, id: .id}]')
          echo "jobs=${FAILED}" >> "$GITHUB_OUTPUT"
          echo "count=$(echo "$FAILED" | jq 'length')" >> "$GITHUB_OUTPUT"

      - name: Create issues for failed jobs
        if: steps.failed-jobs.outputs.count != '0'
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          BRANCH: ${{ github.event.workflow_run.head_branch }}
          SHA: ${{ github.event.workflow_run.head_sha }}
          RUN_ID: ${{ github.event.workflow_run.id }}
          RUN_NUMBER: ${{ github.event.workflow_run.run_number }}
          FAILED_JOBS: ${{ steps.failed-jobs.outputs.jobs }}
        run: |
          SHORT_SHA="${SHA:0:8}"
          RUN_URL="${{ github.server_url }}/${{ github.repository }}/actions/runs/${RUN_ID}"

          echo "$FAILED_JOBS" | jq -c '.[]' | while read -r job; do
            JOB_NAME=$(echo "$job" | jq -r '.name')
            JOB_ID=$(echo "$job"   | jq -r '.id')
            TITLE="CI Failed: ${JOB_NAME} on ${BRANCH} (${SHORT_SHA})"

            # Deduplication guard — never create two open issues for the same failure
            EXISTING=$(gh issue list \
              --repo "${{ github.repository }}" \
              --search "\"${TITLE}\"" \
              --state open \
              --json number \
              --limit 1 2>/dev/null || echo "[]")
            if [ "$EXISTING" != "[]" ] && [ "$(echo "$EXISTING" | jq 'length')" -gt 0 ]; then
              echo "Duplicate — skipping '${TITLE}'"
              continue
            fi

            LOG_TAIL=$(gh api \
              "/repos/${{ github.repository }}/actions/jobs/${JOB_ID}/logs" \
              2>/dev/null | tail -50 || echo "(log unavailable)")

            cat > /tmp/issue_body.md <<BODY
## CI Failure Report

| Field | Value |
|---|---|
| **Job** | \`${JOB_NAME}\` |
| **Branch** | \`${BRANCH}\` |
| **Commit** | \`${SHA}\` |
| **Run** | [#${RUN_NUMBER}](${RUN_URL}) |

## Error Log (last 50 lines)
\`\`\`
${LOG_TAIL}
\`\`\`
BODY

            gh issue create \
              --repo "${{ github.repository }}" \
              --title "${TITLE}" \
              --body-file /tmp/issue_body.md \
              --label "auto-bugfix"
          done
```

### Anti-patterns to avoid

| Anti-pattern                                                | Why it's wrong                                                  | Fix                                                  |
| ----------------------------------------------------------- | --------------------------------------------------------------- | ---------------------------------------------------- |
| `on: workflow_run` targeting a workflow by file name        | Fails silently                                                  | Target by `name:` field                              |
| No deduplication check                                      | Floods issues on flaky CI                                       | Always check for existing open issue with same title |
| `!endsWith(..., '[bot]')` missing                           | Bot fixes trigger CI, which triggers new issues → infinite loop | Always include this guard                            |
| `permissions: issues: write` on the failing workflow itself | Fork PRs don't have write permissions                           | Use `workflow_run` on a separate workflow            |

---

## Pattern 3 — Hotfix Workflow

A hotfix workflow triggers on branches matching `hotfix/**` and runs the same gate as CI plus an optional fast-track release.

Create `.github/workflows/hotfix.yml`:

```yaml
name: Hotfix

on:
  push:
    branches:
      - 'hotfix/**'
  pull_request:
    branches:
      - main
    # Only PRs from hotfix branches
    head-ref:
      - 'hotfix/**'

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  validate:
    name: Hotfix Validation
    runs-on: ubuntu-latest
    timeout-minutes: 10
    permissions:
      contents: read

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20.x'
          cache: 'npm'

      - run: npm ci --legacy-peer-deps

      - run: npm run lint
      - run: npm run type-check
      - run: npm test

  create-hotfix-issue:
    name: Track Hotfix
    needs: validate
    if: github.event_name == 'push'
    runs-on: ubuntu-latest
    permissions:
      issues: write
      contents: read

    steps:
      - name: Ensure hotfix label exists
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          gh label create "hotfix" \
            --color "D93F0B" \
            --description "Hotfix branch tracking issue" \
            --repo "${{ github.repository }}" || true

      - name: Open tracking issue
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          BRANCH: ${{ github.ref_name }}
          SHA: ${{ github.sha }}
        run: |
          TITLE="Hotfix: ${BRANCH}"
          SHORT_SHA="${SHA:0:8}"

          # Skip if tracking issue already open
          EXISTING=$(gh issue list \
            --repo "${{ github.repository }}" \
            --search "\"${TITLE}\"" \
            --state open \
            --json number --limit 1 2>/dev/null || echo "[]")
          if [ "$(echo "$EXISTING" | jq 'length')" -gt 0 ]; then
            echo "Tracking issue already exists — skipping."
            exit 0
          fi

          gh issue create \
            --repo "${{ github.repository }}" \
            --title "${TITLE}" \
            --label "hotfix" \
            --body "## Hotfix Tracking

| Field | Value |
|---|---|
| **Branch** | \`${BRANCH}\` |
| **Commit** | \`${SHORT_SHA}\` |
| **Status** | Validation passed ✅ |

## Checklist
- [ ] Root cause identified
- [ ] Fix tested locally
- [ ] PR opened against \`main\`
- [ ] PR reviewed and approved
- [ ] Hotfix release tag pushed after merge
"
```

### Hotfix Branch Convention

```
hotfix/issue-<number>-short-description
hotfix/123-fix-auth-token-expiry
```

### Fast-Track Release After Merge

After a hotfix PR merges to `main`, trigger a patch release:

```bash
git tag v$(node -p "require('./package.json').version") -m "Hotfix release"
git push origin --tags
```

The existing `release.yml` fires automatically on the tag and generates the CHANGELOG entry + GitHub Release.

---

## Pattern 4 — Add a New Release Step

To add a step to the release pipeline, edit `release.yml` **before** the `Create GitHub Release` step:

```yaml
- name: My custom release step
  run: |
    # e.g. build Docker image, update docs, notify Slack
    echo "Running for ${{ github.ref_name }}"
```

Release is triggered by pushing a semver tag:

```bash
git tag v1.2.3
git push origin v1.2.3
```

---

## Pattern 5 — Auto-Label PRs by Changed Files

Edit `.github/labeler.yml` to map path globs to label names:

```yaml
# Existing entries (do not remove):
ci:
  - changed-files:
      - any-glob-to-any-file: '.github/workflows/**'
frontend:
  - changed-files:
      - any-glob-to-any-file: 'src/app/**'
backend:
  - changed-files:
      - any-glob-to-any-file: 'src/lib/**'
database:
  - changed-files:
      - any-glob-to-any-file: 'prisma/**'

# Add new entries below — example:
api:
  - changed-files:
      - any-glob-to-any-file: 'src/app/api/**'
```

The `labeler.yml` workflow picks up `.github/labeler.yml` automatically — no workflow change needed.

---

## Required Secrets & Permissions

| Secret / Permission | Where set                           | Used by                         |
| ------------------- | ----------------------------------- | ------------------------------- |
| `GITHUB_TOKEN`      | Auto-provided by Actions            | All workflows                   |
| `SONAR_TOKEN`       | Repo → Settings → Secrets           | `ci.yml` / SonarCloud           |
| `NPM_TOKEN`         | Repo → Settings → Secrets           | `publish.yml`                   |
| `issues: write`     | Declared in workflow `permissions:` | `auto-bugfix.yml`, `hotfix.yml` |
| `contents: write`   | Declared in workflow `permissions:` | `release.yml`                   |

## Checklist

- [ ] New workflow file name is kebab-case, `.yml` extension
- [ ] `timeout-minutes` set on every job
- [ ] Minimum `permissions` declared — no blanket `write-all`
- [ ] Bot loop guard: `!endsWith(actor.login, '[bot]')` on issue-creating jobs
- [ ] `workflow_run` workflows reference the **`name:`** field of the target workflow, not its file name
- [ ] Deduplication check present on any job that creates issues
- [ ] `concurrency` block set to cancel in-progress runs
- [ ] `--legacy-peer-deps` on all `npm ci` steps
- [ ] Hotfix branches follow `hotfix/<issue-number>-<description>` convention
- [ ] New labels created with `|| true` (idempotent — don't fail if label already exists)
