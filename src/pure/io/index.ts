/**
 * The one way into this folder from outside it: everything that turns a plan
 * into text and back. The saved file's reader and every migration
 * (`parseState`), the plan library's model and its file names (`library`), the
 * envelope that carries every plan in one file (`bundle`), the rows pasted from
 * Excel (`import`) and the sample school (`sample`).
 *
 * None of the five touches storage: they take and hand back raw strings, and
 * the storage side is `platform/storage` (ARCHITECTURE, "Import döngüleri nasıl
 * önleniyor").
 */
export * from './parseState';
export * from './library';
export * from './bundle';
export * from './import';
export * from './sample';
