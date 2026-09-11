// Linting, started narrow on purpose: the rule that would have caught the
// hook-order crash in Availability and Print (fixed in 511b8b4) and the
// dependency warnings next to it. The wider recommended sets come in one rule
// family at a time, each with its findings read, not as a wall of noise.
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

export default defineConfig([
  {
    ignores: [
      'dist/**',
      'dist-site/**',
      'dist-kurulum/**',
      'scratch/**',
      'src-tauri/**',
      'test-results/**',
      'playwright-report/**',
    ],
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: { parser: tseslint.parser },
    plugins: { 'react-hooks': reactHooks },
    linterOptions: { reportUnusedDisableDirectives: 'warn' },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
]);
