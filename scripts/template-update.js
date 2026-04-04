// @ts-check
'use strict';

/**
 * template:update — Evergreen Update Script
 *
 * Fetches the latest template version from upstream and merges template-owned
 * paths into the current project. Never touches user-owned code (src/, prisma/,
 * .env, etc.). Never auto-runs prisma migrate.
 *
 * Usage: npm run template:update
 * Requirements: Node.js >= 20, git in PATH
 */

const { execSync } = require('child_process');
const path = require('path');
const {
  isTemplateOwnedPath,
  detectSchemaDiff,
  detectConflicts,
  parseMergeStatus,
  isBreakingChange,
} = require('./template-update-utils.js');

// ─── Constants ────────────────────────────────────────────────────────────────

const UPSTREAM_REMOTE = 'template';
const UPSTREAM_URL = 'https://github.com/Thinkpload/Template-BMAD-auto-CI-CD';
const CONFLICT_GUIDE = 'docs/guides/template-update.md';

/** Template-owned paths passed to `git merge -- <paths>` */
const TEMPLATE_OWNED_PATHS = [
  '_bmad/',
  '.github/',
  'eslint.config.mjs',
  'prettier.config.mjs',
  'tsconfig.json',
  'next.config.ts',
  'tailwind.config.ts',
  'renovate.json',
  'scripts/template-update.js',
  'scripts/template-update-utils.js',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * @param {string} cmd
 * @param {{ silent?: boolean }} [opts]
 * @returns {string}
 */
function run(cmd, opts = {}) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: opts.silent ? 'pipe' : 'pipe' });
  } catch (/** @type {any} */ err) {
    return err.stdout || '';
  }
}

/**
 * Run a command; throw on non-zero exit.
 * @param {string} cmd
 * @returns {string}
 */
function runStrict(cmd) {
  return execSync(cmd, { encoding: 'utf8', stdio: 'pipe' });
}

function step(msg) {
  console.log(`\n→ ${msg}`);
}

function info(msg) {
  console.log(`  ${msg}`);
}

function warn(msg) {
  console.log(`\n⚠️  ${msg}`);
}

function ok(msg) {
  console.log(`✅ ${msg}`);
}

