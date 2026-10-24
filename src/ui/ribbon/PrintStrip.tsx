// Çıktı: which sheets, and whether they print in colour.

import type React from 'react';
import { Layers, Palette as PaletteIcon } from 'lucide-react';
import { KIND_ICON } from '../program';
import { Group, ICON, Sep, type StripContext } from './parts';

export function printStrip({ ui, t }: StripContext): React.ReactElement {
  return (
    <div
      className="ribbon"
      data-section={ui.tab}
      role="toolbar"
      aria-label={t('Yazdırma araçları')}
    >
      {/* The two kinds of sheet are drawn with the same two symbols they carry
          in Kurulum, Müsaitlik and the entity panel — one drawing per thing. */}
      <Group label="İçerik">
        <button
          className="btn"
          aria-pressed={ui.scope === 'teachers'}
          onClick={() => ui.setScope('teachers')}
        >
          {KIND_ICON.teacher}
          {t('Öğretmenler')}
        </button>
        <button
          className="btn"
          aria-pressed={ui.scope === 'classes'}
          onClick={() => ui.setScope('classes')}
        >
          {KIND_ICON.class}
          {t('Sınıflar')}
        </button>
        <button
          className="btn"
          aria-pressed={ui.scope === 'both'}
          onClick={() => ui.setScope('both')}
        >
          <Layers {...ICON} />
          {t('İkisi de')}
        </button>
      </Group>
      <Sep />
      <Group label="Renk">
        <button
          className="btn"
          aria-pressed={ui.colored}
          title={t('Öğretmen renkleri kâğıda basılır')}
          onClick={() => ui.setColored(!ui.colored)}
        >
          <PaletteIcon {...ICON} />
          {t('Renkli bas')}
        </button>
      </Group>
      {/* "Yazdır (N sayfa)" is NOT here: the N comes from the tick lists in
          the panel, and a button that says how many pages belongs next to the
          list that decides it. The strip carries what you are looking at. */}
    </div>
  );
}
