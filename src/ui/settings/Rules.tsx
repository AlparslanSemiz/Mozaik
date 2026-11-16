// Step: the school-wide rule limits and what each one does when breached.

import { useId, useMemo } from 'react';
import { type RuleLevel, type RuleName, paletteColor } from '../../leaf/model';
import { buildIndex, findViolations, type Violation } from '../../pure/constraints';
import { updateLimits, updateRules } from '../../pure/entities';
import { HelpHead, type PanelProps, T, useT } from '../common';
import { useInspect } from '../program';

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
    hint: 'Okula geldiği gün boşuna gelmesin. Yalnız sorun listesinde uyarır.',
    canBlock: false,
  },
  {
    name: 'maxSameLessonPerDay',
    label: 'Bir sınıf aynı dersten günde en fazla',
    hint: 'Aynı sınıfın aynı öğretmenden bir günde göreceği saat.',
    canBlock: true,
  },
  {
    name: 'maxGapsTeacher',
    label: 'Öğretmenin dersleri arasında en fazla boşluk',
    hint: 'Bir günde ilk ve son ders arasında kaç saat boş kalabilir. 0 hiç boşluk olmasın demektir.',
    canBlock: false,
  },
  {
    name: 'maxGapsClass',
    label: 'Sınıfın dersleri arasında en fazla boşluk',
    hint: 'Aynısı sınıf için. Yalnız sorun listesinde uyarır.',
    canBlock: false,
  },
];

const LEVEL_LABEL: Record<RuleLevel, string> = {
  off: 'Kapalı',
  warn: 'Tercih',
  block: 'Kesin',
};

