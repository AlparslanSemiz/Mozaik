@echo off
REM Ders Programi - guncelleme baslatici.
REM Once en yeni surumu Internetten indirmeyi dener; Internet yoksa
REM yanindaki klasorde duran surumu kurar. Yalniz program dosyalarini
REM tazeler; kisayollara ve verilere dokunmaz.
REM Bypass DEGIL RemoteSigned; gerekcesi Kur.cmd icinde yazili.
powershell -NoProfile -ExecutionPolicy RemoteSigned -Command "Get-ChildItem -LiteralPath '%~dp0' -Filter *.ps1 | ForEach-Object { try { Unblock-File -LiteralPath $_.FullName } catch {} }; & '%~dp0kur.ps1' -Guncelle -Internetten"
if errorlevel 1 pause
