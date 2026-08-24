// The Excel paste box, shared by Rooms, Teachers, Classes and Lessons.

import { useState } from 'react';
import type { ParseResult } from '../../import';

/** The Excel paste box: preview, then add. It never adds directly. */
export default function Paste<T>({
  title,
  example,
  parse,
  rowText,
  onAdd,
}: {
  title: string;
  example: string;
  parse: (text: string) => ParseResult<T>;
  rowText: (x: T) => string;
  onAdd: (rows: T[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [result, setResult] = useState<ParseResult<T> | null>(null);

  if (!open) {
    return (
      <button className="btn" onClick={() => setOpen(true)}>
        Excel'den yapıştır
      </button>
    );
  }

  return (
    <div className="panel" style={{ background: 'var(--bg)' }}>
      <h3 style={{ marginTop: 0 }}>{title}</h3>
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
      <div className="form-row" style={{ marginTop: 8 }}>
        <button className="btn" onClick={() => setResult(parse(text))}>
          Önizle
        </button>
        <button
          className="btn"
          onClick={() => {
            setOpen(false);
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
              <ul style={{ maxHeight: 160, overflow: 'auto', fontSize: 13 }}>
                {result.accepted.map((x, i) => (
                  <li key={i}>{rowText(x)}</li>
                ))}
              </ul>
              <button
                className="btn primary"
                onClick={() => {
                  onAdd(result.accepted);
                  setOpen(false);
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
