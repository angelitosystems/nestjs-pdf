# Script PowerShell para despliegue inicial y publicación en NPM
# Uso: .\scripts\deploy.ps1 [-SkipTests] [-Otp "123456"]

param(
    [switch]$SkipTests,
    [string]$Otp = ""
)

$ErrorActionPreference = "Stop"

Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host " 🚀  @angelitosystems/nestjs-pdf - Despliegue en NPM  " -ForegroundColor White
Write-Host "=======================================================" -ForegroundColor Cyan

# 1. Leer versión del package.json
if (-not (Test-Path "package.json")) {
    Write-Host "Error: No se encontró package.json" -ForegroundColor Red
    exit 1
}

$pkg = Get-Content "package.json" | ConvertFrom-Json
Write-Host "Paquete: $($pkg.name)" -ForegroundColor Yellow
Write-Host "Versión: v$($pkg.version)" -ForegroundColor Yellow

# 2. Verificar usuario npm
Write-Host "`n▶ Verificando sesión en npm..." -ForegroundColor Cyan
try {
    $npmUser = (npm whoami 2>&1).Trim()
    if ($LASTEXITCODE -ne 0 -or $npmUser -match "ENEEDAUTH") {
        throw "No autenticado"
    }
    Write-Host "✔ Autenticado como usuario npm: $npmUser" -ForegroundColor Green
} catch {
    Write-Host "✖ No has iniciado sesión en npm." -ForegroundColor Red
    Write-Host "Por favor ejecuta primero en tu terminal:" -ForegroundColor Yellow
    Write-Host "  npm login" -ForegroundColor Cyan
    exit 1
}

# 3. Quality Gates
Write-Host "`n--- Ejecutando Quality Gates ---" -ForegroundColor White

Write-Host "`n▶ Verificando vulnerabilidades (npm audit)..." -ForegroundColor Cyan
npm audit --audit-level=high
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "`n▶ Verificando TypeScript (typecheck)..." -ForegroundColor Cyan
npm run typecheck
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "`n▶ Verificando linter (ESLint)..." -ForegroundColor Cyan
npm run lint
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

if (-not $SkipTests) {
    Write-Host "`n▶ Ejecutando suite de pruebas (Jest)..." -ForegroundColor Cyan
    npm test
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} else {
    Write-Host "`n⚠ Omitiendo pruebas por parámetro -SkipTests" -ForegroundColor Yellow
}

Write-Host "`n▶ Compilando librería (tsup)..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "`n▶ Verificando empaquetado (dry-run)..." -ForegroundColor Cyan
npm pack --dry-run
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

# 4. Confirmación
Write-Host "`n=======================================================" -ForegroundColor Yellow
Write-Host "¿Deseas publicar $($pkg.name)@$($pkg.version) en NPM con acceso público?" -ForegroundColor Yellow
Write-Host "Usuario: $npmUser" -ForegroundColor Green
Write-Host "=======================================================" -ForegroundColor Yellow

$confirm = Read-Host "Escribe 'si' para continuar"
if ($confirm -ne "si" -and $confirm -ne "y" -and $confirm -ne "s") {
    Write-Host "`nPublicación cancelada." -ForegroundColor Yellow
    exit 0
}

# 5. Código 2FA OTP
if (-not $Otp) {
    $inputOtp = Read-Host "Si tienes 2FA activado en npm, ingresa el código TOTP (o Enter si no usas 2FA)"
    if ($inputOtp) {
        $Otp = $inputOtp.Trim()
    }
}

# 6. Publicación
$cmd = "publish --access public"
if ($Otp) {
    $cmd += " --otp=$Otp"
}

Write-Host "`n▶ Publicando en NPM..." -ForegroundColor Cyan
Write-Host "$ npm $cmd" -ForegroundColor DarkGray

Invoke-Expression "npm $cmd"
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n✖ Error al publicar en npm. Revisa el código 2FA o permisos de organización." -ForegroundColor Red
    exit $LASTEXITCODE
}

Write-Host "`n=======================================================" -ForegroundColor Green
Write-Host " 🎉 ¡PUBLICACIÓN COMPLETADA EXITOSAMENTE!" -ForegroundColor Green
Write-Host "=======================================================" -ForegroundColor Green
Write-Host "URL: https://www.npmjs.com/package/$($pkg.name)" -ForegroundColor Cyan

