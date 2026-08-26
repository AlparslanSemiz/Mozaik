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
 * ACTIONS. These carry none: an undo button here would have to reach into the
 * undo stack, and the stack has moved on the moment anything else is edited —
 * a "Geri al" that quietly reverses the wrong change is worse than no button.
 * So: an `aria-live` region, a list, and CSS.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Check, CircleAlert, Info, X } from 'lucide-react';

export type ToastTone = 'ok' | 'info' | 'warn';

interface Toast {
  id: number;
  text: string;
  tone: ToastTone;
}

type Notify = (text: string, tone?: ToastTone) => void;

const ToastContext = createContext<Notify | null>(null);

export function useToast(): Notify {
  const notify = useContext(ToastContext);
  if (notify === null) throw new Error('useToast bir ToastProvider içinde çağrılmalı');
  return notify;
}

/** Long enough to read a sentence twice; the reader has trouble seeing. */
const LIFETIME = 6000;

export function ToastProvider({ children }: { children: ReactNode }) {
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
    (text, tone = 'ok') => {
      const id = next.current++;
      setItems((list) => [...list, { id, text, tone }]);
      timers.current.set(id, window.setTimeout(() => drop(id), LIFETIME));
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
        {items.map((t) => (
          <div key={t.id} className={`toast ${t.tone}`}>
            <span className="toast-icon" aria-hidden="true">
              {t.tone === 'ok' ? (
                <Check size={16} strokeWidth={2.6} />
              ) : t.tone === 'warn' ? (
                <CircleAlert size={16} strokeWidth={2.4} />
              ) : (
                <Info size={16} strokeWidth={2.4} />
              )}
            </span>
            <span className="toast-text">{t.text}</span>
            <button
              className="toast-close"
              aria-label="Kapat"
              onClick={() => drop(t.id)}
            >
              <X size={14} strokeWidth={2.4} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
