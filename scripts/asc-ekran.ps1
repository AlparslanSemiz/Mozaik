# aSc Timetables penceresini yakalar -> docs/asc/ekran/<ad>.png
#
# The third source next to asc-sozluk.mjs and asc-yardim.mjs: the program
# itself. The string table says what aSc calls a thing and the help says what
# it does, but neither shows the SHAPE of a screen -- which is the one thing
# docs/Örnek Fotolar exists for, and the thing TASKS item AB8 is waiting on.
#
# Deliberately not a UI robot. Driving a Win32 menu tree blind is a project of
# its own and a fragile one; this does the half a script does well -- launch a
# named demo, bring the window up, capture it on demand -- and leaves the
# clicking to a person, who is the one who knows which screen is interesting.
#
#   .\scripts\asc-ekran.ps1 -Demo 'Genel Ders Programi' -Ad 01-acilis
#   .\scripts\asc-ekran.ps1 -Ad 02-ders-ekleme          # zaten acik pencereyi al
#   .\scripts\asc-ekran.ps1 -Listele                    # demolari say

[CmdletBinding()]
param(
  [string]$Demo = '',
  [string]$Ad = 'ekran',
  [int]$Bekle = 3,
  [switch]$Listele,
  [switch]$Gec,
  [switch]$TumEkran
)

$ErrorActionPreference = 'Stop'
$kok = Split-Path -Parent $PSScriptRoot
$demoKok = 'C:\TimeTables\demos\International\Turkey'
$cikti = Join-Path $kok 'docs\asc\ekran'

if ($Listele) {
  Get-ChildItem $demoKok -Filter *.roz | ForEach-Object { $_.BaseName }
  Get-ChildItem 'C:\TimeTables\demos' -Filter *.roz | ForEach-Object { "(genel) " + $_.BaseName }
  return
}

Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.Windows.Forms
Add-Type @'
using System;
using System.Runtime.InteropServices;
public class Win {
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h, int c);
  [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out RECT r);
  [DllImport("user32.dll")] public static extern int GetWindowThreadProcessId(IntPtr h, out int pid);
  [DllImport("user32.dll")] public static extern bool SetCursorPos(int x, int y);
  [DllImport("user32.dll")] public static extern void mouse_event(uint f, uint x, uint y, uint d, IntPtr e);
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int L, T, R, B; }
}
'@

function Click-At([int]$x, [int]$y) {
  [void][Win]::SetCursorPos($x, $y)
  Start-Sleep -Milliseconds 300
  [Win]::mouse_event(0x02, 0, 0, 0, [IntPtr]::Zero)   # LEFTDOWN
  Start-Sleep -Milliseconds 80
  [Win]::mouse_event(0x04, 0, 0, 0, [IntPtr]::Zero)   # LEFTUP
}

