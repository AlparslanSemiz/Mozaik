// A suggestion in the father's words: its parts, its lines, the sentence, and
// why a refused change was refused.

import { t } from '../../leaf/i18n';
import { dayLabel } from '../../leaf/lang';
import type { Id, Refusal, State } from '../../leaf/model';
import { type Index, buildIndex } from '../constraints';
import { lessonName } from '../feasibility';
import type { Suggestion } from './options';
import { sameLimit, teacherLimit } from './reading';

// ------------------------------------------------------------- the sentences

/** "11–12", "3, 5 ve 7" — the hour names, runs joined. */
export function hourList(d: State, hours: number[]): string {
  const sorted = [...new Set(hours)].sort((a, b) => a - b);
  const name = (h: number) => d.settings.hours[h] ?? `${h + 1}`;
  const runs: string[] = [];
  for (let i = 0; i < sorted.length;) {
    let j = i;
    while (j + 1 < sorted.length && sorted[j + 1] === sorted[j]! + 1) j++;
    runs.push(j === i ? name(sorted[i]!) : `${name(sorted[i]!)}–${name(sorted[j]!)}`);
    i = j + 1;
  }
  if (runs.length === 1) return runs[0]!;
  return t('{liste} ve {son}', {
    liste: runs.slice(0, -1).join(', '),
    son: runs[runs.length - 1]!,
  });
}

function shape(blocks: number[], hours: number): string {
  const named = blocks.reduce((sum, b) => sum + b, 0);
  return [...blocks, ...Array<number>(Math.max(0, hours - named)).fill(1)].join('+');
}

/** One change as the reader sees it, and what "Bu olmaz" on it rules out. */
export interface SuggestionPart {
  text: string;
  refusal: Refusal;
}

/** "411A SAY · KY Geometri" for a lesson, "?" when it is gone. */
function lessonTitle(ix: Index, lessonId: Id): string {
  return ix.lessonById.has(lessonId) ? lessonName(ix, lessonId) : '?';
}

/** A teacher's closed hours on one day, grouped the way a teacher is asked. */
export function teacherDays(s: Suggestion): Array<{ teacherId: Id; day: number; hours: number[] }> {
  const byDay = new Map<string, { teacherId: Id; day: number; hours: number[] }>();
  for (const c of s.changes) {
    if (c.kind !== 'teacherHour') continue;
    const key = `${c.teacherId}|${String(c.day).padStart(2, '0')}`;
    const entry = byDay.get(key) ?? { teacherId: c.teacherId, day: c.day, hours: [] };
    entry.hours.push(c.hour);
    byDay.set(key, entry);
  }
  return [...byDay.keys()].sort().map((key) => byDay.get(key)!);
}

export function dayName(d: State, day: number): string {
  return dayLabel(d.settings.days[day]?.name ?? t('{n}. gün', { n: day + 1 }));
}

/**
 * One part per change, the way the father would say it: a teacher's hours on
 * one day together ("KY Cumartesi 11–12. saat"), a limit with its old and new
 * number. Each carries the refusal its "Bu olmaz" makes.
 */
