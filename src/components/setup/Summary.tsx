// The right-hand column of the setup screen.
//
// Every one of these numbers already existed — in the Kontrol tab, one whole
// screen away, and only AFTER everything had been typed in. The bottleneck that
// decides whether a week is possible at all (four classes in one room) was the
// thing this tool calls "the most overlooked" in its own code, and it was
// invisible while you were creating those four classes.
//
// Nothing is computed here: `buildCapacity` is the cheap half of the existing
// report (feasibility.ts), split out precisely so it can run beside a text box
// without paying for buildReport's 99 x 72 blocker() calls (pitfall 3).

import { useMemo } from 'react';
import { buildCapacity } from '../../feasibility';
import CapacityRows from '../CapacityRows';
import {
  DEFAULT_SUBJECT_SHORTS,
  addSubject,
  respreadColors,
  genderLabel,
  roomClasses,
  subjectKey,
  subjectOptions,
  subjectTeachers,
} from '../../entities';
import type { StepId } from '../../toolState';

/**
 * The four Okul steps, plus the one screen outside Okul that reads this panel:
 * Dersler → Genel, whose rail would otherwise be empty and whose question is
 * exactly the one the fallback branch answers ("does each class's week fit").
 */
export type SummaryView = StepId | 'lessons';
import type { Gender } from '../../types';

/** The three values, in the order the teacher list offers them. */
const GENDERS: Gender[] = ['', 'k', 'e'];
import type { State } from '../../types';

/**
 * Colour repair, offered where the colours are CHOSEN.
 *
 * This was a panel in Ayarlar → Veri, three tabs from the swatch it repairs.
 * A colour is an identity here, not decoration — the grid row, the pool card
 * and the printed sheet all read it.
 *
 * Drawn only when redistributing would actually CHANGE something, which is
 * exactly `respreadColors`'s own contract: it hands out 0..n-1 in list order,
 * so if that is already what the list wears there is nothing to offer. On a
 * healthy project this panel is not there at all, which is the point — the
 * right-hand column had two panels and one of them was furniture.
 */
function Colors({
  state,
  change,
  kind,
}: {
  state: State;
  change: (apply: (d: State) => State) => void;
  kind: 'teacher' | 'class';
}) {
  const rows = kind === 'teacher' ? state.teachers : state.classes;
  if (!rows.some((x, i) => x.color !== i)) return null;

  const noun = kind === 'teacher' ? 'öğretmen' : 'sınıf';
  // Two different faults with one repair. A duplicate is a real problem — two
  // people wearing one identity — so it is a warning. A gap is only untidy.
  const clashes = rows.length - new Set(rows.map((x) => x.color)).size;
  return (
    <>
      <h3>Renkler</h3>
      {clashes > 0 ? (
        <div className="warn-box">
          <b>
            {clashes} {noun} başkasıyla aynı renkte.
          </b>{' '}
          Renk burada bir kimlik: ızgarada, havuzda ve kâğıtta okunuyor.
        </div>
      ) : (
        <p className="hint">
          Silmelerden sonra renkler arada delik bıraktı. Yeniden dağıtmak programı
          bozmaz, yalnızca renkleri baştan sıraya dizer.
        </p>
      )}
      <div className="form-row">
        <button className="btn" onClick={() => change((d) => respreadColors(d, kind))}>
          {kind === 'teacher' ? 'Öğretmen' : 'Sınıf'} renklerini yeniden dağıt ({rows.length})
        </button>
      </div>
    </>
  );
}

