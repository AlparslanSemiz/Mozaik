// The Excel paste box, shared by Rooms, Teachers, Classes and Dersler.
//
// CONTROLLED, since the trigger left the form row. "Excel'den yapıştır o
// bloğun en sağında hatta en sağ üstünde bile olabilir." — the button now
// rides the panel's heading and the box opens BELOW the form, so opening it no
// longer breaks the row of controls in half. The button belongs to the panel
// (there is one shape for all four, `.panel-head`) and the box belongs here,
// which is why `open` is a prop rather than state.

import { useState } from 'react';
import type { ParseResult } from '../../import';

/** The Excel paste box: preview, then add. It never adds directly. */
export default function Paste<T>({
  open,
  close,
  title,
  example,
  parse,
  rowText,
  onAdd,
}: {
  open: boolean;
  close: () => void;
  title: string;
  example: string;
  parse: (text: string) => ParseResult<T>;
  rowText: (x: T) => string;
  onAdd: (rows: T[]) => void;
}) {
  const [text, setText] = useState('');
  const [result, setResult] = useState<ParseResult<T> | null>(null);

  if (!open) return null;

  return (
    <div className="panel inset">
      <h3>{title}</h3>
      <p className="hint">
        Excel'de sütunları seçip kopyalayın, aşağıya yapıştırın. Beklenen sıra:{' '}
        <b>{example}</b>
      </p>
      <textarea
        rows={6}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setResult(null);
        }}
        placeholder="Buraya yapıştırın..."
      />
      <div className="form-row spaced">
        <button className="btn" onClick={() => setResult(parse(text))}>
          Önizle
        </button>
        <button
          className="btn"
          onClick={() => {
            close();
            setText('');
            setResult(null);
          }}
        >
          Vazgeç
        </button>
      </div>

      {result !== null && (
        <>
          {result.errors.length > 0 && (
            <div className="warn-box">
              {result.errors.map((message, i) => (
                <div key={i}>{message}</div>
              ))}
            </div>
          )}
          {result.accepted.length === 0 ? (
            <div className="error-box">Okunabilir satır bulunamadı.</div>
          ) : (
            <>
              <div className="ok-box">
                <b>{result.accepted.length} satır okundu.</b> Aşağıdakiler eklenecek:
              </div>
              <ul className="paste-preview">
                {result.accepted.map((x, i) => (
                  <li key={i}>{rowText(x)}</li>
                ))}
              </ul>
              <button
                className="btn primary"
                onClick={() => {
                  onAdd(result.accepted);
                  close();
                  setText('');
                  setResult(null);
                }}
              >
                {result.accepted.length} satırı ekle
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}
