// @ts-check
'use strict';

/**
 * compat-check — Backward Compatibility Advisor
 *
 * Scans src/ for any imports referencing template-owned paths (_bmad/, .github/, etc.).
 * These imports would couple user application code to template internals, which means
 * template updates could silently break the user's code.
 *
 * This script is ADVISORY ONLY — it always exits 0.
 * It is called automatically by `npm run template:update` after a successful merge.
 *
 * Usage:
 *   npm run compat:check
 *   node scripts/compat-check.js
 */

const fs = require('fs');
const path = require('path');
const { scanForTemplateImports, TEMPLATE_OWNED_PREFIXES } = require('./template-update-utils.js');

// ─── Constants ────────────────────────────────────────────────────────────────

const SRC_DIR = path.resolve(__dirname, '..', 'src');
const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']);

/** Template-owned path prefixes to scan for in import statements */
const TEMPLATE_PATHS_TO_CHECK = [
  ...TEMPLATE_OWNED_PREFIXES,
  // Also check root config files that users might mistakenly import
  '_bmad',
  '.github',
  'scripts/template-update',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Recursively collect all source files under a directory.
 * @param {string} dir
 * @param {string[]} [result]
 * @returns {string[]}
 */
function collectSourceFiles(dir, result = []) {
  if (!fs.existsSync(dir)) return result;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue; // skip hidden
    if (entry.name === 'node_modules') continue;

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectSourceFiles(fullPath, result);
    } else if (entry.isFile() && SOURCE_EXTENSIONS.has(path.extname(entry.name))) {
      result.push(fullPath);
    }
  }
  return result;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  if (!fs.existsSync(SRC_DIR)) {
    console.log('ℹ️  No src/ directory found — compat check skipped.');
    process.exit(0);
  }

  const files = collectSourceFiles(SRC_DIR);
  /** @type {Array<{ file: string, imports: string[] }>} */
  const violations = [];

  for (const filePath of files) {
    let contents;
    try {
      contents = fs.readFileSync(filePath, 'utf8');
    } catch {
      continue; // skip unreadable files
    }

    const found = scanForTemplateImports(contents, TEMPLATE_PATHS_TO_CHECK);
    if (found.length > 0) {
      violations.push({ file: path.relative(process.cwd(), filePath), imports: found });
    }
  }

  if (violations.length === 0) {
    console.log('✅ compat:check — No template-owned imports found in src/. Your code is clean.');
    process.exit(0);
  }

  console.log('\n⚠️  compat:check — Advisory: template-owned imports detected in src/\n');
  console.log('These imports couple your application code to template internals.');
  console.log('Template updates may silently break your code if these paths change.\n');

  for (const { file, imports } of violations) {
    console.log(`  📄 ${file}`);
    for (const imp of imports) {
      console.log(`     └─ imports: '${imp}'`);
    }
  }

  console.log(
    '\n💡 Recommendation: replace template-owned imports with your own abstractions in src/.'
  );
  console.log('   This is advisory only — your update has proceeded normally.\n');

  // Always exit 0 — advisory, not a blocker
  process.exit(0);
}

main();
