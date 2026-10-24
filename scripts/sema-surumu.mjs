// Which schema a commit's plans are written in, read from its source, for
// `npm run yayinla`: a release whose schema moved since the last tag waits for
// the upgrade gate (`.github/workflows/guncelleme-windows.yml`), because that
// release is the one that migrates my father's data the first time his exe
// updates. A release with the same schema opens the same data the same way,
// and the gate stays optional for it.

/** `SCHEMA_VERSION` as `src/leaf/types.ts` declares it. Throws if it is not there. */
export function semaSurumu(typesTs) {
  const m = /^export const SCHEMA_VERSION = (\d+);$/m.exec(typesTs);
  if (m === null) throw new Error('src/leaf/types.ts içinde SCHEMA_VERSION bulunamadı.');
  return Number(m[1]);
}

/** The last release tag reachable from HEAD, from `git tag --merged HEAD`'s lines. */
export function sonEtiket(etiketler) {
  const surumler = etiketler
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => /^v\d+\.\d+\.\d+$/.test(s))
    .map((ad) => ({ ad, sayi: ad.slice(1).split('.').map(Number) }));
  surumler.sort((a, b) => {
    for (let i = 0; i < 3; i++) if (a.sayi[i] !== b.sayi[i]) return a.sayi[i] - b.sayi[i];
    return 0;
  });
  return surumler.at(-1)?.ad ?? null;
}
