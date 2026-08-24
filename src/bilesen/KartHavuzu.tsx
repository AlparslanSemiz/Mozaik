// Alttaki yerlesmemis ders kartlari. Fotograftaki aSc havuzunun karsiligi.
// Kart rengi = ogretmen rengi; izgarada hangi satiri hedefleyecegini bu gosterir.

import type React from 'react';
import type { Id } from '../tip';

export interface HavuzKart {
  dersId: Id;
  ust: string; // sinif adi
  alt: string; // ogretmen kisaltmasi
  brans: string;
  renk: number;
  yerlesen: number;
  toplam: number;
}

interface Props {
  kartlar: HavuzKart[];
  tamamlanan: number;
  onBasla: (e: React.PointerEvent, dersId: Id) => void;
}

export default function KartHavuzu({ kartlar, tamamlanan, onBasla }: Props) {
  const kalanSaat = kartlar.reduce((t, k) => t + (k.toplam - k.yerlesen), 0);

  return (
    <div className="havuz">
      <div className="havuz-baslik">
        {kartlar.length === 0 ? (
          <>Bütün dersler yerleşti. {tamamlanan} dersin tamamı programda.</>
        ) : (
          <>
            Yerleşmeyi bekleyen: <strong>{kartlar.length}</strong> ders,{' '}
            <strong>{kalanSaat}</strong> saat. Karta basılı tutup ızgaraya sürükleyin.
          </>
        )}
      </div>

      <div className="havuz-liste">
        {kartlar.map((k) => (
          <div
            key={k.dersId}
            className="havuz-kart"
            style={{ background: `var(--renk-${k.renk})` }}
            onPointerDown={(e) => onBasla(e, k.dersId)}
            title={`${k.ust} — ${k.alt} ${k.brans} · ${k.yerlesen}/${k.toplam} saat yerleşti`}
          >
            <span className="kart-ust">{k.ust}</span>
            <span className="kart-alt">{k.alt}</span>
            <span className="sayac">
              {k.yerlesen}/{k.toplam}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
