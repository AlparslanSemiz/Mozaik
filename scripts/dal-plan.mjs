// The decisions of `npm run dal-temizle`, apart from the git commands that
// gather their inputs and carry them out (dal-temizle.mjs). Pure: every input
// is text or plain data, so the rules that keep a branch alive can be tested
// against made-up git output without a repository.
//
// One rule decides deletion and it is deliberately narrow: a branch goes only
// when its tip is an ancestor of origin/main, i.e. when every commit it holds
// is already in main. Everything else is listed for a person to decide.

/** Never touched, whatever else is true of them. */
export const SABIT_KORUNAN = ['main', 'gh-pages'];

/**
 * Ignored paths that are rebuilt by a command and so are not archived when a
 * worktree goes. Everything else ignored (scratch/ above all) is moved out
 * first, because `git worktree remove` deletes ignored files without a word.
 */
export const ONBELLEK = [
  'node_modules',
  'dist',
  'dist-site',
  'dist-kurulum',
  'dist-exe',
  'src-tauri/target',
  'src-tauri/gen',
  'test-results',
  'playwright-report',
  'blob-report',
  '.venv',
  '.stryker-tmp',
];

/** True when `yol` (as `git ls-files --directory` prints it) is a cache. */
export function onbellekMi(yol) {
  const temiz = yol.replace(/\/$/, '');
  if (temiz.endsWith('.tsbuildinfo')) return true;
  return ONBELLEK.some((o) => temiz === o || temiz.startsWith(`${o}/`));
}

/**
 * `git worktree list --porcelain`, as records. The first one is the main
 * checkout, which is never removed.
 */
