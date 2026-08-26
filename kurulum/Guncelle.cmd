@echo off
REM Ders Programi - guncelleme baslatici. Yalniz site klasorunu tazeler;
REM kisayollara ve verilere dokunmaz.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0kur.ps1" -Guncelle
if errorlevel 1 pause
