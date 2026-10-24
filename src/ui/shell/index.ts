/**
 * The one way into this folder from outside it: the tree `main.tsx` mounts
 * (`Root.tsx`, the provider stack around the shell). Everything else here is
 * the shell's own: the tabs, the top bar and the long-lived state (`App.tsx`),
 * the command palette (`Palette.tsx`) and its list (`Commands.tsx`), and the
 * keyboard shortcuts sheet (`ShortcutsHelp.tsx`).
 */
export { default as Root } from './Root';
