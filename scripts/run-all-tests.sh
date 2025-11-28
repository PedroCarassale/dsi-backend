#!/bin/bash
# Script para ejecutar todos los tests e2e
# Uso: ./scripts/run-all-tests.sh

echo ""
echo "=================================="
echo "  Tests E2E - DSI Backend"
echo "=================================="

# Verificar que Docker está corriendo
echo ""
echo "[1/7] Verificando Docker..."
if ! docker ps &> /dev/null; then
    echo "❌ Docker no está corriendo. Por favor inicia Docker."
    exit 1
fi
echo "✅ Docker está corriendo"

# Verificar que la base de datos está corriendo
echo ""
echo "[2/7] Verificando base de datos..."
if ! docker ps | grep -q "dsi-postgres"; then
    echo "⚠️  Base de datos no está corriendo. Iniciando..."
    docker-compose up -d
    sleep 5
    echo "✅ Base de datos iniciada"
else
    echo "✅ Base de datos ya está corriendo"
fi

# Tests de Works
echo ""
echo "[3/7] Ejecutando tests de Works..."
if npm run test:e2e:works --silent; then
    echo "✅ Tests de Works: PASARON"
else
    echo "❌ Tests de Works: FALLARON"
fi

# Tests de Users
echo ""
echo "[4/7] Ejecutando tests de Users..."
if npm run test:e2e:users --silent; then
    echo "✅ Tests de Users: PASARON"
else
    echo "❌ Tests de Users: FALLARON"
fi

# Tests de Patents
echo ""
echo "[5/7] Ejecutando tests de Patents..."
if npm run test:e2e:patents --silent; then
    echo "✅ Tests de Patents: PASARON"
else
    echo "❌ Tests de Patents: FALLARON"
fi

# Tests de Memories
echo ""
echo "[6/7] Ejecutando tests de Memories..."
if npm run test:e2e:memories --silent; then
    echo "✅ Tests de Memories: PASARON"
else
    echo "❌ Tests de Memories: FALLARON"
fi

# Tests de Groups
echo ""
echo "[7/7] Ejecutando tests de Groups..."
if npm run test:e2e:groups --silent; then
    echo "✅ Tests de Groups: PASARON"
else
    echo "❌ Tests de Groups: FALLARON"
fi

echo ""
echo "=================================="
echo "  Tests Completados"
echo "=================================="

echo ""
echo "Para ejecutar todos los tests a la vez:"
echo "  npm run test:e2e"

echo ""
echo "Para ejecutar tests con más detalles:"
echo "  npm run test:e2e:verbose"
echo ""

