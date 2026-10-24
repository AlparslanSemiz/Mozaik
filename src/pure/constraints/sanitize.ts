// `sanitize`: run on every load and every settings change, so an orphan id or
// an out-of-range placement never reaches the grid (pitfalls 4, 5 and 6).

import { cleanEmail } from '../../leaf/email';
import {
  type Id,
  type Refusal,
  type Relaxation,
  type State,
  clampBlocks,
  hasTwoSubjects,
  parseKey,
} from '../../leaf/model';
import { blankProgram } from '../grid';

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
  const sourcePrograms =
    Array.isArray(d.programs) && d.programs.length > 0 ? d.programs : [blankProgram()];
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

      const parts = parseKey(key);
      const lesson = lessonById.get(lessonId);
      if (parts === null) {
        programChanged = true;
        continue;
      }
      const { id: classId, day, hour } = parts;
      if (
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
    const parts = parseKey(key);
    if (parts === null) {
      changed = true;
      continue;
    }
    const { id: entityId, day, hour } = parts;

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

  // The answers (schema v15) name teachers, lessons, days and hours like the
  // grid does, and are cleaned the same way: one whose teacher or lesson was
  // deleted, or whose day or hour is gone, is dropped (pitfalls 4 and 5).
  const lessonIds = new Set(lessons.map((x) => x.id));
  const inWeek = (day: number, hour?: number) =>
    Number.isInteger(day) &&
    day >= 0 &&
    day < dayCount &&
    (hour === undefined || (Number.isInteger(hour) && hour >= 0 && hour < hourCount));
  const given = d.answers ?? { accepted: [], refused: [] };
  const answerOk = (x: Relaxation | Refusal): boolean => {
    if ('teacherId' in x && !teacherIds.has(x.teacherId)) return false;
    if ('lessonId' in x && !lessonIds.has(x.lessonId)) return false;
    if ('hour' in x && !inWeek(x.day, x.hour)) return false;
    if ('hours' in x && x.kind === 'teacherHours' && !x.hours.every((h) => inWeek(x.day, h)))
      return false;
    if ('day' in x && !inWeek(x.day)) return false;
    return true;
  };
  const accepted = given.accepted.filter(answerOk);
  const refused = given.refused.filter(answerOk);
  let answers = given;
  if (
    d.answers === undefined ||
    accepted.length !== given.accepted.length ||
    refused.length !== given.refused.length
  ) {
    answers = { accepted, refused };
    changed = true;
  }

  // A relation lives only while both of its lessons do, and one pair is
  // said once: a lesson deleted, directly or with its class or teacher, takes
  // its relations with it.
  const givenRelations = d.relations ?? [];
  const seenPairs = new Set<string>();
  const relations = givenRelations.filter((r) => {
    const [a, b] = r.lessonIds;
    if (a === b || !lessonIds.has(a) || !lessonIds.has(b)) return false;
    const pair = `${r.kind}|${[a, b].sort().join('|')}`;
    if (seenPairs.has(pair)) return false;
    seenPairs.add(pair);
    return true;
  });
  if (d.relations === undefined || relations.length !== givenRelations.length) changed = true;

  // An address (schema v17) never keeps a line break or a control character:
  // it ends up in a `mailto:`, and a break there ends the address and starts
  // something the user never typed. Whatever else was typed stays as typed.
  let teachers = d.teachers;
  if (teachers.some((t) => t.email !== cleanEmail(t.email))) {
    teachers = teachers.map((t) =>
      t.email === cleanEmail(t.email) ? t : { ...t, email: cleanEmail(t.email) },
    );
    changed = true;
  }

  if (!changed) return d;
  return {
    ...d,
    teachers,
    classes,
    lessons,
    unavailable,
    programs,
    activeProgramId,
    answers,
    relations: relations.length === givenRelations.length ? givenRelations : relations,
  };
}
