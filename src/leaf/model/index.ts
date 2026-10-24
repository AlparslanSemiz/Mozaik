/**
 * The one way into this folder from outside it: the data model and the small
 * vocabulary every layer shares. The types and `SCHEMA_VERSION` (`types.ts`),
 * the placement and closed-hour keys (`keys.ts`), how a lesson's week splits
 * into blocks (`blocks.ts`), what subject a thing belongs to (`subjects.ts`)
 * and the identity palette (`palette.ts`).
 */
export * from './types';
export * from './keys';
export * from './blocks';
export * from './subjects';
export * from './palette';
export * from './email';
