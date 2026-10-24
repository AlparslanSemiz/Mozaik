// The search itself: `createRelaxer` slices it, pushes each family's count
// down until the formula says "no fewer", looks for cheaper weeks near the best
// one, and `suggest` runs it to the end in one go.

import { type Id, type Relaxation, type State, blockPlan, closedKey } from '../../leaf/model';
import { buildIndex } from '../constraints';
import {
  type Model,
  type ModelKind,
  type Slot,
  buildModel,
  costsOf,
  countTrue,
  frameOf,
  gridOf,
  kindOf,
  subsets,
} from './model';
import {
  DEFAULTS,
  FAMILY_CONFLICTS,
  FIRST_CAP,
  HAND_CAP,
  HINT_CONFLICTS,
  NEIGHBOURHOOD_CONFLICTS,
  NEIGHBOURHOOD_SIZES,
  type RelaxFamily,
  type RelaxOptions,
  type RelaxProgress,
  type RelaxResult,
  type RelaxStage,
  type Relaxer,
  type Suggestion,
  WHOLE_WEEK_CONFLICTS,
  WIDE_NEIGHBOURHOOD_SIZES,
} from './options';
import { hoursOver, openedHours, openedOf, raisedLimits, sortChanges, withGrid } from './reading';
import { type Lit, Sat, not, totalizer } from './sat';
import { applyRelaxations, verifySuggestion } from './verify';

// ---------------------------------------------------------------- the search

