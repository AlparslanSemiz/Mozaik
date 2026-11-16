// Okul bilgileri: which section, and at the right-hand end what that section
// is about.

import type React from 'react';
import { Bell, Eye, Info, Library, Scale } from 'lucide-react';
import type { SectionId } from '../../platform/prefs';
import { surumEtiketi } from '../../leaf/app';
import { MoreItem, MoreMenu } from '../common';
import { STEPS } from '../program';
import { Group, ICON, Spacer, type StripContext } from './parts';

/**
 * What a term needs, as buttons: the school's name and bell, its two lists
 * that are not people (Derslikler and Branşlar came from Okul, 2026-11-16,
 * K1), its rules, and how this machine shows it. The two lists keep their
 * counts; the count is said here and nowhere else on the screen.
 */
const SECTIONS: Array<{ id: SectionId; label: string; icon: React.ReactElement }> = [
  { id: 'school', label: 'Zil ve günler', icon: <Bell {...ICON} /> },
  ...STEPS.slice(0, 2).map((s) => ({ id: s.id as SectionId, label: s.label, icon: s.icon })),
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
  return (
    <div className="ribbon" data-section={ui.tab} role="toolbar" aria-label={t('Okul bilgileri')}>
      <Group label="Bölüm">
        {SECTIONS.map((s) => {
          const step = STEPS.find((x) => x.id === s.id);
          return (
            <button
              key={s.id}
              className={step === undefined ? 'btn' : 'btn step'}
              aria-pressed={s.id === ui.section}
              data-empty={step === undefined ? undefined : step.count(state) === 0}
              onClick={() => ui.setSection(s.id)}
            >
              {step === undefined ? (
                s.icon
              ) : (
                <span className="step-icon" aria-hidden="true">
                  {s.icon}
                </span>
              )}
              {t(s.label)}
              {step !== undefined && <span className="step-count">{step.count(state)}</span>}
            </button>
          );
        })}
      </Group>

      <Spacer />

      {/* What this section is about: a reading, never a second copy of a
          control under it. */}
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
        {/* Plain menu items, not radio items: choosing one GOES to a
            section, it does not set anything. A menuitem is also what
            Windows UI Automation and a screen reader can press; a
            menuitemradio arrived as a RadioButton whose Invoke selected
            nothing (kurulum-windows, 2026-11-16). The strip's reading on
            the right says which one is open. */}
        {RARE.map((s) => (
          <MoreItem
            key={s.id}
            icon={s.id === 'plans' ? <Library size={15} /> : <Info size={15} />}
            onSelect={() => ui.setSection(s.id)}
          >
            {t(s.label)}
          </MoreItem>
        ))}
      </MoreMenu>
    </div>
  );
}
