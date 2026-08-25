// "How far along is this setup" — the panel that fills the bottom of Kurulum.
//
// The screen used to end halfway down: one list on the left, one capacity table
// on the right, and then several hundred pixels of nothing. What was missing
// was not decoration, it was the ANSWER TO THE QUESTION the screen asks — am I
// done, and if not, what is left?
//
// Nothing here is new information: every number is already on this screen or
// one tab away. It is arranged as the four steps, in order, with the one thing
// each of them is for.

import type { State } from '../../types';
import type { StepId } from '../../toolState';

interface Props {
  state: State;
  step: StepId;
  setStep: (next: StepId) => void;
}

interface Line {
  id: StepId;
  label: string;
  count: number;
  /** What is still missing, in the user's words. '' means this step is done. */
  todo: string;
}

function build(d: State): Line[] {
  const noRoom = d.classes.filter((c) => c.roomId === null).length;
  const withoutLessons = d.classes.filter(
    (c) => !d.lessons.some((l) => l.classId === c.id),
  ).length;
  const idleTeachers = d.teachers.filter(
    (t) => !d.lessons.some((l) => l.teacherId === t.id),
  ).length;

  return [
    {
      id: 'rooms',
      label: 'Derslikler',
      count: d.rooms.length,
      todo: d.rooms.length === 0 ? 'Henüz derslik yok' : '',
    },
    {
      id: 'teachers',
      label: 'Öğretmenler',
      count: d.teachers.length,
      todo:
        d.teachers.length === 0
          ? 'Henüz öğretmen yok'
          : idleTeachers > 0
            ? `${idleTeachers} öğretmenin dersi yok`
            : '',
    },
    {
      id: 'classes',
      label: 'Sınıflar',
      count: d.classes.length,
      todo:
        d.classes.length === 0
          ? 'Henüz sınıf yok'
          : noRoom > 0
            ? `${noRoom} sınıfın dersliği seçilmedi`
            : '',
    },
    {
      id: 'lessons',
      label: 'Dersler',
      count: d.lessons.length,
      todo:
        d.lessons.length === 0
          ? 'Henüz ders yok'
          : withoutLessons > 0
            ? `${withoutLessons} sınıfın dersi yok`
            : '',
    },
  ];
}

export default function Progress({ state, step, setStep }: Props) {
  const lines = build(state);
  const done = lines.filter((l) => l.count > 0 && l.todo === '').length;
  const weekly = state.lessons.reduce((n, l) => n + l.weeklyHours, 0);
  const slots = state.settings.days.length * state.settings.hours.length;

  return (
    <div className="panel">
      <h2>Kurulum durumu</h2>
      <p className="hint">
        Dört adımın <b>{done}</b> tanesi tamam. Bir satıra tıklayarak o adıma
        gidebilirsiniz.
      </p>

      <table className="list">
        <thead>
          <tr>
            <th>Adım</th>
            <th className="num">Kayıt</th>
            <th>Durum</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((l, i) => (
            <tr key={l.id}>
              <td>
                <button
                  className="btn link"
                  aria-current={l.id === step}
                  onClick={() => setStep(l.id)}
                >
                  <span className="step-no">{i + 1}</span>
                  {l.label}
                </button>
              </td>
              <td className="num">{l.count}</td>
              <td>
                {l.count === 0 || l.todo !== '' ? (
                  <span className={`badge ${l.count === 0 ? 'impossible' : 'tight'}`}>
                    {l.todo}
                  </span>
                ) : (
                  <span className="badge ok">Tamam</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* The one number that decides whether any of this can be laid out at
          all, and it belongs at the END of setup: a week is `days x hours` per
          class, and every lesson's weekly hours have to fit inside it. */}
      <p className="hint">
        Haftada sınıf başına <b>{slots}</b> saat var ({state.settings.days.length} gün ×{' '}
        {state.settings.hours.length} ders). Girilen toplam ders yükü{' '}
        <b>{weekly}</b> saat. Gün ve saat sayısı <b>Ayarlar → Okul ve zil</b>'de.
      </p>
    </div>
  );
}
