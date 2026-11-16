/**
 * Spanish. The keys are the Turkish sentences - see the long note at the top of
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

const ES: Sozluk = {
  "program renk tercihi": "preferencia de color del horario",
  "{bir} ile {iki} yer değiştirecek": "{bir} y {iki} intercambiarán sus posiciones",
  "Takas olmaz: {sebep}":
    "No hay intercambio: {sebep}",
  "Takas olmaz, {ne} eski yerine geçemiyor: {sebep}":
    "No hay intercambio, {ne} no puede ir al lugar anterior: {sebep}",
  "{bir} ile {iki} yer değiştirdi": "{bir} y {iki} intercambiaron sus posiciones",
  "{ad} ({n} ders)": "{ad} ({n} {n:clase|clases})",
  // -------------------------------------------- the week and the subjects
  //
  // DATA drawn, never data stored: `settings.days[].name` and
  // `settings.subjects` stay Turkish in the file so a backup means the same
  // thing on every machine and `remapDays()` keeps building its mapping from
  // them (pitfall 11). Only the seven and the twenty-one this program itself
  // put there are translated; anything the reader typed is drawn as typed.
  Pazartesi: "Lunes",
  Salı: "Martes",
  Çarşamba: "Miércoles",
  Perşembe: "Jueves",
  Cuma: "Viernes",
  Cumartesi: "Sábado",
  Pazar: "Domingo",
  Matematik: "Matemáticas",
  Fizik: "Física",
  Geometri: "Geometría",
  Kimya: "Química",
  Biyoloji: "Biología",
  Türkçe: "Turco",
  Edebiyat: "Literatura",
  Tarih: "Historia",
  Coğrafya: "Geografía",
  İngilizce: "Inglés",
  Felsefe: "Filosofía",
  "Din Kültürü": "Religión",
  Almanca: "Alemán",
  Fransızca: "Francés",
  Müzik: "Música",
  Resim: "Dibujo",
  "Beden Eğitimi": "Educación Física",
  "Sosyal Bilgiler": "Ciencias Sociales",
  "Fen Bilimleri": "Ciencias Naturales",
  Rehberlik: "Orientación",
  "İnkılap Tarihi": "Historia de las Reformas",
  Kim: "Quién",

  // src/App.tsx
  "plan dosyası": "archivo de plan",
  "Plan dosyaya yazıldı. İndirilenler klasörüne bakın.":
    "Plan escrito en un archivo. Mire en la carpeta Descargas.",
  "Programı yap": "Hacer el horario",
  Program: "Horario",
  "Araç şeridini gizle": "Ocultar la barra de herramientas",
  "Araç şeridini göster": "Mostrar la barra de herramientas",
  "Animasyonları aç": "Activar las animaciones",
  "Animasyonları kapat": "Desactivar las animaciones",
  "Ayarlar → Görünüm": "Ajustes → Apariencia",
  "Bu dosya bütün planları içeriyor": "Este archivo contiene todos los planes",
  "Bu dosya daha yeni bir sürümle yazılmış":
    "Este archivo se escribió con una versión más reciente",
  "Okunamayan plan açılmadı: {adlar}.":
    "Un plan que no se pudo leer no se abrió: {adlar}.",
  "· okunamadı": "· ilegible",
  "Kayıtlı metni okunamadı; açılmıyor, silinmedi.":
    "No se pudo leer su texto guardado; no se abre y no se ha borrado.",
  "Bu planın kayıtlı metni okunamadı; silinirse o metin de gider. Bu işlem geri alınamaz.":
    "No se pudo leer el texto guardado de este plan; si se borra, ese texto también se pierde. No se puede deshacer.",
  "Bu taslak okunamadı": "No se pudo leer este borrador",
  "Bu dosya okunamadı": "No se pudo leer este archivo",
  "Tek bir planı değil, bu bilgisayardaki bütün planların yerine geçer. Ayarlar → Planlar ve yedek bölümündeki \"Tümünü dosyadan aç\" düğmesini kullanın.":
    "Sustituye todos los planes de este ordenador, no uno solo. Use el botón \"Abrir todos desde archivo\" en Ajustes → Planes y copias de seguridad.",
  "Açık olan planın yerine geçecek": "Sustituirá el plan abierto",
  "Planı aç": "Abrir el plan",
  "Bu dosya eksik":
    "Este archivo está incompleto",
  "Dosyada: {ogretmen} öğretmen, {sinif} sınıf, {ders} ders, yerleşmiş {saat} saat.":
    "En el archivo: {ogretmen} {ogretmen:profesor|profesores}, {sinif} {sinif:grupo|grupos}, {ders} {ders:clase|clases}, {saat} {saat:hora colocada|horas colocadas}.",
  "Şu an: {ogretmen} öğretmen, {sinif} sınıf, {ders} ders, yerleşmiş {saat} saat.":
    "Ahora: {ogretmen} {ogretmen:profesor|profesores}, {sinif} {sinif:grupo|grupos}, {ders} {ders:clase|clases}, {saat} {saat:hora colocada|horas colocadas}.",
  "Plan dosyası açıldı.": "Archivo de plan abierto.",
  Bölümler: "Secciones",
  "Programın durumu: {durum}. Ayrıntı için Kontrol.":
    "Estado del horario: {durum}. Detalles en Revisión.",
  "{durum}. Kontrol sekmesini açar": "{durum}. Abre la pestaña Revisión",
  Plan: "Plan",
  "Geri al": "Deshacer",
  "Geri al (Ctrl+Z)": "Deshacer (Ctrl+Z)",
  "İleri al": "Rehacer",
  "Açık planı bir .json plan dosyasına yazar. Mozaik bu bilgisayarda kendiliğinden saklıyor; dosya taşımak ve saklamak için.":
    "Escribe el plan abierto en un archivo de plan .json. Mozaik ya guarda solo en este ordenador; el archivo sirve para llevarlo y conservarlo.",
  "Dosyadan aç": "Abrir desde archivo",
  "Klavye kısayolları": "Atajos de teclado",
  // -------------------------------------------------- ShortcutsHelp.tsx
  "Genel kısayollar": "General",
  "Komut paletini aç/kapat": "Mostrar u ocultar la paleta de comandos",
  "Bir sekmeye git": "Ir a una sección",
  "Bu ekranı aç": "Abrir esta pantalla",
  "İptal et veya kapat": "Cancelar o cerrar",
  "Odaklı dersi havuza kaldır": "Devolver la clase enfocada al depósito",
  "Odaklı dersin sağ tık menüsünü aç":
    "Abrir el menú contextual de la clase enfocada",
  Listeler: "Listas",
  "Yeni satır ekle veya düzenlemeyi onayla":
    "Añadir una fila nueva o confirmar la edición",
  "Tutamaktan bir satırı sırada taşı":
    "Mover una fila en orden desde su asa",
  "Satırı listenin başına veya sonuna taşı":
    "Mover la fila al principio o al final de la lista",
  Diyaloglar: "Diálogos",
  Onayla: "Confirmar",
  "Araç şeridi": "Barra de herramientas",
  Yenile: "Recargar",
  Sonra: "Más tarde",
  "Klasörü düzelt": "Arreglar la carpeta",
  "**Son değişiklik bu bilgisayara kaydedilemedi:** depolama alanı dolu. İşinizi kaybetmemek için **Kaydet** düğmesine basın.":
    "**El último cambio no se pudo guardar en este equipo:** el almacenamiento está lleno. Para no perder su trabajo, pulse **Guardar**.",
  "**Kayıtlı plan okunamadı.** Üzerine yazılmadı; burada yapılanlar kaydedilmez. Plan dosyanızı **Dosyadan aç** ile açabilirsiniz.":
    "**No se pudo leer el plan guardado.** No se ha sobrescrito; lo que haga aquí no se guarda. Puede abrir su archivo de plan con **Abrir desde archivo**.",
  "**Bu bilgisayarda otomatik kayıt çalışmıyor.** Mozaik kapanınca yaptığınız her şey kaybolur. Çalışırken ve bilgisayarı kapatmadan önce sık sık **Kaydet** düğmesine basın.":
    "**El guardado automático no funciona en este ordenador.** Todo lo que haga se pierde al cerrar Mozaik. Pulse a menudo **Guardar** mientras trabaja y antes de apagar el ordenador.",
  "**Yeni sürüm hazır.** Şu an {surum} sürümünü kullanıyorsunuz; yenisi **Yenile** deyince gelir. İşiniz kaybolmaz.":
    "**Hay una versión nueva lista.** Está usando {surum}; la nueva llega al pulsar **Recargar**. Su trabajo no se pierde.",
  "**{klasor}** klasörüne yazılamıyor: tarayıcı izni sormadan devam etmiyor. İşiniz şu an yalnız bu tarayıcıda duruyor.":
    "No se puede escribir en la carpeta **{klasor}**: el navegador no continúa sin pedir permiso. Ahora mismo su trabajo solo está en este navegador.",
  "**{klasor}** klasörüne **yazılamıyor**. {sebep} İşiniz şu an yalnız bu tarayıcıda duruyor.":
    "**No se puede escribir** en la carpeta **{klasor}**. {sebep} Ahora mismo su trabajo solo está en este navegador.",

  // src/ui/availability/Availability.tsx
  "{ad} sınıfı": "clase {ad}",
  "{ad} dersliği": "aula {ad}",
  "Müsait olmayan saatler": "Horas no disponibles",
  "Önce {ne} ekleyin.": "Añada primero {ne}.",
  "{kim} · müsait olmayan saatler": "{kim} · horas no disponibles",
  "Basılı tutup sürükleyerek birden çok hücre işaretleyebilirsiniz. Soldaki gün adına tıklayınca o günün tamamı, üstteki saat numarasına tıklayınca haftanın o saati değişir.":
    "Mantenga pulsado y arrastre para marcar varias celdas. Al pulsar el nombre del día a la izquierda cambia el día entero; al pulsar el número de hora arriba cambia esa hora de toda la semana.",
  "Haftanın bu saatini değiştir": "Cambiar esta hora de la semana",
  "{gun}: bütün günü değiştir": "{gun}: cambiar el día entero",
  "Haftanın darlığı": "Lo apretada que está la semana",
  "{gun} {ders}. saat: {kapali} / {toplam} kapalı":
    "{gun}, hora {ders}: {kapali} de {toplam} cerradas",
  "Kimin saatleri": "Horas de quién",
  "Müsaitlik listesi": "Lista de disponibilidad",
  "{n} saat fazla, bu program dizilemez.":
    "{n} {n:hora|horas} de más; este horario no se puede montar.",
  ", {n} tanesi {kim} üzerinde": ", {n} de ellas en {kim}",
  "Müsaitlik girebilmek için **Okul** sekmesinden en az bir {ne} eklemeniz gerekiyor.":
    "Para introducir disponibilidad necesita al menos {ne} en la pestaña **Escuela**.",
  "**{kim}**: {acik} saat açık, {yuk} saat ders yüklenmiş.":
    "**{kim}**: {acik} horas abiertas, {yuk} horas de clase asignadas.",
  "**{kim}**: {acik} saat müsait, {yuk} saat ders yüklenmiş.": "**{kim}**: {acik} horas disponibles, {yuk} horas de clase asignadas.",
  "**Kapattığınız saatlerde yerleşmiş {n} ders var{kimde}.** Hiçbiri silinmedi. **Program** sekmesinde kırmızı çerçeveyle, **Kontrol** sekmesinde tek tek listeleniyor.":
    "**{n} {n:clase colocada está|clases colocadas están} en horas que ha cerrado{kimde}.** No se ha borrado ninguna. Están marcadas en rojo en la pestaña **Horario** y listadas una a una en **Revisión**.",

  // src/ui/CapacityRows.tsx
  Ad: "Nombre",
  Açık: "Abierto",
  "Müsait": "Disponible",
  Yük: "Carga",
  Durum: "Estado",

  // src/ui/program/Check.tsx
  "Kontrol edilecek bir şey yok.": "Todavía no hay nada que revisar.",
  İmkânsız: "Imposible",
  "Programın durumu": "Estado del horario",
  "Yerleşmiş saat": "Horas colocadas",
  "Tamamlanan ders": "Clases completas",
  "Kapalı saatte ders ({n})": "Clases en hora cerrada ({n})",
  Açıklama: "Explicación",
  "Kapalı saat": "Horas cerradas",
  "Müsait değil": "No disponible",
  "Kural ihlalleri ({n})": "Reglas incumplidas ({n})",
  "Kesin": "Estricta",
  "Yerleşemeyen dersler ({n})": "Clases que no se pueden colocar ({n})",
  Ders: "Clase",
  Sebep: "Motivo",
  Öğretmenler: "Profesores",
  "Öğretmenin müsait saat sayısı, ona yüklenen ders saatinden az olamaz.":
    "Las horas disponibles de un profesor no pueden ser menos que las horas que se le asignan.",
  Sınıflar: "Clases",
  "Sınıfa yüklenen toplam ders saati, sınıfın AÇIK olduğu saatlere sığmalı.":
    "El total de horas asignadas a una clase debe caber en las horas en que la clase está ABIERTA.",
  Derslikler: "Aulas",
  "Aynı dersliği paylaşan sınıfların TOPLAM ders saati de haftaya sığmalı. En çok gözden kaçan darboğaz burasıdır.":
    "El TOTAL de horas de las clases que comparten un aula también debe caber en la semana. Es el cuello de botella que más se pasa por alto.",
  "Öğretmenleri ve sınıfları **Okul**, dersleri **Dersler** sekmesinden girdikten sonra buraya dönün. Bu sayfa programın dizilip dizilemeyeceğini önceden söyler.":
    "Vuelva aquí cuando haya introducido profesores y clases en la pestaña **Escuela** y asignaturas en la pestaña **Clases**. Esta página dice de antemano si el horario puede montarse.",
  "**Sorun görünmüyor.** Öğretmen müsaitlikleri, sınıf ve derslik kapasiteleri yüklenen ders saatlerini karşılıyor. Program dizilebilir.":
    "**No se ve ningún problema.** La disponibilidad y la capacidad de clases y aulas cubren las horas asignadas. El horario puede montarse.",
  "**Sorun görünmüyor.** Bazı öğretmenlerin müsait saati ya da bazı sınıf ve dersliklerin açık saati yüküne eşit ya da çok yakın (**Sıkışık**): orada boş saat kalmıyor ya da çok az kalıyor, ama program dizilebilir.":
    "**No se ve ningún problema.** Algunos profesores tienen tantas horas disponibles, o algunas clases o aulas tantas horas abiertas, como asignadas, o casi (**Justo**): no sobra ninguna hora o sobran muy pocas, pero el horario puede montarse.",
  "**Dikkat edilmesi gereken noktalar var.** Aşağıdaki listelerde":
    "**Hay puntos a los que prestar atención.** En las listas siguientes, las filas marcadas",
  "yazan satırlar programın dizilmesini engeller. Önce onları çözün.":
    "impiden montar el horario. Resuélvalas primero.",
  "Kalan **{n}** saat yerleşmedi. **Program** sekmesindeki **Programı yap** ile yerleştirebilirsiniz.":
    "Las **{n}** horas restantes no están colocadas. **Hacer el horario** en la pestaña **Horario** las coloca.",
  "İpuçları ({n})": "Consejos ({n})",
  "Bunlar programı engellemez; veri girişinde gözden kaçmış olabilecek noktalardır.":
    "Esto no bloquea el horario; son puntos que pueden haberse pasado por alto al introducir los datos.",
  "İpucu yok.": "Ningún consejo.",
  "Not": "Nota",

  // src/ui/common/ColorPick.tsx
  Vazgeç: "Cancelar",

  // src/ui/shell/Commands.tsx
  Git: "Ir a",
  Yap: "Hacer",
  "derslik yok": "sin aula",
  "{n} sınıf": "{n} {n:clase|clases}",

  // src/ui/plans/DraftStart.tsx
  "Bu taslağın verisi bulunamadı":
    "No se han encontrado los datos de este borrador",
  "{ad} kopyası": "copia de {ad}",
  '"{ad}" taslağından yeni bir plan açıldı.':
    'Se ha abierto un plan nuevo desde el borrador "{ad}".',

  // src/ui/program/Grid.tsx
  "Öğle arası": "Descanso del mediodía",
  "Sürükleyerek taşıyın · sağ tık: seçenekler":
    "Arrastre para mover · clic derecho para opciones",
  "{sorun}. Sürükleyerek taşıyın, sağ tıkla seçenekleri açın":
    "{sorun}. Arrastre para mover, clic derecho para opciones",
  "Sabitlenmiş. Sağ tıkla sabitlemeyi kaldırabilirsiniz":
    "Fijada. Clic derecho para soltarla",

  // src/ui/program/Program.tsx — the grid's own menu
  "Havuza kaldır": "Enviar a la bandeja",
  sabitlenmiş: "fijada",
  "Dersi düzenle": "Editar la clase",
  "Dersi buraya sabitle": "Fijar la clase aquí",
  "Sabitlemeyi kaldır": "Soltar",
  "Bu ders sabitlenmiş. Önce sabitlemeyi kaldırın.":
    "Esta clase está fijada. Suéltela primero.",
  "Ders sabitlendi.": "Clase fijada.",
  "Sabitleme kaldırıldı.": "Clase soltada.",

  // src/ui/program/LessonEdit.tsx
  "Günde en fazla": "Máximo por día",
  "Dağılım değiştirilirse bu dersin programdaki yerleşimleri kalkar, sabitlenmiş olanlar da":
    "Si cambia el reparto, esta clase sale del horario, también las clases fijadas",

  // src/ui/Ribbon.tsx — what the two destructive questions promise
  "{ad}: bilgileri ve haftalık programı": "{ad}: datos y horario semanal",

  // src/ui/program/Inspector.tsx
  Kapat: "Cerrar",
  "Haftalık programı": "Horario semanal",
  "Kayıt bulunamadı": "No se ha encontrado el registro",

  // src/ui/program/LessonPool.tsx
  "Yerleşmeyi bekleyen dersler": "Clases pendientes de colocar",
  "Havuz yüksekliği": "Altura de la bandeja",
  "Sürükleyerek havuzun boyunu ayarlayın":
    "Arrastre para ajustar la altura de la bandeja",
  Havuz: "Bandeja",
  "Havuzu kapat: ızgara bütün yüksekliği alır":
    "Cerrar la bandeja: la cuadrícula ocupa toda la altura",
  "Havuzu aç": "Abrir la bandeja",
  "Hepsi yerleşti": "Todo colocado",
  "{n} dersin tamamı programda":
    "las {n} {n:clase está|clases están} en el horario",
  "{n} ders bekliyor": "{n} {n:clase espera|clases esperan}",
  "{n} saat · sürükleyip bırakın": "{n} {n:hora|horas} · arrastre y suelte",
  "{ust} · {alt} {brans} · {boy} saatlik ders":
    "{ust} · {alt} {brans} · clase de {boy} horas",
  " · {n} tane bekliyor": " · {n} en espera",
  " · dersin {yerlesen}/{toplam} saati yerleşti":
    " · {yerlesen} de las {toplam} horas de la clase colocadas",

  // src/ui/ListTools.tsx
  "{ne} ara": "Buscar {ne}",
  "Ara…": "Buscar…",
  "Aramayı temizle": "Borrar la búsqueda",
  Sırala: "Ordenar",
  "Girildiği sıra": "Orden de entrada",
  "Önce bir sıralama seçin": "Elija primero un orden",
  "Süzmeyi kaldır": "Quitar el filtro",
  "**{gorunen}** / {sayim}": "**{gorunen}** de {sayim}",
  "Satırları elle sıralamak için **Sırala**’yı «Girildiği sıra»ya alın ve süzmeyi kaldırın.":
    "Para ordenar las filas a mano, ponga **Ordenar** en «Orden de entrada» y quite el filtro.",

  // src/ui/shell/Palette.tsx
  "Komut paleti": "Paleta de comandos",
  "Ara veya komut yaz": "Buscar o escribir un comando",
  "Öğretmen, sınıf, derslik ara ya da bir komut yaz…":
    "Busque un profesor, clase o aula, o escriba un comando…",
  Esc: "Esc",
  Sonuçlar: "Resultados",
  "Eşleşen bir şey yok.": "No hay coincidencias.",

  // src/ui/print/Print.tsx
  Gün: "Día",
  "Yazdırılacak program yok.": "No hay horario que imprimir.",
  "{ne} ({secili}/{toplam})": "{ne} ({secili}/{toplam})",
  Tümü: "Todos",
  Hiçbiri: "Ninguno",
  "{ad} sınıfı · Haftalık ders programı": "Clase {ad} · Horario semanal",
  Çıktı: "Impresión",
  "Yazdır ({n} kâğıt)": "Imprimir ({n} {n:hoja|hojas})",
  "Hiçbir sayfa seçili değil, basılacak bir şey yok.":
    "No hay ninguna página seleccionada, no hay nada que imprimir.",
  "Sayfa düzeni": "Diseño de página",
  "Bir kâğıda kaç program": "Horarios por hoja",
  "Kâğıttaki yazı": "Texto en papel",
  "Sayfada ne olsun": "Qué aparece en la página",
  "Çıktı özeti": "Resumen de impresión",
  Kâğıt: "Hojas",
  Sayfa: "Páginas",
  "A4 yatay": "A4 apaisado",
  Renk: "Color",
  "Önce **Dersler** sekmesinden dersleri girip **Program** sekmesinde dizin.":
    "Introduzca primero las clases en la pestaña **Clases** y móntelas en la pestaña **Horario**.",
  "Seçilen sayfaların **{n}** tanesi tamamen boş. O öğretmenlerin programı henüz dizilmemiş. **Program** sekmesinden dizebilirsiniz.":
    "**{n}** de las páginas seleccionadas están completamente vacías. Los horarios de esos profesores aún no se han montado. Puede montarlos en la pestaña **Horario**.",
  "Seçilen sayfaların **{n}** tanesi tamamen boş. O sınıfların programı henüz dizilmemiş. **Program** sekmesinden dizebilirsiniz.":
    "**{n}** de las páginas seleccionadas están completamente vacías. Los horarios de esas clases aún no se han montado. Puede montarlos en la pestaña **Horario**.",

  // src/ui/program/Program.tsx
  "Buraya bırakılabilir.": "Se puede soltar aquí.",
  "Program yapılıyor…": "Haciendo el horario…",
  "{yerlesen}/{toplam} ders · {sure} sn": "{yerlesen}/{toplam} clases · {sure} s",
  "Satırlar öğretmen. Hücrede sınıf ve derslik yazar. Yerleşmiş dersi sürükleyerek taşıyın, sağ tıklayınca havuza döner.":
    "Las filas son profesores. Una celda muestra la clase y el aula. Arrastre una clase colocada para moverla; el clic derecho la devuelve a la bandeja.",
  "Satırlar sınıf. Hücrede öğretmen ve branşı yazar. Yerleşmiş dersi sürükleyerek taşıyın, sağ tıklayınca havuza döner.":
    "Las filas son clases. Una celda muestra el profesor y su asignatura. Arrastre una clase colocada para moverla; el clic derecho la devuelve a la bandeja.",
  "Program yapıldı. {n} ders yerleşti ({sure} sn). Ctrl+Z ile geri alabilirsiniz.":
    "El horario está hecho. {n} {n:clase colocada|clases colocadas} ({sure} s). Ctrl+Z lo deshace.",
  " (ve {n} ders daha)": " (y {n} {n:clase más|clases más})",
  "Durduruldu. {yerlesen}/{toplam} ders yerleşti.":
    "Detenido. {yerlesen} de {toplam} clases colocadas.",
  "{yerlesen}/{toplam} ders yerleşti.":
    "{yerlesen} de {toplam} clases colocadas.",
  "{bas} {ders}: {saat} saat yerleşemedi. {sebep}{digerleri}.":
    "{bas} {ders}: no se pudieron colocar {saat} horas. {sebep}{digerleri}.",
  "Henüz dizilecek ders yok.": "Todavía no hay clases que montar.",
  "Buraya döndüğünüzde dersler alttaki havuzda bekliyor olacak.":
    "Cuando vuelva aquí las clases estarán esperando en la bandeja de abajo.",
  "Ayrıntı: Kontrol sekmesi.": "Detalles: la pestaña Revisión.",
  Tamam: "Aceptar",
  Öğretmen: "Profesor",
  Sınıf: "Clase",
  "Önce **Okul** sekmesinden derslikleri, öğretmenleri ve sınıfları girin, **Müsaitlik** sekmesinde öğretmenlerin müsait olmadığı saatleri işaretleyin, sonra **Dersler** sekmesinde her sınıfa haftalık ders saatlerini ekleyin.":
    "Introduzca primero las aulas, profesores y clases en la pestaña **Escuela**, marque en la pestaña **Disponibilidad** las horas en que los profesores no están disponibles y añada después en la pestaña **Clases** las horas semanales de cada clase.",

  // src/ui/Ribbon.tsx
  "Liste boş": "La lista está vacía",
  Durdur: "Detener",
  "Yeniden yap": "Rehacer",
  "Programı boşalt": "Vaciar el horario",
  "Sorun yok": "Sin problemas",
  "Sorunlar ({n})": "Problemas ({n})",
  "{n} uyarı": "{n} {n:aviso|avisos}",
  "İkisi de": "Ambos",
  "Renkli bas": "Imprimir en color",

  // src/ui/lessons/index.tsx
  "Yeni ders": "Nueva clase lectiva",
  Branş: "Asignatura",
  "Sınıfa göre": "Por clase",
  "Öğretmene göre": "Por profesor",
  "Haftalık saate göre": "Por horas semanales",
  "Blok sayısına göre": "Por número de bloques",
  "{ders} ders · {saat} saat":
    "{ders} {ders:clase|clases} · {saat} {saat:hora|horas}",
  "Dersler · {sayilar}": "Clases · {sayilar}",
  "{kim} · {brans} dersleri · {sayilar}":
    "{kim} · clases de {brans} · {sayilar}",
  "{kim} dersleri · {sayilar}": "Clases de {kim} · {sayilar}",
  "Önce sağdaki listeden bir {ne} seçin.":
    "Elija primero {ne} en la lista de la derecha.",
  "Sınıf seçin": "Elija una clase",
  "Tüm branşlar": "Todas las asignaturas",
  "Öğretmen seçin": "Elija un profesor",
  "{brans}: {n} öğretmen": "{brans}: {n} {n:profesor|profesores}",
  "Haftalık saat": "Horas semanales",
  Dağılım: "Reparto",
  Ekle: "Añadir",
  "Dersleri yapıştır": "Pegar clases",
  "Sınıf · Öğretmen (ad veya kısa ad) · Haftalık saat · Blok (1 · 2 · 3)":
    "Grupo · Profesor (nombre o nombre corto) · Horas semanales · Bloque (1 · 2 · 3)",
  "Günde en fazla {n} saat kuralı bu dersi hiçbir yere sığdırmaz":
    "La regla \"como máximo {n} horas al día\" no deja sitio a esta clase",
  "{boy} saat > günde {n}": "{boy} h > {n}/día",
  "{sinif} · {kim}: {saat} saat ({dagilim})":
    "{sinif} · {kim}: {saat} horas ({dagilim})",
  "{n} satır eklenemedi":
    "No se {n:pudo añadir|pudieron añadir} {n} {n:fila|filas}",
  "Sınıf veya öğretmen bulunamadı:":
    "No se ha encontrado la clase o el profesor:",
  "Önce onları ekleyip tekrar deneyin.":
    "Añádalos primero y vuelva a intentarlo.",
  "Bu aramaya uyan ders yok.": "Ninguna clase coincide con esta búsqueda.",
  "Bu ders bir günde en fazla kaç saat":
    "Máximo de horas de esta clase en un día",
  "Aynı gün olmasın": "No el mismo día",
  "Aynı gün olmasın: ders ekle": "No el mismo día: añadir una clase",
  "Ders ekle…": "Añadir una clase…",
  "Kaldır: {ne}": "Quitar: {ne}",
  "Günde ↑": "Al día ↑",
  "{sinif} · {kim} dersinin branşı": "Asignatura de la clase {sinif} · {kim}",
  "Dağılım değiştirilirse bu dersin programdaki yerleşimleri kalkar":
    "Si cambia el reparto, se quitan las colocaciones de esta clase del horario",
  Sil: "Borrar",
  "Hangi öğretmen": "Qué profesor",
  "Hangi sınıf": "Qué clase",
  "Seçtiğiniz öğretmen için ders girin. Soldaki liste de o öğretmene daralır.":
    "Introduzca clases para el profesor que elija. La lista de la izquierda también se reduce a ese profesor.",
  "Seçtiğiniz sınıf için ders girin. Soldaki liste de o sınıfa daralır.":
    "Introduzca clases para la clase que elija. La lista de la izquierda también se reduce a esa clase.",
  "Ders listesi": "Lista de clases",
  "Excel'den yapıştır": "Pegar desde Excel",
  "Ders eklemek için önce **Okul** sekmesinde en az bir öğretmen ve bir sınıf girin.":
    "Para añadir una clase, introduzca primero al menos un profesor y una clase en la pestaña **Escuela**.",
  "Henüz {ne} yok. **Okul** sekmesinden ekleyin.":
    "Todavía no hay {ne}. Añada una en la pestaña **Escuela**.",

  // src/ui/settings/Appearance.tsx
  Tema: "Tema",
  "Yazı büyüklüğü": "Tamaño del texto",
  Yoğunluk: "Densidad",
  Izgara: "Cuadrícula",
  "Izgara yoğunluğu": "Densidad de la cuadrícula",
  Ferah: "Amplio",
  Rahat: "Cómodo",
  Sığdır: "Ajustar",
  "Arayüzün geri kalanı": "El resto de la interfaz",
  "Arayüz yoğunluğu": "Densidad de la interfaz",
  "Kaydırınca gizlenir": "Se oculta al desplazar",
  Örnek: "Ejemplo",
  Saat: "Hora",
  Hareket: "Movimiento",
  Dil: "Idioma",
  "Henüz öğretmen yok. **Okul → Öğretmenler** adımından ekleyin; burası o listeyi gösterir.":
    "Todavía no hay profesores. Añádalos en **Escuela → Profesores**; aquí se muestra esa lista.",
  "**Tam.** Tasarlandığı gibi.": "**Completo.** Tal como se diseñó.",
  "**Kapalı.** Hiçbir şey kaymaz, hiçbir şey solmaz.":
    "**Desactivado.** Nada se desliza y nada se atenúa.",

  // src/ui/settings/Data.tsx
  "Nereye kaydedilsin": "Dónde se guarda",
  "Klasör seç…": "Elegir carpeta…",
  "Başka klasör seç…": "Elegir otra carpeta…",
  "İzin ver": "Permitir",
  "Şu an yalnızca bu bilgisayarın tarayıcısında saklanıyor.":
    "Ahora mismo solo se guarda en el navegador de este ordenador.",
  "Sürüm ve güncelleme": "Versión y actualización",
  Sürüm: "Versión",
  Yenilikler: "Novedades",
  "Eski sürümler": "Versiones anteriores",
  // src/platform/changelog.ts — release-note bullets, translated like any other UI copy
  "Program kurulamayınca Mozaik neyin değişmesi gerektiğini yol yol söylüyor, her yol tek tıkla uygulanıyor ve Ctrl+Z ile geri alınıyor.":
    "Cuando un horario no puede montarse, Mozaik dice qué tendría que cambiar, camino por camino; cada camino se aplica con un clic y se deshace con Ctrl+Z.",
  "Öneri panelinde öğretmenlere sorulacak sorular var, her birinde Olur ve Olmaz; cevaplar planla birlikte saklanıyor.":
    "El panel de sugerencias lista las preguntas para cada profesor, cada una con Sí y No es posible; las respuestas se guardan con el plan.",
  "Izgarada göster, önerilen programı uygulamadan önce ızgarada işaretli gösteriyor.":
    "Mostrar en la cuadrícula marca el horario sugerido en la cuadrícula antes de aplicarlo.",
  "Otomatik diz takılınca vazgeçmiyor, bulduğu en iyi programı onararak devam ediyor.":
    "La colocación automática ya no se rinde al atascarse: sigue reparando el mejor horario encontrado.",
  "Dersin sayfasında \"Aynı gün olmasın\" satırı: iki ders aynı güne konmuyor.":
    "Una fila \"No el mismo día\" en la ficha de la clase: dos clases nunca van el mismo día.",
  "Bir kart, bırakıldığı saatleri dolduran kartlarla yer değiştirebiliyor.":
    "Una tarjeta puede intercambiarse con las tarjetas que llenan las horas donde se suelta.",
  "Ayarlar → Hakkında, öneri aramasının bu bilgisayarda ne kadar sürdüğünü gösteriyor.":
    "Ajustes → Acerca de muestra cuánto tarda la búsqueda de sugerencias en este ordenador.",
  "Kontrol, program tamamken sıkışık satırlar için artık \"Dikkat\" demiyor.":
    "Comprobación ya no dice \"atención\" por filas justas cuando el horario está completo.",
  "Dil değişince bildirimler yeni dilde; boş ekranlar dersler için Dersler sekmesini gösteriyor.":
    "Los avisos siguen al cambio de idioma; las pantallas vacías remiten a la pestaña Clases para las clases.",
  "Program araç şeridinde Renk menüsü: kartlar öğretmene, sınıfa, dersliğe ya da branşa göre boyanıyor.":
    "Un menú Color en la barra de herramientas del horario colorea las tarjetas por profesor, clase, aula o asignatura.",
  "Bir kart başka bir kartın üstüne bırakılınca, iki hamle de uygunsa ikisi yer değiştiriyor.":
    "Soltar una tarjeta sobre otra intercambia las dos cuando ambos movimientos están permitidos.",
  "Okunmamış sürüm notu varken Ayarlar şeridindeki Hakkında düğmesinde bir nokta çıkıyor.":
    "Un punto en el botón Acerca de de la cinta de Ajustes mientras haya notas de versión sin leer.",
  "Mozaik'in penceresi artık ekranı kaplayarak açılıyor, küçük bir kutuda değil.":
    "La ventana de Mozaik se abre ocupando la pantalla, no en un recuadro pequeño.",
  "Sığdır yoğunluğunda kart yazıları kırpılmıyor: sınıf numarası \"4…\" değil \"411\" okunuyor.":
    "En la densidad Ajustar el texto de las tarjetas ya no se corta: el número de clase dice \"411\", no \"4…\".",
  "Sığdır, satır başından ve gün ayraçlarından kazandığı yeri ders sütunlarına veriyor.":
    "Ajustar da a las columnas de clases el espacio que ahorra en los encabezados de fila y los separadores de día.",
  "Yazı büyüklüğü yüzde 100'ün altındayken kart yazısı da onunla birlikte küçülüyor.":
    "Con un tamaño de texto por debajo del 100 por ciento, el texto de las tarjetas también se reduce.",
  "Sınıf ve öğretmen boşluk kuralları, planlama analizi ve Danışman notları eklendi.":
    "Se añadieron reglas de huecos para clases y docentes, análisis de planificación y notas del asesor.",
  "Klavye kısayolları için bir yardım ekranı eklendi (üst çubuk ya da \"?\" tuşu).":
    "Se añadió una pantalla de ayuda para los atajos de teclado (barra superior o la tecla ?).",
  'Ayarlar → Hakkında bölümüne bu "Yenilikler" paneli eklendi.':
    "Este panel de novedades se añadió a Ajustes → Acerca de.",
  "Program kartlarını sürükleme, yoğun programlarda yaklaşık yüzde 63 hızlandırıldı.":
    "Arrastrar tarjetas del horario es aproximadamente un 63 por ciento más rápido en horarios densos.",
  "Windows görev çubuğu simgesi 20 piksel ve üzerinde ayrıntılı logoyu kullanıyor.":
    "El icono de la barra de tareas de Windows usa el logotipo detallado a partir de 20 píxeles.",
  "Dersler → Sınıftan görünümündeki gereksiz Branş başlığı kaldırıldı.":
    "Se eliminó el encabezado innecesario de Asignatura en Clases → Por clase.",
  "Nasıl açıldı": "Cómo se ha abierto",
  Adres: "Dirección",
  "Güncellemeleri denetle": "Buscar actualizaciones",
  "Yeni sürümü indir": "Descargar la versión nueva",
  "Kurulumu indir": "Descargar el instalador",
  "Şimdi kur": "Instalar ahora",
  "Kuruluma bak": "Ver el instalador",
  "**Mozaik'i bu bilgisayara kurun.** Öneri araması (CP-SAT) için gerekli, onunla çok daha hızlı. İndirmek {mb} MB yer kaplar.": "**Instale Mozaik en este ordenador.** La búsqueda de sugerencias (CP-SAT) lo necesita y es mucho más rápida con él. La descarga ocupa {mb} MB.",
  "**Kurulum indi.** **Şimdi kur** deyince Mozaik kapanır, kurulum bir ilerleme çubuğuyla çalışır ve Mozaik kendiliğinden yeniden açılır. Planlarınız kayıtlı, hiçbir şey kaybolmaz. Masaüstündeki ya da görev çubuğundaki eski Mozaik simgesi de kurulan programı açar.": "**El instalador ya está aquí.** Con **Instalar ahora** Mozaik se cierra, la instalación avanza con una barra de progreso y Mozaik se vuelve a abrir solo. Sus planes están guardados, no se pierde nada. El antiguo icono de Mozaik en el escritorio o en la barra de tareas también abre el programa instalado.",
  "**Mozaik'i bu bilgisayara kurun.** Öneri araması (CP-SAT) ancak kurulumla gelir ve çok daha hızlıdır. Planlarınız yerinde kalır.": "**Instale Mozaik en este ordenador.** La búsqueda de sugerencias (CP-SAT) solo llega con la instalación y es mucho más rápida. Sus planes se quedan donde están.",
  "**Kurulum tamamlanamadı** (kod {kod}). Mozaik eski hâliyle açıldı, planlarınız yerinde. Bilgisayarı yeniden başlatıp Ayarlar → Hakkında'dan tekrar deneyebilirsiniz.": "**La instalación no terminó** (código {kod}). Mozaik se abrió como estaba, sus planes siguen ahí. Reinicie el ordenador y vuelva a intentarlo desde Ajustes → Acerca de.",
  "Şimdi yeniden başlat": "Reiniciar ahora",
  "Bakılıyor…": "Comprobando…",
  "En son sürümü kullanıyorsunuz.": "Está usando la última versión.",
  "Yeni sürüm iniyor…": "Descargando la versión nueva…",
  "Her şey silinecek": "Se borrará todo",
  "Devam et": "Continuar",
  "{yazilan} plan dosyaya yazıldı; {eksik} planın verisi bulunamadı.":
    "{yazilan} {yazilan:plan escrito|planes escritos} en el archivo; no se han encontrado los datos de {eksik} {eksik:plan|planes}.",
  "{yazilan} plan tek dosyaya yazıldı.":
    "{yazilan} {yazilan:plan escrito|planes escritos} en un solo archivo.",
  "Bu dosya Mozaik'in daha yeni bir sürümüyle yazılmış. Mozaik'i güncelleyin.":
    "Este archivo se escribió con una versión más reciente de Mozaik. Actualice Mozaik.",
  "Bu bilgisayardaki bütün planların yerine geçecek":
    "Sustituirá todos los planes de este ordenador",
  "Buradaki {buradaki} plan silinip dosyadaki {gelen} plan açılacak. Bu işlem geri alınamaz.":
    "Se borrarán {buradaki} {buradaki:plan|planes} de aquí y se abrirán {gelen} {gelen:plan|planes} del archivo. Esto no se puede deshacer.",
  "Hepsini değiştir": "Sustituirlos todos",
  "Dosyadaki hiçbir plan okunamadı; hiçbir şey değişmedi.":
    "No se ha podido leer ningún plan del archivo; nada ha cambiado.",
  "{acilan} plan açıldı, {yazilamayan} plan yazılamadı. Depolama dolmuş olabilir. Dosyayı saklayın.":
    "{acilan} {acilan:plan abierto|planes abiertos}, {yazilamayan} no se han podido escribir. Puede que el almacenamiento esté lleno. Conserve el archivo.",
  "Dosyadaki {yeni} plan Mozaik'in daha yeni bir sürümüyle yazılmış, açılmayacak. Mozaik'i güncelleyin.":
    "{yeni} {yeni:plan del archivo se escribió|planes del archivo se escribieron} con una versión más reciente de Mozaik y no se {yeni:abrirá|abrirán}. Actualice Mozaik.",
  "{yeni} plan Mozaik'in daha yeni bir sürümüyle yazıldığı için açılmadı. Mozaik'i güncelleyin.":
    "{yeni} {yeni:plan se escribió|planes se escribieron} con una versión más reciente de Mozaik y no se {yeni:abrió|abrieron}. Actualice Mozaik.",
  "Dosyadaki {eksik} plan eksik ya da bozuk, açılmayacak.":
    "{eksik} {eksik:plan del archivo está incompleto o dañado y no se abrirá|planes del archivo están incompletos o dañados y no se abrirán}.",
  "{acilan} plan açıldı, {eksik} plan eksik ya da bozuk olduğu için açılmadı.":
    "{acilan} {acilan:plan abierto|planes abiertos}; {eksik} {eksik:estaba incompleto o dañado y no se abrió|estaban incompletos o dañados y no se abrieron}.",
  "{acilan} plan açıldı.": "{acilan} {acilan:plan abierto|planes abiertos}.",
  "Bütün planlar tek dosyada": "Todos los planes en un archivo",
  "Tümünü dosyaya kaydet ({n} plan)":
    "Guardar todo en archivo ({n} {n:plan|planes})",
  "Bu bilgisayardaki bütün planların yerine dosyadakiler geçer":
    "Los planes del archivo sustituyen a todos los de este ordenador",
  "Tümünü dosyadan aç": "Abrir todos desde archivo",
  "Bütün planları içeren dosya": "El archivo con todos los planes",
  "Bu planın verisi": "Los datos de este plan",
  "Örnek okul verisi": "Datos de escuela de ejemplo",
  "Bu planın yerine hazır örnek okulu koyar":
    "Pone la escuela de ejemplo en lugar de este plan",
  "Örnek okulu yükle": "Cargar la escuela de ejemplo",
  Sıfırla: "Restablecer",
  "Her şeyi siler": "Borra todo",
  "Her şeyi sil": "Borrar todo",
  "Veriler nerede": "Dónde están los datos",
  Anahtar: "Clave",
  Ne: "Qué",
  Yer: "Tamaño",
  "Bu bilgisayardaki otomatik yedekler": "Copias de seguridad automáticas en este ordenador",
  "Henüz otomatik yedek yok; ilki Mozaik bir daha açılınca alınır.":
    "Aún no hay copia de seguridad automática; la primera se hace la próxima vez que se abra Mozaik.",
  "Otomatik yedek": "Copia de seguridad automática",
  "bir önceki açılış": "apertura anterior",
  "{n} açılış önce": "hace {n} {n:apertura|aperturas}",
  "daha yeni bir sürümle yazılmış, bu sürüm açamıyor":
    "escrita por una versión más reciente, esta versión no puede abrirla",
  "okunamadı": "no se pudo leer",
  "O zamana kadar üst çubuktaki **Kaydet** tek çare.":
    "Hasta entonces, **Guardar** en la barra superior es el único remedio.",
  "**{klasor}** klasörü seçilmiş, ama tarayıcı izni her açılışta yeniden soruyor. **İzin ver** deyin.":
    "La carpeta **{klasor}** está elegida, pero el navegador vuelve a pedir permiso en cada inicio. Pulse **Permitir**.",
  "**{klasor}** · yazılıyor…": "**{klasor}** · escribiendo…",
  "**Yeni sürüm hazır.** Üstteki **Yenile** düğmesine basın.":
    "**Hay una versión nueva lista.** Pulse el botón **Recargar** de arriba.",
  "**v{surum} çıktı{tarih}.** İndirmek {mb} MB yer kaplar. İndirdikten sonra ne zaman geçeceğinize siz karar verirsiniz.":
    "**v{surum} ya está{tarih}.** Descargarla ocupa {mb} MB. Una vez descargada, usted decide cuándo cambiar.",
  "**v{surum} indi.** Yeniden başlatınca yeni sürüm açılır. Planlarınız kayıtlı, hiçbir şey kaybolmaz.":
    "**v{surum} se ha descargado.** Al reiniciar se abre la versión nueva. Sus planes están guardados; no se pierde nada.",

  // src/ui/settings/Plans.tsx
  "Bu işlem geri alınamaz.": "Esto no se puede deshacer.",
  "{ogretmen} öğretmen, {sinif} sınıf, {ders} ders ve yerleşmiş {saat} saat silinecek. Bu işlem geri alınamaz.":
    "Se borrarán {ogretmen} {ogretmen:profesor|profesores}, {sinif} {sinif:clase|clases}, {ders} {ders:asignatura|asignaturas} y {saat} {saat:hora colocada|horas colocadas}. Esto no se puede deshacer.",
  '"{ad}" planı silinecek': 'Se borrará el plan "{ad}"',
  "Planı sil": "Borrar el plan",
  "Planlar ({n})": "Planes ({n})",
  "Yeni plan": "Plan nuevo",
  "Boş plan": "Plan vacío",
  "Bu planın kopyası": "Copia de este plan",
  "Öğretmenler, sınıflar ve dersler kalır; dizilmiş program boşalır":
    "Profesores, clases y asignaturas se mantienen; el horario montado se vacía",
  "Taslak olarak kaydet": "Guardar como borrador",
  Taslak: "Borrador",
  İçerik: "Contenido",
  "{ad} adı": "nombre de {ad}",
  "· açık olan": "· abierto",
  "Bu planın verisi bulunamadı": "No se han encontrado los datos de este plan",
  "{ogretmen} öğretmen · {sinif} sınıf · {ders} ders":
    "{ogretmen} {ogretmen:profesor|profesores} · {sinif} {sinif:clase|clases} · {ders} {ders:clase|clases}",
  "Bu plana geç": "Cambiar a este plan",
  "Tek plan silinemez": "No se puede borrar el único plan",
  "Bu planı tamamen siler": "Borra este plan por completo",
  "Taslaktan başla": "Empezar desde un borrador",
  "· verisi yok": "· sin datos",
  "Taslağın kurulumu (derslikler, öğretmenler, sınıflar, dersler) kopyalanır; ** dizilmiş program boş gelir**. Taslağın kendisi değişmez.":
    "Se copia la configuración del borrador (aulas, profesores, clases, asignaturas); **el horario montado viene vacío**. El borrador en sí no cambia.",

  // src/ui/settings/Rules.tsx
  Kurallar: "Reglas",
  Kural: "Regla",
  "Ne yapsın": "Qué hacer",
  "Şu an": "Ahora mismo",
  "{kural} kuralı": "la regla {kural}",
  Kapalı: "Desactivada",
  "Uyan yok": "Nada coincide",
  "Kendi sınırı olan öğretmenler ({n})": "Profesores con límites propios ({n})",
  "Art arda": "Seguidas",
  "Günde ↓": "Al día ↓",
  "Şu anki ihlaller ({n})": "Incumplimientos actuales ({n})",
  "Dizilmiş program girdiğiniz sınırların hiçbirini aşmıyor.":
    "El horario montado no supera ninguno de los límites que ha fijado.",
  "Kendi sınırı olan sınıflar ({n})": "Clases con límite propio ({n})",

  // src/ui/settings/School.tsx
  "Zil ve günler": "Timbre y días",
  "Okul adı (yazdırılan sayfaların başlığında görünür)":
    "Nombre de la escuela (aparece en el encabezado de las páginas impresas)",
  "örn. Semiz Kurs": "p. ej. Academia Semiz",
  "ders yok": "sin clases",
  "{gun} öğle arası": "descanso del mediodía del {gun}",
  "Uzun ara yok": "Sin descanso largo",
  "{n}. saatten sonra": "después de la hora {n}",
  "En az bir gün seçmelisiniz.": "Debe elegir al menos un día.",
  "Günün saatleri": "Horas del día",
  "Günlük saat sayısı": "Horas por día",
  "İlk saatin başlangıcı": "Inicio de la primera hora",
  "Başlangıç saati": "Hora de inicio",
  "Başlangıç dakikası": "Minuto de inicio",
  "Saat (dk)": "Hora (min)",
  "Teneffüs (dk)": "Recreo (min)",
  "Öğle arası (dk)": "Descanso del mediodía (min)",
  "Saat adları (virgülle; boş kalan numarasını alır)":
    "Nombres de las horas (separados por comas; una hora sin nombre conserva su número)",
  "{n} ad saat sayısından fazlaydı ve kullanılmadı.":
    "{n} {n:nombre sobraba|nombres sobraban} respecto al número de horas y no se {n:usó|usaron}.",
  "Bunların {n} saati sabitli, sabitlemeleri de kalkacak.":
    "{n} de ellas {n:está fijada|están fijadas}; también se quitará la fijación.",
  "Öteki seçeneklerde de {n} saat kalkacak.":
    "También se quitarán {n} {n:hora|horas} de las otras variantes.",
  "Bu dersler havuza dönecek. Geri al ile geri getirebilirsiniz.":
    "Estas clases volverán a la bandeja. Deshacer las devuelve.",
  "Günlük saat sayısı {n} olacak":
    "El día tendrá {n} {n:hora|horas}",
  "{saat}. saatten sonra yerleşmiş {n} saat var.":
    "Hay {n} {n:hora colocada|horas colocadas} después de la hora {saat}.",
  "Saat sayısını düşür":
    "Reducir el número",
  "{gun} ders günlerinden çıkacak":
    "{gun} dejará de ser día de clase",
  "{gun} günü yerleşmiş {n} saat var.":
    "Hay {n} {n:hora colocada|horas colocadas} el {gun}.",
  "{gun} gününü çıkar":
    "Quitar el {gun}",
  "Zil saatleri": "Horas del timbre",
  Ara: "Recreo",
  "Öğle arası, {dk} dk": "Descanso del mediodía, {dk} min",
  Bitiş: "Fin",

  // src/ui/setup/Classes.tsx
  Derslik: "Aula",
  "Ada göre": "Por nombre",
  "Dersliğe göre": "Por aula",
  "Ders yüküne göre": "Por carga de clases",
  "Yeni sınıf": "Nueva clase",
  "Sınıf adı, örn. 510": "Nombre de la clase, p. ej. 510",
  "Derslik yok": "Sin aula",
  "Sınıfları yapıştır": "Pegar clases",
  "Sınıf adı · Derslik adı": "Nombre de la clase · Nombre del aula",
  "{ad} → {derslik} dersliği": "{ad} → aula {derslik}",
  "Bu aramaya uyan sınıf yok.": "Ninguna clase coincide con esta búsqueda.",
  "Ders saati": "Horas de clase",
  "Günde aynı ders ↑": "Misma asig./día ↑",
  "Bu sınıf bir günde aynı dersten en fazla kaç saat":
    "Cuántas horas de una asignatura puede tener esta clase en un día",
  "{ad} bir günde aynı dersten en fazla kaç saat":
    "cuántas horas de una asignatura puede tener {ad} en un día",
  yok: "ninguno",
  "Bilgileri ve haftalık programı": "Datos y horario semanal",

  // src/ui/setup/Paste.tsx
  "Buraya yapıştırın...": "Pegue aquí...",
  Önizle: "Vista previa",
  "Okunabilir satır bulunamadı.": "No se ha encontrado ninguna fila legible.",
  "Excel'de sütunları seçip kopyalayın, aşağıya yapıştırın. Beklenen sıra: **{ornek}**":
    "Seleccione y copie las columnas en Excel y péguelas abajo. Orden esperado: **{ornek}**",
  "**{n} satır okundu.** Aşağıdakiler eklenecek:":
    "**{n} {n:fila leída|filas leídas}.** Se añadirá lo siguiente:",

  // src/ui/setup/Rooms.tsx
  "Sınıf sayısına göre": "Por número de clases",
  "Yeni derslik": "Nueva aula",
  "Derslik adı, örn. A": "Nombre del aula, p. ej. A",
  "Derslikleri yapıştır": "Pegar aulas",
  "Derslik adı (her satırda bir tane)": "Nombre del aula (uno por línea)",
  "Bu aramaya uyan derslik yok.": "Ningún aula coincide con esta búsqueda.",
  "Sınıf sayısı": "Número de clases",

  // src/ui/setup/Subjects.tsx
  "Bir öğretmende var ama listede yok": "Un profesor lo tiene pero la lista no",
  "· listede değil": "· no está en la lista",
  "{ad} kısaltması": "abreviatura de {ad}",
  Varsayılan: "Predeterminado",
  "Mozaik'te gömülü olan kısaltma": "La abreviatura incluida en Mozaik",
  "Listeden çıkar": "Quitar de la lista",
  "Bu branş zaten listede değil": "Esta asignatura ya no está en la lista",
  '"{ad}" branşı kullanılıyor': 'La asignatura "{ad}" está en uso',
  "{n} öğretmen bu branşta ({kimler}). Önce onların branşını değiştirin, sonra bu branşı silin.":
    "{n} {n:profesor tiene|profesores tienen} esta asignatura ({kimler}). Cambie primero su asignatura y bórrela después.",
  "Branşlar ({n})": "Asignaturas ({n})",
  "Yeni branş (örn. Robotik)": "Asignatura nueva (p. ej. Robótica)",
  "Yeni branş": "Asignatura nueva",
  "Bu branş listede zaten var.": "Esta asignatura ya está en la lista.",
  Kısaltma: "Abreviatura",
  "Kısa ad": "Nombre corto",

  // src/ui/setup/Summary.tsx
  Renkler: "Colores",
  "Öğretmen renklerini yeniden dağıt ({n})":
    "Redistribuir los colores de los profesores ({n})",
  "Sınıf renklerini yeniden dağıt ({n})":
    "Redistribuir los colores de las clases ({n})",
  Özet: "Resumen",
  "Hazır branşlar ({n})": "Asignaturas listas ({n})",
  "Gömülü tablodaki branşların hepsi listenizde.":
    "Todas las asignaturas de la tabla incorporada ya están en su lista.",
  "Gömülü tablodaki bütün branşları listeye ekler":
    "Añade a la lista todas las asignaturas de la tabla incorporada",
  "Hepsini ekle": "Añadirlas todas",
  "{ad} branşını listeye ekler": "Añade la asignatura {ad} a la lista",
  "Listeye ekle": "Añadir a la lista",
  "Hiçbir öğretmende kullanılmayan {n} branş var: {hangileri}. Silinebilirler.":
    "{n} {n:asignatura no la usa|asignaturas no las usa} ningún profesor: {hangileri}. Se pueden borrar.",
  "Derslik yükü": "Carga de las aulas",
  "Henüz derslik yok.": "Todavía no hay aulas.",
  "Hangi sınıflar": "Qué clases",
  "sınıf yok": "sin clases",
  "{n} sınıf: {hangileri}": "{n} {n:clase|clases}: {hangileri}",
  "Öğretmen yükü": "Carga de los profesores",
  "Henüz öğretmen yok.": "Todavía no hay profesores.",
  "Sınıf yükü": "Carga de las clases",
  "Henüz sınıf yok.": "Todavía no hay clases.",
  "Ders yükü": "Carga de clases",
  "Hiç dersi olmayan öğretmen: {kimler}.":
    "Profesores sin ninguna clase: {kimler}.",
  "**{n} {ne} başkasıyla aynı renkte.** Renk burada bir kimlik: ızgarada, havuzda ve kâğıtta okunuyor.":
    "**{n} {ne} comparten color con otro.** Aquí el color es una identidad: se lee en la cuadrícula, en la bandeja y en el papel.",
  "**{ad}**: {n} öğretmen": "**{ad}**: {n} {n:profesor|profesores}",
  "Sınıfa yüklenen toplam ders saati, sınıfın **açık** olduğu saatlere sığmalı.":
    "El total de horas asignadas a una clase debe caber en las horas en que está **abierta**.",
  "**{n} sınıfın hiç dersi yok** ({hangileri}).":
    "**{n} {n:clase no tiene|clases no tienen} ninguna asignatura** ({hangileri}).",

  // src/ui/setup/Teachers.tsx
  Cinsiyet: "Sexo",
  "Branşa göre": "Por asignatura",
  "Müsait saate göre": "Por horas disponibles",
  "Cinsiyete göre": "Por sexo",
  "Yeni öğretmen": "Nuevo profesor",
  "Ad Soyad": "Nombre y apellidos",
  "Boş bırakırsanız addan üretilir": "Si se deja vacío, se genera del nombre",
  "Branş seçin": "Elija una asignatura",
  "+ Yeni branş…": "+ Asignatura nueva…",
  "Yeni branşın adı": "Nombre de la asignatura nueva",
  "+ İkinci branş": "+ Segunda asignatura",
  "İkinci branş": "Segunda asignatura",
  "İkinci branş yok": "Sin segunda asignatura",
  "Öğretmenleri yapıştır": "Pegar profesores",
  "Ad Soyad · Kısa ad · Branş · Cinsiyet · İkinci branş · E-posta":
    "Nombre y apellidos · Nombre corto · Asignatura · Sexo · Segunda asignatura · Correo",
  "Bu aramaya uyan öğretmen yok.":
    "Ningún profesor coincide con esta búsqueda.",
  "2. branş": "2.ª asignatura",
  "Art arda en fazla kaç saat": "Cuántas horas seguidas como máximo",
  "Bir günde en fazla kaç saat": "Cuántas horas al día como máximo",
  "Geldiği gün en az kaç saat": "Cuántas horas como mínimo el día que viene",
  "{kim} branşı": "asignatura de {kim}",
  "{kim} için ikinci branş ekle": "Añadir una segunda asignatura para {kim}",
  "İkinci branş ekle": "Añadir segunda asignatura",
  "{kim} ikinci branşı": "segunda asignatura de {kim}",
  Yok: "Ninguna",
  "{kim} art arda en fazla kaç saat":
    "cuántas horas seguidas como máximo para {kim}",
  "{kim} günde en fazla kaç saat":
    "cuántas horas al día como máximo para {kim}",
  "{kim} geldiği gün en az kaç saat":
    "cuántas horas como mínimo el día que viene {kim}",
  "Branş listesi boş. **Branşlar** adımından ekleyebilirsiniz.":
    "La lista de asignaturas está vacía. Puede añadirlas en el paso **Asignaturas**.",
  "**Aynı kısa ad birden çok öğretmende:** ızgarada iki satır ayırt edilemez.":
    "**El mismo nombre corto en más de un profesor:** dos filas de la cuadrícula no se distinguen.",

  // src/ui/setup/index.tsx
  Başlarken: "Para empezar",
  "Mozaik'in ne yaptığını görmek isterseniz hazır bir okul yükleyebilirsiniz.":
    "Si quiere ver qué hace Mozaik, puede cargar una escuela ya preparada.",
  "Bu satır bir daha çıkmaz; örnek okul Ayarlar → Hakkında’da durmaya devam eder":
    "Esta línea no volverá a aparecer; la escuela de ejemplo sigue en Ajustes → Acerca de",
  "Bir daha gösterme": "No volver a mostrar",
  "{ad} ile başla": "Empezar con {ad}",
  "Daha önce **taslak** olarak işaretlediğiniz planların kurulumu hazır duruyor. Seçtiğinizden **yeni bir plan** açılır: derslikler, öğretmenler, sınıflar ve dersler kopyalanır, dizilmiş program boş gelir. Taslağın kendisi değişmez.":
    "La configuración de los planes marcados como **borrador** está lista. Al elegir uno se abre **un plan nuevo**: se copian aulas, profesores, clases y asignaturas, y el horario montado viene vacío. El borrador en sí no cambia.",

  // src/ui/useRowOrder.tsx
  Sıra: "Orden",
  "{ad}, {n}. sıra, taşımak için yukarı ve aşağı ok":
    "{ad}, posición {n}, flechas arriba y abajo para mover",
  "Elle sıralama için süzmeyi ve sıralamayı kaldırın":
    "Para ordenar a mano, quite el filtro y la ordenación",

  // src/ui/plans/useSample.ts
  "{ogretmen} öğretmen, {sinif} sınıf ve {ders} ders silinecek.":
    "Se {ogretmen:borrará|borrarán} {ogretmen} {ogretmen:profesor|profesores}, {sinif} {sinif:clase|clases} y {ders} {ders:asignatura|asignaturas}.",
  "Bu plandaki her şeyin yerine örnek okul geçecek":
    "La escuela de ejemplo sustituirá todo lo de este plan",
  "Örnek okul verisi yüklenecek":
    "Se cargarán los datos de la escuela de ejemplo",
  "25 öğretmen, 20 sınıf, 8 derslik ve 99 ders. Mozaik'in ne yaptığını görmek için; kendi verinizi girmeye başlamadan önce Ayarlar → Hakkında → \"Her şeyi sil\" ile temizleyin.":
    "25 profesores, 20 clases, 8 aulas y 99 asignaturas. Para ver qué hace Mozaik; antes de introducir sus propios datos, límpielos con Ajustes → Acerca de → \"Borrar todo\".",
  "Yerine koy": "Sustituir",
  Yükle: "Cargar",
  "Örnek okul yüklendi.": "Escuela de ejemplo cargada.",

  // src/constraints.ts
  "Ders bulunamadı": "No se ha encontrado la clase",
  "Ders eksik tanımlı": "La clase está definida de forma incompleta",
  "Geçersiz hücre": "Celda no válida",
  "Bu saat günün dışında": "Esta hora está fuera del día",
  "{boy} saatlik ders güne sığmıyor":
    "Una clase de {boy} horas no cabe en el día",
  "{n}. gün": "día {n}",
  "{sinif} sınıfının {gun} {saat} saatinde {ders} var":
    "la clase {sinif} ya tiene {ders} el {gun} a la hora {saat}",
  "başka ders": "otra clase",
  "{sinif} sınıfı {gun} {saat} saatinde kapalı":
    "la clase {sinif} está cerrada el {gun} a la hora {saat}",
  "{kim} {gun} {saat} saatinde müsait değil":
    "{kim} no está disponible el {gun} a la hora {saat}",
  "{kim} {gun} {saat} saatinde {sinif} sınıfında":
    "{kim} está con la clase {sinif} el {gun} a la hora {saat}",
  başka: "otra",
  "{derslik} dersliğinde {gun} {saat} saatinde {sinif} var":
    "en el aula {derslik} está {sinif} el {gun} a la hora {saat}",
  "başka sınıf": "otra clase",
  "{derslik} dersliği {gun} {saat} saatinde kapalı":
    "el aula {derslik} está cerrada el {gun} a la hora {saat}",
  "{kim} art arda {sinir} saatten fazla girmemeli, burada {olan} saat olur":
    "{kim} puede dar como máximo {sinir} horas seguidas; aquí serían {olan}",
  "{ders} {gun} günü var, bu dersle aynı güne konmamalı":
    "{ders} está el {gun}; esta clase no debe ir el mismo día",
  "{bir} ile {iki} {gun} günü ikisi de var, aynı gün olmamalı.":
    "{bir} y {iki} están ambas el {gun}; no deben coincidir en el mismo día.",
  "Aynı gün olmaması istenen iki ders aynı gündeyse, dersin sayfasındaki **Aynı gün olmasın** satırı onları gösterir.":
    "Si dos clases que no deben coincidir en el mismo día están el mismo día, la fila **No el mismo día** de la ficha de la clase las muestra.",
  "{bir} ile {iki} {gun} günü sabitlenmiş; aynı gün olmamaları istendiği için biri yerinden oynamadan bir yol bulunamaz.":
    "{bir} y {iki} están fijadas el {gun}; no deben coincidir en el mismo día, así que no hay ninguna salida hasta que una se mueva.",
  "İkisi de **sabitlenmişse** **Programı yap** öneri arayamaz; birinin sabitlemesini kaldırın ya da başka güne taşıyın.":
    "Si las dos están **fijadas**, **Hacer el horario** no puede buscar sugerencias; suelte una o muévala a otro día.",
  "{kim} {gun} günü en fazla {sinir} saat girmeli, burada {olan} saat olur":
    "{kim} puede dar como máximo {sinir} horas el {gun}; aquí serían {olan}",
  "{sinif} sınıfı {gun} günü {kim} dersinden en fazla {sinir} saat görmeli, burada {olan} saat olur":
    "la clase {sinif} puede tener como máximo {sinir} horas de {kim} el {gun}; aquí serían {olan}",
  "{ders} dersi havuza dönecek": "la clase {ders} volverá a la bandeja",
  "{dersler} dersleri havuza dönecek":
    "las clases {dersler} volverán a la bandeja",
  "{ders} dersi havuza döndü": "la clase {ders} ha vuelto a la bandeja",
  "{dersler} dersleri havuza döndü":
    "las clases {dersler} han vuelto a la bandeja",
  "{gun} {saat} saatinde": "el {gun} a la hora {saat}",
  "{kim} {ne_zaman} müsait değil": "{kim} no está disponible {ne_zaman}",
  "{sinif} sınıfı {ne_zaman} kapalı":
    "la clase {sinif} está cerrada {ne_zaman}",
  "{derslik} dersliği {ne_zaman} kapalı":
    "el aula {derslik} está cerrada {ne_zaman}",

  // src/drag.ts
  "Bu hücreye bırakılamaz": "No se puede soltar en esta celda",

  // src/entities.ts
  "{sinif} sınıfının {kim} dersi": "la clase de {kim} del grupo {sinif}",
  "Bu sınıf": "Esta clase",
  "Haftalık ders yükü": "Carga semanal de clases",
  "{n} saat": "{n} {n:hora|horas}",
  "Açık saat": "Horas abiertas",
  "Müsait saat": "Horas disponibles",
  "Programa yerleşmiş": "Colocado en el horario",
  "{yerlesen} / {toplam} saat": "{yerlesen} de {toplam} horas",
  "Branşı: {brans}": "Asignatura: {brans}",
  "Henüz dersi yok": "Todavía sin clases",
  "{n} dersi var: {hangileri}": "{n} {n:clase|clases}: {hangileri}",
  "Dersliği: {derslik}": "Aula: {derslik}",
  "Hiçbir sınıf bu dersliği kullanmıyor": "Ninguna clase usa esta aula",
  "{n} sınıf paylaşıyor: {hangileri}":
    "la comparten {n} {n:clase|clases}: {hangileri}",

  // src/feasibility.ts
  "Boş yer kalmamış": "No queda sitio",
  "{kim} {acik} saat müsait, {yuk} saat ders yüklenmiş. {fazla} saat fazla.":
    "{kim} está disponible {acik} horas y tiene {yuk} asignadas. Son {fazla} de más.",
  "{kim} {acik} saat müsait, {yuk} saat ders yüklenmiş. Zor olacak.":
    "{kim} está disponible {acik} horas y tiene {yuk} asignadas. Va a ser justo.",
  "{kim} {acik} saat müsait, {yuk} saat ders yüklenmiş.":
    "{kim} está disponible {acik} horas y tiene {yuk} asignadas.",
  "{sinif} sınıfına {yuk} saat ders yüklenmiş ama haftada {acik} saati açık. {fazla} saat fazla.":
    "La clase {sinif} tiene {yuk} horas asignadas pero está abierta {acik} a la semana. Son {fazla} de más.",
  "{sinif} sınıfı: açık olan {acik} saatin {yuk} saati dolu.":
    "Clase {sinif}: {yuk} de sus {acik} horas abiertas están llenas.",
  "{derslik} dersliğini {n} sınıf paylaşıyor ({hangileri}) ve toplam {yuk} saat ders var. Haftada {acik} saati açık, {fazla} saat fazla.":
    "El aula {derslik} la comparten {n} clases ({hangileri}) con {yuk} horas en total. Está abierta {acik} a la semana, {fazla} de menos.",
  "{derslik} dersliği ({hangileri}): açık olan {acik} saatin {yuk} saati dolu.":
    "Aula {derslik} ({hangileri}): {yuk} de sus {acik} horas abiertas están llenas.",
  "{n} kural ihlali": "{n} {n:regla incumplida|reglas incumplidas}",
  "{n} ders kapalı saatte": "{n} {n:clase|clases} en hora cerrada",
  "{n} ders sığmıyor": "{n} {n:clase no cabe|clases no caben}",
  "{n} saat yerleşmedi": "{n} {n:hora sin colocar|horas sin colocar}",
  "Henüz ders girilmedi": "Todavía no se han introducido clases",
  "{ders} haftada {n} kez konacak ama yalnızca {gun} gün var; en az bir günde iki kez görülecek.":
    "{ders} debe colocarse {n} veces a la semana pero solo hay {gun} días; caerá dos veces en al menos un día.",
  "{kim} yalnızca {acik} günde müsait ama bir dersi haftada {n} kez konacak; bir güne iki kez düşebilir.":
    "{kim} solo está disponible {acik} días pero una clase debe colocarse {n} veces a la semana; puede caer dos veces en un día.",
  "{ders} {n} ayrı bloğa bölünmüş ve hiç tekli saat bırakmıyor; Mozaik'in deneyebileceği tek şekil bu.":
    "{ders} está dividida en {n} bloques separados sin dejar ninguna hora suelta; es la única forma que puede intentar Mozaik.",
  "{n} ders haftada günden çok kez konacak; en az bir günde iki kez görülecek:":
    "{n} clases deben colocarse más veces a la semana que días hay; cada una caerá dos veces en al menos un día:",
  "{n} öğretmenin müsait günü bir dersinin istediğinden az; bir güne iki kez düşebilir:":
    "{n} docentes tienen menos días disponibles de los que necesita una de sus clases; puede caer dos veces en un día:",
  "{n} ders bloklara bölünmüş ve hiç tekli saat bırakmıyor; Mozaik'in deneyebileceği tek şekil bu:":
    "{n} clases están divididas en bloques sin dejar ninguna hora suelta; es la única forma que puede intentar Mozaik:",

  // src/import.ts
  '{n}. satır: "{ad}" iki kez geçiyor, biri alındı.':
    'Fila {n}: "{ad}" aparece dos veces; se ha tomado una.',
  '{n}. satır: "{ad}" için branş boş.':
    'Fila {n}: la asignatura de "{ad}" está vacía.',
  '{n}. satır: "{ad}" sınıfı iki kez geçiyor, biri alındı.':
    'Fila {n}: la clase "{ad}" aparece dos veces; se ha tomado una.',
  "{n}. satır: sınıf veya öğretmen boş, atlandı.":
    "Fila {n}: la clase o el profesor está vacío; se ha omitido.",
  '{n}. satır: "{sinif} / {kim}" için saat okunamadı, atlandı.':
    'Fila {n}: no se han podido leer las horas de "{sinif} / {kim}"; se ha omitido.',

  // src/library.ts
  "Adsız plan": "Plan sin nombre",
  "Geri gelen plan {n}": "Plan recuperado {n}",
  "Uygulama (.exe)": "Aplicación (.exe)",
  "Dosya (çift tıklanan .html)": "Archivo (.html abierto con doble clic)",
  "Windows kurulumu": "Instalación de Windows",
  Site: "Sitio",
  "plan listesi": "la lista de planes",
  "otomatik yedek · bir önceki açılış": "copia de seguridad automática · apertura anterior",
  "otomatik yedek · {n} açılış önce": "copia de seguridad automática · hace {n} {n:apertura|aperturas}",
  "tema tercihi": "preferencia de tema",
  "dil tercihi": "preferencia de idioma",
  "kenar çubuğu tercihi": "preferencia de barra lateral",
  "yazı büyüklüğü tercihi": "preferencia de tamaño de texto",
  "ızgara yoğunluğu tercihi": "preferencia de densidad de cuadrícula",
  "arayüz yoğunluğu tercihi": "preferencia de densidad de interfaz",
  "havuz çekmecesi tercihi": "preferencia del cajón de la bandeja",
  "havuz çekmecesinin boyu": "altura del cajón de la bandeja",
  "araç şeridi tercihi": "preferencia de barra de herramientas",
  "şerit kaydırınca gizlensin mi": "si la barra se oculta al desplazar",
  "müsaitlikte saat gösterimi": "horas en la pantalla de disponibilidad",
  "hareket (animasyon) tercihi": "preferencia de movimiento (animación)",
  "örnek okul satırı görüldü mü": "si se ha visto la línea de la escuela de ejemplo",
  "kâğıt seçenekleri": "opciones de papel",
  "görülen sürüm notu": "la versión de las notas de versión vista por última vez",

  // src/rules.ts
  "{kim} {gun} günü": "{kim} el {gun}",
  "{kim_gun} {olan} saat ders veriyor, en fazla {sinir} saat isteniyor.":
    "{kim_gun} da {olan} horas; se pedían como máximo {sinir}.",
  "{kim_gun} sadece {olan} saat ders veriyor, en az {sinir} saat isteniyor.":
    "{kim_gun} solo da {olan} horas; se pedían al menos {sinir}.",
  "{kim_gun} art arda {olan} saat ders veriyor, en fazla {sinir} saat isteniyor.":
    "{kim_gun} da {olan} horas seguidas; se pedían como máximo {sinir}.",
  "{sinif} sınıfı {gun} günü {kim} dersinden {olan} saat görüyor, en fazla {sinir} saat isteniyor.":
    "La clase {sinif} tiene {olan} horas de {kim} el {gun}; se pedían como máximo {sinir}.",
  "{kim} {gun} günü dersleri arasında {olan} saat boşlukta, en fazla {sinir} saat isteniyor.":
    "{kim} tiene {olan} hora(s) de hueco entre clases el {gun}; como máximo se pidieron {sinir}.",
  "{sinif} sınıfı {gun} günü dersleri arasında {olan} saat boşlukta, en fazla {sinir} saat isteniyor.":
    "La clase {sinif} tiene {olan} hora(s) de hueco entre clases el {gun}; como máximo se pidieron {sinir}.",

  // src/solver.ts
  "haftada {istenen} saat isteniyor, açık saatler ve kurallar en fazla {olabilen} saat veriyor":
    "se piden {istenen} horas a la semana; las horas abiertas y las reglas permiten como máximo {olabilen}",
  "Program yeniden yapılınca değişiklik gerekmeden kuruluyor":
    "Rehecho, el horario se puede montar sin ningún cambio",
  "Uygula ve yeniden yap":
    "Aplicar y rehacer",
  "Dizili dersler yerinde kalırken bir yol yok; bu yollar dersleri yeniden diziyor, sabitlenenler yerinde kalır.":
    "No hay camino dejando las clases colocadas donde están; estos caminos las colocan de nuevo, y las fijadas se quedan.",
  "Nasıl kurulacağı aranıyor… {sure} sn":
    "Buscando cómo montar la semana… {sure} s",
  "Sınıfların saatlerine dokunmadan bir yol bulunamadı.":
    "No se encontró ningún camino que deje las horas de las clases como están.",
  "{liste} ve {son}":
    "{liste} y {son}",
  "{kim} {gun} {saatler}. saat":
    "{kim} el {gun}, hora {saatler}",
  "{ders}: aynı gün en fazla {eski} yerine {yeni} saat":
    "{ders}: como máximo {yeni} horas en un día en lugar de {eski}",
  "{kim}: günde en fazla {eski} yerine {yeni} saat":
    "{kim}: como máximo {yeni} horas al día en lugar de {eski}",
  "{kim}: art arda en fazla {eski} yerine {yeni} saat":
    "{kim}: como máximo {yeni} horas seguidas en lugar de {eski}",
  "{ders}: {eski} yerine {yeni}":
    "{ders}: {yeni} en lugar de {eski}",
  "{ders}: haftada {eski} yerine {yeni} saat":
    "{ders}: {yeni} horas a la semana en lugar de {eski}",
  "Program o arada değişti. Öneriyi yeniden görmek için Programı yap’a basın.":
    "El horario ha cambiado entretanto. Pulse Hacer el horario para volver a ver una sugerencia.",
  "Program değişiklik gerekmeden kuruluyor":
    "El horario se puede montar sin ningún cambio",
  "İlk arama bu programı bulamadı; ikinci arama buldu ve denetledi.":
    "La primera búsqueda no encontró este horario; la segunda lo encontró y lo comprobó.",
  "Uygula ve diz":
    "Aplicar y montar",
  "{ders}: {yeni} versin":
    "{ders}: la imparte {yeni}",
  "{kim} {gun} {saatler}. saate":
    "{kim} el {gun} en la hora {saatler}",
  "{kim} {gun} {saatler}. saatlere":
    "{kim} el {gun} en las horas {saatler}",
  "{saatler} de gelebilirse":
    "{saatler} también puede venir",
  "{ders} aynı gün {yeni} saat olabilirse":
    "{ders} puede tener {yeni} horas el mismo día",
  "{kim} {gun} {yeni} saat girebilirse":
    "{kim} puede dar {yeni} horas el {gun}",
  "{kim} bir günde {yeni} saat girebilirse":
    "{kim} puede dar {yeni} horas en un día",
  "{kim} art arda {yeni} saat girebilirse":
    "{kim} puede dar {yeni} horas seguidas",
  "{ders} dersini {yeni} verebilirse":
    "{yeni} puede impartir {ders}",
  "{ders} {yeni} olabilirse":
    "{ders} puede ser {yeni}",
  "{ders} haftada {yeni} saat olabilirse":
    "{ders} puede tener {yeni} horas a la semana",
  "{kosullar} program kuruluyor.":
    "El horario se puede montar si {kosullar}.",
  "{kim} {gun}":
    "{kim} el {gun}",
  "{kim}: günlük sınır":
    "{kim}: límite diario",
  "{kim}: art arda sınırı":
    "{kim}: límite de horas seguidas",
  "{ders}: aynı gün sınırı":
    "{ders}: límite en el mismo día",
  "{ders}: blok şekli":
    "{ders}: forma de bloque",
  "{ders}: haftalık saat":
    "{ders}: horas semanales",
  "Öğretmenin zaten geldiği güne saat":
    "Horas en un día en que el docente ya viene",
  "En az saat, yan yana":
    "Las menos horas, seguidas",
  "En az öğretmen":
    "El menor número de docentes",
  "Saat ve sınır birlikte":
    "Horas y límites juntos",
  "Yalnız sınırlar":
    "Solo límites",
  "Dersi başka öğretmene vermek":
    "Dar la clase a otro docente",
  "Blok şekli":
    "Forma de bloque",
  "Bir yol seçin; her biri tek başına yetiyor, sınıfların saatlerine dokunulmaz.":
    "Elija un camino; cada uno basta por sí solo y las horas de las clases no se tocan.",
  "Uygula":
    "Aplicar",
  "Uygula, yeniden yap":
    "Aplicar, rehacer",
  "Olmaz":
    "No es posible",
  "Geri al: {ne}":
    "Deshacer: {ne}",
  "(daha iyisi aranıyor)":
    "(buscando una mejor)",
  "Başka yollar da aranıyor… {sure} sn":
    "También se buscan otros caminos… {sure} s",
  "Aramanın ilerlemesi":
    "Progreso de la búsqueda",
  "Başka yollar ({n})":
    "Otros caminos ({n})",
  "(inceltilmedi)":
    "(sin afinar)",
  "Arama durduruldu; o ana kadar bir yol bulunmamıştı.":
    "La búsqueda se detuvo; hasta entonces no se había encontrado ningún camino.",
  "Arama durduruldu. Bulunan yollar geçerli, ama daha küçükleri olabilir.":
    "La búsqueda se detuvo. Los caminos encontrados sirven, pero puede haber otros más pequeños.",
  "Aramayı sürdür":
    "Seguir buscando",
  "Arama durdurulduğu için daha küçük bir değişiklik de olabilir.":
    "La búsqueda se detuvo, así que puede haber un cambio más pequeño.",
  "Bir dersi başka öğretmene verip daha az saat":
    "Dar una clase a otro docente, menos horas",
  "Birkaç dersi başka öğretmene verip en az saat":
    "Dar algunas clases a otros docentes, las menos horas",
  "Cevaplarınız:":
    "Sus respuestas:",
  "Olur":
    "Sí",
  "Olur: {ne}":
    "Sí: {ne}",
  "Olmaz: {ne}":
    "No es posible: {ne}",
  "Olur dedi":
    "Dijo que sí",
  "Olur dedikleriniz yetiyor: program kuruluyor":
    "Sus síes bastan: el horario se puede montar",
  "Olur dediklerinize ek olarak {kosullar} program kuruluyor.":
    "Además de sus síes, el horario se puede montar si {kosullar}.",
  "Uygulayınca cevaplarınız veriye yazılır ve program dizilir.":
    "Al aplicar, sus respuestas pasan a los datos y se monta el horario.",
  "Izgarada göster":
    "Mostrar en la cuadrícula",
  "Sorular":
    "Preguntas",
  "Soruları gizle":
    "Ocultar preguntas",
  "Soruları kopyala":
    "Copiar preguntas",
  "Soruları yazdır":
    "Imprimir preguntas",
  "Sorular panoya kopyalandı.":
    "Preguntas copiadas al portapapeles.",
  "Kopyalamak için Ctrl+C’ye basın":
    "Pulse Ctrl+C para copiar",
  "Siz":
    "Usted",
  "Sizin kararınız":
    "Su decisión",
  "Öğretmenlere sorulacaklar":
    "Preguntas para los docentes",
  "{gun} {saatler}. saate gelebilir misiniz?":
    "¿Puede venir el {gun} en la hora {saatler}?",
  "{gun} {saatler}. saatlere gelebilir misiniz?":
    "¿Puede venir el {gun} en las horas {saatler}?",
  "Bir günde {eski} yerine {yeni} saat girebilir misiniz?":
    "¿Puede dar {yeni} horas en un día en lugar de {eski}?",
  "Art arda {eski} yerine {yeni} saat girebilir misiniz?":
    "¿Puede dar {yeni} horas seguidas en lugar de {eski}?",
  "{ders} dersini verebilir misiniz?":
    "¿Puede impartir {ders}?",
  "Yalnız bu saatler olmaz ({gun} {saatler}. saat)":
    "Solo estas horas no son posibles ({gun}, hora {saatler})",
  "{gun} hiç müsait değil":
    "No disponible el {gun} en absoluto",
  "{gun} en fazla {n} saat gelebilir":
    "Puede venir el {gun} como máximo {n} {n:hora|horas}",
  "{kim} için hiçbir değişiklik olmasın":
    "Ningún cambio para {kim}",
  "{kim} {gun} en fazla {n} saat":
    "{kim} el {gun}: como máximo {n} {n:hora|horas}",
  "{kim}: hiçbir değişiklik":
    "{kim}: ningún cambio",
  "Önizleme":
    "Vista previa",
  "Önizleme: {yol}":
    "Vista previa: {yol}",
  "Önizlemeyi kapat":
    "Cerrar vista previa",
  "Hangi program":
    "Qué horario",
  "Şu anki":
    "Actual",
  "Önerilen":
    "Propuesta",
  "{n} öğretmen saati açılıyor":
    "Se {n:abre|abren} {n} {n:hora|horas} de docente",
  "{n} ders yer değiştiriyor":
    "{n} {n:clase cambia|clases cambian} de lugar",
  "Öneri araması":
    "Búsqueda de propuestas",
  "Bu bilgisayarda henüz aranmadı":
    "Aún no se ha ejecutado en este equipo",
  "{n} iş parçacığında · ilk öneri {ilk} sn · arama {sure} sn":
    "En {n} {n:hilo|hilos} · primera propuesta {ilk} s · búsqueda {sure} s",
  "Tek iş parçacığında (yavaş yol) · ilk öneri {ilk} sn · arama {sure} sn":
    "En un solo hilo (la vía lenta) · primera propuesta {ilk} s · búsqueda {sure} s",
  "öneri aramasının ölçümleri":
    "mediciones de la búsqueda de propuestas",
  "Kurulması için":
    "Para montar la semana",
  "Ayrıntı":
    "Detalles",
  "Bu değişiklikle bütün dersler yerleşiyor; program bulundu ve denetlendi.":
    "Con este cambio caben todas las clases; el horario se encontró y se comprobó.",
  "Bundan küçük bir değişiklik yetmiyor.":
    "Ningún cambio menor basta.",
  "Bulduğumuz en küçük değişiklik bu.":
    "Es el cambio más pequeño que encontramos.",
  "Öneri uygulandı ve program dizildi. Ctrl+Z ile geri alabilirsiniz.":
    "Se aplicó la sugerencia y se montó el horario. Puede deshacerlo con Ctrl+Z.",
  "{sinif} sınıfında boş açık saat kalmadı":
    "la clase {sinif} no tiene ninguna hora abierta libre",
  "Boş kalan saatler bu dersin {boy} saatlik bloğuna uymuyor":
    "las horas que quedan libres no encajan con el bloque de {boy} horas de esta asignatura",
  "Tek başına {gun} {saat} saatine sığıyor, sınıfın öbür eksik dersleriyle birlikte sığmıyor":
    "por sí sola cabe el {gun} a la hora {saat}, pero no junto con las demás asignaturas pendientes de la clase",
  "{gun} {saat} saatine sığıyor, arama oraya varmadan durdu":
    "cabe el {gun} a la hora {saat}; la búsqueda se detuvo antes de llegar ahí",

  // src/update.ts
  "Güncelleme denetlenemedi.": "No se ha podido comprobar la actualización.",

  // src/useFolder.ts
  "Klasöre yazma izni geri alınmış.":
    "Se ha retirado el permiso de escritura en la carpeta.",
  "Klasöre yazılamadı. Klasör silinmiş ya da taşınmış olabilir.":
    "No se ha podido escribir en la carpeta. Puede que se haya borrado o movido.",

  // src/version.ts
  "{gun} {ay} {yil}": "{gun} de {ay} de {yil}",

  // ---------------------------------------------- the module-level tables
  //
  // VIEWS, KINDS, SECTIONS, DENSITIES, LESSON_MODES, STEPS, RULE_ROWS, the tab
  // labels and their like. A constant cannot hold a hook, so these are
  // translated where they are DRAWN - which means no literal `t('...')` call
  // carries them and they have to be listed by hand.
  Branşlar: "Asignaturas",
  öğretmen: "profesor",
  sınıf: "clase",
  derslik: "aula",
  branş: "asignatura",
  ders: "clase",
  "Yük durumu": "Estado de carga",
  Boş: "Vacío",
  "Öğretmenin müsait olmadığı saatlere tıklayın.":
    "Pulse las horas en que el profesor no está disponible.",
  "Sınıfın ders yapamayacağı saatlere tıklayın. O saatlere hiçbir ders konamaz.":
    "Pulse las horas en que la clase no puede tener clase. En esas horas no se puede poner ninguna asignatura.",
  "Dersliğin kapalı olduğu saatlere tıklayın. O dersliği kullanan sınıflar o saatte ders yapamaz.":
    "Pulse las horas en que el aula está cerrada. Las clases que usan esa aula no pueden dar clase entonces.",
  Uygun: "Cabe",
  Sıkışık: "Justo",
  "Öğretmen görünümü": "Vista de profesor",
  "Sınıf görünümü": "Vista de clase",
  Görünüm: "Vista",
  Hakkında: "Acerca de",
  "Planlar ve yedek": "Planes y copias de seguridad",
  "Hücre en büyük, dersin alt satırı tam boyda":
    "Celda más grande, la línea inferior de la clase a tamaño completo",
  "Hücre geniş, başlangıç saatleri görünür": "Celda ancha, horas de inicio visibles",
  "Programın tamamı ekrana sığar, başlangıç saatleri gizlenir":
    "Todo el horario cabe en la pantalla, las horas de inicio se ocultan",
  Öğretmenden: "Desde un profesor",
  "Bir öğretmen seçin, girdiği bütün sınıfları arka arkaya girin":
    "Elija un profesor e introduzca seguidas todas las clases que imparte",
  Sınıftan: "Desde una clase",
  "Bir sınıf seçin, o sınıfın derslerini arka arkaya girin":
    "Elija una clase e introduzca seguidas sus asignaturas",
  Genel: "General",
  "Bütün dersler tek listede": "Todas las clases en una lista",
  Liste: "Lista",
  Yöntem: "Método",
  "Açık olan": "Abierto",
  Toplam: "Total",
  Diz: "Montar",
  Bölüm: "Sección",
  Koyu: "Oscuro",
  Tam: "Completo",
  Az: "Poco",
  Belirtilmemiş: "Sin indicar",
  Kadın: "Mujer",
  Erkek: "Hombre",
  "–": "–",
  "1": "1",
  "2": "2",
  "4": "4",
  Normal: "Normal",
  Küçük: "Pequeño",
  Büyük: "Grande",
  "Bir A4’e bir program, duvara asılan boy":
    "Un horario en un A4, el tamaño para colgar en la pared",
  "Alt alta iki program": "Dos horarios uno encima del otro",
  "İki sütun, iki satır, dağıtmak için":
    "Dos columnas, dos filas, para repartir",
  "Okul adı": "Nombre de la escuela",
  "Başlığın altındaki satırda okulun adı":
    "El nombre de la escuela en la línea bajo el encabezado",
  "Derslik ve branş": "Aula y asignatura",
  "Aynı satırda dersliğin harfi ya da öğretmenin branşı":
    "En la misma línea, la letra del aula o la asignatura del profesor",
  "Sütun başlığında 08:30–09:10": "08:30–09:10 en el encabezado de la columna",
  "Hücrenin alt satırı": "La línea inferior de la celda",
  "Öğretmenin kısa adı ya da derslik": "El nombre corto del profesor o el aula",
  "Çıktı tarihi": "Fecha de impresión",
  "Sayfanın altında yazdırılma tarihi ve saati":
    "La fecha y hora de impresión al pie de la página",
  "Öğretmen art arda en fazla": "Profesor, como máximo seguidas",
  "Bir öğretmen arka arkaya kaç saat derse girebilir.":
    "Cuántas horas seguidas puede dar clase un profesor.",
  "Öğretmen günde en fazla": "Profesor, como máximo al día",
  "Bir öğretmenin bir gündeki toplam ders saati.":
    "El total de horas de un profesor en un día.",
  "Öğretmen günde en az": "Profesor, como mínimo al día",
  "Bir sınıf aynı dersten günde en fazla":
    "Una clase, como máximo de la misma asignatura al día",
  "Öğretmenin dersleri arasında en fazla boşluk":
    "Docente, máximo hueco entre clases",
  "Bir günde ilk ve son ders arasında kaç saat boş kalabilir. 0 hiç boşluk olmasın demektir.":
    "Cuántas horas pueden quedar libres entre la primera y la última clase de un día. 0 significa ningún hueco.",
  "Sınıfın dersleri arasında en fazla boşluk":
    "Clase, máximo hueco entre clases",
  "Aynısı sınıf için. Yalnız Kontrol sekmesinde uyarır.":
    "Lo mismo para una clase. Solo avisa, en la pestaña Kontrol.",
  Ocak: "enero",
  Şubat: "febrero",
  Mart: "marzo",
  Nisan: "abril",
  Mayıs: "mayo",
  Haziran: "junio",
  Temmuz: "julio",
  Ağustos: "agosto",
  Eylül: "septiembre",
  Ekim: "octubre",
  Kasım: "noviembre",
  Aralık: "diciembre",
  Okul: "Escuela",
  Müsaitlik: "Disponibilidad",
  Kontrol: "Revisión",
  Ayarlar: "Ajustes",
  "{n} öğretmen": "{n} {n:profesor|profesores}",
  "{n} derslik": "{n} {n:aula|aulas}",
  "{n} ders": "{n} {n:clase|clases}",
  Dersler: "Clases",
  "{ad} branşının adı": "Nombre de la asignatura {ad}",
  '"{ad}" adı zaten kullanılıyor': 'El nombre "{ad}" ya está en uso',
  "İki branş aynı adı taşıyamaz. Başka bir ad seçin.":
    "Dos asignaturas no pueden llamarse igual. Elija otro nombre.",
  '"{eski}" branşı "{yeni}" olacak':
    'La asignatura "{eski}" pasará a ser "{yeni}"',
  "{n} öğretmenin branşı da bu adla değişecek ({kimler}).":
    "La asignatura de {n} profesores cambiará con ella ({kimler}).",
  Değiştir: "Renombrar",
  "Verdiği dersler": "Clases que imparte",
  "Aldığı dersler": "Clases que recibe",
  "{ne} dersini başka öğretmene aktar":
    "Pasar la clase de {ne} a otro profesor",
  "Başka öğretmene aktar…": "Pasar a otro profesor…",
  "{ne} dersi {kim} öğretmenine geçecek": "La clase de {ne} pasará a {kim}",
  "Bu ders henüz programa yerleşmemiş, yani kaybolacak bir şey yok.":
    "Esta clase aún no está en el horario, así que no hay nada que perder.",
  "Programdaki {n} ders yeni öğretmenin müsait saatlerine göre yeniden denenecek; sığmayanlar havuza döner.":
    "Sus {n} clases colocadas se volverán a probar con las horas disponibles del nuevo profesor; las que no quepan vuelven a la bandeja.",
  Aktar: "Pasar",
  "{ne} dersi {kim} öğretmenine geçti.": "La clase de {ne} pasó a {kim}.",
  "{ne} dersi {kim} öğretmenine geçti. {n} ders havuza döndü.":
    "La clase de {ne} pasó a {kim}. {n} clases volvieron a la bandeja.",
  "Azalan sıralı. Artana çevirmek için tıklayın":
    "Orden descendente. Haga clic para ascendente",
  "Artan sıralı. Azalana çevirmek için tıklayın":
    "Orden ascendente. Haga clic para descendente",
  "Sürükleyerek ya da ok tuşlarıyla sırala":
    "Arrastre o use las flechas para reordenar",
  "Çözülmesi gereken satırlar": "Filas por resolver",
  "Not yok": "Sin notas",
  "Veri girişinde gözden kaçmış olabilecek noktalar":
    "Puntos que pueden haberse pasado por alto al introducir los datos",
  "Öğretmen yükleri": "Cargas de los profesores",
  "Sınıf yükleri": "Cargas de los grupos",
  "Derslik yükleri": "Cargas de las aulas",
  "Kapalı saatte ders, kural ihlali ya da yerleşemeyen ders yok.":
    "Ninguna clase en horas cerradas, ninguna regla incumplida, nada sin colocar.",

  // ------------------------------------------------------- 2026-08-30
  //
  // The tray's order and filter, the pin ON a card, the timetable library
  // behind one button, and an entity sheet that edits. Written by hand, the
  // way every entry here is: `i18n.test.ts` can tell us a key is DEAD, never
  // that one is missing - an untranslated sentence falls back to correct
  // Turkish and says nothing (pitfall 87).
  " {n} ders geçici kapsam dışında kaldı.":
    " {n} {n:clase quedó|clases quedaron} fuera del alcance.",
  " · {n} ders geçici kapsam dışında":
    " · {n} {n:clase|clases} fuera del alcance",
  "{gun} geçici olarak kapsam dışında":
    "{gun} está temporalmente fuera del alcance",
  Seçenek: "Variante",
  "Bu seçeneğin kopyası": "Copia de esta variante",
  "Boş seçenek": "Variante vacía",
  "Yeniden adlandır": "Cambiar el nombre",
  "Seçeneği sil": "Borrar la variante",
  "Seçenek adı": "Nombre de la variante",
  "Bu planın verilerini kullanan seçenek için bir ad yazın.":
    "Escriba un nombre para la variante que usa los datos de este plan.",
  "Seçenek adı boş olamaz": "La variante necesita un nombre",
  "Bu seçenek adı zaten kullanılıyor": "Ese nombre de variante ya está en uso",
  Kaydet: "Guardar",
  "Öğretmeni düzenle": "Editar el profesor",
  "Sınıfı düzenle": "Editar la clase",
  "Toplu sabitle": "Fijar en bloque",
  "Satırı sabitle / kaldır": "Fijar / soltar la fila",
  "Sütunu sabitle / kaldır": "Fijar / soltar la columna",
  "Günü sabitle / kaldır": "Fijar / soltar el día",
  "Geçici görünüm": "Apartar por ahora",
  "Geçici görünüm ({n})": "Apartados ({n})",
  "Satırı soluklaştır": "Atenuar la fila",
  "Satırı geri yükle": "Restaurar la fila",
  "Satırı gizle": "Ocultar la fila",
  "Günü soluklaştır": "Atenuar el día",
  "Günü geri yükle": "Restaurar el día",
  "Günü gizle": "Ocultar el día",
  "Tümünü geri yükle": "Restaurar todo",
  soluk: "atenuado",
  gizli: "oculto",
  İşlemler: "Acciones",
  "Tüm programı sabitle": "Fijar todo el horario",
  "Tüm sabitlemeleri kaldır": "Soltar todas las fijaciones",
  "{n} saat sabitlendi.": "{n} {n:hora fijada|horas fijadas}.",
  "{n} saatin sabitlemesi kaldırıldı.": "Se soltaron {n} {n:hora|horas}.",
  "{sinif} sınıfının {gun} {saat} saatindeki ders sabitlenmiş":
    "La clase de {sinif} el {gun} a la hora {saat} está fijada",
  "{ust} {alt}: buraya sabitle": "{ust} {alt}: fijar aquí",
  "{ust} {alt}: sabitlemeyi kaldır": "{ust} {alt}: soltar",
  "Sabitlenmiş. Kaldırmak için tıklayın": "Fijada. Haga clic para soltar",
  "Ders {ad} sınıfına taşınsın mı?": "¿Mover la clase a {ad}?",
  Taşı: "Mover",
  "Yerleşmiş saatler olduğu gibi taşınır. Ctrl+Z ile geri alınabilir.":
    "Las horas colocadas se mueven con ella. Ctrl+Z lo deshace.",
  "{n} ders havuza döner, {s} sabitleme kalkar. Ctrl+Z ile geri alınabilir.":
    "{n} {n:clase vuelve|clases vuelven} a la bandeja y se {s:suelta|sueltan} {s} {s:fijación|fijaciones}. Ctrl+Z lo deshace.",
  "Ders {ad} sınıfına taşındı.": "La clase se movió a {ad}.",
  "Ders {ad} sınıfına taşındı. {n} ders havuza döndü.":
    "La clase se movió a {ad}. {n} {n:clase volvió|clases volvieron} a la bandeja.",
  "Ders {kim} öğretmenine geçsin mi?": "¿Pasar la clase a {kim}?",
  "Yerleşmiş saatler olduğu gibi kalır. Ctrl+Z ile geri alınabilir.":
    "Las horas colocadas se quedan donde están. Ctrl+Z lo deshace.",
  "{n} ders havuza döner. Ctrl+Z ile geri alınabilir.":
    "{n} {n:clase vuelve|clases vuelven} a la bandeja. Ctrl+Z lo deshace.",
  "Ders {kim} öğretmenine geçti.": "La clase pasó a {kim}.",
  "Ders {kim} öğretmenine geçti. {n} ders havuza döndü.":
    "La clase pasó a {kim}. {n} {n:clase volvió|clases volvieron} a la bandeja.",
  "**Dersler** sekmesinde ders silinebilir, yeni ders eklenebilir.":
    "En la pestaña **Clases** se pueden borrar y añadir clases.",
  "Art arda en fazla": "Máximo seguidas",
  "Geldiği gün en az": "Mínimo el día que viene",
  "Günde aynı dersten en fazla": "Máximo de la misma clase al día",
  "Havuz sıralaması": "Orden de la bandeja",
  "Havuz süzgeci": "Filtro de la bandeja",
  "Izgara sırası": "Orden de la cuadrícula",
  "Uzun dersler önce": "Clases largas primero",
  "En çok kalan": "Lo que más queda",
  "{n} saatlik dersler": "Clases de {n} horas",
  "{n} saat kaldı": "quedan {n} {n:hora|horas}",
  "{n} ders süzgeç dışında · sürükleyip bırakın":
    "{n} {n:clase|clases} más tras el filtro · arrastre y suelte",
  Göster: "Mostrar",
  Saatler: "Horas",
  Satır: "Fila",
  "Koyu bir sütun, o saatte **kaç {ne} kapalı** olduğunu söyler: dizerken genellikle orada tıkanılır.":
    "Una columna oscura dice **cuántos {ne} están cerrados** a esa hora: ahí suele atascarse la búsqueda.",

  // ------------------------------------ 2026-08-30 · AB2: infolar kısaldı
  //
  // "Çok fazla info var ve çok uzunlar her yerde." One sentence per `.hint`,
  // and what did not fit went to the element’s `title` — the five long
  // entries at the end of this block are those. Grouped by round rather than
  // by source file: the pass touched fifteen screens, and a key here is found
  // by its Turkish sentence anyway.
  "**Az.** Süreler yarıya iner ve **yer değiştiren** hareketler kapanır.":
    "**Poco.** Las duraciones se reducen a la mitad y se desactiva lo que se DESPLAZA.",
  "**Mozaik burada kendini güncellemez** ve hiçbir yere bağlanmaz. En son sürüm şuradadır:":
    "**Aquí Mozaik nunca se actualiza** y no se conecta a ningún sitio. La última versión:",
  "**Bütün planlar** kendiliğinden Belgelerim'e yazılıyor; son {gun} günün yedeği durur.":
    "**Todos los planes** se escriben solos en Documentos; se guardan los últimos {gun} días.",
  "**Ferah.** Hücre en büyük; en kolay okunan, en çok kaydırılan.":
    "**Amplio.** La celda más grande: la más legible, la que más se desplaza.",
  "**Rahat.** Hücre geniş ve saatler yazılı; program sığmadığı için sağa kaydırırsınız.":
    "**Cómodo.** Celdas anchas con las horas; el horario no cabe, así que se desplaza.",
  "**Sığdır.** Programın tamamı bir ekranda, ve bunun bedeli **saatlerin gizlenmesi**.":
    "**Ajustar.** Todo el horario en una pantalla, a costa de **ocultar las horas**.",
  "**Tarayıcınız klasöre yazmayı desteklemiyor.** Chrome ve Edge destekliyor.":
    "**Su navegador no puede escribir en una carpeta.** Chrome y Edge sí pueden.",
  "**Tercih** yalnız sayar, **Kesin** dersi o hücreye hiç bıraktırmaz.":
    "**Preferencia** solo cuenta; **Estricta** nunca deja la clase en esa celda.",
  "**Yük**, **Açık**'ı geçerse o sınıfın programı tutmaz.":
    "Si **Carga** supera **Abierto**, el horario de ese grupo no cuadra.",
  "Arayüzün dili. Bu bilgisayara aittir, plan dosyasına girmez.":
    "El idioma de la interfaz. Pertenece a este ordenador, no al archivo de plan.",
  "Aynı dersliği paylaşan sınıfların **toplam** ders saati de haftaya sığmalı.":
    "Las horas **totales** de los grupos que comparten aula también deben caber en la semana.",
  "Aynı programı paylaşan öğrenci grubu; **derslik** sınıfın sabit dersliğidir.":
    "Un grupo de alumnos con el mismo horario; el **aula** es su sala fija.",
  "Aşağıdakiler **kendi öğretmenleriniz**: bir ad sığmıyorsa ölçek fazla büyük demektir.":
    "Estos son **sus propios profesores**: si un nombre no cabe, la escala es excesiva.",
  "Basılan sayfada saatler her üç durumda da yazar.":
    "La hoja impresa lleva las horas en los tres casos.",
  "Başka bir tarayıcı bunu **görmez**, “tarama verilerini temizle” onu **siler**.":
    "Otro navegador **no lo ve**, y “borrar datos de navegación” **lo elimina**.",
  "Bilgisayarınız “azaltılmış hareket” istiyorsa hareket, ne seçerseniz seçin, **kapalı** kalır.":
    "Si su ordenador pide “movimiento reducido”, el movimiento queda **apagado** elija lo que elija.",
  "Bir A4 kâğıda kaç program bassın, ve kâğıttaki yazı ne kadar büyük olsun.":
    "Cuántos horarios caben en una hoja A4 y qué tamaño tiene la letra impresa.",
  "Bir ders = bir sınıfın bir öğretmenden aldığı haftalık saat.":
    "Una clase = las horas semanales que un grupo recibe de un profesor.",
  "Bir klasör seçin; **bütün planlar** oraya yazılır ve son {gun} günün yedeği durur.":
    "Elija una carpeta; **todos los planes** se escriben ahí y se guardan {gun} días.",
  "Bir öğretmen iki branş veriyorsa + İkinci branş ile ikincisi de yazılır; o zaman her dersinde hangi branştan olduğu ayrıca seçilir. Renk otomatik atanır, kimseyle çakışmaz. Sağdaki üç kutu bu öğretmene özel sınırdır; boş bırakılırsa Ayarlar → Kurallar’daki sayı geçerli olur.":
    "Si un profesor imparte dos materias, + Segunda materia registra la otra; entonces en cada clase se elige además cuál de las dos es. El color se asigna solo y no choca con nadie. Las tres casillas de la derecha son los límites propios de este profesor; si se dejan vacías, rige el número de Ajustes → Reglas.",
  "Bir şey belirirken görülen kısa hareketler; kapatmak Mozaik'in işini değiştirmez.":
    "Los movimientos breves al aparecer algo; apagarlos no cambia nada más.",
  "Branş **listeden seçilir**; kısa ad ızgarada satır başlığı olur.":
    "La materia se **elige de la lista**; el nombre corto encabeza la fila.",
  "Bu bilgisayara aittir ve **yazdırmayı etkilemez**; kâğıdın yazısı **Çıktı** sekmesinde.":
    "Pertenece a este ordenador y **no afecta a la impresión**; la letra del papel, en **Salida**.",
  "Bu depo yalnız {adres} adresine ait; başka adreste açılan Mozaik'in deposu **ayrıdır**.":
    "Este almacén pertenece solo a {adres}; Mozaik abierto en otra dirección tiene uno **aparte**.",
  "Mozaik burada kendini güncelleyebilir ama **düğmeye basmadıkça** hiçbir yere bağlanmaz.":
    "Aquí Mozaik puede actualizarse, pero no se conecta **hasta que pulse el botón**.",
  "Bu, Mozaik'in geliştirme ve test sürümü; kendini güncellemez. Denetlemek yalnız yeni sürümün olup olmadığını söyler.":
    "Esta es la versión de desarrollo y pruebas de Mozaik; no se actualiza sola. Comprobar solo indica si hay una versión nueva.",
  "Bu sayılar **bütün okul** için; **0** yazmak “sınır yok” demektir.":
    "Estos números valen para **toda la escuela**; **0** significa “sin límite”.",
  "Bu tarayıcının bu bilgisayardaki deposunda duruyor.":
    "Está en el almacén de este navegador en este ordenador.",
  "Burada ne seçerseniz o kalır; bilgisayarınızın tercihini **izlemez**.":
    "Lo que elija aquí se queda; **no sigue** la preferencia de su ordenador.",
  "Böylece aynı branş iki farklı yazımla iki branşa dönüşmez. Kısaltma ızgarada ve yazdırılan sayfada görünür; yalnızca değiştirdikleriniz saklanır. Satırları tutamağından sürükleyerek sıralayabilirsiniz; öğretmen eklerken açılan liste bu sırada gelir.":
    "Así una misma materia escrita de dos formas no se convierte en dos. La abreviatura aparece en la rejilla y en la hoja impresa; solo se guarda lo que usted cambia. Las filas se reordenan por su asa, y la lista al añadir un profesor sigue ese orden.",
  "Bütün ekranı birlikte büyütür: yazıyı, boşlukları, düğmeleri ve ızgara hücrelerini.":
    "Aumenta toda la pantalla a la vez: letra, espacios, botones y celdas.",
  "Bütün planlar Belgelerim'deki **{klasor}** klasörüne de yazılıyor; taşınacak şey o.":
    "Todos los planes se escriben también en **{klasor}** de Documentos; eso es lo que se lleva.",
  "Dağılım, o saatlerin haftaya nasıl bölüneceğidir: 2+1 demek bir gün iki saat üst üste, başka bir gün tek saat. Bir blok 2 ya da 3 saat olabilir; kalanlar tektir. Günde ↑ bu dersin bir gündeki en fazla saatidir; boşsa Ayarlar → Kurallar’daki sayı geçerli olur.":
    "El reparto es cómo se dividen esas horas en la semana: 2+1 significa dos horas seguidas un día y una hora suelta otro. Un bloque puede ser de 2 o 3 horas; el resto son sueltas. Por día ↑ es el máximo de esta clase en un día; si se deja vacío, rige el número de Ajustes → Reglas.",
  "Ders yapılan günleri işaretleyin; yanındaki kutu **öğle arasının** yerini söyler.":
    "Marque los días con clase; la casilla al lado indica el **recreo largo**.",
  "Derslik dizerken seçilmez ve aynı dersliği paylaşan iki sınıf aynı saate konamaz. Renk otomatik atanır, kimseyle çakışmaz; satır başındaki nokta ile basılan sayfanın başlığında görünür.":
    "El aula no se elige al colocar, y dos grupos que la comparten no pueden ocupar la misma hora. El color se asigna solo, no choca con nadie y aparece como el punto al inicio de la fila y en el título de la hoja impresa.",
  "Dersliği olmayan sınıflar için bu kontrol yapılmaz.":
    "Los grupos sin aula no pasan por esta comprobación.",
  "Ekranın **geri kalanı**: listeler, paneller, kutular. Program ızgarasına dokunmaz.":
    "El **resto** de la pantalla: listas, paneles, cajas. No toca la rejilla.",
  "Gün kaçta başlıyor, bir saat ve teneffüs kaç dakika. Zil saatleri bunlardan hesaplanır.":
    "A qué hora empieza el día y cuántos minutos duran una hora y un recreo. Los horarios del timbre se calculan a partir de ellos.",
  "Hazır bir okul: 25 öğretmen, 20 sınıf, 99 ders. **Açık olan planın yerine geçer.**":
    "Una escuela lista: 25 profesores, 20 grupos, 99 clases. **Sustituye al plan abierto.**",
  "Her planın **verisi ayrıdır**; üst çubuktaki listeden aralarında geçilir.":
    "Cada plan **tiene sus propios datos**; la lista superior cambia entre ellos.",
  "Bir sınıfa özel sayı: **Okul → Sınıflar**.":
    "Para un solo grupo: **Escuela → Grupos**.",
  "Her sınıfın sabit dersliği; aynı dersliği paylaşan iki sınıf aynı saate konamaz.":
    "El aula fija de cada grupo; dos grupos que la comparten no pueden coincidir.",
  "Bir öğretmene özel sayı: **Okul → Öğretmenler**.":
    "Para un profesor: **Escuela → Profesores**.",
  "Kapalı saatler taralı; değiştirmek için **Müsaitlik** sekmesine gidin.":
    "Las horas cerradas van rayadas; se cambian en **Disponibilidad**.",
  "Okulun listesinde **bulunmayan** hazır branşlar; eklemek için tıklayın.":
    "Materias incorporadas que **no** están en la lista de la escuela; pulse para añadir.",
  "Mozaik **kendiliğinden** saklıyor; **Kaydet** onun yanına gelir, yerine değil.":
    "Mozaik guarda **solo**; **Guardar** va al lado, no en su lugar.",
  "Program, **Ayarlar → Kurallar**'da girdiğiniz sınırları aşıyor.":
    "El horario supera los límites fijados en **Ajustes → Reglas**.",
  "Renk kimliktir: ızgaradaki satırı havuzdaki dersiyle eşleştiren şey budur.":
    "El color es identidad: enlaza la fila de la rejilla con su clase en la bandeja.",
  "Sekmelerin altındaki araç şeridi, sayfayı **aşağı kaydırırken kendiliğinden gizlenir**.":
    "La barra de herramientas bajo las pestañas **se oculta sola al bajar** por la página.",
  "Silmelerden sonra renkler delik bıraktı; yeniden dağıtmak yalnızca onları sıraya dizer.":
    "Los borrados dejaron huecos en los colores; repartirlos solo los reordena.",
  "Soldaki saatten ve üç süreden hesaplanır; her öğle arası deseni kendi sütununda.":
    "Se calcula de la hora de inicio y tres duraciones; cada patrón tiene su columna.",
  "Son üç açılıştaki durum otomatik yedek olarak ayrı tutulur; **bu bilgisayara** ve açılıştaki plana aittir.":
    "El estado de las tres últimas aperturas se guarda aparte como copia de seguridad automática; pertenece a **este ordenador** y al plan abierto al inicio.",
  "Sınıf başına **{yer}** saat var ({gun} gün × {ders} saat); girilen yük **{yuk}** saat.":
    "**{yer}** horas por grupo ({gun} días × {ders} clases); la carga introducida es **{yuk}**.",
  "Tarayıcının bu site için ayırdığı depoda duruyor.":
    "Está en el almacén que el navegador reserva para este sitio.",
  "Toplam **{yer}**; tarayıcının Mozaik'e ayırdığı yer yaklaşık **5 MB**.":
    "**{yer}** en total; el navegador reserva a Mozaik unos **5 MB**.",
  "Yalnız **Program** ızgarasını etkiler: hücrenin büyüklüğü ve ekrana sığan gün sayısı.":
    "Solo afecta a la rejilla de **Horario**: tamaño de celda y días visibles.",
  "Yeni plan açılınca ona geçilir ve **geri al** geçmişi sıfırlanır.":
    "El plan nuevo se abre enseguida y el historial de **deshacer** se vacía.",
  "Yeni sürüm çıkınca üstte bir satır belirir; **Yenile** demedikçe hiçbir şey değişmez.":
    "Al salir una versión aparece una línea arriba; nada cambia hasta pulsar **Recargar**.",
  "Yukarıdakiler **localStorage**'da; seçtiğiniz klasörün tutamağı ayrıca **IndexedDB**'de.":
    "Lo anterior está en **localStorage**; el manejador de la carpeta, en **IndexedDB**.",
  "{dosya} **bütün planlarınızdır**; yanındakiler onun gün gün duran hâlleri.":
    "{dosya} son **todos sus planes**; los archivos al lado son sus copias de seguridad diarias.",
  "{n} kapalı": "{n} apagadas",
  "Öğretmen eklerken branş **bu listeden** seçilir, elle yazılmaz.":
    "Al añadir un profesor la materia se elige **de esta lista**, no se escribe.",
  "Öğretmenin müsait saati, ona yüklenen ders saatinden az olamaz.":
    "Las horas disponibles de un profesor no pueden ser menos que su carga.",
  "Üst çubuktaki **Kaydet** açık planı yazar; buradaki dosya **bütün planları**.":
    "**Guardar** arriba escribe el plan abierto; este archivo, **todos**.",
  "İçindekiler: her planın derslikleri, öğretmenleri, sınıfları, dersleri, dizilmiş programı, adı ve taslak işareti. Tema gibi bu bilgisayara ait tercihler ve otomatik yedekler girmez.":
    "Contenido: aulas, profesores, grupos, clases, horario montado, nombre y marca de borrador de cada plan. No entran las preferencias de este ordenador, como el tema, ni las copias de seguridad automáticas.",
  "İşareti kaldırılan şey kâğıda basılmaz.":
    "Lo que se desmarca no se imprime.",
  "E-posta":
    "Correo",
  "{kim} e-postası":
    "Correo de {kim}",
  "Tek bir e-posta adresi yazılır: ad@ornek.com":
    "Aquí va una sola dirección de correo: nombre@ejemplo.com",
  "E-postayla gönder":
    "Enviar por correo",
  "Öğretmenin programı e-posta uygulamanızda yeni bir ileti olarak açılır. Gönder’e siz basarsınız.":
    "El horario del docente se abre como un mensaje nuevo en su aplicación de correo. Usted pulsa Enviar.",
  "adres yok":
    "sin dirección",
  "adres hatalı":
    "dirección errónea",
  "programı boş":
    "horario vacío",
  "e-postaya sığmıyor":
    "demasiado largo para un correo",
  "{kim} için e-postayı aç":
    "Abrir el correo para {kim}",
  "E-postada aç":
    "Abrir en el correo",
  "Bu bilgisayarda seçili bir e-posta uygulaması yok.":
    "No hay ninguna aplicación de correo elegida en este ordenador.",
  "E-posta uygulaması açılmadıysa bu bilgisayarda seçili bir e-posta uygulaması yok.":
    "Si no se abrió ninguna aplicación de correo, no hay ninguna elegida en este ordenador.",
  "E-posta uygulaması açılamadı.":
    "No se pudo abrir la aplicación de correo.",
  "{ad} · Haftalık ders programı":
    "{ad} · Horario semanal",
  "{n}. saat":
    "Hora {n}",
  "Ders silindi.": "Clase eliminada.",
  "{ne} silindi.": "{ne}: eliminado.",
  "{ne} silindi, yerleşmiş {n} saati de kalktı.": "{ne}: eliminado, con {n} {n:hora colocada|horas colocadas}.",
  "Dizilmiş {n} saat havuza döndü.": "{n} {n:hora colocada volvió|horas colocadas volvieron} a la reserva.",
  "Dizilmiş saatler havuza döndü, sabitlenen {n} saat yerinde.": "Las horas colocadas volvieron a la reserva; {n} {n:hora fijada sigue|horas fijadas siguen} en su sitio.",
  "{ilk}–{son}, günde {saat} ders":
    "{ilk}–{son}, {saat} {saat:hora|horas} al día",
  "Okulu tanıt":
    "Presentar la escuela",
  "Okul adı boş. Şu an: {hafta}. Doğru değilse değiştirin.":
    "Aún no hay nombre de escuela. Ahora: {hafta}. Cámbielo si no es correcto.",
  "Okul adını ve zili gir":
    "Escribir nombre y timbre",
  "Derslik ekle":
    "Añadir aulas",
  "{n} branş":
    "{n} {n:asignatura|asignaturas}",
  "Branş ekle":
    "Añadir asignaturas",
  "Öğretmen ekle":
    "Añadir profesores",
  "Sınıf ekle":
    "Añadir clases",
  "Ders gir":
    "Introducir clases",
  "{n} kapalı saat":
    "{n} {n:hora cerrada|horas cerradas}",
  "Herkes her saat gelebiliyorsa geçin.":
    "Si todos pueden a cualquier hora, sáltelo.",
  "Kapalı saat işaretle":
    "Marcar horas cerradas",
  "{yer} / {toplam} saat yerleşmiş":
    "{yer} / {toplam} horas colocadas",
  "Bu bilgisayarda bir kez yazdırıldı":
    "Impreso una vez en este ordenador",
  "Sınıflara ve öğretmenlere birer sayfa":
    "Una página por clase y por profesor",
  "Çıktıya geç":
    "Ir a imprimir",
  "Liste tek satıra iner; ? menüsündeki Başlarken onu geri getirir.":
    "La lista se reduce a una línea; Primeros pasos en el menú ? la recupera.",
  "Listeyi kapat":
    "Cerrar la lista",
  "{n} / {toplam} adım":
    "{n} / {toplam} pasos",
  "Sıradaki: {adim}":
    "Siguiente: {adim}",
  "Listeyi göster":
    "Mostrar la lista",
  "Listeyi daralt":
    "Plegar la lista",
  "yapıldı":
    "hecho",
  "yapılmadı":
    "pendiente",
  "Başlarken listesi açık mı":
    "si la lista «Para empezar» está abierta",
  "Bu Mozaik onu açamıyor. Önce Mozaik'i güncelleyin, sonra dosyayı yeniden açın.":
    "Este Mozaik no puede abrirlo. Actualice primero Mozaik y vuelva a abrir el archivo.",
  "Güncellemeye bak":
    "Ver la actualización",
  "Dosyada öğretmen, sınıf, ders ya da derslik listesi yok; kesilmiş ya da elle düzenlenmiş olabilir. 'Kaydet' ile kaydettiğiniz dosyayı seçin.":
    "Al archivo le falta la lista de profesores, grupos, clases o aulas; puede que esté cortado o editado a mano. Elija el archivo que guardó con «Guardar».",
  "Bu, Mozaik'in kaydettiği bir dosya değil. 'Kaydet' ile kaydettiğiniz dosyayı seçin.":
    "Este no es un archivo guardado por Mozaik. Elija el archivo que guardó con «Guardar».",
  "Excel'deki bir listeyi almak için Okul'daki listelerde Excel'den yapıştır düğmesini kullanın.":
    "Para traer una lista de Excel, use el botón «Pegar desde Excel» en las listas de Escuela.",
  "**Mozaik başka bir pencerede de açık ve plan orada değiştirildi.** Bu penceredeki son değişiklikler kaydedilmedi. **Yenile**'ye basın.":
    "**Mozaik también está abierto en otra ventana y el plan se cambió allí.** Los últimos cambios de esta ventana no se guardaron. Pulse **Recargar**.",
  "**Kayıtlı plan açılışta okunamadı.** Üzerine yazılmadı. **Yenile**'ye basın; plan yine gelmezse kaydettiğiniz plan dosyasını **Dosyadan aç** ile açın.":
    "**No se pudo leer el plan guardado al iniciar.** No se ha sobrescrito. Pulse **Recargar**; si el plan no vuelve, abra su archivo de plan con **Abrir desde archivo**.",
  "**Kayıtlı plan daha yeni bir sürümle yazılmış.** Bu sürüm onu açamıyor ve üzerine yazmıyor; burada yapılanlar kaydedilmez. Mozaik'i güncelleyin.":
    "**El plan guardado lo escribió una versión más reciente.** Esta versión no puede abrirlo y no lo sobrescribe; lo que haga aquí no se guarda. Actualice Mozaik.",
  "Bu taslağın içi boş. Silip yeniden oluşturabilirsiniz.":
    "Este borrador está vacío. Puede borrarlo y volver a crearlo.",
  "{ad}: {yuk} saat ders, {acik} açık saat. {fazla} saat haftaya sığmaz.":
    "{ad}: {yuk} horas de clase, {acik} horas abiertas. {fazla} {fazla:hora no cabe|horas no caben} en la semana.",
  "{ad}: {yuk} saat ders, {acik} müsait saat. {fazla} saat haftaya sığmaz.":
    "{ad}: {yuk} horas de clase, {acik} horas disponibles. {fazla} {fazla:hora no cabe|horas no caben} en la semana.",
  "{yuk} saat ders, {acik} açık saat. {fazla} saat haftaya sığmaz.":
    "{yuk} horas de clase, {acik} horas abiertas. {fazla} {fazla:hora no cabe|horas no caben} en la semana.",
  "{yuk} saat ders, {acik} müsait saat. {fazla} saat haftaya sığmaz.":
    "{yuk} horas de clase, {acik} horas disponibles. {fazla} {fazla:hora no cabe|horas no caben} en la semana.",
  "Bir dersin saatini azaltın ya da Müsaitlik sekmesinde kapalı saat açın.":
    "Reduzca las horas de una clase o abra horas cerradas en la pestaña Disponibilidad.",
  "Önce bir branş seçin.":
    "Elija primero una asignatura.",
  "Şu an **{gun} gün × {saat} saat** = haftada {yer} saat.":
    "Ahora mismo **{gun} días × {saat} horas** = {yer} horas a la semana.",
  "Sağdaki sayılar: açık saat / ders saati.":
    "Los números de la derecha: horas abiertas / horas de clase.",
  "{acik} açık saat, {yuk} saat ders":
    "{acik} horas abiertas, {yuk} horas de clase",
  "Bütün haftayı aç":
    "Abrir toda la semana",
  "Bütün haftayı kapat":
    "Cerrar toda la semana",
  "**Art arda**: üst üste en çok kaç saat. **Günde ↑**: günde en çok, **Günde ↓**: geldiği gün en az. Boşsa Kurallar’daki sayı geçerli.":
    "**Seguidas**: como máximo cuántas horas sin pausa. **Al día ↑**: como máximo, **Al día ↓**: como mínimo. Vacío: el número de Reglas.",
  "Renkler kâğıtta çıkmazsa: yazdırma penceresinde **Diğer ayarlar**’ı açın ve **Arka plan grafikleri** kutusunu işaretleyin.":
    "Si los colores no salen: en la ventana de impresión, abra **Más ajustes** y marque **Gráficos de fondo**.",
  "Haftanın tamamı sığmıyor; Daha fazla → Yoğunluk → Sığdır bütün günleri gösterir.":
    "La semana entera no cabe; Más → Densidad → Ajustar muestra todos los días.",

  // Keyboard on the Program and Müsaitlik grids (erisim/klavye-izgara, 2026-11-15)
  "Haftalık dersler": "Clases de la semana",
  "{gun} {n}. saat": "{gun}, {n}.ª hora",
  "açılan öğretmen saatinde": "en una hora de docente que se abre",
  "yeri değişiyor": "cambia de sitio",
  "müsait değil": "no disponible",
  "müsait": "disponible",
  "kapalı": "cerrado",
  "açık": "abierto",
  "boş": "vacía",
  "Bu dersin satırı ekranda değil.": "La fila de esta clase no está en pantalla.",
  "{ders} havuza kaldırıldı.": "{ders} volvió a la bandeja.",
  "{ders} alındı. Hedef hücreyi oklarla seçin, Enter bırakır, Esc vazgeçer.": "{ders} tomada. Elija la celda de destino con las flechas; Intro la suelta, Esc cancela.",
  "Taşımadan vazgeçildi.": "Movimiento cancelado.",
  "{ders} yerleşti: {yer}.": "{ders} colocada: {yer}.",
  "{acik} saat müsait, {yuk} saat ders yüklenmiş": "{acik} {acik:hora disponible|horas disponibles}, {yuk} {yuk:hora|horas} de clase cargadas",
  "{acik} saat açık, {yuk} saat ders yüklenmiş": "{acik} {acik:hora abierta|horas abiertas}, {yuk} {yuk:hora|horas} de clase cargadas",
  "Izgaraya gir, bir daha basınca çık": "Entrar en la cuadrícula; pulse otra vez para salir",
  "Hücreden hücreye git": "Ir de celda en celda",
  "Satırın başına veya sonuna git, Ctrl ile ilk veya son satıra": "Ir al inicio o al final de la fila; con Ctrl, a la primera o última fila",
  "Odaklı dersi taşımak için al": "Tomar la clase enfocada para moverla",
  "Odaklı dersi sabitle veya sabitlemeyi kaldır": "Fijar o soltar la clase enfocada",
  "Dersler arasında git": "Moverse entre clases",
  "Odaklı dersi ızgaraya koymak için al": "Tomar la clase enfocada para ponerla en la cuadrícula",
  "Tutamakta: havuzun boyunu değiştir, Shift ile daha çok": "En el asa: cambiar el tamaño de la bandeja; con Mayús, a pasos mayores",
  "Ders eldeyken": "Con una clase en la mano",
  "Hedefi bir saat kaydır": "Mover el destino una hora",
  "Bırakılabilecek bir sonraki saate git": "Ir a la siguiente hora posible",
  "Önceki veya sonraki güne git": "Ir al día anterior o siguiente",
  "Buraya bırak": "Soltar aquí",
  "Vazgeç, sürüklerken de": "Cancelar, también al arrastrar",
  "Saati aç veya kapat, başlıkta bütün günü veya saati": "Abrir o cerrar la hora; en un encabezado, todo el día o la hora",
  "Müsaitlik'te aç":
    "Abrir en Disponibilidad",
  "Ders ızgarada görünmüyor; satırı gizli olabilir.":
    "La clase no está en la cuadrícula; quizá su fila está oculta.",
  "Ders havuzda görünmüyor; havuz kapalı olabilir.":
    "La clase no se ve en la bandeja; quizá está cerrada.",
  "{kim} için Müsaitlik'i açar":
    "Abre la disponibilidad de {kim}",
  "**{ders} dersin {saat} saati kapalı saatte kaldı.** Aşağıdaki **Göster** onu ızgarada bulur.":
    "**{ders} {ders:clase tiene|clases tienen} {saat} {saat:hora|horas} en una hora cerrada.** **Mostrar** abajo la encuentra en la cuadrícula.",
  "Saatler ders konduktan **sonra** kapatıldı, hiçbir ders silinmedi. Dersi açık bir saate sürükleyin ya da saati Müsaitlik'te açın.":
    "Las horas se cerraron **después** de colocar las clases; no se eliminó nada. Arrastre la clase a una hora abierta o abra la hora en Disponibilidad.",
  "Bu derslere konacak hücre kalmamış. Dersin adı onu havuzda gösterir; yer açmak için Müsaitlik'te saat açın ya da bir dersi taşıyın.":
    "No queda ninguna celda para estas clases. El nombre de una clase la muestra en la bandeja; para hacer sitio, abra horas en Disponibilidad o mueva una clase.",
  "Sebep ve dersler":
    "Motivo y clases",
  "{sinif} sınıfının açık saatlerinin hepsi başka derslerle dolu.":
    "Todas las horas abiertas de la clase {sinif} están ocupadas por otras clases.",
  "{kim} {n} saatinde müsait değil":
    "{kim} no está disponible en {n} de ellas",
  "{n} saatinde {kim} başka sınıfta":
    "en {n}, {kim} está con otra clase",
  "{n} saatinde {derslik} dersliği dolu":
    "en {n}, el aula {derslik} está ocupada",
  "{n} saatinde bir kural izin vermiyor":
    "en {n}, una regla no lo permite",
  "{sinif} sınıfının {n} boş saati var ama bu dersin blokları onlara sığmıyor.":
    "El grupo {sinif} tiene {n} {n:hora libre|horas libres}, pero los bloques de esta clase no caben en ellas.",
  "{sinif} sınıfının {n} boş saati var: {neden}.":
    "La clase {sinif} tiene {n} {n:hora libre|horas libres}: {neden}.",
  "{zaman} saatlerinde":
    "en las horas {zaman}",
  "{n} saatine {boy} saatlik ders sığmıyor":
    "{n} {n:no admite|no admiten} su clase de {boy} horas",
  "{n} sorun":
    "{n} {n:problema|problemas}",
  "{brans} dersi de gitti.": "Su clase de {brans} se fue con ella.",
  "{brans} dersleri de gitti.": "Sus clases de {brans} se fueron con ella.",
  "{sinif} sınıfının {brans} dersi de gitti.":
    "La clase {sinif} perdió su clase de {brans}.",
  "{n} sınıfın {brans} dersi de gitti: {siniflar}.":
    "{n} {n:clase perdió|clases perdieron} la clase de {brans}: {siniflar}.",
  "Programdan {n} saat kalktı.":
    "Se {n:quitó|quitaron} {n} {n:hora colocada|horas colocadas} del horario.",
  "{ad} kısa adı": "nombre corto de {ad}",
  "Yeni sınıfın dersliği": "Aula de la nueva clase",
  "İçeriğe geç": "Saltar al contenido",
  "Ders günü": "Día lectivo",
  "Geri alındı.": "Deshecho.",
  "Geri alındı: {ne}": "Deshecho: {ne}",
  "Geri almak için Ctrl+Z.": "Ctrl+Z para deshacer.",
  "Arada başka bir değişiklik oldu. Ctrl+Z ile adım adım geri alın.": "Algo más cambió entretanto. Deshaga paso a paso con Ctrl+Z.",
  "Öğretmenler, sınıflar, dersler ve dizilmiş program. Bu plan bomboş kalacak. Hemen ardından \"Geri al\" ile geri gelir.": "Profesores, clases, asignaturas y el horario montado. Este plan quedará completamente vacío. \"Deshacer\" justo después lo devuelve todo.",
  "Bu plandaki her şey silindi.": "Se borró todo lo de este plan.",
  "**Açık olan plan** tamamen silinir; hemen ardından **Geri al** ile geri gelir.": "**El plan abierto** se borra; **Deshacer** justo después lo devuelve.",
  "{kayip} Yerine 25 öğretmen, 20 sınıf, 8 derslik ve 99 ders olan örnek bir okul gelir. Diğer planlara dokunulmaz. Hemen ardından \"Geri al\" ile geri gelir.": "{kayip} En su lugar viene una escuela de ejemplo con 25 profesores, 20 clases, 8 aulas y 99 asignaturas. Los demás planes no se tocan. \"Deshacer\" justo después devuelve sus datos.",
  "Derslik silindi.": "Aula eliminada.",
  "{ad} dersliği silindi.": "Aula {ad} eliminada.",
  "{ad} dersliği silindi, {sinif} sınıfının dersliği boşaldı.": "Aula {ad} eliminada; la clase {sinif} ya no tiene aula.",
  "{ad} dersliği silindi, {n} sınıfın dersliği boşaldı ({hangileri}). Bu sınıflar artık aynı saate konabilir.": "Aula {ad} eliminada; {n} {n:clase ya no tiene|clases ya no tienen} aula ({hangileri}). Estas clases ya pueden ir a la misma hora.",
  "Öğretmen silindi.": "Profesor eliminado.",
  "Sınıf silindi.": "Clase eliminada.",
  "\"{ad}\" branşı listeden çıkarıldı.": "\"{ad}\" se quitó de la lista de materias.",
  "{ad} seçeneği silindi.": "Variante {ad} borrada.",
  "{ad} seçeneği silindi, yerleşmiş {n} saati de gitti.": "Variante {ad} borrada, con {n} {n:hora colocada|horas colocadas}.",
  "Program yeniden yapıldı.": "El horario se ha rehecho.",
  "Program yeniden yapıldı, sabitlenen {n} saat yerinde kaldı.": "El horario se ha rehecho; {n} {n:hora fijada se quedó|horas fijadas se quedaron} en su sitio.",
  "Açıklama: {konu}": "Explicación: {konu}",
  "Daha fazla": "Más",
  "Dosya": "Archivo",
  "Tercih": "Preferencia",
  "Yeni dönem için kopyala": "Copiar para un nuevo curso",
  "Ara ve yap": "Buscar y hacer",
  "Planlar arasında geçiş yapar": "Cambia entre planes",
  "Yeni dönem için bir kopya açıldı: dersler duruyor, program boş. Eski plan Dosya → Planlar ve yedek’te.": "Se ha abierto una copia para el nuevo curso: las clases están, el horario está vacío. El plan anterior está en Archivo → Planes y copias de seguridad.",
  "Görünsün": "Visible",
  "Gizlensin": "Oculta",
  "Yerleşmiş dersi sürükleyerek taşıyın.": "Arrastre una clase colocada para moverla.",
  "Yerleşmeyi bekleyen ders yok": "No hay clases esperando a colocarse",
  "Yerleşmeyen dersleri kurallara uyarak yerleştirir": "Coloca las clases sin colocar respetando las reglas",
  "Seçenek: {ad}": "Opción: {ad}",
  "{n} kesin": "{n} {n:estricta|estrictas}",
  "{n} tercih": "{n} {n:preferencia|preferencias}",
  "Dersleri gir": "Introducir las clases",
  "Gelemediği saatleri işaretle": "Marcar las horas en que no pueden venir",
  "{d} derslik · {b} branş · {o} öğretmen · {s} sınıf": "{d} {d:aula|aulas} · {b} {b:materia|materias} · {o} {o:profesor|profesores} · {s} {s:grupo|grupos}",
  "Başlarken listesini göster": "Mostrar la lista de primeros pasos",
  "Art arda, Günde ↑, Günde ↓": "Seguidas, Por día ↑, Por día ↓",
  "Teknik bilgiler": "Información técnica",
  "**Program tamam.** Bütün dersler yerleşti ve kurallara uyuyor.": "**El horario está completo.** Todas las clases están colocadas y cumplen las reglas.",
  "Yazdır": "Imprimir",
  "Açık plan": "Plan abierto",
  "Seviye": "Nivel",
  "{toplam} öğretmenin ilk {kac} tanesi.": "Los {kac} primeros de {toplam} {toplam:profesor|profesores}.",
  "Bu dosya bütün planları içeren bir dosya değil. Tek bir planı üst çubuktaki Dosya menüsünden \"Dosyadan aç\" ile açabilirsiniz.": "Este no es un archivo con todos los planes. Abra un solo plan con «Abrir archivo» en el menú Archivo de la barra superior.",
  "Ekrandaki plan dosyadakiyle değiştirilecek ve geri alma geçmişi sıfırlanacak. Vazgeçme ihtimaliniz varsa önce \"Kaydet\" deyin.": "El plan de la pantalla se sustituirá por el del archivo y se borrará el historial de deshacer. Si puede cambiar de idea, pulse antes «Guardar».",
  "\"{plan}\" planı okunamıyor, bu yüzden hiçbir plan klasöre yazılmıyor.": "El plan «{plan}» no se puede leer, así que no se escribe ningún plan en la carpeta.",
  "**Plan bu bilgisayarda boş açıldı, ama {klasor} klasöründe daha dolu bir plan dosyası var:** {dosya}, {ogretmen} öğretmen ve {ders} ders. Siz seçene kadar klasöre hiçbir şey yazılmıyor.": "**El plan se abrió vacío en este ordenador, pero la carpeta {klasor} tiene un archivo de plan más completo:** {dosya}, {ogretmen} {ogretmen:profesor|profesores} y {ders} {ders:clase|clases}. No se escribe nada en la carpeta hasta que elija.",
  "Belgelerim'deki son kaydı aç": "Abrir la última copia de Documentos",
  "Boş başla": "Empezar vacío",
  "**Plan çok küçüldü:** {ogretmen} öğretmen ve {ders} ders kaldı, klasördeki son plan dosyasında {eskiOgretmen} öğretmen ve {eskiDers} ders var. O dosya korundu, yeni hâli **{dosya}** adıyla ayrıca yazıldı.": "**El plan se ha reducido mucho:** quedan {ogretmen} {ogretmen:profesor|profesores} y {ders} {ders:clase|clases}, y el último archivo de plan de la carpeta tiene {eskiOgretmen} {eskiOgretmen:profesor|profesores} y {eskiDers} {eskiDers:clase|clases}. Ese archivo se conservó; el nuevo estado se guardó aparte como **{dosya}**.",
  "Yeni hâlini asıl dosya yap": "Convertir el nuevo estado en el archivo principal",
  "{ne} Son silmeyi geri almak için:": "{ne} Para deshacer la última eliminación:",
  "Geri getir": "Recuperar",
  "Son silme geri alındı.": "Se deshizo la última eliminación.",
  "son silmeden önceki hâl": "estado antes de la última eliminación",
  "Kimliği eksik ya da tekrarlanan plan: {adlar}.": "Plan con identificador ausente o repetido: {adlar}.",
  "Siz seçene kadar klasöre hiçbir şey yazılmıyor.": "No se escribe nada en la carpeta hasta que elija.",
  "Klasördeki son plan dosyasının yerine bu küçük plan yazılır. Eski hâli günlük yedeklerde kalır.": "Este plan más pequeño sustituye al último archivo de plan de la carpeta. El estado anterior queda en las copias diarias.",

  // src/pure/solver (2026-11-16)
  "Başka bir dizilim": "Otra distribución",
  "Program yapıldı, {n} saat yer değiştirdi.": "El horario está hecho; {n} {n:hora movida|horas movidas}.",
  "{kim}: {yuk} saat ders, {acik} müsait saat; {fazla} saat açılmalı": "{kim}: {yuk} horas de clase, {acik} disponibles; hay que abrir {fazla}",
  "{sinif}: {yuk} saat ders, {acik} açık saat; {fazla} saat açılmalı": "{sinif}: {yuk} horas de clase, {acik} abiertas; hay que abrir {fazla}",
  "{derslik} dersliği: {yuk} saat ders, {acik} açık saat; {fazla} saat açılmalı ya da bir sınıf başka dersliğe geçmeli": "Aula {derslik}: {yuk} horas de clase, {acik} abiertas; abrir {fazla} más o pasar un grupo a otra aula",
  "{bir} ile {iki} aynı güne konmamalı: {n1} + {n2} gün gerekiyor, {g} gün var": "{bir} y {iki} no el mismo día: hacen falta {n1} + {n2} días, hay {g}",
  // The plan-file reminder and the move to the new address (2026-11-16).
  "son plan dosyasının tarihi":
    "fecha del último archivo de plan",
  "**Bu planın bir plan dosyası yok.** Yaptıklarınız yalnız bu tarayıcıda duruyor.":
    "**Este plan no tiene archivo de plan.** Lo que ha hecho solo está en este navegador.",
  "**Son plan dosyası {tarih} tarihli.** Ondan sonra yaptıklarınız yalnız bu tarayıcıda duruyor.":
    "**El último archivo de plan es del {tarih}.** Lo que ha hecho desde entonces solo está en este navegador.",
  "Son plan dosyası: {tarih}.":
    "Último archivo de plan: {tarih}.",
  "Eski adresteki planlar buraya gelsin mi?":
    "¿Traer aquí los planes de la dirección anterior?",
  "**Planlar bir plan dosyasına yazıldı** (İndirilenler). Yeni adreste **Tümünü dosyadan aç** ile açın.":
    "**Los planes se escribieron en un archivo de plan** (Descargas). En la nueva dirección, ábralo con **Abrir todos desde archivo**.",
  "**Planlar yeni adrese taşındı.** Bundan sonra orayı kullanın:":
    "**Los planes se han trasladado a la nueva dirección.** A partir de ahora, use esa:",
  "Yeni adres açıldı. Oradaki soruyu cevaplayın.":
    "Se ha abierto la nueva dirección. Responda allí a la pregunta.",
  "**Mozaik yeni adresine taşındı.** Planlarınız burada da kalır.":
    "**Mozaik se ha trasladado a una nueva dirección.** Sus planes también se quedan aquí.",
  "Hiçbir plan taşınmadı.":
    "No se trasladó ningún plan.",
  "Planları taşı":
    "Trasladar planes",
};

registerSozluk("es", ES);
