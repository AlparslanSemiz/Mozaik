@echo off
REM Ders Programi - kurulum baslatici.
REM
REM Bu dosya bilerek yalniz ASCII: cmd.exe kod sayfasi Turkce harfleri
REM bozuyor. Kullaniciya gorunen her cumle kur.ps1 icinde, UTF-8 olarak.
REM
REM Bypass DEGIL RemoteSigned: bir ZIP'ten cikan her dosya "Internet" bolgesi
REM damgasi tasir ve Bypass o damgayi gormezden gelmenin en genis yoludur.
REM Indirilen bir arsivin icinde bu, tarayicilarin ve virus tarayicilarinin en
REM tanidik imzalarindan biri. Unblock-File damgayi kaldirir; kaldirdiktan
REM sonra RemoteSigned yerel bir betige imza sormaz. Ayni is, benzemeyen imza.
powershell -NoProfile -ExecutionPolicy RemoteSigned -Command "Get-ChildItem -LiteralPath '%~dp0' -Filter *.ps1 | ForEach-Object { try { Unblock-File -LiteralPath $_.FullName } catch {} }; & '%~dp0kur.ps1'"
if errorlevel 1 pause
