// Parser for Excel paste. PURE functions.
//
// Typing 300+ rows one by one during first setup is where my father would give
// up. Copy-paste from Excel turns that from hours into minutes.
//
// The parser NEVER adds data directly: it returns {accepted, errors}, the user
// sees a preview and only then confirms.

// makeShort lives in entities.ts (one home); re-exported so callers and the
// existing tests do not have to care where it moved.
export { makeShort } from '../entities';
import { MAX_BLOCK, type Gender, cleanEmail, looksLikeEmail } from '../../leaf/model';
import { t } from '../../leaf/i18n';
import { defaultSubjects, makeShort, parseGender } from '../entities';

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
  /** Where Çıktı sends the week, or '' — see `Teacher.email`. */
  email: string;
}

/** What a pasted teacher column is read as; `skip` is "Yok say". */
export type TeacherColumn = 'name' | 'short' | 'subject' | 'subject2' | 'gender' | 'email' | 'skip';

/** The order a list without a header is read in when its cells say nothing. */
const TEACHER_ORDER: TeacherColumn[] = ['name', 'short', 'subject', 'gender', 'subject2', 'email'];

/** A header cell's column, by the word it starts with; `ikinci` before `branş`. */
function headColumn(cell: string): TeacherColumn | null {
  const w = cell.toLocaleLowerCase('tr');
  const starts = (...xs: string[]) => xs.some((x) => w.startsWith(x));
  if (starts('kısa', 'kisa')) return 'short';
  if (starts('ikinci')) return 'subject2';
  if (starts('branş', 'brans') || w === 'ders' || w === 'alan') return 'subject';
  if (starts('cinsiyet')) return 'gender';
  if (starts('e-posta', 'eposta', 'e-mail', 'email')) return 'email';
  // Whole words only: "Adem Yılmaz" on the first row is a teacher.
  return /^(ad|adı|soyad|soyadı|ad soyad|adı soyadı|isim|öğretmen|ogretmen)$/.test(w)
    ? 'name'
    : null;
}

const isAddress = (cell: string | undefined) => looksLikeEmail(cleanEmail(cell));

/**
 * What each pasted column is, and whether the first row is a header. A header
 * row names them (Ad, Adı, Soyadı, Kısa ad, Branş, Ders…). Without one the
 * cells do: a column of known subject names is the branch, short upper-case
 * cells (≤ 4) the short form, E/K the gender, addresses the e-mail. Only what
 * the cells leave open falls to the old order (Ad · Kısaltma · Branş ·
 * Cinsiyet · İkinci branş · E-posta), and never to "Kısa ad": a two-column
 * "Ad · Branş" paste used to put the branch there (walkthrough, 2026-11-16).
 * The reader can change any of them in the preview.
 */
export function teacherColumns(
  grid: string[][],
  known: string[],
): { cols: TeacherColumn[]; header: boolean } {
  const width = Math.max(0, ...grid.map((r) => r.length));
  const first = grid[0] ?? [];
  const named = first.map(headColumn);
  const filled = first.filter((c) => c !== '').length;
  // A header by its first cell or by most of its cells: "Ad Soyad · Branş ·
  // Telefon" is one, and its unknown column is skipped.
  if (named[0] === 'name' || named.filter((c) => c !== null).length * 2 > filled) {
    return { cols: Array.from({ length: width }, (_, k) => named[k] ?? 'skip'), header: true };
  }
  const subjects = new Set(known.map((x) => x.toLocaleLowerCase('tr')));
  const cols: TeacherColumn[] = ['name'];
  const free = (c: TeacherColumn) => !cols.includes(c);
  for (let k = 1; k < width; k++) {
    const cells = grid.map((r) => r[k] ?? '').filter((c) => c !== '');
    const values = cells.filter((c) => !isAddress(c));
    const all = (test: (v: string) => boolean) => values.length > 0 && values.every(test);
    const legacy = TEACHER_ORDER[k];
    let col: TeacherColumn;
    if (values.length === 0) col = cells.length > 0 ? 'email' : (legacy ?? 'skip');
    else if (
      values.filter((v) => subjects.has(v.toLocaleLowerCase('tr'))).length * 2 >=
      values.length
    )
      col = free('subject') ? 'subject' : 'subject2';
    else if (all((v) => parseGender(v) !== '')) col = 'gender';
    else if (free('short') && all((v) => [...v].length <= 4 && v === v.toLocaleUpperCase('tr')))
      col = 'short';
    else if (legacy !== undefined && legacy !== 'short') col = legacy;
    else col = free('subject') ? 'subject' : 'subject2';
    cols.push(free(col) ? col : 'skip');
  }
  return { cols, header: false };
}

/**
 * One row per teacher, read by `given` columns or by `teacherColumns`. Every
 * column past the name is OPTIONAL: an older, shorter paste reads "not
 * stated", "no second subject" and "no address". Two name columns (Adı ·
 * Soyadı) are one name. A cell holding one address is never a short form, a
 * subject or a gender, whichever column it sits in: the first one is the
 * address, and a cell of the e-mail column that is not one is kept as typed.
 */
export function parseTeachers(
  text: string,
  known: string[] = defaultSubjects(),
  given?: TeacherColumn[],
): ParseResult<TeacherRow> {
  const accepted: TeacherRow[] = [];
  const errors: string[] = [];
  const grid = splitGrid(text);
  const found = teacherColumns(grid, known);
  const cols = given ?? found.cols;

  for (const [i, cells] of grid.entries()) {
    if (i === 0 && found.header) continue;
    const of = (c: TeacherColumn) =>
      cells.filter((x, k) => x !== '' && cols[k] === c && (c === 'email' || !isAddress(x)));
    const name = of('name').join(' ');
    if (name === '') continue;
    const subject = of('subject')[0] ?? '';
    if (subject === '')
      errors.push(t('{n}. satır: "{ad}" için branş boş.', { n: i + 1, ad: name }));

    accepted.push({
      name,
      // If the short form is left empty, derive it: "Mehmet Çelik" -> "MÇ"
      short: of('short')[0] ?? makeShort(name),
      subject,
      gender: parseGender(of('gender')[0] ?? ''),
      subject2: of('subject2')[0] ?? '',
      email: cleanEmail(
        cells.find((x, k) => cols[k] !== 'skip' && cols[k] !== 'name' && isAddress(x)) ??
          of('email')[0],
      ),
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
      blockSize >= 2 ? Array<number>(Math.floor(weeklyHours / blockSize)).fill(blockSize) : [];
    accepted.push({ className, teacher, weeklyHours, blocks });
  }
  return { accepted, errors };
}
