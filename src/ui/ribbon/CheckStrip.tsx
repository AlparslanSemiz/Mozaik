// Kontrol: which part of the report is on screen.

import type React from 'react';
import { Lightbulb, TriangleAlert } from 'lucide-react';
import type { CheckView } from '../../platform/prefs';
import { MoreMenu, MoreRadio } from '../common';
import { Group, ICON, type StripContext } from './parts';

/** The three load tables. Behind Daha fazla since 2026-11-16: Okul's Özet
    draws the same tables (envanter, "DUP Okul Özet"). */
const LOADS: Array<{ id: CheckView; label: string }> = [
  { id: 'teachers', label: 'Öğretmen yükleri' },
  { id: 'classes', label: 'Sınıf yükleri' },
  { id: 'rooms', label: 'Derslik yükleri' },
];

export function checkStrip({ ui, t, status }: StripContext): React.ReactElement {
  const sorunlar = status.problems;
  // The counts are on these two buttons and nowhere else on the strip: the
  // "N engel · N uyarı" reading beside them said the chip's number a third
  // time (Sadeleşme, phase 1).
  const views: Array<{ id: CheckView; label: string; icon: React.ReactNode; title: string }> = [
    {
      id: 'problems',
      label: t('Sorunlar ({n})', { n: sorunlar }),
      icon: <TriangleAlert {...ICON} />,
      title: sorunlar === 0 ? t('Sorun yok') : t('Çözülmesi gereken satırlar'),
    },
    {
      id: 'advisor',
      label: t('İpuçları ({n})', { n: status.advice }),
      icon: <Lightbulb {...ICON} />,
      title:
        status.advice === 0 ? t('Not yok') : t('Veri girişinde gözden kaçmış olabilecek noktalar'),
    },
  ];
  return (
    <div className="ribbon" data-section={ui.tab} role="toolbar" aria-label={t('Kontrol')}>
      <Group label={t('Göster')}>
        {views.map((v) => (
          <button
            key={v.id}
            className="btn"
            aria-pressed={v.id === ui.checkView}
            title={v.title}
            onClick={() => ui.setCheckView(v.id)}
          >
            {v.icon}
            {v.label}
          </button>
        ))}
      </Group>

      <MoreMenu>
        <MoreRadio
          value={LOADS.some((l) => l.id === ui.checkView) ? ui.checkView : ''}
          onChange={(id) => ui.setCheckView(id as CheckView)}
          options={LOADS.map((l) => ({ id: l.id, label: t(l.label) }))}
        />
      </MoreMenu>
    </div>
  );
}
