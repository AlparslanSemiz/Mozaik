# Bu makineyi eski haline dondurur. Yonetici olarak calistirin.
Set-WinSystemLocale -SystemLocale en-US
Set-ItemProperty 'HKLM:\SYSTEM\CurrentControlSet\Control\Nls\CodePage' -Name ACP   -Value '65001'
Set-ItemProperty 'HKLM:\SYSTEM\CurrentControlSet\Control\Nls\CodePage' -Name OEMCP -Value '65001'
Set-ItemProperty 'HKLM:\SYSTEM\CurrentControlSet\Control\Nls\CodePage' -Name MACCP -Value '65001'
# sonra yeniden baslatin
