// relaxPool.ts in the exe, with the CP-SAT bridge played by the test: the
// search CP-SAT shares with ours (`handOff`, 2026-11-16) must still answer
// every way when the library is missing or fails midway.

import { describe, expect, it, vi } from 'vitest';
import { createRelaxer, type RelaxResult, type Relaxer } from '../../pure/relax';
import { solve } from '../../pure/solver/solver';
import { activePlacements } from '../../pure/grid';
import { WORLDS } from '../../pure/worlds';
import { startRelax } from './relaxPool';

const bridge = vi.hoisted(() => ({ available: true, calls: 0 }));

vi.mock('../exe', async (original) => ({
  ...(await original<typeof import('../exe')>()),
  isDesktop: () => true,
  desktopCpsatVar: () => Promise.resolve(bridge.available),
  desktopCpsatCoz: () => {
    bridge.calls++;
    return Promise.reject(new Error('kütüphane düştü'));
  },
  desktopCpsatDurdur: () => Promise.resolve(),
}));

function stuck() {
  const d = WORLDS.find((w) => w.name === 'ogretmen-hafta-kapali')!.state;
  const run = solve(d, { keepPlaced: false });
  expect(run.phase).toBe('stuck');
  return { d, hint: activePlacements(run.state) };
}

async function drive(r: Relaxer): Promise<RelaxResult> {
  for (;;) {
    const done = r.step(20);
    if (done !== null) return done;
    const p = r.progress();
    expect(p.steps!.done).toBeLessThanOrEqual(p.steps!.total);
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
}

const sizes = (r: RelaxResult) => Object.fromEntries(r.suggestions.map((s) => [s.family, s.size]));

describe('öneri araması exe’de, CP-SAT yanında', () => {
  it('kütüphane yoksa bugünkü arama, aynı yollar', async () => {
    bridge.available = false;
    bridge.calls = 0;
    const { d, hint } = stuck();
    const options = { keepPlaced: false, budgetMs: 600_000 };
    const got = await drive(startRelax(d, hint, options));
    const plain = await drive(createRelaxer(d, hint, options));
    expect(bridge.calls).toBe(0);
    expect(sizes(got)).toEqual(sizes(plain));
  }, 120_000);

  it('kütüphane ilk soruda düşerse CP-SAT’ın yolları da bizim aramadan geliyor', async () => {
    bridge.available = true;
    bridge.calls = 0;
    const { d, hint } = stuck();
    const options = { keepPlaced: false, budgetMs: 600_000 };
    const got = await drive(startRelax(d, hint, options));
    const plain = await drive(createRelaxer(d, hint, options));
    expect(bridge.calls).toBeGreaterThan(0);
    expect(plain.suggestions.length).toBeGreaterThan(0);
    expect(got.phase).toBe('done');
    // Every way today's search finds is there.
    for (const s of plain.suggestions) {
      const same = got.suggestions.find((x) => x.family === s.family);
      expect(same, s.family).toBeDefined();
    }
  }, 120_000);
});
