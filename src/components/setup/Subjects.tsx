// Step: subject abbreviations.
//
// "Matematik" overflows a 34px grid cell and does not fit a ~21mm printed
// column; "Mat" does. The boxes come FILLED with the default rather than
// showing it as a faint placeholder — a value you can read is a value you can
// correct. Only what is actually changed is stored (setSubjectShort).

import { useState } from 'react';
import {
  DEFAULT_SUBJECT_SHORTS,
  defaultSubjectShort,
  setSubjectShort,
  subjectKey,
  subjectShort,
  usedSubjects,
} from '../../entities';
import type { SetupProps } from './props';

export default function Subjects({ state, change }: SetupProps) {
  const [showAll, setShowAll] = useState(false);

  const used = usedSubjects(state);
  const usedKeys = new Set(used.map(subjectKey));
  const spare = Object.keys(DEFAULT_SUBJECT_SHORTS).filter((s) => !usedKeys.has(subjectKey(s)));

  function row(subject: string) {
    const current = subjectShort(state.settings, subject);
    const isDefault = current === defaultSubjectShort(subject);
    return (
      <tr key={subjectKey(subject)}>
        <td>{subject}</td>
        <td>
          <input
            type="text"
            className="text-sm"
            aria-label={`${subject} kısaltması`}
            // defaultValue + a key that changes with the value: typing must not
            // re-render on every keystroke (docs/PLAN.md pitfall 3).
            key={current}
            defaultValue={current}
            onBlur={(e) => change((d) => setSubjectShort(d, subject, e.target.value))}
          />
        </td>
        <td className="hint">{isDefault ? 'varsayılan' : `varsayılanı: ${defaultSubjectShort(subject)}`}</td>
      </tr>
    );
  }

  return (
    <div className="panel">
      <h2>Branş kısaltmaları</h2>
      <p className="hint">
        Izgarada ve yazdırılan sayfada branşın <b>kısaltması</b> yazar — tam adı
        hücreye sığmaz. Kutular hazır kısaltmayla dolu gelir; beğenmediğinizi
        değiştirin. Yalnızca <b>değiştirdikleriniz</b> saklanır.
      </p>

      {used.length === 0 ? (
        <div className="empty-screen">
          <strong>Henüz branş yok.</strong>
          Branşlar öğretmenlerden gelir: <b>Öğretmenler</b> adımından öğretmen ekleyin.
          Aşağıdaki hazır listeden şimdiden düzeltme yapabilirsiniz.
        </div>
      ) : (
        <table className="list narrow">
          <thead>
            <tr>
              <th>Branş</th>
              <th style={{ width: 110 }}>Kısaltma</th>
              <th style={{ width: 150 }} />
            </tr>
          </thead>
          <tbody>{used.map(row)}</tbody>
        </table>
      )}

      <h3>
        <button className="btn" aria-expanded={showAll} onClick={() => setShowAll(!showAll)}>
          {showAll ? '▾' : '▸'} Hazır kısaltmalar ({spare.length})
        </button>
      </h3>
      {showAll && (
        <>
          <p className="hint">
            Henüz öğretmeni olmayan branşlar. Kısaltmasını şimdiden düzeltebilirsiniz.
          </p>
          <table className="list narrow">
            <thead>
              <tr>
                <th>Branş</th>
                <th style={{ width: 110 }}>Kısaltma</th>
                <th style={{ width: 150 }} />
              </tr>
            </thead>
            <tbody>{spare.map(row)}</tbody>
          </table>
        </>
      )}
    </div>
  );
}
