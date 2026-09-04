# aSc'nin her ekranını gezer -> docs/asc/ekran/*.png
#
# `asc-ekran.ps1` bir kare yakalar; bu dosya NEREYE bakılacağını bilir.
#
# Coordinates, not accessibility: UI Automation reports zero controls for aSc
# (it is a custom-drawn MFC app), so there is nothing to query and nothing to
# click by name. Every number below was MEASURED off a capture at 2560x1440
# with the window maximised, whose rect starts at (-8,-8) -- so screen = image
# minus 8. If the screen size changes these have to be re-measured, and the
# giveaway is captures that are all the same MD5.
#
# Keyboard was tried first and half worked: Alt raises the keytips, but the
# accelerators collide (Ana Menü and Arayüz Ayarları both want A) and three
# tabs never switched. Clicking the tab strip is what actually moved.
#
#   .\scripts\asc-tur.ps1                  # tam tur
#   .\scripts\asc-tur.ps1 -Sadece serit    # yalnız şerit sekmeleri
#   .\scripts\asc-tur.ps1 -Sadece diyalog  # yalnız veri pencereleri

[CmdletBinding()]
param(
  [ValidateSet('hepsi', 'serit', 'diyalog', 'derin')]
  [string]$Sadece = 'hepsi',
  [string]$Demo = 'Demo1'
)

$ErrorActionPreference = 'Stop'
$kok = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$ekranBetik = Join-Path $PSScriptRoot 'asc-ekran.ps1'

Add-Type -AssemblyName System.Windows.Forms
Add-Type @'
using System;
using System.Runtime.InteropServices;
public class Tur {
  [DllImport("user32.dll")] public static extern bool SetCursorPos(int x, int y);
  [DllImport("user32.dll")] public static extern void mouse_event(uint f, uint x, uint y, uint d, IntPtr e);
}
'@

function Tikla([int]$x, [int]$y) {
  [void][Tur]::SetCursorPos($x, $y)
  Start-Sleep -Milliseconds 250
  [Tur]::mouse_event(0x02, 0, 0, 0, [IntPtr]::Zero)
  Start-Sleep -Milliseconds 70
  [Tur]::mouse_event(0x04, 0, 0, 0, [IntPtr]::Zero)
}

function TiklaSag([int]$x, [int]$y) {
  [void][Tur]::SetCursorPos($x, $y)
  Start-Sleep -Milliseconds 250
  [Tur]::mouse_event(0x08, 0, 0, 0, [IntPtr]::Zero)   # RIGHTDOWN
  Start-Sleep -Milliseconds 70
  [Tur]::mouse_event(0x10, 0, 0, 0, [IntPtr]::Zero)   # RIGHTUP
}

# Ribbon tab strip: y is the same for all, x measured per tab.
$SERIT = @(
  @{ x = 89;  ad = '10-serit-ana-menu' }
  @{ x = 183; ad = '11-serit-dosya-islemleri' }
  @{ x = 297; ad = '12-serit-tanimlama-islemleri' }
  @{ x = 401; ad = '13-serit-gorunum' }
  @{ x = 508; ad = '14-serit-planlama-yerlestirme' }
  @{ x = 630; ad = '15-serit-arayuz-ayarlari' }
  @{ x = 711; ad = '16-serit-yardim' }
)
$SERIT_Y = 36
$TANIMLAMA_X = 297   # the tab every dialog below hangs off

# Buttons on the "Tanımlama İşlemleri" ribbon.
$DIYALOG = @(
  @{ x = 138; y = 82; ad = '20-temel-bilgiler' }
  @{ x = 180; y = 76; ad = '21-branslar' }
  @{ x = 224; y = 76; ad = '22-siniflar' }
  @{ x = 270; y = 76; ad = '23-derslikler' }
  @{ x = 327; y = 76; ad = '24-ogretmenler' }
  @{ x = 399; y = 82; ad = '25-secmeli-dersler' }
  @{ x = 445; y = 82; ad = '26-planlama-iliskileri' }
  @{ x = 524; y = 82; ad = '27-kisitlama-listesi' }
)

# Inside a list dialog: the right-hand button column and the first rows.
$YENI = @{ x = 1548; y = 493 }
$KISITLAMALAR = @{ x = 1548; y = 695 }
$ILK_SATIR = @{ x = 1088; y = 704 }


