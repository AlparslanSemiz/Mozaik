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
  Pzt: "Mo",
  Sal: "Di",
  Çar: "Mi",
  Per: "Do",
  Cum: "Fr",
  Cmt: "Sa",
  Pzr: "So",
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
  Mat: "Mat",
  Fzk: "Phy",
  Geo: "Geo",
  Kim: "Wer",
  Biy: "Bio",
  Trk: "Tür",
  Edb: "Lit",
  Tar: "Ges",
  Coğ: "Erd",
  İng: "Eng",
  Fel: "Phi",
  Din: "Rel",
  Alm: "Deu",
  Fra: "Fra",
  Müz: "Mus",
  Res: "Kun",
  Bed: "Spo",
  Sos: "Soz",
  Fen: "Nat",
  Reh: "Ber",
  İnk: "Ref",

  // src/App.tsx
  "Dosyaya kaydet": "In Datei speichern",
  "yedek al": "Sicherung anlegen",
  "Yedek dosyaya yazıldı. İndirilenler klasörüne bakın.":
    "Sicherung in eine Datei geschrieben. Sehen Sie im Ordner „Downloads“ nach.",
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
  "Bu dosya okunamadı": "Diese Datei konnte nicht gelesen werden",
  'Tek bir planı değil, bu bilgisayardaki bütün planların yerine geçer. Ayarlar → Planlar ve yedek bölümündeki "Tümünü dosyadan aç" düğmesini kullanın.':
    "Sie ersetzt nicht einen einzelnen Plan, sondern alle Pläne auf diesem Computer. Verwenden Sie „Alle aus Datei öffnen“ unter Einstellungen → Pläne und Sicherung.",
  "Programı güncelleyin, sonra tekrar deneyin.":
    "Aktualisieren Sie das Programm und versuchen Sie es erneut.",
  "Program tarafından indirilmiş bir .json yedek dosyası seçin.":
    "Wählen Sie eine von diesem Programm heruntergeladene .json-Sicherungsdatei.",
  "Şu anki programın yerine geçecek": "Es ersetzt den aktuellen Stundenplan",
  'Ekrandaki plan dosyadakiyle değiştirilecek ve geri alma geçmişi sıfırlanacak. Vazgeçme ihtimaliniz varsa önce "Dosyaya kaydet" deyin.':
    "Der Plan auf dem Bildschirm wird durch den aus der Datei ersetzt und der Rückgängig-Verlauf geleert. Wählen Sie vorher „In Datei speichern“, falls Sie es sich anders überlegen könnten.",
  "Yedeği yükle": "Sicherung laden",
  "Yedek yüklendi.": "Sicherung geladen.",
  Bölümler: "Bereiche",
  "Programın durumu: {durum}. Ayrıntı için Kontrol.":
    "Status des Plans: {durum}. Einzelheiten unter Prüfung.",
  "{durum}. Kontrol sekmesini açar": "{durum}. Öffnet den Reiter Prüfung",
  Plan: "Plan",
  "Planlar arasında geçiş yapar. Yeni plan, ad değiştirme ve silme: Ayarlar → Planlar ve yedek":
    "Wechselt zwischen Plänen. Neuer Plan, Umbenennen und Löschen: Einstellungen → Pläne und Sicherung",
  "Geri al": "Rückgängig",
  "Geri al (Ctrl+Z)": "Rückgängig (Strg+Z)",
  "İleri al": "Wiederholen",
  "İleri al (Ctrl+Y)": "Wiederholen (Strg+Y)",
  "Programı bir .json dosyasına yazar. Program bu bilgisayarda kendiliğinden saklanıyor; dosya taşımak ve yedeklemek için.":
    "Schreibt den Stundenplan in eine .json-Datei. Das Programm speichert auf diesem Computer ohnehin selbst; die Datei dient zum Übertragen und Aufbewahren.",
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
  "Odaklı dersi havuza kaldır":
    "Fokussierte Unterrichtsstunde in den Pool zurücklegen",
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
  "**Bu bilgisayarda otomatik kayıt çalışmıyor.** Program kapanınca yaptığınız her şey kaybolur. Çalışırken sık sık **Dosyaya kaydet** düğmesine basın ve bilgisayarı kapatmadan önce mutlaka bir yedek alın.":
    "**Das automatische Speichern funktioniert auf diesem Computer nicht.** Alles geht verloren, wenn das Programm geschlossen wird. Drücken Sie beim Arbeiten häufig **In Datei speichern** und legen Sie vor dem Herunterfahren unbedingt eine Sicherung an.",
  "**Yeni sürüm hazır.** Şu an {surum} sürümünü kullanıyorsunuz; yenisi **Yenile** deyince gelir. İşiniz kaybolmaz.":
    "**Eine neue Version ist bereit.** Sie verwenden {surum}; die neue kommt, wenn Sie **Neu laden** drücken. Ihre Arbeit geht nicht verloren.",
  "**{klasor}** klasörüne yazılamıyor: tarayıcı izni sormadan devam etmiyor. İşiniz şu an yalnız bu tarayıcıda duruyor.":
    "In den Ordner **{klasor}** kann nicht geschrieben werden: Der Browser fragt erst nach einer Berechtigung. Ihre Arbeit liegt derzeit nur in diesem Browser.",
  "**{klasor}** klasörüne **yazılamıyor**. {sebep} İşiniz şu an yalnız bu tarayıcıda duruyor.":
    "In den Ordner **{klasor}** kann **nicht geschrieben** werden. {sebep} Ihre Arbeit liegt derzeit nur in diesem Browser.",

  // src/components/Availability.tsx
  "{ad} sınıfı": "Klasse {ad}",
  "{ad} dersliği": "Raum {ad}",
  "Müsait olmayan saatler": "Nicht verfügbare Stunden",
  "Önce {ne} ekleyin.": "Fügen Sie zuerst {ne} hinzu.",
  "{kim} · müsait olmayan saatler": "{kim} · nicht verfügbare Stunden",
  "Basılı tutup sürükleyerek birden çok hücre işaretleyebilirsiniz. Soldaki gün adına tıklayınca o günün tamamı, üstteki ders numarasına tıklayınca haftanın o saati değişir.":
    "Halten und ziehen Sie, um mehrere Zellen zu markieren. Ein Klick auf den Tagesnamen links schaltet den ganzen Tag um, ein Klick auf die Stundennummer oben diese Stunde in der ganzen Woche.",
  "Haftanın bu saatini değiştir": "Diese Stunde der Woche umschalten",
  "{gun}: bütün günü değiştir": "{gun}: den ganzen Tag umschalten",
  "Haftanın darlığı": "Wie eng die Woche ist",
  "{gun} {ders}. ders: {kapali} / {toplam} kapalı":
    "{gun}, {ders}. Stunde: {kapali} von {toplam} geschlossen",
  "Kimin saatleri": "Wessen Stunden",
  "Müsaitlik listesi": "Verfügbarkeitsliste",
  "Tümünü aç": "Alle öffnen",
  "Tümünü kapat": "Alle schließen",
  "{n} saat fazla, bu program dizilemez.":
    "{n} {n:Stunde|Stunden} zu viel; dieser Plan lässt sich nicht legen.",
  ", {n} tanesi {kim} üzerinde": ", {n} davon bei {kim}",
  "Müsaitlik girebilmek için **Okul** sekmesinden en az bir {ne} eklemeniz gerekiyor.":
    "Um Verfügbarkeiten einzutragen, brauchen Sie mindestens {ne} aus dem Reiter **Schule**.",
  "**{kim}**: {acik} saat açık, {yuk} saat ders yüklenmiş.":
    "**{kim}**: {acik} Stunden offen, {yuk} Stunden Unterricht zugewiesen.",
  "**Kapattığınız saatlerde yerleşmiş {n} ders var{kimde}.** Hiçbiri silinmedi. **Program** sekmesinde kırmızı çerçeveyle, **Kontrol** sekmesinde tek tek listeleniyor.":
    "**{n} gelegte {n:Stunde liegt|Stunden liegen} in Zeiten, die Sie geschlossen haben{kimde}.** Nichts wurde gelöscht. Im Reiter **Stundenplan** sind sie rot umrandet, in **Prüfung** einzeln aufgeführt.",

  // src/components/CapacityRows.tsx
  Ad: "Name",
  Açık: "Offen",
  Yük: "Last",
  Durum: "Status",

  // src/components/Check.tsx
  "Kontrol edilecek bir şey yok.": "Es gibt noch nichts zu prüfen.",
  İmkânsız: "Unmöglich",
  "Programın durumu": "Status des Plans",
  "Yerleşmiş saat": "Gelegte Stunden",
  "Tamamlanan ders": "Fertige Fächer",
  "Haftanın doluluğu": "Auslastung der Woche",
  "Boş kalan sınıf saati": "Freie Klassenstunden",
  "Kapalı saatte ders ({n})": "Fächer in geschlossener Stunde ({n})",
  Açıklama: "Erklärung",
  "Kapalı saat": "Geschlossene Stunden",
  "Kural ihlalleri ({n})": "Regelverstöße ({n})",
  "Kural dışı": "Regelwidrig",
  Uyarı: "Warnung",
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
  "**Okul** sekmesinden öğretmenleri, sınıfları ve dersleri girdikten sonra buraya dönün. Bu sayfa programın dizilip dizilemeyeceğini önceden söyler.":
    "Kommen Sie hierher zurück, sobald Sie im Reiter **Schule** Lehrkräfte, Klassen und Fächer eingetragen haben. Diese Seite sagt im Voraus, ob sich der Plan überhaupt legen lässt.",
  "**Sorun görünmüyor.** Öğretmen müsaitlikleri, sınıf ve derslik kapasiteleri yüklenen ders saatlerini karşılıyor. Program dizilebilir.":
    "**Es sieht alles in Ordnung aus.** Verfügbarkeiten sowie Klassen- und Raumkapazitäten decken die zugewiesenen Stunden. Der Plan lässt sich legen.",
  "**Dikkat edilmesi gereken noktalar var.** Aşağıdaki listelerde":
    "**Es gibt Punkte, die Aufmerksamkeit brauchen.** In den Listen unten verhindern Zeilen mit",
  "yazan satırlar programın dizilmesini engeller. Önce onları çözün.":
    "das Legen des Plans. Lösen Sie diese zuerst.",
  "Kalan **{n}** saat havuzda bekliyor. **Program** sekmesindeki **Otomatik diz** ile yerleştirebilirsiniz.":
    "Die restlichen **{n}** Stunden warten im Ablagefach. Sie können sie mit **Automatisch legen** im Reiter **Stundenplan** platzieren.",
  "Danışman uyarıları ({n})": "Berater-Hinweise ({n})",
  "Bunlar programı engellemez; veri girişinde gözden kaçmış olabilecek noktalardır.":
    "Diese blockieren den Plan nicht; es sind Punkte, die bei der Dateneingabe übersehen worden sein könnten.",
  "Danışmanın söyleyecek bir şeyi yok.": "Der Berater hat nichts zu sagen.",
  Öneri: "Hinweis",

  // src/components/ColorPick.tsx
  Vazgeç: "Abbrechen",

  // src/components/Commands.tsx
  Git: "Gehe zu",
  Yap: "Aktion",
  "derslik yok": "kein Raum",
  "{n} sınıf": "{n} {n:Klasse|Klassen}",

  // src/components/DraftStart.tsx
  "Bu taslağın verisi bulunamadı":
    "Die Daten dieses Entwurfs wurden nicht gefunden",
  'Plan listesinde duruyor ama kendi anahtarı boş. Ayarlar → Hakkında → "Veriler nerede" tablosu hangi anahtarın kaç bayt tuttuğunu gösterir.':
    "Er steht in der Planliste, aber sein eigener Schlüssel ist leer. Die Tabelle „Wo die Daten liegen“ unter Einstellungen → Über zeigt, wie viele Bytes jeder Schlüssel hält.",
  "{ad} kopyası": "Kopie von {ad}",
  '"{ad}" taslağından yeni bir plan açıldı.':
    "Aus dem Entwurf „{ad}“ wurde ein neuer Plan geöffnet.",

  // src/components/Grid.tsx
  "Öğle arası": "Mittagspause",
  "{ust} {alt}, kaldırmak için Delete":
    "{ust} {alt}, zum Entfernen Entf drücken",
  "Sürükleyerek taşıyın · sağ tık: seçenekler":
    "Zum Verschieben ziehen · Rechtsklick für Optionen",
  "{sorun}. Sürükleyerek taşıyın, sağ tıkla seçenekleri açın":
    "{sorun}. Zum Verschieben ziehen, Rechtsklick für Optionen",
  "{ust} {alt}, sabitlenmiş": "{ust} {alt}, angeheftet",
  "Sabitlenmiş. Sağ tıkla sabitlemeyi kaldırabilirsiniz":
    "Angeheftet. Mit Rechtsklick lösen",

  // src/components/Program.tsx — the grid's own menu
  "Havuza kaldır": "Ins Ablagefach",
  sabitlenmiş: "angeheftet",
  "Dersi düzenle": "Stunde bearbeiten",
  "Dersi buraya sabitle": "Stunde hier anheften",
  "Sabitlemeyi kaldır": "Anheftung lösen",
  "Bu ders sabitlenmiş. Önce sabitlemeyi kaldırın.":
    "Diese Stunde ist angeheftet. Lösen Sie zuerst die Anheftung.",
  "Ders sabitlendi.": "Stunde angeheftet.",
  "Sabitleme kaldırıldı.": "Anheftung gelöst.",

  // src/components/LessonEdit.tsx
  "Günde en fazla": "Höchstens pro Tag",
  "Dağılım değiştirilirse bu dersin programdaki yerleşimleri kalkar, sabitlenmiş olanlar da":
    "Wird die Aufteilung geändert, verschwindet diese Stunde aus dem Plan, auch die angehefteten Blöcke",

  // src/components/Ribbon.tsx — what the two destructive questions promise
  "Sabitlenen {n} saat yerinde kalır, gerisi sıfırdan dizilir. Ctrl+Z ile geri alınabilir.":
    "Die {n} angehefteten Stunden bleiben, der Rest wird neu geplant. Ctrl+Z macht es rückgängig.",
  "Sabitlenen {n} saat yerinde kalır. Dersler, öğretmenler ve müsaitlikler olduğu gibi kalır. Ctrl+Z ile geri alınabilir.":
    "Die {n} angehefteten Stunden bleiben. Stunden, Lehrkräfte und Sperrzeiten bleiben unberührt. Ctrl+Z macht es rückgängig.",
  "{ad}: bilgileri ve haftalık programı": "{ad}: Angaben und Wochenplan",

  // src/components/Inspector.tsx
  Kapat: "Schließen",
  "Haftalık programı": "Wochenplan",
  "Kayıt bulunamadı": "Kein Eintrag gefunden",

  // src/components/LessonPool.tsx
  "Yerleşmeyi bekleyen dersler": "Fächer, die auf Platzierung warten",
  "Havuz yüksekliği": "Höhe des Ablagefachs",
  "Sürükleyerek havuzun boyunu ayarlayın":
    "Ziehen Sie, um die Höhe des Ablagefachs einzustellen",
  Havuz: "Ablagefach",
  "Havuzu kapat: ızgara bütün yüksekliği alır":
    "Ablagefach schließen: Das Raster nimmt die volle Höhe ein",
  "Havuzu aç": "Ablagefach öffnen",
  "Hepsi yerleşti": "Alles gelegt",
  "{n} dersin tamamı programda": "alle {n} {n:Fach ist|Fächer sind} im Plan",
  "{n} blok bekliyor": "{n} {n:Block wartet|Blöcke warten}",
  "{n} saat · sürükleyip bırakın":
    "{n} {n:Stunde|Stunden} · ziehen und ablegen",
  "{ust} · {alt} {brans} · {boy} saatlik blok":
    "{ust} · {alt} {brans} · {boy}-stündiger Block",
  " · {n} tane bekliyor": " · {n} warten",
  " · dersin {yerlesen}/{toplam} saati yerleşti":
    " · {yerlesen} von {toplam} Stunden des Fachs gelegt",

  // src/components/ListTools.tsx
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

  // src/components/Palette.tsx
  "Komut paleti": "Befehlspalette",
  "Ara veya komut yaz": "Suchen oder Befehl eingeben",
  "Öğretmen, sınıf, derslik ara ya da bir komut yaz…":
    "Lehrkraft, Klasse oder Raum suchen oder einen Befehl eingeben…",
  Esc: "Esc",
  Sonuçlar: "Ergebnisse",
  "Eşleşen bir şey yok.": "Keine Treffer.",

  // src/components/Print.tsx
  Gün: "Tag",
  "Yazdırılacak program yok.": "Es gibt keinen Plan zum Drucken.",
  "{ne} ({secili}/{toplam})": "{ne} ({secili}/{toplam})",
  Tümü: "Alle",
  Hiçbiri: "Keine",
  "{ad} sınıfı · Haftalık ders programı": "Klasse {ad} · Wochenstundenplan",
  Çıktı: "Druck",
  "Yazdır ({n} kâğıt)": "Drucken ({n} {n:Blatt|Blätter})",
  "Hiçbir sayfa seçili değil, basılacak bir şey yok.":
    "Keine Seite ausgewählt, es gibt nichts zu drucken.",
  "Sayfa düzeni": "Seitenlayout",
  "Bir kâğıda kaç program": "Pläne pro Blatt",
  "Kâğıttaki yazı": "Text auf dem Papier",
  "Sayfada ne olsun": "Was auf die Seite kommt",
  "Çıktı özeti": "Druckübersicht",
  Kâğıt: "Blätter",
  Sayfa: "Seiten",
  "A4 yatay": "A4 quer",
  Renk: "Farbe",
  "Önce **Okul** sekmesinden dersleri girip **Program** sekmesinde dizin.":
    "Tragen Sie zuerst im Reiter **Schule** die Fächer ein und legen Sie sie dann im Reiter **Stundenplan**.",
  "**{n}** kâğıt": "**{n}** {n:Blatt|Blätter}",
  "Seçilen sayfaların **{n}** tanesi tamamen boş. O öğretmenlerin programı henüz dizilmemiş. **Program** sekmesinden dizebilirsiniz.":
    "**{n}** der gewählten Seiten sind völlig leer. Die Pläne dieser Lehrkräfte wurden noch nicht gelegt. Sie können sie im Reiter **Stundenplan** legen.",
  "Seçilen sayfaların **{n}** tanesi tamamen boş. O sınıfların programı henüz dizilmemiş. **Program** sekmesinden dizebilirsiniz.":
    "**{n}** der gewählten Seiten sind völlig leer. Die Pläne dieser Klassen wurden noch nicht gelegt. Sie können sie im Reiter **Stundenplan** legen.",

  // src/components/Program.tsx
  "Buraya bırakılabilir.": "Hier kann abgelegt werden.",
  "Otomatik diziliyor… {yerlesen}/{toplam} blok · {sure} sn":
    "Wird automatisch gelegt… {yerlesen}/{toplam} Blöcke · {sure} s",
  "Satırlar öğretmen. Hücrede sınıf ve derslik yazar. Yerleşmiş dersi sürükleyerek taşıyın, sağ tıklayınca havuza döner.":
    "Zeilen sind Lehrkräfte. Eine Zelle zeigt Klasse und Raum. Ziehen Sie ein gelegtes Fach zum Verschieben; ein Rechtsklick schickt es zurück ins Ablagefach.",
  "Satırlar sınıf. Hücrede öğretmen ve branşı yazar. Yerleşmiş dersi sürükleyerek taşıyın, sağ tıklayınca havuza döner.":
    "Zeilen sind Klassen. Eine Zelle zeigt die Lehrkraft und ihr Fach. Ziehen Sie ein gelegtes Fach zum Verschieben; ein Rechtsklick schickt es zurück ins Ablagefach.",
  "Program dizildi. {n} blok yerleşti ({sure} sn). Ctrl+Z ile geri alabilirsiniz.":
    "Plan gelegt. {n} Blöcke platziert ({sure} s). Mit Strg+Z rückgängig.",
  " (ve {n} ders daha)": " (und {n} {n:weiteres Fach|weitere Fächer})",
  "Durduruldu. {yerlesen}/{toplam} blok yerleşti.":
    "Angehalten. {yerlesen} von {toplam} Blöcken gelegt.",
  "{yerlesen}/{toplam} blok yerleşti.":
    "{yerlesen} von {toplam} Blöcken gelegt.",
  "{bas} {ders}: {saat} saat yerleşemedi. {sebep}{digerleri}.":
    "{bas} {ders}: {saat} Stunden konnten nicht gelegt werden. {sebep}{digerleri}.",
  dönecek: "geht zurück",
  döndü: "ging zurück",
  "Henüz dizilecek ders yok.": "Es gibt noch keine Fächer zu legen.",
  "Buraya döndüğünüzde dersler alttaki havuzda kartlar hâlinde bekliyor olacak.":
    "Wenn Sie hierher zurückkehren, warten die Fächer als Karten im Ablagefach darunter.",
  "Ayrıntı: Kontrol sekmesi.": "Einzelheiten: Reiter Prüfung.",
  Tamam: "OK",
  Öğretmen: "Lehrkraft",
  Sınıf: "Klasse",
  "Önce **Okul** sekmesinden derslikleri, öğretmenleri ve sınıfları girin, sonra her sınıfa haftalık ders saatlerini ekleyin. Ardından **Müsaitlik** sekmesinde öğretmenlerin gelemediği saatleri işaretleyin.":
    "Tragen Sie zuerst im Reiter **Schule** Räume, Lehrkräfte und Klassen ein und fügen Sie dann für jede Klasse die Wochenstunden hinzu. Markieren Sie danach im Reiter **Verfügbarkeit** die Stunden, zu denen Lehrkräfte nicht können.",

  // src/components/Ribbon.tsx
  "Okul listeleri": "Schullisten",
  "Ders girişi araçları": "Werkzeuge zur Facheingabe",
  "Liste boş": "Die Liste ist leer",
  "Müsaitlik araçları": "Verfügbarkeitswerkzeuge",
  "Program araçları": "Stundenplanwerkzeuge",
  Durdur: "Anhalten",
  "Havuzda bekleyen ders yok": "Kein Fach wartet im Ablagefach",
  "Havuzdaki dersleri kurallara uyarak yerleştirir":
    "Legt die Fächer aus dem Ablagefach regelkonform",
  "Otomatik diz ({n})": "Automatisch legen ({n})",
  "Dizilmiş programı silip baştan dizer":
    "Löscht den Plan und legt ihn von vorn",
  "Dizilmiş {n} saatin tamamı silinecek":
    "Alle {n} gelegten Stunden werden gelöscht",
  "Program sıfırdan dizilecek. Ctrl+Z ile geri alınabilir.":
    "Der Plan wird von vorn gelegt. Mit Strg+Z rückgängig.",
  "Baştan diz": "Von vorn legen",
  "Dizilmiş {n} saatin tamamı havuza dönecek":
    "Alle {n} gelegten Stunden gehen zurück ins Ablagefach",
  "Izgara boşalır; dersler, öğretmenler ve müsaitlikler olduğu gibi kalır. Ctrl+Z ile geri alınabilir.":
    "Das Raster wird geleert; Fächer, Lehrkräfte und Verfügbarkeiten bleiben unverändert. Mit Strg+Z rückgängig.",
  "Programı boşalt": "Stundenplan leeren",
  "Kontrol araçları": "Prüfwerkzeuge",
  "Sorun yok": "Keine Probleme",
  "Sorunlar ({n})": "Probleme ({n})",
  "{n} engel": "{n} {n:Sperre|Sperren}",
  "{n} uyarı": "{n} {n:Warnung|Warnungen}",
  "Yazdırma araçları": "Druckwerkzeuge",
  "İkisi de": "Beide",
  "Öğretmen renkleri kâğıda basılır":
    "Lehrerfarben werden auf das Papier gedruckt",
  "Renkli bas": "In Farbe drucken",
  "Ayar bölümleri": "Einstellungsbereiche",

  // src/components/lessons/index.tsx
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
  "Sınıf · Öğretmen (ad veya kısaltma) · Haftalık saat · Blok (1 · 2 · 3)":
    "Klasse · Lehrkraft (Name oder Kürzel) · Wochenstunden · Block (1 · 2 · 3)",
  "Günde en fazla {n} saat kuralı bu bloğu hiçbir yere sığdırmaz":
    'Die Regel "höchstens {n} Stunden am Tag" lässt für diesen Block keinen Platz',
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
  "Günde ↑": "Pro Tag ↑",
  "{sinif} · {kim} dersinin branşı": "Fach der Stunde {sinif} · {kim}",
  "Dağılım değiştirilirse bu dersin programdaki yerleşimleri kalkar":
    "Wird die Aufteilung geändert, verschwinden die Platzierungen dieses Fachs aus dem Plan",
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

  // src/components/settings/Appearance.tsx
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

  // src/components/settings/Data.tsx
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
  // src/changelog.ts — release-note bullets, translated like any other UI copy
  'Klavye kısayolları için bir yardım ekranı eklendi (üst çubuk, Ctrl+K veya "?" tuşu).':
    "Für Tastenkombinationen wurde ein Hilfebildschirm hinzugefügt (obere Leiste, Strg+K oder die ?-Taste).",
  'Ayarlar → Hakkında bölümüne bu "Yenilikler" paneli eklendi.':
    "Dieses Neuigkeiten-Panel wurde zu Einstellungen → Über hinzugefügt.",
  "Nasıl açıldı": "Wie es geöffnet wurde",
  Adres: "Adresse",
  "Güncellemeleri denetle": "Nach Aktualisierungen suchen",
  "Yeni sürümü indir": "Neue Version herunterladen",
  "Şimdi yeniden başlat": "Jetzt neu starten",
  "Bakılıyor…": "Wird geprüft…",
  "En son sürümü kullanıyorsunuz.": "Sie verwenden die neueste Version.",
  "Yeni sürüm iniyor…": "Die neue Version wird heruntergeladen…",
  "Her şey silinecek": "Alles wird gelöscht",
  "Öğretmenler, sınıflar, dersler ve dizilmiş program. Bu plan bomboş kalacak.":
    "Lehrkräfte, Klassen, Fächer und der gelegte Plan. Dieser Plan bleibt völlig leer.",
  "Devam et": "Weiter",
  "Son kez soruyorum": "Letzte Nachfrage",
  'Bu işlem geri alınamaz. Vazgeçme ihtimaliniz varsa önce üst çubuktan "Dosyaya kaydet" deyin.':
    "Das lässt sich nicht rückgängig machen. Wählen Sie vorher „In Datei speichern“ in der oberen Leiste, falls Sie es sich anders überlegen könnten.",
  "{yazilan} plan dosyaya yazıldı; {eksik} planın verisi bulunamadı.":
    "{yazilan} {yazilan:Plan|Pläne} in die Datei geschrieben; die Daten von {eksik} {eksik:Plan|Plänen} wurden nicht gefunden.",
  "{yazilan} plan tek dosyaya yazıldı.":
    "{yazilan} {yazilan:Plan|Pläne} in eine Datei geschrieben.",
  "Bu dosya programın daha yeni bir sürümüyle yazılmış. Programı güncelleyin.":
    "Diese Datei wurde mit einer neueren Programmversion geschrieben. Aktualisieren Sie das Programm.",
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
  "Henüz otomatik yedek yok, bu ilk oturum.":
    "Noch keine automatische Sicherung, dies ist die erste Sitzung.",
  Oturum: "Sitzung",
  "bir önceki": "die vorige",
  "{n} oturum önce": "vor {n} {n:Sitzung|Sitzungen}",
  "O zamana kadar üst çubuktaki **Dosyaya kaydet** tek çare.":
    "Bis dahin ist **In Datei speichern** in der oberen Leiste das einzige Mittel.",
  "**{klasor}** klasörü seçilmiş, ama tarayıcı izni her açılışta yeniden soruyor. **İzin ver** deyin.":
    "Der Ordner **{klasor}** ist gewählt, aber der Browser fragt bei jedem Start erneut nach der Berechtigung. Wählen Sie **Erlauben**.",
  "**{klasor}** · yazılıyor…": "**{klasor}** · wird geschrieben…",
  "**Yeni sürüm hazır.** Üstteki **Yenile** düğmesine basın.":
    "**Eine neue Version ist bereit.** Drücken Sie oben auf **Neu laden**.",
  "**v{surum} çıktı{tarih}.** İndirmek {mb} MB yer kaplar. İndirdikten sonra ne zaman geçeceğinize siz karar verirsiniz.":
    "**v{surum} ist erschienen{tarih}.** Der Download belegt {mb} MB. Nach dem Herunterladen entscheiden Sie, wann Sie wechseln.",
  "**v{surum} indi.** Yeniden başlatınca yeni sürüm açılır. Programınız kayıtlı, hiçbir şey kaybolmaz.":
    "**v{surum} wurde heruntergeladen.** Beim Neustart öffnet sich die neue Version. Ihre Arbeit ist gespeichert, nichts geht verloren.",

  // src/components/settings/Plans.tsx
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
    "Lehrkräfte, Klassen und Fächer bleiben; der gelegte Plan wird geleert",
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
    "Die Einrichtung des Entwurfs (Räume, Lehrkräfte, Klassen, Fächer) wird kopiert; **der gelegte Plan kommt leer**. Der Entwurf selbst ändert sich nicht.",

  // src/components/settings/Rules.tsx
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
    "Der gelegte Plan überschreitet keine der von Ihnen gesetzten Grenzen.",
  "Kendi sınırı olan sınıflar ({n})": "Klassen mit eigener Grenze ({n})",

  // src/components/settings/School.tsx
  "Zil ve günler": "Klingel und Tage",
  "Okul adı (yazdırılan sayfaların başlığında görünür)":
    "Schulname (erscheint in der Überschrift gedruckter Seiten)",
  "örn. Semiz Kurs": "z. B. Semiz-Kurs",
  "ders yok": "kein Unterricht",
  "{gun} öğle arası": "Mittagspause am {gun}",
  "Uzun ara yok": "Keine lange Pause",
  "{n}. dersten sonra": "nach der {n}. Stunde",
  "En az bir gün seçmelisiniz.": "Sie müssen mindestens einen Tag wählen.",
  "Ders saatleri": "Unterrichtszeiten",
  "Günlük ders sayısı": "Stunden pro Tag",
  "İlk ders başlangıcı": "Beginn der ersten Stunde",
  "Başlangıç saati": "Anfangsstunde",
  "Başlangıç dakikası": "Anfangsminute",
  "Ders (dk)": "Stunde (Min.)",
  "Teneffüs (dk)": "Pause (Min.)",
  "Öğle arası (dk)": "Mittagspause (Min.)",
  "Ders adları (virgülle; boş bırakılırsa 1, 2, 3…)":
    "Stundennamen (durch Komma getrennt; leer bedeutet 1, 2, 3…)",
  "Zil saatleri": "Klingelzeiten",
  Ara: "Pause",
  "Öğle arası, {dk} dk": "Mittagspause, {dk} Min.",
  Bitiş: "Ende",
  "Şu an **{gun} gün × {saat} saat** = {yer} slot.":
    "Derzeit **{gun} Tage × {saat} Stunden** = {yer} Plätze.",

  // src/components/setup/Classes.tsx
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
  "Bilgileri ve haftalık programı": "Angaben und Wochenplan",

  // src/components/setup/Paste.tsx
  "Buraya yapıştırın...": "Hier einfügen...",
  Önizle: "Vorschau",
  "Okunabilir satır bulunamadı.": "Keine lesbare Zeile gefunden.",
  "Excel'de sütunları seçip kopyalayın, aşağıya yapıştırın. Beklenen sıra: **{ornek}**":
    "Markieren und kopieren Sie die Spalten in Excel und fügen Sie sie unten ein. Erwartete Reihenfolge: **{ornek}**",
  "**{n} satır okundu.** Aşağıdakiler eklenecek:":
    "**{n} {n:Zeile|Zeilen} gelesen.** Folgendes wird hinzugefügt:",

  // src/components/setup/Rooms.tsx
  "Sınıf sayısına göre": "Nach Anzahl der Klassen",
  "Derslikler ({n})": "Räume ({n})",
  "Yeni derslik": "Neuer Raum",
  "Derslik adı, örn. A": "Raumname, z. B. A",
  "Derslikleri yapıştır": "Räume einfügen",
  "Derslik adı (her satırda bir tane)": "Raumname (einer pro Zeile)",
  "Bu aramaya uyan derslik yok.": "Kein Raum passt zu dieser Suche.",
  "Sınıf sayısı": "Anzahl der Klassen",

  // src/components/setup/Subjects.tsx
  "Bir öğretmende var ama listede yok":
    "Eine Lehrkraft hat es, die Liste nicht",
  "· listede değil": "· nicht in der Liste",
  "{ad} kısaltması": "Kürzel für {ad}",
  Varsayılan: "Standard",
  "Programda gömülü olan kısaltma": "Die im Programm eingebaute Kurzform",
  "Listeden çıkar": "Aus der Liste entfernen",
  "Bu branş zaten listede değil":
    "Dieses Fach steht ohnehin nicht in der Liste",
  '"{ad}" branşı kullanılıyor': "Das Fach „{ad}“ wird verwendet",
  "{n} öğretmen bu branşta ({kimler}). Önce onların branşını değiştirin, sonra bu branşı silin.":
    "{n} {n:Lehrkraft hat|Lehrkräfte haben} dieses Fach ({kimler}). Ändern Sie zuerst deren Fach und löschen Sie es dann.",
  '"{ad}" branşı listeden çıkarılacak':
    "Das Fach „{ad}“ wird aus der Liste entfernt",
  "Hiçbir öğretmen bu branşta değil, yani başka bir şey etkilenmiyor.":
    "Keine Lehrkraft hat dieses Fach, es ist also nichts weiter betroffen.",
  Çıkar: "Entfernen",
  "Branşlar ({n})": "Fächer ({n})",
  "Yeni branş (örn. Robotik)": "Neues Fach (z. B. Robotik)",
  "Yeni branş": "Neues Fach",
  "Bu branş listede zaten var.": "Dieses Fach steht bereits in der Liste.",
  Kısaltma: "Kürzel",

  // src/components/setup/Summary.tsx
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

  // src/components/setup/Teachers.tsx
  Cinsiyet: "Geschlecht",
  "Branşa göre": "Nach Fach",
  "Açık saate göre": "Nach offenen Stunden",
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
  "Ad Soyad · Kısaltma · Branş · Cinsiyet · İkinci branş":
    "Vor- und Nachname · Kürzel · Fach · Geschlecht · Zweites Fach",
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
  "**Aynı kısaltma birden çok öğretmende:** ızgarada iki satır ayırt edilemez.":
    "**Dasselbe Kürzel bei mehreren Lehrkräften:** Zwei Zeilen im Raster sind nicht zu unterscheiden.",

  // src/components/setup/index.tsx
  Başlarken: "Zum Anfang",
  "Aracın ne yaptığını görmek isterseniz hazır bir okul yükleyebilirsiniz.":
    "Wenn Sie sehen möchten, was das Werkzeug tut, können Sie eine fertige Schule laden.",
  "Örnek veriyle doldur": "Mit Beispieldaten füllen",
  "Bu satır bir daha çıkmaz; örnek veri Ayarlar → Hakkında’da durmaya devam eder":
    "Diese Zeile erscheint nicht wieder; die Beispieldaten bleiben unter Einstellungen → Über",
  "Bir daha gösterme": "Nicht mehr anzeigen",
  "{ad} ile başla": "Mit {ad} beginnen",
  "Daha önce **taslak** olarak işaretlediğiniz planların kurulumu hazır duruyor. Seçtiğinizden **yeni bir plan** açılır: derslikler, öğretmenler, sınıflar ve dersler kopyalanır, dizilmiş program boş gelir. Taslağın kendisi değişmez.":
    "Die Einrichtung der als **Entwurf** markierten Pläne liegt bereit. Wählen Sie einen, öffnet sich **ein neuer Plan**: Räume, Lehrkräfte, Klassen und Fächer werden kopiert, der gelegte Plan kommt leer. Der Entwurf selbst ändert sich nicht.",

  // src/components/useRowOrder.tsx
  Sıra: "Reihenfolge",
  "{ad}, {n}. sıra, taşımak için yukarı ve aşağı ok":
    "{ad}, Position {n}, mit Pfeil auf/ab verschieben",
  "Elle sıralama için süzmeyi ve sıralamayı kaldırın":
    "Zum Ordnen von Hand Filter und Sortierung entfernen",

  // src/components/useSample.ts
  "{ogretmen} öğretmen, {sinif} sınıf ve {ders} ders silinecek.":
    "{ogretmen} {ogretmen:Lehrkraft|Lehrkräfte}, {sinif} {sinif:Klasse|Klassen} und {ders} {ders:Fach|Fächer} werden gelöscht.",
  "Bu plandaki her şeyin yerine örnek veri geçecek":
    "Beispieldaten ersetzen alles in diesem Plan",
  "Örnek okul verisi yüklenecek": "Beispiel-Schuldaten werden geladen",
  '{kayip} Yerine 25 öğretmen, 20 sınıf, 8 derslik ve 99 derslik örnek bir okul gelir. Diğer planlara dokunulmaz. Geri alınamaz, önce "Dosyaya kaydet" deyin.':
    "{kayip} An ihre Stelle tritt eine Beispielschule mit 25 Lehrkräften, 20 Klassen, 8 Räumen und 99 Fächern. Die anderen Pläne bleiben unberührt. Nicht rückgängig zu machen. Wählen Sie vorher „In Datei speichern“.",
  '25 öğretmen, 20 sınıf, 8 derslik ve 99 ders. Aracın ne yaptığını görmek için; kendi verinizi girmeye başlamadan önce Ayarlar → Hakkında → "Her şeyi sil" ile temizleyin.':
    "25 Lehrkräfte, 20 Klassen, 8 Räume und 99 Fächer. Um zu sehen, was das Werkzeug tut; bevor Sie eigene Daten eintragen, räumen Sie mit Einstellungen → Über → „Alles löschen“ auf.",
  "Yerine koy": "Ersetzen",
  Yükle: "Laden",
  "Örnek veri yüklendi.": "Beispieldaten geladen.",

  // src/constraints.ts
  "Ders bulunamadı": "Fach nicht gefunden",
  "Ders eksik tanımlı": "Das Fach ist unvollständig definiert",
  "Geçersiz hücre": "Ungültige Zelle",
  "Bu saat günün dışında": "Diese Stunde liegt außerhalb des Tages",
  "{boy} saatlik blok güne sığmıyor":
    "Ein {boy}-stündiger Block passt nicht in den Tag",
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
  "{kim} {gun} günü en fazla {sinir} saat girmeli, burada {olan} saat olur":
    "{kim} darf am {gun} höchstens {sinir} Stunden unterrichten; hier wären es {olan}",
  "{sinif} sınıfı {gun} günü {kim} dersinden en fazla {sinir} saat görmeli, burada {olan} saat olur":
    "Klasse {sinif} darf am {gun} höchstens {sinir} Stunden bei {kim} haben; hier wären es {olan}",
  "{ders} dersi havuza dönecek": "das Fach {ders} geht zurück ins Ablagefach",
  "{dersler} dersleri havuza dönecek":
    "die Fächer {dersler} gehen zurück ins Ablagefach",
  "{gun} {saat} saatinde": "am {gun} in der {saat}. Stunde",
  "{kim} {ne_zaman} müsait değil": "{kim} ist {ne_zaman} nicht verfügbar",
  "{sinif} sınıfı {ne_zaman} kapalı":
    "Klasse {sinif} ist {ne_zaman} geschlossen",
  "{derslik} dersliği {ne_zaman} kapalı":
    "Raum {derslik} ist {ne_zaman} geschlossen",

  // src/drag.ts
  "Bu hücreye bırakılamaz": "In dieser Zelle kann nicht abgelegt werden",

  // src/entities.ts
  "Bu derslik silinecek": "Dieser Raum wird gelöscht",
  "{ad} dersliği silinecek": "Raum {ad} wird gelöscht",
  "{n} sınıfın dersliği boşalacak ({hangileri}) ve derslik çakışması artık kontrol edilmeyecek.":
    "{n} {n:Klasse steht|Klassen stehen} dann ohne Raum da ({hangileri}), und Raumkonflikte werden nicht mehr geprüft.",
  "Bu ders silinecek": "Dieses Fach wird gelöscht",
  "{sinif} sınıfının {kim} dersi": "das Fach {kim} der Klasse {sinif}",
  "{ne} silinecek ({n} saat)": "{ne} wird gelöscht ({n} {n:Stunde|Stunden})",
  "{ne} silinecek": "{ne} wird gelöscht",
  "Programa yerleşmiş {n} saati de kalkacak.":
    "Auch die {n} bereits gelegten {n:Stunde|Stunden} verschwinden.",
  "Bu öğretmen": "Diese Lehrkraft",
  "Bu sınıf": "Diese Klasse",
  "{n} dersi de gidecek.": "Auch {n} {n:Fach|Fächer} verschwinden.",
  "{ders} dersi ve programa yerleşmiş {saat} saati de gidecek.":
    "Auch {ders} {ders:Fach|Fächer} und die {saat} bereits gelegten {saat:Stunde|Stunden} verschwinden.",
  "Haftalık ders yükü": "Wöchentliche Fachlast",
  "{n} saat": "{n} {n:Stunde|Stunden}",
  "Açık saat": "Offene Stunden",
  "Programa yerleşmiş": "Im Plan gelegt",
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
  "{n} saati yerleşmemiş ve koyacak yer yok. Örnek sebep: {sebep}":
    "{n} {n:Stunde ist|Stunden sind} nicht gelegt und es gibt keinen Platz. Ein Beispielgrund: {sebep}",
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
  "Uygulama (.exe)": "Anwendung (.exe)",
  "Dosya (çift tıklanan .html)": "Datei (doppelt angeklickte .html)",
  "Windows kurulumu": "Windows-Installation",
  Site: "Website",
  "plan listesi": "die Planliste",
  "bir önceki oturum": "die vorige Sitzung",
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
  "örnek veri satırı görüldü mü": "ob die Beispieldatenzeile gesehen wurde",
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
  "Öğretmenin gelemeyeceği saatlere tıklayın.":
    "Klicken Sie die Stunden an, zu denen die Lehrkraft nicht kann.",
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
  "Hücre geniş, ders saatleri görünür":
    "Breite Zelle, Unterrichtszeiten sichtbar",
  "Haftanın tamamı ekrana sığar, ders saatleri gizlenir":
    "Die ganze Woche passt auf den Bildschirm, Unterrichtszeiten werden ausgeblendet",
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
  Uyar: "Warnen",
  Engelle: "Sperren",
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
    "Ein Plan auf A4, in der Größe zum Aufhängen",
  "Alt alta iki program": "Zwei Pläne untereinander",
  "İki sütun, iki satır, dağıtmak için":
    "Zwei Spalten, zwei Zeilen, zum Austeilen",
  "Kurs adı": "Schulname",
  "Başlığın altındaki satırda okulun adı":
    "Der Name der Schule in der Zeile unter der Überschrift",
  "Derslik ve branş": "Raum und Fach",
  "Aynı satırda dersliğin harfi ya da öğretmenin branşı":
    "In derselben Zeile der Raumbuchstabe oder das Fach der Lehrkraft",
  "Sütun başlığında 08:30–09:10": "08:30–09:10 in der Spaltenüberschrift",
  "Hücrenin alt satırı": "Die untere Zeile der Zelle",
  "Öğretmen kısaltması ya da derslik": "Das Kürzel der Lehrkraft oder der Raum",
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
  "Başka hocaya aktar…": "An andere Lehrkraft übergeben…",
  "{ne} dersi {kim} öğretmenine geçecek": "Das Fach {ne} geht an {kim}",
  "Bu ders henüz programa yerleşmemiş, yani kaybolacak bir şey yok.":
    "Dieses Fach steht noch nicht im Plan, es kann also nichts verloren gehen.",
  "Programdaki {n} bloğu yeni öğretmenin haftasına göre yeniden denenecek; sığmayanlar havuza döner.":
    "Seine {n} gesetzten Blöcke werden gegen die Woche der neuen Lehrkraft erneut geprüft; was nicht passt, geht zurück ins Fach.",
  Aktar: "Übergeben",
  "{ne} dersi {kim} öğretmenine geçti.": "Das Fach {ne} ging an {kim}.",
  "{ne} dersi {kim} öğretmenine geçti. {n} blok havuza döndü.":
    "Das Fach {ne} ging an {kim}. {n} Blöcke gingen zurück ins Fach.",
  "Azalan sıralı. Artana çevirmek için tıklayın":
    "Absteigend sortiert. Klicken für aufsteigend",
  "Artan sıralı. Azalana çevirmek için tıklayın":
    "Aufsteigend sortiert. Klicken für absteigend",
  "Sürükleyerek ya da ok tuşlarıyla sırala":
    "Zum Umsortieren ziehen oder Pfeiltasten benutzen",
  "Çözülmesi gereken satırlar": "Zu lösende Zeilen",
  "Danışman ({n})": "Berater ({n})",
  "Öneri yok": "Keine Hinweise",
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
  " {n} blok geçici kapsam dışında kaldı.":
    " {n} {n:Block blieb|Blöcke blieben} außerhalb.",
  " · {n} blok geçici kapsam dışında": " · {n} {n:Block|Blöcke} außerhalb",
  "{gun} geçici olarak kapsam dışında": "{gun} ist vorübergehend außerhalb",
  "Program seç ve yönet": "Stundenplan wählen und verwalten",
  "Kopyasını kaydet": "Kopie speichern",
  "Boş program oluştur": "Leeren Stundenplan anlegen",
  "Yeniden adlandır": "Umbenennen",
  "Programı sil": "Stundenplan löschen",
  "Program adı": "Name des Stundenplans",
  "Aynı okul verilerini kullanan alternatif program için bir ad yazın.":
    "Benennen Sie den Alternativplan, der dieselben Schuldaten nutzt.",
  "Program adı boş olamaz": "Der Stundenplan braucht einen Namen",
  "Bu program adı zaten kullanılıyor": "Dieser Name ist bereits vergeben",
  Kaydet: "Speichern",
  "{ad} programı silinecek": "Der Stundenplan {ad} wird gelöscht",
  "{n} yerleşmiş saat ve {s} sabitleme silinecek. Ortak okul verileri kalır.":
    "{n} belegte {n:Stunde|Stunden} und {s} {s:Anheftung|Anheftungen} gehen mit. Die gemeinsamen Schuldaten bleiben.",
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
  "Izgara işlemleri": "Aktionen für den Plan",
  "Tüm programı sabitle": "Ganzen Plan anheften",
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
  "{n} blok havuza döner, {s} sabitleme kalkar. Ctrl+Z ile geri alınabilir.":
    "{n} {n:Block geht|Blöcke gehen} zurück ins Ablagefach, {s} {s:Anheftung wird|Anheftungen werden} gelöst. Ctrl+Z macht es rückgängig.",
  "Ders {ad} sınıfına taşındı.": "Die Stunde ist zu {ad} gewechselt.",
  "Ders {ad} sınıfına taşındı. {n} blok havuza döndü.":
    "Die Stunde ist zu {ad} gewechselt. {n} {n:Block ging|Blöcke gingen} zurück ins Ablagefach.",
  "Ders {kim} öğretmenine geçsin mi?": "Die Stunde an {kim} übergeben?",
  "Yerleşmiş saatler olduğu gibi kalır. Ctrl+Z ile geri alınabilir.":
    "Die belegten Stunden bleiben, wo sie sind. Ctrl+Z macht es rückgängig.",
  "{n} blok havuza döner. Ctrl+Z ile geri alınabilir.":
    "{n} {n:Block geht|Blöcke gehen} zurück ins Ablagefach. Ctrl+Z macht es rückgängig.",
  "Ders {kim} öğretmenine geçti.": "Die Stunde ist an {kim} gegangen.",
  "Ders {kim} öğretmenine geçti. {n} blok havuza döndü.":
    "Die Stunde ist an {kim} gegangen. {n} {n:Block ging|Blöcke gingen} zurück ins Ablagefach.",
  "**Dersler** sekmesinde ders silinebilir, yeni ders eklenebilir.":
    "Im Tab **Fächer** lassen sich Stunden löschen und neue anlegen.",
  "Art arda en fazla": "Höchstens am Stück",
  "Geldiği gün en az": "Mindestens an Anwesenheitstagen",
  "Günde aynı dersten en fazla": "Gleiches Fach pro Tag höchstens",
  "Havuz sıralaması": "Reihenfolge im Ablagefach",
  "Havuz süzgeci": "Filter im Ablagefach",
  "Izgara sırası": "Wie im Plan",
  "Uzun bloklar önce": "Lange Blöcke zuerst",
  "En çok kalan": "Am meisten offen",
  "{n} saatlik bloklar": "Blöcke zu {n} Stunden",
  "{n} saat kaldı": "noch {n} {n:Stunde|Stunden}",
  "{n} blok süzgeç dışında · sürükleyip bırakın":
    "{n} weitere {n:Block|Blöcke} hinter dem Filter · ziehen und ablegen",
  Göster: "Anzeigen",
  Saatler: "Uhrzeiten",
  Satır: "Zeile",
  "Ders numaralarının altına başlangıç saatlerini yaz":
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
  "**Açık olan plan** tamamen silinir ve **geri alınamaz**; önce **Dosyaya kaydet** deyin.":
    "**Der offene Plan** wird gelöscht, **nicht widerrufbar**; erst **In Datei speichern**.",
  "**Bu kopya kendini güncellemez** ve hiçbir yere bağlanmaz. En son sürüm şuradadır:":
    "**Diese Kopie aktualisiert sich nie** und verbindet sich nirgends. Neueste Version:",
  "**Bütün planlar** kendiliğinden Belgelerim'e yazılıyor; son {gun} günün yedeği durur.":
    "**Alle Pläne** werden von selbst nach Dokumente geschrieben; die letzten {gun} Tage bleiben.",
  "**Ferah.** Hücre en büyük; en kolay okunan, en çok kaydırılan.":
    "**Weit.** Die größte Zelle: am besten lesbar, am meisten Scrollen.",
  "**Rahat.** Hücre geniş ve saatler yazılı; hafta sığmadığı için sağa kaydırırsınız.":
    "**Bequem.** Breite Zellen mit Uhrzeiten; die Woche passt nicht, also scrollen Sie.",
  "**Sığdır.** Haftanın tamamı bir ekranda, ve bunun bedeli **saatlerin gizlenmesi**.":
    "**Passend.** Die ganze Woche auf einem Bildschirm; der Preis: **Uhrzeiten entfallen**.",
  "**Sığdır.** Satır aralığı daralır; kısılan şey boşluk, **yazı boyutu değil**.":
    "**Passend.** Zeilen rücken zusammen; gekürzt wird Abstand, **nicht die Schriftgröße**.",
  "**Tarayıcınız klasöre yazmayı desteklemiyor.** Chrome ve Edge destekliyor.":
    "**Ihr Browser kann nicht in einen Ordner schreiben.** Chrome und Edge können es.",
  "**Uyar** yalnız sayar, **Engelle** dersi o hücreye hiç bıraktırmaz.":
    "**Warnen** zählt nur; **Sperren** lässt die Stunde dort gar nicht ablegen.",
  "**Yük**, **Açık**'ı geçerse o sınıfın haftası tutmaz.":
    "Übersteigt **Last** den Wert **Offen**, geht die Woche dieser Klasse nicht auf.",
  "Arayüzün dili. Bu bilgisayara aittir, yedek dosyasına girmez.":
    "Die Sprache der Oberfläche. Sie gehört zu diesem Rechner, nicht zur Sicherungsdatei.",
  "Aynı dersliği paylaşan sınıfların **toplam** ders saati de haftaya sığmalı.":
    "Auch die **Gesamtstunden** von Klassen mit gemeinsamem Raum müssen in die Woche passen.",
  "Aynı programı paylaşan öğrenci grubu; **derslik** sınıfın sabit odasıdır.":
    "Eine Schülergruppe mit gemeinsamem Plan; der **Raum** ist ihr fester Raum.",
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
  "Bir şey belirirken görülen kısa hareketler; kapatmak programın işini değiştirmez.":
    "Die kurzen Bewegungen beim Erscheinen; das Abschalten ändert sonst nichts.",
  "Branş **listeden seçilir**; kısaltma ızgarada satır başlığı olur.":
    "Das Fach wird **aus der Liste gewählt**; das Kürzel steht am Zeilenkopf.",
  "Bu bilgisayara aittir ve **yazdırmayı etkilemez**; kâğıdın yazısı **Çıktı** sekmesinde.":
    "Gehört zu diesem Rechner und **ändert den Druck nicht**; Papierschrift unter **Ausgabe**.",
  "Bu depo yalnız {adres} adresine ait; öteki kopyaların depoları **ayrıdır**.":
    "Dieser Speicher gehört allein zu {adres}; die anderen Kopien haben **eigene**.",
  "Bu dersler konduktan **sonra** o saatler kapatıldı; hiçbiri silinmedi.":
    "Diese Stunden wurden **nach** dem Setzen der Stunden gesperrt; gelöscht wurde keine.",
  "Bu derslerin yerleşmemiş saatleri var ama koyulacak boş hücre kalmamış.":
    "Diese Stunden sind noch nicht ganz gesetzt, aber es ist keine Zelle mehr frei.",
  "Bu kopya kendini güncelleyebilir ama **düğmeye basmadıkça** hiçbir yere bağlanmaz.":
    "Diese Kopie kann sich aktualisieren, verbindet sich aber erst **auf Knopfdruck**.",
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
  "Derslik yerleştirirken seçilmez ve aynı dersliği paylaşan iki sınıf aynı saate konamaz. Renk otomatik atanır, kimseyle çakışmaz; satır başındaki nokta ile basılan sayfanın başlığında görünür.":
    "Der Raum wird beim Setzen nicht gewählt, und zwei Klassen mit demselben Raum können nicht zur selben Stunde. Die Farbe wird automatisch vergeben, kollidiert mit keiner anderen und erscheint als Punkt am Zeilenkopf sowie im Titel des gedruckten Blatts.",
  "Dersliği olmayan sınıflar için bu kontrol yapılmaz.":
    "Für Klassen ohne Raum entfällt diese Prüfung.",
  "Ekranın **geri kalanı**: listeler, paneller, kutular. Program ızgarasına dokunmaz.":
    "Der **Rest** des Bildschirms: Listen, Panels, Felder. Das Raster bleibt unberührt.",
  "Gün kaçta başlıyor, ders ve teneffüs kaç dakika. Saatler bunlardan hesaplanır.":
    "Wann der Tag beginnt und wie lang Stunde und Pause sind. Daraus folgen die Zeiten.",
  "Hazır bir okul: 25 öğretmen, 20 sınıf, 99 ders. **Açık olan planın yerine geçer.**":
    "Eine fertige Schule: 25 Lehrkräfte, 20 Klassen, 99 Stunden. **Ersetzt den offenen Plan.**",
  "Her plan **ayrı bir programdır**; üst çubuktaki listeden aralarında geçilir.":
    "Jeder Plan ist **ein eigener Stundenplan**; die Liste oben wechselt zwischen ihnen.",
  "Her sınıf okul sayısını kullanıyor. Bir sınıfa özel sayı: **Okul → Sınıflar**.":
    "Jede Klasse nutzt den Schulwert. Für eine einzelne: **Schule → Klassen**.",
  "Her sınıfın sabit odası; aynı dersliği paylaşan iki sınıf aynı saate konamaz.":
    "Der feste Raum jeder Klasse; zwei Klassen mit demselben Raum können nicht gleichzeitig.",
  "Herkes okul sınırlarını kullanıyor. Bir öğretmene özel sayı: **Okul → Öğretmenler**.":
    "Alle nutzen die Schulgrenzen. Für eine Lehrkraft: **Schule → Lehrkräfte**.",
  "Kapalı saatler taralı; değiştirmek için **Müsaitlik** sekmesine gidin.":
    "Gesperrte Stunden sind schraffiert; ändern unter **Verfügbarkeit**.",
  "Okulun listesinde **bulunmayan** hazır branşlar; eklemek için tıklayın.":
    "Mitgelieferte Fächer, die **nicht** auf der Schulliste stehen; zum Hinzufügen klicken.",
  "Program **kendiliğinden** saklıyor; **Dosyaya kaydet** onun yanına gelir, yerine değil.":
    "Das Programm speichert **von selbst**; **In Datei speichern** kommt daneben, nicht dafür.",
  "Program, **Ayarlar → Kurallar**'da girdiğiniz sınırları aşıyor.":
    "Der Plan überschreitet die Grenzen aus **Einstellungen → Regeln**.",
  "Renk kimliktir: ızgaradaki satırı havuzdaki kartıyla eşleştiren şey budur.":
    "Farbe ist Identität: Sie verbindet die Zeile im Raster mit ihrer Karte im Fach.",
  "Sekmelerin altındaki bar, sayfayı **aşağı kaydırırken kendiliğinden gizlenir**.":
    "Die Leiste unter den Reitern **blendet sich beim Herunterscrollen aus**.",
  "Silmelerden sonra renkler delik bıraktı; yeniden dağıtmak yalnızca onları sıraya dizer.":
    "Löschungen haben Lücken in den Farben hinterlassen; Neuverteilen ordnet sie nur.",
  "Soldaki saatten ve üç süreden hesaplanır; her öğle arası deseni kendi sütununda.":
    "Aus Startzeit und drei Dauern berechnet; jedes Pausenmuster hat eine eigene Spalte.",
  "Son üç oturumun durumu ayrı tutulur; **bu bilgisayara** ve açılıştaki plana aittir.":
    "Die letzten drei Sitzungen liegen separat; sie gehören zu **diesem Rechner** und dem Startplan.",
  "Sınıf başına **{yer}** saat var ({gun} gün × {ders} ders); girilen yük **{yuk}** saat.":
    "**{yer}** Stunden je Klasse ({gun} Tage × {ders} Stunden); eingetragene Last: **{yuk}**.",
  "Sırayla: **derslikler**, **branşlar**, **öğretmenler**, **sınıflar**, sonra **dersler**.":
    "Der Reihe nach: **Räume**, **Fächer**, **Lehrkräfte**, **Klassen**, dann **Stunden**.",
  "Tarayıcının bu site için ayırdığı depoda duruyor.":
    "Es liegt in dem Speicher, den der Browser für diese Seite hält.",
  "Toplam **{yer}**; tarayıcının bu programa ayırdığı yer yaklaşık **5 MB**.":
    "Insgesamt **{yer}**; der Browser gibt diesem Programm etwa **5 MB**.",
  "Yalnız **Program** ızgarasını etkiler: hücrenin büyüklüğü ve ekrana sığan gün sayısı.":
    "Betrifft nur das Raster in **Stundenplan**: Zellengröße und sichtbare Tage.",
  "Yazdırma penceresinde **arka plan grafikleri: açık** olsun, yoksa renkler çıkmaz.":
    "Im Druckdialog **Hintergrundgrafiken einschalten**, sonst fehlen die Farben.",
  "Yeni plan açılınca ona geçilir ve **geri al** geçmişi sıfırlanır.":
    "Ein neuer Plan wird sofort geöffnet und der **Rückgängig**-Verlauf geleert.",
  "Yeni sürüm çıkınca üstte bir satır belirir; **Yenile** demedikçe hiçbir şey değişmez.":
    "Bei einer neuen Version erscheint oben eine Zeile; ohne **Neu laden** ändert sich nichts.",
  "Yukarıdakiler **localStorage**'da; seçtiğiniz klasörün tutamağı ayrıca **IndexedDB**'de.":
    "Obiges liegt im **localStorage**; der gewählte Ordner-Handle in **IndexedDB**.",
  "{ad} temaya geç": "Zum Design {ad} wechseln",
  "{dosya} **bütün planlarınızdır**; yanındakiler onun gün gün duran hâlleri.":
    "{dosya} sind **alle Ihre Pläne**; die Dateien daneben sind die Tageskopien.",
  "{n} engelle": "{n} sperren",
  "{n} gün": "{n} {n:Tag|Tage}",
  "{n} kapalı": "{n} aus",
  "{n} uyar": "{n} warnen",
  "Öğretmen eklerken branş **bu listeden** seçilir, elle yazılmaz.":
    "Beim Anlegen einer Lehrkraft wird das Fach **aus dieser Liste** gewählt, nie getippt.",
  "Öğretmenin müsait saati, ona yüklenen ders saatinden az olamaz.":
    "Die offenen Stunden einer Lehrkraft dürfen nicht unter ihrer Last liegen.",
  "Üst çubuktaki **Dosyaya kaydet** açık planı yazar; buradaki dosya **bütün planları**.":
    "**In Datei speichern** oben schreibt den offenen Plan; diese Datei **alle Pläne**.",
  "İçindekiler: her planın derslikleri, öğretmenleri, sınıfları, dersleri, dizilmiş programı, adı ve taslak işareti. Tema gibi bu bilgisayara ait tercihler ve oturum yedekleri girmez.":
    "Inhalt: Räume, Lehrkräfte, Klassen, Stunden, gesetzter Plan, Name und Entwurfsmarke jedes Plans. Einstellungen dieses Rechners wie das Design und die Sitzungssicherungen sind nicht dabei.",
  "İşareti kaldırılan şey kâğıda basılmaz.":
    "Was abgewählt ist, kommt nicht aufs Papier.",
};

registerSozluk("de", DE);

export default DE;