export function suggestionParts(d: State, s: Suggestion): SuggestionPart[] {
  const ix = buildIndex(d);
  const parts: SuggestionPart[] = [];
  for (const entry of teacherDays(s)) {
    parts.push({
      text: t('{kim} {gun} {saatler}. saat', {
        kim: ix.teacherById.get(entry.teacherId)?.short ?? '?',
        gun: dayName(d, entry.day),
        saatler: hourList(d, entry.hours),
      }),
      refusal: { kind: 'teacherDay', teacherId: entry.teacherId, day: entry.day },
    });
  }
  for (const c of s.changes) {
    switch (c.kind) {
      case 'teacherHour':
        break;
      case 'lessonDayLimit': {
        const lesson = ix.lessonById.get(c.lessonId);
        parts.push({
          text: t('{ders}: aynı gün en fazla {eski} yerine {yeni} saat', {
            ders: lessonTitle(ix, c.lessonId),
            eski: lesson === undefined ? '?' : sameLimit(d, lesson),
            yeni: c.limit,
          }),
          refusal: { kind: 'lessonDayLimit', lessonId: c.lessonId },
        });
        break;
      }
      case 'teacherDayLimit':
        parts.push({
          text: t('{kim}: günde en fazla {eski} yerine {yeni} saat', {
            kim: ix.teacherById.get(c.teacherId)?.short ?? '?',
            eski: teacherLimit(d, c.teacherId, 'maxPerDay'),
            yeni: c.limit,
          }),
          refusal: { kind: 'teacherDayLimit', teacherId: c.teacherId },
        });
        break;
      case 'teacherConsecutive':
        parts.push({
          text: t('{kim}: art arda en fazla {eski} yerine {yeni} saat', {
            kim: ix.teacherById.get(c.teacherId)?.short ?? '?',
            eski: teacherLimit(d, c.teacherId, 'maxConsecutive'),
            yeni: c.limit,
          }),
          refusal: { kind: 'teacherConsecutive', teacherId: c.teacherId },
        });
        break;
      case 'lessonTeacher':
        parts.push({
          text: t('{ders}: {yeni} versin', {
            ders: lessonTitle(ix, c.lessonId),
            yeni: ix.teacherById.get(c.teacherId)?.short ?? '?',
          }),
          refusal: { kind: 'lessonTeacher', lessonId: c.lessonId, teacherId: c.teacherId },
        });
        break;
      case 'blockShape': {
        const lesson = ix.lessonById.get(c.lessonId);
        parts.push({
          text: t('{ders}: {eski} yerine {yeni}', {
            ders: lessonTitle(ix, c.lessonId),
            eski: lesson === undefined ? '?' : shape(lesson.blocks, lesson.weeklyHours),
            yeni: lesson === undefined ? '?' : shape(c.blocks, lesson.weeklyHours),
          }),
          refusal: { kind: 'blockShape', lessonId: c.lessonId },
        });
        break;
      }
      case 'weeklyHours': {
        const lesson = ix.lessonById.get(c.lessonId);
        parts.push({
          text: t('{ders}: haftada {eski} yerine {yeni} saat', {
            ders: lessonTitle(ix, c.lessonId),
            eski: lesson?.weeklyHours ?? '?',
            yeni: c.hours,
          }),
          refusal: { kind: 'weeklyHours', lessonId: c.lessonId },
        });
        break;
      }
    }
  }
  return parts;
}

/** The parts as plain lines. */
export function suggestionLines(d: State, s: Suggestion): string[] {
  return suggestionParts(d, s).map((p) => p.text);
}

/** "a", "a ve b", "a, b ve c". */
function joined(items: string[]): string {
  if (items.length <= 1) return items[0] ?? '';
  return t('{liste} ve {son}', {
    liste: items.slice(0, -1).join(', '),
    son: items[items.length - 1]!,
  });
}

/**
 * The whole way as one sentence the father could say to his teachers: "KY
 * Cumartesi 11–12. saatlere de gelebilirse hafta kuruluyor." (the user's own
 * wording, 2026-09-24).
 */
