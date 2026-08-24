// Parser for Excel paste. PURE functions.
//
// Typing 300+ rows one by one during first setup is where my father would give
// up. Copy-paste from Excel turns that from hours into minutes.
//
// The parser NEVER adds data directly: it returns {accepted, errors}, the user
// sees a preview and only then confirms.

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
      errors.push(`${i + 1}. satır: "${name}" iki kez geçiyor, biri alındı.`);
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
}

/** Columns: Ad · Kısaltma · Branş */
export function parseTeachers(text: string): ParseResult<TeacherRow> {
  const accepted: TeacherRow[] = [];
  const errors: string[] = [];

  for (const [i, cells] of splitGrid(text).entries()) {
    if (i === 0 && isHeader(cells, ['ad', 'isim', 'öğretmen', 'ogretmen'])) continue;
    const name = cells[0] ?? '';
    if (name === '') continue;

    const subject = cells[2] ?? '';
    if (subject === '') errors.push(`${i + 1}. satır: "${name}" için branş boş.`);

    accepted.push({
      name,
      // If the short form is left empty, derive it: "Mehmet Çelik" -> "MÇ"
      short: (cells[1] ?? '') || makeShort(name),
      subject,
    });
  }
  return { accepted, errors };
}

export function makeShort(name: string): string {
  const parts = name.split(/\s+/).filter((x) => x.length > 0);
  if (parts.length === 0) return '??';
  return parts
    .slice(0, 2)
    .map((p) => (p[0] ?? '').toLocaleUpperCase('tr'))
    .join('');
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
      errors.push(`${i + 1}. satır: "${name}" sınıfı iki kez geçiyor, biri alındı.`);
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
  blockSize: number;
}

/** Columns: Sınıf · Öğretmen · Haftalık saat · Blok (empty block = 1) */
export function parseLessons(text: string): ParseResult<LessonRow> {
  const accepted: LessonRow[] = [];
  const errors: string[] = [];

  for (const [i, cells] of splitGrid(text).entries()) {
    if (i === 0 && isHeader(cells, ['sınıf', 'sinif', 'grup'])) continue;
    const className = cells[0] ?? '';
    const teacher = cells[1] ?? '';
    if (className === '' && teacher === '') continue;

    if (className === '' || teacher === '') {
      errors.push(`${i + 1}. satır: sınıf veya öğretmen boş, atlandı.`);
      continue;
    }
    const weeklyHours = toNumber(cells[2], 0);
    if (weeklyHours === 0) {
      errors.push(`${i + 1}. satır: "${className} / ${teacher}" için saat okunamadı, atlandı.`);
      continue;
    }
    const blockSize = Math.min(3, toNumber(cells[3], 1));
    accepted.push({ className, teacher, weeklyHours, blockSize });
  }
  return { accepted, errors };
}
