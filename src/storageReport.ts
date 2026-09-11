// "Veriler nerede": which copy of the program this is, which store its work
// sits in, and every key that store holds with its size.
//
// Split out of library.ts on 2026-09-12. It reads the plan library but is not
// part of it: the model says what a plan directory is, and this file answers a
// question the reader asks before they tell somebody what went wrong.
//
// THIS TABLE IS A DEBT, and the debt is the reason the file exists at all:
// every `ders-programi*` key this program writes has to appear in it. Anything
// vaguer is the same as saying nothing, because "it is saved in the browser"
// does not tell somebody that clearing browsing data destroys it.
//
// The debt is kept by DERIVING every key, never by typing one. Plan and backup
// keys come from `library.ts` (`planKey`, `backupKey`, `LIBRARY_KEY`,
// `BACKUP_COUNT`) and preference keys from `preferenceKeys.ts`, which is the
// leaf every preference module takes its own key from. So a preference that
// gets a key gets a row without anybody remembering to add one here. That is
// not a habit, it is measured twice: `library.test.ts` asks the storage itself
// which keys were written and requires each one in the report, and it also
// reads this file and fails if a key is written out by hand.

import { BACKUP_COUNT, backupKey, LIBRARY_KEY, planKey, type Library } from './library';
import { isDesktop } from './desktop';
import { t } from './i18n';
import { PREFERENCE_ROWS } from './preferenceKeys';
import { safely } from './storage';

export type StorageKind = 'file' | 'site' | 'exe';

/**
 * THREE answers now. The third arrived with the exe (task 4g/4h) and not
 * before: an earlier version of this comment said it would be written "then",
 * because a branch for code that does not exist is a guess (the former rule against guessed features).
 *
 * The exe is asked about FIRST. It is served over a normal origin, so the
 * `file:`/site question would answer "site" about it and be true and useless:
 * what a person reading this panel needs to know is not the protocol, it is
 * whether "tarama verilerini temizle" can take their work away.
 */
export function storageKind(): StorageKind {
  if (isDesktop()) return 'exe';
  return safely(() => location.protocol) === 'file:' ? 'file' : 'site';
}

/**
 * WHICH copy of the program this is, in the words the four delivery routes are
 * described in (README). Separate from `StorageKind` on purpose: that type
 * answers "can 'tarama verilerini temizle' take this away", and three of these
 * four routes answer it the same way. This one answers "which one am I
 * looking at", which is the question somebody asks before they tell me what
 * went wrong.
 *
 * The Windows install is a `site` as far as storage goes — it IS an http
 * origin — but calling it "Site" on my father's own machine would send him to
 * look for an internet address that does not exist.
 */
export function routeName(): string {
  if (isDesktop()) return t('Uygulama (.exe)');
  if (safely(() => location.protocol) === 'file:') return t('Dosya (çift tıklanan .html)');
  return safely(() => location.hostname)?.endsWith('.localhost') === true
    ? t('Windows kurulumu')
    : t('Site');
}

/**
 * The address this copy's storage belongs to, verbatim, because "the browser's
 * store for this site" leaves out the one word that matters. Every route has
 * its OWN store, and two of them look identical on screen.
 *
 * '' in the exe: there is an origin there too, but it is an implementation
 * detail of the window rather than somewhere anybody can go.
 */
export function storageAddress(): string {
  if (isDesktop()) return '';
  const origin = safely(() => location.origin) ?? '';
  if (origin === 'file://' || origin === 'null' || origin === '') return 'file://';
  return origin + (safely(() => location.pathname) ?? '');
}

export interface StorageRow {
  key: string;
  what: string;
  /** UTF-16 code units. Doubled for the byte figure: that is what the browser
      charges against its ~5 MB quota, not the UTF-8 length. */
  chars: number;
}

export interface StorageReport {
  rows: StorageRow[];
  totalChars: number;
}

function charsAt(key: string): number {
  return (safely(() => localStorage.getItem(key)) ?? '').length;
}

/** Every key this program owns, in the order they matter. Missing keys are
    listed too, with 0 — an absent backup chain is information as well. */
export function storageReport(lib: Library): StorageReport {
  const rows: StorageRow[] = lib.plans.map((plan) => ({
    key: planKey(plan.id),
    what: plan.draft ? `${plan.name} (taslak)` : plan.name,
    chars: charsAt(planKey(plan.id)),
  }));

  rows.push({ key: LIBRARY_KEY, what: t('plan listesi'), chars: charsAt(LIBRARY_KEY) });
  for (let i = 0; i < BACKUP_COUNT; i++) {
    rows.push({
      key: backupKey(i),
      what: i === 0 ? t('bir önceki oturum') : t('{n} oturum önce', { n: i + 1 }),
      chars: charsAt(backupKey(i)),
    });
  }
  // Every preference key, from the one list their modules take them from. A
  // key that is written and not named here once hid for weeks, twice (the
  // drawer's height and the strip, then the print options), and the one thing
  // this table is for is being trusted when somebody asks "is all of it in here?".
  for (const { key, label } of PREFERENCE_ROWS) {
    rows.push({ key, what: t(label), chars: charsAt(key) });
  }

  return { rows, totalChars: rows.reduce((sum, r) => sum + r.chars, 0) };
}
