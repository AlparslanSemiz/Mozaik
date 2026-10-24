// The answers given to a suggestion's questions (`answerYes`, `answerNo`,
// `forbids`, `dropAnswer`).

import type { Id, Refusal, Relaxation, State } from '../../leaf/model';

// ------------------------------------------------------------------ answers
//
// What the father said to a suggestion (schema v15, TODO B5.11): "Olur" keeps
// a change for the next search, "Olmaz" rules one out. A new answer replaces
// an old one it contradicts, so the two lists never disagree.

/** Would making `changes` go against `r`? `d` says who teaches a lesson now. */
export function forbids(d: State, r: Refusal, changes: readonly Relaxation[]): boolean {
  const hoursOn = (teacherId: Id, day: number) =>
    changes.filter((c) => c.kind === 'teacherHour' && c.teacherId === teacherId && c.day === day)
      .length;
  return changes.some((c) => {
    switch (r.kind) {
      case 'teacherDay':
        return c.kind === 'teacherHour' && c.teacherId === r.teacherId && c.day === r.day;
      case 'teacherHours':
        return (
          c.kind === 'teacherHour' &&
          c.teacherId === r.teacherId &&
          c.day === r.day &&
          r.hours.includes(c.hour)
        );
      case 'teacherCap':
        return (
          c.kind === 'teacherHour' &&
          c.teacherId === r.teacherId &&
          c.day === r.day &&
          hoursOn(r.teacherId, r.day) > r.max
        );
      case 'teacher':
        if (c.kind === 'lessonTeacher') {
          const from = d.lessons.find((x) => x.id === c.lessonId)?.teacherId;
          return c.teacherId === r.teacherId || from === r.teacherId;
        }
        return 'teacherId' in c && c.teacherId === r.teacherId;
      case 'teacherDayLimit':
      case 'teacherConsecutive':
        return c.kind === r.kind && c.teacherId === r.teacherId;
      case 'lessonTeacher':
        return c.kind === r.kind && c.lessonId === r.lessonId && c.teacherId === r.teacherId;
      default:
        return c.kind === r.kind && c.lessonId === r.lessonId;
    }
  });
}

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/**
 * The key that makes two changes the same answer: one teacher hour, or one
 * limit or lesson whatever number it goes to (the later answer wins).
 */
function answerKey(c: Relaxation): string {
  switch (c.kind) {
    case 'teacherHour':
      return `${c.kind}|${c.teacherId}|${c.day}|${c.hour}`;
    case 'teacherDayLimit':
    case 'teacherConsecutive':
      return `${c.kind}|${c.teacherId}`;
    case 'lessonTeacher':
      return `${c.kind}|${c.lessonId}`;
    default:
      return `${c.kind}|${c.lessonId}`;
  }
}

/** "Olur": these changes are kept, and any "Olmaz" they go against is taken back. */
export function answerYes(d: State, changes: readonly Relaxation[]): State {
  const keys = new Set(changes.map(answerKey));
  const accepted = [...d.answers.accepted.filter((c) => !keys.has(answerKey(c))), ...changes];
  const refused = d.answers.refused.filter((r) => !forbids(d, r, accepted));
  return { ...d, answers: { accepted, refused } };
}

/** "Olmaz": `r` is ruled out, and any "Olur" it goes against is taken back. */
export function answerNo(d: State, r: Refusal): State {
  if (d.answers.refused.some((x) => same(x, r))) return d;
  const accepted: Relaxation[] = [];
  for (const c of d.answers.accepted) {
    if (!forbids(d, r, [...accepted, c])) accepted.push(c);
  }
  return { ...d, answers: { accepted, refused: [...d.answers.refused, r] } };
}

/** Takes one answer back, either kind. */
export function dropAnswer(d: State, answer: Relaxation | Refusal): State {
  const accepted = d.answers.accepted.filter((x) => !same(x, answer));
  const refused = d.answers.refused.filter((x) => !same(x, answer));
  if (accepted.length === d.answers.accepted.length && refused.length === d.answers.refused.length)
    return d;
  return { ...d, answers: { accepted, refused } };
}
