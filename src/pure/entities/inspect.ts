// One teacher, class or room on its own: its week and its facts, for the
// entity sheet.

import { t } from '../../leaf/i18n';
import { subjectLabel } from '../../leaf/lang';
import { type Id, type State, lessonSubject, teacherSubjects } from '../../leaf/model';
import { buildIndex, closedKey, placementKey } from '../constraints';
import { activePlacements } from '../grid';
import { openHours } from './availability';
import { weeklyLoad } from './counting';
import { roomClasses, roomName } from './roster';
import { subjectShort } from './subjects';

// -------------------------------------------------- one entity, on its own
//
// "Her derslik, sınıf ya da öğretmenin üzerine tıklandığında bilgileri ve
// programının gözükmesi" — the reader's own words, and the one thing the tool
// could not do at all. The information existed: it was spread across the
// Program grid (one row of it), the Müsaitlik grid (one row of it), the
// Kurulum list (one row of it) and Kontrol (one line of it), and putting them
// together meant four tabs and remembering.
//
// Pure, and here rather than in the panel that shows it: a `.tsx` file that
// walks `placements` is a `.tsx` file doing timetable logic.

export type InspectKind = 'teacher' | 'class' | 'room';

export interface WeekCell {
  /** What the cell says. Two lines, like a grid card. Empty when free. */
  top: string;
  bottom: string;
  /** Palette index that paints it, or null when nothing is placed. */
  color: number | null;
  /** This entity cannot be used at this hour. */
  closed: boolean;
  /** A lesson is sitting on an hour that was closed AFTERWARDS (pitfall 16). */
  conflict: boolean;
}

/**
 * One entity's week: rows are DAYS and columns are lessons.
 *
 * The same way round as Müsaitlik and the printed sheet, and deliberately not
 * the same way round as the Program grid — this is a "read one day" screen,
 * and that is the axis those are set on.
 */
export function entityWeek(d: State, kind: InspectKind, id: Id): WeekCell[][] {
  const ix = buildIndex(d);
  const dayCount = d.settings.days.length;
  const hourCount = d.settings.hours.length;
  const week: WeekCell[][] = [];

  for (let day = 0; day < dayCount; day++) {
    const row: WeekCell[] = [];
    for (let hour = 0; hour < hourCount; hour++) {
      const closed = d.unavailable[closedKey(id, day, hour)] === 1;
      const lessonId =
        kind === 'class'
          ? activePlacements(d)[placementKey(id, day, hour)]
          : kind === 'teacher'
            ? ix.teacherBusy.get(closedKey(id, day, hour))
            : ix.roomBusy.get(closedKey(id, day, hour));

      const lesson = lessonId === undefined ? undefined : ix.lessonById.get(lessonId);
      if (lesson === undefined) {
        row.push({ top: '', bottom: '', color: null, closed, conflict: false });
        continue;
      }

      const group = ix.classById.get(lesson.classId);
      const teacher = ix.teacherById.get(lesson.teacherId);
      // A class's own week reads "who is teaching me"; everyone else's reads
      // "which class am I with". The colour follows the same rule the grid
      // does: the TEACHER paints, the class is a mark.
      row.push(
        kind === 'class'
          ? {
              top: teacher?.short ?? '?',
              bottom: teacher === undefined ? '' : subjectShort(d.settings, teacher.subject),
              color: teacher?.color ?? null,
              closed,
              conflict: closed,
            }
          : {
              top: group?.name ?? '?',
              bottom:
                kind === 'teacher' ? roomName(d, group?.roomId ?? null) : (teacher?.short ?? ''),
              color: teacher?.color ?? null,
              closed,
              conflict: closed,
            },
      );
    }
    week.push(row);
  }
  return week;
}

export interface EntityFacts {
  /** "MÇ" / "510" / "A" — what the grid calls it. */
  short: string;
  /** "Mehmet Çelik" / "510 sınıfı" / "A dersliği". */
  name: string;
  /** Its own palette colour, or null: a room has none. */
  color: number | null;
  /** Counted lines for the panel. Never estimated. */
  rows: Array<{ label: string; value: string; tight: boolean }>;
  /** Sentences that name the other entities it is tied to. */
  links: string[];
  /**
   * The lessons this entity is part of, as ROWS rather than as a sentence.
   *
   * `links` already says "3 dersi var: 510, 511, 512" and that is the right
   * shape for reading. It is the wrong shape for DOING anything: the ids are
   * thrown away, so the panel could name a lesson but never act on one. Empty
   * for a room, which has lessons only through the classes that sit in it.
   */
  lessons: Array<{
    id: Id;
    /** The other end of it: the class, on a teacher's panel, and vice versa. */
    other: string;
    subject: string;
    weeklyHours: number;
  }>;
}

