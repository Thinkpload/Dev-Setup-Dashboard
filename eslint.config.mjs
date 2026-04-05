// Compatible with eslint ^9.19.0 and typescript-eslint ^8.23.0
// Review if major version bumps change flat config API
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default tseslint.config(eslint.configs.recommended, ...tseslint.configs.recommended, {
  files: ['scripts/**/*.js', 'scripts/**/*.mjs', 'scripts/**/*.cjs'],
  languageOptions: {
    globals: globals.node,
  },
});
