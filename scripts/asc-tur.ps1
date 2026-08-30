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
  [ValidateSet('hepsi', 'serit', 'diyalog')]
  [string]$Sadece = 'hepsi',
  [string]$Demo = 'Demo1'
)

$ErrorActionPreference = 'Stop'
$kok = Split-Path -Parent $PSScriptRoot
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
