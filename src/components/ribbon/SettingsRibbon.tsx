// Açık bölümün kendi sayısı: hafta · kural seviyeleri · plan adı · sürüm.
//
// Split out of Ribbon.tsx, which was one function with seven branches. The
// strip's SHAPE is shared (./parts); what each tab ASKS is its own file.

import { applyTheme } from '../../view/theme';
import { surumEtiketi } from '../../version/version';
import { useT } from '../T';
import {
  Group,
  SECTIONS,
  Spacer,
  THEMES,
} from './parts';
import type { RibbonProps } from './props';

export default function SettingsRibbon({ ui, state, theme, setTheme, changelogUnseen, planName }: Pick<RibbonProps, 'ui' | 'state' | 'theme' | 'setTheme' | 'changelogUnseen' | 'planName'>) {
  const t = useT();

  // settings
  const rules = Object.values(state.settings.rules);
  return (
    <div className="ribbon" data-section={ui.tab} role="toolbar" aria-label={t('Ayar bölümleri')}>
      <Group label="Bölüm">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            className={`btn${s.id === 'about' && changelogUnseen ? ' has-dot' : ''}`}
            aria-pressed={s.id === ui.section}
            onClick={() => ui.setSection(s.id)}
          >
            {s.icon}
            {t(s.label)}
            {s.id === 'about' && changelogUnseen && (
              <span className="ribbon-dot" aria-hidden="true" />
            )}
          </button>
        ))}
      </Group>

      <Spacer />

      {/* WHAT THIS SECTION IS ABOUT, at the right-hand end — the one place on
          the six strips that was empty. ("Ayarlardaki özel sectionlara özgü
          ayarlar o sectionun alt şeridinde sağ üstte gözüksün.")

          Four of the five STATE and one ASKS, and the split is not a mood: a
          strip that repeats a control standing four inches under it is the
          "ribbon of everything" this file's header warns about. Ayarlar keeps
          every control in its panels, so what the strip can add is the reading
          — how many days, how strict, which plan, which build.

          Görünüm is the exception and the reason is measurable: it is the one
          section long enough to SCROLL, and the theme is the first panel on it.
          By the time you are at Hareket or Dil the two buttons are off the top
          of the screen, and the strip does not move. */}
      {ui.section === 'appearance' ? (
        <Group label="Tema">
          {THEMES.map((x) => (
            <button
              key={x.id}
              className="btn"
              aria-pressed={x.id === theme}
              title={t('{ad} temaya geç', { ad: t(x.label) })}
              onClick={() => {
                applyTheme(x.id);
                setTheme(x.id);
              }}
            >
              {x.icon}
              {t(x.label)}
            </button>
          ))}
        </Group>
      ) : ui.section === 'school' ? (
        <Group label="Hafta">
          <span className="ribbon-value">
            {t('{n} gün', { n: state.settings.days.length })}
            {' · '}
            {t('{n} ders', { n: state.settings.hours.length })}
          </span>
        </Group>
      ) : ui.section === 'rules' ? (
        <Group label="Seviye">
          <span className="ribbon-value">
            <span className={`badge ${rules.filter((r) => r === 'block').length > 0 ? 'impossible' : 'ok'}`}>
              {t('{n} engelle', { n: rules.filter((r) => r === 'block').length })}
            </span>
            <span className={`badge ${rules.filter((r) => r === 'warn').length > 0 ? 'tight' : 'ok'}`}>
              {t('{n} uyar', { n: rules.filter((r) => r === 'warn').length })}
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
      ) : (
        <Group label="Sürüm">
          <span className="ribbon-value">{surumEtiketi()}</span>
        </Group>
      )}
    </div>
  );
}