function fail(msg) {
  console.error(`\n❌ ${msg}`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('╔══════════════════════════════════════════╗');
  console.log('║     Template Update — Evergreen Sync     ║');
  console.log('╚══════════════════════════════════════════╝\n');

  // ── 1.1 Detect uncommitted changes ──────────────────────────────────────────
  step('Checking working tree status…');
  const workingTreeStatus = run('git status --porcelain').trim();
  if (workingTreeStatus) {
    warn('You have uncommitted changes. Continuing anyway — the merge will be applied on top.');
    warn('Consider committing or stashing first for a cleaner diff.');
  } else {
    ok('Working tree is clean.');
  }

  // ── 1.2 Fetch latest tag from upstream ──────────────────────────────────────
  step('Setting up upstream remote…');

  // Add remote if it doesn't exist (idempotent)
  const remotes = run('git remote')
    .split('\n')
    .map((r) => r.trim());
  if (!remotes.includes(UPSTREAM_REMOTE)) {
    run(`git remote add ${UPSTREAM_REMOTE} ${UPSTREAM_URL}`);
    info(`Added remote '${UPSTREAM_REMOTE}' → ${UPSTREAM_URL}`);
  } else {
    info(`Remote '${UPSTREAM_REMOTE}' already configured.`);
  }

  step('Fetching latest tags from upstream…');
  try {
    runStrict(`git fetch ${UPSTREAM_REMOTE} --tags --quiet`);
  } catch (/** @type {any} */ err) {
    fail(
      `Cannot reach upstream repository.\nPlease check your internet connection and try again.\n\nError: ${err.message}`
    );
    process.exit(1);
  }

  // Get the latest tag from upstream
  let latestTag;
  try {
    latestTag = runStrict(`git describe --tags --abbrev=0 ${UPSTREAM_REMOTE}/main`).trim();
  } catch {
    // Fall back to listing tags
    const tags = run(`git tag --sort=-version:refname --list 'v*'`)
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean);
    if (!tags.length) {
      fail('No version tags found in upstream repository.');
      process.exit(1);
    }
    latestTag = tags[0];
  }

  info(`Latest upstream tag: ${latestTag}`);

  // Check if already at latest
  let currentTag;
  try {
    currentTag = runStrict('git describe --tags --exact-match HEAD 2>/dev/null').trim();
  } catch {
    currentTag = null;
  }

  if (currentTag === latestTag) {
    console.log(`\n✨ Already up to date at ${latestTag}. Nothing to merge.`);
    process.exit(0);
  }

  // ── 1.3 Merge template-owned paths ──────────────────────────────────────────
  step(`Merging template-owned paths from ${UPSTREAM_REMOTE}/${latestTag}…`);

  const pathArgs = TEMPLATE_OWNED_PATHS.join(' ');

  try {
    runStrict(`git merge ${UPSTREAM_REMOTE}/${latestTag} --no-commit --no-ff -- ${pathArgs}`);
  } catch {
    // Merge may fail with conflicts — check status before deciding
  }

  // Check for conflicts
  const statusAfterMerge = run('git status --porcelain');
  const conflicts = detectConflicts(statusAfterMerge);

  // ── 1.5 Handle conflicts ─────────────────────────────────────────────────────
  if (conflicts.length > 0) {
    // Abort the merge to leave working tree clean
    run('git merge --abort');

    fail('Merge conflict detected. Cannot auto-resolve the following files:\n');
    conflicts.forEach((f) => console.error(`    • ${f}`));
    console.error(`
Please resolve conflicts manually:
  1. Re-run: git merge ${UPSTREAM_REMOTE}/${latestTag} -- ${pathArgs}
  2. Resolve conflicts in each file listed above
  3. Stage resolved files: git add <file>
  4. Complete the merge: git commit

Conflict resolution guide: ${CONFLICT_GUIDE}
`);
    process.exit(1);
  }

  // ── 1.4 Detect Prisma schema diff ───────────────────────────────────────────
  const diffOutput = run('git diff --name-only HEAD');
  if (detectSchemaDiff(diffOutput)) {
    warn(
      "Schema changes detected. Run 'npx prisma migrate dev' to apply.\n  " +
        '(The update script never auto-migrates data.)'
    );
  }

  // Collect merged files for summary
  const mergedFiles = parseMergeStatus(statusAfterMerge).filter(isTemplateOwnedPath);

  // Commit the merge
  try {
    runStrict(`git commit -m "chore: merge template ${latestTag} into project"`);
    ok(`Template paths merged and committed (${latestTag})`);
  } catch {
    // Nothing to commit — already up to date at path level
    ok('Template paths are already up to date — no changes to commit.');
  }

  // ── 1.1/1.2 Breaking change advisory (MINOR bump guard) ─────────────────────
  if (currentTag && isBreakingChange(currentTag, latestTag)) {
    warn(
      `This is a MAJOR version upgrade (${currentTag} → ${latestTag}).\n` +
        '  Breaking changes may have been introduced.\n' +
        '  Review the migration guide before proceeding: docs/guides/migration-guide-template.md'
    );
  } else if (currentTag && !isBreakingChange(currentTag, latestTag)) {
    // MINOR/PATCH bump — scan for any accidentally breaking changes in template-owned config files
    const configDiff = run(
      `git diff HEAD~1 --name-only -- eslint.config.mjs prettier.config.mjs tsconfig.json next.config.ts tailwind.config.ts renovate.json`
    ).trim();
    if (configDiff) {
      info(
        'Template-owned config files changed in this MINOR/PATCH update (additive only per policy):'
      );
      configDiff
        .split('\n')
        .filter(Boolean)
        .forEach((f) => info(`  • ${f}`));
    }
  }

  // ── 3.3 Run compat:check ─────────────────────────────────────────────────────
  step('Checking for imports of template-owned paths in your src/ code…');
  try {
    execSync('node scripts/compat-check.js', { stdio: 'inherit' });
  } catch {
    // compat-check always exits 0 — this catch is defensive only
  }

  // ── 1.6 Run npm install ──────────────────────────────────────────────────────
  step('Running npm install to update dependencies…');
  try {
    execSync('npm install --silent', { stdio: 'inherit' });
    ok('Dependencies updated.');
  } catch (/** @type {any} */ err) {
    fail(`npm install failed: ${err.message}`);
    process.exit(1);
  }

  // ── 1.7 Run test suite ───────────────────────────────────────────────────────
  step('Running test suite to validate compatibility…');
  try {
    execSync('npx vitest run', { stdio: 'inherit' });
    ok('All tests pass — update is compatible.');
  } catch {
    fail(
      'Tests failed after merge. Review the failures above.\n' +
        "  If needed, run 'git log --oneline -5' to inspect what changed."
    );
    process.exit(1);
  }

  // ── 1.8 Summary ─────────────────────────────────────────────────────────────
  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║           Update Complete! 🎉             ║');
  console.log('╚══════════════════════════════════════════╝\n');

  if (mergedFiles.length > 0) {
    console.log(`Files merged from ${latestTag}:`);
    mergedFiles.forEach((f) => console.log(`  • ${f}`));
  } else {
    console.log('No file changes detected — dependencies may have been updated only.');
  }

  console.log(`\nUpgraded to: ${latestTag}`);
  console.log(`Run 'git log --oneline -1' to see the merge commit.\n`);
}

main().catch((err) => {
  console.error('\n💥 Unexpected error:', err.message);
  process.exit(1);
});
