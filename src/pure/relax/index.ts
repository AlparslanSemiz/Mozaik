/**
 * The one way into this folder from outside it: the suggestion search for a
 * week that cannot be built. Split by question since RF1 (TODO §8k): what a
 * search is asked and answers (`options.ts`), applying and checking a
 * suggestion (`verify.ts`), reading a found week back into changes
 * (`reading.ts`), the week as a SAT formula (`model.ts`), the search
 * (`search.ts`), its sentences, the questions to ask a teacher (`questions.ts`)
 * and the preview's difference (`diff.ts`). What this file opens is exactly
 * what `relax.ts` exported before the split. The SAT solver (`sat.ts`) and the
 * helpers the files share stay in.
 */

// The changes and the refusals are the plan's data too (State.answers, schema
// v15), so their types live in leaf/model; they are named here as before.
export type { Refusal, Relaxation } from '../../leaf/model';
export {
  FAMILY_ORDER,
  type RelaxFamily,
  type Suggestion,
  type RelaxOptions,
  type RelaxStage,
  type RelaxProgress,
  type RelaxResult,
  type Relaxer,
} from './options';
export { applyRelaxations, applySuggestion, verifySuggestion } from './verify';
export { sameChanges, outdone } from './reading';
export { createRelaxer, suggest } from './search';
export {
  suggestionParts,
  suggestionLines,
  suggestionSentence,
  refusalText,
  type SuggestionPart,
} from './sentences';
export {
  suggestionQuestions,
  answerParts,
  questionsText,
  suggestionUses,
  type RefusalChoice,
  type Question,
} from './questions';
export { suggestionDiff, type SuggestionDiff } from './diff';
