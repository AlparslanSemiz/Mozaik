// A lesson sitting on an hour that was closed AFTER it was placed. Nothing is
// deleted — it is reported, and the reader decides.

import {
  closedConflicts,
  place,
  sanitize,
  buildIndex,
} from '../index';
import { activeProgram } from '../../programs';
import type { State } from '../../types';
import { build } from '../../testing/constraintFixture';

describe('closedConflicts', () => {
  /** Puts x1 (MÇ, 510, room A) on Monday hour 0. */
  function laidOut(): State {
    const d = build();
    return place(d, 'x1', 0, 0);
  }

  it('çakışma yokken boş dizi döndürüyor', () => {
    expect(closedConflicts(laidOut(), buildIndex(laidOut()))).toEqual([]);
  });

  it('öğretmen sonradan kapatılınca yakalıyor ve dersi SİLMİYOR', () => {
    const d = laidOut();
    const closed: State = { ...d, unavailable: { ...d.unavailable, 'oMC|0|0': 1 } };

    const found = closedConflicts(closed, buildIndex(closed));
    expect(found).toHaveLength(1);
    expect(found[0]!.reason).toBe('MÇ Pazartesi 1 saatinde müsait değil');
    expect(found[0]!.lessonId).toBe('x1');
    // The whole point: nothing is removed.
    expect(activeProgram(closed).placements['s510|0|0']).toBe('x1');
  });

  it('sınıf kapatılınca yakalıyor', () => {
    const d = laidOut();
    const closed: State = { ...d, unavailable: { ...d.unavailable, 's510|0|0': 1 } };
    const found = closedConflicts(closed, buildIndex(closed));
    expect(found).toHaveLength(1);
    expect(found[0]!.reason).toBe('510 sınıfı Pazartesi 1 saatinde kapalı');
  });

  it('derslik kapatılınca yakalıyor', () => {
    const d = laidOut();
    const closed: State = { ...d, unavailable: { ...d.unavailable, 'dA|0|0': 1 } };
    const found = closedConflicts(closed, buildIndex(closed));
    expect(found).toHaveLength(1);
    expect(found[0]!.reason).toBe('A dersliği Pazartesi 1 saatinde kapalı');
  });

  it('bloğun yalnız ortası kapatılsa da o saat yakalanıyor', () => {
    // x3 is a 2-hour block; closing only its second hour must still show up.
    let d = build();
    d = place(d, 'x3', 0, 1);
    const closed: State = { ...d, unavailable: { 'oAV|0|2': 1 } };

    const found = closedConflicts(closed, buildIndex(closed));
    expect(found).toHaveLength(1);
    expect(found[0]!.hour).toBe(2);
  });

  it('sanitize kapalı saatteki dersi TEMİZLEMİYOR', () => {
    // Deleting here is exactly what must not happen: availability is edited
    // after the timetable is laid out and a wrong click would cost a lesson.
    const d = laidOut();
    const closed: State = { ...d, unavailable: { 'oMC|0|0': 1 } };
    expect(activeProgram(sanitize(closed)).placements['s510|0|0']).toBe('x1');
  });

  it('kapalı ama boş saat çakışma değil', () => {
    const d = build();
    const closed: State = { ...d, unavailable: { 'oMC|0|0': 1 } };
    expect(closedConflicts(closed, buildIndex(closed))).toEqual([]);
  });

  it('birden çok çakışma gün ve saate göre sıralı geliyor', () => {
    let d = build();
    d = place(d, 'x1', 1, 2);
    d = place(d, 'x2', 0, 1);
    const closed: State = { ...d, unavailable: { 'oMC|1|2': 1, 'oMC|0|1': 1 } };

    const found = closedConflicts(closed, buildIndex(closed));
    expect(found.map((c) => [c.day, c.hour])).toEqual([
      [0, 1],
      [1, 2],
    ]);
  });
});

// Moving a placed lesson is `removeBlock` then `place`, in one step. The whole
// thing rests on one claim: with the source block LIFTED, the lesson no longer
// blocks itself. Without it, hard constraint 2 (the class is busy) and 5 (the
// teacher is in another class) both see the lesson's own cells and it could not
// even be dropped back where it came from.
