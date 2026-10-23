// The main screen. Wires the grid, the lesson pool and the dragging together.
//
// Performance contract (for the slow machine):
//   - `rows` and `cards` are useMemo'd, recomputed only when the state changes.
//   - Grid is React.memo; changing the reason bar does not redraw the grid.
//   - No state changes at all during a drag (see drag.ts).

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type React from 'react';
import * as ContextMenu from '@radix-ui/react-context-menu';
import { Eye, EyeOff, Pencil, Pin, PinOff, Trash2 } from 'lucide-react';
import {
  blockAt,
  blockPinned,
  buildIndex,
  closedKey,
  applyDrop,
  dropMap,
  evictionNotice,
  removeBlock,
  placementKey,
  swapDoneNotice,
  setBlockPinned,
  pinScopeCells,
  togglePinScope,
} from '../../pure/constraints';
import type { BlockRef, PinScope } from '../../pure/constraints';
import { cellKey, parseCellKey } from '../../leaf/keys';
import { useToast } from '../Toasts';
import { useInspect } from './Inspector';
import { useLessonEdit } from '../LessonEdit';
import { dayLabel, lessonSubject, subjectShort } from '../../pure/entities';
import {
  buildPool,
  buildRows,
  classOfCell,
  describeBar,
  markPreview,
  roomLetter,
  visibleDays,
  waitingSubjects,
  type ColorOf,
} from '../../pure/programView';
import { useDrag } from '../../platform/drag';
import type { DragData } from '../../platform/drag';
import { samePlan, type SolverRun } from '../../platform/search';
import { applySuggestion, suggestionDiff } from '../../pure/relax';
import type { State, Id } from '../../leaf/types';
import {
  activePinned,
  activePlacements,
  rowMask,
  setDayMask,
  setRowMask,
  type ProgramMask,
} from '../../pure/program';
import {
  programColorIndex,
  type PoolSort,
  type View,
  type ProgramColorMode,
} from '../../platform/prefs';
import { KIND_ICON } from './steps';
import Grid from './Grid';
import type { GridMenuTarget } from './Grid';
import LessonPool from './LessonPool';
import Suggestions, { wayName } from './Suggestions';
import type { Preview } from './Suggestions';
import { T, useT } from '../T';

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
      const pushedOut = verdict?.evicts ?? [];
      const lesson = ix.lessonById.get(data.lessonId);
      const told =
        verdict?.action.kind === 'swap' && data.source !== null
          ? swapDoneNotice(ix, data.source, verdict.action.targets)
          : pushedOut.length === 0 || lesson === undefined
            ? ''
            : evictionNotice(
                ix,
                pushedOut.map((id) => ix.lessonById.get(id)).filter((x) => x !== undefined),
                true,
              );

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
  // THE PREVIEW (TODO B5.11): a way's week drawn on the grid, marked, before
  // anything is applied. Nothing in it can be dragged or removed.
  const [preview, setPreview] = useState<Preview | null>(null);
  const advice = solver.advice;
  const stale = advice !== null && !samePlan(state, advice.forState);
  const previewed =
    preview === null || advice === null
      ? null
      : (advice.suggestions.find((s) => s.family === preview.family) ?? null);
  useEffect(() => {
    if (preview !== null && (previewed === null || stale)) setPreview(null);
  }, [preview, previewed, stale]);
  const diff = useMemo(
    () => (previewed === null ? null : suggestionDiff(state, previewed)),
    [state, previewed],
  );
  const shown = useMemo(
    () =>
      previewed !== null && preview?.show === 'after' ? applySuggestion(state, previewed) : null,
    [state, previewed, preview?.show],
  );
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
  // The first opened hour into view: on the father's week they sit on
  // Saturday, off the right edge of a 1920 px screen, and the preview is for
  // seeing exactly those.
  useEffect(() => {
    if (shown === null) return;
    const frame = requestAnimationFrame(() =>
      document
        .querySelector('.program-body .card.mark-opened')
        ?.scrollIntoView({ block: 'nearest', inline: 'center' }),
    );
    return () => cancelAnimationFrame(frame);
  }, [shown]);
  useEffect(() => {
    if (preview === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPreview(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [preview]);

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
  const { text: barText, level: barLevel } = describeBar(solver, view, t, current);

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
  const menuAt = menuTarget?.kind === 'card' ? menuTarget : null;
  const menuRowId =
    menuTarget?.kind === 'row' || menuTarget?.kind === 'card' ? menuTarget.rowId : null;
  const menuDay =
    menuTarget?.kind === 'day' || menuTarget?.kind === 'column' || menuTarget?.kind === 'card'
      ? menuTarget.day
      : null;

  const menuClass = menuAt === null ? null : classAt(state, menuAt.rowId, menuAt.day, menuAt.hour);
  const menuPinned =
    menuAt !== null && menuClass !== null && blockPinned(state, menuClass, menuAt.day, menuAt.hour);
  const menuLessonId =
    menuAt === null || menuClass === null
      ? undefined
      : activePlacements(state)[
          placementKey(
            menuClass,
            menuAt.day,
            blockAt(state, menuClass, menuAt.day, menuAt.hour)?.hour ?? menuAt.hour,
          )
        ];
  const menuLesson = menuLessonId === undefined ? undefined : ix.lessonById.get(menuLessonId);
  const menuCellMasked =
    menuLesson !== undefined &&
    (mask.teachers[menuLesson.teacherId] !== undefined ||
      mask.classes[menuLesson.classId] !== undefined);

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
  const menuRowMode = menuRowId === null ? undefined : rowMask(mask, view, menuRowId);
  const menuDayName = menuDay === null ? undefined : state.settings.days[menuDay]?.name;
  const menuDayMode = menuDayName === undefined ? undefined : mask.days[menuDayName];

  const poolMenuLesson =
    poolMenuLessonId === null ? undefined : ix.lessonById.get(poolMenuLessonId);
  const poolMenuRowId =
    poolMenuLesson === undefined
      ? null
      : view === 'teacher'
        ? poolMenuLesson.teacherId
        : poolMenuLesson.classId;
  const poolMenuRowMode = poolMenuRowId === null ? undefined : rowMask(mask, view, poolMenuRowId);
  const setPoolMenuRowMode = useCallback(
    (mode?: 'ghost' | 'hidden') => {
      if (poolMenuRowId === null || solver.running) return;
      setMask((current) => setRowMask(current, view, poolMenuRowId, mode));
    },
    [poolMenuRowId, solver.running, setMask, view],
  );

  /**
   * "Put this row (or this day) aside for a moment."
   *
   * Written once and drawn in two places: flat on a row or day heading, where
   * the whole menu is two lines long, and one step in on a CARD, whose menu
   * already asks seven other questions. Same items either way — a Radix
   * `Item` is the same component in a `Content` and in a `SubContent`.
   *
   * "ghostla" is gone: it was an English verb wearing a Turkish suffix, in a
   * program whose one language rule is that the interface is Turkish and the
   * code is English. The MODE is still `ghost` in programMask.ts, because that
   * is code.
   */
  const maskItems = (
    <>
      {menuRowId !== null && (
        <>
          <ContextMenu.Item
            className="menu-item"
            disabled={solver.running}
            onSelect={() => setMenuRowMode(menuRowMode === 'ghost' ? undefined : 'ghost')}
          >
            <Eye size={15} aria-hidden="true" />
            {menuRowMode === 'ghost' ? t('Satırı geri yükle') : t('Satırı soluklaştır')}
          </ContextMenu.Item>
          <ContextMenu.Item
            className="menu-item"
            disabled={solver.running}
            onSelect={() => setMenuRowMode('hidden')}
          >
            <EyeOff size={15} aria-hidden="true" />
            {t('Satırı gizle')}
          </ContextMenu.Item>
        </>
      )}
      {menuDay !== null && (
        <>
          <ContextMenu.Item
            className="menu-item"
            disabled={solver.running}
            onSelect={() => setMenuDayMode(menuDayMode === 'ghost' ? undefined : 'ghost')}
          >
            <Eye size={15} aria-hidden="true" />
            {menuDayMode === 'ghost' ? t('Günü geri yükle') : t('Günü soluklaştır')}
          </ContextMenu.Item>
          <ContextMenu.Item
            className="menu-item"
            disabled={solver.running}
            onSelect={() => setMenuDayMode('hidden')}
          >
            <EyeOff size={15} aria-hidden="true" />
            {t('Günü gizle')}
          </ContextMenu.Item>
        </>
      )}
    </>
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
      for (const [key, verdict] of map) {
        const { day } = parseCellKey(key);
        const dayName = state.settings.days[day]?.name;
        if (dayName !== undefined && mask.days[dayName] !== undefined) {
          map.set(key, {
            ...verdict,
            blocked: t('{gun} geçici olarak kapsam dışında', {
              gun: dayLabel(dayName),
            }),
            warning: null,
            evicts: [],
          });
        }
      }

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
          <strong>{t('Henüz dizilecek ders yok.')}</strong>
          <T k="Önce **Okul** sekmesinden derslikleri, öğretmenleri ve sınıfları girin, **Müsaitlik** sekmesinde öğretmenlerin gelemediği saatleri işaretleyin, sonra **Dersler** sekmesinde her sınıfa haftalık ders saatlerini ekleyin." />
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
          one announcement per settled state rather than one per frame. */}
      <div
        className={`reason-bar${barLevel === '' ? '' : ` ${barLevel}`}`}
        role="status"
        aria-live="polite"
      >
        <span>{barText}</span>
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
        <div className="preview-bar" role="region" aria-label={t('Önizleme')}>
          <b>{t('Önizleme: {yol}', { yol: wayName(t, previewed.family) })}</b>
          <span className="segmented" role="group" aria-label={t('Hangi hafta')}>
            <button
              className="btn"
              aria-pressed={preview.show === 'before'}
              onClick={() => setPreview({ ...preview, show: 'before' })}
            >
              {t('Şu anki')}
            </button>
            <button
              className="btn"
              aria-pressed={preview.show === 'after'}
              onClick={() => setPreview({ ...preview, show: 'after' })}
            >
              {t('Önerilen')}
            </button>
          </span>
          <span className="preview-legend">
            <span className="mark-key mark-opened" aria-hidden="true" />
            {t('{n} öğretmen saati açılıyor', { n: diff.opened.size })}
            <span className="mark-key mark-moved" aria-hidden="true" />
            {t('{n} ders yer değiştiriyor', { n: diff.movedBlocks })}
          </span>
          <button className="btn primary" disabled={stale} onClick={() => solver.apply(previewed)}>
            {previewed.relaid ? t('Uygula, baştan diz') : t('Uygula')}
          </button>
          <button className="btn" onClick={() => setPreview(null)}>
            {t('Önizlemeyi kapat')}
          </button>
        </div>
      )}

      {/* The instrument, and the pool under it in a drawer. The pool spent a
          while down the right; it came back under the grid once it could
          open into the room the timetable does not use and be closed. */}
      <div className={shown === null ? 'program-body' : 'program-body previewing'}>
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
            <ContextMenu.Portal container={menuPortalRef.current}>
              <ContextMenu.Content className="menu" collisionPadding={8}>
                {menuAt !== null && (
                  <>
                    <ContextMenu.Item
                      className="menu-item"
                      disabled={
                        menuPinned ||
                        menuRowMode !== undefined ||
                        menuDayMode !== undefined ||
                        menuCellMasked
                      }
                      onSelect={() => cellRemove(menuAt.rowId, menuAt.day, menuAt.hour)}
                    >
                      <Trash2 size={15} strokeWidth={2} aria-hidden="true" />
                      {t('Havuza kaldır')}
                      {menuPinned && <span className="menu-why">{t('sabitlenmiş')}</span>}
                    </ContextMenu.Item>
                    <ContextMenu.Item
                      className="menu-item"
                      disabled={menuLessonId === undefined}
                      onSelect={() => menuLessonId !== undefined && editLesson(menuLessonId)}
                    >
                      <Pencil size={15} strokeWidth={2} aria-hidden="true" />
                      {t('Dersi düzenle')}
                    </ContextMenu.Item>
                    {/* THE TWO ENDS OF THE LESSON, and this is the only way to
                        reach the one the grid is NOT drawn along: the row head
                        opens the axis you are looking at, and finding the other
                        meant switching view and hunting for a name.
                        ("dersi düzenle ve öğretmeni düzenleme ve sınıfı
                         düzenlemede her şeyi düzenleyebilelim") */}
                    <ContextMenu.Item
                      className="menu-item"
                      disabled={menuLesson === undefined}
                      onSelect={() =>
                        menuLesson !== undefined && inspect('teacher', menuLesson.teacherId)
                      }
                    >
                      {KIND_ICON.teacher}
                      {t('Öğretmeni düzenle')}
                    </ContextMenu.Item>
                    <ContextMenu.Item
                      className="menu-item"
                      disabled={menuLesson === undefined}
                      onSelect={() =>
                        menuLesson !== undefined && inspect('class', menuLesson.classId)
                      }
                    >
                      {KIND_ICON.class}
                      {t('Sınıfı düzenle')}
                    </ContextMenu.Item>
                    <ContextMenu.Separator className="menu-sep" />
                    {/* ONE HOUR, back at the top level. It spent a round inside
                        the scope submenu, where the commonest lock in the
                        program was two clicks and a hover away from the hand
                        that wanted it. The card now carries a pin of its own,
                        so this is the same question asked the long way — and
                        the long way should still put it first. */}
                    <ContextMenu.Item
                      className="menu-item"
                      disabled={
                        menuRowMode !== undefined || menuDayMode !== undefined || menuCellMasked
                      }
                      onSelect={togglePin}
                    >
                      {menuPinned ? (
                        <PinOff size={15} aria-hidden="true" />
                      ) : (
                        <Pin size={15} aria-hidden="true" />
                      )}
                      {menuPinned ? t('Sabitlemeyi kaldır') : t('Dersi buraya sabitle')}
                    </ContextMenu.Item>
                  </>
                )}

                {menuAt !== null ? (
                  /* ...and the three that lock MANY hours at once stay one step
                     in. They are the rarer question and the dangerous one: a
                     click here can freeze a whole day. */
                  <ContextMenu.Sub>
                    <ContextMenu.SubTrigger
                      className="menu-item"
                      disabled={
                        menuRowMode !== undefined || menuDayMode !== undefined || menuCellMasked
                      }
                    >
                      <Pin size={15} strokeWidth={2} aria-hidden="true" />
                      {t('Toplu sabitle')}
                    </ContextMenu.SubTrigger>
                    <ContextMenu.Portal container={menuPortalRef.current}>
                      <ContextMenu.SubContent className="menu" sideOffset={4}>
                        <ContextMenu.Item
                          className="menu-item"
                          onSelect={() =>
                            toggleScope({
                              kind: 'row',
                              view,
                              rowId: menuAt.rowId,
                            })
                          }
                        >
                          <Pin size={15} aria-hidden="true" />
                          {t('Satırı sabitle / kaldır')}
                        </ContextMenu.Item>
                        <ContextMenu.Item
                          className="menu-item"
                          onSelect={() =>
                            toggleScope({
                              kind: 'column',
                              day: menuAt.day,
                              hour: menuAt.hour,
                            })
                          }
                        >
                          <Pin size={15} aria-hidden="true" />
                          {t('Sütunu sabitle / kaldır')}
                        </ContextMenu.Item>
                        <ContextMenu.Item
                          className="menu-item"
                          onSelect={() => toggleScope({ kind: 'day', day: menuAt.day })}
                        >
                          <Pin size={15} aria-hidden="true" />
                          {t('Günü sabitle / kaldır')}
                        </ContextMenu.Item>
                      </ContextMenu.SubContent>
                    </ContextMenu.Portal>
                  </ContextMenu.Sub>
                ) : menuTarget?.kind === 'row' ? (
                  <ContextMenu.Item
                    className="menu-item"
                    disabled={menuRowMode !== undefined}
                    onSelect={() =>
                      toggleScope({
                        kind: 'row',
                        view,
                        rowId: menuTarget.rowId,
                      })
                    }
                  >
                    <Pin size={15} aria-hidden="true" />
                    {t('Satırı sabitle / kaldır')}
                  </ContextMenu.Item>
                ) : menuTarget?.kind === 'day' ? (
                  <ContextMenu.Item
                    className="menu-item"
                    disabled={menuDayMode !== undefined}
                    onSelect={() => toggleScope({ kind: 'day', day: menuTarget.day })}
                  >
                    <Pin size={15} aria-hidden="true" />
                    {t('Günü sabitle / kaldır')}
                  </ContextMenu.Item>
                ) : menuTarget?.kind === 'column' ? (
                  <ContextMenu.Item
                    className="menu-item"
                    disabled={menuDayMode !== undefined}
                    onSelect={() =>
                      toggleScope({
                        kind: 'column',
                        day: menuTarget.day,
                        hour: menuTarget.hour,
                      })
                    }
                  >
                    <Pin size={15} aria-hidden="true" />
                    {t('Sütunu sabitle / kaldır')}
                  </ContextMenu.Item>
                ) : null}

                {(menuRowId !== null || menuDay !== null) && menuTarget?.kind !== 'column' && (
                  <>
                    <ContextMenu.Separator className="menu-sep" />
                    {menuAt !== null ? (
                      <ContextMenu.Sub>
                        <ContextMenu.SubTrigger className="menu-item" disabled={solver.running}>
                          <Eye size={15} strokeWidth={2} aria-hidden="true" />
                          {t('Geçici görünüm')}
                        </ContextMenu.SubTrigger>
                        <ContextMenu.Portal container={menuPortalRef.current}>
                          <ContextMenu.SubContent className="menu" sideOffset={4}>
                            {maskItems}
                          </ContextMenu.SubContent>
                        </ContextMenu.Portal>
                      </ContextMenu.Sub>
                    ) : (
                      maskItems
                    )}
                  </>
                )}
              </ContextMenu.Content>
            </ContextMenu.Portal>
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
            <ContextMenu.Portal container={menuPortalRef.current}>
              <ContextMenu.Content className="menu" collisionPadding={8}>
                <ContextMenu.Item className="menu-item" disabled>
                  <Trash2 size={15} strokeWidth={2} aria-hidden="true" />
                  {t('Havuza kaldır')}
                </ContextMenu.Item>
                <ContextMenu.Item
                  className="menu-item"
                  disabled={poolMenuLesson === undefined}
                  onSelect={() => poolMenuLesson !== undefined && editLesson(poolMenuLesson.id)}
                >
                  <Pencil size={15} strokeWidth={2} aria-hidden="true" />
                  {t('Dersi düzenle')}
                </ContextMenu.Item>
                <ContextMenu.Item
                  className="menu-item"
                  disabled={poolMenuLesson === undefined}
                  onSelect={() =>
                    poolMenuLesson !== undefined && inspect('teacher', poolMenuLesson.teacherId)
                  }
                >
                  {KIND_ICON.teacher}
                  {t('Öğretmeni düzenle')}
                </ContextMenu.Item>
                <ContextMenu.Item
                  className="menu-item"
                  disabled={poolMenuLesson === undefined}
                  onSelect={() =>
                    poolMenuLesson !== undefined && inspect('class', poolMenuLesson.classId)
                  }
                >
                  {KIND_ICON.class}
                  {t('Sınıfı düzenle')}
                </ContextMenu.Item>
                <ContextMenu.Separator className="menu-sep" />
                <ContextMenu.Item className="menu-item" disabled>
                  <Pin size={15} aria-hidden="true" />
                  {t('Dersi buraya sabitle')}
                </ContextMenu.Item>
                <ContextMenu.Item className="menu-item" disabled>
                  <Pin size={15} strokeWidth={2} aria-hidden="true" />
                  {t('Toplu sabitle')}
                </ContextMenu.Item>
                {poolMenuRowId !== null && (
                  <>
                    <ContextMenu.Separator className="menu-sep" />
                    <ContextMenu.Sub>
                      <ContextMenu.SubTrigger className="menu-item" disabled={solver.running}>
                        <Eye size={15} strokeWidth={2} aria-hidden="true" />
                        {t('Geçici görünüm')}
                      </ContextMenu.SubTrigger>
                      <ContextMenu.Portal container={menuPortalRef.current}>
                        <ContextMenu.SubContent className="menu" sideOffset={4}>
                          <ContextMenu.Item
                            className="menu-item"
                            disabled={solver.running}
                            onSelect={() =>
                              setPoolMenuRowMode(poolMenuRowMode === 'ghost' ? undefined : 'ghost')
                            }
                          >
                            <Eye size={15} aria-hidden="true" />
                            {poolMenuRowMode === 'ghost'
                              ? t('Satırı geri yükle')
                              : t('Satırı soluklaştır')}
                          </ContextMenu.Item>
                          <ContextMenu.Item
                            className="menu-item"
                            disabled={solver.running}
                            onSelect={() => setPoolMenuRowMode('hidden')}
                          >
                            <EyeOff size={15} aria-hidden="true" />
                            {t('Satırı gizle')}
                          </ContextMenu.Item>
                        </ContextMenu.SubContent>
                      </ContextMenu.Portal>
                    </ContextMenu.Sub>
                  </>
                )}
              </ContextMenu.Content>
            </ContextMenu.Portal>
          }
        />
      </div>
    </>
  );
}

export default memo(Program);
