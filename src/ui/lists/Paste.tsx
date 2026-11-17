// The Excel paste box, shared by Rooms, Teachers, Classes and Dersler.
//
// CONTROLLED, since the trigger left the form row. "Excel’den yapıştır o
// bloğun en sağında hatta en sağ üstünde bile olabilir." — the button now
// rides the panel's heading and the box opens BELOW the form, so opening it no
// longer breaks the row of controls in half. The button belongs to the panel
// (there is one shape for all four, `.panel-head`) and the box belongs here,
// which is why `open` is a prop rather than state.

import { useState } from 'react';
import type { ParseResult } from '../../pure/io';
import { T, useT } from '../common';

/**
 * What each pasted column is read as, chosen per column in the preview
 * (Öğretmenler). The preview is then a table of what will be added, one
 * column per pasted column under its choice, so it cannot say one thing and
 * add another (walkthrough, 2026-11-16).
 */
interface Columns<T> {
  /** `[id, label]`; the last is "Yok say". */
  choices: Array<[string, string]>;
  detect: (text: string) => string[];
  value: (x: T, col: string) => string;
  /** Shown when no column holds them but the rows do: the short form made
      from the name, an address found in another column. */
  always: string[];
}

/** The Excel paste box: preview, then add. It never adds directly. */
export default function Paste<T>({
  open,
  close,
  title,
  example,
  parse,
  rowText,
  columns,
  onAdd,
}: {
  open: boolean;
  close: () => void;
  title: string;
  example: string;
  parse: (text: string, cols?: string[]) => ParseResult<T>;
  rowText: (x: T) => string;
  columns?: Columns<T>;
  onAdd: (rows: T[]) => void;
}) {
  const t = useT();
  const [text, setText] = useState('');
  const [result, setResult] = useState<ParseResult<T> | null>(null);
  const [cols, setCols] = useState<string[]>([]);
  const label = (id: string) => columns?.choices.find((c) => c[0] === id)?.[1] ?? '';
  const extra = (columns?.always ?? []).filter(
    (id) => !cols.includes(id) && result?.accepted.some((x) => columns?.value(x, id) !== ''),
  );

  if (!open) return null;

  return (
    <div className="panel inset">
      <h3>{title}</h3>
      <p className="hint">
        <T
          k="Excel’de sütunları seçip kopyalayın, aşağıya yapıştırın. Beklenen sıra: **{ornek}**"
          vars={{ ornek: example }}
        />
      </p>
      <textarea
        rows={6}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setResult(null);
        }}
        placeholder={t('Buraya yapıştırın...')}
      />
      <div className="form-row spaced">
        <button
          className="btn"
          onClick={() => {
            const found = columns?.detect(text) ?? [];
            setCols(found);
            setResult(parse(text, columns && found));
          }}
        >
          {t('Önizle')}
        </button>
        <button
          className="btn"
          onClick={() => {
            close();
            setText('');
            setResult(null);
          }}
        >
          {t('Vazgeç')}
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
            <div className="error-box">{t('Okunabilir satır bulunamadı.')}</div>
          ) : (
            <div className="ok-box">
              <T
                k="**{n} satır okundu.** Aşağıdakiler eklenecek:"
                vars={{ n: result.accepted.length }}
              />
            </div>
          )}
          {/* The choices stay up with no row accepted: choosing "Yok say"
              for the name column must not take the way back with it. */}
          {columns === undefined ? (
            <ul className="paste-preview">
              {result.accepted.map((x, i) => (
                <li key={i}>{rowText(x)}</li>
              ))}
            </ul>
          ) : (
            <div className="table-scroll">
              <table className="list paste-preview">
                <thead>
                  <tr>
                    {cols.map((c, k) => (
                      <th key={k}>
                        <select
                          aria-label={t('{n}. sütun', { n: k + 1 })}
                          value={c}
                          onChange={(e) => {
                            const next = cols.map((x, j) => (j === k ? e.target.value : x));
                            setCols(next);
                            setResult(parse(text, next));
                          }}
                        >
                          {columns.choices.map(([id, name]) => (
                            <option key={id} value={id}>
                              {name}
                            </option>
                          ))}
                        </select>
                      </th>
                    ))}
                    {extra.map((id) => (
                      <th key={id}>{label(id)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.accepted.map((x, i) => (
                    <tr key={i}>
                      {cols.map((c, k) => (
                        <td key={k}>
                          {/* Two name columns are one name, said once. */}
                          {cols.indexOf(c) === k && c !== 'skip' ? columns.value(x, c) : ''}
                        </td>
                      ))}
                      {extra.map((id) => (
                        <td key={id}>{columns.value(x, id)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {result.accepted.length > 0 && (
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
          )}
        </>
      )}
    </div>
  );
}
