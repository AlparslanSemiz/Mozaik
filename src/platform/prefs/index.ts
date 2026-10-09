/**
 * The one way into this folder from outside it: the machine's preferences
 * (theme, print options, the Program's colour) and where each tab was left.
 * Every key these read and write lives in `leaf/preferenceKeys.ts`.
 */
export * from './theme';
export * from './printOptions';
export * from './programColor';
export * from './toolState';
