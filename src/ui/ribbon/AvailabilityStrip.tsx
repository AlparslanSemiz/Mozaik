// Müsaitlik: whose hours, which one is open, and what the table shows.

import type React from 'react';
import { Clock, Flame } from 'lucide-react';
import type { Kind } from '../../platform/prefs';
import { paletteColor } from '../../leaf/model';
import { KIND_ICON } from '../program';
import { Group, ICON, Sep, Spacer, type StripContext } from './parts';

const KINDS: Array<{ id: Kind; label: string }> = [
  { id: 'teacher', label: 'Öğretmen' },
  { id: 'class', label: 'Sınıf' },
  { id: 'room', label: 'Derslik' },
];

export function availabilityStrip({
  ui,
  state,
  t,
  availClock,
  setAvailClock,
}: StripContext): React.ReactElement {
  // Name and colour separately: a Room has no colour of its own, so the mark
  // beside the name is drawn only for the two kinds that carry one.
  const list: Array<{ id: string; name: string; color?: number }> =
    ui.kind === 'teacher' ? state.teachers : ui.kind === 'class' ? state.classes : state.rooms;
  const selected = list.find((x) => x.id === ui.chosen) ?? list[0];
  return (
    <div
      className="ribbon"
      data-section={ui.tab}
      role="toolbar"
      aria-label={t('Müsaitlik araçları')}
    >
      <Group label="Kim">
        {KINDS.map((k) => (
          <button
            key={k.id}
            className="btn"
            aria-pressed={ui.kind === k.id}
            onClick={() => {
              ui.setKind(k.id);
              ui.setChosen('');
            }}
          >
            {KIND_ICON[k.id]}
            {t(k.label)}
          </button>
        ))}
      </Group>

      <Sep />

      {/* Whose hours are open. The colour is the same mark the list on the
          right and the grid row carry: the identity of a teacher or a class
          is its colour everywhere it is named, not only where it is edited.
          A room has none — `Room` carries no colour — so nothing is drawn.
          This group is a READING, not a control, so it has no button: it is
          the one place the strip states rather than asks. */}
      <Group label="Açık olan">
        <span className="ribbon-value">
          {selected === undefined ? (
            'Liste boş'
          ) : (
            <>
              {selected.color !== undefined && (
                <span className="row-dot" style={{ background: paletteColor(selected.color) }} />
              )}
              {selected.name}
            </>
          )}
        </span>
      </Group>

      <Spacer />

      {/* What is ON THIS SCREEN, top right — "sağ üstte haftanın darlığı
          açılsın mı kapalı mı kalsın özelliği olsun. Saatleri de oraya
          koyalım. ikinci şeritte olsun."

          The two are not the same kind of thing and it does not matter here:
          one is a position (`toolState`) and one a machine preference
          (`ders-programi-musaitlik-saat`), but both answer "what am I
          looking at", and that is the question a strip is for. The hour
          toggle used to live three clicks away in Ayarlar → Görünüm. */}
      <Group label={t('Göster')}>
        <button
          className="btn"
          aria-pressed={ui.showHeat}
          title={t('Haftanın darlığı tablosunu göster ya da gizle')}
          onClick={() => ui.setShowHeat(!ui.showHeat)}
        >
          <Flame {...ICON} />
          {t('Haftanın darlığı')}
        </button>
        <button
          className="btn"
          aria-pressed={availClock}
          title={t('Ders numaralarının altına başlangıç saatlerini yaz')}
          onClick={() => setAvailClock(!availClock)}
        >
          <Clock {...ICON} />
          {t('Saatler')}
        </button>
      </Group>
    </div>
  );
}
