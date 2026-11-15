// Why a lesson has nowhere left to go, said once for every lesson that shares
// the cause, and what Kontrol's "Göster" buttons point at.

import { t } from '../../leaf/i18n';
import { dayLabel } from '../../leaf/lang';
import { type Id, type State, placementKey } from '../../leaf/model';
import {
  type BlockCode,
  type ClosedConflict,
  type Index,
  type Violation,
  blockerDetail,
  closedKey,
  pendingBlocks,
} from '../constraints';
import { activePlacements } from '../grid';
import type { Capacity, Unplaceable } from './levels';

/** Whose row "Müsaitlik'te aç" opens. */
export interface Target {
  kind: 'teacher' | 'class' | 'room';
  id: Id;
}

/** One placed hour on the grid, by the class row it sits in. */
export interface Cell {
  classId: Id;
  teacherId: Id;
  day: number;
  hour: number;
}

/**
 * The constraint that actually binds, for a lesson that has no valid cell left.
 *
 * It used to be `commonestBlock`'s vote over the whole week, and on a full
 * course that vote is won by the class's own closed hours: 12 rows of
 * "N saati yerleşmemiş ve koyacak yer yok. Örnek sebep: 410A SAY sınıfı Salı 1
 * saatinde kapalı" (TODO SD4) — true, the same for every row, and nothing to
 * act on. In order, the first that holds:
 *
 * 1. somebody's open hours cannot hold their load at all — the capacity row's
 *    own sentence ("AY 20 saat müsait, 24 saat ders yüklenmiş. 4 saat fazla."),
 *    which every lesson of that teacher shares and so groups under;
 * 2. the class has no empty open hour left;
 * 3. it has some, and each is counted by what keeps THIS lesson out of it: the
 *    teacher away, the teacher in another class, the room, a rule.
 *
 * No day or hour in the sentence: one with a day in it is one per lesson, and
 * a group is only a group when the sentence repeats word for word.
 */