export default function Rules({ state, change }: PanelProps) {
  const t = useT();
  const inspect = useInspect();
  // What the numbers on the left ALREADY cost, on the timetable as it stands.
  // Kontrol shows the same list one tab away; the point of showing it here is
  // that "Engelle" and "Uyar" mean nothing until you see what they catch.
  const violations = useMemo(() => findViolations(state, buildIndex(state)), [state]);

  // How many breaches each rule is responsible for RIGHT NOW. Grouped on the
  // `rule` code and never on the sentence: the message names a teacher and a
  // day, so counting sentences counts days (pitfall 22).
  const custom = state.teachers.filter(
    (t) =>
      t.limits.maxConsecutive !== null ||
      t.limits.maxPerDay !== null ||
      t.limits.minPerDay !== null,
  );
  // The daily rule is the one with three layers, and the middle one is new.
  const customClasses = state.classes.filter((c) => c.maxSameLessonPerDay !== null);

  const idBase = useId();

  const perRule = useMemo(() => {
    const n: Partial<Record<Violation['rule'], number>> = {};
    for (const v of violations) n[v.rule] = (n[v.rule] ?? 0) + 1;
    return n;
  }, [violations]);

  return (
    <div className="cols">
      <div>
        <div className="panel">
          {/* What each rule means is behind the "?" since 2026-11-16: six
              rows each carried a sentence under the name (Sadeleşme). */}
          <HelpHead topic="Kurallar">
            <ul>
              {RULE_ROWS.map((rule) => (
                <li key={rule.name}>
                  <strong>{t(rule.label)}.</strong> {t(rule.hint)}
                </li>
              ))}
            </ul>
          </HelpHead>
          <p className="hint">
            <T k="Bu sayılar **bütün okul** için; **0** yazmak “sınır yok” demektir." />
          </p>
          <table className="list">
            <thead>
              <tr>
                <th>{t('Kural')}</th>
                <th className="w-col-lg">{t('Saat')}</th>
                <th className="w-col-lg">{t('Ne yapsın')}</th>
                <th className="w-col-md">{t('Şu an')}</th>
              </tr>
            </thead>
            <tbody>
              {RULE_ROWS.map((rule) => (
                <tr key={rule.name}>
                  <td>
                    {/* The number box has no label of its own: the rule's name
                        in this cell IS its label, so the box points here. */}
                    <span id={`${idBase}-${rule.name}`}>{t(rule.label)}</span>
                  </td>
                  <td>
                    <input
                      type="number"
                      aria-labelledby={`${idBase}-${rule.name}`}
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
                      aria-label={t('{kural} kuralı', { kural: t(rule.label) })}
                      onChange={(e) =>
                        change((d) => updateRules(d, { [rule.name]: e.target.value as RuleLevel }))
                      }
                    >
                      <option value="off">{t(LEVEL_LABEL.off)}</option>
                      <option value="warn">{t(LEVEL_LABEL.warn)}</option>
                      {rule.canBlock && <option value="block">{t(LEVEL_LABEL.block)}</option>}
                    </select>
                  </td>
                  {/* What this number costs on the timetable as it stands. A
                      limit is an abstraction until you can see what it catches
                      — and this is the screen where you pick it. */}
                  <td>
                    {state.settings.rules[rule.name] === 'off' ? (
                      <span className="hint">{t('Kapalı')}</span>
                    ) : (perRule[rule.name] ?? 0) === 0 ? (
                      <span className="badge ok">{t('Uyan yok')}</span>
                    ) : (
                      <span
                        className={`badge ${
                          state.settings.rules[rule.name] === 'block' ? 'impossible' : 'tight'
                        }`}
                      >
                        {perRule[rule.name]} yer
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* The other half of "two-layer limits": these numbers are the school's
            DEFAULT, and a teacher's own box overrides it. Which teachers have
            done that used to be visible only by scrolling the Kurulum table
            and looking for filled-in boxes. */}
        <div className="panel">
          <HelpHead topic={t('Kendi sınırı olan öğretmenler ({n})', { n: custom.length })}>
            <p>
              <T k="Bir öğretmene özel sayı: **Okul → Öğretmenler**." />
            </p>
          </HelpHead>
          {custom.length === 0 ? (
            <p className="hint">
              <T k="Bir öğretmene özel sayı: **Okul → Öğretmenler**." />
            </p>
          ) : (
            <table className="list">
              <thead>
                <tr>
                  <th>{t('Öğretmen')}</th>
                  <th className="num">{t('Art arda')}</th>
                  <th className="num">{t('Günde ↑')}</th>
                  <th className="num">{t('Günde ↓')}</th>
                </tr>
              </thead>
              <tbody>
                {custom.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <span
                        className="color-dot"
                        style={{ background: paletteColor(t.color) }}
                        aria-hidden="true"
                      />
                      <button
                        type="button"
                        className="person-open"
                        onClick={() => inspect('teacher', t.id)}
                      >
                        {t.name} ({t.short})
                      </button>
                    </td>
                    <td className="num">{t.limits.maxConsecutive ?? '–'}</td>
                    <td className="num">{t.limits.maxPerDay ?? '–'}</td>
                    <td className="num">{t.limits.minPerDay ?? '–'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* The class layer of the same rule. Which classes carry their own
            number was visible only by scrolling Okul → Sınıflar and looking for
            a filled-in box — the same gap the teacher panel above was written
            to close. */}
        <div className="panel">
          <HelpHead topic={t('Kendi sınırı olan sınıflar ({n})', { n: customClasses.length })}>
            <p>
              <T k="Bir sınıfa özel sayı: **Okul → Sınıflar**." />
            </p>
          </HelpHead>
          {customClasses.length === 0 ? (
            <p className="hint">
              <T k="Bir sınıfa özel sayı: **Okul → Sınıflar**." />
            </p>
          ) : (
            <table className="list">
              <thead>
                <tr>
                  <th>{t('Sınıf')}</th>
                  <th className="num">{t('Günde aynı ders ↑')}</th>
                </tr>
              </thead>
              <tbody>
                {customClasses.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <span
                        className="color-dot"
                        style={{ background: paletteColor(c.color) }}
                        aria-hidden="true"
                      />
                      <button
                        type="button"
                        className="person-open"
                        onClick={() => inspect('class', c.id)}
                      >
                        {c.name}
                      </button>
                    </td>
                    <td className="num">{c.maxSameLessonPerDay}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <aside>
        <div className="panel">
          <h2>{t('Şu anki ihlaller ({n})', { n: violations.length })}</h2>
          <p className="hint">
            <T k="**Tercih** yalnız sayar, **Kesin** dersi o hücreye hiç bıraktırmaz." />
          </p>
          {/* A row per breach and no ceiling on how many there can be, so this
              is the box in this panel that gives ground: in a right rail the
              list scrolls and the sentence above it stays where it was. */}
          {violations.length === 0 ? (
            <div className="ok-box">
              {t('Dizilmiş program girdiğiniz sınırların hiçbirini aşmıyor.')}
            </div>
          ) : (
            <div className="stat-scroll">
              <table className="stat">
                <thead>
                  <tr>
                    <th className="w-col-lg">{t('Durum')}</th>
                    <th>{t('Açıklama')}</th>
                  </tr>
                </thead>
                <tbody>
                  {violations.map((v) => (
                    <tr key={v.key}>
                      <td>
                        <span className={`badge ${v.level === 'block' ? 'impossible' : 'tight'}`}>
                          {v.level === 'block' ? t('Kesin') : t('Tercih')}
                        </span>
                      </td>
                      <td>{v.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
