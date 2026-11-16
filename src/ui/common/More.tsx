// "Daha fazla ▾": the one door for what is used rarely, in the same place on
// every screen (Sadeleşme K1–K8, phase 1, 2026-11-16).
//
// The rule it serves: a screen shows one primary button and a handful of
// controls, and everything else is ONE layer away behind this, at the right
// end of the strip. The same component on every strip, so the door looks the
// same and sits in the same corner wherever he is; phase 3's new tabs reuse it
// unchanged.
//
// A real Radix DropdownMenu: a <button> with `aria-haspopup`, arrow keys walk
// the items, Esc closes, and focus goes back to the button when it closes
// (Radix's own `onCloseAutoFocus`). Items are `menuitem`, `menuitemradio` and
// `menuitemcheckbox`, so the suite and a screen reader find them by name.

import type React from 'react';
import { useRef, useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Check, ChevronDown, ChevronRight, MoreHorizontal } from 'lucide-react';
import { useT } from './T';

const ITEM_ICON = { size: 15, 'aria-hidden': true, focusable: false } as const;

/** The trigger and the menu. `label` defaults to "Daha fazla". */
export function MoreMenu({
  children,
  label = 'Daha fazla',
  disabled = false,
  className = '',
  icon = <MoreHorizontal size={18} aria-hidden="true" focusable="false" />,
  align = 'end',
  dot = false,
  ariaLabel,
}: {
  /** The accessible name when the visible word alone ("?") says too little. */
  ariaLabel?: string;
  children: React.ReactNode;
  /** An unread mark on the door (Ayarlar: a new release note behind it). */
  dot?: boolean;
  label?: string;
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode;
  align?: 'start' | 'end';
}) {
  const t = useT();
  // Radix opens the menu on pointerdown and on Enter, Space or ↓, never on a
  // bare click; a click with no pointer before it is assistive technology
  // pressing the button (Windows UI Automation's Invoke, a screen reader's
  // default action), and it opened nothing (kurulum-windows, 2026-11-16).
  // Such a click opens the menu; it never closes it, so a keyboard Enter that
  // Radix already handled changes nothing.
  const [open, setOpen] = useState(false);
  const pointer = useRef(false);
  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className={`btn more-menu${dot ? ' has-dot' : ''} ${className}`.trim()}
          disabled={disabled}
          onPointerDown={() => {
            pointer.current = true;
          }}
          onClick={() => {
            if (pointer.current) pointer.current = false;
            else setOpen(true);
          }}
          {...(ariaLabel === undefined ? {} : { 'aria-label': t(ariaLabel) })}
        >
          {icon}
          {t(label)}
          <ChevronDown size={15} aria-hidden="true" focusable="false" className="more-caret" />
          {dot && <span className="ribbon-dot" aria-hidden="true" />}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="menu" align={align} sideOffset={5} collisionPadding={8}>
          {children}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export function MoreItem({
  onSelect,
  icon,
  children,
  danger = false,
  disabled = false,
  hint,
}: {
  onSelect: () => void;
  icon?: React.ReactElement | null;
  children: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
  /** A shortcut or a short why, at the right end of the row. */
  hint?: string;
}) {
  return (
    <DropdownMenu.Item
      className={danger ? 'menu-item danger' : 'menu-item'}
      disabled={disabled}
      onSelect={onSelect}
    >
      <span className="menu-mark" aria-hidden="true">
        {icon}
      </span>
      {children}
      {hint !== undefined && <span className="menu-why">{hint}</span>}
    </DropdownMenu.Item>
  );
}

export function MoreSep() {
  return <DropdownMenu.Separator className="menu-sep" />;
}

/** An on/off item: a tick when on, `menuitemcheckbox` to the reader. */
export function MoreCheck({
  checked,
  onChange,
  children,
  disabled = false,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <DropdownMenu.CheckboxItem
      className="menu-item"
      checked={checked}
      disabled={disabled}
      onCheckedChange={(next) => onChange(next === true)}
      // Stays open: the reader sees the tick move, as on a strip toggle.
      onSelect={(e) => e.preventDefault()}
    >
      <span className="menu-mark" aria-hidden="true">
        <DropdownMenu.ItemIndicator>
          <Check {...ITEM_ICON} strokeWidth={2.4} />
        </DropdownMenu.ItemIndicator>
      </span>
      {children}
    </DropdownMenu.CheckboxItem>
  );
}

/** One of several: a radio group with a tick on the current one. */
export function MoreRadio<V extends string>({
  value,
  onChange,
  options,
}: {
  value: V;
  onChange: (next: V) => void;
  options: Array<{ id: V; label: React.ReactNode }>;
}) {
  return (
    <DropdownMenu.RadioGroup value={value} onValueChange={(next) => onChange(next as V)}>
      {options.map((o) => (
        <DropdownMenu.RadioItem key={o.id} className="menu-item" value={o.id}>
          <span className="menu-mark" aria-hidden="true">
            <DropdownMenu.ItemIndicator>
              <Check {...ITEM_ICON} strokeWidth={2.4} />
            </DropdownMenu.ItemIndicator>
          </span>
          {o.label}
        </DropdownMenu.RadioItem>
      ))}
    </DropdownMenu.RadioGroup>
  );
}

/** A second level, for a group that would otherwise make the menu long. */
export function MoreSub({
  label,
  icon,
  children,
  disabled = false,
}: {
  label: React.ReactNode;
  icon?: React.ReactElement | null;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <DropdownMenu.Sub>
      <DropdownMenu.SubTrigger className="menu-item" disabled={disabled}>
        <span className="menu-mark" aria-hidden="true">
          {icon}
        </span>
        {label}
        <ChevronRight size={15} aria-hidden="true" focusable="false" className="menu-why" />
      </DropdownMenu.SubTrigger>
      <DropdownMenu.Portal>
        <DropdownMenu.SubContent className="menu" sideOffset={4} collisionPadding={8}>
          {children}
        </DropdownMenu.SubContent>
      </DropdownMenu.Portal>
    </DropdownMenu.Sub>
  );
}
