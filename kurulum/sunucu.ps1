# Mozaik — yerel sunucu (Windows).
#
# Bu betik programı BİLGİSAYARINIZDA açar. İnternete çıkmaz, hiçbir yere veri
# göndermez, hiçbir yerden veri almaz. Yaptığı tek şey, yanındaki "site"
# klasöründeki dosyaları tarayıcıya vermek.
#
# Ne kazandırır: program böyle açıldığında çevrimdışı da çalışır, ve verileri
# yalnız bu programa ait bir yerde tutar — dosyaya çift tıklayarak açtığınızda
# depo makinedeki bütün yerel sayfalarla ortaktır.
#
# ---------------------------------------------------------------------------
# Written in PowerShell and not in Node so that nothing has to be installed:
# Windows PowerShell 5.1 ships with Windows 10 and 11. This is the twin of
# scripts/sunucu.mjs and the two are kept answering the same bytes.
#
# TcpListener, NOT HttpListener. HttpListener matches by the Host header, and
# a prefix other than plain "localhost" — which is exactly what
# dersprogrami.localhost is — needs `netsh http add urlacl`, i.e. an
# administrator. The whole point of the *.localhost address is that nobody has
# to be an administrator and no hosts file gets edited, so the HTTP/1.1 reply
# is written out by hand below instead.
#
# BOTH loopbacks are bound. Chrome maps every *.localhost name to 127.0.0.1
# AND ::1 and races the two; a server on one of them is found on some machines
# and — with no error anywhere — not on others.

param(
  [int]$Port = 7654,
  [string]$Kok = (Join-Path $PSScriptRoot 'site'),
  [switch]$Sessiz          # do not open the browser (used when measuring)
)

$ErrorActionPreference = 'Stop'
$AnaBilgisayar = 'dersprogrami.localhost'

# Windows PowerShell 5.1 writes to the console in the console's OWN code page,
# which on a Turkish Windows is 857 — and the sentences below are the only
# thing my father reads if something goes wrong. Two halves, both needed: this
# line, and the UTF-8 BOM on this file (5.1 reads a BOM-less UTF-8 script as
# ANSI and turns every "ı" into something else).
try { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8 } catch { }

if (-not (Test-Path -LiteralPath $Kok -PathType Container)) {
  Write-Host "Klasör bulunamadı: $Kok" -ForegroundColor Red
  Write-Host "Kurulum eksik görünüyor. Kur.cmd dosyasını yeniden çalıştırın."
  Read-Host "Kapatmak için Enter"
  exit 1
}
$KokTam = [System.IO.Path]::GetFullPath($Kok)

# Elle yazılmış tür tablosu: tür tahmin eden bir kütüphane, hiçbir şey için
# bir bağımlılık olurdu.
$Turler = @{
  '.html'        = 'text/html; charset=utf-8'
  '.js'          = 'text/javascript; charset=utf-8'
  '.css'         = 'text/css; charset=utf-8'
  '.json'        = 'application/json; charset=utf-8'
  '.webmanifest' = 'application/manifest+json; charset=utf-8'
  '.svg'         = 'image/svg+xml'
  '.png'         = 'image/png'
  '.ico'         = 'image/x-icon'
  '.woff2'       = 'font/woff2'
  '.txt'         = 'text/plain; charset=utf-8'
}

