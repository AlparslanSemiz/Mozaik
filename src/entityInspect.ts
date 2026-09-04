// One entity, on its own: its week and its counted facts.
//
// "Her derslik, sınıf ya da öğretmenin üzerine tıklandığında bilgileri ve
// programının gözükmesi" — the reader's own words, and the one thing the tool
// could not do at all. The information existed: it was spread across the
// Program grid (one row of it), the Müsaitlik grid (one row of it), the Okul
// list (one row of it) and Kontrol (one line of it), and putting them together
// meant four tabs and remembering.
//
// Pure, and here rather than in the panel that shows it: a `.tsx` file that
// walks `placements` is a `.tsx` file doing timetable logic.

import { buildIndex, teacherKey } from './constraints';
import type { Index } from './constraints';
import { openHours } from './availability';
import { weeklyLoad } from './entityCounts';
import { t } from './i18n';
import { subjectLabel } from './names';
import { activePlacements } from './programs';
import { roomClasses, roomName } from './roomCrud';
import { subjectShort } from './subjectShorts';
import { lessonSubject, teacherSubjects } from './subjects';
import type { Id, State } from './types';

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

const EMPTY_CELL = (closed: boolean): WeekCell => ({
  top: '',
  bottom: '',
  color: null,
  closed,
  conflict: false,
});

/**
 * One entity's week: rows are DAYS and columns are lessons.
 *
 * The same way round as Müsaitlik and the printed sheet, and deliberately not
 * the same way round as the Program grid — this is a "read one day" screen,
 * and that is the axis those are set on.
 */
export function entityWeek(d: State, kind: InspectKind, id: Id): WeekCell[][] {
  const ix = buildIndex(d);
  const week: WeekCell[][] = [];

  for (let day = 0; day < d.settings.days.length; day++) {
    const row: WeekCell[] = [];
    for (let hour = 0; hour < d.settings.hours.length; hour++) {
      row.push(weekCell(d, ix, kind, id, day, hour));
    }
    week.push(row);
  }
  return week;
}

function weekCell(
  d: State,
  ix: Index,
  kind: InspectKind,
  id: Id,
  day: number,
  hour: number,
): WeekCell {
  const closed = d.unavailable[`${id}|${day}|${hour}`] === 1;
  const lessonId = busyWith(d, ix, kind, id, day, hour);
  const lesson = lessonId === undefined ? undefined : ix.lessonById.get(lessonId);
  if (lesson === undefined) return EMPTY_CELL(closed);

  const group = ix.classById.get(lesson.classId);
  const teacher = ix.teacherById.get(lesson.teacherId);
  // A class's own week reads "who is teaching me"; everyone else's reads
  // "which class am I with". The colour follows the same rule the grid does:
  // the TEACHER paints, the class is a mark.
  if (kind === 'class') {
    return {
      top: teacher?.short ?? '?',
      bottom: teacher === undefined ? '' : subjectShort(d.settings, teacher.subject),
      color: teacher?.color ?? null,
      closed,
      conflict: closed,
    };
  }
  return {
    top: group?.name ?? '?',
    bottom: kind === 'teacher' ? roomName(d, group?.roomId ?? null) : (teacher?.short ?? ''),
    color: teacher?.color ?? null,
    closed,
    conflict: closed,
  };
}

/** Which lesson holds this entity at this hour, if any. */
function busyWith(
  d: State,
  ix: Index,
  kind: InspectKind,
  id: Id,
  day: number,
  hour: number,
): Id | undefined {
  if (kind === 'class') return activePlacements(d)[`${id}|${day}|${hour}`];
  if (kind === 'teacher') return ix.teacherBusy.get(teacherKey(id, day, hour));
  return ix.roomBusy.get(`${id}|${day}|${hour}`);
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
  const ix = buildIndex(d);
  const rows = countedRows(d, kind, id);

  if (kind === 'teacher') return teacherFacts(d, ix, id, rows);
  if (kind === 'class') return classFacts(d, ix, id, rows);
  return roomFacts(d, ix, id, rows);
}

