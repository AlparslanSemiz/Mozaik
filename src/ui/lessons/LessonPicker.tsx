// The right-hand column of the Dersler tab in a focused mode: which teacher or
// class the screen is filling in, each with its lessons and hours.

import { type ClassGroup, type Id, type State, type Teacher, paletteColor } from '../../leaf/model';
import { weeklyLoad } from '../../pure/entities';
import { T, useT } from '../common';
import { KIND_ICON } from '../program';

interface Props {
  state: State;
  mode: 'teacher' | 'class';
  picking: Array<Teacher | ClassGroup>;
  focused: Teacher | ClassGroup | undefined;
  setFocus: (next: Id) => void;
  modeNoun: string;
}

export function LessonPicker({ state, mode, picking, focused, setFocus, modeNoun }: Props) {
  const t = useT();
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
      <div className="entity-list" aria-label={t('Ders listesi')}>
        {picking.map((x) => {
          const count = state.lessons.filter((l) =>
            mode === 'teacher' ? l.teacherId === x.id : l.classId === x.id,
          ).length;
          return (
            <button
              key={x.id}
              type="button"
              className="entity"
              data-id={x.id}
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
          <T k="Henüz {ne} yok. **Okul** sekmesinden ekleyin." vars={{ ne: t(modeNoun) }} />
        </p>
      )}
    </div>
  );
}