export function stuckReason(
  d: State,
  ix: Index,
  lessonId: Id,
  capacity: Capacity,
): { message: string; fix: Target | null } {
  const lesson = ix.lessonById.get(lessonId);
  const group = lesson && ix.classById.get(lesson.classId);
  const teacher = lesson && ix.teacherById.get(lesson.teacherId);
  if (lesson === undefined || group === undefined || teacher === undefined) {
    return { message: t('Ders eksik tanımlı'), fix: null };
  }

  const over = (rows: Capacity['teachers'], id: Id | null) =>
    id === null ? undefined : rows.find((r) => r.id === id && r.level === 'impossible');
  const teacherRow = over(capacity.teachers, teacher.id);
  if (teacherRow) return { message: teacherRow.message, fix: { kind: 'teacher', id: teacher.id } };
  const classRow = over(capacity.classes, group.id);
  if (classRow) return { message: classRow.message, fix: { kind: 'class', id: group.id } };
  const roomRow = over(capacity.rooms, group.roomId);
  if (roomRow && group.roomId !== null) {
    return { message: roomRow.message, fix: { kind: 'room', id: group.roomId } };
  }

  const placements = activePlacements(d);
  const counts = new Map<BlockCode, number>();
  let holes = 0;
  for (let g = 0; g < d.settings.days.length; g++) {
    for (let s = 0; s < d.settings.hours.length; s++) {
      if (placements[placementKey(group.id, g, s)] !== undefined) continue;
      if (d.unavailable[closedKey(group.id, g, s)] !== undefined) continue;
      holes++;
      // Size 1: why THIS HOUR cannot take any of the lesson. A longer card
      // that only misses for its length is the last sentence below.
      const found = blockerDetail(d, ix, lessonId, g, s, 1);
      if (found !== null) counts.set(found.code, (counts.get(found.code) ?? 0) + 1);
    }
  }

  if (holes === 0) {
    return {
      message: t('{sinif} sınıfının açık saatlerinin hepsi başka derslerle dolu.', {
        sinif: group.name,
      }),
      fix: { kind: 'class', id: group.id },
    };
  }

  const away = counts.get('teacherClosed') ?? 0;
  const elsewhere = counts.get('teacherBusy') ?? 0;
  const room = (counts.get('roomBusy') ?? 0) + (counts.get('roomClosed') ?? 0);
  const rule = (counts.get('rule') ?? 0) + (counts.get('relatedDay') ?? 0);
  const parts: string[] = [];
  if (away > 0) parts.push(t('{kim} {n} saatinde müsait değil', { kim: teacher.short, n: away }));
  if (elsewhere > 0) {
    parts.push(t('{n} saatinde {kim} başka sınıfta', { n: elsewhere, kim: teacher.short }));
  }
  if (room > 0) {
    const roomName = (group.roomId !== null && ix.roomById.get(group.roomId)?.name) || '?';
    parts.push(t('{n} saatinde {derslik} dersliği dolu', { n: room, derslik: roomName }));
  }
  if (rule > 0) parts.push(t('{n} saatinde bir kural izin vermiyor', { n: rule }));
  // Hours that would take one hour of it but not its card: without this the
  // sentence said "3 boş saati var" and then accounted for one.
  const open = holes - away - elsewhere - room - rule;
  const size = pendingBlocks(d, lesson)[0] ?? 1;
  if (open > 0 && parts.length > 0 && size > 1) {
    parts.push(t('{n} saatine {boy} saatlik kart sığmıyor', { n: open, boy: size }));
  }
  if (parts.length === 0) {
    return {
      message: t('{sinif} sınıfının {n} boş saati var ama bu dersin kartı onlara sığmıyor.', {
        sinif: group.name,
        n: holes,
      }),
      fix: null,
    };
  }

  // Availability only helps when a CLOSED hour is what binds most; a rule or a
  // busy teacher is not opened from there.
  const fix: Target | null =
    away > 0 && away >= elsewhere && away >= room && away >= rule
      ? { kind: 'teacher', id: teacher.id }
      : room > elsewhere && room >= rule && group.roomId !== null
        ? { kind: 'room', id: group.roomId }
        : null;
  return {
    message: t('{sinif} sınıfının {n} boş saati var: {neden}.', {
      sinif: group.name,
      n: holes,
      neden: parts.join(', '),
    }),
    fix,
  };
}

/** Lessons that share a cause, in the order the causes were first met. */
export interface UnplaceableGroup {
  message: string;
  fix: Target | null;
  lessons: Unplaceable[];
}

/**
 * One row per CAUSE, with the lessons under it (TODO SD4). The Danışman's
 * notes did this first (KS22): twelve rows that differ only in the lesson's
 * name are one sentence and twelve names.
 */
export function groupUnplaceable(list: Unplaceable[]): UnplaceableGroup[] {
  const byMessage = new Map<string, UnplaceableGroup>();
  for (const u of list) {
    const seen = byMessage.get(u.message);
    if (seen === undefined)
      byMessage.set(u.message, { message: u.message, fix: u.fix, lessons: [u] });
    else seen.lessons.push(u);
  }
  return [...byMessage.values()];
}

/** One lesson on one or more closed hours: Kontrol draws one row for it. */
export interface StrandedLesson {
  lessonId: Id;
  /** Its placed hours that are now closed, in week order. */
  cells: Cell[];
  /** Who closed them; one entry per teacher, class or room, first met first. */
  closedBy: Target[];
  /** "Salı 10, 11 · Ö18 müsait değil" — every hour, each closer named once. */
  reason: string;
}

/**
 * `closedConflicts` is one entry per HOUR, and Kontrol drew it that way: a
 * two-hour block was two identical rows ("AY Çarşamba 1 saatinde müsait değil"
 * twice) under a heading that counted hours as lessons. Grouped here by lesson,
 * and each closer is named once with every hour it closed.
 */
