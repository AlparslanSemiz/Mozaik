// The one place deletion logic lives. Called on EVERY load and EVERY settings
// change, so an orphan record can never reach a screen: a placement pointing at
// a deleted lesson, a pin with nothing under it, a closed hour past the end of
// the week, a "second subject" flag on a teacher who has only one.
//
// Returns the SAME object when nothing changed, so no needless re-render.

import { clampBlocks } from '../schedule/blocks';
import { blankProgram } from '../state/programs';
import { hasTwoSubjects } from '../schedule/subjects';
import type { Id, State } from '../types';

// ------------------------------------------------------------ sanitize

/**
 * Deletes overflowing and orphan records. Called on EVERY load and EVERY
 * settings change — deletion logic is not scattered across components.
 *
 * Returns the SAME object when nothing changed (so no needless re-render).
 */
export function sanitize(d: State): State {
  const roomIds = new Set(d.rooms.map((x) => x.id));
  const teacherIds = new Set(d.teachers.map((x) => x.id));
  const dayCount = d.settings.days.length;
  const hourCount = d.settings.hours.length;

  let changed = false;

  // Classes pointing at a deleted room -> roomId null
  let classes = d.classes;
  if (classes.some((c) => c.roomId != null && !roomIds.has(c.roomId))) {
    classes = classes.map((c) =>
      c.roomId != null && !roomIds.has(c.roomId) ? { ...c, roomId: null } : c,
    );
    changed = true;
  }
  const classIds = new Set(classes.map((x) => x.id));

  // Lessons whose class or teacher was deleted
  const kept = d.lessons.filter((x) => classIds.has(x.classId) && teacherIds.has(x.teacherId));
  if (kept.length !== d.lessons.length) changed = true;

  // …and lessons whose SPLIT no longer fits their hours. Nothing else validates
  // block geometry — `blocks` comes out of a backup file raw — and a list that
  // outruns the hours would make `blockPlan` and `placedBlocks` disagree about
  // how many blocks exist.
  //
  // The same pass clears an ORPHAN `second` flag: a lesson marked "taught under
  // the teacher's second subject" whose teacher no longer HAS a second subject.
  // That happens the moment somebody empties the box, and left alone the lesson
  // would keep claiming a subject nobody teaches — the same shape of orphan as
  // a placement pointing at a deleted lesson, and it is cleaned in the same
  // place for the same reason.
  const twoSubjects = new Set(d.teachers.filter(hasTwoSubjects).map((t) => t.id));
  const lessons = kept.map((x) => {
    const blocks = clampBlocks(x.weeklyHours, x.blocks);
    const second = x.second && twoSubjects.has(x.teacherId);
    const sameBlocks =
      Array.isArray(x.blocks) &&
      blocks.length === x.blocks.length &&
      blocks.every((b, i) => b === x.blocks[i]);
    if (sameBlocks && second === x.second) return x;
    changed = true;
    return { ...x, blocks, second };
  });
  const lessonById = new Map(lessons.map((x) => [x.id, x]));

  // Every alternative grid is cleaned against the ONE shared school model.
  // A deleted teacher/class/lesson therefore cannot leave an orphan in a
  // program that happened not to be open when the edit was made.
  const seenIds = new Set<Id>();
  const seenNames = new Set<string>();
  const sourcePrograms = Array.isArray(d.programs) && d.programs.length > 0
    ? d.programs
    : [blankProgram()];
  if (sourcePrograms !== d.programs) changed = true;

  const programs = sourcePrograms.map((program, index) => {
    let programChanged = false;
    let id = typeof program.id === 'string' ? program.id.trim() : '';
    if (id === '' || seenIds.has(id)) {
      const base = `program-${index + 1}`;
      id = base;
      let suffix = 2;
      while (seenIds.has(id)) id = `${base}-${suffix++}`;
      programChanged = true;
    }
    seenIds.add(id);

    let name = typeof program.name === 'string' ? program.name.trim() : '';
    if (name === '') {
      name = `Program ${index + 1}`;
      programChanged = true;
    }
    const baseName = name;
    let nameKey = name.toLocaleLowerCase('tr');
    let suffix = 2;
    while (seenNames.has(nameKey)) {
      name = `${baseName} (${suffix++})`;
      nameKey = name.toLocaleLowerCase('tr');
      programChanged = true;
    }
    seenNames.add(nameKey);

    const placements: Record<string, Id> = {};
    for (const key in program.placements) {
      const lessonId = program.placements[key];
      if (lessonId === undefined) continue;

      const parts = key.split('|');
      const classId = parts[0];
      const day = Number(parts[1]);
      const hour = Number(parts[2]);
      const lesson = lessonById.get(lessonId);
      if (
        parts.length !== 3 ||
        classId === undefined ||
        lesson === undefined ||
        lesson.classId !== classId ||
        !Number.isInteger(day) ||
        day < 0 ||
        day >= dayCount ||
        !Number.isInteger(hour) ||
        hour < 0 ||
        hour >= hourCount
      ) {
        programChanged = true;
        continue;
      }
      placements[key] = lessonId;
    }

    const pinned: Record<string, 1> = {};
    for (const key in program.pinned) {
      if (placements[key] === undefined) {
        programChanged = true;
        continue;
      }
      pinned[key] = 1;
    }

    if (!programChanged) {
      const samePlacements =
        Object.keys(placements).length === Object.keys(program.placements).length;
      const samePins = Object.keys(pinned).length === Object.keys(program.pinned).length;
      if (samePlacements && samePins) return program;
    }
    changed = true;
    return { id, name, placements, pinned };
  });

  const activeProgramId = programs.some((program) => program.id === d.activeProgramId)
    ? d.activeProgramId
    : programs[0]!.id;
  if (activeProgramId !== d.activeProgramId) changed = true;

  // Closed hours: deleted teacher/class/room, or overflowing day/hour
  const unavailable: Record<string, 1> = {};
  for (const key in d.unavailable) {
    const parts = key.split('|');
    const entityId = parts[0];
    if (parts.length !== 3 || entityId === undefined) {
      changed = true;
      continue;
    }
    const day = Number(parts[1]);
    const hour = Number(parts[2]);

    if (
      !(teacherIds.has(entityId) || classIds.has(entityId) || roomIds.has(entityId)) ||
      !Number.isInteger(day) ||
      day < 0 ||
      day >= dayCount ||
      !Number.isInteger(hour) ||
      hour < 0 ||
      hour >= hourCount
    ) {
      changed = true;
      continue;
    }
    unavailable[key] = 1;
  }

  if (!changed) return d;
  return { ...d, classes, lessons, unavailable, programs, activeProgramId };
}
