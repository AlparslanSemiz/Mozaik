// The Release page of a version (scripts/surum-notu.mjs): the release workflow
// builds it from three hand-kept files, and a version with nothing to say
// stops the run instead of publishing an empty "what is new".

import { describe, expect, it } from 'vitest';

import changelogMd from '../CHANGELOG.md?raw';
import changelogTs from './platform/changelog.ts?raw';
import install from '../.github/surum-notu.md?raw';
import { changelogSection, inAppLines, releaseNotes } from '../scripts/surum-notu.mjs';
import { SURUM_NOTLARI } from './platform/changelog';

describe('Release sayfası — yenilikler ve kurulum', () => {
  it('Yenilikler panelinin satırlarını metinden aynen okuyor', () => {
    // Read as text by the workflow, which has no TS loader; checked here
    // against the module itself, so a quoting the reader misses shows up.
    for (const note of SURUM_NOTLARI) {
      expect(inAppLines(changelogTs, note.version), note.version).toEqual(note.items);
    }
  });

  it('yayınlanmış bir sürümün sayfası üç parçayı da taşıyor', () => {
    const page = releaseNotes('2.1.1', { changelogMd, changelogTs, install });
    expect(page).toContain('## Yenilikler (2.1.1)');
    for (const line of SURUM_NOTLARI.find((x) => x.version === '2.1.1')!.items) {
      expect(page).toContain(`- ${line}`);
    }
    expect(page).toContain("## What's new in 2.1.1");
    expect(page).toContain(changelogSection(changelogMd, '2.1.1')!.split('\n')[2]!);
    expect(page.trimEnd().endsWith(install.trim())).toBe(true);
  });

  it('en yeni not, CHANGELOG kapanınca kendi bölümünü buluyor', () => {
    // What `npm run yayinla` does to CHANGELOG.md before the tag: the
    // Unreleased block closes under the version.
    const top = SURUM_NOTLARI[0]!.version;
    const closed = changelogMd.includes(`## [${top}] - `)
      ? changelogMd
      : changelogMd.replace('## [Unreleased]', `## [Unreleased]\n\n## [${top}] - 2026-01-01`);
    const page = releaseNotes(top, { changelogMd: closed, changelogTs, install });
    expect(page).toContain(`## What's new in ${top}`);
    expect(page).toContain('#### ');
  });

  it('söyleyecek bir şeyi olmayan sürüm yayını durduruyor', () => {
    expect(() => releaseNotes('9.9.9', { changelogMd, changelogTs, install })).toThrow(
      /9\.9\.9 için yenilik yok/,
    );
  });
});
