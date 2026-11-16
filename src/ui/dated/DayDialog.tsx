// One date over the base week (schema v18): who is not coming, who takes
// their hours ("ikame"). A class away is a trip or an exam. Its one
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
  taughtOn,
  weekChanges,
} from '../../pure/dated';
import { useReturnFocus, useT } from '../common';
import { usePrintNow } from '../print';

type Change = (apply: (d: State) => State, label?: string) => void;

/** The İkame listesi on paper: one table, nothing else on the page. */
function Paper({ title, rows, done }: { title: string; rows: string[][]; done: () => void }) {
  usePrintNow(done, false);
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
  onShow,
}: {
  state: State;
  change: Change;
  /** The date shown; `null` is closed. */
  date: string | null;
  setDate: (iso: string) => void;
  /** Opened by this person's "Gelmiyor…": a new date moves their one-day absence. */
  person?: Id | undefined;
  onClose: () => void;
  /** Draws the date's week on the Program grid (the strip's chip only). */
  onShow?: () => void;
}) {
  const t = useT();
  const returnFocus = useReturnFocus(date !== null);
  const [printing, setPrinting] = useState(false);
  const donePrinting = useCallback(() => setPrinting(false), []);
  const iso = date ?? '';
  const nameOf = (id: Id | null | undefined) =>
    state.teachers.find((x) => x.id === id)?.name ?? state.classes.find((x) => x.id === id)?.name;
  const rows = date === null ? [] : coverRows(state, iso);
  const taught = date === null ? [] : taughtOn(state, iso);
  const away = state.dated.absent.flatMap((a, i) =>
    a.from <= iso && iso <= a.to ? [{ ...a, i }] : [],
  );
  const title = dayName(iso);
  const room = (classId: Id) => {
    const roomId = state.classes.find((c) => c.id === classId)?.roomId;
    return state.rooms.find((r) => r.id === roomId)?.name ?? '';
  };
  const hourOf = (h: number) => state.settings.hours[h] ?? '';
  const moveTo = (h: number) => t('{n}. saate taşı', { n: hourOf(h) });
  const paper = [
    [t('Saat'), t('Sınıf'), t('Öğretmen'), t('Yerine'), t('Derslik')],
    ...rows.map((r) => [
      state.settings.hours[r.hour] ?? '',
      nameOf(r.classId) ?? '',
      nameOf(r.teacherId) ?? '',
      r.to !== undefined
        ? moveTo(r.to)
        : r.cover === null
          ? t('Boş geçsin')
          : (nameOf(r.cover) ?? ''),
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
              {/* TODO(gönder, aşama 4): the send work's button goes here, beside
                  Yazdır, sending `paper` (the same rows) by WhatsApp or e-mail. */}
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
                  // Chrome fires once per typed digit of the year: wait for a real one.
                  if (next < '2000') return;
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
            {[...state.teachers, ...state.classes]
              .filter((p) => !away.some((a) => a.id === p.id))
              .map((p) => (
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
                        value={
                          r.to !== undefined
                            ? `>${r.to}`
                            : r.cover === undefined
                              ? ''
                              : (r.cover ?? '-')
                        }
                        onChange={(e) => {
                          const v = e.target.value;
                          change((d) =>
                            v[0] === '>'
                              ? setCover(d, iso, r.classId, r.hour, null, Number(v.slice(1)))
                              : setCover(
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
                        {r.hours.map((h) => (
                          <option key={h} value={`>${h}`}>
                            {moveTo(h)}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Any other lesson of the date: it becomes a row, first as "boş
              geçsin", then a substitute or another hour can be chosen. */}
          <select
            aria-label={t('Bir dersi değiştir…')}
            value=""
            onChange={(e) => {
              const x = taught[Number(e.target.value)];
              if (x !== undefined) change((d) => setCover(d, iso, x.classId, x.hour, null));
            }}
          >
            <option value="">{t('Bir dersi değiştir…')}</option>
            {taught.map((x, i) =>
              rows.some((r) => r.classId === x.classId && r.hour === x.hour) ? null : (
                <option key={i} value={i}>
                  {hourOf(x.hour)} · {nameOf(x.classId)} · {nameOf(x.teacherId)}
                </option>
              ),
            )}
          </select>

          {date !== null && weekChanges(state, iso) > 0 && (
            <div className="sheet-foot form-row">
              {onShow !== undefined && (
                <button className="btn" onClick={onShow}>
                  {t('Programda göster')}
                </button>
              )}
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
