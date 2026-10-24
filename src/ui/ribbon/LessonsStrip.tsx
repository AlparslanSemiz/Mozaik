// Dersler: whose lesson list this is, which one is open, and the totals.

import type React from 'react';
import { List } from 'lucide-react';
import type { LessonMode } from '../../platform/prefs';
import { paletteColor } from '../../leaf/model';
import { KIND_ICON } from '../program';
import { Group, ICON, Sep, Spacer, type StripContext } from './parts';

/**
 * The three ways to walk the lesson list.
 *
 * The two entity icons come from `KIND_ICON` — a class is the same crowd here
 * as it is in Müsaitlik and in the entity sheet — and only the third needs one
 * of its own, because "the whole list" is not one of the three kinds.
 */
const LESSON_MODES: Array<{
  id: LessonMode;
  label: string;
  icon: React.ReactElement;
  why: string;
}> = [
  {
    id: 'teacher',
    label: 'Öğretmenden',
    icon: KIND_ICON.teacher,
    why: 'Bir öğretmen seçin, girdiği bütün sınıfları arka arkaya girin',
  },
  {
    id: 'class',
    label: 'Sınıftan',
    icon: KIND_ICON.class,
    why: 'Bir sınıf seçin, o sınıfın derslerini arka arkaya girin',
  },
  {
    id: 'all',
    label: 'Genel',
    icon: <List {...ICON} />,
    why: 'Bütün dersler tek listede',
  },
];

export function lessonsStrip({ ui, state, t }: StripContext): React.ReactElement {
  // "artık sınıftan mı eklemek istiyorsun? öğretmenden mi eklemek istiyorsun
  // genel bakmak mı istiyorsun gibi olabilir."
  //
  // Deliberately the SAME shape as the Müsaitlik strip below: a group that
  // asks whose list this is, and a group that states which one is open. Both
  // tabs answer the same two questions, and answering them with two different
  // strips would have been two things to learn instead of one.
  const list: Array<{ id: string; name: string; color: number }> =
    ui.lessonMode === 'teacher' ? state.teachers : state.classes;
  const selected = list.find((x) => x.id === ui.lessonFocus) ?? list[0];
  // "Ders girişi araçları" and not "Ders araçları", which is what it was
  // called for about an hour: `getByLabel` matches on SUBSTRING and ignores
  // case, so "Ders araçları" also answered to `getByLabel('ders ara')` — the
  // search box on this very screen — and the list test died of a strict-mode
  // violation. Pitfall 74 from the other side: it is not only buttons that
  // collide, and a name does not have to look like a name to be one.
  return (
    <div
      className="ribbon"
      data-section={ui.tab}
      role="toolbar"
      aria-label={t('Ders girişi araçları')}
    >
      <Group label="Yöntem">
        {LESSON_MODES.map((m) => (
          <button
            key={m.id}
            className="btn"
            aria-pressed={ui.lessonMode === m.id}
            title={t(m.why)}
            onClick={() => {
              ui.setLessonMode(m.id);
              // The focus is an id from the OTHER list once the axis turns,
              // and an id that matches nothing would read as "Liste boş".
              ui.setLessonFocus('');
            }}
          >
            {m.icon}
            {t(m.label)}
          </button>
        ))}
      </Group>

      {ui.lessonMode !== 'all' && (
        <>
          <Sep />
          {/* A READING, not a control — the picker is the list in the right
              column, exactly as it is in Müsaitlik. */}
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

      <Spacer />

      <Group label="Toplam">
        {/* Through t() like the heading under it: raw JSX here read "99
            ders · 433 saat" in every language (DENETIM DK13). */}
        <span className="ribbon-value">
          {t('{ders} ders · {saat} saat', {
            ders: state.lessons.length,
            saat: state.lessons.reduce((n, l) => n + l.weeklyHours, 0),
          })}
        </span>
      </Group>
    </div>
  );
}
