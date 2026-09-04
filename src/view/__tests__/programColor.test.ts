import { afterEach, describe, expect, it, vi } from "vitest";
import { sampleState } from "../../state/sample";
import {
  PROGRAM_COLOR_KEY,
  normalizeProgramColor,
  programColorIndex,
  readProgramColor,
  writeProgramColor,
} from "../programColor";

describe("Program renk ölçütü", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("dört ölçütü tanır, eksik veya bozuk kaydı öğretmene düşürür", () => {
    for (const mode of ["teacher", "class", "room", "subject"] as const) {
      expect(normalizeProgramColor(mode)).toBe(mode);
    }
    for (const junk of [null, undefined, "", "öğretmen", "ROOM", 1, {}]) {
      expect(normalizeProgramColor(junk)).toBe("teacher");
    }
  });

  it("öğretmen ve sınıfın kendi rengini, derslik ve branşın sabit sıra rengini kullanır", () => {
    const state = sampleState();
    const lesson = state.lessons[0]!;
    const teacher = state.teachers.find((x) => x.id === lesson.teacherId)!;
    const group = state.classes.find((x) => x.id === lesson.classId)!;
    const room = state.rooms.find((x) => x.id === group.roomId)!;

    expect(programColorIndex(state, lesson, "teacher")).toBe(teacher.color);
    expect(programColorIndex(state, lesson, "class")).toBe(group.color);
    expect(programColorIndex(state, lesson, "room")).toBe(state.rooms.indexOf(room));
    expect(programColorIndex(state, lesson, "subject")).toBeGreaterThanOrEqual(0);
    expect(programColorIndex(state, lesson, "subject")).toBe(
      programColorIndex(state, lesson, "subject"),
    );
  });

  it("cihaz tercihini yazar ve geri okur", () => {
    const values = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    });

    writeProgramColor("room");
    expect(values.get(PROGRAM_COLOR_KEY)).toBe("room");
    expect(readProgramColor()).toBe("room");
  });

  it("localStorage kullanılamadığında çökmez", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new Error("kapalı");
      },
      setItem: () => {
        throw new Error("kapalı");
      },
    });

    expect(readProgramColor()).toBe("teacher");
    expect(() => writeProgramColor("class")).not.toThrow();
  });
});
