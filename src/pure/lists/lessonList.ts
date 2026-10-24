// The lesson list's search, filter chips and sorts (Dersler). A lesson is the
// one row that belongs to two other lists, so it narrows on three axes.

import type { Vars } from '../../leaf/i18n';
import type { Lesson, State } from '../../leaf/model';
import { lessonSubject, subjectKey, subjectLabel, subjectRank } from '../entities';
import { byNumberThen, compareTr, type ListConfig } from '../listview';

/** The `t()` the screen hands down, so a language switch rebuilds the list. */
type Translate = (key: string, vars?: Vars) => string;

/** Moved out of the screen's `useMemo` unchanged (2026-10-24); the screen still memoises it on [state, mode, t]. */
export function lessonListConfig(
  state: State,
  mode: 'teacher' | 'class' | 'all',
  t: Translate,
): ListConfig<Lesson> {
  const cls = (x: Lesson) => state.classes.find((c) => c.id === x.classId);
  const tch = (x: Lesson) => state.teachers.find((t) => t.id === x.teacherId);
  const rank = subjectRank(state);
  return {
    haystack: (x) => {
      const t = tch(x);
      return `${cls(x)?.name ?? ''} ${t?.name ?? ''} ${t?.short ?? ''} ${lessonSubject(state, x)}`;
    },
    // Three axes, and they narrow TOGETHER: "kolay seçme filtresinde sadece
    // branş değil, öğretmene göre veya sınıfa göre de filtreleme olsun".
    // Ninety-nine rows is where reading a column stops working, and a lesson
    // is the one row in this program that belongs to two other lists.
    facets: [
      // The LESSON's subject, not the teacher's first one: filtering by
      // Edebiyat has to return the Edebiyat lessons of a teacher who also
      // teaches Türkçe, and none of their Türkçe ones. The chips run in the
      // school's own order (Ayarlar > Branşlar), not the alphabet.
      {
        id: 'brans',
        always: true,
        label: t('Branş'),
        of: (x) => subjectLabel(lessonSubject(state, x)),
        order: (name) => rank.get(subjectKey(name)) ?? Number.MAX_SAFE_INTEGER,
      },
      ...(mode === 'teacher'
        ? []
        : [
            {
              id: 'ogretmen',
              always: true,
              label: t('Öğretmen'),
              of: (x: Lesson) => tch(x)?.short ?? '',
            },
          ]),
      ...(mode === 'class'
        ? []
        : [
            {
              id: 'sinif',
              always: true,
              label: t('Sınıf'),
              of: (x: Lesson) => cls(x)?.name ?? '',
            },
          ]),
    ],
    sorts: [
      {
        id: 'sinif',
        label: t('Sınıfa göre'),
        cmp: (a, b) =>
          compareTr(cls(a)?.name ?? '', cls(b)?.name ?? '') ||
          compareTr(tch(a)?.short ?? '', tch(b)?.short ?? ''),
      },
      {
        id: 'ogretmen',
        label: t('Öğretmene göre'),
        cmp: (a, b) =>
          compareTr(tch(a)?.name ?? '', tch(b)?.name ?? '') ||
          compareTr(cls(a)?.name ?? '', cls(b)?.name ?? ''),
      },
      {
        id: 'saat',
        label: t('Haftalık saate göre'),
        cmp: byNumberThen(
          (x) => x.weeklyHours,
          (x) => cls(x)?.name ?? '',
        ),
      },
      {
        id: 'blok',
        label: t('Blok sayısına göre'),
        cmp: byNumberThen(
          (x) => x.blocks.length,
          (x) => cls(x)?.name ?? '',
        ),
      },
    ],
  };
}
