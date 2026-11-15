// What a deletion took with it, said right after it happens (pitfall 4).

import { t } from '../../leaf/i18n';
import type { Id, State } from '../../leaf/model';
import { countPlacedHours } from '../constraints';
import { activePlacements } from '../grid';
import { roomClasses } from './roster';

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
  if (lessons.length === 0) return t('{ne} silindi.', { ne: who });
  if (placed === 0) return t('{ne} silindi, {n} dersi de gitti.', { ne: who, n: lessons.length });
  return t('{ne} silindi, {ders} dersi ve yerleşmiş {saat} saati de gitti.', {
    ne: who,
    ders: lessons.length,
    saat: placed,
  });
}
