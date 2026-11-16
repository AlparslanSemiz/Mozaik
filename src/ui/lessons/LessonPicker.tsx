// The right-hand column of the Dersler tab in a focused mode: which teacher or
// class the screen is filling in, each with its lessons and hours.

import { type ClassGroup, type Id, type State, type Teacher, paletteColor } from '../../leaf/model';
import { useMemo } from 'react';
import { weeklyLoad } from '../../pure/entities';
import { buildCapacity } from '../../pure/feasibility';
import { GoButton, useT } from '../common';
import { KIND_ICON } from '../program';

interface Props {
  state: State;
  mode: 'teacher' | 'class';
  picking: Array<Teacher | ClassGroup>;
  focused: Teacher | ClassGroup | undefined;
  setFocus: (next: Id) => void;
}

export function LessonPicker({ state, mode, picking, focused, setFocus }: Props) {
  const t = useT();
  // A row whose hours do not fit its week is red here, beside the form that
  // filled it: the same numbers as Okul → Özet and Kontrol (`buildCapacity`).
  const capacity = useMemo(() => buildCapacity(state), [state]);
  const over = useMemo(() => {
    const rows = mode === 'teacher' ? capacity.teachers : capacity.classes;
    return new Map(rows.filter((r) => r.load > r.capacity).map((r) => [r.id, r]));
  }, [capacity, mode]);
  return (
    <div className="panel">
      <h2>{mode === 'teacher' ? t('Hangi öğretmen') : t('Hangi sınıf')}</h2>
      {/* Two whole sentences rather than one with a noun slot: Turkish
                suffixes the noun ("o sınıfa"), so a shared sentence would have
                to glue a case ending onto a translated word — which is the one
                thing this dictionary cannot do. */}
      <p className="hint">
        {mode === 'teacher'
          ? t('Seçtiğiniz öğretmen için ders girin. Soldaki liste de o öğretmene daralır.')
          : t('Seçtiğiniz sınıf için ders girin. Soldaki liste de o sınıfa daralır.')}
      </p>
      <div className="entity-list" role="group" aria-label={t('Ders listesi')}>
        {picking.map((x) => {
          const count = state.lessons.filter((l) =>
            mode === 'teacher' ? l.teacherId === x.id : l.classId === x.id,
          ).length;
          const tooMuch = over.get(x.id);
          return (
            <button
              key={x.id}
              type="button"
              className={tooMuch === undefined ? 'entity' : 'entity over'}
              data-id={x.id}
              title={
                tooMuch === undefined
                  ? undefined
                  : mode === 'teacher'
                    ? t('{yuk} saat ders, {acik} müsait saat. {fazla} saat haftaya sığmaz.', {
                        yuk: tooMuch.load,
                        acik: tooMuch.capacity,
                        fazla: tooMuch.load - tooMuch.capacity,
                      })
                    : t('{yuk} saat ders, {acik} açık saat. {fazla} saat haftaya sığmaz.', {
                        yuk: tooMuch.load,
                        acik: tooMuch.capacity,
                        fazla: tooMuch.load - tooMuch.capacity,
                      })
              }
              aria-current={x.id === focused?.id}
              onClick={() => setFocus(x.id)}
            >
              <span className="entity-icon" aria-hidden="true">
                {KIND_ICON[mode === 'teacher' ? 'teacher' : 'class']}
              </span>
              <span className="row-dot" style={{ background: paletteColor(x.color) }} />
              <span className="entity-name">{x.name}</span>
              {/* Lessons and hours, because both are asked: "kaç ders
                        girdim" and "haftası doldu mu" are different questions
                        and the second one is the one that bites. */}
              <span className="entity-count">
                {count} ders · {weeklyLoad(state, mode === 'teacher' ? 'teacher' : 'class', x.id)}{' '}
                saat
              </span>
            </button>
          );
        })}
      </div>
      {picking.length === 0 && (
        <p className="hint">
          {mode === 'teacher' ? t('Henüz öğretmen yok.') : t('Henüz sınıf yok.')}{' '}
          {mode === 'teacher' ? (
            <GoButton to={{ tab: 'teachers', people: 'list' }}>{t('Öğretmen ekle')}</GoButton>
          ) : (
            <GoButton to={{ tab: 'classes', people: 'list' }}>{t('Sınıf ekle')}</GoButton>
          )}
        </p>
      )}
    </div>
  );
}
