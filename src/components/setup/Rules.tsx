// Step: the school-wide rule limits and what each one does when breached.

import type { RuleLevel, RuleName } from '../../types';
import { updateLimits, updateRules } from '../../entities';
import type { SetupProps } from './props';

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

export default function Rules({ state, change }: SetupProps) {
  return (
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
  );
}
