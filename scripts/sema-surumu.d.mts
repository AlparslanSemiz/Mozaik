// Types for scripts/sema-surumu.mjs, which stays plain .mjs so `npm run yayinla`
// runs it with `node` alone (the same reason as surum.d.mts).

/** `SCHEMA_VERSION` as src/leaf/types.ts declares it; throws when it is not there. */
export function semaSurumu(typesTs: string): number;

/** The highest `vX.Y.Z` among `git tag` lines, or null. */
export function sonEtiket(etiketler: string): string | null;
