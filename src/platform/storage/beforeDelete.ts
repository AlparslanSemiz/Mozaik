// What is left of an undo after a reload (TODO SD1).
//
// Since SD1 a deletion asks no question: it happens, and its notice offers
// "Geri al". That undo lives in the reducer's memory, so after a reload, or
// the exe's window closed and opened again, the state from before the
// deletion was nowhere: the session chain holds the state from the START of
// the session (`rotateBackups`), and the autosave had already written the
// state after it (the audit of 2026-11-16, measured: a class deleted, the page
// reloaded, the class gone from every key).
//
// So before every such deletion, and before "Her şeyi sil", "Programı boşalt",
// the sample school over a plan and "Dosyadan aç", the open plan is written to
// ONE slot (`BEFORE_DELETE_KEY`). The next start offers it once, with a button
// that puts it back as an ordinary step of the history. A relaid week
// ("Yeniden yap") is kept `quiet`: written, never offered.
//
// BOUNDED: one slot, a plan's size. When the storage is full, the plan itself
// comes first: a refused write drops the slot rather than keep a stale one
// (below), and a plan's own refused autosave drops it and tries again
// (`writePlanText`).

import { BEFORE_DELETE_KEY, readStoredPlan } from '../../pure/io';
import { safely } from '../../leaf/preference';
import type { Id, State } from '../../leaf/model';
import { frozenPlan } from './libraryStore';
import { writesClosed } from './otherWindow';

interface Slot {
  planId: Id;
  /** ISO time it was taken. */
  at: string;
  /** What happened next, in the words of that deletion's notice. */
  label: string;
  state: unknown;
  /** Offered at a start already: it is not offered again. */
  seen?: boolean;
  /** A fingerprint of the plan as first saved after the deletion (`noteAfter`). */
  after?: string;
}

/** FNV-1a over the plan's text: enough to tell "the same plan" apart. */
function fingerprint(state: State): string {
  const read = readStoredPlan(JSON.stringify(state));
  const text = JSON.stringify('state' in read ? read.state : state);
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return `${text.length}:${(h >>> 0).toString(36)}`;
}

/** The plan whose first save after a deletion is still to be noted. */
let waiting: Id | null = null;

/** Whether a plan holds anything a person would miss. */
export function holdsAnything(state: State): boolean {
  return (
    state.teachers.length + state.classes.length + state.lessons.length + state.rooms.length > 0
  );
}

/**
 * Keeps `state`, plan `planId` as it is now, before `label` happens to it.
 * Nothing for an empty plan, for a plan this copy could not read (its stand-in
 * is empty and its key is frozen), or once another window took over (VK1).
 * Returns whether it landed.
 */
export function keepBeforeDelete(planId: Id, state: State, label: string, quiet = false): boolean {
  if (writesClosed() || frozenPlan(planId) !== null || !holdsAnything(state)) return false;
  // `quiet`: kept, but not offered at the next start (the restore of an offer).
  const slot: Slot = {
    planId,
    at: new Date().toISOString(),
    label,
    state,
    ...(quiet ? { seen: true } : {}),
  };
  const landed =
    safely(() => {
      localStorage.setItem(BEFORE_DELETE_KEY, JSON.stringify(slot));
      return true;
    }) === true;
  // A refused write leaves the older slot in place, and offering THAT one as
  // "the last deletion" would put back the wrong state.
  if (!landed) safely(() => localStorage.removeItem(BEFORE_DELETE_KEY));
  waiting = landed && !quiet ? planId : null;
  return landed;
}

/**
 * The autosave's answer, after it saved plan `planId` as `state`: the first
 * save after a deletion is the state the deletion left, and the next start
 * offers the slot only while the plan is still that state. Otherwise "Geri
 * getir" would take back every later change with it (review, 2026-11-16).
 */
export function noteAfter(planId: Id, state: State): void {
  if (waiting !== planId) return;
  waiting = null;
  const slot = read();
  if (slot === null || slot.planId !== planId || slot.seen === true) return;
  safely(() =>
    localStorage.setItem(BEFORE_DELETE_KEY, JSON.stringify({ ...slot, after: fingerprint(state) })),
  );
}

export interface Offer {
  label: string;
  at: Date;
  state: State;
}

function read(): Slot | null {
  const text = safely(() => localStorage.getItem(BEFORE_DELETE_KEY)) ?? null;
  if (text === null) return null;
  try {
    const raw = JSON.parse(text) as Partial<Slot> | null;
    if (
      typeof raw !== 'object' ||
      raw === null ||
      typeof raw.planId !== 'string' ||
      typeof raw.label !== 'string' ||
      typeof raw.at !== 'string'
    ) {
      return null;
    }
    return raw as Slot;
  } catch {
    return null;
  }
}

/**
 * At startup: the slot, if it belongs to the plan that opened, was not offered
 * before, holds something other than what opened, and the plan has not
 * changed since the deletion left it (`noteAfter`). Offered once: it is
 * marked as seen here, whether or not it is offered (an undone deletion leaves
 * a slot equal to the plan). A slot of another plan waits for that plan.
 */
let asked: { planId: Id; offer: Offer | null } | null = null;

export function offerAtStart(planId: Id, present: State): Offer | null {
  // The same answer for the same start: StrictMode runs the reducer's
  // initialiser twice, and the second run would find the slot marked.
  if (asked !== null && asked.planId === planId) return asked.offer;
  const offer = firstOffer(planId, present);
  asked = { planId, offer };
  return offer;
}

function firstOffer(planId: Id, present: State): Offer | null {
  const slot = read();
  if (slot === null || slot.seen === true || slot.planId !== planId) return null;
  const parsed = readStoredPlan(JSON.stringify(slot.state));
  if (!writesClosed()) {
    safely(() => localStorage.setItem(BEFORE_DELETE_KEY, JSON.stringify({ ...slot, seen: true })));
  }
  if (!('state' in parsed) || !holdsAnything(parsed.state)) return null;
  if (JSON.stringify(parsed.state) === JSON.stringify(present)) return null;
  // Changed since the deletion: putting the slot back would undo that too.
  // It stays, quietly, as the session chain's backups do.
  if (slot.after !== undefined && slot.after !== fingerprint(present)) return null;
  const at = new Date(slot.at);
  return {
    label: slot.label,
    at: Number.isNaN(at.getTime()) ? new Date() : at,
    state: parsed.state,
  };
}
