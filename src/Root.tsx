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
import { ToastProvider } from './components/Toasts';

export default function Root() {
  return (
    <DialogProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </DialogProvider>
  );
}
