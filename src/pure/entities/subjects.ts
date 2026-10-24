// Subjects: their short forms, the options a picker offers, the order teachers
// are ranked in, and adding, renaming and deleting one.

import {
  DEFAULT_SUBJECT_SHORTS,
  builtInShort,
  builtInShortRaw,
  subjectLabel,
} from '../../leaf/lang';
import {
  PALETTE_SIZE,
  type Settings,
  type State,
  type Teacher,
  subjectKey,
  teacherSubjects,
} from '../../leaf/model';

/** Override -> built-in table -> first three letters. */
export function subjectShort(settings: Settings, subject: string): string {
  const key = subjectKey(subject);
  if (key === '') return '';

  const override = settings.subjectShorts[key];
  if (override !== undefined && override.trim() !== '') return override.trim();

  // Translated, unlike the two around it: an override is what the reader typed
  // and the three-letter slice is cut from a name they typed.
  const known = builtInShort(subject);
  if (known !== undefined) return known;

  const head = subject.trim().slice(0, 3);
  return head.charAt(0).toLocaleUpperCase('tr') + head.slice(1);
}

/**
 * One line of a subject dropdown: "Mat · Matematik".
 *
 * The short form FIRST, because it is the string the reader has to recognise
 * everywhere else — the grid row heads, the cells and the printed page all
 * carry it. The full name stays beside it: a dropdown of three-letter codes is
 * not a list anyone can pick from, which is why this is not simply
 * `subjectShort`. When the two are the same string it is written once.
 *
 * Lived in `setup/Teachers.tsx` until the entity sheet grew the same dropdown.
 */
export function subjectOption(settings: Settings, name: string): string {
  const short = subjectShort(settings, name);
  const full = subjectLabel(name);
  return short === full ? full : `${short} · ${full}`;
}

/**
 * What subjectShort() would say with no override at all — IN TURKISH.
 *
 * Not a display value: it is the thing an override is compared against, and a
 * comparison that moved with the interface language would decide whether to
 * WRITE to `settings.subjectShorts` differently in two sessions of the same
 * project. See `setSubjectShort`.
 */
export function defaultSubjectShort(subject: string): string {
  const key = subjectKey(subject);
  if (key === '') return '';
  const known = builtInShortRaw(subject);
  if (known !== undefined) return known;
  const head = subject.trim().slice(0, 3);
  return head.charAt(0).toLocaleUpperCase('tr') + head.slice(1);
}

/**
 * Stores an override ONLY when it differs from the default; writing the default
 * back removes it. That keeps the backup small and lets a later, better
 * built-in table reach an old project by itself.
 */
export function setSubjectShort(d: State, subject: string, value: string): State {
  const key = subjectKey(subject);
  if (key === '') return d;

  const next = { ...d.settings.subjectShorts };
  const trimmed = value.trim();
  // Both forms clear it: the Turkish default is what the file means, and the
  // translated one is what the reader was looking at when they typed it back.
  // Comparing against only one of them would let an interface language decide
  // what ends up in the backup.
  const isDefault =
    trimmed === defaultSubjectShort(subject) ||
    trimmed === subjectShort({ subjectShorts: {} } as Settings, subject);
  if (trimmed === '' || isDefault) delete next[key];
  else next[key] = trimmed;

  return { ...d, settings: { ...d.settings, subjectShorts: next } };
}

/**
 * The distinct subjects actually taught, in the order the teachers were added.
 *
 * BOTH of a teacher's subjects count: the second one is taught by somebody, so
 * a Branş dropdown that could not show it would silently rewrite a teacher.
 */
export function usedSubjects(d: State): string[] {
  const seen = new Map<string, string>();
  for (const t of d.teachers) {
    for (const name of teacherSubjects(t)) {
      const key = subjectKey(name);
      if (!seen.has(key)) seen.set(key, name);
    }
  }
  return [...seen.values()];
}

/** The built-in list, in the order it is written above. */
export function defaultSubjects(): string[] {
  return Object.keys(DEFAULT_SUBJECT_SHORTS);
}

/**
 * The subjects offered by the Branş dropdown: the school's own list plus
 * anything a teacher already carries. The second half matters — an old backup,
 * or a pasted list, can hold a subject nobody put in the list, and a dropdown
 * that cannot show a teacher's current subject would silently change it.
 */
export function subjectOptions(d: State): string[] {
  const seen = new Map<string, string>();
  for (const name of [...d.settings.subjects, ...usedSubjects(d)]) {
    const key = subjectKey(name);
    if (key !== '' && !seen.has(key)) seen.set(key, name.trim());
  }
  return [...seen.values()];
}

/**
 * WHERE a subject stands in the school's own order.
 *
 * "Branşa göre sıralandığında ayarlardaki branş sırasına göre olması gerek.
 * alfabetik olarak değil." Ayarlar > Branşlar is a hand-ordered list — the
 * same grip and the same `useRowOrder` as Kurulum's three — and until now that
 * order reached exactly one place, the Branş dropdown. Sorting a teacher list
 * by subject answered in the Turkish alphabet instead, which is an order
 * nobody chose.
 *
 * Built from `subjectOptions` and not from `settings.subjects`, so the two
 * always agree: a subject only a teacher carries sits after the school's list
 * in the dropdown, and it sorts there too. Keyed by `subjectKey`, because
 * "Matematik" and "matematik" are one subject everywhere else in this file.
 *
 * A Map and not a comparator: the callers need a NUMBER — `listview.ts` sorts
 * chips by one and `byNumberThen`-style sorters read one — and it knows nothing
 * about `State` by design.
 */
