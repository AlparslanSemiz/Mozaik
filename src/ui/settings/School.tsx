// Settings section: school name, which days are taught, and the bell times.
//
// Text boxes use defaultValue + onBlur. Updating top level state on every
// keystroke with onChange loses focus (docs/TRAPS.md pitfall 3).

import { useMemo, useState } from 'react';
import { clockParts, dayPeriods, formatClock, minuteOptions } from '../../pure/bell';
import type { Day } from '../../leaf/types';
import type { State } from '../../leaf/types';
import {
  WEEK,
  dayLabel,
  extraNames,
  hourLabels,
  makeDay,
  settingsLoss,
  updateBell,
  updateSettings,
} from '../../pure/entities';
import type { SettingsLoss } from '../../pure/entities';
import { useDialogs } from '../Dialogs';
import Field from '../Field';
import type { PanelProps } from '../props';
import { T, useT } from '../T';

/**
 * The week with one weekday added or removed, in calendar order, or null when
 * nothing would be left. Placement keys hold the day INDEX, so updateSettings
 * -> remapDays rewrites them by name; without that, unticking Monday would
 * shift the whole timetable a day earlier.
 */
function toggledDays(d: State, name: string, on: boolean) {
  const kept = new Map(d.settings.days.map((x) => [x.name, x]));
  if (on) kept.set(name, kept.get(name) ?? makeDay(name));
  else kept.delete(name);
  if (kept.size === 0) return null; // a week with no days is not a week

  const inWeek = WEEK.flatMap((n) => {
    const day = kept.get(n);
    return day === undefined ? [] : [day];
  });
  // Days with names we do not know (from an imported backup) keep their order.
  const custom = d.settings.days.filter((x) => !WEEK.includes(x.name) && kept.has(x.name));
  return [...inWeek, ...custom];
}

const sameList = (a: string[], b: string[]) =>
  a.length === b.length && a.every((x, i) => x === b[i]);

