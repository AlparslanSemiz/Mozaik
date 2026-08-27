@echo off
REM Ders Programi - guncelleme baslatici.
REM Once en yeni surumu Internetten indirmeyi dener; Internet yoksa
REM yanindaki klasorde duran surumu kurar. Yalniz program dosyalarini
REM tazeler; kisayollara ve verilere dokunmaz.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0kur.ps1" -Guncelle -Internetten
if errorlevel 1 pause
