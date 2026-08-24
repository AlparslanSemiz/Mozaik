// Setup: day/hour layout, rooms, teachers, classes, lessons.
//
// Text boxes use defaultValue + onBlur. Updating top level state on every
// keystroke with onChange loses focus (docs/PLAN.md pitfall 3).

import { useMemo, useState } from 'react';
import { dayPeriods } from '../bell';
import type { ParseResult } from '../import';
import { parseLessons, parseRooms, parseTeachers, parseClasses } from '../import';
import { sampleState } from '../sample';
import type { Day, RuleLevel, RuleName, State } from '../types';
import { COLOR_COUNT } from '../types';
import {
  WEEK,
  makeDay,
  setTeacherLimit,
  updateBell,
  updateLimits,
  updateRules,
  addLesson,
  addRoom,
  addTeacher,
  addClass,
  deleteLesson,
  deleteRoom,
  deleteTeacher,
  deleteClass,
  hourNames,
  updateLesson,
  updateRoom,
  updateSettings,
  updateTeacher,
  updateClass,
} from '../entities';

/** The four limit boxes, in the order they are shown. */
const RULE_ROWS: Array<{ name: RuleName; label: string; hint: string; canBlock: boolean }> = [
  {
    name: 'maxConsecutive',
    label: 'Öğretmen art arda en fazla',
    hint: 'Bir öğretmen arka arkaya kaç saat derse girebilir.',
    canBlock: true,
  },
  {
    name: 'maxPerDay',
    label: 'Öğretmen günde en fazla',
    hint: 'Bir öğretmenin bir gündeki toplam ders saati.',
    canBlock: true,
  },
  {
    name: 'minPerDay',
    label: 'Öğretmen günde en az',
    hint: 'Okula geldiği gün boşuna gelmesin. Yerleştirmeyi engelleyemez, sadece Kontrol sekmesinde uyarır.',
    canBlock: false,
  },
  {
    name: 'maxSameLessonPerDay',
    label: 'Bir sınıf aynı dersten günde en fazla',
    hint: 'Aynı sınıfın aynı öğretmenden bir günde göreceği saat.',
    canBlock: true,
  },
];

/**
 * One limit box. Empty means "use the school-wide default", and the default is
 * shown as the placeholder so nobody has to remember what it was.
 */
function LimitBox({
  value,
  fallback,
  onSet,
  title,
}: {
  value: number | null;
  fallback: number;
  onSet: (next: number | null) => void;
  title: string;
}) {
  return (
    <input
      type="number"
      min={0}
      max={16}
      style={{ width: 64 }}
      title={title}
      placeholder={fallback > 0 ? String(fallback) : '—'}
      defaultValue={value ?? ''}
      onBlur={(e) => {
        const text = e.target.value.trim();
        const next = text === '' ? null : Math.max(0, Number(text) || 0);
        onSet(next === null || next > 0 ? next : null);
      }}
    />
  );
}

const LEVEL_LABEL: Record<RuleLevel, string> = {
  off: 'Kapalı',
  warn: 'Uyar',
  block: 'Engelle',
};

interface Props {
  state: State;
  change: (apply: (d: State) => State) => void;
}

