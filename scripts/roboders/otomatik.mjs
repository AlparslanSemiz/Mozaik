// The tour without a person at every click: `node scripts/roboders/gez.mjs --oto`.
//
// gez.mjs asks "e/h" before every click, and that only works while somebody is
// sitting there. This walks on its own, so the care that person gave has to be
// in the code. It clicks ONLY what can be shown to be moving around and nothing
// else:
//
//   - a link to a page on the same site (not a new window, not a download,
//     not an address with a writing word, not outside the --alan prefixes);
//   - a tab;
//   - a menu item that is itself such a link;
//   - a button that opens a menu (aria-haspopup, or aria-expanded="false").
//
// Every one of them must ALSO pass `tiklanabilir()` (no table cell, form field,
// draggable thing, submit button, writing word or nameless thing). Anything
// else is not clicked and not asked about: it is written down as "atlandı" with
// the reason, and the list comes back at the end of the tour.
//
// The network guard (koruma.mjs) is the same one as the manual tour's; this
// adds rules on top of it, it never relaxes one. A native dialog ends the tour
// (koru() has already answered it "İptal"), and so does a new window, the click
// ceiling or the time ceiling. Before and after every click there is a
// screenshot, under scratch/roboders/, outside git.
//
// Proven against a local server by e2e/roboders-koruma.spec.ts.

import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { izinVerilir, katla, tiklanabilir } from './koruma.mjs';

/** Everything on a page that could be clicked, so that what is skipped is seen too. */
const ADAY_SECICI = [
  'a[href]',
  'button',
  'input[type="submit"]',
  'input[type="button"]',
  '[role="link"]',
  '[role="button"]',
  '[role="tab"]',
  '[role="menuitem"]',
  '[aria-haspopup]',
].join(', ');

// Menus only: 'dialog' opens a window, usually a form, and 'grid' a table.
const ACILIR = new Set(['true', 'menu', 'listbox', 'tree']);

/**
 * May the automatic tour click this? Pure: takes what `adayBilgisi()` read and
 * the tour's limits. `{ izin, sebep, tur }`, tur being what kind of move it is.
 */
export function otomatikKarar(aday, { site, alanlar = [], sayfa }) {
  const temel = tiklanabilir(aday);
  if (!temel.izin) return { izin: false, sebep: temel.sebep, tur: '' };

  const baglanti = aday.rol === 'link' || (aday.rol === 'menuitem' && aday.href !== '');
  if (baglanti) {
    if (aday.href === '') return { izin: false, sebep: 'bağlantının adresi yok', tur: '' };
    let u;
    try {
      u = new URL(aday.href, sayfa);
    } catch {
      return { izin: false, sebep: 'adres okunamadı', tur: '' };
    }
    if (u.protocol !== 'http:' && u.protocol !== 'https:')
      return { izin: false, sebep: `${u.protocol} bağlantısı`, tur: '' };
    if (!site.test(u.hostname)) return { izin: false, sebep: 'site dışı', tur: '' };
    if (aday.indirir) return { izin: false, sebep: 'dosya indirir', tur: '' };
    if (aday.yeniPencere) return { izin: false, sebep: 'yeni pencere açar', tur: '' };
    const adres = izinVerilir('GET', u.href);
    if (!adres.izin) return { izin: false, sebep: adres.sebep, tur: '' };
    if (alanlar.length > 0 && !alanlar.some((a) => u.pathname.startsWith(a)))
      return { izin: false, sebep: 'gezinti alanının dışında', tur: '' };
    return { izin: true, sebep: '', tur: 'bağlantı' };
  }
  if (aday.rol === 'tab') return { izin: true, sebep: '', tur: 'sekme' };
  if ((aday.rol === 'button' || aday.rol === 'menuitem') && aday.acar) {
    if (aday.acik) return { izin: false, sebep: 'menü zaten açık', tur: '' };
    return { izin: true, sebep: '', tur: 'açılır menü' };
  }
  return { izin: false, sebep: `izin listesinde değil (${aday.rol || 'rolsüz'})`, tur: '' };
}

