// @vitest-environment jsdom

// Text snapshots: the exact sentence, the exact table, the exact skeleton.
//
// WHY SNAPSHOTS AT ALL, when visual regression was deliberately deleted from
// this repository (docs/DECISIONS.md). Because the thing deleted was a picture
// and this is text: a picture diff is 24 PNGs nobody can read and a rebaseline
// that silently accepts everything, a text diff is a sentence you can look at
// and say yes or no to. `toMatchInlineSnapshot` keeps the expected value in
// this file rather than in a folder of .snap files, so reviewing the change
// and reviewing the code are the same act.
//
// WHAT IS WORTH SNAPSHOTTING. Only things where COMPLETENESS is the property
// and no single assertion can state it: every row of the storage table, every
// sentence the refusal can say, the whole skeleton of a printed page. A
// snapshot of a value one assertion could name is a worse assertion.
//
// The numbers are deliberately left out where they vary (character counts),
// and the sentences deliberately keep theirs: a reason with no number in it is
// the defect this tool was written against.

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { blocker, buildIndex, place } from './pure/constraints';
import { DEFAULT_BELL, DEFAULT_LIMITS, DEFAULT_RULES, NO_TEACHER_LIMITS } from './pure/entities';
import { defaultLibrary } from './pure/library';
import { storageReport } from './platform/storageReport';
import AppRoot from './ui/Root';
import { buildReport } from './pure/feasibility';
import { sampleState } from './pure/sample';
import { SCHEMA_VERSION, type State } from './leaf/types';

// jsdom has no ResizeObserver and `scrollFade.ts` uses one. Stubbed exactly as
// App.test.tsx stubs it, and for the same reason: the absence is a jsdom
// limitation, and a guard in shipped code would be a test artefact.
class NoopResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??= NoopResizeObserver as unknown as typeof ResizeObserver;

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean;
}

// ------------------------------------------------------------------ dünya

/**
 * A world whose every refusal can be provoked: two classes sharing a room, a
 * teacher with a consecutive limit, and a short day so a block runs off the end.
 */
function world(): State {
  return {
    schemaVersion: SCHEMA_VERSION,
    settings: {
      schoolName: '',
      days: [
        { name: 'Salı', longBreakAfter: 0 },
        { name: 'Çarşamba', longBreakAfter: 0 },
      ],
      hours: ['1', '2', '3'],
      bell: { ...DEFAULT_BELL },
      limits: { ...DEFAULT_LIMITS, maxConsecutive: 1, maxPerDay: 1, maxSameLessonPerDay: 1 },
      rules: { ...DEFAULT_RULES },
      subjects: ['Matematik', 'Fizik'],
      subjectShorts: {},
    },
    rooms: [{ id: 'rA', name: 'A' }],
    teachers: [
      {
        id: 'tMC',
        name: 'Mehmet Çelik',
        short: 'MÇ',
        subject: 'Matematik',
        subject2: '',
        gender: '',
        color: 0,
        limits: { ...NO_TEACHER_LIMITS },
      },
      {
        id: 'tAV',
        name: 'Ayşe Vural',
        short: 'AV',
        subject: 'Fizik',
        subject2: '',
        gender: '',
        color: 1,
        limits: { ...NO_TEACHER_LIMITS },
      },
    ],
    classes: [
      { id: 'c510', name: '510', roomId: 'rA', color: 0, maxSameLessonPerDay: null },
      { id: 'c511', name: '511', roomId: 'rA', color: 1, maxSameLessonPerDay: null },
    ],
    lessons: [
      {
        id: 'l1',
        classId: 'c510',
        teacherId: 'tMC',
        weeklyHours: 4,
        blocks: [2],
        second: false,
        maxPerDay: null,
      },
      {
        id: 'l2',
        classId: 'c511',
        teacherId: 'tMC',
        weeklyHours: 2,
        blocks: [],
        second: false,
        maxPerDay: null,
      },
      {
        id: 'l3',
        classId: 'c511',
        teacherId: 'tAV',
        weeklyHours: 2,
        blocks: [],
        second: false,
        maxPerDay: null,
      },
    ],
    unavailable: {},
    programs: [{ id: '1', name: 'Program 1', placements: {}, pinned: {} }],
    activeProgramId: '1',
    answers: { accepted: [], refused: [] },
  };
}

