/**
 * The one way into this folder from outside it: the automatic run
 * (`solver.ts`). It asks every legality question of `blocker()` and owns only
 * the search: each lesson's ceiling, the coverage check, backtracking and the
 * repair phase (ARCHITECTURE, "Çözücü kısıt mantığını yeniden yazmaz").
 */
export * from './solver';
