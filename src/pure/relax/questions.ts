// The answer book: the questions to ask a teacher before a suggestion is
// used, the answers' parts, and which answers a suggestion leans on.

import { t } from '../../leaf/i18n';
import {
  lessonSubject,
  type Answers,
  type Id,
  type Refusal,
  type Relaxation,
  type State,
} from '../../leaf/model';
import { type Index, buildIndex } from '../constraints';
import { forbids } from '../entities';
import type { Suggestion } from './options';
import { teacherLimit } from './reading';
import {
  dayName,
  hourList,
  refusalText,
  suggestionParts,
  suggestionSentence,
  teacherDays,
} from './sentences';

// ------------------------------------------------------ the answer book
//
// "Cevap defteri" (2026-09-25): a way read as the questions the father puts to
// each teacher, every one answered "Olur" (the change is made, at no cost to
// the next search) or "Olmaz" in one of four strengths. The answers are the
// plan's data (State.answers); this part only says what each question is.

/** One way "Olmaz" can be meant, as the menu offers it. */
export interface RefusalChoice {
  label: string;
  refusal: Refusal;
}

/** One question, to one teacher or to the father himself (`teacherId` null). */
export interface Question {
  teacherId: Id | null;
  text: string;
  /** What "Olur" makes. */
  changes: Relaxation[];
  choices: RefusalChoice[];
}

/** The class and the subject, the way a teacher is asked about a lesson: "411A SAY Geometri". */
function lessonAsked(d: State, ix: Index, lessonId: Id): string {
  const lesson = ix.lessonById.get(lessonId);
  if (lesson === undefined) return '?';
  const group = ix.classById.get(lesson.classId);
  return `${group?.name ?? '?'} ${lessonSubject(d, lesson)}`.trim();
}

/** The questions a way puts, the teachers' first and in the order of their names. */
export function suggestionQuestions(d: State, s: Suggestion): Question[] {
  const ix = buildIndex(d);
  const who = (id: Id) => ix.teacherById.get(id)?.short ?? '?';
  const none = (id: Id): RefusalChoice => ({
    label: t('{kim} için hiçbir değişiklik olmasın', { kim: who(id) }),
    refusal: { kind: 'teacher', teacherId: id },
  });
  const out: Question[] = [];
  for (const entry of teacherDays(s)) {
    const gun = dayName(d, entry.day);
    const changes: Relaxation[] = entry.hours.map((hour) => ({
      kind: 'teacherHour',
      teacherId: entry.teacherId,
      day: entry.day,
      hour,
    }));
    const choices: RefusalChoice[] = [
      {
        label: t('Yalnız bu saatler olmaz ({gun} {saatler}. saat)', {
          gun,
          saatler: hourList(d, entry.hours),
        }),
        refusal: { kind: 'teacherHours', ...entry, hours: [...entry.hours] },
      },
      {
        label: t('{gun} hiç gelemez', { gun }),
        refusal: { kind: 'teacherDay', teacherId: entry.teacherId, day: entry.day },
      },
    ];
    // "At most N hours": every N under what was asked, so the menu is one click.
    for (let max = 1; max < entry.hours.length; max++) {
      choices.push({
        label: t('{gun} en fazla {n} saat gelebilir', { gun, n: max }),
        refusal: { kind: 'teacherCap', teacherId: entry.teacherId, day: entry.day, max },
      });
    }
    choices.push(none(entry.teacherId));
    out.push({
      teacherId: entry.teacherId,
      text: t(
        entry.hours.length === 1
          ? '{gun} {saatler}. saate gelebilir misiniz?'
          : '{gun} {saatler}. saatlere gelebilir misiniz?',
        { gun, saatler: hourList(d, entry.hours) },
      ),
      changes,
      choices,
    });
  }
  const mine: Question[] = [];
  for (const c of s.changes) {
    switch (c.kind) {
      case 'teacherHour':
        break;
      case 'teacherDayLimit':
        out.push({
          teacherId: c.teacherId,
          text: t('Bir günde {eski} yerine {yeni} saat girebilir misiniz?', {
            eski: teacherLimit(d, c.teacherId, 'maxPerDay'),
            yeni: c.limit,
          }),
          changes: [c],
          choices: [
            {
              label: t('Olmaz'),
              refusal: { kind: 'teacherDayLimit', teacherId: c.teacherId },
            },
            none(c.teacherId),
          ],
        });
        break;
      case 'teacherConsecutive':
        out.push({
          teacherId: c.teacherId,
          text: t('Art arda {eski} yerine {yeni} saat girebilir misiniz?', {
            eski: teacherLimit(d, c.teacherId, 'maxConsecutive'),
            yeni: c.limit,
          }),
          changes: [c],
          choices: [
            {
              label: t('Olmaz'),
              refusal: { kind: 'teacherConsecutive', teacherId: c.teacherId },
            },
            none(c.teacherId),
          ],
        });
        break;
      case 'lessonTeacher':
        out.push({
          teacherId: c.teacherId,
          text: t('{ders} dersini verebilir misiniz?', { ders: lessonAsked(d, ix, c.lessonId) }),
          changes: [c],
          choices: [
            {
              label: t('Olmaz'),
              refusal: { kind: 'lessonTeacher', lessonId: c.lessonId, teacherId: c.teacherId },
            },
            none(c.teacherId),
          ],
        });
        break;
      default: {
        // A lesson's own shape and limits: nobody to ask but the father.
        const part = suggestionParts(d, { ...s, changes: [c] })[0];
        if (part === undefined) break;
        mine.push({
          teacherId: null,
          text: part.text,
          changes: [c],
          choices: [{ label: t('Olmaz'), refusal: part.refusal }],
        });
      }
    }
  }
  const name = (q: Question) => (q.teacherId === null ? '' : who(q.teacherId));
  return [...out.sort((a, b) => (name(a) < name(b) ? -1 : name(a) > name(b) ? 1 : 0)), ...mine];
}

