/**
 * The one way into this folder from outside it.
 *
 * The four sentence dictionaries export nothing: importing one registers it
 * with `registerSozluk`, so they are pulled in here for that side effect. In
 * the BUILT file each one is a `registerPaket` call instead, written by the
 * build's `sozlukPaketi` plugin (scripts/sozluk-paket.mjs). The
 * shorts are a table and are handed on as one.
 */
import './en';
import './de';
import './es';
import './fr';

export { KISALTMALAR } from './kisaltmalar';
export * from './names';
