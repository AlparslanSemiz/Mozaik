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
 * translations. `i18n.test.ts` is what makes that visible — it fails when a
 * dictionary holds a key nothing uses any more.
 *
 * -------------------------------------------------------------- the markup
 *
 * Half the sentences on screen have a `<b>` in them. Rather than splitting one
 * sentence into three keys (which makes it untranslatable — word order is
 * exactly what changes between languages), a dictionary value may use `**` for
 * emphasis and `{name}` for a value, and `<T>` in `components/T.tsx` renders it.
 * The syntax is ours, the parser is ten lines, and nothing is ever handed to
 * `dangerouslySetInnerHTML`.
 *
 * ------------------------------------------------------------- the plurals
 *
 * Turkish takes no plural after a number — "4 sınıf", "1 sınıf" — which is why
 * `entities.ts` got away with `${n} ${word}` for two years. The other four do
 * take one, so a dictionary VALUE (never a key: keys are Turkish) may write
 * `{n:class|classes}`: the same slot, with the two forms after a colon.
 *
 * Which form is picked is `Intl.PluralRules(dil).select(n) === 'one'`, not
 * `n === 1`, and the difference is real: French puts 0 in the "one" category
 * ("0 livre") and Spanish does not ("0 libros"). The rule ships with the
 * browser, so it costs zero bytes and needs no network (principle 3).
 *
 * Two forms rather than CLDR's full set on purpose: every one of these five
 * languages distinguishes exactly "one" from "everything else" over the range
 * of integers this program can produce (hours, lessons, rooms, pages). The
 * category is asked for properly; only the alternatives are two.
 */

export type Dil = 'tr' | 'en' | 'de' | 'es' | 'fr';

/** Every language this build can actually speak, in menu order. */
export const DILLER: Dil[] = ['tr', 'en', 'de', 'es', 'fr'];

/** What each one calls ITSELF — a language menu is read by somebody who does
 *  not yet speak the language the app is currently in. */
export const DIL_ADI: Record<Dil, string> = {
  tr: 'Türkçe',
  en: 'English',
  de: 'Deutsch',
  es: 'Español',
  fr: 'Français',
};

/** Turkish on purpose: like `ders-programi`, this key is user data, not code. */
export const LANG_KEY = 'ders-programi-dil';

/**
 * The device's own answer, or English.
 *
 * `navigator.language` is a BCP 47 tag ("tr-TR", "en-GB"), so only the primary
 * subtag is looked at. Anything this build cannot speak falls back to ENGLISH:
 * for one round the fallback was Turkish, because Turkish was the only complete
 * dictionary and a Greek reader was better served by a language than by a half
 * of one. All five are complete now, so the fallback is the one the most
 * readers have a second chance with.
 */
export function systemDil(): Dil {
  try {
    const tag = (navigator.language ?? '').toLowerCase().split('-')[0];
    return DILLER.find((d) => d === tag) ?? 'en';
  } catch {
    return 'en';
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
  // The pure modules read the language from HERE and nowhere else, so setting
  // it is part of applying it. Doing this anywhere else would let the two
  // disagree for one render — see the note on `t()` below.
  setAktifDil(dil);
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

// ------------------------------------------------------------ the language
//
// `constraints.ts` writes "MÇ Salı 3 saatinde müsait değil", `entities.ts`
// writes what a deletion costs, `feasibility.ts` writes the Kontrol report.
// None of them can call `useT()`: they are pure functions that know nothing
// about React, and threading a `t` parameter through them would put a second
// number-shaped argument next to `day` and `hour` (pitfall 76) and rewrite
// every one of their unit tests for no reader-visible gain.
//
// So the language lives here, next to the dictionaries that were already
// module state, and `applyDil()` — which runs before the first paint in
// main.tsx and again inside `LangProvider.setDil` — is the only writer.
// `setDil` applies BEFORE it sets React state, so the re-render that follows
// already sees the new language.

let aktif: Dil = 'tr';

export function setAktifDil(dil: Dil): void {
  aktif = dil;
}

export function aktifDil(): Dil {
  return aktif;
}

/** The translator for anything that cannot reach a React context. */
export function t(key: string, vars?: Vars): string {
  return translate(aktif, key, vars);
}

/** Values for the `{name}` slots in a phrase. */
export type Vars = Record<string, string | number>;

// `{ad}` or `{ad:tekil|çoğul}`. One regex for both, so `slotsOf` and the
// interpolator can never disagree about what a slot is.
const SLOT = /\{(\w+)(?::([^{}]*))?\}/g;

const RULES = new Map<Dil, Intl.PluralRules>();

function isOne(dil: Dil, n: number): boolean {
  let rule = RULES.get(dil);
  if (rule === undefined) {
    rule = new Intl.PluralRules(dil);
    RULES.set(dil, rule);
  }
  return rule.select(n) === 'one';
}

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
  return phrase.replace(SLOT, (whole, name: string, forms: string | undefined) => {
    if (!(name in vars)) return whole;
    const value = vars[name]!;
    if (forms === undefined) return String(value);
    // A plural form asks its OWN slot for the count, not "the first number in
    // vars": one sentence can carry two of them ("2 lessons and 6 hours").
    const [one = '', other = ''] = forms.split('|');
    return typeof value === 'number' && isOne(dil, value) ? one : other;
  });
}

/** Every `{slot}` a phrase uses — for the dictionary's own test. */
export function slotsOf(phrase: string): string[] {
  return [...phrase.matchAll(SLOT)].map((m) => m[1]!);
}

/** Just the plural slots, so the test can say what a form is missing. */
export function pluralSlotsOf(phrase: string): string[] {
  return [...phrase.matchAll(SLOT)].filter((m) => m[2] !== undefined).map((m) => m[1]!);
}
