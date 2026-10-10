/**
 * The one way into this folder from outside it: the timetable's variants
 * (`programs.ts`: which week is active, its placements and pins) and the
 * Program screen's temporary mask (`programMask.ts`: rows and days set aside,
 * and what the solver leaves out because of them).
 */
export * from './programs';
export * from './programMask';
