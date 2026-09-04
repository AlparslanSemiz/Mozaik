// Rooms: add, rename, delete — and the two questions everyone else asks about
// one (which classes sit in it, what is it called).
//
// A room is a CLASS's fixed field, never picked while placing a lesson: two
// classes sharing a room is what makes an hour clash, and that check is the
// whole reason rooms exist here.

import { sanitize } from '../constraints';
import { newId } from './ids';
import type { ClassGroup, Id, State } from '../types';

export function addRoom(d: State, name: string): State {
  return { ...d, rooms: [...d.rooms, { id: newId(), name: name.trim() }] };
}

export function updateRoom(d: State, id: Id, name: string): State {
  return {
    ...d,
    rooms: d.rooms.map((x) => (x.id === id ? { ...x, name: name.trim() } : x)),
  };
}

// Deletions ALWAYS end with sanitize(): the classes bound to this room have to
// let go of it, and an orphan roomId breaks the clash check silently.
export function deleteRoom(d: State, id: Id): State {
  return sanitize({ ...d, rooms: d.rooms.filter((x) => x.id !== id) });
}

/** All classes bound to a room. For feasibility and room clash checks. */
export function roomClasses(d: State, roomId: Id): ClassGroup[] {
  return d.classes.filter((c) => c.roomId === roomId);
}

export function roomName(d: State, roomId: Id | null): string {
  if (roomId == null) return '';
  return d.rooms.find((x) => x.id === roomId)?.name ?? '';
}
