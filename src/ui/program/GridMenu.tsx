// The grid's right-click menu: a card, a row or day heading, or a column.
// What it reads about its target is `describeMenu` in pure/program; this file
// only draws it and hands each choice back to Program.

import * as ContextMenu from '@radix-ui/react-context-menu';
import { Eye, EyeOff, Move, Pencil, Pin, PinOff, Trash2 } from 'lucide-react';
import type { Id } from '../../leaf/model';
import type { InspectKind } from '../../pure/entities';
import type { PinScope } from '../../pure/constraints';
import type { MaskMode, MenuFacts, MenuTarget } from '../../pure/program';
import type { View } from '../../platform/prefs';
import { useT } from '../common';
import { KIND_ICON } from './steps';

interface Props {
  facts: MenuFacts;
  menuTarget: MenuTarget | null;
  view: View;
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
  toggleScope: (scope: PinScope) => void;
  setMenuRowMode: (mode: MaskMode | undefined) => void;
  setMenuDayMode: (mode: MaskMode | undefined) => void;
}

export default function GridMenu({
  facts,
  menuTarget,
  view,
  running,
  container,
  cellRemove,
  cellPick,
  editLesson,
  inspect,
  togglePin,
  toggleScope,
  setMenuRowMode,
  setMenuDayMode,
}: Props) {
  const t = useT();
  const {
    at: menuAt,
    rowId: menuRowId,
    day: menuDay,
    pinned: menuPinned,
    lessonId: menuLessonId,
    lesson: menuLesson,
    cellMasked: menuCellMasked,
    rowMode: menuRowMode,
    dayMode: menuDayMode,
  } = facts;

  /**
   * "Put this row (or this day) aside for a moment."
   *
   * Written once and drawn in two places: flat on a row or day heading, where
   * the whole menu is two lines long, and one step in on a CARD, whose menu
   * already asks seven other questions. Same items either way — a Radix
   * `Item` is the same component in a `Content` and in a `SubContent`.
   *
   * "ghostla" is gone: it was an English verb wearing a Turkish suffix, in a
   * program whose one language rule is that the interface is Turkish and the
   * code is English. The MODE is still `ghost` in programMask.ts, because that
   * is code.
   */
  const maskItems = (
    <>
      {menuRowId !== null && (
        <>
          <ContextMenu.Item
            className="menu-item"
            disabled={running}
            onSelect={() => setMenuRowMode(menuRowMode === 'ghost' ? undefined : 'ghost')}
          >
            <Eye size={15} aria-hidden="true" />
            {menuRowMode === 'ghost' ? t('Satırı geri yükle') : t('Satırı soluklaştır')}
          </ContextMenu.Item>
          <ContextMenu.Item
            className="menu-item"
            disabled={running}
            onSelect={() => setMenuRowMode('hidden')}
          >
            <EyeOff size={15} aria-hidden="true" />
            {t('Satırı gizle')}
          </ContextMenu.Item>
        </>
      )}
      {menuDay !== null && (
        <>
          <ContextMenu.Item
            className="menu-item"
            disabled={running}
            onSelect={() => setMenuDayMode(menuDayMode === 'ghost' ? undefined : 'ghost')}
          >
            <Eye size={15} aria-hidden="true" />
            {menuDayMode === 'ghost' ? t('Günü geri yükle') : t('Günü soluklaştır')}
          </ContextMenu.Item>
          <ContextMenu.Item
            className="menu-item"
            disabled={running}
            onSelect={() => setMenuDayMode('hidden')}
          >
            <EyeOff size={15} aria-hidden="true" />
            {t('Günü gizle')}
          </ContextMenu.Item>
        </>
      )}
    </>
  );

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
              disabled={
                menuPinned ||
                menuRowMode !== undefined ||
                menuDayMode !== undefined ||
                menuCellMasked ||
                running
              }
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
              disabled={
                menuPinned ||
                menuRowMode !== undefined ||
                menuDayMode !== undefined ||
                menuCellMasked
              }
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
            <ContextMenu.Item
              className="menu-item"
              disabled={menuRowMode !== undefined || menuDayMode !== undefined || menuCellMasked}
              onSelect={togglePin}
            >
              {menuPinned ? (
                <PinOff size={15} aria-hidden="true" />
              ) : (
                <Pin size={15} aria-hidden="true" />
              )}
              {menuPinned ? t('Sabitlemeyi kaldır') : t('Dersi buraya sabitle')}
            </ContextMenu.Item>
          </>
        )}

        {menuAt !== null ? (
          /* ...and the three that lock MANY hours at once stay one step
             in. They are the rarer question and the dangerous one: a
             click here can freeze a whole day. */
          <ContextMenu.Sub>
            <ContextMenu.SubTrigger
              className="menu-item"
              disabled={menuRowMode !== undefined || menuDayMode !== undefined || menuCellMasked}
            >
              <Pin size={15} strokeWidth={2} aria-hidden="true" />
              {t('Toplu sabitle')}
            </ContextMenu.SubTrigger>
            <ContextMenu.Portal container={container}>
              <ContextMenu.SubContent className="menu" sideOffset={4}>
                <ContextMenu.Item
                  className="menu-item"
                  onSelect={() =>
                    toggleScope({
                      kind: 'row',
                      view,
                      rowId: menuAt.rowId,
                    })
                  }
                >
                  <Pin size={15} aria-hidden="true" />
                  {t('Satırı sabitle / kaldır')}
                </ContextMenu.Item>
                <ContextMenu.Item
                  className="menu-item"
                  onSelect={() =>
                    toggleScope({
                      kind: 'column',
                      day: menuAt.day,
                      hour: menuAt.hour,
                    })
                  }
                >
                  <Pin size={15} aria-hidden="true" />
                  {t('Sütunu sabitle / kaldır')}
                </ContextMenu.Item>
                <ContextMenu.Item
                  className="menu-item"
                  onSelect={() => toggleScope({ kind: 'day', day: menuAt.day })}
                >
                  <Pin size={15} aria-hidden="true" />
                  {t('Günü sabitle / kaldır')}
                </ContextMenu.Item>
              </ContextMenu.SubContent>
            </ContextMenu.Portal>
          </ContextMenu.Sub>
        ) : menuTarget?.kind === 'row' ? (
          <ContextMenu.Item
            className="menu-item"
            disabled={menuRowMode !== undefined}
            onSelect={() =>
              toggleScope({
                kind: 'row',
                view,
                rowId: menuTarget.rowId,
              })
            }
          >
            <Pin size={15} aria-hidden="true" />
            {t('Satırı sabitle / kaldır')}
          </ContextMenu.Item>
        ) : menuTarget?.kind === 'day' ? (
          <ContextMenu.Item
            className="menu-item"
            disabled={menuDayMode !== undefined}
            onSelect={() => toggleScope({ kind: 'day', day: menuTarget.day })}
          >
            <Pin size={15} aria-hidden="true" />
            {t('Günü sabitle / kaldır')}
          </ContextMenu.Item>
        ) : menuTarget?.kind === 'column' ? (
          <ContextMenu.Item
            className="menu-item"
            disabled={menuDayMode !== undefined}
            onSelect={() =>
              toggleScope({
                kind: 'column',
                day: menuTarget.day,
                hour: menuTarget.hour,
              })
            }
          >
            <Pin size={15} aria-hidden="true" />
            {t('Sütunu sabitle / kaldır')}
          </ContextMenu.Item>
        ) : null}

        {(menuRowId !== null || menuDay !== null) && menuTarget?.kind !== 'column' && (
          <>
            <ContextMenu.Separator className="menu-sep" />
            {menuAt !== null ? (
              <ContextMenu.Sub>
                <ContextMenu.SubTrigger className="menu-item" disabled={running}>
                  <Eye size={15} strokeWidth={2} aria-hidden="true" />
                  {t('Geçici görünüm')}
                </ContextMenu.SubTrigger>
                <ContextMenu.Portal container={container}>
                  <ContextMenu.SubContent className="menu" sideOffset={4}>
                    {maskItems}
                  </ContextMenu.SubContent>
                </ContextMenu.Portal>
              </ContextMenu.Sub>
            ) : (
              maskItems
            )}
          </>
        )}
      </ContextMenu.Content>
    </ContextMenu.Portal>
  );
}
