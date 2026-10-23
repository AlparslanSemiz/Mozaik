// `scripts/agir.sh`: the lock is free only when the command's whole tree is gone.
//
// 2026-10-09: `timeout 600 scripts/agir.sh ...` killed the script alone. The
// lock went free, the command ran on as an orphan, and another session's
// measurement ran beside it (pitfall 150). The script now ends the tree
// itself, on its own `--sure`, on a signal from outside, and after a normal
// exit that left something behind.
//
// The fake command is built to be hard to end: a grandchild in a session of
// its own (what Playwright does with every browser), one that ignores TERM,
// and a parent that takes its time to die. Every test uses its own lock file,
// so this never waits for, or frees, the machine's real lock.

import { spawn, spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { afterAll, describe, expect, it } from 'vitest';

const AGIR = resolve('scripts/agir.sh');
const kok = mkdtempSync(join(tmpdir(), 'mozaik-agir-'));
afterAll(() => rmSync(kok, { recursive: true, force: true }));

let sayac = 0;
function ortam() {
  sayac += 1;
  // A sleep length no other process on the machine is using: the test's tag.
  const etiket = `36.${process.pid}${sayac}`;
  return {
    etiket,
    kilit: join(kok, `${sayac}.lock`),
    env: {
      ...process.env,
      MOZAIK_AGIR_KILIT: join(kok, `${sayac}.lock`),
      MOZAIK_AGIR_NOTU: join(kok, `${sayac}.not`),
      MOZAIK_AGIR_PAY: '1',
    },
  };
}

/** The fake's sleeps still alive, counted by their tag. */
function kalan(etiket: string): number {
  const r = spawnSync('pgrep', ['-c', '-f', `^sleep ${etiket.replace('.', '\\.')}$`]);
  return Number(String(r.stdout).trim() || '0');
}

function sahte(etiket: string): string {
  return [
    // Dies slowly when told to: the lock must not go before it is gone.
    'trap "sleep 1.5; exit 0" TERM',
    `setsid sleep ${etiket} &`,
    `(trap "" TERM; exec sleep ${etiket}) &`,
    // Finite, so a broken time limit ends in a wrong exit code, not a hang.
    'for i in $(seq 60); do sleep 0.2; done',
  ].join('\n');
}

interface Sonuc {
  kod: number | null;
  hata: string;
}

function kos(komut: string, args: string[], env: NodeJS.ProcessEnv, girdi?: string) {
  const c = spawn(komut, args, { env, stdio: ['pipe', 'pipe', 'pipe'] });
  let cikti = '';
  let hata = '';
  c.stdout.on('data', (b: Buffer) => (cikti += String(b)));
  c.stderr.on('data', (b: Buffer) => (hata += String(b)));
  c.stdin.end(girdi ?? '');
  // `exit`, not `close`: an orphan that inherited the pipes keeps them open,
  // and waiting for them would turn the failure this file is about into a
  // test timeout that names nothing. The output gets a moment to drain.
  return new Promise<Sonuc & { cikti: string }>((tamam) =>
    c.on('exit', (kod) => {
      const bitir = () => tamam({ kod, hata, cikti });
      const sure = setTimeout(bitir, 200);
      c.on('close', () => {
        clearTimeout(sure);
        bitir();
      });
    }),
  );
}

/**
 * Another session asking for the lock half a second in: what it sees when it
 * finally gets it is how many of the fake's processes were still running.
 */
async function sonrakiOturum(kilit: string, etiket: string): Promise<number> {
  await new Promise((r) => setTimeout(r, 500));
  const desen = `^sleep ${etiket.replace('.', '\\.')}$`;
  const r = await kos('flock', [kilit, 'pgrep', '-c', '-f', desen], process.env);
  return Number(r.cikti.trim() || '0');
}

describe('agir.sh · kilit, komutun bütün ağacı bitince boşalıyor', () => {
  it('--sure dolunca ağaç kapanıyor, çıkış 124, kilidi alan hiçbir şey görmüyor', async () => {
    const o = ortam();
    const calisan = kos(AGIR, ['--sure', '2', 'bash', '-c', sahte(o.etiket)], o.env);
    const goren = sonrakiOturum(o.kilit, o.etiket);
    const r = await calisan;
    expect(r.kod, r.hata).toBe(124);
    expect(await goren).toBe(0);
    expect(kalan(o.etiket)).toBe(0);
  }, 30_000);

  it('dışarıdan timeout ile de: yetim kalmıyor, kilit ondan sonra boşalıyor', async () => {
    const o = ortam();
    const calisan = kos('timeout', ['2', AGIR, 'bash', '-c', sahte(o.etiket)], o.env);
    const goren = sonrakiOturum(o.kilit, o.etiket);
    const r = await calisan;
    expect(r.kod, r.hata).toBe(124);
    expect(await goren).toBe(0);
    expect(kalan(o.etiket)).toBe(0);
  }, 30_000);

  it('komut kendi çıkınca geride bıraktığı sunucu da kapanıyor, çıkış kodu komutun', async () => {
    const o = ortam();
    const r = await kos(AGIR, ['bash', '-c', `setsid sleep ${o.etiket} & exit 3`], o.env);
    expect(r.kod, r.hata).toBe(3);
    expect(kalan(o.etiket)).toBe(0);
  }, 30_000);

  it('komut agir.sh’in standart girdisini okuyor', async () => {
    const o = ortam();
    const r = await kos(AGIR, ['cat'], o.env, 'merhaba\n');
    expect(r.kod, r.hata).toBe(0);
    expect(r.cikti).toBe('merhaba\n');
  });
});
