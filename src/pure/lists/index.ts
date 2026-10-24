/**
 * The one way into this folder from outside it: what the four list screens
 * search, filter and sort by (Dersler, and Okul's teachers, classes and rooms),
 * and the load-status chip three of them share with Kontrol's arithmetic. These
 * stood inside each screen's `useMemo` until 2026-10-24; the screens still
 * decide when they are rebuilt.
 */
export { lessonListConfig } from './lessonList';
export { teacherListConfig } from './teacherList';
export { classListConfig } from './classList';
export { roomListConfig } from './roomList';
export { loadStatusFacet } from './loadStatusFacet';
