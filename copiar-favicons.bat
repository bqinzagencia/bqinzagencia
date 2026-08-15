@echo off
setlocal

set "DEST=C:\proyectos\bqinzagencia\bqinzagencia\public"
set "SRC=%USERPROFILE%\Downloads"

echo Buscando favicons en %SRC% ...
echo.

set "FILES=favicon.ico favicon-16x16.png favicon-32x32.png favicon-192x192.png favicon-512x512.png apple-touch-icon.png"

set "FOUND=0"
for %%F in (%FILES%) do (
    if exist "%SRC%\%%F" (
        copy /Y "%SRC%\%%F" "%DEST%\%%F" >nul
        echo Copiado: %%F
        set "FOUND=1"
    ) else (
        echo NO encontrado en Descargas: %%F
    )
)

echo.
if "%FOUND%"=="1" (
    echo Listo. Archivos actualizados en public\.
    echo Ahora ejecuta: vercel --prod
) else (
    echo No se encontro ningun favicon en %SRC%.
    echo Revisa si los descargaste con otro nombre ^(ej: favicon.ico ^(1^).ico^)
)

echo.
pause
