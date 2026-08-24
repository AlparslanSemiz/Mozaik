// Settings section: school name, which days are taught, and the bell times.
//
// Text boxes use defaultValue + onBlur. Updating top level state on every
// keystroke with onChange loses focus (docs/PLAN.md pitfall 3).

import { useMemo } from 'react';
import { dayPeriods } from '../../bell';
import type { Day } from '../../types';
import { WEEK, hourLabels, makeDay, updateBell, updateSettings } from '../../entities';
import Field from '../Field';
import type { PanelProps } from '../props';

export default function School({ state, change }: PanelProps) {
  const dayCount = state.settings.days.length;
  const hourCount = state.settings.hours.length;

  function setHours(count: number, names?: string) {
    change((d) => updateSettings(d, { hours: hourLabels(count, names) }));
  }

  /**
   * Adds or removes one weekday, keeping calendar order. Placement keys hold
   * the day INDEX, so updateSettings -> remapDays rewrites them by name; without
   * that, unticking Monday would shift the whole timetable a day earlier.
   */
  function toggleDay(name: string, on: boolean) {
    change((d) => {
      const kept = new Map(d.settings.days.map((x) => [x.name, x]));
      if (on) kept.set(name, kept.get(name) ?? makeDay(name));
      else kept.delete(name);
      if (kept.size === 0) return d; // a week with no days is not a week

      const inWeek = WEEK.flatMap((n) => {
        const day = kept.get(n);
        return day === undefined ? [] : [day];
      });
      // Days with names we do not know (from an imported backup) keep their order.
      const custom = d.settings.days.filter((x) => !WEEK.includes(x.name) && kept.has(x.name));
      return updateSettings(d, { days: [...inWeek, ...custom] });
    });
  }

  function setLongBreak(name: string, after: number) {
    change((d) =>
      updateSettings(d, {
        days: d.settings.days.map((x) => (x.name === name ? { ...x, longBreakAfter: after } : x)),
      }),
    );
  }

  // One column per distinct long-break position: weekdays and the weekend
  // usually differ only there, so two columns say everything.
  const patterns = useMemo(() => {
    const byBreak = new Map<number, Day[]>();
    for (const day of state.settings.days) {
      byBreak.set(day.longBreakAfter, [...(byBreak.get(day.longBreakAfter) ?? []), day]);
    }
    return [...byBreak.entries()].map(([after, days]) => ({
      after,
      dayNames: days.map((x) => x.name).join(', '),
      periods: dayPeriods(state.settings.bell, state.settings.hours, after),
    }));
  }, [state.settings]);

  return (
    <>
      <div className="panel">
        <h2>Okul ve günler</h2>
        <div className="form-row">
          <label className="field field-wide">
            <span className="field-label">
              Okul adı (yazdırılan sayfaların başlığında görünür)
            </span>
            <input
              type="text"
              className="grow"
              defaultValue={state.settings.schoolName}
              placeholder="örn. Semiz Kurs"
              onBlur={(e) => change((d) => updateSettings(d, { schoolName: e.target.value.trim() }))}
            />
          </label>
        </div>

        <p className="hint">
          Ders yapılan günleri işaretleyin. Her günün yanındaki kutu, <b>öğle arasının</b>{' '}
          kaçıncı dersten sonra verileceğini söyler. Bir günü kaldırırsanız o güne
          yerleşmiş dersler silinir; kalan günlerin programı yerinde durur.
        </p>

        <table className="list narrow">
          <thead>
            <tr>
              <th style={{ width: 44 }} />
              <th>Gün</th>
              <th style={{ width: 220 }}>Öğle arası</th>
            </tr>
          </thead>
          <tbody>
            {WEEK.map((name) => {
              const day = state.settings.days.find((x) => x.name === name);
              return (
                <tr key={name}>
                  <td>
                    <input
                      type="checkbox"
                      aria-label={name}
                      checked={day !== undefined}
                      onChange={(e) => toggleDay(name, e.target.checked)}
                    />
                  </td>
                  <td>{name}</td>
                  <td>
                    {day === undefined ? (
                      <span className="hint">ders yok</span>
                    ) : (
                      <select
                        value={day.longBreakAfter}
                        aria-label={`${name} öğle arası`}
                        onChange={(e) => setLongBreak(name, Number(e.target.value))}
                      >
                        <option value={0}>Uzun ara yok</option>
                        {state.settings.hours.map((_, i) => (
                          <option key={i} value={i + 1}>
                            {i + 1}. dersten sonra
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <p className="hint">
          Şu an <b>{dayCount} gün × {hourCount} saat</b> = {dayCount * hourCount} slot.
          {dayCount === 0 && ' En az bir gün seçmelisiniz.'}
        </p>
      </div>

      <div className="panel">
        <h2>Ders saatleri</h2>
        <p className="hint">
          Gün kaçta başlıyor, bir ders ve bir teneffüs kaç dakika. Saatler bunlardan
          hesaplanır — tek tek girmeye gerek yok. Aşağıdaki tablo anında güncellenir.
        </p>
        <div className="form-row">
          <Field label="Günlük ders sayısı">
            <input
              type="number"
              min={1}
              max={16}
              defaultValue={hourCount}
              className="num"
              onBlur={(e) => setHours(Number(e.target.value))}
            />
          </Field>
          <Field label="İlk ders başlangıcı">
            <input
              type="time"
              defaultValue={state.settings.bell.start}
              className="time"
              onBlur={(e) => change((d) => updateBell(d, { start: e.target.value }))}
            />
          </Field>
          <Field label="Ders (dk)">
            <input
              type="number"
              min={5}
              max={120}
              defaultValue={state.settings.bell.lessonMinutes}
              className="num"
              onBlur={(e) => change((d) => updateBell(d, { lessonMinutes: Number(e.target.value) }))}
            />
          </Field>
          <Field label="Teneffüs (dk)">
            <input
              type="number"
              min={0}
              max={60}
              defaultValue={state.settings.bell.breakMinutes}
              className="num"
              onBlur={(e) => change((d) => updateBell(d, { breakMinutes: Number(e.target.value) }))}
            />
          </Field>
          <Field label="Öğle arası (dk)">
            <input
              type="number"
              min={0}
              max={180}
              defaultValue={state.settings.bell.longBreakMinutes}
              className="num"
              onBlur={(e) =>
                change((d) => updateBell(d, { longBreakMinutes: Number(e.target.value) }))
              }
            />
          </Field>
        </div>

        {patterns.length > 0 && (
          <table className="list bell-preview mid">
            <thead>
              <tr>
                <th style={{ width: 60 }}>Ders</th>
                {patterns.map((p) => (
                  <th key={p.after}>{p.dayNames}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {state.settings.hours.flatMap((label, i) => [
                <tr key={i}>
                  <th>{label}</th>
                  {patterns.map((p) => (
                    <td key={p.after}>
                      {p.periods[i]?.start ?? ''}–{p.periods[i]?.end ?? ''}
                    </td>
                  ))}
                </tr>,
                // A break row for every distinct break position. It shows the
                // break ONLY in the columns that break there — weekdays and the
                // weekend differ, and one shared row would lie about one of them.
                ...(patterns.some((p) => p.after === i + 1)
                  ? [
                      <tr key={`break-${i}`} className="break-row">
                        <th>Ara</th>
                        {patterns.map((p) => (
                          <td key={p.after}>
                            {p.after === i + 1
                              ? `Öğle arası — ${state.settings.bell.longBreakMinutes} dk`
                              : ''}
                          </td>
                        ))}
                      </tr>,
                    ]
                  : []),
              ])}
              <tr>
                <th>Bitiş</th>
                {patterns.map((p) => (
                  <td key={p.after}>
                    <b>{p.periods[p.periods.length - 1]?.end ?? ''}</b>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        )}

        <div className="form-row spaced">
          <label className="field field-wide">
            <span className="field-label">Ders adları (virgülle; boş bırakılırsa 1, 2, 3…)</span>
            <input
              type="text"
              className="grow"
              defaultValue={state.settings.hours.join(', ')}
              onBlur={(e) => setHours(hourCount, e.target.value)}
              placeholder="1, 2, 3, ..."
            />
          </label>
        </div>
      </div>
    </>
  );
}