# Deep inventory (TASKS R2). Every path below was found the only way aSc
# allows: capture the screen, LOOK at it, and measure the next click off the
# image. UI Automation reports zero controls here, so there is nothing to
# query and nothing to click by name.
#
# yol = left-click sequence in SCREEN coordinates; sag = a final right click.
# Ribbon tabs, all at y=36:  183 Dosya | 297 Tanimlama | 401 Gorunum
#                            508 Planlama | 630 Arayuz
$DERIN = @(
  @{ ad = '40-gorunum-tanimla';           yol = @(@(401,36), @(185,82)) }
  @{ ad = '41-gorunum-sinif-tanim';       yol = @(@(401,36), @(185,82), @(1369,633)) }
  @{ ad = '42-kart-yazisi-secenekler';    yol = @(@(401,36), @(185,82), @(1369,633), @(1258,642)) }
  @{ ad = '43-kart-rengi-secenekler';     yol = @(@(401,36), @(185,82), @(1369,633), @(1482,642)) }
  @{ ad = '44-yakinlastir';               yol = @(@(401,36), @(251,82)) }
  @{ ad = '45-hafta';                     yol = @(@(401,36), @(302,82)) }
  @{ ad = '46-ders-programi-ile-ilgili';  yol = @(@(401,36), @(427,89)) }
  @{ ad = '47-sekmeleri-goster';          yol = @(@(401,36), @(360,89)) }
  @{ ad = '50-ders-atama';                yol = @(@(297,36), @(180,76), @(1093,506), @(1540,622)) }
  @{ ad = '51-brans-zaman-tablosu';       yol = @(@(297,36), @(180,76), @(1093,506), @(1540,658)) }
  @{ ad = '52-brans-guncelle';            yol = @(@(297,36), @(180,76), @(1093,506), @(1540,519)) }
  @{ ad = '53-ogretmen-guncelle';         yol = @(@(297,36), @(327,76), @(1093,506), @(1540,519)) }
  @{ ad = '54-ogretmen-kisitlamalar';     yol = @(@(297,36), @(327,76), @(1093,506), @(1540,693)) }
  @{ ad = '55-sinif-guncelle';            yol = @(@(297,36), @(224,76), @(1093,506), @(1540,519)) }
  @{ ad = '56-sinif-kisitlamalar';        yol = @(@(297,36), @(224,76), @(1093,506), @(1540,693)) }
  @{ ad = '57-derslik-guncelle';          yol = @(@(297,36), @(270,76), @(1093,506), @(1540,519)) }
  @{ ad = '58-iliski-turleri';            yol = @(@(297,36), @(445,82), @(811,875)) }
  @{ ad = '59-kisit-onem-dereceleri';     yol = @(@(297,36), @(445,82), @(811,875), @(1150,896)) }
  @{ ad = '60-parametreler';              yol = @(@(508,36), @(464,82)) }
  @{ ad = '61-danisman';                  yol = @(@(508,36), @(726,82)) }
  @{ ad = '62-analiz';                    yol = @(@(508,36), @(397,82)) }
  @{ ad = '63-istatistik';                yol = @(@(508,36), @(776,82)) }
  @{ ad = '64-planlama-analizi';          yol = @(@(508,36), @(397,82), @(450,123)) }
  @{ ad = '65-detayli-veri-kontrolu';     yol = @(@(508,36), @(397,82), @(458,189)) }
  # 66 offers to WIPE the timetable. It is captured AT its confirm box and
  # answered Hayir -- never Evet, or every capture after it photographs an
  # empty grid. The box was found by looking at the capture, not by guessing.
  @{ ad = '66-planlama-oncesi-kontrol';   yol = @(@(508,36), @(106,82)); sonra = @(1401,741) }
  @{ ad = '67-planlama-sonrasi-kontrol';  yol = @(@(508,36), @(650,82)) }
  @{ ad = '70-yazdir-menu';               yol = @(@(183,36), @(347,82)) }
  @{ ad = '71-aktar-menu';                yol = @(@(183,36), @(484,82)) }
  @{ ad = '72-karsilastirma-menu';        yol = @(@(183,36), @(540,82)) }
  @{ ad = '73-email-gonder-menu';         yol = @(@(183,36), @(609,82)) }
  @{ ad = '83-yazilimi-ozellestir';       yol = @(@(630,36), @(140,82)) }
  @{ ad = '84-gelismis-ayarlar';          yol = @(@(630,36), @(189,82)) }
  @{ ad = '85-sihirbaz';                  yol = @(@(297,36), @(76,82)) }
  @{ ad = '82-sag-tik-kart';              yol = @(); sag = @(180,352) }
)

