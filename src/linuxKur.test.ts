// The Linux install script and its launcher (TODO B7.28), run for real in a
// home directory made up for each test. Nothing here touches ~/GitHub/Mozaik
// or ~/.local/share/mozaik: the scripts read $HOME, and $HOME is a temporary
// folder holding a small git repository in the place of the real checkout.
//
// What has to hold, from the decisions of 2026-10-10:
//   - it builds only from main, clean, and not from a worktree,
//   - the program is a COPY, so the next build of any branch cannot reach it,
//   - the Chrome profile, where the plans are, is never created or touched,
//   - with no google-chrome it says so and stops, and opens no other browser.

import { spawnSync } from 'node:child_process';
import {
  chmodSync,
  copyFileSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  utimesSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

const KUR = resolve('scripts/linux-kur.sh');
const BASLAT = resolve('scripts/linux-mozaik.sh');

const which = (cmd: string) => spawnSync('sh', ['-c', `command -v ${cmd}`]).status === 0;

const evler: string[] = [];
afterEach(() => {
  for (const ev of evler.splice(0)) rmSync(ev, { recursive: true, force: true });
});

function yeniEv(): string {
  const ev = mkdtempSync(join(tmpdir(), 'mozaik-linux-'));
  evler.push(ev);
  return ev;
}

function git(cwd: string, ...args: string[]): string {
  const r = spawnSync('git', args, { cwd, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')}: ${r.stderr}`);
  return r.stdout.trim();
}

/** A build script that writes `icerik` as dist/index.html. */
function paket(icerik: string): string {
  const js = `require('fs').mkdirSync('dist',{recursive:true});require('fs').writeFileSync('dist/index.html',${JSON.stringify(icerik)})`;
  return JSON.stringify({
    name: 'mozaik-sahte',
    private: true,
    scripts: { build: `node -e "${js.replace(/"/g, '\\"')}"` },
  });
}

/**
 * A stand-in for ~/GitHub/Mozaik: on main, clean, with the two files the
 * script copies from it, and a node_modules newer than the lock so that
 * `npm ci` is not run.
 */
function depo(ev: string, icerik = '<!doctype html><title>Mozaik</title>v1'): string {
  const d = join(ev, 'GitHub', 'Mozaik');
  mkdirSync(join(d, 'scripts'), { recursive: true });
  mkdirSync(join(d, 'site'), { recursive: true });
  mkdirSync(join(d, 'node_modules'), { recursive: true });
  git(d, 'init', '-q', '-b', 'main');
  git(d, 'config', 'user.email', 'test@example.invalid');
  git(d, 'config', 'user.name', 'test');
  writeFileSync(join(d, '.gitignore'), 'dist/\nnode_modules/\n');
  writeFileSync(join(d, 'package.json'), paket(icerik));
  writeFileSync(join(d, 'package-lock.json'), '{}\n');
  copyFileSync(BASLAT, join(d, 'scripts', 'linux-mozaik.sh'));
  copyFileSync(resolve('site/icon-512.png'), join(d, 'site', 'icon-512.png'));
  writeFileSync(join(d, 'node_modules', '.package-lock.json'), '{}\n');
  const eski = new Date(Date.now() - 60_000);
  utimesSync(join(d, 'package-lock.json'), eski, eski);
  git(d, 'add', '-A');
  git(d, 'commit', '-q', '-m', 'ilk');
  return d;
}

function ortam(ev: string, ek: Record<string, string> = {}): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = { ...process.env, HOME: ev, ...ek };
  delete env.XDG_DATA_HOME;
  return env;
}

function kur(ev: string) {
  return spawnSync('bash', [KUR], { env: ortam(ev), encoding: 'utf8' });
}

const appDir = (ev: string) => join(ev, '.local', 'share', 'mozaik', 'app');
const profil = (ev: string) => join(ev, '.local', 'share', 'mozaik', 'profil');

describe.skipIf(process.platform === 'win32')('Linux kurulum betiği', () => {
  it('main ve temiz depodan kopyalıyor, commit’i yazıyor, profile dokunmuyor', () => {
    const ev = yeniEv();
    const d = depo(ev);
    // Plans that are already there, as a file Chrome would have written.
    mkdirSync(profil(ev), { recursive: true });
    writeFileSync(join(profil(ev), 'isaret'), 'planlar');

    const r = kur(ev);
    expect(r.status, r.stderr).toBe(0);

    const index = join(appDir(ev), 'index.html');
    expect(lstatSync(index).isSymbolicLink(), 'bir bağ, kopya değil').toBe(false);
    expect(readFileSync(index, 'utf8')).toBe(readFileSync(join(d, 'dist', 'index.html'), 'utf8'));
    expect(readFileSync(join(appDir(ev), 'kaynak.txt'), 'utf8')).toContain(
      `commit ${git(d, 'rev-parse', 'HEAD')}`,
    );
    expect(statSync(join(appDir(ev), 'mozaik')).mode & 0o111).not.toBe(0);
    expect(readFileSync(join(profil(ev), 'isaret'), 'utf8')).toBe('planlar');

    const desktop = join(ev, '.local', 'share', 'applications', 'mozaik.desktop');
    expect(readFileSync(desktop, 'utf8')).toContain(`Exec="${join(appDir(ev), 'mozaik')}"`);
    if (which('desktop-file-validate')) {
      const v = spawnSync('desktop-file-validate', [desktop], { encoding: 'utf8' });
      expect(v.status, v.stdout + v.stderr).toBe(0);
    }

    // The copy does not follow the checkout: a later build there leaves it as it was.
    writeFileSync(join(d, 'dist', 'index.html'), 'sonraki derleme');
    expect(readFileSync(index, 'utf8')).toContain('v1');
  });

  it('yeniden çalışınca yeni commit’i kuruyor, profil yerinde kalıyor', () => {
    const ev = yeniEv();
    const d = depo(ev);
    mkdirSync(profil(ev), { recursive: true });
    writeFileSync(join(profil(ev), 'isaret'), 'planlar');
    expect(kur(ev).status).toBe(0);

    writeFileSync(join(d, 'package.json'), paket('<!doctype html>v2'));
    git(d, 'commit', '-q', '-am', 'iki');
    const r = kur(ev);
    expect(r.status, r.stderr).toBe(0);
    expect(readFileSync(join(appDir(ev), 'index.html'), 'utf8')).toBe('<!doctype html>v2');
    expect(readFileSync(join(appDir(ev), 'kaynak.txt'), 'utf8')).toContain(
      `commit ${git(d, 'rev-parse', 'HEAD')}`,
    );
    expect(readFileSync(join(profil(ev), 'isaret'), 'utf8')).toBe('planlar');
  });

  it('main dışındaki dalı reddediyor ve hiçbir şey kurmuyor', () => {
    const ev = yeniEv();
    const d = depo(ev);
    git(d, 'checkout', '-q', '-b', 'ozellik/baska');
    const r = kur(ev);
    expect(r.status).toBe(4);
    expect(r.stderr).toContain("main'de değil (dal: ozellik/baska)");
    expect(existsSync(appDir(ev))).toBe(false);
  });

  it('işlenmemiş değişiklik varken reddediyor, izlenmeyen dosya da sayılıyor', () => {
    const ev = yeniEv();
    const d = depo(ev);
    writeFileSync(join(d, 'yeni.txt'), 'x');
    const r = kur(ev);
    expect(r.status).toBe(5);
    expect(r.stderr).toContain('işlenmemiş değişiklik');
    expect(existsSync(appDir(ev))).toBe(false);
  });

  it('main’deki bir worktree’yi de reddediyor', () => {
    const ev = yeniEv();
    const asil = depo(ev);
    // The real checkout moves aside and comes back as a worktree of itself on main.
    const tasindi = join(ev, 'asil');
    git(ev, 'clone', '-q', asil, tasindi);
    rmSync(asil, { recursive: true, force: true });
    git(tasindi, 'checkout', '-q', '-b', 'diger');
    git(tasindi, 'worktree', 'add', '-q', asil, 'main');
    const r = kur(ev);
    expect(r.status).toBe(3);
    expect(r.stderr).toContain('worktree');
    expect(existsSync(appDir(ev))).toBe(false);
  });

  it('derleme düşerse eski kurulumu yerinde bırakıyor', () => {
    const ev = yeniEv();
    const d = depo(ev);
    expect(kur(ev).status).toBe(0);
    writeFileSync(
      join(d, 'package.json'),
      JSON.stringify({ name: 'mozaik-sahte', private: true, scripts: { build: 'exit 1' } }),
    );
    git(d, 'commit', '-q', '-am', 'bozuk');
    rmSync(join(d, 'dist'), { recursive: true, force: true });
    const r = kur(ev);
    expect(r.status).toBe(6);
    expect(readFileSync(join(appDir(ev), 'index.html'), 'utf8')).toContain('v1');
  });
});

describe.skipIf(process.platform === 'win32')('Linux başlatıcısı', () => {
  /** Fakes that write their arguments down, every browser name among them. */
  function sahteBin(ev: string, chrome: boolean): { bin: string; kayit: string } {
    const bin = join(ev, 'bin');
    const kayit = join(ev, 'kayit');
    mkdirSync(bin, { recursive: true });
    const sahte = (ad: string) => {
      writeFileSync(
        join(bin, ad),
        `#!/bin/sh\necho "${ad}" >> "${kayit}"\nprintf '%s\\n' "$@" >> "${kayit}"\n`,
      );
      chmodSync(join(bin, ad), 0o755);
    };
    sahte('notify-send');
    for (const baska of ['chromium', 'chromium-browser', 'brave-browser', 'firefox', 'xdg-open']) {
      sahte(baska);
    }
    if (chrome) sahte('google-chrome');
    return { bin, kayit };
  }

  /**
   * `sistem`: the system's own tools behind the fakes. Without them a `mkdir`
   * or an `rm` slipped into the launcher is "command not found" and passes
   * unseen (a mutation did exactly that). With them, a real google-chrome
   * would also be found, so the test that needs Chrome to be MISSING runs on
   * the fakes alone.
   */
  function baslat(ev: string, bin: string, sistem: boolean) {
    const PATH = sistem ? `${bin}:/usr/bin:/bin` : bin;
    return spawnSync('/bin/bash', [BASLAT], { env: ortam(ev, { PATH }), encoding: 'utf8' });
  }

  function kurulu(ev: string) {
    mkdirSync(appDir(ev), { recursive: true });
    writeFileSync(join(appDir(ev), 'index.html'), '<!doctype html>');
  }

  it('Chrome yoksa 69 ile çıkıyor, söylüyor, başka tarayıcı açmıyor', () => {
    const ev = yeniEv();
    kurulu(ev);
    const { bin, kayit } = sahteBin(ev, false);
    const r = baslat(ev, bin, false);
    expect(r.status).toBe(69);
    expect(r.stderr).toContain('Google Chrome bulunamadı');
    const cagrilar = readFileSync(kayit, 'utf8');
    expect(cagrilar).toContain('notify-send');
    expect(cagrilar).toContain('Google Chrome bulunamadı');
    for (const baska of ['chromium', 'brave-browser', 'firefox', 'xdg-open']) {
      expect(cagrilar.split('\n')).not.toContain(baska);
    }
  });

  it('Chrome’u kendi profiliyle ve app modunda açıyor, profili kendisi kurmuyor', () => {
    const ev = yeniEv();
    kurulu(ev);
    const { bin, kayit } = sahteBin(ev, true);
    const r = baslat(ev, bin, true);
    expect(r.status, r.stderr).toBe(0);
    const satirlar = readFileSync(kayit, 'utf8').split('\n');
    expect(satirlar[0]).toBe('google-chrome');
    expect(satirlar).toContain(`--user-data-dir=${profil(ev)}`);
    expect(satirlar).toContain(`--app=file://${join(appDir(ev), 'index.html')}`);
    // Chrome creates the profile; the launcher never does.
    expect(existsSync(profil(ev))).toBe(false);
  });

  it('var olan profile dokunmuyor', () => {
    const ev = yeniEv();
    kurulu(ev);
    mkdirSync(profil(ev), { recursive: true });
    writeFileSync(join(profil(ev), 'isaret'), 'planlar');
    const { bin } = sahteBin(ev, true);
    expect(baslat(ev, bin, true).status).toBe(0);
    expect(readFileSync(join(profil(ev), 'isaret'), 'utf8')).toBe('planlar');
  });

  it('kurulmamışsa 66 ile çıkıyor ve Chrome’u açmıyor', () => {
    const ev = yeniEv();
    const { bin, kayit } = sahteBin(ev, true);
    const r = baslat(ev, bin, true);
    expect(r.status).toBe(66);
    expect(r.stderr).toContain('kurulu değil');
    expect(readFileSync(kayit, 'utf8').split('\n')).not.toContain('google-chrome');
  });
});

// Not installed on the development machine, preinstalled on GitHub's Ubuntu
// runner: CI is where this one is measured.
describe.skipIf(!which('shellcheck'))('shellcheck', () => {
  it('iki betik de temiz', () => {
    const r = spawnSync('shellcheck', [KUR, BASLAT], { encoding: 'utf8' });
    expect(r.status, r.stdout + r.stderr).toBe(0);
  });
});
