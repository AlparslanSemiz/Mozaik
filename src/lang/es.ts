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
  "Kartların renk ölçütü": "Criterio de color de las tarjetas",
  "program kart rengi tercihi": "preferencia de color de las tarjetas del horario",
  "{bir} ile {iki} yer değiştirecek": "{bir} y {iki} intercambiarán sus posiciones",
  "{bir} ile {iki} yer değiştirdi": "{bir} y {iki} intercambiaron sus posiciones",
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
  Pzt: "Lun",
  Sal: "Mar",
  Çar: "Mié",
  Per: "Jue",
  Cum: "Vie",
  Cmt: "Sáb",
  Pzr: "Dom",
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
  Mat: "Mat",
  Fzk: "Fís",
  Geo: "Geo",
  Kim: "Quién",
  Biy: "Bio",
  Trk: "Tur",
  Edb: "Lit",
  Tar: "His",
  Coğ: "Gfa",
  İng: "Ing",
  Fel: "Fil",
  Din: "Rel",
  Alm: "Ale",
  Fra: "Fra",
  Müz: "Mús",
  Res: "Dib",
  Bed: "EF",
  Sos: "CSo",
  Fen: "CNa",
  Reh: "Ori",
  İnk: "Ref",

  // src/App.tsx
  "Dosyaya kaydet": "Guardar en archivo",
  "yedek al": "hacer una copia",
  "Yedek dosyaya yazıldı. İndirilenler klasörüne bakın.":
    "Copia escrita en un archivo. Mire en la carpeta de descargas.",
  "Otomatik diz": "Colocar automáticamente",
  Program: "Horario",
  "Açık temaya geç": "Cambiar al tema claro",
  "Koyu temaya geç": "Cambiar al tema oscuro",
  "Araç şeridini gizle": "Ocultar la barra de herramientas",
  "Araç şeridini göster": "Mostrar la barra de herramientas",
  "Animasyonları aç": "Activar las animaciones",
  "Animasyonları kapat": "Desactivar las animaciones",
  "Ayarlar → Görünüm": "Ajustes → Apariencia",
  "Bu dosya bütün planları içeriyor": "Este archivo contiene todos los planes",
  "Bu dosya daha yeni bir sürümle yazılmış":
    "Este archivo se escribió con una versión más reciente",
  "Bu dosya okunamadı": "No se pudo leer este archivo",
  'Tek bir planı değil, bu bilgisayardaki bütün planların yerine geçer. Ayarlar → Planlar ve yedek bölümündeki "Tümünü dosyadan aç" düğmesini kullanın.':
    'Sustituye todos los planes de este ordenador, no uno solo. Use el botón "Abrir todos desde archivo" en Ajustes → Planes y copia.',
  "Programı güncelleyin, sonra tekrar deneyin.":
    "Actualice el programa y vuelva a intentarlo.",
  "Program tarafından indirilmiş bir .json yedek dosyası seçin.":
    "Elija un archivo de copia .json descargado por el programa.",
  "Şu anki programın yerine geçecek": "Sustituirá el horario actual",
  'Ekrandaki plan dosyadakiyle değiştirilecek ve geri alma geçmişi sıfırlanacak. Vazgeçme ihtimaliniz varsa önce "Dosyaya kaydet" deyin.':
    'El plan en pantalla se sustituye por el del archivo y se borra el historial de deshacer. Si puede cambiar de opinión, elija antes "Guardar en archivo".',
  "Yedeği yükle": "Cargar la copia",
  "Yedek yüklendi.": "Copia cargada.",
  Bölümler: "Secciones",
  "Programın durumu: {durum}. Ayrıntı için Kontrol.":
    "Estado del horario: {durum}. Detalles en Revisión.",
  "{durum}. Kontrol sekmesini açar": "{durum}. Abre la pestaña Revisión",
  Plan: "Plan",
  "Planlar arasında geçiş yapar. Yeni plan, ad değiştirme ve silme: Ayarlar → Planlar ve yedek":
    "Cambia entre planes. Nuevo plan, renombrar y borrar: Ajustes → Planes y copia",
  "Geri al": "Deshacer",
  "Geri al (Ctrl+Z)": "Deshacer (Ctrl+Z)",
  "İleri al": "Rehacer",
  "İleri al (Ctrl+Y)": "Rehacer (Ctrl+Y)",
  "Programı bir .json dosyasına yazar. Program bu bilgisayarda kendiliğinden saklanıyor; dosya taşımak ve yedeklemek için.":
    "Escribe el horario en un archivo .json. El programa ya se guarda solo en este ordenador; el archivo sirve para llevarlo y conservarlo.",
  "Daha önce kaydedilmiş bir .json dosyasını açar":
    "Abre un archivo .json guardado antes",
  "Dosyadan aç": "Abrir desde archivo",
  "Ara ve git": "Buscar e ir",
  "Ara ve git (Ctrl+K)": "Buscar e ir (Ctrl+K)",
  "Klavye kısayolları": "Atajos de teclado",
  "Klavye kısayolları (?)": "Atajos de teclado (?)",
  // -------------------------------------------------- ShortcutsHelp.tsx
  "Genel kısayollar": "General",
  "Komut paletini aç/kapat": "Mostrar u ocultar la paleta de comandos",
  "Bir sekmeye git": "Ir a una sección",
  "Bu ekranı aç": "Abrir esta pantalla",
  "İptal et veya kapat": "Cancelar o cerrar",
  "Odaklı dersi havuza kaldır": "Devolver la clase enfocada al depósito",
  "Odaklı kartın sağ tık menüsünü aç":
    "Abrir el menú contextual de la tarjeta enfocada",
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
  "Araç şeridini gizle, ızgaraya bir satır daha kalsın":
    "Ocultar la barra y dejar una fila más a la cuadrícula",
  "Koyu tema": "Tema oscuro",
  Yenile: "Recargar",
  Sonra: "Más tarde",
  "Klasörü düzelt": "Arreglar la carpeta",
  "**Bu bilgisayarda otomatik kayıt çalışmıyor.** Program kapanınca yaptığınız her şey kaybolur. Çalışırken sık sık **Dosyaya kaydet** düğmesine basın ve bilgisayarı kapatmadan önce mutlaka bir yedek alın.":
    "**El guardado automático no funciona en este ordenador.** Todo lo que haga se pierde al cerrar el programa. Pulse a menudo **Guardar en archivo** mientras trabaja y haga siempre una copia antes de apagar el ordenador.",
  "**Yeni sürüm hazır.** Şu an {surum} sürümünü kullanıyorsunuz; yenisi **Yenile** deyince gelir. İşiniz kaybolmaz.":
    "**Hay una versión nueva lista.** Está usando {surum}; la nueva llega al pulsar **Recargar**. Su trabajo no se pierde.",
  "**{klasor}** klasörüne yazılamıyor: tarayıcı izni sormadan devam etmiyor. İşiniz şu an yalnız bu tarayıcıda duruyor.":
    "No se puede escribir en la carpeta **{klasor}**: el navegador no continúa sin pedir permiso. Ahora mismo su trabajo solo está en este navegador.",
  "**{klasor}** klasörüne **yazılamıyor**. {sebep} İşiniz şu an yalnız bu tarayıcıda duruyor.":
    "**No se puede escribir** en la carpeta **{klasor}**. {sebep} Ahora mismo su trabajo solo está en este navegador.",

  // src/components/Availability.tsx
  "{ad} sınıfı": "clase {ad}",
  "{ad} dersliği": "aula {ad}",
  "Müsait olmayan saatler": "Horas no disponibles",
  "Önce {ne} ekleyin.": "Añada primero {ne}.",
  "{kim} · müsait olmayan saatler": "{kim} · horas no disponibles",
  "Basılı tutup sürükleyerek birden çok hücre işaretleyebilirsiniz. Soldaki gün adına tıklayınca o günün tamamı, üstteki ders numarasına tıklayınca haftanın o saati değişir.":
    "Mantenga pulsado y arrastre para marcar varias celdas. Al pulsar el nombre del día a la izquierda cambia el día entero; al pulsar el número de hora arriba cambia esa hora de toda la semana.",
  "Haftanın bu saatini değiştir": "Cambiar esta hora de la semana",
  "{gun}: bütün günü değiştir": "{gun}: cambiar el día entero",
  "Haftanın darlığı": "Lo apretada que está la semana",
  "{gun} {ders}. ders: {kapali} / {toplam} kapalı":
    "{gun}, hora {ders}: {kapali} de {toplam} cerradas",
  "Kimin saatleri": "Horas de quién",
  "Müsaitlik listesi": "Lista de disponibilidad",
  "Tümünü aç": "Abrir todas",
  "Tümünü kapat": "Cerrar todas",
  "{n} saat fazla, bu program dizilemez.":
    "{n} {n:hora|horas} de más; este horario no se puede montar.",
  ", {n} tanesi {kim} üzerinde": ", {n} de ellas en {kim}",
  "Müsaitlik girebilmek için **Okul** sekmesinden en az bir {ne} eklemeniz gerekiyor.":
    "Para introducir disponibilidad necesita al menos {ne} en la pestaña **Escuela**.",
  "**{kim}**: {acik} saat açık, {yuk} saat ders yüklenmiş.":
    "**{kim}**: {acik} horas abiertas, {yuk} horas de clase asignadas.",
  "**Kapattığınız saatlerde yerleşmiş {n} ders var{kimde}.** Hiçbiri silinmedi. **Program** sekmesinde kırmızı çerçeveyle, **Kontrol** sekmesinde tek tek listeleniyor.":
    "**{n} {n:clase colocada está|clases colocadas están} en horas que ha cerrado{kimde}.** No se ha borrado ninguna. Están marcadas en rojo en la pestaña **Horario** y listadas una a una en **Revisión**.",

  // src/components/CapacityRows.tsx
  Ad: "Nombre",
  Açık: "Abierto",
  Yük: "Carga",
  Durum: "Estado",

  // src/components/Check.tsx
  "Kontrol edilecek bir şey yok.": "Todavía no hay nada que revisar.",
  İmkânsız: "Imposible",
  "Programın durumu": "Estado del horario",
  "Yerleşmiş saat": "Horas colocadas",
  "Tamamlanan ders": "Clases completas",
  "Haftanın doluluğu": "Ocupación de la semana",
  "Boş kalan sınıf saati": "Horas de clase libres",
  "Kapalı saatte ders ({n})": "Clases en hora cerrada ({n})",
  Açıklama: "Explicación",
  "Kapalı saat": "Horas cerradas",
  "Kural ihlalleri ({n})": "Reglas incumplidas ({n})",
  "Kural dışı": "Contra una regla",
  Uyarı: "Aviso",
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
  "**Okul** sekmesinden öğretmenleri, sınıfları ve dersleri girdikten sonra buraya dönün. Bu sayfa programın dizilip dizilemeyeceğini önceden söyler.":
    "Vuelva aquí cuando haya introducido profesores, clases y asignaturas en la pestaña **Escuela**. Esta página dice de antemano si el horario puede montarse.",
  "**Sorun görünmüyor.** Öğretmen müsaitlikleri, sınıf ve derslik kapasiteleri yüklenen ders saatlerini karşılıyor. Program dizilebilir.":
    "**No se ve ningún problema.** La disponibilidad y la capacidad de clases y aulas cubren las horas asignadas. El horario puede montarse.",
  "**Dikkat edilmesi gereken noktalar var.** Aşağıdaki listelerde":
    "**Hay puntos a los que prestar atención.** En las listas siguientes, las filas marcadas",
  "yazan satırlar programın dizilmesini engeller. Önce onları çözün.":
    "impiden montar el horario. Resuélvalas primero.",
  "Kalan **{n}** saat havuzda bekliyor. **Program** sekmesindeki **Otomatik diz** ile yerleştirebilirsiniz.":
    "Las **{n}** horas restantes esperan en la bandeja. Puede colocarlas con **Colocar automáticamente** en la pestaña **Horario**.",
  "Danışman uyarıları ({n})": "Notas del asesor ({n})",
  "Bunlar programı engellemez; veri girişinde gözden kaçmış olabilecek noktalardır.":
    "Esto no bloquea el horario; son puntos que pueden haberse pasado por alto al introducir los datos.",
  "Danışmanın söyleyecek bir şeyi yok.": "El asesor no tiene nada que decir.",
  Öneri: "Nota",

  // src/components/ColorPick.tsx
  Vazgeç: "Cancelar",

  // src/components/Commands.tsx
  Git: "Ir a",
  Yap: "Hacer",
  "derslik yok": "sin aula",
  "{n} sınıf": "{n} {n:clase|clases}",

  // src/components/DraftStart.tsx
  "Bu taslağın verisi bulunamadı":
    "No se han encontrado los datos de este borrador",
  'Plan listesinde duruyor ama kendi anahtarı boş. Ayarlar → Hakkında → "Veriler nerede" tablosu hangi anahtarın kaç bayt tuttuğunu gösterir.':
    'Está en la lista de planes pero su propia clave está vacía. La tabla "Dónde están los datos" en Ajustes → Acerca de muestra cuántos bytes ocupa cada clave.',
  "{ad} kopyası": "copia de {ad}",
  '"{ad}" taslağından yeni bir plan açıldı.':
    'Se ha abierto un plan nuevo desde el borrador "{ad}".',

  // src/components/Grid.tsx
  "Öğle arası": "Descanso del mediodía",
  "{ust} {alt}, kaldırmak için Delete": "{ust} {alt}, pulse Supr para quitar",
  "Sürükleyerek taşıyın · sağ tık: seçenekler":
    "Arrastre para mover · clic derecho para opciones",
  "{sorun}. Sürükleyerek taşıyın, sağ tıkla seçenekleri açın":
    "{sorun}. Arrastre para mover, clic derecho para opciones",
  "{ust} {alt}, sabitlenmiş": "{ust} {alt}, fijada",
  "Sabitlenmiş. Sağ tıkla sabitlemeyi kaldırabilirsiniz":
    "Fijada. Clic derecho para soltarla",

  // src/components/Program.tsx — the grid's own menu
  "Havuza kaldır": "Enviar a la bandeja",
  sabitlenmiş: "fijada",
  "Dersi düzenle": "Editar la clase",
  "Dersi buraya sabitle": "Fijar la clase aquí",
  "Sabitlemeyi kaldır": "Soltar",
  "Bu ders sabitlenmiş. Önce sabitlemeyi kaldırın.":
    "Esta clase está fijada. Suéltela primero.",
  "Ders sabitlendi.": "Clase fijada.",
  "Sabitleme kaldırıldı.": "Clase soltada.",

  // src/components/LessonEdit.tsx
  "Günde en fazla": "Máximo por día",
  "Dağılım değiştirilirse bu dersin programdaki yerleşimleri kalkar, sabitlenmiş olanlar da":
    "Si cambia el reparto, esta clase sale del horario, también los bloques fijados",

  // src/components/Ribbon.tsx — what the two destructive questions promise
  "Sabitlenen {n} saat yerinde kalır, gerisi sıfırdan dizilir. Ctrl+Z ile geri alınabilir.":
    "Las {n} horas fijadas se quedan; el resto se organiza desde cero. Ctrl+Z lo deshace.",
  "Sabitlenen {n} saat yerinde kalır. Dersler, öğretmenler ve müsaitlikler olduğu gibi kalır. Ctrl+Z ile geri alınabilir.":
    "Las {n} horas fijadas se quedan. Las clases, los profesores y las horas cerradas no cambian. Ctrl+Z lo deshace.",
  "{ad}: bilgileri ve haftalık programı": "{ad}: datos y horario semanal",

  // src/components/Inspector.tsx
  Kapat: "Cerrar",
  "Haftalık programı": "Horario semanal",
  "Kayıt bulunamadı": "No se ha encontrado el registro",

  // src/components/LessonPool.tsx
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
  "{n} blok bekliyor": "{n} {n:bloque espera|bloques esperan}",
  "{n} saat · sürükleyip bırakın": "{n} {n:hora|horas} · arrastre y suelte",
  "{ust} · {alt} {brans} · {boy} saatlik blok":
    "{ust} · {alt} {brans} · bloque de {boy} horas",
  " · {n} tane bekliyor": " · {n} en espera",
  " · dersin {yerlesen}/{toplam} saati yerleşti":
    " · {yerlesen} de las {toplam} horas de la clase colocadas",

  // src/components/ListTools.tsx
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

  // src/components/Palette.tsx
  "Komut paleti": "Paleta de comandos",
  "Ara veya komut yaz": "Buscar o escribir un comando",
  "Öğretmen, sınıf, derslik ara ya da bir komut yaz…":
    "Busque un profesor, clase o aula, o escriba un comando…",
  Esc: "Esc",
  Sonuçlar: "Resultados",
  "Eşleşen bir şey yok.": "No hay coincidencias.",

  // src/components/Print.tsx
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
  "Önce **Okul** sekmesinden dersleri girip **Program** sekmesinde dizin.":
    "Introduzca primero las clases en la pestaña **Escuela** y móntelas en la pestaña **Horario**.",
  "**{n}** kâğıt": "**{n}** {n:hoja|hojas}",
  "Seçilen sayfaların **{n}** tanesi tamamen boş. O öğretmenlerin programı henüz dizilmemiş. **Program** sekmesinden dizebilirsiniz.":
    "**{n}** de las páginas seleccionadas están completamente vacías. Los horarios de esos profesores aún no se han montado. Puede montarlos en la pestaña **Horario**.",
  "Seçilen sayfaların **{n}** tanesi tamamen boş. O sınıfların programı henüz dizilmemiş. **Program** sekmesinden dizebilirsiniz.":
    "**{n}** de las páginas seleccionadas están completamente vacías. Los horarios de esas clases aún no se han montado. Puede montarlos en la pestaña **Horario**.",

  // src/components/Program.tsx
  "Buraya bırakılabilir.": "Se puede soltar aquí.",
  "Otomatik diziliyor… {yerlesen}/{toplam} blok · {sure} sn":
    "Colocando automáticamente… {yerlesen}/{toplam} bloques · {sure} s",
  "Satırlar öğretmen. Hücrede sınıf ve derslik yazar. Yerleşmiş dersi sürükleyerek taşıyın, sağ tıklayınca havuza döner.":
    "Las filas son profesores. Una celda muestra la clase y el aula. Arrastre una clase colocada para moverla; el clic derecho la devuelve a la bandeja.",
  "Satırlar sınıf. Hücrede öğretmen ve branşı yazar. Yerleşmiş dersi sürükleyerek taşıyın, sağ tıklayınca havuza döner.":
    "Las filas son clases. Una celda muestra el profesor y su asignatura. Arrastre una clase colocada para moverla; el clic derecho la devuelve a la bandeja.",
  "Program dizildi. {n} blok yerleşti ({sure} sn). Ctrl+Z ile geri alabilirsiniz.":
    "Horario montado. {n} bloques colocados ({sure} s). Ctrl+Z lo deshace.",
  " (ve {n} ders daha)": " (y {n} {n:clase más|clases más})",
  "Durduruldu. {yerlesen}/{toplam} blok yerleşti.":
    "Detenido. {yerlesen} de {toplam} bloques colocados.",
  "{yerlesen}/{toplam} blok yerleşti.":
    "{yerlesen} de {toplam} bloques colocados.",
  "{bas} {ders}: {saat} saat yerleşemedi. {sebep}{digerleri}.":
    "{bas} {ders}: no se pudieron colocar {saat} horas. {sebep}{digerleri}.",
  dönecek: "volverá",
  döndü: "ha vuelto",
  "Henüz dizilecek ders yok.": "Todavía no hay clases que montar.",
  "Buraya döndüğünüzde dersler alttaki havuzda kartlar hâlinde bekliyor olacak.":
    "Cuando vuelva aquí las clases estarán esperando como tarjetas en la bandeja de abajo.",
  "Ayrıntı: Kontrol sekmesi.": "Detalles: la pestaña Revisión.",
  Tamam: "Aceptar",
  Öğretmen: "Profesor",
  Sınıf: "Clase",
  "Önce **Okul** sekmesinden derslikleri, öğretmenleri ve sınıfları girin, sonra her sınıfa haftalık ders saatlerini ekleyin. Ardından **Müsaitlik** sekmesinde öğretmenlerin gelemediği saatleri işaretleyin.":
    "Introduzca primero las aulas, profesores y clases en la pestaña **Escuela** y añada después las horas semanales de cada clase. Luego marque en la pestaña **Disponibilidad** las horas en que los profesores no pueden venir.",

  // src/components/Ribbon.tsx
  "Okul listeleri": "Listas de la escuela",
  "Ders girişi araçları": "Herramientas de entrada de clases",
  "Liste boş": "La lista está vacía",
  "Müsaitlik araçları": "Herramientas de disponibilidad",
  "Program araçları": "Herramientas del horario",
  Durdur: "Detener",
  "Havuzda bekleyen ders yok": "No hay clases esperando en la bandeja",
  "Havuzdaki dersleri kurallara uyarak yerleştirir":
    "Coloca las clases de la bandeja respetando las reglas",
  "Otomatik diz ({n})": "Colocar automáticamente ({n})",
  "Dizilmiş programı silip baştan dizer":
    "Borra el horario y lo monta desde cero",
  "Dizilmiş {n} saatin tamamı silinecek": "Se borrarán las {n} horas colocadas",
  "Program sıfırdan dizilecek. Ctrl+Z ile geri alınabilir.":
    "El horario se montará desde cero. Ctrl+Z lo deshace.",
  "Baştan diz": "Montar desde cero",
  "Dizilmiş {n} saatin tamamı havuza dönecek":
    "Las {n} horas colocadas volverán a la bandeja",
  "Izgara boşalır; dersler, öğretmenler ve müsaitlikler olduğu gibi kalır. Ctrl+Z ile geri alınabilir.":
    "La cuadrícula se vacía; clases, profesores y disponibilidad quedan igual. Ctrl+Z lo deshace.",
  "Programı boşalt": "Vaciar el horario",
  "Kontrol araçları": "Herramientas de revisión",
  "Sorun yok": "Sin problemas",
  "Sorunlar ({n})": "Problemas ({n})",
  "{n} engel": "{n} {n:bloqueo|bloqueos}",
  "{n} uyarı": "{n} {n:aviso|avisos}",
  "Yazdırma araçları": "Herramientas de impresión",
  "İkisi de": "Ambos",
  "Öğretmen renkleri kâğıda basılır":
    "Los colores de los profesores se imprimen en el papel",
  "Renkli bas": "Imprimir en color",
  "Ayar bölümleri": "Secciones de ajustes",

  // src/components/lessons/index.tsx
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
  "Sınıf · Öğretmen (ad veya kısaltma) · Haftalık saat · Blok (1 · 2 · 3)":
    "Grupo · Profesor (nombre o iniciales) · Horas semanales · Bloque (1 · 2 · 3)",
  "Günde en fazla {n} saat kuralı bu bloğu hiçbir yere sığdırmaz":
    'La regla "como máximo {n} horas al día" no deja sitio a este bloque',
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

  // src/components/settings/Appearance.tsx
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
  "Her zaman durur": "Siempre visible",
  Örnek: "Ejemplo",
  Saat: "Hora",
  "{toplam} öğretmenin ilk {kac} tanesi.":
    "Los primeros {kac} de {toplam} {toplam:profesor|profesores}.",
  Hareket: "Movimiento",
  Dil: "Idioma",
  "**Ferah.** Satırlar en açık, paneller en geniş.":
    "**Amplio.** Las filas más abiertas y los paneles más anchos.",
  "**Rahat.** Bugüne kadarki aralık.": "**Cómodo.** El espaciado de siempre.",
  "Henüz öğretmen yok. **Okul → Öğretmenler** adımından ekleyin; burası o listeyi gösterir.":
    "Todavía no hay profesores. Añádalos en **Escuela → Profesores**; aquí se muestra esa lista.",
  "**Tam.** Tasarlandığı gibi.": "**Completo.** Tal como se diseñó.",
  "**Kapalı.** Hiçbir şey kaymaz, hiçbir şey solmaz.":
    "**Desactivado.** Nada se desliza y nada se atenúa.",

  // src/components/settings/Data.tsx
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
  // src/changelog.ts — release-note bullets, translated like any other UI copy
  "Sınıf ve öğretmen boşluk kuralları, planlama analizi ve Danışman uyarıları eklendi.":
    "Se añadieron reglas de huecos para clases y docentes, análisis de planificación y notas del asesor.",
  'Klavye kısayolları için bir yardım ekranı eklendi (üst çubuk, Ctrl+K veya "?" tuşu).':
    "Se añadió una pantalla de ayuda para los atajos de teclado (barra superior, Ctrl+K o la tecla ?).",
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
  "Şimdi yeniden başlat": "Reiniciar ahora",
  "Bakılıyor…": "Comprobando…",
  "En son sürümü kullanıyorsunuz.": "Está usando la última versión.",
  "Yeni sürüm iniyor…": "Descargando la versión nueva…",
  "Her şey silinecek": "Se borrará todo",
  "Öğretmenler, sınıflar, dersler ve dizilmiş program. Bu plan bomboş kalacak.":
    "Profesores, clases, asignaturas y el horario montado. Este plan quedará completamente vacío.",
  "Devam et": "Continuar",
  "Son kez soruyorum": "Se lo pregunto por última vez",
  'Bu işlem geri alınamaz. Vazgeçme ihtimaliniz varsa önce üst çubuktan "Dosyaya kaydet" deyin.':
    'Esto no se puede deshacer. Si puede cambiar de opinión, elija antes "Guardar en archivo" en la barra superior.',
  "{yazilan} plan dosyaya yazıldı; {eksik} planın verisi bulunamadı.":
    "{yazilan} {yazilan:plan escrito|planes escritos} en el archivo; no se han encontrado los datos de {eksik} {eksik:plan|planes}.",
  "{yazilan} plan tek dosyaya yazıldı.":
    "{yazilan} {yazilan:plan escrito|planes escritos} en un solo archivo.",
  "Bu dosya programın daha yeni bir sürümüyle yazılmış. Programı güncelleyin.":
    "Este archivo se escribió con una versión más reciente del programa. Actualice el programa.",
  'Bu dosya bütün planları içeren bir dosya değil. Tek bir planı üst çubuktaki "Dosyadan aç" ile açabilirsiniz.':
    'Este archivo no contiene todos los planes. Puede abrir un solo plan con "Abrir desde archivo" en la barra superior.',
  "Bu bilgisayardaki bütün planların yerine geçecek":
    "Sustituirá todos los planes de este ordenador",
  "Buradaki {buradaki} plan silinip dosyadaki {gelen} plan açılacak. Bu işlem geri alınamaz.":
    "Se borrarán {buradaki} {buradaki:plan|planes} de aquí y se abrirán {gelen} {gelen:plan|planes} del archivo. Esto no se puede deshacer.",
  "Hepsini değiştir": "Sustituirlos todos",
  "Dosyadaki hiçbir plan okunamadı; hiçbir şey değişmedi.":
    "No se ha podido leer ningún plan del archivo; nada ha cambiado.",
  "{acilan} plan açıldı, {yazilamayan} plan yazılamadı. Depolama dolmuş olabilir. Dosyayı saklayın.":
    "{acilan} {acilan:plan abierto|planes abiertos}, {yazilamayan} no se han podido escribir. Puede que el almacenamiento esté lleno. Conserve el archivo.",
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
  "Bu bilgisayardaki otomatik yedekler": "Copias automáticas en este ordenador",
  "Henüz otomatik yedek yok, bu ilk oturum.":
    "Todavía no hay copia automática, esta es la primera sesión.",
  Oturum: "Sesión",
  "bir önceki": "la anterior",
  "{n} oturum önce": "hace {n} {n:sesión|sesiones}",
  "O zamana kadar üst çubuktaki **Dosyaya kaydet** tek çare.":
    "Hasta entonces, **Guardar en archivo** en la barra superior es el único remedio.",
  "**{klasor}** klasörü seçilmiş, ama tarayıcı izni her açılışta yeniden soruyor. **İzin ver** deyin.":
    "La carpeta **{klasor}** está elegida, pero el navegador vuelve a pedir permiso en cada inicio. Pulse **Permitir**.",
  "**{klasor}** · yazılıyor…": "**{klasor}** · escribiendo…",
  "**Yeni sürüm hazır.** Üstteki **Yenile** düğmesine basın.":
    "**Hay una versión nueva lista.** Pulse el botón **Recargar** de arriba.",
  "**v{surum} çıktı{tarih}.** İndirmek {mb} MB yer kaplar. İndirdikten sonra ne zaman geçeceğinize siz karar verirsiniz.":
    "**v{surum} ya está{tarih}.** Descargarla ocupa {mb} MB. Una vez descargada, usted decide cuándo cambiar.",
  "**v{surum} indi.** Yeniden başlatınca yeni sürüm açılır. Programınız kayıtlı, hiçbir şey kaybolmaz.":
    "**v{surum} se ha descargado.** Al reiniciar se abre la versión nueva. Su trabajo está guardado; no se pierde nada.",

  // src/components/settings/Plans.tsx
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

  // src/components/settings/Rules.tsx
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

  // src/components/settings/School.tsx
  "Zil ve günler": "Timbre y días",
  "Okul adı (yazdırılan sayfaların başlığında görünür)":
    "Nombre de la escuela (aparece en el encabezado de las páginas impresas)",
  "örn. Semiz Kurs": "p. ej. Academia Semiz",
  "ders yok": "sin clases",
  "{gun} öğle arası": "descanso del mediodía del {gun}",
  "Uzun ara yok": "Sin descanso largo",
  "{n}. dersten sonra": "después de la hora {n}",
  "En az bir gün seçmelisiniz.": "Debe elegir al menos un día.",
  "Ders saatleri": "Horas de clase",
  "Günlük ders sayısı": "Clases al día",
  "İlk ders başlangıcı": "Inicio de la primera clase",
  "Başlangıç saati": "Hora de inicio",
  "Başlangıç dakikası": "Minuto de inicio",
  "Ders (dk)": "Clase (min)",
  "Teneffüs (dk)": "Recreo (min)",
  "Öğle arası (dk)": "Descanso del mediodía (min)",
  "Ders adları (virgülle; boş bırakılırsa 1, 2, 3…)":
    "Nombres de las horas (separados por comas; vacío da 1, 2, 3…)",
  "Zil saatleri": "Horas del timbre",
  Ara: "Recreo",
  "Öğle arası, {dk} dk": "Descanso del mediodía, {dk} min",
  Bitiş: "Fin",
  "Şu an **{gun} gün × {saat} saat** = {yer} slot.":
    "Ahora mismo **{gun} días × {saat} horas** = {yer} huecos.",

  // src/components/setup/Classes.tsx
  Derslik: "Aula",
  "Ada göre": "Por nombre",
  "Dersliğe göre": "Por aula",
  "Ders yüküne göre": "Por carga de clases",
  "Sınıflar ({n})": "Clases ({n})",
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

  // src/components/setup/Paste.tsx
  "Buraya yapıştırın...": "Pegue aquí...",
  Önizle: "Vista previa",
  "Okunabilir satır bulunamadı.": "No se ha encontrado ninguna fila legible.",
  "Excel'de sütunları seçip kopyalayın, aşağıya yapıştırın. Beklenen sıra: **{ornek}**":
    "Seleccione y copie las columnas en Excel y péguelas abajo. Orden esperado: **{ornek}**",
  "**{n} satır okundu.** Aşağıdakiler eklenecek:":
    "**{n} {n:fila leída|filas leídas}.** Se añadirá lo siguiente:",

  // src/components/setup/Rooms.tsx
  "Sınıf sayısına göre": "Por número de clases",
  "Derslikler ({n})": "Aulas ({n})",
  "Yeni derslik": "Nueva aula",
  "Derslik adı, örn. A": "Nombre del aula, p. ej. A",
  "Derslikleri yapıştır": "Pegar aulas",
  "Derslik adı (her satırda bir tane)": "Nombre del aula (uno por línea)",
  "Bu aramaya uyan derslik yok.": "Ningún aula coincide con esta búsqueda.",
  "Sınıf sayısı": "Número de clases",

  // src/components/setup/Subjects.tsx
  "Bir öğretmende var ama listede yok": "Un profesor lo tiene pero la lista no",
  "· listede değil": "· no está en la lista",
  "{ad} kısaltması": "abreviatura de {ad}",
  Varsayılan: "Predeterminado",
  "Programda gömülü olan kısaltma": "La abreviatura incluida en el programa",
  "Listeden çıkar": "Quitar de la lista",
  "Bu branş zaten listede değil": "Esta asignatura ya no está en la lista",
  '"{ad}" branşı kullanılıyor': 'La asignatura "{ad}" está en uso',
  "{n} öğretmen bu branşta ({kimler}). Önce onların branşını değiştirin, sonra bu branşı silin.":
    "{n} {n:profesor tiene|profesores tienen} esta asignatura ({kimler}). Cambie primero su asignatura y bórrela después.",
  '"{ad}" branşı listeden çıkarılacak':
    'Se quitará la asignatura "{ad}" de la lista',
  "Hiçbir öğretmen bu branşta değil, yani başka bir şey etkilenmiyor.":
    "Ningún profesor tiene esta asignatura, así que no afecta a nada más.",
  Çıkar: "Quitar",
  "Branşlar ({n})": "Asignaturas ({n})",
  "Yeni branş (örn. Robotik)": "Asignatura nueva (p. ej. Robótica)",
  "Yeni branş": "Asignatura nueva",
  "Bu branş listede zaten var.": "Esta asignatura ya está en la lista.",
  Kısaltma: "Abreviatura",

  // src/components/setup/Summary.tsx
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

  // src/components/setup/Teachers.tsx
  Cinsiyet: "Sexo",
  "Branşa göre": "Por asignatura",
  "Açık saate göre": "Por horas abiertas",
  "Cinsiyete göre": "Por sexo",
  "Öğretmenler ({n})": "Profesores ({n})",
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
  "Ad Soyad · Kısaltma · Branş · Cinsiyet · İkinci branş":
    "Nombre y apellidos · Abreviatura · Asignatura · Sexo · Segunda asignatura",
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
  "**Aynı kısaltma birden çok öğretmende:** ızgarada iki satır ayırt edilemez.":
    "**La misma abreviatura en más de un profesor:** dos filas de la cuadrícula no se distinguen.",

  // src/components/setup/index.tsx
  Başlarken: "Para empezar",
  "Aracın ne yaptığını görmek isterseniz hazır bir okul yükleyebilirsiniz.":
    "Si quiere ver qué hace la herramienta, puede cargar una escuela ya preparada.",
  "Örnek veriyle doldur": "Rellenar con datos de ejemplo",
  "Bu satır bir daha çıkmaz; örnek veri Ayarlar → Hakkında’da durmaya devam eder":
    "Esta línea no volverá a aparecer; los datos de ejemplo siguen en Ajustes → Acerca de",
  "Bir daha gösterme": "No volver a mostrar",
  "{ad} ile başla": "Empezar con {ad}",
  "Daha önce **taslak** olarak işaretlediğiniz planların kurulumu hazır duruyor. Seçtiğinizden **yeni bir plan** açılır: derslikler, öğretmenler, sınıflar ve dersler kopyalanır, dizilmiş program boş gelir. Taslağın kendisi değişmez.":
    "La configuración de los planes marcados como **borrador** está lista. Al elegir uno se abre **un plan nuevo**: se copian aulas, profesores, clases y asignaturas, y el horario montado viene vacío. El borrador en sí no cambia.",

  // src/components/useRowOrder.tsx
  Sıra: "Orden",
  "{ad}, {n}. sıra, taşımak için yukarı ve aşağı ok":
    "{ad}, posición {n}, flechas arriba y abajo para mover",
  "Elle sıralama için süzmeyi ve sıralamayı kaldırın":
    "Para ordenar a mano, quite el filtro y la ordenación",

  // src/components/useSample.ts
  "{ogretmen} öğretmen, {sinif} sınıf ve {ders} ders silinecek.":
    "Se {ogretmen:borrará|borrarán} {ogretmen} {ogretmen:profesor|profesores}, {sinif} {sinif:clase|clases} y {ders} {ders:asignatura|asignaturas}.",
  "Bu plandaki her şeyin yerine örnek veri geçecek":
    "Los datos de ejemplo sustituirán todo lo de este plan",
  "Örnek okul verisi yüklenecek":
    "Se cargarán los datos de la escuela de ejemplo",
  '{kayip} Yerine 25 öğretmen, 20 sınıf, 8 derslik ve 99 derslik örnek bir okul gelir. Diğer planlara dokunulmaz. Geri alınamaz, önce "Dosyaya kaydet" deyin.':
    '{kayip} En su lugar viene una escuela de ejemplo con 25 profesores, 20 clases, 8 aulas y 99 asignaturas. Los demás planes no se tocan. No se puede deshacer; elija antes "Guardar en archivo".',
  '25 öğretmen, 20 sınıf, 8 derslik ve 99 ders. Aracın ne yaptığını görmek için; kendi verinizi girmeye başlamadan önce Ayarlar → Hakkında → "Her şeyi sil" ile temizleyin.':
    '25 profesores, 20 clases, 8 aulas y 99 asignaturas. Para ver qué hace la herramienta; antes de introducir sus propios datos, límpielos con Ajustes → Acerca de → "Borrar todo".',
  "Yerine koy": "Sustituir",
  Yükle: "Cargar",
  "Örnek veri yüklendi.": "Datos de ejemplo cargados.",

  // src/constraints.ts
  "Ders bulunamadı": "No se ha encontrado la clase",
  "Ders eksik tanımlı": "La clase está definida de forma incompleta",
  "Geçersiz hücre": "Celda no válida",
  "Bu saat günün dışında": "Esta hora está fuera del día",
  "{boy} saatlik blok güne sığmıyor":
    "Un bloque de {boy} horas no cabe en el día",
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
  "{kim} {gun} günü en fazla {sinir} saat girmeli, burada {olan} saat olur":
    "{kim} puede dar como máximo {sinir} horas el {gun}; aquí serían {olan}",
  "{sinif} sınıfı {gun} günü {kim} dersinden en fazla {sinir} saat görmeli, burada {olan} saat olur":
    "la clase {sinif} puede tener como máximo {sinir} horas de {kim} el {gun}; aquí serían {olan}",
  "{ders} dersi havuza dönecek": "la clase {ders} volverá a la bandeja",
  "{dersler} dersleri havuza dönecek":
    "las clases {dersler} volverán a la bandeja",
  "{gun} {saat} saatinde": "el {gun} a la hora {saat}",
  "{kim} {ne_zaman} müsait değil": "{kim} no está disponible {ne_zaman}",
  "{sinif} sınıfı {ne_zaman} kapalı":
    "la clase {sinif} está cerrada {ne_zaman}",
  "{derslik} dersliği {ne_zaman} kapalı":
    "el aula {derslik} está cerrada {ne_zaman}",

  // src/drag.ts
  "Bu hücreye bırakılamaz": "No se puede soltar en esta celda",

  // src/entities.ts
  "Bu derslik silinecek": "Se borrará esta aula",
  "{ad} dersliği silinecek": "Se borrará el aula {ad}",
  "{n} sınıfın dersliği boşalacak ({hangileri}) ve derslik çakışması artık kontrol edilmeyecek.":
    "{n} {n:clase se quedará|clases se quedarán} sin aula ({hangileri}) y ya no se comprobarán los conflictos de aula.",
  "Bu ders silinecek": "Se borrará esta clase",
  "{sinif} sınıfının {kim} dersi": "la clase de {kim} del grupo {sinif}",
  "{ne} silinecek ({n} saat)": "Se borrará {ne} ({n} {n:hora|horas})",
  "{ne} silinecek": "Se borrará {ne}",
  "Programa yerleşmiş {n} saati de kalkacak.":
    "También se irán las {n} {n:hora ya colocada|horas ya colocadas}.",
  "Bu öğretmen": "Este profesor",
  "Bu sınıf": "Esta clase",
  "{n} dersi de gidecek.":
    "También {n:se irá su|se irán sus} {n} {n:clase|clases}.",
  "{ders} dersi ve programa yerleşmiş {saat} saati de gidecek.":
    "También se {ders:irá|irán} {ders} {ders:clase|clases} y las {saat} {saat:hora ya colocada|horas ya colocadas}.",
  "Haftalık ders yükü": "Carga semanal de clases",
  "{n} saat": "{n} {n:hora|horas}",
  "Açık saat": "Horas abiertas",
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
  "{n} saati yerleşmemiş ve koyacak yer yok. Örnek sebep: {sebep}":
    "{n} {n:hora sin colocar|horas sin colocar} y sin sitio donde ponerlas. Un motivo de ejemplo: {sebep}",
  "{n} kural ihlali": "{n} {n:regla incumplida|reglas incumplidas}",
  "{n} ders kapalı saatte": "{n} {n:clase|clases} en hora cerrada",
  "{n} ders sığmıyor": "{n} {n:clase no cabe|clases no caben}",
  "{n} saat havuzda": "{n} {n:hora|horas} en la bandeja",
  "Henüz ders girilmedi": "Todavía no se han introducido clases",
  "{ders} haftada {n} kez konacak ama yalnızca {gun} gün var; en az bir günde iki kez görülecek.":
    "{ders} debe colocarse {n} veces a la semana pero solo hay {gun} días; caerá dos veces en al menos un día.",
  "{kim} yalnızca {acik} günde müsait ama bir dersi haftada {n} kez konacak; bir güne iki kez düşebilir.":
    "{kim} solo está disponible {acik} días pero una clase debe colocarse {n} veces a la semana; puede caer dos veces en un día.",
  "{ders} {n} ayrı bloğa bölünmüş ve hiç tekli saat bırakmıyor; çözücünün deneyebileceği tek şekil bu.":
    "{ders} está dividida en {n} bloques separados sin dejar ninguna hora suelta; es la única forma que puede intentar el solucionador.",

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
  "Uygulama (.exe)": "Aplicación (.exe)",
  "Dosya (çift tıklanan .html)": "Archivo (.html abierto con doble clic)",
  "Windows kurulumu": "Instalación de Windows",
  Site: "Sitio",
  "plan listesi": "la lista de planes",
  "bir önceki oturum": "la sesión anterior",
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
  "örnek veri satırı görüldü mü": "si se ha visto la línea de datos de ejemplo",
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
  "Öğretmenin gelemeyeceği saatlere tıklayın.":
    "Pulse las horas a las que el profesor no puede venir.",
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
  "Planlar ve yedek": "Planes y copia",
  "Hücre en büyük, kartın alt satırı tam boyda":
    "Celda más grande, la línea inferior de la tarjeta a tamaño completo",
  "Hücre geniş, ders saatleri görünür": "Celda ancha, horas de clase visibles",
  "Haftanın tamamı ekrana sığar, ders saatleri gizlenir":
    "Toda la semana cabe en la pantalla, las horas de clase se ocultan",
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
  Uyar: "Avisar",
  Engelle: "Bloquear",
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
  "Kurs adı": "Nombre de la escuela",
  "Başlığın altındaki satırda okulun adı":
    "El nombre de la escuela en la línea bajo el encabezado",
  "Derslik ve branş": "Aula y asignatura",
  "Aynı satırda dersliğin harfi ya da öğretmenin branşı":
    "En la misma línea, la letra del aula o la asignatura del profesor",
  "Sütun başlığında 08:30–09:10": "08:30–09:10 en el encabezado de la columna",
  "Hücrenin alt satırı": "La línea inferior de la celda",
  "Öğretmen kısaltması ya da derslik": "La abreviatura del profesor o el aula",
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
  "Başka hocaya aktar…": "Pasar a otro profesor…",
  "{ne} dersi {kim} öğretmenine geçecek": "La clase de {ne} pasará a {kim}",
  "Bu ders henüz programa yerleşmemiş, yani kaybolacak bir şey yok.":
    "Esta clase aún no está en el horario, así que no hay nada que perder.",
  "Programdaki {n} bloğu yeni öğretmenin haftasına göre yeniden denenecek; sığmayanlar havuza döner.":
    "Sus {n} bloques colocados se volverán a probar con la semana del nuevo profesor; los que no quepan vuelven a la bandeja.",
  Aktar: "Pasar",
  "{ne} dersi {kim} öğretmenine geçti.": "La clase de {ne} pasó a {kim}.",
  "{ne} dersi {kim} öğretmenine geçti. {n} blok havuza döndü.":
    "La clase de {ne} pasó a {kim}. {n} bloques volvieron a la bandeja.",
  "Azalan sıralı. Artana çevirmek için tıklayın":
    "Orden descendente. Haga clic para ascendente",
  "Artan sıralı. Azalana çevirmek için tıklayın":
    "Orden ascendente. Haga clic para descendente",
  "Sürükleyerek ya da ok tuşlarıyla sırala":
    "Arrastre o use las flechas para reordenar",
  "Çözülmesi gereken satırlar": "Filas por resolver",
  "Danışman ({n})": "Asesor ({n})",
  "Öneri yok": "Sin notas",
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
  " {n} blok geçici kapsam dışında kaldı.":
    " {n} {n:bloque quedó|bloques quedaron} fuera del alcance.",
  " · {n} blok geçici kapsam dışında":
    " · {n} {n:bloque|bloques} fuera del alcance",
  "{gun} geçici olarak kapsam dışında":
    "{gun} está temporalmente fuera del alcance",
  "Program seç ve yönet": "Elegir y gestionar un horario",
  "Kopyasını kaydet": "Guardar una copia",
  "Boş program oluştur": "Crear un horario vacío",
  "Yeniden adlandır": "Cambiar el nombre",
  "Programı sil": "Borrar el horario",
  "Program adı": "Nombre del horario",
  "Aynı okul verilerini kullanan alternatif program için bir ad yazın.":
    "Escriba un nombre para el horario alternativo que usa los mismos datos.",
  "Program adı boş olamaz": "El horario necesita un nombre",
  "Bu program adı zaten kullanılıyor": "Ese nombre de horario ya está en uso",
  Kaydet: "Guardar",
  "{ad} programı silinecek": "Se borrará el horario {ad}",
  "{n} yerleşmiş saat ve {s} sabitleme silinecek. Ortak okul verileri kalır.":
    "Se irán {n} {n:hora colocada|horas colocadas} y {s} {s:fijación|fijaciones}. Los datos del centro se mantienen.",
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
  "Izgara işlemleri": "Acciones sobre la cuadrícula",
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
  "{n} blok havuza döner, {s} sabitleme kalkar. Ctrl+Z ile geri alınabilir.":
    "{n} {n:bloque vuelve|bloques vuelven} a la bandeja y se {s:suelta|sueltan} {s} {s:fijación|fijaciones}. Ctrl+Z lo deshace.",
  "Ders {ad} sınıfına taşındı.": "La clase se movió a {ad}.",
  "Ders {ad} sınıfına taşındı. {n} blok havuza döndü.":
    "La clase se movió a {ad}. {n} {n:bloque volvió|bloques volvieron} a la bandeja.",
  "Ders {kim} öğretmenine geçsin mi?": "¿Pasar la clase a {kim}?",
  "Yerleşmiş saatler olduğu gibi kalır. Ctrl+Z ile geri alınabilir.":
    "Las horas colocadas se quedan donde están. Ctrl+Z lo deshace.",
  "{n} blok havuza döner. Ctrl+Z ile geri alınabilir.":
    "{n} {n:bloque vuelve|bloques vuelven} a la bandeja. Ctrl+Z lo deshace.",
  "Ders {kim} öğretmenine geçti.": "La clase pasó a {kim}.",
  "Ders {kim} öğretmenine geçti. {n} blok havuza döndü.":
    "La clase pasó a {kim}. {n} {n:bloque volvió|bloques volvieron} a la bandeja.",
  "**Dersler** sekmesinde ders silinebilir, yeni ders eklenebilir.":
    "En la pestaña **Clases** se pueden borrar y añadir clases.",
  "Art arda en fazla": "Máximo seguidas",
  "Geldiği gün en az": "Mínimo el día que viene",
  "Günde aynı dersten en fazla": "Máximo de la misma clase al día",
  "Havuz sıralaması": "Orden de la bandeja",
  "Havuz süzgeci": "Filtro de la bandeja",
  "Izgara sırası": "Orden de la cuadrícula",
  "Uzun bloklar önce": "Bloques largos primero",
  "En çok kalan": "Lo que más queda",
  "{n} saatlik bloklar": "Bloques de {n} horas",
  "{n} saat kaldı": "quedan {n} {n:hora|horas}",
  "{n} blok süzgeç dışında · sürükleyip bırakın":
    "{n} {n:bloque|bloques} más tras el filtro · arrastre y suelte",
  Göster: "Mostrar",
  Saatler: "Horas",
  Satır: "Fila",
  "Ders numaralarının altına başlangıç saatlerini yaz":
    "Escribir la hora de inicio bajo cada número de clase",
  "Haftanın darlığı tablosunu göster ya da gizle":
    "Mostrar u ocultar la tabla de las horas más ajustadas",
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
  "**Açık olan plan** tamamen silinir ve **geri alınamaz**; önce **Dosyaya kaydet** deyin.":
    "**El plan abierto** se borra y **no se puede deshacer**; use antes **Guardar en archivo**.",
  "**Bu kopya kendini güncellemez** ve hiçbir yere bağlanmaz. En son sürüm şuradadır:":
    "**Esta copia nunca se actualiza** y no se conecta a ningún sitio. La última versión:",
  "**Bütün planlar** kendiliğinden Belgelerim'e yazılıyor; son {gun} günün yedeği durur.":
    "**Todos los planes** se escriben solos en Documentos; se guardan los últimos {gun} días.",
  "**Ferah.** Hücre en büyük; en kolay okunan, en çok kaydırılan.":
    "**Amplio.** La celda más grande: la más legible, la que más se desplaza.",
  "**Rahat.** Hücre geniş ve saatler yazılı; hafta sığmadığı için sağa kaydırırsınız.":
    "**Cómodo.** Celdas anchas con las horas; la semana no cabe, así que se desplaza.",
  "**Sığdır.** Haftanın tamamı bir ekranda, ve bunun bedeli **saatlerin gizlenmesi**.":
    "**Ajustar.** Toda la semana en una pantalla, a costa de **ocultar las horas**.",
  "**Sığdır.** Satır aralığı daralır; kısılan şey boşluk, **yazı boyutu değil**.":
    "**Ajustar.** Las filas se aprietan; se recorta el espacio, **no el tamaño de letra**.",
  "**Tarayıcınız klasöre yazmayı desteklemiyor.** Chrome ve Edge destekliyor.":
    "**Su navegador no puede escribir en una carpeta.** Chrome y Edge sí pueden.",
  "**Uyar** yalnız sayar, **Engelle** dersi o hücreye hiç bıraktırmaz.":
    "**Avisar** solo cuenta; **Bloquear** impide del todo soltar la clase ahí.",
  "**Yük**, **Açık**'ı geçerse o sınıfın haftası tutmaz.":
    "Si **Carga** supera **Abierto**, la semana de ese grupo no cuadra.",
  "Arayüzün dili. Bu bilgisayara aittir, yedek dosyasına girmez.":
    "El idioma de la interfaz. Pertenece a este ordenador, no al archivo de copia.",
  "Aynı dersliği paylaşan sınıfların **toplam** ders saati de haftaya sığmalı.":
    "Las horas **totales** de los grupos que comparten aula también deben caber en la semana.",
  "Aynı programı paylaşan öğrenci grubu; **derslik** sınıfın sabit odasıdır.":
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
  "Bir şey belirirken görülen kısa hareketler; kapatmak programın işini değiştirmez.":
    "Los movimientos breves al aparecer algo; apagarlos no cambia nada más.",
  "Branş **listeden seçilir**; kısaltma ızgarada satır başlığı olur.":
    "La materia se **elige de la lista**; la abreviatura encabeza la fila.",
  "Bu bilgisayara aittir ve **yazdırmayı etkilemez**; kâğıdın yazısı **Çıktı** sekmesinde.":
    "Pertenece a este ordenador y **no afecta a la impresión**; la letra del papel, en **Salida**.",
  "Bu depo yalnız {adres} adresine ait; öteki kopyaların depoları **ayrıdır**.":
    "Este almacén pertenece solo a {adres}; las otras copias tienen almacenes **aparte**.",
  "Bu dersler konduktan **sonra** o saatler kapatıldı; hiçbiri silinmedi.":
    "Esas horas se cerraron **después** de colocar estas clases; no se borró ninguna.",
  "Bu derslerin yerleşmemiş saatleri var ama koyulacak boş hücre kalmamış.":
    "A estas clases les faltan horas por colocar, pero no queda ninguna celda libre.",
  "Bu kopya kendini güncelleyebilir ama **düğmeye basmadıkça** hiçbir yere bağlanmaz.":
    "Esta copia puede actualizarse, pero no se conecta **hasta que pulse el botón**.",
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
  "Derslik yerleştirirken seçilmez ve aynı dersliği paylaşan iki sınıf aynı saate konamaz. Renk otomatik atanır, kimseyle çakışmaz; satır başındaki nokta ile basılan sayfanın başlığında görünür.":
    "El aula no se elige al colocar, y dos grupos que la comparten no pueden ocupar la misma hora. El color se asigna solo, no choca con nadie y aparece como el punto al inicio de la fila y en el título de la hoja impresa.",
  "Dersliği olmayan sınıflar için bu kontrol yapılmaz.":
    "Los grupos sin aula no pasan por esta comprobación.",
  "Ekranın **geri kalanı**: listeler, paneller, kutular. Program ızgarasına dokunmaz.":
    "El **resto** de la pantalla: listas, paneles, cajas. No toca la rejilla.",
  "Gün kaçta başlıyor, ders ve teneffüs kaç dakika. Saatler bunlardan hesaplanır.":
    "A qué hora empieza el día y cuánto duran clase y recreo. Las horas salen de ahí.",
  "Hazır bir okul: 25 öğretmen, 20 sınıf, 99 ders. **Açık olan planın yerine geçer.**":
    "Una escuela lista: 25 profesores, 20 grupos, 99 clases. **Sustituye al plan abierto.**",
  "Her plan **ayrı bir programdır**; üst çubuktaki listeden aralarında geçilir.":
    "Cada plan es **un horario propio**; la lista superior cambia entre ellos.",
  "Her sınıf okul sayısını kullanıyor. Bir sınıfa özel sayı: **Okul → Sınıflar**.":
    "Cada grupo usa el número de la escuela. Para uno solo: **Escuela → Grupos**.",
  "Her sınıfın sabit odası; aynı dersliği paylaşan iki sınıf aynı saate konamaz.":
    "El aula fija de cada grupo; dos grupos que la comparten no pueden coincidir.",
  "Herkes okul sınırlarını kullanıyor. Bir öğretmene özel sayı: **Okul → Öğretmenler**.":
    "Todos usan los límites de la escuela. Para un profesor: **Escuela → Profesores**.",
  "Kapalı saatler taralı; değiştirmek için **Müsaitlik** sekmesine gidin.":
    "Las horas cerradas van rayadas; se cambian en **Disponibilidad**.",
  "Okulun listesinde **bulunmayan** hazır branşlar; eklemek için tıklayın.":
    "Materias incorporadas que **no** están en la lista de la escuela; pulse para añadir.",
  "Program **kendiliğinden** saklıyor; **Dosyaya kaydet** onun yanına gelir, yerine değil.":
    "El programa guarda **solo**; **Guardar en archivo** va al lado, no en su lugar.",
  "Program, **Ayarlar → Kurallar**'da girdiğiniz sınırları aşıyor.":
    "El horario supera los límites fijados en **Ajustes → Reglas**.",
  "Renk kimliktir: ızgaradaki satırı havuzdaki kartıyla eşleştiren şey budur.":
    "El color es identidad: enlaza la fila de la rejilla con su tarjeta en la bandeja.",
  "Sekmelerin altındaki bar, sayfayı **aşağı kaydırırken kendiliğinden gizlenir**.":
    "La barra bajo las pestañas **se oculta sola al bajar** por la página.",
  "Silmelerden sonra renkler delik bıraktı; yeniden dağıtmak yalnızca onları sıraya dizer.":
    "Los borrados dejaron huecos en los colores; repartirlos solo los reordena.",
  "Soldaki saatten ve üç süreden hesaplanır; her öğle arası deseni kendi sütununda.":
    "Se calcula de la hora de inicio y tres duraciones; cada patrón tiene su columna.",
  "Son üç oturumun durumu ayrı tutulur; **bu bilgisayara** ve açılıştaki plana aittir.":
    "Las tres últimas sesiones se guardan aparte; son de **este ordenador** y del plan de inicio.",
  "Sınıf başına **{yer}** saat var ({gun} gün × {ders} ders); girilen yük **{yuk}** saat.":
    "**{yer}** horas por grupo ({gun} días × {ders} clases); la carga introducida es **{yuk}**.",
  "Sırayla: **derslikler**, **branşlar**, **öğretmenler**, **sınıflar**, sonra **dersler**.":
    "Por orden: **aulas**, **materias**, **profesores**, **grupos**, luego **clases**.",
  "Tarayıcının bu site için ayırdığı depoda duruyor.":
    "Está en el almacén que el navegador reserva para este sitio.",
  "Toplam **{yer}**; tarayıcının bu programa ayırdığı yer yaklaşık **5 MB**.":
    "**{yer}** en total; el navegador reserva a este programa unos **5 MB**.",
  "Yalnız **Program** ızgarasını etkiler: hücrenin büyüklüğü ve ekrana sığan gün sayısı.":
    "Solo afecta a la rejilla de **Horario**: tamaño de celda y días visibles.",
  "Yazdırma penceresinde **arka plan grafikleri: açık** olsun, yoksa renkler çıkmaz.":
    "En el diálogo de impresión active **gráficos de fondo**, o no saldrán los colores.",
  "Yeni plan açılınca ona geçilir ve **geri al** geçmişi sıfırlanır.":
    "El plan nuevo se abre enseguida y el historial de **deshacer** se vacía.",
  "Yeni sürüm çıkınca üstte bir satır belirir; **Yenile** demedikçe hiçbir şey değişmez.":
    "Al salir una versión aparece una línea arriba; nada cambia hasta pulsar **Recargar**.",
  "Yukarıdakiler **localStorage**'da; seçtiğiniz klasörün tutamağı ayrıca **IndexedDB**'de.":
    "Lo anterior está en **localStorage**; el manejador de la carpeta, en **IndexedDB**.",
  "{ad} temaya geç": "Cambiar al tema {ad}",
  "{dosya} **bütün planlarınızdır**; yanındakiler onun gün gün duran hâlleri.":
    "{dosya} son **todos sus planes**; los archivos al lado son sus copias diarias.",
  "{n} engelle": "{n} bloquean",
  "{n} gün": "{n} {n:día|días}",
  "{n} kapalı": "{n} apagadas",
  "{n} uyar": "{n} avisan",
  "Öğretmen eklerken branş **bu listeden** seçilir, elle yazılmaz.":
    "Al añadir un profesor la materia se elige **de esta lista**, no se escribe.",
  "Öğretmenin müsait saati, ona yüklenen ders saatinden az olamaz.":
    "Las horas disponibles de un profesor no pueden ser menos que su carga.",
  "Üst çubuktaki **Dosyaya kaydet** açık planı yazar; buradaki dosya **bütün planları**.":
    "**Guardar en archivo** arriba escribe el plan abierto; este archivo, **todos**.",
  "İçindekiler: her planın derslikleri, öğretmenleri, sınıfları, dersleri, dizilmiş programı, adı ve taslak işareti. Tema gibi bu bilgisayara ait tercihler ve oturum yedekleri girmez.":
    "Contenido: aulas, profesores, grupos, clases, horario colocado, nombre y marca de borrador de cada plan. No entran las preferencias de este ordenador, como el tema, ni las copias de sesión.",
  "İşareti kaldırılan şey kâğıda basılmaz.":
    "Lo que se desmarca no se imprime.",
};

registerSozluk("es", ES);

export default ES;
