/**
 * German. The keys are the Turkish sentences - see the long note at the top of
 * `src/i18n.ts` for why. Four things to keep in mind while editing:
 *
 *   - A key that no longer appears anywhere in `src/` is DEAD, and
 *     `i18n.test.ts` says so. Editing the Turkish copy orphans its
 *     translation, which is the price of using sentences as keys.
 *   - `{slot}` names have to match the Turkish exactly, and their ORDER may
 *     not; that freedom is the point.
 *   - `**` marks emphasis. It must stay balanced; `<T>` splits on it.
 *   - `{n:one|other}` is a plural, and the form is chosen by
 *     `Intl.PluralRules`, not by `n === 1`. Turkish keys never carry one:
 *     Turkish takes no plural after a number.
 *
 * Ordered by the file each sentence is drawn from, so a screen can be read
 * here in the order it is read there.
 */
import { registerSozluk } from "../i18n";
import type { Sozluk } from "../i18n";

const DE: Sozluk = {
  "program renk tercihi": "Farbwahl des Stundenplans",
  "{bir} ile {iki} yer değiştirecek": "{bir} und {iki} werden getauscht",
  "Takas olmaz: {sebep}":
    "Kein Tausch: {sebep}",
  "Takas olmaz, {ne} eski yerine geçemiyor: {sebep}":
    "Kein Tausch, {ne} kann nicht an die alte Stelle: {sebep}",
  "{bir} ile {iki} yer değiştirdi": "{bir} und {iki} wurden getauscht",
  "{ad} ({n} ders)": "{ad} ({n} {n:Stunde|Stunden})",
  // -------------------------------------------- the week and the subjects
  //
  // DATA drawn, never data stored: `settings.days[].name` and
  // `settings.subjects` stay Turkish in the file so a backup means the same
  // thing on every machine and `remapDays()` keeps building its mapping from
  // them (pitfall 11). Only the seven and the twenty-one this program itself
  // put there are translated; anything the reader typed is drawn as typed.
  Pazartesi: "Montag",
  Salı: "Dienstag",
  Çarşamba: "Mittwoch",
  Perşembe: "Donnerstag",
  Cuma: "Freitag",
  Cumartesi: "Samstag",
  Pazar: "Sonntag",
  Matematik: "Mathematik",
  Fizik: "Physik",
  Geometri: "Geometrie",
  Kimya: "Chemie",
  Biyoloji: "Biologie",
  Türkçe: "Türkisch",
  Edebiyat: "Literatur",
  Tarih: "Geschichte",
  Coğrafya: "Erdkunde",
  İngilizce: "Englisch",
  Felsefe: "Philosophie",
  "Din Kültürü": "Religion",
  Almanca: "Deutsch",
  Fransızca: "Französisch",
  Müzik: "Musik",
  Resim: "Kunst",
  "Beden Eğitimi": "Sport",
  "Sosyal Bilgiler": "Sozialkunde",
  "Fen Bilimleri": "Naturwissenschaften",
  Rehberlik: "Beratung",
  "İnkılap Tarihi": "Reformgeschichte",
  Kim: "Wer",

  // src/App.tsx
  "plan dosyası": "Plandatei",
  "Plan dosyaya yazıldı. İndirilenler klasörüne bakın.":
    "Plan in eine Datei geschrieben. Schauen Sie im Ordner Downloads nach.",
  Program: "Stundenplan",
  "Düğme satırını gizle": "Schaltflächenleiste ausblenden",
  "Düğme satırını göster": "Schaltflächenleiste einblenden",
  "Ekran hareketlerini aç": "Bildschirmbewegung einschalten",
  "Ekran hareketlerini kapat": "Bildschirmbewegung ausschalten",
  "Bu dosya bütün planları içeriyor": "Diese Datei enthält alle Pläne",
  "Bu dosya daha yeni bir sürümle yazılmış":
    "Diese Datei wurde mit einer neueren Version geschrieben",
  "Okunamayan plan açılmadı: {adlar}.":
    "Ein Plan, der nicht gelesen werden konnte, wurde nicht geöffnet: {adlar}.",
  "· okunamadı": "· nicht lesbar",
  "Kayıtlı metni okunamadı; açılmıyor, silinmedi.":
    "Der gespeicherte Text konnte nicht gelesen werden; er wird nicht geöffnet und wurde nicht gelöscht.",
  "Bu planın kayıtlı metni okunamadı; silinirse o metin de gider. Bu işlem geri alınamaz.":
    "Der gespeicherte Text dieses Plans konnte nicht gelesen werden; wird der Plan gelöscht, ist auch dieser Text weg. Das lässt sich nicht rückgängig machen.",
  "Bu taslak okunamadı": "Dieser Entwurf konnte nicht gelesen werden",
  "Bu dosya okunamadı": "Diese Datei konnte nicht gelesen werden",
  "Açık olan planın yerine geçecek": "Sie ersetzt den geöffneten Plan",
  "Planı aç": "Plan öffnen",
  "Bu dosya eksik":
    "Diese Datei ist unvollständig",
  "Dosyada: {ogretmen} öğretmen, {sinif} sınıf, {ders} ders, yerleşmiş {saat} saat.":
    "In der Datei: {ogretmen} {ogretmen:Lehrkraft|Lehrkräfte}, {sinif} {sinif:Klasse|Klassen}, {ders} {ders:Unterricht|Unterrichte}, {saat} gelegte {saat:Stunde|Stunden}.",
  "Şu an: {ogretmen} öğretmen, {sinif} sınıf, {ders} ders, yerleşmiş {saat} saat.":
    "Jetzt: {ogretmen} {ogretmen:Lehrkraft|Lehrkräfte}, {sinif} {sinif:Klasse|Klassen}, {ders} {ders:Unterricht|Unterrichte}, {saat} gelegte {saat:Stunde|Stunden}.",
  "Plan dosyası açıldı.": "Plandatei geöffnet.",
  Bölümler: "Bereiche",
  Plan: "Plan",
  "Geri al": "Rückgängig",
  "Geri al (Ctrl+Z)": "Rückgängig (Strg+Z)",
  "İleri al": "Wiederholen",
  "Dosyadan aç": "Aus Datei öffnen",
  "Klavye kısayolları": "Tastenkombinationen",
  // -------------------------------------------------- ShortcutsHelp.tsx
  "Genel kısayollar": "Allgemein",
  "Komut paletini aç/kapat": "Befehlspalette ein-/ausblenden",
  "Bir sekmeye git": "Zu einem Bereich springen",
  "Bu ekranı aç": "Dieses Fenster öffnen",
  "İptal et veya kapat": "Abbrechen oder schließen",
  "Odaklı dersi havuza kaldır":
    "Fokussierte Stunde in den Pool zurücklegen",
  "Odaklı dersin sağ tık menüsünü aç":
    "Kontextmenü der fokussierten Stunde öffnen",
  Listeler: "Listen",
  "Yeni satır ekle veya düzenlemeyi onayla":
    "Neue Zeile hinzufügen oder Bearbeitung bestätigen",
  "Tutamaktan bir satırı sırada taşı":
    "Zeile am Griff in der Reihenfolge verschieben",
  "Satırı listenin başına veya sonuna taşı":
    "Zeile an den Anfang oder ans Ende der Liste verschieben",
  Diyaloglar: "Dialoge",
  Onayla: "Bestätigen",
  "Düğme satırı": "Schaltflächenleiste",
  Yenile: "Neu laden",
  Sonra: "Später",
  "Klasörü düzelt": "Ordner in Ordnung bringen",
  "**Son değişiklik bu bilgisayara kaydedilemedi:** depolama alanı dolu. İşinizi kaybetmemek için **Kaydet** düğmesine basın.":
    "**Die letzte Änderung konnte auf diesem Computer nicht gespeichert werden:** der Speicher ist voll. Damit Ihre Arbeit erhalten bleibt, klicken Sie auf **Speichern**.",
  "**Kayıtlı plan okunamadı.** Üzerine yazılmadı; burada yapılanlar kaydedilmez. Plan dosyanızı **Dosyadan aç** ile açabilirsiniz.":
    "**Der gespeicherte Plan konnte nicht gelesen werden.** Er wurde nicht überschrieben; was Sie hier tun, wird nicht gespeichert. Ihre Plandatei öffnen Sie mit **Aus Datei öffnen**.",
  "**Bu bilgisayarda otomatik kayıt çalışmıyor.** Mozaik kapanınca yaptığınız her şey kaybolur. Çalışırken ve bilgisayarı kapatmadan önce sık sık **Kaydet** düğmesine basın.":
    "**Das automatische Speichern funktioniert auf diesem Computer nicht.** Alles geht verloren, wenn Mozaik geschlossen wird. Drücken Sie beim Arbeiten und vor dem Herunterfahren häufig **Speichern**.",
  "**Yeni sürüm hazır.** Şu an {surum} sürümünü kullanıyorsunuz; yenisi **Yenile** deyince gelir. İşiniz kaybolmaz.":
    "**Eine neue Version ist bereit.** Sie verwenden {surum}; die neue kommt, wenn Sie **Neu laden** drücken. Ihre Arbeit geht nicht verloren.",
  "**{klasor}** klasörüne yazılamıyor: tarayıcı izni sormadan devam etmiyor. İşiniz şu an yalnız bu tarayıcıda duruyor.":
    "In den Ordner **{klasor}** kann nicht geschrieben werden: Der Browser fragt erst nach einer Berechtigung. Ihre Arbeit liegt derzeit nur in diesem Browser.",
  "**{klasor}** klasörüne **yazılamıyor**. {sebep} İşiniz şu an yalnız bu tarayıcıda duruyor.":
    "In den Ordner **{klasor}** kann **nicht geschrieben** werden. {sebep} Ihre Arbeit liegt derzeit nur in diesem Browser.",

  // src/ui/availability/Availability.tsx
  "{ad} sınıfı": "Klasse {ad}",
  "{ad} dersliği": "Raum {ad}",
  "Haftanın bu saatini değiştir": "Diese Stunde der Woche umschalten",
  "{gun}: bütün günü değiştir": "{gun}: den ganzen Tag umschalten",

  // src/ui/CapacityRows.tsx
  Ad: "Name",
  Açık: "Offen",
  Yük: "Last",
  Durum: "Status",

  // src/ui/program/Check.tsx
  "Kontrol edilecek bir şey yok.": "Es gibt noch nichts zu prüfen.",
  İmkânsız: "Unmöglich",
  "Programın durumu": "Status des Stundenplans",
  "Yerleşmiş saat": "Gelegte Stunden",
  "Kapalı saatte ders ({n})": "Unterricht in geschlossener Stunde ({n})",
  Açıklama: "Erklärung",
  "Kapalı saat": "Geschlossene Stunden",
  "Kural aşımları ({n})": "Regelüberschreitungen ({n})",
  "Kesin": "Pflicht",
  "Yerleşemeyen dersler ({n})": "Nicht legbarer Unterricht ({n})",
  Ders: "Unterricht",
  Sebep: "Grund",
  Öğretmenler: "Lehrkräfte",
  "Öğretmenin açık saat sayısı, ona yüklenen ders saatinden az olamaz.": "Die offenen Stunden einer Lehrkraft dürfen nicht geringer sein als die ihr zugewiesenen Stunden.",
  Sınıflar: "Klassen",
  "Sınıfa yüklenen toplam ders saati, sınıfın AÇIK olduğu saatlere sığmalı.":
    "Die einer Klasse zugewiesenen Gesamtstunden müssen in die OFFENEN Stunden dieser Klasse passen.",
  Derslikler: "Räume",
  "Aynı dersliği paylaşan sınıfların TOPLAM ders saati de haftaya sığmalı. En çok gözden kaçan darboğaz burasıdır.":
    "Auch die GESAMTSTUNDEN der Klassen, die sich einen Raum teilen, müssen in die Woche passen. Dieser Engpass wird am häufigsten übersehen.",
  "**Sorun görünmüyor.** Öğretmen, sınıf ve derslik açık saatleri yüklenen ders saatlerini karşılıyor. Program dizilebilir.": "**Es sieht alles in Ordnung aus.** Die offenen Stunden von Lehrkräften, Klassen und Räumen decken die zugewiesenen Stunden. Der Stundenplan lässt sich legen.",
  "**Sorun görünmüyor.** Bazı öğretmenlerin açık saati ya da bazı sınıf ve dersliklerin açık saati yüküne eşit ya da çok yakın (**Sıkışık**): orada boş saat kalmıyor ya da çok az kalıyor, ama program dizilebilir.": "**Es sieht alles in Ordnung aus.** Einige Lehrkräfte haben genau oder fast so viele offene Stunden, einige Klassen oder Räume so viele offene Stunden wie zugewiesene (**Eng**): dort bleibt keine oder kaum eine Stunde übrig, aber der Stundenplan lässt sich legen.",
  "**Dikkat edilmesi gereken noktalar var.** Aşağıdaki listelerde":
    "**Es gibt Punkte, die Aufmerksamkeit brauchen.** In den Listen unten verhindern Zeilen mit",
  "yazan satırlar programın dizilmesini engeller. Önce onları çözün.":
    "verhindern das Legen des Stundenplans. Lösen Sie diese zuerst.",
  "Kalan **{n}** saat yerleşmedi. **Program** sekmesindeki **Kalanı diz** ile yerleştirebilirsiniz.":
    "Die restlichen **{n}** Stunden sind nicht gelegt. **Rest legen** im Reiter **Stundenplan** legt sie.",
  "İpuçları ({n})": "Hinweise ({n})",
  "Bunlar programı engellemez; veri girişinde gözden kaçmış olabilecek noktalardır.":
    "Diese blockieren den Stundenplan nicht; es sind Punkte, die bei der Dateneingabe übersehen worden sein könnten.",
  "İpucu yok.": "Keine Hinweise.",
  "Not": "Hinweis",

  // src/ui/common/ColorPick.tsx
  Vazgeç: "Abbrechen",

  // src/ui/shell/Commands.tsx
  Git: "Gehe zu",
  Yap: "Aktion",
  "derslik yok": "kein Raum",
  "{n} sınıf": "{n} {n:Klasse|Klassen}",

  // src/ui/plans/DraftStart.tsx
  "Bu taslağın verisi bulunamadı":
    "Die Daten dieses Entwurfs wurden nicht gefunden",
  "{ad} kopyası": "Kopie von {ad}",
  '"{ad}" taslağından yeni bir plan açıldı.':
    "Aus dem Entwurf „{ad}“ wurde ein neuer Plan geöffnet.",

  // src/ui/program/Grid.tsx
  "Öğle arası": "Mittagspause",
  "Sürükleyerek taşıyın · sağ tık: seçenekler":
    "Zum Verschieben ziehen · Rechtsklick für Optionen",
  "{sorun}. Sürükleyerek taşıyın, sağ tıkla seçenekleri açın":
    "{sorun}. Zum Verschieben ziehen, Rechtsklick für Optionen",
  "Sabitlenmiş. Sağ tıkla sabitlemeyi kaldırabilirsiniz":
    "Angeheftet. Mit Rechtsklick lösen",

  // src/ui/program/Program.tsx — the grid's own menu
  "Havuza kaldır": "Ins Ablagefach",
  sabitlenmiş: "angeheftet",
  "Dersi düzenle": "Stunde bearbeiten",
  "Sabitlemeyi kaldır": "Anheftung lösen",
  "Bu ders sabitlenmiş. Önce sabitlemeyi kaldırın.":
    "Diese Stunde ist angeheftet. Lösen Sie zuerst die Anheftung.",
  "Ders sabitlendi.": "Stunde angeheftet.",
  "Sabitleme kaldırıldı.": "Anheftung gelöst.",

  // src/ui/program/LessonEdit.tsx
  "Günde en fazla": "Höchstens pro Tag",
  "Haftaya dağılış değiştirilirse bu dersin programdaki yerleşimleri kalkar, sabitlenmiş olanlar da":
    "Wird die Aufteilung geändert, verschwindet dieser Unterricht aus dem Stundenplan, auch die angehefteten Stunden",

  // src/ui/Ribbon.tsx — what the two destructive questions promise
  "{ad}: bilgileri ve haftalık programı": "{ad}: Angaben und Wochenstundenplan",

  // src/ui/program/Inspector.tsx
  Kapat: "Schließen",
  "Haftalık programı": "Wochenstundenplan",
  "Kayıt bulunamadı": "Kein Eintrag gefunden",

  // src/ui/program/LessonPool.tsx
  "Yerleşmeyi bekleyen dersler": "Stunden, die auf Platzierung warten",
  "Havuz yüksekliği": "Höhe des Ablagefachs",
  "Sürükleyerek havuzun boyunu ayarlayın":
    "Ziehen Sie, um die Höhe des Ablagefachs einzustellen",
  Havuz: "Ablagefach",
  "Havuzu kapat: ızgara bütün yüksekliği alır":
    "Ablagefach schließen: Das Raster nimmt die volle Höhe ein",
  "Havuzu aç": "Ablagefach öffnen",
  "Hepsi yerleşti": "Alles gelegt",
  "{n} saat bekliyor": "{n} {n:Stunde wartet|Stunden warten}",
  "sürükleyip bırakın": "ziehen und ablegen",
  "{ust} · {alt} {brans} · {boy} saatlik ders":
    "{ust} · {alt} {brans} · {boy}-stündige Stunde",
  " · {n} tane bekliyor": " · {n} warten",
  " · dersin {yerlesen}/{toplam} saati yerleşti":
    " · {yerlesen} von {toplam} Stunden des Unterrichts gelegt",

  // src/ui/ListTools.tsx
  "{ne} ara": "{ne} suchen",
  "Ara…": "Suchen…",
  "Aramayı temizle": "Suche leeren",
  Sırala: "Sortieren",
  "Girildiği sıra": "Eingabereihenfolge",
  "Önce bir sıralama seçin": "Wählen Sie zuerst eine Sortierung",
  "Süzmeyi kaldır": "Filter entfernen",
  "**{gorunen}** / {sayim}": "**{gorunen}** von {sayim}",
  "Satırları elle sıralamak için **Sırala**’yı «Girildiği sıra»ya alın ve süzmeyi kaldırın.":
    "Um Zeilen von Hand zu ordnen, stellen Sie **Sortieren** auf «Eingabereihenfolge» und entfernen Sie den Filter.",

  // src/ui/shell/Palette.tsx
  "Komut paleti": "Befehlspalette",
  "Ara veya komut yaz": "Suchen oder Befehl eingeben",
  "Öğretmen, sınıf, derslik ara ya da bir komut yaz…":
    "Lehrkraft, Klasse oder Raum suchen oder einen Befehl eingeben…",
  Esc: "Esc",
  Sonuçlar: "Ergebnisse",
  "Eşleşen bir şey yok.": "Keine Treffer.",

  // src/ui/print/Print.tsx
  Gün: "Tag",
  "Yazdırılacak program yok.": "Es gibt keinen Stundenplan zum Drucken.",
  "{ne} ({secili}/{toplam})": "{ne} ({secili}/{toplam})",
  "{ad} sınıfı · Haftalık ders programı": "Klasse {ad} · Wochenstundenplan",
  Çıktı: "Druck",
  "Yazdır ({n} kâğıt)": "Drucken ({n} {n:Blatt|Blätter})",
  "Hiçbir sayfa seçili değil, basılacak bir şey yok.":
    "Keine Seite ausgewählt, es gibt nichts zu drucken.",
  "Sayfa düzeni": "Seitenlayout",
  "Bir kâğıda kaç program": "Stundenpläne pro Blatt",
  "Kâğıttaki yazı": "Text auf dem Papier",
  "Sayfada ne olsun": "Was auf die Seite kommt",
  "Çıktı özeti": "Druckübersicht",
  Kâğıt: "Blätter",
  Sayfa: "Seiten",
  "A4 yatay": "A4 quer",
  Renk: "Farbe",
  "Seçilen sayfaların **{n}** tanesi tamamen boş. O öğretmenlerin programı henüz dizilmemiş. **Program** sekmesinden dizebilirsiniz.":
    "**{n}** der gewählten Seiten sind völlig leer. Die Stundenpläne dieser Lehrkräfte wurden noch nicht gelegt. Sie können sie im Reiter **Stundenplan** legen.",
  "Seçilen sayfaların **{n}** tanesi tamamen boş. O sınıfların programı henüz dizilmemiş. **Program** sekmesinden dizebilirsiniz.":
    "**{n}** der gewählten Seiten sind völlig leer. Die Stundenpläne dieser Klassen wurden noch nicht gelegt. Sie können sie im Reiter **Stundenplan** legen.",

  // src/ui/program/Program.tsx
  "Buraya bırakılabilir.": "Hier kann abgelegt werden.",
  "Program yapılıyor…": "Stundenplan wird erstellt…",
  "{yerlesen}/{toplam} ders · {sure} sn": "{yerlesen}/{toplam} Stunden · {sure} s",
  "Satırlar öğretmen. Hücrede sınıf ve derslik yazar. Yerleşmiş dersi sürükleyerek taşıyın, sağ tıklayınca havuza döner.":
    "Zeilen sind Lehrkräfte. Eine Zelle zeigt Klasse und Raum. Ziehen Sie eine gelegte Stunde zum Verschieben; ein Rechtsklick schickt sie zurück ins Ablagefach.",
  "Satırlar sınıf. Hücrede öğretmen ve branşı yazar. Yerleşmiş dersi sürükleyerek taşıyın, sağ tıklayınca havuza döner.":
    "Zeilen sind Klassen. Eine Zelle zeigt die Lehrkraft und ihr Fach. Ziehen Sie eine gelegte Stunde zum Verschieben; ein Rechtsklick schickt sie zurück ins Ablagefach.",
  "Kalan dizildi: {n} saat yerleşti.": "Der Rest ist gelegt: {n} {n:Stunde|Stunden} gelegt.",
  " (ve {n} saat daha)": " (und {n} weitere {n:Stunde|Stunden})",
  "Durduruldu. {yerlesen} / {toplam} saat yerleşti.": "Angehalten. {yerlesen} von {toplam} Stunden gelegt.",
  "{yerlesen} / {toplam} saat yerleşti.": "{yerlesen} von {toplam} Stunden gelegt.",
  "{bas} {ders}: {saat} saat yerleşemedi. {sebep}{digerleri}.":
    "{bas} {ders}: {saat} Stunden konnten nicht gelegt werden. {sebep}{digerleri}.",
  "Henüz dizilecek ders yok.": "Es gibt noch keinen Unterricht zu legen.",
  "Buraya döndüğünüzde dersler alttaki havuzda bekliyor olacak.":
    "Wenn Sie hierher zurückkehren, wartet der Unterricht im Ablagefach darunter.",
  Tamam: "OK",
  Öğretmen: "Lehrkraft",
  Sınıf: "Klasse",

  // src/ui/Ribbon.tsx
  "Liste boş": "Die Liste ist leer",
  Durdur: "Anhalten",
  "Yeniden yap": "Neu erstellen",
  "Programı boşalt": "Stundenplan leeren",
  "Sorun yok": "Keine Probleme",
  "Sorunlar ({n})": "Probleme ({n})",
  "{n} uyarı": "{n} {n:Warnung|Warnungen}",
  "İkisi de": "Beide",
  "Renkli bas": "In Farbe drucken",

  // src/ui/lessons/index.tsx
  "Yeni ders": "Neue Stunde",
  Branş: "Fach",
  "Sınıfa göre": "Nach Klasse",
  "Öğretmene göre": "Nach Lehrkraft",
  "Haftalık saate göre": "Nach Wochenstunden",
  "Blok sayısına göre": "Nach Anzahl der Blöcke",
  "{ders} ders · {saat} saat":
    "{ders} {ders:Unterricht|Unterrichte} · {saat} {saat:Stunde|Stunden}",
  "Dersler · {sayilar}": "Unterricht · {sayilar}",
  "{kim} · {brans} dersleri · {sayilar}": "{kim} · {brans}-Unterricht · {sayilar}",
  "{kim} dersleri · {sayilar}": "Unterricht von {kim} · {sayilar}",
  "Önce sağdaki listeden bir {ne} seçin.":
    "Wählen Sie zuerst {ne} aus der Liste rechts.",
  "Sınıf seçin": "Klasse wählen",
  "Bütün branşlar": "Alle Fächer",
  "Öğretmen seçin": "Lehrkraft wählen",
  "{brans}: {n} öğretmen": "{brans}: {n} {n:Lehrkraft|Lehrkräfte}",
  "Haftalık saat": "Wochenstunden",
  "Haftaya dağılış": "Verteilung auf die Woche",
  Ekle: "Hinzufügen",
  "Dersleri yapıştır": "Unterricht einfügen",
  "Sınıf · Öğretmen (ad veya kısa ad) · Haftalık saat · Blok (1 · 2 · 3)":
    "Klasse · Lehrkraft (Name oder Kurzname) · Wochenstunden · Block (1 · 2 · 3)",
  "Günde en fazla {n} saat kuralı bu dersi hiçbir yere sığdırmaz":
    "Die Regel \"höchstens {n} Stunden am Tag\" lässt für diese Stunde keinen Platz",
  "{boy} saat > günde {n}": "{boy} Std. > {n}/Tag",
  "{sinif} · {kim}: {saat} saat ({dagilim})":
    "{sinif} · {kim}: {saat} Stunden ({dagilim})",
  "{n} satır eklenemedi":
    "{n} {n:Zeile|Zeilen} konnten nicht hinzugefügt werden",
  "Sınıf veya öğretmen bulunamadı:": "Klasse oder Lehrkraft nicht gefunden:",
  "Önce onları ekleyip tekrar deneyin.":
    "Fügen Sie sie zuerst hinzu und versuchen Sie es erneut.",
  "Bu aramaya uyan ders yok.": "Kein Unterricht passt zu dieser Suche.",
  "Bu ders bir günde en fazla kaç saat":
    "Höchstzahl der Stunden dieses Unterrichts an einem Tag",
  "Aynı gün olmasın": "Nicht am selben Tag",
  "Aynı gün olmasın: ders ekle": "Nicht am selben Tag: Unterricht hinzufügen",
  "Ders ekle…": "Unterricht hinzufügen…",
  "Kaldır: {ne}": "Entfernen: {ne}",
  "{sinif} · {kim} dersinin branşı": "Fach des Unterrichts {sinif} · {kim}",
  "Haftaya dağılış değiştirilirse bu dersin programdaki yerleşimleri kalkar":
    "Wird die Aufteilung geändert, verschwinden die Platzierungen dieses Unterrichts aus dem Stundenplan",
  Sil: "Löschen",
  "Hangi öğretmen": "Welche Lehrkraft",
  "Hangi sınıf": "Welche Klasse",
  "Seçtiğiniz öğretmen için ders girin. Soldaki liste de o öğretmene daralır.":
    "Tragen Sie Unterricht für die gewählte Lehrkraft ein. Die Liste links wird ebenfalls auf diese Lehrkraft eingegrenzt.",
  "Seçtiğiniz sınıf için ders girin. Soldaki liste de o sınıfa daralır.":
    "Tragen Sie Unterricht für die gewählte Klasse ein. Die Liste links wird ebenfalls auf diese Klasse eingegrenzt.",
  "Ders listesi": "Unterrichtsliste",
  "Excel'den yapıştır": "Aus Excel einfügen",

  // src/ui/settings/Appearance.tsx
  Tema: "Design",
  "Yazı büyüklüğü": "Schriftgröße",
  Izgara: "Raster",
  Örnek: "Beispiel",
  Saat: "Stunde",
  "Ekran hareketleri": "Bewegung auf dem Bildschirm",
  Dil: "Sprache",
  "**Açık.** Tasarlandığı gibi.": "**Offen.** Wie entworfen.",
  "**Kapalı.** Hiçbir şey kaymaz, hiçbir şey solmaz.":
    "**Aus.** Nichts gleitet, nichts blendet ein.",

  // src/ui/settings/Data.tsx
  "Nereye kaydedilsin": "Wohin gespeichert wird",
  "Klasör seç…": "Ordner wählen…",
  "Başka klasör seç…": "Anderen Ordner wählen…",
  "İzin ver": "Erlauben",
  "Şu an yalnızca bu bilgisayarın tarayıcısında saklanıyor.":
    "Derzeit wird es nur im Browser dieses Computers gespeichert.",
  "Sürüm ve güncelleme": "Version und Aktualisierung",
  Sürüm: "Version",
  Yenilikler: "Neuigkeiten",
  "Eski sürümler": "Ältere Versionen",
  // src/platform/changelog.ts — release-note bullets, translated like any other UI copy
  "Program kurulamayınca Mozaik neyin değişmesi gerektiğini yol yol söylüyor, her yol tek tıkla uygulanıyor ve Ctrl+Z ile geri alınıyor.":
    "Lässt sich ein Stundenplan nicht legen, sagt Mozaik Weg für Weg, was sich ändern müsste; jeder Weg wird mit einem Klick angewendet und mit Strg+Z zurückgenommen.",
  "Öneri panelinde öğretmenlere sorulacak sorular var, her birinde Olur ve Olmaz; cevaplar planla birlikte saklanıyor.":
    "Der Vorschlagsbereich listet die Fragen an die Lehrkräfte, jede mit Ja und Geht nicht; die Antworten werden mit dem Plan gespeichert.",
  "Izgarada göster, önerilen programı uygulamadan önce ızgarada işaretli gösteriyor.":
    "Im Raster zeigen markiert den vorgeschlagenen Stundenplan im Raster, bevor er angewendet wird.",
  "Otomatik diz takılınca vazgeçmiyor, bulduğu en iyi programı onararak devam ediyor.":
    "Automatisch legen gibt nicht mehr auf, wenn es hängen bleibt, sondern repariert den besten gefundenen Stundenplan weiter.",
  "Dersin sayfasında \"Aynı gün olmasın\" satırı: iki ders aynı güne konmuyor.":
    "Eine Zeile \"Nicht am selben Tag\" auf der Seite des Unterrichts: zwei Unterrichte kommen nie auf denselben Tag.",
  "Bir kart, bırakıldığı saatleri dolduran kartlarla yer değiştirebiliyor.":
    "Eine Karte kann mit den Karten tauschen, die die Stunden füllen, auf die sie fallen gelassen wird.",
  "Ayarlar → Hakkında, öneri aramasının bu bilgisayarda ne kadar sürdüğünü gösteriyor.":
    "Einstellungen → Über zeigt, wie lange die Vorschlagssuche auf diesem Rechner dauert.",
  "Kontrol, program tamamken sıkışık satırlar için artık \"Dikkat\" demiyor.":
    "Prüfung sagt bei engen Zeilen nicht mehr \"Achtung\", wenn der Stundenplan vollständig ist.",
  "Dil değişince bildirimler yeni dilde; boş ekranlar dersler için Dersler sekmesini gösteriyor.":
    "Meldungen folgen einem Sprachwechsel; die leeren Seiten verweisen für den Unterricht auf den Reiter Unterricht.",
  "Program düğme satırında Renk menüsü: kartlar öğretmene, sınıfa, dersliğe ya da branşa göre boyanıyor.": "Ein Farbmenü in der Schaltflächenleiste von Stundenplan färbt Karten nach Lehrkraft, Klasse, Raum oder Fach.",
  "Bir kart başka bir kartın üstüne bırakılınca, iki hamle de uygunsa ikisi yer değiştiriyor.":
    "Eine Karte auf eine andere Karte fallen zu lassen tauscht beide, wenn beide Züge erlaubt sind.",
  "Okunmamış sürüm notu varken Ayarlar şeridindeki Hakkında düğmesinde bir nokta çıkıyor.":
    "Ein Punkt auf der Schaltfläche Über im Einstellungen-Band, solange ungelesene Versionshinweise da sind.",
  "Mozaik'in penceresi artık ekranı kaplayarak açılıyor, küçük bir kutuda değil.":
    "Das Fenster von Mozaik öffnet sich jetzt bildschirmfüllend, nicht in einem kleinen Kasten.",
  "Sığdır yoğunluğunda kart yazıları kırpılmıyor: sınıf numarası \"4…\" değil \"411\" okunuyor.":
    "In der Dichte Einpassen wird der Kartentext nicht mehr abgeschnitten: die Klassennummer lautet \"411\", nicht \"4…\".",
  "Sığdır, satır başından ve gün ayraçlarından kazandığı yeri ders sütunlarına veriyor.":
    "Einpassen gibt den Platz, den es bei Zeilenköpfen und Tagestrennern spart, an die Stundenspalten.",
  "Yazı büyüklüğü yüzde 100'ün altındayken kart yazısı da onunla birlikte küçülüyor.":
    "Ist die Schriftgröße unter 100 Prozent, wird auch der Kartentext kleiner.",
  "Sınıf ve öğretmen boşluk kuralları, planlama analizi ve Danışman notları eklendi.":
    "Regeln für Lücken bei Klassen und Lehrkräften, die Planungsanalyse und Berater-Hinweise wurden hinzugefügt.",
  "Klavye kısayolları için bir yardım ekranı eklendi (üst çubuk ya da \"?\" tuşu).":
    "Für Tastenkombinationen wurde ein Hilfebildschirm hinzugefügt (obere Leiste oder die ?-Taste).",
  'Ayarlar → Hakkında bölümüne bu "Yenilikler" paneli eklendi.':
    "Dieses Neuigkeiten-Panel wurde zu Einstellungen → Über hinzugefügt.",
  "Program kartlarını sürükleme, yoğun programlarda yaklaşık yüzde 63 hızlandırıldı.":
    "Das Ziehen von Stundenplankarten ist bei dichten Stundenplänen etwa 63 Prozent schneller.",
  "Windows görev çubuğu simgesi 20 piksel ve üzerinde ayrıntılı logoyu kullanıyor.":
    "Das Windows-Taskleistensymbol verwendet ab 20 Pixeln das detaillierte Logo.",
  "Dersler → Sınıftan görünümündeki gereksiz Branş başlığı kaldırıldı.":
    "Die überflüssige Fach-Überschrift wurde aus Unterricht → Nach Klasse entfernt.",
  "Nasıl açıldı": "Wie es geöffnet wurde",
  Adres: "Adresse",
  "Güncellemeleri denetle": "Nach Aktualisierungen suchen",
  "Yeni sürümü indir": "Neue Version herunterladen",
  "Kurulumu indir": "Installationsprogramm herunterladen",
  "Şimdi kur": "Jetzt installieren",
  "Kuruluma bak": "Zur Installation",
  "**Mozaik'i bu bilgisayara kurun.** Öneri araması (CP-SAT) için gerekli, onunla çok daha hızlı. İndirmek {mb} MB yer kaplar.": "**Installieren Sie Mozaik auf diesem Computer.** Die Vorschlagssuche (CP-SAT) braucht es und ist damit viel schneller. Der Download belegt {mb} MB.",
  "**Kurulum indi.** **Şimdi kur** deyince Mozaik kapanır, kurulum bir ilerleme çubuğuyla çalışır ve Mozaik kendiliğinden yeniden açılır. Planlarınız kayıtlı, hiçbir şey kaybolmaz. Masaüstündeki ya da görev çubuğundaki eski Mozaik simgesi de kurulan programı açar.": "**Das Installationsprogramm ist da.** Mit **Jetzt installieren** schließt sich Mozaik, die Installation läuft mit einem Fortschrittsbalken und Mozaik öffnet sich von selbst wieder. Ihre Pläne sind gespeichert, nichts geht verloren. Das alte Mozaik-Symbol auf dem Desktop oder in der Taskleiste öffnet ebenfalls das installierte Programm.",
  "**Mozaik'i bu bilgisayara kurun.** Öneri araması (CP-SAT) ancak kurulumla gelir ve çok daha hızlıdır. Planlarınız yerinde kalır.": "**Installieren Sie Mozaik auf diesem Computer.** Die Vorschlagssuche (CP-SAT) kommt nur mit der Installation und ist viel schneller. Ihre Pläne bleiben, wo sie sind.",
  "Şimdi yeniden başlat": "Jetzt neu starten",
  "Bakılıyor…": "Wird geprüft…",
  "En son sürümü kullanıyorsunuz.": "Sie verwenden die neueste Version.",
  "Yeni sürüm iniyor…": "Die neue Version wird heruntergeladen…",
  "Her şey silinecek": "Alles wird gelöscht",
  "Devam et": "Weiter",
  "{yazilan} plan dosyaya yazıldı; {eksik} planın verisi bulunamadı.":
    "{yazilan} {yazilan:Plan|Pläne} in die Datei geschrieben; die Daten von {eksik} {eksik:Plan|Plänen} wurden nicht gefunden.",
  "{yazilan} plan tek dosyaya yazıldı.":
    "{yazilan} {yazilan:Plan|Pläne} in eine Datei geschrieben.",
  "Bu dosya Mozaik'in daha yeni bir sürümüyle yazılmış. Mozaik'i güncelleyin.":
    "Diese Datei wurde mit einer neueren Version von Mozaik geschrieben. Aktualisieren Sie Mozaik.",
  "Bu bilgisayardaki bütün planların yerine geçecek":
    "Es ersetzt alle Pläne auf diesem Computer",
  "Buradaki {buradaki} plan silinip dosyadaki {gelen} plan açılacak. Bu işlem geri alınamaz.":
    "Die {buradaki} {buradaki:Plan|Pläne} hier werden gelöscht und die {gelen} {gelen:Plan|Pläne} aus der Datei geöffnet. Das lässt sich nicht rückgängig machen.",
  "Hepsini değiştir": "Alle ersetzen",
  "Dosyadaki hiçbir plan okunamadı; hiçbir şey değişmedi.":
    "Kein einziger Plan in der Datei konnte gelesen werden; nichts hat sich geändert.",
  "{acilan} plan açıldı, {yazilamayan} plan yazılamadı. Depolama dolmuş olabilir. Dosyayı saklayın.":
    "{acilan} {acilan:Plan|Pläne} geöffnet, {yazilamayan} konnten nicht geschrieben werden. Der Speicher könnte voll sein. Bewahren Sie die Datei auf.",
  "Dosyadaki {yeni} plan Mozaik'in daha yeni bir sürümüyle yazılmış, açılmayacak. Mozaik'i güncelleyin.":
    "{yeni} {yeni:Plan|Pläne} in der Datei {yeni:wurde|wurden} mit einer neueren Version von Mozaik geschrieben und {yeni:wird|werden} nicht geöffnet. Aktualisieren Sie Mozaik.",
  "{yeni} plan Mozaik'in daha yeni bir sürümüyle yazıldığı için açılmadı. Mozaik'i güncelleyin.":
    "{yeni} {yeni:Plan wurde|Pläne wurden} mit einer neueren Version von Mozaik geschrieben und nicht geöffnet. Aktualisieren Sie Mozaik.",
  "Dosyadaki {eksik} plan eksik ya da bozuk, açılmayacak.":
    "{eksik} {eksik:Plan|Pläne} in der Datei {eksik:ist|sind} unvollständig oder beschädigt und {eksik:wird|werden} nicht geöffnet.",
  "{acilan} plan açıldı, {eksik} plan eksik ya da bozuk olduğu için açılmadı.":
    "{acilan} {acilan:Plan|Pläne} geöffnet; {eksik} {eksik:war|waren} unvollständig oder beschädigt und {eksik:wurde|wurden} nicht geöffnet.",
  "{acilan} plan açıldı.": "{acilan} {acilan:Plan|Pläne} geöffnet.",
  "Bütün planlar tek dosyada": "Alle Pläne in einer Datei",
  "Bütün planları dosyaya kaydet ({n} plan)": "Alle in Datei speichern ({n} {n:Plan|Pläne})",
  "Bu bilgisayardaki bütün planların yerine dosyadakiler geçer":
    "Die Pläne der Datei ersetzen alle Pläne auf diesem Computer",
  "Bütün planları dosyadan aç": "Alle aus Datei öffnen",
  "Bütün planları içeren dosya": "Die Datei mit allen Plänen",
  "Bu planın verisi": "Die Daten dieses Plans",
  "Örnek okul verisi": "Beispiel-Schuldaten",
  "Bu planın yerine hazır örnek okulu koyar":
    "Setzt die fertige Beispielschule an die Stelle dieses Plans",
  "Örnek okulu yükle": "Beispielschule laden",
  Sıfırla: "Zurücksetzen",
  "Her şeyi sil": "Alles löschen",
  "Veriler nerede": "Wo die Daten liegen",
  Anahtar: "Schlüssel",
  Ne: "Was",
  Yer: "Größe",
  "Bu bilgisayardaki otomatik yedekler":
    "Automatische Sicherungen auf diesem Computer",
  "Henüz otomatik yedek yok; ilki Mozaik bir daha açılınca alınır.":
    "Noch keine automatische Sicherung; die erste entsteht beim nächsten Start von Mozaik.",
  "Otomatik yedek": "Automatische Sicherung",
  "bir önceki açılış": "letzter Start",
  "{n} açılış önce": "vor {n} {n:Start|Starts}",
  "daha yeni bir sürümle yazılmış, bu sürüm açamıyor":
    "von einer neueren Version geschrieben, diese Version kann sie nicht öffnen",
  "okunamadı": "nicht lesbar",
  "O zamana kadar üst çubuktaki **Kaydet** tek çare.":
    "Bis dahin ist **Speichern** in der oberen Leiste das einzige Mittel.",
  "**{klasor}** klasörü seçilmiş, ama tarayıcı izni her açılışta yeniden soruyor. **İzin ver** deyin.":
    "Der Ordner **{klasor}** ist gewählt, aber der Browser fragt bei jedem Start erneut nach der Berechtigung. Wählen Sie **Erlauben**.",
  "**{klasor}** · yazılıyor…": "**{klasor}** · wird geschrieben…",
  "**Yeni sürüm hazır.** Üstteki **Yenile** düğmesine basın.":
    "**Eine neue Version ist bereit.** Drücken Sie oben auf **Neu laden**.",
  "**v{surum} çıktı{tarih}.** İndirmek {mb} MB yer kaplar. İndirdikten sonra ne zaman geçeceğinize siz karar verirsiniz.":
    "**v{surum} ist erschienen{tarih}.** Der Download belegt {mb} MB. Nach dem Herunterladen entscheiden Sie, wann Sie wechseln.",
  "**v{surum} indi.** Yeniden başlatınca yeni sürüm açılır. Planlarınız kayıtlı, hiçbir şey kaybolmaz.":
    "**v{surum} wurde heruntergeladen.** Beim Neustart öffnet sich die neue Version. Ihre Pläne sind gespeichert, nichts geht verloren.",

  // src/ui/settings/Plans.tsx
  "Bu işlem geri alınamaz.": "Das lässt sich nicht rückgängig machen.",
  "{ogretmen} öğretmen, {sinif} sınıf, {ders} ders ve yerleşmiş {saat} saat silinecek. Bu işlem geri alınamaz.":
    "{ogretmen} {ogretmen:Lehrkraft|Lehrkräfte}, {sinif} {sinif:Klasse|Klassen}, {ders} {ders:Unterricht|Unterrichte} und {saat} gelegte {saat:Stunde|Stunden} werden gelöscht. Das lässt sich nicht rückgängig machen.",
  '"{ad}" planı silinecek': "Der Plan „{ad}“ wird gelöscht",
  "Planı sil": "Plan löschen",
  "Planlar ({n})": "Pläne ({n})",
  "Yeni plan": "Neuer Plan",
  "Boş plan": "Leerer Plan",
  "Bu planın kopyası": "Kopie dieses Plans",
  "Öğretmenler, sınıflar ve dersler kalır; dizilmiş program boşalır":
    "Lehrkräfte, Klassen und Unterricht bleiben; der gelegte Stundenplan wird geleert",
  "Taslak olarak kaydet": "Als Entwurf speichern",
  Taslak: "Entwurf",
  İçerik: "Inhalt",
  "{ad} adı": "Name von {ad}",
  "· açık olan": "· offen",
  "Bu planın verisi bulunamadı": "Die Daten dieses Plans wurden nicht gefunden",
  "{ogretmen} öğretmen · {sinif} sınıf · {ders} ders":
    "{ogretmen} {ogretmen:Lehrkraft|Lehrkräfte} · {sinif} {sinif:Klasse|Klassen} · {ders} {ders:Unterricht|Unterrichte}",
  "Bu plana geç": "Zu diesem Plan wechseln",
  "Tek plan silinemez": "Der einzige Plan kann nicht gelöscht werden",
  "Bu planı tamamen siler": "Löscht diesen Plan vollständig",
  "Taslaktan başla": "Mit einem Entwurf beginnen",
  "· verisi yok": "· keine Daten",
  "Taslağın kurulumu (derslikler, öğretmenler, sınıflar, dersler) kopyalanır; ** dizilmiş program boş gelir**. Taslağın kendisi değişmez.":
    "Die Einrichtung des Entwurfs (Räume, Lehrkräfte, Klassen, Unterricht) wird kopiert; **der gelegte Stundenplan kommt leer**. Der Entwurf selbst ändert sich nicht.",

  // src/ui/settings/Rules.tsx
  Kurallar: "Regeln",
  Kural: "Regel",
  "Şu an": "Derzeit",
  "{kural} kuralı": "Regel „{kural}“",
  Kapalı: "Aus",
  "Aşan yok": "Keine Überschreitung",
  "Kendi sınırı olan öğretmenler ({n})": "Lehrkräfte mit eigenen Grenzen ({n})",
  "Art arda": "Am Stück",
  "Günde en az": "Mindestens pro Tag",
  "Aşımlar ({n})": "Überschreitungen ({n})",
  "Hiçbir sınır aşılmıyor.": "Keine Grenze wird überschritten.",
  "Kendi sınırı olan sınıflar ({n})": "Klassen mit eigener Grenze ({n})",

  // src/ui/settings/School.tsx
  "Zil ve günler": "Klingel und Tage",
  "Okul adı (kâğıtların başında)": "Schulname (oben auf den Blättern)",
  "örn. Semiz Kurs": "z. B. Semiz-Kurs",
  "ders yok": "kein Unterricht",
  "{gun} öğle arası": "Mittagspause am {gun}",
  "Uzun ara yok": "Keine lange Pause",
  "{n}. saatten sonra": "nach der {n}. Stunde",
  "En az bir gün seçmelisiniz.": "Sie müssen mindestens einen Tag wählen.",
  "Günün saatleri": "Stunden des Tages",
  "Günlük saat sayısı": "Stunden pro Tag",
  "İlk saatin başlangıcı": "Beginn der ersten Stunde",
  "Başlangıç saati": "Anfangsstunde",
  "Başlangıç dakikası": "Anfangsminute",
  "Teneffüs (dk)": "Pause (Min.)",
  "Öğle arası (dk)": "Mittagspause (Min.)",
  "Saat adları (virgülle ayırın)": "Namen der Stunden (durch Komma trennen)",
  "{n} ad saat sayısından fazlaydı ve kullanılmadı.":
    "{n} {n:Name war|Namen waren} mehr als die Anzahl der Stunden und {n:wurde|wurden} nicht verwendet.",
  "Bunların {n} saati sabitli, sabitlemeleri de kalkacak.":
    "{n} davon {n:ist|sind} fixiert, auch die {n:Fixierung verschwindet|Fixierungen verschwinden}.",
  "Bu dersler havuza dönecek. Geri al ile geri getirebilirsiniz.":
    "Diese Stunden kommen zurück in die Ablage. Rückgängig holt sie zurück.",
  "Günlük saat sayısı {n} olacak":
    "Der Tag hat dann {n} {n:Stunde|Stunden}",
  "{saat}. saatten sonra yerleşmiş {n} saat var.":
    "Nach der {saat}. Stunde {n:ist|sind} {n} {n:Stunde|Stunden} gelegt.",
  "Saat sayısını düşür":
    "Anzahl senken",
  "{gun} ders günlerinden çıkacak":
    "{gun} ist dann kein Unterrichtstag mehr",
  "{gun} günü yerleşmiş {n} saat var.":
    "Am {gun} {n:ist|sind} {n} {n:Stunde|Stunden} gelegt.",
  "{gun} gününü çıkar":
    "{gun} entfernen",
  "Zil saatleri": "Klingelzeiten",
  Ara: "Pause",
  "Öğle arası, {dk} dk": "Mittagspause, {dk} Min.",
  Bitiş: "Ende",

  // src/ui/setup/Classes.tsx
  Derslik: "Raum",
  "Ada göre": "Nach Name",
  "Dersliğe göre": "Nach Raum",
  "Ders yüküne göre": "Nach Unterrichtslast",
  "Yeni sınıf": "Neue Klasse",
  "Sınıf adı, örn. 510": "Klassenname, z. B. 510",
  "Derslik yok": "Kein Raum",
  "Sınıfları yapıştır": "Klassen einfügen",
  "Sınıf adı · Derslik adı": "Klassenname · Raumname",
  "{ad} → {derslik} dersliği": "{ad} → Raum {derslik}",
  "Bu aramaya uyan sınıf yok.": "Keine Klasse passt zu dieser Suche.",
  "Ders saati": "Unterrichtsstunden",
  "Günde aynı ders ↑": "Gleicher Unterricht/Tag ↑",
  "{ad} bir günde aynı dersten en fazla kaç saat":
    "wie viele Stunden desselben Unterrichts {ad} an einem Tag haben darf",
  yok: "keine",
  "Bilgileri ve haftalık programı": "Angaben und Wochenstundenplan",

  // src/ui/setup/Paste.tsx
  "Buraya yapıştırın...": "Hier einfügen...",
  Önizle: "Vorschau",
  "Okunabilir satır bulunamadı.": "Keine lesbare Zeile gefunden.",
  "Excel'de sütunları seçip kopyalayın, aşağıya yapıştırın. Beklenen sıra: **{ornek}**":
    "Markieren und kopieren Sie die Spalten in Excel und fügen Sie sie unten ein. Erwartete Reihenfolge: **{ornek}**",
  "**{n} satır okundu.** Aşağıdakiler eklenecek:":
    "**{n} {n:Zeile|Zeilen} gelesen.** Folgendes wird hinzugefügt:",

  // src/ui/setup/Rooms.tsx
  "Sınıf sayısına göre": "Nach Anzahl der Klassen",
  "Yeni derslik": "Neuer Raum",
  "Derslik adı, örn. A": "Raumname, z. B. A",
  "Derslikleri yapıştır": "Räume einfügen",
  "Derslik adı (her satırda bir tane)": "Raumname (einer pro Zeile)",
  "Bu aramaya uyan derslik yok.": "Kein Raum passt zu dieser Suche.",
  "Sınıf sayısı": "Anzahl der Klassen",

  // src/ui/setup/Subjects.tsx
  "Bir öğretmende var ama listede yok":
    "Eine Lehrkraft hat es, die Liste nicht",
  "· listede değil": "· nicht in der Liste",
  "{ad} kısaltması": "Kürzel für {ad}",
  Varsayılan: "Standard",
  "Hazır kısaltma": "Vorgegebene Kürzel",
  "Listeden çıkar": "Aus der Liste entfernen",
  "Bu branş zaten listede değil":
    "Dieses Fach steht ohnehin nicht in der Liste",
  '"{ad}" branşı kullanılıyor': "Das Fach „{ad}“ wird verwendet",
  "{n} öğretmen bu branşta ({kimler}). Önce onların branşını değiştirin, sonra bu branşı silin.":
    "{n} {n:Lehrkraft hat|Lehrkräfte haben} dieses Fach ({kimler}). Ändern Sie zuerst deren Fach und löschen Sie es dann.",
  "Yeni branş (örn. Robotik)": "Neues Fach (z. B. Robotik)",
  "Yeni branş": "Neues Fach",
  "Bu branş listede zaten var.": "Dieses Fach steht bereits in der Liste.",
  Kısaltma: "Kürzel",
  "Kısa ad": "Kurzname",

  // src/ui/setup/Summary.tsx
  Renkler: "Farben",
  "Öğretmen renklerini yeniden dağıt ({n})": "Lehrerfarben neu verteilen ({n})",
  "Sınıf renklerini yeniden dağıt ({n})": "Klassenfarben neu verteilen ({n})",
  Özet: "Übersicht",
  "Hazır branşlar ({n})": "Fertige Fächer ({n})",
  "Hazır branşların hepsi listede.": "Alle vorgegebenen Fächer stehen bereits in der Liste.",
  "Hazır branşların hepsini listeye ekler": "Fügt alle vorgegebenen Fächer zur Liste hinzu",
  "Hepsini ekle": "Alle hinzufügen",
  "{ad} branşını listeye ekler": "Fügt das Fach {ad} zur Liste hinzu",
  "Listeye ekle": "Zur Liste hinzufügen",
  "Kullanılmayan {n} branş: {hangileri}.": "{n} ungenutzte {n:Fach|Fächer}: {hangileri}.",
  "Derslik yükü": "Raumlast",
  "Henüz derslik yok.": "Noch keine Räume.",
  "Hangi sınıflar": "Welche Klassen",
  "sınıf yok": "keine Klassen",
  "{n} sınıf: {hangileri}": "{n} {n:Klasse|Klassen}: {hangileri}",
  "Öğretmen yükü": "Lehrerlast",
  "Henüz öğretmen yok.": "Noch keine Lehrkräfte.",
  "Sınıf yükü": "Klassenlast",
  "Henüz sınıf yok.": "Noch keine Klassen.",
  "Ders yükü": "Unterrichtslast",
  "Hiç dersi olmayan öğretmen: {kimler}.":
    "Lehrkräfte ganz ohne Unterricht: {kimler}.",
  "**{n} {ne} başkasıyla aynı renkte.** Renk burada bir kimlik: ızgarada, havuzda ve kâğıtta okunuyor.":
    "**{n} {ne} haben dieselbe Farbe wie jemand anderes.** Farbe ist hier eine Identität: Sie wird im Raster, im Ablagefach und auf dem Papier gelesen.",
  "Sınıfa yüklenen toplam ders saati, sınıfın **açık** olduğu saatlere sığmalı.":
    "Die einer Klasse zugewiesenen Gesamtstunden müssen in die **offenen** Stunden dieser Klasse passen.",
  "**{n} sınıfın hiç dersi yok** ({hangileri}).":
    "**{n} {n:Klasse hat|Klassen haben} gar keinen Unterricht** ({hangileri}).",

  // src/ui/setup/Teachers.tsx
  Cinsiyet: "Geschlecht",
  "Branşa göre": "Nach Fach",
  "Açık saate göre": "Nach offenen Stunden",
  "Cinsiyete göre": "Nach Geschlecht",
  "Yeni öğretmen": "Neue Lehrkraft",
  "Ad Soyad": "Vor- und Nachname",
  "Boş bırakırsanız addan üretilir":
    "Leer gelassen, wird es aus dem Namen gebildet",
  "Branş seçin": "Fach wählen",
  "+ Yeni branş…": "+ Neues Fach…",
  "Yeni branşın adı": "Name des neuen Fachs",
  "İkinci branş": "Zweites Fach",
  "Öğretmenleri yapıştır": "Lehrkräfte einfügen",
  "Ad Soyad · Kısa ad · Branş · Cinsiyet · İkinci branş · E-posta":
    "Vor- und Nachname · Kurzname · Fach · Geschlecht · Zweites Fach · E-Mail",
  "Bu aramaya uyan öğretmen yok.": "Keine Lehrkraft passt zu dieser Suche.",
  "2. branş": "2. Fach",
  Yok: "Keins",
  "{kim} art arda en fazla kaç saat":
    "höchstens wie viele Stunden am Stück für {kim}",
  "{kim} günde en fazla kaç saat":
    "höchstens wie viele Stunden pro Tag für {kim}",
  "{kim} geldiği gün en az kaç saat":
    "mindestens wie viele Stunden an einem Anwesenheitstag von {kim}",
  "Branş listesi boş. **Branşlar** adımından ekleyebilirsiniz.":
    "Die Fächerliste ist leer. Sie können sie im Schritt **Fächer** hinzufügen.",
  "**Aynı kısa ad birden çok öğretmende:** ızgarada iki satır ayırt edilemez.":
    "**Derselbe Kurzname bei mehreren Lehrkräften:** Zwei Zeilen im Raster sind nicht zu unterscheiden.",

  // src/ui/setup/index.tsx
  Başlarken: "Zum Anfang",
  "Mozaik'in ne yaptığını görmek isterseniz hazır bir okul yükleyebilirsiniz.":
    "Wenn Sie sehen möchten, was Mozaik tut, können Sie eine fertige Schule laden.",
  "Bir daha gösterme": "Nicht mehr anzeigen",
  "{ad} ile başla": "Mit {ad} beginnen",
  "Daha önce **taslak** olarak işaretlediğiniz planların kurulumu hazır duruyor. Seçtiğinizden **yeni bir plan** açılır: derslikler, öğretmenler, sınıflar ve dersler kopyalanır, dizilmiş program boş gelir. Taslağın kendisi değişmez.":
    "Die Einrichtung der als **Entwurf** markierten Pläne liegt bereit. Wählen Sie einen, öffnet sich **ein neuer Plan**: Räume, Lehrkräfte, Klassen und Unterricht werden kopiert, der gelegte Stundenplan kommt leer. Der Entwurf selbst ändert sich nicht.",

  // src/ui/useRowOrder.tsx
  Sıra: "Reihenfolge",
  "{ad}, {n}. sıra, taşımak için yukarı ve aşağı ok":
    "{ad}, Position {n}, mit Pfeil auf/ab verschieben",
  "Elle sıralama için süzmeyi ve sıralamayı kaldırın":
    "Zum Ordnen von Hand Filter und Sortierung entfernen",

  // src/ui/plans/useSample.ts
  "{ogretmen} öğretmen, {sinif} sınıf ve {ders} ders silinecek.":
    "{ogretmen} {ogretmen:Lehrkraft|Lehrkräfte}, {sinif} {sinif:Klasse|Klassen} und {ders} {ders:Unterricht|Unterrichte} werden gelöscht.",
  "Bu plandaki her şeyin yerine örnek okul geçecek":
    "Die Beispielschule ersetzt alles in diesem Plan",
  "Örnek okul verisi yüklenecek": "Beispiel-Schuldaten werden geladen",
  "Yerine koy": "Ersetzen",
  Yükle: "Laden",
  "Örnek okul yüklendi.": "Beispielschule geladen.",

  // src/constraints.ts
  "Ders bulunamadı": "Unterricht nicht gefunden",
  "Ders eksik tanımlı": "Der Unterricht ist unvollständig definiert",
  "Geçersiz hücre": "Ungültige Zelle",
  "Bu saat günün dışında": "Diese Stunde liegt außerhalb des Tages",
  "{boy} saatlik ders güne sığmıyor":
    "Eine {boy}-stündige Stunde passt nicht in den Tag",
  "{n}. gün": "Tag {n}",
  "{sinif} sınıfının {gun} {saat}. saatte {ders} var": "Klasse {sinif} hat am {gun} in der {saat}. Stunde bereits {ders}",
  "başka ders": "einen anderen Unterricht",
  "{sinif} sınıfı {gun} {saat}. saatte kapalı": "Klasse {sinif} ist am {gun} in der {saat}. Stunde geschlossen",
  "{kim}, {gun} {saat}. saatte kapalı": "Die {saat}. Stunde am {gun} ist für {kim} gesperrt",
  "{kim}, {gun} {saat}. saatte {sinif} sınıfında": "{kim} ist am {gun} in der {saat}. Stunde bei Klasse {sinif}",
  başka: "einer anderen",
  "{derslik} dersliğinde {gun} {saat}. saatte {sinif} var": "In Raum {derslik} ist am {gun} in der {saat}. Stunde {sinif}",
  "başka sınıf": "eine andere Klasse",
  "{derslik} dersliği {gun} {saat}. saatte kapalı": "Raum {derslik} ist am {gun} in der {saat}. Stunde geschlossen",
  "{kim} art arda {sinir} saatten fazla girmemeli, burada {olan} saat olur":
    "{kim} darf höchstens {sinir} Stunden am Stück unterrichten; hier wären es {olan}",
  "{ders} {gun} günü var, bu dersle aynı güne konmamalı":
    "{ders} liegt am {gun}; dieser Unterricht darf nicht auf denselben Tag",
  "{bir} ile {iki} {gun} günü ikisi de var, aynı gün olmamalı.":
    "{bir} und {iki} liegen beide am {gun}; sie dürfen nicht auf denselben Tag.",
  "Aynı gün olmaması istenen iki ders aynı gündeyse, dersin sayfasındaki **Aynı gün olmasın** satırı onları gösterir.":
    "Liegen zwei Unterrichte, die nicht auf denselben Tag dürfen, am selben Tag, zeigt die Zeile **Nicht am selben Tag** auf der Seite des Unterrichts sie an.",
  "{bir} ile {iki} {gun} günü sabitlenmiş; aynı gün olmamaları istendiği için biri yerinden oynamadan bir yol bulunamaz.":
    "{bir} und {iki} sind am {gun} beide angeheftet; sie dürfen nicht am selben Tag liegen, also gibt es keinen Weg, bis eines verschoben wird.",
  "İkisi de **sabitlenmişse** **Kalanı diz** öneri arayamaz; birinin sabitlemesini kaldırın ya da başka güne taşıyın.":
    "Sind beide **angeheftet**, kann **Rest legen** keine Vorschläge suchen; lösen Sie eines oder verschieben Sie es auf einen anderen Tag.",
  "{kim} {gun} günü en fazla {sinir} saat girmeli, burada {olan} saat olur":
    "{kim} darf am {gun} höchstens {sinir} Stunden unterrichten; hier wären es {olan}",
  "{sinif} sınıfı {gun} günü {kim} dersinden en fazla {sinir} saat görmeli, burada {olan} saat olur":
    "Klasse {sinif} darf am {gun} höchstens {sinir} Stunden bei {kim} haben; hier wären es {olan}",
  "{ders} dersi havuza dönecek": "der Unterricht {ders} geht zurück ins Ablagefach",
  "{dersler} dersleri havuza dönecek":
    "die Unterrichte {dersler} gehen zurück ins Ablagefach",
  "{ders} dersi havuza döndü": "der Unterricht {ders} ist zurück ins Ablagefach gegangen",
  "{dersler} dersleri havuza döndü":
    "die Unterrichte {dersler} sind zurück ins Ablagefach gegangen",
  "{gun} {saat}. saatte": "am {gun} in der {saat}. Stunde",
  "{kim}, {ne_zaman} kapalı": "{kim} ist {ne_zaman} gesperrt",
  "{sinif} sınıfı {ne_zaman} kapalı":
    "Klasse {sinif} ist {ne_zaman} geschlossen",
  "{derslik} dersliği {ne_zaman} kapalı":
    "Raum {derslik} ist {ne_zaman} geschlossen",

  // src/drag.ts
  "Bu hücreye bırakılamaz": "In dieser Zelle kann nicht abgelegt werden",

  // src/entities.ts
  "{sinif} sınıfının {kim} dersi": "der Unterricht von {kim} in der Klasse {sinif}",
  "Bu sınıf": "Diese Klasse",
  "{n} saat": "{n} {n:Stunde|Stunden}",
  "Açık saat": "Offene Stunden",
  "Branşı: {brans}": "Fach: {brans}",
  "Henüz dersi yok": "Noch kein Unterricht",
  "{n} dersi var: {hangileri}": "{n} {n:Unterricht|Unterrichte}: {hangileri}",
  "Dersliği: {derslik}": "Raum: {derslik}",
  "Hiçbir sınıf bu dersliği kullanmıyor": "Keine Klasse nutzt diesen Raum",
  "{n} sınıf paylaşıyor: {hangileri}":
    "von {n} {n:Klasse|Klassen} genutzt: {hangileri}",

  // src/feasibility.ts
  "Boş yer kalmamış": "Es ist kein Platz mehr frei",
  "{kim} {acik} saat açık, {yuk} saat ders yüklenmiş. {fazla} saat fazla.": "{kim} hat {acik} offene Stunden und ist mit {yuk} Stunden belegt. Das sind {fazla} zu viel.",
  "{kim} {acik} saat açık, {yuk} saat ders yüklenmiş. Zor olacak.": "{kim} hat {acik} offene Stunden und ist mit {yuk} Stunden belegt. Das wird eng.",
  "{kim} {acik} saat açık, {yuk} saat ders yüklenmiş.": "{kim} hat {acik} offene Stunden und ist mit {yuk} Stunden belegt.",
  "{sinif} sınıfına {yuk} saat ders yüklenmiş ama haftada {acik} saati açık. {fazla} saat fazla.":
    "Klasse {sinif} ist mit {yuk} Stunden belegt, aber nur {acik} Stunden in der Woche offen. Das sind {fazla} zu viel.",
  "{sinif} sınıfı: açık olan {acik} saatin {yuk} saati dolu.":
    "Klasse {sinif}: {yuk} von {acik} offenen Stunden sind belegt.",
  "{derslik} dersliğini {n} sınıf paylaşıyor ({hangileri}) ve toplam {yuk} saat ders var. Haftada {acik} saati açık, {fazla} saat fazla.":
    "Raum {derslik} wird von {n} Klassen genutzt ({hangileri}), zusammen {yuk} Stunden. Er ist {acik} Stunden in der Woche offen, also {fazla} zu wenig.",
  "{derslik} dersliği ({hangileri}): açık olan {acik} saatin {yuk} saati dolu.":
    "Raum {derslik} ({hangileri}): {yuk} von {acik} offenen Stunden sind belegt.",
  "{n} kural aşımı": "{n} {n:Regelüberschreitung|Regelüberschreitungen}",
  "{n} ders kapalı saatte": "{n} {n:Unterricht|Unterrichte} in geschlossener Stunde",
  "{n} ders sığmıyor": "{n} {n:Unterricht passt|Unterrichte passen} nicht",
  "{n} saat yerleşmedi": "{n} {n:Stunde|Stunden} nicht gelegt",
  "Henüz ders girilmedi": "Noch kein Unterricht eingetragen",
  "{ders} haftada {n} kez konacak ama yalnızca {gun} gün var; en az bir günde iki kez görülecek.":
    "{ders} muss {n} Mal pro Woche gelegt werden, aber es gibt nur {gun} Tage; an mindestens einem Tag erscheint es zweimal.",
  "{kim} yalnızca {acik} günde açık ama bir dersi haftada {n} kez konacak; bir güne iki kez düşebilir.": "{kim} ist nur an {acik} Tagen offen, aber ein Unterricht muss {n} Mal pro Woche gelegt werden; er kann an einem Tag zweimal landen.",
  "{ders} {n} ayrı bloğa bölünmüş ve hiç tekli saat bırakmıyor; Mozaik'in deneyebileceği tek şekil bu.":
    "{ders} ist in {n} eigenständige Blöcke aufgeteilt und lässt keine Einzelstunde übrig; das ist die einzige Form, die Mozaik versuchen kann.",
  "{n} ders haftada günden çok kez konacak; en az bir günde iki kez görülecek:":
    "{n} Unterrichte müssen öfter pro Woche gelegt werden, als es Tage gibt; jeder erscheint an mindestens einem Tag zweimal:",
  "{n} öğretmenin açık günü bir dersinin istediğinden az; bir güne iki kez düşebilir:": "{n} Lehrkräfte haben weniger offene Tage, als einer ihrer Unterrichte braucht; er kann an einem Tag zweimal landen:",
  "{n} ders bloklara bölünmüş ve hiç tekli saat bırakmıyor; Mozaik'in deneyebileceği tek şekil bu:":
    "{n} Unterrichte sind in Blöcke aufgeteilt und lassen keine Einzelstunde übrig; das ist die einzige Form, die Mozaik versuchen kann:",

  // src/import.ts
  '{n}. satır: "{ad}" iki kez geçiyor, biri alındı.':
    "Zeile {n}: „{ad}“ kommt zweimal vor; eines wurde übernommen.",
  '{n}. satır: "{ad}" için branş boş.':
    "Zeile {n}: Das Fach für „{ad}“ ist leer.",
  '{n}. satır: "{ad}" sınıfı iki kez geçiyor, biri alındı.':
    "Zeile {n}: Klasse „{ad}“ kommt zweimal vor; eine wurde übernommen.",
  "{n}. satır: sınıf veya öğretmen boş, atlandı.":
    "Zeile {n}: Klasse oder Lehrkraft ist leer; übersprungen.",
  '{n}. satır: "{sinif} / {kim}" için saat okunamadı, atlandı.':
    "Zeile {n}: Die Stunden für „{sinif} / {kim}“ konnten nicht gelesen werden; übersprungen.",

  // src/library.ts
  "Adsız plan": "Plan ohne Namen",
  "Geri gelen plan {n}": "Wiedergefundener Plan {n}",
  "Uygulama (.exe)": "Anwendung (.exe)",
  "Dosya (çift tıklanan .html)": "Datei (doppelt angeklickte .html)",
  "Windows kurulumu": "Windows-Installation",
  Site: "Website",
  "plan listesi": "die Planliste",
  "otomatik yedek · bir önceki açılış": "automatische Sicherung · letzter Start",
  "otomatik yedek · {n} açılış önce": "automatische Sicherung · vor {n} {n:Start|Starts}",
  "tema tercihi": "Design-Einstellung",
  "dil tercihi": "Spracheinstellung",
  "kenar çubuğu tercihi": "Seitenleisten-Einstellung",
  "yazı büyüklüğü tercihi": "Schriftgrößen-Einstellung",
  "ızgara yoğunluğu tercihi": "Rasterdichte-Einstellung",
  "arayüz yoğunluğu tercihi": "Oberflächendichte-Einstellung",
  "havuz çekmecesi tercihi": "Ablagefach-Einstellung",
  "havuz çekmecesinin boyu": "Höhe des Ablagefachs",
  "düğme satırı tercihi": "Schaltflächenleisten-Einstellung",
  "düğme satırı kaydırınca gizlensin mi": "ob die Schaltflächenleiste beim Scrollen ausblendet",
  "kişi sayfasında saat gösterimi (artık kullanılmıyor)": "Uhrzeiten auf der Personenseite (wird nicht mehr verwendet)",
  "ekran hareketleri tercihi": "Einstellung für Bildschirmbewegungen",
  "örnek okul satırı görüldü mü": "ob die Zeile zur Beispielschule gesehen wurde",
  "kâğıt seçenekleri": "Papieroptionen",
  "görülen sürüm notu": "zuletzt gesehene Version der Versionshinweise",

  // src/rules.ts
  "{kim} {gun} günü": "{kim} am {gun}",
  "{kim_gun} {olan} saat ders veriyor, en fazla {sinir} saat isteniyor.":
    "{kim_gun} unterrichtet {olan} Stunden; höchstens {sinir} waren gewünscht.",
  "{kim_gun} sadece {olan} saat ders veriyor, en az {sinir} saat isteniyor.":
    "{kim_gun} unterrichtet nur {olan} Stunden; mindestens {sinir} waren gewünscht.",
  "{kim_gun} art arda {olan} saat ders veriyor, en fazla {sinir} saat isteniyor.":
    "{kim_gun} unterrichtet {olan} Stunden am Stück; höchstens {sinir} waren gewünscht.",
  "{sinif} sınıfı {gun} günü {kim} dersinden {olan} saat görüyor, en fazla {sinir} saat isteniyor.":
    "Klasse {sinif} hat am {gun} {olan} Stunden bei {kim}; höchstens {sinir} waren gewünscht.",
  "{kim} {gun} günü dersleri arasında {olan} saat boşlukta, en fazla {sinir} saat isteniyor.":
    "{kim} hat am {gun} {olan} Stunden Lücke zwischen den Stunden; höchstens {sinir} waren gewünscht.",
  "{sinif} sınıfı {gun} günü dersleri arasında {olan} saat boşlukta, en fazla {sinir} saat isteniyor.":
    "Klasse {sinif} hat am {gun} {olan} Stunden Lücke zwischen den Stunden; höchstens {sinir} waren gewünscht.",

  // src/solver.ts
  "haftada {istenen} saat isteniyor, açık saatler ve kurallar en fazla {olabilen} saat veriyor":
    "{istenen} Wochenstunden sind gewünscht; offene Stunden und Regeln lassen höchstens {olabilen} zu",
  "Program yeniden yapılınca değişiklik gerekmeden kuruluyor":
    "Neu erstellt lässt sich der Stundenplan ohne Änderung aufbauen",
  "Uygula ve yeniden yap":
    "Übernehmen und neu erstellen",
  "Dizili dersler yerinde kalırken bir yol yok; bu yollar dersleri yeniden diziyor, sabitlenenler yerinde kalır.":
    "Mit den gesetzten Stunden an ihrem Platz gibt es keinen Weg; diese Wege ordnen sie neu an, angeheftete bleiben stehen.",
  "Nasıl kurulacağı aranıyor… {sure} sn":
    "Es wird gesucht, wie die Woche aufgeht… {sure} s",
  "Sınıfların saatlerine dokunmadan bir yol bulunamadı.":
    "Es wurde kein Weg gefunden, der die Stunden der Klassen unverändert lässt.",
  "{liste} ve {son}":
    "{liste} und {son}",
  "{kim} {gun} {saatler}. saat":
    "{kim} {gun}, {saatler}. Stunde",
  "{ders}: aynı gün en fazla {eski} yerine {yeni} saat":
    "{ders}: höchstens {yeni} statt {eski} Stunden an einem Tag",
  "{kim}: günde en fazla {eski} yerine {yeni} saat":
    "{kim}: höchstens {yeni} statt {eski} Stunden am Tag",
  "{kim}: art arda en fazla {eski} yerine {yeni} saat":
    "{kim}: höchstens {yeni} statt {eski} Stunden am Stück",
  "{ders}: {eski} yerine {yeni}":
    "{ders}: {yeni} statt {eski}",
  "{ders}: haftada {eski} yerine {yeni} saat":
    "{ders}: {yeni} statt {eski} Wochenstunden",
  "Program o arada değişti. Öneriyi yeniden görmek için Kalanı diz düğmesine basın.":
    "Der Stundenplan hat sich inzwischen geändert. Drücken Sie Rest legen, um wieder einen Vorschlag zu sehen.",
  "Program değişiklik gerekmeden kuruluyor":
    "Der Stundenplan lässt sich ohne Änderung aufbauen",
  "İlk arama bu programı bulamadı; ikinci arama buldu ve denetledi.":
    "Die erste Suche hat diesen Stundenplan nicht gefunden; die zweite hat ihn gefunden und geprüft.",
  "Uygula ve diz":
    "Übernehmen und legen",
  "{ders}: {yeni} versin":
    "{ders}: unterrichtet von {yeni}",
  "{kim} {gun} {saatler}. saate":
    "{kim} am {gun} in Stunde {saatler}",
  "{kim} {gun} {saatler}. saatlere":
    "{kim} am {gun} in den Stunden {saatler}",
  "{saatler} de gelebilirse":
    "{saatler} auch kommen kann",
  "{ders} aynı gün {yeni} saat olabilirse":
    "{ders} an einem Tag {yeni} Stunden haben kann",
  "{kim} {gun} {yeni} saat girebilirse":
    "{kim} am {gun} {yeni} Stunden unterrichten kann",
  "{kim} bir günde {yeni} saat girebilirse":
    "{kim} an einem Tag {yeni} Stunden unterrichten kann",
  "{kim} art arda {yeni} saat girebilirse":
    "{kim} {yeni} Stunden am Stück unterrichten kann",
  "{ders} dersini {yeni} verebilirse":
    "{yeni} {ders} unterrichten kann",
  "{ders} {yeni} olabilirse":
    "{ders} {yeni} sein kann",
  "{ders} haftada {yeni} saat olabilirse":
    "{ders} {yeni} Stunden pro Woche haben kann",
  "{kosullar} program kuruluyor.":
    "Der Stundenplan lässt sich aufbauen, wenn {kosullar}.",
  "{kim} {gun}":
    "{kim} am {gun}",
  "{kim}: günlük sınır":
    "{kim}: Tageshöchstwert",
  "{kim}: art arda sınırı":
    "{kim}: Höchstwert am Stück",
  "{ders}: aynı gün sınırı":
    "{ders}: Höchstwert pro Tag",
  "{ders}: blok şekli":
    "{ders}: Blockform",
  "{ders}: haftalık saat":
    "{ders}: Wochenstunden",
  "Öğretmenin zaten geldiği güne saat":
    "Stunden an einem Tag, an dem die Lehrkraft ohnehin kommt",
  "En az saat, yan yana":
    "Möglichst wenige Stunden, nebeneinander",
  "En az öğretmen":
    "Möglichst wenige Lehrkräfte",
  "Saat ve sınır birlikte":
    "Stunden und Höchstwerte zusammen",
  "Yalnız sınırlar":
    "Nur Höchstwerte",
  "Dersi başka öğretmene vermek":
    "Einen Unterricht einer anderen Lehrkraft geben",
  "Blok şekli":
    "Blockform",
  "Bir yol seçin; her biri tek başına yetiyor, sınıfların saatlerine dokunulmaz.":
    "Wählen Sie einen Weg; jeder reicht für sich allein, die Stunden der Klassen bleiben unberührt.",
  "Uygula":
    "Anwenden",
  "Uygula, yeniden yap":
    "Anwenden, neu erstellen",
  "Olmaz":
    "Geht nicht",
  "Geri al: {ne}":
    "Zurücknehmen: {ne}",
  "(daha iyisi aranıyor)":
    "(eine bessere wird gesucht)",
  "Başka yollar da aranıyor… {sure} sn":
    "Es wird auch nach anderen Wegen gesucht… {sure} s",
  "Yol {n} / {m} deneniyor: {ad}":
    "Weg {n} von {m} wird versucht: {ad}",
  "Aramanın ilerlemesi":
    "Fortschritt der Suche",
  "Başka yollar ({n})":
    "Andere Wege ({n})",
  "(inceltilmedi)":
    "(nicht verfeinert)",
  "Arama durduruldu; o ana kadar bir yol bulunmamıştı.":
    "Die Suche wurde angehalten; bis dahin war kein Weg gefunden.",
  "Arama durduruldu. Bulunan yollar geçerli, ama daha küçükleri olabilir.":
    "Die Suche wurde angehalten. Die gefundenen Wege funktionieren, aber es gibt vielleicht kleinere.",
  "Aramayı sürdür":
    "Suche fortsetzen",
  "Arama durdurulduğu için daha küçük bir değişiklik de olabilir.":
    "Die Suche wurde angehalten, daher gibt es vielleicht eine kleinere Änderung.",
  "Bir dersi başka öğretmene verip daha az saat":
    "Einen Unterricht einer anderen Lehrkraft geben, weniger Stunden",
  "Birkaç dersi başka öğretmene verip en az saat":
    "Einige Unterrichte anderen Lehrkräften geben, möglichst wenige Stunden",
  "Cevaplarınız:":
    "Ihre Antworten:",
  "Olur":
    "Ja",
  "Olur: {ne}":
    "Ja: {ne}",
  "Olmaz: {ne}":
    "Geht nicht: {ne}",
  "Olur dedi":
    "Hat zugesagt",
  "Olur dedikleriniz yetiyor: program kuruluyor":
    "Ihre Zusagen reichen: der Stundenplan lässt sich aufbauen",
  "Olur dediklerinize ek olarak {kosullar} program kuruluyor.":
    "Zusätzlich zu Ihren Zusagen lässt sich der Stundenplan aufbauen, wenn {kosullar}.",
  "Uygulayınca cevaplarınız veriye yazılır ve program dizilir.":
    "Beim Anwenden werden Ihre Antworten in die Daten geschrieben und der Stundenplan gelegt.",
  "Izgarada göster":
    "Im Raster zeigen",
  "Sorular":
    "Fragen",
  "Soruları gizle":
    "Fragen ausblenden",
  "Soruları kopyala":
    "Fragen kopieren",
  "Soruları yazdır":
    "Fragen drucken",
  "Sorular panoya kopyalandı.":
    "Fragen in die Zwischenablage kopiert.",
  "Kopyalamak için Ctrl+C’ye basın":
    "Zum Kopieren Strg+C drücken",
  "Siz":
    "Sie",
  "Sizin kararınız":
    "Ihre Entscheidung",
  "Öğretmenlere sorulacaklar":
    "Fragen an die Lehrkräfte",
  "{gun} {saatler}. saate gelebilir misiniz?":
    "Können Sie am {gun} in Stunde {saatler} kommen?",
  "{gun} {saatler}. saatlere gelebilir misiniz?":
    "Können Sie am {gun} in den Stunden {saatler} kommen?",
  "Bir günde {eski} yerine {yeni} saat girebilir misiniz?":
    "Können Sie an einem Tag {yeni} statt {eski} Stunden unterrichten?",
  "Art arda {eski} yerine {yeni} saat girebilir misiniz?":
    "Können Sie {yeni} statt {eski} Stunden am Stück unterrichten?",
  "{ders} dersini verebilir misiniz?":
    "Können Sie {ders} unterrichten?",
  "Yalnız bu saatler olmaz ({gun} {saatler}. saat)":
    "Nur diese Stunden gehen nicht ({gun}, Stunde {saatler})",
  "{gun} günü kapalı": "Am {gun} gesperrt",
  "{gun} en fazla {n} saat gelebilir":
    "Kann am {gun} höchstens {n} {n:Stunde|Stunden} kommen",
  "{kim} için hiçbir değişiklik olmasın":
    "Keine Änderung für {kim}",
  "{kim} {gun} en fazla {n} saat":
    "{kim} am {gun}: höchstens {n} {n:Stunde|Stunden}",
  "{kim}: hiçbir değişiklik":
    "{kim}: keine Änderung",
  "Önizleme":
    "Vorschau",
  "Önizleme: {yol}":
    "Vorschau: {yol}",
  "Önizlemeyi kapat":
    "Vorschau schließen",
  "Hangi program":
    "Welcher Stundenplan",
  "Şu anki":
    "Aktuell",
  "Önerilen":
    "Vorgeschlagen",
  "{n} öğretmen saati açılıyor":
    "{n} {n:Lehrerstunde wird|Lehrerstunden werden} geöffnet",
  "{n} ders yer değiştiriyor":
    "{n} {n:Stunde wird|Stunden werden} verschoben",
  "Öneri araması":
    "Vorschlagssuche",
  "Bu bilgisayarda henüz aranmadı":
    "Auf diesem Computer noch nicht gelaufen",
  "{n} iş parçacığında · ilk öneri {ilk} sn · arama {sure} sn":
    "Auf {n} {n:Thread|Threads} · erster Vorschlag {ilk} s · Suche {sure} s",
  "Tek iş parçacığında (yavaş yol) · ilk öneri {ilk} sn · arama {sure} sn":
    "Auf einem Thread (langsamer Weg) · erster Vorschlag {ilk} s · Suche {sure} s",
  "öneri aramasının ölçümleri":
    "Messwerte der Vorschlagssuche",
  "Kurulması için":
    "Damit die Woche aufgeht",
  "Ayrıntı":
    "Details",
  "Bu değişiklikle bütün dersler yerleşiyor; program bulundu ve denetlendi.":
    "Mit dieser Änderung passen alle Stunden; der Stundenplan wurde gefunden und geprüft.",
  "Bundan küçük bir değişiklik yetmiyor.":
    "Keine kleinere Änderung reicht.",
  "Bulduğumuz en küçük değişiklik bu.":
    "Das ist die kleinste Änderung, die wir gefunden haben.",
  "Öneri uygulandı ve program dizildi.": "Der Vorschlag wurde übernommen und der Stundenplan gelegt.",
  "{sinif} sınıfında boş açık saat kalmadı":
    "die Klasse {sinif} hat keine offene Stunde mehr frei",
  "Boş kalan saatler bu dersin {boy} saatlik bloğuna uymuyor":
    "die frei gebliebenen Stunden passen nicht zum {boy}-stündigen Block dieses Unterrichts",
  "Tek başına {gun} {saat}. saate sığıyor, sınıfın öbür eksik dersleriyle birlikte sığmıyor": "allein passt er am {gun} in die {saat}. Stunde, aber nicht zusammen mit dem anderen fehlenden Unterricht der Klasse",
  "{gun} {saat}. saate sığıyor, arama oraya varmadan durdu": "es passt am {gun} in die {saat}. Stunde; die Suche hat vorher aufgehört",

  // src/update.ts
  "Güncelleme denetlenemedi.":
    "Die Aktualisierung konnte nicht geprüft werden.",

  // src/useFolder.ts
  "Klasöre yazma izni geri alınmış.":
    "Die Schreibberechtigung für den Ordner wurde entzogen.",
  "Klasöre yazılamadı. Klasör silinmiş ya da taşınmış olabilir.":
    "In den Ordner konnte nicht geschrieben werden. Er wurde vielleicht gelöscht oder verschoben.",

  // src/version.ts
  "{gun} {ay} {yil}": "{gun}. {ay} {yil}",

  // ---------------------------------------------- the module-level tables
  //
  // VIEWS, KINDS, SECTIONS, DENSITIES, LESSON_MODES, STEPS, RULE_ROWS, the tab
  // labels and their like. A constant cannot hold a hook, so these are
  // translated where they are DRAWN - which means no literal `t('...')` call
  // carries them and they have to be listed by hand.
  Branşlar: "Fächer",
  öğretmen: "Lehrkraft",
  sınıf: "Klasse",
  derslik: "Raum",
  branş: "Fach",
  ders: "Unterricht",
  "Yük durumu": "Auslastung",
  Boş: "Leer",
  "Kapalı saatlere tıklayın.": "Klicken Sie auf die gesperrten Stunden.",
  "Ders olmayacak saatlere tıklayın.": "Klicken Sie die Stunden an, in denen kein Unterricht stattfindet.",
  Uygun: "Passt",
  Sıkışık: "Eng",
  "Öğretmen görünümü": "Lehreransicht",
  "Sınıf görünümü": "Klassenansicht",
  Görünüm: "Ansicht",
  Hakkında: "Über",
  "Planlar ve yedek": "Pläne und Sicherung",
  "Bir öğretmen seçin, girdiği bütün sınıfları arka arkaya girin":
    "Wählen Sie eine Lehrkraft und tragen Sie alle ihre Klassen nacheinander ein",
  Sınıftan: "Von einer Klasse",
  "Bir sınıf seçin, o sınıfın derslerini arka arkaya girin":
    "Wählen Sie eine Klasse und tragen Sie deren Unterricht nacheinander ein",
  Genel: "Gesamt",
  "Bütün dersler tek listede": "Der gesamte Unterricht in einer Liste",
  Liste: "Liste",
  "Açık olan": "Offen",
  Toplam: "Summe",
  Diz: "Legen",
  Bölüm: "Bereich",
  Koyu: "Dunkel",
  Az: "Wenig",
  Belirtilmemiş: "Nicht angegeben",
  Kadın: "Weiblich",
  Erkek: "Männlich",
  "–": "–",
  "1": "1",
  "2": "2",
  "4": "4",
  Normal: "Normal",
  Küçük: "Klein",
  Büyük: "Groß",
  "Bir A4’e bir program, duvara asılan boy":
    "Ein Stundenplan auf A4, in der Größe zum Aufhängen",
  "Alt alta iki program": "Zwei Stundenpläne untereinander",
  "İki sütun, iki satır, dağıtmak için":
    "Zwei Spalten, zwei Zeilen, zum Austeilen",
  "Okul adı": "Schulname",
  "Başlığın altındaki satırda okulun adı":
    "Der Name der Schule in der Zeile unter der Überschrift",
  "Derslik ve branş": "Raum und Fach",
  "Aynı satırda dersliğin harfi ya da öğretmenin branşı":
    "In derselben Zeile der Raumbuchstabe oder das Fach der Lehrkraft",
  "Sütun başlığında 08:30–09:10": "08:30–09:10 in der Spaltenüberschrift",
  "Hücrenin alt satırı": "Die untere Zeile der Zelle",
  "Öğretmenin kısa adı ya da derslik": "Der Kurzname der Lehrkraft oder der Raum",
  "Çıktı tarihi": "Druckdatum",
  "Sayfanın üstünde yazdırılma tarihi ve saati": "Datum und Uhrzeit des Drucks oben auf der Seite",
  "Öğretmen art arda en fazla": "Lehrkraft, höchstens am Stück",
  "Bir öğretmen arka arkaya kaç saat derse girebilir.":
    "Wie viele Stunden am Stück eine Lehrkraft unterrichten darf.",
  "Öğretmen günde en fazla": "Lehrkraft, höchstens pro Tag",
  "Bir öğretmenin bir gündeki toplam ders saati.":
    "Die Gesamtstunden einer Lehrkraft an einem Tag.",
  "Öğretmen günde en az": "Lehrkraft, mindestens pro Tag",
  "Bir sınıf aynı dersten günde en fazla":
    "Eine Klasse, höchstens vom selben Unterricht pro Tag",
  "Öğretmenin dersleri arasında en fazla boşluk":
    "Lehrkraft, höchstens Lücke zwischen den Stunden",
  "Bir günde ilk ve son ders arasında kaç saat boş kalabilir. 0 hiç boşluk olmasın demektir.":
    "Wie viele Stunden zwischen der ersten und letzten Stunde eines Tages frei bleiben dürfen. 0 bedeutet keine Lücke.",
  "Sınıfın dersleri arasında en fazla boşluk":
    "Klasse, höchstens Lücke zwischen den Stunden",
  Ocak: "Januar",
  Şubat: "Februar",
  Mart: "März",
  Nisan: "April",
  Mayıs: "Mai",
  Haziran: "Juni",
  Temmuz: "Juli",
  Ağustos: "August",
  Eylül: "September",
  Ekim: "Oktober",
  Kasım: "November",
  Aralık: "Dezember",
  Okul: "Schule",
  Kontrol: "Prüfung",
  Ayarlar: "Einstellungen",
  "{n} öğretmen": "{n} {n:Lehrkraft|Lehrkräfte}",
  "{n} derslik": "{n} {n:Raum|Räume}",
  "{n} ders": "{n} {n:Unterricht|Unterrichte}",
  Dersler: "Unterricht",
  "{ad} branşının adı": "Name des Fachs {ad}",
  '"{ad}" adı zaten kullanılıyor': 'Der Name "{ad}" ist bereits vergeben',
  "İki branş aynı adı taşıyamaz. Başka bir ad seçin.":
    "Zwei Fächer können nicht denselben Namen tragen. Wählen Sie einen anderen.",
  '"{eski}" branşı "{yeni}" olacak': 'Das Fach "{eski}" wird zu "{yeni}"',
  "{n} öğretmenin branşı da bu adla değişecek ({kimler}).":
    "Das Fach von {n} Lehrkräften ändert sich mit ({kimler}).",
  Değiştir: "Umbenennen",
  "Verdiği dersler": "Erteilter Unterricht",
  "Aldığı dersler": "Besuchter Unterricht",
  "Başka öğretmene aktar…": "An andere Lehrkraft übergeben…",
  "{ne} dersi {kim} öğretmenine geçecek": "Der Unterricht {ne} geht an {kim}",
  "Bu ders henüz programa yerleşmemiş, yani kaybolacak bir şey yok.":
    "Dieser Unterricht steht noch nicht im Stundenplan, es kann also nichts verloren gehen.",
  "Programdaki {n} ders yeni öğretmenin açık saatlerine göre yeniden denenecek; sığmayanlar havuza döner.": "Seine {n} gelegten Stunden werden gegen die offenen Stunden der neuen Lehrkraft erneut geprüft; was nicht passt, geht zurück ins Ablagefach.",
  Aktar: "Übergeben",
  "{ne} dersi {kim} öğretmenine geçti.": "Der Unterricht {ne} ging an {kim}.",
  "{ne} dersi {kim} öğretmenine geçti. {n} ders havuza döndü.":
    "Der Unterricht {ne} ging an {kim}. {n} Stunden gingen zurück ins Ablagefach.",
  "Azalan sıralı. Artana çevirmek için tıklayın":
    "Absteigend sortiert. Klicken für aufsteigend",
  "Artan sıralı. Azalana çevirmek için tıklayın":
    "Aufsteigend sortiert. Klicken für absteigend",
  "Sürükleyerek ya da ok tuşlarıyla sırala":
    "Zum Umsortieren ziehen oder Pfeiltasten benutzen",
  "Öğretmen yükleri": "Lehrerdeputate",
  "Sınıf yükleri": "Klassendeputate",
  "Derslik yükleri": "Raumbelegung",

  // ------------------------------------------------------- 2026-08-30
  //
  // The tray's order and filter, the pin ON a card, the timetable library
  // behind one button, and an entity sheet that edits. Written by hand, the
  // way every entry here is: `i18n.test.ts` can tell us a key is DEAD, never
  // that one is missing - an untranslated sentence falls back to correct
  // Turkish and says nothing (pitfall 87).
  Seçenek: "Variante",
  Kaydet: "Speichern",
  "Öğretmeni düzenle": "Lehrkraft bearbeiten",
  "Sınıfı düzenle": "Klasse bearbeiten",
  gizli: "ausgeblendet",
  İşlemler: "Aktionen",
  "Bütün dersleri sabitle": "Alle Stunden anheften",
  "Bütün sabitlemeleri kaldır": "Alle Anheftungen lösen",
  "{sinif} sınıfının {gun} {saat}. saatindeki ders sabitlenmiş": "Die Stunde von {sinif} am {gun}, {saat}. Stunde, ist angeheftet",
  "{ust} {alt}: buraya sabitle": "{ust} {alt}: hier anheften",
  "{ust} {alt}: sabitlemeyi kaldır": "{ust} {alt}: Anheftung lösen",
  "Sabitlenmiş. Kaldırmak için tıklayın": "Angeheftet. Zum Lösen klicken",
  "Ders {ad} sınıfına taşınsın mı?": "Die Stunde zu {ad} verschieben?",
  Taşı: "Verschieben",
  "Yerleşmiş saatler olduğu gibi taşınır.": "Die belegten Stunden ziehen mit.",
  "{n} ders havuza döner, {s} sabitleme kalkar.": "{n} {n:Stunde geht|Stunden gehen} zurück ins Ablagefach, {s} {s:Anheftung wird|Anheftungen werden} gelöst.",
  "Ders {ad} sınıfına taşındı.": "Die Stunde ist zu {ad} gewechselt.",
  "Ders {ad} sınıfına taşındı. {n} ders havuza döndü.":
    "Die Stunde ist zu {ad} gewechselt. {n} {n:Stunde ging|Stunden gingen} zurück ins Ablagefach.",
  "Ders {kim} öğretmenine geçsin mi?": "Die Stunde an {kim} übergeben?",
  "Yerleşmiş saatler olduğu gibi kalır.": "Die belegten Stunden bleiben, wo sie sind.",
  "{n} ders havuza döner.": "{n} {n:Stunde geht|Stunden gehen} zurück ins Ablagefach.",
  "Ders {kim} öğretmenine geçti.": "Die Stunde ist an {kim} gegangen.",
  "Ders {kim} öğretmenine geçti. {n} ders havuza döndü.":
    "Die Stunde ist an {kim} gegangen. {n} {n:Stunde ging|Stunden gingen} zurück ins Ablagefach.",
  "Art arda en fazla": "Höchstens am Stück",
  "Geldiği gün en az": "Mindestens an Anwesenheitstagen",
  "Günde aynı dersten en fazla": "Gleicher Unterricht pro Tag höchstens",
  "Havuz sıralaması": "Reihenfolge im Ablagefach",
  "Havuz süzgeci": "Filter im Ablagefach",
  "Izgara sırası": "Wie im Raster",
  "Uzun dersler önce": "Lange Stunden zuerst",
  "En çok kalan": "Am meisten offen",
  "{n} saatlik dersler": "{n}-stündige Stunden",
  "{n} saat kaldı": "noch {n} {n:Stunde|Stunden}",
  "{n} saat süzgeç dışında · sürükleyip bırakın": "{n} {n:Stunde|Stunden} hinter dem Filter · ziehen und ablegen",
  Göster: "Anzeigen",
  Saatler: "Uhrzeiten",
  Satır: "Zeile",

  // ------------------------------------ 2026-08-30 · AB2: infolar kısaldı
  //
  // "Çok fazla info var ve çok uzunlar her yerde." One sentence per `.hint`,
  // and what did not fit went to the element’s `title` — the five long
  // entries at the end of this block are those. Grouped by round rather than
  // by source file: the pass touched fifteen screens, and a key here is found
  // by its Turkish sentence anyway.
  "**Az.** Süreler yarıya iner ve **yer değiştiren** hareketler kapanır.":
    "**Wenig.** Die Dauern halbieren sich, und alles, was sich BEWEGT, entfällt.",
  "**Mozaik burada kendini güncellemez** ve hiçbir yere bağlanmaz. En son sürüm şuradadır:":
    "**Hier aktualisiert sich Mozaik nie** und verbindet sich nirgends. Neueste Version:",
  "**Bütün planlar** kendiliğinden Belgelerim'e yazılıyor; son {gun} günün yedeği durur.":
    "**Alle Pläne** werden von selbst nach Dokumente geschrieben; die letzten {gun} Tage bleiben.",
  "**Tarayıcınız klasöre yazmayı desteklemiyor.** Chrome ve Edge destekliyor.":
    "**Ihr Browser kann nicht in einen Ordner schreiben.** Chrome und Edge können es.",
  "**Tercih** yalnız sayar, **Kesin** dersi o hücreye hiç bıraktırmaz.":
    "**Wunsch** zählt nur; **Pflicht** lässt die Stunde nie in diese Zelle.",
  "**Yük**, **Açık**'ı geçerse o sınıfın programı tutmaz.":
    "Übersteigt **Last** den Wert **Offen**, geht der Stundenplan dieser Klasse nicht auf.",
  "Arayüzün dili. Bu bilgisayara aittir, plan dosyasına girmez.":
    "Die Sprache der Oberfläche. Sie gehört zu diesem Rechner, nicht zur Plandatei.",
  "Aynı dersliği paylaşan sınıfların **toplam** ders saati de haftaya sığmalı.":
    "Auch die **Gesamtstunden** von Klassen mit gemeinsamem Raum müssen in die Woche passen.",
  "Aşağıdakiler **kendi öğretmenleriniz**: bir ad sığmıyorsa yazıyı bir basamak küçültün.": "Das sind **Ihre eigenen Lehrkräfte**: Passt ein Name nicht, wählen Sie die Schrift eine Stufe kleiner.",
  "Başka bir tarayıcı bunu **görmez**, “tarama verilerini temizle” onu **siler**.":
    "Ein anderer Browser **sieht** es nicht, und „Browserdaten löschen“ **löscht** es.",
  "Bilgisayarınız “azaltılmış hareket” istiyorsa hareket, ne seçerseniz seçin, **kapalı** kalır.":
    "Verlangt Ihr Rechner „reduzierte Bewegung“, bleibt Bewegung **aus**, was Sie auch wählen.",
  "Bir A4 kâğıda kaç program bassın, ve kâğıttaki yazı ne kadar büyük olsun.":
    "Wie viele Stundenpläne auf ein A4-Blatt kommen und wie groß die Schrift darauf ist.",
  "Bir ders = bir sınıfın bir öğretmenden aldığı haftalık saat.":
    "Eine Stunde = die Wochenstunden, die eine Klasse bei einer Lehrkraft hat.",
  "Bir klasör seçin; **bütün planlar** oraya yazılır ve son {gun} günün yedeği durur.":
    "Wählen Sie einen Ordner; **alle Pläne** landen dort, die letzten {gun} Tage bleiben.",
  "Bir şey belirirken görülen kısa hareketler; kapatmak Mozaik'in işini değiştirmez.":
    "Die kurzen Bewegungen beim Erscheinen; das Abschalten ändert sonst nichts.",
  "Bu depo yalnız {adres} adresine ait; başka adreste açılan Mozaik'in deposu **ayrıdır**.":
    "Dieser Speicher gehört allein zu {adres}; Mozaik unter einer anderen Adresse hat einen **eigenen**.",
  "Mozaik burada kendini güncelleyebilir ama **düğmeye basmadıkça** hiçbir yere bağlanmaz.":
    "Hier kann sich Mozaik aktualisieren, verbindet sich aber erst **auf Knopfdruck**.",
  "Bu, Mozaik'in geliştirme ve test sürümü; kendini güncellemez. Denetlemek yalnız yeni sürümün olup olmadığını söyler.":
    "Dies ist die Entwicklungs- und Testfassung von Mozaik; sie aktualisiert sich nicht selbst. Die Prüfung sagt nur, ob es eine neue Version gibt.",
  "Bu sayılar **bütün okul** için; **0** yazmak “sınır yok” demektir.":
    "Diese Zahlen gelten für die **ganze Schule**; **0** heißt „keine Grenze“.",
  "Bu tarayıcının bu bilgisayardaki deposunda duruyor.":
    "Es liegt im Speicher dieses Browsers auf diesem Rechner.",
  "Burada ne seçerseniz o kalır; bilgisayarınızın tercihini **izlemez**.":
    "Was Sie hier wählen, bleibt; die Einstellung des Rechners wird **nicht** übernommen.",
  "Böylece aynı branş iki farklı yazımla iki branşa dönüşmez. Kısaltma ızgarada ve yazdırılan sayfada görünür; yalnızca değiştirdikleriniz saklanır. Satırları tutamağından sürükleyerek sıralayabilirsiniz; öğretmen eklerken açılan liste bu sırada gelir.":
    "So wird ein Fach, das zweimal verschieden geschrieben ist, nicht zu zwei Fächern. Das Kürzel erscheint im Raster und auf dem gedruckten Blatt; gespeichert wird nur, was Sie ändern. Zeilen lassen sich am Griff umsortieren, und die Auswahl beim Anlegen einer Lehrkraft folgt dieser Reihenfolge.",
  "Bütün ekranı birlikte büyütür: yazıyı, boşlukları, düğmeleri ve ızgara hücrelerini.":
    "Vergrößert den ganzen Bildschirm: Schrift, Abstände, Schaltflächen und Zellen.",
  "Bütün planlar Belgelerim'deki **{klasor}** klasörüne de yazılıyor; taşınacak şey o.":
    "Alle Pläne gehen auch nach **{klasor}** in Dokumente; dieser Ordner ist das Umzugsgut.",
  "Ders yapılan günleri işaretleyin; yanındaki kutu **öğle arasının** yerini söyler.":
    "Haken Sie die Unterrichtstage an; das Feld daneben nennt die **Mittagspause**.",
  "Dersliği olmayan sınıflar için bu kontrol yapılmaz.":
    "Für Klassen ohne Raum entfällt diese Prüfung.",
  "Gün kaçta başlıyor, bir saat ve teneffüs kaç dakika. Zil saatleri bunlardan hesaplanır.":
    "Wann der Tag beginnt und wie viele Minuten eine Stunde und eine Pause dauern. Die Klingelzeiten werden daraus berechnet.",
  "Hazır bir okul: 25 öğretmen, 20 sınıf, 99 ders. **Açık olan planın yerine geçer.**":
    "Eine fertige Schule: 25 Lehrkräfte, 20 Klassen, 99 Stunden. **Ersetzt den offenen Plan.**",
  "Her planın **verisi ayrıdır**; üst çubuktaki listeden aralarında geçilir.":
    "Jeder Plan **hat eigene Daten**; die Liste oben wechselt zwischen ihnen.",
  "Her sınıfın sabit dersliği; aynı dersliği paylaşan iki sınıf aynı saate konamaz.":
    "Der feste Raum jeder Klasse; zwei Klassen mit demselben Raum können nicht gleichzeitig.",
  "Okulun listesinde **bulunmayan** hazır branşlar; eklemek için tıklayın.":
    "Mitgelieferte Fächer, die **nicht** auf der Schulliste stehen; zum Hinzufügen klicken.",
  "Renk kimliktir: ızgaradaki satırı havuzdaki dersiyle eşleştiren şey budur.":
    "Farbe ist Identität: Sie verbindet die Zeile im Raster mit ihrem Unterricht im Ablagefach.",
  "Sekmelerin altındaki düğme satırı, sayfayı **aşağı kaydırırken kendiliğinden gizlenir**.": "Die Schaltflächenleiste unter den Reitern **blendet sich beim Herunterscrollen aus**.",
  "Silmelerden sonra renkler delik bıraktı; yeniden dağıtmak yalnızca onları sıraya dizer.":
    "Löschungen haben Lücken in den Farben hinterlassen; Neuverteilen ordnet sie nur.",
  "Son üç açılıştaki durum otomatik yedek olarak ayrı tutulur; **bu bilgisayara** ve açılıştaki plana aittir.":
    "Der Stand der letzten drei Starts wird als automatische Sicherung getrennt aufbewahrt; er gehört zu **diesem Computer** und zum Plan, der beim Start offen war.",
  "Sınıf başına **{yer}** saat var ({gun} gün × {ders} saat); girilen yük **{yuk}** saat.":
    "**{yer}** Stunden je Klasse ({gun} Tage × {ders} Stunden); eingetragene Last: **{yuk}**.",
  "Tarayıcının bu site için ayırdığı depoda duruyor.":
    "Es liegt in dem Speicher, den der Browser für diese Seite hält.",
  "Toplam **{yer}**; tarayıcının Mozaik'e ayırdığı yer yaklaşık **5 MB**.":
    "Insgesamt **{yer}**; der Browser gibt Mozaik etwa **5 MB**.",
  "{dosya} **bütün planlarınızdır**; yanındakiler onun gün gün duran hâlleri.":
    "{dosya} sind **alle Ihre Pläne**; die Dateien daneben sind die Tageskopien.",
  "Öğretmen eklerken branş **bu listeden** seçilir, elle yazılmaz.":
    "Beim Anlegen einer Lehrkraft wird das Fach **aus dieser Liste** gewählt, nie getippt.",
  "Öğretmenin açık saati, ona yüklenen ders saatinden az olamaz.": "Die offenen Stunden einer Lehrkraft dürfen nicht unter ihrer Last liegen.",
  "Üst çubuktaki **Kaydet** açık planı yazar; buradaki dosya **bütün planları**.":
    "**Speichern** oben schreibt den offenen Plan; diese Datei **alle Pläne**.",
  "İşareti kaldırılan şey kâğıda basılmaz.":
    "Was abgewählt ist, kommt nicht aufs Papier.",
  "E-posta":
    "E-Mail",
  "Tek bir e-posta adresi yazılır: ad@ornek.com":
    "Hier steht genau eine E-Mail-Adresse: name@beispiel.de",
  "Program e-posta uygulamanızda açılır; siz gönderirsiniz.": "Der Plan öffnet sich in Ihrer E-Mail-App; Sie senden ihn ab.",
  "adres hatalı":
    "Adresse fehlerhaft",
  "programı boş":
    "Stundenplan ist leer",
  "e-postaya sığmıyor":
    "zu lang für eine E-Mail",
  "{kim} için e-postayı aç":
    "E-Mail an {kim} öffnen",
  "Bu bilgisayarda seçili bir e-posta uygulaması yok.":
    "Auf diesem Computer ist keine E-Mail-App ausgewählt.",
  "E-posta uygulaması açılmadıysa bu bilgisayarda seçili bir e-posta uygulaması yok.":
    "Wenn sich keine E-Mail-App geöffnet hat, ist auf diesem Computer keine ausgewählt.",
  "E-posta uygulaması açılamadı.":
    "Die E-Mail-App ließ sich nicht öffnen.",
  "{ad} · Haftalık ders programı":
    "{ad} · Wochenstundenplan",
  "{n}. saat":
    "{n}. Stunde",
  "Ders silindi.": "Unterricht gelöscht.",
  "{ne} silindi.": "{ne} gelöscht.",
  "{ne} silindi, yerleşmiş {n} saati de kalktı.": "{ne} gelöscht, mit {n} gelegten {n:Stunde|Stunden}.",
  "Dizilmiş {n} saat havuza döndü.": "{n} gelegte {n:Stunde ist|Stunden sind} zurück im Ablagefach.",
  "Dizilmiş saatler havuza döndü, sabitlenen {n} saat yerinde.": "Die gelegten Stunden sind zurück im Ablagefach; {n} angeheftete {n:Stunde bleibt|Stunden bleiben}.",
  "{ilk}–{son}, günde {saat} saat": "{ilk}–{son}, {saat} {saat:Stunde|Stunden} am Tag",
  "Okulu tanıt":
    "Schule eintragen",
  "Okul adını ve zili gir":
    "Schulname und Klingel eingeben",
  "{n} branş":
    "{n} {n:Fach|Fächer}",
  "Branş ekle":
    "Fächer hinzufügen",
  "Öğretmen ekle":
    "Lehrkräfte hinzufügen",
  "Sınıf ekle":
    "Klassen hinzufügen",
  "Ders gir":
    "Unterricht eingeben",
  "{n} kapalı saat":
    "{n} gesperrte {n:Stunde|Stunden}",
  "Kapalı saat yoksa geçin.": "Gibt es keine gesperrte Stunde, überspringen Sie das.",
  "{yer} / {toplam} saat yerleşmiş":
    "{yer} / {toplam} Stunden gelegt",
  "Bu bilgisayarda bir kez yazdırıldı":
    "Auf diesem Computer einmal gedruckt",
  "Sınıflara ve öğretmenlere birer sayfa":
    "Eine Seite je Klasse und Lehrkraft",
  "Liste tek satıra iner; ? menüsündeki Başlarken onu geri getirir.":
    "Die Liste schrumpft auf eine Zeile; Erste Schritte im ?-Menü holt sie zurück.",
  "Listeyi kapat":
    "Liste schließen",
  "{n} / {toplam} adım":
    "{n} / {toplam} Schritte",
  "Sıradaki: {adim}":
    "Als Nächstes: {adim}",
  "Listeyi göster":
    "Liste zeigen",
  "Listeyi daralt":
    "Liste einklappen",
  "yapıldı":
    "erledigt",
  "yapılmadı":
    "offen",
  "Başlarken listesi açık mı":
    "ob die Liste „Zum Anfang“ offen ist",
  "Bu Mozaik onu açamıyor. Önce Mozaik'i güncelleyin, sonra dosyayı yeniden açın.":
    "Dieses Mozaik kann sie nicht öffnen. Aktualisieren Sie zuerst Mozaik und öffnen Sie die Datei dann erneut.",
  "Dosyada öğretmen, sınıf, ders ya da derslik listesi yok; kesilmiş ya da elle düzenlenmiş olabilir. 'Kaydet' ile kaydettiğiniz dosyayı seçin.":
    "Der Datei fehlt die Liste der Lehrkräfte, der Klassen, des Unterrichts oder der Räume; sie wurde vielleicht gekürzt oder von Hand bearbeitet. Wählen Sie die Datei, die Sie mit „Speichern“ gespeichert haben.",
  "Bu, Mozaik'in kaydettiği bir dosya değil. 'Kaydet' ile kaydettiğiniz dosyayı seçin.":
    "Das ist keine von Mozaik gespeicherte Datei. Wählen Sie die Datei, die Sie mit „Speichern“ gespeichert haben.",
  "**Mozaik başka bir pencerede de açık ve plan orada değiştirildi.** Bu penceredeki son değişiklikler kaydedilmedi. **Yenile**'ye basın.":
    "**Mozaik ist auch in einem anderen Fenster offen, und der Plan wurde dort geändert.** Die letzten Änderungen in diesem Fenster wurden nicht gespeichert. Drücken Sie **Neu laden**.",
  "**Kayıtlı plan açılışta okunamadı.** Üzerine yazılmadı. **Yenile**'ye basın; plan yine gelmezse kaydettiğiniz plan dosyasını **Dosyadan aç** ile açın.":
    "**Der gespeicherte Plan konnte beim Start nicht gelesen werden.** Er wurde nicht überschrieben. Drücken Sie **Neu laden**; kommt der Plan nicht zurück, öffnen Sie Ihre gespeicherte Plandatei mit **Aus Datei öffnen**.",
  "**Kayıtlı plan daha yeni bir sürümle yazılmış.** Bu sürüm onu açamıyor ve üzerine yazmıyor; burada yapılanlar kaydedilmez. Mozaik'i güncelleyin.":
    "**Der gespeicherte Plan wurde von einer neueren Version geschrieben.** Diese Version kann ihn nicht öffnen und überschreibt ihn nicht; was Sie hier tun, wird nicht gespeichert. Aktualisieren Sie Mozaik.",
  "Bu taslağın içi boş. Silip yeniden oluşturabilirsiniz.":
    "Dieser Entwurf ist leer. Sie können ihn löschen und neu anlegen.",
  "{ad}: {yuk} saat ders, {acik} açık saat. {fazla} saat haftaya sığmaz.": "{ad}: {yuk} Unterrichtsstunden, {acik} offene Stunden. {fazla} {fazla:Stunde passt|Stunden passen} nicht in die Woche.",
  "{yuk} saat ders, {acik} açık saat. {fazla} saat haftaya sığmaz.": "{yuk} Unterrichtsstunden, {acik} offene Stunden. {fazla} {fazla:Stunde passt|Stunden passen} nicht in die Woche.",
  "Önce bir branş seçin.":
    "Wählen Sie zuerst ein Fach.",
  "Şu an **{gun} gün × {saat} saat** = haftada {yer} saat.":
    "Derzeit **{gun} Tage × {saat} Stunden** = {yer} Stunden pro Woche.",
  "Bütün haftayı aç":
    "Ganze Woche öffnen",
  "Bütün haftayı kapat":
    "Ganze Woche sperren",
  "Bir öğretmenin PDF'i: öğretmenin sayfasında PDF kaydet.": "PDF einer Lehrkraft: auf der Seite der Lehrkraft „PDF speichern“.",

  // Keyboard on the Program and Müsaitlik grids (erisim/klavye-izgara, 2026-11-15)
  "Haftalık dersler": "Wochenstunden",
  "{gun} {n}. saat": "{gun}, {n}. Stunde",
  "açılan öğretmen saatinde": "in einer freigegebenen Lehrerstunde",
  "yeri değişiyor": "wird verschoben",
  "kapalı": "gesperrt",
  "açık": "offen",
  "boş": "leer",
  "Bu dersin satırı ekranda değil.": "Die Zeile dieser Stunde ist nicht sichtbar.",
  "{ders} havuza kaldırıldı.": "{ders} ist zurück in der Ablage.",
  "{ders} alındı. Hedef hücreyi oklarla seçin, Enter bırakır, Esc vazgeçer.": "{ders} aufgenommen. Zielzelle mit den Pfeiltasten wählen; Enter legt ab, Esc bricht ab.",
  "Taşımadan vazgeçildi.": "Verschieben abgebrochen.",
  "{acik} saat açık, {yuk} saat ders yüklenmiş": "{acik} {acik:Stunde|Stunden} offen, {yuk} {yuk:Stunde|Stunden} Unterricht geplant",
  "Izgaraya gir, bir daha basınca çık": "In das Raster wechseln, erneut drücken zum Verlassen",
  "Hücreden hücreye git": "Von Zelle zu Zelle gehen",
  "Satırın başına veya sonuna git, Ctrl ile ilk veya son satıra": "An Anfang oder Ende der Zeile; mit Strg zur ersten oder letzten Zeile",
  "Odaklı dersi taşımak için al (sabitse önce P)": "Fokussierte Stunde zum Verschieben aufnehmen (wenn angeheftet, zuerst P)",
  "Odaklı dersi sabitle veya sabitlemeyi kaldır": "Fokussierte Stunde anheften oder lösen",
  "Dersler arasında git": "Zwischen Stunden wechseln",
  "Odaklı dersi ızgaraya koymak için al": "Fokussierte Stunde aufnehmen, um sie ins Raster zu setzen",
  "Tutamakta: havuzun boyunu değiştir, Shift ile daha çok": "Am Griff: Ablage vergrößern oder verkleinern; mit Umschalt in größeren Schritten",
  "Ders eldeyken": "Beim Verschieben",
  "Hedefi bir saat kaydır": "Ziel um eine Stunde verschieben",
  "Bırakılabilecek bir sonraki saate git": "Zur nächsten möglichen Stunde springen",
  "Önceki veya sonraki güne git": "Zum vorigen oder nächsten Tag",
  "Buraya bırak": "Hier ablegen",
  "Vazgeç, sürüklerken de": "Abbrechen, auch beim Ziehen",
  "Saati aç veya kapat, başlıkta bütün günü veya saati": "Stunde öffnen oder sperren; auf einer Überschrift den ganzen Tag oder die Stunde",
  "Ders ızgarada görünmüyor; satırı gizli olabilir.":
    "Die Stunde ist nicht im Raster; ihre Zeile ist vielleicht ausgeblendet.",
  "Ders havuzda görünmüyor; havuz kapalı olabilir.":
    "Die Stunde ist im Ablagefach nicht zu sehen; es ist vielleicht geschlossen.",
  "**{ders} dersin {saat} saati kapalı saatte kaldı.** Aşağıdaki **Göster** onu ızgarada bulur.":
    "**{ders} {ders:Unterricht liegt|Unterrichte liegen} mit {saat} {saat:Stunde|Stunden} auf einer gesperrten Zeit.** **Anzeigen** unten zeigt die Stelle im Raster.",
  "Sebep ve dersler":
    "Grund und Unterricht",
  "{sinif} sınıfının açık saatlerinin hepsi başka derslerle dolu.":
    "Alle offenen Stunden der Klasse {sinif} sind mit anderem Unterricht belegt.",
  "{kim} {n} saatinde kapalı": "{kim} ist in {n} davon gesperrt",
  "{n} saatinde {kim} başka sınıfta":
    "in {n} ist {kim} in einer anderen Klasse",
  "{n} saatinde {derslik} dersliği dolu":
    "in {n} ist Raum {derslik} belegt",
  "{n} saatinde bir kural izin vermiyor":
    "in {n} lässt eine Regel es nicht zu",
  "{sinif} sınıfının {n} boş saati var ama bu dersin blokları onlara sığmıyor.":
    "Die Klasse {sinif} hat {n} freie {n:Stunde|Stunden}, aber die Blöcke dieses Unterrichts passen nicht hinein.",
  "{sinif} sınıfının {n} boş saati var: {neden}.":
    "Die Klasse {sinif} hat {n} freie {n:Stunde|Stunden}: {neden}.",
  "{zaman}. saatlerde": "in den Stunden {zaman}",
  "{n} saatine {boy} saatlik ders sığmıyor":
    "{n} {n:fasst|fassen} die {boy}-stündige Stunde nicht",
  "{n} sorun":
    "{n} {n:Problem|Probleme}",
  "{brans} dersi de gitti.": "Der {brans}-Unterricht ist mit ihr entfallen.",
  "{brans} dersleri de gitti.": "Auch der gesamte {brans}-Unterricht ist mit ihr entfallen.",
  "{sinif} sınıfının {brans} dersi de gitti.":
    "Die Klasse {sinif} hat ihren {brans}-Unterricht verloren.",
  "{n} sınıfın {brans} dersi de gitti: {siniflar}.":
    "{n} {n:Klasse hat|Klassen haben} den {brans}-Unterricht verloren: {siniflar}.",
  "Programdan {n} saat kalktı.":
    "{n} gesetzte {n:Stunde wurde|Stunden wurden} aus dem Stundenplan entfernt.",
  "İçeriğe geç": "Zum Inhalt springen",
  "Ders günü": "Unterrichtstag",
  "Geri alındı.": "Rückgängig gemacht.",
  "Geri alındı: {ne}": "Rückgängig gemacht: {ne}",
  "Geri almak için Ctrl+Z.": "Mit Strg+Z rückgängig machen.",
  "Arada başka bir değişiklik oldu. Ctrl+Z ile adım adım geri alın.": "Dazwischen wurde etwas anderes geändert. Mit Strg+Z Schritt für Schritt rückgängig machen.",
  "Öğretmenler, sınıflar, dersler ve dizilmiş program. Bu plan bomboş kalacak. Hemen ardından \"Geri al\" ile geri gelir.": "Lehrkräfte, Klassen, Unterricht und der gelegte Stundenplan. Dieser Plan bleibt völlig leer. „Rückgängig“ gleich danach holt alles zurück.",
  "Bu plandaki her şey silindi.": "Alles in diesem Plan wurde gelöscht.",
  "**Açık olan plan** tamamen silinir; hemen ardından **Geri al** ile geri gelir.": "**Der offene Plan** wird gelöscht; **Rückgängig** gleich danach holt ihn zurück.",
  "{kayip} Yerine 25 öğretmen, 20 sınıf, 8 derslik ve 99 ders olan örnek bir okul gelir. Diğer planlara dokunulmaz. Hemen ardından \"Geri al\" ile geri gelir.": "{kayip} An ihre Stelle tritt eine Beispielschule mit 25 Lehrkräften, 20 Klassen, 8 Räumen und 99 Unterrichten. Die anderen Pläne bleiben unberührt. „Rückgängig“ gleich danach holt Ihre Daten zurück.",
  "Derslik silindi.": "Raum gelöscht.",
  "{ad} dersliği silindi.": "Raum {ad} gelöscht.",
  "{ad} dersliği silindi, {sinif} sınıfının dersliği boşaldı.": "Raum {ad} gelöscht; Klasse {sinif} hat jetzt keinen Raum.",
  "{ad} dersliği silindi, {n} sınıfın dersliği boşaldı ({hangileri}). Bu sınıflar artık aynı saate konabilir.": "Raum {ad} gelöscht; {n} {n:Klasse hat|Klassen haben} jetzt keinen Raum ({hangileri}). Diese Klassen dürfen jetzt in dieselbe Stunde.",
  "Öğretmen silindi.": "Lehrkraft gelöscht.",
  "Sınıf silindi.": "Klasse gelöscht.",
  "\"{ad}\" branşı listeden çıkarıldı.": "„{ad}“ wurde aus der Fächerliste entfernt.",
  "Program yeniden yapıldı.": "Der Stundenplan wurde neu erstellt.",
  "Program yeniden yapıldı, sabitlenen {n} saat yerinde kaldı.": "Der Stundenplan wurde neu erstellt; {n} angeheftete {n:Stunde blieb|Stunden blieben} an ihrem Platz.",
  "Açıklama: {konu}": "Erklärung: {konu}",
  "Daha fazla": "Mehr",
  "Dosya": "Datei",
  "Tercih": "Wunsch",
  "Yeni dönem için kopyala": "Für neues Halbjahr kopieren",
  "Ara ve yap": "Suchen und ausführen",
  "Planlar arasında geçiş yapar": "Wechselt zwischen Plänen",
  "Yeni dönem için bir kopya açıldı: dersler duruyor, program boş. Eski plan Dosya → Planlar ve yedek’te.": "Eine Kopie für das neue Halbjahr ist offen: der Unterricht ist da, der Stundenplan ist leer. Der alte Plan ist unter Datei → Pläne und Sicherung.",
  "Gizlensin": "Ausgeblendet",
  "Yerleşmiş dersi sürükleyerek taşıyın · Klavye: T ile alın": "Eine gelegte Stunde ziehen, um sie zu verschieben · Tastatur: mit T aufnehmen",
  "Dersleri gir": "Unterricht eintragen",
  "Kapalı saatleri işaretle": "Gesperrte Stunden markieren",
  "{d} derslik · {b} branş · {o} öğretmen · {s} sınıf": "{d} {d:Raum|Räume} · {b} {b:Fachbereich|Fachbereiche} · {o} {o:Lehrkraft|Lehrkräfte} · {s} {s:Klasse|Klassen}",
  "Başlarken listesini göster": "Erste-Schritte-Liste zeigen",
  "Teknik bilgiler": "Technische Angaben",
  "**Program tamam.** Bütün dersler yerleşti ve kurallara uyuyor.": "**Der Stundenplan ist fertig.** Alle Stunden sind gelegt und halten die Regeln ein.",
  "Yazdır": "Drucken",
  "Açık plan": "Offener Plan",
  "Seviye": "Stufe",
  "{toplam} öğretmenin ilk {kac} tanesi.": "Die ersten {kac} von {toplam} {toplam:Lehrkraft|Lehrkräften}.",
  "Bu dosya bütün planları içeren bir dosya değil. Tek bir planı üst çubuktaki Dosya menüsünden \"Dosyadan aç\" ile açabilirsiniz.": "Das ist keine Datei mit allen Plänen. Einen einzelnen Plan öffnen Sie im Menü Datei oben mit „Aus Datei öffnen“.",
  "\"{plan}\" planı okunamıyor, bu yüzden hiçbir plan klasöre yazılmıyor.": "Der Plan „{plan}“ kann nicht gelesen werden, daher wird kein Plan in den Ordner geschrieben.",
  "**Plan bu bilgisayarda boş açıldı, ama {klasor} klasöründe daha dolu bir plan dosyası var:** {dosya}, {ogretmen} öğretmen ve {ders} ders. Siz seçene kadar klasöre hiçbir şey yazılmıyor.": "**Der Plan wurde auf diesem Computer leer geöffnet, aber im Ordner {klasor} liegt eine vollere Plandatei:** {dosya}, {ogretmen} {ogretmen:Lehrkraft|Lehrkräfte} und {ders} {ders:Unterricht|Unterrichte}. Bis Sie wählen, wird nichts in den Ordner geschrieben.",
  "Belgelerim'deki son kaydı aç": "Letzte Sicherung in Dokumente öffnen",
  "Boş başla": "Leer beginnen",
  "**Plan çok küçüldü:** {ogretmen} öğretmen ve {ders} ders kaldı, klasördeki son plan dosyasında {eskiOgretmen} öğretmen ve {eskiDers} ders var. O dosya korundu, yeni hâli **{dosya}** adıyla ayrıca yazıldı.": "**Der Plan ist stark geschrumpft:** {ogretmen} {ogretmen:Lehrkraft|Lehrkräfte} und {ders} {ders:Unterricht|Unterrichte} sind übrig, die letzte Plandatei im Ordner hat {eskiOgretmen} {eskiOgretmen:Lehrkraft|Lehrkräfte} und {eskiDers} {eskiDers:Unterricht|Unterrichte}. Diese Datei bleibt erhalten; der neue Stand wurde getrennt als **{dosya}** gespeichert.",
  "Yeni hâlini asıl dosya yap": "Neuen Stand zur Hauptdatei machen",
  "{ne} Son silmeyi geri almak için:": "{ne} Um das letzte Löschen rückgängig zu machen:",
  "Geri getir": "Zurückholen",
  "Son silme geri alındı.": "Das letzte Löschen wurde rückgängig gemacht.",
  "son silmeden önceki hâl": "Stand vor dem letzten Löschen",
  "Kimliği eksik ya da tekrarlanan plan: {adlar}.": "Plan mit fehlender oder doppelter Kennung: {adlar}.",
  "Siz seçene kadar klasöre hiçbir şey yazılmıyor.": "Bis Sie wählen, wird nichts in den Ordner geschrieben.",
  "Klasördeki son plan dosyasının yerine bu küçük plan yazılır. Eski hâli günlük yedeklerde kalır.": "Dieser kleinere Plan ersetzt die letzte Plandatei im Ordner. Der alte Stand bleibt in den täglichen Sicherungen.",

  // src/pure/solver (2026-11-16)
  "{kim}: {yuk} saat ders, {acik} açık saat; {fazla} saat açılmalı": "{kim}: {yuk} Unterrichtsstunden, {acik} offen; {fazla} müssen geöffnet werden",
  "{sinif}: {yuk} saat ders, {acik} açık saat; {fazla} saat açılmalı": "{sinif}: {yuk} Unterrichtsstunden, {acik} offen; {fazla} müssen geöffnet werden",
  "{derslik} dersliği: {yuk} saat ders, {acik} açık saat; {fazla} saat açılmalı ya da bir sınıf başka dersliğe geçmeli": "Raum {derslik}: {yuk} Unterrichtsstunden, {acik} offen; {fazla} öffnen oder eine Klasse in einen anderen Raum legen",
  "{bir} ile {iki} aynı güne konmamalı: {n1} + {n2} gün gerekiyor, {g} gün var": "{bir} und {iki} nicht am selben Tag: {n1} + {n2} Tage nötig, {g} vorhanden",
  // The plan-file reminder and the move to the new address (2026-11-16).
  "son plan dosyasının tarihi":
    "Datum der letzten Plandatei",
  "**Bu planın bir plan dosyası yok.** Yaptıklarınız yalnız bu tarayıcıda duruyor.":
    "**Für diesen Plan gibt es keine Plandatei.** Was Sie getan haben, ist nur in diesem Browser.",
  "**Son plan dosyası {tarih} tarihli.** Ondan sonra yaptıklarınız yalnız bu tarayıcıda duruyor.":
    "**Die letzte Plandatei ist vom {tarih}.** Was Sie seitdem getan haben, ist nur in diesem Browser.",
  "Son plan dosyası: {tarih}.":
    "Letzte Plandatei: {tarih}.",
  "Eski adresteki planlar buraya gelsin mi?":
    "Die Pläne von der alten Adresse hierher holen?",
  "**Planlar bir plan dosyasına yazıldı** (İndirilenler). Yeni adreste **Bütün planları dosyadan aç** ile açın.": "**Die Pläne wurden in eine Plandatei geschrieben** (Downloads). Öffnen Sie sie an der neuen Adresse mit **Alle aus Datei öffnen**.",
  "**Planlar yeni adrese taşındı.** Bundan sonra orayı kullanın:":
    "**Die Pläne sind an die neue Adresse umgezogen.** Verwenden Sie von jetzt an diese:",
  "Yeni adres açıldı. Oradaki soruyu cevaplayın.":
    "Die neue Adresse wurde geöffnet. Beantworten Sie dort die Frage.",
  "**Mozaik yeni adresine taşındı.** Planlarınız burada da kalır.":
    "**Mozaik ist an eine neue Adresse umgezogen.** Ihre Pläne bleiben auch hier.",
  "Hiçbir plan taşınmadı.":
    "Kein Plan wurde umgezogen.",
  "Planları taşı":
    "Pläne umziehen",
  // ------------------------------------------- the person page (K5)
  "Sayfasını aç":
    "Seite öffnen",
  "Gönder":
    "Senden",
  "Göndermek için Bilgiler’de e-posta adresini yazın.":
    "Zum Senden die E-Mail-Adresse unter Angaben eintragen.",
  "Bilgiler":
    "Angaben",
  "Kapalı saatler":
    "Gesperrte Stunden",
  "{kim} · kapalı saatler":
    "{kim} · gesperrte Stunden",
  "{ne} · Haftalık saat":
    "{ne} · Wochenstunden",
  "saat":
    "Std.",
  "Sınırları":
    "Grenzen",
  "Boş kutu okul ayarını kullanır; yazılan sayı onun yerine geçer.":
    "Ein leeres Feld nimmt die Schuleinstellung; eine eingetragene Zahl ersetzt sie.",
  "Okul ayarı geçerli: {n}":
    "Schuleinstellung gilt: {n}",
  "Kendi sayısı; okul ayarı: {n}":
    "Eigene Zahl; Schuleinstellung: {n}",
  "Öğretmeni sil":
    "Lehrkraft löschen",
  "Sınıfı sil":
    "Klasse löschen",
  "+ Yeni öğretmen":
    "+ Neue Lehrkraft",
  "+ Yeni sınıf":
    "+ Neue Klasse",
  "{n} saat kapalı":
    "{n} {n:Stunde|Stunden} gesperrt",
  "{n} saat fazla":
    "{n} {n:Stunde|Stunden} zu viel",
  // ------------------------------------------- the person page (K5)
  "Kapattığınız saatlerde {n} ders kaldı; silinmedi, haftalık programda kırmızı.":
    "{n} {n:Stunde liegt|Stunden liegen} noch in gesperrten Stunden; nichts wurde gelöscht, im Wochenplan rot.",
  // ------------------------------------------- the person page (K5)
  "Branş **listeden seçilir**; kısa ad ızgarada satır başlığı olur.":
    "Das Fach wird **aus der Liste gewählt**; der Kurzname steht am Zeilenkopf.",
  "Aynı programı paylaşan öğrenci grubu; **derslik** sınıfın sabit dersliğidir.":
    "Eine Schülergruppe mit gemeinsamem Stundenplan; der **Raum** ist ihr fester Raum.",
  // -------------------------------------------- Sadeleşme, K1–K3 (2026-11-16)
  "Okul bilgileri":
    "Schulangaben",
  "Yazdır ve gönder":
    "Drucken und senden",
  "Neden yerleşmedi?":
    "Warum nicht eingeplant?",
  "Kopya açıldı. Eski plana üst çubuktaki plan seçiciyle dönülür.":
    "Kopie geöffnet. Die Planauswahl oben führt zum alten Plan zurück.",
  "Önce **Öğretmenler** ve **Sınıflar** sekmelerinde öğretmenleri ve sınıfları, sonra her sınıfın derslerini girin.":
    "Tragen Sie zuerst in den Reitern **Lehrkräfte** und **Klassen** die Lehrkräfte und Klassen ein, dann den Unterricht jeder Klasse.",
  "Yazdırmaya geç":
    "Zum Druck",
  "Saatler ders konduktan **sonra** kapatıldı, hiçbir ders silinmedi. Dersi açık bir saate sürükleyin ya da saati kişinin sayfasında açın.":
    "Die Zeiten wurden **nach** dem Setzen gesperrt; nichts wurde gelöscht. Ziehen Sie die Stunde in eine offene Stunde oder öffnen Sie die Stunde auf der Seite der Person.",
  "Bu derslere konacak hücre kalmamış. Dersin adı onu havuzda gösterir; yer açmak için kişinin sayfasında saat açın ya da bir dersi taşıyın.":
    "Für diesen Unterricht ist keine Zelle mehr frei. Der Name zeigt ihn im Ablagefach; für Platz öffnen Sie Stunden auf der Seite der Person oder verschieben eine Stunde.",
  "Program, **Okul bilgileri → Kurallar**'da girdiğiniz sınırları aşıyor.":
    "Der Stundenplan überschreitet die Grenzen aus **Schulangaben → Regeln**.",
  "Tek bir planı değil, bu bilgisayardaki bütün planların yerine geçer. Okul bilgileri → Planlar ve yedek bölümündeki \"Bütün planları dosyadan aç\" düğmesini kullanın.": "Sie ersetzt nicht einen einzelnen Plan, sondern alle Pläne auf diesem Computer. Verwenden Sie „Alle aus Datei öffnen“ unter Schulangaben → Pläne und Sicherung.",
  "**Kurulum tamamlanamadı** (kod {kod}). Mozaik eski hâliyle açıldı, planlarınız yerinde. Bilgisayarı yeniden başlatıp Okul bilgileri → Hakkında'dan tekrar deneyebilirsiniz.":
    "**Die Installation wurde nicht abgeschlossen** (Code {kod}). Mozaik wurde unverändert geöffnet, Ihre Pläne sind da. Starten Sie den Computer neu und versuchen Sie es unter Schulangaben → Über erneut.",
  "Aynısı sınıf için. Yalnız sorun listesinde uyarır.":
    "Dasselbe für eine Klasse. Warnt nur, in der Problemliste.",
  "Bu bilgisayara aittir ve **yazdırmayı etkilemez**; kâğıdın yazısı **Yazdır ve gönder** sekmesinde.":
    "Gehört zu diesem Rechner und **ändert den Druck nicht**; Papierschrift unter **Drucken und senden**.",
  "Bir dersin saatini azaltın ya da kişinin sayfasında kapalı saat açın.":
    "Verringern Sie die Stunden eines Unterrichts oder öffnen Sie gesperrte Stunden auf der Seite der Person.",
  "Ders eklemek için önce en az bir öğretmen ve bir sınıf girin.":
    "Um Unterricht hinzuzufügen, tragen Sie zuerst mindestens eine Lehrkraft und eine Klasse ein.",
  "**Sınıflar → Dersler**’de ders silinebilir, yeni ders eklenebilir.":
    "Unter **Klassen → Unterricht** lässt sich Unterricht löschen und neu anlegen.",
  "Önce dersleri girip **Program** sekmesinde programı yapın.":
    "Tragen Sie zuerst den Unterricht ein und erstellen Sie dann im Reiter **Stundenplan** den Plan.",
  "Bu plandaki öteki programlarda da {n} saat kalkacak.":
    "Auch in den anderen Stundenplänen dieses Plans {n:verschwindet|verschwinden} {n} {n:Stunde|Stunden}.",
  "Dersliğin kapalı olduğu saatlere tıklayın. O dersliği kullanan sınıflar o saatte ders yapamaz.":
    "Klicken Sie die Stunden an, zu denen der Raum geschlossen ist. Klassen, die diesen Raum nutzen, können dann keinen Unterricht haben.",
  "Bir öğretmene özel sayı: **Öğretmenler** listesinde kişinin sayfası.":
    "Für eine Lehrkraft: ihre Seite in der Liste **Lehrkräfte**.",
  "Bir sınıfa özel sayı: **Sınıflar** listesinde sınıfın sayfası.":
    "Für eine einzelne Klasse: ihre Seite in der Liste **Klassen**.",
  "Henüz öğretmen yok. **Öğretmenler** sekmesinden ekleyin; burası o listeyi gösterir.":
    "Noch keine Lehrkräfte. Fügen Sie sie im Reiter **Lehrkräfte** hinzu; hier wird diese Liste gezeigt.",
  "Excel'deki bir listeyi almak için listelerin başındaki Excel'den yapıştır düğmesini kullanın.":
    "Um eine Liste aus Excel zu übernehmen, nutzen Sie die Schaltfläche „Aus Excel einfügen“ oben in den Listen.",
  // ------------------------------------------- Eski hâline dön (K8)
  "Eski hâline dön": "Früheren Stand zurückholen",
  "Dünkü hâline dön": "Stand von gestern zurückholen",
  "Bu hâline dön": "Diesen Stand zurückholen",
  "Mozaik her gün bu planın bir kopyasını kendiliğinden saklar, **son 7 gün** burada. Döndüğünüzde şimdiki hâli de saklanır ve **Geri al** ile geri gelir.": "Mozaik legt jeden Tag von selbst eine Kopie dieses Plans ab; hier sind die **letzten 7 Tage**. Beim Zurückholen wird auch der jetzige Stand aufbewahrt, und **Rückgängig** bringt ihn zurück.",
  "Henüz eski bir kopya yok. İlki, yarın bir şey değiştirdiğinizde burada olur.": "Noch keine frühere Kopie. Die erste steht morgen hier, sobald Sie etwas ändern.",
  "Plan eski hâline döndü: {gun}.": "Der Plan ist wieder wie am {gun}.",
  "günlük kopya": "Tageskopie",
  "{hafta} {gun} {ay}": "{hafta}, {gun}. {ay}",
  "Sayfa {n} / {m}": "Seite {n} von {m}",
  "Telefon": "Telefon",
  "Göndermek için Bilgiler’de telefon numarasını yazın.": "Zum Senden die Telefonnummer unter Angaben eintragen.",
  "PDF kaydet": "PDF speichern",
  "{ad} İndirilenler klasörüne kaydedildi. İletiye ya da sohbete ataşla ekleyin.": "{ad} wurde im Ordner Downloads gespeichert. Mit der Büroklammer an die Nachricht oder den Chat anhängen.",
  // ------------------------------------------- the dated layer (DayDialog.tsx)
  "Boş geçsin": "Klasse frei",
  "Bu gün değişen ders yok.": "An diesem Tag ändert sich kein Unterricht.",
  "bu hafta {n}": "{n} diese Woche",
  "Bu hafta: {gunler}, {n} değişiklik": "Diese Woche: {gunler}, {n} {n:Änderung|Änderungen}",
  "Bu haftanın değişikliklerini sil": "Änderungen dieser Woche entfernen",
  "Bugün kim yok?": "Wer fehlt heute?",
  "Yok olan ekle…": "Abwesende hinzufügen…",
  "Yok olanlar": "Abwesend",
  "Bugün yok…": "Heute abwesend…",
  "İkame listesi": "Vertretungsplan",
  "İkame: bu hafta {m}, toplam {n} saat": "Vertretung: {m} diese Woche, insgesamt {n} {n:Stunde|Stunden}",
  "Seçilmedi": "Nicht gewählt",
  "Son gün": "Letzter Tag",
  "Yerine": "Vertreten durch",
  "Değişen": "Geändert",
  "Temel haftaya dön": "Zurück zur normalen Woche",
  "{n}. saate": "In Stunde {n}",
  "Bir dersi değiştir…": "Eine Stunde ändern…",
  "Programda göster": "Im Stundenplan zeigen",
  "Ayrı plan yap":
    "Als eigenen Plan anlegen",
  "Önceki programa dön": "Zurück zum vorigen Stundenplan",
  "Yok say": "Ignorieren",
  "{n}. sütun": "Spalte {n}",
  "Daha büyük": "Größer",
  "Çok büyük": "Sehr groß",
  "Yazıyı büyüt": "Schrift vergrößern",
  "Branşa göre süz": "Nach Fach filtern",
  "4 saat: 2+2 = iki gün ikişer saat": "4 Stunden: 2+2 = zwei Tage je zwei Stunden",
  "son 7 gün": "letzte 7 Tage",
  "bütün planlar": "alle Pläne",
  "Ders süresi (dk)": "Stundendauer (Min.)",
  "Ekrandaki plan dosyadakiyle değiştirilecek. Bundan sonra \"Geri al\" bu açılıştan öncesine dönemez. Vazgeçme ihtimaliniz varsa önce \"Kaydet\" deyin.": "Der Plan auf dem Bildschirm wird durch den aus der Datei ersetzt. Danach kann „Rückgängig“ nicht mehr vor dieses Öffnen zurück. Falls Sie es sich anders überlegen könnten, drücken Sie zuerst „Speichern“.",
  "**Mozaik burada kendini günceller.** Yeni sürüm çıkınca üstte bir satır belirir; **Yenile** demedikçe hiçbir şey değişmez.": "**Mozaik aktualisiert sich hier selbst.** Bei einer neuen Version erscheint oben eine Zeile; ohne **Neu laden** ändert sich nichts.",
  "Mozaik kendiliğinden saklıyor; dosya taşımak ve saklamak için.": "Mozaik speichert selbst; die Datei dient zum Übertragen und Aufbewahren.",
  "WhatsApp açılamadı.": "WhatsApp konnte nicht geöffnet werden.",
  "İpuçları": "Hinweise",
  "Kapalı gün": "Gesperrte Tage",
  "{n} aşım": "{n} {n:Überschreitung|Überschreitungen}",
  "Hepsini seç": "Alle auswählen",
  "Hiçbirini seçme": "Keine auswählen",
  "E-postayla gönder": "Per E-Mail senden",
  "WhatsApp’la gönder": "Per WhatsApp senden",
  "{n} öğretmenin e-posta adresi yok.": "{n} {n:Lehrkraft hat|Lehrkräfte haben} keine E-Mail-Adresse.",
  "Hep görünsün": "Immer sichtbar",
  "Kaydırınca gizlensin": "Beim Scrollen ausblenden",
  "Kural aşımları": "Regelüberschreitungen",
  "Yeni sürüm notu var": "Es gibt eine neue Versionsnotiz",
  // ------------------------------------------- denetim/kisi: kişi sayfası, Özet, Hepsi
  "{ad} bugün yok olarak işaretle": "{ad} heute als abwesend markieren",
  "Bütün öğretmenler saatlerine sığıyor.": "Alle Lehrkräfte passen in ihre Stunden.",
  "Bütün sınıflar saatlerine sığıyor.": "Alle Klassen passen in ihre Stunden.",
  "Hepsi": "Alle",
  "Diğer bilgiler": "Weitere Angaben",
  "{ne} · {brans} dersi için işlemler": "Aktionen für die Stunde {ne} · {brans}",
  "Kalanı diz": "Rest legen",
  "Sabitle": "Anheften",
  "{ders} yerleşti ve sabitlendi.": "{ders} gelegt und angeheftet.",
  "{ders} yerleşti ve sabitlendi: {yer}.": "{ders} gelegt und angeheftet: {yer}.",
  "{olay}, yerlerinde sabitlendi.": "{olay}; an ihren Plätzen angeheftet.",
  "{ders} yerleşti ve sabitlendi; {olay}.": "{ders} gelegt und angeheftet; {olay}.",
  "Kalan dizildi, {adlar} yer değiştirdi.": "Der Rest ist gelegt; {adlar} verschoben.",
  "Kalan dizildi, {adlar} ve {n} ders daha yer değiştirdi.": "Der Rest ist gelegt; {adlar} und {n} weitere {n:Stunde|Stunden} verschoben.",
  "Yerleşmeyen dersleri kurallara uyarak yerleştirir; sabitlenenlere dokunmaz (elle koyduklarınız sabitlenir)": "Legt die noch nicht gelegten Stunden nach den Regeln; angeheftete bleiben (von Hand gelegte werden angeheftet)",
  "Dersi yerinden oynatılabilir yapar: Kalanı diz ya da Yeniden yap taşıyabilir.": "Macht die Stunde wieder beweglich: Rest legen oder Neu erstellen kann sie verschieben.",
  "Dersi bulunduğu yerde tutar: Kalanı diz ve Yeniden yap ona dokunmaz.": "Hält die Stunde an ihrem Platz: Rest legen und Neu erstellen lassen sie in Ruhe.",
  "Bu ders sabitlenmiş. Taşımak için önce P ile sabitlemeyi kaldırın.": "Diese Stunde ist angeheftet. Zum Verschieben zuerst mit P lösen.",
  "Dersleri yerleştirmek için Kalanı diz'e basın.": "Um die Stunden zu legen, „Rest legen“ drücken.",
  "Renkler neye göre": "Farben nach",
  "{ad} bugün yok olarak işaretlendi.": "{ad} wurde für heute als abwesend markiert.",
  "{ad} İndirilenler klasörüne kaydedildi.": "{ad} wurde im Ordner Downloads gespeichert.",
  "Dikkat: ders {eski} idi, {kim} {yeni} öğretmeni; ders {yeni} olarak görünecek.": "Achtung: Die Stunde war {eski}, {kim} unterrichtet {yeni}; die Stunde erscheint als {yeni}.",
  "Okulun adı, zili, öğretmenleri ve sınıfları.": "Name, Klingel, Lehrkräfte und Klassen der Schule.",
  "Kendi okulum": "Meine eigene Schule",
  "Boş bir plan açıldı. Örnek okul, plan seçicide duruyor.": "Ein leerer Plan wurde geöffnet. Die Beispielschule bleibt in der Planauswahl.",
  "Bu örnek okul.": "Das ist die Beispielschule.",
  "Kendi okulumla başla": "Mit meiner eigenen Schule beginnen",
  "? Yardım": "? Hilfe",
};

registerSozluk("de", DE);
