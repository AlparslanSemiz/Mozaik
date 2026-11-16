// Ayarlar: which section, and at the right-hand end what that section is about.

import type React from 'react';
import { Bell, Eye, Scale } from 'lucide-react';
import type { SectionId } from '../../platform/prefs';
import { surumEtiketi } from '../../leaf/app';
import { MoreMenu, MoreRadio } from '../common';
import { Group, ICON, Spacer, type StripContext } from './parts';

/** The three sections a term needs, as buttons. */
const SECTIONS: Array<{ id: SectionId; label: string; icon: React.ReactElement }> = [
  { id: 'school', label: 'Zil ve günler', icon: <Bell {...ICON} /> },
  { id: 'rules', label: 'Kurallar', icon: <Scale {...ICON} /> },
  { id: 'appearance', label: 'Görünüm', icon: <Eye {...ICON} /> },
];

/** The two that are opened about never (envanter, 2026-11-16), behind Daha
    fazla. Both are also one click from the top bar: Dosya ▾ → Planlar ve
    yedek, ? → Hakkında. */
const RARE: Array<{ id: SectionId; label: string }> = [
  { id: 'plans', label: 'Planlar ve yedek' },
  { id: 'about', label: 'Hakkında' },
];

export function settingsStrip({
  ui,
  state,
  t,
  changelogUnseen,
  planName,
}: StripContext): React.ReactElement {
  const rules = Object.values(state.settings.rules);
  const rare = RARE.find((s) => s.id === ui.section);
  return (
    <div className="ribbon" data-section={ui.tab} role="toolbar" aria-label={t('Ayarlar')}>
      <Group label="Bölüm">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            className="btn"
            aria-pressed={s.id === ui.section}
            onClick={() => ui.setSection(s.id)}
          >
            {s.icon}
            {t(s.label)}
          </button>
        ))}
      </Group>

      <Spacer />

      {/* What this section is about: a reading, never a second copy of a
          control under it. The theme's copy that stood here left on
          2026-11-16 (it is in Görünüm alone), and so did the week's count,
          which Zil ve günler says itself. */}
      {ui.section === 'rules' ? (
        <Group label="Seviye">
          <span className="ribbon-value">
            <span
              className={`badge ${rules.filter((r) => r === 'block').length > 0 ? 'impossible' : 'ok'}`}
            >
              {t('{n} kesin', { n: rules.filter((r) => r === 'block').length })}
            </span>
            <span
              className={`badge ${rules.filter((r) => r === 'warn').length > 0 ? 'tight' : 'ok'}`}
            >
              {t('{n} tercih', { n: rules.filter((r) => r === 'warn').length })}
            </span>
            <span className="badge ok">
              {t('{n} kapalı', { n: rules.filter((r) => r === 'off').length })}
            </span>
          </span>
        </Group>
      ) : ui.section === 'plans' ? (
        <Group label="Açık plan">
          <span className="ribbon-value">{planName}</span>
        </Group>
      ) : ui.section === 'about' ? (
        <Group label="Sürüm">
          <span className="ribbon-value">{surumEtiketi()}</span>
        </Group>
      ) : null}

      {/* The unread release note's dot sits on the door now, since Hakkında
          is behind it. */}
      <MoreMenu dot={changelogUnseen}>
        <MoreRadio
          value={rare?.id ?? ''}
          onChange={(id) => ui.setSection(id as SectionId)}
          options={RARE.map((s) => ({ id: s.id, label: t(s.label) }))}
        />
      </MoreMenu>
    </div>
  );
}