export default function Summary({
  state,
  change,
  step,
}: {
  state: State;
  change: (apply: (d: State) => State) => void;
  step: SummaryView;
}) {
  const capacity = useMemo(() => buildCapacity(state), [state]);

  if (step === 'subjects') {
    // The built-in table the short forms come from. Anything already on the
    // school's list is not on offer; what is left is one click away instead of
    // being retyped — and typed-in names are exactly how "Matemtik" was born.
    const options = subjectOptions(state);
    const ready = Object.keys(DEFAULT_SUBJECT_SHORTS).filter(
      (name) => !options.some((x) => subjectKey(x) === subjectKey(name)),
    );
    const unused = options.filter((x) => subjectTeachers(state, x).length === 0);
    return (
      <div className="panel">
        <h2>Özet</h2>
        <h3>Hazır branşlar ({ready.length})</h3>
        <p className="hint">
          Programda gömülü olan ve okulun listesinde <b>bulunmayan</b> branşlar.
          Kısaltmaları hazır; eklemek için tıklayın.
        </p>
        {ready.length === 0 ? (
          <div className="ok-box">Gömülü tablodaki branşların hepsi listenizde.</div>
        ) : (
          <>
            <div className="form-row">
              <button
                className="btn"
                title="Gömülü tablodaki bütün branşları listeye ekler"
                onClick={() =>
                  change((d) => ready.reduce((acc, name) => addSubject(acc, name), d))
                }
              >
                Hepsini ekle
              </button>
            </div>
            <div className="stat-scroll">
              <table className="stat">
                <tbody>
                  {ready.map((name) => (
                    <tr key={name}>
                      <td>{name}</td>
                      <td className="num">{DEFAULT_SUBJECT_SHORTS[name]}</td>
                      <td>
                        {/* Not "Ekle": the add form on the LEFT of this screen
                            has a button by that name, and `getByRole(name:)`
                            would then be ambiguous across the two (pitfall 49). */}
                        <button
                          className="btn"
                          title={`${name} branşını listeye ekler`}
                          onClick={() => change((d) => addSubject(d, name))}
                        >
                          Listeye ekle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        {unused.length > 0 && (
          <p className="hint">
            Hiçbir öğretmende kullanılmayan {unused.length} branş var: {unused.join(', ')}.
            Silinebilirler.
          </p>
        )}
      </div>
    );
  }

  if (step === 'rooms') {
    const homeless = state.classes.filter((c) => c.roomId == null);
    return (
      <div className="panel">
        <h2>Özet</h2>
        <h3>Derslik yükü</h3>
        <p className="hint">
          Aynı dersliği paylaşan sınıfların <b>toplam</b> ders saati de haftaya sığmalı.
          En çok gözden kaçan darboğaz burasıdır, girerken görünsün diye buraya kondu.
        </p>
        <CapacityRows rows={capacity.rooms} empty="Henüz derslik yok." />
        {state.rooms.length > 0 && (
          <>
            <h3>Hangi sınıflar</h3>
            <ul className="plain-list">
              {state.rooms.map((r) => {
                const inside = roomClasses(state, r.id);
                return (
                  <li key={r.id}>
                    <b>{r.name}</b>:{' '}
                    {inside.length === 0
                      ? 'sınıf yok'
                      : `${inside.length} sınıf: ${inside.map((c) => c.name).join(', ')}`}
                  </li>
                );
              })}
            </ul>
          </>
        )}
        {homeless.length > 0 && (
          <div className="warn-box">
            <b>{homeless.length} sınıfın dersliği yok</b> ({homeless.map((c) => c.name).join(', ')}
            ). Derslik çakışması onlar için hiç kontrol edilmez.
          </div>
        )}
      </div>
    );
  }

  if (step === 'teachers') {
    // In the school's own order (Ayarlar > Branşlar), then whatever a teacher
    // carries that the list does not — `subjectOptions` already answers exactly
    // that. It used to be `usedSubjects`, i.e. the order the teachers happened
    // to be typed in, which is an order nobody chose and nobody can change.
    const subjects = subjectOptions(state).filter((name) => subjectTeachers(state, name).length > 0);
    // Counted, not estimated — and the blank is counted too, because the
    // number worth seeing is how many rows are still to be filled in.
    const byGender = GENDERS.map((g) => ({
      label: genderLabel(g),
      count: state.teachers.filter((t) => t.gender === g).length,
    })).filter((x) => x.count > 0);
    return (
      <div className="panel">
        <h2>Özet</h2>
        <h3>Öğretmen yükü</h3>
        <p className="hint">
          Öğretmenin müsait saati, ona yüklenen ders saatinden az olamaz. Müsait saatler{' '}
          <b>Müsaitlik</b> sekmesinde daralır.
        </p>
        {/* Above the table, not below it: under twenty-five rows this line is
            a screen away from the heading it belongs to. */}
        {byGender.length > 1 && (
          <p className="hint">
            {byGender.map((x, i) => (
              <span key={x.label}>
                {i > 0 && ' · '}
                <b>{x.label}</b> {x.count}
              </span>
            ))}
          </p>
        )}
        <CapacityRows rows={capacity.teachers} empty="Henüz öğretmen yok." />
        {subjects.length > 0 && (
          <>
            <h3>Branşlar ({subjects.length})</h3>
            <ul className="plain-list">
              {subjects.map((name) => (
                <li key={name}>
                  <b>{name}</b>: {subjectTeachers(state, name).length} öğretmen
                </li>
              ))}
            </ul>
          </>
        )}
        <Colors state={state} change={change} kind="teacher" />
      </div>
    );
  }

  if (step === 'classes') {
    const noLesson = state.classes.filter((c) => !state.lessons.some((x) => x.classId === c.id));
    const slots = state.settings.days.length * state.settings.hours.length;
    const weekly = state.lessons.reduce((n, l) => n + l.weeklyHours, 0);
    return (
      <div className="panel">
        <h2>Özet</h2>
        <h3>Sınıf yükü</h3>
        <p className="hint">
          Sınıfa yüklenen toplam ders saati, sınıfın <b>açık</b> olduğu saatlere sığmalı.
        </p>
        <CapacityRows rows={capacity.classes} empty="Henüz sınıf yok." />
        {/* Both of these outlived the "Kurulum durumu" panel they used to sit
            in. The first is the only warning that a class was created and then
            forgotten; the second is the one number that decides whether any of
            this can be laid out at all. */}
        {noLesson.length > 0 && (
          <div className="warn-box">
            <b>{noLesson.length} sınıfın hiç dersi yok</b> (
            {noLesson.map((c) => c.name).join(', ')}).
          </div>
        )}
        {state.classes.length > 0 && (
          <p className="hint">
            Haftada sınıf başına <b>{slots}</b> saat var ({state.settings.days.length} gün ×{' '}
            {state.settings.hours.length} ders). Girilen toplam ders yükü <b>{weekly}</b> saat.
            Gün ve saat sayısı <b>Ayarlar → Zil ve günler</b>'de.
          </p>
        )}
        <Colors state={state} change={change} kind="class" />
      </div>
    );
  }

  const noLesson = state.classes.filter(
    (c) => !state.lessons.some((x) => x.classId === c.id),
  );
  const idleTeachers = state.teachers.filter(
    (t) => !state.lessons.some((x) => x.teacherId === t.id),
  );
  return (
    <div className="panel">
      <h2>Özet</h2>
      <h3>Ders yükü</h3>
      <p className="hint">
        Her sınıfın haftalık saati, açık olduğu saatlere sığmalı. Sağdaki sayı
        girdikçe artar; <b>Yük</b> <b>Açık</b>'ı geçerse o sınıfın haftası tutmaz.
      </p>
      <CapacityRows rows={capacity.classes} empty="Henüz sınıf yok." />
      {noLesson.length > 0 && (
        <div className="warn-box">
          <b>{noLesson.length} sınıfın hiç dersi yok</b> ({noLesson.map((c) => c.name).join(', ')}).
        </div>
      )}
      {idleTeachers.length > 0 && (
        <p className="hint">
          Hiç dersi olmayan öğretmen: {idleTeachers.map((t) => t.short).join(', ')}.
        </p>
      )}
    </div>
  );
}
