# Bir tıklama dizisini sürer, sonra yakalar -> docs/asc/ekran/<ad>.png
#
# `asc-ekran.ps1` bir kare alır, `asc-tur.ps1` bilinen bir turu koşar; bu dosya
# aradaki boşluk: TEK bir yolu, koordinatları dışarıdan verilerek gezmek.
#
# Why it exists: the deep inventory (TASKS R2 -- every dialog, every tab, every
# right-click menu) cannot be written blind. UI Automation reports zero controls
# for aSc, measured, so the only way to find the next click is to capture the
# screen and LOOK at it. That is a loop between a human (or a model) and the
# machine, and it needs a one-shot "click here, then here, then photograph"
# command rather than a fixed tour.
#
# Coordinates are SCREEN coordinates, measured off a capture at 2560x1440 with
# the window maximised (its rect starts at -8,-8, so screen = image - 8).
#
#   .\scripts\asc-adim.ps1 -Yol '297,36; 180,76' -Ad 31-dersler-yeni
#   .\scripts\asc-adim.ps1 -Yol '297,36' -Ad x -Sag '1088,704'   # sag tik
#   .\scripts\asc-adim.ps1 -Ad su-an                             # yalniz yakala
#
# -Sifirla iki ESC gönderir: açık bir diyalog varsa kapanır. Bir tıklama
# dizisinin bilinen bir yerden başlaması, önceki adımın nerede bıraktığını
# tahmin etmekten ucuzdur.

[CmdletBinding()]
param(
  [string]$Yol = '',        # "x,y; x,y; ..."  sol tık dizisi
  [string]$Sag = '',        # "x,y"            en sonda tek sağ tık
  [string]$Ad = 'adim',
  [int]$Bekle = 2,          # tıklamalar arası saniye
  [int]$Son = 2,            # yakalamadan önceki saniye
  [switch]$Sifirla,
  [switch]$TumEkran
)

$ErrorActionPreference = 'Stop'
$ekranBetik = Join-Path $PSScriptRoot 'asc-ekran.ps1'

Add-Type @'
using System;
using System.Runtime.InteropServices;
public class Adim {
  [DllImport("user32.dll")] public static extern bool SetCursorPos(int x, int y);
  [DllImport("user32.dll")] public static extern void mouse_event(uint f, uint x, uint y, uint d, IntPtr e);
}
'@

function Tikla([int]$x, [int]$y, [switch]$SagTus) {
  [void][Adim]::SetCursorPos($x, $y)
  Start-Sleep -Milliseconds 250
  # 0x02/0x04 = LEFTDOWN/LEFTUP, 0x08/0x10 = RIGHTDOWN/RIGHTUP
  $dn = if ($SagTus) { 0x08 } else { 0x02 }
  $up = if ($SagTus) { 0x10 } else { 0x04 }
  [Adim]::mouse_event($dn, 0, 0, 0, [IntPtr]::Zero)
  Start-Sleep -Milliseconds 80
  [Adim]::mouse_event($up, 0, 0, 0, [IntPtr]::Zero)
}

$p = Get-Process -Name roz -ErrorAction SilentlyContinue |
  Where-Object { $_.MainWindowHandle -ne 0 } | Select-Object -First 1
if (-not $p) { throw 'aSc calismiyor. asc-ekran.ps1 -Demo Demo1 -Gec ile baslatin.' }

$sh = New-Object -ComObject WScript.Shell
[void]$sh.AppActivate($p.Id)
Start-Sleep -Milliseconds 500

if ($Sifirla) {
  $sh.SendKeys('{ESC}'); Start-Sleep -Milliseconds 400
  $sh.SendKeys('{ESC}'); Start-Sleep -Milliseconds 400
  [void]$sh.AppActivate($p.Id); Start-Sleep -Milliseconds 300
}

foreach ($adim in ($Yol -split ';')) {
  $t = $adim.Trim()
  if (-not $t) { continue }
  $xy = $t -split ','
  Tikla ([int]$xy[0].Trim()) ([int]$xy[1].Trim())
  Start-Sleep -Seconds $Bekle
}

if ($Sag) {
  $xy = $Sag -split ','
  Tikla ([int]$xy[0].Trim()) ([int]$xy[1].Trim()) -SagTus
  Start-Sleep -Seconds $Bekle
}

Start-Sleep -Seconds $Son

$a = @{ Ad = $Ad; Bekle = 1 }
if ($TumEkran) { $a['TumEkran'] = $true }
& $ekranBetik @a
