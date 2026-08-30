# Windows'un UTF-8 beta'sını kapatır, sistem yerelini Türkçe yapar.
# YÖNETİCİ olarak çalıştırılır ve YENİDEN BAŞLATMA ister.
#
# Why this exists: aSc's dialogs render Turkish as replacement glyphs
# (`Kısıtlamalar` -> `K?s?tlamalar`) and the cause was measured, not guessed:
#
#     HKLM\...\Nls\CodePage   ACP = 65001   <- "Use Unicode UTF-8" beta is ON
#     Get-WinSystemLocale     en-US
#     Get-Culture             tr-TR
#
# aSc is a non-Unicode MFC app: it writes cp1254 bytes and asks the system to
# draw them. With ACP=65001 those bytes are not valid UTF-8, so they fall over.
# Its ribbon is fine because that text takes a different path -- which is why
# the bug looks like "some Turkish works and some does not".
#
# Turning the beta off is NOT enough on its own: under en-US that gives
# ACP=1252, which has no ı ğ ş İ. The system locale has to be Turkish too.
#
# THIS IS A SYSTEM-WIDE CHANGE. It affects every non-Unicode program on the
# machine, not just aSc. It is reversible -- the revert command is printed at
# the end and also written to a file next to this script.
#
#   Sağ tık -> "PowerShell ile çalıştır" (yönetici), ya da:
#   Start-Process powershell -Verb RunAs -ArgumentList '-File','<bu dosya>'

$ErrorActionPreference = 'Stop'

$id = [Security.Principal.WindowsIdentity]::GetCurrent()
$pr = New-Object Security.Principal.WindowsPrincipal($id)
if (-not $pr.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
  Write-Host ''
  Write-Host '  Bu betik YONETICI olarak calismali.' -ForegroundColor Yellow
  Write-Host '  Su komutu calistirin:' -ForegroundColor Yellow
  Write-Host ''
  Write-Host "    Start-Process powershell -Verb RunAs -ArgumentList '-NoProfile','-ExecutionPolicy','Bypass','-File','$PSCommandPath'"
  Write-Host ''
  exit 1
}

$nls = 'HKLM:\SYSTEM\CurrentControlSet\Control\Nls\CodePage'
$onceki = Get-ItemProperty $nls | Select-Object ACP, OEMCP, MACCP
$oncekiLocale = (Get-WinSystemLocale).Name

Write-Host ''
Write-Host '  ONCEKI DURUM' -ForegroundColor Cyan
Write-Host "    ACP=$($onceki.ACP)  OEMCP=$($onceki.OEMCP)  MACCP=$($onceki.MACCP)"
Write-Host "    sistem yereli: $oncekiLocale"
Write-Host ''

# Turkish legacy codepages: ANSI 1254, OEM 857, Mac 10081.
Set-WinSystemLocale -SystemLocale tr-TR
Set-ItemProperty $nls -Name ACP   -Value '1254'
Set-ItemProperty $nls -Name OEMCP -Value '857'
Set-ItemProperty $nls -Name MACCP -Value '10081'

$sonra = Get-ItemProperty $nls | Select-Object ACP, OEMCP, MACCP
Write-Host '  YENI DURUM (yeniden baslatinca gecerli olur)' -ForegroundColor Green
Write-Host "    ACP=$($sonra.ACP)  OEMCP=$($sonra.OEMCP)  MACCP=$($sonra.MACCP)"
Write-Host "    sistem yereli: $((Get-WinSystemLocale).Name)"
Write-Host ''

$geri = @"
# Bu makineyi eski haline dondurur. Yonetici olarak calistirin.
Set-WinSystemLocale -SystemLocale $oncekiLocale
Set-ItemProperty '$nls' -Name ACP   -Value '$($onceki.ACP)'
Set-ItemProperty '$nls' -Name OEMCP -Value '$($onceki.OEMCP)'
Set-ItemProperty '$nls' -Name MACCP -Value '$($onceki.MACCP)'
# sonra yeniden baslatin
"@
$geriYol = Join-Path $PSScriptRoot 'asc-utf8-geri-al.ps1'
Set-Content -Path $geriYol -Value $geri -Encoding utf8

Write-Host '  YENIDEN BASLATMA GEREKIYOR.' -ForegroundColor Yellow
Write-Host '  Geri almak icin: ' -NoNewline
Write-Host $geriYol -ForegroundColor Cyan
Write-Host ''
