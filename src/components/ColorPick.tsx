// The colour of one teacher or one class.
//
// It used to be a <select> of the numbers 1..36 — the index of the colour, but
// never the colour itself, so choosing one meant guessing and then looking at
// the result. Now the trigger shows the colour it IS, and opening it shows all
// thirty-six at once.
//
// The index is NOT DRAWN on the swatch any more — "Renklerin üzerinde sayılar
// olmasın", 2026-08-27, and the reader is right: the number was there to make
// the old <select> legible, and once the control shows the colour it IS, a
// digit printed over it is a second answer to a question already answered.
// Twenty-five rows of numbered squares also read as a ranking, which they are
// not.
//
// It has not gone away, only gone quiet: the index is still what `State`
// stores, what a backup carries and what "do two teachers share a colour" is
// asked in, and it is still the swatch's ACCESSIBLE NAME ("Renk 12"). So a
// screen reader and every test can still say which one is which, and the
// --on-color ink rule (pitfalls 15 and 35) stays in force for the cards and
// the grid, which do still carry text on a palette ground.
//
// A <dialog> and showModal(), per the design rule; window.prompt and friends
// are banned. It is mounted only while open, so twenty-five teachers do not
// mean nine hundred buttons sitting in the document.

import { useEffect, useRef, useState } from 'react';
import { PALETTE_SIZE, paletteColor } from '../palette';
import { useT } from './T';

interface Props {
  value: number;
  /** What this colour belongs to, e.g. "MÇ" or "510" — used for the labels. */
  owner: string;
  onChange: (next: number) => void;
}

export default function ColorPick({ value, owner, onChange }: Props) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (open) dialog.current?.showModal();
  }, [open]);

  function choose(next: number) {
    onChange(next);
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        className="color-pick"
        style={{ background: paletteColor(value) }}
        // The index rides in the NAME now that it is off the face of the
        // swatch: "MÇ rengi" alone could not tell two teachers apart out loud.
        aria-label={`${owner} rengi: ${value + 1}`}
        title={`Renk ${value + 1}`}
        onClick={() => setOpen(true)}
      />

      {open && (
        <dialog
          className="color-dialog"
          ref={dialog}
          aria-label={`${owner} rengi`}
          // Escape closes it natively; this keeps React's copy of the state in
          // step with the element's, which showModal() alone does not.
          onClose={() => setOpen(false)}
          onClick={(e) => {
            // The backdrop is the dialog element itself; a click that lands on
            // it rather than on the grid inside means "outside".
            if (e.target === dialog.current) setOpen(false);
          }}
        >
          <h3>{owner} rengi</h3>
          <div className="swatches">
            {Array.from({ length: PALETTE_SIZE }, (_, i) => (
              <button
                key={i}
                type="button"
                className="swatch"
                style={{ background: paletteColor(i) }}
                aria-label={`Renk ${i + 1}`}
                aria-pressed={i === value}
                onClick={() => choose(i)}
              />
            ))}
          </div>
          <p className="hint">
            {t(
              'Renk kimliktir: ızgarada bu satırı ve havuzdaki kartını eşleştiren şey budur, o yüzden iki öğretmene aynı rengi vermeyin.',
            )}
          </p>
          <div className="form-row nowrap">
            <button type="button" className="btn" onClick={() => setOpen(false)}>{t('Vazgeç')}</button>
          </div>
        </dialog>
      )}
    </>
  );
}
