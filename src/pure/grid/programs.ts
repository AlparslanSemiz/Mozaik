import type { Id, ProgramVariant, State } from '../../leaf/model';

export const DEFAULT_PROGRAM_ID = 'program-1';
const DEFAULT_PROGRAM_NAME = 'Seçenek 1';

export function blankProgram(
  id: Id = DEFAULT_PROGRAM_ID,
  name = DEFAULT_PROGRAM_NAME,
): ProgramVariant {
  return { id, name, placements: {}, pinned: {}, study: {} };
}

/** State is sanitized on every entrance; this fallback only keeps bad callers safe. */
export function activeProgram(d: State): ProgramVariant {
  return (
    d.programs.find((program) => program.id === d.activeProgramId) ??
    d.programs[0] ??
    blankProgram()
  );
}

export const activePlacements = (d: State): Record<string, Id> => activeProgram(d).placements;
export const activePinned = (d: State): Record<string, 1> => activeProgram(d).pinned;
export const activeStudy = (d: State): Record<string, 1> => activeProgram(d).study;

/**
 * The state as the SOLVERS read it: the active program's question-solving
 * hours (v20) are the teacher's closed hours, so laying the rest out again
 * cannot land a lesson on one. Every closed-hour reader the solvers have
 * already looks in `unavailable`, and a study key (`teacher|day|hour`) is the
 * very key a closed hour has. Same object back when there is none, so a
 * week without study hours is searched exactly as before. READ-ONLY: a state
 * made here must never be saved or handed back as a result, or the study
 * hours would turn into closed ones for good (the solver reports from the state
 * it was given).
 */
export function withStudyClosed(d: State): State {
  const study = activeStudy(d);
  if (Object.keys(study).length === 0) return d;
  return { ...d, unavailable: { ...d.unavailable, ...study } };
}

function updateActiveProgram(d: State, update: (program: ProgramVariant) => ProgramVariant): State {
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
  fields: Partial<Pick<ProgramVariant, 'placements' | 'pinned' | 'study'>>,
): State {
  return updateActiveProgram(d, (program) => ({ ...program, ...fields }));
}

/**
 * "Programı boşalt": the active grid goes back to the tray except its pinned
 * cells, which stay with their pins. One rule with no exceptions: nothing
 * takes a pinned block down but unpinning it.
 */
export function keepPinnedOnly(d: State): State {
  const currentPlacements = activePlacements(d);
  return replaceActiveGrid(d, {
    placements: Object.fromEntries(
      Object.keys(activePinned(d))
        .filter((k) => currentPlacements[k] !== undefined)
        .map((k) => [k, currentPlacements[k]!]),
    ),
  });
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
  while (used.has(`seçenek ${number}`.toLocaleLowerCase('tr'))) number++;
  return `Seçenek ${number}`;
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

export function addProgram(d: State, program: ProgramVariant, activate = true): State {
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
