import type { Id, ProgramVariant, State } from '../types';

export const DEFAULT_PROGRAM_ID = 'program-1';
export const DEFAULT_PROGRAM_NAME = 'Program 1';

export function blankProgram(
  id: Id = DEFAULT_PROGRAM_ID,
  name = DEFAULT_PROGRAM_NAME,
): ProgramVariant {
  return { id, name, placements: {}, pinned: {} };
}

/** State is sanitized on every entrance; this fallback only keeps bad callers safe. */
export function activeProgram(d: State): ProgramVariant {
  return d.programs.find((program) => program.id === d.activeProgramId) ?? d.programs[0] ?? blankProgram();
}

export const activePlacements = (d: State): Record<string, Id> => activeProgram(d).placements;
export const activePinned = (d: State): Record<string, 1> => activeProgram(d).pinned;

export function updateActiveProgram(
  d: State,
  update: (program: ProgramVariant) => ProgramVariant,
): State {
  const current = activeProgram(d);
  const next = update(current);
  if (next === current) return d;
  return {
    ...d,
    programs: d.programs.map((program) => (program.id === current.id ? next : program)),
  };
}

export function replaceActiveGrid(
  d: State,
  fields: Partial<Pick<ProgramVariant, 'placements' | 'pinned'>>,
): State {
  return updateActiveProgram(d, (program) => ({ ...program, ...fields }));
}

export function mapProgramGrids(
  d: State,
  update: (program: ProgramVariant) => ProgramVariant,
): State {
  const programs = d.programs.map(update);
  return programs.every((program, index) => program === d.programs[index]) ? d : { ...d, programs };
}

export function nextProgramName(programs: readonly ProgramVariant[]): string {
  const used = new Set(programs.map((program) => program.name.trim().toLocaleLowerCase('tr')));
  let number = 1;
  while (used.has(`program ${number}`.toLocaleLowerCase('tr'))) number++;
  return `Program ${number}`;
}

export function validProgramName(
  programs: readonly ProgramVariant[],
  name: string,
  exceptId?: Id,
): string | null {
  const clean = name.trim();
  if (clean === '') return null;
  const key = clean.toLocaleLowerCase('tr');
  return programs.some(
    (program) => program.id !== exceptId && program.name.trim().toLocaleLowerCase('tr') === key,
  )
    ? null
    : clean;
}

export function addProgram(
  d: State,
  program: ProgramVariant,
  activate = true,
): State {
  const name = validProgramName(d.programs, program.name);
  if (name === null || d.programs.some((item) => item.id === program.id)) return d;
  return {
    ...d,
    programs: [...d.programs, { ...program, name }],
    activeProgramId: activate ? program.id : d.activeProgramId,
  };
}

export function renameProgram(d: State, id: Id, name: string): State {
  const clean = validProgramName(d.programs, name, id);
  if (clean === null) return d;
  return {
    ...d,
    programs: d.programs.map((program) =>
      program.id === id && program.name !== clean ? { ...program, name: clean } : program,
    ),
  };
}

export function removeProgram(d: State, id: Id): State {
  if (d.programs.length <= 1) return d;
  const index = d.programs.findIndex((program) => program.id === id);
  if (index < 0) return d;
  const programs = d.programs.filter((program) => program.id !== id);
  const activeProgramId =
    d.activeProgramId === id
      ? programs[Math.min(index, programs.length - 1)]!.id
      : d.activeProgramId;
  return { ...d, programs, activeProgramId };
}

export function switchProgram(d: State, id: Id): State {
  if (id === d.activeProgramId || !d.programs.some((program) => program.id === id)) return d;
  return { ...d, activeProgramId: id };
}
