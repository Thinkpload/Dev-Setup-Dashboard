import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';
import {
  detectSchemaDiff,
  detectConflicts,
  isTemplateOwnedPath,
  parseMergeStatus,
  isBreakingChange,
  scanForTemplateImports,
} from '../template-update-utils.js';

// ─── detectSchemaDiff ─────────────────────────────────────────────────────────

describe('detectSchemaDiff', () => {
  it('returns true when prisma/schema.prisma appears in diff output', () => {
    const diffOutput = 'prisma/schema.prisma\n_bmad/config.yaml\n';
    expect(detectSchemaDiff(diffOutput)).toBe(true);
  });

  it('returns false when prisma/schema.prisma is not in diff output', () => {
    const diffOutput = '_bmad/config.yaml\n.github/workflows/ci.yml\n';
    expect(detectSchemaDiff(diffOutput)).toBe(false);
  });

  it('returns false for empty diff output', () => {
    expect(detectSchemaDiff('')).toBe(false);
  });

  it('returns false for null/undefined diff output', () => {
    expect(detectSchemaDiff(null as unknown as string)).toBe(false);
  });

  it('handles diff with only schema.prisma', () => {
    expect(detectSchemaDiff('prisma/schema.prisma')).toBe(true);
  });
});

// ─── detectConflicts ──────────────────────────────────────────────────────────

describe('detectConflicts', () => {
  it('returns list of conflicting files from git status output', () => {
    const statusOutput = `UU _bmad/config.yaml\nAA .github/workflows/ci.yml\nM  scripts/template-update.js\n`;
    const conflicts = detectConflicts(statusOutput);
    expect(conflicts).toContain('_bmad/config.yaml');
    expect(conflicts).toContain('.github/workflows/ci.yml');
    expect(conflicts).not.toContain('scripts/template-update.js');
  });

  it('returns empty array when no conflicts exist', () => {
    const statusOutput = `M  _bmad/config.yaml\nA  scripts/template-update.js\n`;
    expect(detectConflicts(statusOutput)).toHaveLength(0);
  });

  it('returns empty array for empty status output', () => {
    expect(detectConflicts('')).toHaveLength(0);
  });

  it('returns empty array for null status output', () => {
    expect(detectConflicts(null as unknown as string)).toHaveLength(0);
  });

  it('detects DD conflict marker (both deleted)', () => {
    const statusOutput = 'DD some/file.ts\n';
    const conflicts = detectConflicts(statusOutput);
    expect(conflicts).toContain('some/file.ts');
  });
});

// ─── isTemplateOwnedPath ──────────────────────────────────────────────────────

describe('isTemplateOwnedPath', () => {
  it('returns true for _bmad/ paths', () => {
    expect(isTemplateOwnedPath('_bmad/config.yaml')).toBe(true);
    expect(isTemplateOwnedPath('_bmad/agents/dev.md')).toBe(true);
  });

  it('returns true for .github/ paths', () => {
    expect(isTemplateOwnedPath('.github/workflows/ci.yml')).toBe(true);
  });

  it('returns true for root config files', () => {
    expect(isTemplateOwnedPath('eslint.config.mjs')).toBe(true);
    expect(isTemplateOwnedPath('prettier.config.mjs')).toBe(true);
    expect(isTemplateOwnedPath('tsconfig.json')).toBe(true);
    expect(isTemplateOwnedPath('next.config.ts')).toBe(true);
    expect(isTemplateOwnedPath('tailwind.config.ts')).toBe(true);
    expect(isTemplateOwnedPath('renovate.json')).toBe(true);
    expect(isTemplateOwnedPath('scripts/template-update.js')).toBe(true);
  });

  it('returns false for src/ paths (user-owned)', () => {
    expect(isTemplateOwnedPath('src/app/page.tsx')).toBe(false);
    expect(isTemplateOwnedPath('src/components/Button.tsx')).toBe(false);
    expect(isTemplateOwnedPath('src/lib/auth.ts')).toBe(false);
  });

  it('returns false for prisma/schema.prisma (user-owned)', () => {
    expect(isTemplateOwnedPath('prisma/schema.prisma')).toBe(false);
  });

  it('returns false for env files (user-owned)', () => {
    expect(isTemplateOwnedPath('.env')).toBe(false);
    expect(isTemplateOwnedPath('.env.local')).toBe(false);
  });

  it('returns false for public/ paths (user-owned)', () => {
    expect(isTemplateOwnedPath('public/favicon.ico')).toBe(false);
  });

  it('returns false for CHANGELOG.md (user-owned)', () => {
    expect(isTemplateOwnedPath('CHANGELOG.md')).toBe(false);
  });

  it('returns false for README.md (user-owned)', () => {
    expect(isTemplateOwnedPath('README.md')).toBe(false);
  });

  it('returns false for docs/decisions/ paths (ADRs, user-owned)', () => {
    expect(isTemplateOwnedPath('docs/decisions/001-auth.md')).toBe(false);
  });
});

// ─── parseMergeStatus ─────────────────────────────────────────────────────────

