# Ders Programı — kurulum.
#
# Bu betik programı bilgisayarınıza kopyalar ve masaüstünüze bir kısayol
# koyar. Yönetici hakkı istemez, kayıt defterine (registry) dokunmaz,
# internete çıkmaz. Kaldırmak isterseniz: kısayolları ve
# %LOCALAPPDATA%\Ders Programı klasörünü silmeniz yeter.
#
# ---------------------------------------------------------------------------
# Kur.cmd calls this; the .cmd is two ASCII lines because cmd.exe's code page
# mangles Turkish and every sentence my father reads is printed from here.
#
# It copies into %LOCALAPPDATA% rather than running from where the zip was
# unpacked, so deleting the Downloads folder cannot take the program with it.
# It writes NOTHING outside that folder and the two shortcuts.

param([switch]$Guncelle, [switch]$Internetten)

$ErrorActionPreference = 'Stop'
try { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8 } catch { }

$Kaynak = $PSScriptRoot
$Hedef  = Join-Path $env:LOCALAPPDATA 'Ders Programı'
$Ad     = 'Ders Programı'
$Adres  = 'https://github.com/AlparslanSemiz/ders-programi/releases/latest/download/Ders-Programi-Windows-kurulum.zip'

function Yaz { param([string]$Metin, [string]$Renk = 'Gray') Write-Host $Metin -ForegroundColor $Renk }

Yaz ''
Yaz "  $Ad — $(if ($Guncelle) { 'güncelleme' } else { 'kurulum' })" 'Cyan'
Yaz ''

# ------------------------------------------------------------- yeni sürümü al
#
# Guncelle.cmd geldiğinde en yeni sürüm İNTERNETTEN alınır, çünkü öteki türlü
# güncellemek "önce bir ZIP indir, sonra çıkar, sonra oradan çalıştır" demekti
# ve bu, hiç güncellememekle aynı şeydir.
#
# İnternet YOKSA bu bir hata değil: yanındaki klasör zaten bir kurulum
# paketidir ve o kurulur. İlke 3 programın kendisi hakkındadır — çalışan sayfa
# hiçbir yere bağlanmaz; bir güncelleme betiği bağlanır, çünkü işi budur.
$Gecici = ''
if ($Internetten) {
  Yaz '  En yeni sürüm indiriliyor…'
  $gecici = Join-Path ([System.IO.Path]::GetTempPath()) ("ders-programi-" + [guid]::NewGuid().ToString('N'))
  try {
    New-Item -ItemType Directory -Path $gecici -Force | Out-Null
    $zip = Join-Path $gecici 'paket.zip'
    # TLS 1.2 elle açılır: PowerShell 5.1 varsayılanı hâlâ eski protokoller ve
    # GitHub onları kabul etmiyor — indirme sebepsiz yere "bağlanılamadı" der.
    try { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 } catch { }
    $eski = $ProgressPreference; $ProgressPreference = 'SilentlyContinue'
    Invoke-WebRequest -Uri $Adres -OutFile $zip -UseBasicParsing
    $ProgressPreference = $eski
    Expand-Archive -LiteralPath $zip -DestinationPath $gecici -Force
    if (Test-Path -LiteralPath (Join-Path $gecici 'site\index.html')) {
      $Kaynak = $gecici
      $Gecici = $gecici
      Yaz ("  İndirildi ({0:N0} KB)." -f [math]::Round((Get-Item -LiteralPath $zip).Length / 1KB)) 'Green'
    } else {
      Yaz '  İnen dosya beklenen kurulum paketi değil; yanındaki klasörden devam ediliyor.' 'Yellow'
    }
  } catch {
    Yaz '  İnternete bağlanılamadı, en yeni sürüm alınamadı.' 'Yellow'
    Yaz '  Yanındaki klasörde duran sürümle devam ediliyor.'
  }
  Yaz ''
}

# Kurulum paketi eksikse hiçbir şeye dokunma: yarım bir kurulum, hiç
# kurulmamış olmaktan kötüdür.
$SiteKaynak = Join-Path $Kaynak 'site'
if (-not (Test-Path -LiteralPath (Join-Path $SiteKaynak 'index.html'))) {
  # Two ways to land here, and telling them apart is the point: the
  # repository's own kurulum/ folder is a SOURCE and looks exactly like the
  # package minus site/. Sending that reader after a ZIP they never
  # downloaded is worse than saying nothing.
  $depo = ((Split-Path -Leaf $Kaynak) -eq 'kurulum') -and
          (Test-Path -LiteralPath (Join-Path (Split-Path -Parent $Kaynak) 'package.json'))

  Yaz '  Bu klasörde "site" klasörü bulunamadı.' 'Red'
  Yaz ''
  if ($depo) {
    Yaz '  Bu klasör kurulumun KAYNAĞI, kurulumun kendisi değil.'
    Yaz '  Önce paketi üretin, sonra paketin içinden çalıştırın:'
    Yaz ''
    Yaz '      npm run paket'
    Yaz '      dist-kurulum\Kur.cmd'
  } else {
    Yaz '  İndirdiğiniz ZIP dosyasını AÇMADAN çalıştırmış olabilirsiniz.'
    Yaz '  ZIP''i bir klasöre çıkarın, sonra Kur.cmd''yi oradan çalıştırın.'
  }
  Yaz ''
  Read-Host '  Kapatmak için Enter'
  exit 1
}

