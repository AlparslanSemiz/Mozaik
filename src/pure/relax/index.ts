/**
 * The one way into this folder from outside it: the suggestion search for a
 * week that cannot be built (`relax.ts`: which teacher hour, limit, pairing,
 * block shape or weekly hours would let it be built, checked against
 * `blocker()`, and the sentences that say so). The SAT solver it encodes the
 * week into (`sat.ts`) has no caller outside this folder, so the index does
 * not open it.
 */
export * from './relax';
