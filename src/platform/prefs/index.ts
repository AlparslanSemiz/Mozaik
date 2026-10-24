/**
 * The one way into this folder from outside it: the machine's preferences and
 * where each tab was left. Independent scalars, each in its own key, and every
 * key with its name in Ayarlar → Hakkında is in
 * `leaf/preference/preferenceKeys.ts`. Each is built on the factory in
 * `leaf/preference/preference.ts`, which holds the contract they share.
 * Deliberately NOT part of `State`: a preference is the machine's, not the
 * timetable's (ARCHITECTURE, "State'te ne durur").
 *
 * One file per preference since 2026-10-24 (they shared `theme.ts`): the
 * theme, the tray's drawer (`dock.ts`), the tool strip (`ribbon.ts`), the scale,
 * the two densities, the availability clock, motion and the first-run line;
 * print options, the Program's colour and the tabs' positions (`toolState.ts`).
 */
export * from './theme';
export * from './dock';
export * from './ribbon';
export * from './scale';
export * from './density';
export * from './availClock';
export * from './motion';
export * from './intro';
export * from './printOptions';
export * from './programColor';
export * from './toolState';