/** The Excel paste box: preview, then add. It never adds directly. */
function Paste<T>({
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

export default function Setup({ state, change }: Props) {
  const [newRoom, setNewRoom] = useState('');
  const [newTeacher, setNewTeacher] = useState({ name: '', short: '', subject: '' });
  const [newClass, setNewClass] = useState({ name: '', roomId: '' });
  const [newLesson, setNewLesson] = useState({
    classId: '',
    teacherId: '',
    hours: '4',
    blockSize: '1',
  });

  const dayCount = state.settings.days.length;
  const hourCount = state.settings.hours.length;

  function setHours(count: number, names?: string) {
    const baseHours = Math.min(16, Math.max(1, count));
    const hourList =
      names !== undefined && names.trim() !== ''
        ? names
            .split(',')
            .map((x) => x.trim())
            .filter((x) => x !== '')
        : hourNames(baseHours);
    change((d) => updateSettings(d, { hours: hourList }));
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

  const emptyProject = state.teachers.length === 0 && state.classes.length === 0;

  return (
    <div className="main">
      {emptyProject && (
        <div className="panel">
          <h2>Başlarken</h2>
          <p className="hint">
            Aşağıdaki bölümleri sırayla doldurun: önce <b>derslikler</b>, sonra{' '}
            <b>öğretmenler</b> ve <b>sınıflar</b>, en son her sınıfın <b>dersleri</b>.
            Elinizde Excel listesi varsa her bölümdeki “Excel'den yapıştır” düğmesini
            kullanın — tek tek girmekten çok daha hızlı.
          </p>
          <button
            className="btn"
            onClick={() => {
              if (
                window.confirm(
                  'Aracı denemek için örnek bir okul verisi yüklenecek. Devam edilsin mi?',
                )
              ) {
                change(() => sampleState());
              }
            }}
          >
            Örnek veriyle doldur (25 öğretmen, 20 sınıf)
          </button>
          <p className="hint">
            Ne yaptığını görmek için. Kendi verinizi girmeden önce üstteki{' '}
            <b>Sıfırla</b> ile temizleyin.
          </p>
        </div>
      )}

      {/* ------------------------------------------------------------ week */}
      <div className="panel">
        <h2>Okul ve günler</h2>
        <div className="form-row">
          <label style={{ flex: 1, minWidth: 260 }}>
            Okul adı (yazdırılan sayfaların başlığında görünür){' '}
            <input
              type="text"
              style={{ width: '100%' }}
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

        <table className="list" style={{ maxWidth: 520 }}>
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

      {/* ------------------------------------------------------ bell times */}
      <div className="panel">
        <h2>Ders saatleri</h2>
        <p className="hint">
          Gün kaçta başlıyor, bir ders ve bir teneffüs kaç dakika. Saatler bunlardan
          hesaplanır — tek tek girmeye gerek yok. Aşağıdaki tablo anında güncellenir.
        </p>
        <div className="form-row">
          <label>
            Günlük ders sayısı{' '}
            <input
              type="number"
              min={1}
              max={16}
              defaultValue={hourCount}
              style={{ width: 70 }}
              onBlur={(e) => setHours(Number(e.target.value))}
            />
          </label>
          <label>
            İlk ders başlangıcı{' '}
            <input
              type="time"
              defaultValue={state.settings.bell.start}
              style={{ width: 120 }}
              onBlur={(e) => change((d) => updateBell(d, { start: e.target.value }))}
            />
          </label>
          <label>
            Ders (dk){' '}
            <input
              type="number"
              min={5}
              max={120}
              defaultValue={state.settings.bell.lessonMinutes}
              style={{ width: 70 }}
              onBlur={(e) => change((d) => updateBell(d, { lessonMinutes: Number(e.target.value) }))}
            />
          </label>
          <label>
            Teneffüs (dk){' '}
            <input
              type="number"
              min={0}
              max={60}
              defaultValue={state.settings.bell.breakMinutes}
              style={{ width: 70 }}
              onBlur={(e) => change((d) => updateBell(d, { breakMinutes: Number(e.target.value) }))}
            />
          </label>
          <label>
            Öğle arası (dk){' '}
            <input
              type="number"
              min={0}
              max={180}
              defaultValue={state.settings.bell.longBreakMinutes}
              style={{ width: 70 }}
              onBlur={(e) =>
                change((d) => updateBell(d, { longBreakMinutes: Number(e.target.value) }))
              }
            />
          </label>
        </div>

        {patterns.length > 0 && (
          <table className="list bell-preview" style={{ maxWidth: 640 }}>
            <thead>
              <tr>
                <th style={{ width: 60 }}>Ders</th>
                {patterns.map((p) => (
                  <th key={p.after}>{p.dayNames}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {state.settings.hours.map((label, i) => (
                <tr key={i}>
                  <th>{label}</th>
                  {patterns.map((p) => (
                    <td key={p.after}>
                      {p.periods[i]?.start ?? ''}–{p.periods[i]?.end ?? ''}
                    </td>
                  ))}
                </tr>
              ))}
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

        <div className="form-row" style={{ marginTop: 8 }}>
          <label style={{ flex: 1, minWidth: 260 }}>
            Ders adları (virgülle; boş bırakılırsa 1, 2, 3…){' '}
            <input
              type="text"
              style={{ width: '100%' }}
              defaultValue={state.settings.hours.join(', ')}
              onBlur={(e) => setHours(hourCount, e.target.value)}
              placeholder="1, 2, 3, ..."
            />
          </label>
        </div>
      </div>

      {/* ----------------------------------------------------------- rules */}
      <div className="panel">
        <h2>Kurallar</h2>
        <p className="hint">
          Buradaki sayılar <b>bütün okul</b> için geçerlidir. Tek bir öğretmen için farklı
          bir sayı gerekiyorsa aşağıdaki öğretmen tablosundaki kutuya yazın; boş bıraktığınız
          kutu buradaki sayıyı kullanır. <b>0</b> yazmak “sınır yok” demektir.
        </p>
        <table className="list" style={{ maxWidth: 720 }}>
          <thead>
            <tr>
              <th>Kural</th>
              <th style={{ width: 100 }}>Saat</th>
              <th style={{ width: 130 }}>Ne yapsın</th>
            </tr>
          </thead>
          <tbody>
            {RULE_ROWS.map((rule) => (
              <tr key={rule.name}>
                <td>
                  {rule.label}
                  <br />
                  <span className="hint">{rule.hint}</span>
                </td>
                <td>
                  <input
                    type="number"
                    min={0}
                    max={16}
                    style={{ width: 70 }}
                    defaultValue={state.settings.limits[rule.name]}
                    onBlur={(e) =>
                      change((d) =>
                        updateLimits(d, {
                          [rule.name]: Math.max(0, Number(e.target.value) || 0),
                        }),
                      )
                    }
                  />
                </td>
                <td>
                  <select
                    value={state.settings.rules[rule.name]}
                    aria-label={`${rule.label} kuralı`}
                    onChange={(e) =>
                      change((d) =>
                        updateRules(d, { [rule.name]: e.target.value as RuleLevel }),
                      )
                    }
                  >
                    <option value="off">{LEVEL_LABEL.off}</option>
                    <option value="warn">{LEVEL_LABEL.warn}</option>
                    {rule.canBlock && <option value="block">{LEVEL_LABEL.block}</option>}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ----------------------------------------------------------- room */}
      <div className="panel">
        <h2>Derslikler ({state.rooms.length})</h2>
        <p className="hint">
          Her sınıfın sabit odası. İki sınıf aynı dersliği paylaşıyorsa aynı saate
          konamazlar. Dersliği olmayan sınıflar için bu kontrol yapılmaz.
        </p>
        <div className="form-row">
          <input
            type="text"
            value={newRoom}
            placeholder="Derslik adı, örn. A"
            onChange={(e) => setNewRoom(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newRoom.trim() !== '') {
                change((d) => addRoom(d, newRoom));
                setNewRoom('');
              }
            }}
          />
          <button
            className="btn"
            disabled={newRoom.trim() === ''}
            onClick={() => {
              change((d) => addRoom(d, newRoom));
              setNewRoom('');
            }}
          >
            Ekle
          </button>
          <Paste
            title="Derslikleri yapıştır"
            example="Derslik adı (her satırda bir tane)"
            parse={parseRooms}
            rowText={(x) => x.name}
            onAdd={(rows) => change((d) => rows.reduce((acc, x) => addRoom(acc, x.name), d))}
          />
        </div>

        {state.rooms.length > 0 && (
          <table className="list">
            <thead>
              <tr>
                <th>Ad</th>
                <th style={{ width: 120 }}>Sınıf sayısı</th>
                <th style={{ width: 80 }} />
              </tr>
            </thead>
            <tbody>
              {state.rooms.map((r) => (
                <tr key={r.id}>
                  <td>
                    <input
                      type="text"
                      defaultValue={r.name}
                      onBlur={(e) => change((d) => updateRoom(d, r.id, e.target.value))}
                    />
                  </td>
                  <td>{state.classes.filter((c) => c.roomId === r.id).length}</td>
                  <td>
                    <button
                      className="btn danger"
                      onClick={() => change((d) => deleteRoom(d, r.id))}
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* -------------------------------------------------------- teacher */}
      <div className="panel">
        <h2>Öğretmenler ({state.teachers.length})</h2>
        <p className="hint">
          Her öğretmenin tek branşı vardır. Kısaltma ızgarada satır başlığı olarak
          görünür, kısa tutun (örn. MÇ). Renk otomatik atanır. Sağdaki üç kutu bu
          öğretmene özel sınırdır; <b>boş bırakılırsa Kurallar bölümündeki sayı</b>{' '}
          geçerli olur.
        </p>
        <div className="form-row">
          <input
            type="text"
            placeholder="Ad Soyad"
            value={newTeacher.name}
            onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Kısaltma"
            style={{ width: 90 }}
            value={newTeacher.short}
            onChange={(e) => setNewTeacher({ ...newTeacher, short: e.target.value })}
          />
          <input
            type="text"
            placeholder="Branş"
            value={newTeacher.subject}
            onChange={(e) => setNewTeacher({ ...newTeacher, subject: e.target.value })}
          />
          <button
            className="btn"
            disabled={newTeacher.name.trim() === ''}
            onClick={() => {
              change((d) => addTeacher(d, newTeacher));
              setNewTeacher({ name: '', short: '', subject: '' });
            }}
          >
            Ekle
          </button>
          <Paste
            title="Öğretmenleri yapıştır"
            example="Ad Soyad · Kısaltma · Branş"
            parse={parseTeachers}
            rowText={(x) => `${x.name} (${x.short}) — ${x.subject}`}
            onAdd={(rows) => change((d) => rows.reduce((acc, x) => addTeacher(acc, x), d))}
          />
        </div>

        {state.teachers.length > 0 && (
          <table className="list">
            <thead>
              <tr>
                <th style={{ width: 44 }}>Renk</th>
                <th>Ad</th>
                <th style={{ width: 110 }}>Kısaltma</th>
                <th>Branş</th>
                <th style={{ width: 70 }} title="Art arda en fazla kaç saat">
                  Art arda
                </th>
                <th style={{ width: 70 }} title="Bir günde en fazla kaç saat">
                  Günde ↑
                </th>
                <th style={{ width: 70 }} title="Geldiği gün en az kaç saat">
                  Günde ↓
                </th>
                <th style={{ width: 90 }}>Ders saati</th>
                <th style={{ width: 80 }} />
              </tr>
            </thead>
            <tbody>
              {state.teachers.map((t) => (
                <tr key={t.id}>
                  <td>
                    <select
                      value={t.color}
                      onChange={(e) =>
                        change((d) => updateTeacher(d, t.id, { color: Number(e.target.value) }))
                      }
                      style={{ background: `var(--color-${t.color})`, width: 44 }}
                      title="Renk"
                    >
                      {Array.from({ length: COLOR_COUNT }, (_, i) => (
                        <option key={i} value={i}>
                          {i + 1}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="text"
                      defaultValue={t.name}
                      onBlur={(e) =>
                        change((d) => updateTeacher(d, t.id, { name: e.target.value.trim() }))
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      style={{ width: 90 }}
                      defaultValue={t.short}
                      onBlur={(e) =>
                        change((d) => updateTeacher(d, t.id, { short: e.target.value.trim() }))
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      defaultValue={t.subject}
                      onBlur={(e) =>
                        change((d) => updateTeacher(d, t.id, { subject: e.target.value.trim() }))
                      }
                    />
                  </td>
                  <td>
                    <LimitBox
                      value={t.limits.maxConsecutive}
                      fallback={state.settings.limits.maxConsecutive}
                      title={`${t.short} art arda en fazla kaç saat`}
                      onSet={(v) => change((d) => setTeacherLimit(d, t.id, 'maxConsecutive', v))}
                    />
                  </td>
                  <td>
                    <LimitBox
                      value={t.limits.maxPerDay}
                      fallback={state.settings.limits.maxPerDay}
                      title={`${t.short} günde en fazla kaç saat`}
                      onSet={(v) => change((d) => setTeacherLimit(d, t.id, 'maxPerDay', v))}
                    />
                  </td>
                  <td>
                    <LimitBox
                      value={t.limits.minPerDay}
                      fallback={state.settings.limits.minPerDay}
                      title={`${t.short} geldiği gün en az kaç saat`}
                      onSet={(v) => change((d) => setTeacherLimit(d, t.id, 'minPerDay', v))}
                    />
                  </td>
                  <td>
                    {state.lessons
                      .filter((x) => x.teacherId === t.id)
                      .reduce((sum, x) => sum + x.weeklyHours, 0)}
                  </td>
                  <td>
                    <button
                      className="btn danger"
                      onClick={() => {
                        const n = state.lessons.filter((x) => x.teacherId === t.id).length;
                        if (
                          n > 0 &&
                          !window.confirm(
                            `${t.name} silinince ${n} dersi ve programdaki yerleşimleri de silinecek. Devam edilsin mi?`,
                          )
                        ) {
                          return;
                        }
                        change((d) => deleteTeacher(d, t.id));
                      }}
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ---------------------------------------------------------- class */}
      <div className="panel">
        <h2>Sınıflar ({state.classes.length})</h2>
        <div className="form-row">
          <input
            type="text"
            placeholder="Sınıf adı, örn. 510"
            value={newClass.name}
            onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
          />
          <select
            value={newClass.roomId}
            onChange={(e) => setNewClass({ ...newClass, roomId: e.target.value })}
          >
            <option value="">Derslik yok</option>
            {state.rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          <button
            className="btn"
            disabled={newClass.name.trim() === ''}
            onClick={() => {
              change((d) => addClass(d, newClass.name, newClass.roomId || null));
              setNewClass({ name: '', roomId: newClass.roomId });
            }}
          >
            Ekle
          </button>
          <Paste
            title="Sınıfları yapıştır"
            example="Sınıf adı · Derslik adı"
            parse={parseClasses}
            rowText={(x) => `${x.name}${x.roomName ? ` → ${x.roomName} dersliği` : ''}`}
            onAdd={(rows) =>
              change((d) =>
                rows.reduce((acc, x) => {
                  const room = acc.rooms.find(
                    (r) => r.name.toLocaleLowerCase('tr') === x.roomName.toLocaleLowerCase('tr'),
                  );
                  // An unknown room name is created silently; otherwise the class
                  // would end up roomless and the clash check could not run.
                  if (x.roomName !== '' && room === undefined) {
                    const withRoom = addRoom(acc, x.roomName);
                    const created = withRoom.rooms[withRoom.rooms.length - 1];
                    return addClass(withRoom, x.name, created?.id ?? null);
                  }
                  return addClass(acc, x.name, room?.id ?? null);
                }, d),
              )
            }
          />
        </div>

        {state.classes.length > 0 && (
          <table className="list">
            <thead>
              <tr>
                <th>Ad</th>
                <th style={{ width: 160 }}>Derslik</th>
                <th style={{ width: 90 }}>Ders saati</th>
                <th style={{ width: 80 }} />
              </tr>
            </thead>
            <tbody>
              {state.classes.map((c) => (
                <tr key={c.id}>
                  <td>
                    <input
                      type="text"
                      defaultValue={c.name}
                      onBlur={(e) =>
                        change((d) => updateClass(d, c.id, { name: e.target.value.trim() }))
                      }
                    />
                  </td>
                  <td>
                    <select
                      value={c.roomId ?? ''}
                      onChange={(e) =>
                        change((d) => updateClass(d, c.id, { roomId: e.target.value || null }))
                      }
                    >
                      <option value="">Derslik yok</option>
                      {state.rooms.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    {state.lessons
                      .filter((x) => x.classId === c.id)
                      .reduce((sum, x) => sum + x.weeklyHours, 0)}
                    {' / '}
                    {dayCount * hourCount}
                  </td>
                  <td>
                    <button
                      className="btn danger"
                      onClick={() => {
                        const n = state.lessons.filter((x) => x.classId === c.id).length;
                        if (
                          n > 0 &&
                          !window.confirm(
                            `${c.name} sınıfı silinince ${n} dersi ve programdaki yerleşimleri de silinecek. Devam edilsin mi?`,
                          )
                        ) {
                          return;
                        }
                        change((d) => deleteClass(d, c.id));
                      }}
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* --------------------------------------------------------- lesson */}
      <div className="panel">
        <h2>Dersler ({state.lessons.length})</h2>
        <p className="hint">
          Bir ders = bir sınıfın, bir öğretmenden aldığı haftalık saat. <b>Blok</b>,
          o dersin arka arkaya kaç saat işleneceğidir (1, 2 veya 3). <b>Günde ↑</b> bu
          dersin bir günde en fazla kaç saat olabileceğidir; boşsa Kurallar bölümündeki
          sayı geçerli olur.
        </p>

        {(state.classes.length === 0 || state.teachers.length === 0) && (
          <div className="warn-box">
            Ders eklemek için önce en az bir öğretmen ve bir sınıf girin.
          </div>
        )}

        <div className="form-row">
          <select
            value={newLesson.classId}
            onChange={(e) => setNewLesson({ ...newLesson, classId: e.target.value })}
          >
            <option value="">Sınıf seçin</option>
            {state.classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={newLesson.teacherId}
            onChange={(e) => setNewLesson({ ...newLesson, teacherId: e.target.value })}
          >
            <option value="">Öğretmen seçin</option>
            {state.teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.short} — {t.subject}
              </option>
            ))}
          </select>
          <label>
            Haftalık saat{' '}
            <input
              type="number"
              min={1}
              max={40}
              style={{ width: 70 }}
              value={newLesson.hours}
              onChange={(e) => setNewLesson({ ...newLesson, hours: e.target.value })}
            />
          </label>
          <label>
            Blok{' '}
            <select
              value={newLesson.blockSize}
              onChange={(e) => setNewLesson({ ...newLesson, blockSize: e.target.value })}
            >
              <option value="1">1 saat</option>
              <option value="2">2 saat</option>
              <option value="3">3 saat</option>
            </select>
          </label>
          <button
            className="btn"
            disabled={newLesson.classId === '' || newLesson.teacherId === ''}
            onClick={() => {
              change((d) =>
                addLesson(d, {
                  classId: newLesson.classId,
                  teacherId: newLesson.teacherId,
                  weeklyHours: Number(newLesson.hours) || 1,
                  blockSize: Number(newLesson.blockSize) || 1,
                }),
              );
              setNewLesson({ ...newLesson, classId: '' });
            }}
          >
            Ekle
          </button>
          <Paste
            title="Dersleri yapıştır"
            example="Sınıf · Öğretmen (ad veya kısaltma) · Haftalık saat · Blok"
            parse={parseLessons}
            rowText={(x) =>
              `${x.className} — ${x.teacher}: ${x.weeklyHours} saat, ${x.blockSize}'li blok`
            }
            onAdd={(rows) =>
              change((d) => {
                let result = d;
                const notFound: string[] = [];
                for (const x of rows) {
                  const group = result.classes.find(
                    (c) => c.name.toLocaleLowerCase('tr') === x.className.toLocaleLowerCase('tr'),
                  );
                  const teacher = result.teachers.find(
                    (t) =>
                      t.short.toLocaleLowerCase('tr') === x.teacher.toLocaleLowerCase('tr') ||
                      t.name.toLocaleLowerCase('tr') === x.teacher.toLocaleLowerCase('tr'),
                  );
                  if (group === undefined || teacher === undefined) {
                    notFound.push(`${x.className} / ${x.teacher}`);
                    continue;
                  }
                  result = addLesson(result, {
                    classId: group.id,
                    teacherId: teacher.id,
                    weeklyHours: x.weeklyHours,
                    blockSize: x.blockSize,
                  });
                }
                if (notFound.length > 0) {
                  window.alert(
                    `Şu satırlar eklenemedi çünkü sınıf veya öğretmen bulunamadı:\n\n${notFound.join('\n')}\n\nÖnce onları ekleyip tekrar deneyin.`,
                  );
                }
                return result;
              })
            }
          />
        </div>

        {state.lessons.length > 0 && (
          <table className="list">
            <thead>
              <tr>
                <th>Sınıf</th>
                <th>Öğretmen</th>
                <th style={{ width: 110 }}>Haftalık saat</th>
                <th style={{ width: 110 }}>Blok</th>
                <th style={{ width: 90 }} title="Bu ders bir günde en fazla kaç saat">
                  Günde ↑
                </th>
                <th style={{ width: 80 }} />
              </tr>
            </thead>
            <tbody>
              {state.lessons.map((x) => {
                const group = state.classes.find((c) => c.id === x.classId);
                const teacher = state.teachers.find((t) => t.id === x.teacherId);
                return (
                  <tr key={x.id}>
                    <td>{group?.name ?? '?'}</td>
                    <td>
                      <span
                        className="color-dot"
                        style={{ background: `var(--color-${teacher?.color ?? 0})` }}
                      />{' '}
                      {teacher?.short ?? '?'} — {teacher?.subject ?? ''}
                    </td>
                    <td>
                      <input
                        type="number"
                        min={1}
                        max={40}
                        style={{ width: 70 }}
                        defaultValue={x.weeklyHours}
                        onBlur={(e) =>
                          change((d) =>
                            updateLesson(d, x.id, {
                              weeklyHours: Math.max(1, Number(e.target.value) || 1),
                            }),
                          )
                        }
                      />
                    </td>
                    <td>
                      <select
                        value={x.blockSize}
                        onChange={(e) =>
                          change((d) =>
                            updateLesson(d, x.id, { blockSize: Number(e.target.value) }),
                          )
                        }
                        title="Blok değiştirilirse bu dersin programdaki yerleşimleri kalkar"
                      >
                        <option value={1}>1 saat</option>
                        <option value={2}>2 saat</option>
                        <option value={3}>3 saat</option>
                      </select>
                    </td>
                    <td>
                      <LimitBox
                        value={x.maxPerDay}
                        fallback={state.settings.limits.maxSameLessonPerDay}
                        title="Bu ders bir günde en fazla kaç saat"
                        onSet={(v) => change((d) => updateLesson(d, x.id, { maxPerDay: v }))}
                      />
                    </td>
                    <td>
                      <button
                        className="btn danger"
                        onClick={() => change((d) => deleteLesson(d, x.id))}
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
