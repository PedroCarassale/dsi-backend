# Guía de Testing E2E - DSI Backend

## 📋 Resumen

Se han creado tests end-to-end (e2e) completos para verificar que todos los CRUDs funcionen correctamente y que los datos se guarden de manera adecuada en la base de datos.

## 🗂️ Archivos de Test Creados

### 1. **test/works.e2e-spec.ts** - Tests para Trabajos
Prueba todas las operaciones CRUD para el módulo de trabajos:
- ✅ Crear trabajos de diferentes tipos (artículo, libro, capítulo de libro)
- ✅ Obtener todos los trabajos
- ✅ Obtener un trabajo específico por ID
- ✅ Actualizar trabajos (título, año, autores)
- ✅ Eliminar trabajos
- ✅ Validar tipos de trabajo según el enum WorkType
- ✅ Manejo de errores (404 para IDs inexistentes)

### 2. **test/users.e2e-spec.ts** - Tests para Usuarios
Prueba todas las operaciones CRUD para usuarios:
- ✅ Crear usuarios
- ✅ Crear múltiples usuarios
- ✅ Obtener todos los usuarios
- ✅ Obtener un usuario por ID
- ✅ Actualizar nombre, email y contraseña
- ✅ Eliminar usuarios
- ✅ Validaciones y manejo de errores

### 3. **test/patents.e2e-spec.ts** - Tests para Patentes
Prueba todas las operaciones CRUD para patentes:
- ✅ Crear patentes con todos sus campos
- ✅ Crear múltiples patentes
- ✅ Obtener todas las patentes
- ✅ Obtener una patente por ID
- ✅ Actualizar campos individuales y múltiples
- ✅ Eliminar patentes
- ✅ Manejo de errores

### 4. **test/memories.e2e-spec.ts** - Tests para Memorias
Prueba operaciones CRUD y relaciones many-to-many:
- ✅ Crear memorias sin relaciones
- ✅ Crear memorias relacionadas con trabajos y patentes
- ✅ Obtener todas las memorias
- ✅ Obtener una memoria por ID
- ✅ Actualizar nombre y año
- ✅ Actualizar relaciones con works y patents
- ✅ Eliminar memorias
- ✅ **Verificar integridad referencial**: los trabajos y patentes relacionadas persisten después de eliminar la memoria

### 5. **test/groups.e2e-spec.ts** - Tests para Grupos
Prueba operaciones CRUD y relaciones many-to-many:
- ✅ Crear grupos sin relaciones
- ✅ Crear grupos con usuarios y memorias
- ✅ Obtener todos los grupos
- ✅ Obtener un grupo por ID
- ✅ Actualizar nombre del grupo
- ✅ Actualizar relaciones con users y memories
- ✅ Limpiar relaciones (vaciar arrays)
- ✅ Eliminar grupos
- ✅ **Verificar integridad referencial**: usuarios y memorias persisten después de eliminar el grupo

### 6. **test/integration.e2e-spec.ts** - Tests de Integración Completos
Prueba el flujo completo del sistema:
- ✅ **Flujo completo de creación**:
  1. Crear usuarios
  2. Crear trabajos (con diferentes tipos)
  3. Crear patentes
  4. Crear memorias relacionadas con trabajos y patentes
  5. Crear grupos relacionados con usuarios y memorias
  6. Actualizar el grupo
  7. Eliminar el grupo
  8. Verificar que las entidades relacionadas persisten

- ✅ **Tests de casos límite**:
  - Creación masiva de entidades (5+ entidades del mismo tipo)
  - Actualizaciones parciales
  - Verificar que los campos no actualizados permanecen sin cambios

### 7. **test/README.md** - Documentación de Tests
Documento completo con:
- Instrucciones de ejecución
- Descripción de cada suite de tests
- Cobertura de tests
- Notas técnicas
- Recomendaciones de uso

## 🚀 Cómo Ejecutar los Tests

### Ejecutar todos los tests e2e
```bash
npm run test:e2e
```

