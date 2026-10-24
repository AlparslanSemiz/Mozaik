// Each teacher's, class's and room's open hours against the hours asked of it.

import { t } from '../../leaf/i18n';
import { type Id, type State, parseKey } from '../../leaf/model';
import { type Capacity, type ReportRow, capacityLevel } from './levels';

export function buildCapacity(d: State): Capacity {
  const totalSlots = d.settings.days.length * d.settings.hours.length;

  // Closed hours per entity — one pass over the map. It holds teachers,
  // classes and rooms alike, and each id only ever means one of them.
  const closedCount = new Map<Id, number>();
  for (const key in d.unavailable) {
    const parts = parseKey(key);
    if (parts === null) continue;
    closedCount.set(parts.id, (closedCount.get(parts.id) ?? 0) + 1);
  }

  const teachers: ReportRow[] = d.teachers.map((x) => {
    const capacity = totalSlots - (closedCount.get(x.id) ?? 0);
    const load = d.lessons
      .filter((l) => l.teacherId === x.id)
      .reduce((sum, l) => sum + l.weeklyHours, 0);
    const level = capacityLevel(capacity, load);
    const message =
      level === 'impossible'
        ? t('{kim} {acik} saat müsait, {yuk} saat ders yüklenmiş. {fazla} saat fazla.', {
            kim: x.short,
            acik: capacity,
            yuk: load,
            fazla: load - capacity,
          })
        : level === 'tight'
          ? t('{kim} {acik} saat müsait, {yuk} saat ders yüklenmiş. Zor olacak.', {
              kim: x.short,
              acik: capacity,
              yuk: load,
            })
          : t('{kim} {acik} saat müsait, {yuk} saat ders yüklenmiş.', {
              kim: x.short,
              acik: capacity,
              yuk: load,
            });
    // The NAME alone, since 2026-08-27: "Öğretmen yükü tarafında her öğretmen
    // için çok uzun satır. kısaltmayı gösterme orada." The short is not lost —
    // `message` still opens with it, and that is what the cell's tooltip shows
    // and what Kontrol prints. Rows for classes and rooms were never prefixed
    // this way, so the table is now consistent as well as shorter.
    return { id: x.id, name: x.name, capacity, load, level, message };
  });

  const classes: ReportRow[] = d.classes.map((c) => {
    const capacity = totalSlots - (closedCount.get(c.id) ?? 0);
    const load = d.lessons
      .filter((x) => x.classId === c.id)
      .reduce((sum, x) => sum + x.weeklyHours, 0);
    const level = capacityLevel(capacity, load);
    const message =
      level === 'impossible'
        ? t(
            '{sinif} sınıfına {yuk} saat ders yüklenmiş ama haftada {acik} saati açık. {fazla} saat fazla.',
            {
              sinif: c.name,
              yuk: load,
              acik: capacity,
              fazla: load - capacity,
            },
          )
        : t('{sinif} sınıfı: açık olan {acik} saatin {yuk} saati dolu.', {
            sinif: c.name,
            acik: capacity,
            yuk: load,
          });
    return { id: c.id, name: c.name, capacity, load, level, message };
  });

  // The TOTAL load of the classes sharing a room cannot exceed that room's
  // capacity. This is the most overlooked bottleneck: 4 classes in one room.
  const rooms: ReportRow[] = d.rooms.map((r) => {
    const capacity = totalSlots - (closedCount.get(r.id) ?? 0);
    const sharing = d.classes.filter((c) => c.roomId === r.id);
    const classIds = new Set(sharing.map((c) => c.id));
    const load = d.lessons
      .filter((x) => classIds.has(x.classId))
      .reduce((sum, x) => sum + x.weeklyHours, 0);
    const level = capacityLevel(capacity, load);
    const names = sharing.map((c) => c.name).join(', ');
    const message =
      level === 'impossible'
        ? t(
            '{derslik} dersliğini {n} sınıf paylaşıyor ({hangileri}) ve toplam {yuk} saat ders var. Haftada {acik} saati açık, {fazla} saat fazla.',
            {
              derslik: r.name,
              n: sharing.length,
              hangileri: names,
              yuk: load,
              acik: capacity,
              fazla: load - capacity,
            },
          )
        : t('{derslik} dersliği ({hangileri}): açık olan {acik} saatin {yuk} saati dolu.', {
            derslik: r.name,
            hangileri: names || t('sınıf yok'),
            acik: capacity,
            yuk: load,
          });
    return { id: r.id, name: r.name, capacity, load, level, message };
  });

  return { teachers, classes, rooms };
}
