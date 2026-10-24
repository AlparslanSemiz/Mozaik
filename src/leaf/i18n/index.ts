/**
 * The one way into this folder from outside it: the active language, the bare
 * `t()` and plural selection (`i18n.ts`). The four dictionaries register
 * themselves with it from `leaf/lang/`; importing this folder does not load
 * them.
 */
export * from './i18n';
