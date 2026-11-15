// The main screen. Wires the grid, the lesson pool and the dragging together.
//
// Performance contract (for the slow machine):
//   - `rows` and `cards` are useMemo'd, recomputed only when the state changes.
//   - Grid is React.memo; changing the reason bar does not redraw the grid.
//   - No state changes at all during a drag (see drag.ts).

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type React from 'react';
import {
  blockAt,
  blockPinned,
  buildIndex,
  closedKey,
  applyDrop,
  dropMap,
  removeBlock,
  placementKey,
  setBlockPinned,
  pinScopeCells,
  togglePinScope,
  type BlockRef,
  type PinScope,
} from '../../pure/constraints';
import { cellKey, type State, type Id } from '../../leaf/model';
import { useToast, T, useT } from '../common';
import { useInspect } from './Inspector';
import { useLessonEdit } from './LessonEdit';
import { lessonSubject, subjectShort } from '../../pure/entities';
import {
  blockMaskedDays,
  buildPool,
  buildRows,
  classOfCell,
  describeBar,
  describeMenu,
  dropNotice,
  poolMenuFacts,
  markPreview,
  roomLetter,
  visibleDays,
  waitingSubjects,
  type ColorOf,
} from '../../pure/program';
import { useDrag, type DragData } from '../../platform/dom';
import { samePlan, type SolverRun } from '../../platform/search';
import { setDayMask, setRowMask, type ProgramMask } from '../../pure/program';
import { activePinned, activePlacements } from '../../pure/grid';
import {
  programColorIndex,
  type PoolSort,
  type View,
  type ProgramColorMode,
} from '../../platform/prefs';
import Grid from './Grid';
import type { GridMenuTarget } from './Grid';
import LessonPool from './LessonPool';
import Suggestions from './Suggestions';
import PreviewBar from './PreviewBar';
import GridMenu from './GridMenu';
import PoolMenu from './PoolMenu';
import { usePreview } from './usePreview';

interface Props {
  /** False while the Activity keeps this tree mounted behind another tab. */
  active: boolean;
  state: State;
  change: (apply: (d: State) => State) => void;
  /** The automatic run. Owned by App so it survives a tab change. */
  solver: SolverRun;
  /** Which axis the rows are. Owned by App: the tool strip above shows it. */
  view: View;
  mask: ProgramMask;
  setMask: (apply: (mask: ProgramMask) => ProgramMask) => void;
  /** How the tray is arranged. A POSITION, owned by App (see toolState.ts). */
  poolSort: PoolSort;
  setPoolSort: (next: PoolSort) => void;
  poolFilter: string;
  setPoolFilter: (next: string) => void;
  colorMode: ProgramColorMode;
}

/**
 * Whether the plan is still the one `said` was said about. The bar's lines
 * after a run or an applied suggestion end in "Ctrl+Z ile geri alabilirsiniz",
 * and after that Ctrl+Z they went on saying it had worked (DENETIM DK4).
 *
 * The plan is recorded on the render the sentence first appears in: the run
 * and its result arrive in one batched update, so that render already holds
 * the plan the sentence describes. Storing it during render is React's own
 * pattern for "information from previous renders".
 */
function useStillSaid(said: unknown, state: State): boolean {
  const [at, setAt] = useState<{ said: unknown; state: State } | null>(null);
  if (said !== null && at?.said !== said) setAt({ said, state });
  return said === null || at === null || at.said !== said || samePlan(at.state, state);
}

/** What a cell in the preview does when touched: nothing, it is not the timetable. */
const still = () => {};

