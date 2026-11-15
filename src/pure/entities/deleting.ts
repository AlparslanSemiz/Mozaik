// What a deletion took with it, said right after it happens (pitfall 4).

import { t } from '../../leaf/i18n';
import { subjectLabel } from '../../leaf/lang';
import { type Id, type State, lessonSubject } from '../../leaf/model';
import { countPlacedHours } from '../constraints';
import { activePlacements } from '../grid';
import { roomClasses } from './roster';
import { emptyState } from './defaults';

// --------------------------------------------------------------- deleting
//
// All four deletions cascade. They used to ask first (the counted sentence
// below was a question: "MÇ (Mehmet Çelik) silinecek"); since TODO SD1
// (2026-11-15) none of them asks. The deletion happens, and its notice says
// what went with it, counted, and offers "Geri al". Ctrl+Z is the same net.

export type EntityKind = 'room' | 'teacher' | 'class' | 'lesson';

/** What is inside a plan: the plan table counts it, and so does the question
    before a file replaces the open plan. */
export function planSummary(d: State) {
  return {
    teachers: d.teachers.length,
    classes: d.classes.length,
    lessons: d.lessons.length,
    placed: Object.keys(activePlacements(d)).length,
  };
}

/**
 * Whether opening a file in place of this plan can lose anything: no list, no
 * closed hour, one seçenek with no card and no pin, and settings exactly as a
 * new plan has them (a bell or a day set by hand is work too). "Dosyadan aç" asks
 * before it replaces the open plan, and on a first run that question was a red
 * dialog counting "0 öğretmen, 0 sınıf" — a warning about nothing.
 */
export function isEmptyPlan(d: State): boolean {
  return (
    d.rooms.length === 0 &&
    d.teachers.length === 0 &&
    d.classes.length === 0 &&
    d.lessons.length === 0 &&
    d.settings.schoolName.trim() === '' &&
    sameValue({ ...d.settings, schoolName: '' }, emptyState().settings) &&
    Object.keys(d.unavailable).length === 0 &&
    d.programs.length === 1 &&
    d.programs.every(
      (p) => Object.keys(p.placements).length === 0 && Object.keys(p.pinned).length === 0,
    )
  );
}

/** Deep equality that ignores key order: a sanitized plan may write its keys in another order. */
function sameValue(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const ka = Object.keys(a);
  const kb = Object.keys(b);
  if (ka.length !== kb.length) return false;
  return ka.every((k) =>
    sameValue((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]),
  );
}

/**
 * The notice after a deletion (TODO SD1): what went, in the past tense,
 * COUNTED, never guessed. It names the classes that lose their room instead of
 * saying "some classes". Called on the state BEFORE the deletion.
 */
export function deletionNotice(d: State, kind: EntityKind, id: Id): string {
  if (kind === 'room') {
    const room = d.rooms.find((x) => x.id === id);
    if (room === undefined) return t('Derslik silindi.');
    const groups = roomClasses(d, id);
    if (groups.length === 0) return t('{ad} dersliği silindi.', { ad: room.name });
    if (groups.length === 1) {
      return t('{ad} dersliği silindi, {sinif} sınıfının dersliği boşaldı.', {
        ad: room.name,
        sinif: groups[0]!.name,
      });
    }
    // The plain-words form of "derslik çakışması artık kontrol edilmeyecek":
    // classes that shared the room were kept apart by it, and are not now.
    return t(
      '{ad} dersliği silindi, {n} sınıfın dersliği boşaldı ({hangileri}). Bu sınıflar artık aynı saate konabilir.',
      { ad: room.name, n: groups.length, hangileri: groups.map((c) => c.name).join(', ') },
    );
  }
  if (kind === 'lesson') {
    const lesson = d.lessons.find((x) => x.id === id);
    if (lesson === undefined) return t('Ders silindi.');
    const group = d.classes.find((c) => c.id === lesson.classId);
    const teacher = d.teachers.find((x) => x.id === lesson.teacherId);
    const who = t('{sinif} sınıfının {kim} dersi', {
      sinif: group?.name ?? '?',
      kim: teacher?.short ?? '?',
    });
    const placed = countPlacedHours(d, id);
    return placed === 0
      ? t('{ne} silindi.', { ne: who })
      : t('{ne} silindi, yerleşmiş {n} saati de kalktı.', { ne: who, n: placed });
  }
  let who: string;
  if (kind === 'teacher') {
    const x = d.teachers.find((y) => y.id === id);
    if (x === undefined) return t('Öğretmen silindi.');
    who = x.short;
  } else {
    const c = d.classes.find((x) => x.id === id);
    if (c === undefined) return t('Sınıf silindi.');
    who = t('{ad} sınıfı', { ad: c.name });
  }
  const lessons =
    kind === 'teacher'
      ? d.lessons.filter((l) => l.teacherId === id)
      : d.lessons.filter((l) => l.classId === id);
  const placed = lessons.reduce((sum, l) => sum + countPlacedHours(d, l.id), 0);
  const gone = t('{ne} silindi.', { ne: who });
  if (lessons.length === 0) return gone;

  // WHICH classes lost WHICH subject. "MB silindi, 4 dersi de gitti" was all
  // it said, and nothing after it did: the lessons go with the teacher, so no
  // hour is left in the pool, Kontrol has nothing to count and the chip said
  // "Sorun yok" while four classes had no English (usability review,
  // 2026-11-15). This notice, with its "Geri al", is the one moment the loss is
  // known; a class without a subject is not an error in general.
  const classes = [
    ...new Set(lessons.map((l) => d.classes.find((c) => c.id === l.classId)?.name ?? '?')),
  ];
  const subjects = [...new Set(lessons.map((l) => subjectLabel(lessonSubject(d, l))))].join(', ');
  const what =
    kind === 'class'
      ? // The class is already named in `gone`; saying "511 sınıfı silindi. 511
        // sınıfının … dersi" names it twice.
        t(subjects.includes(', ') ? '{brans} dersleri de gitti.' : '{brans} dersi de gitti.', {
          brans: subjects,
        })
      : classes.length === 1
        ? t('{sinif} sınıfının {brans} dersi de gitti.', { sinif: classes[0]!, brans: subjects })
        : t('{n} sınıfın {brans} dersi de gitti: {siniflar}.', {
            n: classes.length,
            brans: subjects,
            siniflar: classes.join(', '),
          });
  const hours = placed === 0 ? '' : ' ' + t('Programdan {n} saat kalktı.', { n: placed });
  return `${gone} ${what}${hours}`;
}
