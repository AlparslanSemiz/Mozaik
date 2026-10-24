/**
 * The one way into this folder from outside it: why a timetable cannot be
 * built (the thing aSc does not do and that hurts most at the school), split by
 * question: the capacity ladder (`levels.ts`), naming a lesson (`naming.ts`),
 * why a lesson is stuck (`hole.ts`), capacity, the advisor, Kontrol's report
 * and the health line. PURE functions. What this file opens is exactly what
 * `feasibility.ts` exported before the split.
 */
export {
  capacityLevel,
  loadStatus,
  type Level,
  type LoadStatus,
  type ReportRow,
  type Unplaceable,
  type Capacity,
  type Report,
} from './levels';
export { lessonName, commonestBlock, type BlockSummary } from './naming';
export { holeReason } from './hole';
export { buildCapacity } from './capacity';
export { buildAdvice, type Advice } from './advice';
export { buildReport } from './report';
export { health, type Health } from './health';
