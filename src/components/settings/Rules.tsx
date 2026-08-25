// Step: the school-wide rule limits and what each one does when breached.

import { useMemo } from 'react';
import type { RuleLevel, RuleName } from '../../types';
import { buildIndex } from '../../constraints';
import { updateLimits, updateRules } from '../../entities';
import { findViolations } from '../../rules';
import type { PanelProps } from '../props';

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

const LEVEL_LABEL: Record<RuleLevel, string> = {
  off: 'Kapalı',
  warn: 'Uyar',
  block: 'Engelle',
};

export default function Rules({ state, change }: PanelProps) {
  // What the numbers on the left ALREADY cost, on the timetable as it stands.
  // Kontrol shows the same list one tab away; the point of showing it here is
  // that "Engelle" and "Uyar" mean nothing until you see what they catch.
  const violations = useMemo(() => findViolations(state, buildIndex(state)), [state]);

  return (
    <div className="cols">
      <div>
        <div className="panel">
          <h2>Kurallar</h2>
          <p className="hint">
            Buradaki sayılar <b>bütün okul</b> için geçerlidir. Tek bir öğretmen için farklı
            bir sayı gerekiyorsa aşağıdaki öğretmen tablosundaki kutuya yazın; boş bıraktığınız
            kutu buradaki sayıyı kullanır. <b>0</b> yazmak “sınır yok” demektir.
          </p>
          <table className="list">
            <thead>
              <tr>
                <th>Kural</th>
                <th className="w-col-lg">Saat</th>
                <th className="w-col-lg">Ne yapsın</th>
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
                      className="num"
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
      </div>

      <aside>
        <div className="panel">
          <h2>Şu anki ihlaller ({violations.length})</h2>
          <p className="hint">
            Soldaki sayıları değiştirdikçe bu liste anında değişir. <b>Uyar</b>{' '}
            yerleştirmeyi durdurmaz, yalnızca sayar; <b>Engelle</b> dersi o hücreye hiç
            bıraktırmaz. Aynı liste <b>Kontrol</b> sekmesinde de var.
          </p>
          {violations.length === 0 ? (
            <div className="ok-box">
              Dizilmiş program girdiğiniz sınırların hiçbirini aşmıyor.
            </div>
          ) : (
            <table className="stat">
              <thead>
                <tr>
                  <th className="w-col-lg">Durum</th>
                  <th>Açıklama</th>
                </tr>
              </thead>
              <tbody>
                {violations.map((v) => (
                  <tr key={v.key}>
                    <td>
                      <span className={`badge ${v.level === 'block' ? 'impossible' : 'tight'}`}>
                        {v.level === 'block' ? 'Kural dışı' : 'Uyarı'}
                      </span>
                    </td>
                    <td>{v.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </aside>
    </div>
  );
}
