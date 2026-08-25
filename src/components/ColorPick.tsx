// The colour of one teacher or one class.
//
// It used to be a <select> of the numbers 1..36 — the index of the colour, but
// never the colour itself, so choosing one meant guessing and then looking at
// the result. Now the trigger shows the colour it IS, and opening it shows all
// thirty-six at once.
//
// The index has not gone away, and that is deliberate: it is what `State`
// stores, what a backup file carries and what the "two teachers share a
// colour" question is asked in. It stays legible ON the swatch — pitfall 15
// and 35: the palette does not flip with the theme, so its ink must not either
// (--on-color), or the number vanishes on the pale rows in dark mode.
//
// A <dialog> and showModal(), per the design rule; window.prompt and friends
// are banned. It is mounted only while open, so twenty-five teachers do not
// mean nine hundred buttons sitting in the document.

import { useEffect, useRef, useState } from 'react';
import { PALETTE_SIZE, paletteColor } from '../palette';

interface Props {
  value: number;
  /** What this colour belongs to, e.g. "MÇ" or "510" — used for the labels. */
  owner: string;
  onChange: (next: number) => void;
}

export default function ColorPick({ value, owner, onChange }: Props) {
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
        aria-label={`${owner} rengi`}
        title="Renk"
        onClick={() => setOpen(true)}
      >
        {value + 1}
      </button>

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
              >
                {i + 1}
              </button>
            ))}
          </div>
          <p className="hint">
            Renk kimliktir: ızgarada bu satırı ve havuzdaki kartını eşleştiren şey
            budur, o yüzden iki öğretmene aynı rengi vermeyin.
          </p>
          <div className="form-row nowrap">
            <button type="button" className="btn" onClick={() => setOpen(false)}>
              Vazgeç
            </button>
          </div>
        </dialog>
      )}
    </>
  );
}
