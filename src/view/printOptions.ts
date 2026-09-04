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

/** How many timetables share one sheet of A4. */
export type PerSheet = 1 | 2 | 4;

/** How big the type on the paper is, on top of whatever the layout implies. */
export type PrintSize = 'kucuk' | 'normal' | 'buyuk';

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

  /**
   * Two numbers rather than switches, and they still belong in this record:
   * it is one decision — "what comes out of the printer" — and splitting them
   * into their own keys would be two more normalizers for one question.
   *
   * They are independent on purpose (asked for, 2026-08-26): the layout picks
   * a base scale so four timetables can fit a sheet at all, and the size is
   * the reader's own adjustment on top of it. One knob would have hidden
   * "biraz daha büyük olsun".
   */
  perSheet: PerSheet;
  size: PrintSize;
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
  // One sheet, one timetable: that is what came out of the printer before
  // these two existed, and a default that changed it would be a preference
  // nobody asked for.
  perSheet: 1,
  size: 'normal',
};

export const PER_SHEET_VALUES: PerSheet[] = [1, 2, 4];

export const PER_SHEET_LABELS: Array<{ value: PerSheet; label: string; hint: string }> = [
  { value: 1, label: '1', hint: 'Bir A4’e bir program, duvara asılan boy' },
  { value: 2, label: '2', hint: 'Alt alta iki program' },
  { value: 4, label: '4', hint: 'İki sütun, iki satır, dağıtmak için' },
];

export const PRINT_SIZE_LABELS: Array<{ value: PrintSize; label: string }> = [
  { value: 'kucuk', label: 'Küçük' },
  { value: 'normal', label: 'Normal' },
  { value: 'buyuk', label: 'Büyük' },
];

/**
 * The five keys that are SWITCHES. Named as its own type since the record grew
 * two members that are not: `keyof PrintOptions` would let a checkbox be bound
 * to the sheet count, and TypeScript would only notice at the call site.
 */
export type PrintSwitch = 'school' | 'credits' | 'clock' | 'stamp' | 'cellBottom';

/** The switches in the order the panel offers them, with what they are called. */
export const PRINT_OPTION_LABELS: Array<{ id: PrintSwitch; label: string; hint: string }> = [
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

  const read = (id: PrintSwitch): boolean =>
    typeof record[id] === 'boolean' ? (record[id] as boolean) : PRINT_DEFAULTS[id];

  // `Number('')` and `Number(null)` are 0, and 0 is not in the list — so the
  // membership test is the guard, not `Number.isFinite` (pitfall 43).
  const per = PER_SHEET_VALUES.includes(record.perSheet as PerSheet)
    ? (record.perSheet as PerSheet)
    : PRINT_DEFAULTS.perSheet;

  const size = PRINT_SIZE_LABELS.some((x) => x.value === record.size)
    ? (record.size as PrintSize)
    : PRINT_DEFAULTS.size;

  return {
    school: read('school'),
    credits: read('credits'),
    clock: read('clock'),
    stamp: read('stamp'),
    cellBottom: read('cellBottom'),
    perSheet: per,
    size,
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