/** The four numbers every panel carries, whichever kind it is. */
function countedRows(d: State, kind: InspectKind, id: Id): EntityFacts['rows'] {
  const load = weeklyLoad(d, kind, id);
  const open = openHours(d, id);
  const week = d.settings.days.length * d.settings.hours.length;

  let placed = 0;
  for (const row of entityWeek(d, kind, id)) {
    for (const cell of row) if (cell.color !== null) placed++;
  }

  return [
    { label: t('Haftalık ders yükü'), value: t('{n} saat', { n: load }), tight: load > open },
    { label: t('Açık saat'), value: `${open} / ${week}`, tight: open < load },
    {
      label: t('Programa yerleşmiş'),
      value: t('{yerlesen} / {toplam} saat', { yerlesen: placed, toplam: load }),
      tight: placed < load,
    },
    { label: t('Kapalı saat'), value: t('{n} saat', { n: week - open }), tight: false },
  ];
}

function teacherFacts(
  d: State,
  ix: Index,
  id: Id,
  rows: EntityFacts['rows'],
): EntityFacts | null {
  const person = ix.teacherById.get(id);
  if (person === undefined) return null;

  const lessons = d.lessons.filter((x) => x.teacherId === id);
  const classes = [...new Set(lessons.map((x) => ix.classById.get(x.classId)?.name ?? '?'))];
  return {
    short: person.short,
    name: person.name,
    color: person.color,
    rows,
    links: [
      t('Branşı: {brans}', { brans: teacherSubjects(person).map(subjectLabel).join(' · ') }),
      lessonCountLine(lessons.length, classes),
    ],
    lessons: lessons.map((x) => ({
      id: x.id,
      other: ix.classById.get(x.classId)?.name ?? '?',
      subject: subjectLabel(lessonSubject(d, x)),
      weeklyHours: x.weeklyHours,
    })),
  };
}

function classFacts(d: State, ix: Index, id: Id, rows: EntityFacts['rows']): EntityFacts | null {
  const c = ix.classById.get(id);
  if (c === undefined) return null;

  const lessons = d.lessons.filter((x) => x.classId === id);
  const teachers = [
    ...new Set(lessons.map((x) => ix.teacherById.get(x.teacherId)?.short ?? '?')),
  ];
  return {
    short: c.name,
    name: t('{ad} sınıfı', { ad: c.name }),
    color: c.color,
    rows,
    links: [
      t('Dersliği: {derslik}', { derslik: roomName(d, c.roomId) }),
      lessonCountLine(lessons.length, teachers),
    ],
    lessons: lessons.map((x) => ({
      id: x.id,
      other: ix.teacherById.get(x.teacherId)?.short ?? '?',
      subject: subjectLabel(lessonSubject(d, x)),
      weeklyHours: x.weeklyHours,
    })),
  };
}

/** A room has lessons only through the classes that sit in it, so none listed. */
function roomFacts(d: State, ix: Index, id: Id, rows: EntityFacts['rows']): EntityFacts | null {
  const r = ix.roomById.get(id);
  if (r === undefined) return null;

  const groups = roomClasses(d, id);
  return {
    short: r.name,
    name: t('{ad} dersliği', { ad: r.name }),
    color: null,
    rows,
    links: [
      groups.length === 0
        ? t('Hiçbir sınıf bu dersliği kullanmıyor')
        : t('{n} sınıf paylaşıyor: {hangileri}', {
            n: groups.length,
            hangileri: groups.map((c) => c.name).join(', '),
          }),
    ],
    lessons: [],
  };
}

function lessonCountLine(count: number, others: string[]): string {
  return count === 0
    ? t('Henüz dersi yok')
    : t('{n} dersi var: {hangileri}', { n: count, hangileri: others.join(', ') });
}