export function subjectRank(d: State): Map<string, number> {
  const rank = new Map<string, number>();
  for (const [i, name] of subjectOptions(d).entries()) rank.set(subjectKey(name), i);
  return rank;
}

/**
 * The rank of the FIRST of a teacher's subjects to appear in the school's list.
 *
 * A teacher holding two belongs under either chip already (see the `brans`
 * facet), so sorting them by their first subject alone put "Türkçe ve Edebiyat"
 * wherever Türkçe happened to fall and never where Edebiyat did. Unknown or
 * blank sorts LAST rather than first: an empty subject is a row still to be
 * filled in, and the top of the list is where the eye starts.
 */
export function teacherRank(rank: Map<string, number>, t: Teacher): number {
  let best = Number.MAX_SAFE_INTEGER;
  for (const name of teacherSubjects(t)) {
    best = Math.min(best, rank.get(subjectKey(name)) ?? Number.MAX_SAFE_INTEGER);
  }
  return best;
}

/**
 * How many teachers carry this subject. Deleting one is refused while > 0.
 *
 * A SECOND subject counts exactly as much as a first: leaving it out would let
 * "Edebiyat" be deleted out from under the person who teaches it, and the
 * lesson pointing at it would then name a subject the school does not have.
 */
export function subjectTeachers(d: State, subject: string): Teacher[] {
  const key = subjectKey(subject);
  return d.teachers.filter((t) => teacherSubjects(t).some((s) => subjectKey(s) === key));
}

/** No duplicates, no blanks — the same name twice would be two dropdown rows. */
export function addSubject(d: State, name: string): State {
  const clean = name.trim();
  const key = subjectKey(clean);
  if (key === '') return d;
  if (d.settings.subjects.some((x) => subjectKey(x) === key)) return d;
  return { ...d, settings: { ...d.settings, subjects: [...d.settings.subjects, clean] } };
}

/**
 * Renames a subject EVERYWHERE it is written down.
 *
 * The one operation on this list that has to cascade, and the reason is a
 * decision made two schema versions ago: `Teacher.subject` holds the NAME, not
 * an id, precisely so that renaming stays cheap (see types.ts). Cheap, not
 * free — the name lives in three places and all three move together:
 *
 *   settings.subjects      in place, so the list keeps its order
 *   settings.subjectShorts keyed by subjectKey, so the override MOVES
 *   teachers[*].subject/2  every field that matched
 *
 * `deleteSubject` deliberately does none of this — dropping a name off a list
 * must never blank a teacher's branch. A rename is the opposite promise: the
 * branch is the same branch, it is only called something else now.
 *
 * Returns the state unchanged if the new name is blank or already taken by a
 * different subject; the caller checks first and says which.
 */
export function renameSubject(d: State, from: string, to: string): State {
  const oldKey = subjectKey(from);
  const clean = to.trim();
  const newKey = subjectKey(clean);
  if (oldKey === '' || newKey === '') return d;
  if (oldKey === newKey && from === clean) return d;
  // Colliding with a DIFFERENT subject is the caller's to refuse; changing only
  // the casing of the same one is fine and is why the keys are compared.
  if (oldKey !== newKey && subjectOptions(d).some((x) => subjectKey(x) === newKey)) return d;

  const subjects = d.settings.subjects.map((x) => (subjectKey(x) === oldKey ? clean : x));

  // No teacher can end up holding the same branch twice, and that is the
  // collision check above rather than anything done here: `subjectOptions()`
  // covers both of a teacher's fields, so renaming onto a name somebody already
  // holds is refused before this point. Nothing here can orphan a
  // `Lesson.second`, so nothing here has to call `sanitize()`.
  const teachers = d.teachers.map((teacher) => {
    const first = subjectKey(teacher.subject) === oldKey ? clean : teacher.subject;
    const second = subjectKey(teacher.subject2) === oldKey ? clean : teacher.subject2;
    if (first === teacher.subject && second === teacher.subject2) return teacher;
    return { ...teacher, subject: first, subject2: second };
  });

  // The override moves with the name, and is then re-judged: "Mat" is the
  // built-in default for Matematik and a real override for Matematik 1, so the
  // same stored value can be redundant before the rename and meaningful after.
  const shorts = { ...d.settings.subjectShorts };
  const carried = shorts[oldKey];
  delete shorts[oldKey];
  const moved: State = {
    ...d,
    teachers,
    settings: { ...d.settings, subjects, subjectShorts: shorts },
  };
  return carried === undefined ? moved : setSubjectShort(moved, clean, carried);
}

/**
 * Removes a subject from the list. The teachers' `subject` strings are NOT
 * touched: nothing may delete a teacher's branch as a side effect. A subject
 * still in use simply cannot be removed — the caller checks subjectTeachers()
 * first and says who is using it.
 */
export function deleteSubject(d: State, name: string): State {
  const key = subjectKey(name);
  const subjects = d.settings.subjects.filter((x) => subjectKey(x) !== key);
  if (subjects.length === d.settings.subjects.length) return d;
  return { ...d, settings: { ...d.settings, subjects } };
}

/**
 * Hands out a fresh colour to every teacher (or class) in list order. Only ever
 * called from the button in Ayarlar: after a few deletions the used indexes are
 * full of holes and two neighbouring rows can end up looking alike.
 */
export function respreadColors(d: State, kind: 'teacher' | 'class'): State {
  if (kind === 'teacher') {
    return { ...d, teachers: d.teachers.map((t, i) => ({ ...t, color: i % PALETTE_SIZE })) };
  }
  return { ...d, classes: d.classes.map((c, i) => ({ ...c, color: i % PALETTE_SIZE })) };
}
