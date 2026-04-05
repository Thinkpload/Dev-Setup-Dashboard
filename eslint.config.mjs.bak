import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const config = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    // scripts/*.js are plain CJS Node scripts (require/module.exports) — exempt from ESM rules
    ignores: ['node_modules/**', '.next/**', 'wizard/**', 'drizzle/**', 'scripts/*.js'],
  },
];

export default config;