/** The refusal for one drop, as the bar would print it. */
function reason(d: State, lessonId: string, day: number, hour: number, size?: number): string {
  return blocker(d, buildIndex(d), lessonId, day, hour, size) ?? '(engel yok)';
}

describe('cümle · engelin sebebi', () => {
  it('her ret kodu somut bir cümle veriyor, gün ve saat adıyla', () => {
    // Every sentence in one snapshot on purpose: the rule is "always
    // concrete, never 'çakışma var'", and that is a property of the SET.
    const base = world();
    const dolu = place(base, 'l1', 0, 0); // 510 has MÇ at Salı 1 and 2

    const cumleler = {
      dayEnd: reason(base, 'l1', 0, 2, 2),
      classBusy: reason(dolu, 'l1', 0, 0, 1),
      teacherBusy: reason(dolu, 'l2', 0, 0),
      roomBusy: reason(
        { ...dolu, lessons: dolu.lessons.map((l) => (l.id === 'l3' ? { ...l } : l)) },
        'l3',
        0,
        0,
      ),
      teacherClosed: reason({ ...base, unavailable: { 'tMC|1|0': 1 } }, 'l1', 1, 0, 1),
      classClosed: reason({ ...base, unavailable: { 'c510|1|0': 1 } }, 'l1', 1, 0, 1),
      roomClosed: reason({ ...base, unavailable: { 'rA|1|0': 1 } }, 'l1', 1, 0, 1),
      missing: reason(base, 'yok', 0, 0),
      maxConsecutive: reason(place(base, 'l3', 0, 0), 'l3', 0, 1, 1),
    };

    expect(cumleler).toMatchInlineSnapshot(`
      {
        "classBusy": "510 sınıfının Salı 1 saatinde Matematik var",
        "classClosed": "510 sınıfı Çarşamba 1 saatinde kapalı",
        "dayEnd": "2 saatlik blok güne sığmıyor",
        "maxConsecutive": "AV art arda 1 saatten fazla girmemeli, burada 2 saat olur",
        "missing": "Ders bulunamadı",
        "roomBusy": "A dersliğinde Salı 1 saatinde 510 var",
        "roomClosed": "A dersliği Çarşamba 1 saatinde kapalı",
        "teacherBusy": "MÇ Salı 1 saatinde 510 sınıfında",
        "teacherClosed": "MÇ Çarşamba 1 saatinde müsait değil",
      }
    `);
  });

  it('Kontrol raporunun cümleleri de tam yazılıyor', () => {
    // The longest sentences in the tool and the ones a reader acts on: how
    // many hours short a teacher is, and which lesson cannot be placed.
    const rapor = buildReport(world());

    expect({
      ogretmen: rapor.teachers.map((r) => `${r.level} · ${r.message}`),
      sinif: rapor.classes.map((r) => `${r.level} · ${r.message}`),
      derslik: rapor.rooms.map((r) => `${r.level} · ${r.message}`),
      yerlesemeyen: rapor.unplaceable.map((u) => u.message),
      danisman: rapor.advice.map((a) => `${a.code} · ${a.message}`),
    }).toMatchInlineSnapshot(`
      {
        "danisman": [
          "lessonNeedsMoreDays · 510 · MÇ Matematik haftada 3 kez konacak ama yalnızca 2 gün var; en az bir günde iki kez görülecek.",
          "teacherManyBlockedDays · MÇ yalnızca 2 günde müsait ama bir dersi haftada 3 kez konacak; bir güne iki kez düşebilir.",
        ],
        "derslik": [
          "impossible · A dersliğini 2 sınıf paylaşıyor (510, 511) ve toplam 8 saat ders var. Haftada 6 saati açık, 2 saat fazla.",
        ],
        "ogretmen": [
          "tight · MÇ 6 saat müsait, 6 saat ders yüklenmiş. Zor olacak.",
          "ok · AV 6 saat müsait, 2 saat ders yüklenmiş.",
        ],
        "sinif": [
          "ok · 510 sınıfı: açık olan 6 saatin 4 saati dolu.",
          "ok · 511 sınıfı: açık olan 6 saatin 4 saati dolu.",
        ],
        "yerlesemeyen": [
          "4 saati yerleşmemiş ve koyacak yer yok. Örnek sebep: MÇ art arda 1 saatten fazla girmemeli, burada 2 saat olur",
        ],
      }
    `);
  });
});

