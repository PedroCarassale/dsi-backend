# Tests E2E - DSI Backend

Este directorio contiene los tests end-to-end (e2e) para el backend DSI.

## Estructura de Tests

Los tests e2e están organizados por módulo:

- **`works.e2e-spec.ts`**: Tests para el módulo de trabajos (works)
- **`users.e2e-spec.ts`**: Tests para el módulo de usuarios (users)
- **`patents.e2e-spec.ts`**: Tests para el módulo de patentes (patents)
- **`memories.e2e-spec.ts`**: Tests para el módulo de memorias (memories)
- **`groups.e2e-spec.ts`**: Tests para el módulo de grupos (groups)
- **`integration.e2e-spec.ts`**: Tests de integración completos que prueban el flujo entre múltiples módulos
- **`app.e2e-spec.ts`**: Test básico de la aplicación

## Requisitos Previos

1. **Base de datos PostgreSQL corriendo**: Asegúrate de tener la base de datos configurada y corriendo
2. **Variables de entorno**: Configura las variables de entorno en `.env` si es necesario

## Ejecutar los Tests

### Ejecutar todos los tests e2e

```bash
npm run test:e2e
```

### Ejecutar un test específico

```bash
# Tests de works
npx jest --config ./test/jest-e2e.json works.e2e-spec.ts

# Tests de users
npx jest --config ./test/jest-e2e.json users.e2e-spec.ts

# Tests de patents
npx jest --config ./test/jest-e2e.json patents.e2e-spec.ts

# Tests de memories
npx jest --config ./test/jest-e2e.json memories.e2e-spec.ts

# Tests de groups
npx jest --config ./test/jest-e2e.json groups.e2e-spec.ts

# Tests de integración
npx jest --config ./test/jest-e2e.json integration.e2e-spec.ts
```

### Ejecutar tests en modo watch

```bash
npx jest --config ./test/jest-e2e.json --watch
```

### Ejecutar tests con información detallada (verbose)

```bash
npx jest --config ./test/jest-e2e.json --verbose
```

## Cobertura de Tests

### Works (Trabajos)
- ✅ Crear trabajos (artículos, libros, capítulos de libro)
- ✅ Obtener todos los trabajos
- ✅ Obtener un trabajo por ID
- ✅ Actualizar trabajos
- ✅ Actualizar autores de trabajos
- ✅ Eliminar trabajos
- ✅ Validar tipos de trabajo (ARTICLE, BOOK, BOOK_CHAPTER)
- ✅ Manejo de errores (404 para IDs inexistentes)

### Users (Usuarios)
- ✅ Crear usuarios
- ✅ Crear múltiples usuarios
- ✅ Obtener todos los usuarios
- ✅ Obtener un usuario por ID
- ✅ Actualizar nombre de usuario
- ✅ Actualizar email de usuario
- ✅ Actualizar contraseña de usuario
- ✅ Eliminar usuarios
- ✅ Manejo de errores

### Patents (Patentes)
- ✅ Crear patentes
- ✅ Crear múltiples patentes
- ✅ Obtener todas las patentes
- ✅ Obtener una patente por ID
- ✅ Actualizar título de patente
- ✅ Actualizar múltiples campos
- ✅ Eliminar patentes
- ✅ Manejo de errores

### Memories (Memorias)
- ✅ Crear memorias sin relaciones
- ✅ Crear memorias con works y patents
- ✅ Obtener todas las memorias
- ✅ Obtener una memoria por ID
- ✅ Actualizar nombre de memoria
- ✅ Actualizar año de memoria
- ✅ Actualizar relaciones (works y patents)
- ✅ Eliminar memorias
- ✅ Verificar integridad referencial (works y patents deben persistir)

### Groups (Grupos)
- ✅ Crear grupos sin relaciones
- ✅ Crear grupos con usuarios y memorias
- ✅ Obtener todos los grupos
- ✅ Obtener un grupo por ID
- ✅ Actualizar nombre de grupo
- ✅ Actualizar relaciones (users y memories)
- ✅ Limpiar relaciones de grupo
- ✅ Eliminar grupos
- ✅ Verificar integridad referencial

### Integration Tests (Tests de Integración)
- ✅ Flujo completo de creación de todas las entidades
- ✅ Crear usuarios → trabajos → patentes → memorias → grupos
- ✅ Verificar relaciones many-to-many
- ✅ Actualizar grupos con relaciones
- ✅ Verificar integridad después de eliminaciones
- ✅ Creación masiva de entidades
- ✅ Actualizaciones parciales

## Importante

⚠️ **Los tests e2e modifican la base de datos**: Estos tests crean, actualizan y eliminan datos reales en la base de datos. Se recomienda:

1. Usar una base de datos de testing separada
2. No ejecutar estos tests en producción
3. Considerar limpiar la base de datos antes/después de cada ejecución de tests

## Configuración de Base de Datos de Testing

Para usar una base de datos separada para testing, puedes crear un archivo `.env.test`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=dsi_backend_test
```

## Notas Técnicas

- Los tests usan **beforeAll** para inicializar la aplicación una sola vez por suite
- Los tests de integración crean entidades relacionadas en el **beforeAll** para usar en los tests
- Se usa **afterAll** para cerrar la aplicación correctamente
- Cada suite de tests tiene su propio contexto pero comparte la base de datos
- Los IDs de entidades creadas se guardan para uso en tests subsecuentes

## Próximos Pasos

Posibles mejoras futuras:

1. Agregar tests de validación de datos (campos requeridos, formatos de email, etc.)
2. Agregar tests de paginación (si se implementa)
3. Agregar tests de búsqueda/filtrado (si se implementa)
4. Agregar tests de autenticación/autorización (cuando se implemente)
5. Agregar cleanup automático de la base de datos entre tests
6. Agregar tests de rendimiento