export function suggestionSentence(d: State, s: Suggestion): string {
  const ix = buildIndex(d);
  const clauses: string[] = [];
  const hours = teacherDays(s).map((entry) =>
    t(
      entry.hours.length === 1 ? '{kim} {gun} {saatler}. saate' : '{kim} {gun} {saatler}. saatlere',
      {
        kim: ix.teacherById.get(entry.teacherId)?.short ?? '?',
        gun: dayName(d, entry.day),
        saatler: hourList(d, entry.hours),
      },
    ),
  );
  if (hours.length > 0) clauses.push(t('{saatler} de gelebilirse', { saatler: joined(hours) }));
  for (const c of s.changes) {
    switch (c.kind) {
      case 'teacherHour':
        break;
      case 'lessonDayLimit':
        clauses.push(
          t('{ders} aynı gün {yeni} saat olabilirse', {
            ders: lessonTitle(ix, c.lessonId),
            yeni: c.limit,
          }),
        );
        break;
      case 'teacherDayLimit': {
        const kim = ix.teacherById.get(c.teacherId)?.short ?? '?';
        const days = c.days ?? [];
        clauses.push(
          days.length === 1
            ? t('{kim} {gun} {yeni} saat girebilirse', {
                kim,
                gun: dayName(d, days[0]!),
                yeni: c.limit,
              })
            : t('{kim} bir günde {yeni} saat girebilirse', { kim, yeni: c.limit }),
        );
        break;
      }
      case 'teacherConsecutive':
        clauses.push(
          t('{kim} art arda {yeni} saat girebilirse', {
            kim: ix.teacherById.get(c.teacherId)?.short ?? '?',
            yeni: c.limit,
          }),
        );
        break;
      case 'lessonTeacher':
        clauses.push(
          t('{ders} dersini {yeni} verebilirse', {
            ders: lessonTitle(ix, c.lessonId),
            yeni: ix.teacherById.get(c.teacherId)?.short ?? '?',
          }),
        );
        break;
      case 'blockShape': {
        const lesson = ix.lessonById.get(c.lessonId);
        clauses.push(
          t('{ders} {yeni} olabilirse', {
            ders: lessonTitle(ix, c.lessonId),
            yeni: lesson === undefined ? '?' : shape(c.blocks, lesson.weeklyHours),
          }),
        );
        break;
      }
      case 'weeklyHours':
        clauses.push(
          t('{ders} haftada {yeni} saat olabilirse', {
            ders: lessonTitle(ix, c.lessonId),
            yeni: c.hours,
          }),
        );
        break;
    }
  }
  if (s.accepted.length > 0) {
    return t('Olur dediklerinize ek olarak {kosullar} hafta kuruluyor.', {
      kosullar: joined(clauses),
    });
  }
  return t('{kosullar} hafta kuruluyor.', { kosullar: joined(clauses) });
}

/** A refusal as the reader sees it in the "Olmaz dediğiniz" line. */
export function refusalText(d: State, r: Refusal): string {
  const ix = buildIndex(d);
  const who = (id: Id) => ix.teacherById.get(id)?.short ?? '?';
  switch (r.kind) {
    case 'teacherDay':
      return t('{kim} {gun}', { kim: who(r.teacherId), gun: dayName(d, r.day) });
    case 'teacherHours':
      return t('{kim} {gun} {saatler}. saat', {
        kim: who(r.teacherId),
        gun: dayName(d, r.day),
        saatler: hourList(d, r.hours),
      });
    case 'teacherCap':
      return t('{kim} {gun} en fazla {n} saat', {
        kim: who(r.teacherId),
        gun: dayName(d, r.day),
        n: r.max,
      });
    case 'teacher':
      return t('{kim}: hiçbir değişiklik', { kim: who(r.teacherId) });
    case 'teacherDayLimit':
      return t('{kim}: günlük sınır', { kim: who(r.teacherId) });
    case 'teacherConsecutive':
      return t('{kim}: art arda sınırı', { kim: who(r.teacherId) });
    case 'lessonDayLimit':
      return t('{ders}: aynı gün sınırı', { ders: lessonTitle(ix, r.lessonId) });
    case 'lessonTeacher':
      return t('{ders}: {yeni} versin', {
        ders: lessonTitle(ix, r.lessonId),
        yeni: who(r.teacherId),
      });
    case 'blockShape':
      return t('{ders}: blok şekli', { ders: lessonTitle(ix, r.lessonId) });
    case 'weeklyHours':
      return t('{ders}: haftalık saat', { ders: lessonTitle(ix, r.lessonId) });
  }
}
