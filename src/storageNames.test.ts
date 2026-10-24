// The names my father's data lives under, pinned as LITERALS.
//
// Every one of these is user data rather than an identifier: renaming a key
// orphans the timetables saved under it, renaming a file pattern makes the
// prune or the reader miss a backup, renaming the Tauri identifier moves the
// exe's whole WebView profile, and bumping the schema without a migration
// makes every older backup unreadable (pitfall 97). Until 2026-10-23 the
// document gate compared DATA.md against the code; that compared two things
// a careless rename could change together. This compares the code against a
// string nobody edits by accident.
//
// A red here is not a test to update. It is a question: did the rename ship a
// migration that still reads the old name? If yes, the old literal moves into
// that migration's own test and this line changes in the same commit.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import tauriConf from '../src-tauri/tauri.conf.json';
import { PREFERENCE_ROWS } from './leaf/preferenceKeys';
import { SCHEMA_VERSION } from './leaf/model/types';
import { DB_NAME, MAIN_NAME, dailyName, prunable, rescueName } from './platform/storage/folder';
import { EXE_FOLDER } from './platform/desktop';
import {
  BACKUP_COUNT,
  BASE_KEY,
  FIRST_PLAN_ID,
  LIBRARY_KEY,
  backupFileName,
  backupKey,
  bundleFileName,
  planKey,
} from './pure/io/library';
import { parseState } from './pure/io/parseState';

const DAY = new Date(2026, 7, 26, 18, 30, 5);

describe('depo adları düz metne karşı', () => {
  it('localStorage anahtarlarının her biri', () => {
    expect(BASE_KEY).toBe('ders-programi');
    expect(LIBRARY_KEY).toBe('ders-programi-planlar');
    expect(planKey(FIRST_PLAN_ID)).toBe('ders-programi');
    expect(planKey('abcd')).toBe('ders-programi-plan-abcd');
    expect(Array.from({ length: BACKUP_COUNT }, (_, i) => backupKey(i))).toEqual([
      'ders-programi-yedek-0',
      'ders-programi-yedek-1',
      'ders-programi-yedek-2',
    ]);
    // Sorted, so a new row is a deliberate edit here and not an ordering detail.
    expect(PREFERENCE_ROWS.map((row) => row.key).sort()).toEqual([
      'ders-programi-arayuz-yogunluk',
      'ders-programi-baski',
      'ders-programi-dil',
      'ders-programi-hareket',
      'ders-programi-havuz',
      'ders-programi-havuz-boy',
      'ders-programi-kenar',
      'ders-programi-musaitlik-saat',
      'ders-programi-olcek',
      'ders-programi-oneri-olcum',
      'ders-programi-program-rengi',
      'ders-programi-serit',
      'ders-programi-serit-gizle',
      'ders-programi-tanitim',
      'ders-programi-tema',
      'ders-programi-yenilik-gorulen',
      'ders-programi-yogunluk',
    ]);
  });

  it('IndexedDB, yedek dosyaları ve exe’nin klasörü', () => {
    expect(DB_NAME).toBe('ders-programi-klasor');
    expect(MAIN_NAME).toBe('ders-programi-tumu.json');
    expect(dailyName(DAY)).toBe('ders-programi-2026-08-26.json');
    expect(rescueName(DAY)).toBe('ders-programi-kurtarma-2026-08-26-183005.json');
    expect(backupFileName(DAY)).toBe('ders-programi-2026-08-26-1830.json');
    expect(bundleFileName(DAY)).toBe('ders-programi-tumu-2026-08-26-1830.json');
    // The prune deletes by pattern, so the pattern is part of the name.
    const days = Array.from({ length: 11 }, (_, i) => `ders-programi-2026-08-${10 + i}.json`);
    expect(prunable(days)).toEqual(['ders-programi-2026-08-10.json']);
    expect(EXE_FOLDER).toBe('Ders Programı');
  });

  it('Tauri kimliği', () => {
    expect(tauriConf.identifier).toBe('com.dersprogrami.arac');
  });
});

describe('şema sürümü düz metne karşı, ve bir artış göç ister', () => {
  const fixture = (version: number) =>
    readFileSync(join(import.meta.dirname, 'fixtures', `v${version}.json`), 'utf8');

  it('bugünkü sürüm 16', () => {
    // A bump changes this literal in the same commit as the migration, the
    // accepted-version list in parseState.ts, and a new `src/fixtures/v17.json`.
    expect(SCHEMA_VERSION).toBe(16);
  });

  it('bugünkü sürümün ve bir öncekinin dosyası açılıyor', () => {
    // The migration half: a bump that forgot the previous number leaves the
    // last released backup unreadable, and one without a new example file has
    // nothing to read here.
    for (const version of [SCHEMA_VERSION - 1, SCHEMA_VERSION]) {
      expect(parseState(fixture(version))?.schemaVersion, `v${version}.json`).toBe(SCHEMA_VERSION);
    }
  });
});
