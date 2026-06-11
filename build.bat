@echo off
title NekoTune Build Script
echo ========================================
echo   NekoTune Build Script
echo ========================================
echo.

:: Verifica se esta no diretorio correto
if not exist "package.json" (
    echo ERRO: Execute este script na pasta raiz do projeto!
    echo.
    pause
    exit /b 1
)

:: Limpa builds anteriores
echo [1/4] Limpando builds anteriores...
if exist "build" (
    rmdir /s /q "build"
    echo       Pasta 'build/' removida.
)
echo       Pronto.
echo.

:: Cria estrutura de pastas
echo [2/4] Criando estrutura de pastas...
mkdir "build" 2>nul
mkdir "build\installers" 2>nul
mkdir "build\portable" 2>nul
echo       Pronto.
echo.

:: Executa build do Tauri
echo [3/4] Executando build do Tauri...
echo       Isso pode demorar alguns minutos...
echo.

:: Instala dependencias se necessario
if not exist "node_modules" (
    echo       Instalando dependencias npm...
    call npm install
)

:: Roda o build do Tauri
call npx tauri build
if errorlevel 1 (
    echo.
    echo ERRO: Build do Tauri falhou!
    echo.
    pause
    exit /b 1
)
echo       Build do Tauri concluido.
echo.

:: Copia artefatos
echo [4/4] Copiando artefatos para pasta 'build/'...

:: Copia instaladores MSI
if exist "src-tauri\target\release\bundle\msi" (
    for %%f in (src-tauri\target\release\bundle\msi\*.msi) do (
        copy "%%f" "build\installers\" >nul
        echo       MSI: %%~nxf
    )
)

:: Copia instaladores NSIS
if exist "src-tauri\target\release\bundle\nsis" (
    for %%f in (src-tauri\target\release\bundle\nsis\*.exe) do (
        copy "%%f" "build\installers\" >nul
        echo       NSIS: %%~nxf
    )
)

:: Copia executavel portable
if exist "src-tauri\target\release\NekoTune.exe" (
    copy "src-tauri\target\release\NekoTune.exe" "build\portable\" >nul
    echo       Portable: NekoTune.exe
)

:: Copia frontend
if exist "dist" (
    xcopy /s /e /q /y "dist" "build\frontend\" >nul
    echo       Frontend: dist/ copiado
)

echo       Pronto.
echo.

:: Resumo
echo ========================================
echo   Build concluido com sucesso!
echo ========================================
echo.
echo   Artefatos gerados em: build\
echo     - installers\  : Instaladores (MSI, NSIS)
echo     - portable\    : Executavel portatil
echo     - frontend\    : Arquivos do frontend
echo.

:: Abre a pasta build
explorer "build"

echo.
pause
