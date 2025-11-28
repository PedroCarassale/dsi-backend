# Script para ejecutar todos los tests e2e
# Uso: .\scripts\run-all-tests.ps1

Write-Host "`n==================================" -ForegroundColor Cyan
Write-Host "  Tests E2E - DSI Backend" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

# Verificar que Docker está corriendo
Write-Host "`n[1/7] Verificando Docker..." -ForegroundColor Yellow
$dockerRunning = docker ps 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker no está corriendo. Por favor inicia Docker Desktop." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Docker está corriendo" -ForegroundColor Green

# Verificar que la base de datos está corriendo
Write-Host "`n[2/7] Verificando base de datos..." -ForegroundColor Yellow
$dbRunning = docker ps | Select-String "dsi-postgres"
if (-not $dbRunning) {
    Write-Host "⚠️  Base de datos no está corriendo. Iniciando..." -ForegroundColor Yellow
    docker-compose up -d
    Start-Sleep -Seconds 5
    Write-Host "✅ Base de datos iniciada" -ForegroundColor Green
} else {
    Write-Host "✅ Base de datos ya está corriendo" -ForegroundColor Green
}

# Tests de Works
Write-Host "`n[3/7] Ejecutando tests de Works..." -ForegroundColor Yellow
npm run test:e2e:works --silent
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Tests de Works: PASARON" -ForegroundColor Green
} else {
    Write-Host "❌ Tests de Works: FALLARON" -ForegroundColor Red
}

# Tests de Users
Write-Host "`n[4/7] Ejecutando tests de Users..." -ForegroundColor Yellow
npm run test:e2e:users --silent
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Tests de Users: PASARON" -ForegroundColor Green
} else {
    Write-Host "❌ Tests de Users: FALLARON" -ForegroundColor Red
}

# Tests de Patents
Write-Host "`n[5/7] Ejecutando tests de Patents..." -ForegroundColor Yellow
npm run test:e2e:patents --silent
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Tests de Patents: PASARON" -ForegroundColor Green
} else {
    Write-Host "❌ Tests de Patents: FALLARON" -ForegroundColor Red
}

# Tests de Memories
Write-Host "`n[6/7] Ejecutando tests de Memories..." -ForegroundColor Yellow
npm run test:e2e:memories --silent
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Tests de Memories: PASARON" -ForegroundColor Green
} else {
    Write-Host "❌ Tests de Memories: FALLARON" -ForegroundColor Red
}

# Tests de Groups
Write-Host "`n[7/7] Ejecutando tests de Groups..." -ForegroundColor Yellow
npm run test:e2e:groups --silent
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Tests de Groups: PASARON" -ForegroundColor Green
} else {
    Write-Host "❌ Tests de Groups: FALLARON" -ForegroundColor Red
}

Write-Host "`n==================================" -ForegroundColor Cyan
Write-Host "  Tests Completados" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

Write-Host "`nPara ejecutar todos los tests a la vez:" -ForegroundColor Yellow
Write-Host "  npm run test:e2e" -ForegroundColor White

Write-Host "`nPara ejecutar tests con más detalles:" -ForegroundColor Yellow
Write-Host "  npm run test:e2e:verbose`n" -ForegroundColor White