/**
 * The counted facts. Every number here is one somebody could otherwise only
 * get by cross-reading two tabs, and the `tight` flag is what turns a number
 * into a warning: a load that does not fit the open hours cannot be laid out,
 * and that is worth saying WHERE the load is shown rather than only in Kontrol.
 */
export function entityFacts(d: State, kind: InspectKind, id: Id): EntityFacts | null {
  const load = weeklyLoad(d, kind, id);
  const open = openHours(d, id);
  const week = d.settings.days.length * d.settings.hours.length;
  const ix = buildIndex(d);

  let placed = 0;
  for (const row of entityWeek(d, kind, id)) {
    for (const cell of row) if (cell.color !== null) placed++;
  }

  const common = (
    short: string,
    name: string,
    color: number | null,
    links: string[],
    lessons: EntityFacts['lessons'] = [],
  ): EntityFacts => ({
    short,
    name,
    color,
    links,
    lessons,
    rows: [
      { label: t('Haftalık ders yükü'), value: t('{n} saat', { n: load }), tight: load > open },
      { label: t('Açık saat'), value: `${open} / ${week}`, tight: open < load },
      {
        label: t('Programa yerleşmiş'),
        value: t('{yerlesen} / {toplam} saat', { yerlesen: placed, toplam: load }),
        tight: placed < load,
      },
      { label: t('Kapalı saat'), value: t('{n} saat', { n: week - open }), tight: false },
    ],
  });

  if (kind === 'teacher') {
    const person = ix.teacherById.get(id);
    if (person === undefined) return null;
    const lessons = d.lessons.filter((x) => x.teacherId === id);
    const classes = [...new Set(lessons.map((x) => ix.classById.get(x.classId)?.name ?? '?'))];
    return {
      ...common(
        person.short,
        person.name,
        person.color,
        [
          t('Branşı: {brans}', {
            brans: teacherSubjects(person).map(subjectLabel).join(' · '),
          }),
          lessons.length === 0
            ? t('Henüz dersi yok')
            : t('{n} dersi var: {hangileri}', {
                n: lessons.length,
                hangileri: classes.join(', '),
              }),
        ],
        lessons.map((x) => ({
          id: x.id,
          other: ix.classById.get(x.classId)?.name ?? '?',
          subject: subjectLabel(lessonSubject(d, x)),
          weeklyHours: x.weeklyHours,
        })),
      ),
    };
  }

  if (kind === 'class') {
    const c = ix.classById.get(id);
    if (c === undefined) return null;
    const lessons = d.lessons.filter((x) => x.classId === id);
    const teachers = [
      ...new Set(lessons.map((x) => ix.teacherById.get(x.teacherId)?.short ?? '?')),
    ];
    return {
      ...common(
        c.name,
        t('{ad} sınıfı', { ad: c.name }),
        c.color,
        [
          t('Dersliği: {derslik}', { derslik: roomName(d, c.roomId) }),
          lessons.length === 0
            ? t('Henüz dersi yok')
            : t('{n} dersi var: {hangileri}', {
                n: lessons.length,
                hangileri: teachers.join(', '),
              }),
        ],
        lessons.map((x) => ({
          id: x.id,
          other: ix.teacherById.get(x.teacherId)?.short ?? '?',
          subject: subjectLabel(lessonSubject(d, x)),
          weeklyHours: x.weeklyHours,
        })),
      ),
    };
  }

  const r = ix.roomById.get(id);
  if (r === undefined) return null;
  const groups = roomClasses(d, id);
  return {
    ...common(r.name, t('{ad} dersliği', { ad: r.name }), null, [
      groups.length === 0
        ? t('Hiçbir sınıf bu dersliği kullanmıyor')
        : t('{n} sınıf paylaşıyor: {hangileri}', {
            n: groups.length,
            hangileri: groups.map((c) => c.name).join(', '),
          }),
    ]),
  };
}
