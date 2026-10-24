/**
 * The one way into this folder from outside it: the timetable variants a plan
 * holds (`programs.ts`). Which one is active, its placements and pins, adding,
 * renaming and removing one, and "Programı boşalt".
 *
 * Its own package and not part of `pure/program/` since 2026-10-24: the Program
 * screen's view (`programView.ts`) reads the constraint engine, and the engine
 * reads this file, so one package for both would be an import cycle.
 */
export * from './programs';
