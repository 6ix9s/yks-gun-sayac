@echo off
title YKS SAYAC
set batFilePath=%~dp0runner.bat
set startupFolder=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup
set shortcutName=yks_timer_bat.lnk

rem Node.js'in yuklu olup olmadigini kontrol et
node -v >nul 2>nul
if %errorlevel% neq 0 (
    echo Node.js yuklu degil. Lutfen Node.js'i indirip kurun.
    pause
    exit /b
)

rem BurntToast modulunun yuklu olup olmadigini kontrol et
powershell -Command "if (-not (Get-InstalledModule -Name 'BurntToast' -ErrorAction SilentlyContinue)) {exit 1} else {exit 0}"

if %ERRORLEVEL% neq 0 (
    echo BurntToast modulu yuklu degil. Yukleniyor...
    
    rem PowerShell'i yonetici olarak baslatip modulu yukleyelim
    powershell -Command "Start-Process powershell -ArgumentList 'Install-Module -Name ''BurntToast'' -Force -Scope CurrentUser' -Verb RunAs"
    
    rem Yukleme isleminden sonra, basarili olup olmadigini kontrol edelim
    powershell -Command "if (-not (Get-InstalledModule -Name 'BurntToast' -ErrorAction SilentlyContinue)) {Write-Host 'BurntToast modulu yuklenemedi.'; exit 1} else {Write-Host 'BurntToast modulu basariyla yuklendi.'; exit 0}"
    
    if %ERRORLEVEL% neq 0 (
        echo BurntToast modulu yuklenemedi. Lutfen modul yukleme hatasini kontrol edin.
    )
)

rem Kisayolun var olup olmadigini kontrol et
if not exist "%startupFolder%\%shortcutName%" (
    rem Kisayol olusturuluyor
    powershell "$s=(New-Object -COM WScript.Shell).CreateShortcut('%startupFolder%\\%shortcutName%');$s.TargetPath='%batFilePath%';$s.Save()"
    echo Kisayol tek seferlik olacak sekilde kuruldu.
)

echo script çalışıyor.
node "%~dp0yks_gun.js"
