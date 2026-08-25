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
import type { ReportRow } from '../../feasibility';
import { roomClasses, subjectTeachers, usedSubjects } from '../../entities';
import type { State } from '../../types';

export type StepId = 'rooms' | 'teachers' | 'classes' | 'lessons';

const BADGE: Record<ReportRow['level'], string> = {
  ok: 'ok',
  tight: 'tight',
  impossible: 'impossible',
};

const BADGE_TEXT: Record<ReportRow['level'], string> = {
  ok: 'Uygun',
  tight: 'Sıkışık',
  impossible: 'İmkânsız',
};

function Rows({ rows, empty }: { rows: ReportRow[]; empty: string }) {
  if (rows.length === 0) return <p className="hint">{empty}</p>;
  return (
    <table className="stat">
      <thead>
        <tr>
          <th>Ad</th>
          <th className="num">Açık</th>
          <th className="num">Yük</th>
          <th>Durum</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id}>
            <td title={r.message}>{r.name}</td>
            <td>{r.capacity}</td>
            <td>{r.load}</td>
            <td>
              <span className={`badge ${BADGE[r.level]}`}>{BADGE_TEXT[r.level]}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function Summary({ state, step }: { state: State; step: StepId }) {
  const capacity = useMemo(() => buildCapacity(state), [state]);

  if (step === 'rooms') {
    const homeless = state.classes.filter((c) => c.roomId == null);
    return (
      <div className="panel">
        <h2>Derslik yükü</h2>
        <p className="hint">
          Aynı dersliği paylaşan sınıfların <b>toplam</b> ders saati de haftaya sığmalı.
          En çok gözden kaçan darboğaz burasıdır — girerken görünsün diye burada.
        </p>
        <Rows rows={capacity.rooms} empty="Henüz derslik yok." />
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
                      : `${inside.length} sınıf — ${inside.map((c) => c.name).join(', ')}`}
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
    const subjects = usedSubjects(state);
    return (
      <div className="panel">
        <h2>Öğretmen yükü</h2>
        <p className="hint">
          Öğretmenin müsait saati, ona yüklenen ders saatinden az olamaz. Müsait saatler{' '}
          <b>Müsaitlik</b> sekmesinde daralır.
        </p>
        <Rows rows={capacity.teachers} empty="Henüz öğretmen yok." />
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
      </div>
    );
  }

  if (step === 'classes') {
    return (
      <div className="panel">
        <h2>Sınıf yükü</h2>
        <p className="hint">
          Sınıfa yüklenen toplam ders saati, sınıfın <b>açık</b> olduğu saatlere sığmalı.
        </p>
        <Rows rows={capacity.classes} empty="Henüz sınıf yok." />
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
      <h2>Ders yükü</h2>
      <p className="hint">
        Her sınıfın haftalık saati, açık olduğu saatlere sığmalı. Bu tabloyu görmek için
        <b> Kontrol</b> sekmesine gitmek gerekiyordu.
      </p>
      <Rows rows={capacity.classes} empty="Henüz sınıf yok." />
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
