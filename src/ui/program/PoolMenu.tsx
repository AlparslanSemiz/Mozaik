// The pool card's right-click menu. The same items as a grid card's, the ones
// that cannot apply to a card that is not on the grid shown disabled, so the
// two menus read alike. Its facts are `poolMenuFacts` in pure/program.

import * as ContextMenu from '@radix-ui/react-context-menu';
import { Pencil, Pin, Trash2 } from 'lucide-react';
import type { Id, Lesson } from '../../leaf/model';
import type { InspectKind } from '../../pure/entities';
import { useT } from '../common';
import { KIND_ICON } from './steps';

interface Props {
  poolMenuLesson: Lesson | undefined;
  container: HTMLElement | null;
  editLesson: (lessonId: Id) => void;
  inspect: (kind: InspectKind, id: string) => void;
}

export default function PoolMenu({ poolMenuLesson, container, editLesson, inspect }: Props) {
  const t = useT();
  return (
    <ContextMenu.Portal container={container}>
      <ContextMenu.Content className="menu" collisionPadding={8}>
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
      </ContextMenu.Content>
    </ContextMenu.Portal>
  );
}
