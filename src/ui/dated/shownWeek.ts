// Which dated week the Program grid draws instead of the base week, or none.
// A position, held in memory only: a reload is back on the base week, which
// stays the one the grid edits (v18, "Temel haftaya dön").

import { useSyncExternalStore } from 'react';

let week: string | null = null;
const heard = new Set<() => void>();

export function showWeek(iso: string | null) {
  week = iso;
  heard.forEach((f) => f());
}

const listen = (f: () => void) => {
  heard.add(f);
  return () => heard.delete(f);
};
const read = () => week;

export function useShownWeek(): string | null {
  return useSyncExternalStore(listen, read);
}
