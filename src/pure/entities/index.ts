/**
 * The one way into this folder from outside it: everything that changes the
 * school's data (`entities.ts`: adding, updating and deleting rooms, teachers,
 * classes, lessons and subjects, the settings and `remapDays`, the answers to
 * a suggestion) and the bell (`bell.ts`: lesson times and the hour groups of a
 * day).
 */
export * from './entities';
export * from './bell';