// ------------------------------------------------------------------ depo tablosu

describe('cümle · "Veriler nerede" tablosu', () => {
  it('tablonun her satırı, anahtarıyla ve ne olduğuyla', () => {
    // The comment on storageReport says the one thing this table is for is
    // being trusted when somebody asks "is all of it in here?". A key that is
    // written somewhere and missing from this list has hidden for weeks twice.
    // A snapshot is the only shape that states "and nothing else".
    const rows = storageReport(defaultLibrary()).rows.map((r) => `${r.key} · ${r.what}`);

    expect(rows).toMatchInlineSnapshot(`
      [
        "ders-programi · 1. plan",
        "ders-programi-planlar · plan listesi",
        "ders-programi-yedek-0 · bir önceki oturum",
        "ders-programi-yedek-1 · 2 oturum önce",
        "ders-programi-yedek-2 · 3 oturum önce",
        "ders-programi-tema · tema tercihi",
        "ders-programi-dil · dil tercihi",
        "ders-programi-kenar · kenar çubuğu tercihi",
        "ders-programi-olcek · yazı büyüklüğü tercihi",
        "ders-programi-yogunluk · ızgara yoğunluğu tercihi",
        "ders-programi-program-rengi · program kart rengi tercihi",
        "ders-programi-arayuz-yogunluk · arayüz yoğunluğu tercihi",
        "ders-programi-havuz · havuz çekmecesi tercihi",
        "ders-programi-havuz-boy · havuz çekmecesinin boyu",
        "ders-programi-serit · araç şeridi tercihi",
        "ders-programi-serit-gizle · şerit kaydırınca gizlensin mi",
        "ders-programi-musaitlik-saat · müsaitlikte saat gösterimi",
        "ders-programi-hareket · hareket (animasyon) tercihi",
        "ders-programi-tanitim · örnek veri satırı görüldü mü",
        "ders-programi-baski · kâğıt seçenekleri",
        "ders-programi-yenilik-gorulen · görülen sürüm notu",
      ]
    `);
  });
});

// ------------------------------------------------------------------ kâğıt

describe('cümle · basılan sayfanın iskeleti', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    const map = new Map<string, string>();
    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        get length() {
          return map.size;
        },
        clear: () => map.clear(),
        getItem: (k: string) => map.get(k) ?? null,
        key: (i: number) => [...map.keys()][i] ?? null,
        removeItem: (k: string) => void map.delete(k),
        setItem: (k: string, v: string) => void map.set(k, String(v)),
      },
      configurable: true,
      writable: true,
    });
    localStorage.setItem('ders-programi-dil', 'tr');
    localStorage.setItem('ders-programi', JSON.stringify(sampleState()));
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  /** Tags and class names only: the structure, with the school's words out. */
  function skeleton(el: Element, depth = 0): string[] {
    if (depth > 3) return [];
    const out: string[] = [];
    for (const child of el.children) {
      const cls = child.className.toString().trim().split(/\s+/).filter(Boolean).join('.');
      out.push(`${'  '.repeat(depth)}${child.tagName.toLowerCase()}${cls === '' ? '' : `.${cls}`}`);
      out.push(...skeleton(child, depth + 1));
    }
    return out;
  }

  it('bir A4 sayfası hep aynı kutulardan kuruluyor', () => {
    act(() => root.render(<AppRoot />));
    const cikti = [...container.querySelectorAll('button')].find((b) =>
      (b.getAttribute('aria-label') ?? b.textContent ?? '').includes('Çıktı'),
    );
    act(() => {
      cikti?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    const sheet = container.querySelector('.print-sheet');
    expect(sheet, 'Çıktı ekranında .print-sheet yok').not.toBeNull();

    expect(skeleton(sheet!).join('\n')).toMatchInlineSnapshot(`
      "div.print-page
        h3
          span.p-title-main
            span.p-dot
          span.p-title-sub
        table.print
          thead
            tr
          tbody
            tr
            tr
            tr
            tr
            tr
            tr"
    `);
  });
});
