// The single line under the toolbar: what it says, and how loudly.
//
// The cheapest of the three view-models to test and the reason the split was
// worth doing: every one of bar.ts's imports is `import type`, so this file
// runs with no React, no DOM and no fixture — just four branches and the
// sentence each of them picks.
//
// `translate('tr', …)` rather than a stub `t`: the keys ARE the Turkish
// sentences (principle 4), so a real translator makes the assertions read as
// the line my father will see. A stub would only prove the slots were filled.

import { translate } from '../../../i18n';
import type { SolverProgress, SolverResult } from '../../../schedule/solver';
import type { SolverRun } from '../../../schedule/useSolver';
import type { State } from '../../../types';
import { describeBar, seconds } from '../bar';

const t = (key: string, vars?: Record<string, string | number>) =>
  translate('tr', key, vars);

/** A SolverRun is three readable fields and three callbacks describeBar never calls. */
function run(fields: Partial<Pick<SolverRun, 'running' | 'progress' | 'result'>>): SolverRun {
  return {
    running: false,
    progress: null,
    result: null,
    start: () => undefined,
    stop: () => undefined,
    clear: () => undefined,
    ...fields,
  };
}

const progress = (fields: Partial<SolverProgress> = {}): SolverProgress => ({
  placedBlocks: 12,
  totalBlocks: 40,
  nodes: 300,
  elapsedMs: 3400,
  excludedBlocks: 0,
  ...fields,
});

const result = (fields: Partial<SolverResult> = {}): SolverResult => ({
  ...progress(),
  phase: 'solved',
  state: {} as State, // describeBar never reads it
  stuck: [],
  ...fields,
});

const stuck = (fields: Partial<SolverResult['stuck'][number]> = {}) => ({
  lessonId: 'x1',
  name: '510 · MÇ Matematik',
  missing: 3,
  reason: 'MÇ Salı 3 saatinde müsait değil',
  ...fields,
});

describe('seconds — Türkçe ondalık', () => {
  it('bir basamak, ve ayraç VİRGÜL', () => {
    expect(seconds(3400)).toBe('3,4');
    expect(seconds(0)).toBe('0,0');
    expect(seconds(69)).toBe('0,1');
    expect(seconds(9856)).toBe('9,9');
  });

  it('nokta hiç geçmez', () => {
    expect(seconds(1234)).not.toContain('.');
  });
});

describe('describeBar — koşarken', () => {
  it('ilerleme satırı yerleşeni, toplamı ve süreyi söyler', () => {
    const bar = describeBar(run({ running: true, progress: progress() }), 'teacher', t);
    expect(bar.level).toBe('busy');
    expect(bar.text).toBe('Otomatik diziliyor… 12/40 blok · 3,4 sn');
  });

  it('kapsam dışı blok YOKKEN ek cümle çıkmaz', () => {
    const bar = describeBar(run({ running: true, progress: progress() }), 'teacher', t);
    expect(bar.text).not.toContain('kapsam dışı');
  });

  it('kapsam dışı blok varken ek cümle çıkar', () => {
    const bar = describeBar(
      run({ running: true, progress: progress({ excludedBlocks: 5 }) }),
      'teacher',
      t,
    );
    expect(bar.text).toBe('Otomatik diziliyor… 12/40 blok · 3,4 sn · 5 blok geçici kapsam dışında');
  });

  it('running true ama ilerleme henüz yoksa boş duruma DÜŞER', () => {
    // İlk dilim boyanmadan önceki kare. Bir ilerleme satırı yerine ekranın
    // ne olduğunu anlatan cümle kalıyor, boş bir çubuk değil.
    const bar = describeBar(run({ running: true, progress: null }), 'teacher', t);
    expect(bar.level).toBe('');
    expect(bar.text).toContain('Satırlar öğretmen');
  });
});

describe('describeBar — boşta, ve İKİ EKSEN İKİ CÜMLE', () => {
  it('öğretmen ekseninde satırların öğretmen olduğunu söyler', () => {
    const bar = describeBar(run({}), 'teacher', t);
    expect(bar.level).toBe('');
    expect(bar.text).toContain('Satırlar öğretmen.');
    expect(bar.text).toContain('Hücrede sınıf ve derslik yazar.');
  });

  it('sınıf ekseninde satırların sınıf olduğunu söyler', () => {
    const bar = describeBar(run({}), 'class', t);
    expect(bar.text).toContain('Satırlar sınıf.');
    expect(bar.text).toContain('Hücrede öğretmen ve branşı yazar.');
  });

  it('iki eksen aynı cümleyi yazmaz', () => {
    expect(describeBar(run({}), 'teacher', t).text).not.toBe(
      describeBar(run({}), 'class', t).text,
    );
  });
});

describe('describeBar — bittiğinde', () => {
  it('takılan ders yoksa YEŞİL, ve geri almanın yolunu söyler', () => {
    const bar = describeBar(run({ result: result() }), 'teacher', t);
    expect(bar.level).toBe('ok');
    expect(bar.text).toBe('Program dizildi. 12 blok yerleşti (3,4 sn). Ctrl+Z ile geri alabilirsiniz.');
  });

  it('yeşil satırda da kapsam dışı bloklar sayılır', () => {
    const bar = describeBar(run({ result: result({ excludedBlocks: 2 }) }), 'teacher', t);
    expect(bar.text).toContain('2 blok geçici kapsam dışında kaldı.');
  });

  it('takılan ders varsa KIRMIZI, ve EN KÖTÜSÜNÜ adıyla söyler', () => {
    const bar = describeBar(
      run({ result: result({ phase: 'stuck', stuck: [stuck()] }) }),
      'teacher',
      t,
    );
    expect(bar.level).toBe('bad');
    expect(bar.text).toBe(
      '12/40 blok yerleşti. 510 · MÇ Matematik: 3 saat yerleşemedi. MÇ Salı 3 saatinde müsait değil.',
    );
  });

  it('durdurulmuş bir koşu SARI, kırmızı değil', () => {
    // Yarım kalmış bir program bir kusur değil bir karar: okuyan Durdur'a
    // bastı. Renk kanalında sarı "bir şey eksik", kırmızı "bir şey engelli".
    const bar = describeBar(
      run({ result: result({ phase: 'cancelled', stuck: [stuck()] }) }),
      'teacher',
      t,
    );
    expect(bar.level).toBe('warn');
    expect(bar.text).toContain('Durduruldu.');
  });

  it('tek takılan derste "ve N ders daha" eki YOK', () => {
    const bar = describeBar(
      run({ result: result({ phase: 'stuck', stuck: [stuck()] }) }),
      'teacher',
      t,
    );
    expect(bar.text).not.toContain('ders daha');
  });

  it('birden çok takılan derste ek kalanı SAYAR', () => {
    const bar = describeBar(
      run({
        result: result({
          phase: 'stuck',
          stuck: [stuck(), stuck({ lessonId: 'x2' }), stuck({ lessonId: 'x3' })],
        }),
      }),
      'teacher',
      t,
    );
    expect(bar.text).toContain('(ve 2 ders daha)');
  });

  it('koşarken sonuç varsa bile İLERLEME kazanır', () => {
    // Yeni bir koşu başladığında öncekinin sonucu hâlâ elde duruyor; ekranda
    // görülmesi gereken şey biteni değil koşanı.
    const bar = describeBar(
      run({ running: true, progress: progress(), result: result() }),
      'teacher',
      t,
    );
    expect(bar.level).toBe('busy');
  });
});