export function groupStranded(
  d: State,
  ix: Index,
  conflicts: readonly ClosedConflict[],
): StrandedLesson[] {
  const byLesson = new Map<Id, ClosedConflict[]>();
  for (const c of conflicts) {
    const seen = byLesson.get(c.lessonId);
    if (seen === undefined) byLesson.set(c.lessonId, [c]);
    else seen.push(c);
  }

  const out: StrandedLesson[] = [];
  for (const [lessonId, list] of byLesson) {
    list.sort((a, b) => a.day - b.day || a.hour - b.hour);
    const closers = new Map<string, { target: Target; hours: ClosedConflict[] }>();
    for (const c of list) {
      const key = `${c.closedBy.kind}|${c.closedBy.id}`;
      const seen = closers.get(key);
      if (seen === undefined) closers.set(key, { target: c.closedBy, hours: [c] });
      else seen.hours.push(c);
    }
    const sentences = [...closers.values()].map(({ target, hours }) =>
      closerSentence(ix, target, when(d, hours)),
    );
    out.push({
      lessonId,
      cells: list.map(({ classId, teacherId, day, hour }) => ({ classId, teacherId, day, hour })),
      closedBy: [...closers.values()].map((x) => x.target),
      reason: sentences.join('; '),
    });
  }
  return out;
}

/**
 * "Salı 10 saatinde", or "Salı 10, 11 · Çarşamba 3 saatlerinde": every hour
 * once, each day named once. One hour keeps closed.ts's own words.
 */
function when(d: State, hours: ClosedConflict[]): string {
  const days = new Map<number, string[]>();
  for (const c of hours) {
    const name = d.settings.hours[c.hour] ?? `${c.hour + 1}`;
    const seen = days.get(c.day);
    if (seen === undefined) days.set(c.day, [name]);
    else seen.push(name);
  }
  const named = [...days].map(([day, names]) => ({ gun: dayName(d, day), saat: names.join(', ') }));
  if (hours.length === 1 && named[0] !== undefined) return t('{gun} {saat} saatinde', named[0]);
  return t('{zaman} saatlerinde', {
    zaman: named.map((x) => `${x.gun} ${x.saat}`).join(' · '),
  });
}

function dayName(d: State, day: number): string {
  return dayLabel(d.settings.days[day]?.name ?? t('{n}. gün', { n: day + 1 }));
}

/** closed.ts's three sentences, with every hour the one closer closed. */
function closerSentence(ix: Index, who: Target, at: string): string {
  if (who.kind === 'teacher') {
    return t('{kim} {ne_zaman} müsait değil', {
      kim: ix.teacherById.get(who.id)?.short ?? '?',
      ne_zaman: at,
    });
  }
  if (who.kind === 'class') {
    return t('{sinif} sınıfı {ne_zaman} kapalı', {
      sinif: ix.classById.get(who.id)?.name ?? '?',
      ne_zaman: at,
    });
  }
  return t('{derslik} dersliği {ne_zaman} kapalı', {
    derslik: ix.roomById.get(who.id)?.name ?? '?',
    ne_zaman: at,
  });
}

/**
 * Where a broken rule can be SEEN: the first card it is about, on its day.
 * `Violation.at` names a teacher, a class, a lesson or a relation, and a day;
 * null when nothing of it is on the grid any more.
 */
export function violationCell(d: State, ix: Index, v: Violation): Cell | null {
  const { id, day } = v.at;
  const relation = d.relations.find((r) => r.id === id);
  const lessonIds = relation === undefined ? null : new Set<Id>(relation.lessonIds);
  const matches = (lessonId: Id): boolean => {
    if (lessonIds !== null) return lessonIds.has(lessonId);
    if (lessonId === id) return true;
    const lesson = ix.lessonById.get(lessonId);
    return lesson !== undefined && (lesson.teacherId === id || lesson.classId === id);
  };

  const placements = activePlacements(d);
  for (let s = 0; s < d.settings.hours.length; s++) {
    for (const group of d.classes) {
      const lessonId = placements[placementKey(group.id, day, s)];
      if (lessonId === undefined || !matches(lessonId)) continue;
      const lesson = ix.lessonById.get(lessonId);
      if (lesson === undefined) continue;
      return { classId: group.id, teacherId: lesson.teacherId, day, hour: s };
    }
  }
  return null;
}
