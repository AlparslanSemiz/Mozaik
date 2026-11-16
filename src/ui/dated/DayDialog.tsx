// One date over the base week (schema v18): who is not coming, who takes
// their hours ("ikame"), and whether the day has no lessons at all. Its one
// primary button prints the İkame listesi. Opened from the Program strip's
// date chip and from a person page's "Gelmiyor…".
//
// Every choice is written at once, as one undo step, and only to the dated
// layer: the base week, the grid and the solver never see it.

import * as Dialog from '@radix-ui/react-dialog';
import { Printer, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { subjectLabel } from '../../leaf/lang';
import type { Id, State } from '../../leaf/model';
import {
  addAway,
  clearWeek,
  coverRows,
  dayName,
  moveAway,
  setAwayEnd,
  setCover,
  weekChanges,
} from '../../pure/dated';
import { useReturnFocus, useT } from '../common';
import { usePrintNow } from '../print';

type Change = (apply: (d: State) => State, label?: string) => void;

/** The İkame listesi on paper: one table, nothing else on the page. */
function Paper({ title, rows, done }: { title: string; rows: string[][]; done: () => void }) {
  usePrintNow(done);
  return createPortal(
    <div className="print-one-box" aria-hidden="true">
      <h1>{title}</h1>
      <table className="list">
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (i === 0 ? <th key={j}>{c}</th> : <td key={j}>{c}</td>))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>,
    document.body,
  );
}

export function DayDialog({
  state,
  change,
  date,
  setDate,
  person,
  onClose,
}: {
  state: State;
  change: Change;
  /** The date shown; `null` is closed. */
  date: string | null;
  setDate: (iso: string) => void;
  /** Opened by this person's "Gelmiyor…": a new date moves their one-day absence. */
  person?: Id;
  onClose: () => void;
}) {
  const t = useT();
  const returnFocus = useReturnFocus(date !== null);
  const [printing, setPrinting] = useState(false);
  const donePrinting = useCallback(() => setPrinting(false), []);
  const iso = date ?? '';
  const nameOf = (id: Id | null | undefined) =>
    state.teachers.find((x) => x.id === id)?.name ?? state.classes.find((x) => x.id === id)?.name;
  const rows = date === null ? [] : coverRows(state, iso);
  const away = state.dated.absent.flatMap((a, i) =>
    a.from <= iso && iso <= a.to ? [{ ...a, i }] : [],
  );
  const title = dayName(iso);
  const room = (classId: Id) => {
    const roomId = state.classes.find((c) => c.id === classId)?.roomId;
    return state.rooms.find((r) => r.id === roomId)?.name ?? '';
  };
  const paper = [
    [t('Saat'), t('Sınıf'), t('Gelmeyen'), t('Yerine'), t('Derslik')],
    ...rows.map((r) => [
      state.settings.hours[r.hour] ?? '',
      nameOf(r.classId) ?? '',
      nameOf(r.teacherId) ?? '',
      r.cover === null ? t('Boş geçsin') : (nameOf(r.cover) ?? ''),
      room(r.classId),
    ]),
  ];

  return (
    <Dialog.Root open={date !== null} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="dlg-overlay" />
        <Dialog.Content
          className="sheet dated"
          aria-describedby={undefined}
          onCloseAutoFocus={returnFocus}
        >
          <div className="sheet-head">
            <div className="sheet-id">
              <Dialog.Title className="sheet-title">{title}</Dialog.Title>
              <span className="sheet-kind">{t('İkame listesi')}</span>
            </div>
            <div className="sheet-actions">
              <button
                className="btn primary"
                disabled={rows.length === 0}
                onClick={() => setPrinting(true)}
              >
                <Printer size={16} strokeWidth={2} aria-hidden="true" />
                {t('Yazdır')}
              </button>
            </div>
            <Dialog.Close className="btn icon" aria-label={t('Kapat')}>
              <X size={18} strokeWidth={2.2} />
            </Dialog.Close>
          </div>

          <div className="form-row">
            <label>
              {t('Tarih')}{' '}
              <input
                type="date"
                value={iso}
                required
                onChange={(e) => {
                  const next = e.target.value;
                  if (next === '') return;
                  if (person !== undefined) change((d) => moveAway(d, person, iso, next));
                  setDate(next);
                }}
              />
            </label>
          </div>

          <h3 className="sheet-h">{t('Gelmeyen')}</h3>
          <div>
            {away.map((a) => (
              <div key={a.i} className="form-row">
                <span>{nameOf(a.id)}</span>
                <label>
                  {t('Son gün')}{' '}
                  <input
                    type="date"
                    value={a.to}
                    min={a.from}
                    required
                    onChange={(e) => {
                      if (e.target.value !== '') change((d) => setAwayEnd(d, a.i, e.target.value));
                    }}
                  />
                </label>
                <button
                  className="btn"
                  aria-label={`${t('Sil')}: ${nameOf(a.id)}`}
                  onClick={() => change((d) => setAwayEnd(d, a.i, null))}
                >
                  {t('Sil')}
                </button>
              </div>
            ))}
          </div>
          <select
            aria-label={t('Gelmeyen ekle…')}
            value=""
            onChange={(e) => {
              const id = e.target.value;
              if (id !== '') change((d) => addAway(d, id, iso));
            }}
          >
            <option value="">{t('Gelmeyen ekle…')}</option>
            {[...state.teachers, ...state.classes].map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {rows.length === 0 ? (
            <p className="hint">{t('Bu gün değişen ders yok.')}</p>
          ) : (
            <table className="list">
              <thead>
                <tr>
                  {paper[0]!.slice(0, 4).map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={`${r.hour}|${r.classId}`}>
                    {paper[i + 1]!.slice(0, 3).map((c, j) => (
                      <td key={j}>{c}</td>
                    ))}
                    <td>
                      <select
                        aria-label={`${t('Yerine')}: ${state.settings.hours[r.hour]} · ${nameOf(r.classId)}`}
                        value={r.cover === undefined ? '' : (r.cover ?? '-')}
                        onChange={(e) => {
                          const v = e.target.value;
                          change((d) =>
                            setCover(
                              d,
                              iso,
                              r.classId,
                              r.hour,
                              v === '' ? undefined : v === '-' ? null : v,
                            ),
                          );
                        }}
                      >
                        <option value="">{t('Seçilmedi')}</option>
                        <option value="-">{t('Boş geçsin')}</option>
                        {r.options.map((o) => (
                          <option key={o.id} value={o.id}>
                            {[
                              nameOf(o.id),
                              subjectLabel(o.subject),
                              o.week > 0 ? t('bu hafta {n}', { n: o.week }) : '',
                            ]
                              .filter(Boolean)
                              .join(' · ')}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {weekChanges(state, iso) > 0 && (
            <div className="sheet-foot">
              <button className="btn" onClick={() => change((d) => clearWeek(d, iso))}>
                {t('Bu haftanın değişikliklerini sil')}
              </button>
            </div>
          )}
          {printing && (
            <Paper title={`${t('İkame listesi')} · ${title}`} rows={paper} done={donePrinting} />
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
