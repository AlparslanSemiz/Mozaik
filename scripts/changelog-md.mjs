// CHANGELOG.md, read and closed as TEXT.
//
// `npm run yayinla` closes the Unreleased block under the version it publishes.
// No Markdown library: the file is hand-written prose, and a parse-and-print
// round trip would be free to reformat it. The only line this ever writes is a
// heading, the same way `yayinla.mjs` edits Cargo.toml as text rather than as
// TOML. Why this is hand-written and not a package: docs/DECISIONS.md,
// 2026-09-11.

const UNRELEASED = /^## \[Unreleased\][ \t]*$/m;
const RELEASED = /^## \[(\d+\.\d+\.\d+)\] - (\d{4}-\d{2}-\d{2})[ \t]*$/gm;

/** Every released heading, in file order (newest first, as the file is written). */
export function releasedVersions(text) {
  return [...text.matchAll(RELEASED)].map((m) => ({ version: m[1], date: m[2] }));
}

/** What sits under `## [Unreleased]` until the next `## ` heading, trimmed; null without the heading. */
export function unreleasedBody(text) {
  const m = UNRELEASED.exec(text);
  if (m === null) return null;
  const rest = text.slice(m.index + m[0].length);
  const next = rest.search(/^## /m);
  return (next === -1 ? rest : rest.slice(0, next)).trim();
}

/**
 * Turns the Unreleased block into `## [version] - date` and leaves a fresh,
 * empty Unreleased heading above it. The body moves with the heading, so
 * nothing written under Unreleased is copied or retyped.
 */
export function closeUnreleased(text, version, date) {
  const m = UNRELEASED.exec(text);
  if (m === null) throw new Error('CHANGELOG.md içinde "## [Unreleased]" başlığı yok.');
  return `${text.slice(0, m.index)}## [Unreleased]\n\n## [${version}] - ${date}${text.slice(m.index + m[0].length)}`;
}
