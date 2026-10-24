// Presses a button in the real program's window through Windows UI
// Automation: the accessibility layer a screen reader uses, from outside the
// program, with no debugging port and no driver.
//
// For the RELEASED exe. The test exe opens WebView2's debugging port and the
// suite drives it over WebDriver (scripts/webdriver.mjs), but the exe my
// father has never had that port, and nothing outside can give it one: wry
// passes its own browser arguments and they win over
// WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS (TESTFINDINGS, 2026-10-24). What every
// WebView2 window does answer is UI Automation: Chromium builds its
// accessibility tree the first time a client asks, and a button there has the
// name a person reads on it. The upgrade gate (scripts/guncelleme-eski.mjs)
// uses this to make the old version's data with the old version's own hands.
//
// A button is pressed through its Invoke pattern, a tab through SelectionItem;
// anything that offers neither gets a real mouse click on its centre, with the
// window brought to the front first. Windows only.

import { execFileSync } from 'node:child_process';

const BAS = `
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes
Add-Type @'
using System; using System.Runtime.InteropServices;
public static class Fare {
  [DllImport("user32.dll")] public static extern bool SetCursorPos(int x, int y);
  [DllImport("user32.dll")] public static extern void mouse_event(uint f, uint x, uint y, uint d, UIntPtr e);
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
}
'@
$A = [System.Windows.Automation.AutomationElement]
$T = [System.Windows.Automation.TreeScope]
$adlar = @($env:UIA_ADLAR -split "\`n" | Where-Object { $_ -ne '' })
$tam = $env:UIA_TAM -eq '1'
$son = (Get-Date).AddMilliseconds([int]$env:UIA_SURE)
$pencereKosulu = New-Object System.Windows.Automation.PropertyCondition($A::NameProperty, $env:UIA_PENCERE)
function Uyar($ad) {
  foreach ($a in $adlar) { if ($ad -eq $a -or (-not $tam -and $ad.StartsWith($a))) { return $true } }
  return $false
}
$gorulen = @()
while ((Get-Date) -lt $son) {
  foreach ($p in $A::RootElement.FindAll($T::Children, $pencereKosulu)) {
    $gorulen = @()
    foreach ($e in $p.FindAll($T::Descendants, [System.Windows.Automation.Condition]::TrueCondition)) {
      $ad = $e.Current.Name
      if ([string]::IsNullOrWhiteSpace($ad)) { continue }
      $tur = $e.Current.ControlType.ProgrammaticName
      $gorulen += "$tur '$ad'"
      if ($tur -notmatch 'Button|TabItem|Hyperlink|MenuItem') { continue }
      if (-not (Uyar $ad) -or -not $e.Current.IsEnabled) { continue }
      $o = $null
      if ($e.TryGetCurrentPattern([System.Windows.Automation.InvokePattern]::Pattern, [ref]$o)) {
        $o.Invoke(); "basildi Invoke $tur '$ad'"; exit 0
      }
      if ($e.TryGetCurrentPattern([System.Windows.Automation.SelectionItemPattern]::Pattern, [ref]$o)) {
        $o.Select(); "basildi Select $tur '$ad'"; exit 0
      }
      $r = $e.Current.BoundingRectangle
      [void][Fare]::SetForegroundWindow([IntPtr]$p.Current.NativeWindowHandle)
      [void][Fare]::SetCursorPos([int]($r.X + $r.Width / 2), [int]($r.Y + $r.Height / 2))
      [Fare]::mouse_event(2, 0, 0, 0, [UIntPtr]::Zero)
      [Fare]::mouse_event(4, 0, 0, 0, [UIntPtr]::Zero)
      "basildi fare $tur '$ad'"; exit 0
    }
  }
  Start-Sleep -Milliseconds 500
}
"yok: " + ($adlar -join ' | ')
$gorulen | Select-Object -First 150
exit 3
`;

/**
 * Presses the first enabled button in the window titled `pencere` whose name
 * is one of `adlar` (or starts with one, unless `tam`). Retries until `sureMs`
 * runs out, because the tree is built on demand and the page may still be
 * drawing. Returns what was pressed; throws with every name it saw otherwise,
 * so a red run says what the window looked like.
 */
export function uiaBas(adlar, { pencere = 'Mozaik', tam = false, sureMs = 30_000 } = {}) {
  try {
    return execFileSync('powershell', ['-NoProfile', '-NonInteractive', '-Command', BAS], {
      encoding: 'utf8',
      env: {
        ...process.env,
        UIA_ADLAR: adlar.join('\n'),
        UIA_TAM: tam ? '1' : '0',
        UIA_SURE: String(sureMs),
        UIA_PENCERE: pencere,
      },
      timeout: sureMs + 60_000,
    }).trim();
  } catch (e) {
    const cikti = `${e.stdout ?? ''}${e.stderr ?? ''}`.trim();
    throw new Error(`UI Automation basamadı (${adlar.join(' | ')}):\n${cikti || e.message}`);
  }
}