function Program({
  active,
  state,
  change,
  solver,
  view,
  mask,
  setMask,
  poolSort,
  setPoolSort,
  poolFilter,
  setPoolFilter,
  colorMode,
}: Props) {
  const t = useT();
  const ix = useMemo(() => buildIndex(state), [state]);
  const notify = useToast();
  const editLesson = useLessonEdit();
  // "öğretmeni düzenleme ve sınıfı düzenlemede her şeyi düzenleyebilelim":
  // the entity sheet is the one that edits an entity, and from a card it is
  // the only way to reach the axis the grid is NOT drawn along.
  const inspect = useInspect();

  const drop = useCallback(
    (data: DragData, day: number, hour: number) => {
      // Read out of the map BEFORE change(): React runs a reducer callback
      // late, and reading a ref or a closure variable inside one is how the
      // solver's whole result once went missing (pitfall 20).
      const verdict = data.map.get(cellKey(day, hour));
      const told = dropNotice(ix, data.lessonId, data.source, verdict);

      change((d) => {
        if (verdict === undefined) return d;
        return applyDrop(d, {
          lessonId: data.lessonId,
          size: data.blockSize,
          source: data.source,
          day,
          hour,
          action: verdict.action,
        });
      });

      if (told !== '') notify(told);
    },
    [change, ix, notify],
  );

  const { start } = useDrag(drop);

  // `t` is IN the deps and not an import, so a language switch rebuilds the
  // rows. A module-level translator would read the new language only the next
  // time `state` happened to change.
  const advice = solver.advice;
  const { preview, setPreview, stale, previewed, diff, shown } = usePreview(state, advice);
  const colorOf = useCallback<ColorOf>(
    (d, lesson) => programColorIndex(d, lesson, colorMode),
    [colorMode],
  );
  const rows = useMemo(
    () =>
      shown !== null && diff !== null
        ? markPreview(
            buildRows(shown, buildIndex(shown), view, mask, colorOf, t),
            shown,
            diff,
            view,
          )
        : buildRows(state, ix, view, mask, colorOf, t),
    [shown, diff, state, ix, view, mask, colorOf, t],
  );
  // The plan's answers are the search's: an answer, or an undo that takes one
  // back, runs it again (useSolver checks whether anything changed).
  const { reconsider } = solver;
  useEffect(() => {
    if (advice !== null) reconsider(state.answers);
  }, [state.answers, advice, reconsider]);
  const {
    cards,
    completed,
    total: poolTotal,
  } = useMemo(
    // In the preview the tray is the suggested week's too: what it leaves
    // waiting, which for a way that builds the week is nothing.
    () =>
      shown === null
        ? buildPool(state, ix, view, mask, poolSort, poolFilter, colorOf, t)
        : buildPool(shown, buildIndex(shown), view, mask, poolSort, poolFilter, colorOf, t),
    [shown, state, ix, view, mask, poolSort, poolFilter, colorOf, t],
  );
  // The branches with something still waiting (see `waitingSubjects`).
  const poolSubjects = useMemo(() => waitingSubjects(state, mask), [state, mask]);
  const dayIndices = useMemo(
    () => visibleDays(state.settings.days, mask.days),
    [state.settings.days, mask.days],
  );

  // What the bar under the toolbar says. Drag first: that answers a question
  // the hand is asking right now.
  const current = {
    applied: useStillSaid(solver.applied, state),
    result: useStillSaid(solver.result, state),
  };
  const {
    text: barText,
    level: barLevel,
    counter: barCounter,
  } = describeBar(solver, view, t, current);

  /** WHICH CLASS a grid cell belongs to (see `classOfCell`). */
  const classAt = useCallback(
    (d: State, rowId: string, day: number, hour: number): Id | null =>
      classOfCell(d, view, rowId, day, hour),
    [view],
  );

  const cellRemove = useCallback(
    (rowId: string, day: number, hour: number) => {
      // Asked BEFORE the change so the refusal can be spoken. `removeBlock`
      // returns the same state for a pinned block, which the store correctly
      // treats as "nothing happened" — and nothing happening in silence is
      // what a reader reads as a broken key.
      const classId = classAt(state, rowId, day, hour);
      if (classId !== null && blockPinned(state, classId, day, hour)) {
        notify(t('Bu ders sabitlenmiş. Önce sabitlemeyi kaldırın.'));
        return;
      }
      change((d) => {
        const fresh = classAt(d, rowId, day, hour);
        return fresh === null ? d : removeBlock(d, fresh, day, hour);
      });
    },
    [change, classAt, notify, state, t],
  );

  /**
   * The right-click menu: which block it is about.
   *
   * Kept as the CELL that was clicked rather than as a resolved lesson, because
   * the state can move under an open menu (an autosave, an undo, a solver run)
   * and every item re-reads from the state it acts on.
   */
  const [menuTarget, setMenuTarget] = useState<GridMenuTarget | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [poolMenuLessonId, setPoolMenuLessonId] = useState<Id | null>(null);
  const [poolMenuOpen, setPoolMenuOpen] = useState(false);
  // Keep Radix's portal inside the Activity boundary. A body-level portal
  // would remain visible when React hides the retained Program tree.
  const menuPortalRef = useRef<HTMLDivElement>(null);

  // Activity runs this cleanup whenever the Program tab is hidden. Radix
  // portals live under <body>, outside the hidden grid, so close them by state
  // rather than relying on the grid's CSS visibility.
  useEffect(
    () => () => {
      setMenuOpen(false);
      setMenuTarget(null);
      setPoolMenuOpen(false);
      setPoolMenuLessonId(null);
    },
    [],
  );
  const menuFacts = describeMenu(state, ix, view, mask, menuTarget);
  const { at: menuAt, rowId: menuRowId, day: menuDay } = menuFacts;

  /**
   * Lock or unlock ONE block, wherever the ask came from.
   *
   * Two callers, and they are different kinds of thing: the pin drawn ON the
   * card (a hand, on a square it is already looking at) and the menu item (the
   * same question asked the long way). Both land here, so the toast and the
   * refusal cannot drift apart — the shape `cellRemove` already has.
   */
  const pinCell = useCallback(
    (rowId: string, day: number, hour: number) => {
      const classId = classAt(state, rowId, day, hour);
      if (classId === null) return;
      const on = !blockPinned(state, classId, day, hour);
      change((d) => {
        const fresh = classAt(d, rowId, day, hour);
        return fresh === null ? d : setBlockPinned(d, fresh, day, hour, on);
      });
      notify(on ? t('Ders sabitlendi.') : t('Sabitleme kaldırıldı.'));
    },
    [change, classAt, notify, state, t],
  );

  const togglePin = useCallback(() => {
    if (menuAt === null) return;
    pinCell(menuAt.rowId, menuAt.day, menuAt.hour);
  }, [menuAt, pinCell]);

  const toggleScope = useCallback(
    (scope: PinScope) => {
      const cells = pinScopeCells(state, scope);
      if (cells.length === 0) return;
      const pinned = activePinned(state);
      const willPin = !cells.every((key) => pinned[key] !== undefined);
      change((d) => togglePinScope(d, scope));
      notify(
        willPin
          ? t('{n} saat sabitlendi.', { n: cells.length })
          : t('{n} saatin sabitlemesi kaldırıldı.', { n: cells.length }),
      );
    },
    [state, change, notify, t],
  );

  const setMenuRowMode = useCallback(
    (mode?: 'ghost' | 'hidden') => {
      if (menuRowId === null || solver.running) return;
      setMask((current) => setRowMask(current, view, menuRowId, mode));
    },
    [menuRowId, solver.running, setMask, view],
  );

  const setMenuDayMode = useCallback(
    (mode?: 'ghost' | 'hidden') => {
      if (menuDay === null || solver.running) return;
      const name = state.settings.days[menuDay]?.name;
      if (name !== undefined) setMask((current) => setDayMask(current, name, mode));
    },
    [menuDay, solver.running, setMask, state.settings.days],
  );
  const {
    lesson: poolMenuLesson,
    rowId: poolMenuRowId,
    rowMode: poolMenuRowMode,
  } = poolMenuFacts(ix, view, mask, poolMenuLessonId);
  const setPoolMenuRowMode = useCallback(
    (mode?: 'ghost' | 'hidden') => {
      if (poolMenuRowId === null || solver.running) return;
      setMask((current) => setRowMask(current, view, poolMenuRowId, mode));
    },
    [poolMenuRowId, solver.running, setMask, view],
  );

  /**
   * One drag, two sources: a card from the pool (`source === null`) or a block
   * already on the grid, which is being MOVED.
   *
   * The map is computed against a state with the source block ALREADY LIFTED.
   * Without that a placed lesson blocks itself — hard constraints 2 (the class
   * is busy) and 5 (the teacher is in another class) both see its own cells —
   * and it could not even be dropped back where it came from. Nothing is
   * removed for real here: the lift happens inside the drop's single change().
   */
  const beginDrag = useCallback(
    (
      e: React.PointerEvent,
      lessonId: Id,
      source: { classId: Id; day: number; hour: number } | null,
      size: number,
    ) => {
      // The grid is being rewritten under the cursor; a drop now would race it.
      if (solver.running) return;

      const lesson = ix.lessonById.get(lessonId);
      if (lesson === undefined) return;

      const sourceRef: BlockRef | null =
        source === null ? null : { ...source, lessonId, size: Math.max(1, size) };

      // Valid cells are computed HERE, once — never again during the drag.
      // The loop moved into `dropMap`: it is not a rendering decision, it is
      // the constraint engine answering 72 questions, and one of the answers
      // ("occupied by this class's own lesson") now costs an eviction to say.
      const map = dropMap(state, ix, lessonId, size, sourceRef);
      blockMaskedDays(map, state, mask.days, t);

      const group = ix.classById.get(lesson.classId);
      const teacher = ix.teacherById.get(lesson.teacherId);
      const teacherView = view === 'teacher';

      start(
        e,
        {
          lessonId,
          rowId: teacherView ? lesson.teacherId : lesson.classId,
          blockSize: Math.max(1, size),
          hourCount: state.settings.hours.length,
          map,
          source: sourceRef,
        },
        {
          top: teacherView ? (group?.name ?? '?') : (teacher?.short ?? '?'),
          bottom: teacherView
            ? roomLetter(ix, group?.roomId)
            : subjectShort(state.settings, lessonSubject(state, lesson)),
          color: programColorIndex(state, lesson, colorMode),
        },
      );
    },
    [state, ix, view, start, solver.running, mask.days, colorMode, t],
  );

  const cardStart = useCallback(
    (e: React.PointerEvent, lessonId: Id, size: number) => beginDrag(e, lessonId, null, size),
    [beginDrag],
  );

  /** Left button on a placed block: pick it up and move it. */
  const cellMoveStart = useCallback(
    (e: React.PointerEvent, rowId: string, day: number, hour: number) => {
      const teacherView = view === 'teacher';
      const lessonId = teacherView
        ? ix.teacherBusy.get(closedKey(rowId, day, hour))
        : activePlacements(state)[placementKey(rowId, day, hour)];
      if (lessonId === undefined) return;

      const classId = teacherView ? (ix.lessonById.get(lessonId)?.classId ?? null) : rowId;
      if (classId === null) return;

      // The grabbed cell may be the middle of a block; the whole block moves —
      // and it carries its own length, which its lesson can no longer be asked
      // for now that one lesson can hold blocks of two different lengths.
      const found = blockAt(state, classId, day, hour);
      if (found === null) return;

      beginDrag(e, lessonId, { classId, day, hour: found.hour }, found.size);
    },
    [state, ix, view, beginDrag],
  );

  if (state.lessons.length === 0) {
    return (
      <>
        <div className="empty-screen">
          {/* The screen's heading, for a reader who moves by headings: the
              sentence below says what is missing, the heading says where. */}
          <h2 className="visually-hidden">{t('Program')}</h2>
          <strong>{t('Henüz dizilecek ders yok.')}</strong>
          <T k="Önce **Okul** sekmesinden derslikleri, öğretmenleri ve sınıfları girin, **Müsaitlik** sekmesinde öğretmenlerin müsait olmadığı saatleri işaretleyin, sonra **Dersler** sekmesinde her sınıfa haftalık ders saatlerini ekleyin." />
          <br />
          <br />
          {t('Buraya döndüğünüzde dersler alttaki havuzda kartlar hâlinde bekliyor olacak.')}
        </div>
      </>
    );
  }

  return (
    <>
      <div ref={menuPortalRef} className="program-menu-portal" />
      {/* One bar, three jobs: the drag reason, the solver's progress and the
          solver's verdict. It has a FIXED height so the grid never jumps down
          when something appears in it, and it is the line the eye is already
          trained on. The drag always wins — that one is answering a question
          the hand is asking right now.

          `aria-live="polite"` because two of the three jobs are announcements
          nobody is looking at this line for: the solver runs for seconds and
          then says what it managed, and a blocked drop says why. The
          accessibility contract has named this line since the round that
          removed the design constraints; until 2026-08-27 it was the one place
          that never got it. `polite` and not `assertive`: it must not cut into
          a dialog, and the DRAG reason updates several times a second while the
          pointer moves — the region is on the wrapper so those coalesce into
          one announcement per settled state rather than one per frame.

          The live region is the FIRST span only, not the whole bar: the run's
          counter (`barCounter`) changes many times a second and sits beside
          it, outside, so the start is said once and the result once. The bar
          is `aria-busy` while the run lasts. */}
      <div
        className={`reason-bar${barLevel === '' ? '' : ` ${barLevel}`}`}
        aria-busy={solver.running}
      >
        <span role="status" aria-live="polite">
          {barText}
        </span>
        {barCounter !== undefined && <span className="reason-count">{barCounter}</span>}
        {((solver.result !== null && current.result) ||
          (solver.applied !== null && current.applied)) &&
          !solver.running && (
            <span className="bar-actions">
              {solver.result !== null && solver.result.stuck.length > 0 && (
                <span className="hint inline">{t('Ayrıntı: Kontrol sekmesi.')}</span>
              )}
              <button className="btn" onClick={solver.clear}>
                {t('Tamam')}
              </button>
            </span>
          )}
      </div>

      {advice !== null && (
        <Suggestions
          advice={advice}
          state={state}
          stale={stale}
          preview={preview}
          onPreview={setPreview}
          onApply={solver.apply}
          onAnswer={change}
          onResume={solver.resume}
          onClose={solver.clear}
        />
      )}

      {previewed !== null && preview !== null && diff !== null && (
        <PreviewBar
          previewed={previewed}
          preview={preview}
          setPreview={setPreview}
          diff={diff}
          stale={stale}
          apply={solver.apply}
        />
      )}

      {/* The instrument, and the pool under it in a drawer. The pool spent a
          while down the right; it came back under the grid once it could
          open into the room the timetable does not use and be closed. */}
      <div className={shown === null ? 'program-body' : 'program-body previewing'}>
        {/* The grid's place in the outline: h1 the school, h2 the grid and
            the pool (LessonPool), h3 the pool's groups. It had no h2, so the
            pool's groups hung straight off the school name. */}
        <h2 className="visually-hidden">{t('Program')}</h2>
        <Grid
          settings={state.settings}
          rows={rows}
          dayIndices={dayIndices}
          dayModes={mask.days}
          firstColumnTitle={view === 'teacher' ? t('Öğretmen') : t('Sınıf')}
          onCellRemove={shown === null ? cellRemove : still}
          onCellMoveStart={shown === null ? cellMoveStart : still}
          onCellPin={shown === null ? pinCell : still}
          onMenu={shown === null ? setMenuTarget : still}
          menuOpen={active && menuOpen}
          onMenuOpenChange={setMenuOpen}
          menu={
            <GridMenu
              facts={menuFacts}
              menuTarget={menuTarget}
              view={view}
              running={solver.running}
              container={menuPortalRef.current}
              cellRemove={cellRemove}
              editLesson={editLesson}
              inspect={inspect}
              togglePin={togglePin}
              toggleScope={toggleScope}
              setMenuRowMode={setMenuRowMode}
              setMenuDayMode={setMenuDayMode}
            />
          }
        />

        <LessonPool
          cards={cards}
          completed={completed}
          total={poolTotal}
          sort={poolSort}
          setSort={setPoolSort}
          filter={poolFilter}
          setFilter={setPoolFilter}
          subjects={poolSubjects}
          onStart={cardStart}
          onMenu={setPoolMenuLessonId}
          menuOpen={active && poolMenuOpen}
          onMenuOpenChange={setPoolMenuOpen}
          menu={
            <PoolMenu
              poolMenuLesson={poolMenuLesson}
              poolMenuRowId={poolMenuRowId}
              poolMenuRowMode={poolMenuRowMode}
              running={solver.running}
              container={menuPortalRef.current}
              editLesson={editLesson}
              inspect={inspect}
              setPoolMenuRowMode={setPoolMenuRowMode}
            />
          }
        />
      </div>
    </>
  );
}

export default memo(Program);
