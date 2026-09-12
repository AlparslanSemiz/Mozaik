// Linting, started narrow on purpose: the rule that would have caught the
// hook-order crash in Availability and Print (fixed in 511b8b4) and the
// dependency warnings next to it. The wider recommended sets come in one rule
// family at a time, each with its findings read, not as a wall of noise.
//
// `strictTypeChecked` WAS turned on whole, once, to see what it says: 1228
// errors in 6,6 s. Read by class rather than counted, and four rules survived.
// What did not, and why — every line of it measured rather than assumed:
//
//   no-non-null-assertion (524)          `!` is how this codebase reads an
//                                        index it has already bounds-checked.
//                                        The rule is a style disagreement.
//   no-confusing-void-expression (260)   same.
//   restrict-template-expressions (163)  `${day}|${hour}` is how every cell key
//                                        in the program is built.
//   no-unsafe-* (155)                    152 of them are in `store.test.ts`,
//                                        where `as unknown as` is the point of
//                                        the test. The other three are real but
//                                        do not carry a rule on their own.
//   no-unnecessary-condition (27)        THE rule this round expected most from,
//                                        because the mutation run had marked
//                                        branches as never taken. Read one by
//                                        one it does not deliver: the two
//                                        "always falsy" hits are a `let` flag
//                                        mutated inside a closure that TS
//                                        cannot narrow, and the rest are
//                                        deliberate defensive checks around the
//                                        DOM. Turning it on would ask for those
//                                        guards to be deleted.
//   no-implied-eval (2)                  `preferences.test.ts` builds a function
//                                        out of index.html's inline script on
//                                        purpose — that IS the measurement.
//
// The prediction before the run was one to four hundred findings. It was 1228,
// and the gap is itself the finding: a wall of noise is what happens when a
// rule set is adopted by name instead of by reading.
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
    languageOptions: {
      parser: tseslint.parser,
      // Type information, for the four rules below. It costs a few seconds and
      // buys the only findings that survived being read one by one.
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    plugins: { 'react-hooks': reactHooks, '@typescript-eslint': tseslint.plugin },
    linterOptions: { reportUnusedDisableDirectives: 'warn' },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // A promise nobody waits for: a rejected one is a silent failure, and an
      // async handler passed where a void return is expected is the same thing
      // wearing JSX.
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',

      // Casts and conversions the types already guarantee. No false positive is
      // possible by construction: the rule fires only when the assertion cannot
      // change the type.
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/no-unnecessary-type-conversion': 'error',
    },
  },
]);
