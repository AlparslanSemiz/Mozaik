// "How far along is this setup" — the panel that fills the bottom of Kurulum.
//
// The screen used to end halfway down: one list on the left, one capacity table
// on the right, and then several hundred pixels of nothing. What was missing
// was not decoration, it was the ANSWER TO THE QUESTION the screen asks — am I
// done, and if not, what is left?
//
// Nothing here is new information: every number is already on this screen or
// one tab away. It is arranged as the three steps, in order, with the one thing
// each of them is for — and then the door to Dersler, which used to be step
// four and is a tab of its own now.

import type { State } from '../../types';
import type { StepId } from '../../toolState';
import { STEPS, lessonIcon } from '../steps';

interface Props {
  state: State;
  step: StepId;
  setStep: (next: StepId) => void;
  goLessons: () => void;
}

/**
 * What is still missing at each step, in the user's words. '' means done.
 *
 * Only the SENTENCES are here; the four steps' identity, label, count and
 * symbol come from `components/steps.tsx`, which the ribbon and the Setup shell
 * read too.
 */
function todos(d: State): Record<StepId, string> {
  const noRoom = d.classes.filter((c) => c.roomId === null).length;
  const idleTeachers = d.teachers.filter(
    (t) => !d.lessons.some((l) => l.teacherId === t.id),
  ).length;

  return {
    rooms: d.rooms.length === 0 ? 'Henüz derslik yok' : '',
    teachers:
      d.teachers.length === 0
        ? 'Henüz öğretmen yok'
        : idleTeachers > 0
          ? `${idleTeachers} öğretmenin dersi yok`
          : '',
    classes:
      d.classes.length === 0
        ? 'Henüz sınıf yok'
        : noRoom > 0
          ? `${noRoom} sınıfın dersliği seçilmedi`
          : '',
  };
}

/**
 * The one line about lessons, now that they are not a step here.
 *
 * It stays on this screen because this is where "am I done?" is asked, and
 * "four classes have no lessons" is the answer nobody would go looking for. It
 * is a POINTER, not a step: the row it used to be could only be reached
 * through Kurulum, which is exactly what moving it out was for.
 */
function lessonTodo(d: State): string {
  const withoutLessons = d.classes.filter(
    (c) => !d.lessons.some((l) => l.classId === c.id),
  ).length;
  if (d.lessons.length === 0) return 'Henüz ders yok';
  return withoutLessons > 0 ? `${withoutLessons} sınıfın dersi yok` : '';
}

export default function Progress({ state, step, setStep, goLessons }: Props) {
  const todo = todos(state);
  const lessons = lessonTodo(state);
  const lines = STEPS.map((s) => ({ ...s, count: s.count(state), todo: todo[s.id] }));
  const done = lines.filter((l) => l.count > 0 && l.todo === '').length;
  const weekly = state.lessons.reduce((n, l) => n + l.weeklyHours, 0);
  const slots = state.settings.days.length * state.settings.hours.length;

  return (
    <div className="panel">
      <h2>Kurulum durumu</h2>
      <p className="hint">
        Üç adımın <b>{done}</b> tanesi tamam. Bir satıra tıklayarak o adıma
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
                  <span className="step-icon" aria-hidden="true">
                    {l.icon}
                  </span>
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

      {/* Step four's row, as a door rather than a step. Dersler is a tab now
          ("ders en önemli kısım"), so what is left here is the count and the
          one thing that is still missing. */}
      <div className="form-row spaced lesson-jump">
        <span>
          <b>{state.lessons.length}</b> ders
          {lessons !== '' && (
            <>
              {' · '}
              <span className={`badge ${state.lessons.length === 0 ? 'impossible' : 'tight'}`}>
                {lessons}
              </span>
            </>
          )}
        </span>
        <button className="btn" onClick={goLessons}>
          <span className="step-icon" aria-hidden="true">
            {lessonIcon}
          </span>
          Dersler sekmesi
        </button>
      </div>

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
