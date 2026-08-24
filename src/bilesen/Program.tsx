// Ana ekran. Izgarayi, kart havuzunu ve suruklemeyi birbirine baglar.
//
// Performans sozlesmesi (yavas makine icin):
//   - `satirlar` ve `kartlar` useMemo ile hesaplanir, sadece durum degisince.
//   - Izgara React.memo; sebep cubugu degisince izgara yeniden cizilmez.
//   - Surukleme sirasinda hicbir state degismez (bkz. suruk.ts).

import { useCallback, useMemo, useState } from 'react';
import type React from 'react';
import { engel, indeksle, kaldir, musaitKey, yerKey, yerlestir } from '../kisit';
import type { Indeks } from '../kisit';
import { useSuruk } from '../suruk';
import type { Durum, Id } from '../tip';
import Izgara from './Izgara';
import type { IzgaraHucre, IzgaraSatir } from './Izgara';
import KartHavuzu from './KartHavuzu';
import type { HavuzKart } from './KartHavuzu';

type Gorunum = 'ogretmen' | 'sinif';

interface Props {
  durum: Durum;
  degistir: (uygula: (d: Durum) => Durum) => void;
}

function derslikHarfi(ix: Indeks, derslikId: string | null | undefined): string {
  if (derslikId == null) return '';
  return ix.derslikById.get(derslikId)?.ad ?? '';
}

function satirlariKur(d: Durum, ix: Indeks, gorunum: Gorunum): IzgaraSatir[] {
  const gunSayisi = d.ayar.gunler.length;
  const saatSayisi = d.ayar.saatler.length;
  const n = gunSayisi * saatSayisi;

  if (gorunum === 'ogretmen') {
    return d.ogretmenler.map((o) => {
      const hucreler: Array<IzgaraHucre | null> = new Array(n).fill(null);
      const kapali: boolean[] = new Array(n).fill(false);

      for (let g = 0; g < gunSayisi; g++) {
        for (let s = 0; s < saatSayisi; s++) {
          const i = g * saatSayisi + s;
          kapali[i] = d.musaitDegil[musaitKey(o.id, g, s)] !== undefined;

          const dersId = ix.ogretmenDolu.get(musaitKey(o.id, g, s));
          if (dersId === undefined) continue;
          const sinif = ix.sinifById.get(ix.dersById.get(dersId)?.sinifId ?? '');
          hucreler[i] = {
            dersId,
            ust: sinif?.ad ?? '?',
            alt: derslikHarfi(ix, sinif?.derslikId),
            renk: o.renk,
            suruyor:
              s + 1 < saatSayisi &&
              ix.ogretmenDolu.get(musaitKey(o.id, g, s + 1)) === dersId,
          };
        }
      }
      return { id: o.id, ad: o.kisaltma, ikincil: o.brans, hucreler, kapali };
    });
  }

  return d.siniflar.map((sinif) => {
    const hucreler: Array<IzgaraHucre | null> = new Array(n).fill(null);
    const kapali: boolean[] = new Array(n).fill(false);

    for (let g = 0; g < gunSayisi; g++) {
      for (let s = 0; s < saatSayisi; s++) {
        const dersId = d.yerlesim[yerKey(sinif.id, g, s)];
        if (dersId === undefined) continue;
        const ogretmen = ix.ogretmenById.get(ix.dersById.get(dersId)?.ogretmenId ?? '');
        hucreler[g * saatSayisi + s] = {
          dersId,
          ust: ogretmen?.kisaltma ?? '?',
          alt: ogretmen?.brans ?? '',
          renk: ogretmen?.renk ?? 0,
          suruyor: s + 1 < saatSayisi && d.yerlesim[yerKey(sinif.id, g, s + 1)] === dersId,
        };
      }
    }
    const harf = derslikHarfi(ix, sinif.derslikId);
    return {
      id: sinif.id,
      ad: sinif.ad,
      ikincil: harf === '' ? 'derslik yok' : `${harf} dersliği`,
      hucreler,
      kapali,
    };
  });
}

function havuzuKur(d: Durum, ix: Indeks): { kartlar: HavuzKart[]; tamamlanan: number } {
  const kartlar: HavuzKart[] = [];
  let tamamlanan = 0;

  for (const ders of d.dersler) {
    const yerlesen = ix.yerlesenSaat.get(ders.id) ?? 0;
    if (yerlesen >= ders.haftalikSaat) {
      tamamlanan++;
      continue;
    }
    const sinif = ix.sinifById.get(ders.sinifId);
    const ogretmen = ix.ogretmenById.get(ders.ogretmenId);
    kartlar.push({
      dersId: ders.id,
      ust: sinif?.ad ?? '?',
      alt: ogretmen?.kisaltma ?? '?',
      brans: ogretmen?.brans ?? '',
      renk: ogretmen?.renk ?? 0,
      yerlesen,
      toplam: ders.haftalikSaat,
    });
  }

  // Ayni ogretmenin kartlari yan yana dursun — gozun izgaradaki satiri bulmasi kolaylassin.
  kartlar.sort((a, b) => a.alt.localeCompare(b.alt, 'tr') || a.ust.localeCompare(b.ust, 'tr'));
  return { kartlar, tamamlanan };
}

