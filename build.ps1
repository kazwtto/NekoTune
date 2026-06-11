# NekoTune Build Script
# Gera artefatos de build na pasta 'build/' separada dos fontes

param(
    [switch]$Clean,
    [switch]$Release
)

$ErrorActionPreference = "Stop"
$ProjectRoot = $PSScriptRoot
$BuildDir = Join-Path $ProjectRoot "build"
$TauriBundle = Join-Path $ProjectRoot "src-tauri\target\release\bundle"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  NekoTune Build Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Funcao para limpar builds anteriores
function Clear-Build {
    Write-Host "[1/4] Limpando builds anteriores..." -ForegroundColor Yellow
    if (Test-Path $BuildDir) {
        Remove-Item -Recurse -Force $BuildDir
        Write-Host "      Pasta 'build/' removida." -ForegroundColor Gray
    }
    Write-Host "      Pronto." -ForegroundColor Green
    Write-Host ""
}

# Funcao para criar diretorio de build
function Initialize-BuildDir {
    Write-Host "[2/4] Criando estrutura de pastas..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $BuildDir -Force | Out-Null
    New-Item -ItemType Directory -Path (Join-Path $BuildDir "installers") -Force | Out-Null
    New-Item -ItemType Directory -Path (Join-Path $BuildDir "portable") -Force | Out-Null
    Write-Host "      Pasta 'build/installers/' criada." -ForegroundColor Gray
    Write-Host "      Pasta 'build/portable/' criada." -ForegroundColor Gray
    Write-Host "      Pronto." -ForegroundColor Green
    Write-Host ""
}

# Funcao para rodar o build do Tauri
function Invoke-TauriBuild {
    Write-Host "[3/4] Executando build do Tauri..." -ForegroundColor Yellow
    Write-Host "      Isso pode demorar alguns minutos..." -ForegroundColor Gray
    Write-Host ""

    Push-Location $ProjectRoot
    try {
        # Instala dependencias se necessario
        if (-not (Test-Path "node_modules")) {
            Write-Host "      Instalando dependencias npm..." -ForegroundColor Gray
            npm install
        }

        # Roda o build do Tauri
        if ($Release) {
            npx tauri build --release
        } else {
            npx tauri build
        }

        if ($LASTEXITCODE -ne 0) {
            throw "Build do Tauri falhou com codigo de saida: $LASTEXITCODE"
        }
    }
    finally {
        Pop-Location
    }
    Write-Host "      Build do Tauri concluido." -ForegroundColor Green
    Write-Host ""
}

# Funcao para copiar artefatos para pasta build/
function Copy-BuildArtifacts {
    Write-Host "[4/4] Copiando artefatos para pasta 'build/'..." -ForegroundColor Yellow

    if (-not (Test-Path $TauriBundle)) {
        throw "Pasta de bundle do Tauri nao encontrada: $TauriBundle"
    }

    # Copia instaladores MSI
    $msiPath = Join-Path $TauriBundle "msi"
    if (Test-Path $msiPath) {
        Get-ChildItem -Path $msiPath -Filter "*.msi" | ForEach-Object {
            Copy-Item $_.FullName -Destination (Join-Path $BuildDir "installers")
            Write-Host "      MSI: $($_.Name)" -ForegroundColor Gray
        }
    }

    # Copia instaladores NSIS
    $nsisPath = Join-Path $TauriBundle "nsis"
    if (Test-Path $nsisPath) {
        Get-ChildItem -Path $nsisPath -Filter "*.exe" | ForEach-Object {
            Copy-Item $_.FullName -Destination (Join-Path $BuildDir "installers")
            Write-Host "      NSIS: $($_.Name)" -ForegroundColor Gray
        }
    }

    # Copia executavel portable
    $releaseBin = Join-Path $ProjectRoot "src-tauri\target\release"
    $exeName = "NekoTune.exe"
    $exePath = Join-Path $releaseBin $exeName
    if (Test-Path $exePath) {
        Copy-Item $exePath -Destination (Join-Path $BuildDir "portable")
        Write-Host "      Portable: $exeName" -ForegroundColor Gray
    }

    # Copia frontend dist para referencia
    $distPath = Join-Path $ProjectRoot "dist"
    if (Test-Path $distPath) {
        Copy-Item -Recurse $distPath -Destination (Join-Path $BuildDir "frontend")
        Write-Host "      Frontend: dist/ copiado" -ForegroundColor Gray
    }

    Write-Host "      Pronto." -ForegroundColor Green
    Write-Host ""
}

# Executa o pipeline de build
try {
    if ($Clean) {
        Clear-Build
    }

    Initialize-BuildDir
    Invoke-TauriBuild
    Copy-BuildArtifacts

    # Resumo final
    Write-Host "========================================" -ForegroundColor Green
    Build concluido com sucesso!
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Artefatos gerados em: build/" -ForegroundColor Cyan
    Write-Host "  - installers/  : Instaladores (MSI, NSIS)" -ForegroundColor White
    Write-Host "  - portable/    : Executavel portatil" -ForegroundColor White
    Write-Host "  - frontend/    : Arquivos do frontend" -ForegroundColor White
    Write-Host ""

    # Abre a pasta build no explorador
    if (Test-Path $BuildDir) {
        Start-Process explorer.exe $BuildDir
    }
}
catch {
    Write-Host ""
    Write-Host "ERRO: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    exit 1
}
