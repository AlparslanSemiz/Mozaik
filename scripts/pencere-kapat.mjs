// Closes the real program's window the way a person does: the title bar's X.
//
// Not WebDriver's "close window": that destroys the webview and never reaches
// Tauri's CloseRequested, so it cannot test the close that waits for the page
// (TB7, measured 2026-10-24). What the X sends is a message from the window
// manager, and that is what is sent here:
//
//   Linux    WM_DELETE_WINDOW over X11 (scripts/x11-kapat.py). Under Wayland
//            the program has to run on XWayland (`GDK_BACKEND=x11`), which is
//            what xvfb-run gives it anyway.
//   Windows  WM_CLOSE to every visible top-level window titled `ad`, through
//            user32 from PowerShell. Green in exe-windows.yml (2026-10-24).
//
// Returns how many windows were told; 0 means none was found.

import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const PENCERE = `
Add-Type @'
using System; using System.Runtime.InteropServices; using System.Text;
public static class Pencere {
  public delegate bool Gez(IntPtr h, IntPtr l);
  [DllImport("user32.dll")] public static extern bool EnumWindows(Gez f, IntPtr l);
  [DllImport("user32.dll", CharSet = CharSet.Unicode)] public static extern int GetWindowText(IntPtr h, StringBuilder s, int n);
  [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr h);
  [DllImport("user32.dll")] public static extern bool PostMessage(IntPtr h, uint m, IntPtr w, IntPtr l);
}
'@
$script:n = 0
$gez = [Pencere+Gez]{
  param($h, $l)
  $s = New-Object System.Text.StringBuilder 256
  [void][Pencere]::GetWindowText($h, $s, 256)
  if ($s.ToString() -eq $env:PENCERE_ADI -and [Pencere]::IsWindowVisible($h)) {
    [void][Pencere]::PostMessage($h, 0x0010, [IntPtr]::Zero, [IntPtr]::Zero)
    $script:n++
  }
  return $true
}
[void][Pencere]::EnumWindows($gez, [IntPtr]::Zero)
$script:n
`;

/** Sends the title bar's close to every window titled `ad`. */
export function pencereyiKapat(ad = 'Mozaik') {
  const cikti =
    process.platform === 'win32'
      ? execFileSync('powershell', ['-NoProfile', '-NonInteractive', '-Command', PENCERE], {
          encoding: 'utf8',
          env: { ...process.env, PENCERE_ADI: ad },
        })
      : execFileSync('python3', ['-I', join(import.meta.dirname, 'x11-kapat.py'), ad], {
          encoding: 'utf8',
        });
  const sayi = /(\d+)\s*$/.exec(cikti.trim());
  return sayi === null ? 0 : Number(sayi[1]);
}