export default function School({ state, change }: PanelProps) {
  const t = useT();
  const { confirm } = useDialogs();
  // Names typed past the lesson count on the last blur, said under the box.
  const [extra, setExtra] = useState(0);
  const dayCount = state.settings.days.length;
  const hourCount = state.settings.hours.length;

  /**
   * A day or an hour that goes takes its placed and pinned lessons with it
   * (the grid has nowhere to show them, pitfall 5). That used to happen without
   * a word (DENETIM DK8); now the question counts first. False = keep things.
   */
  async function acceptLoss(
    loss: SettingsLoss,
    title: string,
    where: string,
    confirmLabel: string,
  ): Promise<boolean> {
    if (loss.placed === 0 && loss.pinned === 0 && loss.elsewhere === 0) return true;
    const body = [
      loss.placed > 0 ? where : '',
      loss.pinned > 0
        ? t('Bunların {n} saati sabitli, sabitlemeleri de kalkacak.', { n: loss.pinned })
        : '',
      loss.elsewhere > 0
        ? t('Öteki programlarda da {n} saat kalkacak.', { n: loss.elsewhere })
        : '',
      t('Bu dersler havuza dönecek. Geri al ile geri getirebilirsiniz.'),
    ].filter((x) => x !== '');
    return confirm({ title, body: body.join(' '), confirmLabel, danger: true });
  }

  /** `box` is put back by hand on "no": it is uncontrolled (defaultValue).
      The names already given are kept, only the count changes. */
  async function setCount(count: number, box: HTMLInputElement) {
    const hours = hourLabels(count, state.settings.hours.join(','));
    // An unchanged blur is not an edit, and must not leave an undo step behind.
    if (sameList(hours, state.settings.hours)) return;
    const loss = settingsLoss(state, { hours });
    const ok = await acceptLoss(
      loss,
      t('Günlük ders sayısı {n} olacak', { n: hours.length }),
      t('{saat}. dersten sonraki saatlerde yerleşmiş {n} saat var.', {
        saat: hours.length,
        n: loss.placed,
      }),
      t('Ders sayısını düşür'),
    );
    if (!ok) {
      box.value = String(hourCount);
      return;
    }
    change((d) => updateSettings(d, { hours }));
  }

  /**
   * Names only name: the count stays, so nothing can leave the grid this way
   * (DENETIM DK9). The box is rewritten with the day as it now reads, numbers
   * included, so what was kept and what was dropped is on screen.
   */
  function setNames(text: string, box: HTMLInputElement) {
    const hours = hourLabels(hourCount, text);
    setExtra(extraNames(hourCount, text));
    box.value = hours.join(', ');
    if (sameList(hours, state.settings.hours)) return;
    change((d) => updateSettings(d, { hours }));
  }

  async function toggleDay(name: string, on: boolean) {
    const days = toggledDays(state, name, on);
    if (days === null) return;
    const loss = settingsLoss(state, { days });
    const ok = await acceptLoss(
      loss,
      t('{gun} ders günlerinden çıkacak', { gun: dayLabel(name) }),
      t('{gun} günü yerleşmiş {n} saat var.', { gun: dayLabel(name), n: loss.placed }),
      t('{gun} gününü çıkar', { gun: dayLabel(name) }),
    );
    if (!ok) return;
    change((d) => {
      const next = toggledDays(d, name, on);
      return next === null ? d : updateSettings(d, { days: next });
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
      dayNames: days.map((x) => dayLabel(x.name)).join(', '),
      periods: dayPeriods(state.settings.bell, state.settings.hours, after),
    }));
  }, [state.settings]);

  const startAt = clockParts(state.settings.bell.start);

  function setStart(hour: number, minute: number) {
    change((d) => updateBell(d, { start: formatClock(hour * 60 + minute) }));
  }

  return (
    <div className="cols">
      <div>
        <div className="panel">
          <h2>{t('Zil ve günler')}</h2>
          {/* The description comes before the control it describes — this panel
              was the one place in the app where it did not, and the sentence
              about days sat between the school-name field and the day table as
              if it belonged to neither. Every panel now reads
              heading, description, entry, list. */}
          <p className="hint">
            <T k="Ders yapılan günleri işaretleyin; yanındaki kutu **öğle arasının** yerini söyler." />
          </p>

          <div className="form-row">
            <Field label={t('Okul adı (yazdırılan sayfaların başlığında görünür)')} wide>
              <input
                type="text"
                className="grow"
                defaultValue={state.settings.schoolName}
                placeholder={t('örn. Semiz Kurs')}
                onBlur={(e) =>
                  change((d) => updateSettings(d, { schoolName: e.target.value.trim() }))
                }
              />
            </Field>
          </div>

          <table className="list">
            <thead>
              <tr>
                <th className="w-col-xs" />
                <th>{t('Gün')}</th>
                <th className="w-col-2xl">{t('Öğle arası')}</th>
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
                        onChange={(e) => void toggleDay(name, e.target.checked)}
                      />
                    </td>
                    <td>{dayLabel(name)}</td>
                    <td>
                      {day === undefined ? (
                        <span className="hint">{t('ders yok')}</span>
                      ) : (
                        <select
                          value={day.longBreakAfter}
                          aria-label={t('{gun} öğle arası', { gun: dayLabel(name) })}
                          onChange={(e) => setLongBreak(name, Number(e.target.value))}
                        >
                          <option value={0}>{t('Uzun ara yok')}</option>
                          {state.settings.hours.map((_, i) => (
                            <option key={i} value={i + 1}>
                              {t('{n}. dersten sonra', { n: i + 1 })}
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
            <T
              k="Şu an **{gun} gün × {saat} saat** = {yer} slot."
              vars={{ gun: dayCount, saat: hourCount, yer: dayCount * hourCount }}
            />
            {dayCount === 0 && ` ${t('En az bir gün seçmelisiniz.')}`}
          </p>
        </div>

        <div className="panel">
          <h2>{t('Ders saatleri')}</h2>
          <p className="hint">
            {t('Gün kaçta başlıyor, ders ve teneffüs kaç dakika. Saatler bunlardan hesaplanır.')}
          </p>
          <div className="form-row">
            <Field label={t('Günlük ders sayısı')}>
              <input
                type="number"
                min={1}
                max={16}
                key={hourCount}
                defaultValue={hourCount}
                className="num"
                onBlur={(e) => {
                  const box = e.currentTarget;
                  // An emptied box is not a count of zero (Number('') is 0).
                  if (box.value.trim() === '') {
                    box.value = String(hourCount);
                    return;
                  }
                  void setCount(Number(box.value), box);
                }}
              />
            </Field>
            {/* Two dropdowns, not <input type="time">. That input renders AM/PM
                or 24-hour depending on the BROWSER's locale — not ours to
                decide — and it lets any minute through. It also had a trap: an
                emptied box blurred to "" and parseClock made the school day
                start at 00:00 with nothing to say so. There is no empty value to
                pick here. */}
            <div className="field">
              <span className="field-label">{t('İlk ders başlangıcı')}</span>
              <span className="clock-pick">
                <select
                  aria-label={t('Başlangıç saati')}
                  value={startAt.hour}
                  onChange={(e) => setStart(Number(e.target.value), startAt.minute)}
                >
                  {Array.from({ length: 24 }, (_, h) => (
                    <option key={h} value={h}>
                      {String(h).padStart(2, '0')}
                    </option>
                  ))}
                </select>
                <b>:</b>
                <select
                  aria-label={t('Başlangıç dakikası')}
                  value={startAt.minute}
                  onChange={(e) => setStart(startAt.hour, Number(e.target.value))}
                >
                  {minuteOptions(startAt.minute).map((m) => (
                    <option key={m} value={m}>
                      {String(m).padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </span>
            </div>
            <Field label={t('Ders (dk)')}>
              <input
                type="number"
                min={5}
                max={120}
                defaultValue={state.settings.bell.lessonMinutes}
                className="num"
                onBlur={(e) =>
                  change((d) => updateBell(d, { lessonMinutes: Number(e.target.value) }))
                }
              />
            </Field>
            <Field label={t('Teneffüs (dk)')}>
              <input
                type="number"
                min={0}
                max={60}
                defaultValue={state.settings.bell.breakMinutes}
                className="num"
                onBlur={(e) =>
                  change((d) => updateBell(d, { breakMinutes: Number(e.target.value) }))
                }
              />
            </Field>
            <Field label={t('Öğle arası (dk)')}>
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

          <div className="form-row spaced">
            <Field label={t('Ders adları (virgülle; boş kalan saat numarasını alır)')} wide>
              <input
                // Rebuilt when the stored names change (an undo, say), since
                // an uncontrolled box does not follow its defaultValue.
                key={state.settings.hours.join('|')}
                type="text"
                className="grow"
                defaultValue={state.settings.hours.join(', ')}
                onBlur={(e) => setNames(e.target.value, e.currentTarget)}
                placeholder="1, 2, 3, ..."
              />
            </Field>
          </div>
          {extra > 0 && (
            <p className="hint">
              {t('{n} ad ders sayısından fazlaydı ve kullanılmadı.', { n: extra })}
            </p>
          )}
        </div>
      </div>

      {/* The bell times are not a second form: they are the RESULT of the one
          on the left, a start time plus three durations. Standing beside it,
          "what does 40 + 10 make the day end at" is answered while the numbers
          are still being typed. */}
      <aside>
        <div className="panel">
          <h2>{t('Zil saatleri')}</h2>
          <p className="hint">
            {t('Soldaki saatten ve üç süreden hesaplanır; her öğle arası deseni kendi sütununda.')}
          </p>

          {/* Twelve lessons and their breaks, and on a short window that is
              taller than the panel: the one box here that can outgrow the
              screen is the one that scrolls. */}
          {patterns.length > 0 && (
            <div className="stat-scroll">
              <table className="list bell-preview">
                <thead>
                  <tr>
                    <th className="w-col-xs">{t('Ders')}</th>
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
                            <th>{t('Ara')}</th>
                            {patterns.map((p) => (
                              <td key={p.after}>
                                {p.after === i + 1
                                  ? t('Öğle arası, {dk} dk', {
                                      dk: state.settings.bell.longBreakMinutes,
                                    })
                                  : ''}
                              </td>
                            ))}
                          </tr>,
                        ]
                      : []),
                  ])}
                  <tr>
                    <th>{t('Bitiş')}</th>
                    {patterns.map((p) => (
                      <td key={p.after}>
                        <b>{p.periods[p.periods.length - 1]?.end ?? ''}</b>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
