/**
 * The one way into this folder from outside it: where a plan is kept. The
 * autosaving store and the plan library as React drives them, the files that
 * go to disk (a backup, the bundle, the chosen folder), and the "Veriler
 * nerede" report.
 *
 * What stays inside: the raw localStorage side (`libraryStore.ts`), the guard
 * that closes this window's writes when another window writes (`otherWindow.ts`)
 * and the plan operations `useStore` hands out (`usePlans.ts`). Nothing outside
 * this folder writes a plan text or watches another window.
 */
export { isTextInput, useStore, type SaveTrouble } from './useStore';
export { listBackups, loadPlan, storageWorks, unreadablePlan } from './planStore';
export { downloadBackup, downloadBundle } from './download';
export { KEEP_DAILY, MAIN_NAME } from './folder';
export { useFolder, type FolderRun } from './useFolder';
export { routeName, storageAddress, storageKind, storageReport } from './storageReport';
