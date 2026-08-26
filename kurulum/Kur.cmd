@echo off
REM Ders Programi - kurulum baslatici.
REM
REM Bu dosya bilerek yalniz ASCII: cmd.exe kod sayfasi Turkce harfleri
REM bozuyor. Kullaniciya gorunen her cumle kur.ps1 icinde, UTF-8 olarak.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0kur.ps1"
if errorlevel 1 pause
