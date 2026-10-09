import { afterEach, describe, expect, it, vi } from 'vitest';
import { sampleState } from './pure/sample';
import {
  PROGRAM_COLOR_KEY,
  normalizeProgramColor,
  programColorIndex,
  readProgramColor,
  writeProgramColor,
} from './platform/prefs/programColor';

describe('Program renk ölçütü', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('dört ölçütü tanır, eksik veya bozuk kaydı öğretmene düşürür', () => {
    for (const mode of ['teacher', 'class', 'room', 'subject'] as const) {
      expect(normalizeProgramColor(mode)).toBe(mode);
    }
    for (const junk of [null, undefined, '', 'öğretmen', 'ROOM', 1, {}]) {
      expect(normalizeProgramColor(junk)).toBe('teacher');
    }
  });

  it('öğretmen ve sınıfın kendi rengini, derslik ve branşın sabit sıra rengini kullanır', () => {
    const state = sampleState();
    const lesson = state.lessons[0]!;
    const teacher = state.teachers.find((x) => x.id === lesson.teacherId)!;
    const group = state.classes.find((x) => x.id === lesson.classId)!;
    const room = state.rooms.find((x) => x.id === group.roomId)!;

    expect(programColorIndex(state, lesson, 'teacher')).toBe(teacher.color);
    expect(programColorIndex(state, lesson, 'class')).toBe(group.color);
    expect(programColorIndex(state, lesson, 'room')).toBe(state.rooms.indexOf(room));
    expect(programColorIndex(state, lesson, 'subject')).toBeGreaterThanOrEqual(0);
    expect(programColorIndex(state, lesson, 'subject')).toBe(
      programColorIndex(state, lesson, 'subject'),
    );
  });

  it("Ayarlar'da olmayan bir branş, adından türeyen sabit bir renk alır", () => {
    const state = sampleState();
    const lesson = state.lessons[0]!;
    const withSubject = (subject: string) => ({
      ...state,
      teachers: state.teachers.map((t) =>
        t.id === lesson.teacherId ? { ...t, subject, subject2: '' } : t,
      ),
    });

    const color = programColorIndex(withSubject('Satranç'), lesson, 'subject');
    // The number itself is the claim: a colour that moved between versions
    // would repaint every imported subject's cards.
    expect(color).toBe(35);
    expect(programColorIndex(withSubject('  SATRANÇ '), lesson, 'subject')).toBe(color);
    expect(programColorIndex(withSubject('Origami'), lesson, 'subject')).not.toBe(color);
  });

  it('cihaz tercihini yazar ve geri okur', () => {
    const values = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    });

    writeProgramColor('room');
    expect(values.get(PROGRAM_COLOR_KEY)).toBe('room');
    expect(readProgramColor()).toBe('room');
  });

  it('localStorage kullanılamadığında çökmez', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('kapalı');
      },
      setItem: () => {
        throw new Error('kapalı');
      },
    });

    expect(readProgramColor()).toBe('teacher');
    expect(() => writeProgramColor('class')).not.toThrow();
  });
});
