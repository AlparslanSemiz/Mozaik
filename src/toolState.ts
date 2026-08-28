// WHERE YOU ARE in each tab — one object, owned by App.
//
// These values used to live inside the tab components, and switching tabs
// unmounted them: a glance at Kontrol lost the class view in Program, the
// teacher you were editing in Müsaitlik, and which list of Kurulum you were
// filling in. That is exactly
// the trap that put `printExcluded` and the solver run in App (pitfall 18); the
// only reason it went unnoticed here is that losing a POSITION is quieter than
// losing a search.
//
// They have to be up here anyway now: the tool strip that shows them is drawn
// above `<main>`, above the component that used to own them.
//
// What is NOT here, and must not move here:
// Dersler's `lessonMode` / `lessonFocus` belong here for the same reason and
// go NO FURTHER: they are a position inside a session, not a preference. "Which
// class am I entering lessons for" is not something a backup should carry to
// another machine, and it is not worth a schema version.
//
//   - Availability's `pending` paint set  — changes dozens of times per second
//     while the pointer is down.
//   - Program's `dragging` / `reason`     — the whole drag.ts performance
//     contract rests on those staying out of App's render.
// Both are transient gestures, not positions.

import { useState } from "react";
import type { Id } from "./types";

export type Tab =
  | "setup"
  | "availability"
  | "lessons"
  | "program"
  | "check"
  | "print"
  | "settings";
/** Program: which axis the grid rows are. */
export type View = "teacher" | "class";
/** Müsaitlik: whose closed hours are being edited. */
export type Kind = "teacher" | "class" | "room";
/**
 * Okul: which of the four lists. Lessons left for a tab of their own.
 *
 * The order is the dependency chain, not a wizard: a class points at a room,
 * and a teacher picks a subject off the list, so both of those have to exist
 * before the list that names them.
 */
export type StepId = "rooms" | "subjects" | "teachers" | "classes";
/**
 * Dersler: which way round the entry runs.
 *
 * "artık sınıftan mı eklemek istiyorsun? öğretmenden mi eklemek istiyorsun
 * genel bakmak mı istiyorsun". A lesson is the one row in this program that
 * belongs to two other lists, so there are two honest ways to walk it and one
 * way to read all of it.
 */
export type LessonMode = "class" | "teacher" | "all";
/** Ayarlar: which section. */
export type SectionId =
  | "school"
  | "rules"
  | "appearance"
  | "plans"
  | "about";
/** Yazdır: which pages the preview builds. */
export type Scope = "classes" | "teachers" | "both";
export interface ToolState {
  tab: Tab;
  setTab: (next: Tab) => void;
  view: View;
  setView: (next: View) => void;
  kind: Kind;
  setKind: (next: Kind) => void;
  /** Which teacher/class/room is open in Müsaitlik. '' = the first one. */
  chosen: Id;
  setChosen: (next: Id) => void;
  step: StepId;
  setStep: (next: StepId) => void;
  lessonMode: LessonMode;
  setLessonMode: (next: LessonMode) => void;
  /** Which class/teacher the lesson form is filling in. '' = the first one. */
  lessonFocus: Id;
  setLessonFocus: (next: Id) => void;
  section: SectionId;
  setSection: (next: SectionId) => void;
  scope: Scope;
  setScope: (next: Scope) => void;
  colored: boolean;
  setColored: (next: boolean) => void;
}

/**
 * A handful of `useState`s rather than one reducer: they are independent
 * positions, no transition ever changes two of them at once, and a reducer
 * would add a vocabulary of action names to describe a handful of assignments.
 */
export function useToolState(firstTab: Tab): ToolState {
  const [tab, setTab] = useState<Tab>(firstTab);
  const [view, setView] = useState<View>("teacher");
  const [kind, setKind] = useState<Kind>("teacher");
  const [chosen, setChosen] = useState<Id>("");
  const [step, setStep] = useState<StepId>("rooms");
  // 'class' and not 'all': the reader asked for this tab because entering a
  // single class's lessons was the slow part, and the general list is the one
  // of the three that was already there.
  const [lessonMode, setLessonMode] = useState<LessonMode>("class");
  const [lessonFocus, setLessonFocus] = useState<Id>("");
  const [section, setSection] = useState<SectionId>("school");
  const [scope, setScope] = useState<Scope>("classes");
  const [colored, setColored] = useState(true);
  // 'hepsi' is the report as it has always been: nothing is hidden until asked.

  return {
    tab,
    setTab,
    view,
    setView,
    kind,
    setKind,
    chosen,
    setChosen,
    step,
    setStep,
    lessonMode,
    setLessonMode,
    lessonFocus,
    setLessonFocus,
    section,
    setSection,
    scope,
    setScope,
    colored,
    setColored,
  };
}
