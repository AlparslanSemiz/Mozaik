// Ornek veri: babanin gercek olcegine yakin bir dunya (25 ogretmen, 20 sinif,
// 8 derslik, 7 gun x 12 saat). Iki isi var:
//   1. Baban gercek verisini girmeden once aracin nasil calistigini gorebilsin.
//   2. Hiz olcumu gercek olcekle yapilsin — 5 satirlik oyuncak veriyle degil.
//
// Uretim DETERMINISTIK: ayni girdi hep ayni ciktiyi verir, boylece bir hata
// tekrar uretilebilir.

import { musaitKey } from './kisit';
import type { Ders, Derslik, Durum, Ogretmen, Sinif } from './tip';
import { RENK_SAYISI, SEMA_SURUMU } from './tip';
import { VARSAYILAN_GUNLER, saatAdlari } from './veri';

/** Kucuk bir dogrusal uretec — Math.random deterministik degil. */
function uretec(tohum: number): () => number {
  let x = tohum;
  return () => {
    x = (x * 1103515245 + 12345) & 0x7fffffff;
    return x / 0x7fffffff;
  };
}

const BRANSLAR = [
  'Matematik',
  'Fizik',
  'Kimya',
  'Biyoloji',
  'Türkçe',
  'Edebiyat',
  'Tarih',
  'Coğrafya',
  'İngilizce',
  'Geometri',
  'Felsefe',
  'Din Kültürü',
];

const ADLAR = [
  'Mehmet Çelik', 'Ayşe Varol', 'Murat Bilge', 'Yasemin Mutlu', 'Kemal Yıldız',
  'Yeliz Güneş', 'Ahmet Sarı', 'İlknur Aydın', 'Yusuf Kara', 'Hatice Ergin',
  'Emre Doğan', 'Deniz Erdem', 'Sibel Duman', 'Rıza Yalçın', 'Gökhan Çetin',
  'Nurten Uçar', 'Ali Öztürk', 'Aylin Gür', 'Serkan Tunç', 'Melek Şahin',
  'Barış Koç', 'Zeynep Ak', 'Onur Polat', 'Fatma Kurt', 'Cem Aslan',
];

/** Fotograftaki gibi: sinif kodu -> sabit derslik harfi. */
const SINIF_DERSLIK: Array<[string, string]> = [
  ['310', 'G'], ['311', 'G'],
  ['320', 'H'], ['452', 'H'], ['453', 'H'],
  ['410', 'A'], ['411', 'A'], ['510', 'A'], ['511', 'A'],
  ['412', 'B'], ['413', 'B'],
  ['450', 'C'], ['451', 'C'],
  ['414', 'D'], ['415', 'D'], ['530', 'D'], ['531', 'D'],
  ['430', 'E'], ['431', 'E'],
  ['432', 'F'],
];

function kisaltmaUret(ad: string): string {
  return ad
    .split(' ')
    .slice(0, 2)
    .map((p) => (p[0] ?? '').toLocaleUpperCase('tr'))
    .join('');
}

export function ornekDurum(): Durum {
  const rnd = uretec(20260824);
  const gunler = [...VARSAYILAN_GUNLER];
  const saatler = saatAdlari(12);
  const toplamSlot = gunler.length * saatler.length; // 84

  const harfler = [...new Set(SINIF_DERSLIK.map(([, h]) => h))].sort();
  const derslikler: Derslik[] = harfler.map((h, i) => ({ id: `k${i}`, ad: h }));
  const derslikIdByHarf = new Map(derslikler.map((k) => [k.ad, k.id]));

  const siniflar: Sinif[] = SINIF_DERSLIK.map(([ad, harf], i) => ({
    id: `s${i}`,
    ad,
    derslikId: derslikIdByHarf.get(harf) ?? null,
  }));

  const ogretmenler: Ogretmen[] = ADLAR.map((ad, i) => ({
    id: `o${i}`,
    ad,
    kisaltma: kisaltmaUret(ad),
    brans: BRANSLAR[i % BRANSLAR.length] ?? 'Matematik',
    renk: i % RENK_SAYISI,
  }));

  // Bir dersligi kac sinif paylasiyorsa o sinifin butcesi o kadar kucuk olmali,
  // yoksa ornek veri daha basta cozulemez olur (derslik darbogazi).
  const paylasan = new Map<string, number>();
  for (const s of siniflar) {
    if (s.derslikId != null) paylasan.set(s.derslikId, (paylasan.get(s.derslikId) ?? 0) + 1);
  }

  const dersler: Ders[] = [];
  let sayac = 0;
  for (const [i, sinif] of siniflar.entries()) {
    const kardes = sinif.derslikId != null ? (paylasan.get(sinif.derslikId) ?? 1) : 1;
    // Iki ust sinir: (a) dersligin saatlerinin %82'si paylasanlara bolunur —
    // ustune cikarsa derslik darbogazi olusur; (b) bir sinif haftada 32 saatten
    // fazla ders gormez, yoksa tek sinifli derslikte 79 saatlik sacma yuk cikar.
    let butce = Math.min(32, Math.floor((toplamSlot * 0.82) / kardes));

    // 4-6 ogretmen arasinda dagit. Ogretmenler siniftan siniftan kaydirilarak
    // secilir ki ayni ogretmen her sinifta olmasin.
    const dersSayisi = 4 + Math.floor(rnd() * 3);
    for (let j = 0; j < dersSayisi && butce > 0; j++) {
      const ogretmen = ogretmenler[(i * 3 + j * 7) % ogretmenler.length];
      if (ogretmen === undefined) continue;

      const kalanDers = dersSayisi - j;
      const pay = Math.max(2, Math.min(butce - (kalanDers - 1) * 2, Math.ceil(butce / kalanDers)));
      const blok = rnd() < 0.35 ? 2 : 1;
      const saat = Math.max(blok, Math.floor(pay / blok) * blok);
      if (saat <= 0) continue;

      dersler.push({
        id: `d${sayac++}`,
        sinifId: sinif.id,
        ogretmenId: ogretmen.id,
        haftalikSaat: saat,
        blok,
      });
      butce -= saat;
    }
  }

  // Her ogretmene 1-2 kapali gun: gercek hayatta herkes her gun gelmiyor ve
  // musaitlik olmadan kisit motoru hic zorlanmaz.
  const musaitDegil: Record<string, 1> = {};
  for (const [i, o] of ogretmenler.entries()) {
    const kapaliGun = i % gunler.length;
    for (let s = 0; s < saatler.length; s++) musaitDegil[musaitKey(o.id, kapaliGun, s)] = 1;
    if (rnd() < 0.5) {
      const ikinci = (kapaliGun + 3) % gunler.length;
      for (let s = 0; s < saatler.length; s++) musaitDegil[musaitKey(o.id, ikinci, s)] = 1;
    }
  }

  return {
    semaSurumu: SEMA_SURUMU,
    ayar: { gunler, saatler },
    derslikler,
    ogretmenler,
    siniflar,
    dersler,
    musaitDegil,
    yerlesim: {},
  };
}
