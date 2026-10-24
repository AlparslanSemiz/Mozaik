/**
 * The one way into this folder from outside it: the exe bridge (`desktop.ts`).
 * It dresses the three Tauri commands up as a FileSystemDirectoryHandle so the
 * folder code runs unchanged in the exe, and carries the update commands
 * (ARCHITECTURE, "Exe bir adaptör takar").
 */
export * from './desktop';
