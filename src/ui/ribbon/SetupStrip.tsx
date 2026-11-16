// Okul: which of the four lists, each with its count — the count is said here
// and nowhere else on the screen (Sadeleşme, phase 1, 2026-11-16).

import type React from 'react';
import { Bell, ListChecks, Scale } from 'lucide-react';
import { STEPS } from '../program';
import { MoreItem, MoreMenu } from '../common';
import { openChecklist } from '../../platform/prefs';
import { Group, type StripContext } from './parts';

export function setupStrip({ ui, state, t }: StripContext): React.ReactElement {
  const go = (section: 'school' | 'rules') => {
    ui.setSection(section);
    ui.setTab('settings');
  };
  return (
    <div className="ribbon" data-section={ui.tab} role="toolbar" aria-label={t('Okul')}>
      <Group label="Liste">
        {STEPS.map((s) => {
          const count = s.count(state);
          return (
            <button
              key={s.id}
              className="btn step"
              aria-pressed={s.id === ui.step}
              data-empty={count === 0}
              onClick={() => ui.setStep(s.id)}
            >
              <span className="step-icon" aria-hidden="true">
                {s.icon}
              </span>
              {/* The ORDER of the label and the count matters: the button
                  says "Öğretmenler 25", a word and then the number. */}
              {t(s.label)}
              <span className="step-count">{count}</span>
            </button>
          );
        })}
      </Group>

      {/* "Okulun adını değiştir" was looked for HERE and lived in Ayarlar
          (bulunurluk testi, 2026-11-16): the door says where it is. */}
      <MoreMenu>
        <MoreItem icon={<Bell size={15} />} onSelect={() => go('school')}>
          {t('Okul adını ve zili gir')}
        </MoreItem>
        <MoreItem icon={<Scale size={15} />} onSelect={() => go('rules')}>
          {t('Kurallar')}
        </MoreItem>
        <MoreItem icon={<ListChecks size={15} />} onSelect={openChecklist}>
          {t('Başlarken listesini göster')}
        </MoreItem>
      </MoreMenu>
    </div>
  );
}
