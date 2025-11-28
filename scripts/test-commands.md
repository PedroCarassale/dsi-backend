# Comandos de Testing E2E

## Comandos Rápidos

### Ejecutar todos los tests e2e
```bash
npm run test:e2e
```

### Ejecutar tests con información detallada
```bash
npm run test:e2e:verbose
```

### Ejecutar tests en modo watch (para desarrollo)
```bash
npm run test:e2e:watch
```

### Ejecutar tests por módulo específico

```bash
# Tests de Trabajos (Works)
npm run test:e2e:works

# Tests de Usuarios (Users)
npm run test:e2e:users

# Tests de Patentes (Patents)
npm run test:e2e:patents

# Tests de Memorias (Memories)
npm run test:e2e:memories

# Tests de Grupos (Groups)
npm run test:e2e:groups

# Tests de Integración
npm run test:e2e:integration
```

## Preparación

### 1. Iniciar la base de datos
```bash
docker-compose up -d
```

### 2. Verificar que la base de datos esté corriendo
```bash
docker ps
```

### 3. Ver logs de la base de datos (si hay problemas)
```bash
docker-compose logs -f postgres
```

## Flujo de Trabajo Recomendado

### Durante el desarrollo
1. Inicia la base de datos: `docker-compose up -d`
2. Ejecuta tests en modo watch: `npm run test:e2e:watch`
3. Haz cambios en el código
4. Los tests se ejecutarán automáticamente

### Antes de hacer commit
1. Ejecuta todos los tests: `npm run test:e2e`
2. Verifica que todos pasen ✅
3. Ejecuta el linter: `npm run lint`
4. Formatea el código: `npm run format`

### Para debugging
1. Ejecuta tests con verbose: `npm run test:e2e:verbose`
2. O ejecuta un módulo específico para aislar el problema

## Solución de Problemas

### La base de datos no se conecta
```bash
# Detener contenedores
docker-compose down

# Limpiar volúmenes (⚠️ esto borra los datos)
docker-compose down -v

# Iniciar de nuevo
docker-compose up -d

# Esperar unos segundos
# Ejecutar tests
npm run test:e2e
```

### Tests fallan después de cambios en el esquema
```bash
# Reconstruir la aplicación
npm run build

# Ejecutar tests
npm run test:e2e
```

### Limpiar todo y empezar de nuevo
```bash
# Detener base de datos
docker-compose down -v

# Limpiar node_modules
rm -rf node_modules

# Reinstalar
npm install

# Reconstruir
npm run build

# Iniciar base de datos
docker-compose up -d

# Ejecutar tests
npm run test:e2e
```

