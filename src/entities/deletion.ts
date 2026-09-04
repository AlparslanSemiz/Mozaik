// What a delete is about to COST, counted — never guessed.
//
// All four deletions cascade, and two of them (room, lesson) used to ask
// nothing at all while the other two only asked when a lesson hung off them —
// a teacher with 0 lessons vanished in silence. Ctrl+Z is the second net; this
// is the first one.

import { countPlacedHours } from '../constraints';
import type { Index } from '../constraints';
import { t } from '../i18n';
import { roomClasses } from './roomCrud';
import type { Id, State } from '../types';

export type EntityKind = 'room' | 'teacher' | 'class' | 'lesson';

/**
 * TWO PARTS, because the dialog that shows it has two: a heading that says what
 * is about to happen, and a line under it that says what it costs. It used to
 * be one string ending in "Devam edilsin mi?" — correct for `window.confirm`,
 * which has one text field and answers with its own two buttons. Splitting it
 * by looking for a full stop would have been pitfall 22 all over again
 * (counting sentences in a string built from data), so the split is made HERE,
 * where the two halves are written.
 */
export interface DeletionQuestion {
  /** "MÇ (Mehmet Çelik) silinecek" — no full stop, no question mark. */
  title: string;
  /** "2 dersi ve programa yerleşmiş 2 saati de gidecek." — may be empty. */
  cost: string;
}

/**
 * The sentence is what decides whether my father presses Enter or Escape, so it
 * names the classes that lose their room instead of saying "some classes".
 */
export function deletionQuestion(d: State, kind: EntityKind, id: Id): DeletionQuestion {
  if (kind === 'room') return roomQuestion(d, id);
  if (kind === 'lesson') return lessonQuestion(d, id);
  return holderQuestion(d, kind, id);
}

function roomQuestion(d: State, id: Id): DeletionQuestion {
  const room = d.rooms.find((x) => x.id === id);
  if (room === undefined) return { title: t('Bu derslik silinecek'), cost: '' };

  const groups = roomClasses(d, id);
  const title = t('{ad} dersliği silinecek', { ad: room.name });
  if (groups.length === 0) return { title, cost: '' };
  return {
    title,
    cost: t(
      '{n} sınıfın dersliği boşalacak ({hangileri}) ve derslik çakışması artık kontrol edilmeyecek.',
      { n: groups.length, hangileri: groups.map((c) => c.name).join(', ') },
    ),
  };
}

function lessonQuestion(d: State, id: Id): DeletionQuestion {
  const lesson = d.lessons.find((x) => x.id === id);
  if (lesson === undefined) return { title: t('Bu ders silinecek'), cost: '' };

  const group = d.classes.find((c) => c.id === lesson.classId);
  const teacher = d.teachers.find((x) => x.id === lesson.teacherId);
  const who = t('{sinif} sınıfının {kim} dersi', {
    sinif: group?.name ?? '?',
    kim: teacher?.short ?? '?',
  });

  const placed = countPlacedHours(d, id);
  if (placed === 0) {
    return {
      title: t('{ne} silinecek ({n} saat)', { ne: who, n: lesson.weeklyHours }),
      cost: '',
    };
  }
  return {
    title: t('{ne} silinecek', { ne: who }),
    cost: t('Programa yerleşmiş {n} saati de kalkacak.', { n: placed }),
  };
}

/** A teacher or a class: both are asked the same way, by what hangs off them. */
function holderQuestion(d: State, kind: 'teacher' | 'class', id: Id): DeletionQuestion {
  const lessons =
    kind === 'teacher'
      ? d.lessons.filter((x) => x.teacherId === id)
      : d.lessons.filter((x) => x.classId === id);
  const placed = lessons.reduce((sum, x) => sum + countPlacedHours(d, x.id), 0);

  const title = t('{ne} silinecek', { ne: holderName(d, kind, id) });
  if (lessons.length === 0) return { title, cost: '' };
  if (placed === 0) {
    return { title, cost: t('{n} dersi de gidecek.', { n: lessons.length }) };
  }
  return {
    title,
    cost: t('{ders} dersi ve programa yerleşmiş {saat} saati de gidecek.', {
      ders: lessons.length,
      saat: placed,
    }),
  };
}

function holderName(d: State, kind: 'teacher' | 'class', id: Id): string {
  if (kind === 'teacher') {
    const x = d.teachers.find((y) => y.id === id);
    return x === undefined ? t('Bu öğretmen') : `${x.short} (${x.name})`;
  }
  const c = d.classes.find((x) => x.id === id);
  return c === undefined ? t('Bu sınıf') : t('{ad} sınıfı', { ad: c.name });
}

/**
 * The same thing as ONE sentence, ending in the question `window.confirm` had
 * to ask for itself. Kept because it is what the tests hold and because a
 * caller that only has one text field still exists in principle.
 */
export function deletionSummary(d: State, kind: EntityKind, id: Id): string {
  const { title, cost } = deletionQuestion(d, kind, id);
  return `${title}. ${cost === '' ? '' : `${cost} `}Devam edilsin mi?`;
}

/**
 * How many lessons still have hours waiting in the pool.
 *
 * Counts and stops: building the pool to get this number would put 99 cards'
 * worth of work into the render that owns the 2100-cell table.
 */
export function pendingLessons(d: State, ix: Index): number {
  let n = 0;
  for (const lesson of d.lessons) {
    if ((ix.placedHours.get(lesson.id) ?? 0) < lesson.weeklyHours) n++;
  }
  return n;
}
