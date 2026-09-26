// Which ways go on which worker (platform/relaxPool.ts). The pool itself needs
// a browser and is measured by the real-exe suite; the plan is pure.

import { describe, expect, it } from 'vitest';

import { lines } from './platform/relaxPool';
import type { RelaxFamily } from './pure/relax';

/** Every way, in the order of relaxPool's table. */
const ALL: RelaxFamily[] = [
  'fewTeachers',
  'teacherHours',
  'handFew',
  'handHours',
  'teacherDays',
  'mixed',
  'rules',
  'blockShape',
  'weeklyHours',
  'reassign',
];

describe('lines — yollar worker’lara', () => {
  it('yedi worker’da karma yollar kendi hattında, en az saatin haftasını bekliyor', () => {
    const plan = lines(ALL, 7);
    expect(plan).toHaveLength(7);
    const hand = plan.find((l) => l.families.includes('handFew'));
    expect(hand).toEqual({ families: ['handFew', 'handHours'], after: 'teacherHours' });
    expect(plan.find((l) => l.families.includes('teacherHours'))?.families).toEqual([
      'teacherHours',
    ]);
    expect(plan.filter((l) => l.after !== undefined)).toHaveLength(1);
  });

  it('daha az worker’da karma yollar en az saatin arkasına dönüyor, beklemeden', () => {
    // Six workers is the table as it was before the waiting line: the same
    // six lines, in the same order, so a machine with seven cores or fewer
    // searches exactly as before.
    expect(lines(ALL, 6)).toEqual([
      { families: ['fewTeachers'] },
      { families: ['teacherHours', 'handFew', 'handHours'] },
      { families: ['teacherDays'] },
      { families: ['mixed'] },
      { families: ['rules', 'blockShape', 'weeklyHours'] },
      { families: ['reassign'] },
    ]);
    expect(lines(ALL, 3)).toEqual([
      { families: ['fewTeachers', 'mixed'] },
      { families: ['teacherHours', 'handFew', 'handHours', 'rules', 'blockShape', 'weeklyHours'] },
      { families: ['teacherDays', 'reassign'] },
    ]);
    // One worker: every way, in the table's order.
    expect(lines(ALL, 1)).toEqual([{ families: ALL }]);
  });

  it('beklenen yol aranmıyorsa karma hat hemen başlıyor', () => {
    expect(lines(['handFew', 'handHours', 'rules'], 4)).toEqual([
      { families: ['handFew', 'handHours'] },
      { families: ['rules'] },
    ]);
  });

  it('her yol tam bir kez aranıyor, worker sayısı ne olursa olsun', () => {
    for (let workers = 1; workers <= 12; workers++) {
      const flat = lines(ALL, workers).flatMap((l) => l.families);
      expect([...flat].sort(), `${workers} worker`).toEqual([...ALL].sort());
    }
  });
});