export function worktreeleriOku(porcelain) {
  const sonuc = [];
  for (const blok of porcelain.split(/\n\s*\n/)) {
    const satirlar = blok.split('\n').filter((s) => s !== '');
    if (satirlar.length === 0) continue;
    const kayit = { yol: '', dal: null, ayrik: false, bare: false, ana: sonuc.length === 0 };
    for (const s of satirlar) {
      if (s.startsWith('worktree ')) kayit.yol = s.slice('worktree '.length);
      else if (s.startsWith('branch '))
        kayit.dal = s.slice('branch '.length).replace(/^refs\/heads\//, '');
      else if (s === 'detached') kayit.ayrik = true;
      else if (s === 'bare') kayit.bare = true;
    }
    sonuc.push(kayit);
  }
  return sonuc;
}

const GLOB = /[*?[\]!]/;

/**
 * The branch names the workflows mention: `branches:` lists (inline or as a
 * block) and `refs/heads/<name>` comparisons. A pattern like `'**'` names no
 * branch and is returned apart, or it would protect every branch there is.
 */
export function workflowDallari(metinler) {
  const adlar = new Set();
  const desenler = new Set();
  const ekle = (ham) => {
    const ad = ham.trim().replace(/^['"]|['"]$/g, '');
    if (ad === '') return;
    if (GLOB.test(ad)) desenler.add(ad);
    else adlar.add(ad);
  };
  for (const metin of metinler) {
    const satirlar = metin.split('\n');
    for (let i = 0; i < satirlar.length; i++) {
      const satir = satirlar[i].replace(/\s+#.*$/, '');
      const m = /^(\s*)branches(?:-ignore)?:\s*(.*)$/.exec(satir);
      if (m !== null) {
        const deger = m[2].trim();
        if (deger.startsWith('[')) {
          deger
            .replace(/^\[|\]$/g, '')
            .split(',')
            .forEach(ekle);
        } else if (deger === '') {
          // A block list: the `- name` lines indented under the key.
          for (let j = i + 1; j < satirlar.length; j++) {
            const alt = /^(\s*)-\s*(.+)$/.exec(satirlar[j].replace(/\s+#.*$/, ''));
            if (alt === null || alt[1].length <= m[1].length) break;
            ekle(alt[2]);
          }
        } else {
          ekle(deger);
        }
      }
      for (const r of satir.matchAll(/refs\/heads\/([A-Za-z0-9._/-]+)/g)) ekle(r[1]);
    }
  }
  return { adlar, desenler };
}

/**
 * The plan. Inputs:
 *   yerel        [{ ad, sha, tarih, ileri, birlesti }]   refs/heads
 *   uzak         [{ ad, sha, tarih, ileri, birlesti }]   refs/remotes/origin, name without `origin/`
 *   worktreeler  [{ yol, dal, ayrik, ana, kirli, kullanimda, buradaki }]
 *   acikPr       Set of head branch names with an open PR
 *   workflow     Set of branch names the workflows mention
 *
 * `kullanimda` is a worktree some process has its working directory in (an
 * open session); `buradaki` is the one this command runs from.
 */
export function planKur({ yerel, uzak, worktreeler, acikPr, workflow }) {
  const korunan = [];
  const birlesmemis = [];
  const silinecekYerel = [];
  const silinecekUzak = [];
  const kaldirilacakWorktree = [];
  const dokunulmayanWorktree = [];

  const worktreeOf = new Map(worktreeler.filter((w) => w.dal !== null).map((w) => [w.dal, w]));

  // Why a NAME is protected, local and remote alike. Null when it is not.
  const adSebebi = (ad) => {
    if (SABIT_KORUNAN.includes(ad)) return 'sabit korunan';
    if (workflow.has(ad)) return "workflow'da adı geçiyor";
    if (acikPr.has(ad)) return 'açık PR var';
    const w = worktreeOf.get(ad);
    if (w !== undefined) {
      if (w.kirli) return `kirli worktree'de açık (${w.yol})`;
      if (w.buradaki) return `bu komutun koştuğu worktree (${w.yol})`;
      if (w.ana) return `ana checkout'ta açık (${w.yol})`;
      if (w.kullanimda) return `worktree kullanımda, bir süreç içinde (${w.yol})`;
    }
    return null;
  };

  for (const d of yerel) {
    const sebep = adSebebi(d.ad);
    if (sebep !== null) {
      korunan.push({ ad: d.ad, yer: 'yerel', sebep });
      continue;
    }
    if (!d.birlesti) {
      birlesmemis.push({ ad: d.ad, yer: 'yerel', tarih: d.tarih, ileri: d.ileri });
      continue;
    }
    const w = worktreeOf.get(d.ad);
    if (w !== undefined) kaldirilacakWorktree.push({ yol: w.yol, dal: d.ad });
    silinecekYerel.push({ ad: d.ad, sha: d.sha, tarih: d.tarih });
  }

  for (const d of uzak) {
    if (d.ad === 'HEAD') continue;
    const sebep = adSebebi(d.ad);
    if (sebep !== null) {
      korunan.push({ ad: d.ad, yer: 'uzak', sebep });
      continue;
    }
    if (!d.birlesti) {
      birlesmemis.push({ ad: d.ad, yer: 'uzak', tarih: d.tarih, ileri: d.ileri });
      continue;
    }
    silinecekUzak.push({ ad: d.ad, sha: d.sha, tarih: d.tarih });
  }

  // Worktrees with no branch to judge them by: listed, never removed.
  for (const w of worktreeler) {
    if (w.ana || w.bare) continue;
    if (w.dal === null) dokunulmayanWorktree.push({ yol: w.yol, sebep: 'ayrık HEAD, dalı yok' });
  }

  return {
    silinecekYerel,
    silinecekUzak,
    kaldirilacakWorktree,
    dokunulmayanWorktree,
    korunan,
    birlesmemis,
  };
}

/**
 * The local tags that keep every deleted tip findable: `arsiv/<branch>` for
 * the local tip, and the remote tip under the same name when there is no
 * local one. A remote tip that differs from the local one gets
 * `arsiv/origin/<branch>`, so neither overwrites the other.
 */
export function arsivEtiketleri(plan) {
  const etiketler = [];
  const yerelSha = new Map(plan.silinecekYerel.map((d) => [d.ad, d.sha]));
  for (const d of plan.silinecekYerel) etiketler.push({ ad: `arsiv/${d.ad}`, sha: d.sha });
  for (const d of plan.silinecekUzak) {
    const y = yerelSha.get(d.ad);
    if (y === d.sha) continue;
    etiketler.push({ ad: y === undefined ? `arsiv/${d.ad}` : `arsiv/origin/${d.ad}`, sha: d.sha });
  }
  return etiketler;
}

/** `dallar-2026-10-24.bundle`, or `-2`, `-3`... when that one is taken. */
export function bundleAdi(tarih, varMi) {
  for (let i = 1; ; i++) {
    const ad = i === 1 ? `dallar-${tarih}.bundle` : `dallar-${tarih}-${i}.bundle`;
    if (!varMi(ad)) return ad;
  }
}
