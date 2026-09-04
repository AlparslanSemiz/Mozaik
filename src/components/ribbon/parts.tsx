// The strip's SHAPE, shared by all seven tabs.
//
// Five points, every one of them measured rather than tasteful: the same
// height on every tab, a title that says which question the buttons answer,
// groups separated by <Sep/> with the right-hand group pushed by <Spacer/>, an
// icon AND a word on every button, and one control height (--ribbon-h) given
// to the CONTROL rather than to the strip — a fixed-height strip centres what
// it is given and hides a button 2px taller than itself.

// The tool strip: what the section you are in can DO, on a row of its own.
//
// The rule for what earns a place here: it answers "what am I looking at" or
// "what does one click do", and the eye looks for it on arriving. A list, a
// counter, a checkbox or a sentence of explanation stays in the panel below —
// a ribbon of everything is a ribbon of nothing.
//
// ONE SHAPE, SIX TABS (2026-08-27). Before this the five strips were five
// different objects: Kurulum had symbols but no captions, Müsaitlik had both,
// Program had captions on two groups out of four, and Yazdır and Ayarlar were
// bare rows of words. Kontrol had no strip at all, so arriving there moved
// everything under it up by the strip's whole height and arriving anywhere else
// moved it back down. The contract now, and `e2e/serit.spec.ts` measures every
// line of it:
//
//   1. all seven tabs draw a `.ribbon`, and they are the same height;
//   2. every strip opens with a `<Group>` caption — what the buttons answer;
//   3. groups are divided by `<Sep/>`, and a right-hand group by `<Spacer/>`;
//   4. every button carries a SYMBOL and a WORD, never one alone;
//   5. all the buttons are the same height;
//   6. the first button starts at the same x on all seven, because the opening
//      caption is a FIXED box with the word centred in it and the rule pinned
//      to its right edge (2026-08-27, "İlk baştaki yazı sonrası hepsi aynı
//      hizadan başlasın ... arada bir çizgi olur"; corrected 2026-08-28,
//      "çizgi her sectionda aynı yerde olsun ve yazı ortalansın" — the box was
//      padded but the rule was drawn from its STATIC position, i.e. from the
//      end of the TEXT, so it moved with every caption). The seven captions
//      are one word each for the same reason: a box that has to hold "NE
//      GÖSTERİLSİN" is a box with an inch of air in front of six other tabs;
//   7. buttons in one group are the same WIDTH — `.ribbon-group` is a grid of
//      equal columns ("Blokların simetrisi ... sadece şekilleriyle").
//
// And one more thing that is an ORDER rather than a shape: wherever a strip
// offers the two kinds side by side, teacher comes first and class second. It
// was teacher-first in Müsaitlik and Program and class-first in Dersler and
// Yazdır — the same two icons, the same row, two orders. Kurulum's three lists
// are not this: a class refers to a room, so rooms have to be typed in first.
//
// Rule 4 is the accessibility half: the word is the accessible name in both
// test layers (pitfall 56) and the symbol is what the eye finds first at 150%,
// which is the scale this tool is built for.
//
// The three THINGS this program schedules — teacher, class, room — are drawn
// from `KIND_ICON` wherever they are named, Yazdır included. Everything else is
// lucide (tree-shaken, ~0.3 KB a symbol).
//
// The state these controls show (`view`, `kind`, `step`, `section`, `scope`,
// `checkView`) lives in App — see src/toolState.ts for why that is a fix and
// not a side effect of drawing them up here.

import {
  Bell,
  Eye,
  Info,
  Library,
  List,
  Maximize2,
  Minimize2,
  Moon,
  Rows3,
  Scale,
  Sun,
} from 'lucide-react';
import type { Density, Theme } from '../../theme';
import type { Kind, LessonMode, SectionId, View } from '../../toolState';
import { KIND_ICON, classIcon, teacherIcon } from '../steps';
import { useT } from '../T';
import type { ProgramColorMode } from '../../programColor';

/** Every lucide symbol in the strip is drawn at the size the hand-drawn four are. */
export const ICON = { size: 18, 'aria-hidden': true, focusable: false } as const;

/**
 * The two views. `short` is what the button shows, `label` what it is called.
 *
 * They used to be icons alone, on the grounds that the sentence under the strip
 * explains the axis anyway. It does — once you have read it. `aria-label` stays
 * the full phrase because it is the name the suite and a screen reader find
 * them by, and WCAG's Label in Name is satisfied by the visible word being
 * contained in it ("Öğretmen" inside "Öğretmen görünümü").
 */
export const VIEWS: Array<{ id: View; label: string; short: string; icon: React.ReactElement }> = [
  { id: 'teacher', label: 'Öğretmen görünümü', short: 'Öğretmen', icon: teacherIcon },
  { id: 'class', label: 'Sınıf görünümü', short: 'Sınıf', icon: classIcon },
];


