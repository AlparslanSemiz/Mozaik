// Vite's `?raw` import, declared once.
//
// `tsconfig.json` sets `types: ["vitest/globals"]` on purpose, so `vite/client`
// is not pulled in wholesale — this project deliberately does not have Node's
// globals in scope inside `src/`, and a stray `process` or `Buffer` compiling
// silently would be exactly the wrong thing in a file that ships to a browser.
// One declaration is cheaper than that whole surface.
declare module '*?raw' {
  const text: string;
  export default text;
}

// ...and the same reasoning for the one other thing Vite lends us: `i18n.test.ts`
// reads every source file to find dictionary entries nothing asks for any more,
// and it does that through Vite rather than `node:fs` for exactly the reason
// above. Only the shape this project actually calls is declared.
interface ImportMeta {
  glob(
    pattern: string | string[],
    options: { query: string; import: string; eager: true },
  ): Record<string, unknown>;

  // The same reader asked for NAMES ONLY. `docs.test.ts` needs to know which
  // files are on disk so it can tell a stale path in a document from a real
  // one, and a lazy glob answers that with its keys without loading a byte.
  //
  // It has to be lazy. The eager form over a wildcard extension inlines every
  // file it matches, and this tree carries a woff2, an .ico and a folder of
  // screenshots: the run died on a V8 heap limit before a single test started
  // (pitfall 111).
  glob(pattern: string | string[]): Record<string, () => Promise<unknown>>;
}
