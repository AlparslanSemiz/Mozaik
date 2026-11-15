; Mozaik's two changes to Tauri's NSIS installer (tauri.conf.json,
; bundle.windows.nsis.installerHooks). Both protect something the stock
; template would otherwise touch. DECISIONS 2026-11-15.

; 1. The installer never deletes my father's data.
;
; Tauri's uninstaller has a "delete app data" box. Ticked, it runs
; `RmDir /r "$LOCALAPPDATA\${BUNDLEID}"`, and that folder is the WebView2
; profile, i.e. every plan the exe ever saved (DATA.md, "Değişmeyen
; kimlikler", identifier com.dersprogrami.arac). The box's state is read
; when the confirm page is left, before the Uninstall section starts, and
; this hook is the first thing in that section: whatever was ticked, the
; deletion below it never runs. Backups under Belgelerim are not under that
; folder and were never at risk; the live plans were.
!macro NSIS_HOOK_PREUNINSTALL
  StrCpy $DeleteAppDataCheckboxState 0
!macroend

; 2. The installer does not move into the folder of the browser install.
;
; Tauri's per-user default is $LOCALAPPDATA\${PRODUCTNAME}, which is exactly
; where kurulum/Kur.cmd puts the browser version (BUILD.md, "Yerel kurulum").
; Two programs in one folder, and an uninstall note there that says "delete
; this folder". Only the DEFAULT moves: a folder somebody chose by hand, or
; the one a previous install used, is kept. The hook runs after
; `SetOutPath $INSTDIR` and before any file is copied, so the output path is
; set again here.
!macro NSIS_HOOK_PREINSTALL
  ${If} $INSTDIR == "$LOCALAPPDATA\${PRODUCTNAME}"
    StrCpy $INSTDIR "$LOCALAPPDATA\Programs\${PRODUCTNAME}"
    CreateDirectory "$INSTDIR"
    SetOutPath "$INSTDIR"
  ${EndIf}
!macroend
