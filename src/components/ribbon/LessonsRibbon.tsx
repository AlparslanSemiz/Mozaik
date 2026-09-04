// Ders girişinin EKSENİ: sınıftan mı, öğretmenden mi, yoksa genel mi.
//
// Split out of Ribbon.tsx, which was one function with seven branches. The
// strip's SHAPE is shared (./parts); what each tab ASKS is its own file.

import { paletteColor } from '../../palette';
import { useT } from '../T';
import {
  Group,
  LESSON_MODES,
  Sep,
  Spacer,
} from './parts';
import type { RibbonProps } from './props';

export default function LessonsRibbon({ ui, state }: Pick<RibbonProps, 'ui' | 'state'>) {
  const t = useT();

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
                    <span
                      className="row-dot"
                      style={{ background: paletteColor(selected.color) }}
                    />
                    {selected.name}
                  </>
                )}
              </span>
            </Group>
          </>
        )}

        <Spacer />

        <Group label="Toplam">
          <span className="ribbon-value">
            {state.lessons.length} ders · {state.lessons.reduce((n, l) => n + l.weeklyHours, 0)} saat
          </span>
        </Group>
      </div>
    );
}
