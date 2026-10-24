// package-lock.json's version, written by `npm run yayinla` (TODO B7.32).
//
// The lock file's root carries the version twice: at the top and under
// `packages[""]`. `yayinla` used to write package.json and Cargo.toml and leave
// these behind, so the next `npm install` rewrote them and dirtied the tree,
// and the clean-tree gate stopped the next release. Not `npm install
// --package-lock-only`: it may reach the registry, and a release does not need
// the network to change two numbers.

/**
 * The lock file's text with both root versions set to `surum`.
 *
 * Through JSON, and only because npm writes exactly what this writes back
 * (two-space indent, a newline at the end). A file in any other shape is not
 * reformatted: it throws, and the release stops with a sentence.
 */
export function kilitSurumunuYaz(metin, surum) {
  const kilit = JSON.parse(metin);
  if (`${JSON.stringify(kilit, null, 2)}\n` !== metin) {
    throw new Error("package-lock.json npm'in biçiminde değil; yeniden biçimlenmeden yazılamaz.");
  }
  const kok = kilit.packages?.[''];
  if (typeof kilit.version !== 'string' || typeof kok?.version !== 'string') {
    throw new Error('package-lock.json içinde kökün "version" alanları bulunamadı.');
  }
  kilit.version = surum;
  kok.version = surum;
  return `${JSON.stringify(kilit, null, 2)}\n`;
}
