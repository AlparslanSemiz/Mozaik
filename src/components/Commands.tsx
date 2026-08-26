/**
 * What the palette can do, built from the timetable that is actually open.
 *
 * It lives here rather than in App for one mechanical reason: half of these
 * commands open the entity sheet, `useInspect()` only works inside
 * `InspectorProvider`, and App is the component that RENDERS that provider —
 * a hook cannot reach a context its own component provides.
 *
 * Order is the answer to "what did somebody press Ctrl+K for": sections
 * first (they are the most-used and the shortest to type), then the actions,
 * then every teacher, class and room by name. Lessons are last and searchable
 * but not listed first: there are 99 of them and they are found by the name of
 * one of their two ends.
 */
import { useMemo } from 'react';
import {
  BookOpen,
  DoorOpen,
  GraduationCap,
  Play,
  Save,
  Users,
} from 'lucide-react';
import Palette from './Palette';
import type { Command } from './Palette';
import { useInspect } from './Inspector';
import { paletteColor } from '../palette';
import type { State } from '../types';
import type { Tab, ToolState } from '../toolState';

interface Section {
  id: Tab;
  label: string;
  icon: React.ReactElement;
}

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  state: State;
  ui: ToolState;
  /** Navigation, not `ui.setTab`: App wraps the tab change in a view
      transition, and a destination reached from here has to move like one
      reached from the strip. */
  go: (next: Tab) => void;
  sections: Section[];
  /** The handful of things worth doing without finding the button first. */
  actions: Array<{ id: string; label: string; hint?: string; run: () => void }>;
}

/** A small square of the entity's own colour — the way the grid names it. */
function Dot({ color }: { color: number }) {
  return <span className="palette-dot" style={{ background: paletteColor(color) }} />;
}

export default function Commands({ open, setOpen, state, ui, go, sections, actions }: Props) {
  const inspect = useInspect();

  const commands = useMemo<Command[]>(() => {
    const out: Command[] = sections.map((s, i) => ({
      id: `tab-${s.id}`,
      label: s.label,
      group: 'Git',
      hint: `Alt+${i + 1}`,
      icon: s.icon,
      run: () => go(s.id),
    }));

    for (const a of actions) {
      out.push({
        id: `do-${a.id}`,
        label: a.label,
        group: 'Yap',
        // Spread rather than `hint: a.hint`: `exactOptionalPropertyTypes` is on,
        // so an explicit `undefined` is not the same as an absent key.
        ...(a.hint === undefined ? {} : { hint: a.hint }),
        icon: <Play size={16} strokeWidth={2} />,
        run: a.run,
      });
    }

    for (const t of state.teachers) {
      out.push({
        id: `t-${t.id}`,
        label: `${t.short} — ${t.name}`,
        group: 'Öğretmenler',
        extra: t.subject,
        hint: t.subject,
        icon: <Dot color={t.color} />,
        run: () => inspect('teacher', t.id),
      });
    }

    for (const c of state.classes) {
      const room = state.rooms.find((r) => r.id === c.roomId);
      out.push({
        id: `c-${c.id}`,
        label: `${c.name} sınıfı`,
        group: 'Sınıflar',
        extra: room?.name ?? '',
        hint: room === undefined ? 'derslik yok' : `${room.name} dersliği`,
        icon: <Dot color={c.color} />,
        run: () => inspect('class', c.id),
      });
    }

    for (const r of state.rooms) {
      const count = state.classes.filter((c) => c.roomId === r.id).length;
      out.push({
        id: `r-${r.id}`,
        label: `${r.name} dersliği`,
        group: 'Derslikler',
        hint: `${count} sınıf`,
        icon: <DoorOpen size={16} strokeWidth={2} />,
        run: () => inspect('room', r.id),
      });
    }

    return out;
  }, [state, ui, go, sections, actions, inspect]);

  return <Palette open={open} onOpenChange={setOpen} commands={commands} />;
}

/** Icons the palette uses for the three entity groups, exported for reuse. */
export const GROUP_ICONS = {
  teacher: <GraduationCap size={16} strokeWidth={2} />,
  class: <Users size={16} strokeWidth={2} />,
  lesson: <BookOpen size={16} strokeWidth={2} />,
  save: <Save size={16} strokeWidth={2} />,
};
