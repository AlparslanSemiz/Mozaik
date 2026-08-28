/**
 * The whole tree, in one place: the providers and the app inside them.
 *
 * It exists because there are two callers and they must not disagree.
 * `main.tsx` mounts it for real, and `App.test.tsx` renders it in jsdom — and
 * a smoke test whose job is "does the app draw without throwing" has to draw
 * the app, not a stripped-down version of it that happens to avoid the
 * providers. When the dialogs moved out of `window.confirm` the eleven smoke
 * tests all threw "useDialogs bir DialogProvider içinde çağrılmalı", which is
 * exactly the kind of thing they exist to catch — and the fix is to make the
 * two callers share a definition rather than to teach the test a workaround.
 */
import App from './App';
import { DialogProvider } from './components/Dialogs';
import { LangProvider } from './components/T';
import { ToastProvider } from './components/Toasts';
import './lang/en';
import './lang/de';
import './lang/es';
import './lang/fr';

export default function Root() {
  // The language is OUTERMOST: every provider below it puts words on the
  // screen — a dialog's question, a toast's sentence — and none of them can be
  // translated by something that lives further in.
  return (
    <LangProvider>
      <DialogProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </DialogProvider>
    </LangProvider>
  );
}
