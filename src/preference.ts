// Machine preferences: one way to read, normalize, store and paint them.
//
// Fifteen settings live outside `State` because they belong to the computer
// and not to the timetable (theme.ts says why). Each one carried its own copy
// of the same moves, a key, a normalizer, a guarded read and a guarded write,
// and the copies did not agree on whether a value is normalized before it is
// stored or on what a passed boolean means. This is that shape written once,
// with its contract:
//
//   1. `apply` writes <html> first, in the same call, and only then storage.
//      A storage that is full, blocked or missing cannot stop the page from
//      carrying the preference, which is what lets main.tsx apply every
//      layout preference before the first paint.
//   2. NO record asks `fallback`, at read time. That is where a preference
//      that follows the machine asks the machine (motion, pitfall 58, and the
//      language), and it is asked on every read rather than once at import. A
//      record that exists, even "" or "0", goes to `normalize`: absent and
//      zero are different answers (pitfall 43).
//   3. `normalize` accepts what its caller holds, the string storage returns
//      and the typed value a control passes, and `write` runs it before
//      storing (pitfall 44).
//
// A leaf like storage.ts: it knows nothing about React or the timetable.

import { safely } from './storage';

export interface PreferenceSpec<T> {
  /** The localStorage key. Turkish on purpose: like `ders-programi`, it is user data. */
  key: string;
  /** Any stored string or passed value, made legal. */
  normalize: (raw: unknown) => T;
  /** What no record means. Asked on every read, so it may ask the machine. */
  fallback: () => T;
  /** How a legal value is stored. `String` when omitted. */
  encode?: (value: T) => string;
  /** Writes the value onto <html>, for a preference the layout reads. */
  paint?: (value: T, root: HTMLElement) => void;
}

export interface Preference<T> {
  readonly key: string;
  normalize: (raw: unknown) => T;
  read: () => T;
  /** Stores the value. Nothing on the page changes. */
  write: (value: T) => void;
  /** Paints the value onto <html>, then stores it. */
  apply: (value: T) => void;
}

export function preference<T>(spec: PreferenceSpec<T>): Preference<T> {
  const { key, normalize, fallback, paint } = spec;
  const encode = spec.encode ?? String;
  const store = (value: T) => {
    safely(() => localStorage.setItem(key, encode(value)));
  };
  return {
    key,
    normalize,
    read: () => {
      const raw = safely(() => localStorage.getItem(key));
      return raw === null ? fallback() : normalize(raw);
    },
    write: (value) => store(normalize(value)),
    apply: (value) => {
      const legal = normalize(value);
      paint?.(legal, document.documentElement);
      store(legal);
    },
  };
}
