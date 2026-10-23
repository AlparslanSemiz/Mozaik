/**
 * The one way into this folder from outside it: the Program and Kontrol
 * screens, the entity sheet both of them open (and the list screens too), and
 * the step icons every tab draws.
 *
 * The grid, the tray and the suggestions panel are not here: only `Program`
 * draws them.
 */
export { default as Program } from './Program';
export { default as Check } from './Check';
export { InspectorProvider, useInspect } from './Inspector';
export { KIND_ICON, STEPS, classIcon, lessonIcon, teacherIcon } from './steps';
