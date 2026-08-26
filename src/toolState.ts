// WHERE YOU ARE in each tab — one object, owned by App.
//
// These six values used to live inside the six tab components, and switching
// tabs unmounted them: a glance at Kontrol lost the class view in Program, the
// teacher you were editing in Müsaitlik, and step 4 of Kurulum. That is exactly
// the trap that put `printExcluded` and the solver run in App (pitfall 18); the
// only reason it went unnoticed here is that losing a POSITION is quieter than
// losing a search.
//
// They have to be up here anyway now: the tool strip that shows them is drawn
// above `<main>`, above the component that used to own them.
//
// What is NOT here, and must not move here:
//   - Availability's `pending` paint set  — changes dozens of times per second
//     while the pointer is down.
//   - Program's `dragging` / `reason`     — the whole drag.ts performance
//     contract rests on those staying out of App's render.
// Both are transient gestures, not positions.

import { useState } from "react";
import type { Id } from "./types";

export type Tab =
  "setup" | "availability" | "program" | "check" | "print" | "settings";
/** Program: which axis the grid rows are. */
export type View = "teacher" | "class";
/** Müsaitlik: whose closed hours are being edited. */
export type Kind = "teacher" | "class" | "room";
/** Kurulum: which of the four lists. */
export type StepId = "rooms" | "teachers" | "classes" | "lessons";
/** Ayarlar: which section. */
export type SectionId = "school" | "rules" | "subjects" | "appearance" | "data";
/** Yazdır: which pages the preview builds. */
export type Scope = "classes" | "teachers" | "both";
/**
 * Kontrol: which half of the report is drawn. A full report is seven panels and
 * three of them exist only when something is wrong, so "show me just the
 * problems" and "show me just the loads" are two real questions.
 */
export type CheckView = "hepsi" | "sorunlar" | "kapasite";

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
  section: SectionId;
  setSection: (next: SectionId) => void;
  scope: Scope;
  setScope: (next: Scope) => void;
  colored: boolean;
  setColored: (next: boolean) => void;
  checkView: CheckView;
  setCheckView: (next: CheckView) => void;
}

/**
 * A handful of `useState`s rather than one reducer: they are independent
 * positions, no transition ever changes two of them at once, and a reducer
 * would add a vocabulary of action names to describe six assignments.
 */
export function useToolState(firstTab: Tab): ToolState {
  const [tab, setTab] = useState<Tab>(firstTab);
  const [view, setView] = useState<View>("teacher");
  const [kind, setKind] = useState<Kind>("teacher");
  const [chosen, setChosen] = useState<Id>("");
  const [step, setStep] = useState<StepId>("rooms");
  const [section, setSection] = useState<SectionId>("school");
  const [scope, setScope] = useState<Scope>("classes");
  const [colored, setColored] = useState(true);
  // 'hepsi' is the report as it has always been: nothing is hidden until asked.
  const [checkView, setCheckView] = useState<CheckView>("hepsi");

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
    section,
    setSection,
    scope,
    setScope,
    colored,
    setColored,
    checkView,
    setCheckView,
  };
}
