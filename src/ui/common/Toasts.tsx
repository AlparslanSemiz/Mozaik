/**
 * A short line that says something HAPPENED.
 *
 * The program has always been good at saying no (`blocker()` returns a
 * sentence naming the day, the hour and the class) and silent about saying
 * yes: a backup downloaded, twelve teachers pasted in, a plan created — all of
 * them left no mark at all, so the only way to know a click had worked was to
 * go and look.
 *
 * Deliberately NOT a Radix Toast. That package is 19.6 KB and what it buys is
 * swipe-to-dismiss, a focus hotkey and the machinery for toasts that carry
 * actions. So: an `aria-live` region, a list, and CSS.
 *
 * ONE kind of action, since 2026-11-15 (TODO SD1): a deletion that Ctrl+Z
 * can reverse no longer asks first; it happens, and its notice carries a
 * "Geri al" button. The button undoes only the exact state it names
 * (`undo-if` in pure/undo/undo.ts), so after any other edit it does nothing
 * rather than reverse the wrong change.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { Check, CircleAlert, Info, X } from 'lucide-react';
import { useT } from './T';

export type ToastTone = 'ok' | 'info' | 'warn';

/** A button on a notice: its label and what it does. */
export interface ToastAction {
  label: string;
  run: () => void;
}

interface Toast {
  id: number;
  text: string;
  tone: ToastTone;
  action?: ToastAction;
}

type Notify = (text: string, tone?: ToastTone, action?: ToastAction) => void;

const ToastContext = createContext<Notify | null>(null);

export function useToast(): Notify {
  const notify = useContext(ToastContext);
  if (notify === null) throw new Error('useToast bir ToastProvider içinde çağrılmalı');
  return notify;
}

/** Long enough to read a sentence twice; the reader has trouble seeing. */
const LIFETIME = 6000;
/** A notice with a button stays longer: reading it AND reaching for it (SD1). */
const ACTION_LIFETIME = 8000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const t = useT();
  const [items, setItems] = useState<Toast[]>([]);
  const next = useRef(1);
  const timers = useRef(new Map<number, number>());

  const drop = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer !== undefined) {
      window.clearTimeout(timer);
      timers.current.delete(id);
    }
    setItems((list) => list.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback<Notify>(
    (text, tone = 'ok', action) => {
      const id = next.current++;
      setItems((list) => [
        ...list,
        action === undefined ? { id, text, tone } : { id, text, tone, action },
      ]);
      timers.current.set(
        id,
        window.setTimeout(() => drop(id), action === undefined ? LIFETIME : ACTION_LIFETIME),
      );
    },
    [drop],
  );

  // Every pending timer dies with the provider: a setTimeout that fires into
  // an unmounted tree is a React warning and, worse, a leak that survives a
  // plan switch.
  useEffect(() => {
    const pending = timers.current;
    return () => {
      for (const timer of pending.values()) window.clearTimeout(timer);
      pending.clear();
    };
  }, []);

  const value = useMemo(() => notify, [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* polite, not assertive: none of these interrupt anything. */}
      <div className="toasts" role="status" aria-live="polite">
        {items.map((toast) => (
          <div key={toast.id} className={`toast ${toast.tone}`}>
            <span className="toast-icon" aria-hidden="true">
              {toast.tone === 'ok' ? (
                <Check size={16} strokeWidth={2.6} />
              ) : toast.tone === 'warn' ? (
                <CircleAlert size={16} strokeWidth={2.4} />
              ) : (
                <Info size={16} strokeWidth={2.4} />
              )}
            </span>
            <span className="toast-text">{toast.text}</span>
            {toast.action !== undefined && (
              <button
                className="btn toast-action"
                onClick={() => {
                  toast.action?.run();
                  drop(toast.id);
                }}
              >
                {toast.action.label}
              </button>
            )}
            <button className="toast-close" aria-label={t('Kapat')} onClick={() => drop(toast.id)}>
              <X size={14} strokeWidth={2.4} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
