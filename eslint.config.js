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
//   no-unnecessary-type-conversion (11)  turned on, read, turned off again.
//                                        Every hit is a real no-op (`String(v)`
//                                        on a string, `Number(version)` on a
//                                        number) and not one of them can hide
//                                        anything: unlike a cast, a redundant
//                                        conversion keeps no promise about a
//                                        type. Four of the eleven are storage
//                                        stubs mirroring what the browser does
//                                        to a value on the way in, which is the
//                                        point of the stub.
//
// The prediction before the run was one to four hundred findings. It was 1228,
// and the gap is itself the finding: a wall of noise is what happens when a
// rule set is adopted by name instead of by reading.
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

/** Browser storage, which only its owners may touch (the overrides below). */
const STORAGE = ['localStorage', 'sessionStorage', 'indexedDB'];
const STORAGE_MESSAGE =
  'Storage is read and written by its owners only: leaf/preference.ts, the stores in platform/.';

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
      // `attributes: false` and the reason is the fourteen sites it reported:
      // every one is an async `onClick`/`onChange` whose body awaits a dialog.
      // React drops the returned promise, so the rule is right in principle,
      // but the alternative at each site is `() => { void (async () => …)(); }`
      // — noise at fourteen call sites to describe a rejection that cannot
      // happen (`confirm` and `alert` here resolve, they do not reject). What
      // the rule still guards is the half that IS a bug: a promise used as a
      // condition, spread, or passed where a synchronous value is read.
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: { attributes: false } },
      ],

      // A cast the types already guarantee. It is not only clutter: a cast
      // keeps compiling after the type under it changes, so an unnecessary one
      // is a place where the compiler has been asked not to look.
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',

      // Not a style rule: a tool limit. Stryker's instrumenter rebuilds every
      // `++`/`--` it mutates through Babel, and Babel refuses a non-null
      // assertion as the operand, so one `weight[index]!++` stops the whole
      // mutation run before it starts. It did, from 2026-09-24 until
      // 2026-10-09, and 2.2.0 shipped without a mutation run. `x! += 1` and
      // `x = x! + 1` are fine; only the update operators break.
      'no-restricted-syntax': [
        'error',
        {
          selector: 'UpdateExpression > TSNonNullExpression.argument',
          message: 'Stryker cannot instrument `x!++` / `x!--`; write `x = x! + 1` (pitfall 147).',
        },
      ],

      // Rules ARCHITECTURE states in prose, written down the day each one was
      // green (2026-10-09), and each shown red with one offending line in a copy.
      //
      // Ids come from `newId()` alone (the override below). Everywhere else
      // randomness has to be repeatable: the solver and the sample school draw
      // from a seeded generator, so a run can be replayed.
      'no-restricted-properties': [
        'error',
        {
          object: 'Math',
          property: 'random',
          message:
            'Only newId() in pure/entities.ts draws from Math.random; use a seeded generator.',
        },
      ],
      // Storage has owners (ARCHITECTURE, "Durum, tercih ve depolama"): the
      // preference factory, the two stores, the storage report and the folder's
      // handle. A component or a rule that reads storage itself is a second
      // place the data lives. Tests are exempt below.
      'no-restricted-globals': [
        'error',
        ...STORAGE.map((name) => ({ name, message: STORAGE_MESSAGE })),
      ],
    },
  },
  {
    files: ['src/pure/entities.ts'],
    rules: { 'no-restricted-properties': 'off' },
  },
  {
    files: [
      'src/leaf/preference.ts',
      'src/platform/folder.ts',
      'src/platform/libraryStore.ts',
      'src/platform/planStore.ts',
      'src/platform/storageReport.ts',
      'src/**/*.test.{ts,tsx}',
    ],
    rules: { 'no-restricted-globals': 'off' },
  },
  {
    // The pure layer knows no React, no DOM and no storage (ARCHITECTURE,
    // "Saf mantık"). dependency-cruiser cannot say it: its parser invents a
    // React import out of a generic arrow function (.dependency-cruiser.cjs).
    // A global is only a global here: `relax.ts`'s local `window` is not one.
    files: ['src/pure/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              // gitignore-style: 'react' also covers 'react/jsx-runtime', and
              // 'react-dom' covers 'react-dom/client'; both measured.
              group: ['react', 'react-dom', '@radix-ui/*', 'lucide-react'],
              message: 'The pure layer does not import React or a component library.',
            },
          ],
        },
      ],
      'no-restricted-globals': [
        'error',
        ...STORAGE.map((name) => ({ name, message: STORAGE_MESSAGE })),
        ...['document', 'window', 'navigator', 'location', 'history'].map((name) => ({
          name,
          message: 'The pure layer does not touch the DOM; the caller passes what it needs.',
        })),
      ],
    },
  },
]);