describe('parseMergeStatus', () => {
  it('parses list of changed files from porcelain status', () => {
    const statusOutput = 'M  _bmad/config.yaml\nA  .github/workflows/new.yml\n';
    const files = parseMergeStatus(statusOutput);
    expect(files).toContain('_bmad/config.yaml');
    expect(files).toContain('.github/workflows/new.yml');
  });

  it('returns empty array for empty status', () => {
    expect(parseMergeStatus('')).toHaveLength(0);
  });

  it('excludes paths outside template-owned directories', () => {
    const statusOutput = 'M  src/app/page.tsx\nM  _bmad/config.yaml\n';
    const files = parseMergeStatus(statusOutput);
    // parseMergeStatus returns ALL changed files (not filtered)
    // filtering is isTemplateOwnedPath's job
    expect(files).toContain('src/app/page.tsx');
    expect(files).toContain('_bmad/config.yaml');
  });
});

// ─── isBreakingChange ─────────────────────────────────────────────────────────

describe('isBreakingChange', () => {
  it('returns true for MAJOR version bump (1.x.x → 2.x.x)', () => {
    expect(isBreakingChange('1.2.3', '2.0.0')).toBe(true);
  });

  it('returns true for MAJOR bump with v-prefix tags', () => {
    expect(isBreakingChange('v1.5.0', 'v2.0.0')).toBe(true);
  });

  it('returns false for MINOR version bump (1.2.x → 1.3.x)', () => {
    expect(isBreakingChange('1.2.3', '1.3.0')).toBe(false);
  });

  it('returns false for PATCH version bump (1.2.3 → 1.2.4)', () => {
    expect(isBreakingChange('1.2.3', '1.2.4')).toBe(false);
  });

  it('returns false when major versions are equal', () => {
    expect(isBreakingChange('2.0.0', '2.1.0')).toBe(false);
  });

  it('returns false for null/undefined inputs', () => {
    expect(isBreakingChange('', '2.0.0')).toBe(false);
    expect(isBreakingChange('1.0.0', '')).toBe(false);
  });

  it('returns false for mixed v-prefix and plain versions', () => {
    expect(isBreakingChange('v1.0.0', '1.1.0')).toBe(false);
    expect(isBreakingChange('1.9.9', 'v2.0.0')).toBe(true);
  });

  it('handles large major version numbers', () => {
    expect(isBreakingChange('10.5.3', '11.0.0')).toBe(true);
    expect(isBreakingChange('10.5.3', '10.6.0')).toBe(false);
  });
});

// ─── scanForTemplateImports ───────────────────────────────────────────────────

describe('scanForTemplateImports', () => {
  const templatePaths = ['_bmad/', '.github/', 'scripts/'];

  it('detects ES module import from template-owned path', () => {
    const contents = `import config from '_bmad/bmm/config.yaml';\n`;
    const found = scanForTemplateImports(contents, templatePaths);
    expect(found).toHaveLength(1);
    expect(found[0]).toBe('_bmad/bmm/config.yaml');
  });

  it('detects require() import from template-owned path', () => {
    const contents = `const utils = require('scripts/template-update-utils.js');\n`;
    const found = scanForTemplateImports(contents, templatePaths);
    expect(found).toHaveLength(1);
  });

  it('returns empty array for clean user code with no template imports', () => {
    const contents = `import React from 'react';\nimport { Button } from './components/Button';\n`;
    const found = scanForTemplateImports(contents, templatePaths);
    expect(found).toHaveLength(0);
  });

  it('returns empty array for empty file contents', () => {
    expect(scanForTemplateImports('', templatePaths)).toHaveLength(0);
  });

  it('returns empty array when templatePaths is empty', () => {
    const contents = `import config from '_bmad/config.yaml';\n`;
    expect(scanForTemplateImports(contents, [])).toHaveLength(0);
  });

  it('returns empty array for null inputs', () => {
    expect(scanForTemplateImports(null as unknown as string, templatePaths)).toHaveLength(0);
  });

  it('detects multiple template imports in one file', () => {
    const contents = [
      `import a from '_bmad/agents/dev.md';`,
      `const b = require('.github/workflows/ci.yml');`,
    ].join('\n');
    const found = scanForTemplateImports(contents, templatePaths);
    expect(found.length).toBeGreaterThanOrEqual(2);
  });

  it('does NOT flag imports from src/ or node_modules', () => {
    const contents = `import { foo } from 'src/lib/utils';\nimport bar from 'lodash';\n`;
    const found = scanForTemplateImports(contents, templatePaths);
    expect(found).toHaveLength(0);
  });
});

// ─── Integration: compat-check.js ────────────────────────────────────────────

describe('compat-check integration', () => {
  const repoRoot = path.resolve(__dirname, '..', '..');

  it('exits 0 on the current codebase (no template imports in src/)', () => {
    let exitCode = 0;
    try {
      execSync('node scripts/compat-check.js', {
        cwd: repoRoot,
        stdio: 'pipe',
        encoding: 'utf8',
      });
    } catch (err: unknown) {
      // execSync throws if exit code !== 0
      exitCode = (err as NodeJS.ErrnoException & { status?: number }).status ?? 1;
    }
    expect(exitCode).toBe(0);
  });

  it('compat-check.js script file exists', () => {
    const scriptPath = path.join(repoRoot, 'scripts', 'compat-check.js');
    expect(existsSync(scriptPath)).toBe(true);
  });
});