export function createRelaxer(
  given: State,
  hint: Readonly<Record<string, Id>>,
  options?: Partial<RelaxOptions>,
): Relaxer {
  const opts: RelaxOptions = { ...DEFAULTS, ...options };
  // What the reader said yes to is made first and costs nothing: the search
  // runs on that data, and every week it offers is checked against the data
  // as it was, with the answers named among its changes.
  const base = opts.accepted.length > 0 ? applyRelaxations(given, opts.accepted) : given;
  let frame = frameOf(base, opts);
  let relaid = false;
  const lessonsById = new Map(base.lessons.map((x) => [x.id, x]));
  /** The formulas built so far in this pass, one per kind. */
  let models = new Map<ModelKind, Model>();

  let elapsedMs = 0;
  let family: RelaxFamily = opts.families[0] ?? 'teacherHours';
  let stage: RelaxStage = 'building';
  let doneFamilies: RelaxFamily[] = [];
  const suggestions: Suggestion[] = [];
  let rejected = 0;
  let finished: RelaxResult | null = null;
  let deadline = 0;

  /** The running family's conflict count at which it has to stop. */
  let familyUntil = 0;
  const budgetLeft = () => opts.budgetMs - elapsedMs;

  /** Asks the formula one question, a slice at a time, until `until` conflicts at most. */
  function* ask(
    sat: Sat,
    assumptions: Lit[],
    until: number,
  ): Generator<void, 'sat' | 'unsat' | 'budget'> {
    sat.start(assumptions);
    const stop = Math.min(until, familyUntil);
    for (;;) {
      if (budgetLeft() <= 0 || sat.conflicts >= stop) return 'budget';
      const status = sat.run(deadline, stop);
      if (status !== 'paused') return status;
      yield;
    }
  }

  /**
   * The changes a family's week needs, read off the week itself, and for the
   * kinds whose change is not in the grid (who teaches, which shape, what is
   * dropped) off the formula's last model, which is always the week's: `best`
   * is copied every time a model is found.
   */
  function changesOf(which: RelaxFamily, model: Model, grid: Record<string, Id>): Relaxation[] {
    switch (which) {
      case 'teacherDays':
      case 'teacherHours':
      case 'fewTeachers':
        return openedHours(base, grid);
      case 'mixed':
        return sortChanges([...openedHours(base, grid), ...raisedLimits(base, grid)]);
      case 'rules':
        return raisedLimits(base, grid);
      case 'reassign':
      case 'handFew':
      case 'handHours':
        // The hours off the formula, not the grid: the grid names a lesson's
        // old teacher, and a lesson handed over is taught by the new one.
        return sortChanges([
          ...openedOf(model),
          ...[...model.handedTo]
            .filter(([l]) => model.sat.value(l))
            .map(([, h]) => ({ kind: 'lessonTeacher' as const, ...h })),
        ]);
      case 'blockShape':
        return sortChanges(
          [...model.reshape]
            .filter(([, r]) => model.sat.value(r))
            .map(([lessonId]) => ({
              kind: 'blockShape' as const,
              lessonId,
              blocks: [],
            })),
        );
      case 'weeklyHours': {
        const dropped = new Map<Id, number[]>();
        for (const [d, slot] of model.dropOf) {
          if (!model.sat.value(d)) continue;
          dropped.set(slot.lesson.id, [...(dropped.get(slot.lesson.id) ?? []), slot.size]);
        }
        const out: Relaxation[] = [];
        for (const [lessonId, sizes] of dropped) {
          const lesson = lessonsById.get(lessonId)!;
          // What is left of the plan names the new shape: drop a 2 from 2+1
          // and the lesson is one hour, drop the 1 and it is one 2-hour block.
          const left = blockPlan(lesson);
          for (const size of sizes) left.splice(left.indexOf(size), 1);
          out.push({
            kind: 'weeklyHours',
            lessonId,
            hours: left.reduce((sum, b) => sum + b, 0),
            blocks: left.filter((b) => b > 1),
          });
        }
        return sortChanges(out);
      }
    }
  }

  function sizeOf(which: RelaxFamily, changes: Relaxation[], grid: Record<string, Id>): number {
    switch (which) {
      case 'rules':
        return hoursOver(base, grid);
      case 'mixed':
        return changes.filter((c) => c.kind === 'teacherHour').length + hoursOver(base, grid);
      case 'weeklyHours':
        return changes.reduce((sum, c) => {
          if (c.kind !== 'weeklyHours') return sum;
          return sum + (lessonsById.get(c.lessonId)?.weeklyHours ?? c.hours) - c.hours;
        }, 0);
      default:
        return changes.length;
    }
  }

  function* familySearch(which: RelaxFamily): Generator<void, void> {
    family = which;
    stage = 'building';
    const kind = kindOf(which);
    let model = models.get(kind);
    const fresh = model === undefined;
    if (model === undefined) {
      // A new formula starts from the best week any way has found so far:
      // most of it stands under this way's changes too.
      const latest = suggestions[suggestions.length - 1];
      const own = opts.previous.find((x) => x.family === which && x.relaid === relaid);
      const seeded = opts.seed.find((x) => x.relaid === relaid);
      model = buildModel(
        base,
        frame,
        kind,
        opts,
        own?.placements ?? latest?.placements ?? seeded?.placements ?? hint,
      );
      models.set(kind, model);
      yield;
    } else {
      // A formula shared with the way before: start from that way's week.
      model.sat.phaseFromModel();
    }
    const { sat } = model;
    const [cost, cost2] = costsOf(which, model);
    const openDays = base.settings.days.flatMap((d, i) =>
      opts.exclusions.dayNames.includes(d.name) ? [] : [i],
    );
    familyUntil = sat.conflicts + FAMILY_CONFLICTS[which];

    // Any week at all under this family's changes. A new formula first asks
    // for the hint week outright, briefly. It was written so because a phase
    // alone was thought not enough (TRAPS 134), but the question is refused at
    // once on every formula, since `hinted` names more than one start per
    // block (buildModel), and a version that answered it searched worse
    // (MEASURED 2026-09-26, DECISIONS). The refused question is kept:
    // the week the search finds today is found after it.
    stage = 'solving';
    if (fresh && model.hinted.length > 0) {
      if ((yield* ask(sat, model.hinted, sat.conflicts + HINT_CONFLICTS)) === 'sat')
        sat.phaseFromModel();
    }
    const must: Lit[] = [];
    if (model.needHand !== null) must.push(model.needHand);
    if (which === 'handHours' && model.handCap !== null) must.push(model.handCap);
    const answer = yield* ask(sat, must, Infinity);
    if (answer !== 'sat') return;

    // Then fewer and fewer changes, until "no fewer" is proven or the search
    // stops getting anywhere. Every bound is an assumption, not a clause, so a
    // proof does not poison the formula for the next question.
    let best = gridOf(base, frame, model);
    const hours = base.settings.hours.length;
    /** Where each block of the best week starts: an index into its `vars`, or -1. */
    let starts: number[] = [];
    const readBest = () => {
      best = gridOf(base, frame, model);
      starts = model.slots.map((slot) => slot.vars.findIndex((x) => sat.value(x)));
    };
    readBest();
    /** The best week's starts, except the blocks `free` names: those are laid out again. */
    const keepOutside = (free: (slot: Slot, day: number) => boolean): Lit[] => {
      const kept: Lit[] = [];
      model.slots.forEach((slot, i) => {
        const at = starts[i]!;
        if (at >= 0 && !free(slot, Math.floor(slot.starts[at]! / hours))) kept.push(slot.vars[at]!);
      });
      return kept;
    };
    /**
     * The days a cheaper week has to change: where an opened hour or a limit
     * over its old number sits. Freeing two other days cannot touch the cost.
     * null when the change is not tied to a day.
     */
    const hotDays = (): Set<number> | null => {
      if (kind !== 'teacher' && kind !== 'mixed' && kind !== 'rules') return null;
      const hot = new Set<number>();
      for (const c of openedHours(base, best)) if (c.kind === 'teacherHour') hot.add(c.day);
      if (kind !== 'teacher') {
        for (const c of raisedLimits(base, best))
          if ('days' in c) for (const d of c.days ?? []) hot.add(d);
      }
      // Nothing opened and no limit over, yet a cost left: a step raised for
      // nothing. No day holds it, so every day may.
      return hot.size > 0 ? hot : null;
    };
    /**
     * The classes a cheaper week has to change: the ones taught in an opened
     * hour or over a limit. A chain that frees an hour runs through a class's
     * whole week (its lessons trade places), which no set of days covers.
     */
    const hotClasses = (): Id[] => {
      if (kind !== 'teacher' && kind !== 'mixed' && kind !== 'rules') return [];
      const hot = new Set<Id>();
      const d = withGrid(base, best);
      const ix = buildIndex(d);
      for (const c of openedHours(base, best)) {
        if (c.kind !== 'teacherHour') continue;
        const lessonId = ix.teacherBusy.get(closedKey(c.teacherId, c.day, c.hour));
        const lesson = lessonId === undefined ? undefined : lessonsById.get(lessonId);
        if (lesson !== undefined) hot.add(lesson.classId);
      }
      if (kind !== 'teacher') {
        for (const c of raisedLimits(base, best)) {
          if (c.kind === 'lessonDayLimit') {
            const lesson = lessonsById.get(c.lessonId);
            if (lesson !== undefined) hot.add(lesson.classId);
          } else if (c.kind === 'teacherDayLimit' || c.kind === 'teacherConsecutive') {
            for (const day of c.days ?? [])
              for (let h = 0; h < hours; h++) {
                const lessonId = ix.teacherBusy.get(closedKey(c.teacherId, day, h));
                const lesson = lessonId === undefined ? undefined : lessonsById.get(lessonId);
                if (lesson !== undefined) hot.add(lesson.classId);
              }
          }
        }
      }
      return [...hot];
    };

    /**
     * Pushes the count of `lits` down under `keep`. `wide`: the two-class
     * neighbourhoods too and the whole-week question once no neighbourhood
     * helps, which is what finds a week far away and proves "no fewer".
     * `early` is called once, when the first round of neighbourhoods is over.
     */
    const tighten = function* (
      lits: Lit[],
      keep: Lit[],
      wide: boolean,
      early?: () => void,
    ): Generator<void, { keep: Lit[]; done: boolean; ub: number }> {
      if (lits.length === 0) return { keep, done: true, ub: 0 };
      let ub = countTrue(sat, lits);
      // The counter is built small and grown: one that counts to the first
      // week's cost (175 teacher hours on the father's data) is a formula many
      // times the size of the timetable, and every question after it pays.
      let cap = Math.min(ub + 1, FIRST_CAP);
      let out = totalizer(sat, lits, cap);
      stage = 'proving';
      let done = false;
      const better = () => {
        readBest();
        ub = countTrue(sat, lits);
        sat.phaseFromModel();
      };
      /** The neighbourhoods of one kind, each a test of which blocks go free. */
      const rounds: Array<() => Array<(slot: Slot, day: number) => boolean>> = [
        ...(opts.previous.length > 0 ? WIDE_NEIGHBOURHOOD_SIZES : NEIGHBOURHOOD_SIZES).map(
          (size) => () => {
            const hot = hotDays();
            return subsets(openDays, size)
              .filter((days) => hot === null || days.some((d) => hot.has(d)))
              .map((days) => (_slot: Slot, day: number) => days.includes(day));
          },
        ),
        () => {
          if (!wide) return [];
          const hot = hotClasses();
          return hot.flatMap((a) =>
            base.classes
              .filter((b) => b.id !== a)
              .map(
                (b) => (slot: Slot) => slot.lesson.classId === a || slot.lesson.classId === b.id,
              ),
          );
        },
      ];
      let early_ = early;
      search: while (ub > 0) {
        // Near the best week: two days free, then three and four, then two
        // classes' whole weeks, each kind until a whole round finds nothing
        // cheaper.
        for (const round of rounds) {
          let found = true;
          while (found && ub > 0) {
            found = false;
            for (const free of round()) {
              const k = Math.min(ub - 1, cap - 1);
              const question = [...keep, not(out[k]!), ...keepOutside(free)];
              const status = yield* ask(sat, question, sat.conflicts + NEIGHBOURHOOD_CONFLICTS);
              if (status === 'sat') {
                better();
                found = true;
                if (ub === 0) break;
              } else {
                sat.phaseFromModel();
              }
              if (budgetLeft() <= 0 || sat.conflicts >= familyUntil) break search;
            }
          }
        }
        if (ub === 0) break;
        // Then the whole week, for a while: either a cheaper week far from
        // this one, or the proof that there is none. Not wide: only for a jump
        // the counter cannot yet say one below (the first week of a way can be
        // 200 hours, and no two days take that to 31).
        const k = Math.min(ub - 1, cap - 1);
        if (k === ub - 1) {
          early_?.();
          early_ = undefined;
          if (!wide) break;
        }
        const status = yield* ask(
          sat,
          [...keep, not(out[k]!)],
          sat.conflicts + WHOLE_WEEK_CONFLICTS,
        );
        if (status === 'budget') break;
        if (status === 'sat') {
          better();
          continue;
        }
        if (k === ub - 1) {
          done = true;
          break;
        }
        // "Not under k" with k below ub - 1: count further and ask again.
        cap = Math.min(ub + 1, cap * 2);
        out = totalizer(sat, lits, cap);
        sat.phaseFromModel();
      }
      if (ub === 0) done = true;
      // The bound the next question keeps: no worse than the best found.
      if (out.length <= ub) out = totalizer(sat, lits, ub + 1);
      return { keep: out.length > ub ? [...keep, not(out[ub]!)] : keep, done, ub };
    };
    // What the neighbourhoods have found is offered at once, while the search
    // goes on: on the father's data it is mostly the answer already, and the
    // row is updated in place when it is not (WORKLOG 2026-09-24). Not for the
    // few-teachers way: its first count is teachers, and its hours, the part
    // the reader asks of them, are only settled by the second.
    const early = which === 'fewTeachers' ? undefined : () => offer(which, model, best, false);
    const first = yield* tighten(cost, must, true, early);
    // The hand-over way's week must open no hour at all, and `offer` drops one
    // that does. Searching fewer lessons handed over under a week that is
    // dropped anyway was the whole second half of its line: on the father's
    // file 15 of its 30 s, alone on a core (MEASURED 2026-09-25).
    if (which === 'reassign' && first.ub > 0) return;
    let proven = first.done;
    if (cost2.length > 0) {
      // Among the weeks as good as the best one, the one the second cost likes
      // best. Solved again under the first bound, so the model read below is
      // one that respects it.
      familyUntil = Math.max(familyUntil, sat.conflicts + WHOLE_WEEK_CONFLICTS);
      sat.phaseFromModel();
      const again = yield* ask(sat, first.keep, Infinity);
      if (again === 'sat') {
        readBest();
        // For the few-teachers way the second cost is the hours asked, and for
        // the rules the steps each limit goes up by: both are the answer. For
        // the others it is "side by side", a preference among equals, looked
        // for only near the best week.
        const wide = which === 'fewTeachers' || which === 'rules';
        proven = (yield* tighten(cost2, first.keep, wide)).done && proven;
      } else {
        proven = false;
      }
    }
    offer(which, model, best, proven);
  }

  function offer(
    which: RelaxFamily,
    model: Model,
    grid: Record<string, Id>,
    proven: boolean,
  ): void {
    stage = 'checking';
    const changes = changesOf(which, model, grid);
    const s: Suggestion = {
      family: which,
      changes,
      placements: grid,
      size: sizeOf(which, changes, grid),
      proven,
      relaid,
      accepted: opts.accepted,
    };
    // A handed-over week that still needs an hour opened is not this way, and
    // a hand-over way that hands nothing over is the teacher-hour way.
    if (which === 'reassign' && changes.some((c) => c.kind === 'teacherHour')) return;
    // Nor is one that hands over more lessons than the father would ask about:
    // the same cap as the hand-over ways (the user's decision, 2026-09-25,
    // after it came back with 9 and 15 lessons handed over).
    if (changes.filter((c) => c.kind === 'lessonTeacher').length > HAND_CAP) return;
    if (
      (which === 'handFew' || which === 'handHours') &&
      !changes.some((c) => c.kind === 'lessonTeacher')
    )
      return;
    const checked = { ...opts, keepPlaced: opts.keepPlaced && !relaid };
    if (verifySuggestion(given, s, checked).length !== 0) {
      rejected++;
      return;
    }
    // A later, better week of the same way takes the earlier one's place.
    const at = suggestions.findIndex((x) => x.family === which && x.relaid === relaid);
    if (at >= 0) suggestions[at] = s;
    else suggestions.push(s);
  }

  function* pass(): Generator<void, void> {
    doneFamilies = [];
    for (const which of opts.families) {
      yield* familySearch(which);
      doneFamilies.push(which);
      // A week that needs no change at all is the answer to every family.
      if (suggestions.some((s) => s.changes.length === 0)) return;
    }
  }

  function* all(): Generator<void, void> {
    if (opts.startRelaid && opts.keepPlaced) {
      relaid = true;
      frame = frameOf(base, { ...opts, keepPlaced: false });
      yield* pass();
      return;
    }
    yield* pass();
    // The run kept what was already laid out, and on the father's own file
    // that is exactly what left no way: 330 hours in place, the empty ones in
    // pieces a 2-hour block cannot use, and no change of any family moves a
    // placed block. So the search goes on with only the pins kept, and says so
    // (the user's decision, 2026-09-24).
    if (suggestions.length === 0 && opts.keepPlaced) {
      relaid = true;
      frame = frameOf(base, { ...opts, keepPlaced: false });
      models = new Map();
      yield* pass();
    }
  }

  const body = all();
  const result = (phase: RelaxResult['phase']): RelaxResult => ({
    phase,
    suggestions: [...suggestions],
    elapsedMs,
    rejected,
  });

  return {
    step(sliceMs: number): RelaxResult | null {
      if (finished !== null) return finished;
      const t0 = performance.now();
      deadline = t0 + sliceMs;
      const next = body.next();
      elapsedMs += performance.now() - t0;
      if (next.done === true) finished = result('done');
      return finished;
    },
    progress(): RelaxProgress {
      return {
        family,
        stage,
        finished: [...doneFamilies],
        suggestions: [...suggestions],
        elapsedMs,
      };
    },
    cancel(): RelaxResult {
      if (finished === null) finished = result('cancelled');
      return finished;
    },
  };
}

/** Runs to completion in one go. For tests. */
export function suggest(
  base: State,
  hint: Readonly<Record<string, Id>>,
  options?: Partial<RelaxOptions>,
): RelaxResult {
  const relaxer = createRelaxer(base, hint, options);
  for (;;) {
    const result = relaxer.step(50);
    if (result !== null) return result;
  }
}