export const KINDS: Array<{ id: Kind; label: string }> = [
  { id: 'teacher', label: 'Öğretmen' },
  { id: 'class', label: 'Sınıf' },
  { id: 'room', label: 'Derslik' },
];

export const SECTIONS: Array<{ id: SectionId; label: string; icon: React.ReactElement }> = [
  { id: 'school', label: 'Zil ve günler', icon: <Bell {...ICON} /> },
  { id: 'rules', label: 'Kurallar', icon: <Scale {...ICON} /> },
  { id: 'appearance', label: 'Görünüm', icon: <Eye {...ICON} /> },
  { id: 'plans', label: 'Planlar ve yedek', icon: <Library {...ICON} /> },
  { id: 'about', label: 'Hakkında', icon: <Info {...ICON} /> },
];

export const PROGRAM_COLORS: Array<{ id: ProgramColorMode; label: string; short: string }> = [
  { id: 'teacher', label: 'Öğretmene göre', short: 'Öğretmen' },
  { id: 'class', label: 'Sınıfa göre', short: 'Sınıf' },
  { id: 'room', label: 'Dersliğe göre', short: 'Derslik' },
  { id: 'subject', label: 'Branşa göre', short: 'Branş' },
];


/** The two grounds, named rather than toggled — the same list Ayarlar →
    Görünüm draws, because a strip and a panel showing the same two buttons may
    not disagree about what they are called. */
export const THEMES: Array<{ id: Theme; label: string; icon: React.ReactElement }> = [
  { id: 'light', label: 'Açık', icon: <Sun {...ICON} /> },
  { id: 'dark', label: 'Koyu', icon: <Moon {...ICON} /> },
];

/** Three densities, and the symbols say which way each one goes. */
export const DENSITIES: Array<{ id: Density; label: string; icon: React.ReactElement; why: string }> = [
  {
    id: 'ferah',
    label: 'Ferah',
    icon: <Maximize2 {...ICON} />,
    why: 'Hücre en büyük, kartın alt satırı tam boyda',
  },
  { id: 'rahat', label: 'Rahat', icon: <Rows3 {...ICON} />, why: 'Hücre geniş, ders saatleri görünür' },
  {
    id: 'sigdir',
    label: 'Sığdır',
    icon: <Minimize2 {...ICON} />,
    why: 'Haftanın tamamı ekrana sığar, ders saatleri gizlenir',
  },
];

/**
 * The three ways to walk the lesson list.
 *
 * The two entity icons come from `KIND_ICON` — a class is the same crowd here
 * as it is in Müsaitlik and in the entity sheet — and only the third needs one
 * of its own, because "the whole list" is not one of the three kinds.
 */
export const LESSON_MODES: Array<{ id: LessonMode; label: string; icon: React.ReactElement; why: string }> = [
  {
    id: 'teacher',
    label: 'Öğretmenden',
    icon: KIND_ICON.teacher,
    why: 'Bir öğretmen seçin, girdiği bütün sınıfları arka arkaya girin',
  },
  {
    id: 'class',
    label: 'Sınıftan',
    icon: KIND_ICON.class,
    why: 'Bir sınıf seçin, o sınıfın derslerini arka arkaya girin',
  },
  {
    id: 'all',
    label: 'Genel',
    icon: <List {...ICON} />,
    why: 'Bütün dersler tek listede',
  },
];

export function Sep() {
  return <span className="ribbon-sep" aria-hidden="true" />;
}

export function Spacer() {
  return <span className="spacer" />;
}

/**
 * A caption and the controls it names — the strip's only structure.
 *
 * The caption is a DIRECT child of `.ribbon` and the controls are boxed. Both
 * halves of that are load-bearing:
 *
 *   * direct, because `e2e/serit.spec.ts` reads `bar.firstElementChild` to
 *     check that every strip opens with a caption, and because the first
 *     caption on each of the seven strips is padded to one width so the first
 *     BUTTON lands at the same x wherever you are;
 *   * boxed, because buttons that belong to one question should be the same
 *     width, and CSS has no way to say that without a box (`.ribbon-group` is
 *     a one-row grid of equal columns).
 *
 * It was a fragment until 2026-08-27, on the argument that boxing would make
 * `.ribbon`'s gap apply between boxes and force a second gap inside them. That
 * is exactly what happens and it turns out to be the point: with one gap the
 * caption sat as far from the buttons it names as the buttons sat from each
 * other, so the only thing grouping them was the hairline. Now the inside gap
 * is smaller than the outside one and the group reads as a group.
 */
export function Group({ label, children }: { label: string; children: React.ReactNode }) {
  const t = useT();
  return (
    <>
      <span className="ribbon-label">{t(label)}</span>
      <span className="ribbon-group">{children}</span>
    </>
  );
}