/**
 * The plan's answers as the chips under the panel's title: a teacher's hours
 * on one day together, each chip carrying every answer it stands for, so one
 * click takes them all back.
 */
export function answerParts(
  d: State,
  answers: Answers,
): Array<{ text: string; yes: boolean; items: Array<Relaxation | Refusal> }> {
  const out: Array<{ text: string; yes: boolean; items: Array<Relaxation | Refusal> }> = [];
  const asked: Suggestion = {
    family: 'teacherHours',
    changes: answers.accepted,
    placements: {},
    size: 0,
    proven: false,
    relaid: false,
    accepted: [],
  };
  for (const entry of teacherDays(asked)) {
    out.push({
      text: suggestionParts(d, {
        ...asked,
        changes: entry.hours.map((hour) => ({
          kind: 'teacherHour' as const,
          teacherId: entry.teacherId,
          day: entry.day,
          hour,
        })),
      })[0]!.text,
      yes: true,
      items: answers.accepted.filter(
        (c) => c.kind === 'teacherHour' && c.teacherId === entry.teacherId && c.day === entry.day,
      ),
    });
  }
  for (const c of answers.accepted) {
    if (c.kind === 'teacherHour') continue;
    const part = suggestionParts(d, { ...asked, changes: [c] })[0];
    if (part !== undefined) out.push({ text: part.text, yes: true, items: [c] });
  }
  for (const r of answers.refused) out.push({ text: refusalText(d, r), yes: false, items: [r] });
  return out;
}

/** The questions as plain text, to copy or print: one line per question. */
export function questionsText(d: State, s: Suggestion): string {
  const ix = buildIndex(d);
  const lines = suggestionQuestions(d, s).map((q) =>
    q.teacherId === null
      ? `${t('Sizin kararınız')}: ${q.text}`
      : `${ix.teacherById.get(q.teacherId)?.short ?? '?'}: ${q.text}`,
  );
  return [suggestionSentence(d, s), '', ...lines].join('\n');
}

/** Does `s` make the change `r` rules out? `d` names who teaches a lesson now. */
export function suggestionUses(d: State, s: Suggestion, r: Refusal): boolean {
  return forbids(d, r, s.changes);
}
