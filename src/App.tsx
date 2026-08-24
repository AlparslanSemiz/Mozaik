import { useRef, useState } from 'react';
import { kayitCalisiyorMu, useDurum, yedekIndir, yedekYukle } from './durum';
import { bosDurum } from './veri';
import Kurulum from './bilesen/Kurulum';
import Musaitlik from './bilesen/Musaitlik';
import Program from './bilesen/Program';
import Kontrol from './bilesen/Kontrol';
import Yazdir from './bilesen/Yazdir';

type Sekme = 'kurulum' | 'musaitlik' | 'program' | 'kontrol' | 'yazdir';

const SEKMELER: Array<{ id: Sekme; ad: string }> = [
  { id: 'kurulum', ad: 'Kurulum' },
  { id: 'musaitlik', ad: 'Müsaitlik' },
  { id: 'program', ad: 'Program' },
  { id: 'kontrol', ad: 'Kontrol' },
  { id: 'yazdir', ad: 'Yazdır' },
];

export default function App() {
  const { durum, degistir, geriAl, ileriAl, yukleDurum, geriAlinabilir, ileriAlinabilir } =
    useDurum();

  // Veri yoksa Kurulum'la basla — bos bir Program ekrani babama ne yapacagini soylemez.
  const [sekme, setSekme] = useState<Sekme>(durum.dersler.length > 0 ? 'program' : 'kurulum');
  const dosyaGirisi = useRef<HTMLInputElement>(null);
  // Acilista bir kez sinanir; durum sonradan degismez.
  const [kayitVar] = useState(kayitCalisiyorMu);

  async function dosyaSecildi(e: React.ChangeEvent<HTMLInputElement>) {
    const dosya = e.target.files?.[0];
    e.target.value = ''; // ayni dosya tekrar secilebilsin
    if (dosya === undefined) return;

    const yeni = await yedekYukle(dosya);
    if (yeni === null) {
      window.alert('Bu dosya okunamadı. Program tarafından indirilmiş bir .json yedek dosyası seçin.');
      return;
    }
    if (!window.confirm('Yedek yüklenecek ve şu anki program değiştirilecek. Devam edilsin mi?')) {
      return;
    }
    yukleDurum(yeni);
  }

  function sifirla() {
    if (!window.confirm('Her şey silinecek: öğretmenler, sınıflar, dersler ve program. Emin misiniz?')) {
      return;
    }
    if (!window.confirm('Son kez soruyorum — bu işlem geri alınamaz. Silinsin mi?')) return;
    yukleDurum(bosDurum());
  }

  return (
    <div className="uygulama">
      <div className="ust">
        <div className="sekmeler">
          {SEKMELER.map((s) => (
            <button
              key={s.id}
              className="sekme"
              aria-current={sekme === s.id}
              onClick={() => setSekme(s.id)}
            >
              {s.ad}
            </button>
          ))}
        </div>

        <span className="bosluk" />

        <button className="dugme" onClick={geriAl} disabled={!geriAlinabilir} title="Ctrl+Z">
          ↶ Geri al
        </button>
        <button className="dugme" onClick={ileriAl} disabled={!ileriAlinabilir} title="Ctrl+Y">
          ↷ İleri al
        </button>
        <button className="dugme birincil" onClick={() => yedekIndir(durum)}>
          Yedek indir
        </button>
        <button className="dugme" onClick={() => dosyaGirisi.current?.click()}>
          Yedek yükle
        </button>
        <button className="dugme tehlike" onClick={sifirla} title="Her şeyi siler">
          Sıfırla
        </button>
        <input
          ref={dosyaGirisi}
          type="file"
          accept=".json,application/json"
          style={{ display: 'none' }}
          onChange={dosyaSecildi}
        />
      </div>

      {!kayitVar && (
        <div className="kayit-uyarisi">
          ⚠ <b>Bu bilgisayarda otomatik kayıt çalışmıyor.</b> Program kapanınca yaptığınız
          her şey kaybolur. Çalışırken sık sık <b>Yedek indir</b> düğmesine basın ve
          bilgisayarı kapatmadan önce mutlaka bir yedek alın.
        </div>
      )}

      {sekme === 'kurulum' && <Kurulum durum={durum} degistir={degistir} />}
      {sekme === 'musaitlik' && <Musaitlik durum={durum} degistir={degistir} />}
      {sekme === 'program' && <Program durum={durum} degistir={degistir} />}
      {sekme === 'kontrol' && <Kontrol durum={durum} />}
      {sekme === 'yazdir' && <Yazdir durum={durum} />}
    </div>
  );
}
