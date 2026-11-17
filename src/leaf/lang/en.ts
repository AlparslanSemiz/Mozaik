/**
 * English. The keys are the Turkish sentences - see the long note at the top of
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

const EN: Sozluk = {
  "program renk tercihi": "timetable colour preference",
  "{bir} ile {iki} yer değiştirecek": "{bir} and {iki} will swap places",
  "Takas olmaz: {sebep}":
    "No swap: {sebep}",
  "Takas olmaz, {ne} eski yerine geçemiyor: {sebep}":
    "No swap, {ne} cannot take the old place: {sebep}",
  "{bir} ile {iki} yer değiştirdi": "{bir} and {iki} swapped places",
  "{ad} ({n} ders)": "{ad} ({n} {n:lesson|lessons})",
  // -------------------------------------------- the week and the subjects
  //
  // DATA drawn, never data stored: `settings.days[].name` and
  // `settings.subjects` stay Turkish in the file so a backup means the same
  // thing on every machine and `remapDays()` keeps building its mapping from
  // them (pitfall 11). Only the seven and the twenty-one this program itself
  // put there are translated; anything the reader typed is drawn as typed.
  Pazartesi: "Monday",
  Salı: "Tuesday",
  Çarşamba: "Wednesday",
  Perşembe: "Thursday",
  Cuma: "Friday",
  Cumartesi: "Saturday",
  Pazar: "Sunday",
  Matematik: "Mathematics",
  Fizik: "Physics",
  Geometri: "Geometry",
  Kimya: "Chemistry",
  Biyoloji: "Biology",
  Türkçe: "Turkish",
  Edebiyat: "Literature",
  Tarih: "History",
  Coğrafya: "Geography",
  İngilizce: "English",
  Felsefe: "Philosophy",
  "Din Kültürü": "Religious Studies",
  Almanca: "German",
  Fransızca: "French",
  Müzik: "Music",
  Resim: "Art",
  "Beden Eğitimi": "Physical Education",
  "Sosyal Bilgiler": "Social Studies",
  "Fen Bilimleri": "Science",
  Rehberlik: "Guidance",
  "İnkılap Tarihi": "History of Reforms",
  Kim: "Who",

  // src/App.tsx
  "plan dosyası": "plan file",
  "Plan dosyaya yazıldı. İndirilenler klasörüne bakın.":
    "Plan written to a file. Look in your Downloads folder.",
  Program: "Timetable",
  "Düğme satırını gizle": "Hide the button row",
  "Düğme satırını göster": "Show the button row",
  "Ekran hareketlerini aç": "Turn screen motion on",
  "Ekran hareketlerini kapat": "Turn screen motion off",
  "Bu dosya bütün planları içeriyor": "This file holds every plan",
  "Bu dosya daha yeni bir sürümle yazılmış":
    "This file was written by a newer version",
  "Okunamayan plan açılmadı: {adlar}.":
    "A plan that could not be read was not opened: {adlar}.",
  "· okunamadı": "· unreadable",
  "Kayıtlı metni okunamadı; açılmıyor, silinmedi.":
    "Its saved text could not be read; it is not opened and was not deleted.",
  "Bu planın kayıtlı metni okunamadı; silinirse o metin de gider. Bu işlem geri alınamaz.":
    "Its saved text could not be read; deleting the plan deletes that text too. This cannot be undone.",
  "Bu taslak okunamadı": "This draft could not be read",
  "Bu dosya okunamadı": "This file could not be read",
  "Açık olan planın yerine geçecek":
    "It will replace the plan that is open",
  "Planı aç": "Open the plan",
  "Bu dosya eksik":
    "This file is incomplete",
  "Dosyada: {ogretmen} öğretmen, {sinif} sınıf, {ders} ders, yerleşmiş {saat} saat.":
    "In the file: {ogretmen} {ogretmen:teacher|teachers}, {sinif} {sinif:class|classes}, {ders} {ders:lesson|lessons}, {saat} {saat:hour|hours} placed.",
  "Şu an: {ogretmen} öğretmen, {sinif} sınıf, {ders} ders, yerleşmiş {saat} saat.":
    "Now: {ogretmen} {ogretmen:teacher|teachers}, {sinif} {sinif:class|classes}, {ders} {ders:lesson|lessons}, {saat} {saat:hour|hours} placed.",
  "Plan dosyası açıldı.": "Plan file opened.",
  Bölümler: "Sections",
  Plan: "Plan",
  "Geri al": "Undo",
  "Geri al (Ctrl+Z)": "Undo (Ctrl+Z)",
  "İleri al": "Redo",
  "Dosyadan aç": "Open from file",
  "Klavye kısayolları": "Keyboard shortcuts",
  // -------------------------------------------------- ShortcutsHelp.tsx
  "Genel kısayollar": "General",
  "Komut paletini aç/kapat": "Toggle the command palette",
  "Bir sekmeye git": "Go to a section",
  "Bu ekranı aç": "Open this screen",
  "İptal et veya kapat": "Cancel or close",
  "Odaklı dersi havuza kaldır": "Send the focused lesson back to the tray",
  "Odaklı dersin sağ tık menüsünü aç":
    "Open the focused lesson’s right-click menu",
  Listeler: "Lists",
  "Yeni satır ekle veya düzenlemeyi onayla":
    "Add a new row or confirm an edit",
  "Tutamaktan bir satırı sırada taşı": "Move a row in order, from its handle",
  "Satırı listenin başına veya sonuna taşı":
    "Move the row to the top or bottom of the list",
  Diyaloglar: "Dialogs",
  Onayla: "Confirm",
  "Düğme satırı": "Button row",
  Yenile: "Reload",
  Sonra: "Later",
  "Klasörü düzelt": "Fix the folder",
  "**Son değişiklik bu bilgisayara kaydedilemedi:** depolama alanı dolu. İşinizi kaybetmemek için **Kaydet** düğmesine basın.":
    "**The last change could not be saved on this computer:** the storage is full. To keep your work, press **Save**.",
  "**Kayıtlı plan okunamadı.** Üzerine yazılmadı; burada yapılanlar kaydedilmez. Plan dosyanızı **Dosyadan aç** ile açabilirsiniz.":
    "**The saved plan could not be read.** Nothing was written over it; what you do here is not saved. You can open your plan file with **Open from file**.",
  "**Bu bilgisayarda otomatik kayıt çalışmıyor.** Mozaik kapanınca yaptığınız her şey kaybolur. Çalışırken ve bilgisayarı kapatmadan önce sık sık **Kaydet** düğmesine basın.":
    "**Automatic saving does not work on this computer.** Everything you do is lost when Mozaik closes. Press **Save** often while you work and before you shut the computer down.",
  "**Yeni sürüm hazır.** Şu an {surum} sürümünü kullanıyorsunuz; yenisi **Yenile** deyince gelir. İşiniz kaybolmaz.":
    "**A new version is ready.** You are on {surum}; the new one arrives when you press **Reload**. Your work is not lost.",
  "**{klasor}** klasörüne yazılamıyor: tarayıcı izni sormadan devam etmiyor. İşiniz şu an yalnız bu tarayıcıda duruyor.":
    "Cannot write to the **{klasor}** folder: the browser will not go on without asking for permission. Right now your work is only in this browser.",
  "**{klasor}** klasörüne **yazılamıyor**. {sebep} İşiniz şu an yalnız bu tarayıcıda duruyor.":
    "**Cannot write** to the **{klasor}** folder. {sebep} Right now your work is only in this browser.",

  // src/ui/availability/Availability.tsx
  "{ad} sınıfı": "class {ad}",
  "{ad} dersliği": "room {ad}",
  "Haftanın bu saatini değiştir": "Flip this hour of the week",
  "{gun}: bütün günü değiştir": "{gun}: flip the whole day",

  // src/ui/CapacityRows.tsx
  Ad: "Name",
  Açık: "Open",
  Yük: "Load",
  Durum: "Status",

  // src/ui/program/Check.tsx
  "Kontrol edilecek bir şey yok.": "There is nothing to check yet.",
  İmkânsız: "Impossible",
  "Programın durumu": "Timetable status",
  "Yerleşmiş saat": "Hours placed",
  "Kapalı saatte ders ({n})": "Lessons in a closed hour ({n})",
  Açıklama: "Explanation",
  "Kapalı saat": "Closed hours",
  "Kural aşımları ({n})": "Rule breaches ({n})",
  "Kesin": "Strict",
  "Yerleşemeyen dersler ({n})": "Lessons that cannot be placed ({n})",
  Ders: "Lesson",
  Sebep: "Reason",
  Öğretmenler: "Teachers",
  "Öğretmenin açık saat sayısı, ona yüklenen ders saatinden az olamaz.": "A teacher’s open hours cannot be fewer than the hours loaded onto them.",
  Sınıflar: "Classes",
  "Sınıfa yüklenen toplam ders saati, sınıfın AÇIK olduğu saatlere sığmalı.":
    "The total hours loaded onto a class must fit into the hours that class is OPEN.",
  Derslikler: "Rooms",
  "Aynı dersliği paylaşan sınıfların TOPLAM ders saati de haftaya sığmalı. En çok gözden kaçan darboğaz burasıdır.":
    "The TOTAL hours of the classes sharing one room must also fit into the week. This is the bottleneck most often missed.",
  "**Sorun görünmüyor.** Öğretmen, sınıf ve derslik açık saatleri yüklenen ders saatlerini karşılıyor. Program dizilebilir.": "**Nothing looks wrong.** The open hours of teachers, classes and rooms cover the hours loaded. The timetable can be laid out.",
  "**Sorun görünmüyor.** Bazı öğretmenlerin açık saati ya da bazı sınıf ve dersliklerin açık saati yüküne eşit ya da çok yakın (**Sıkışık**): orada boş saat kalmıyor ya da çok az kalıyor, ama program dizilebilir.": "**Nothing looks wrong.** Some teachers have as many open hours, or some classes or rooms as many open hours, as they are loaded with, or nearly (**Tight**): no hour or very few to spare there, but the timetable can be laid out.",
  "**Dikkat edilmesi gereken noktalar var.** Aşağıdaki listelerde":
    "**There are things worth looking at.** In the lists below, rows marked",
  "yazan satırlar programın dizilmesini engeller. Önce onları çözün.":
    "stop the timetable from being laid out. Resolve those first.",
  "Kalan **{n}** saat bekliyor. **Program** sekmesindeki **Kalanı diz** düğmesine basın.": "**{n}** {n:hour is|hours are} not placed yet. Press **Place the rest** in the **Timetable** tab.",
  "İpuçları ({n})": "Tips ({n})",
  "Bunlar programı engellemez; veri girişinde gözden kaçmış olabilecek noktalardır.":
    "These do not block the timetable; they are points that may have been overlooked while entering data.",
  "İpucu yok.": "No tips.",
  "Not": "Note",

  // src/ui/common/ColorPick.tsx
  Vazgeç: "Cancel",

  // src/ui/shell/Commands.tsx
  Git: "Go to",
  Yap: "Do",
  "derslik yok": "no room",
  "{n} sınıf": "{n} {n:class|classes}",

  // src/ui/plans/DraftStart.tsx
  "Bu taslağın verisi bulunamadı": "This draft’s data could not be found",
  "{ad} kopyası": "copy of {ad}",
  "“{ad}” taslağından yeni bir plan açıldı.":
    'A new plan was opened from the "{ad}" draft.',

  // src/ui/program/Grid.tsx
  "Öğle arası": "Lunch break",
  "Sürükleyerek taşıyın · sağ tık: seçenekler":
    "Drag to move · right-click for options",
  "{sorun}. Sürükleyerek taşıyın, sağ tıkla seçenekleri açın":
    "{sorun}. Drag to move, right-click for options",
  "Sabitlenmiş. Sağ tıkla sabitlemeyi kaldırabilirsiniz":
    "Pinned. Right-click to unpin",

  // src/ui/program/Program.tsx — the grid's own menu
  "Havuza kaldır": "Send to tray",
  sabitlenmiş: "pinned",
  "Dersi düzenle": "Edit lesson",
  "Sabitlemeyi kaldır": "Unpin",
  "Bu ders sabitlenmiş. Önce sabitlemeyi kaldırın.":
    "This lesson is pinned. Unpin it first.",
  "Ders sabitlendi.": "Lesson pinned.",
  "Sabitleme kaldırıldı.": "Lesson unpinned.",

  // src/ui/program/LessonEdit.tsx
  "Günde en fazla": "Most per day",
  "Haftaya dağılış değiştirilirse bu dersin programdaki yerleşimleri kalkar, sabitlenmiş olanlar da":
    "Changing the split clears this lesson from the timetable, pinned lessons included",

  // src/ui/Ribbon.tsx — what the two destructive questions promise
  "{ad}: bilgileri ve haftalık programı": "{ad}: details and weekly timetable",

  // src/ui/program/Inspector.tsx
  Kapat: "Close",
  "Haftalık programı": "Weekly timetable",
  "Kayıt bulunamadı": "No record found",

  // src/ui/program/LessonPool.tsx
  "Yerleşmeyi bekleyen dersler": "Lessons waiting to be placed",
  "Havuz yüksekliği": "Tray height",
  "Sürükleyerek havuzun boyunu ayarlayın": "Drag to set the tray’s height",
  Havuz: "Tray",
  "Havuzu kapat: ızgara bütün yüksekliği alır":
    "Close the tray: the grid takes the full height",
  "Havuzu aç": "Open the tray",
  "Hepsi yerleşti": "All placed",
  "{n} saat bekliyor": "{n} {n:hour|hours} waiting",
  "sürükleyip bırakın": "drag and drop",
  "{ust} · {alt} {brans} · {boy} saatlik ders":
    "{ust} · {alt} {brans} · {boy}-hour lesson",
  " · {n} tane bekliyor": " · {n} waiting",
  " · dersin {yerlesen}/{toplam} saati yerleşti":
    " · {yerlesen} of the lesson’s {toplam} hours placed",

  // src/ui/ListTools.tsx
  "{ne} ara": "Search {ne}",
  "Ara…": "Search…",
  "Aramayı temizle": "Clear the search",
  Sırala: "Sort",
  "Girildiği sıra": "Order entered",
  "Önce bir sıralama seçin": "Choose a sort order first",
  "Süzmeyi kaldır": "Clear the filter",
  "**{gorunen}** / {sayim}": "**{gorunen}** of {sayim}",
  "Satırları elle sıralamak için **Sırala**’yı “Girildiği sıra”ya alın ve süzmeyi kaldırın.":
    "To reorder rows by hand, set **Sort** to «Order entered» and clear the filter.",

  // src/ui/shell/Palette.tsx
  "Komut paleti": "Command palette",
  "Ara veya komut yaz": "Search or type a command",
  "Öğretmen, sınıf, derslik ara ya da bir komut yaz…":
    "Search a teacher, class or room, or type a command…",
  Esc: "Esc",
  Sonuçlar: "Results",
  "Eşleşen bir şey yok.": "Nothing matches.",

  // src/ui/print/Print.tsx
  Gün: "Day",
  "Yazdırılacak program yok.": "There is no timetable to print.",
  "{ne} ({secili}/{toplam})": "{ne} ({secili}/{toplam})",
  "{ad} sınıfı · Haftalık ders programı": "Class {ad} · Weekly timetable",
  Çıktı: "Print",
  "Yazdır ({n} kâğıt)": "Print ({n} {n:sheet|sheets})",
  "Hiçbir sayfa seçili değil, basılacak bir şey yok.":
    "No page is selected, so there is nothing to print.",
  "Sayfa düzeni": "Page layout",
  "Bir kâğıda kaç program": "Timetables per sheet",
  "Kâğıttaki yazı": "Text on paper",
  "Sayfada ne olsun": "What goes on the page",
  "Çıktı özeti": "Print summary",
  Kâğıt: "Sheets",
  Sayfa: "Pages",
  "A4 yatay": "A4 landscape",
  Renk: "Colour",
  "Seçilen sayfaların **{n}** tanesi tamamen boş. O öğretmenlerin programı henüz dizilmemiş. **Program** sekmesinden dizebilirsiniz.":
    "**{n}** of the selected pages are completely empty. Those teachers' timetables have not been laid out yet. You can lay them out in the **Timetable** tab.",
  "Seçilen sayfaların **{n}** tanesi tamamen boş. O sınıfların programı henüz dizilmemiş. **Program** sekmesinden dizebilirsiniz.":
    "**{n}** of the selected pages are completely empty. Those classes' timetables have not been laid out yet. You can lay them out in the **Timetable** tab.",

  // src/ui/program/Program.tsx
  "Buraya bırakılabilir.": "It can be dropped here.",
  "Program yapılıyor…": "Making the timetable…",
  "{yerlesen}/{toplam} ders · {sure} sn": "{yerlesen}/{toplam} lessons · {sure} s",
  "Satırlar öğretmen. Hücrede sınıf ve derslik yazar. Yerleşmiş dersi sürükleyerek taşıyın, sağ tıklayınca havuza döner.":
    "Rows are teachers. A cell shows the class and the room. Drag a placed lesson to move it; right-click sends it back to the tray.",
  "Satırlar sınıf. Hücrede öğretmen ve branşı yazar. Yerleşmiş dersi sürükleyerek taşıyın, sağ tıklayınca havuza döner.":
    "Rows are classes. A cell shows the teacher and their subject. Drag a placed lesson to move it; right-click sends it back to the tray.",
  "Bütün {n} saat yerleşti.": "All placed: {n} {n:hour|hours}.",
  " (ve {n} saat daha)": " (and {n} more {n:hour|hours})",
  "Durduruldu. {yerlesen} / {toplam} saat yerleşti.": "Stopped. {yerlesen} of {toplam} hours placed.",
  "{yerlesen} / {toplam} saat yerleşti.": "{yerlesen} of {toplam} hours placed.",
  "{bas} {ders}: {saat} saat yerleşemedi. {sebep}{digerleri}.":
    "{bas} {ders}: {saat} hours could not be placed. {sebep}{digerleri}.",
  "Henüz dizilecek ders yok.": "There are no lessons to lay out yet.",
  "Buraya döndüğünüzde dersler alttaki havuzda bekliyor olacak.":
    "When you come back here the lessons will be waiting in the tray below.",
  Tamam: "OK",
  Öğretmen: "Teacher",
  Sınıf: "Class",

  // src/ui/Ribbon.tsx
  "Liste boş": "The list is empty",
  Durdur: "Stop",
  "Yeniden yap": "Place again",
  "Programı boşalt": "Empty the timetable",
  "Sorun yok": "No problems",
  "Sorunlar ({n})": "Problems ({n})",
  "{n} uyarı": "{n} {n:warning|warnings}",
  "İkisi de": "Both",
  "Renkli bas": "Print in colour",

  // src/ui/lessons/index.tsx
  "Yeni ders": "New lesson",
  Branş: "Subject",
  "Sınıfa göre": "By class",
  "Öğretmene göre": "By teacher",
  "Haftalık saate göre": "By weekly hours",
  "Blok sayısına göre": "By number of blocks",
  "{ders} ders · {saat} saat":
    "{ders} {ders:lesson|lessons} · {saat} {saat:hour|hours}",
  "Dersler · {sayilar}": "Lessons · {sayilar}",
  "{kim} · {brans} dersleri · {sayilar}": "{kim} · {brans} lessons · {sayilar}",
  "{kim} dersleri · {sayilar}": "{kim} lessons · {sayilar}",
  "Önce sağdaki listeden bir {ne} seçin.":
    "Choose a {ne} from the list on the right first.",
  "Sınıf seçin": "Choose a class",
  "Bütün branşlar": "All subjects",
  "Öğretmen seçin": "Choose a teacher",
  "{brans}: {n} öğretmen": "{brans}: {n} {n:teacher|teachers}",
  "Haftalık saat": "Weekly hours",
  "Haftaya dağılış": "Spread over the week",
  Ekle: "Add",
  "Dersleri yapıştır": "Paste lessons",
  "Sınıf · Öğretmen (ad veya kısa ad) · Haftalık saat · Blok (1 · 2 · 3)":
    "Class · Teacher (name or short name) · Weekly hours · Block (1 · 2 · 3)",
  "Günde en fazla {n} saat kuralı bu dersi hiçbir yere sığdırmaz":
    "The \"at most {n} hours a day\" rule leaves this lesson nowhere to go",
  "{boy} saat > günde {n}": "{boy} h > {n}/day",
  "{sinif} · {kim}: {saat} saat ({dagilim})":
    "{sinif} · {kim}: {saat} hours ({dagilim})",
  "{n} satır eklenemedi": "{n} {n:row|rows} could not be added",
  "Sınıf veya öğretmen bulunamadı:": "Class or teacher not found:",
  "Önce onları ekleyip tekrar deneyin.": "Add them first, then try again.",
  "Bu aramaya uyan ders yok.": "No lesson matches this search.",
  "Bu ders bir günde en fazla kaç saat": "Most hours of this lesson in one day",
  "Aynı gün olmasın": "Not on the same day",
  "Aynı gün olmasın: ders ekle": "Not on the same day: add a lesson",
  "Ders ekle…": "Add a lesson…",
  "Kaldır: {ne}": "Remove: {ne}",
  "{sinif} · {kim} dersinin branşı": "Subject of the {sinif} · {kim} lesson",
  "Haftaya dağılış değiştirilirse bu dersin programdaki yerleşimleri kalkar":
    "Changing the split removes this lesson’s placements from the timetable",
  Sil: "Delete",
  "Hangi öğretmen": "Which teacher",
  "Hangi sınıf": "Which class",
  "Seçtiğiniz öğretmen için ders girin. Soldaki liste de o öğretmene daralır.":
    "Enter lessons for the teacher you choose. The list on the left narrows to that teacher too.",
  "Seçtiğiniz sınıf için ders girin. Soldaki liste de o sınıfa daralır.":
    "Enter lessons for the class you choose. The list on the left narrows to that class too.",
  "Ders listesi": "Lesson list",
  "Excel’den yapıştır": "Paste from Excel",

  // src/ui/settings/Appearance.tsx
  Tema: "Theme",
  "Yazı büyüklüğü": "Text size",
  Izgara: "Grid",
  Örnek: "Example",
  Saat: "Hour",
  "Ekran hareketleri": "Screen motion",
  Dil: "Language",
  "**Tam.** Tasarlandığı gibi.": "**Full.** As designed.",
  "**Kapalı.** Hiçbir şey kaymaz, hiçbir şey solmaz.":
    "**Off.** Nothing slides and nothing fades.",

  // src/ui/settings/Data.tsx
  "Nereye kaydedilsin": "Where it is saved",
  "Klasör seç…": "Choose a folder…",
  "Başka klasör seç…": "Choose another folder…",
  "İzin ver": "Allow",
  "Şu an yalnızca bu bilgisayarın tarayıcısında saklanıyor.":
    "Right now it is kept only in this computer’s browser.",
  "Sürüm ve güncelleme": "Version and updates",
  Sürüm: "Version",
  Yenilikler: "What’s new",
  "Eski sürümler": "Older versions",
  // src/platform/changelog.ts — release-note bullets, translated like any other UI copy
  "Program kurulamayınca Mozaik neyin değişmesi gerektiğini yol yol söylüyor, her yol tek tıkla uygulanıyor ve Ctrl+Z ile geri alınıyor.":
    "When a timetable cannot be laid out, Mozaik says what would have to change, way by way; each way is applied with one click and undone with Ctrl+Z.",
  "Öneri panelinde öğretmenlere sorulacak sorular var, her birinde Olur ve Olmaz; cevaplar planla birlikte saklanıyor.":
    "The suggestion panel lists the questions to ask each teacher, each with Yes and Not possible; the answers are saved with the plan.",
  "Izgarada göster, önerilen programı uygulamadan önce ızgarada işaretli gösteriyor.":
    "Show on the grid marks the suggested timetable on the grid before it is applied.",
  "Otomatik diz takılınca vazgeçmiyor, bulduğu en iyi programı onararak devam ediyor.":
    "Automatic arrangement no longer gives up when it gets stuck; it keeps repairing the best timetable it found.",
  "Dersin sayfasında “Aynı gün olmasın” satırı: iki ders aynı güne konmuyor.":
    "A \"Not on the same day\" row on the lesson’s sheet: two lessons are never put on the same day.",
  "Bir kart, bırakıldığı saatleri dolduran kartlarla yer değiştirebiliyor.":
    "A card can swap places with the cards that fill the hours it is dropped on.",
  "Ayarlar → Hakkında, öneri aramasının bu bilgisayarda ne kadar sürdüğünü gösteriyor.":
    "Settings → About shows how long the suggestion search takes on this computer.",
  "Kontrol, program tamamken sıkışık satırlar için artık “Dikkat” demiyor.":
    "Check no longer says \"points to watch\" for tight rows when the timetable is complete.",
  "Dil değişince bildirimler yeni dilde; boş ekranlar dersler için Dersler sekmesini gösteriyor.":
    "Notices follow a language change; the empty screens point to the Lessons tab for lessons.",
  "Program düğme satırında Renk menüsü: kartlar öğretmene, sınıfa, dersliğe ya da branşa göre boyanıyor.": "A Colour menu in the Timetable button row colours cards by teacher, class, room or subject.",
  "Bir kart başka bir kartın üstüne bırakılınca, iki hamle de uygunsa ikisi yer değiştiriyor.":
    "Dropping a card on another card swaps the two when both moves are allowed.",
  "Okunmamış sürüm notu varken Ayarlar şeridindeki Hakkında düğmesinde bir nokta çıkıyor.":
    "A dot on the About button in the Settings ribbon while there are unread release notes.",
  "Mozaik’in penceresi artık ekranı kaplayarak açılıyor, küçük bir kutuda değil.":
    "Mozaik’s window now opens filling the screen, not in a small box.",
  "Sığdır yoğunluğunda kart yazıları kırpılmıyor: sınıf numarası “4…” değil “411” okunuyor.":
    "In Fit density card text is no longer cut off: the class number reads \"411\", not \"4…\".",
  "Sığdır, satır başından ve gün ayraçlarından kazandığı yeri ders sütunlarına veriyor.":
    "Fit gives the space it saves on row headers and day separators to the lesson columns.",
  "Yazı büyüklüğü yüzde 100'ün altındayken kart yazısı da onunla birlikte küçülüyor.":
    "When text size is below 100 percent, card text shrinks with it.",
  "Sınıf ve öğretmen boşluk kuralları, planlama analizi ve Danışman notları eklendi.":
    "Class and teacher gap rules, planning analysis, and Advisor notes were added.",
  "Klavye kısayolları için bir yardım ekranı eklendi (üst çubuk ya da “?” tuşu).":
    "A help screen for keyboard shortcuts was added (top bar, or the ? key).",
  "Ayarlar → Hakkında bölümüne bu “Yenilikler” paneli eklendi.":
    "This What’s new panel was added to Settings → About.",
  "Program kartlarını sürükleme, yoğun programlarda yaklaşık yüzde 63 hızlandırıldı.":
    "Dragging timetable cards is about 63 percent faster on dense timetables.",
  "Windows görev çubuğu simgesi 20 piksel ve üzerinde ayrıntılı logoyu kullanıyor.":
    "The Windows taskbar icon now uses the detailed logo at 20 pixels and above.",
  "Dersler → Sınıftan görünümündeki gereksiz Branş başlığı kaldırıldı.":
    "The unnecessary Subject heading was removed from Lessons → By class.",
  "Nasıl açıldı": "How it was opened",
  Adres: "Address",
  "Güncellemeleri denetle": "Check for updates",
  "Yeni sürümü indir": "Download the new version",
  "Kurulumu indir": "Download the installer",
  "Şimdi kur": "Install now",
  "Kuruluma bak": "See the installer",
  "**Mozaik’i bu bilgisayara kurun.** Öneri araması (CP-SAT) için gerekli, onunla çok daha hızlı. İndirmek {mb} MB yer kaplar.": "**Install Mozaik on this computer.** The suggestion search (CP-SAT) needs it and is much faster with it. The download takes {mb} MB.",
  "**Kurulum indi.** **Şimdi kur** deyince Mozaik kapanır, kurulum bir ilerleme çubuğuyla çalışır ve Mozaik kendiliğinden yeniden açılır. Planlarınız kayıtlı, hiçbir şey kaybolmaz. Masaüstündeki ya da görev çubuğundaki eski Mozaik simgesi de kurulan programı açar.": "**The installer is here.** With **Install now** Mozaik closes, the installer runs with a progress bar and Mozaik opens again by itself. Your plans are saved, nothing is lost. The old Mozaik icon on the desktop or the taskbar opens the installed program too.",
  "**Mozaik’i bu bilgisayara kurun.** Öneri araması (CP-SAT) ancak kurulumla gelir ve çok daha hızlıdır. Planlarınız yerinde kalır.": "**Install Mozaik on this computer.** The suggestion search (CP-SAT) only comes with the installer, and it is much faster. Your plans stay where they are.",
  "Şimdi yeniden başlat": "Restart now",
  "Bakılıyor…": "Checking…",
  "En son sürümü kullanıyorsunuz.": "You are on the latest version.",
  "Yeni sürüm iniyor…": "The new version is downloading…",
  "Her şey silinecek": "Everything will be deleted",
  "Devam et": "Continue",
  "{yazilan} plan dosyaya yazıldı; {eksik} planın verisi bulunamadı.":
    "{yazilan} {yazilan:plan|plans} written to the file; the data of {eksik} {eksik:plan|plans} could not be found.",
  "{yazilan} plan tek dosyaya yazıldı.":
    "{yazilan} {yazilan:plan|plans} written to one file.",
  "Bu dosya Mozaik’in daha yeni bir sürümüyle yazılmış. Mozaik’i güncelleyin.":
    "This file was written by a newer version of Mozaik. Update Mozaik.",
  "Bu bilgisayardaki bütün planların yerine geçecek":
    "It will replace every plan on this computer",
  "Buradaki {buradaki} plan silinip dosyadaki {gelen} plan açılacak. Bu işlem geri alınamaz.":
    "The {buradaki} {buradaki:plan|plans} here will be deleted and the {gelen} {gelen:plan|plans} in the file opened. This cannot be undone.",
  "Hepsini değiştir": "Replace them all",
  "Dosyadaki hiçbir plan okunamadı; hiçbir şey değişmedi.":
    "Not one plan in the file could be read; nothing has changed.",
  "{acilan} plan açıldı, {yazilamayan} plan yazılamadı. Depolama dolmuş olabilir. Dosyayı saklayın.":
    "{acilan} {acilan:plan|plans} opened, {yazilamayan} could not be written. Storage may be full. Keep the file.",
  "Dosyadaki {yeni} plan Mozaik’in daha yeni bir sürümüyle yazılmış, açılmayacak. Mozaik’i güncelleyin.":
    "{yeni} {yeni:plan|plans} in the file {yeni:was|were} written by a newer version of Mozaik and will not be opened. Update Mozaik.",
  "{yeni} plan Mozaik’in daha yeni bir sürümüyle yazıldığı için açılmadı. Mozaik’i güncelleyin.":
    "{yeni} {yeni:plan was|plans were} written by a newer version of Mozaik and not opened. Update Mozaik.",
  "Dosyadaki {eksik} plan eksik ya da bozuk, açılmayacak.":
    "{eksik} {eksik:plan|plans} in the file {eksik:is|are} incomplete or broken and will not be opened.",
  "{acilan} plan açıldı, {eksik} plan eksik ya da bozuk olduğu için açılmadı.":
    "{acilan} {acilan:plan|plans} opened; {eksik} {eksik:was|were} incomplete or broken and not opened.",
  "{acilan} plan açıldı.": "{acilan} {acilan:plan|plans} opened.",
  "Bütün planlar tek dosyada": "Every plan in one file",
  "Bütün planları dosyaya kaydet ({n} plan)": "Save all to file ({n} {n:plan|plans})",
  "Bu bilgisayardaki bütün planların yerine dosyadakiler geçer":
    "The file’s plans replace every plan on this computer",
  "Bütün planları dosyadan aç": "Open all from file",
  "Bütün planları içeren dosya": "The file holding every plan",
  "Bu planın verisi": "This plan’s data",
  "Örnek okul verisi": "Sample school data",
  "Bu planın yerine hazır örnek okulu koyar":
    "Puts the ready-made sample school in place of this plan",
  "Örnek okulu yükle": "Load the sample school",
  Sıfırla: "Reset",
  "Her şeyi sil": "Delete everything",
  "Veriler nerede": "Where the data is",
  Anahtar: "Key",
  Ne: "What",
  Yer: "Size",
  "Bu bilgisayardaki otomatik yedekler": "Automatic backups on this computer",
  "Henüz otomatik yedek yok; ilki Mozaik bir daha açılınca alınır.":
    "No automatic backup yet; the first is taken the next time Mozaik opens.",
  "Otomatik yedek": "Automatic backup",
  "bir önceki açılış": "previous opening",
  "{n} açılış önce": "{n} {n:opening|openings} ago",
  "daha yeni bir sürümle yazılmış, bu sürüm açamıyor":
    "written by a newer version, this version cannot open it",
  "okunamadı": "could not be read",
  "O zamana kadar üst çubuktaki **Kaydet** tek çare.":
    "Until then, **Save** in the top bar is the only remedy.",
  "**{klasor}** klasörü seçilmiş, ama tarayıcı izni her açılışta yeniden soruyor. **İzin ver** deyin.":
    "The **{klasor}** folder is chosen, but the browser asks for permission again on every start. Choose **Allow**.",
  "**{klasor}** · yazılıyor…": "**{klasor}** · writing…",
  "**Yeni sürüm hazır.** Üstteki **Yenile** düğmesine basın.":
    "**A new version is ready.** Press the **Reload** button above.",
  "**v{surum} çıktı{tarih}.** İndirmek {mb} MB yer kaplar. İndirdikten sonra ne zaman geçeceğinize siz karar verirsiniz.":
    "**v{surum} is out{tarih}.** Downloading it takes {mb} MB. Once it is down, you decide when to switch.",
  "**v{surum} indi.** Yeniden başlatınca yeni sürüm açılır. Planlarınız kayıtlı, hiçbir şey kaybolmaz.":
    "**v{surum} has downloaded.** Restarting opens the new version. Your plans are saved; nothing is lost.",

  // src/ui/settings/Plans.tsx
  "Bu işlem geri alınamaz.": "This cannot be undone.",
  "{ogretmen} öğretmen, {sinif} sınıf, {ders} ders ve yerleşmiş {saat} saat silinecek. Bu işlem geri alınamaz.":
    "{ogretmen} {ogretmen:teacher|teachers}, {sinif} {sinif:class|classes}, {ders} {ders:lesson|lessons} and {saat} placed {saat:hour|hours} will be deleted. This cannot be undone.",
  "“{ad}” planı silinecek": 'The "{ad}" plan will be deleted',
  "Planı sil": "Delete the plan",
  "Planlar ({n})": "Plans ({n})",
  "Yeni plan": "New plan",
  "Boş plan": "Empty plan",
  "Bu planın kopyası": "A copy of this plan",
  "Öğretmenler, sınıflar ve dersler kalır; dizilmiş program boşalır":
    "Teachers, classes and lessons stay; the laid-out timetable is emptied",
  "Taslak olarak kaydet": "Save as a draft",
  Taslak: "Draft",
  İçerik: "Contents",
  "{ad} adı": "name of {ad}",
  "· açık olan": "· open",
  "Bu planın verisi bulunamadı": "This plan’s data could not be found",
  "{ogretmen} öğretmen · {sinif} sınıf · {ders} ders":
    "{ogretmen} {ogretmen:teacher|teachers} · {sinif} {sinif:class|classes} · {ders} {ders:lesson|lessons}",
  "Bu plana geç": "Switch to this plan",
  "Tek plan silinemez": "The only plan cannot be deleted",
  "Bu planı tamamen siler": "Deletes this plan completely",
  "Taslaktan başla": "Start from a draft",
  "· verisi yok": "· no data",
  "Taslağın kurulumu (derslikler, öğretmenler, sınıflar, dersler) kopyalanır; ** dizilmiş program boş gelir**. Taslağın kendisi değişmez.":
    "The draft’s setup (rooms, teachers, classes, lessons) is copied; **the laid-out timetable comes empty**. The draft itself does not change.",

  // src/ui/settings/Rules.tsx
  Kurallar: "Rules",
  Kural: "Rule",
  "Şu an": "Right now",
  "{kural} kuralı": "the {kural} rule",
  Kapalı: "Off",
  "Aşan yok": "None over",
  "Kendi sınırı olan öğretmenler ({n})": "Teachers with their own limits ({n})",
  "Art arda": "In a row",
  "Günde en az": "Fewest per day",
  "Aşımlar ({n})": "Breaches ({n})",
  "Hiçbir sınır aşılmıyor.": "No limit is exceeded.",
  "Kendi sınırı olan sınıflar ({n})": "Classes with their own limit ({n})",

  // src/ui/settings/School.tsx
  "Zil ve günler": "Bell and days",
  "Okul adı (kâğıtların başında)": "School name (at the top of the sheets)",
  "örn. Semiz Kurs": "e.g. Semiz College",
  "ders yok": "no lessons",
  "{gun} öğle arası": "{gun} lunch break",
  "Uzun ara yok": "No long break",
  "{n}. saatten sonra": "after period {n}",
  "En az bir gün seçmelisiniz.": "You must choose at least one day.",
  "Günün saatleri": "Hours of the day",
  "Günlük saat sayısı": "Hours per day",
  "İlk saatin başlangıcı": "Start of the first hour",
  "Başlangıç saati": "Start hour",
  "Başlangıç dakikası": "Start minute",
  "Teneffüs (dk)": "Break (min)",
  "Öğle arası (dk)": "Lunch break (min)",
  "Saat adları (virgülle ayırın)": "Hour names (separate with commas)",
  "{n} ad saat sayısından fazlaydı ve kullanılmadı.":
    "{n} {n:name was|names were} more than the number of hours and {n:was|were} not used.",
  "Bunların {n} saati sabitli, sabitlemeleri de kalkacak.":
    "{n} of them {n:is|are} pinned, and the {n:pin goes|pins go} too.",
  "Bu dersler havuza dönecek. Geri al ile geri getirebilirsiniz.":
    "These lessons will go back to the tray. Undo brings them back.",
  "Günlük saat sayısı {n} olacak":
    "The day will have {n} {n:hour|hours}",
  "{saat}. saatten sonra yerleşmiş {n} saat var.": "{n} {n:hour is|hours are} placed after period {saat}.",
  "Saat sayısını düşür":
    "Lower the count",
  "{gun} ders günlerinden çıkacak":
    "{gun} will no longer be a teaching day",
  "{gun} günü yerleşmiş {n} saat var.":
    "{n} {n:hour is|hours are} placed on {gun}.",
  "{gun} gününü çıkar":
    "Remove {gun}",
  "Zil saatleri": "Bell times",
  Ara: "Break",
  "Öğle arası, {dk} dk": "Lunch break, {dk} min",
  Bitiş: "End",

  // src/ui/setup/Classes.tsx
  Derslik: "Room",
  "Ada göre": "By name",
  "Dersliğe göre": "By room",
  "Ders yüküne göre": "By lesson load",
  "Yeni sınıf": "New class",
  "Sınıf adı, örn. 510": "Class name, e.g. 510",
  "Derslik yok": "No room",
  "Sınıfları yapıştır": "Paste classes",
  "Sınıf adı · Derslik adı": "Class name · Room name",
  "{ad} → {derslik} dersliği": "{ad} → room {derslik}",
  "Bu aramaya uyan sınıf yok.": "No class matches this search.",
  "Ders saati": "Lesson hours",
  "Günde aynı ders ↑": "Same subject/day ↑",
  "{ad} bir günde aynı dersten en fazla kaç saat":
    "how many hours of the same lesson {ad} may have in a day",
  yok: "none",
  "Bilgileri ve haftalık programı": "Details and weekly timetable",

  // src/ui/setup/Paste.tsx
  "Buraya yapıştırın...": "Paste here...",
  Önizle: "Preview",
  "Okunabilir satır bulunamadı.": "No readable row was found.",
  "Excel’de sütunları seçip kopyalayın, aşağıya yapıştırın. Beklenen sıra: **{ornek}**":
    "Select the columns in Excel, copy them and paste below. Expected order: **{ornek}**",
  "**{n} satır okundu.** Aşağıdakiler eklenecek:":
    "**{n} {n:row|rows} read.** The following will be added:",

  // src/ui/setup/Rooms.tsx
  "Sınıf sayısına göre": "By number of classes",
  "Yeni derslik": "New room",
  "Derslik adı, örn. A": "Room name, e.g. A",
  "Derslikleri yapıştır": "Paste rooms",
  "Derslik adı (her satırda bir tane)": "Room name (one per line)",
  "Bu aramaya uyan derslik yok.": "No room matches this search.",
  "Sınıf sayısı": "Number of classes",

  // src/ui/setup/Subjects.tsx
  "Bir öğretmende var ama listede yok":
    "A teacher has it but the list does not",
  "· listede değil": "· not in the list",
  "{ad} kısaltması": "short form of {ad}",
  Varsayılan: "Default",
  "Hazır kısaltma": "Ready-made short form",
  "Listeden çıkar": "Remove from the list",
  "Bu branş zaten listede değil": "This subject is not in the list anyway",
  "“{ad}” branşı kullanılıyor": 'The "{ad}" subject is in use',
  "{n} öğretmen bu branşta ({kimler}). Önce onların branşını değiştirin, sonra bu branşı silin.":
    "{n} {n:teacher holds|teachers hold} this subject ({kimler}). Change their subject first, then delete this one.",
  "Yeni branş (örn. Robotik)": "New subject (e.g. Robotics)",
  "Yeni branş": "New subject",
  "Bu branş listede zaten var.": "This subject is already in the list.",
  Kısaltma: "Short form",
  "Kısa ad": "Short name",

  // src/ui/setup/Summary.tsx
  Renkler: "Colours",
  "Öğretmen renklerini yeniden dağıt ({n})":
    "Redistribute teacher colours ({n})",
  "Sınıf renklerini yeniden dağıt ({n})": "Redistribute class colours ({n})",
  Özet: "Summary",
  "Hazır branşlar ({n})": "Ready-made subjects ({n})",
  "Hazır branşların hepsi listede.": "Every ready-made subject is already in the list.",
  "Hazır branşların hepsini listeye ekler": "Adds every ready-made subject to the list",
  "Hepsini ekle": "Add them all",
  "{ad} branşını listeye ekler": "Adds the subject {ad} to the list",
  "Listeye ekle": "Add to the list",
  "Kullanılmayan {n} branş: {hangileri}.": "{n} unused {n:subject|subjects}: {hangileri}.",
  "Derslik yükü": "Room load",
  "Henüz derslik yok.": "No rooms yet.",
  "Hangi sınıflar": "Which classes",
  "sınıf yok": "no classes",
  "{n} sınıf: {hangileri}": "{n} {n:class|classes}: {hangileri}",
  "Öğretmen yükü": "Teacher load",
  "Henüz öğretmen yok.": "No teachers yet.",
  "Sınıf yükü": "Class load",
  "Henüz sınıf yok.": "No classes yet.",
  "Ders yükü": "Lesson load",
  "Hiç dersi olmayan öğretmen: {kimler}.":
    "Teachers with no lessons at all: {kimler}.",
  "**{n} {ne} başkasıyla aynı renkte.** Renk burada bir kimlik: ızgarada, havuzda ve kâğıtta okunuyor.":
    "**{n} {ne} share a colour with somebody else.** Colour is an identity here: it is read in the grid, in the tray and on paper.",
  "Sınıfa yüklenen toplam ders saati, sınıfın **açık** olduğu saatlere sığmalı.":
    "The total hours loaded onto a class must fit into the hours that class is **open**.",
  "**{n} sınıfın hiç dersi yok** ({hangileri}).":
    "**{n} {n:class has|classes have} no lessons at all** ({hangileri}).",

  // src/ui/setup/Teachers.tsx
  Cinsiyet: "Gender",
  "Branşa göre": "By subject",
  "Açık saate göre": "By open hours",
  "Cinsiyete göre": "By gender",
  "Yeni öğretmen": "New teacher",
  "Ad Soyad": "Full name",
  "Boş bırakırsanız addan üretilir": "Left empty, it is derived from the name",
  "Branş seçin": "Choose a subject",
  "+ Yeni branş…": "+ New subject…",
  "Yeni branşın adı": "Name of the new subject",
  "İkinci branş": "Second subject",
  "Öğretmenleri yapıştır": "Paste teachers",
  "Ad Soyad · Kısa ad · Branş · Cinsiyet · İkinci branş · E-posta":
    "Full name · Short name · Subject · Gender · Second subject · E-mail",
  "Bu aramaya uyan öğretmen yok.": "No teacher matches this search.",
  "2. branş": "2nd subject",
  Yok: "None",
  "{kim} art arda en fazla kaç saat":
    "at most how many hours in a row for {kim}",
  "{kim} günde en fazla kaç saat": "at most how many hours per day for {kim}",
  "{kim} geldiği gün en az kaç saat":
    "at least how many hours on a day {kim} comes",
  "Branş listesi boş. **Branşlar** adımından ekleyebilirsiniz.":
    "The subject list is empty. You can add them in the **Subjects** step.",
  "**Aynı kısa ad birden çok öğretmende:** ızgarada iki satır ayırt edilemez.":
    "**The same short name is on more than one teacher:** two rows in the grid cannot be told apart.",

  // src/ui/setup/index.tsx
  Başlarken: "Getting started",
  "Mozaik’in ne yaptığını görmek isterseniz hazır bir okul yükleyebilirsiniz.":
    "If you would like to see what Mozaik does, you can load a ready-made school.",
  "Bir daha gösterme": "Do not show again",
  "{ad} ile başla": "Start with {ad}",
  "Daha önce **taslak** olarak işaretlediğiniz planların kurulumu hazır duruyor. Seçtiğinizden **yeni bir plan** açılır: derslikler, öğretmenler, sınıflar ve dersler kopyalanır, dizilmiş program boş gelir. Taslağın kendisi değişmez.":
    "The setup of the plans you marked as **drafts** is ready and waiting. Choosing one opens **a new plan**: rooms, teachers, classes and lessons are copied and the laid-out timetable comes empty. The draft itself does not change.",

  // src/ui/useRowOrder.tsx
  Sıra: "Order",
  "{ad}, {n}. sıra, taşımak için yukarı ve aşağı ok":
    "{ad}, position {n}, up and down arrows to move",
  "Elle sıralama için süzmeyi ve sıralamayı kaldırın":
    "To reorder by hand, clear the filter and the sort",

  // src/ui/plans/useSample.ts
  "{ogretmen} öğretmen, {sinif} sınıf ve {ders} ders silinecek.":
    "{ogretmen} {ogretmen:teacher|teachers}, {sinif} {sinif:class|classes} and {ders} {ders:lesson|lessons} will be deleted.",
  "Bu plandaki her şeyin yerine örnek okul geçecek":
    "The sample school will replace everything in this plan",
  "Örnek okul verisi yüklenecek": "Sample school data will be loaded",
  "Yerine koy": "Replace",
  Yükle: "Load",
  "Örnek okul yüklendi.": "Sample school loaded.",

  // src/constraints.ts
  "Ders bulunamadı": "Lesson not found",
  "Ders eksik tanımlı": "The lesson is incompletely defined",
  "Geçersiz hücre": "Invalid cell",
  "Bu saat günün dışında": "This hour is outside the day",
  "{boy} saatlik ders güne sığmıyor": "A {boy}-hour lesson does not fit the day",
  "{n}. gün": "day {n}",
  "{sinif} sınıfının {gun} {saat}. saatte {ders} var": "class {sinif} already has {ders} on {gun} at period {saat}",
  "başka ders": "another lesson",
  "{sinif} sınıfı {gun} {saat}. saatte kapalı": "class {sinif} is closed on {gun} at period {saat}",
  "{kim}, {gun} {saat}. saatte kapalı": "Period {saat} on {gun} is closed for {kim}",
  "{kim}, {gun} {saat}. saatte {sinif} sınıfında": "{kim} is with class {sinif} on {gun} at period {saat}",
  başka: "another",
  "{derslik} dersliğinde {gun} {saat}. saatte {sinif} var": "room {derslik} has {sinif} on {gun} at period {saat}",
  "başka sınıf": "another class",
  "{derslik} dersliği {gun} {saat}. saatte kapalı": "room {derslik} is closed on {gun} at period {saat}",
  "{kim} art arda {sinir} saatten fazla girmemeli, burada {olan} saat olur":
    "{kim} may teach at most {sinir} hours in a row; this would make {olan}",
  "{ders} {gun} günü var, bu dersle aynı güne konmamalı":
    "{ders} is on {gun}; this lesson must not go on the same day",
  "{bir} ile {iki} {gun} günü ikisi de var, aynı gün olmamalı.":
    "{bir} and {iki} are both on {gun}; they must not share a day.",
  "Aynı gün olmaması istenen iki ders aynı gündeyse, dersin sayfasındaki **Aynı gün olmasın** satırı onları gösterir.":
    "When two lessons that must not share a day are on the same day, the **Not on the same day** row on the lesson’s sheet shows them.",
  "{bir} ile {iki} {gun} günü sabitlenmiş; aynı gün olmamaları istendiği için biri yerinden oynamadan bir yol bulunamaz.":
    "{bir} and {iki} are both pinned on {gun}; they must not share a day, so no way can be found until one of them moves.",
  "İkisi de **sabitlenmişse** **Kalanı diz** öneri arayamaz; birinin sabitlemesini kaldırın ya da başka güne taşıyın.":
    "If both are **pinned**, **Place the rest** cannot look for suggestions; unpin one or move it to another day.",
  "{kim} {gun} günü en fazla {sinir} saat girmeli, burada {olan} saat olur":
    "{kim} may teach at most {sinir} hours on {gun}; this would make {olan}",
  "{sinif} sınıfı {gun} günü {kim} dersinden en fazla {sinir} saat görmeli, burada {olan} saat olur":
    "class {sinif} may have at most {sinir} hours of {kim} on {gun}; this would make {olan}",
  "{ders} dersi havuza dönecek": "the {ders} lesson will go back to the tray",
  "{dersler} dersleri havuza dönecek":
    "the {dersler} lessons will go back to the tray",
  "{ders} dersi havuza döndü": "the {ders} lesson went back to the tray",
  "{dersler} dersleri havuza döndü":
    "the {dersler} lessons went back to the tray",
  "{gun} {saat}. saatte": "{gun}, period {saat}",
  "{kim}, {ne_zaman} kapalı": "{ne_zaman} is closed for {kim}",
  "{sinif} sınıfı {ne_zaman} kapalı": "{ne_zaman} is closed for class {sinif}",
  "{derslik} dersliği {ne_zaman} kapalı": "{ne_zaman} is closed for room {derslik}",

  // src/drag.ts
  "Bu hücreye bırakılamaz": "It cannot be dropped in this cell",

  // src/entities.ts
  "{sinif} sınıfının {kim} dersi": "class {sinif}'s {kim} lesson",
  "Bu sınıf": "This class",
  "{n} saat": "{n} {n:hour|hours}",
  "Açık saat": "Open hours",
  "Branşı: {brans}": "Subject: {brans}",
  "Henüz dersi yok": "No lessons yet",
  "{n} dersi var: {hangileri}": "{n} {n:lesson|lessons}: {hangileri}",
  "Dersliği: {derslik}": "Room: {derslik}",
  "Hiçbir sınıf bu dersliği kullanmıyor": "No class uses this room",
  "{n} sınıf paylaşıyor: {hangileri}":
    "shared by {n} {n:class|classes}: {hangileri}",

  // src/feasibility.ts
  "Boş yer kalmamış": "There is no room left",
  "{kim} {acik} saat açık, {yuk} saat ders yüklenmiş. {fazla} saat fazla.": "{kim} has {acik} open hours and is loaded with {yuk}. That is {fazla} too many.",
  "{kim} {acik} saat açık, {yuk} saat ders yüklenmiş. Zor olacak.": "{kim} has {acik} open hours and is loaded with {yuk}. It will be tight.",
  "{kim} {acik} saat açık, {yuk} saat ders yüklenmiş.": "{kim} has {acik} open hours and is loaded with {yuk}.",
  "{sinif} sınıfına {yuk} saat ders yüklenmiş ama haftada {acik} saati açık. {fazla} saat fazla.":
    "Class {sinif} is loaded with {yuk} hours but is open for {acik} in a week. That is {fazla} too many.",
  "{sinif} sınıfı: açık olan {acik} saatin {yuk} saati dolu.":
    "Class {sinif}: {yuk} of its {acik} open hours are full.",
  "{derslik} dersliğini {n} sınıf paylaşıyor ({hangileri}) ve toplam {yuk} saat ders var. Haftada {acik} saati açık, {fazla} saat fazla.":
    "Room {derslik} is shared by {n} classes ({hangileri}) with {yuk} hours in total. It is open for {acik} a week, which is {fazla} too few.",
  "{derslik} dersliği ({hangileri}): açık olan {acik} saatin {yuk} saati dolu.":
    "Room {derslik} ({hangileri}): {yuk} of its {acik} open hours are full.",
  "{n} kural aşımı": "{n} rule {n:breach|breaches}",
  "{n} ders kapalı saatte": "{n} {n:lesson|lessons} in a closed hour",
  "{n} ders sığmıyor": "{n} {n:lesson does|lessons do} not fit",
  "Henüz ders girilmedi": "No lessons entered yet",
  "{ders} haftada {n} kez konacak ama yalnızca {gun} gün var; en az bir günde iki kez görülecek.":
    "{ders} needs to be placed {n} times a week but there are only {gun} days; it will land twice on at least one day.",
  "{kim} yalnızca {acik} günde açık ama bir dersi haftada {n} kez konacak; bir güne iki kez düşebilir.": "{kim} is only open on {acik} days but one lesson needs placing {n} times a week; it may land twice on one day.",
  "{ders} {n} ayrı bloğa bölünmüş ve hiç tekli saat bırakmıyor; Mozaik’in deneyebileceği tek şekil bu.":
    "{ders} is split into {n} separate blocks with no single hour left over; that is the only shape Mozaik can try.",
  "{n} ders haftada günden çok kez konacak; en az bir günde iki kez görülecek:":
    "{n} lessons need placing more times a week than there are days; each will land twice on at least one day:",
  "{n} öğretmenin açık günü bir dersinin istediğinden az; bir güne iki kez düşebilir:": "{n} teachers have fewer open days than one of their lessons needs; it may land twice on one day:",
  "{n} ders bloklara bölünmüş ve hiç tekli saat bırakmıyor; Mozaik’in deneyebileceği tek şekil bu:":
    "{n} lessons are split into blocks with no single hour left over; that is the only shape Mozaik can try:",

  // src/import.ts
  "{n}. satır: “{ad}” iki kez geçiyor, biri alındı.":
    'Row {n}: "{ad}" appears twice; one was taken.',
  "{n}. satır: “{ad}” için branş boş.":
    'Row {n}: the subject for "{ad}" is empty.',
  "{n}. satır: “{ad}” sınıfı iki kez geçiyor, biri alındı.":
    'Row {n}: class "{ad}" appears twice; one was taken.',
  "{n}. satır: sınıf veya öğretmen boş, atlandı.":
    "Row {n}: the class or teacher is empty; skipped.",
  "{n}. satır: “{sinif} / {kim}” için saat okunamadı, atlandı.":
    'Row {n}: the hours for "{sinif} / {kim}" could not be read; skipped.',

  // src/library.ts
  "Adsız plan": "Unnamed plan",
  "Geri gelen plan {n}": "Recovered plan {n}",
  "Uygulama (.exe)": "Application (.exe)",
  "Dosya (çift tıklanan .html)": "File (double-clicked .html)",
  "Windows kurulumu": "Windows install",
  Site: "Site",
  "plan listesi": "the plan list",
  "otomatik yedek · bir önceki açılış": "automatic backup · previous opening",
  "otomatik yedek · {n} açılış önce": "automatic backup · {n} {n:opening|openings} ago",
  "tema tercihi": "theme preference",
  "dil tercihi": "language preference",
  "kenar çubuğu tercihi": "sidebar preference",
  "yazı büyüklüğü tercihi": "text size preference",
  "ızgara yoğunluğu tercihi": "grid density preference",
  "arayüz yoğunluğu tercihi": "interface density preference",
  "havuz çekmecesi tercihi": "tray drawer preference",
  "havuz çekmecesinin boyu": "height of the tray drawer",
  "düğme satırı tercihi": "button row preference",
  "düğme satırı kaydırınca gizlensin mi": "whether the button row hides on scroll",
  "kişi sayfasında saat gösterimi (artık kullanılmıyor)": "clock times on the person page (no longer used)",
  "ekran hareketleri tercihi": "screen motion preference",
  "örnek okul satırı görüldü mü": "whether the sample-school line has been seen",
  "kâğıt seçenekleri": "paper options",
  "görülen sürüm notu": "the release notes version last seen",

  // src/rules.ts
  "{kim} {gun} günü": "{kim} on {gun}",
  "{kim_gun} {olan} saat ders veriyor, en fazla {sinir} saat isteniyor.":
    "{kim_gun} teaches {olan} hours; at most {sinir} were asked for.",
  "{kim_gun} sadece {olan} saat ders veriyor, en az {sinir} saat isteniyor.":
    "{kim_gun} teaches only {olan} hours; at least {sinir} were asked for.",
  "{kim_gun} art arda {olan} saat ders veriyor, en fazla {sinir} saat isteniyor.":
    "{kim_gun} teaches {olan} hours in a row; at most {sinir} were asked for.",
  "{sinif} sınıfı {gun} günü {kim} dersinden {olan} saat görüyor, en fazla {sinir} saat isteniyor.":
    "Class {sinif} has {olan} hours of {kim} on {gun}; at most {sinir} were asked for.",
  "{kim} {gun} günü dersleri arasında {olan} saat boşlukta, en fazla {sinir} saat isteniyor.":
    "{kim} has {olan} hour(s) of gap between lessons on {gun}; at most {sinir} were asked for.",
  "{sinif} sınıfı {gun} günü dersleri arasında {olan} saat boşlukta, en fazla {sinir} saat isteniyor.":
    "Class {sinif} has {olan} hour(s) of gap between lessons on {gun}; at most {sinir} were asked for.",

  // src/solver.ts
  "haftada {istenen} saat isteniyor, açık saatler ve kurallar en fazla {olabilen} saat veriyor":
    "{istenen} hours a week are asked for; the open hours and the rules allow at most {olabilen}",
  "Program yeniden yapılınca değişiklik gerekmeden kuruluyor":
    "Made again, the timetable can be built without any change",
  "Uygula ve yeniden yap":
    "Apply and make it again",
  "Dizili dersler yerinde kalırken bir yol yok; bu yollar dersleri yeniden diziyor, sabitlenenler yerinde kalır.":
    "There is no way with the placed lessons kept where they are; these ways lay them out again, and pinned ones stay put.",
  "Nasıl kurulacağı aranıyor… {sure} sn":
    "Looking for how the week can be built… {sure} s",
  "Sınıfların saatlerine dokunmadan bir yol bulunamadı.":
    "No way was found that leaves the classes' hours as they are.",
  "{liste} ve {son}":
    "{liste} and {son}",
  "{kim} {gun} {saatler}. saat":
    "{kim} {gun}, period {saatler}",
  "{ders}: aynı gün en fazla {eski} yerine {yeni} saat":
    "{ders}: at most {yeni} hours on one day instead of {eski}",
  "{kim}: günde en fazla {eski} yerine {yeni} saat":
    "{kim}: at most {yeni} hours a day instead of {eski}",
  "{kim}: art arda en fazla {eski} yerine {yeni} saat":
    "{kim}: at most {yeni} hours in a row instead of {eski}",
  "{ders}: {eski} yerine {yeni}":
    "{ders}: {yeni} instead of {eski}",
  "{ders}: haftada {eski} yerine {yeni} saat":
    "{ders}: {yeni} hours a week instead of {eski}",
  "Program o arada değişti. Öneriyi yeniden görmek için Kalanı diz düğmesine basın.":
    "The timetable has changed since. Press Place the rest to see a suggestion again.",
  "Program değişiklik gerekmeden kuruluyor":
    "The timetable can be built without any change",
  "İlk arama bu programı bulamadı; ikinci arama buldu ve denetledi.":
    "The first search did not find this timetable; the second search found it and checked it.",
  "Uygula ve diz":
    "Apply and lay out",
  "{ders}: {yeni} versin":
    "{ders}: taught by {yeni}",
  "{kim} {gun} {saatler}. saate":
    "{kim} on {gun} at period {saatler}",
  "{kim} {gun} {saatler}. saatlere":
    "{kim} on {gun} at periods {saatler}",
  "{saatler} de gelebilirse":
    "{saatler} can also come",
  "{ders} aynı gün {yeni} saat olabilirse":
    "{ders} can have {yeni} hours on one day",
  "{kim} {gun} {yeni} saat girebilirse":
    "{kim} can teach {yeni} hours on {gun}",
  "{kim} bir günde {yeni} saat girebilirse":
    "{kim} can teach {yeni} hours in a day",
  "{kim} art arda {yeni} saat girebilirse":
    "{kim} can teach {yeni} hours in a row",
  "{ders} dersini {yeni} verebilirse":
    "{yeni} can teach {ders}",
  "{ders} {yeni} olabilirse":
    "{ders} can be {yeni}",
  "{ders} haftada {yeni} saat olabilirse":
    "{ders} can be {yeni} hours a week",
  "{kosullar} program kuruluyor.":
    "The timetable can be built if {kosullar}.",
  "{kim} {gun}":
    "{kim} on {gun}",
  "{kim}: günlük sınır":
    "{kim}: daily limit",
  "{kim}: art arda sınırı":
    "{kim}: in-a-row limit",
  "{ders}: aynı gün sınırı":
    "{ders}: same-day limit",
  "{ders}: blok şekli":
    "{ders}: block shape",
  "{ders}: haftalık saat":
    "{ders}: weekly hours",
  "Öğretmenin zaten geldiği güne saat":
    "Hours on a day the teacher already comes",
  "En az saat, yan yana":
    "Fewest hours, side by side",
  "En az öğretmen":
    "Fewest teachers",
  "Saat ve sınır birlikte":
    "Hours and limits together",
  "Yalnız sınırlar":
    "Limits only",
  "Dersi başka öğretmene vermek":
    "Giving a lesson to another teacher",
  "Blok şekli":
    "Block shape",
  "Bir yol seçin; her biri tek başına yetiyor, sınıfların saatlerine dokunulmaz.":
    "Pick one way; each is enough on its own, and the classes' hours are never touched.",
  "Uygula":
    "Apply",
  "Uygula, yeniden yap":
    "Apply, make it again",
  "Olmaz":
    "Not possible",
  "Geri al: {ne}":
    "Take back: {ne}",
  "(daha iyisi aranıyor)":
    "(looking for a better one)",
  "Başka yollar da aranıyor… {sure} sn":
    "Looking for other ways too… {sure} s",
  "Yol {n} / {m} deneniyor: {ad}":
    "Trying way {n} of {m}: {ad}",
  "Aramanın ilerlemesi":
    "Search progress",
  "Başka yollar ({n})":
    "Other ways ({n})",
  "(inceltilmedi)":
    "(not refined)",
  "Arama durduruldu; o ana kadar bir yol bulunmamıştı.":
    "The search was stopped; no way had been found by then.",
  "Arama durduruldu. Bulunan yollar geçerli, ama daha küçükleri olabilir.":
    "The search was stopped. The ways found work, but smaller ones may exist.",
  "Aramayı sürdür":
    "Continue the search",
  "Arama durdurulduğu için daha küçük bir değişiklik de olabilir.":
    "The search was stopped, so a smaller change may exist.",
  "Bir dersi başka öğretmene verip daha az saat":
    "Give one lesson to another teacher, fewer hours",
  "Birkaç dersi başka öğretmene verip en az saat":
    "Give a few lessons to other teachers, fewest hours",
  "Cevaplarınız:":
    "Your answers:",
  "Olur":
    "Yes",
  "Olur: {ne}":
    "Yes: {ne}",
  "Olmaz: {ne}":
    "Not possible: {ne}",
  "Olur dedi":
    "Said yes",
  "Olur dedikleriniz yetiyor: program kuruluyor":
    "Your yeses are enough: the timetable can be built",
  "Olur dediklerinize ek olarak {kosullar} program kuruluyor.":
    "On top of your yeses, the timetable can be built if {kosullar}.",
  "Uygulayınca cevaplarınız veriye yazılır ve program dizilir.":
    "Applying writes your answers into the data and lays the timetable out.",
  "Izgarada göster":
    "Show on the grid",
  "Sorular":
    "Questions",
  "Soruları gizle":
    "Hide questions",
  "Soruları kopyala":
    "Copy questions",
  "Soruları yazdır":
    "Print questions",
  "Sorular panoya kopyalandı.":
    "Questions copied to the clipboard.",
  "Kopyalamak için Ctrl+C’ye basın":
    "Press Ctrl+C to copy",
  "Siz":
    "You",
  "Sizin kararınız":
    "Your decision",
  "Öğretmenlere sorulacaklar":
    "Questions for the teachers",
  "{gun} {saatler}. saate gelebilir misiniz?":
    "Can you come on {gun} at period {saatler}?",
  "{gun} {saatler}. saatlere gelebilir misiniz?":
    "Can you come on {gun} at periods {saatler}?",
  "Bir günde {eski} yerine {yeni} saat girebilir misiniz?":
    "Can you teach {yeni} hours in a day instead of {eski}?",
  "Art arda {eski} yerine {yeni} saat girebilir misiniz?":
    "Can you teach {yeni} hours in a row instead of {eski}?",
  "{ders} dersini verebilir misiniz?":
    "Can you teach {ders}?",
  "Yalnız bu saatler olmaz ({gun} {saatler}. saat)":
    "Only these hours are not possible ({gun}, period {saatler})",
  "{gun} günü kapalı": "Closed on {gun}",
  "{gun} en fazla {n} saat gelebilir":
    "Can come on {gun} for at most {n} {n:hour|hours}",
  "{kim} için hiçbir değişiklik olmasın":
    "No change at all for {kim}",
  "{kim} {gun} en fazla {n} saat":
    "{kim} on {gun}: at most {n} {n:hour|hours}",
  "{kim}: hiçbir değişiklik":
    "{kim}: no change at all",
  "Önizleme":
    "Preview",
  "Önizleme: {yol}":
    "Preview: {yol}",
  "Önizlemeyi kapat":
    "Close preview",
  "Hangi program":
    "Which timetable",
  "Şu anki":
    "Current",
  "Önerilen":
    "Suggested",
  "{n} öğretmen saati açılıyor":
    "{n} teacher {n:hour opens|hours open}",
  "{n} ders yer değiştiriyor":
    "{n} {n:lesson moves|lessons move}",
  "Öneri araması":
    "Suggestion search",
  "Bu bilgisayarda henüz aranmadı":
    "Not run on this computer yet",
  "{n} iş parçacığında · ilk öneri {ilk} sn · arama {sure} sn":
    "On {n} {n:thread|threads} · first suggestion {ilk} s · search {sure} s",
  "Tek iş parçacığında (yavaş yol) · ilk öneri {ilk} sn · arama {sure} sn":
    "On one thread (the slow way) · first suggestion {ilk} s · search {sure} s",
  "öneri aramasının ölçümleri":
    "measurements of the suggestion search",
  "Kurulması için":
    "To build the week",
  "Ayrıntı":
    "Details",
  "Bu değişiklikle bütün dersler yerleşiyor; program bulundu ve denetlendi.":
    "With this change every lesson fits; the timetable was found and checked.",
  "Bundan küçük bir değişiklik yetmiyor.":
    "No smaller change is enough.",
  "Bulduğumuz en küçük değişiklik bu.":
    "This is the smallest change we found.",
  "Öneri uygulandı ve program dizildi.": "The suggestion was applied and the timetable laid out.",
  "{sinif} sınıfında boş açık saat kalmadı":
    "class {sinif} has no open hour left empty",
  "Boş kalan saatler bu dersin {boy} saatlik bloğuna uymuyor":
    "the hours left empty do not fit this lesson’s {boy}-hour block",
  "Tek başına {gun} {saat}. saate sığıyor, sınıfın öbür eksik dersleriyle birlikte sığmıyor": "on its own it fits {gun} at period {saat}, but not together with the class’s other missing lessons",
  "{gun} {saat}. saate sığıyor, arama oraya varmadan durdu": "it fits {gun} at period {saat}; the search stopped before it got there",

  // src/update.ts
  "Güncelleme denetlenemedi.": "The update could not be checked.",

  // src/useFolder.ts
  "Klasöre yazma izni geri alınmış.":
    "Permission to write to the folder has been withdrawn.",
  "Klasöre yazılamadı. Klasör silinmiş ya da taşınmış olabilir.":
    "Could not write to the folder. It may have been deleted or moved.",

  // src/version.ts
  "{gun} {ay} {yil}": "{gun} {ay} {yil}",

  // ---------------------------------------------- the module-level tables
  //
  // VIEWS, KINDS, SECTIONS, DENSITIES, LESSON_MODES, STEPS, RULE_ROWS, the tab
  // labels and their like. A constant cannot hold a hook, so these are
  // translated where they are DRAWN - which means no literal `t('...')` call
  // carries them and they have to be listed by hand.
  Branşlar: "Subjects",
  öğretmen: "teacher",
  sınıf: "class",
  derslik: "room",
  branş: "subject",
  ders: "lesson",
  "Yük durumu": "Load status",
  Boş: "Empty",
  Uygun: "Fits",
  Sıkışık: "Tight",
  "Öğretmen görünümü": "Teacher view",
  "Sınıf görünümü": "Class view",
  Görünüm: "View",
  Hakkında: "About",
  "Planlar ve yedek": "Plans and backup",
  "Bir öğretmen seçin, girdiği bütün sınıfları arka arkaya girin":
    "Choose a teacher and enter all the classes they teach, one after another",
  Sınıftan: "From a class",
  "Bir sınıf seçin, o sınıfın derslerini arka arkaya girin":
    "Choose a class and enter that class’s lessons one after another",
  Genel: "All",
  "Bütün dersler tek listede": "Every lesson in one list",
  Liste: "List",
  "Açık olan": "Open",
  Toplam: "Total",
  Diz: "Lay out",
  Bölüm: "Section",
  "Koyu renk": "Dark",
  Az: "Reduced",
  Belirtilmemiş: "Not stated",
  Kadın: "Female",
  Erkek: "Male",
  "–": "–",
  "1": "1",
  "2": "2",
  "4": "4",
  Normal: "Normal",
  Küçük: "Small",
  Büyük: "Large",
  "Bir A4’e bir program, duvara asılan boy":
    "One timetable on an A4, the size you pin to a wall",
  "Alt alta iki program": "Two timetables one above the other",
  "İki sütun, iki satır, dağıtmak için":
    "Two columns, two rows, for handing out",
  "Okul adı": "School name",
  "Başlığın altındaki satırda okulun adı":
    "The school’s name on the line under the heading",
  "Derslik ve branş": "Room and subject",
  "Aynı satırda dersliğin harfi ya da öğretmenin branşı":
    "On the same line, the room’s letter or the teacher’s subject",
  "Sütun başlığında 08:30–09:10": "08:30–09:10 in the column heading",
  "Hücrenin alt satırı": "The cell’s bottom line",
  "Öğretmenin kısa adı ya da derslik": "The teacher’s short name or the room",
  "Çıktı tarihi": "Print date",
  "Sayfanın üstünde yazdırılma tarihi ve saati": "The date and time of printing at the top of the page",
  "Öğretmen art arda en fazla": "Teacher, at most in a row",
  "Bir öğretmen arka arkaya kaç saat derse girebilir.":
    "How many hours in a row a teacher may teach.",
  "Öğretmen günde en fazla": "Teacher, at most per day",
  "Bir öğretmenin bir gündeki toplam ders saati.":
    "A teacher’s total hours in one day.",
  "Öğretmen günde en az": "Teacher, at least per day",
  "Bir sınıf aynı dersten günde en fazla":
    "A class, at most of the same lesson per day",
  "Öğretmenin dersleri arasında en fazla boşluk":
    "Teacher, at most gap between lessons",
  "Bir günde ilk ve son ders arasında kaç saat boş kalabilir. 0 hiç boşluk olmasın demektir.":
    "How many hours may sit empty between the first and last lesson of a day. 0 means no gap at all.",
  "Sınıfın dersleri arasında en fazla boşluk":
    "Class, at most gap between lessons",
  Ocak: "January",
  Şubat: "February",
  Mart: "March",
  Nisan: "April",
  Mayıs: "May",
  Haziran: "June",
  Temmuz: "July",
  Ağustos: "August",
  Eylül: "September",
  Ekim: "October",
  Kasım: "November",
  Aralık: "December",
  Okul: "School",
  Kontrol: "Check",
  Ayarlar: "Settings",
  "{n} öğretmen": "{n} {n:teacher|teachers}",
  "{n} derslik": "{n} {n:room|rooms}",
  "{n} ders": "{n} {n:lesson|lessons}",
  Dersler: "Lessons",
  "{ad} branşının adı": "Name of the {ad} subject",
  "“{ad}” adı zaten kullanılıyor": 'The name "{ad}" is already in use',
  "İki branş aynı adı taşıyamaz. Başka bir ad seçin.":
    "Two subjects cannot share a name. Choose another.",
  "“{eski}” branşı “{yeni}” olacak":
    'The subject "{eski}" will become "{yeni}"',
  "{n} öğretmenin branşı da bu adla değişecek ({kimler}).":
    "{n} teachers' subject will change with it ({kimler}).",
  Değiştir: "Rename",
  "Verdiği dersler": "Lessons taught",
  "Aldığı dersler": "Lessons taken",
  "Başka öğretmene aktar…": "Hand to another teacher…",
  "{ne} dersi {kim} öğretmenine geçecek": "The {ne} lesson will go to {kim}",
  "Bu ders henüz programa yerleşmemiş, yani kaybolacak bir şey yok.":
    "This lesson is not on the timetable yet, so nothing can be lost.",
  "Programdaki {n} ders yeni öğretmenin açık saatlerine göre yeniden denenecek; sığmayanlar havuza döner.": "Its {n} placed lessons will be retried against the new teacher’s open hours; the ones that do not fit go back to the tray.",
  Aktar: "Hand over",
  "{ne} dersi {kim} öğretmenine geçti.": "The {ne} lesson went to {kim}.",
  "{ne} dersi {kim} öğretmenine geçti. {n} ders havuza döndü.":
    "The {ne} lesson went to {kim}. {n} lessons went back to the tray.",
  "Azalan sıralı. Artana çevirmek için tıklayın":
    "Sorted descending. Click for ascending",
  "Artan sıralı. Azalana çevirmek için tıklayın":
    "Sorted ascending. Click for descending",
  "Sürükleyerek ya da ok tuşlarıyla sırala":
    "Drag or use the arrow keys to reorder",
  "Öğretmen yükleri": "Teacher loads",
  "Sınıf yükleri": "Class loads",
  "Derslik yükleri": "Room loads",

  // ------------------------------------------------------- 2026-08-30
  //
  // The tray's order and filter, the pin ON a card, the timetable library
  // behind one button, and an entity sheet that edits. Written by hand, the
  // way every entry here is: `i18n.test.ts` can tell us a key is DEAD, never
  // that one is missing - an untranslated sentence falls back to correct
  // Turkish and says nothing (pitfall 87).
  Seçenek: "Variant",
  Kaydet: "Save",
  "Öğretmeni düzenle": "Edit teacher",
  "Sınıfı düzenle": "Edit class",
  gizli: "hidden",
  İşlemler: "Actions",
  "Bütün dersleri sabitle": "Pin all lessons",
  "Bütün sabitlemeleri kaldır": "Unpin everything",
  "{sinif} sınıfının {gun} {saat}. saatindeki ders sabitlenmiş": "The lesson for {sinif} on {gun}, period {saat}, is pinned",
  "{ust} {alt}: buraya sabitle": "{ust} {alt}: pin here",
  "{ust} {alt}: sabitlemeyi kaldır": "{ust} {alt}: unpin",
  "Sabitlenmiş. Kaldırmak için tıklayın": "Pinned. Click to unpin",
  "Ders {ad} sınıfına taşınsın mı?": "Move the lesson to {ad}?",
  Taşı: "Move",
  "Yerleşmiş saatler olduğu gibi taşınır.": "The placed hours move with it.",
  "{n} ders havuza döner, {s} sabitleme kalkar.": "{n} {n:lesson goes|lessons go} back to the tray and {s} {s:pin is|pins are} lifted.",
  "Ders {ad} sınıfına taşındı.": "The lesson moved to {ad}.",
  "Ders {ad} sınıfına taşındı. {n} ders havuza döndü.":
    "The lesson moved to {ad}. {n} {n:lesson|lessons} went back to the tray.",
  "Ders {kim} öğretmenine geçsin mi?": "Hand the lesson to {kim}?",
  "Yerleşmiş saatler olduğu gibi kalır.": "The placed hours stay where they are.",
  "{n} ders havuza döner.": "{n} {n:lesson goes|lessons go} back to the tray.",
  "Ders {kim} öğretmenine geçti.": "The lesson went to {kim}.",
  "Ders {kim} öğretmenine geçti. {n} ders havuza döndü.":
    "The lesson went to {kim}. {n} {n:lesson|lessons} went back to the tray.",
  "Art arda en fazla": "Consecutive at most",
  "Geldiği gün en az": "At least, on a day worked",
  "Günde aynı dersten en fazla": "Same lesson per day at most",
  "Havuz sıralaması": "Tray order",
  "Havuz süzgeci": "Tray filter",
  "Izgara sırası": "Grid order",
  "Uzun dersler önce": "Long lessons first",
  "En çok kalan": "Most left to place",
  "{n} saatlik dersler": "{n}-hour lessons",
  "{n} saat kaldı": "{n} {n:hour|hours} left",
  "{n} saat süzgeç dışında · sürükleyip bırakın": "{n} {n:hour|hours} behind the filter · drag and drop",
  Göster: "Show",
  Saatler: "Clock times",
  Satır: "Row",

  // ------------------------------------ 2026-08-30 · AB2: infolar kısaldı
  //
  // "Çok fazla info var ve çok uzunlar her yerde." One sentence per `.hint`,
  // and what did not fit went to the element’s `title` — the five long
  // entries at the end of this block are those. Grouped by round rather than
  // by source file: the pass touched fifteen screens, and a key here is found
  // by its Turkish sentence anyway.
  "**Az.** Süreler yarıya iner ve **yer değiştiren** hareketler kapanır.":
    "**Reduced.** Durations halve and anything that MOVES is switched off.",
  "**Mozaik burada kendini güncellemez** ve hiçbir yere bağlanmaz. En son sürüm şuradadır:":
    "**Here Mozaik never updates itself** and connects nowhere. The latest version is at:",
  "**Bütün planlar** kendiliğinden Belgelerim’e yazılıyor; son {gun} günün yedeği durur.":
    "**Every plan** is written to Documents by itself; the last {gun} days are kept.",
  "**Tarayıcınız klasöre yazmayı desteklemiyor.** Chrome ve Edge destekliyor.":
    "**Your browser cannot write to a folder.** Chrome and Edge can.",
  "**Tercih** yalnız sayar, **Kesin** dersi o hücreye hiç bıraktırmaz.":
    "**Preference** only counts; **Strict** never lets the lesson into that cell.",
  "**Yük**, **Açık**'ı geçerse o sınıfın programı tutmaz.":
    "If **Load** passes **Open**, that class’s timetable does not add up.",
  "Arayüzün dili. Bu bilgisayara aittir, plan dosyasına girmez.":
    "The interface language. It belongs to this computer, not to the plan file.",
  "Aynı dersliği paylaşan sınıfların **toplam** ders saati de haftaya sığmalı.":
    "The **combined** hours of classes sharing a room must also fit the week.",
  "Aşağıdakiler **kendi öğretmenleriniz**: bir ad sığmıyorsa yazıyı bir basamak küçültün.": "These are **your own teachers**: if a name does not fit, make the text one step smaller.",
  "Başka bir tarayıcı bunu **görmez**, “tarama verilerini temizle” onu **siler**.":
    "Another browser **cannot see** it, and “clear browsing data” **deletes** it.",
  "Bilgisayarınız “azaltılmış hareket” istiyorsa hareket, ne seçerseniz seçin, **kapalı** kalır.":
    "If your computer asks for “reduced motion”, motion stays **off** whatever you pick.",
  "Bir A4 kâğıda kaç program bassın, ve kâğıttaki yazı ne kadar büyük olsun.":
    "How many timetables go on one A4 sheet, and how large the type on it is.",
  "Bir ders = bir sınıfın bir öğretmenden aldığı haftalık saat.":
    "One lesson = the weekly hours a class takes from one teacher.",
  "Bir klasör seçin; **bütün planlar** oraya yazılır ve son {gun} günün yedeği durur.":
    "Pick a folder; **every plan** is written there and the last {gun} days are kept.",
  "Bir şey belirirken görülen kısa hareketler; kapatmak Mozaik’in işini değiştirmez.":
    "The short movements when something appears; turning them off changes nothing else.",
  "Bu depo yalnız {adres} adresine ait; başka adreste açılan Mozaik’in deposu **ayrıdır**.":
    "This store belongs to {adres} alone; Mozaik opened at another address has a **separate** one.",
  "Mozaik burada kendini güncelleyebilir ama **düğmeye basmadıkça** hiçbir yere bağlanmaz.":
    "Here Mozaik can update itself, but connects nowhere **until you press the button**.",
  "Bu, Mozaik’in geliştirme ve test sürümü; kendini güncellemez. Denetlemek yalnız yeni sürümün olup olmadığını söyler.":
    "This is Mozaik’s development and test build; it does not update itself. Checking only tells you whether there is a new version.",
  "Bu sayılar **bütün okul** için. Bir kuralı kapatmak için **Seviye**’yi **Yok** yapın.": "These numbers are for the **whole school**. To turn a rule off, set its **Level** to **None**.",
  "Bu tarayıcının bu bilgisayardaki deposunda duruyor.":
    "It sits in this browser’s store on this computer.",
  "Burada ne seçerseniz o kalır; bilgisayarınızın tercihini **izlemez**.":
    "Whatever you pick here stays; it **does not follow** your computer’s preference.",
  "Böylece aynı branş iki farklı yazımla iki branşa dönüşmez. Kısaltma ızgarada ve yazdırılan sayfada görünür; yalnızca değiştirdikleriniz saklanır. Satırları tutamağından sürükleyerek sıralayabilirsiniz; öğretmen eklerken açılan liste bu sırada gelir.":
    "That way one subject spelled two ways does not become two subjects. The short form shows in the grid and on the printed sheet; only the ones you change are stored. Rows can be reordered by their handle, and the dropdown when adding a teacher follows that order.",
  "Bütün ekranı birlikte büyütür: yazıyı, boşlukları, düğmeleri ve ızgara hücrelerini.":
    "Enlarges the whole screen together: type, spacing, buttons and grid cells.",
  "Bütün planlar Belgelerim’deki **{klasor}** klasörüne de yazılıyor; taşınacak şey o.":
    "Every plan is also written to **{klasor}** in Documents; that folder is what moves.",
  "Ders yapılan günleri işaretleyin; yanındaki kutu **öğle arasının** yerini söyler.":
    "Tick the teaching days; the box beside each says where the **long break** falls.",
  "Dersliği olmayan sınıflar için bu kontrol yapılmaz.":
    "Classes with no room are not checked this way.",
  "Gün kaçta başlıyor, bir saat ve teneffüs kaç dakika. Zil saatleri bunlardan hesaplanır.":
    "When the day starts, and how many minutes an hour and a break last. The bell times are worked out from these.",
  "Hazır bir okul: 25 öğretmen, 20 sınıf, 99 ders. **Açık olan planın yerine geçer.**":
    "A ready-made school: 25 teachers, 20 classes, 99 lessons. **It replaces the open plan.**",
  "Her planın **verisi ayrıdır**; üst çubuktaki listeden aralarında geçilir.":
    "Each plan **keeps its own data**; the top bar’s list switches between them.",
  "Her sınıfın sabit dersliği; aynı dersliği paylaşan iki sınıf aynı saate konamaz.":
    "Each class’s fixed room; two classes sharing one cannot take the same hour.",
  "Okulun listesinde **bulunmayan** hazır branşlar; eklemek için tıklayın.":
    "Built-in subjects **not** on the school’s list; click to add one.",
  "Renk kimliktir: ızgaradaki satırı havuzdaki dersiyle eşleştiren şey budur.":
    "Colour is identity: it is what matches a grid row to its lesson in the tray.",
  "Sekmelerin altındaki düğme satırı, sayfayı **aşağı kaydırırken kendiliğinden gizlenir**.": "The button row under the tabs **hides itself as you scroll down** the page.",
  "Silmelerden sonra renkler delik bıraktı; yeniden dağıtmak yalnızca onları sıraya dizer.":
    "Deletions left gaps in the colours; redealing only puts them back in order.",
  "Son üç açılıştaki durum otomatik yedek olarak ayrı tutulur; **bu bilgisayara** ve açılıştaki plana aittir.":
    "The state at each of the last three openings is kept apart as an automatic backup; it belongs to **this computer** and the plan open at startup.",
  "Sınıf başına **{yer}** saat var ({gun} gün × {ders} saat); girilen yük **{yuk}** saat.":
    "**{yer}** hours per class ({gun} days × {ders} lessons); the load entered is **{yuk}**.",
  "Tarayıcının bu site için ayırdığı depoda duruyor.":
    "It sits in the store the browser keeps for this site.",
  "Toplam **{yer}**; tarayıcının Mozaik’e ayırdığı yer yaklaşık **5 MB**.":
    "**{yer}** in total; the browser allows Mozaik about **5 MB**.",
  "{dosya} **bütün planlarınızdır**; yanındakiler onun gün gün duran hâlleri.":
    "{dosya} is **all of your plans**; the files beside it are its day-by-day copies.",
  "Öğretmen eklerken branş **bu listeden** seçilir, elle yazılmaz.":
    "When adding a teacher the subject is picked **from this list**, never typed.",
  "Öğretmenin açık saati, ona yüklenen ders saatinden az olamaz.": "A teacher’s open hours cannot be fewer than the hours loaded onto them.",
  "Üst çubuktaki **Kaydet** açık planı yazar; buradaki dosya **bütün planları**.":
    "**Save** above writes the open plan; this file holds **every plan**.",
  "İşareti kaldırılan şey kâğıda basılmaz.":
    "Anything unticked is left off the paper.",
  "E-posta":
    "E-mail",
  "Tek bir e-posta adresi yazılır: ad@ornek.com":
    "One e-mail address goes here: name@example.com",
  "Program e-posta uygulamanızda açılır; siz gönderirsiniz.": "The timetable opens in your email app; you send it.",
  "adres hatalı":
    "address is wrong",
  "programı boş":
    "timetable is empty",
  "e-postaya sığmıyor":
    "too long for an e-mail",
  "{kim} için e-postayı aç":
    "Open the e-mail for {kim}",
  "Bu bilgisayarda seçili bir e-posta uygulaması yok.":
    "No mail app is chosen on this computer.",
  "E-posta uygulaması açılmadıysa bu bilgisayarda seçili bir e-posta uygulaması yok.":
    "If no mail app opened, none is chosen on this computer.",
  "E-posta uygulaması açılamadı.":
    "The mail app could not be opened.",
  "{ad} · Haftalık ders programı":
    "{ad} · Weekly timetable",
  "{n}. saat": "Period {n}",
  "Ders silindi.": "Lesson deleted.",
  "{ne} silindi.": "{ne} deleted.",
  "{ne} silindi, yerleşmiş {n} saati de kalktı.": "{ne} deleted, with its {n} placed {n:hour|hours}.",
  "Yerleşmiş {n} saat havuza döndü.": "{n} placed {n:hour|hours} went back to the tray.",
  "Yerleşmiş saatler havuza döndü, sabitlenen {n} saat yerinde.": "The placed hours went back to the tray; {n} pinned {n:hour stays|hours stay} in place.",
  "{ilk}–{son}, günde {saat} saat": "{ilk}–{son}, {saat} {saat:hour|hours} a day",
  "Okulu tanıt":
    "Introduce the school",
  "Okul adını ve zili gir":
    "Enter school name and bell",
  "{n} branş":
    "{n} {n:subject|subjects}",
  "Branş ekle":
    "Add subjects",
  "Öğretmen ekle":
    "Add teachers",
  "Sınıf ekle":
    "Add classes",
  "Ders gir":
    "Enter lessons",
  "{n} kapalı saat":
    "{n} closed {n:hour|hours}",
  "Kapalı saat yoksa geçin.": "If no hours are closed, skip this.",
  "{yer} / {toplam} saat yerleşmiş":
    "{yer} / {toplam} hours placed",
  "Bu bilgisayarda bir kez yazdırıldı":
    "Printed once on this computer",
  "Sınıflara ve öğretmenlere birer sayfa":
    "One page per class and per teacher",
  "Liste tek satıra iner; ? menüsündeki Başlarken onu geri getirir.":
    "The list folds to one line; Getting started in the ? menu brings it back.",
  "Listeyi kapat":
    "Close the list",
  "{n} / {toplam} adım":
    "{n} / {toplam} steps",
  "Sıradaki: {adim}":
    "Next: {adim}",
  "Listeyi göster":
    "Show the list",
  "Listeyi daralt":
    "Fold the list",
  "yapıldı":
    "done",
  "yapılmadı":
    "not done",
  "Başlarken listesi açık mı":
    "whether the Getting started list is open",
  "Bu Mozaik onu açamıyor. Önce Mozaik’i güncelleyin, sonra dosyayı yeniden açın.":
    "This Mozaik cannot open it. Update Mozaik first, then open the file again.",
  "Dosyada öğretmen, sınıf, ders ya da derslik listesi yok; kesilmiş ya da elle düzenlenmiş olabilir. 'Kaydet' ile kaydettiğiniz dosyayı seçin.":
    "The file has no list of teachers, classes, lessons or rooms; it may have been cut short or edited by hand. Choose the file you saved with “Save”.",
  "Bu, Mozaik’in kaydettiği bir dosya değil. 'Kaydet' ile kaydettiğiniz dosyayı seçin.":
    "This is not a file Mozaik saved. Choose the file you saved with “Save”.",
  "**Mozaik başka bir pencerede de açık ve plan orada değiştirildi.** Bu penceredeki son değişiklikler kaydedilmedi. **Yenile**'ye basın.":
    "**Mozaik is also open in another window, and the plan was changed there.** The last changes in this window were not saved. Press **Reload**.",
  "**Kayıtlı plan açılışta okunamadı.** Üzerine yazılmadı. **Yenile**'ye basın; plan yine gelmezse kaydettiğiniz plan dosyasını **Dosyadan aç** ile açın.":
    "**The saved plan could not be read at startup.** Nothing was written over it. Press **Reload**; if the plan still does not come back, open your saved plan file with **Open from file**.",
  "**Kayıtlı plan daha yeni bir sürümle yazılmış.** Bu sürüm onu açamıyor ve üzerine yazmıyor; burada yapılanlar kaydedilmez. Mozaik’i güncelleyin.":
    "**The saved plan was written by a newer version.** This version cannot open it and does not write over it; what you do here is not saved. Update Mozaik.",
  "Bu taslağın içi boş. Silip yeniden oluşturabilirsiniz.":
    "This draft is empty. You can delete it and create it again.",
  "{ad}: {yuk} saat ders, {acik} açık saat. {fazla} saat haftaya sığmaz.": "{ad}: {yuk} lesson hours, {acik} open hours. {fazla} {fazla:hour does|hours do} not fit the week.",
  "{yuk} saat ders, {acik} açık saat. {fazla} saat haftaya sığmaz.": "{yuk} lesson hours, {acik} open hours. {fazla} {fazla:hour does|hours do} not fit the week.",
  "Önce bir branş seçin.":
    "Choose a subject first.",
  "Şu an **{gun} gün × {saat} saat** = haftada {yer} saat.":
    "Right now **{gun} days × {saat} hours** = {yer} hours a week.",
  "Bütün haftayı aç":
    "Open the whole week",
  "Bütün haftayı kapat":
    "Close the whole week",
  "Bir öğretmenin PDF’i: öğretmenin sayfasında PDF kaydet.": "A teacher’s PDF: use Save PDF on the teacher’s page.",

  // Keyboard on the Program and Müsaitlik grids (erisim/klavye-izgara, 2026-11-15)
  "Haftalık dersler": "Weekly lessons",
  "{gun} {n}. saat": "{gun}, period {n}",
  "açılan öğretmen saatinde": "in a teacher hour being opened",
  "yeri değişiyor": "moves",
  "kapalı": "closed",
  "açık": "open",
  "boş": "empty",
  "Bu dersin satırı ekranda değil.": "This lesson’s row is not on screen.",
  "{ders} havuza kaldırıldı.": "{ders} went back to the tray.",
  "{ders} alındı. Hedef hücreyi oklarla seçin, Enter bırakır, Esc vazgeçer.": "{ders} picked up. Choose the target cell with the arrow keys; Enter drops it, Esc cancels.",
  "Taşımadan vazgeçildi.": "Move cancelled.",
  "{acik} saat açık, {yuk} saat ders yüklenmiş": "{acik} {acik:hour|hours} open, {yuk} {yuk:hour|hours} of lessons loaded",
  "Izgaraya gir, bir daha basınca çık": "Enter the grid; press again to leave it",
  "Hücreden hücreye git": "Move from cell to cell",
  "Satırın başına veya sonuna git, Ctrl ile ilk veya son satıra": "Go to the start or end of the row; with Ctrl, to the first or last row",
  "Odaklı dersi taşımak için al (sabitse önce P)": "Pick up the focused lesson to move it (if pinned, P first)",
  "Odaklı dersi sabitle veya sabitlemeyi kaldır": "Pin or unpin the focused lesson",
  "Dersler arasında git": "Move between lessons",
  "Odaklı dersi ızgaraya koymak için al": "Pick up the focused lesson to put it on the grid",
  "Tutamakta: havuzun boyunu değiştir, Shift ile daha çok": "On the handle: resize the tray; with Shift, in bigger steps",
  "Ders eldeyken": "While holding a lesson",
  "Hedefi bir saat kaydır": "Move the target by one hour",
  "Bırakılabilecek bir sonraki saate git": "Jump to the next hour it can be dropped on",
  "Önceki veya sonraki güne git": "Go to the previous or next day",
  "Buraya bırak": "Drop it here",
  "Vazgeç, sürüklerken de": "Cancel, also while dragging",
  "Saati aç veya kapat, başlıkta bütün günü veya saati": "Open or close the hour; on a heading, the whole day or hour",
  "Ders ızgarada görünmüyor; satırı gizli olabilir.":
    "The lesson is not on the grid; its row may be hidden.",
  "Ders havuzda görünmüyor; havuz kapalı olabilir.":
    "The lesson is not visible in the tray; the tray may be closed.",
  "**{ders} dersin {saat} saati kapalı saatte kaldı.** Aşağıdaki **Göster** onu ızgarada bulur.":
    "**{ders} {ders:lesson has|lessons have} {saat} {saat:hour|hours} on a closed hour.** **Show** below finds it on the grid.",
  "Sebep ve dersler":
    "Reason and lessons",
  "{sinif} sınıfının açık saatlerinin hepsi başka derslerle dolu.":
    "Every open hour of class {sinif} is taken by other lessons.",
  "{kim} {n} saatinde kapalı": "{kim} is closed in {n} of them",
  "{n} saatinde {kim} başka sınıfta":
    "in {n} {kim} is in another class",
  "{n} saatinde {derslik} dersliği dolu":
    "in {n} room {derslik} is taken",
  "{n} saatinde bir kural izin vermiyor":
    "in {n} a rule does not allow it",
  "{sinif} sınıfının {n} boş saati var ama bu dersin blokları onlara sığmıyor.":
    "Class {sinif} has {n} free {n:hour|hours}, but this lesson’s blocks do not fit {n:it|them}.",
  "{sinif} sınıfının {n} boş saati var: {neden}.":
    "Class {sinif} has {n} free {n:hour|hours}: {neden}.",
  "{zaman}. saatlerde": "{zaman} (periods)",
  "{n} saatine {boy} saatlik ders sığmıyor":
    "{n} cannot hold its {boy}-hour lesson",
  "{n} sorun":
    "{n} {n:problem|problems}",
  "{brans} dersi de gitti.": "Its {brans} lesson went with it.",
  "{brans} dersleri de gitti.": "Its {brans} lessons went with it.",
  "{sinif} sınıfının {brans} dersi de gitti.":
    "Class {sinif} lost its {brans} lesson.",
  "{n} sınıfın {brans} dersi de gitti: {siniflar}.":
    "{n} {n:class|classes} lost {brans}: {siniflar}.",
  "Programdan {n} saat kalktı.":
    "{n} placed {n:hour was|hours were} removed from the timetable.",
  "İçeriğe geç": "Skip to content",
  "Ders günü": "School day",
  "Geri alındı.": "Undone.",
  "Geri alındı: {ne}": "Undone: {ne}",
  "Geri almak için Ctrl+Z.": "Press Ctrl+Z to undo.",
  "Arada başka bir değişiklik oldu. Ctrl+Z ile adım adım geri alın.": "Something else changed in between. Press Ctrl+Z to undo step by step.",
  "Öğretmenler, sınıflar, dersler ve dizilmiş program. Bu plan bomboş kalacak. Hemen ardından “Geri al” ile geri gelir.": "Teachers, classes, lessons and the timetable as laid out. This plan will be left completely empty. \"Undo\" right afterwards brings it back.",
  "Bu plandaki her şey silindi.": "Everything in this plan was deleted.",
  "**Açık olan plan** tamamen silinir; hemen ardından **Geri al** ile geri gelir.": "**The open plan** is wiped; **Undo** right afterwards brings it back.",
  "{kayip} Yerine 25 öğretmen, 20 sınıf, 8 derslik ve 99 ders olan örnek bir okul gelir. Diğer planlara dokunulmaz. Hemen ardından “Geri al” ile geri gelir.": "{kayip} In their place comes a sample school of 25 teachers, 20 classes, 8 rooms and 99 lessons. The other plans are untouched. \"Undo\" right afterwards brings yours back.",
  "Derslik silindi.": "Room deleted.",
  "{ad} dersliği silindi.": "Room {ad} deleted.",
  "{ad} dersliği silindi, {sinif} sınıfının dersliği boşaldı.": "Room {ad} deleted; class {sinif} has no room now.",
  "{ad} dersliği silindi, {n} sınıfın dersliği boşaldı ({hangileri}). Bu sınıflar artık aynı saate konabilir.": "Room {ad} deleted; {n} {n:class has|classes have} no room now ({hangileri}). These classes can now be placed at the same hour.",
  "Öğretmen silindi.": "Teacher deleted.",
  "Sınıf silindi.": "Class deleted.",
  "“{ad}” branşı listeden çıkarıldı.": "\"{ad}\" was removed from the subject list.",
  "Program yeniden yapıldı.": "The timetable was made again.",
  "Program yeniden yapıldı, sabitlenen {n} saat yerinde kaldı.": "The timetable was made again; {n} pinned {n:hour|hours} stayed in place.",
  "Açıklama: {konu}": "Explanation: {konu}",
  "Daha fazla": "More",
  "Dosya": "File",
  "Tercih": "Preference",
  "Yeni dönem için kopyala": "Copy for a new term",
  "Ara ve yap": "Search and do",
  "Planlar arasında geçiş yapar": "Switches between plans",
  "Yeni dönem için bir kopya açıldı: dersler duruyor, program boş. Eski plan Dosya → Planlar ve yedek’te.": "A copy for the new term is open: the lessons are there, the timetable is empty. The old plan is in File → Plans and backup.",
  "Gizlensin": "Hidden",
  "Yerleşmiş dersi sürükleyerek taşıyın · Klavye: T ile alın": "Drag a placed lesson to move it · Keyboard: pick it up with T",
  "Dersleri gir": "Enter the lessons",
  "Kapalı saatleri işaretle": "Mark the closed hours",
  "{d} derslik · {b} branş · {o} öğretmen · {s} sınıf": "{d} {d:room|rooms} · {b} {b:subject|subjects} · {o} {o:teacher|teachers} · {s} {s:class|classes}",
  "Başlarken listesini göster": "Show the getting started list",
  "Teknik bilgiler": "Technical details",
  "**Program tamam.** Bütün dersler yerleşti ve kurallara uyuyor.": "**The timetable is complete.** Every lesson is placed and keeps to the rules.",
  "Yazdır": "Print",
  "Açık plan": "Open plan",
  "Seviye": "Level",
  "{toplam} öğretmenin ilk {kac} tanesi.": "The first {kac} of {toplam} {toplam:teacher|teachers}.",
  "Bu dosya bütün planları içeren bir dosya değil. Tek bir planı üst çubuktaki Dosya menüsünden “Dosyadan aç” ile açabilirsiniz.": "This is not a file with every plan in it. Open a single plan with “Open from file” in the File menu of the top bar.",
  "“{plan}” planı okunamıyor, bu yüzden hiçbir plan klasöre yazılmıyor.": "The plan \"{plan}\" cannot be read, so no plan is being written to the folder.",
  "**Plan bu bilgisayarda boş açıldı, ama {klasor} klasöründe daha dolu bir plan dosyası var:** {dosya}, {ogretmen} öğretmen ve {ders} ders. Siz seçene kadar klasöre hiçbir şey yazılmıyor.": "**The plan opened empty on this computer, but the {klasor} folder holds a fuller plan file:** {dosya}, {ogretmen} {ogretmen:teacher|teachers} and {ders} {ders:lesson|lessons}. Nothing is written to the folder until you choose.",
  "Belgelerim’deki son kaydı aç": "Open the last save in Documents",
  "Boş başla": "Start empty",
  "**Plan çok küçüldü:** {ogretmen} öğretmen ve {ders} ders kaldı, klasördeki son plan dosyasında {eskiOgretmen} öğretmen ve {eskiDers} ders var. O dosya korundu, yeni hâli **{dosya}** adıyla ayrıca yazıldı.": "**The plan shrank a lot:** {ogretmen} {ogretmen:teacher|teachers} and {ders} {ders:lesson|lessons} are left, and the last plan file in the folder has {eskiOgretmen} {eskiOgretmen:teacher|teachers} and {eskiDers} {eskiDers:lesson|lessons}. That file was kept; the new state was written separately as **{dosya}**.",
  "Yeni hâlini asıl dosya yap": "Make the new state the main file",
  "{ne} Son silmeyi geri almak için:": "{ne} To undo the last deletion:",
  "Geri getir": "Bring back",
  "Son silme geri alındı.": "The last deletion was undone.",
  "son silmeden önceki hâl": "the plan before the last deletion",
  "Kimliği eksik ya da tekrarlanan plan: {adlar}.": "Plan with a missing or repeated id: {adlar}.",
  "Siz seçene kadar klasöre hiçbir şey yazılmıyor.": "Nothing is written to the folder until you choose.",
  "Klasördeki son plan dosyasının yerine bu küçük plan yazılır. Eski hâli günlük yedeklerde kalır.": "This smaller plan is written over the last plan file in the folder. The old state stays in the daily backups.",

  // src/pure/solver (2026-11-16)
  "{kim}: {yuk} saat ders, {acik} açık saat; {fazla} saat açılmalı": "{kim}: {yuk} hours of lessons, {acik} open; {fazla} more must be opened",
  "{sinif}: {yuk} saat ders, {acik} açık saat; {fazla} saat açılmalı": "{sinif}: {yuk} hours of lessons, {acik} open; {fazla} more must be opened",
  "{derslik} dersliği: {yuk} saat ders, {acik} açık saat; {fazla} saat açılmalı ya da bir sınıf başka dersliğe geçmeli": "Room {derslik}: {yuk} hours of lessons, {acik} open; open {fazla} more or move a class to another room",
  "{bir} ile {iki} aynı güne konmamalı: {n1} + {n2} gün gerekiyor, {g} gün var": "{bir} and {iki} may not share a day: {n1} + {n2} days are needed, there are {g}",
  // The plan-file reminder and the move to the new address (2026-11-16).
  "son plan dosyasının tarihi":
    "date of the last plan file",
  "**Bu planın bir plan dosyası yok.** Yaptıklarınız yalnız bu tarayıcıda duruyor.":
    "**This plan has no plan file.** What you have done is only in this browser.",
  "**Son plan dosyası {tarih} tarihli.** Ondan sonra yaptıklarınız yalnız bu tarayıcıda duruyor.":
    "**The last plan file is from {tarih}.** What you have done since then is only in this browser.",
  "Son plan dosyası: {tarih}.":
    "Last plan file: {tarih}.",
  "Eski adresteki planlar buraya gelsin mi?":
    "Bring the plans from the old address here?",
  "**Planlar bir plan dosyasına yazıldı** (İndirilenler). Yeni adreste **Bütün planları dosyadan aç** ile açın.": "**The plans were written to a plan file** (Downloads). At the new address, open it with **Open all from file**.",
  "**Planlar yeni adrese taşındı.** Bundan sonra orayı kullanın:":
    "**The plans have moved to the new address.** From now on, use it:",
  "Yeni adres açıldı. Oradaki soruyu cevaplayın.":
    "The new address has opened. Answer the question there.",
  "**Mozaik yeni adresine taşındı.** Planlarınız burada da kalır.":
    "**Mozaik has moved to a new address.** Your plans also stay here.",
  "Hiçbir plan taşınmadı.":
    "No plan was moved.",
  "Planları taşı":
    "Move plans",
  // ------------------------------------------- the person page (K5)
  "Sayfasını aç":
    "Open page",
  "Gönder":
    "Send",
  "Göndermek için Bilgiler’de e-posta adresini yazın.":
    "To send, type the e-mail address under Details.",
  "Bilgiler":
    "Details",
  "Kapalı saatler":
    "Closed hours",
  "{kim} · kapalı saatler":
    "{kim} · closed hours",
  "{ne} · Haftalık saat":
    "{ne} · Weekly hours",
  "saat":
    "h",
  "Sınırları":
    "Limits",
  "Boş kutu okul ayarını kullanır; yazılan sayı onun yerine geçer.":
    "An empty box uses the school setting; a number typed here replaces it.",
  "Okul ayarı geçerli: {n}":
    "School setting applies: {n}",
  "Kendi sayısı; okul ayarı: {n}":
    "Own number; school setting: {n}",
  "Öğretmeni sil":
    "Delete teacher",
  "Sınıfı sil":
    "Delete class",
  "+ Yeni öğretmen":
    "+ New teacher",
  "+ Yeni sınıf":
    "+ New class",
  "{n} saat kapalı":
    "{n} {n:hour|hours} closed",
  "{n} saat fazla":
    "{n} {n:hour|hours} too many",
  // ------------------------------------------- the person page (K5)
  "Kapattığınız saatlerde {n} ders kaldı; silinmedi, haftalık programda kırmızı.":
    "{n} {n:lesson is|lessons are} still on hours you closed; nothing was deleted, they are red in the weekly timetable.",
  // ------------------------------------------- the person page (K5)
  "Branş **listeden seçilir**; kısa ad ızgarada satır başlığı olur.":
    "The subject is **picked from the list**; the short name heads the grid row.",
  "Aynı programı paylaşan öğrenci grubu; **derslik** sınıfın sabit dersliğidir.":
    "A group of pupils sharing one timetable; the **room** is that class’s fixed room.",
  // -------------------------------------------- Sadeleşme, K1–K3 (2026-11-16)
  "Okul bilgileri":
    "School details",
  "Yazdır ve gönder":
    "Print and send",
  "Neden yerleşmedi?":
    "Why is it not placed?",
  "Kopya açıldı. Eski plana üst çubuktaki plan seçiciyle dönülür.":
    "Copy opened. The plan picker in the top bar goes back to the old plan.",
  "Önce **Öğretmenler** ve **Sınıflar** sekmelerinde öğretmenleri ve sınıfları, sonra her sınıfın derslerini girin.":
    "First enter the teachers and classes in the **Teachers** and **Classes** tabs, then each class’s lessons.",
  "Yazdırmaya geç":
    "Go to printing",
  "Saatler ders konduktan **sonra** kapatıldı, hiçbir ders silinmedi. Dersi açık bir saate sürükleyin ya da saati kişinin sayfasında açın.":
    "The hours were closed **after** the lessons were placed; nothing was deleted. Drag the lesson to an open hour, or open the hour on the person’s page.",
  "Bu derslere konacak hücre kalmamış. Dersin adı onu havuzda gösterir; yer açmak için kişinin sayfasında saat açın ya da bir dersi taşıyın.":
    "No cell is left for these lessons. A lesson’s name shows it in the tray; to make room, open hours on the person’s page or move a lesson.",
  "Program, **Okul bilgileri → Kurallar**'da girdiğiniz sınırları aşıyor.":
    "The timetable goes past the limits you set under **School details → Rules**.",
  "Tek bir planı değil, bu bilgisayardaki bütün planların yerine geçer. Okul bilgileri → Planlar ve yedek bölümündeki “Bütün planları dosyadan aç” düğmesini kullanın.": "It replaces every plan on this computer, not a single one. Use the \"Open all from file\" button in School details → Plans and backup.",
  "**Kurulum tamamlanamadı** (kod {kod}). Mozaik eski hâliyle açıldı, planlarınız yerinde. Bilgisayarı yeniden başlatıp Okul bilgileri → Hakkında’dan tekrar deneyebilirsiniz.":
    "**The installation did not finish** (code {kod}). Mozaik opened as it was, your plans are in place. Restart the computer and try again from School details → About.",
  "Aynısı sınıf için. Yalnız Programın durumu’nda sayılır.": "The same for a class. Counted only in Timetable status.",
  "Bu bilgisayara aittir ve **yazdırmayı etkilemez**; kâğıdın yazısı **Yazdır ve gönder** sekmesinde.":
    "It belongs to this computer and **does not affect printing**; paper type is under **Print and send**.",
  "Bir dersin saatini azaltın ya da kişinin sayfasında kapalı saat açın.":
    "Reduce the hours of a lesson, or open closed hours on the person’s page.",
  "Ders eklemek için önce en az bir öğretmen ve bir sınıf girin.":
    "To add a lesson, first enter at least one teacher and one class.",
  "**Sınıflar → Dersler**’de ders silinebilir, yeni ders eklenebilir.":
    "Lessons can be deleted and added under **Classes → Lessons**.",
  "Önce dersleri girip **Program** sekmesinde programı yapın.":
    "First enter the lessons, then make the timetable in the **Timetable** tab.",
  "Bu plandaki öteki programlarda da {n} saat kalkacak.":
    "{n} {n:hour|hours} will also go from the other timetables in this plan.",
  "Dersliğin kapalı olduğu saatlere tıklayın. O dersliği kullanan sınıflar o saatte ders yapamaz.":
    "Click the hours the room is closed. Classes using that room cannot have lessons then.",
  "Bir öğretmene özel sayı: **Öğretmenler** listesinde kişinin sayfası.":
    "For one teacher: their page, from the **Teachers** list.",
  "Bir sınıfa özel sayı: **Sınıflar** listesinde sınıfın sayfası.":
    "For one class: its page, from the **Classes** list.",
  "Henüz öğretmen yok. **Öğretmenler** sekmesinden ekleyin; burası o listeyi gösterir.":
    "No teachers yet. Add them in the **Teachers** tab; this shows that list.",
  "Excel’deki bir listeyi almak için listelerin başındaki Excel’den yapıştır düğmesini kullanın.":
    "To bring in a list from Excel, use the “Paste from Excel” button at the top of the lists.",
  // ------------------------------------------- Eski hâline dön (K8)
  "Eski hâline dön": "Go back to an earlier day",
  "Dünkü hâline dön": "Go back to yesterday",
  "Bu hâline dön": "Go back to this day",
  "Mozaik her gün bu planın bir kopyasını kendiliğinden saklar, **son 7 gün** burada. Döndüğünüzde şimdiki hâli de saklanır ve **Geri al** ile geri gelir.": "Every day Mozaik keeps a copy of this plan by itself; the **last 7 days** are here. When you go back, the plan as it is now is kept too, and **Undo** brings it back.",
  "Henüz eski bir kopya yok. İlki, yarın bir şey değiştirdiğinizde burada olur.": "No earlier copy yet. The first one will be here tomorrow, once you change something.",
  "Plan eski hâline döndü: {gun}.": "The plan is back as it was: {gun}.",
  "günlük kopya": "daily copy",
  "{hafta} {gun} {ay}": "{hafta} {gun} {ay}",
  "Sayfa {n} / {m}": "Page {n} of {m}",
  "Telefon": "Phone",
  "Göndermek için Bilgiler’de telefon numarasını yazın.": "To send it, enter the phone number under Details.",
  "PDF kaydet": "Save PDF",
  "{ad} İndirilenler klasörüne kaydedildi. İletiye ya da sohbete ataşla ekleyin.": "{ad} was saved in the Downloads folder. Attach it to the message or chat with the paperclip.",
  // ------------------------------------------- the dated layer (DayDialog.tsx)
  "Boş geçsin": "Class free",
  "Bu gün değişen ders yok.": "No lesson changes this day.",
  "bu hafta {n}": "{n} this week",
  "Bu hafta: {gunler}, {n} değişiklik": "This week: {gunler}, {n} {n:change|changes}",
  "Bu haftanın değişikliklerini sil": "Remove this week’s changes",
  "Bugün kim yok?": "Who is away today?",
  "Yok olan ekle…": "Add someone away…",
  "Yok olanlar": "Away",
  "Bugün yok…": "Away today…",
  "İkame listesi": "Cover list",
  "İkame: bu hafta {m}, toplam {n} saat": "Cover: {m} this week, {n} {n:hour|hours} in all",
  "Seçilmedi": "Not chosen",
  "Son gün": "Last day",
  "Yerine": "Covered by",
  "Değişen": "Changed",
  "Temel haftaya dön": "Back to the usual week",
  "{n}. saate": "To period {n}",
  "Bir dersi değiştir…": "Change a lesson…",
  "Programda göster": "Show on the timetable",
  "Ayrı plan yap":
    "Make it a plan of its own",
  "Önceki programa dön": "Back to the previous timetable",
  "Yok say": "Ignore",
  "{n}. sütun": "Column {n}",
  "Daha büyük": "Larger",
  "Çok büyük": "Very large",
  "Yazıyı büyüt": "Larger text",
  "Branşa göre süz": "Filter by subject",
  "4 saat: 2+2 = iki gün ikişer saat": "4 hours: 2+2 = two days, two hours each",
  "son 7 gün": "last 7 days",
  "bütün planlar": "all plans",
  "Ders süresi (dk)": "Lesson length (min)",
  "Ekrandaki plan dosyadakiyle değiştirilecek. Bundan sonra “Geri al” bu açılıştan öncesine dönemez. Vazgeçme ihtimaliniz varsa önce “Kaydet” deyin.": "The plan on screen will be replaced by the one in the file. After that, “Undo” cannot go back past this opening. If you may change your mind, press “Save” first.",
  "**Mozaik burada kendini günceller.** Yeni sürüm çıkınca üstte bir satır belirir; **Yenile** demedikçe hiçbir şey değişmez.": "**Mozaik updates itself here.** A line appears at the top when a new version is out; nothing changes until **Reload**.",
  "Mozaik kendiliğinden saklıyor; dosya taşımak ve saklamak için.": "Mozaik saves by itself; the file is for moving and keeping a copy.",
  "WhatsApp açılamadı.": "WhatsApp could not be opened.",
  "İpuçları": "Tips",
  "Kapalı gün": "Closed day",
  "{n} aşım": "{n} {n:breach|breaches}",
  "Hepsini seç": "Select all",
  "Hiçbirini seçme": "Select none",
  "E-postayla gönder": "Send by email",
  "WhatsApp’la gönder": "Send on WhatsApp",
  "{n} öğretmenin e-posta adresi yok.": "{n} {n:teacher has|teachers have} no email address.",
  "Hep görünsün": "Always shown",
  "Kaydırınca gizlensin": "Hide on scroll",
  "Kural aşımları": "Rule breaches",
  "Yeni sürüm notu var": "There is a new release note",
  // ------------------------------------------- denetim/kisi: kişi sayfası, Özet, Hepsi
  "{ad} bugün yok olarak işaretle": "Mark {ad} as away today",
  "Bütün öğretmenler saatlerine sığıyor.": "All teachers fit their hours.",
  "Bütün sınıflar saatlerine sığıyor.": "All classes fit their hours.",
  "Hepsi": "All",
  "Diğer bilgiler": "More details",
  "{ne} · {brans} dersi için işlemler": "Actions for the {ne} · {brans} lesson",
  "Kalanı diz": "Place the rest",
  "Sabitle": "Pin",
  "{ders} yerleşti ve sabitlendi.": "{ders} placed and pinned.",
  "{ders} yerleşti ve sabitlendi: {yer}.": "{ders} placed and pinned: {yer}.",
  "{olay}, yerlerinde sabitlendi.": "{olay}; pinned where they are.",
  "{ders} yerleşti ve sabitlendi; {olay}.": "{ders} placed and pinned; {olay}.",
  "Kalan dizildi, {adlar} yer değiştirdi.": "The rest is placed; {adlar} moved.",
  "Kalan dizildi, {adlar} ve {n} ders daha yer değiştirdi.": "The rest is placed; {adlar} and {n} more {n:lesson|lessons} moved.",
  "Bekleyen dersleri kurallara uyarak yerleştirir; sabitlenenlere dokunmaz (elle koyduklarınız sabitlenir)": "Places the lessons not yet placed, keeping to the rules; pinned lessons stay (what you place by hand is pinned)",
  "Dersi yerinden oynatılabilir yapar: Kalanı diz ya da Yeniden yap taşıyabilir.": "Lets the lesson move again: Place the rest or Place again may move it.",
  "Dersi bulunduğu yerde tutar: Kalanı diz ve Yeniden yap ona dokunmaz.": "Keeps the lesson where it is: Place the rest and Place again leave it alone.",
  "Bu ders sabitlenmiş. Taşımak için önce P ile sabitlemeyi kaldırın.": "This lesson is pinned. To move it, unpin it first with P.",
  "Dersleri yerleştirmek için Kalanı diz düğmesine basın.": "To place the lessons, press the Place the rest button.",
  "Renkler neye göre": "Colours by",
  "{ad} bugün yok olarak işaretlendi.": "{ad} was marked as away today.",
  "{ad} İndirilenler klasörüne kaydedildi.": "{ad} was saved in the Downloads folder.",
  "Dikkat: ders {eski} idi, {kim} {yeni} öğretmeni; ders {yeni} olarak görünecek.": "Note: the lesson was {eski}, {kim} teaches {yeni}; the lesson will show as {yeni}.",
  "Okulun adı, zili, öğretmenleri ve sınıfları.": "The school’s name, bell, teachers and classes.",
  "Kendi okulum": "My own school",
  "Boş bir plan açıldı. Örnek okul, plan seçicide duruyor.": "An empty plan was opened. The sample school stays in the plan picker.",
  "Bu örnek okul.": "This is the sample school.",
  "Kendi okulumla başla": "Start with my own school",
  "? Yardım": "? Help",
  "Açık renk": "Light",
  "Tam": "Full",
  "Okula geldiği gün boşuna gelmesin. Yalnız Programın durumu’nda sayılır.": "So that nobody comes in for nothing on a day they are at school. Counted only in Timetable status.",
  "Kapatmak ya da açmak istediğiniz saate tıklayın.": "Click the hour you want to close or open.",
};

registerSozluk("en", EN);
