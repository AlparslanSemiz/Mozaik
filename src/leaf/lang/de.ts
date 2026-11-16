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
  "Kartların renk ölçütü": "Farbschema der Karten",
  "program kart rengi tercihi": "Farbpräferenz der Stundenplankarten",
  "{bir} ile {iki} yer değiştirecek": "{bir} und {iki} werden getauscht",
  "Takas olmaz: {sebep}":
    "Kein Tausch: {sebep}",
  "Takas olmaz, {ne} eski yerine geçemiyor: {sebep}":
    "Kein Tausch, {ne} kann nicht an die alte Stelle: {sebep}",
  "{bir} ile {iki} yer değiştirdi": "{bir} und {iki} wurden getauscht",
  "{ad} ({n} kart)": "{ad} ({n} {n:Karte|Karten})",
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
  "Dosyaya kaydet": "In Datei speichern",
  "plan dosyası": "Plandatei",
  "Plan dosyaya yazıldı. İndirilenler klasörüne bakın.":
    "Plan in eine Datei geschrieben. Schauen Sie im Ordner Downloads nach.",
  "Otomatik diz": "Automatisch legen",
  Program: "Stundenplan",
  "Açık temaya geç": "Zum hellen Design wechseln",
  "Koyu temaya geç": "Zum dunklen Design wechseln",
  "Araç şeridini gizle": "Werkzeugleiste ausblenden",
  "Araç şeridini göster": "Werkzeugleiste einblenden",
  "Animasyonları aç": "Animationen einschalten",
  "Animasyonları kapat": "Animationen ausschalten",
  "Ayarlar → Görünüm": "Einstellungen → Darstellung",
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
  "Tek bir planı değil, bu bilgisayardaki bütün planların yerine geçer. Ayarlar → Planlar ve yedek bölümündeki \"Tümünü dosyadan aç\" düğmesini kullanın.":
    "Sie ersetzt nicht einen einzelnen Plan, sondern alle Pläne auf diesem Computer. Verwenden Sie „Alle aus Datei öffnen“ unter Einstellungen → Pläne und Sicherung.",
  "Açık olan planın yerine geçecek": "Sie ersetzt den geöffneten Plan",
  'Ekrandaki plan dosyadakiyle değiştirilecek ve geri alma geçmişi sıfırlanacak. Vazgeçme ihtimaliniz varsa önce "Dosyaya kaydet" deyin.':
    "Der Plan auf dem Bildschirm wird durch den aus der Datei ersetzt und der Rückgängig-Verlauf geleert. Wählen Sie vorher „In Datei speichern“, falls Sie es sich anders überlegen könnten.",
  "Planı aç": "Plan öffnen",
  "Bu dosya eksik":
    "Diese Datei ist unvollständig",
  "Dosyada: {ogretmen} öğretmen, {sinif} sınıf, {ders} ders, yerleşmiş {saat} saat.":
    "In der Datei: {ogretmen} {ogretmen:Lehrkraft|Lehrkräfte}, {sinif} {sinif:Klasse|Klassen}, {ders} {ders:Fach|Fächer}, {saat} gelegte {saat:Stunde|Stunden}.",
  "Şu an: {ogretmen} öğretmen, {sinif} sınıf, {ders} ders, yerleşmiş {saat} saat.":
    "Jetzt: {ogretmen} {ogretmen:Lehrkraft|Lehrkräfte}, {sinif} {sinif:Klasse|Klassen}, {ders} {ders:Fach|Fächer}, {saat} gelegte {saat:Stunde|Stunden}.",
  "Plan dosyası açıldı.": "Plandatei geöffnet.",
  Bölümler: "Bereiche",
  "Programın durumu: {durum}. Ayrıntı için Kontrol.":
    "Status des Stundenplans: {durum}. Einzelheiten unter Prüfung.",
  "{durum}. Kontrol sekmesini açar": "{durum}. Öffnet den Reiter Prüfung",
  Plan: "Plan",
  "Planlar arasında geçiş yapar. Yeni plan, ad değiştirme ve silme: Ayarlar → Planlar ve yedek":
    "Wechselt zwischen Plänen. Neuer Plan, Umbenennen und Löschen: Einstellungen → Pläne und Sicherung",
  "Geri al": "Rückgängig",
  "Geri al (Ctrl+Z)": "Rückgängig (Strg+Z)",
  "İleri al": "Wiederholen",
  "İleri al (Ctrl+Y)": "Wiederholen (Strg+Y)",
  "Açık planı bir .json plan dosyasına yazar. Mozaik bu bilgisayarda kendiliğinden saklıyor; dosya taşımak ve saklamak için.":
    "Schreibt den geöffneten Plan in eine .json-Plandatei. Mozaik speichert auf diesem Computer ohnehin selbst; die Datei dient zum Übertragen und Aufbewahren.",
  "Daha önce kaydedilmiş bir .json dosyasını açar":
    "Öffnet eine zuvor gespeicherte .json-Datei",
  "Dosyadan aç": "Aus Datei öffnen",
  "Ara ve git": "Suchen und wechseln",
  "Ara ve git (Ctrl+K)": "Suchen und wechseln (Strg+K)",
  "Klavye kısayolları": "Tastenkombinationen",
  "Klavye kısayolları (?)": "Tastenkombinationen (?)",
  // -------------------------------------------------- ShortcutsHelp.tsx
  "Genel kısayollar": "Allgemein",
  "Komut paletini aç/kapat": "Befehlspalette ein-/ausblenden",
  "Bir sekmeye git": "Zu einem Bereich springen",
  "Bu ekranı aç": "Dieses Fenster öffnen",
  "İptal et veya kapat": "Abbrechen oder schließen",
  "Odaklı kartı havuza kaldır":
    "Fokussierte Karte in den Pool zurücklegen",
  "Odaklı kartın sağ tık menüsünü aç":
    "Kontextmenü der fokussierten Karte öffnen",
  Listeler: "Listen",
  "Yeni satır ekle veya düzenlemeyi onayla":
    "Neue Zeile hinzufügen oder Bearbeitung bestätigen",
  "Tutamaktan bir satırı sırada taşı":
    "Zeile am Griff in der Reihenfolge verschieben",
  "Satırı listenin başına veya sonuna taşı":
    "Zeile an den Anfang oder ans Ende der Liste verschieben",
  Diyaloglar: "Dialoge",
  Onayla: "Bestätigen",
  "Araç şeridi": "Werkzeugleiste",
  "Araç şeridini gizle, ızgaraya bir satır daha kalsın":
    "Werkzeugleiste ausblenden und dem Raster eine Zeile mehr lassen",
  "Koyu tema": "Dunkles Design",
  Yenile: "Neu laden",
  Sonra: "Später",
  "Klasörü düzelt": "Ordner in Ordnung bringen",
  "**Son değişiklik bu bilgisayara kaydedilemedi:** depolama alanı dolu. İşinizi kaybetmemek için **Dosyaya kaydet** düğmesine basın.":
    "**Die letzte Änderung konnte auf diesem Computer nicht gespeichert werden:** der Speicher ist voll. Damit Ihre Arbeit erhalten bleibt, klicken Sie auf **In Datei speichern**.",
  "**Kayıtlı plan okunamadı.** Üzerine yazılmadı; burada yapılanlar kaydedilmez. Plan dosyanızı **Dosyadan aç** ile açabilirsiniz.":
    "**Der gespeicherte Plan konnte nicht gelesen werden.** Er wurde nicht überschrieben; was Sie hier tun, wird nicht gespeichert. Ihre Plandatei öffnen Sie mit **Aus Datei öffnen**.",
  "**Bu bilgisayarda otomatik kayıt çalışmıyor.** Mozaik kapanınca yaptığınız her şey kaybolur. Çalışırken ve bilgisayarı kapatmadan önce sık sık **Dosyaya kaydet** düğmesine basın.":
    "**Das automatische Speichern funktioniert auf diesem Computer nicht.** Alles geht verloren, wenn Mozaik geschlossen wird. Drücken Sie beim Arbeiten und vor dem Herunterfahren häufig **In Datei speichern**.",
  "**Yeni sürüm hazır.** Şu an {surum} sürümünü kullanıyorsunuz; yenisi **Yenile** deyince gelir. İşiniz kaybolmaz.":
    "**Eine neue Version ist bereit.** Sie verwenden {surum}; die neue kommt, wenn Sie **Neu laden** drücken. Ihre Arbeit geht nicht verloren.",
  "**{klasor}** klasörüne yazılamıyor: tarayıcı izni sormadan devam etmiyor. İşiniz şu an yalnız bu tarayıcıda duruyor.":
    "In den Ordner **{klasor}** kann nicht geschrieben werden: Der Browser fragt erst nach einer Berechtigung. Ihre Arbeit liegt derzeit nur in diesem Browser.",
  "**{klasor}** klasörüne **yazılamıyor**. {sebep} İşiniz şu an yalnız bu tarayıcıda duruyor.":
    "In den Ordner **{klasor}** kann **nicht geschrieben** werden. {sebep} Ihre Arbeit liegt derzeit nur in diesem Browser.",

  // src/ui/availability/Availability.tsx
  "{ad} sınıfı": "Klasse {ad}",
  "{ad} dersliği": "Raum {ad}",
  "Müsait olmayan saatler": "Nicht verfügbare Stunden",
  "Önce {ne} ekleyin.": "Fügen Sie zuerst {ne} hinzu.",
  "{kim} · müsait olmayan saatler": "{kim} · nicht verfügbare Stunden",
  "Basılı tutup sürükleyerek birden çok hücre işaretleyebilirsiniz. Soldaki gün adına tıklayınca o günün tamamı, üstteki saat numarasına tıklayınca haftanın o saati değişir.":
    "Halten und ziehen Sie, um mehrere Zellen zu markieren. Ein Klick auf den Tagesnamen links schaltet den ganzen Tag um, ein Klick auf die Stundennummer oben diese Stunde in der ganzen Woche.",
  "Haftanın bu saatini değiştir": "Diese Stunde der Woche umschalten",
  "{gun}: bütün günü değiştir": "{gun}: den ganzen Tag umschalten",
  "Haftanın darlığı": "Wie eng die Woche ist",
  "{gun} {ders}. saat: {kapali} / {toplam} kapalı":
    "{gun}, {ders}. Stunde: {kapali} von {toplam} geschlossen",
  "Kimin saatleri": "Wessen Stunden",
  "Müsaitlik listesi": "Verfügbarkeitsliste",
  "{n} saat fazla, bu program dizilemez.":
    "{n} {n:Stunde|Stunden} zu viel; dieser Stundenplan lässt sich nicht legen.",
  ", {n} tanesi {kim} üzerinde": ", {n} davon bei {kim}",
  "Müsaitlik girebilmek için **Okul** sekmesinden en az bir {ne} eklemeniz gerekiyor.":
    "Um Verfügbarkeiten einzutragen, brauchen Sie mindestens {ne} aus dem Reiter **Schule**.",
  "**{kim}**: {acik} saat açık, {yuk} saat ders yüklenmiş.":
    "**{kim}**: {acik} Stunden offen, {yuk} Stunden Unterricht zugewiesen.",
  "**{kim}**: {acik} saat müsait, {yuk} saat ders yüklenmiş.": "**{kim}**: {acik} Stunden verfügbar, {yuk} Stunden Unterricht zugewiesen.",
  "**Kapattığınız saatlerde yerleşmiş {n} ders var{kimde}.** Hiçbiri silinmedi. **Program** sekmesinde kırmızı çerçeveyle, **Kontrol** sekmesinde tek tek listeleniyor.":
    "**{n} gelegte {n:Stunde liegt|Stunden liegen} in Zeiten, die Sie geschlossen haben{kimde}.** Nichts wurde gelöscht. Im Reiter **Stundenplan** sind sie rot umrandet, in **Prüfung** einzeln aufgeführt.",

  // src/ui/CapacityRows.tsx
  Ad: "Name",
  Açık: "Offen",
  "Müsait": "Verfügbar",
  Yük: "Last",
  Durum: "Status",

  // src/ui/program/Check.tsx
  "Kontrol edilecek bir şey yok.": "Es gibt noch nichts zu prüfen.",
  İmkânsız: "Unmöglich",
  "Programın durumu": "Status des Stundenplans",
  "Yerleşmiş saat": "Gelegte Stunden",
  "Tamamlanan ders": "Fertige Fächer",
  "Haftanın doluluğu": "Auslastung der Woche",
  "Boş kalan sınıf saati": "Freie Klassenstunden",
  "Kapalı saatte ders ({n})": "Fächer in geschlossener Stunde ({n})",
  Açıklama: "Erklärung",
  "Kapalı saat": "Geschlossene Stunden",
  "Müsait değil": "Nicht verfügbar",
  "Kural ihlalleri ({n})": "Regelverstöße ({n})",
  Uyarı: "Warnung",
  "Engel": "Sperre",
  "Yerleşemeyen dersler ({n})": "Nicht legbare Fächer ({n})",
  Ders: "Fach",
  Sebep: "Grund",
  Öğretmenler: "Lehrkräfte",
  "Öğretmenin müsait saat sayısı, ona yüklenen ders saatinden az olamaz.":
    "Die verfügbaren Stunden einer Lehrkraft dürfen nicht geringer sein als die ihr zugewiesenen Stunden.",
  Sınıflar: "Klassen",
  "Sınıfa yüklenen toplam ders saati, sınıfın AÇIK olduğu saatlere sığmalı.":
    "Die einer Klasse zugewiesenen Gesamtstunden müssen in die OFFENEN Stunden dieser Klasse passen.",
  Derslikler: "Räume",
  "Aynı dersliği paylaşan sınıfların TOPLAM ders saati de haftaya sığmalı. En çok gözden kaçan darboğaz burasıdır.":
    "Auch die GESAMTSTUNDEN der Klassen, die sich einen Raum teilen, müssen in die Woche passen. Dieser Engpass wird am häufigsten übersehen.",
  "Öğretmenleri ve sınıfları **Okul**, dersleri **Dersler** sekmesinden girdikten sonra buraya dönün. Bu sayfa programın dizilip dizilemeyeceğini önceden söyler.":
    "Kommen Sie hierher zurück, sobald Sie im Reiter **Schule** Lehrkräfte und Klassen und im Reiter **Fächer** die Fächer eingetragen haben. Diese Seite sagt im Voraus, ob sich der Stundenplan überhaupt legen lässt.",
  "**Sorun görünmüyor.** Öğretmen müsaitlikleri, sınıf ve derslik kapasiteleri yüklenen ders saatlerini karşılıyor. Program dizilebilir.":
    "**Es sieht alles in Ordnung aus.** Verfügbarkeiten sowie Klassen- und Raumkapazitäten decken die zugewiesenen Stunden. Der Stundenplan lässt sich legen.",
  "**Sorun görünmüyor.** Bazı öğretmenlerin müsait saati ya da bazı sınıf ve dersliklerin açık saati yüküne eşit ya da çok yakın (**Sıkışık**): orada boş saat kalmıyor ya da çok az kalıyor, ama program dizilebilir.":
    "**Es sieht alles in Ordnung aus.** Einige Lehrkräfte haben genau oder fast so viele verfügbare Stunden, einige Klassen oder Räume so viele offene Stunden wie zugewiesene (**Eng**): dort bleibt keine oder kaum eine Stunde übrig, aber der Stundenplan lässt sich legen.",
  "**Dikkat edilmesi gereken noktalar var.** Aşağıdaki listelerde":
    "**Es gibt Punkte, die Aufmerksamkeit brauchen.** In den Listen unten verhindern Zeilen mit",
  "yazan satırlar programın dizilmesini engeller. Önce onları çözün.":
    "verhindern das Legen des Stundenplans. Lösen Sie diese zuerst.",
  "Kalan **{n}** saat havuzda bekliyor. **Program** sekmesindeki **Otomatik diz** ile dizebilirsiniz.":
    "Die restlichen **{n}** Stunden warten im Ablagefach. Sie können sie mit **Automatisch legen** im Reiter **Stundenplan** legen.",
  "Danışman notları ({n})": "Berater-Hinweise ({n})",
  "Bunlar programı engellemez; veri girişinde gözden kaçmış olabilecek noktalardır.":
    "Diese blockieren den Stundenplan nicht; es sind Punkte, die bei der Dateneingabe übersehen worden sein könnten.",
  "Danışmanın söyleyecek bir şeyi yok.": "Der Berater hat nichts zu sagen.",
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
  "Dersi buraya sabitle": "Stunde hier anheften",
  "Sabitlemeyi kaldır": "Anheftung lösen",
  "Bu ders sabitlenmiş. Önce sabitlemeyi kaldırın.":
    "Diese Stunde ist angeheftet. Lösen Sie zuerst die Anheftung.",
  "Ders sabitlendi.": "Stunde angeheftet.",
  "Sabitleme kaldırıldı.": "Anheftung gelöst.",

  // src/ui/program/LessonEdit.tsx
  "Günde en fazla": "Höchstens pro Tag",
  "Dağılım değiştirilirse bu dersin programdaki yerleşimleri kalkar, sabitlenmiş kartlar da":
    "Wird die Aufteilung geändert, verschwindet dieses Fach aus dem Stundenplan, auch die angehefteten Karten",

  // src/ui/Ribbon.tsx — what the two destructive questions promise
  "{ad}: bilgileri ve haftalık programı": "{ad}: Angaben und Wochenstundenplan",

  // src/ui/program/Inspector.tsx
  Kapat: "Schließen",
  "Haftalık programı": "Wochenstundenplan",
  "Kayıt bulunamadı": "Kein Eintrag gefunden",

  // src/ui/program/LessonPool.tsx
  "Yerleşmeyi bekleyen kartlar": "Karten, die auf Platzierung warten",
  "Havuz yüksekliği": "Höhe des Ablagefachs",
  "Sürükleyerek havuzun boyunu ayarlayın":
    "Ziehen Sie, um die Höhe des Ablagefachs einzustellen",
  Havuz: "Ablagefach",
  "Havuzu kapat: ızgara bütün yüksekliği alır":
    "Ablagefach schließen: Das Raster nimmt die volle Höhe ein",
  "Havuzu aç": "Ablagefach öffnen",
  "Hepsi yerleşti": "Alles gelegt",
  "{n} dersin tamamı programda": "alle {n} {n:Fach ist|Fächer sind} im Stundenplan",
  "{n} kart bekliyor": "{n} {n:Karte wartet|Karten warten}",
  "{n} saat · sürükleyip bırakın":
    "{n} {n:Stunde|Stunden} · ziehen und ablegen",
  "{ust} · {alt} {brans} · {boy} saatlik kart":
    "{ust} · {alt} {brans} · {boy}-stündige Karte",
  " · {n} tane bekliyor": " · {n} warten",
  " · dersin {yerlesen}/{toplam} saati yerleşti":
    " · {yerlesen} von {toplam} Stunden des Fachs gelegt",

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
  Tümü: "Alle",
  Hiçbiri: "Keine",
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
  "Önce **Dersler** sekmesinden dersleri girip **Program** sekmesinde dizin.":
    "Tragen Sie zuerst im Reiter **Fächer** die Fächer ein und legen Sie sie dann im Reiter **Stundenplan**.",
  "**{n}** kâğıt": "**{n}** {n:Blatt|Blätter}",
  "Seçilen sayfaların **{n}** tanesi tamamen boş. O öğretmenlerin programı henüz dizilmemiş. **Program** sekmesinden dizebilirsiniz.":
    "**{n}** der gewählten Seiten sind völlig leer. Die Stundenpläne dieser Lehrkräfte wurden noch nicht gelegt. Sie können sie im Reiter **Stundenplan** legen.",
  "Seçilen sayfaların **{n}** tanesi tamamen boş. O sınıfların programı henüz dizilmemiş. **Program** sekmesinden dizebilirsiniz.":
    "**{n}** der gewählten Seiten sind völlig leer. Die Stundenpläne dieser Klassen wurden noch nicht gelegt. Sie können sie im Reiter **Stundenplan** legen.",

  // src/ui/program/Program.tsx
  "Buraya bırakılabilir.": "Hier kann abgelegt werden.",
  "Otomatik diziliyor…": "Wird automatisch gelegt…",
  "{yerlesen}/{toplam} kart · {sure} sn": "{yerlesen}/{toplam} Karten · {sure} s",
  "Satırlar öğretmen. Hücrede sınıf ve derslik yazar. Yerleşmiş kartı sürükleyerek taşıyın, sağ tıklayınca havuza döner.":
    "Zeilen sind Lehrkräfte. Eine Zelle zeigt Klasse und Raum. Ziehen Sie eine gelegte Karte zum Verschieben; ein Rechtsklick schickt sie zurück ins Ablagefach.",
  "Satırlar sınıf. Hücrede öğretmen ve branşı yazar. Yerleşmiş kartı sürükleyerek taşıyın, sağ tıklayınca havuza döner.":
    "Zeilen sind Klassen. Eine Zelle zeigt die Lehrkraft und ihr Fach. Ziehen Sie eine gelegte Karte zum Verschieben; ein Rechtsklick schickt sie zurück ins Ablagefach.",
  "Program dizildi. {n} kart yerleşti ({sure} sn). Ctrl+Z ile geri alabilirsiniz.":
    "Stundenplan gelegt. {n} Karten platziert ({sure} s). Mit Strg+Z rückgängig.",
  " (ve {n} ders daha)": " (und {n} {n:weiteres Fach|weitere Fächer})",
  "Durduruldu. {yerlesen}/{toplam} kart yerleşti.":
    "Angehalten. {yerlesen} von {toplam} Karten gelegt.",
  "{yerlesen}/{toplam} kart yerleşti.":
    "{yerlesen} von {toplam} Karten gelegt.",
  "{bas} {ders}: {saat} saat yerleşemedi. {sebep}{digerleri}.":
    "{bas} {ders}: {saat} Stunden konnten nicht gelegt werden. {sebep}{digerleri}.",
  "Henüz dizilecek ders yok.": "Es gibt noch keine Fächer zu legen.",
  "Buraya döndüğünüzde dersler alttaki havuzda kartlar hâlinde bekliyor olacak.":
    "Wenn Sie hierher zurückkehren, warten die Fächer als Karten im Ablagefach darunter.",
  "Ayrıntı: Kontrol sekmesi.": "Einzelheiten: Reiter Prüfung.",
  Tamam: "OK",
  Öğretmen: "Lehrkraft",
  Sınıf: "Klasse",
  "Önce **Okul** sekmesinden derslikleri, öğretmenleri ve sınıfları girin, **Müsaitlik** sekmesinde öğretmenlerin müsait olmadığı saatleri işaretleyin, sonra **Dersler** sekmesinde her sınıfa haftalık ders saatlerini ekleyin.":
    "Tragen Sie zuerst im Reiter **Schule** Räume, Lehrkräfte und Klassen ein, markieren Sie im Reiter **Verfügbarkeit** die Stunden, zu denen Lehrkräfte nicht verfügbar sind, und fügen Sie dann im Reiter **Fächer** für jede Klasse die Wochenstunden hinzu.",

  // src/ui/Ribbon.tsx
  "Liste boş": "Die Liste ist leer",
  Durdur: "Anhalten",
  "Havuzda bekleyen kart yok": "Keine Karte wartet im Ablagefach",
  "Havuzdaki kartları kurallara uyarak dizer":
    "Legt die Karten aus dem Ablagefach regelkonform",
  "Dizilmiş programı silip baştan dizer":
    "Löscht den Stundenplan und legt ihn von vorn",
  "Baştan diz": "Von vorn legen",
  "Programı boşalt": "Stundenplan leeren",
  "Sorun yok": "Keine Probleme",
  "Sorunlar ({n})": "Probleme ({n})",
  "{n} engel": "{n} {n:Sperre|Sperren}",
  "{n} uyarı": "{n} {n:Warnung|Warnungen}",
  "İkisi de": "Beide",
  "Öğretmen renkleri kâğıda basılır":
    "Lehrerfarben werden auf das Papier gedruckt",
  "Renkli bas": "In Farbe drucken",

  // src/ui/lessons/index.tsx
  "Yeni ders": "Neue Stunde",
  Branş: "Fach",
  "Sınıfa göre": "Nach Klasse",
  "Öğretmene göre": "Nach Lehrkraft",
  "Haftalık saate göre": "Nach Wochenstunden",
  "Blok sayısına göre": "Nach Anzahl der Blöcke",
  "{ders} ders · {saat} saat":
    "{ders} {ders:Fach|Fächer} · {saat} {saat:Stunde|Stunden}",
  "Dersler · {sayilar}": "Fächer · {sayilar}",
  "{kim} · {brans} dersleri · {sayilar}": "{kim} · {brans}-Fächer · {sayilar}",
  "{kim} dersleri · {sayilar}": "Fächer von {kim} · {sayilar}",
  "Önce sağdaki listeden bir {ne} seçin.":
    "Wählen Sie zuerst {ne} aus der Liste rechts.",
  "Sınıf seçin": "Klasse wählen",
  "Tüm branşlar": "Alle Fächer",
  "Öğretmen seçin": "Lehrkraft wählen",
  "{brans}: {n} öğretmen": "{brans}: {n} {n:Lehrkraft|Lehrkräfte}",
  "Haftalık saat": "Wochenstunden",
  Dağılım: "Aufteilung",
  Ekle: "Hinzufügen",
  "Dersleri yapıştır": "Fächer einfügen",
  "Sınıf · Öğretmen (ad veya kısa ad) · Haftalık saat · Blok (1 · 2 · 3)":
    "Klasse · Lehrkraft (Name oder Kurzname) · Wochenstunden · Block (1 · 2 · 3)",
  "Günde en fazla {n} saat kuralı bu kartı hiçbir yere sığdırmaz":
    "Die Regel \"höchstens {n} Stunden am Tag\" lässt für diese Karte keinen Platz",
  "{boy} saat > günde {n}": "{boy} Std. > {n}/Tag",
  "{sinif} · {kim}: {saat} saat ({dagilim})":
    "{sinif} · {kim}: {saat} Stunden ({dagilim})",
  "{n} satır eklenemedi":
    "{n} {n:Zeile|Zeilen} konnten nicht hinzugefügt werden",
  "Sınıf veya öğretmen bulunamadı:": "Klasse oder Lehrkraft nicht gefunden:",
  "Önce onları ekleyip tekrar deneyin.":
    "Fügen Sie sie zuerst hinzu und versuchen Sie es erneut.",
  "Bu aramaya uyan ders yok.": "Kein Fach passt zu dieser Suche.",
  "Bu ders bir günde en fazla kaç saat":
    "Höchstzahl der Stunden dieses Fachs an einem Tag",
  "Aynı gün olmasın": "Nicht am selben Tag",
  "Aynı gün olmasın: ders ekle": "Nicht am selben Tag: Fach hinzufügen",
  "Ders ekle…": "Fach hinzufügen…",
  "Kaldır: {ne}": "Entfernen: {ne}",
  "Günde ↑": "Pro Tag ↑",
  "{sinif} · {kim} dersinin branşı": "Fach der Stunde {sinif} · {kim}",
  "Dağılım değiştirilirse bu dersin programdaki yerleşimleri kalkar":
    "Wird die Aufteilung geändert, verschwinden die Platzierungen dieses Fachs aus dem Stundenplan",
  Sil: "Löschen",
  "Hangi öğretmen": "Welche Lehrkraft",
  "Hangi sınıf": "Welche Klasse",
  "Seçtiğiniz öğretmen için ders girin. Soldaki liste de o öğretmene daralır.":
    "Tragen Sie Fächer für die gewählte Lehrkraft ein. Die Liste links wird ebenfalls auf diese Lehrkraft eingegrenzt.",
  "Seçtiğiniz sınıf için ders girin. Soldaki liste de o sınıfa daralır.":
    "Tragen Sie Fächer für die gewählte Klasse ein. Die Liste links wird ebenfalls auf diese Klasse eingegrenzt.",
  "Ders listesi": "Fächerliste",
  "Excel'den yapıştır": "Aus Excel einfügen",
  "Ders eklemek için önce **Okul** sekmesinde en az bir öğretmen ve bir sınıf girin.":
    "Um ein Fach hinzuzufügen, tragen Sie zuerst im Reiter **Schule** mindestens eine Lehrkraft und eine Klasse ein.",
  "Henüz {ne} yok. **Okul** sekmesinden ekleyin.":
    "Noch {ne} vorhanden. Fügen Sie im Reiter **Schule** eine hinzu.",

  // src/ui/settings/Appearance.tsx
  Tema: "Design",
  "Yazı büyüklüğü": "Schriftgröße",
  Yoğunluk: "Dichte",
  Izgara: "Raster",
  "Izgara yoğunluğu": "Rasterdichte",
  Ferah: "Luftig",
  Rahat: "Bequem",
  Sığdır: "Einpassen",
  "Arayüzün geri kalanı": "Der Rest der Oberfläche",
  "Arayüz yoğunluğu": "Dichte der Oberfläche",
  "Kaydırınca gizlenir": "Beim Scrollen ausblenden",
  "Her zaman durur": "Bleibt immer",
  Örnek: "Beispiel",
  Saat: "Stunde",
  "{toplam} öğretmenin ilk {kac} tanesi.":
    "Die ersten {kac} von {toplam} {toplam:Lehrkraft|Lehrkräften}.",
  Hareket: "Bewegung",
  Dil: "Sprache",
  "**Ferah.** Satırlar en açık, paneller en geniş.":
    "**Luftig.** Die offensten Zeilen und die breitesten Bereiche.",
  "**Rahat.** Bugüne kadarki aralık.": "**Bequem.** Der bisherige Abstand.",
  "Henüz öğretmen yok. **Okul → Öğretmenler** adımından ekleyin; burası o listeyi gösterir.":
    "Noch keine Lehrkräfte. Fügen Sie sie unter **Schule → Lehrkräfte** hinzu; hier wird diese Liste gezeigt.",
  "**Tam.** Tasarlandığı gibi.": "**Voll.** Wie entworfen.",
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
    "Eine Zeile \"Nicht am selben Tag\" auf der Seite des Fachs: zwei Fächer kommen nie auf denselben Tag.",
  "Bir kart, bırakıldığı saatleri dolduran kartlarla yer değiştirebiliyor.":
    "Eine Karte kann mit den Karten tauschen, die die Stunden füllen, auf die sie fallen gelassen wird.",
  "Ayarlar → Hakkında, öneri aramasının bu bilgisayarda ne kadar sürdüğünü gösteriyor.":
    "Einstellungen → Über zeigt, wie lange die Vorschlagssuche auf diesem Rechner dauert.",
  "Kontrol, program tamamken sıkışık satırlar için artık \"Dikkat\" demiyor.":
    "Prüfung sagt bei engen Zeilen nicht mehr \"Achtung\", wenn der Stundenplan vollständig ist.",
  "Dil değişince bildirimler yeni dilde; boş ekranlar dersler için Dersler sekmesini gösteriyor.":
    "Meldungen folgen einem Sprachwechsel; die leeren Seiten verweisen für Fächer auf den Reiter Fächer.",
  "Program araç şeridinde Renk menüsü: kartlar öğretmene, sınıfa, dersliğe ya da branşa göre boyanıyor.":
    "Ein Farbmenü in der Werkzeugleiste von Stundenplan färbt Karten nach Lehrkraft, Klasse, Raum oder Fach.",
  "Bir kart başka bir kartın üstüne bırakılınca, iki hamle de uygunsa ikisi yer değiştiriyor.":
    "Eine Karte auf eine andere Karte fallen zu lassen tauscht beide, wenn beide Züge erlaubt sind.",
  "Okunmamış sürüm notu varken Ayarlar şeridindeki Hakkında düğmesinde bir nokta çıkıyor.":
    "Ein Punkt auf der Schaltfläche Über im Einstellungen-Band, solange ungelesene Versionshinweise da sind.",
  "Mozaik'in penceresi artık ekranı kaplayarak açılıyor, küçük bir kutuda değil.":
    "Das Fenster von Mozaik öffnet sich jetzt bildschirmfüllend, nicht in einem kleinen Kasten.",
  "Sığdır yoğunluğunda kart yazıları kırpılmıyor: sınıf numarası \"4…\" değil \"411\" okunuyor.":
    "In der Dichte Einpassen wird der Kartentext nicht mehr abgeschnitten: die Klassennummer lautet \"411\", nicht \"4…\".",
  "Sığdır, satır başından ve gün ayraçlarından kazandığı yeri ders sütunlarına veriyor.":
    "Einpassen gibt den Platz, den es bei Zeilenköpfen und Tagestrennern spart, an die Fachspalten.",
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
  "**Kurulum tamamlanamadı** (kod {kod}). Mozaik eski hâliyle açıldı, planlarınız yerinde. Bilgisayarı yeniden başlatıp Ayarlar → Hakkında'dan tekrar deneyebilirsiniz.": "**Die Installation wurde nicht abgeschlossen** (Code {kod}). Mozaik wurde unverändert geöffnet, Ihre Pläne sind da. Starten Sie den Computer neu und versuchen Sie es unter Einstellungen → Über erneut.",
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
  'Bu dosya bütün planları içeren bir dosya değil. Tek bir planı üst çubuktaki "Dosyadan aç" ile açabilirsiniz.':
    "Diese Datei enthält nicht alle Pläne. Einen einzelnen Plan öffnen Sie mit „Aus Datei öffnen“ in der oberen Leiste.",
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
  "Tümünü dosyaya kaydet ({n} plan)":
    "Alle in Datei speichern ({n} {n:Plan|Pläne})",
  "Bu bilgisayardaki bütün planların yerine dosyadakiler geçer":
    "Die Pläne der Datei ersetzen alle Pläne auf diesem Computer",
  "Tümünü dosyadan aç": "Alle aus Datei öffnen",
  "Bütün planları içeren dosya": "Die Datei mit allen Plänen",
  "Bu planın verisi": "Die Daten dieses Plans",
  "Örnek okul verisi": "Beispiel-Schuldaten",
  "Bu planın yerine hazır örnek okulu koyar":
    "Setzt die fertige Beispielschule an die Stelle dieses Plans",
  "Örnek okulu yükle": "Beispielschule laden",
  Sıfırla: "Zurücksetzen",
  "Her şeyi siler": "Löscht alles",
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
  "O zamana kadar üst çubuktaki **Dosyaya kaydet** tek çare.":
    "Bis dahin ist **In Datei speichern** in der oberen Leiste das einzige Mittel.",
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
    "{ogretmen} {ogretmen:Lehrkraft|Lehrkräfte}, {sinif} {sinif:Klasse|Klassen}, {ders} {ders:Fach|Fächer} und {saat} gelegte {saat:Stunde|Stunden} werden gelöscht. Das lässt sich nicht rückgängig machen.",
  '"{ad}" planı silinecek': "Der Plan „{ad}“ wird gelöscht",
  "Planı sil": "Plan löschen",
  "Planlar ({n})": "Pläne ({n})",
  "Yeni plan": "Neuer Plan",
  "Boş plan": "Leerer Plan",
  "Bu planın kopyası": "Kopie dieses Plans",
  "Öğretmenler, sınıflar ve dersler kalır; dizilmiş program boşalır":
    "Lehrkräfte, Klassen und Fächer bleiben; der gelegte Stundenplan wird geleert",
  "Taslak olarak kaydet": "Als Entwurf speichern",
  Taslak: "Entwurf",
  İçerik: "Inhalt",
  "{ad} adı": "Name von {ad}",
  "· açık olan": "· offen",
  "Bu planın verisi bulunamadı": "Die Daten dieses Plans wurden nicht gefunden",
  "{ogretmen} öğretmen · {sinif} sınıf · {ders} ders":
    "{ogretmen} {ogretmen:Lehrkraft|Lehrkräfte} · {sinif} {sinif:Klasse|Klassen} · {ders} {ders:Fach|Fächer}",
  "Bu plana geç": "Zu diesem Plan wechseln",
  "Tek plan silinemez": "Der einzige Plan kann nicht gelöscht werden",
  "Bu planı tamamen siler": "Löscht diesen Plan vollständig",
  "Taslaktan başla": "Mit einem Entwurf beginnen",
  "· verisi yok": "· keine Daten",
  "Taslağın kurulumu (derslikler, öğretmenler, sınıflar, dersler) kopyalanır; ** dizilmiş program boş gelir**. Taslağın kendisi değişmez.":
    "Die Einrichtung des Entwurfs (Räume, Lehrkräfte, Klassen, Fächer) wird kopiert; **der gelegte Stundenplan kommt leer**. Der Entwurf selbst ändert sich nicht.",

  // src/ui/settings/Rules.tsx
  Kurallar: "Regeln",
  Kural: "Regel",
  "Ne yapsın": "Was tun",
  "Şu an": "Derzeit",
  "{kural} kuralı": "Regel „{kural}“",
  Kapalı: "Aus",
  "Uyan yok": "Kein Treffer",
  "Kendi sınırı olan öğretmenler ({n})": "Lehrkräfte mit eigenen Grenzen ({n})",
  "Art arda": "Am Stück",
  "Günde ↓": "Pro Tag ↓",
  "Şu anki ihlaller ({n})": "Aktuelle Verstöße ({n})",
  "Dizilmiş program girdiğiniz sınırların hiçbirini aşmıyor.":
    "Der gelegte Stundenplan überschreitet keine der von Ihnen gesetzten Grenzen.",
  "Kendi sınırı olan sınıflar ({n})": "Klassen mit eigener Grenze ({n})",

  // src/ui/settings/School.tsx
  "Zil ve günler": "Klingel und Tage",
  "Okul adı (yazdırılan sayfaların başlığında görünür)":
    "Schulname (erscheint in der Überschrift gedruckter Seiten)",
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
  "Saat (dk)": "Stunde (Min.)",
  "Teneffüs (dk)": "Pause (Min.)",
  "Öğle arası (dk)": "Mittagspause (Min.)",
  "Saat adları (virgülle; boş kalan numarasını alır)":
    "Namen der Stunden (durch Komma getrennt; eine Stunde ohne Namen behält ihre Nummer)",
  "{n} ad saat sayısından fazlaydı ve kullanılmadı.":
    "{n} {n:Name war|Namen waren} mehr als die Anzahl der Stunden und {n:wurde|wurden} nicht verwendet.",
  "Bunların {n} saati sabitli, sabitlemeleri de kalkacak.":
    "{n} davon {n:ist|sind} fixiert, auch die {n:Fixierung verschwindet|Fixierungen verschwinden}.",
  "Öteki seçeneklerde de {n} saat kalkacak.":
    "Auch in den anderen Varianten {n:verschwindet|verschwinden} {n} {n:Stunde|Stunden}.",
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
  "Ders yüküne göre": "Nach Fachlast",
  "Sınıflar ({n})": "Klassen ({n})",
  "Yeni sınıf": "Neue Klasse",
  "Sınıf adı, örn. 510": "Klassenname, z. B. 510",
  "Derslik yok": "Kein Raum",
  "Sınıfları yapıştır": "Klassen einfügen",
  "Sınıf adı · Derslik adı": "Klassenname · Raumname",
  "{ad} → {derslik} dersliği": "{ad} → Raum {derslik}",
  "Bu aramaya uyan sınıf yok.": "Keine Klasse passt zu dieser Suche.",
  "Ders saati": "Unterrichtsstunden",
  "Günde aynı ders ↑": "Gleiches Fach/Tag ↑",
  "Bu sınıf bir günde aynı dersten en fazla kaç saat":
    "Wie viele Stunden eines Fachs diese Klasse an einem Tag haben darf",
  "{ad} bir günde aynı dersten en fazla kaç saat":
    "wie viele Stunden eines Fachs {ad} an einem Tag haben darf",
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
  "Derslikler ({n})": "Räume ({n})",
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
  "Mozaik'te gömülü olan kısaltma": "Die in Mozaik eingebaute Kurzform",
  "Listeden çıkar": "Aus der Liste entfernen",
  "Bu branş zaten listede değil":
    "Dieses Fach steht ohnehin nicht in der Liste",
  '"{ad}" branşı kullanılıyor': "Das Fach „{ad}“ wird verwendet",
  "{n} öğretmen bu branşta ({kimler}). Önce onların branşını değiştirin, sonra bu branşı silin.":
    "{n} {n:Lehrkraft hat|Lehrkräfte haben} dieses Fach ({kimler}). Ändern Sie zuerst deren Fach und löschen Sie es dann.",
  "Branşlar ({n})": "Fächer ({n})",
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
  "Gömülü tablodaki branşların hepsi listenizde.":
    "Alle Fächer der eingebauten Tabelle stehen bereits in Ihrer Liste.",
  "Gömülü tablodaki bütün branşları listeye ekler":
    "Fügt alle Fächer der eingebauten Tabelle zur Liste hinzu",
  "Hepsini ekle": "Alle hinzufügen",
  "{ad} branşını listeye ekler": "Fügt das Fach {ad} zur Liste hinzu",
  "Listeye ekle": "Zur Liste hinzufügen",
  "Hiçbir öğretmende kullanılmayan {n} branş var: {hangileri}. Silinebilirler.":
    "{n} {n:Fach wird|Fächer werden} von keiner Lehrkraft verwendet: {hangileri}. Sie können gelöscht werden.",
  "Derslik yükü": "Raumlast",
  "Henüz derslik yok.": "Noch keine Räume.",
  "Hangi sınıflar": "Welche Klassen",
  "sınıf yok": "keine Klassen",
  "{n} sınıf: {hangileri}": "{n} {n:Klasse|Klassen}: {hangileri}",
  "Öğretmen yükü": "Lehrerlast",
  "Henüz öğretmen yok.": "Noch keine Lehrkräfte.",
  "Sınıf yükü": "Klassenlast",
  "Henüz sınıf yok.": "Noch keine Klassen.",
  "Ders yükü": "Fachlast",
  "Hiç dersi olmayan öğretmen: {kimler}.":
    "Lehrkräfte ganz ohne Fächer: {kimler}.",
  "**{n} {ne} başkasıyla aynı renkte.** Renk burada bir kimlik: ızgarada, havuzda ve kâğıtta okunuyor.":
    "**{n} {ne} haben dieselbe Farbe wie jemand anderes.** Farbe ist hier eine Identität: Sie wird im Raster, im Ablagefach und auf dem Papier gelesen.",
  "**{ad}**: {n} öğretmen": "**{ad}**: {n} {n:Lehrkraft|Lehrkräfte}",
  "Sınıfa yüklenen toplam ders saati, sınıfın **açık** olduğu saatlere sığmalı.":
    "Die einer Klasse zugewiesenen Gesamtstunden müssen in die **offenen** Stunden dieser Klasse passen.",
  "**{n} sınıfın hiç dersi yok** ({hangileri}).":
    "**{n} {n:Klasse hat|Klassen haben} gar keine Fächer** ({hangileri}).",

  // src/ui/setup/Teachers.tsx
  Cinsiyet: "Geschlecht",
  "Branşa göre": "Nach Fach",
  "Müsait saate göre": "Nach verfügbaren Stunden",
  "Cinsiyete göre": "Nach Geschlecht",
  "Öğretmenler ({n})": "Lehrkräfte ({n})",
  "Yeni öğretmen": "Neue Lehrkraft",
  "Ad Soyad": "Vor- und Nachname",
  "Boş bırakırsanız addan üretilir":
    "Leer gelassen, wird es aus dem Namen gebildet",
  "Branş seçin": "Fach wählen",
  "+ Yeni branş…": "+ Neues Fach…",
  "Yeni branşın adı": "Name des neuen Fachs",
  "+ İkinci branş": "+ Zweites Fach",
  "İkinci branş": "Zweites Fach",
  "İkinci branş yok": "Kein zweites Fach",
  "Öğretmenleri yapıştır": "Lehrkräfte einfügen",
  "Ad Soyad · Kısa ad · Branş · Cinsiyet · İkinci branş · E-posta":
    "Vor- und Nachname · Kurzname · Fach · Geschlecht · Zweites Fach · E-Mail",
  "Bu aramaya uyan öğretmen yok.": "Keine Lehrkraft passt zu dieser Suche.",
  "2. branş": "2. Fach",
  "Art arda en fazla kaç saat": "Höchstens wie viele Stunden am Stück",
  "Bir günde en fazla kaç saat": "Höchstens wie viele Stunden an einem Tag",
  "Geldiği gün en az kaç saat":
    "Mindestens wie viele Stunden an einem Anwesenheitstag",
  "{kim} branşı": "Fach von {kim}",
  "{kim} için ikinci branş ekle": "Zweites Fach für {kim} hinzufügen",
  "İkinci branş ekle": "Zweites Fach hinzufügen",
  "{kim} ikinci branşı": "zweites Fach von {kim}",
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
  "Bu satır bir daha çıkmaz; örnek okul Ayarlar → Hakkında’da durmaya devam eder":
    "Diese Zeile erscheint nicht wieder; die Beispielschule bleibt unter Einstellungen → Über",
  "Bir daha gösterme": "Nicht mehr anzeigen",
  "{ad} ile başla": "Mit {ad} beginnen",
  "Daha önce **taslak** olarak işaretlediğiniz planların kurulumu hazır duruyor. Seçtiğinizden **yeni bir plan** açılır: derslikler, öğretmenler, sınıflar ve dersler kopyalanır, dizilmiş program boş gelir. Taslağın kendisi değişmez.":
    "Die Einrichtung der als **Entwurf** markierten Pläne liegt bereit. Wählen Sie einen, öffnet sich **ein neuer Plan**: Räume, Lehrkräfte, Klassen und Fächer werden kopiert, der gelegte Stundenplan kommt leer. Der Entwurf selbst ändert sich nicht.",

  // src/ui/useRowOrder.tsx
  Sıra: "Reihenfolge",
  "{ad}, {n}. sıra, taşımak için yukarı ve aşağı ok":
    "{ad}, Position {n}, mit Pfeil auf/ab verschieben",
  "Elle sıralama için süzmeyi ve sıralamayı kaldırın":
    "Zum Ordnen von Hand Filter und Sortierung entfernen",

  // src/ui/plans/useSample.ts
  "{ogretmen} öğretmen, {sinif} sınıf ve {ders} ders silinecek.":
    "{ogretmen} {ogretmen:Lehrkraft|Lehrkräfte}, {sinif} {sinif:Klasse|Klassen} und {ders} {ders:Fach|Fächer} werden gelöscht.",
  "Bu plandaki her şeyin yerine örnek okul geçecek":
    "Die Beispielschule ersetzt alles in diesem Plan",
  "Örnek okul verisi yüklenecek": "Beispiel-Schuldaten werden geladen",
  "25 öğretmen, 20 sınıf, 8 derslik ve 99 ders. Mozaik'in ne yaptığını görmek için; kendi verinizi girmeye başlamadan önce Ayarlar → Hakkında → \"Her şeyi sil\" ile temizleyin.":
    "25 Lehrkräfte, 20 Klassen, 8 Räume und 99 Fächer. Um zu sehen, was Mozaik tut; bevor Sie eigene Daten eintragen, räumen Sie mit Einstellungen → Über → „Alles löschen“ auf.",
  "Yerine koy": "Ersetzen",
  Yükle: "Laden",
  "Örnek okul yüklendi.": "Beispielschule geladen.",

  // src/constraints.ts
  "Ders bulunamadı": "Fach nicht gefunden",
  "Ders eksik tanımlı": "Das Fach ist unvollständig definiert",
  "Geçersiz hücre": "Ungültige Zelle",
  "Bu saat günün dışında": "Diese Stunde liegt außerhalb des Tages",
  "{boy} saatlik kart güne sığmıyor":
    "Eine {boy}-stündige Karte passt nicht in den Tag",
  "{n}. gün": "Tag {n}",
  "{sinif} sınıfının {gun} {saat} saatinde {ders} var":
    "Klasse {sinif} hat am {gun} in der {saat}. Stunde bereits {ders}",
  "başka ders": "ein anderes Fach",
  "{sinif} sınıfı {gun} {saat} saatinde kapalı":
    "Klasse {sinif} ist am {gun} in der {saat}. Stunde geschlossen",
  "{kim} {gun} {saat} saatinde müsait değil":
    "{kim} ist am {gun} in der {saat}. Stunde nicht verfügbar",
  "{kim} {gun} {saat} saatinde {sinif} sınıfında":
    "{kim} ist am {gun} in der {saat}. Stunde bei Klasse {sinif}",
  başka: "einer anderen",
  "{derslik} dersliğinde {gun} {saat} saatinde {sinif} var":
    "In Raum {derslik} ist am {gun} in der {saat}. Stunde {sinif}",
  "başka sınıf": "eine andere Klasse",
  "{derslik} dersliği {gun} {saat} saatinde kapalı":
    "Raum {derslik} ist am {gun} in der {saat}. Stunde geschlossen",
  "{kim} art arda {sinir} saatten fazla girmemeli, burada {olan} saat olur":
    "{kim} darf höchstens {sinir} Stunden am Stück unterrichten; hier wären es {olan}",
  "{ders} {gun} günü var, bu dersle aynı güne konmamalı":
    "{ders} liegt am {gun}; dieses Fach darf nicht auf denselben Tag",
  "{bir} ile {iki} {gun} günü ikisi de var, aynı gün olmamalı.":
    "{bir} und {iki} liegen beide am {gun}; sie dürfen nicht auf denselben Tag.",
  "Aynı gün olmaması istenen iki ders aynı gündeyse, dersin sayfasındaki **Aynı gün olmasın** satırı onları gösterir.":
    "Liegen zwei Fächer, die nicht auf denselben Tag dürfen, am selben Tag, zeigt die Zeile **Nicht am selben Tag** auf der Seite des Fachs sie an.",
  "{bir} ile {iki} {gun} günü sabitlenmiş; aynı gün olmamaları istendiği için biri yerinden oynamadan bir yol bulunamaz.":
    "{bir} und {iki} sind am {gun} beide angeheftet; sie dürfen nicht am selben Tag liegen, also gibt es keinen Weg, bis eines verschoben wird.",
  "İkisi de **sabitlenmişse** **Otomatik diz** öneri arayamaz; birinin sabitlemesini kaldırın ya da başka güne taşıyın.":
    "Sind beide **angeheftet**, kann **Automatisch legen** keine Vorschläge suchen; lösen Sie eines oder verschieben Sie es auf einen anderen Tag.",
  "{kim} {gun} günü en fazla {sinir} saat girmeli, burada {olan} saat olur":
    "{kim} darf am {gun} höchstens {sinir} Stunden unterrichten; hier wären es {olan}",
  "{sinif} sınıfı {gun} günü {kim} dersinden en fazla {sinir} saat görmeli, burada {olan} saat olur":
    "Klasse {sinif} darf am {gun} höchstens {sinir} Stunden bei {kim} haben; hier wären es {olan}",
  "{ders} dersi havuza dönecek": "das Fach {ders} geht zurück ins Ablagefach",
  "{dersler} dersleri havuza dönecek":
    "die Fächer {dersler} gehen zurück ins Ablagefach",
  "{ders} dersi havuza döndü": "das Fach {ders} ist zurück ins Ablagefach gegangen",
  "{dersler} dersleri havuza döndü":
    "die Fächer {dersler} sind zurück ins Ablagefach gegangen",
  "{gun} {saat} saatinde": "am {gun} in der {saat}. Stunde",
  "{kim} {ne_zaman} müsait değil": "{kim} ist {ne_zaman} nicht verfügbar",
  "{sinif} sınıfı {ne_zaman} kapalı":
    "Klasse {sinif} ist {ne_zaman} geschlossen",
  "{derslik} dersliği {ne_zaman} kapalı":
    "Raum {derslik} ist {ne_zaman} geschlossen",

  // src/drag.ts
  "Bu hücreye bırakılamaz": "In dieser Zelle kann nicht abgelegt werden",

  // src/entities.ts
  "{sinif} sınıfının {kim} dersi": "das Fach {kim} der Klasse {sinif}",
  "Bu sınıf": "Diese Klasse",
  "Haftalık ders yükü": "Wöchentliche Fachlast",
  "{n} saat": "{n} {n:Stunde|Stunden}",
  "Açık saat": "Offene Stunden",
  "Müsait saat": "Verfügbare Stunden",
  "Programa yerleşmiş": "Im Stundenplan gelegt",
  "{yerlesen} / {toplam} saat": "{yerlesen} von {toplam} Stunden",
  "Branşı: {brans}": "Fach: {brans}",
  "Henüz dersi yok": "Noch keine Fächer",
  "{n} dersi var: {hangileri}": "{n} {n:Fach|Fächer}: {hangileri}",
  "Dersliği: {derslik}": "Raum: {derslik}",
  "Hiçbir sınıf bu dersliği kullanmıyor": "Keine Klasse nutzt diesen Raum",
  "{n} sınıf paylaşıyor: {hangileri}":
    "von {n} {n:Klasse|Klassen} genutzt: {hangileri}",

  // src/feasibility.ts
  "Boş yer kalmamış": "Es ist kein Platz mehr frei",
  "{kim} {acik} saat müsait, {yuk} saat ders yüklenmiş. {fazla} saat fazla.":
    "{kim} ist {acik} Stunden verfügbar und mit {yuk} Stunden belegt. Das sind {fazla} zu viel.",
  "{kim} {acik} saat müsait, {yuk} saat ders yüklenmiş. Zor olacak.":
    "{kim} ist {acik} Stunden verfügbar und mit {yuk} Stunden belegt. Das wird eng.",
  "{kim} {acik} saat müsait, {yuk} saat ders yüklenmiş.":
    "{kim} ist {acik} Stunden verfügbar und mit {yuk} Stunden belegt.",
  "{sinif} sınıfına {yuk} saat ders yüklenmiş ama haftada {acik} saati açık. {fazla} saat fazla.":
    "Klasse {sinif} ist mit {yuk} Stunden belegt, aber nur {acik} Stunden in der Woche offen. Das sind {fazla} zu viel.",
  "{sinif} sınıfı: açık olan {acik} saatin {yuk} saati dolu.":
    "Klasse {sinif}: {yuk} von {acik} offenen Stunden sind belegt.",
  "{derslik} dersliğini {n} sınıf paylaşıyor ({hangileri}) ve toplam {yuk} saat ders var. Haftada {acik} saati açık, {fazla} saat fazla.":
    "Raum {derslik} wird von {n} Klassen genutzt ({hangileri}), zusammen {yuk} Stunden. Er ist {acik} Stunden in der Woche offen, also {fazla} zu wenig.",
  "{derslik} dersliği ({hangileri}): açık olan {acik} saatin {yuk} saati dolu.":
    "Raum {derslik} ({hangileri}): {yuk} von {acik} offenen Stunden sind belegt.",
  "{n} kural ihlali": "{n} {n:Regelverstoß|Regelverstöße}",
  "{n} ders kapalı saatte": "{n} {n:Fach|Fächer} in geschlossener Stunde",
  "{n} ders sığmıyor": "{n} {n:Fach passt|Fächer passen} nicht",
  "{n} saat havuzda": "{n} {n:Stunde|Stunden} im Ablagefach",
  "Henüz ders girilmedi": "Noch keine Fächer eingetragen",
  "{ders} haftada {n} kez konacak ama yalnızca {gun} gün var; en az bir günde iki kez görülecek.":
    "{ders} muss {n} Mal pro Woche gelegt werden, aber es gibt nur {gun} Tage; an mindestens einem Tag erscheint es zweimal.",
  "{kim} yalnızca {acik} günde müsait ama bir dersi haftada {n} kez konacak; bir güne iki kez düşebilir.":
    "{kim} ist nur an {acik} Tagen verfügbar, aber ein Fach muss {n} Mal pro Woche gelegt werden; es kann an einem Tag zweimal landen.",
  "{ders} {n} ayrı bloğa bölünmüş ve hiç tekli saat bırakmıyor; çözücünün deneyebileceği tek şekil bu.":
    "{ders} ist in {n} eigenständige Blöcke aufgeteilt und lässt keine Einzelstunde übrig; das ist die einzige Form, die der Löser versuchen kann.",
  "{n} ders haftada günden çok kez konacak; en az bir günde iki kez görülecek:":
    "{n} Fächer müssen öfter pro Woche gelegt werden, als es Tage gibt; jedes erscheint an mindestens einem Tag zweimal:",
  "{n} öğretmenin müsait günü bir dersinin istediğinden az; bir güne iki kez düşebilir:":
    "{n} Lehrkräfte haben weniger verfügbare Tage, als eines ihrer Fächer braucht; es kann an einem Tag zweimal landen:",
  "{n} ders bloklara bölünmüş ve hiç tekli saat bırakmıyor; çözücünün deneyebileceği tek şekil bu:":
    "{n} Fächer sind in Blöcke aufgeteilt und lassen keine Einzelstunde übrig; das ist die einzige Form, die der Löser versuchen kann:",

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
  "araç şeridi tercihi": "Werkzeugleisten-Einstellung",
  "şerit kaydırınca gizlensin mi": "ob die Leiste beim Scrollen ausblendet",
  "müsaitlikte saat gösterimi": "Uhrzeiten im Verfügbarkeitsbildschirm",
  "hareket (animasyon) tercihi": "Bewegungs-Einstellung (Animation)",
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
  "Program baştan dizilince değişiklik gerekmeden kuruluyor":
    "Neu gelegt lässt sich der Stundenplan ohne Änderung aufbauen",
  "Uygula ve baştan diz":
    "Übernehmen und neu legen",
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
  "Program o arada değişti. Öneriyi yeniden görmek için Otomatik diz’e basın.":
    "Der Stundenplan hat sich inzwischen geändert. Drücken Sie Automatisch legen, um wieder einen Vorschlag zu sehen.",
  "Program değişiklik gerekmeden kuruluyor":
    "Der Stundenplan lässt sich ohne Änderung aufbauen",
  "Otomatik dizme bu programı bulamadı; ikinci arama buldu ve denetledi.":
    "Das automatische Legen hat diesen Stundenplan nicht gefunden; die zweite Suche hat ihn gefunden und geprüft.",
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
    "Ein Fach einer anderen Lehrkraft geben",
  "Blok şekli":
    "Blockform",
  "Bir yol seçin; her biri tek başına yetiyor, sınıfların saatlerine dokunulmaz.":
    "Wählen Sie einen Weg; jeder reicht für sich allein, die Stunden der Klassen bleiben unberührt.",
  "Uygula":
    "Anwenden",
  "Uygula, baştan diz":
    "Anwenden, neu verteilen",
  "Olmaz":
    "Geht nicht",
  "Geri al: {ne}":
    "Zurücknehmen: {ne}",
  "(daha iyisi aranıyor)":
    "(eine bessere wird gesucht)",
  "Başka yollar da aranıyor… {sure} sn":
    "Es wird auch nach anderen Wegen gesucht… {sure} s",
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
    "Ein Fach einer anderen Lehrkraft geben, weniger Stunden",
  "Birkaç dersi başka öğretmene verip en az saat":
    "Einige Fächer anderen Lehrkräften geben, möglichst wenige Stunden",
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
  "{gun} hiç müsait değil":
    "Am {gun} gar nicht verfügbar",
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
  "Bu değişiklikle bütün kartlar yerleşiyor; program bulundu ve denetlendi.":
    "Mit dieser Änderung passen alle Karten; der Stundenplan wurde gefunden und geprüft.",
  "Bundan küçük bir değişiklik yetmiyor.":
    "Keine kleinere Änderung reicht.",
  "Bulduğumuz en küçük değişiklik bu.":
    "Das ist die kleinste Änderung, die wir gefunden haben.",
  "Öneri uygulandı ve program dizildi. Ctrl+Z ile geri alabilirsiniz.":
    "Der Vorschlag wurde übernommen und der Stundenplan gelegt. Mit Strg+Z rückgängig machen.",
  "{sinif} sınıfında boş açık saat kalmadı":
    "die Klasse {sinif} hat keine offene Stunde mehr frei",
  "Boş kalan saatler bu dersin {boy} saatlik kartına uymuyor":
    "die frei gebliebenen Stunden passen nicht zur {boy}-stündigen Karte dieses Fachs",
  "Tek başına {gun} {saat} saatine sığıyor, sınıfın öbür eksik dersleriyle birlikte sığmıyor":
    "allein passt es am {gun} in die {saat}. Stunde, aber nicht zusammen mit den anderen fehlenden Fächern der Klasse",
  "{gun} {saat} saatine sığıyor, arama oraya varmadan durdu":
    "es passt am {gun} in die {saat}. Stunde; die Suche hat vorher aufgehört",

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
  ders: "Fach",
  "Yük durumu": "Auslastung",
  Boş: "Leer",
  "Öğretmenin müsait olmadığı saatlere tıklayın.":
    "Klicken Sie die Stunden an, zu denen die Lehrkraft nicht verfügbar ist.",
  "Sınıfın ders yapamayacağı saatlere tıklayın. O saatlere hiçbir ders konamaz.":
    "Klicken Sie die Stunden an, zu denen die Klasse keinen Unterricht haben kann. In diese Stunden kann kein Fach gelegt werden.",
  "Dersliğin kapalı olduğu saatlere tıklayın. O dersliği kullanan sınıflar o saatte ders yapamaz.":
    "Klicken Sie die Stunden an, zu denen der Raum geschlossen ist. Klassen, die diesen Raum nutzen, können dann keinen Unterricht haben.",
  Uygun: "Passt",
  Sıkışık: "Eng",
  "Öğretmen görünümü": "Lehreransicht",
  "Sınıf görünümü": "Klassenansicht",
  Görünüm: "Ansicht",
  Hakkında: "Über",
  "Planlar ve yedek": "Pläne und Sicherung",
  "Hücre en büyük, kartın alt satırı tam boyda":
    "Größte Zelle, untere Kartenzeile in voller Größe",
  "Hücre geniş, başlangıç saatleri görünür":
    "Breite Zelle, Anfangszeiten sichtbar",
  "Programın tamamı ekrana sığar, başlangıç saatleri gizlenir":
    "Der ganze Stundenplan passt auf den Bildschirm, Anfangszeiten werden ausgeblendet",
  Öğretmenden: "Von einer Lehrkraft",
  "Bir öğretmen seçin, girdiği bütün sınıfları arka arkaya girin":
    "Wählen Sie eine Lehrkraft und tragen Sie alle ihre Klassen nacheinander ein",
  Sınıftan: "Von einer Klasse",
  "Bir sınıf seçin, o sınıfın derslerini arka arkaya girin":
    "Wählen Sie eine Klasse und tragen Sie deren Fächer nacheinander ein",
  Genel: "Gesamt",
  "Bütün dersler tek listede": "Alle Fächer in einer Liste",
  Liste: "Liste",
  Yöntem: "Vorgehen",
  "Açık olan": "Offen",
  Toplam: "Summe",
  Diz: "Legen",
  Bölüm: "Bereich",
  Koyu: "Dunkel",
  Tam: "Voll",
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
  "Sayfanın altında yazdırılma tarihi ve saati":
    "Datum und Uhrzeit des Drucks am Seitenfuß",
  "Öğretmen art arda en fazla": "Lehrkraft, höchstens am Stück",
  "Bir öğretmen arka arkaya kaç saat derse girebilir.":
    "Wie viele Stunden am Stück eine Lehrkraft unterrichten darf.",
  "Öğretmen günde en fazla": "Lehrkraft, höchstens pro Tag",
  "Bir öğretmenin bir gündeki toplam ders saati.":
    "Die Gesamtstunden einer Lehrkraft an einem Tag.",
  "Öğretmen günde en az": "Lehrkraft, mindestens pro Tag",
  "Bir sınıf aynı dersten günde en fazla":
    "Eine Klasse, höchstens vom selben Fach pro Tag",
  "Öğretmenin dersleri arasında en fazla boşluk":
    "Lehrkraft, höchstens Lücke zwischen den Stunden",
  "Bir günde ilk ve son ders arasında kaç saat boş kalabilir. 0 hiç boşluk olmasın demektir.":
    "Wie viele Stunden zwischen der ersten und letzten Stunde eines Tages frei bleiben dürfen. 0 bedeutet keine Lücke.",
  "Sınıfın dersleri arasında en fazla boşluk":
    "Klasse, höchstens Lücke zwischen den Stunden",
  "Aynısı sınıf için. Yalnız Kontrol sekmesinde uyarır.":
    "Dasselbe für eine Klasse. Warnt nur, im Reiter Kontrol.",
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
  Müsaitlik: "Verfügbarkeit",
  Kontrol: "Prüfung",
  Ayarlar: "Einstellungen",
  "{n} öğretmen": "{n} {n:Lehrkraft|Lehrkräfte}",
  "{n} derslik": "{n} {n:Raum|Räume}",
  "{n} ders": "{n} {n:Fach|Fächer}",
  Dersler: "Fächer",
  "{ad} branşının adı": "Name des Fachs {ad}",
  '"{ad}" adı zaten kullanılıyor': 'Der Name "{ad}" ist bereits vergeben',
  "İki branş aynı adı taşıyamaz. Başka bir ad seçin.":
    "Zwei Fächer können nicht denselben Namen tragen. Wählen Sie einen anderen.",
  '"{eski}" branşı "{yeni}" olacak': 'Das Fach "{eski}" wird zu "{yeni}"',
  "{n} öğretmenin branşı da bu adla değişecek ({kimler}).":
    "Das Fach von {n} Lehrkräften ändert sich mit ({kimler}).",
  Değiştir: "Umbenennen",
  "Verdiği dersler": "Erteilte Fächer",
  "Aldığı dersler": "Belegte Fächer",
  "{ne} dersini başka öğretmene aktar":
    "Das Fach {ne} an eine andere Lehrkraft übergeben",
  "Başka öğretmene aktar…": "An andere Lehrkraft übergeben…",
  "{ne} dersi {kim} öğretmenine geçecek": "Das Fach {ne} geht an {kim}",
  "Bu ders henüz programa yerleşmemiş, yani kaybolacak bir şey yok.":
    "Dieses Fach steht noch nicht im Stundenplan, es kann also nichts verloren gehen.",
  "Programdaki {n} kartı yeni öğretmenin müsait saatlerine göre yeniden denenecek; sığmayanlar havuza döner.":
    "Seine {n} gelegten Karten werden gegen die verfügbaren Stunden der neuen Lehrkraft erneut geprüft; was nicht passt, geht zurück ins Ablagefach.",
  Aktar: "Übergeben",
  "{ne} dersi {kim} öğretmenine geçti.": "Das Fach {ne} ging an {kim}.",
  "{ne} dersi {kim} öğretmenine geçti. {n} kart havuza döndü.":
    "Das Fach {ne} ging an {kim}. {n} Karten gingen zurück ins Ablagefach.",
  "Azalan sıralı. Artana çevirmek için tıklayın":
    "Absteigend sortiert. Klicken für aufsteigend",
  "Artan sıralı. Azalana çevirmek için tıklayın":
    "Aufsteigend sortiert. Klicken für absteigend",
  "Sürükleyerek ya da ok tuşlarıyla sırala":
    "Zum Umsortieren ziehen oder Pfeiltasten benutzen",
  "Çözülmesi gereken satırlar": "Zu lösende Zeilen",
  "Danışman ({n})": "Berater ({n})",
  "Not yok": "Keine Hinweise",
  "Veri girişinde gözden kaçmış olabilecek noktalar":
    "Punkte, die bei der Dateneingabe übersehen worden sein könnten",
  "Öğretmen yükleri": "Lehrerdeputate",
  "Sınıf yükleri": "Klassendeputate",
  "Derslik yükleri": "Raumbelegung",
  "Kapalı saatte ders, kural ihlali ya da yerleşemeyen ders yok.":
    "Keine Stunden auf gesperrten Zeiten, keine Regelverstöße, nichts Unplatzierbares.",

  // ------------------------------------------------------- 2026-08-30
  //
  // The tray's order and filter, the pin ON a card, the timetable library
  // behind one button, and an entity sheet that edits. Written by hand, the
  // way every entry here is: `i18n.test.ts` can tell us a key is DEAD, never
  // that one is missing - an untranslated sentence falls back to correct
  // Turkish and says nothing (pitfall 87).
  " {n} kart geçici kapsam dışında kaldı.":
    " {n} {n:Karte blieb|Karten blieben} außerhalb.",
  " · {n} kart geçici kapsam dışında": " · {n} {n:Karte|Karten} außerhalb",
  "{gun} geçici olarak kapsam dışında": "{gun} ist vorübergehend außerhalb",
  "Seçenek seç ve yönet": "Variante wählen und verwalten",
  Seçenek: "Variante",
  "Bu seçeneğin kopyası": "Kopie dieser Variante",
  "Boş seçenek": "Leere Variante",
  "Yeniden adlandır": "Umbenennen",
  "Seçeneği sil": "Variante löschen",
  "Seçenek adı": "Name der Variante",
  "Bu planın verilerini kullanan seçenek için bir ad yazın.":
    "Benennen Sie die Variante, die die Daten dieses Plans nutzt.",
  "Seçenek adı boş olamaz": "Die Variante braucht einen Namen",
  "Bu seçenek adı zaten kullanılıyor": "Dieser Name ist bereits vergeben",
  Kaydet: "Speichern",
  "Öğretmeni düzenle": "Lehrkraft bearbeiten",
  "Sınıfı düzenle": "Klasse bearbeiten",
  "Toplu sabitle": "Mehrere anheften",
  "Satırı sabitle / kaldır": "Zeile anheften / lösen",
  "Sütunu sabitle / kaldır": "Spalte anheften / lösen",
  "Günü sabitle / kaldır": "Tag anheften / lösen",
  "Geçici görünüm": "Vorübergehend ausblenden",
  "Geçici görünüm ({n})": "Ausgeblendet ({n})",
  "Satırı soluklaştır": "Zeile abblenden",
  "Satırı geri yükle": "Zeile zurückholen",
  "Satırı gizle": "Zeile ausblenden",
  "Günü soluklaştır": "Tag abblenden",
  "Günü geri yükle": "Tag zurückholen",
  "Günü gizle": "Tag ausblenden",
  "Tümünü geri yükle": "Alle zurückholen",
  soluk: "abgeblendet",
  gizli: "ausgeblendet",
  İşlemler: "Aktionen",
  "Izgara işlemleri": "Aktionen für das Raster",
  "Tüm programı sabitle": "Ganzen Stundenplan anheften",
  "Tüm sabitlemeleri kaldır": "Alle Anheftungen lösen",
  "{n} saat sabitlendi.": "{n} {n:Stunde|Stunden} angeheftet.",
  "{n} saatin sabitlemesi kaldırıldı.":
    "Anheftung von {n} {n:Stunde|Stunden} gelöst.",
  "{sinif} sınıfının {gun} {saat} saatindeki ders sabitlenmiş":
    "Die Stunde von {sinif} am {gun}, {saat}. Stunde, ist angeheftet",
  "{ust} {alt}: buraya sabitle": "{ust} {alt}: hier anheften",
  "{ust} {alt}: sabitlemeyi kaldır": "{ust} {alt}: Anheftung lösen",
  "Sabitlenmiş. Kaldırmak için tıklayın": "Angeheftet. Zum Lösen klicken",
  "Ders {ad} sınıfına taşınsın mı?": "Die Stunde zu {ad} verschieben?",
  Taşı: "Verschieben",
  "Yerleşmiş saatler olduğu gibi taşınır. Ctrl+Z ile geri alınabilir.":
    "Die belegten Stunden ziehen mit. Ctrl+Z macht es rückgängig.",
  "{n} kart havuza döner, {s} sabitleme kalkar. Ctrl+Z ile geri alınabilir.":
    "{n} {n:Karte geht|Karten gehen} zurück ins Ablagefach, {s} {s:Anheftung wird|Anheftungen werden} gelöst. Ctrl+Z macht es rückgängig.",
  "Ders {ad} sınıfına taşındı.": "Die Stunde ist zu {ad} gewechselt.",
  "Ders {ad} sınıfına taşındı. {n} kart havuza döndü.":
    "Die Stunde ist zu {ad} gewechselt. {n} {n:Karte ging|Karten gingen} zurück ins Ablagefach.",
  "Ders {kim} öğretmenine geçsin mi?": "Die Stunde an {kim} übergeben?",
  "Yerleşmiş saatler olduğu gibi kalır. Ctrl+Z ile geri alınabilir.":
    "Die belegten Stunden bleiben, wo sie sind. Ctrl+Z macht es rückgängig.",
  "{n} kart havuza döner. Ctrl+Z ile geri alınabilir.":
    "{n} {n:Karte geht|Karten gehen} zurück ins Ablagefach. Ctrl+Z macht es rückgängig.",
  "Ders {kim} öğretmenine geçti.": "Die Stunde ist an {kim} gegangen.",
  "Ders {kim} öğretmenine geçti. {n} kart havuza döndü.":
    "Die Stunde ist an {kim} gegangen. {n} {n:Karte ging|Karten gingen} zurück ins Ablagefach.",
  "**Dersler** sekmesinde ders silinebilir, yeni ders eklenebilir.":
    "Im Tab **Fächer** lassen sich Stunden löschen und neue anlegen.",
  "Art arda en fazla": "Höchstens am Stück",
  "Geldiği gün en az": "Mindestens an Anwesenheitstagen",
  "Günde aynı dersten en fazla": "Gleiches Fach pro Tag höchstens",
  "Havuz sıralaması": "Reihenfolge im Ablagefach",
  "Havuz süzgeci": "Filter im Ablagefach",
  "Izgara sırası": "Wie im Raster",
  "Uzun kartlar önce": "Lange Karten zuerst",
  "En çok kalan": "Am meisten offen",
  "{n} saatlik kartlar": "Karten zu {n} Stunden",
  "{n} saat kaldı": "noch {n} {n:Stunde|Stunden}",
  "{n} kart süzgeç dışında · sürükleyip bırakın":
    "{n} weitere {n:Karte|Karten} hinter dem Filter · ziehen und ablegen",
  Göster: "Anzeigen",
  Saatler: "Uhrzeiten",
  Satır: "Zeile",
  "Saat numaralarının altına başlangıç saatlerini yaz":
    "Anfangszeit unter jeder Stundennummer anzeigen",
  "Haftanın darlığı tablosunu göster ya da gizle":
    "Tabelle der engsten Stunden ein- oder ausblenden",
  "Koyu bir sütun, o saatte **kaç {ne} kapalı** olduğunu söyler: dizerken genellikle orada tıkanılır.":
    "Eine dunkle Spalte zeigt, **wie viele {ne} geschlossen** sind: dort bleibt die Suche meist hängen.",

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
  "**Ferah.** Hücre en büyük; en kolay okunan, en çok kaydırılan.":
    "**Weit.** Die größte Zelle: am besten lesbar, am meisten Scrollen.",
  "**Rahat.** Hücre geniş ve saatler yazılı; program sığmadığı için sağa kaydırırsınız.":
    "**Bequem.** Breite Zellen mit Uhrzeiten; der Stundenplan passt nicht, also scrollen Sie.",
  "**Sığdır.** Programın tamamı bir ekranda, ve bunun bedeli **saatlerin gizlenmesi**.":
    "**Passend.** Der ganze Stundenplan auf einem Bildschirm; der Preis: **Uhrzeiten entfallen**.",
  "**Sığdır.** Satır aralığı daralır; kısılan şey boşluk, **yazı boyutu değil**.":
    "**Passend.** Zeilen rücken zusammen; gekürzt wird Abstand, **nicht die Schriftgröße**.",
  "**Tarayıcınız klasöre yazmayı desteklemiyor.** Chrome ve Edge destekliyor.":
    "**Ihr Browser kann nicht in einen Ordner schreiben.** Chrome und Edge können es.",
  "**Uyarı** yalnız sayar, **Engel** kartı o hücreye hiç bıraktırmaz.":
    "**Warnung** zählt nur; **Sperre** lässt die Karte dort gar nicht ablegen.",
  "**Yük**, **Açık**'ı geçerse o sınıfın programı tutmaz.":
    "Übersteigt **Last** den Wert **Offen**, geht der Stundenplan dieser Klasse nicht auf.",
  "Arayüzün dili. Bu bilgisayara aittir, plan dosyasına girmez.":
    "Die Sprache der Oberfläche. Sie gehört zu diesem Rechner, nicht zur Plandatei.",
  "Aynı dersliği paylaşan sınıfların **toplam** ders saati de haftaya sığmalı.":
    "Auch die **Gesamtstunden** von Klassen mit gemeinsamem Raum müssen in die Woche passen.",
  "Aynı programı paylaşan öğrenci grubu; **derslik** sınıfın sabit dersliğidir.":
    "Eine Schülergruppe mit gemeinsamem Stundenplan; der **Raum** ist ihr fester Raum.",
  "Aşağıdakiler **kendi öğretmenleriniz**: bir ad sığmıyorsa ölçek fazla büyük demektir.":
    "Das sind **Ihre eigenen Lehrkräfte**: Passt ein Name nicht, ist die Größe zu groß.",
  "Basılan sayfada saatler her üç durumda da yazar.":
    "Auf dem gedruckten Blatt stehen die Uhrzeiten in allen drei Fällen.",
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
  "Bir öğretmen iki branş veriyorsa + İkinci branş ile ikincisi de yazılır; o zaman her dersinde hangi branştan olduğu ayrıca seçilir. Renk otomatik atanır, kimseyle çakışmaz. Sağdaki üç kutu bu öğretmene özel sınırdır; boş bırakılırsa Ayarlar → Kurallar’daki sayı geçerli olur.":
    "Unterrichtet eine Lehrkraft zwei Fächer, wird das zweite mit + Zweites Fach eingetragen; bei jeder Stunde wird dann zusätzlich gewählt, welches der beiden gilt. Die Farbe wird automatisch vergeben und kollidiert mit keiner anderen. Die drei Felder rechts sind die eigenen Grenzen dieser Lehrkraft; bleiben sie leer, gilt der Wert aus Einstellungen → Regeln.",
  "Bir şey belirirken görülen kısa hareketler; kapatmak Mozaik'in işini değiştirmez.":
    "Die kurzen Bewegungen beim Erscheinen; das Abschalten ändert sonst nichts.",
  "Branş **listeden seçilir**; kısa ad ızgarada satır başlığı olur.":
    "Das Fach wird **aus der Liste gewählt**; der Kurzname steht am Zeilenkopf.",
  "Bu bilgisayara aittir ve **yazdırmayı etkilemez**; kâğıdın yazısı **Çıktı** sekmesinde.":
    "Gehört zu diesem Rechner und **ändert den Druck nicht**; Papierschrift unter **Ausgabe**.",
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
  "Dağılım, o saatlerin haftaya nasıl bölüneceğidir: 2+1 demek bir gün iki saat üst üste, başka bir gün tek saat. Bir blok 2 ya da 3 saat olabilir; kalanlar tektir. Günde ↑ bu dersin bir gündeki en fazla saatidir; boşsa Ayarlar → Kurallar’daki sayı geçerli olur.":
    "Die Aufteilung sagt, wie sich die Stunden über die Woche verteilen: 2+1 heißt zwei Stunden am Stück an einem Tag und eine einzelne an einem anderen. Ein Block kann 2 oder 3 Stunden umfassen; der Rest sind Einzelstunden. Pro Tag ↑ ist das Höchstmaß an einem Tag; bleibt es leer, gilt der Wert aus Einstellungen → Regeln.",
  "Ders yapılan günleri işaretleyin; yanındaki kutu **öğle arasının** yerini söyler.":
    "Haken Sie die Unterrichtstage an; das Feld daneben nennt die **Mittagspause**.",
  "Derslik dizerken seçilmez ve aynı dersliği paylaşan iki sınıf aynı saate konamaz. Renk otomatik atanır, kimseyle çakışmaz; satır başındaki nokta ile basılan sayfanın başlığında görünür.":
    "Der Raum wird beim Setzen nicht gewählt, und zwei Klassen mit demselben Raum können nicht zur selben Stunde. Die Farbe wird automatisch vergeben, kollidiert mit keiner anderen und erscheint als Punkt am Zeilenkopf sowie im Titel des gedruckten Blatts.",
  "Dersliği olmayan sınıflar için bu kontrol yapılmaz.":
    "Für Klassen ohne Raum entfällt diese Prüfung.",
  "Ekranın **geri kalanı**: listeler, paneller, kutular. Program ızgarasına dokunmaz.":
    "Der **Rest** des Bildschirms: Listen, Panels, Felder. Das Raster bleibt unberührt.",
  "Gün kaçta başlıyor, bir saat ve teneffüs kaç dakika. Zil saatleri bunlardan hesaplanır.":
    "Wann der Tag beginnt und wie viele Minuten eine Stunde und eine Pause dauern. Die Klingelzeiten werden daraus berechnet.",
  "Hazır bir okul: 25 öğretmen, 20 sınıf, 99 ders. **Açık olan planın yerine geçer.**":
    "Eine fertige Schule: 25 Lehrkräfte, 20 Klassen, 99 Stunden. **Ersetzt den offenen Plan.**",
  "Her planın **verisi ayrıdır**; üst çubuktaki listeden aralarında geçilir.":
    "Jeder Plan **hat eigene Daten**; die Liste oben wechselt zwischen ihnen.",
  "Her sınıf okul sayısını kullanıyor. Bir sınıfa özel sayı: **Okul → Sınıflar**.":
    "Jede Klasse nutzt den Schulwert. Für eine einzelne: **Schule → Klassen**.",
  "Her sınıfın sabit dersliği; aynı dersliği paylaşan iki sınıf aynı saate konamaz.":
    "Der feste Raum jeder Klasse; zwei Klassen mit demselben Raum können nicht gleichzeitig.",
  "Herkes okul sınırlarını kullanıyor. Bir öğretmene özel sayı: **Okul → Öğretmenler**.":
    "Alle nutzen die Schulgrenzen. Für eine Lehrkraft: **Schule → Lehrkräfte**.",
  "Kapalı saatler taralı; değiştirmek için **Müsaitlik** sekmesine gidin.":
    "Gesperrte Stunden sind schraffiert; ändern unter **Verfügbarkeit**.",
  "Okulun listesinde **bulunmayan** hazır branşlar; eklemek için tıklayın.":
    "Mitgelieferte Fächer, die **nicht** auf der Schulliste stehen; zum Hinzufügen klicken.",
  "Mozaik **kendiliğinden** saklıyor; **Dosyaya kaydet** onun yanına gelir, yerine değil.":
    "Mozaik speichert **von selbst**; **In Datei speichern** kommt daneben, nicht dafür.",
  "Program, **Ayarlar → Kurallar**'da girdiğiniz sınırları aşıyor.":
    "Der Stundenplan überschreitet die Grenzen aus **Einstellungen → Regeln**.",
  "Renk kimliktir: ızgaradaki satırı havuzdaki kartıyla eşleştiren şey budur.":
    "Farbe ist Identität: Sie verbindet die Zeile im Raster mit ihrer Karte im Fach.",
  "Sekmelerin altındaki araç şeridi, sayfayı **aşağı kaydırırken kendiliğinden gizlenir**.":
    "Die Werkzeugleiste unter den Reitern **blendet sich beim Herunterscrollen aus**.",
  "Silmelerden sonra renkler delik bıraktı; yeniden dağıtmak yalnızca onları sıraya dizer.":
    "Löschungen haben Lücken in den Farben hinterlassen; Neuverteilen ordnet sie nur.",
  "Soldaki saatten ve üç süreden hesaplanır; her öğle arası deseni kendi sütununda.":
    "Aus Startzeit und drei Dauern berechnet; jedes Pausenmuster hat eine eigene Spalte.",
  "Son üç açılıştaki durum otomatik yedek olarak ayrı tutulur; **bu bilgisayara** ve açılıştaki plana aittir.":
    "Der Stand der letzten drei Starts wird als automatische Sicherung getrennt aufbewahrt; er gehört zu **diesem Computer** und zum Plan, der beim Start offen war.",
  "Sınıf başına **{yer}** saat var ({gun} gün × {ders} saat); girilen yük **{yuk}** saat.":
    "**{yer}** Stunden je Klasse ({gun} Tage × {ders} Stunden); eingetragene Last: **{yuk}**.",
  "Tarayıcının bu site için ayırdığı depoda duruyor.":
    "Es liegt in dem Speicher, den der Browser für diese Seite hält.",
  "Toplam **{yer}**; tarayıcının Mozaik'e ayırdığı yer yaklaşık **5 MB**.":
    "Insgesamt **{yer}**; der Browser gibt Mozaik etwa **5 MB**.",
  "Yalnız **Program** ızgarasını etkiler: hücrenin büyüklüğü ve ekrana sığan gün sayısı.":
    "Betrifft nur das Raster in **Stundenplan**: Zellengröße und sichtbare Tage.",
  "Yeni plan açılınca ona geçilir ve **geri al** geçmişi sıfırlanır.":
    "Ein neuer Plan wird sofort geöffnet und der **Rückgängig**-Verlauf geleert.",
  "Yeni sürüm çıkınca üstte bir satır belirir; **Yenile** demedikçe hiçbir şey değişmez.":
    "Bei einer neuen Version erscheint oben eine Zeile; ohne **Neu laden** ändert sich nichts.",
  "Yukarıdakiler **localStorage**'da; seçtiğiniz klasörün tutamağı ayrıca **IndexedDB**'de.":
    "Obiges liegt im **localStorage**; der gewählte Ordner-Handle in **IndexedDB**.",
  "{ad} temaya geç": "Zum Design {ad} wechseln",
  "{dosya} **bütün planlarınızdır**; yanındakiler onun gün gün duran hâlleri.":
    "{dosya} sind **alle Ihre Pläne**; die Dateien daneben sind die Tageskopien.",
  "{n} gün": "{n} {n:Tag|Tage}",
  "{n} kapalı": "{n} aus",
  "Öğretmen eklerken branş **bu listeden** seçilir, elle yazılmaz.":
    "Beim Anlegen einer Lehrkraft wird das Fach **aus dieser Liste** gewählt, nie getippt.",
  "Öğretmenin müsait saati, ona yüklenen ders saatinden az olamaz.":
    "Die offenen Stunden einer Lehrkraft dürfen nicht unter ihrer Last liegen.",
  "Üst çubuktaki **Dosyaya kaydet** açık planı yazar; buradaki dosya **bütün planları**.":
    "**In Datei speichern** oben schreibt den offenen Plan; diese Datei **alle Pläne**.",
  "İçindekiler: her planın derslikleri, öğretmenleri, sınıfları, dersleri, dizilmiş programı, adı ve taslak işareti. Tema gibi bu bilgisayara ait tercihler ve otomatik yedekler girmez.":
    "Inhalt: Räume, Lehrkräfte, Klassen, Fächer, gelegter Stundenplan, Name und Entwurfsmarke jedes Plans. Einstellungen dieses Rechners wie das Design und die automatischen Sicherungen sind nicht dabei.",
  "İşareti kaldırılan şey kâğıda basılmaz.":
    "Was abgewählt ist, kommt nicht aufs Papier.",
  "E-posta":
    "E-Mail",
  "{kim} e-postası":
    "E-Mail von {kim}",
  "Tek bir e-posta adresi yazılır: ad@ornek.com":
    "Hier steht genau eine E-Mail-Adresse: name@beispiel.de",
  "E-postayla gönder":
    "Per E-Mail senden",
  "Öğretmenin programı e-posta uygulamanızda yeni bir ileti olarak açılır. Gönder’e siz basarsınız.":
    "Der Stundenplan der Lehrkraft öffnet sich als neue Nachricht in Ihrer E-Mail-App. Auf Senden drücken Sie selbst.",
  "adres yok":
    "keine Adresse",
  "adres hatalı":
    "Adresse fehlerhaft",
  "programı boş":
    "Stundenplan ist leer",
  "e-postaya sığmıyor":
    "zu lang für eine E-Mail",
  "{kim} için e-postayı aç":
    "E-Mail an {kim} öffnen",
  "E-postada aç":
    "In E-Mail öffnen",
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
  "Ders silindi.": "Fach gelöscht.",
  "{ne} silindi.": "{ne} gelöscht.",
  "{ne} silindi, yerleşmiş {n} saati de kalktı.": "{ne} gelöscht, mit {n} gesetzten {n:Stunde|Stunden}.",
  "Dizilmiş {n} saat havuza döndü.": "{n} gesetzte {n:Stunde ist|Stunden sind} zurück im Vorrat.",
  "Dizilmiş saatler havuza döndü, sabitlenen {n} saat yerinde.": "Die gesetzten Stunden sind zurück im Vorrat; {n} fixierte {n:Stunde bleibt|Stunden bleiben}.",
  "{ilk}–{son}, günde {saat} ders":
    "{ilk}–{son}, {saat} {saat:Stunde|Stunden} am Tag",
  "Okul adı ve saatler":
    "Schulname und Stunden",
  "Okul adı boş. Şu an: {hafta}. Doğru değilse değiştirin.":
    "Noch kein Schulname. Derzeit: {hafta}. Ändern Sie es, wenn das nicht stimmt.",
  "Okul adını ve zili gir":
    "Schulname und Klingel eingeben",
  "Derslik ekle":
    "Räume hinzufügen",
  "{n} branş":
    "{n} {n:Fach|Fächer}",
  "Branş ekle":
    "Fächer hinzufügen",
  "Öğretmen ekle":
    "Lehrkräfte hinzufügen",
  "Sınıf ekle":
    "Klassen hinzufügen",
  "Ders gir":
    "Fächer eingeben",
  "{n} kapalı saat":
    "{n} gesperrte {n:Stunde|Stunden}",
  "Gelemeyen öğretmenin saatlerini kapatın. Herkes her saat gelebiliyorsa geçin.":
    "Sperren Sie die Stunden, in denen eine Lehrkraft nicht kommen kann. Können alle jederzeit kommen, überspringen Sie das.",
  "Kapalı saat işaretle":
    "Gesperrte Stunden markieren",
  "{yer} / {toplam} saat yerleşmiş":
    "{yer} / {toplam} Stunden gelegt",
  "Programı diz":
    "Stundenplan legen",
  "Bu bilgisayarda bir kez yazdırıldı":
    "Auf diesem Computer einmal gedruckt",
  "Sınıflara ve öğretmenlere birer sayfa":
    "Eine Seite je Klasse und Lehrkraft",
  "Çıktıya geç":
    "Zum Druck",
  "Liste bir daha çıkmaz. Her adım kendi sekmesinde durmaya devam eder.":
    "Die Liste erscheint nicht wieder. Jeder Schritt bleibt in seinem Reiter.",
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
  "Güncellemeye bak":
    "Zur Aktualisierung",
  "Dosyada öğretmen, sınıf, ders ya da derslik listesi yok; kesilmiş ya da elle düzenlenmiş olabilir. 'Dosyaya kaydet' ile kaydettiğiniz dosyayı seçin.":
    "Der Datei fehlt die Liste der Lehrkräfte, Klassen, Fächer oder Räume; sie wurde vielleicht gekürzt oder von Hand bearbeitet. Wählen Sie die Datei, die Sie mit „In Datei speichern“ gespeichert haben.",
  "Bu, Mozaik'in kaydettiği bir dosya değil. 'Dosyaya kaydet' ile kaydettiğiniz dosyayı seçin.":
    "Das ist keine von Mozaik gespeicherte Datei. Wählen Sie die Datei, die Sie mit „In Datei speichern“ gespeichert haben.",
  "Excel'deki bir listeyi almak için Okul'daki listelerde Excel'den yapıştır düğmesini kullanın.":
    "Um eine Liste aus Excel zu übernehmen, nutzen Sie in den Listen unter Schule die Schaltfläche „Aus Excel einfügen“.",
  "**Mozaik başka bir pencerede de açık ve plan orada değiştirildi.** Bu penceredeki son değişiklikler kaydedilmedi. **Yenile**'ye basın.":
    "**Mozaik ist auch in einem anderen Fenster offen, und der Plan wurde dort geändert.** Die letzten Änderungen in diesem Fenster wurden nicht gespeichert. Drücken Sie **Neu laden**.",
  "**Kayıtlı plan açılışta okunamadı.** Üzerine yazılmadı. **Yenile**'ye basın; plan yine gelmezse kaydettiğiniz plan dosyasını **Dosyadan aç** ile açın.":
    "**Der gespeicherte Plan konnte beim Start nicht gelesen werden.** Er wurde nicht überschrieben. Drücken Sie **Neu laden**; kommt der Plan nicht zurück, öffnen Sie Ihre gespeicherte Plandatei mit **Aus Datei öffnen**.",
  "**Kayıtlı plan daha yeni bir sürümle yazılmış.** Bu sürüm onu açamıyor ve üzerine yazmıyor; burada yapılanlar kaydedilmez. Mozaik'i güncelleyin.":
    "**Der gespeicherte Plan wurde von einer neueren Version geschrieben.** Diese Version kann ihn nicht öffnen und überschreibt ihn nicht; was Sie hier tun, wird nicht gespeichert. Aktualisieren Sie Mozaik.",
  "Bu taslağın içi boş. Silip yeniden oluşturabilirsiniz.":
    "Dieser Entwurf ist leer. Sie können ihn löschen und neu anlegen.",
  "{ad}: {yuk} saat ders, {acik} açık saat. {fazla} saat haftaya sığmaz.":
    "{ad}: {yuk} Unterrichtsstunden, {acik} freie Stunden. {fazla} {fazla:Stunde passt|Stunden passen} nicht in die Woche.",
  "{ad}: {yuk} saat ders, {acik} müsait saat. {fazla} saat haftaya sığmaz.":
    "{ad}: {yuk} Unterrichtsstunden, {acik} verfügbare Stunden. {fazla} {fazla:Stunde passt|Stunden passen} nicht in die Woche.",
  "{yuk} saat ders, {acik} açık saat. {fazla} saat haftaya sığmaz.":
    "{yuk} Unterrichtsstunden, {acik} freie Stunden. {fazla} {fazla:Stunde passt|Stunden passen} nicht in die Woche.",
  "{yuk} saat ders, {acik} müsait saat. {fazla} saat haftaya sığmaz.":
    "{yuk} Unterrichtsstunden, {acik} verfügbare Stunden. {fazla} {fazla:Stunde passt|Stunden passen} nicht in die Woche.",
  "Bir dersin saatini azaltın ya da Müsaitlik sekmesinde kapalı saat açın.":
    "Verringern Sie die Stunden eines Fachs oder öffnen Sie gesperrte Stunden im Reiter Verfügbarkeit.",
  "Önce bir branş seçin.":
    "Wählen Sie zuerst ein Fach.",
  "Şu an **{gun} gün × {saat} saat** = haftada {yer} saat.":
    "Derzeit **{gun} Tage × {saat} Stunden** = {yer} Stunden pro Woche.",
  "Sağdaki sayılar: açık saat / ders saati.":
    "Die Zahlen rechts: freie Stunden / Unterrichtsstunden.",
  "{acik} açık saat, {yuk} saat ders":
    "{acik} freie Stunden, {yuk} Unterrichtsstunden",
  "Bütün haftayı aç":
    "Ganze Woche öffnen",
  "Bütün haftayı kapat":
    "Ganze Woche sperren",
  "**Art arda**: üst üste en çok kaç saat. **Günde ↑**: günde en çok, **Günde ↓**: geldiği gün en az. Boşsa Kurallar’daki sayı geçerli.":
    "**Am Stück**: höchstens so viele Stunden hintereinander. **Pro Tag ↑**: höchstens, **Pro Tag ↓**: mindestens pro Tag. Leer heißt: die Zahl aus Regeln.",
  "Renkler kâğıtta çıkmazsa: yazdırma penceresinde **Diğer ayarlar**’ı açın ve **Arka plan grafikleri** kutusunu işaretleyin.":
    "Wenn die Farben nicht gedruckt werden: Öffnen Sie im Druckfenster **Weitere Einstellungen** und aktivieren Sie **Hintergrundgrafiken**.",
  "Haftanın tamamı sığmıyor; şeritteki Sığdır bütün günleri gösterir.":
    "Die ganze Woche passt nicht; Einpassen in der Leiste zeigt alle Tage.",
  "Otomatik diz ({n} kart)":
    "Automatisch legen ({n} {n:Karte|Karten})",

  // Keyboard on the Program and Müsaitlik grids (erisim/klavye-izgara, 2026-11-15)
  "Haftalık dersler": "Wochenstunden",
  "{gun} {n}. saat": "{gun}, {n}. Stunde",
  "açılan öğretmen saatinde": "in einer freigegebenen Lehrerstunde",
  "yeri değişiyor": "wird verschoben",
  "müsait değil": "nicht verfügbar",
  "müsait": "verfügbar",
  "kapalı": "gesperrt",
  "açık": "offen",
  "boş": "leer",
  "Bu dersin satırı ekranda değil.": "Die Zeile dieser Stunde ist nicht sichtbar.",
  "{ders} havuza kaldırıldı.": "{ders} ist zurück in der Ablage.",
  "{ders} alındı. Hedef hücreyi oklarla seçin, Enter bırakır, Esc vazgeçer.": "{ders} aufgenommen. Zielzelle mit den Pfeiltasten wählen; Enter legt ab, Esc bricht ab.",
  "Taşımadan vazgeçildi.": "Verschieben abgebrochen.",
  "{ders} yerleşti: {yer}.": "{ders} gesetzt: {yer}.",
  "{acik} saat müsait, {yuk} saat ders yüklenmiş": "{acik} {acik:Stunde|Stunden} verfügbar, {yuk} {yuk:Stunde|Stunden} Unterricht geplant",
  "{acik} saat açık, {yuk} saat ders yüklenmiş": "{acik} {acik:Stunde|Stunden} offen, {yuk} {yuk:Stunde|Stunden} Unterricht geplant",
  "Izgaraya gir, bir daha basınca çık": "In das Raster wechseln, erneut drücken zum Verlassen",
  "Hücreden hücreye git": "Von Zelle zu Zelle gehen",
  "Satırın başına veya sonuna git, Ctrl ile ilk veya son satıra": "An Anfang oder Ende der Zeile; mit Strg zur ersten oder letzten Zeile",
  "Odaklı kartı taşımak için al": "Fokussierte Stunde zum Verschieben aufnehmen",
  "Odaklı kartı sabitle veya sabitlemeyi kaldır": "Fokussierte Stunde anheften oder lösen",
  "Kartlar arasında git": "Zwischen Karten wechseln",
  "Odaklı kartı ızgaraya koymak için al": "Fokussierte Karte aufnehmen, um sie ins Raster zu setzen",
  "Tutamakta: havuzun boyunu değiştir, Shift ile daha çok": "Am Griff: Ablage vergrößern oder verkleinern; mit Umschalt in größeren Schritten",
  "Kart eldeyken": "Beim Verschieben",
  "Hedefi bir saat kaydır": "Ziel um eine Stunde verschieben",
  "Bırakılabilecek bir sonraki saate git": "Zur nächsten möglichen Stunde springen",
  "Önceki veya sonraki güne git": "Zum vorigen oder nächsten Tag",
  "Buraya bırak": "Hier ablegen",
  "Vazgeç, sürüklerken de": "Abbrechen, auch beim Ziehen",
  "Saati aç veya kapat, başlıkta bütün günü veya saati": "Stunde öffnen oder sperren; auf einer Überschrift den ganzen Tag oder die Stunde",
  "Müsaitlik'te aç":
    "In Verfügbarkeit öffnen",
  "Kart ızgarada görünmüyor; satırı gizli olabilir.":
    "Die Karte ist nicht im Raster; ihre Zeile ist vielleicht ausgeblendet.",
  "Kart havuzda görünmüyor; havuz kapalı olabilir.":
    "Die Karte ist im Ablagefach nicht zu sehen; es ist vielleicht geschlossen.",
  "{kim} için Müsaitlik'i açar":
    "Öffnet die Verfügbarkeit für {kim}",
  "**{ders} dersin {saat} saati kapalı saatte kaldı.** Aşağıdaki **Göster** kartı bulur.":
    "**{ders} {ders:Fach liegt|Fächer liegen} mit {saat} {saat:Stunde|Stunden} auf einer gesperrten Zeit.** **Anzeigen** unten findet die Karte.",
  "Saatler ders konduktan **sonra** kapatıldı, hiçbir ders silinmedi. Kartı açık bir saate sürükleyin ya da saati Müsaitlik'te açın.":
    "Die Zeiten wurden **nach** dem Setzen gesperrt; nichts wurde gelöscht. Ziehen Sie die Karte in eine offene Stunde oder öffnen Sie die Stunde in Verfügbarkeit.",
  "Bu derslere konacak hücre kalmamış. Ders adı kartı havuzda gösterir; yer açmak için Müsaitlik'te saat açın ya da bir kartı taşıyın.":
    "Für diese Fächer ist keine Zelle mehr frei. Der Name zeigt die Karte im Ablagefach; für Platz öffnen Sie Stunden in Verfügbarkeit oder verschieben eine Karte.",
  "Sebep ve dersler":
    "Grund und Fächer",
  "{sinif} sınıfının açık saatlerinin hepsi başka derslerle dolu.":
    "Alle offenen Stunden der Klasse {sinif} sind mit anderen Fächern belegt.",
  "{kim} {n} saatinde müsait değil":
    "{kim} ist in {n} davon nicht verfügbar",
  "{n} saatinde {kim} başka sınıfta":
    "in {n} ist {kim} in einer anderen Klasse",
  "{n} saatinde {derslik} dersliği dolu":
    "in {n} ist Raum {derslik} belegt",
  "{n} saatinde bir kural izin vermiyor":
    "in {n} lässt eine Regel es nicht zu",
  "{sinif} sınıfının {n} boş saati var ama bu dersin kartı onlara sığmıyor.":
    "Die Klasse {sinif} hat {n} freie {n:Stunde|Stunden}, aber die Karte dieses Fachs passt nicht hinein.",
  "{sinif} sınıfının {n} boş saati var: {neden}.":
    "Die Klasse {sinif} hat {n} freie {n:Stunde|Stunden}: {neden}.",
  "{zaman} saatlerinde":
    "in den Stunden {zaman}",
  "{n} saatine {boy} saatlik kart sığmıyor":
    "{n} {n:fasst|fassen} die {boy}-stündige Karte nicht",
  "{n} sorun":
    "{n} {n:Problem|Probleme}",
  "{brans} dersi de gitti.": "Das Fach {brans} ist mit ihr entfallen.",
  "{brans} dersleri de gitti.": "Die Fächer {brans} sind mit ihr entfallen.",
  "{sinif} sınıfının {brans} dersi de gitti.":
    "Die Klasse {sinif} hat ihr Fach {brans} verloren.",
  "{n} sınıfın {brans} dersi de gitti: {siniflar}.":
    "{n} {n:Klasse hat|Klassen haben} das Fach {brans} verloren: {siniflar}.",
  "Programdan {n} saat kalktı.":
    "{n} gesetzte {n:Stunde wurde|Stunden wurden} aus dem Stundenplan entfernt.",
  "{ad} kısa adı": "Kurzname von {ad}",
  "Yeni sınıfın dersliği": "Raum der neuen Klasse",
  "İçeriğe geç": "Zum Inhalt springen",
  "Ders günü": "Unterrichtstag",
  "Geri alındı.": "Rückgängig gemacht.",
  "Geri alındı: {ne}": "Rückgängig gemacht: {ne}",
  "Geri almak için Ctrl+Z.": "Mit Strg+Z rückgängig machen.",
  "Arada başka bir değişiklik oldu. Ctrl+Z ile adım adım geri alın.": "Dazwischen wurde etwas anderes geändert. Mit Strg+Z Schritt für Schritt rückgängig machen.",
  "Öğretmenler, sınıflar, dersler ve dizilmiş program. Bu plan bomboş kalacak. Hemen ardından \"Geri al\" ile geri gelir.": "Lehrkräfte, Klassen, Fächer und der gelegte Stundenplan. Dieser Plan bleibt völlig leer. „Rückgängig“ gleich danach holt alles zurück.",
  "Bu plandaki her şey silindi.": "Alles in diesem Plan wurde gelöscht.",
  "**Açık olan plan** tamamen silinir; hemen ardından **Geri al** ile geri gelir.": "**Der offene Plan** wird gelöscht; **Rückgängig** gleich danach holt ihn zurück.",
  "{kayip} Yerine 25 öğretmen, 20 sınıf, 8 derslik ve 99 ders olan örnek bir okul gelir. Diğer planlara dokunulmaz. Hemen ardından \"Geri al\" ile geri gelir.": "{kayip} An ihre Stelle tritt eine Beispielschule mit 25 Lehrkräften, 20 Klassen, 8 Räumen und 99 Fächern. Die anderen Pläne bleiben unberührt. „Rückgängig“ gleich danach holt Ihre Daten zurück.",
  "Derslik silindi.": "Raum gelöscht.",
  "{ad} dersliği silindi.": "Raum {ad} gelöscht.",
  "{ad} dersliği silindi, {sinif} sınıfının dersliği boşaldı.": "Raum {ad} gelöscht; Klasse {sinif} hat jetzt keinen Raum.",
  "{ad} dersliği silindi, {n} sınıfın dersliği boşaldı ({hangileri}). Bu sınıflar artık aynı saate konabilir.": "Raum {ad} gelöscht; {n} {n:Klasse hat|Klassen haben} jetzt keinen Raum ({hangileri}). Diese Klassen dürfen jetzt in dieselbe Stunde.",
  "Öğretmen silindi.": "Lehrkraft gelöscht.",
  "Sınıf silindi.": "Klasse gelöscht.",
  "\"{ad}\" branşı listeden çıkarıldı.": "„{ad}“ wurde aus der Fächerliste entfernt.",
  "{ad} seçeneği silindi.": "Variante {ad} gelöscht.",
  "{ad} seçeneği silindi, yerleşmiş {n} saati de gitti.": "Variante {ad} gelöscht, mit {n} gesetzten {n:Stunde|Stunden}.",
  "Program baştan dizildi.": "Der Stundenplan wurde von vorn gelegt.",
  "Program baştan dizildi, sabitlenen {n} saat yerinde kaldı.": "Der Stundenplan wurde von vorn gelegt; {n} fixierte {n:Stunde blieb|Stunden blieben}.",
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
  // Moving to the new address and the plan-file reminder (2026-11-16).
  "son plan dosyasının tarihi":
    "Datum der letzten Plandatei",
  "Eski adresteki planlar buraya gelsin mi?":
    "Die Pläne von der alten Adresse hierher holen?",
  "**Yeni adres planları alamadı.** Bütün planlar bir plan dosyasına yazıldı (İndirilenler). Yeni adreste Ayarlar → Planlar ve yedek → **Tümünü dosyadan aç** ile açın.":
    "**Die neue Adresse konnte die Pläne nicht übernehmen.** Alle Pläne wurden in eine Plandatei geschrieben (Downloads). Öffnen Sie sie an der neuen Adresse mit Einstellungen → Pläne und Sicherung → **Alle aus Datei öffnen**.",
  "**Planlar yeni adrese taşındı.** Bundan sonra Mozaik'i yeni adresinden açın:":
    "**Die Pläne sind an die neue Adresse umgezogen.** Öffnen Sie Mozaik von jetzt an unter der neuen Adresse:",
  "Yeni adres açıldı. Oradaki soruyu cevaplayın.":
    "Die neue Adresse wurde geöffnet. Beantworten Sie dort die Frage.",
  "**Mozaik yeni adresine taşındı.** Planlarınızı oraya götürmek için **Planları taşı** düğmesine basın; burada da kalırlar.":
    "**Mozaik ist an eine neue Adresse umgezogen.** Um Ihre Pläne dorthin mitzunehmen, drücken Sie **Pläne umziehen**; sie bleiben auch hier.",
  "Hiçbir plan taşınmadı.":
    "Kein Plan wurde umgezogen.",
  "Planları taşı":
    "Pläne umziehen",
  "**Bu planın bir plan dosyası yok.** Yaptıklarınız yalnız bu tarayıcıda duruyor.":
    "**Für diesen Plan gibt es keine Plandatei.** Was Sie getan haben, ist nur in diesem Browser.",
  "**Son plan dosyası {tarih} tarihli.** Ondan sonra yaptıklarınız yalnız bu tarayıcıda duruyor.":
    "**Die letzte Plandatei ist vom {tarih}.** Was Sie seitdem getan haben, ist nur in diesem Browser.",
  "Son plan dosyası: {tarih}.":
    "Letzte Plandatei: {tarih}.",
};

registerSozluk("de", DE);