export default function Program({ durum, degistir }: Props) {
  const [gorunum, setGorunum] = useState<Gorunum>('ogretmen');
  const ix = useMemo(() => indeksle(durum), [durum]);

  const birak = useCallback(
    (dersId: Id, gun: number, saat: number) => {
      degistir((d) => yerlestir(d, dersId, gun, saat));
    },
    [degistir],
  );

  const { basla, suruklenen, sebep } = useSuruk(birak);

  const satirlar = useMemo(() => satirlariKur(durum, ix, gorunum), [durum, ix, gorunum]);
  const { kartlar, tamamlanan } = useMemo(() => havuzuKur(durum, ix), [durum, ix]);

  const hucreTikla = useCallback(
    (satirId: string, gun: number, saat: number) => {
      degistir((d) => {
        // Ogretmen gorunumunde satir kimligi ogretmen; kaldirmak icin sinif lazim.
        let sinifId: Id | null = satirId;
        if (gorunum === 'ogretmen') {
          const taze = indeksle(d);
          const dersId = taze.ogretmenDolu.get(musaitKey(satirId, gun, saat));
          sinifId = dersId === undefined ? null : (taze.dersById.get(dersId)?.sinifId ?? null);
        }
        return sinifId === null ? d : kaldir(d, sinifId, gun, saat);
      });
    },
    [degistir, gorunum],
  );

  const kartBasla = useCallback(
    (e: React.PointerEvent, dersId: Id) => {
      const ders = ix.dersById.get(dersId);
      if (ders === undefined) return;

      // Gecerli hucreler BURADA bir kez hesaplanir — surukleme boyunca bir daha degil.
      const harita = new Map<string, string | null>();
      for (let g = 0; g < durum.ayar.gunler.length; g++) {
        for (let s = 0; s < durum.ayar.saatler.length; s++) {
          harita.set(`${g}|${s}`, engel(durum, ix, dersId, g, s));
        }
      }

      const sinif = ix.sinifById.get(ders.sinifId);
      const ogretmen = ix.ogretmenById.get(ders.ogretmenId);
      const ogretmenGorunumu = gorunum === 'ogretmen';

      basla(
        e,
        {
          dersId,
          satirId: ogretmenGorunumu ? ders.ogretmenId : ders.sinifId,
          blok: Math.max(1, ders.blok),
          harita,
        },
        {
          ust: ogretmenGorunumu ? (sinif?.ad ?? '?') : (ogretmen?.kisaltma ?? '?'),
          alt: ogretmenGorunumu
            ? derslikHarfi(ix, sinif?.derslikId)
            : (ogretmen?.brans ?? ''),
          renk: ogretmen?.renk ?? 0,
        },
      );
    },
    [durum, ix, gorunum, basla],
  );

  if (durum.dersler.length === 0) {
    return (
      <div className="govde">
        <div className="bos-ekran">
          <strong>Henüz dizilecek ders yok.</strong>
          Önce <b>Kurulum</b> sekmesinden derslikleri, öğretmenleri ve sınıfları girin,
          sonra her sınıfa haftalık ders saatlerini ekleyin. Ardından <b>Müsaitlik</b>{' '}
          sekmesinde öğretmenlerin gelemediği saatleri işaretleyin.
          <br />
          <br />
          Buraya döndüğünüzde dersler alttaki havuzda kartlar hâlinde bekliyor olacak.
        </div>
      </div>
    );
  }

  return (
    <div className="govde tasmasiz">
      <div className="ust" style={{ borderBottom: 'none', paddingBottom: 0 }}>
        <button
          className="dugme"
          onClick={() => setGorunum(gorunum === 'ogretmen' ? 'sinif' : 'ogretmen')}
        >
          {gorunum === 'ogretmen' ? 'Sınıf görünümüne geç' : 'Öğretmen görünümüne geç'}
        </button>
        <span className="ipucu" style={{ margin: 0 }}>
          {gorunum === 'ogretmen'
            ? 'Satırlar öğretmen. Hücrede sınıf ve derslik yazar. Yerleşmiş derse tıklayınca kalkar.'
            : 'Satırlar sınıf. Hücrede öğretmen ve branşı yazar. Yerleşmiş derse tıklayınca kalkar.'}
        </span>
      </div>

      <div className={`sebep-cubugu${sebep === null ? ' bos' : ''}`}>
        {sebep ?? (suruklenen !== null ? 'Buraya bırakılabilir.' : '')}
      </div>

      <Izgara
        ayar={durum.ayar}
        satirlar={satirlar}
        basSutunBaslik={gorunum === 'ogretmen' ? 'Öğretmen' : 'Sınıf'}
        suruklenenSatirId={suruklenen?.satirId ?? null}
        onHucreTikla={hucreTikla}
      />

      <KartHavuzu kartlar={kartlar} tamamlanan={tamamlanan} onBasla={kartBasla} />
    </div>
  );
}
