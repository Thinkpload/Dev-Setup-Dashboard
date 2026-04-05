#!/usr/bin/env node
/* eslint-env node */
// scripts/check-secrets.js
// Cross-platform replacement for check-secrets.sh
// Checks staged files for accidental secret patterns before commit

import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const stagedOutput = execSync('git diff --cached --name-only', { encoding: 'utf-8' }).trim();

if (!stagedOutput) process.exit(0);

const stagedFiles = stagedOutput.split('\n').filter(Boolean);

// Check for .env files being committed
const envFilePattern = /(^|\/)\.env(\.[a-z]+)?$/;
for (const file of stagedFiles) {
  if (envFilePattern.test(file)) {
    console.error('❌ Potential secret detected: .env file staged for commit');
    console.error('   Remove it from staging: git reset HEAD <file>');
    console.error('   Add .env to .gitignore if not already there');
    process.exit(1);
  }
}

// Check file contents for secret patterns
const secretPattern = /(SECRET_KEY|_SECRET|API_KEY|PASSWORD)\s*=\s*\S+/;
const skipPattern = /(__tests__|\.test\.|\.spec\.|check-secrets\.)/;

for (const file of stagedFiles) {
  if (skipPattern.test(file)) continue;
  if (!existsSync(file)) continue;

  let content;
  try {
    content = execSync(`git show ":${file}"`, { encoding: 'utf-8' });
  } catch {
    continue;
  }

  if (secretPattern.test(content)) {
    console.error(`❌ Potential secret detected in: ${file}`);
    console.error('   Pattern matched: SECRET_KEY=, _SECRET=, API_KEY=, or PASSWORD= with a value');
    console.error('   Move secrets to .env and use process.env instead');
    process.exit(1);
  }
}

process.exit(0);
