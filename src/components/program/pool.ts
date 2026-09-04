// The tray's cards, and the order they sit in.
//
// Pure, like programGrid.ts: what comes back is what LessonPool draws. The
// tray runs the same way down as the grid does — that used to be alphabetical,
// which was the same thing back when the only order was the one they were
// typed in. Now the rows can be dragged, and an alphabetical tray under a
// hand-ordered grid means hunting upward for the cards of the row you are on.

import { pendingBlocks } from '../../constraints';
import type { Index } from '../../constraints';
import { lessonSubject, subjectKey, subjectLabel } from '../../entities';
import { compareTr } from '../../listview';
import { programColorIndex } from '../../programColor';
import type { ProgramColorMode } from '../../programColor';
import type { ProgramMask } from '../../programMask';
import type { PoolSort, View } from '../../toolState';
import type { State } from '../../types';
import type { PoolCard } from './LessonPool';
import type { Translate } from '../T';

export function buildPool(
  d: State,
  ix: Index,
  view: View,
  mask: ProgramMask,
  sort: PoolSort,
  filter: string,
  colorMode: ProgramColorMode,
  t: Translate,
): { cards: PoolCard[]; completed: number; total: number } {
  const cards: PoolCard[] = [];
  let completed = 0;
  let total = 0;
  const teacherView = view === "teacher";
  const rowAt = new Map<string, number>(
    (teacherView ? d.teachers : d.classes).map((x, i) => [x.id, i]),
  );

  for (const lesson of d.lessons) {
    const teacherMode = mask.teachers[lesson.teacherId];
    const classMode = mask.classes[lesson.classId];
    if (teacherMode === "hidden" || classMode === "hidden") continue;
    // ONE CARD PER BLOCK, not per lesson. A 2+1 lesson is a two-hour card and a
    // one-hour card, and which of them is picked up decides how many cells the
    // drop covers — so the choice has to be a thing on the tray, not a hidden
    // "whichever is next". Asked for by name; it is also what aSc's tray does.
    const owed = pendingBlocks(d, lesson);
    if (owed.length === 0) {
      completed++;
      continue;
    }
    const placed = ix.placedHours.get(lesson.id) ?? 0;
    const group = ix.classById.get(lesson.classId);
    const teacher = ix.teacherById.get(lesson.teacherId);
    const className = group?.name ?? "?";
    const teacherShort = teacher?.short ?? "?";
    const subject = lessonSubject(d, lesson);
    total += owed.length;
    // The filter narrows by BRANCH, and it is applied after `total` so the
    // head can say "12 / 99" rather than pretending the rest went away.
    if (filter !== "" && subjectKey(subject) !== filter) continue;
    for (const [i, size] of owed.entries()) {
      cards.push({
        // Identity has to include WHICH of the lesson's cards this is, or React
        // reuses one node for two of them and the tray stops matching the data.
        key: `${lesson.id}#${size}#${i}`,
        lessonId: lesson.id,
        size,
        row:
          rowAt.get(teacherView ? lesson.teacherId : lesson.classId) ??
          Number.MAX_SAFE_INTEGER,
        top: teacherView ? className : teacherShort,
        bottom: teacherView ? teacherShort : className,
        subject: subjectLabel(subject),
        color: programColorIndex(d, lesson, colorMode),
        placed,
        total: lesson.weeklyHours,
        masked: teacherMode === "ghost" || classMode === "ghost",
        group: "",
      });
    }
  }

  cards.sort(poolOrder(sort));
  for (const card of cards) card.group = poolGroup(card, sort, t);
  return { cards, completed, total };
}

/**
 * The five orders, and the LAST TWO KEYS OF EVERY ONE OF THEM ARE THE SAME.
 *
 * `stackCards()` in LessonPool.tsx reads consecutive runs: identical blocks of
 * one lesson are drawn as a deck because the tray hands them over already
 * neighbours. Any order that lets a lesson's own cards drift apart silently
 * turns one deck into several, and forty tests count `.pool-card` rather than
 * decks, so nothing would say so. Hence `lessonId` then `size` at the end of
 * each comparator, every time.
 *
 * `compareTr` and not a bare `localeCompare('tr')`: the list screens already
 * have one home for Turkish collation and this is the same question.
 */
export function poolOrder(sort: PoolSort): (a: PoolCard, b: PoolCard) => number {
  const tail = (a: PoolCard, b: PoolCard) =>
    compareTr(a.lessonId, b.lessonId) || b.size - a.size;
  switch (sort) {
    case "name":
      return (a, b) =>
        compareTr(a.bottom, b.bottom) || compareTr(a.top, b.top) || tail(a, b);
    case "subject":
      return (a, b) =>
        compareTr(a.subject, b.subject) || a.row - b.row || tail(a, b);
    case "size":
      return (a, b) => b.size - a.size || a.row - b.row || tail(a, b);
    case "left":
      return (a, b) =>
        b.total - b.placed - (a.total - a.placed) ||
        a.row - b.row ||
        tail(a, b);
    // The tray's own order since the rows became draggable: it runs the same
    // way down as the grid, so a row's cards stand under the row.
    case "row":
    default:
      return (a, b) => a.row - b.row || compareTr(a.top, b.top) || tail(a, b);
  }
}

/**
 * What the heading over a run of cards says.
 *
 * Derived from the SORT rather than fixed, which is what makes the setting
 * visible: choosing "branşa göre" and getting the same nameless wall of
 * rectangles would be a setting that changed nothing you could see.
 */
export function poolGroup(card: PoolCard, sort: PoolSort, t: Translate): string {
  switch (sort) {
    case "subject":
      return card.subject;
    case "size":
      return t("{n} saatlik bloklar", { n: card.size });
    case "left":
      return t("{n} saat kaldı", { n: card.total - card.placed });
    case "name":
    case "row":
    default:
      return card.bottom;
  }
}

