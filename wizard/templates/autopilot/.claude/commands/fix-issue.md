---
name: fix-issue
description: Read a GitHub Issue and apply a targeted fix, then open a PR
argument-hint: '<issue-number>'
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---

You are fixing GitHub Issue #$ARGUMENTS in this repository.

## Issue Content

!gh issue view $ARGUMENTS --json title,body,labels,number

## Step 1: Check Fix Attempt Count

Before doing anything else, count how many times an automated fix has already been attempted for this issue:

```bash
REPO=$(gh repo view --json nameWithOwner --jq '.nameWithOwner')
COUNT=$(gh api "/repos/${REPO}/issues/$ARGUMENTS/comments" \
  --jq '[.[] | select(.body | startswith("<!-- fix-attempt -->"))] | length')
echo "Fix attempts so far: ${COUNT}"
```

**If COUNT >= 3:**

- Run: `gh issue edit $ARGUMENTS --add-label "needs-human"`
- Run: `gh issue comment $ARGUMENTS --body "<!-- fix-attempt -->Auto-fix limit reached. Manual investigation required."`
- Stop here. Do not apply any code changes or open a PR.

**If COUNT < 3:** Continue to Step 2.

## Step 2: Understand the Issue

Read the issue title and body above. Parse the **Auto-Fix Payload** JSON block at the bottom of the issue body to extract structured context:

```bash
REPO=$(gh repo view --json nameWithOwner --jq '.nameWithOwner')
BODY=$(gh issue view $ARGUMENTS --json body --jq '.body')

# Extract the JSON payload from the Auto-Fix Payload section
PAYLOAD=$(echo "$BODY" | python3 -c "
import sys, re, json
body = sys.stdin.read()
m = re.search(r'## Auto-Fix Payload\s+\`\`\`json\s+(\{.*?\})\s+\`\`\`', body, re.DOTALL)
if m:
    print(m.group(1))
")

if [ -n "$PAYLOAD" ]; then
  JOB=$(echo "$PAYLOAD" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('job','unknown'))")
  BRANCH=$(echo "$PAYLOAD" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('branch','main'))")
  SHA=$(echo "$PAYLOAD" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('sha',''))")
  echo "Job: ${JOB}, Branch: ${BRANCH}, SHA: ${SHA}"
else
  # Fallback: no structured payload, use defaults
  JOB="unknown"
  BRANCH=$(git symbolic-ref --short HEAD 2>/dev/null || echo "main")
  echo "No structured payload found. Using defaults."
fi
```

Identify:

- The specific file(s) causing the failure (use `error_log` from payload or issue body)
- The exact error message or test failure
- The minimal change needed to fix it

Use Read, Glob, and Grep tools to locate the relevant code. Do not make sweeping changes — apply the most targeted fix possible.

## Step 3: Apply the Fix

Edit only the files required to fix the reported issue. Do not refactor unrelated code.

## Step 4: Verify the Fix

Run:

```bash
npm test
```

If tests fail, re-examine and fix. Do not open a PR with a failing test suite.

## Step 5: Commit and Push

Create a fix branch and commit with `[skip ci]` to prevent triggering a new CI run (loop prevention).

Use the `JOB` variable extracted in Step 2 (falls back to `unknown` if no payload). Use the `BRANCH` variable from the payload as the target base branch:

```bash
FIX_BRANCH="fix/issue-$ARGUMENTS"
git checkout -b "${FIX_BRANCH}"
git add -A
git commit -m "fix: resolve CI failure in ${JOB} [skip ci]"
git push origin "${FIX_BRANCH}"
```

Note: `[skip ci]` in the commit message causes GitHub Actions to skip push-triggered workflows for this commit. This is intentional — it prevents infinite fix loops.

## Step 6: Open the PR

Target the branch where the failure occurred (from the Auto-Fix Payload `branch` field):

```bash
gh pr create \
  --base "${BRANCH}" \
  --title "fix: resolve CI failure in ${JOB} (issue #$ARGUMENTS)" \
  --body "Closes #$ARGUMENTS

Automated fix for CI failure in job \`${JOB}\` on branch \`${BRANCH}\`.

Please review the changes before merging." \
  --label "bug"
```

## Step 7: Post Attempt Tracking Comment

Post a tracking comment so the attempt counter works correctly on future runs:

```bash
gh issue comment $ARGUMENTS --body "<!-- fix-attempt -->Fix attempt opened: PR created. If this PR does not resolve the issue, run \`/fix-issue $ARGUMENTS\` again."
```