/** Reads `otomatikKarar()`'s input off one element: `hedefBilgisi()` plus role and link facts. */
export async function adayBilgisi(locator) {
  const b = await locator.evaluate((el) => {
    const metin = el instanceof HTMLElement ? el.innerText : el.textContent;
    const deger = el instanceof HTMLInputElement ? el.value : '';
    const form = el.closest('form');
    const dugme = el instanceof HTMLButtonElement || el instanceof HTMLInputElement;
    const tip = (
      el.getAttribute('type') ?? (el instanceof HTMLButtonElement ? 'submit' : '')
    ).toLowerCase();
    const acik = el.getAttribute('role');
    const rol =
      acik ??
      (el instanceof HTMLAnchorElement && el.hasAttribute('href')
        ? 'link'
        : dugme
          ? 'button'
          : el.tagName.toLowerCase());
    const bag = el.closest('a[href]');
    const popup = (el.getAttribute('aria-haspopup') ?? '').toLowerCase();
    return {
      ad: (
        el.getAttribute('aria-label') ||
        metin ||
        el.getAttribute('title') ||
        deger ||
        ''
      ).trim(),
      rol,
      href: bag instanceof HTMLAnchorElement ? bag.href : '',
      yeniPencere: bag instanceof HTMLAnchorElement && bag.target !== '' && bag.target !== '_self',
      indirir: bag instanceof HTMLAnchorElement && bag.hasAttribute('download'),
      popup,
      kapali: el.getAttribute('aria-expanded') === 'false',
      acik: el.getAttribute('aria-expanded') === 'true',
      hucrede: el.closest('td, th, [role="gridcell"], [role="cell"]') !== null,
      formAlani:
        el.matches('input:not([type="submit"]):not([type="button"]), textarea, select') ||
        el.closest('[contenteditable=""], [contenteditable="true"]') !== null,
      suruklenebilir: el.closest('[draggable="true"]') !== null,
      gonderir: dugme && tip === 'submit' && form !== null,
    };
  });
  // Decided here, not in the page: `evaluate` sends the function's text, so it
  // could not see ACILIR.
  const { popup, kapali, ...gerisi } = b;
  return { ...gerisi, acar: ACILIR.has(popup) || kapali };
}

/** One visible candidate per element, in document order, with what was read off it. */
async function adaylar(page) {
  const out = [];
  const hepsi = await page.locator(ADAY_SECICI).all();
  for (let i = 0; i < hepsi.length; i++) {
    const l = hepsi[i];
    if (!(await l.isVisible().catch(() => false))) continue;
    const b = await adayBilgisi(l).catch(() => null);
    if (b === null) continue;
    out.push({ sira: i, bilgi: b });
  }
  return out;
}

/** The same element again after the page was reloaded: same index, same name. */
async function bul(page, sira, ad) {
  const l = page.locator(ADAY_SECICI).nth(sira);
  if ((await l.count()) === 0) return null;
  const b = await adayBilgisi(l).catch(() => null);
  return b !== null && b.ad === ad ? l : null;
}

const anahtar = (url, b, tur) => {
  if (tur === 'bağlantı') {
    const u = new URL(b.href, url);
    u.hash = '';
    return `bağlantı ${u.href}`;
  }
  return `${tur} ${new URL(url).pathname} ${katla(b.ad)}`;
};

/**
 * Walks from `baslangic` on a page whose context `koru()` already guards.
 * Returns what it clicked, what it skipped and why it stopped.
 *
 * secenek: { site: RegExp, alanlar?: string[], tiklamaSiniri?: number,
 *            sureSiniriMs?: number, ekran?: string (folder), bekleMs?: number }
 */
