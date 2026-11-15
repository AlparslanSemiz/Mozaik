// A teacher's week as the plain text of an e-mail, and the `mailto:` that
// carries it (TODO B3.4). Read off the same sheet the printer gets
// (`teacherSheet`), so the mail and the paper on the wall cannot disagree.
//
// PLAIN TEXT, because it has to read the same in every mail program: no
// table, no tab stops, one lesson to a line, and nothing that only lines up in
// a fixed-width font.
//
// AND SHORT ENOUGH TO ARRIVE WHOLE. The week is written in the fullest form
// that fits MAILTO_SINIRI: with bell times and rooms; then without them; then
// one line per day; then that without the title and school lines, which the
// subject already carries. A week that does not fit even then is not sent at
// all, rather than sent with its end missing.

import type { Index } from '../constraints';
import { dayPeriods, shortDay } from '../entities';
import { teacherSheet } from './sheet';
import type { Vars } from '../../leaf/i18n';
import { type State, type Teacher, mailtoUrl } from '../../leaf/model';

type Translate = (key: string, vars?: Vars) => string;

/**
 * The longest `mailto:` this program builds, and why it is not the shell's.
 *
 * Measured on a Windows runner (2026-10-24, WORKLOG): ShellExecuteW hands a
 * `mailto:` on up to 32 760 characters and Chromium a clicked link up to
 * 32 700; neither cuts, both drop what is longer. What is NOT measured is the
 * mail program at the other end, because a runner cannot have one (Windows
 * takes a mailto handler only from the user's own choice). Mail programs are
 * where a long `mailto:` is known to be cut without a word, and the classic
 * figure is about 2 000 characters. A teacher who gets a week with its last
 * day missing is worse off than one who gets none, so the limit is that one.
 *
 * The same number is `EN_UZUN` in src-tauri/src/mail.rs (src/kontrat.test.ts
 * holds the two together).
 */
export const MAILTO_SINIRI = 2000;

/**
 * How much of the week the mail carries: everything; no bell times and rooms;
 * one line a day; one line a day and no title or school in the body.
 */
export type MailForm = 'full' | 'noTimes' | 'oneLine' | 'bare';

export interface TeacherMail {
  subject: string;
  body: string;
  url: string;
  form: MailForm;
}

/** One lesson of the week, as the sheet has it. */
interface Entry {
  day: number;
  from: number;
  to: number;
  group: string;
  room: string;
}

function entries(state: State, ix: Index, spans: Map<string, number>, teacher: Teacher): Entry[] {
  const sheet = teacherSheet(state, ix, spans, teacher, {
    clock: false,
    school: false,
    credits: false,
    cellBottom: true,
  });
  const out: Entry[] = [];
  sheet.days.forEach((day, g) => {
    let s = 0;
    for (const cell of day.cells) {
      if (cell.top !== null) {
        out.push({
          day: g,
          from: s,
          to: s + cell.span - 1,
          group: cell.top,
          room: cell.bottom ?? '',
        });
      }
      s += cell.span;
    }
  });
  return out;
}

/**
 * The mail for one teacher; 'empty' when no lesson of theirs is placed, and
 * 'tooLong' when the week does not fit a `mailto:` in any form.
 */
export function teacherMail(
  state: State,
  ix: Index,
  spans: Map<string, number>,
  teacher: Teacher,
  t: Translate,
): TeacherMail | 'empty' | 'tooLong' {
  const week = entries(state, ix, spans, teacher);
  if (week.length === 0) return 'empty';
  const { days, hours, bell, schoolName } = state.settings;
  const label = (e: Entry) =>
    e.from === e.to ? (hours[e.from] ?? '') : `${hours[e.from] ?? ''}–${hours[e.to] ?? ''}`;
  const subject = t('{ad} · Haftalık ders programı', { ad: teacher.name });
  const head = [subject, ...(schoolName.trim() === '' ? [] : [schoolName.trim()]), ''];

  const byDay = days
    .map((day, g) => ({ day, g, list: week.filter((e) => e.day === g) }))
    .filter((d) => d.list.length > 0);

  const full = (withTimes: boolean) =>
    byDay.flatMap(({ day, list }) => {
      const periods = dayPeriods(bell, hours, day.longBreakAfter);
      return [
        day.name,
        ...list.map((e) => {
          const time = withTimes
            ? `  ${periods[e.from]?.start ?? ''}–${periods[e.to]?.end ?? ''}`
            : '';
          const room = withTimes && e.room !== '' ? ` · ${e.room}` : '';
          return `  ${t('{n}. ders', { n: label(e) })}${time}  ${e.group}${room}`;
        }),
        '',
      ];
    });
  const oneLine = () =>
    byDay.map(
      ({ day, list }) =>
        `${shortDay(day.name)}: ${list.map((e) => `${label(e)} ${e.group}`).join(', ')}`,
    );

  const forms: Array<[MailForm, string[]]> = [
    ['full', [...head, ...full(true)]],
    ['noTimes', [...head, ...full(false)]],
    ['oneLine', [...head, ...oneLine()]],
    ['bare', oneLine()],
  ];
  const to = teacher.email;
  for (const [form, lines] of forms) {
    const body = lines.join('\n').trimEnd();
    const url = mailtoUrl(to, subject, body);
    if (url.length <= MAILTO_SINIRI) return { subject, body, url, form };
  }
  return 'tooLong';
}
