// Two lessons that may not share a day (State.relations).

import type { Id, Relation, State } from '../../leaf/model';
import { newId } from './identity';

// --------------------------------------------------------------- relations

/**
 * The lessons that may not share a day with `lessonId`, each with the
 * relation that says so. The relation goes both ways, so it is found from
 * either end.
 */
export function notSameDayOf(d: State, lessonId: Id): Array<{ relationId: Id; lessonId: Id }> {
  return d.relations.flatMap((r) => {
    if (r.kind !== 'notSameDay') return [];
    const [a, b] = r.lessonIds;
    if (a === lessonId) return [{ relationId: r.id, lessonId: b }];
    if (b === lessonId) return [{ relationId: r.id, lessonId: a }];
    return [];
  });
}

/** "These two lessons may not share a day." Nothing new if it is said already or names one lesson twice. */
export function addNotSameDay(d: State, a: Id, b: Id): State {
  if (a === b) return d;
  const lessons = new Set(d.lessons.map((x) => x.id));
  if (!lessons.has(a) || !lessons.has(b)) return d;
  if (notSameDayOf(d, a).some((x) => x.lessonId === b)) return d;
  const relation: Relation = { id: newId(), kind: 'notSameDay', lessonIds: [a, b] };
  return { ...d, relations: [...d.relations, relation] };
}

export function removeRelation(d: State, relationId: Id): State {
  const relations = d.relations.filter((r) => r.id !== relationId);
  return relations.length === d.relations.length ? d : { ...d, relations };
}
