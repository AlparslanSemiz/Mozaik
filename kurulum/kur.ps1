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

param([switch]$Guncelle)

$ErrorActionPreference = 'Stop'
try { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8 } catch { }

$Kaynak = $PSScriptRoot
$Hedef  = Join-Path $env:LOCALAPPDATA 'Ders Programı'
$Ad     = 'Ders Programı'

function Yaz { param([string]$Metin, [string]$Renk = 'Gray') Write-Host $Metin -ForegroundColor $Renk }

Yaz ''
Yaz "  $Ad — $(if ($Guncelle) { 'güncelleme' } else { 'kurulum' })" 'Cyan'
Yaz ''

# Kurulum paketi eksikse hiçbir şeye dokunma: yarım bir kurulum, hiç
# kurulmamış olmaktan kötüdür.
$SiteKaynak = Join-Path $Kaynak 'site'
if (-not (Test-Path -LiteralPath (Join-Path $SiteKaynak 'index.html'))) {
  Yaz '  Bu klasörde "site" klasörü bulunamadı.' 'Red'
  Yaz '  İndirdiğiniz ZIP dosyasını AÇMADAN çalıştırmış olabilirsiniz.'
  Yaz '  ZIP''i bir klasöre çıkarın, sonra Kur.cmd''yi oradan çalıştırın.'
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
# Güncellemede kısayollara DOKUNULMAZ: babam onları taşımış ya da
# yeniden adlandırmış olabilir ve bir güncelleme onu geri almamalı.
if (-not $Guncelle) {
  $ps    = Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0\powershell.exe'
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
    $k = $kabuk.CreateShortcut($lnk)
    $k.TargetPath       = $ps
    $k.Arguments        = $arg
    $k.WorkingDirectory = $Hedef
    $k.IconLocation     = "$ikon,0"
    $k.Description      = 'Haftalık ders programı dizme aracı'
    $k.Save()
    Yaz "  Kısayol: $lnk"
  }
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