export async function otomatikGez(page, baslangic, secenek) {
  const {
    site,
    alanlar = [],
    tiklamaSiniri = 40,
    sureSiniriMs = 10 * 60_000,
    ekran,
    bekleMs = 500,
  } = secenek;
  const bitis = Date.now() + sureSiniriMs;
  const context = page.context();
  const tiklanan = [];
  const atlanan = new Map();
  const denendi = new Set();
  const ziyaret = new Set();
  let tiklama = 0;
  let durdu = null;

  const diyalog = () => (durdu ??= 'bir diyalog açıldı');
  const pencere = () => (durdu ??= 'yeni bir pencere açıldı');
  page.on('dialog', diyalog);
  context.on('page', pencere);
  if (ekran) mkdirSync(ekran, { recursive: true, mode: 0o700 });

  const foto = async (ad) => {
    if (ekran) await page.screenshot({ path: join(ekran, ad) }).catch(() => {});
  };
  const sinirda = () => {
    if (durdu) return true;
    if (tiklama >= tiklamaSiniri) durdu = `tıklama sınırı (${tiklamaSiniri})`;
    else if (Date.now() >= bitis) durdu = `süre sınırı (${Math.round(sureSiniriMs / 60_000)} dk)`;
    return durdu !== null;
  };
  const yerles = async () => {
    await page.waitForLoadState('domcontentloaded').catch(() => {});
    await page.waitForTimeout(bekleMs);
  };
  // A state is an address plus the menu openers clicked on it, replayed in order.
  const kur = async (durum) => {
    await page.goto(durum.url);
    await yerles();
    for (const { sira, ad } of durum.acilanlar) {
      if (sinirda()) return false;
      const l = await bul(page, sira, ad);
      if (l === null) return false;
      tiklama++;
      await l.click();
      await yerles();
    }
    return !durdu;
  };

  const kuyruk = [{ url: new URL(baslangic).href, acilanlar: [] }];
  while (kuyruk.length > 0 && !sinirda()) {
    const durum = kuyruk.shift();
    if (durum.acilanlar.length === 0) {
      if (ziyaret.has(durum.url)) continue;
      ziyaret.add(durum.url);
    }
    if (!(await kur(durum))) continue;
    const gorulen = await adaylar(page);
    for (const { sira, bilgi } of gorulen) {
      if (sinirda()) break;
      const karar = otomatikKarar(bilgi, { site, alanlar, sayfa: page.url() });
      if (!karar.izin) {
        const k = `${katla(bilgi.ad)}|${bilgi.rol}|${karar.sebep}`;
        if (!atlanan.has(k))
          atlanan.set(k, { ad: bilgi.ad, rol: bilgi.rol, sebep: karar.sebep, adres: durum.url });
        continue;
      }
      const a = anahtar(durum.url, bilgi, karar.tur);
      if (denendi.has(a)) continue;
      denendi.add(a);
      if (!(await kur(durum))) break;
      const l = await bul(page, sira, bilgi.ad);
      if (l === null) continue;
      const no = String(tiklanan.length + 1).padStart(3, '0');
      await foto(`${no}-once.png`);
      tiklama++;
      await l.click();
      await yerles();
      await foto(`${no}-sonra.png`);
      const sonra = page.url();
      tiklanan.push({ no, ad: bilgi.ad, rol: bilgi.rol, tur: karar.tur, adres: durum.url, sonra });
      if (durdu) break;
      if (karar.tur === 'açılır menü' && durum.acilanlar.length < 2) {
        kuyruk.push({ url: durum.url, acilanlar: [...durum.acilanlar, { sira, ad: bilgi.ad }] });
      } else if (sonra !== durum.url && site.test(new URL(sonra).hostname)) {
        kuyruk.push({ url: sonra, acilanlar: [] });
      }
    }
  }

  page.off('dialog', diyalog);
  context.off('page', pencere);
  return {
    tiklanan,
    atlanan: [...atlanan.values()],
    durdu: durdu ?? 'gezilecek yer kalmadı',
    tiklama,
  };
}

/** The end-of-tour list as Markdown: what was clicked, what was skipped and why it stopped. */
export function rapor(sonuc, { engellenen }) {
  const satir = (t) => `- ${t.no} · ${t.tur} · "${t.ad}" · ${t.adres} → ${t.sonra}`;
  const atla = (a) => `- "${a.ad}" (${a.rol}) · ${a.sebep} · ilk görüldüğü yer ${a.adres}`;
  return [
    `# Otomatik tur, ${new Date().toISOString()}`,
    '',
    `Durdu: ${sonuc.durdu}. Tıklama: ${sonuc.tiklama}. Ağda engellenen istek: ${engellenen}.`,
    '',
    `## Tıklananlar (${sonuc.tiklanan.length})`,
    ...sonuc.tiklanan.map(satir),
    '',
    `## Atlananlar (${sonuc.atlanan.length})`,
    ...sonuc.atlanan.map(atla),
    '',
  ].join('\n');
}
