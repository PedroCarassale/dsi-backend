# Script para limpiar la base de datos y ejecutar todos los tests E2E
# Uso: .\scripts\run-all-tests.ps1

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "  Limpieza y Tests E2E" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que psql esté disponible
$psqlCommand = Get-Command psql -ErrorAction SilentlyContinue
if (-not $psqlCommand) {
    Write-Host "Error: psql no está instalado o no está en el PATH" -ForegroundColor Red
    Write-Host "Instala PostgreSQL y asegúrate de que psql esté en el PATH" -ForegroundColor Yellow
    exit 1
}

# Configuración de la base de datos (ajusta según tu configuración)
$DB_HOST = if ($env:DB_HOST) { $env:DB_HOST } else { "localhost" }
$DB_PORT = if ($env:DB_PORT) { $env:DB_PORT } else { "5432" }
$DB_USER = if ($env:DB_USERNAME) { $env:DB_USERNAME } else { "postgres" }
$DB_PASSWORD = if ($env:DB_PASSWORD) { $env:DB_PASSWORD } else { "postgres" }
$DB_NAME = if ($env:DB_DATABASE) { $env:DB_DATABASE } else { "dsi_backend" }

Write-Host "Configuración de la base de datos:" -ForegroundColor Yellow
Write-Host "  Host: $DB_HOST" -ForegroundColor Gray
Write-Host "  Puerto: $DB_PORT" -ForegroundColor Gray
Write-Host "  Usuario: $DB_USER" -ForegroundColor Gray
Write-Host "  Base de datos: $DB_NAME" -ForegroundColor Gray
Write-Host ""

# Paso 1: Limpiar la base de datos
Write-Host "Paso 1/2: Limpiando la base de datos..." -ForegroundColor Yellow
$env:PGPASSWORD = $DB_PASSWORD

try {
    $result = psql -U $DB_USER -d $DB_NAME -h $DB_HOST -p $DB_PORT -f scripts/clean-test-db.sql 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Base de datos limpiada exitosamente" -ForegroundColor Green
    } else {
        Write-Host "⚠ Advertencia: Hubo un problema al limpiar la base de datos" -ForegroundColor Yellow
        Write-Host $result -ForegroundColor Gray
        Write-Host ""
        Write-Host "Continuando con los tests de todas formas..." -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠ Error al limpiar la base de datos: $_" -ForegroundColor Yellow
    Write-Host "Continuando con los tests de todas formas..." -ForegroundColor Yellow
}

Write-Host ""

# Paso 2: Ejecutar todos los tests E2E
Write-Host "Paso 2/2: Ejecutando todos los tests E2E..." -ForegroundColor Yellow
Write-Host ""

npm run test:e2e

$testExitCode = $LASTEXITCODE

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan

if ($testExitCode -eq 0) {
    Write-Host "✓ Todos los tests pasaron exitosamente!" -ForegroundColor Green
} else {
    Write-Host "✗ Algunos tests fallaron" -ForegroundColor Red
    Write-Host ""
    Write-Host "Sugerencias:" -ForegroundColor Yellow
    Write-Host "  1. Revisa los errores específicos arriba" -ForegroundColor Gray
    Write-Host "  2. Verifica que la base de datos esté corriendo" -ForegroundColor Gray
    Write-Host "  3. Asegúrate de que las variables de entorno sean correctas" -ForegroundColor Gray
}

Write-Host "==================================" -ForegroundColor Cyan

# Limpiar la variable de entorno de la contraseña
Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue

exit $testExitCode
