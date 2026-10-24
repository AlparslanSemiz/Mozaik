/**
 * The one way into this folder from outside it: the world generator the tests
 * build their schools with (`makeWorld`, `WORLDS`) and the check that a laid
 * out week is legal (`illegalBlocks`). Tests and E2E only: the product never
 * imports it, `.dependency-cruiser.cjs` says so, and Vite drops it from
 * `dist/index.html`.
 */
export * from './worlds';
