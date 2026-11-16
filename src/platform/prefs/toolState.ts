// WHERE YOU ARE in each tab — one object, owned by App.
//
// These values used to live inside the tab components, and switching tabs
// unmounted them: a glance at another tab lost the class view in Program and
// which list you were filling in. That is exactly the trap that put
// `printExcluded` and the solver run in App (pitfall 18); the only reason it
// went unnoticed here is that losing a POSITION is quieter than losing a
// search.
//
// They have to be up here anyway now: the tool strip that shows them is drawn
// above `<main>`, above the component that used to own them.
//
// None of it is stored, the open tab included: a start lands on Program when
// the plan has lessons and on Okul bilgileri when it has none. So the five
// tabs of 2026-11-16 (Sadeleşme, K1) had no saved tab id to carry over; the
// seven ids before them live on only as `OLD_TAB`, for anything that still
// says one.
//
// `lessonFocus` belongs here and goes NO FURTHER: it is a position inside a
// session, not a preference. "Which class am I entering lessons for" is not
// something a backup should carry to another machine.
//
// What is NOT here, and must not move here:
//   - AvailGrid's `pending` paint set     — changes dozens of times per second
//     while the pointer is down.
//   - Program's `dragging` / `reason`     — the whole drag.ts performance
//     contract rests on those staying out of App's render.
// Both are transient gestures, not positions.

import { useCallback, useState } from 'react';
import type { Id, PoolSort, View } from '../../leaf/model';

/**
 * The five tasks (Sadeleşme, K1, 2026-11-16), in the order they are drawn.
 * Before them there were seven places: Okul, Müsaitlik, Dersler, Program,
 * Kontrol, Çıktı and Ayarlar.
 */
export type Tab = 'program' | 'teachers' | 'classes' | 'print' | 'school';
/** The tab ids before K1 that are not one of the five. */
export type OldTab = 'setup' | 'availability' | 'lessons' | 'check' | 'settings';
/** Where each old tab's contents live now (LAYOUT, "Sekmeler"). */
export const OLD_TAB: Record<OldTab, Tab> = {
  setup: 'teachers',
  availability: 'teachers',
  lessons: 'classes',
  // The problems are the status chip's list, opened over Program.
  check: 'program',
  settings: 'school',
};
/** Any tab id, old or new, as one of the five. */
export function tabOf(id: Tab | OldTab): Tab {
  return id in OLD_TAB ? OLD_TAB[id as OldTab] : (id as Tab);
}
/** Program: which axis the grid rows are. Defined in types.ts, see there. */
export type { View };
/** The three kinds a person page is opened for. */
export type Kind = 'teacher' | 'class' | 'room';
/**
 * The four lists. Öğretmenler and Sınıflar are tabs of their own; Derslikler
 * and Branşlar are sections of Okul bilgileri.
 *
 * The order is the dependency chain, not a wizard: a class points at a room,
 * and a teacher picks a subject off the list, so both of those have to exist
 * before the list that names them.
 */
export type StepId = 'rooms' | 'subjects' | 'teachers' | 'classes';
/**
 * Öğretmenler and Sınıflar: the list, one person's lessons, or every lesson.
 *
 * "artık sınıftan mı eklemek istiyorsun? öğretmenden mi eklemek istiyorsun
 * genel bakmak mı istiyorsun". A lesson is the one row in this program that
 * belongs to two other lists, so it is entered from either of them, and the
 * general list is one door away in both.
 */
export type PeopleView = 'list' | 'lessons' | 'all';
/** The lesson form's axis: which list the open tab is, or every lesson. */
export type LessonMode = 'class' | 'teacher' | 'all';
/** Okul bilgileri: which section. */
export type SectionId =
  'school' | 'rooms' | 'subjects' | 'rules' | 'appearance' | 'plans' | 'about';
/** Yazdır: which pages the preview builds. */
export type Scope = 'classes' | 'teachers' | 'both';

/**
 * WHICH PART of the problem list is on screen.
 *
 * A position and not a preference, so it is not stored anywhere — the same
 * contract as `section`.
 */
export type CheckView = 'problems' | 'advisor' | 'teachers' | 'classes' | 'rooms';

/** Program: how the tray is arranged. Defined in types.ts, see there. */
export type { PoolSort };
export interface ToolState {
  tab: Tab;
  setTab: (next: Tab) => void;
  view: View;
  setView: (next: View) => void;
  /** Öğretmenler's and Sınıflar's own view, each remembered apart. */
  people: Record<'teachers' | 'classes', PeopleView>;
  setPeople: (tab: 'teachers' | 'classes', next: PeopleView) => void;
  /** Which class/teacher the lesson form is filling in. '' = the first one. */
  lessonFocus: Id;
  setLessonFocus: (next: Id) => void;
  section: SectionId;
  setSection: (next: SectionId) => void;
  scope: Scope;
  setScope: (next: Scope) => void;
  checkView: CheckView;
  setCheckView: (next: CheckView) => void;
  colored: boolean;
  setColored: (next: boolean) => void;
  poolSort: PoolSort;
  setPoolSort: (next: PoolSort) => void;
  /** Subject key the tray is narrowed to. '' = all of them. */
  poolFilter: string;
  setPoolFilter: (next: string) => void;
}

/** The lesson form's axis in a people tab. */
export function lessonModeOf(tab: 'teachers' | 'classes', people: ToolState['people']): LessonMode {
  if (people[tab] === 'all') return 'all';
  return tab === 'teachers' ? 'teacher' : 'class';
}

/**
 * A handful of `useState`s rather than one reducer: they are independent
 * positions, no transition ever changes two of them at once, and a reducer
 * would add a vocabulary of action names to describe a handful of assignments.
 */
export function useToolState(firstTab: Tab): ToolState {
  const [tab, setTab] = useState<Tab>(firstTab);
  const [view, setView] = useState<View>('teacher');
  const [people, setPeopleRaw] = useState<ToolState['people']>({
    teachers: 'list',
    classes: 'list',
  });
  const [lessonFocus, setLessonFocus] = useState<Id>('');
  const [section, setSection] = useState<SectionId>('school');
  const [scope, setScope] = useState<Scope>('teachers');
  const [colored, setColored] = useState(true);
  // 'problems' is where a reader arrives with a question, and it is also the
  // only part of the list that can be empty — an empty problems view is the
  // answer "there are none", which is worth landing on.
  const [checkView, setCheckView] = useState<CheckView>('problems');
  const [poolSort, setPoolSort] = useState<PoolSort>('row');
  const [poolFilter, setPoolFilter] = useState('');
  const setPeople = useCallback(
    (which: 'teachers' | 'classes', next: PeopleView) =>
      setPeopleRaw((was) => (was[which] === next ? was : { ...was, [which]: next })),
    [],
  );

  return {
    tab,
    setTab,
    view,
    setView,
    people,
    setPeople,
    lessonFocus,
    setLessonFocus,
    section,
    setSection,
    scope,
    setScope,
    checkView,
    setCheckView,
    colored,
    setColored,
    poolSort,
    setPoolSort,
    poolFilter,
    setPoolFilter,
  };
}