# Print preview is a MODE, not a dialog: it swaps in its own ribbon tab and
# ESC does not leave it, so its screens are a separate list entered once.
# Preview ribbon:  402,77 rapor listesi | 496 Genel Ayarlar | 555 Tablo Yapisi
#   625 Ekstra Satir/Sutun | 731 Sayfa Yapisi | 778 Design | 826 Renkler
#   885 On Izlemeyi Kapat
#
# 86 and 88 are the SAME dialog on a one-hour and a two-hour cell: it reports
# "Uzunluk: Tekli" vs "Ikili", because the printed cell format is stored per
# block length. That is the whole reason both are captured.
$BASKI = @(
  @{ ad = '74-baski-onizleme';            yol = @() }
  @{ ad = '75-rapor-listesi';             yol = @(@(402,77)); kapat = $true }
  @{ ad = '77-tablo-yapisi';              yol = @(@(555,82)); kapat = $true }
  @{ ad = '78-rapor-eksen-secenekleri';   yol = @(@(555,82), @(1013,777)); kapat = $true }
  @{ ad = '79-baski-design';              yol = @(@(778,85)); kapat = $true }
  @{ ad = '80-toplu-carsaf-ogretmenler';  yol = @(@(402,77), @(266,321)) }
  @{ ad = '81-genel-program-poster';      yol = @(@(402,77), @(247,404)) }
  @{ ad = '86-baski-hucre-sag-tik';       yol = @(); sag = @(989,339); kapat = $true }
  @{ ad = '87-baski-hucre-yazi';          yol = @(@(1086,610)); sag = @(989,339); kapat = $true }
  @{ ad = '88-baski-hucre-blok';          yol = @(); sag = @(1199,1170); kapat = $true }
  @{ ad = '89-ekstra-satir-sutun';        yol = @(@(625,82)); kapat = $true }
  @{ ad = '90-genel-ayarlar';             yol = @(@(496,82)); kapat = $true }
  @{ ad = '91-sayfa-yapisi';              yol = @(@(731,82)); kapat = $true }
  @{ ad = '92-renkler';                   yol = @(@(826,82)); kapat = $true }
)

$sh = New-Object -ComObject WScript.Shell

function Surec {
  Get-Process -Name roz -ErrorAction SilentlyContinue |
    Where-Object { $_.MainWindowHandle -ne 0 } | Select-Object -First 1
}

function Sifirla($p) {
  [void]$sh.AppActivate($p.Id); Start-Sleep -Milliseconds 400
  $sh.SendKeys('{ESC}'); Start-Sleep -Milliseconds 400
  $sh.SendKeys('{ESC}'); Start-Sleep -Milliseconds 400
}

function Cek($ad, [switch]$Tam) {
  # Hashtable, not an array: splatting an array passes POSITIONALLY, so '-Ad'
  # itself lands in the first parameter and the run dies on -Bekle.
  $a = @{ Ad = $ad; Bekle = 1 }
  if ($Tam) { $a['TumEkran'] = $true }
  & $ekranBetik @a | Out-Null
  "  $ad"
}

# Fresh start so the nag is handled once, by the capture script. Its frame is
# thrown away: aSc opens on "Ana Menü", so keeping it would duplicate 10- and
# make the duplicate warning below fire on every clean run -- which is how a
# warning stops being read.
Get-Process -Name roz -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2
& $ekranBetik -Demo $Demo -Ad '_acilis' -Gec -Bekle 3 | Out-Null
Remove-Item (Join-Path $kok 'docs\asc\ekran\_acilis.png') -Force -ErrorAction SilentlyContinue

$p = Surec
if (-not $p) { throw 'aSc acilmadi.' }
# The document arrives a beat after the nag is cleared, so this waits for the
# title to carry it rather than reading once and giving up.
for ($i = 0; $i -lt 15; $i++) {
  $p.Refresh()
  if ($p.MainWindowTitle -match '\[') { break }
  Start-Sleep -Seconds 1
}
if ($p.MainWindowTitle -notmatch '\[') {
  throw "Belge acilmadi (baslik: '$($p.MainWindowTitle)'). Nag penceresi kapanmamis olabilir."
}
"acildi: $($p.MainWindowTitle)"

