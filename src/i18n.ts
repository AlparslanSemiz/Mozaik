/**
 * Which language the interface speaks.
 *
 * A leaf module, like `keys.ts`, `palette.ts` and `subjects.ts`: it imports
 * nothing of ours, so anything at any level can ask it a question.
 *
 * ---------------------------------------------------------------- the keys
 *
 * THE KEY IS THE TURKISH SENTENCE. `t('Öğretmenler')`, not `t('setup.teachers')`.
 *
 * That is a deliberate choice and it follows from principle 4 as it now stands:
 * Turkish is the SOURCE language, not one translation among five. Three things
 * fall out of it, and all three matter more than the tidiness of a key tree:
 *
 *   - A missing translation falls back to the key, i.e. to correct Turkish.
 *     The failure mode of an unfinished dictionary is "this line is still in
 *     Turkish", not `setup.teachers.title` printed on my father's screen.
 *   - The JSX stays readable. Somebody reading `Teachers.tsx` sees the sentence
 *     that will be on the screen, which is how every one of these files was
 *     written and reviewed for two years.
 *   - Nobody has to invent six hundred names, and no name can drift away from
 *     the sentence it stands for.
 *
 * The cost is real and worth stating: editing the Turkish copy orphans its
 * translations. `i18n.test.ts` is what makes that visible — it fails when the
 * English dictionary holds a key nothing uses any more.
 *
 * -------------------------------------------------------------- the markup
 *
 * Half the sentences on screen have a `<b>` in them. Rather than splitting one
 * sentence into three keys (which makes it untranslatable — word order is
 * exactly what changes between languages), a dictionary value may use `**` for
 * emphasis and `{name}` for a value, and `<T>` in `components/T.tsx` renders it.
 * The syntax is ours, the parser is ten lines, and nothing is ever handed to
 * `dangerouslySetInnerHTML`.
 */

export type Dil = 'tr' | 'en';

/** Every language this build can actually speak, in menu order. */
export const DILLER: Dil[] = ['tr', 'en'];

/** What each one calls ITSELF — a language menu is read by somebody who does
 *  not yet speak the language the app is currently in. */
export const DIL_ADI: Record<Dil, string> = {
  tr: 'Türkçe',
  en: 'English',
};

/** Turkish on purpose: like `ders-programi`, this key is user data, not code. */
export const LANG_KEY = 'ders-programi-dil';

/**
 * The device's own answer, or Turkish.
 *
 * `navigator.language` is a BCP 47 tag ("tr-TR", "en-GB"), so only the primary
 * subtag is looked at. Anything this build cannot speak falls back — and the
 * fallback is Turkish rather than English while Turkish is the only complete
 * dictionary. When the other four arrive the fallback becomes English, which is
 * the decision recorded in TASKS; it is one line and it is not worth pretending
 * to have made it early.
 */
export function systemDil(): Dil {
  try {
    const tag = (navigator.language ?? '').toLowerCase().split('-')[0];
    return DILLER.find((d) => d === tag) ?? 'tr';
  } catch {
    return 'tr';
  }
}

/** Anything that is not a language this build speaks becomes the device's. */
export function normalizeDil(raw: unknown, system: Dil): Dil {
  return DILLER.find((d) => d === raw) ?? system;
}

export function readDil(): Dil {
  let stored: string | null = null;
  try {
    stored = localStorage.getItem(LANG_KEY);
  } catch {
    // localStorage can be unavailable; the device's own language still works
  }
  return normalizeDil(stored, systemDil());
}

export function applyDil(dil: Dil): void {
  // `lang` is not decoration: it is what a screen reader picks a voice from and
  // what the browser hyphenates by. It was hard-coded to "tr" in index.html.
  document.documentElement.setAttribute('lang', dil);
  try {
    localStorage.setItem(LANG_KEY, dil);
  } catch {
    // A language that cannot be remembered is still better than no language
  }
}

// ------------------------------------------------------------- dictionaries

export type Sozluk = Record<string, string>;

/**
 * Turkish has no dictionary and never will: its entries would all be
 * `'Öğretmenler': 'Öğretmenler'`, i.e. six hundred chances for a typo to
 * silently change the source language.
 */
const SOZLUKLER: Partial<Record<Dil, Sozluk>> = {};

export function registerSozluk(dil: Dil, sozluk: Sozluk): void {
  SOZLUKLER[dil] = sozluk;
}

export function sozlukOf(dil: Dil): Sozluk | undefined {
  return SOZLUKLER[dil];
}

/** Values for the `{name}` slots in a phrase. */
export type Vars = Record<string, string | number>;

/**
 * The translated phrase, with its slots filled.
 *
 * Interpolation happens AFTER the lookup and on the translated string, because
 * the slots move: "{n} teachers" and "{n} öğretmen" put the number in the same
 * place, but "in {room}" and "{room} dersliğinde" do not.
 *
 * An unknown slot is left ALONE rather than blanked. A visible `{room}` on
 * screen is a bug report; an empty gap is a sentence that reads fine and says
 * the wrong thing.
 */
export function translate(dil: Dil, key: string, vars?: Vars): string {
  const phrase = (dil === 'tr' ? undefined : SOZLUKLER[dil]?.[key]) ?? key;
  if (vars === undefined) return phrase;
  return phrase.replace(/\{(\w+)\}/g, (whole, name: string) =>
    name in vars ? String(vars[name]) : whole,
  );
}

/** Every `{slot}` a phrase uses — for the dictionary's own test. */
export function slotsOf(phrase: string): string[] {
  return [...phrase.matchAll(/\{(\w+)\}/g)].map((m) => m[1]!);
}
