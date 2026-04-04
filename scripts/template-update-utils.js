// @ts-check
'use strict';

/**
 * Template Update Utilities
 *
 * Pure functions extracted from template-update.js for unit testability.
 * No shell invocations here — only data parsing and path classification.
 */

/**
 * Template-owned paths that the update script is allowed to merge.
 * Any path NOT in this list is user-owned and must never be touched.
 */
const TEMPLATE_OWNED_PREFIXES = ['_bmad/', '.github/', 'scripts/'];

const TEMPLATE_OWNED_ROOT_FILES = new Set([
  'eslint.config.mjs',
  'prettier.config.mjs',
  'tsconfig.json',
  'next.config.ts',
  'tailwind.config.ts',
  'renovate.json',
]);

/**
 * Returns true if the given file path belongs to a template-owned location.
 * @param {string} filePath
 * @returns {boolean}
 */
function isTemplateOwnedPath(filePath) {
  if (!filePath) return false;

  // Check prefix-based ownership
  for (const prefix of TEMPLATE_OWNED_PREFIXES) {
    if (filePath.startsWith(prefix)) return true;
  }

  // Check exact root-file match
  if (TEMPLATE_OWNED_ROOT_FILES.has(filePath)) return true;

  return false;
}

/**
 * Detects if `prisma/schema.prisma` appears in a git diff --name-only output.
 * @param {string | null | undefined} diffOutput
 * @returns {boolean}
 */
function detectSchemaDiff(diffOutput) {
  if (!diffOutput) return false;
  return diffOutput.includes('prisma/schema.prisma');
}

/**
 * Conflict markers in `git status --porcelain` output.
 * Both characters of the XY code must be checked; conflicts use:
 *   UU, AA, DD, AU, UA, DU, UD
 */
const CONFLICT_CODES = new Set(['UU', 'AA', 'DD', 'AU', 'UA', 'DU', 'UD']);

/**
 * Parses `git status --porcelain` output and returns a list of conflicting file paths.
 * @param {string | null | undefined} statusOutput
 * @returns {string[]}
 */
function detectConflicts(statusOutput) {
  if (!statusOutput) return [];

  return statusOutput
    .split('\n')
    .filter((line) => line.length >= 4)
    .filter((line) => CONFLICT_CODES.has(line.slice(0, 2)))
    .map((line) => line.slice(3).trim())
    .filter(Boolean);
}

/**
 * Parses `git status --porcelain` output and returns a list of ALL changed file paths.
 * Does not filter by ownership — callers use isTemplateOwnedPath for that.
 * @param {string | null | undefined} statusOutput
 * @returns {string[]}
 */
function parseMergeStatus(statusOutput) {
  if (!statusOutput) return [];

  return statusOutput
    .split('\n')
    .filter((line) => line.length >= 4)
    .map((line) => line.slice(3).trim())
    .filter(Boolean);
}

/**
 * Determines whether upgrading from `prev` to `next` constitutes a MAJOR (breaking) version bump.
 * Policy: breaking changes are only allowed in MAJOR releases (MAJOR.MINOR.PATCH).
 *
 * @param {string} prev - Previous version, e.g. "1.2.3" or "v1.2.3"
 * @param {string} next - Next version, e.g. "2.0.0" or "v2.0.0"
 * @returns {boolean} true if this is a MAJOR bump (breaking change permitted); false for MINOR/PATCH
 */
function isBreakingChange(prev, next) {
  if (!prev || !next) return false;
  const prevMajor = Number(prev.replace(/^v/, '').split('.')[0]);
  const nextMajor = Number(next.replace(/^v/, '').split('.')[0]);
  if (isNaN(prevMajor) || isNaN(nextMajor)) return false;
  return nextMajor > prevMajor;
}

/**
 * Scans file contents for import statements referencing template-owned paths.
 * Used by compat-check.js to advise users of potential coupling to template internals.
 *
 * @param {string} fileContents - Contents of a source file
 * @param {string[]} templatePaths - Array of template-owned path prefixes (e.g. ['_bmad/', '.github/'])
 * @returns {string[]} Array of matched import strings (empty = clean)
 */
function scanForTemplateImports(fileContents, templatePaths) {
  if (!fileContents || !templatePaths || templatePaths.length === 0) return [];

  const results = [];
  // Match: import ... from '...' / require('...') / import('...')
  const importPatterns = [
    /(?:import\s+.*?\s+from\s+['"])([^'"]+)(['"])/g,
    /(?:require\s*\(\s*['"])([^'"]+)(['"])/g,
    /(?:import\s*\(\s*['"])([^'"]+)(['"])/g,
  ];

  for (const pattern of importPatterns) {
    let match;
    while ((match = pattern.exec(fileContents)) !== null) {
      const importPath = match[1];
      for (const templatePath of templatePaths) {
        // Normalize: remove leading ./ or / for comparison
        const normalized = importPath.replace(/^\.{0,2}\//, '');
        if (
          normalized.startsWith(templatePath) ||
          importPath.includes('/' + templatePath.replace(/\/$/, '') + '/')
        ) {
          results.push(importPath);
          break;
        }
      }
    }
  }

  return results;
}

module.exports = {
  isTemplateOwnedPath,
  detectSchemaDiff,
  detectConflicts,
  parseMergeStatus,
  isBreakingChange,
  scanForTemplateImports,
  TEMPLATE_OWNED_PREFIXES,
  TEMPLATE_OWNED_ROOT_FILES,
};
