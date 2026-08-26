// What goes ON the printed sheet — five switches, one preference.
//
// NOT part of `theme.ts`, and the line is not arbitrary. That file holds nine
// independent scalars, each written to `<html>` as an attribute BEFORE the
// first paint because each one moves the layout (main.tsx). These five never
// touch the shell: they are React props read at render time, and they are one
// decision — "what does the sheet carry" — that happens to have five answers.
// Five more keys would be five more normalizers for one question.
//
// Not part of `State` either, for the reason the theme is not: a printout is a
// decision about one printer on one afternoon. A backup taken in a term where
// the clock times were hidden must not hide them in the next term's school.

const KEY = 'ders-programi-baski';

export interface PrintOptions {
  /** The school's name on the credits line under the title. */
  school: boolean;
  /** The rest of that line: the room on a class sheet, the subject on a teacher's. */
  credits: boolean;
  /** "08:30–09:10" under each lesson number. */
  clock: boolean;
  /** When the sheet came out of the printer. */
  stamp: boolean;
  /** The cell's second line: the teacher's short form, or the room letter. */
  cellBottom: boolean;
}

/**
 * Everything that was already on the paper stays on it; `stamp` is the one
 * thing that never existed, so it starts off. A default that changed what
 * comes out of the printer for somebody who never opened this panel would be
 * a preference nobody asked for.
 */
export const PRINT_DEFAULTS: PrintOptions = {
  school: true,
  credits: true,
  clock: true,
  stamp: false,
  cellBottom: true,
};

/** The switches in the order the panel offers them, with what they are called. */
export const PRINT_OPTION_LABELS: Array<{ id: keyof PrintOptions; label: string; hint: string }> = [
  { id: 'school', label: 'Kurs adı', hint: 'Başlığın altındaki satırda okulun adı' },
  { id: 'credits', label: 'Derslik ve branş', hint: 'Aynı satırda dersliğin harfi ya da öğretmenin branşı' },
  { id: 'clock', label: 'Ders saatleri', hint: 'Sütun başlığında 08:30–09:10' },
  { id: 'cellBottom', label: 'Hücrenin alt satırı', hint: 'Öğretmen kısaltması ya da derslik' },
  { id: 'stamp', label: 'Çıktı tarihi', hint: 'Sayfanın altında yazdırılma tarihi ve saati' },
];

/**
 * Reads a stored record field by field.
 *
 * Only an explicit `false` turns a switch off. Absent, null, '' and junk all
 * fall back to the default — because "not stored" and "stored as off" are
 * different facts, and a record written before a switch existed has neither.
 * That is `Number('') === 0` wearing a different hat.
 */
export function normalizePrintOptions(raw: unknown): PrintOptions {
  let record: Record<string, unknown> = {};
  if (typeof raw === 'string') {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        record = parsed as Record<string, unknown>;
      }
    } catch {
      /* A preference that cannot be read is a preference that was never set. */
    }
  } else if (typeof raw === 'object' && raw !== null && !Array.isArray(raw)) {
    record = raw as Record<string, unknown>;
  }

  const read = (id: keyof PrintOptions): boolean =>
    typeof record[id] === 'boolean' ? (record[id] as boolean) : PRINT_DEFAULTS[id];

  return {
    school: read('school'),
    credits: read('credits'),
    clock: read('clock'),
    stamp: read('stamp'),
    cellBottom: read('cellBottom'),
  };
}

export function readPrintOptions(): PrintOptions {
  try {
    return normalizePrintOptions(localStorage.getItem(KEY));
  } catch {
    return { ...PRINT_DEFAULTS };
  }
}

export function writePrintOptions(next: PrintOptions): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* A preference that cannot be remembered is still better than none. */
  }
}

export const PRINT_OPTIONS_KEY = KEY;
