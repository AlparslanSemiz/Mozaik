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
 *
 * Three rules added on 2026-11-15 (keyboard and reading review):
 * - The clock stops while the pointer is over a notice or the focus is in
 *   one. A notice that vanished under the finger at 8.5 s was the finding.
 * - Only the NEWEST notice keeps its "Geri al". An older one's button named a
 *   state the next deletion had already moved past, so it did nothing and the
 *   notice closed as if it had worked. Should the newest one fail all the
 *   same (another edit in between), a line says so and points at Ctrl+Z.
 * - A screen reader hears how to undo without reaching the button: the text
 *   carries a hidden "Geri almak için Ctrl+Z." The button sits at the end of
 *   the page, after every row of every list.
 */
import {
  createContext,
  type FocusEvent,
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

/** A button on a notice: its label and what it does. `run` answers `false`
    when it could not do it (an undo whose step is no longer on top). */
export interface ToastAction {
  label: string;
  run: () => boolean | void;
}

interface Toast {
  id: number;
  text: string;
  tone: ToastTone;
  action?: ToastAction;
}

type Notify = (text: string, tone?: ToastTone, action?: ToastAction) => void;

const ToastContext = createContext<Notify | null>(null);
const AnnounceContext = createContext<(text: string) => void>(() => undefined);

export function useToast(): Notify {
  const notify = useContext(ToastContext);
  if (notify === null) throw new Error('useToast bir ToastProvider içinde çağrılmalı');
  return notify;
}

/** Says a sentence to a screen reader only: nothing is drawn (Ctrl+Z's "Geri alındı"). */
export function useAnnounce(): (text: string) => void {
  return useContext(AnnounceContext);
}

/** Long enough to read a sentence twice; the reader has trouble seeing. */
const LIFETIME = 6000;
/** A notice with a button stays longer: reading it AND reaching for it (SD1). */
export const ACTION_LIFETIME = 10000;
/** After a pause, at least this long, so a notice does not vanish as the pointer leaves it. */
const AFTER_PAUSE = 2000;

interface Clock {
  /** Running: the timer and when it fires. Paused: neither, only what is left. */
  timer: number | undefined;
  due: number;
  left: number;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const t = useT();
  const [items, setItems] = useState<Toast[]>([]);
  const next = useRef(1);
  const clocks = useRef(new Map<number, Clock>());
  const region = useRef<HTMLDivElement>(null);
  const hovered = useRef(false);
  const paused = useRef(false);

  const drop = useCallback((id: number) => {
    const clock = clocks.current.get(id);
    if (clock?.timer !== undefined) window.clearTimeout(clock.timer);
    clocks.current.delete(id);
    setItems((list) => list.filter((t) => t.id !== id));
  }, []);

  const run = useCallback(
    (id: number, clock: Clock, ms: number) => {
      clock.due = Date.now() + ms;
      clock.left = ms;
      clock.timer = window.setTimeout(() => drop(id), ms);
    },
    [drop],
  );

  /** Stops every clock while the reader is on a notice, starts them again after. */
  const settle = useCallback(() => {
    const focused = region.current?.contains(document.activeElement) ?? false;
    const now = hovered.current || focused;
    if (now === paused.current) return;
    paused.current = now;
    for (const [id, clock] of clocks.current) {
      if (now) {
        if (clock.timer !== undefined) window.clearTimeout(clock.timer);
        clock.timer = undefined;
        clock.left = Math.max(0, clock.due - Date.now());
      } else {
        run(id, clock, Math.max(clock.left, AFTER_PAUSE));
      }
    }
  }, [run]);

  const notify = useCallback<Notify>(
    (text, tone = 'ok', action) => {
      const id = next.current++;
      setItems((list) => [
        // Only the newest notice keeps its button (see the top of the file).
        ...(action === undefined ? list : list.map(({ action: _older, ...item }) => item)),
        action === undefined ? { id, text, tone } : { id, text, tone, action },
      ]);
      const ms = action === undefined ? LIFETIME : ACTION_LIFETIME;
      const clock: Clock = { timer: undefined, due: Date.now() + ms, left: ms };
      clocks.current.set(id, clock);
      if (!paused.current) run(id, clock, ms);
    },
    [run],
  );

  // A notice that closes under the pointer or with the focus in it leaves no
  // event behind (nothing fires pointerleave or blur for a removed node), so
  // the pause is looked at again whenever the list changes.
  // A removed notice that was under the pointer fires no pointerleave either,
  // so whether the pointer is still over one is asked of the page itself.
  useEffect(() => {
    hovered.current = items.length > 0 && (region.current?.matches(':hover') ?? false);
    settle();
  }, [items, settle]);

  // Every pending timer dies with the provider: a setTimeout that fires into
  // an unmounted tree is a React warning and, worse, a leak that survives a
  // plan switch.
  useEffect(() => {
    const pending = clocks.current;
    return () => {
      for (const clock of pending.values()) window.clearTimeout(clock.timer);
      pending.clear();
    };
  }, []);

  // The hidden line. Saying the same sentence twice must be heard twice, so
  // every other one carries a trailing no-break space.
  const [said, setSaid] = useState('');
  const announce = useCallback((text: string) => {
    setSaid((before) => (before === text ? `${text}\u00a0` : text));
  }, []);

  const value = useMemo(() => notify, [notify]);

  const pointerIn = () => {
    hovered.current = true;
    settle();
  };
  const pointerOut = () => {
    hovered.current = false;
    settle();
  };
  // Where the keyboard was before it came to a notice: "Geri al" takes its
  // own notice away, and the focus goes back there instead of to <body>.
  const cameFrom = useRef<HTMLElement | null>(null);
  const focused = (e: FocusEvent<HTMLDivElement>) => {
    const from = e.relatedTarget;
    if (from instanceof HTMLElement && region.current?.contains(from) !== true) {
      cameFrom.current = from;
    }
    settle();
  };
  // Focus moving between two buttons of the same notice is not a resume:
  // React's blur fires first, and the focus is not inside yet.
  const blurred = (e: FocusEvent<HTMLDivElement>) => {
    if (region.current?.contains(e.relatedTarget) === true) return;
    window.setTimeout(settle, 0);
  };

  return (
    <ToastContext.Provider value={value}>
      <AnnounceContext.Provider value={announce}>
        {children}
        {/* polite, not assertive: none of these interrupt anything. */}
        <div
          className="toasts"
          role="status"
          aria-live="polite"
          ref={region}
          onFocus={focused}
          onBlur={blurred}
        >
          {items.map((toast) => (
            <div
              key={toast.id}
              className={`toast ${toast.tone}`}
              onPointerEnter={pointerIn}
              onPointerLeave={pointerOut}
            >
              <span className="toast-icon" aria-hidden="true">
                {toast.tone === 'ok' ? (
                  <Check size={16} strokeWidth={2.6} />
                ) : toast.tone === 'warn' ? (
                  <CircleAlert size={16} strokeWidth={2.4} />
                ) : (
                  <Info size={16} strokeWidth={2.4} />
                )}
              </span>
              <span className="toast-text">
                {toast.text}
                {toast.action !== undefined && (
                  <span className="sr-only"> {t('Geri almak için Ctrl+Z.')}</span>
                )}
              </span>
              {toast.action !== undefined && (
                <button
                  className="btn toast-action"
                  onClick={() => {
                    const done = toast.action?.run();
                    drop(toast.id);
                    if (cameFrom.current?.isConnected === true) cameFrom.current.focus();
                    if (done === false) {
                      notify(
                        t('Arada başka bir değişiklik oldu. Ctrl+Z ile adım adım geri alın.'),
                        'warn',
                      );
                    }
                  }}
                >
                  {toast.action.label}
                </button>
              )}
              <button
                className="toast-close"
                aria-label={t('Kapat')}
                onClick={() => drop(toast.id)}
              >
                <X size={14} strokeWidth={2.4} />
              </button>
            </div>
          ))}
        </div>
        <div className="sr-only" role="status" aria-live="polite">
          {said}
        </div>
      </AnnounceContext.Provider>
    </ToastContext.Provider>
  );
}
