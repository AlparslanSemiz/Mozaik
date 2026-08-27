/**
 * The language, and the two ways a phrase reaches the screen.
 *
 *   useT()   gives `t(key, vars?)` for anywhere a plain STRING is needed —
 *            an aria-label, a title, a toast, a dialog's question.
 *   <T>      renders a phrase that has emphasis in it, without splitting the
 *            sentence into pieces that cannot be translated.
 *
 * Why `<T>` exists at all: word order is exactly what changes between
 * languages, so "the reader edits" + <b>this list</b> + "themselves" as three
 * keys is three fragments no translator can reassemble. One key with `**` in it
 * stays one sentence.
 *
 * The provider is in `Root.tsx` with the others, so `main.tsx` and
 * `App.test.tsx` draw the same tree.
 */
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { applyDil, readDil, translate } from '../i18n';
import type { Dil, Vars } from '../i18n';

interface LangBox {
  dil: Dil;
  setDil: (next: Dil) => void;
  t: (key: string, vars?: Vars) => string;
}

// The default is not a fallback anybody should reach — every tree that draws
// this app is wrapped by the provider in Root.tsx. It exists so a component
// rendered on its own in a unit test does not have to know about languages.
const Ctx = createContext<LangBox>({
  dil: 'tr',
  setDil: () => undefined,
  t: (key, vars) => translate('tr', key, vars),
});

export function LangProvider({ children }: { children: ReactNode }) {
  // Read ONCE, at mount, exactly like the theme: the value is applied to
  // <html> before the first paint by main.tsx, and reading it again here would
  // invite the two to disagree.
  const [dil, setState] = useState<Dil>(() => readDil());

  const setDil = useCallback((next: Dil) => {
    applyDil(next);
    setState(next);
  }, []);

  const box = useMemo<LangBox>(
    () => ({ dil, setDil, t: (key, vars) => translate(dil, key, vars) }),
    [dil, setDil],
  );

  return <Ctx.Provider value={box}>{children}</Ctx.Provider>;
}

export function useLang(): LangBox {
  return useContext(Ctx);
}

/** Just the translator, which is what almost every caller wants. */
export function useT(): (key: string, vars?: Vars) => string {
  return useContext(Ctx).t;
}

/**
 * A phrase with emphasis. `**like this**` becomes `<b>`.
 *
 * Split on the marker and take every odd piece: with `**` as the separator the
 * pieces alternate plain, bold, plain, and an unmatched marker therefore just
 * leaves its text plain rather than swallowing the rest of the sentence.
 */
export function T({ k, vars }: { k: string; vars?: Vars }) {
  const t = useT();
  const parts = t(k, vars).split('**');
  return (
    <>
      {parts.map((piece, i) =>
        i % 2 === 1 ? <b key={i}>{piece}</b> : <span key={i}>{piece}</span>,
      )}
    </>
  );
}
