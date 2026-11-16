// The grid's right-click menu, on a card. Headings open nothing since
// 2026-11-16 (Sadeleşme K7): their bulk pins and the temporary view are gone.
// What it reads about its target is `describeMenu` in pure/program; this file
// only draws it and hands each choice back to Program.

import * as ContextMenu from '@radix-ui/react-context-menu';
import { Move, Pencil, Pin, PinOff, Trash2 } from 'lucide-react';
import type { Id } from '../../leaf/model';
import type { InspectKind } from '../../pure/entities';
import type { MenuFacts } from '../../pure/program';
import { useT } from '../common';
import { KIND_ICON } from './steps';

interface Props {
  facts: MenuFacts;
  /** The solver is rewriting the grid: the view-changing items wait. */
  running: boolean;
  /** Where the menu and its submenus are portalled. */
  container: HTMLElement | null;
  cellRemove: (rowId: string, day: number, hour: number) => void;
  /** Pick the block up and move it with the arrow keys (drag.ts `startKeys`). */
  cellPick: (rowId: string, day: number, hour: number) => void;
  editLesson: (lessonId: Id) => void;
  inspect: (kind: InspectKind, id: string) => void;
  togglePin: () => void;
}

export default function GridMenu({
  facts,
  running,
  container,
  cellRemove,
  cellPick,
  editLesson,
  inspect,
  togglePin,
}: Props) {
  const t = useT();
  const { at: menuAt, pinned: menuPinned, lessonId: menuLessonId, lesson: menuLesson } = facts;

  return (
    <ContextMenu.Portal container={container}>
      <ContextMenu.Content className="menu" collisionPadding={8}>
        {menuAt !== null && (
          <>
            {/* The keyboard's way to move a block (KS8): the same pick-up a
                drag makes, walked with the arrows. Started on the next task,
                once the menu has closed; Radix may still be handing focus back, so
                a cancel finds the card by its cell (Program.tsx onCancel). */}
            <ContextMenu.Item
              className="menu-item"
              disabled={menuPinned || running}
              onSelect={() => {
                const { rowId, day, hour } = menuAt;
                setTimeout(() => cellPick(rowId, day, hour), 0);
              }}
            >
              <Move size={15} strokeWidth={2} aria-hidden="true" />
              {t('Taşı')}
              {menuPinned && <span className="menu-why">{t('sabitlenmiş')}</span>}
            </ContextMenu.Item>
            <ContextMenu.Item
              className="menu-item"
              disabled={menuPinned}
              onSelect={() => cellRemove(menuAt.rowId, menuAt.day, menuAt.hour)}
            >
              <Trash2 size={15} strokeWidth={2} aria-hidden="true" />
              {t('Havuza kaldır')}
              {menuPinned && <span className="menu-why">{t('sabitlenmiş')}</span>}
            </ContextMenu.Item>
            <ContextMenu.Item
              className="menu-item"
              disabled={menuLessonId === undefined}
              onSelect={() => menuLessonId !== undefined && editLesson(menuLessonId)}
            >
              <Pencil size={15} strokeWidth={2} aria-hidden="true" />
              {t('Dersi düzenle')}
            </ContextMenu.Item>
            {/* THE TWO ENDS OF THE LESSON, and this is the only way to
                reach the one the grid is NOT drawn along: the row head
                opens the axis you are looking at, and finding the other
                meant switching view and hunting for a name.
                ("dersi düzenle ve öğretmeni düzenleme ve sınıfı
                 düzenlemede her şeyi düzenleyebilelim") */}
            <ContextMenu.Item
              className="menu-item"
              disabled={menuLesson === undefined}
              onSelect={() => menuLesson !== undefined && inspect('teacher', menuLesson.teacherId)}
            >
              {KIND_ICON.teacher}
              {t('Öğretmeni düzenle')}
            </ContextMenu.Item>
            <ContextMenu.Item
              className="menu-item"
              disabled={menuLesson === undefined}
              onSelect={() => menuLesson !== undefined && inspect('class', menuLesson.classId)}
            >
              {KIND_ICON.class}
              {t('Sınıfı düzenle')}
            </ContextMenu.Item>
            <ContextMenu.Separator className="menu-sep" />
            {/* ONE HOUR, back at the top level. It spent a round inside
                the scope submenu, where the commonest lock in the
                program was two clicks and a hover away from the hand
                that wanted it. The card now carries a pin of its own,
                so this is the same question asked the long way — and
                the long way should still put it first. */}
            <ContextMenu.Item className="menu-item" onSelect={togglePin}>
              {menuPinned ? (
                <PinOff size={15} aria-hidden="true" />
              ) : (
                <Pin size={15} aria-hidden="true" />
              )}
              {menuPinned ? t('Sabitlemeyi kaldır') : t('Dersi buraya sabitle')}
            </ContextMenu.Item>
          </>
        )}
      </ContextMenu.Content>
    </ContextMenu.Portal>
  );
}