function Get-Dosya {
  param([string]$Yol)

  $temiz = $Yol.Split('?')[0].Split('#')[0]
  try { $temiz = [System.Uri]::UnescapeDataString($temiz) } catch { return $null }
  if ($temiz.EndsWith('/')) { $temiz = $temiz + 'index.html' }
  $temiz = $temiz.TrimStart('/').Replace('/', '\')

  # İki ret, ikisi de bu fonksiyonun asıl işi: kökün dışına çıkan yol, ve
  # klasör. Burada dizin listesi yoktur.
  $tam = $null
  try { $tam = [System.IO.Path]::GetFullPath((Join-Path $KokTam $temiz)) } catch { return $null }
  if ($tam -ne $KokTam -and -not $tam.StartsWith($KokTam + [System.IO.Path]::DirectorySeparatorChar)) { return $null }
  if (-not (Test-Path -LiteralPath $tam -PathType Leaf)) { return $null }
  return $tam
}

function Send-Yanit {
  param(
    [System.IO.Stream]$Akis,
    [int]$Kod,
    [string]$Durum,
    [string]$Tur,
    [byte[]]$Govde,
    [bool]$GovdeYaz = $true
  )
  $basliklar = "HTTP/1.1 $Kod $Durum`r`n" +
               "content-type: $Tur`r`n" +
               "content-length: $($Govde.Length)`r`n" +
               "cache-control: no-cache`r`n" +
               "connection: close`r`n`r`n"
  $bas = [System.Text.Encoding]::ASCII.GetBytes($basliklar)
  $Akis.Write($bas, 0, $bas.Length)
  if ($GovdeYaz -and $Govde.Length -gt 0) { $Akis.Write($Govde, 0, $Govde.Length) }
  $Akis.Flush()
}

function Read-IstekSatiri {
  param([System.IO.Stream]$Akis)

  # Yalnız ilk satır gerekiyor: GET ve HEAD dışında bir şey servis etmiyoruz,
  # yani gövde okumak diye bir durum yok. Yine de başlıkların sonuna kadar
  # okunur, yoksa tarayıcı yazarken bloklanabilir.
  $tampon = New-Object byte[] 8192
  $metin = ''
  $sayac = 0
  while ($metin -notmatch "`r`n`r`n" -and $sayac -lt 16) {
    $okunan = $Akis.Read($tampon, 0, $tampon.Length)
    if ($okunan -le 0) { break }
    $metin += [System.Text.Encoding]::ASCII.GetString($tampon, 0, $okunan)
    $sayac++
  }
  if ($metin.Length -eq 0) { return $null }
  return $metin.Split("`r`n")[0]
}

# --------------------------------------------------------------- dinleyiciler
$dinleyiciler = @()
foreach ($adres in @([System.Net.IPAddress]::Loopback, [System.Net.IPAddress]::IPv6Loopback)) {
  try {
    $d = New-Object System.Net.Sockets.TcpListener($adres, $Port)
    $d.Start()
    $dinleyiciler += $d
  } catch [System.Net.Sockets.SocketException] {
    if ($_.Exception.SocketErrorCode -eq 'AddressAlreadyInUse') {
      Write-Host "Port $Port kullanımda. Program zaten açık olabilir." -ForegroundColor Yellow
      if (-not $Sessiz) { Start-Process "http://${AnaBilgisayar}:$Port/" }
      exit 0
    }
    # IPv6'sı kapalı bir makinede ::1 bağlanamaz; öteki ayaktaysa sorun değil.
  }
}
if ($dinleyiciler.Count -eq 0) {
  Write-Host "Hiçbir adrese bağlanılamadı." -ForegroundColor Red
  Read-Host "Kapatmak için Enter"
  exit 1
}

$adres = "http://${AnaBilgisayar}:$Port/"
Write-Host ''
Write-Host '  Mozaik çalışıyor.' -ForegroundColor Green
Write-Host "  $adres"
Write-Host ''
Write-Host '  Bu pencereyi KAPATMAYIN - kapatırsanız program da kapanır.'
Write-Host '  İşiniz bitince kapatabilirsiniz; verileriniz kaybolmaz.'
Write-Host ''
if (-not $Sessiz) { Start-Process $adres }

while ($true) {
  $isVar = $false
  foreach ($d in $dinleyiciler) {
    if (-not $d.Pending()) { continue }
    $isVar = $true
    $istemci = $d.AcceptTcpClient()
    try {
      $akis = $istemci.GetStream()
      $satir = Read-IstekSatiri -Akis $akis
      if ($null -eq $satir) { continue }

      $parcalar = $satir.Split(' ')
      $yontem = $parcalar[0]
      $yol = if ($parcalar.Length -gt 1) { $parcalar[1] } else { '/' }

      if ($yontem -ne 'GET' -and $yontem -ne 'HEAD') {
        Send-Yanit -Akis $akis -Kod 405 -Durum 'Method Not Allowed' -Tur $Turler['.txt'] -Govde ([byte[]]@())
        continue
      }

      # Bilinmeyen bir yol uygulamanın kendisine düşer, ama YALNIZ gezinme
      # ise. Bir dosya adı isteyen çağrıya index.html vermek tarayıcının
      # üstüne hareket ettiği bir yalandır: derin bir yolda sayfa yanındaki
      # sw.js'i istiyor, geri HTML geliyor ve Chromium kaydı
      # "unsupported MIME type ('text/html')" diye reddediyor. sunucu.mjs'in
      # Node ikizinde de aynı kural var; ikisi ayrışamaz.
      $dosya = Get-Dosya -Yol $yol
      if ($null -eq $dosya) {
        $dosyaAdi = $yol.Split('?')[0] -match '\.[A-Za-z0-9]{1,8}$'
        if (-not $dosyaAdi) { $dosya = Get-Dosya -Yol '/index.html' }
      }
      if ($null -eq $dosya) {
        $govde = [System.Text.Encoding]::UTF8.GetBytes("Bulunamadı`n")
        Send-Yanit -Akis $akis -Kod 404 -Durum 'Not Found' -Tur $Turler['.txt'] -Govde $govde
        continue
      }

      $uzanti = [System.IO.Path]::GetExtension($dosya).ToLowerInvariant()
      $tur = $Turler[$uzanti]
      if ($null -eq $tur) { $tur = 'application/octet-stream' }
      # Bayt olarak okunur: PNG ve woff2 metin değildir.
      $govde = [System.IO.File]::ReadAllBytes($dosya)
      Send-Yanit -Akis $akis -Kod 200 -Durum 'OK' -Tur $tur -Govde $govde -GovdeYaz ($yontem -eq 'GET')
    } catch {
      # Tarayıcı bağlantıyı yarıda kesince buraya düşülür; sunucu ölmez.
    } finally {
      $istemci.Close()
    }
  }
  if (-not $isVar) { Start-Sleep -Milliseconds 15 }
}