if ($Guncelle -and -not (Test-Path -LiteralPath $Hedef)) {
  Yaz '  Program bu bilgisayarda kurulu değil. Önce Kur.cmd çalıştırın.' 'Yellow'
  Yaz ''
  Read-Host '  Kapatmak için Enter'
  exit 1
}

# ------------------------------------------------------------------ kopyalama
New-Item -ItemType Directory -Path $Hedef -Force | Out-Null

# Eski "site" silinip yeniden yazılıyor: üstüne kopyalamak, bir sonraki
# sürümde KALDIRILAN bir dosyayı orada bırakır ve service worker onu
# önbelleğinde tutmaya devam eder.
$SiteHedef = Join-Path $Hedef 'site'
if (Test-Path -LiteralPath $SiteHedef) { Remove-Item -LiteralPath $SiteHedef -Recurse -Force }
Copy-Item -LiteralPath $SiteKaynak -Destination $SiteHedef -Recurse -Force

foreach ($dosya in @('sunucu.ps1', 'icon.ico', 'OKU.txt')) {
  $yol = Join-Path $Kaynak $dosya
  if (Test-Path -LiteralPath $yol) { Copy-Item -LiteralPath $yol -Destination $Hedef -Force }
}

$boyut = (Get-ChildItem -LiteralPath $Hedef -Recurse -File | Measure-Object -Property Length -Sum).Sum
Yaz ("  Kopyalandı: {0}  ({1:N0} KB)" -f $Hedef, [math]::Round($boyut / 1KB))

# ------------------------------------------------------------------ kısayollar
# Güncellemede kısayol YARATILMAZ: babam onları taşımış, yeniden adlandırmış
# ya da silmiş olabilir ve bir güncelleme o kararı geri almamalı.
#
# Ama DURAN bir kısayol tazelenir, ve bunun sebebi bir kusurdu: Guncelle.cmd
# yeni icon.ico'yu kopyalıyordu, kısayolun IconLocation'ına hiç dokunmuyordu,
# ve Windows ikonu yol+indeks üstünden önbelleğe aldığı için görev çubuğunda
# ESKİ işaret durmaya devam ediyordu. Yani düzeltilmiş bir ikon, düzeltilmiş
# olduğu hâlde görünmüyordu — bir kusur bildirilip düzeltildiğinde ikisinin de
# göremediği şeyin ta kendisi. Kısayolu yeniden yazmak dosyanın kendisini
# değiştirir, Explorer da onu yeniden okur.
$ps     = Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0\powershell.exe'
$sunucu = Join-Path $Hedef 'sunucu.ps1'
$ikon   = Join-Path $Hedef 'icon.ico'

# Pencere GİZLENMİYOR. Sunucu bu pencerede yaşıyor ve programı kapatmanın
# tek yolu onu kapatmak; gizli bir pencere, kapatılamayan bir program
# demektir. sunucu.ps1 pencerede bunu zaten yazıyor.
$arg = '-NoProfile -ExecutionPolicy Bypass -File "{0}"' -f $sunucu

$kabuk = New-Object -ComObject WScript.Shell
$hedefler = @(
  (Join-Path ([Environment]::GetFolderPath('Desktop')) "$Ad.lnk"),
  (Join-Path ([Environment]::GetFolderPath('Programs')) "$Ad.lnk")
)
foreach ($lnk in $hedefler) {
  $vardi = Test-Path -LiteralPath $lnk
  if ($Guncelle -and -not $vardi) { continue }

  $k = $kabuk.CreateShortcut($lnk)
  $k.TargetPath       = $ps
  $k.Arguments        = $arg
  $k.WorkingDirectory = $Hedef
  $k.IconLocation     = "$ikon,0"
  $k.Description      = 'Haftalık ders programı dizme aracı'
  $k.Save()
  if ($Guncelle) { Yaz "  Kısayol tazelendi: $lnk" } else { Yaz "  Kısayol: $lnk" }
}

# İndirilen paket kopyalandı; Temp'te bırakmanın bir sebebi yok.
if ($Gecici -ne '' -and (Test-Path -LiteralPath $Gecici)) {
  try { Remove-Item -LiteralPath $Gecici -Recurse -Force } catch { }
}

Yaz ''
Yaz '  Bitti.' 'Green'
Yaz ''
Yaz '  Programı açmak için masaüstündeki "Ders Programı" kısayoluna çift tıklayın.'
Yaz '  Açılan siyah pencereyi KAPATMAYIN — program orada çalışıyor.'
Yaz ''
Yaz '  Verileriniz bu bilgisayarda, tarayıcınızın deposunda durur. Ayarlar →'
Yaz '  Veri bölümünden bir klasör seçerseniz program her değişikliği oraya da'
Yaz '  yazar.'
Yaz ''

$cevap = Read-Host '  Şimdi açılsın mı? (E/H)'
if ($cevap -match '^(e|E|y|Y)') {
  Start-Process -FilePath (Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0\powershell.exe') `
                -ArgumentList ('-NoProfile -ExecutionPolicy Bypass -File "{0}"' -f (Join-Path $Hedef 'sunucu.ps1'))
}
