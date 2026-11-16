// Okul bilgileri: which section, and at the right-hand end what that section
// is about.

import type React from 'react';
import { Bell, Eye, Info, Library, Scale } from 'lucide-react';
import type { SectionId } from '../../platform/prefs';
import { surumEtiketi } from '../../leaf/app';
import { STEPS } from '../program';
import { Group, ICON, Sep, Spacer, type StripContext } from './parts';

/**
 * Two groups (2026-11-16): what a term needs (the school's name and bell, its
 * two lists that are not people, its rules), then how this machine shows it
 * and where the work is kept. Planlar ve yedek and Hakkında left Daha fazla:
 * a door behind a menu that nothing else was in. The two lists keep their
 * counts; the count is said here and nowhere else on the screen.
 */
type Section = { id: SectionId; label: string; icon: React.ReactElement };
const TERM: Section[] = [
  { id: 'school', label: 'Zil ve günler', icon: <Bell {...ICON} /> },
  ...STEPS.slice(0, 2).map((s) => ({ id: s.id as SectionId, label: s.label, icon: s.icon })),
  { id: 'rules', label: 'Kurallar', icon: <Scale {...ICON} /> },
];
const MACHINE: Section[] = [
  { id: 'appearance', label: 'Görünüm', icon: <Eye {...ICON} /> },
  { id: 'plans', label: 'Planlar ve yedek', icon: <Library {...ICON} /> },
  { id: 'about', label: 'Hakkında', icon: <Info {...ICON} /> },
];

export function settingsStrip({
  ui,
  state,
  t,
  changelogUnseen,
  planName,
}: StripContext): React.ReactElement {
  const button = (s: Section) => {
    const step = STEPS.find((x) => x.id === s.id);
    return (
      <button
        key={s.id}
        className={`${step === undefined ? 'btn' : 'btn step'}${
          s.id === 'about' && changelogUnseen ? ' has-dot' : ''
        }`}
        aria-pressed={s.id === ui.section}
        data-empty={step === undefined ? undefined : step.count(state) === 0}
        // The unread release note's dot is on its exact door, Hakkında.
        {...(s.id === 'about' && changelogUnseen ? { 'aria-describedby': 'about-news' } : {})}
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
        {s.id === 'about' && changelogUnseen && (
          <>
            <span className="ribbon-dot" aria-hidden="true" />
            <span id="about-news" hidden>
              {t('Yeni sürüm notu var')}
            </span>
          </>
        )}
      </button>
    );
  };
  return (
    <div className="ribbon" data-section={ui.tab} role="toolbar" aria-label={t('Okul bilgileri')}>
      <Group label="Bölüm">{TERM.map(button)}</Group>
      <Sep />
      <Group>{MACHINE.map(button)}</Group>

      <Spacer />

      {/* What this section is about: a reading, never a second copy of a
          control under it. */}
      {ui.section === 'plans' ? (
        <Group label="Açık plan">
          <span className="ribbon-value">{planName}</span>
        </Group>
      ) : ui.section === 'about' ? (
        <Group label="Sürüm">
          <span className="ribbon-value">{surumEtiketi()}</span>
        </Group>
      ) : null}
    </div>
  );
}
