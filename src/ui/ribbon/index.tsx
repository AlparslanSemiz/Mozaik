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
// test layers (pitfall 56) and the symbol is what the eye finds first at any
// scale. The word is also the part the strip gives up LAST and only under
// pressure, and when it goes the name stays (LAYOUT.md, strip rule 6).
//
// The three THINGS this program schedules — teacher, class, room — are drawn
// from `KIND_ICON` wherever they are named, Yazdır included. Everything else is
// lucide (tree-shaken, ~0.3 KB a symbol).
//
// The state these controls show (`view`, `kind`, `step`, `section`, `scope`,
// `checkView`) lives in App — see src/toolState.ts for why that is a fix and
// not a side effect of drawing them up here.
//
// One file per strip since RF10 (TODO §8k): this one decides which strip is
// drawn and computes what more than one of them reads; `parts.tsx` says why
// the strips are functions and not components.

import { useMemo } from 'react';
import { health } from '../../pure/feasibility';
import { useDialogs, useLang, useT } from '../common';
import type { RibbonProps, StripContext } from './parts';
import { availabilityStrip } from './AvailabilityStrip';
import { checkStrip } from './CheckStrip';
import { lessonsStrip } from './LessonsStrip';
import { printStrip } from './PrintStrip';
import { programStrip } from './ProgramStrip';
import { settingsStrip } from './SettingsStrip';
import { setupStrip } from './SetupStrip';

export default function Ribbon(props: RibbonProps) {
  const { ui, open, state } = props;
  const t = useT();
  const dialogs = useDialogs();
  // `dil` although `health` does not take it: its sentences are translated
  // inside, so after a live language switch the memo would keep the old words
  // until the next edit (e2e/dil.spec.ts).
  const { dil } = useLang();
  const status = useMemo(() => {
    void dil;
    return health(state);
  }, [state, dil]);

  // Folded: the row is GONE, all of it. A folded strip that keeps 27px to hold
  // its own chevron gives back a third of what it costs, and folding is worth
  // having only if it gives the row back whole. The way back is in the top bar.
  if (!open) return null;

  const c: StripContext = { ...props, t, dialogs, status };
  if (ui.tab === 'setup') return setupStrip(c);
  if (ui.tab === 'lessons') return lessonsStrip(c);
  if (ui.tab === 'availability') return availabilityStrip(c);
  if (ui.tab === 'program') return programStrip(c);
  if (ui.tab === 'check') return checkStrip(c);
  if (ui.tab === 'print') return printStrip(c);
  return settingsStrip(c);
}
