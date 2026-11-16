// The teacher list's search, filter chips and sorts (Okul → Öğretmenler).

import type { Vars } from '../../leaf/i18n';
import type { Teacher, State } from '../../leaf/model';
import {
  genderLabel,
  openHours,
  subjectKey,
  subjectLabel,
  subjectRank,
  teacherRank,
  teacherSubjects,
  weeklyLoad,
} from '../entities';
import { buildCapacity } from '../feasibility';
import { loadStatusFacet } from './loadStatusFacet';
import { byNumberThen, compareTr, type ListConfig } from '../listview';

/** The `t()` the screen hands down, so a language switch rebuilds the list. */
type Translate = (key: string, vars?: Vars) => string;

/** Moved out of the screen's `useMemo` unchanged (2026-10-24); the screen still memoises it on [state, t]. */
export function teacherListConfig(state: State, t: Translate): ListConfig<Teacher> {
  const rank = subjectRank(state);
  const capacity = buildCapacity(state);
  return {
    haystack: (t) =>
      `${t.name} ${t.short} ${teacherSubjects(t).join(' ')} ${genderLabel(t.gender)}`,
    facets: [
      // BOTH subjects: a teacher who holds two belongs under either chip, and
      // "Edebiyat" that could not find the person teaching it would be a
      // filter that lies. The chips run in the school's own order, the one
      // Ayarlar > Branşlar is dragged into — not the alphabet.
      {
        id: 'brans',
        label: t('Branş'),
        of: (x) => teacherSubjects(x).map(subjectLabel),
        order: (name) => rank.get(subjectKey(name)) ?? Number.MAX_SAFE_INTEGER,
      },
      // Blank is a group too, and it is the one worth finding: it is the
      // list of rows still to be filled in.
      {
        id: 'cinsiyet',
        label: t('Cinsiyet'),
        of: (x) => genderLabel(x.gender),
      },
      loadStatusFacet<Teacher>(capacity.teachers, t),
    ],
    sorts: [
      {
        id: 'ad',
        label: t('Ada göre'),
        cmp: (a, b) => compareTr(a.name, b.name),
      },
      // The school's order, not the alphabet — and read from BOTH of a
      // teacher's subjects, the way the chip above already does.
      {
        id: 'brans',
        label: t('Branşa göre'),
        cmp: (a, b) => teacherRank(rank, a) - teacherRank(rank, b) || compareTr(a.name, b.name),
      },
      {
        id: 'yuk',
        label: t('Ders yüküne göre'),
        cmp: byNumberThen(
          (x) => weeklyLoad(state, 'teacher', x.id),
          (x) => x.name,
        ),
      },
      {
        id: 'acik',
        label: t('Açık saate göre'),
        cmp: byNumberThen(
          (x) => openHours(state, x.id),
          (x) => x.name,
          'asc',
        ),
      },
      {
        id: 'cinsiyet',
        label: t('Cinsiyete göre'),
        cmp: (a, b) =>
          compareTr(genderLabel(a.gender), genderLabel(b.gender)) || compareTr(a.name, b.name),
      },
    ],
  };
}
