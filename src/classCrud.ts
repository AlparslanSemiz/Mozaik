// Classes: add, edit, delete. A class carries its room as a fixed field and its
// own colour, and both are set here rather than picked later.

import { sanitize } from './constraints';
import { newId } from './ids';
import { firstFreeColor } from './palette';
import type { ClassGroup, Id, State } from './types';

export function addClass(d: State, name: string, roomId: Id | null): State {
  const created: ClassGroup = {
    id: newId(),
    name: name.trim(),
    roomId,
    color: firstFreeColor(d.classes.map((x) => x.color)),
    // Nothing is guessed: null means "use the school's number".
    maxSameLessonPerDay: null,
  };
  return { ...d, classes: [...d.classes, created] };
}

export function updateClass(d: State, id: Id, fields: Partial<ClassGroup>): State {
  return { ...d, classes: d.classes.map((x) => (x.id === id ? { ...x, ...fields, id } : x)) };
}

// sanitize(): the class's lessons go with it, and their placements with them.
export function deleteClass(d: State, id: Id): State {
  return sanitize({ ...d, classes: d.classes.filter((x) => x.id !== id) });
}
