/**
 * Every question this program asks, in one place.
 *
 * Until now there were seventeen: twelve `window.confirm` and five
 * `window.alert`, scattered across nine files. They worked, and that is most
 * of why they lasted — but they are the operating system's dialogs, not this
 * program's. They arrive in the browser's own typeface, they cannot say which
 * button is the dangerous one, they cannot show the cascade summary as
 * anything but one run-on paragraph, and on `file://` Chromium prints "This
 * page says" above every one of them, which is a strange thing for a program
 * my father double-clicked to say about itself.
 *
 * The API is a promise, so the call sites read the way the old ones did:
 *
 *     if (!(await confirm({ ... }))) return;
 *
 * `danger` does two things and both are the accessibility contract rather than
 * decoration: the dialog becomes `role="alertdialog"`, and focus lands on the
 * SAFE button. An irreversible action should never be one Enter away from a
 * dialog that just appeared.
 */
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { AlertTriangle, Info, TriangleAlert } from 'lucide-react';
import { useT } from './T';

export interface ConfirmOptions {
  /** The heading: what is about to happen, in one line. */
  title: string;
  /** What it costs. This is where a cascade summary goes. */
  body?: ReactNode;
  /** The button that does the thing. Defaults to "Devam et". */
  confirmLabel?: string;
  cancelLabel?: string;
  /** Irreversible: alertdialog, red button, focus on the safe side. */
  danger?: boolean;
}

export interface AlertOptions {
  title: string;
  body?: ReactNode;
  /** A warning reads differently from a note, and both happen here. */
  tone?: 'info' | 'warn';
  closeLabel?: string;
}

export interface PromptOptions {
  title: string;
  body?: ReactNode;
  defaultValue?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  inputLabel: string;
}

type Pending =
  | { kind: 'confirm'; options: ConfirmOptions }
  | { kind: 'alert'; options: AlertOptions }
  | { kind: 'prompt'; options: PromptOptions };

interface Api {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  alert: (options: AlertOptions) => Promise<void>;
  prompt: (options: PromptOptions) => Promise<string | null>;
}

const DialogContext = createContext<Api | null>(null);

export function useDialogs(): Api {
  const api = useContext(DialogContext);
  if (api === null) throw new Error('useDialogs bir DialogProvider içinde çağrılmalı');
  return api;
}

export function DialogProvider({ children }: { children: ReactNode }) {
  const t = useT();
  const [pending, setPending] = useState<Pending | null>(null);
  const [promptValue, setPromptValue] = useState('');
  // The resolver of the question currently on screen. It is a ref and not
  // state because closing has to settle the promise exactly once, from an
  // event handler that must not wait for a render (pitfall 20's family: a
  // value read inside a callback that runs later is a value that may be gone).
  const settle = useRef<((answer: boolean | string | null) => void) | null>(null);

  const askBoolean = useCallback((next: Pending) => {
    return new Promise<boolean>((resolve) => {
      settle.current = (answer) => resolve(answer === true);
      setPending(next);
    });
  }, []);

  const api = useMemo<Api>(
    () => ({
      confirm: (options) => askBoolean({ kind: 'confirm', options }),
      alert: async (options) => {
        await askBoolean({ kind: 'alert', options });
      },
      prompt: (options) => {
        setPromptValue(options.defaultValue ?? '');
        return new Promise<string | null>((resolve) => {
          settle.current = (answer) => resolve(typeof answer === 'string' ? answer : null);
          setPending({ kind: 'prompt', options });
        });
      },
    }),
    [askBoolean],
  );

  /** One exit for every way out: the button, Escape, the backdrop. */
  function close(answer: boolean | string | null) {
    const resolve = settle.current;
    settle.current = null;
    setPending(null);
    resolve?.(answer);
  }

  const danger = pending?.kind === 'confirm' && pending.options.danger === true;
  const warn = pending?.kind === 'alert' && pending.options.tone === 'warn';

  return (
    <DialogContext.Provider value={api}>
      {children}

      <Dialog.Root
        open={pending !== null}
        onOpenChange={(open) => {
          // Escape and the backdrop both mean "no". For an alert there is only
          // one answer, so it does not matter which.
          if (!open) close(pending?.kind === 'prompt' ? null : false);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="dlg-overlay" />
          <Dialog.Content
            className={`dlg${danger ? ' danger' : ''}`}
            role={danger ? 'alertdialog' : 'dialog'}
            aria-describedby={pending?.options.body === undefined ? undefined : 'dlg-body'}
          >
            {pending !== null && (
              <>
                <div className="dlg-head">
                  <span className={`dlg-icon${danger ? ' bad' : warn ? ' warn' : ''}`} aria-hidden="true">
                    {danger ? (
                      <TriangleAlert size={20} strokeWidth={2.2} />
                    ) : warn ? (
                      <AlertTriangle size={20} strokeWidth={2.2} />
                    ) : (
                      <Info size={20} strokeWidth={2.2} />
                    )}
                  </span>
                  <Dialog.Title className="dlg-title">{pending.options.title}</Dialog.Title>
                </div>

                {pending.options.body !== undefined && (
                  <Dialog.Description asChild>
                    <div className="dlg-body" id="dlg-body">
                      {pending.options.body}
                    </div>
                  </Dialog.Description>
                )}

                {pending.kind === 'prompt' && (
                  <input
                    className="dlg-input"
                    autoFocus
                    aria-label={pending.options.inputLabel}
                    value={promptValue}
                    onChange={(event) => setPromptValue(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && promptValue.trim() !== '') {
                        event.preventDefault();
                        close(promptValue);
                      }
                    }}
                  />
                )}

                <div className="dlg-actions">
                  {pending.kind === 'confirm' ? (
                    <>
                      {/* The safe button comes FIRST in the DOM so it is what
                          focus finds, and Radix focuses the first tabbable
                          child. Visually it stays on the left, where a
                          secondary action belongs. */}
                      <button className="btn" onClick={() => close(false)}>
                        {pending.options.cancelLabel ?? t('Vazgeç')}
                      </button>
                      <button
                        className={`btn ${danger ? 'danger-solid' : 'primary'}`}
                        onClick={() => close(true)}
                      >
                        {pending.options.confirmLabel ?? 'Devam et'}
                      </button>
                    </>
                  ) : pending.kind === 'prompt' ? (
                    <>
                      <button className="btn" onClick={() => close(null)}>
                        {pending.options.cancelLabel ?? t('Vazgeç')}
                      </button>
                      <button
                        className="btn primary"
                        disabled={promptValue.trim() === ''}
                        onClick={() => close(promptValue)}
                      >
                        {pending.options.confirmLabel ?? t('Kaydet')}
                      </button>
                    </>
                  ) : (
                    <button className="btn primary" onClick={() => close(true)}>
                      {pending.options.closeLabel ?? 'Tamam'}
                    </button>
                  )}
                </div>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </DialogContext.Provider>
  );
}
