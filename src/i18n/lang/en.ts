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
import { registerSozluk } from "../index";
import type { Sozluk } from "../index";

const EN: Sozluk = {
  "Kartların renk ölçütü": "Card colour criterion",
  "program kart rengi tercihi": "timetable card colour preference",
  "{bir} ile {iki} yer değiştirecek": "{bir} and {iki} will swap places",
  "{bir} ile {iki} yer değiştirdi": "{bir} and {iki} swapped places",
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
  Pzt: "Mon",
  Sal: "Tue",
  Çar: "Wed",
  Per: "Thu",
  Cum: "Fri",
  Cmt: "Sat",
  Pzr: "Sun",
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
  Mat: "Mth",
  Fzk: "Phy",
  Geo: "Geo",
  Kim: "Who",
  Biy: "Bio",
  Trk: "Tur",
  Edb: "Lit",
  Tar: "His",
  Coğ: "Gph",
  İng: "Eng",
  Fel: "Phi",
  Din: "Rel",
  Alm: "Ger",
  Fra: "Fre",
  Müz: "Mus",
  Res: "Art",
  Bed: "PE",
  Sos: "Soc",
  Fen: "Sci",
  Reh: "Gui",
  İnk: "Ref",

  // src/App.tsx
  "Dosyaya kaydet": "Save to file",
  "yedek al": "make a backup",
  "Yedek dosyaya yazıldı. İndirilenler klasörüne bakın.":
    "Backup written to a file. Look in your Downloads folder.",
  "Otomatik diz": "Fill automatically",
  Program: "Timetable",
  "Açık temaya geç": "Switch to the light theme",
  "Koyu temaya geç": "Switch to the dark theme",
  "Araç şeridini gizle": "Hide the tool strip",
  "Araç şeridini göster": "Show the tool strip",
  "Animasyonları aç": "Turn animations on",
  "Animasyonları kapat": "Turn animations off",
  "Ayarlar → Görünüm": "Settings → Appearance",
  "Bu dosya bütün planları içeriyor": "This file holds every plan",
  "Bu dosya daha yeni bir sürümle yazılmış":
    "This file was written by a newer version",
  "Bu dosya okunamadı": "This file could not be read",
  'Tek bir planı değil, bu bilgisayardaki bütün planların yerine geçer. Ayarlar → Planlar ve yedek bölümündeki "Tümünü dosyadan aç" düğmesini kullanın.':
    'It replaces every plan on this computer, not a single one. Use the "Open all from file" button in Settings → Plans and backup.',
  "Programı güncelleyin, sonra tekrar deneyin.":
    "Update the program, then try again.",
  "Program tarafından indirilmiş bir .json yedek dosyası seçin.":
    "Choose a .json backup file this program downloaded.",
  "Şu anki programın yerine geçecek":
    "It will replace the timetable you have now",
  'Ekrandaki plan dosyadakiyle değiştirilecek ve geri alma geçmişi sıfırlanacak. Vazgeçme ihtimaliniz varsa önce "Dosyaya kaydet" deyin.':
    'The plan on screen is replaced by the one in the file and the undo history is cleared. If you might change your mind, choose "Save to file" first.',
  "Yedeği yükle": "Load the backup",
  "Yedek yüklendi.": "Backup loaded.",
  Bölümler: "Sections",
  "Programın durumu: {durum}. Ayrıntı için Kontrol.":
    "Timetable status: {durum}. See Check for details.",
  "{durum}. Kontrol sekmesini açar": "{durum}. Opens the Check tab",
  Plan: "Plan",
  "Planlar arasında geçiş yapar. Yeni plan, ad değiştirme ve silme: Ayarlar → Planlar ve yedek":
    "Switches between plans. New plan, rename and delete: Settings → Plans and backup",
  "Geri al": "Undo",
  "Geri al (Ctrl+Z)": "Undo (Ctrl+Z)",
  "İleri al": "Redo",
  "İleri al (Ctrl+Y)": "Redo (Ctrl+Y)",
  "Programı bir .json dosyasına yazar. Program bu bilgisayarda kendiliğinden saklanıyor; dosya taşımak ve yedeklemek için.":
    "Writes the timetable to a .json file. The program saves itself on this computer already; the file is for moving and keeping a copy.",
  "Daha önce kaydedilmiş bir .json dosyasını açar":
    "Opens a .json file saved earlier",
  "Dosyadan aç": "Open from file",
  "Ara ve git": "Search and go",
  "Ara ve git (Ctrl+K)": "Search and go (Ctrl+K)",
  "Klavye kısayolları": "Keyboard shortcuts",
  "Klavye kısayolları (?)": "Keyboard shortcuts (?)",
  // -------------------------------------------------- ShortcutsHelp.tsx
  "Genel kısayollar": "General",
  "Komut paletini aç/kapat": "Toggle the command palette",
  "Bir sekmeye git": "Go to a section",
  "Bu ekranı aç": "Open this screen",
  "İptal et veya kapat": "Cancel or close",
  "Odaklı dersi havuza kaldır": "Send the focused lesson back to the tray",
  "Odaklı kartın sağ tık menüsünü aç":
    "Open the focused card's right-click menu",
  Listeler: "Lists",
  "Yeni satır ekle veya düzenlemeyi onayla":
    "Add a new row or confirm an edit",
  "Tutamaktan bir satırı sırada taşı": "Move a row in order, from its handle",
  "Satırı listenin başına veya sonuna taşı":
    "Move the row to the top or bottom of the list",
  Diyaloglar: "Dialogs",
  Onayla: "Confirm",
  "Araç şeridi": "Tool strip",
  "Araç şeridini gizle, ızgaraya bir satır daha kalsın":
    "Hide the tool strip and leave the grid one more row",
  "Koyu tema": "Dark theme",
  Yenile: "Reload",
  Sonra: "Later",
  "Klasörü düzelt": "Fix the folder",
  "**Bu bilgisayarda otomatik kayıt çalışmıyor.** Program kapanınca yaptığınız her şey kaybolur. Çalışırken sık sık **Dosyaya kaydet** düğmesine basın ve bilgisayarı kapatmadan önce mutlaka bir yedek alın.":
    "**Automatic saving does not work on this computer.** Everything you do is lost when the program closes. Press **Save to file** often while you work, and always take a backup before shutting the computer down.",
  "**Yeni sürüm hazır.** Şu an {surum} sürümünü kullanıyorsunuz; yenisi **Yenile** deyince gelir. İşiniz kaybolmaz.":
    "**A new version is ready.** You are on {surum}; the new one arrives when you press **Reload**. Your work is not lost.",
  "**{klasor}** klasörüne yazılamıyor: tarayıcı izni sormadan devam etmiyor. İşiniz şu an yalnız bu tarayıcıda duruyor.":
    "Cannot write to the **{klasor}** folder: the browser will not go on without asking for permission. Right now your work is only in this browser.",
  "**{klasor}** klasörüne **yazılamıyor**. {sebep} İşiniz şu an yalnız bu tarayıcıda duruyor.":
    "**Cannot write** to the **{klasor}** folder. {sebep} Right now your work is only in this browser.",

  // src/components/Availability.tsx
  "{ad} sınıfı": "class {ad}",
  "{ad} dersliği": "room {ad}",
  "Müsait olmayan saatler": "Unavailable hours",
  "Önce {ne} ekleyin.": "Add a {ne} first.",
  "{kim} · müsait olmayan saatler": "{kim} · unavailable hours",
  "Basılı tutup sürükleyerek birden çok hücre işaretleyebilirsiniz. Soldaki gün adına tıklayınca o günün tamamı, üstteki ders numarasına tıklayınca haftanın o saati değişir.":
    "Hold and drag to mark several cells at once. Clicking a day name on the left flips the whole day; clicking a period number on top flips that hour across the week.",
  "Haftanın bu saatini değiştir": "Flip this hour of the week",
  "{gun}: bütün günü değiştir": "{gun}: flip the whole day",
  "Haftanın darlığı": "How tight the week is",
  "{gun} {ders}. ders: {kapali} / {toplam} kapalı":
    "{gun}, period {ders}: {kapali} of {toplam} closed",
  "Kimin saatleri": "Whose hours",
  "Müsaitlik listesi": "Availability list",
  "Tümünü aç": "Open all",
  "Tümünü kapat": "Close all",
  "{n} saat fazla, bu program dizilemez.":
    "{n} {n:hour|hours} too many; this timetable cannot be laid out.",
  ", {n} tanesi {kim} üzerinde": ", {n} of them on {kim}",
  "Müsaitlik girebilmek için **Okul** sekmesinden en az bir {ne} eklemeniz gerekiyor.":
    "To enter availability you need at least one {ne} from the **School** tab.",
  "**{kim}**: {acik} saat açık, {yuk} saat ders yüklenmiş.":
    "**{kim}**: {acik} hours open, {yuk} hours of lessons loaded.",
  "**Kapattığınız saatlerde yerleşmiş {n} ders var{kimde}.** Hiçbiri silinmedi. **Program** sekmesinde kırmızı çerçeveyle, **Kontrol** sekmesinde tek tek listeleniyor.":
    "**{n} placed {n:lesson sits|lessons sit} in hours you have closed{kimde}.** None was deleted. They are outlined in red in the **Timetable** tab and listed one by one in **Check**.",

  // src/components/CapacityRows.tsx
  Ad: "Name",
  Açık: "Open",
  Yük: "Load",
  Durum: "Status",

  // src/components/Check.tsx
  "Kontrol edilecek bir şey yok.": "There is nothing to check yet.",
  İmkânsız: "Impossible",
  "Programın durumu": "Timetable status",
  "Yerleşmiş saat": "Hours placed",
  "Tamamlanan ders": "Lessons finished",
  "Haftanın doluluğu": "How full the week is",
  "Boş kalan sınıf saati": "Free class hours left",
  "Kapalı saatte ders ({n})": "Lessons in a closed hour ({n})",
  Açıklama: "Explanation",
  "Kapalı saat": "Closed hours",
  "Kural ihlalleri ({n})": "Rule breaches ({n})",
  "Kural dışı": "Against a rule",
  Uyarı: "Warning",
  "Yerleşemeyen dersler ({n})": "Lessons that cannot be placed ({n})",
  Ders: "Lesson",
  Sebep: "Reason",
  Öğretmenler: "Teachers",
  "Öğretmenin müsait saat sayısı, ona yüklenen ders saatinden az olamaz.":
    "A teacher's available hours cannot be fewer than the hours loaded onto them.",
  Sınıflar: "Classes",
  "Sınıfa yüklenen toplam ders saati, sınıfın AÇIK olduğu saatlere sığmalı.":
    "The total hours loaded onto a class must fit into the hours that class is OPEN.",
  Derslikler: "Rooms",
  "Aynı dersliği paylaşan sınıfların TOPLAM ders saati de haftaya sığmalı. En çok gözden kaçan darboğaz burasıdır.":
    "The TOTAL hours of the classes sharing one room must also fit into the week. This is the bottleneck most often missed.",
  "**Okul** sekmesinden öğretmenleri, sınıfları ve dersleri girdikten sonra buraya dönün. Bu sayfa programın dizilip dizilemeyeceğini önceden söyler.":
    "Come back here once you have entered teachers, classes and lessons in the **School** tab. This page tells you in advance whether the timetable can be laid out at all.",
  "**Sorun görünmüyor.** Öğretmen müsaitlikleri, sınıf ve derslik kapasiteleri yüklenen ders saatlerini karşılıyor. Program dizilebilir.":
    "**Nothing looks wrong.** Teacher availability and class and room capacity cover the hours loaded. The timetable can be laid out.",
  "**Dikkat edilmesi gereken noktalar var.** Aşağıdaki listelerde":
    "**There are things worth looking at.** In the lists below, rows marked",
  "yazan satırlar programın dizilmesini engeller. Önce onları çözün.":
    "stop the timetable from being laid out. Resolve those first.",
  "Kalan **{n}** saat havuzda bekliyor. **Program** sekmesindeki **Otomatik diz** ile yerleştirebilirsiniz.":
    "The remaining **{n}** hours are waiting in the tray. You can place them with **Fill automatically** in the **Timetable** tab.",
  "Danışman uyarıları ({n})": "Advisor notes ({n})",
  "Bunlar programı engellemez; veri girişinde gözden kaçmış olabilecek noktalardır.":
    "These do not block the timetable; they are points that may have been overlooked while entering data.",
  "Danışmanın söyleyecek bir şeyi yok.": "The advisor has nothing to say.",
  Öneri: "Note",

  // src/components/ColorPick.tsx
  Vazgeç: "Cancel",

  // src/components/Commands.tsx
  Git: "Go to",
  Yap: "Do",
  "derslik yok": "no room",
  "{n} sınıf": "{n} {n:class|classes}",

  // src/components/DraftStart.tsx
  "Bu taslağın verisi bulunamadı": "This draft's data could not be found",
  'Plan listesinde duruyor ama kendi anahtarı boş. Ayarlar → Hakkında → "Veriler nerede" tablosu hangi anahtarın kaç bayt tuttuğunu gösterir.':
    'It is in the plan list but its own key is empty. The "Where the data is" table in Settings → About shows how many bytes each key holds.',
  "{ad} kopyası": "copy of {ad}",
  '"{ad}" taslağından yeni bir plan açıldı.':
    'A new plan was opened from the "{ad}" draft.',

  // src/components/Grid.tsx
  "Öğle arası": "Lunch break",
  "{ust} {alt}, kaldırmak için Delete": "{ust} {alt}, press Delete to remove",
  "Sürükleyerek taşıyın · sağ tık: seçenekler":
    "Drag to move · right-click for options",
  "{sorun}. Sürükleyerek taşıyın, sağ tıkla seçenekleri açın":
    "{sorun}. Drag to move, right-click for options",
  "{ust} {alt}, sabitlenmiş": "{ust} {alt}, pinned",
  "Sabitlenmiş. Sağ tıkla sabitlemeyi kaldırabilirsiniz":
    "Pinned. Right-click to unpin",

  // src/components/Program.tsx — the grid's own menu
  "Havuza kaldır": "Send to tray",
  sabitlenmiş: "pinned",
  "Dersi düzenle": "Edit lesson",
  "Dersi buraya sabitle": "Pin lesson here",
  "Sabitlemeyi kaldır": "Unpin",
  "Bu ders sabitlenmiş. Önce sabitlemeyi kaldırın.":
    "This lesson is pinned. Unpin it first.",
  "Ders sabitlendi.": "Lesson pinned.",
  "Sabitleme kaldırıldı.": "Lesson unpinned.",

  // src/components/LessonEdit.tsx
  "Günde en fazla": "Most per day",
  "Dağılım değiştirilirse bu dersin programdaki yerleşimleri kalkar, sabitlenmiş olanlar da":
    "Changing the split clears this lesson from the timetable, pinned blocks included",

  // src/components/Ribbon.tsx — what the two destructive questions promise
  "Sabitlenen {n} saat yerinde kalır, gerisi sıfırdan dizilir. Ctrl+Z ile geri alınabilir.":
    "The {n} pinned hours stay where they are; the rest is laid out from scratch. Ctrl+Z undoes it.",
  "Sabitlenen {n} saat yerinde kalır. Dersler, öğretmenler ve müsaitlikler olduğu gibi kalır. Ctrl+Z ile geri alınabilir.":
    "The {n} pinned hours stay where they are. Lessons, teachers and time off are untouched. Ctrl+Z undoes it.",
  "{ad}: bilgileri ve haftalık programı": "{ad}: details and weekly timetable",

  // src/components/Inspector.tsx
  Kapat: "Close",
  "Haftalık programı": "Weekly timetable",
  "Kayıt bulunamadı": "No record found",

  // src/components/LessonPool.tsx
  "Yerleşmeyi bekleyen dersler": "Lessons waiting to be placed",
  "Havuz yüksekliği": "Tray height",
  "Sürükleyerek havuzun boyunu ayarlayın": "Drag to set the tray's height",
  Havuz: "Tray",
  "Havuzu kapat: ızgara bütün yüksekliği alır":
    "Close the tray: the grid takes the full height",
  "Havuzu aç": "Open the tray",
  "Hepsi yerleşti": "All placed",
  "{n} dersin tamamı programda":
    "all {n} {n:lesson|lessons} are on the timetable",
  "{n} blok bekliyor": "{n} {n:block is|blocks are} waiting",
  "{n} saat · sürükleyip bırakın": "{n} {n:hour|hours} · drag and drop",
  "{ust} · {alt} {brans} · {boy} saatlik blok":
    "{ust} · {alt} {brans} · {boy}-hour block",
  " · {n} tane bekliyor": " · {n} waiting",
  " · dersin {yerlesen}/{toplam} saati yerleşti":
    " · {yerlesen} of the lesson's {toplam} hours placed",

  // src/components/ListTools.tsx
  "{ne} ara": "Search {ne}",
  "Ara…": "Search…",
  "Aramayı temizle": "Clear the search",
  Sırala: "Sort",
  "Girildiği sıra": "Order entered",
  "Önce bir sıralama seçin": "Choose a sort order first",
  "Süzmeyi kaldır": "Clear the filter",
  "**{gorunen}** / {sayim}": "**{gorunen}** of {sayim}",
  "Satırları elle sıralamak için **Sırala**’yı «Girildiği sıra»ya alın ve süzmeyi kaldırın.":
    "To reorder rows by hand, set **Sort** to «Order entered» and clear the filter.",

  // src/components/Palette.tsx
  "Komut paleti": "Command palette",
  "Ara veya komut yaz": "Search or type a command",
  "Öğretmen, sınıf, derslik ara ya da bir komut yaz…":
    "Search a teacher, class or room, or type a command…",
  Esc: "Esc",
  Sonuçlar: "Results",
  "Eşleşen bir şey yok.": "Nothing matches.",

  // src/components/Print.tsx
  Gün: "Day",
  "Yazdırılacak program yok.": "There is no timetable to print.",
  "{ne} ({secili}/{toplam})": "{ne} ({secili}/{toplam})",
  Tümü: "All",
  Hiçbiri: "None",
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
  "Önce **Okul** sekmesinden dersleri girip **Program** sekmesinde dizin.":
    "First enter the lessons in the **School** tab, then lay them out in the **Timetable** tab.",
  "**{n}** kâğıt": "**{n}** {n:sheet|sheets}",
  "Seçilen sayfaların **{n}** tanesi tamamen boş. O öğretmenlerin programı henüz dizilmemiş. **Program** sekmesinden dizebilirsiniz.":
    "**{n}** of the selected pages are completely empty. Those teachers' timetables have not been laid out yet. You can lay them out in the **Timetable** tab.",
  "Seçilen sayfaların **{n}** tanesi tamamen boş. O sınıfların programı henüz dizilmemiş. **Program** sekmesinden dizebilirsiniz.":
    "**{n}** of the selected pages are completely empty. Those classes' timetables have not been laid out yet. You can lay them out in the **Timetable** tab.",

  // src/components/Program.tsx
  "Buraya bırakılabilir.": "It can be dropped here.",
  "Otomatik diziliyor… {yerlesen}/{toplam} blok · {sure} sn":
    "Filling automatically… {yerlesen}/{toplam} blocks · {sure} s",
  "Satırlar öğretmen. Hücrede sınıf ve derslik yazar. Yerleşmiş dersi sürükleyerek taşıyın, sağ tıklayınca havuza döner.":
    "Rows are teachers. A cell shows the class and the room. Drag a placed lesson to move it; right-click sends it back to the tray.",
  "Satırlar sınıf. Hücrede öğretmen ve branşı yazar. Yerleşmiş dersi sürükleyerek taşıyın, sağ tıklayınca havuza döner.":
    "Rows are classes. A cell shows the teacher and their subject. Drag a placed lesson to move it; right-click sends it back to the tray.",
  "Program dizildi. {n} blok yerleşti ({sure} sn). Ctrl+Z ile geri alabilirsiniz.":
    "Timetable laid out. {n} blocks placed ({sure} s). Ctrl+Z undoes it.",
  " (ve {n} ders daha)": " (and {n} more {n:lesson|lessons})",
  "Durduruldu. {yerlesen}/{toplam} blok yerleşti.":
    "Stopped. {yerlesen} of {toplam} blocks placed.",
  "{yerlesen}/{toplam} blok yerleşti.": "{yerlesen} of {toplam} blocks placed.",
  "{bas} {ders}: {saat} saat yerleşemedi. {sebep}{digerleri}.":
    "{bas} {ders}: {saat} hours could not be placed. {sebep}{digerleri}.",
  dönecek: "will go back",
  döndü: "went back",
  "Henüz dizilecek ders yok.": "There are no lessons to lay out yet.",
  "Buraya döndüğünüzde dersler alttaki havuzda kartlar hâlinde bekliyor olacak.":
    "When you come back here the lessons will be waiting as cards in the tray below.",
  "Ayrıntı: Kontrol sekmesi.": "Details: the Check tab.",
  Tamam: "OK",
  Öğretmen: "Teacher",
  Sınıf: "Class",
  "Önce **Okul** sekmesinden derslikleri, öğretmenleri ve sınıfları girin, sonra her sınıfa haftalık ders saatlerini ekleyin. Ardından **Müsaitlik** sekmesinde öğretmenlerin gelemediği saatleri işaretleyin.":
    "First enter the rooms, teachers and classes in the **School** tab, then add each class's weekly hours. After that, mark the hours teachers cannot come in the **Availability** tab.",

  // src/components/Ribbon.tsx
  "Okul listeleri": "School lists",
  "Ders girişi araçları": "Lesson entry tools",
  "Liste boş": "The list is empty",
  "Müsaitlik araçları": "Availability tools",
  "Program araçları": "Timetable tools",
  Durdur: "Stop",
  "Havuzda bekleyen ders yok": "No lesson is waiting in the tray",
  "Havuzdaki dersleri kurallara uyarak yerleştirir":
    "Places the lessons in the tray while obeying the rules",
  "Otomatik diz ({n})": "Fill automatically ({n})",
  "Dizilmiş programı silip baştan dizer":
    "Clears the timetable and lays it out from scratch",
  "Dizilmiş {n} saatin tamamı silinecek":
    "All {n} placed hours will be deleted",
  "Program sıfırdan dizilecek. Ctrl+Z ile geri alınabilir.":
    "The timetable will be laid out from scratch. Ctrl+Z undoes it.",
  "Baştan diz": "Lay out from scratch",
  "Dizilmiş {n} saatin tamamı havuza dönecek":
    "All {n} placed hours will go back to the tray",
  "Izgara boşalır; dersler, öğretmenler ve müsaitlikler olduğu gibi kalır. Ctrl+Z ile geri alınabilir.":
    "The grid is emptied; lessons, teachers and availability stay as they are. Ctrl+Z undoes it.",
  "Programı boşalt": "Empty the timetable",
  "Kontrol araçları": "Check tools",
  "Sorun yok": "No problems",
  "Sorunlar ({n})": "Problems ({n})",
  "{n} engel": "{n} {n:blocker|blockers}",
  "{n} uyarı": "{n} {n:warning|warnings}",
  "Yazdırma araçları": "Print tools",
  "İkisi de": "Both",
  "Öğretmen renkleri kâğıda basılır":
    "Teacher colours are printed on the paper",
  "Renkli bas": "Print in colour",
  "Ayar bölümleri": "Settings sections",

  // src/components/lessons/index.tsx
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
  "Tüm branşlar": "All subjects",
  "Öğretmen seçin": "Choose a teacher",
  "{brans}: {n} öğretmen": "{brans}: {n} {n:teacher|teachers}",
  "Haftalık saat": "Weekly hours",
  Dağılım: "Split",
  Ekle: "Add",
  "Dersleri yapıştır": "Paste lessons",
  "Sınıf · Öğretmen (ad veya kısaltma) · Haftalık saat · Blok (1 · 2 · 3)":
    "Class · Teacher (name or initials) · Weekly hours · Block (1 · 2 · 3)",
  "Günde en fazla {n} saat kuralı bu bloğu hiçbir yere sığdırmaz":
    'The "at most {n} hours a day" rule leaves this block nowhere to go',
  "{boy} saat > günde {n}": "{boy} h > {n}/day",
  "{sinif} · {kim}: {saat} saat ({dagilim})":
    "{sinif} · {kim}: {saat} hours ({dagilim})",
  "{n} satır eklenemedi": "{n} {n:row|rows} could not be added",
  "Sınıf veya öğretmen bulunamadı:": "Class or teacher not found:",
  "Önce onları ekleyip tekrar deneyin.": "Add them first, then try again.",
  "Bu aramaya uyan ders yok.": "No lesson matches this search.",
  "Bu ders bir günde en fazla kaç saat": "Most hours of this lesson in one day",
  "Günde ↑": "Per day ↑",
  "{sinif} · {kim} dersinin branşı": "Subject of the {sinif} · {kim} lesson",
  "Dağılım değiştirilirse bu dersin programdaki yerleşimleri kalkar":
    "Changing the split removes this lesson's placements from the timetable",
  Sil: "Delete",
  "Hangi öğretmen": "Which teacher",
  "Hangi sınıf": "Which class",
  "Seçtiğiniz öğretmen için ders girin. Soldaki liste de o öğretmene daralır.":
    "Enter lessons for the teacher you choose. The list on the left narrows to that teacher too.",
  "Seçtiğiniz sınıf için ders girin. Soldaki liste de o sınıfa daralır.":
    "Enter lessons for the class you choose. The list on the left narrows to that class too.",
  "Ders listesi": "Lesson list",
  "Excel'den yapıştır": "Paste from Excel",
  "Ders eklemek için önce **Okul** sekmesinde en az bir öğretmen ve bir sınıf girin.":
    "To add a lesson, first enter at least one teacher and one class in the **School** tab.",
  "Henüz {ne} yok. **Okul** sekmesinden ekleyin.":
    "No {ne} yet. Add one in the **School** tab.",

  // src/components/settings/Appearance.tsx
  Tema: "Theme",
  "Yazı büyüklüğü": "Text size",
  Yoğunluk: "Density",
  Izgara: "Grid",
  "Izgara yoğunluğu": "Grid density",
  Ferah: "Roomy",
  Rahat: "Comfortable",
  Sığdır: "Fit",
  "Arayüzün geri kalanı": "The rest of the interface",
  "Arayüz yoğunluğu": "Interface density",
  "Kaydırınca gizlenir": "Hides on scroll",
  "Her zaman durur": "Always stays",
  Örnek: "Example",
  Saat: "Hour",
  "{toplam} öğretmenin ilk {kac} tanesi.":
    "The first {kac} of {toplam} {toplam:teacher|teachers}.",
  Hareket: "Motion",
  Dil: "Language",
  "**Ferah.** Satırlar en açık, paneller en geniş.":
    "**Roomy.** The most open rows and the widest panels.",
  "**Rahat.** Bugüne kadarki aralık.":
    "**Comfortable.** The spacing as it has been.",
  "Henüz öğretmen yok. **Okul → Öğretmenler** adımından ekleyin; burası o listeyi gösterir.":
    "No teachers yet. Add them in **School → Teachers**; this shows that list.",
  "**Tam.** Tasarlandığı gibi.": "**Full.** As designed.",
  "**Kapalı.** Hiçbir şey kaymaz, hiçbir şey solmaz.":
    "**Off.** Nothing slides and nothing fades.",

  // src/components/settings/Data.tsx
  "Nereye kaydedilsin": "Where it is saved",
  "Klasör seç…": "Choose a folder…",
  "Başka klasör seç…": "Choose another folder…",
  "İzin ver": "Allow",
  "Şu an yalnızca bu bilgisayarın tarayıcısında saklanıyor.":
    "Right now it is kept only in this computer's browser.",
  "Sürüm ve güncelleme": "Version and updates",
  Sürüm: "Version",
  Yenilikler: "What's new",
  "Eski sürümler": "Older versions",
  // src/changelog.ts — release-note bullets, translated like any other UI copy
  "Sınıf ve öğretmen boşluk kuralları, planlama analizi ve Danışman uyarıları eklendi.":
    "Class and teacher gap rules, planning analysis, and Advisor notes were added.",
  'Klavye kısayolları için bir yardım ekranı eklendi (üst çubuk, Ctrl+K veya "?" tuşu).':
    "A help screen for keyboard shortcuts was added (top bar, Ctrl+K, or the ? key).",
  'Ayarlar → Hakkında bölümüne bu "Yenilikler" paneli eklendi.':
    "This What's new panel was added to Settings → About.",
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
  "Şimdi yeniden başlat": "Restart now",
  "Bakılıyor…": "Checking…",
  "En son sürümü kullanıyorsunuz.": "You are on the latest version.",
  "Yeni sürüm iniyor…": "The new version is downloading…",
  "Her şey silinecek": "Everything will be deleted",
  "Öğretmenler, sınıflar, dersler ve dizilmiş program. Bu plan bomboş kalacak.":
    "Teachers, classes, lessons and the timetable as laid out. This plan will be left completely empty.",
  "Devam et": "Continue",
  "Son kez soruyorum": "Asking one last time",
  'Bu işlem geri alınamaz. Vazgeçme ihtimaliniz varsa önce üst çubuktan "Dosyaya kaydet" deyin.':
    'This cannot be undone. If you might change your mind, choose "Save to file" in the top bar first.',
  "{yazilan} plan dosyaya yazıldı; {eksik} planın verisi bulunamadı.":
    "{yazilan} {yazilan:plan|plans} written to the file; the data of {eksik} {eksik:plan|plans} could not be found.",
  "{yazilan} plan tek dosyaya yazıldı.":
    "{yazilan} {yazilan:plan|plans} written to one file.",
  "Bu dosya programın daha yeni bir sürümüyle yazılmış. Programı güncelleyin.":
    "This file was written by a newer version of the program. Update the program.",
  'Bu dosya bütün planları içeren bir dosya değil. Tek bir planı üst çubuktaki "Dosyadan aç" ile açabilirsiniz.':
    'This is not a file containing every plan. You can open a single plan with "Open from file" in the top bar.',
  "Bu bilgisayardaki bütün planların yerine geçecek":
    "It will replace every plan on this computer",
  "Buradaki {buradaki} plan silinip dosyadaki {gelen} plan açılacak. Bu işlem geri alınamaz.":
    "The {buradaki} {buradaki:plan|plans} here will be deleted and the {gelen} {gelen:plan|plans} in the file opened. This cannot be undone.",
  "Hepsini değiştir": "Replace them all",
  "Dosyadaki hiçbir plan okunamadı; hiçbir şey değişmedi.":
    "Not one plan in the file could be read; nothing has changed.",
  "{acilan} plan açıldı, {yazilamayan} plan yazılamadı. Depolama dolmuş olabilir. Dosyayı saklayın.":
    "{acilan} {acilan:plan|plans} opened, {yazilamayan} could not be written. Storage may be full. Keep the file.",
  "{acilan} plan açıldı.": "{acilan} {acilan:plan|plans} opened.",
  "Bütün planlar tek dosyada": "Every plan in one file",
  "Tümünü dosyaya kaydet ({n} plan)": "Save all to file ({n} {n:plan|plans})",
  "Bu bilgisayardaki bütün planların yerine dosyadakiler geçer":
    "The file's plans replace every plan on this computer",
  "Tümünü dosyadan aç": "Open all from file",
  "Bütün planları içeren dosya": "The file holding every plan",
  "Bu planın verisi": "This plan's data",
  "Örnek okul verisi": "Sample school data",
  "Bu planın yerine hazır örnek okulu koyar":
    "Puts the ready-made sample school in place of this plan",
  "Örnek okulu yükle": "Load the sample school",
  Sıfırla: "Reset",
  "Her şeyi siler": "Deletes everything",
  "Her şeyi sil": "Delete everything",
  "Veriler nerede": "Where the data is",
  Anahtar: "Key",
  Ne: "What",
  Yer: "Size",
  "Bu bilgisayardaki otomatik yedekler": "Automatic backups on this computer",
  "Henüz otomatik yedek yok, bu ilk oturum.":
    "No automatic backup yet; this is the first session.",
  Oturum: "Session",
  "bir önceki": "the previous one",
  "{n} oturum önce": "{n} {n:session|sessions} ago",
  "O zamana kadar üst çubuktaki **Dosyaya kaydet** tek çare.":
    "Until then, **Save to file** in the top bar is the only remedy.",
  "**{klasor}** klasörü seçilmiş, ama tarayıcı izni her açılışta yeniden soruyor. **İzin ver** deyin.":
    "The **{klasor}** folder is chosen, but the browser asks for permission again on every start. Choose **Allow**.",
  "**{klasor}** · yazılıyor…": "**{klasor}** · writing…",
  "**Yeni sürüm hazır.** Üstteki **Yenile** düğmesine basın.":
    "**A new version is ready.** Press the **Reload** button above.",
  "**v{surum} çıktı{tarih}.** İndirmek {mb} MB yer kaplar. İndirdikten sonra ne zaman geçeceğinize siz karar verirsiniz.":
    "**v{surum} is out{tarih}.** Downloading it takes {mb} MB. Once it is down, you decide when to switch.",
  "**v{surum} indi.** Yeniden başlatınca yeni sürüm açılır. Programınız kayıtlı, hiçbir şey kaybolmaz.":
    "**v{surum} has downloaded.** Restarting opens the new version. Your work is saved; nothing is lost.",

  // src/components/settings/Plans.tsx
  "Bu işlem geri alınamaz.": "This cannot be undone.",
  "{ogretmen} öğretmen, {sinif} sınıf, {ders} ders ve yerleşmiş {saat} saat silinecek. Bu işlem geri alınamaz.":
    "{ogretmen} {ogretmen:teacher|teachers}, {sinif} {sinif:class|classes}, {ders} {ders:lesson|lessons} and {saat} placed {saat:hour|hours} will be deleted. This cannot be undone.",
  '"{ad}" planı silinecek': 'The "{ad}" plan will be deleted',
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
  "Bu planın verisi bulunamadı": "This plan's data could not be found",
  "{ogretmen} öğretmen · {sinif} sınıf · {ders} ders":
    "{ogretmen} {ogretmen:teacher|teachers} · {sinif} {sinif:class|classes} · {ders} {ders:lesson|lessons}",
  "Bu plana geç": "Switch to this plan",
  "Tek plan silinemez": "The only plan cannot be deleted",
  "Bu planı tamamen siler": "Deletes this plan completely",
  "Taslaktan başla": "Start from a draft",
  "· verisi yok": "· no data",
  "Taslağın kurulumu (derslikler, öğretmenler, sınıflar, dersler) kopyalanır; ** dizilmiş program boş gelir**. Taslağın kendisi değişmez.":
    "The draft's setup (rooms, teachers, classes, lessons) is copied; **the laid-out timetable comes empty**. The draft itself does not change.",

  // src/components/settings/Rules.tsx
  Kurallar: "Rules",
  Kural: "Rule",
  "Ne yapsın": "What to do",
  "Şu an": "Right now",
  "{kural} kuralı": "the {kural} rule",
  Kapalı: "Off",
  "Uyan yok": "Nothing matches",
  "Kendi sınırı olan öğretmenler ({n})": "Teachers with their own limits ({n})",
  "Art arda": "In a row",
  "Günde ↓": "Per day ↓",
  "Şu anki ihlaller ({n})": "Breaches right now ({n})",
  "Dizilmiş program girdiğiniz sınırların hiçbirini aşmıyor.":
    "The timetable as laid out does not go past any of the limits you set.",
  "Kendi sınırı olan sınıflar ({n})": "Classes with their own limit ({n})",

  // src/components/settings/School.tsx
  "Zil ve günler": "Bell and days",
  "Okul adı (yazdırılan sayfaların başlığında görünür)":
    "School name (appears in the heading of printed pages)",
  "örn. Semiz Kurs": "e.g. Semiz College",
  "ders yok": "no lessons",
  "{gun} öğle arası": "{gun} lunch break",
  "Uzun ara yok": "No long break",
  "{n}. dersten sonra": "after period {n}",
  "En az bir gün seçmelisiniz.": "You must choose at least one day.",
  "Ders saatleri": "Lesson times",
  "Günlük ders sayısı": "Lessons per day",
  "İlk ders başlangıcı": "Start of the first lesson",
  "Başlangıç saati": "Start hour",
  "Başlangıç dakikası": "Start minute",
  "Ders (dk)": "Lesson (min)",
  "Teneffüs (dk)": "Break (min)",
  "Öğle arası (dk)": "Lunch break (min)",
  "Ders adları (virgülle; boş bırakılırsa 1, 2, 3…)":
    "Period names (comma separated; left empty they are 1, 2, 3…)",
  "Zil saatleri": "Bell times",
  Ara: "Break",
  "Öğle arası, {dk} dk": "Lunch break, {dk} min",
  Bitiş: "End",
  "Şu an **{gun} gün × {saat} saat** = {yer} slot.":
    "Right now **{gun} days × {saat} hours** = {yer} slots.",

  // src/components/setup/Classes.tsx
  Derslik: "Room",
  "Ada göre": "By name",
  "Dersliğe göre": "By room",
  "Ders yüküne göre": "By lesson load",
  "Sınıflar ({n})": "Classes ({n})",
  "Yeni sınıf": "New class",
  "Sınıf adı, örn. 510": "Class name, e.g. 510",
  "Derslik yok": "No room",
  "Sınıfları yapıştır": "Paste classes",
  "Sınıf adı · Derslik adı": "Class name · Room name",
  "{ad} → {derslik} dersliği": "{ad} → room {derslik}",
  "Bu aramaya uyan sınıf yok.": "No class matches this search.",
  "Ders saati": "Lesson hours",
  "Günde aynı ders ↑": "Same subject/day ↑",
  "Bu sınıf bir günde aynı dersten en fazla kaç saat":
    "How many hours of one subject this class may have in a day",
  "{ad} bir günde aynı dersten en fazla kaç saat":
    "how many hours of one subject {ad} may have in a day",
  yok: "none",
  "Bilgileri ve haftalık programı": "Details and weekly timetable",

  // src/components/setup/Paste.tsx
  "Buraya yapıştırın...": "Paste here...",
  Önizle: "Preview",
  "Okunabilir satır bulunamadı.": "No readable row was found.",
  "Excel'de sütunları seçip kopyalayın, aşağıya yapıştırın. Beklenen sıra: **{ornek}**":
    "Select the columns in Excel, copy them and paste below. Expected order: **{ornek}**",
  "**{n} satır okundu.** Aşağıdakiler eklenecek:":
    "**{n} {n:row|rows} read.** The following will be added:",

  // src/components/setup/Rooms.tsx
  "Sınıf sayısına göre": "By number of classes",
  "Derslikler ({n})": "Rooms ({n})",
  "Yeni derslik": "New room",
  "Derslik adı, örn. A": "Room name, e.g. A",
  "Derslikleri yapıştır": "Paste rooms",
  "Derslik adı (her satırda bir tane)": "Room name (one per line)",
  "Bu aramaya uyan derslik yok.": "No room matches this search.",
  "Sınıf sayısı": "Number of classes",

  // src/components/setup/Subjects.tsx
  "Bir öğretmende var ama listede yok":
    "A teacher has it but the list does not",
  "· listede değil": "· not in the list",
  "{ad} kısaltması": "short form of {ad}",
  Varsayılan: "Default",
  "Programda gömülü olan kısaltma": "The short form built into the program",
  "Listeden çıkar": "Remove from the list",
  "Bu branş zaten listede değil": "This subject is not in the list anyway",
  '"{ad}" branşı kullanılıyor': 'The "{ad}" subject is in use',
  "{n} öğretmen bu branşta ({kimler}). Önce onların branşını değiştirin, sonra bu branşı silin.":
    "{n} {n:teacher holds|teachers hold} this subject ({kimler}). Change their subject first, then delete this one.",
  '"{ad}" branşı listeden çıkarılacak':
    'The "{ad}" subject will be removed from the list',
  "Hiçbir öğretmen bu branşta değil, yani başka bir şey etkilenmiyor.":
    "No teacher holds this subject, so nothing else is affected.",
  Çıkar: "Remove",
  "Branşlar ({n})": "Subjects ({n})",
  "Yeni branş (örn. Robotik)": "New subject (e.g. Robotics)",
  "Yeni branş": "New subject",
  "Bu branş listede zaten var.": "This subject is already in the list.",
  Kısaltma: "Short form",

  // src/components/setup/Summary.tsx
  Renkler: "Colours",
  "Öğretmen renklerini yeniden dağıt ({n})":
    "Redistribute teacher colours ({n})",
  "Sınıf renklerini yeniden dağıt ({n})": "Redistribute class colours ({n})",
  Özet: "Summary",
  "Hazır branşlar ({n})": "Ready-made subjects ({n})",
  "Gömülü tablodaki branşların hepsi listenizde.":
    "Every subject in the built-in table is already in your list.",
  "Gömülü tablodaki bütün branşları listeye ekler":
    "Adds every subject in the built-in table to the list",
  "Hepsini ekle": "Add them all",
  "{ad} branşını listeye ekler": "Adds the subject {ad} to the list",
  "Listeye ekle": "Add to the list",
  "Hiçbir öğretmende kullanılmayan {n} branş var: {hangileri}. Silinebilirler.":
    "{n} {n:subject is|subjects are} used by no teacher: {hangileri}. They can be deleted.",
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
  "**{ad}**: {n} öğretmen": "**{ad}**: {n} {n:teacher|teachers}",
  "Sınıfa yüklenen toplam ders saati, sınıfın **açık** olduğu saatlere sığmalı.":
    "The total hours loaded onto a class must fit into the hours that class is **open**.",
  "**{n} sınıfın hiç dersi yok** ({hangileri}).":
    "**{n} {n:class has|classes have} no lessons at all** ({hangileri}).",

  // src/components/setup/Teachers.tsx
  Cinsiyet: "Gender",
  "Branşa göre": "By subject",
  "Açık saate göre": "By open hours",
  "Cinsiyete göre": "By gender",
  "Öğretmenler ({n})": "Teachers ({n})",
  "Yeni öğretmen": "New teacher",
  "Ad Soyad": "Full name",
  "Boş bırakırsanız addan üretilir": "Left empty, it is derived from the name",
  "Branş seçin": "Choose a subject",
  "+ Yeni branş…": "+ New subject…",
  "Yeni branşın adı": "Name of the new subject",
  "+ İkinci branş": "+ Second subject",
  "İkinci branş": "Second subject",
  "İkinci branş yok": "No second subject",
  "Öğretmenleri yapıştır": "Paste teachers",
  "Ad Soyad · Kısaltma · Branş · Cinsiyet · İkinci branş":
    "Full name · Short form · Subject · Gender · Second subject",
  "Bu aramaya uyan öğretmen yok.": "No teacher matches this search.",
  "2. branş": "2nd subject",
  "Art arda en fazla kaç saat": "At most how many hours in a row",
  "Bir günde en fazla kaç saat": "At most how many hours in one day",
  "Geldiği gün en az kaç saat": "At least how many hours on a day they come",
  "{kim} branşı": "subject of {kim}",
  "{kim} için ikinci branş ekle": "Add a second subject for {kim}",
  "İkinci branş ekle": "Add a second subject",
  "{kim} ikinci branşı": "second subject of {kim}",
  Yok: "None",
  "{kim} art arda en fazla kaç saat":
    "at most how many hours in a row for {kim}",
  "{kim} günde en fazla kaç saat": "at most how many hours per day for {kim}",
  "{kim} geldiği gün en az kaç saat":
    "at least how many hours on a day {kim} comes",
  "Branş listesi boş. **Branşlar** adımından ekleyebilirsiniz.":
    "The subject list is empty. You can add them in the **Subjects** step.",
  "**Aynı kısaltma birden çok öğretmende:** ızgarada iki satır ayırt edilemez.":
    "**The same short form is on more than one teacher:** two rows in the grid cannot be told apart.",

  // src/components/setup/index.tsx
  Başlarken: "Getting started",
  "Aracın ne yaptığını görmek isterseniz hazır bir okul yükleyebilirsiniz.":
    "If you would like to see what the tool does, you can load a ready-made school.",
  "Örnek veriyle doldur": "Fill with sample data",
  "Bu satır bir daha çıkmaz; örnek veri Ayarlar → Hakkında’da durmaya devam eder":
    "This line will not appear again; the sample data stays in Settings → About",
  "Bir daha gösterme": "Do not show again",
  "{ad} ile başla": "Start with {ad}",
  "Daha önce **taslak** olarak işaretlediğiniz planların kurulumu hazır duruyor. Seçtiğinizden **yeni bir plan** açılır: derslikler, öğretmenler, sınıflar ve dersler kopyalanır, dizilmiş program boş gelir. Taslağın kendisi değişmez.":
    "The setup of the plans you marked as **drafts** is ready and waiting. Choosing one opens **a new plan**: rooms, teachers, classes and lessons are copied and the laid-out timetable comes empty. The draft itself does not change.",

  // src/components/useRowOrder.tsx
  Sıra: "Order",
  "{ad}, {n}. sıra, taşımak için yukarı ve aşağı ok":
    "{ad}, position {n}, up and down arrows to move",
  "Elle sıralama için süzmeyi ve sıralamayı kaldırın":
    "To reorder by hand, clear the filter and the sort",

  // src/components/useSample.ts
  "{ogretmen} öğretmen, {sinif} sınıf ve {ders} ders silinecek.":
    "{ogretmen} {ogretmen:teacher|teachers}, {sinif} {sinif:class|classes} and {ders} {ders:lesson|lessons} will be deleted.",
  "Bu plandaki her şeyin yerine örnek veri geçecek":
    "Sample data will replace everything in this plan",
  "Örnek okul verisi yüklenecek": "Sample school data will be loaded",
  '{kayip} Yerine 25 öğretmen, 20 sınıf, 8 derslik ve 99 derslik örnek bir okul gelir. Diğer planlara dokunulmaz. Geri alınamaz, önce "Dosyaya kaydet" deyin.':
    '{kayip} In their place comes a sample school of 25 teachers, 20 classes, 8 rooms and 99 lessons. The other plans are untouched. It cannot be undone, so choose "Save to file" first.',
  '25 öğretmen, 20 sınıf, 8 derslik ve 99 ders. Aracın ne yaptığını görmek için; kendi verinizi girmeye başlamadan önce Ayarlar → Hakkında → "Her şeyi sil" ile temizleyin.':
    '25 teachers, 20 classes, 8 rooms and 99 lessons. For seeing what the tool does; before you start entering your own data, clear it with Settings → About → "Delete everything".',
  "Yerine koy": "Replace",
  Yükle: "Load",
  "Örnek veri yüklendi.": "Sample data loaded.",

  // src/constraints.ts
  "Ders bulunamadı": "Lesson not found",
  "Ders eksik tanımlı": "The lesson is incompletely defined",
  "Geçersiz hücre": "Invalid cell",
  "Bu saat günün dışında": "This hour is outside the day",
  "{boy} saatlik blok güne sığmıyor": "A {boy}-hour block does not fit the day",
  "{n}. gün": "day {n}",
  "{sinif} sınıfının {gun} {saat} saatinde {ders} var":
    "class {sinif} already has {ders} on {gun} at period {saat}",
  "başka ders": "another lesson",
  "{sinif} sınıfı {gun} {saat} saatinde kapalı":
    "class {sinif} is closed on {gun} at period {saat}",
  "{kim} {gun} {saat} saatinde müsait değil":
    "{kim} is not available on {gun} at period {saat}",
  "{kim} {gun} {saat} saatinde {sinif} sınıfında":
    "{kim} is with class {sinif} on {gun} at period {saat}",
  başka: "another",
  "{derslik} dersliğinde {gun} {saat} saatinde {sinif} var":
    "room {derslik} has {sinif} on {gun} at period {saat}",
  "başka sınıf": "another class",
  "{derslik} dersliği {gun} {saat} saatinde kapalı":
    "room {derslik} is closed on {gun} at period {saat}",
  "{kim} {gun} günü en fazla {sinir} saat girmeli, burada {olan} saat olur":
    "{kim} may teach at most {sinir} hours on {gun}; this would make {olan}",
  "{sinif} sınıfı {gun} günü {kim} dersinden en fazla {sinir} saat görmeli, burada {olan} saat olur":
    "class {sinif} may have at most {sinir} hours of {kim} on {gun}; this would make {olan}",
  "{ders} dersi havuza dönecek": "the {ders} lesson will go back to the tray",
  "{dersler} dersleri havuza dönecek":
    "the {dersler} lessons will go back to the tray",
  "{gun} {saat} saatinde": "on {gun} at period {saat}",
  "{kim} {ne_zaman} müsait değil": "{kim} is not available {ne_zaman}",
  "{sinif} sınıfı {ne_zaman} kapalı": "class {sinif} is closed {ne_zaman}",
  "{derslik} dersliği {ne_zaman} kapalı": "room {derslik} is closed {ne_zaman}",

  // src/drag.ts
  "Bu hücreye bırakılamaz": "It cannot be dropped in this cell",

  // src/entities.ts
  "Bu derslik silinecek": "This room will be deleted",
  "{ad} dersliği silinecek": "Room {ad} will be deleted",
  "{n} sınıfın dersliği boşalacak ({hangileri}) ve derslik çakışması artık kontrol edilmeyecek.":
    "{n} {n:class|classes} will be left without a room ({hangileri}) and room clashes will no longer be checked.",
  "Bu ders silinecek": "This lesson will be deleted",
  "{sinif} sınıfının {kim} dersi": "class {sinif}'s {kim} lesson",
  "{ne} silinecek ({n} saat)": "{ne} will be deleted ({n} {n:hour|hours})",
  "{ne} silinecek": "{ne} will be deleted",
  "Programa yerleşmiş {n} saati de kalkacak.":
    "The {n} {n:hour|hours} already on the timetable will go too.",
  "Bu öğretmen": "This teacher",
  "Bu sınıf": "This class",
  "{n} dersi de gidecek.": "Its {n} {n:lesson|lessons} will go too.",
  "{ders} dersi ve programa yerleşmiş {saat} saati de gidecek.":
    "Its {ders} {ders:lesson|lessons} and the {saat} {saat:hour|hours} already on the timetable will go too.",
  "Haftalık ders yükü": "Weekly lesson load",
  "{n} saat": "{n} {n:hour|hours}",
  "Açık saat": "Open hours",
  "Programa yerleşmiş": "Placed on the timetable",
  "{yerlesen} / {toplam} saat": "{yerlesen} of {toplam} hours",
  "Branşı: {brans}": "Subject: {brans}",
  "Henüz dersi yok": "No lessons yet",
  "{n} dersi var: {hangileri}": "{n} {n:lesson|lessons}: {hangileri}",
  "Dersliği: {derslik}": "Room: {derslik}",
  "Hiçbir sınıf bu dersliği kullanmıyor": "No class uses this room",
  "{n} sınıf paylaşıyor: {hangileri}":
    "shared by {n} {n:class|classes}: {hangileri}",

  // src/feasibility.ts
  "Boş yer kalmamış": "There is no room left",
  "{kim} {acik} saat müsait, {yuk} saat ders yüklenmiş. {fazla} saat fazla.":
    "{kim} is available for {acik} hours and is loaded with {yuk}. That is {fazla} too many.",
  "{kim} {acik} saat müsait, {yuk} saat ders yüklenmiş. Zor olacak.":
    "{kim} is available for {acik} hours and is loaded with {yuk}. It will be tight.",
  "{kim} {acik} saat müsait, {yuk} saat ders yüklenmiş.":
    "{kim} is available for {acik} hours and is loaded with {yuk}.",
  "{sinif} sınıfına {yuk} saat ders yüklenmiş ama haftada {acik} saati açık. {fazla} saat fazla.":
    "Class {sinif} is loaded with {yuk} hours but is open for {acik} in a week. That is {fazla} too many.",
  "{sinif} sınıfı: açık olan {acik} saatin {yuk} saati dolu.":
    "Class {sinif}: {yuk} of its {acik} open hours are full.",
  "{derslik} dersliğini {n} sınıf paylaşıyor ({hangileri}) ve toplam {yuk} saat ders var. Haftada {acik} saati açık, {fazla} saat fazla.":
    "Room {derslik} is shared by {n} classes ({hangileri}) with {yuk} hours in total. It is open for {acik} a week, which is {fazla} too few.",
  "{derslik} dersliği ({hangileri}): açık olan {acik} saatin {yuk} saati dolu.":
    "Room {derslik} ({hangileri}): {yuk} of its {acik} open hours are full.",
  "{n} saati yerleşmemiş ve koyacak yer yok. Örnek sebep: {sebep}":
    "{n} {n:hour|hours} unplaced and nowhere to put them. An example reason: {sebep}",
  "{n} kural ihlali": "{n} rule {n:breach|breaches}",
  "{n} ders kapalı saatte": "{n} {n:lesson|lessons} in a closed hour",
  "{n} ders sığmıyor": "{n} {n:lesson does|lessons do} not fit",
  "{n} saat havuzda": "{n} {n:hour|hours} in the tray",
  "Henüz ders girilmedi": "No lessons entered yet",
  "{ders} haftada {n} kez konacak ama yalnızca {gun} gün var; en az bir günde iki kez görülecek.":
    "{ders} needs to be placed {n} times a week but there are only {gun} days; it will land twice on at least one day.",
  "{kim} yalnızca {acik} günde müsait ama bir dersi haftada {n} kez konacak; bir güne iki kez düşebilir.":
    "{kim} is only available on {acik} days but one lesson needs placing {n} times a week; it may land twice on one day.",
  "{ders} {n} ayrı bloğa bölünmüş ve hiç tekli saat bırakmıyor; çözücünün deneyebileceği tek şekil bu.":
    "{ders} is split into {n} separate blocks with no single hour left over; that is the only shape the solver can try.",

  // src/import.ts
  '{n}. satır: "{ad}" iki kez geçiyor, biri alındı.':
    'Row {n}: "{ad}" appears twice; one was taken.',
  '{n}. satır: "{ad}" için branş boş.':
    'Row {n}: the subject for "{ad}" is empty.',
  '{n}. satır: "{ad}" sınıfı iki kez geçiyor, biri alındı.':
    'Row {n}: class "{ad}" appears twice; one was taken.',
  "{n}. satır: sınıf veya öğretmen boş, atlandı.":
    "Row {n}: the class or teacher is empty; skipped.",
  '{n}. satır: "{sinif} / {kim}" için saat okunamadı, atlandı.':
    'Row {n}: the hours for "{sinif} / {kim}" could not be read; skipped.',

  // src/library.ts
  "Adsız plan": "Unnamed plan",
  "Uygulama (.exe)": "Application (.exe)",
  "Dosya (çift tıklanan .html)": "File (double-clicked .html)",
  "Windows kurulumu": "Windows install",
  Site: "Site",
  "plan listesi": "the plan list",
  "bir önceki oturum": "the previous session",
  "tema tercihi": "theme preference",
  "dil tercihi": "language preference",
  "kenar çubuğu tercihi": "sidebar preference",
  "yazı büyüklüğü tercihi": "text size preference",
  "ızgara yoğunluğu tercihi": "grid density preference",
  "arayüz yoğunluğu tercihi": "interface density preference",
  "havuz çekmecesi tercihi": "tray drawer preference",
  "havuz çekmecesinin boyu": "height of the tray drawer",
  "araç şeridi tercihi": "tool strip preference",
  "şerit kaydırınca gizlensin mi": "whether the strip hides on scroll",
  "müsaitlikte saat gösterimi": "clock times on the availability screen",
  "hareket (animasyon) tercihi": "motion (animation) preference",
  "örnek veri satırı görüldü mü": "whether the sample-data line has been seen",
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
  "Öğretmenin gelemeyeceği saatlere tıklayın.":
    "Click the hours the teacher cannot come.",
  "Sınıfın ders yapamayacağı saatlere tıklayın. O saatlere hiçbir ders konamaz.":
    "Click the hours the class cannot have lessons. No lesson can be put in those hours.",
  "Dersliğin kapalı olduğu saatlere tıklayın. O dersliği kullanan sınıflar o saatte ders yapamaz.":
    "Click the hours the room is closed. Classes using that room cannot have lessons then.",
  Uygun: "Fits",
  Sıkışık: "Tight",
  "Öğretmen görünümü": "Teacher view",
  "Sınıf görünümü": "Class view",
  Görünüm: "View",
  Hakkında: "About",
  "Planlar ve yedek": "Plans and backup",
  "Hücre en büyük, kartın alt satırı tam boyda":
    "Largest cell, the card's bottom line at full size",
  "Hücre geniş, ders saatleri görünür": "Wide cell, lesson times visible",
  "Haftanın tamamı ekrana sığar, ders saatleri gizlenir":
    "The whole week fits the screen, lesson times are hidden",
  Öğretmenden: "From a teacher",
  "Bir öğretmen seçin, girdiği bütün sınıfları arka arkaya girin":
    "Choose a teacher and enter all the classes they teach, one after another",
  Sınıftan: "From a class",
  "Bir sınıf seçin, o sınıfın derslerini arka arkaya girin":
    "Choose a class and enter that class's lessons one after another",
  Genel: "All",
  "Bütün dersler tek listede": "Every lesson in one list",
  Liste: "List",
  Yöntem: "Method",
  "Açık olan": "Open",
  Toplam: "Total",
  Diz: "Lay out",
  Bölüm: "Section",
  Koyu: "Dark",
  Tam: "Full",
  Az: "Reduced",
  Uyar: "Warn",
  Engelle: "Block",
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
  "Kurs adı": "School name",
  "Başlığın altındaki satırda okulun adı":
    "The school's name on the line under the heading",
  "Derslik ve branş": "Room and subject",
  "Aynı satırda dersliğin harfi ya da öğretmenin branşı":
    "On the same line, the room's letter or the teacher's subject",
  "Sütun başlığında 08:30–09:10": "08:30–09:10 in the column heading",
  "Hücrenin alt satırı": "The cell's bottom line",
  "Öğretmen kısaltması ya da derslik": "The teacher's short form or the room",
  "Çıktı tarihi": "Print date",
  "Sayfanın altında yazdırılma tarihi ve saati":
    "The date and time of printing at the foot of the page",
  "Öğretmen art arda en fazla": "Teacher, at most in a row",
  "Bir öğretmen arka arkaya kaç saat derse girebilir.":
    "How many hours in a row a teacher may teach.",
  "Öğretmen günde en fazla": "Teacher, at most per day",
  "Bir öğretmenin bir gündeki toplam ders saati.":
    "A teacher's total hours in one day.",
  "Öğretmen günde en az": "Teacher, at least per day",
  "Bir sınıf aynı dersten günde en fazla":
    "A class, at most of the same lesson per day",
  "Öğretmenin dersleri arasında en fazla boşluk":
    "Teacher, at most gap between lessons",
  "Bir günde ilk ve son ders arasında kaç saat boş kalabilir. 0 hiç boşluk olmasın demektir.":
    "How many hours may sit empty between the first and last lesson of a day. 0 means no gap at all.",
  "Sınıfın dersleri arasında en fazla boşluk":
    "Class, at most gap between lessons",
  "Aynısı sınıf için. Yalnız Kontrol sekmesinde uyarır.":
    "The same for a class. Warns only, in the Kontrol tab.",
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
  Müsaitlik: "Availability",
  Kontrol: "Check",
  Ayarlar: "Settings",
  "{n} öğretmen": "{n} {n:teacher|teachers}",
  "{n} derslik": "{n} {n:room|rooms}",
  "{n} ders": "{n} {n:lesson|lessons}",
  Dersler: "Lessons",
  "{ad} branşının adı": "Name of the {ad} subject",
  '"{ad}" adı zaten kullanılıyor': 'The name "{ad}" is already in use',
  "İki branş aynı adı taşıyamaz. Başka bir ad seçin.":
    "Two subjects cannot share a name. Choose another.",
  '"{eski}" branşı "{yeni}" olacak':
    'The subject "{eski}" will become "{yeni}"',
  "{n} öğretmenin branşı da bu adla değişecek ({kimler}).":
    "{n} teachers' subject will change with it ({kimler}).",
  Değiştir: "Rename",
  "Verdiği dersler": "Lessons taught",
  "Aldığı dersler": "Lessons taken",
  "{ne} dersini başka öğretmene aktar":
    "Hand the {ne} lesson to another teacher",
  "Başka hocaya aktar…": "Hand to another teacher…",
  "{ne} dersi {kim} öğretmenine geçecek": "The {ne} lesson will go to {kim}",
  "Bu ders henüz programa yerleşmemiş, yani kaybolacak bir şey yok.":
    "This lesson is not on the timetable yet, so nothing can be lost.",
  "Programdaki {n} bloğu yeni öğretmenin haftasına göre yeniden denenecek; sığmayanlar havuza döner.":
    "Its {n} placed blocks will be retried against the new teacher’s week; the ones that do not fit go back to the tray.",
  Aktar: "Hand over",
  "{ne} dersi {kim} öğretmenine geçti.": "The {ne} lesson went to {kim}.",
  "{ne} dersi {kim} öğretmenine geçti. {n} blok havuza döndü.":
    "The {ne} lesson went to {kim}. {n} blocks went back to the tray.",
  "Azalan sıralı. Artana çevirmek için tıklayın":
    "Sorted descending. Click for ascending",
  "Artan sıralı. Azalana çevirmek için tıklayın":
    "Sorted ascending. Click for descending",
  "Sürükleyerek ya da ok tuşlarıyla sırala":
    "Drag or use the arrow keys to reorder",
  "Çözülmesi gereken satırlar": "Rows that need solving",
  "Danışman ({n})": "Advisor ({n})",
  "Öneri yok": "No notes",
  "Veri girişinde gözden kaçmış olabilecek noktalar":
    "Points that may have been overlooked while entering data",
  "Öğretmen yükleri": "Teacher loads",
  "Sınıf yükleri": "Class loads",
  "Derslik yükleri": "Room loads",
  "Kapalı saatte ders, kural ihlali ya da yerleşemeyen ders yok.":
    "No lessons on closed hours, no rule breaches, nothing left unplaceable.",

  // ------------------------------------------------------- 2026-08-30
  //
  // The tray's order and filter, the pin ON a card, the timetable library
  // behind one button, and an entity sheet that edits. Written by hand, the
  // way every entry here is: `i18n.test.ts` can tell us a key is DEAD, never
  // that one is missing - an untranslated sentence falls back to correct
  // Turkish and says nothing (pitfall 87).
  " {n} blok geçici kapsam dışında kaldı.":
    " {n} {n:block was|blocks were} left out of scope.",
  " · {n} blok geçici kapsam dışında": " · {n} {n:block|blocks} out of scope",
  "{gun} geçici olarak kapsam dışında": "{gun} is temporarily out of scope",
  "Program seç ve yönet": "Choose and manage a timetable",
  "Kopyasını kaydet": "Save a copy",
  "Boş program oluştur": "Create an empty timetable",
  "Yeniden adlandır": "Rename",
  "Programı sil": "Delete timetable",
  "Program adı": "Timetable name",
  "Aynı okul verilerini kullanan alternatif program için bir ad yazın.":
    "Name the alternative timetable that shares this school’s data.",
  "Program adı boş olamaz": "A timetable needs a name",
  "Bu program adı zaten kullanılıyor": "That timetable name is already in use",
  Kaydet: "Save",
  "{ad} programı silinecek": "The timetable {ad} will be deleted",
  "{n} yerleşmiş saat ve {s} sabitleme silinecek. Ortak okul verileri kalır.":
    "{n} placed {n:hour|hours} and {s} {s:pin|pins} go with it. The shared school data stays.",
  "Öğretmeni düzenle": "Edit teacher",
  "Sınıfı düzenle": "Edit class",
  "Toplu sabitle": "Pin in bulk",
  "Satırı sabitle / kaldır": "Pin / unpin the row",
  "Sütunu sabitle / kaldır": "Pin / unpin the column",
  "Günü sabitle / kaldır": "Pin / unpin the day",
  "Geçici görünüm": "Set aside for now",
  "Geçici görünüm ({n})": "Set aside ({n})",
  "Satırı soluklaştır": "Fade the row",
  "Satırı geri yükle": "Bring the row back",
  "Satırı gizle": "Hide the row",
  "Günü soluklaştır": "Fade the day",
  "Günü geri yükle": "Bring the day back",
  "Günü gizle": "Hide the day",
  "Tümünü geri yükle": "Bring them all back",
  soluk: "faded",
  gizli: "hidden",
  İşlemler: "Actions",
  "Izgara işlemleri": "Grid actions",
  "Tüm programı sabitle": "Pin the whole timetable",
  "Tüm sabitlemeleri kaldır": "Unpin everything",
  "{n} saat sabitlendi.": "{n} {n:hour|hours} pinned.",
  "{n} saatin sabitlemesi kaldırıldı.": "{n} {n:hour|hours} unpinned.",
  "{sinif} sınıfının {gun} {saat} saatindeki ders sabitlenmiş":
    "The lesson for {sinif} on {gun}, hour {saat}, is pinned",
  "{ust} {alt}: buraya sabitle": "{ust} {alt}: pin here",
  "{ust} {alt}: sabitlemeyi kaldır": "{ust} {alt}: unpin",
  "Sabitlenmiş. Kaldırmak için tıklayın": "Pinned. Click to unpin",
  "Ders {ad} sınıfına taşınsın mı?": "Move the lesson to {ad}?",
  Taşı: "Move",
  "Yerleşmiş saatler olduğu gibi taşınır. Ctrl+Z ile geri alınabilir.":
    "The placed hours move with it. Ctrl+Z undoes this.",
  "{n} blok havuza döner, {s} sabitleme kalkar. Ctrl+Z ile geri alınabilir.":
    "{n} {n:block goes|blocks go} back to the tray and {s} {s:pin is|pins are} lifted. Ctrl+Z undoes this.",
  "Ders {ad} sınıfına taşındı.": "The lesson moved to {ad}.",
  "Ders {ad} sınıfına taşındı. {n} blok havuza döndü.":
    "The lesson moved to {ad}. {n} {n:block|blocks} went back to the tray.",
  "Ders {kim} öğretmenine geçsin mi?": "Hand the lesson to {kim}?",
  "Yerleşmiş saatler olduğu gibi kalır. Ctrl+Z ile geri alınabilir.":
    "The placed hours stay where they are. Ctrl+Z undoes this.",
  "{n} blok havuza döner. Ctrl+Z ile geri alınabilir.":
    "{n} {n:block goes|blocks go} back to the tray. Ctrl+Z undoes this.",
  "Ders {kim} öğretmenine geçti.": "The lesson went to {kim}.",
  "Ders {kim} öğretmenine geçti. {n} blok havuza döndü.":
    "The lesson went to {kim}. {n} {n:block|blocks} went back to the tray.",
  "**Dersler** sekmesinde ders silinebilir, yeni ders eklenebilir.":
    "Lessons can be deleted and added in the **Lessons** tab.",
  "Art arda en fazla": "Consecutive at most",
  "Geldiği gün en az": "At least, on a day worked",
  "Günde aynı dersten en fazla": "Same lesson per day at most",
  "Havuz sıralaması": "Tray order",
  "Havuz süzgeci": "Tray filter",
  "Izgara sırası": "Grid order",
  "Uzun bloklar önce": "Long blocks first",
  "En çok kalan": "Most left to place",
  "{n} saatlik bloklar": "{n}-hour blocks",
  "{n} saat kaldı": "{n} {n:hour|hours} left",
  "{n} blok süzgeç dışında · sürükleyip bırakın":
    "{n} more {n:block|blocks} behind the filter · drag and drop",
  Göster: "Show",
  Saatler: "Clock times",
  Satır: "Row",
  "Ders numaralarının altına başlangıç saatlerini yaz":
    "Print the start time under each lesson number",
  "Haftanın darlığı tablosunu göster ya da gizle":
    'Show or hide the "tightest hours" table',
  "Koyu bir sütun, o saatte **kaç {ne} kapalı** olduğunu söyler: dizerken genellikle orada tıkanılır.":
    "A dark column says **how many {ne} are closed** at that hour: that is usually where the search gets stuck.",

  // ------------------------------------ 2026-08-30 · AB2: infolar kısaldı
  //
  // "Çok fazla info var ve çok uzunlar her yerde." One sentence per `.hint`,
  // and what did not fit went to the element’s `title` — the five long
  // entries at the end of this block are those. Grouped by round rather than
  // by source file: the pass touched fifteen screens, and a key here is found
  // by its Turkish sentence anyway.
  "**Az.** Süreler yarıya iner ve **yer değiştiren** hareketler kapanır.":
    "**Reduced.** Durations halve and anything that MOVES is switched off.",
  "**Açık olan plan** tamamen silinir ve **geri alınamaz**; önce **Dosyaya kaydet** deyin.":
    "**The open plan** is wiped and it **cannot be undone**; use **Save to file** first.",
  "**Bu kopya kendini güncellemez** ve hiçbir yere bağlanmaz. En son sürüm şuradadır:":
    "**This copy never updates itself** and connects nowhere. The latest version is at:",
  "**Bütün planlar** kendiliğinden Belgelerim'e yazılıyor; son {gun} günün yedeği durur.":
    "**Every plan** is written to Documents by itself; the last {gun} days are kept.",
  "**Ferah.** Hücre en büyük; en kolay okunan, en çok kaydırılan.":
    "**Roomy.** The largest cell: easiest to read, most scrolling.",
  "**Rahat.** Hücre geniş ve saatler yazılı; hafta sığmadığı için sağa kaydırırsınız.":
    "**Comfortable.** Wide cells with the clock times; the week does not fit, so you scroll.",
  "**Sığdır.** Haftanın tamamı bir ekranda, ve bunun bedeli **saatlerin gizlenmesi**.":
    "**Fit.** The whole week on one screen, and the price is **hiding the clock times**.",
  "**Sığdır.** Satır aralığı daralır; kısılan şey boşluk, **yazı boyutu değil**.":
    "**Fit.** Rows tighten; what is cut is space, **not the type size**.",
  "**Tarayıcınız klasöre yazmayı desteklemiyor.** Chrome ve Edge destekliyor.":
    "**Your browser cannot write to a folder.** Chrome and Edge can.",
  "**Uyar** yalnız sayar, **Engelle** dersi o hücreye hiç bıraktırmaz.":
    "**Warn** only counts; **Block** will not let the lesson be dropped there at all.",
  "**Yük**, **Açık**'ı geçerse o sınıfın haftası tutmaz.":
    "If **Load** passes **Open**, that class's week does not add up.",
  "Arayüzün dili. Bu bilgisayara aittir, yedek dosyasına girmez.":
    "The interface language. It belongs to this computer, not to the backup file.",
  "Aynı dersliği paylaşan sınıfların **toplam** ders saati de haftaya sığmalı.":
    "The **combined** hours of classes sharing a room must also fit the week.",
  "Aynı programı paylaşan öğrenci grubu; **derslik** sınıfın sabit odasıdır.":
    "A group of pupils sharing one timetable; the **room** is that class's fixed room.",
  "Aşağıdakiler **kendi öğretmenleriniz**: bir ad sığmıyorsa ölçek fazla büyük demektir.":
    "These are **your own teachers**: if a name does not fit, the scale is too large.",
  "Basılan sayfada saatler her üç durumda da yazar.":
    "The printed sheet carries the clock times in all three cases.",
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
  "Bir öğretmen iki branş veriyorsa + İkinci branş ile ikincisi de yazılır; o zaman her dersinde hangi branştan olduğu ayrıca seçilir. Renk otomatik atanır, kimseyle çakışmaz. Sağdaki üç kutu bu öğretmene özel sınırdır; boş bırakılırsa Ayarlar → Kurallar’daki sayı geçerli olur.":
    "If a teacher holds two subjects, + Second subject records the other one; each of their lessons then also says which of the two it is. The colour is assigned automatically and clashes with nobody. The three boxes on the right are this teacher's own limits; left empty, the number from Settings → Rules applies.",
  "Bir şey belirirken görülen kısa hareketler; kapatmak programın işini değiştirmez.":
    "The short movements when something appears; turning them off changes nothing else.",
  "Branş **listeden seçilir**; kısaltma ızgarada satır başlığı olur.":
    "The subject is **picked from the list**; the short form heads the grid row.",
  "Bu bilgisayara aittir ve **yazdırmayı etkilemez**; kâğıdın yazısı **Çıktı** sekmesinde.":
    "It belongs to this computer and **does not affect printing**; paper type is under **Print**.",
  "Bu depo yalnız {adres} adresine ait; öteki kopyaların depoları **ayrıdır**.":
    "This store belongs to {adres} alone; the other copies have **separate** stores.",
  "Bu dersler konduktan **sonra** o saatler kapatıldı; hiçbiri silinmedi.":
    "Those hours were closed **after** these lessons were placed; none was deleted.",
  "Bu derslerin yerleşmemiş saatleri var ama koyulacak boş hücre kalmamış.":
    "These lessons still have hours to place, but no empty cell is left for them.",
  "Bu kopya kendini güncelleyebilir ama **düğmeye basmadıkça** hiçbir yere bağlanmaz.":
    "This copy can update itself, but connects nowhere **until you press the button**.",
  "Bu sayılar **bütün okul** için; **0** yazmak “sınır yok” demektir.":
    "These numbers are for the **whole school**; **0** means “no limit”.",
  "Bu tarayıcının bu bilgisayardaki deposunda duruyor.":
    "It sits in this browser's store on this computer.",
  "Burada ne seçerseniz o kalır; bilgisayarınızın tercihini **izlemez**.":
    "Whatever you pick here stays; it **does not follow** your computer's preference.",
  "Böylece aynı branş iki farklı yazımla iki branşa dönüşmez. Kısaltma ızgarada ve yazdırılan sayfada görünür; yalnızca değiştirdikleriniz saklanır. Satırları tutamağından sürükleyerek sıralayabilirsiniz; öğretmen eklerken açılan liste bu sırada gelir.":
    "That way one subject spelled two ways does not become two subjects. The short form shows in the grid and on the printed sheet; only the ones you change are stored. Rows can be reordered by their handle, and the dropdown when adding a teacher follows that order.",
  "Bütün ekranı birlikte büyütür: yazıyı, boşlukları, düğmeleri ve ızgara hücrelerini.":
    "Enlarges the whole screen together: type, spacing, buttons and grid cells.",
  "Bütün planlar Belgelerim'deki **{klasor}** klasörüne de yazılıyor; taşınacak şey o.":
    "Every plan is also written to **{klasor}** in Documents; that folder is what moves.",
  "Dağılım, o saatlerin haftaya nasıl bölüneceğidir: 2+1 demek bir gün iki saat üst üste, başka bir gün tek saat. Bir blok 2 ya da 3 saat olabilir; kalanlar tektir. Günde ↑ bu dersin bir gündeki en fazla saatidir; boşsa Ayarlar → Kurallar’daki sayı geçerli olur.":
    "The split is how those hours are divided across the week: 2+1 means two hours back to back on one day and a single hour on another. A block can be 2 or 3 hours; the rest are single. Per day ↑ is the most this lesson may take in one day; left empty, the number from Settings → Rules applies.",
  "Ders yapılan günleri işaretleyin; yanındaki kutu **öğle arasının** yerini söyler.":
    "Tick the teaching days; the box beside each says where the **long break** falls.",
  "Derslik yerleştirirken seçilmez ve aynı dersliği paylaşan iki sınıf aynı saate konamaz. Renk otomatik atanır, kimseyle çakışmaz; satır başındaki nokta ile basılan sayfanın başlığında görünür.":
    "The room is not chosen while placing, and two classes sharing one cannot take the same hour. The colour is assigned automatically, clashes with nobody, and shows as the dot at the head of the row and in the printed sheet's title.",
  "Dersliği olmayan sınıflar için bu kontrol yapılmaz.":
    "Classes with no room are not checked this way.",
  "Ekranın **geri kalanı**: listeler, paneller, kutular. Program ızgarasına dokunmaz.":
    "The **rest** of the screen: lists, panels, boxes. The timetable grid is untouched.",
  "Gün kaçta başlıyor, ders ve teneffüs kaç dakika. Saatler bunlardan hesaplanır.":
    "When the day starts, and how long a lesson and a break are. The times follow.",
  "Hazır bir okul: 25 öğretmen, 20 sınıf, 99 ders. **Açık olan planın yerine geçer.**":
    "A ready-made school: 25 teachers, 20 classes, 99 lessons. **It replaces the open plan.**",
  "Her plan **ayrı bir programdır**; üst çubuktaki listeden aralarında geçilir.":
    "Each plan is **a timetable of its own**; the top bar's list switches between them.",
  "Her sınıf okul sayısını kullanıyor. Bir sınıfa özel sayı: **Okul → Sınıflar**.":
    "Every class uses the school number. For one class: **School → Classes**.",
  "Her sınıfın sabit odası; aynı dersliği paylaşan iki sınıf aynı saate konamaz.":
    "Each class's fixed room; two classes sharing one cannot take the same hour.",
  "Herkes okul sınırlarını kullanıyor. Bir öğretmene özel sayı: **Okul → Öğretmenler**.":
    "Everyone uses the school limits. For one teacher: **School → Teachers**.",
  "Kapalı saatler taralı; değiştirmek için **Müsaitlik** sekmesine gidin.":
    "Closed hours are hatched; change them under **Availability**.",
  "Okulun listesinde **bulunmayan** hazır branşlar; eklemek için tıklayın.":
    "Built-in subjects **not** on the school's list; click to add one.",
  "Program **kendiliğinden** saklıyor; **Dosyaya kaydet** onun yanına gelir, yerine değil.":
    "The program saves **by itself**; **Save to file** comes beside that, not instead of it.",
  "Program, **Ayarlar → Kurallar**'da girdiğiniz sınırları aşıyor.":
    "The timetable goes past the limits you set under **Settings → Rules**.",
  "Renk kimliktir: ızgaradaki satırı havuzdaki kartıyla eşleştiren şey budur.":
    "Colour is identity: it is what matches a grid row to its card in the tray.",
  "Sekmelerin altındaki bar, sayfayı **aşağı kaydırırken kendiliğinden gizlenir**.":
    "The bar under the tabs **hides itself as you scroll down** the page.",
  "Silmelerden sonra renkler delik bıraktı; yeniden dağıtmak yalnızca onları sıraya dizer.":
    "Deletions left gaps in the colours; redealing only puts them back in order.",
  "Soldaki saatten ve üç süreden hesaplanır; her öğle arası deseni kendi sütununda.":
    "Computed from the start time and three durations; each break pattern gets a column.",
  "Son üç oturumun durumu ayrı tutulur; **bu bilgisayara** ve açılıştaki plana aittir.":
    "The last three sessions are kept apart; they belong to **this computer** and the plan open at startup.",
  "Sınıf başına **{yer}** saat var ({gun} gün × {ders} ders); girilen yük **{yuk}** saat.":
    "**{yer}** hours per class ({gun} days × {ders} lessons); the load entered is **{yuk}**.",
  "Sırayla: **derslikler**, **branşlar**, **öğretmenler**, **sınıflar**, sonra **dersler**.":
    "In order: **rooms**, **subjects**, **teachers**, **classes**, then **lessons**.",
  "Tarayıcının bu site için ayırdığı depoda duruyor.":
    "It sits in the store the browser keeps for this site.",
  "Toplam **{yer}**; tarayıcının bu programa ayırdığı yer yaklaşık **5 MB**.":
    "**{yer}** in total; the browser allows this program about **5 MB**.",
  "Yalnız **Program** ızgarasını etkiler: hücrenin büyüklüğü ve ekrana sığan gün sayısı.":
    "Affects only the **Timetable** grid: cell size and how many days fit the screen.",
  "Yazdırma penceresinde **arka plan grafikleri: açık** olsun, yoksa renkler çıkmaz.":
    "In the print dialog turn **background graphics on**, or the colours will not print.",
  "Yeni plan açılınca ona geçilir ve **geri al** geçmişi sıfırlanır.":
    "A new plan opens straight away and the **undo** history is cleared.",
  "Yeni sürüm çıkınca üstte bir satır belirir; **Yenile** demedikçe hiçbir şey değişmez.":
    "A line appears at the top when a new version is out; nothing changes until **Reload**.",
  "Yukarıdakiler **localStorage**'da; seçtiğiniz klasörün tutamağı ayrıca **IndexedDB**'de.":
    "The above live in **localStorage**; the folder handle you chose is in **IndexedDB**.",
  "{ad} temaya geç": "Switch to the {ad} theme",
  "{dosya} **bütün planlarınızdır**; yanındakiler onun gün gün duran hâlleri.":
    "{dosya} is **all of your plans**; the files beside it are its day-by-day copies.",
  "{n} engelle": "{n} {n:blocks|block}",
  "{n} gün": "{n} {n:day|days}",
  "{n} kapalı": "{n} off",
  "{n} uyar": "{n} {n:warns|warn}",
  "Öğretmen eklerken branş **bu listeden** seçilir, elle yazılmaz.":
    "When adding a teacher the subject is picked **from this list**, never typed.",
  "Öğretmenin müsait saati, ona yüklenen ders saatinden az olamaz.":
    "A teacher's open hours cannot be fewer than the hours loaded onto them.",
  "Üst çubuktaki **Dosyaya kaydet** açık planı yazar; buradaki dosya **bütün planları**.":
    "**Save to file** above writes the open plan; this file holds **every plan**.",
  "İçindekiler: her planın derslikleri, öğretmenleri, sınıfları, dersleri, dizilmiş programı, adı ve taslak işareti. Tema gibi bu bilgisayara ait tercihler ve oturum yedekleri girmez.":
    "What is inside: every plan's rooms, teachers, classes, lessons, placed timetable, name and draft mark. Preferences belonging to this computer, such as the theme, and the session backups are not included.",
  "İşareti kaldırılan şey kâğıda basılmaz.":
    "Anything unticked is left off the paper.",
};

registerSozluk("en", EN);

export default EN;