### Ejecutar un módulo específico
```bash
# Works
npx jest --config ./test/jest-e2e.json works.e2e-spec.ts

# Users
npx jest --config ./test/jest-e2e.json users.e2e-spec.ts

# Patents
npx jest --config ./test/jest-e2e.json patents.e2e-spec.ts

# Memories
npx jest --config ./test/jest-e2e.json memories.e2e-spec.ts

# Groups
npx jest --config ./test/jest-e2e.json groups.e2e-spec.ts

# Integration
npx jest --config ./test/jest-e2e.json integration.e2e-spec.ts
```

### Ejecutar con información detallada
```bash
npm run test:e2e -- --verbose
```

### Ejecutar en modo watch (para desarrollo)
```bash
npx jest --config ./test/jest-e2e.json --watch
```

## 📊 Cobertura de Tests

Los tests cubren:

1. **Operaciones CRUD básicas** para todas las entidades
2. **Relaciones many-to-many** entre:
   - Memories ↔ Works
   - Memories ↔ Patents
   - Groups ↔ Users
   - Groups ↔ Memories

3. **Integridad de datos**:
   - Verificación de que los datos se guardan correctamente
   - Verificación de que las actualizaciones parciales funcionan
   - Verificación de integridad referencial en eliminaciones

4. **Validaciones**:
   - Códigos de estado HTTP correctos (201, 200, 204, 404)
   - Estructura de respuestas correcta
   - Tipos de datos correctos
   - Arrays de autores en trabajos

5. **Casos límite**:
   - IDs inexistentes (404)
   - Creación masiva de entidades
   - Actualizaciones parciales vs completas

## ⚙️ Configuración Requerida

### 1. Base de datos PostgreSQL
Asegúrate de que PostgreSQL esté corriendo. Si usas Docker:

```bash
docker-compose up -d
```

### 2. Variables de entorno (opcional)
Puedes crear un archivo `.env` o `.env.test`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=dsi_backend
```

## 🎯 Beneficios de Estos Tests

1. **Confianza en el código**: Puedes refactorizar con seguridad sabiendo que los tests detectarán problemas
2. **Documentación viva**: Los tests sirven como ejemplos de cómo usar la API
3. **Detección temprana de bugs**: Los tests atrapan errores antes de que lleguen a producción
4. **Verificación de integridad**: Garantizan que las relaciones de base de datos funcionan correctamente
5. **Regresión**: Evitan que bugs ya resueltos vuelvan a aparecer

## 📝 Notas Importantes

⚠️ **Los tests e2e modifican la base de datos**. Recomendaciones:
- Usa una base de datos de testing separada
- No ejecutes estos tests en producción
- Considera limpiar la base de datos antes/después de cada ejecución

## 🔄 Flujo de Ejecución de Tests

1. **beforeAll**: Se crea la aplicación NestJS una vez por suite
2. **Ejecución de tests**: Se ejecutan secuencialmente
3. **afterAll**: Se cierra la aplicación correctamente

Los tests de integración crean entidades auxiliares en el `beforeAll` para usarlas en los tests subsecuentes.

## 🎓 Próximos Pasos Sugeridos

1. ✅ Ejecutar los tests y verificar que todos pasen
2. ✅ Configurar CI/CD para ejecutar tests automáticamente
3. 📝 Agregar tests de validación de datos (campos requeridos, formatos)
4. 📝 Agregar tests de autenticación cuando se implemente
5. 📝 Agregar cleanup automático de base de datos entre tests
6. 📝 Considerar agregar tests de rendimiento

## 🐛 Solución de Problemas

### Error de conexión a la base de datos
```bash
# Verificar que PostgreSQL está corriendo
docker ps

# Iniciar PostgreSQL
docker-compose up -d

# Ver logs de PostgreSQL
docker-compose logs postgres
```

### Tests fallan
```bash
# Limpiar y reinstalar dependencias
npm ci

# Reconstruir el proyecto
npm run build

# Ejecutar tests con más detalle
npm run test:e2e -- --verbose
```

## 📚 Recursos Adicionales

- [NestJS Testing Documentation](https://docs.nestjs.com/fundamentals/testing)
- [Jest Documentation](https://jestjs.io/)
- [SuperTest Documentation](https://github.com/visionmedia/supertest)
- Archivo `test/README.md` con más detalles técnicos

---

**¡Los tests están listos para ejecutarse!** 🎉

Ejecuta `npm run test:e2e` para verificar que todo funcione correctamente.

