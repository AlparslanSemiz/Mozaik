// Parser for Excel paste. PURE functions.
//
// Typing 300+ rows one by one during first setup is where my father would give
// up. Copy-paste from Excel turns that from hours into minutes.
//
// The parser NEVER adds data directly: it returns {accepted, errors}, the user
// sees a preview and only then confirms.

// makeShort lives in entities.ts (one home); re-exported so callers and the
// existing tests do not have to care where it moved.
export { makeShort } from './index';
import { MAX_BLOCK } from '../schedule/blocks';
import { t } from '../i18n';
import { makeShort, parseGender } from './index';
import type { Gender } from '../types';

export interface ParseResult<T> {
  accepted: T[];
  errors: string[];
}

/**
 * Turns pasted text into a grid of cells.
 * Excel separates with tabs; semicolons and commas are also accepted for
 * hand-written lists. Empty lines are dropped.
 */
export function splitGrid(text: string): string[][] {
  return text
    .split(/\r\n|\n|\r/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      const sep = line.includes('\t') ? '\t' : line.includes(';') ? ';' : ',';
      return line.split(sep).map((cell) => cell.trim());
    });
}

function toNumber(text: string | undefined, fallback: number): number {
  const n = Number(String(text ?? '').replace(',', '.'));
  return Number.isFinite(n) && n > 0 ? Math.round(n) : fallback;
}

/** Skips the header row (when the first cell is a known header word). */
function isHeader(cells: string[], words: string[]): boolean {
  const first = (cells[0] ?? '').toLocaleLowerCase('tr');
  return words.some((w) => first === w);
}

// --------------------------------------------------------------------- room

/** One row = one room name. */
export function parseRooms(text: string): ParseResult<{ name: string }> {
  const accepted: Array<{ name: string }> = [];
  const errors: string[] = [];
  const seen = new Set<string>();

  for (const [i, cells] of splitGrid(text).entries()) {
    if (i === 0 && isHeader(cells, ['derslik', 'oda', 'ad'])) continue;
    const name = cells[0] ?? '';
    if (name === '') continue;
    if (seen.has(name)) {
      errors.push(t('{n}. satır: "{ad}" iki kez geçiyor, biri alındı.', { n: i + 1, ad: name }));
      continue;
    }
    seen.add(name);
    accepted.push({ name });
  }
  return { accepted, errors };
}

// ------------------------------------------------------------------ teacher

export interface TeacherRow {
  name: string;
  short: string;
  subject: string;
  gender: Gender;
  /** The teacher's other subject, or '' — see `Teacher.subject2`. */
  subject2: string;
}

/**
 * Columns: Ad · Kısaltma · Branş · Cinsiyet · İkinci branş
 *
 * Columns four and five each arrived after the ones before them and each stays
 * OPTIONAL: a list pasted in the old three- or four-column shape reads
 * `undefined` there, which becomes "not stated" and "no second subject".
 * Nobody has to re-paste anything.
 *
 * The second subject is APPENDED rather than slotted in beside the first,
 * which would read better and would silently turn every existing four-column
 * paste into a list of teachers whose second subject is "Erkek".
 */
export function parseTeachers(text: string): ParseResult<TeacherRow> {
  const accepted: TeacherRow[] = [];
  const errors: string[] = [];

  for (const [i, cells] of splitGrid(text).entries()) {
    if (i === 0 && isHeader(cells, ['ad', 'isim', 'öğretmen', 'ogretmen'])) continue;
    const name = cells[0] ?? '';
    if (name === '') continue;

    const subject = cells[2] ?? '';
    if (subject === '')
      errors.push(t('{n}. satır: "{ad}" için branş boş.', { n: i + 1, ad: name }));

    accepted.push({
      name,
      // If the short form is left empty, derive it: "Mehmet Çelik" -> "MÇ"
      short: (cells[1] ?? '') || makeShort(name),
      subject,
      gender: parseGender(cells[3] ?? ''),
      subject2: cells[4] ?? '',
    });
  }
  return { accepted, errors };
}


// -------------------------------------------------------------------- class

export interface ClassRow {
  name: string;
  roomName: string;
}

/** Columns: Sınıf · Derslik (room may be empty) */
export function parseClasses(text: string): ParseResult<ClassRow> {
  const accepted: ClassRow[] = [];
  const errors: string[] = [];
  const seen = new Set<string>();

  for (const [i, cells] of splitGrid(text).entries()) {
    if (i === 0 && isHeader(cells, ['sınıf', 'sinif', 'grup', 'ad'])) continue;
    const name = cells[0] ?? '';
    if (name === '') continue;
    if (seen.has(name)) {
      errors.push(
        t('{n}. satır: "{ad}" sınıfı iki kez geçiyor, biri alındı.', { n: i + 1, ad: name }),
      );
      continue;
    }
    seen.add(name);
    accepted.push({ name, roomName: cells[1] ?? '' });
  }
  return { accepted, errors };
}

// ------------------------------------------------------------------- lesson

export interface LessonRow {
  className: string;
  teacher: string; // full name or short form
  weeklyHours: number;
  /** The blocks longer than an hour, biggest first. See `Lesson.blocks`. */
  blocks: number[];
}

/**
 * Columns: Sınıf · Öğretmen · Haftalık saat · Blok (empty block = 1)
 *
 * The fourth column stays a BLOCK LENGTH and not a "2+2+1" pattern: it is a
 * column somebody copies out of a spreadsheet, and a spreadsheet says how long
 * a block is, not how the week is shaped. It is read as "make the blocks this
 * long and let the remainder be singles" — 9 hours at 4 is 4+4+1. 1 means no
 * blocks at all, and anything above 3 is clamped to 3.
 */
export function parseLessons(text: string): ParseResult<LessonRow> {
  const accepted: LessonRow[] = [];
  const errors: string[] = [];

  for (const [i, cells] of splitGrid(text).entries()) {
    if (i === 0 && isHeader(cells, ['sınıf', 'sinif', 'grup'])) continue;
    const className = cells[0] ?? '';
    const teacher = cells[1] ?? '';
    if (className === '' && teacher === '') continue;

    if (className === '' || teacher === '') {
      errors.push(t('{n}. satır: sınıf veya öğretmen boş, atlandı.', { n: i + 1 }));
      continue;
    }
    const weeklyHours = toNumber(cells[2], 0);
    if (weeklyHours === 0) {
      errors.push(
        t('{n}. satır: "{sinif} / {kim}" için saat okunamadı, atlandı.', {
          n: i + 1,
          sinif: className,
          kim: teacher,
        }),
      );
      continue;
    }
    const blockSize = Math.max(1, Math.min(MAX_BLOCK, toNumber(cells[3], 1)));
    const blocks =
      blockSize >= 2
        ? Array<number>(Math.floor(weeklyHours / blockSize)).fill(blockSize)
        : [];
    accepted.push({ className, teacher, weeklyHours, blocks });
  }
  return { accepted, errors };
}
