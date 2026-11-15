// What a deletion takes with it, asked before it happens (pitfall 4).

import { t } from '../../leaf/i18n';
import { subjectLabel } from '../../leaf/lang';
import { type Id, type State, lessonSubject } from '../../leaf/model';
import { countPlacedHours } from '../constraints';
import { activePlacements } from '../grid';
import { roomClasses } from './roster';

// --------------------------------------------------------------- deleting
//
// All four deletions cascade, and until now two of them (room, lesson) asked
// nothing at all while the other two only asked when a lesson hung off them —
// a teacher with 0 lessons vanished in silence. Ctrl+Z is the second net; this
// is the first one.

export type EntityKind = 'room' | 'teacher' | 'class' | 'lesson';

/**
 * What exactly is about to be lost, COUNTED — never guessed. The sentence is
 * what decides whether my father presses Enter or Escape, so it names the
 * classes that lose their room instead of saying "some classes".
 *
 * TWO PARTS, because the dialog that shows it has two: a heading that says
 * what is about to happen, and a line under it that says what it costs. It
 * used to be one string ending in "Devam edilsin mi?" — correct for
 * `window.confirm`, which has one text field and answers with its own two
 * buttons. Splitting it by looking for a full stop would have been pitfall 22
 * all over again (counting sentences in a string that is built from data), so
 * the split is made HERE, where the two halves are written.
 *
 * `deletionSummary` below rebuilds the old string from these two, unchanged,
 * so nothing that reads it has to care.
 */
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

export interface DeletionQuestion {
  /** "MÇ (Mehmet Çelik) silinecek" — no full stop, no question mark. */
  title: string;
  /** "2 dersi ve programa yerleşmiş 2 saati de gidecek." — may be empty. */
  cost: string;
}

export function deletionQuestion(d: State, kind: EntityKind, id: Id): DeletionQuestion {
  if (kind === 'room') {
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

  if (kind === 'lesson') {
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

  const lessons =
    kind === 'teacher'
      ? d.lessons.filter((x) => x.teacherId === id)
      : d.lessons.filter((x) => x.classId === id);
  const placed = lessons.reduce((sum, x) => sum + countPlacedHours(d, x.id), 0);

  const who =
    kind === 'teacher'
      ? (() => {
          const x = d.teachers.find((y) => y.id === id);
          return x === undefined ? t('Bu öğretmen') : `${x.short} (${x.name})`;
        })()
      : (() => {
          const c = d.classes.find((x) => x.id === id);
          return c === undefined ? t('Bu sınıf') : t('{ad} sınıfı', { ad: c.name });
        })();

  const title = t('{ne} silinecek', { ne: who });
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

/**
 * The notice after a deletion that no longer asks first (TODO SD1): what went,
 * in the past tense, from the same facts the question used to state. Called on
 * the state BEFORE the deletion, like `deletionQuestion`.
 */
export function deletionNotice(d: State, kind: 'teacher' | 'lesson', id: Id): string {
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
  const x = d.teachers.find((y) => y.id === id);
  const who = x === undefined ? t('Öğretmen') : x.short;
  const lessons = d.lessons.filter((l) => l.teacherId === id);
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
    classes.length === 1
      ? t('{sinif} sınıfının {brans} dersi de gitti.', { sinif: classes[0]!, brans: subjects })
      : t('{n} sınıfın {brans} dersi de gitti: {siniflar}.', {
          n: classes.length,
          brans: subjects,
          siniflar: classes.join(', '),
        });
  const hours = placed === 0 ? '' : ' ' + t('Programdan {n} saat kalktı.', { n: placed });
  return `${gone} ${what}${hours}`;
}
