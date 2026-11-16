// Öğretmenler and Sınıflar: the list, or one person's lessons — and which one
// is open. One strip for both tabs, because they answer the same two
// questions (Sadeleşme, K1, 2026-11-16). It took the place of four: Okul's
// four lists, Dersler's three ways round, Müsaitlik's "Kim" and the Kontrol
// report's views; where each of those went is LAYOUT, "Sekmeler".

import type React from 'react';
import { paletteColor } from '../../leaf/model';
import { lessonIcon, STEPS } from '../program';
import { Group, Sep, type StripContext } from './parts';

export function peopleStrip({ ui, state, t }: StripContext): React.ReactElement {
  const tab = ui.tab === 'teachers' ? 'teachers' : 'classes';
  const view = ui.people[tab];
  const step = STEPS.find((s) => s.id === tab)!;
  const list: Array<{ id: string; name: string; color: number }> =
    tab === 'teachers' ? state.teachers : state.classes;
  const selected = list.find((x) => x.id === ui.lessonFocus) ?? list[0];
  return (
    <div className="ribbon" data-section={ui.tab} role="toolbar" aria-label={t(step.label)}>
      {/* "Liste" and not the tab's own name: a strip button that wears a tab's
          name answers that tab's queries (pitfall 49). The count is said
          here and nowhere else on the screen. */}
      <Group label="Göster">
        <button
          className="btn step"
          aria-pressed={view === 'list'}
          data-empty={list.length === 0}
          onClick={() => ui.setPeople(tab, 'list')}
        >
          <span className="step-icon" aria-hidden="true">
            {step.icon}
          </span>
          {t('Liste')}
          <span className="step-count">{list.length}</span>
        </button>
        <button
          className="btn"
          aria-pressed={view === 'lessons'}
          title={
            tab === 'teachers'
              ? t('Bir öğretmen seçin, girdiği bütün sınıfları arka arkaya girin')
              : t('Bir sınıf seçin, o sınıfın derslerini arka arkaya girin')
          }
          onClick={() => ui.setPeople(tab, 'lessons')}
        >
          {/* Drawn at the tabs' 22px; the box sizes it to the strip's 18. */}
          <span className="step-icon" aria-hidden="true">
            {lessonIcon}
          </span>
          {t('Dersler')}
        </button>
      </Group>

      {view === 'lessons' && (
        <>
          <Sep />
          {/* A READING, not a control — the picker is the list in the right
              column. */}
          <Group label="Açık olan">
            <span className="ribbon-value">
              {selected === undefined ? (
                t('Liste boş')
              ) : (
                <>
                  <span className="row-dot" style={{ background: paletteColor(selected.color) }} />
                  {selected.name}
                </>
              )}
            </span>
          </Group>
        </>
      )}
    </div>
  );
}