if ($Sadece -in 'hepsi', 'serit') {
  'serit sekmeleri:'
  foreach ($t in $SERIT) {
    Sifirla $p
    Tikla $t.x $SERIT_Y
    Start-Sleep -Seconds 2
    Cek $t.ad
  }
}

if ($Sadece -in 'hepsi', 'diyalog') {
  'veri pencereleri:'
  foreach ($d in $DIYALOG) {
    Sifirla $p
    Tikla $TANIMLAMA_X $SERIT_Y; Start-Sleep -Milliseconds 800
    Tikla $d.x $d.y; Start-Sleep -Seconds 3
    Cek $d.ad -Tam
  }

  'pencere ici:'
  Sifirla $p
  Tikla $TANIMLAMA_X $SERIT_Y; Start-Sleep -Milliseconds 800
  Tikla 180 76; Start-Sleep -Seconds 3
  Tikla $YENI.x $YENI.y; Start-Sleep -Seconds 3
  Cek '28-brans-ekle' -Tam

  Sifirla $p
  Tikla $TANIMLAMA_X $SERIT_Y; Start-Sleep -Milliseconds 800
  Tikla 180 76; Start-Sleep -Seconds 3
  Tikla $ILK_SATIR.x $ILK_SATIR.y; Start-Sleep -Milliseconds 800
  Tikla $KISITLAMALAR.x $KISITLAMALAR.y; Start-Sleep -Seconds 3
  Cek '29-brans-kisitlamalar' -Tam

  Sifirla $p
  Tikla $TANIMLAMA_X $SERIT_Y; Start-Sleep -Milliseconds 800
  Tikla 327 76; Start-Sleep -Seconds 3
  Tikla $YENI.x $YENI.y; Start-Sleep -Seconds 3
  Cek '30-ogretmen-ekle' -Tam
}


if ($Sadece -in 'hepsi', 'derin') {
  'derin envanter:'
  foreach ($d in $DERIN) {
    Sifirla $p
    foreach ($t in $d.yol) { Tikla $t[0] $t[1]; Start-Sleep -Seconds 2 }
    if ($d.sag) { TiklaSag $d.sag[0] $d.sag[1]; Start-Sleep -Seconds 2 }
    Start-Sleep -Seconds 1
    Cek $d.ad -Tam
    # A destructive confirm is answered HERE, by clicking, never by falling
    # through to the ESC above: on some of these boxes ESC takes the default.
    if ($d.sonra) { Tikla $d.sonra[0] $d.sonra[1]; Start-Sleep -Seconds 2 }
  }

  'baski:'
  Sifirla $p
  Tikla 183 36; Start-Sleep -Milliseconds 800
  Tikla 388 82; Start-Sleep -Seconds 6      # On Izleme -- brings its own tab
  foreach ($b in $BASKI) {
    foreach ($t in $b.yol) { Tikla $t[0] $t[1]; Start-Sleep -Seconds 2 }
    if ($b.sag) { TiklaSag $b.sag[0] $b.sag[1]; Start-Sleep -Seconds 2 }
    Start-Sleep -Seconds 2
    Cek $b.ad -Tam
    if ($b.kapat) { $sh.SendKeys('{ESC}'); Start-Sleep -Seconds 1 }
  }
  Tikla 885 85; Start-Sleep -Seconds 3      # On Izlemeyi Kapat
}

Sifirla $p

# Identical hashes mean a click missed and the same screen got photographed
# twice -- the failure mode this tour has, since nothing can be queried.
$cikti = Join-Path $kok 'docs\asc\ekran'
$kopya = Get-ChildItem $cikti -Filter *.png |
  Group-Object { (Get-FileHash $_.FullName -Algorithm MD5).Hash } |
  Where-Object { $_.Count -gt 1 }
if ($kopya) {
  Write-Warning 'AYNI goruntuden birden fazla var -- bir tiklama kacmis olabilir:'
  foreach ($g in $kopya) { '   ' + ($g.Group.Name -join ' = ') }
} else {
  'butun goruntuler farkli.'
}
