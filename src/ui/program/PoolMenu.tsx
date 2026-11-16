// The pool card's right-click menu. The same items as a grid card's, the ones
// that cannot apply to a card that is not on the grid shown disabled, so the
// two menus read alike. Its facts are `poolMenuFacts` in pure/program.

import * as ContextMenu from '@radix-ui/react-context-menu';
import { CircleHelp, Eye, EyeOff, Pencil, Pin, Trash2 } from 'lucide-react';
import type { Id, Lesson } from '../../leaf/model';
import type { InspectKind } from '../../pure/entities';
import type { MaskMode } from '../../pure/program';
import { useT } from '../common';
import { KIND_ICON } from './steps';

interface Props {
  poolMenuLesson: Lesson | undefined;
  poolMenuRowId: Id | null;
  poolMenuRowMode: MaskMode | undefined;
  running: boolean;
  container: HTMLElement | null;
  editLesson: (lessonId: Id) => void;
  inspect: (kind: InspectKind, id: string) => void;
  /** Opens the problem list on this lesson (K3). */
  why: (lessonId: Id) => void;
  setPoolMenuRowMode: (mode: MaskMode | undefined) => void;
}

export default function PoolMenu({
  poolMenuLesson,
  poolMenuRowId,
  poolMenuRowMode,
  running,
  container,
  editLesson,
  inspect,
  why,
  setPoolMenuRowMode,
}: Props) {
  const t = useT();
  return (
    <ContextMenu.Portal container={container}>
      <ContextMenu.Content className="menu" collisionPadding={8}>
        {/* FIRST on a card that is not on the grid: why it is not, and what
            frees a place for it (K3, 2026-11-16). */}
        <ContextMenu.Item
          className="menu-item"
          disabled={poolMenuLesson === undefined}
          onSelect={() => poolMenuLesson !== undefined && why(poolMenuLesson.id)}
        >
          <CircleHelp size={15} strokeWidth={2} aria-hidden="true" />
          {t('Neden yerleşmedi?')}
        </ContextMenu.Item>
        <ContextMenu.Separator className="menu-sep" />
        <ContextMenu.Item className="menu-item" disabled>
          <Trash2 size={15} strokeWidth={2} aria-hidden="true" />
          {t('Havuza kaldır')}
        </ContextMenu.Item>
        <ContextMenu.Item
          className="menu-item"
          disabled={poolMenuLesson === undefined}
          onSelect={() => poolMenuLesson !== undefined && editLesson(poolMenuLesson.id)}
        >
          <Pencil size={15} strokeWidth={2} aria-hidden="true" />
          {t('Dersi düzenle')}
        </ContextMenu.Item>
        <ContextMenu.Item
          className="menu-item"
          disabled={poolMenuLesson === undefined}
          onSelect={() =>
            poolMenuLesson !== undefined && inspect('teacher', poolMenuLesson.teacherId)
          }
        >
          {KIND_ICON.teacher}
          {t('Öğretmeni düzenle')}
        </ContextMenu.Item>
        <ContextMenu.Item
          className="menu-item"
          disabled={poolMenuLesson === undefined}
          onSelect={() => poolMenuLesson !== undefined && inspect('class', poolMenuLesson.classId)}
        >
          {KIND_ICON.class}
          {t('Sınıfı düzenle')}
        </ContextMenu.Item>
        <ContextMenu.Separator className="menu-sep" />
        <ContextMenu.Item className="menu-item" disabled>
          <Pin size={15} aria-hidden="true" />
          {t('Dersi buraya sabitle')}
        </ContextMenu.Item>
        <ContextMenu.Item className="menu-item" disabled>
          <Pin size={15} strokeWidth={2} aria-hidden="true" />
          {t('Toplu sabitle')}
        </ContextMenu.Item>
        {poolMenuRowId !== null && (
          <>
            <ContextMenu.Separator className="menu-sep" />
            <ContextMenu.Sub>
              <ContextMenu.SubTrigger className="menu-item" disabled={running}>
                <Eye size={15} strokeWidth={2} aria-hidden="true" />
                {t('Geçici görünüm')}
              </ContextMenu.SubTrigger>
              <ContextMenu.Portal container={container}>
                <ContextMenu.SubContent className="menu" sideOffset={4}>
                  <ContextMenu.Item
                    className="menu-item"
                    disabled={running}
                    onSelect={() =>
                      setPoolMenuRowMode(poolMenuRowMode === 'ghost' ? undefined : 'ghost')
                    }
                  >
                    <Eye size={15} aria-hidden="true" />
                    {poolMenuRowMode === 'ghost' ? t('Satırı geri yükle') : t('Satırı soluklaştır')}
                  </ContextMenu.Item>
                  <ContextMenu.Item
                    className="menu-item"
                    disabled={running}
                    onSelect={() => setPoolMenuRowMode('hidden')}
                  >
                    <EyeOff size={15} aria-hidden="true" />
                    {t('Satırı gizle')}
                  </ContextMenu.Item>
                </ContextMenu.SubContent>
              </ContextMenu.Portal>
            </ContextMenu.Sub>
          </>
        )}
      </ContextMenu.Content>
    </ContextMenu.Portal>
  );
}
