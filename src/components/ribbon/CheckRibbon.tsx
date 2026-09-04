// Rapor süzülmüyor, GÖTÜRÜYOR: her düğme raporun bir bölümüne atlıyor.
//
// Split out of Ribbon.tsx, which was one function with seven branches. The
// strip's SHAPE is shared (./parts); what each tab ASKS is its own file.

import type { ReactNode } from 'react';
import { useMemo } from 'react';
import {
  Lightbulb,
  TriangleAlert,
} from 'lucide-react';
import { health } from '../../feasibility';
import type { CheckView } from '../../toolState';
import { KIND_ICON } from '../steps';
import { useT } from '../T';
import {
  Group,
  ICON,
  Spacer,
} from './parts';
import type { RibbonProps } from './props';

export default function CheckRibbon({ ui, state }: Pick<RibbonProps, 'ui' | 'state'>) {
  const t = useT();
  const status = useMemo(() => health(state), [state]);

    // Kontrol used to have no strip at all, on the argument that it is a report
    // you read and there is nothing to do to it. That was true of its CONTENT
    // and false of the screen: the strip's height came and went with the tab,
    // so everything under it jumped every time this report was opened or left.
    //
    // Then it held a three-way FILTER, and the reader's verdict was that the
    // three read the same — the panel everyone comes for was in all three. Then
    // it held four `scrollIntoView` buttons, and those were worse: three of the
    // four aimed into the sticky right rail, which is pinned to the top of the
    // scrollport and scrolls inside itself, so the page could not move. No
    // pressed state, no movement, no message. "Alt sekmede bir şeyler seçiyoruz
    // ama değişmiyor" is exactly that.
    //
    // Now they CHOOSE THE PAGE. A click always changes the screen, the choice
    // stays visible in `aria-pressed`, and the report stopped being something
    // you scroll.
    const sorunlar = status.problems;
    const views: Array<{ id: CheckView; label: string; icon: ReactNode; title: string }> = [
      {
        id: 'problems',
        label: t('Sorunlar ({n})', { n: sorunlar }),
        icon: <TriangleAlert {...ICON} />,
        title: sorunlar === 0 ? t('Sorun yok') : t('Çözülmesi gereken satırlar'),
      },
      {
        id: 'advisor',
        label: t('Danışman ({n})', { n: status.advice }),
        icon: <Lightbulb {...ICON} />,
        title:
          status.advice === 0
            ? t('Öneri yok')
            : t('Veri girişinde gözden kaçmış olabilecek noktalar'),
      },
      {
        id: 'teachers',
        label: t('Öğretmenler'),
        icon: KIND_ICON.teacher,
        title: t('Öğretmen yükleri'),
      },
      {
        id: 'classes',
        label: t('Sınıflar'),
        icon: KIND_ICON.class,
        title: t('Sınıf yükleri'),
      },
      {
        id: 'rooms',
        label: t('Derslikler'),
        icon: KIND_ICON.room,
        title: t('Derslik yükleri'),
      },
    ];
    return (
      <div className="ribbon" data-section={ui.tab} role="toolbar" aria-label={t('Kontrol araçları')}>
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

        <Spacer />

        {/* The numbers themselves, not the top bar's chip repeated: the chip
            says which of three states the week is in, and this says how many of
            what. It is a READING — no button, nothing to press. */}
        <Group label="Durum">
          <span className="ribbon-value">
            <span className={`badge ${status.blocked > 0 ? 'impossible' : 'ok'}`}>
              {t('{n} engel', { n: status.blocked })}
            </span>
            <span className={`badge ${status.warnings > 0 ? 'tight' : 'ok'}`}>
              {t('{n} uyarı', { n: status.warnings })}
            </span>
          </span>
        </Group>
      </div>
    );
}