if ($Demo) {
  $yol = Join-Path $demoKok "$Demo.roz"
  if (-not (Test-Path $yol)) { $yol = Join-Path 'C:\TimeTables\demos' "$Demo.roz" }
  if (-not (Test-Path $yol)) { throw "Demo bulunamadi: $Demo  (-Listele ile bakin)" }
  Start-Process 'C:\TimeTables\roz.exe' -ArgumentList "`"$yol`"" | Out-Null
  Start-Sleep -Seconds ($Bekle + 4)
}

$proc = Get-Process -Name roz -ErrorAction SilentlyContinue |
  Where-Object { $_.MainWindowHandle -ne 0 } | Select-Object -First 1
if (-not $proc) { throw 'aSc calismiyor. -Demo ile baslatin.' }

[void][Win]::ShowWindow($proc.MainWindowHandle, 3)   # SW_MAXIMIZE
[void][Win]::SetForegroundWindow($proc.MainWindowHandle)
Start-Sleep -Seconds $Bekle

# The unregistered build opens a "Continue" nag over the main window, so an
# unattended capture photographs the nag rather than the program. Two measured
# details decide how this is done:
#
#   - Its Continue button counts down for a few seconds and is DISABLED until
#     the count runs out, so a single early Enter is swallowed. Hence the retry.
#   - SetForegroundWindow from a background process is ignored by Windows, and
#     SendKeys then lands in whatever really has focus. WScript.Shell's
#     AppActivate is the one that actually raises it here.
#
# Keys rather than a click because UI Automation reports zero controls -- aSc is
# a custom-drawn MFC app (measured: 0 buttons under the main window).
#
# The Enter is only ever sent while the foreground window still BELONGS to aSc,
# and it stops as soon as the title shows a document. Without that guard the
# loop is a blind key sender: a Turkish demo refuses to open, puts up its own
# "get the Turkish build" box, and one more Enter opened a browser -- which is
# then what the capture photographed.
if ($Gec) {
  $shell = New-Object -ComObject WScript.Shell
  # While a modal is up the main window reports an EMPTY title, and that is the
  # only signal available -- UI Automation sees nothing here.
  #
  # Enter does not work: the Turkish build's box ("Devam") does not take it as a
  # default. So the button is clicked, at an offset from screen centre MEASURED
  # on this dialog at 2560x1440. The dialog is centred, so the offset travels.
  #
  # Exactly ONE attempt. Pressing blind a second time is how a Turkish demo's
  # "get the TR build" box got its LINK activated and opened a browser, which
  # the capture then photographed.
  Start-Sleep -Seconds 10
  $b = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds
  $devamX = [int]($b.Width / 2) - 262
  $devamY = [int]($b.Height / 2) + 134
  # Starting with a file on the command line raises the box TWICE, measured, so
  # the loop stops on the GOAL rather than on a count: the document appearing in
  # the title (or, with no file asked for, the title merely coming back).
  for ($i = 0; $i -lt 4; $i++) {
    $live = Get-Process -Id $proc.Id -ErrorAction SilentlyContinue
    if (-not $live) { break }
    $live.Refresh()
    if ($Demo) { if ($live.MainWindowTitle -match '\[') { break } }
    elseif ($live.MainWindowTitle) { break }
    [void]$shell.AppActivate($proc.Id)
    Start-Sleep -Milliseconds 700
    Click-At $devamX $devamY
    Start-Sleep -Seconds 4
  }
  $live = Get-Process -Id $proc.Id -ErrorAction SilentlyContinue
  if ($live) { $live.Refresh() }
  if ($live -and $Demo -and $live.MainWindowTitle -notmatch '\[') {
    Write-Warning "Belge acilmadi (baslik: '$($live.MainWindowTitle)')."
  }
  [void]$shell.AppActivate($proc.Id)
  Start-Sleep -Seconds 1
}

# A modal dialog is its own foreground window and is often the whole point of a
# capture, so the foreground window wins -- BUT only when it belongs to aSc and
# aSc is actually blocked by it (an empty main title). Otherwise the foreground
# is some stray small window and the capture comes out 727x377 of nothing.
$proc.Refresh()
$hwnd = $proc.MainWindowHandle
if (-not $proc.MainWindowTitle) {
  $fg = [Win]::GetForegroundWindow()
  $fgPid = 0
  [void][Win]::GetWindowThreadProcessId($fg, [ref]$fgPid)
  if ($fgPid -eq $proc.Id) { $hwnd = $fg }
}
$r = New-Object Win+RECT
if (-not [Win]::GetWindowRect($hwnd, [ref]$r)) { throw 'Pencere olculemedi.' }

if ($TumEkran -or $r.R -le $r.L -or $r.B -le $r.T) {
  $b = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds
  $x = $b.X; $y = $b.Y; $w = $b.Width; $h = $b.Height
} else {
  $x = $r.L; $y = $r.T; $w = $r.R - $r.L; $h = $r.B - $r.T
}

New-Item -ItemType Directory -Force -Path $cikti | Out-Null
$bmp = New-Object System.Drawing.Bitmap $w, $h
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.CopyFromScreen($x, $y, 0, 0, $bmp.Size)
$hedef = Join-Path $cikti "$Ad.png"
$bmp.Save($hedef, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose(); $bmp.Dispose()

"yazildi: $hedef  (${w}x${h})"
