// The four list screens' search, filter and sort axes (pure/lists), asked
// directly. They stood inside each screen's useMemo until 2026-10-24, and the
// E2E list specs (liste, kurulum, dersler) pin what the screens do with them;
// this pins the axes themselves.

import { describe, expect, it } from 'vitest';
import { translate } from '../../leaf/i18n/i18n';
import { sampleState } from '../io';
import { classListConfig, lessonListConfig, roomListConfig, teacherListConfig } from './index';

const t = (key: string, vars?: Record<string, string | number>) => translate('tr', key, vars);
const ids = (xs: Array<{ id: string }> | undefined) => (xs ?? []).map((x) => x.id);

describe('liste ekseni', () => {
  const d = sampleState();

  it('dersler üç eksende daralıyor, odaklı kipte o eksen düşüyor', () => {
    expect(ids(lessonListConfig(d, 'all', t).facets)).toEqual(['brans', 'ogretmen', 'sinif']);
    expect(ids(lessonListConfig(d, 'teacher', t).facets)).toEqual(['brans', 'sinif']);
    expect(ids(lessonListConfig(d, 'class', t).facets)).toEqual(['brans', 'ogretmen']);
    expect(ids(lessonListConfig(d, 'all', t).sorts)).toEqual(['sinif', 'ogretmen', 'saat', 'blok']);
  });

  it('bir dersin araması sınıfı, öğretmenin adını ve kısa adını görüyor', () => {
    const lesson = d.lessons[0]!;
    const teacher = d.teachers.find((x) => x.id === lesson.teacherId)!;
    const group = d.classes.find((x) => x.id === lesson.classId)!;
    const hay = lessonListConfig(d, 'all', t).haystack(lesson);
    for (const part of [group.name, teacher.name, teacher.short]) expect(hay).toContain(part);
  });

  it('öğretmen, sınıf ve derslik listeleri yük durumu çipini taşıyor', () => {
    for (const facets of [
      teacherListConfig(d, t).facets,
      classListConfig(d, t).facets,
      roomListConfig(d, t).facets,
    ]) {
      expect(ids(facets)).toContain('yuk-durumu');
    }
    const teacher = d.teachers[0]!;
    expect(teacherListConfig(d, t).haystack(teacher)).toContain(teacher.short);
  });
});
