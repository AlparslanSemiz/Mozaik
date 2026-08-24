// Setup, in numbered steps.
//
// It used to be one 1132-line scroll: everything was on screen at once and
// nothing said in which order to fill it in. The strip below is NOT a locked
// wizard — every step is reachable at any time — it only shows where you are
// and, through the counters, where something is still missing.
//
// Setup now holds ONLY the four lists that describe the school's people and
// rooms. Everything that is a setting — the school's name, its days, the bell,
// the rules, the subject list — moved to the Ayarlar tab, so this screen has
// exactly one kind of thing on it and every step can be counted.

import { useState } from 'react';
import { sampleState } from '../../sample';
import type { State } from '../../types';
import Rooms from './Rooms';
import Teachers from './Teachers';
import Classes from './Classes';
import Lessons from './Lessons';
import type { PanelProps } from '../props';

type StepId = 'rooms' | 'teachers' | 'classes' | 'lessons';

interface Step {
  id: StepId;
  label: string;
  count: (d: State) => number;
  render: (p: PanelProps) => React.ReactElement;
}

const STEPS: Step[] = [
  {
    id: 'rooms',
    label: 'Derslikler',
    count: (d) => d.rooms.length,
    render: (p) => <Rooms {...p} />,
  },
  {
    id: 'teachers',
    label: 'Öğretmenler',
    count: (d) => d.teachers.length,
    render: (p) => <Teachers {...p} />,
  },
  {
    id: 'classes',
    label: 'Sınıflar',
    count: (d) => d.classes.length,
    render: (p) => <Classes {...p} />,
  },
  {
    id: 'lessons',
    label: 'Dersler',
    count: (d) => d.lessons.length,
    render: (p) => <Lessons {...p} />,
  },
];

export default function Setup({ state, change }: PanelProps) {
  const [step, setStep] = useState<StepId>('rooms');

  const index = Math.max(
    0,
    STEPS.findIndex((s) => s.id === step),
  );
  const current = STEPS[index] ?? STEPS[0]!;
  const next = STEPS[index + 1];

  return (
    <div className="main">
      <nav className="steps" aria-label="Kurulum adımları">
        {STEPS.map((s, i) => {
          const count = s.count(state);
          return (
            <button
              key={s.id}
              className="step"
              aria-current={s.id === current.id}
              data-empty={count === 0}
              onClick={() => setStep(s.id)}
            >
              <span className="step-no">{i + 1}</span>
              {s.label}
              <span className="step-count">{count}</span>
            </button>
          );
        })}
      </nav>

      {/* The one screen an empty project lands on, so this is where "what do I
          do first" has to be answered. */}
      {state.teachers.length === 0 && state.classes.length === 0 && (
        <div className="panel">
          <h2>Başlarken</h2>
          <p className="hint">
            Yukarıdaki adımları sırayla doldurun: önce <b>derslikler</b>, sonra{' '}
            <b>öğretmenler</b> ve <b>sınıflar</b>, en son her sınıfın <b>dersleri</b>.
            Elinizde Excel listesi varsa her adımdaki “Excel'den yapıştır” düğmesini
            kullanın — tek tek girmekten çok daha hızlı. Okulun günleri, zil saatleri
            ve kuralları <b>Ayarlar</b> sekmesinde.
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
            Ne yaptığını görmek için. Kendi verinizi girmeden önce{' '}
            <b>Ayarlar → Veri → Her şeyi sil</b> ile temizleyin.
          </p>
        </div>
      )}

      {current.render({ state, change })}

      {next !== undefined && (
        <div className="form-row step-next">
          <button className="btn" onClick={() => setStep(next.id)}>
            Sonraki adım: {next.label} →
          </button>
        </div>
      )}
    </div>
  );
}
