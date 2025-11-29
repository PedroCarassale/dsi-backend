# Testing con Autenticación

## Resumen

Todos los tests E2E han sido actualizados para funcionar con el sistema de autenticación JWT implementado.

## Tests Actualizados

### ✅ Archivos de Test

1. **test/app.e2e-spec.ts** - ✅ Funcional (endpoint público)
2. **test/users.e2e-spec.ts** - ✅ Actualizado con autenticación
3. **test/works.e2e-spec.ts** - ✅ Actualizado con autenticación
4. **test/patents.e2e-spec.ts** - ✅ Actualizado con autenticación
5. **test/memories.e2e-spec.ts** - ✅ Actualizado con autenticación
6. **test/groups.e2e-spec.ts** - ✅ Actualizado con autenticación
7. **test/integration.e2e-spec.ts** - ✅ Actualizado con autenticación

## Cambios Realizados

### Patrón General en los Tests

Cada suite de tests ahora:

1. **Crea un usuario de prueba con email único** en el `beforeAll`:
```typescript
// Usar timestamp para emails únicos
const timestamp = Date.now();
const userDto = {
  name: 'Test User',
  email: `test-${timestamp}@example.com`,
  password: 'password123',
};

await request(app.getHttpServer())
  .post('/users')  // Este endpoint es público
  .send(userDto)
  .expect(201);
```

**Importante:** Los emails deben ser únicos porque:
- Los tests se ejecutan en paralelo o secuencialmente sin limpiar la base de datos
- El campo `email` tiene una restricción de unicidad en la base de datos
- Usar `Date.now()` garantiza emails únicos en cada ejecución

2. **Hace login para obtener el token**:
```typescript
const loginResponse = await request(app.getHttpServer())
  .post('/auth/login')  // Este endpoint es público
  .send({
    email: userDto.email,
    password: userDto.password,
  })
  .expect(201);

authToken = loginResponse.body.access_token;
```

3. **Usa el token en todas las requests protegidas**:
```typescript
await request(app.getHttpServer())
  .get('/users')
  .set('Authorization', `Bearer ${authToken}`)  // Token JWT
  .expect(200);
```

### Tests de Integración

El archivo `integration.e2e-spec.ts` incluye:
- Helper functions actualizados con autenticación
- Flujo completo de creación de entidades relacionadas
- Verificación de integridad de datos
- Validaciones y casos límite

## Ejecutar Tests

### Opción 1: Con limpieza automática de base de datos (Recomendado)

Este script limpia la base de datos antes de ejecutar los tests, garantizando un estado limpio:

**En Windows (PowerShell):**
```powershell
.\scripts\run-all-tests.ps1
```

**En Linux/Mac:**
```bash
./scripts/run-all-tests.sh
```

### Opción 2: Limpiar manualmente y ejecutar tests

**Limpiar la base de datos:**
```powershell
# En PowerShell
$env:PGPASSWORD='postgres'; psql -U postgres -d dsi_backend -f scripts/clean-test-db.sql
```

**Ejecutar todos los tests:**
```bash
npm run test:e2e
```

### Opción 3: Tests individuales (sin limpieza)
```bash
# Usuarios
npm run test:e2e:users

# Trabajos
npm run test:e2e:works

# Patentes
npm run test:e2e:patents

# Memorias
npm run test:e2e:memories

# Grupos
npm run test:e2e:groups

# Integración
npm run test:e2e:integration
```

**⚠️ Nota:** Si ejecutas tests individuales sin limpiar la base de datos primero, pueden fallar por conflictos de emails duplicados.

## Estado Actual

✅ **Todos los tests pasan exitosamente** con el sistema de autenticación JWT implementado.

## Endpoints Públicos (No requieren autenticación)

Los siguientes endpoints NO requieren token JWT:

1. `GET /` - Hello World (endpoint raíz)
2. `POST /users` - Crear usuario (registro)
3. `POST /auth/login` - Login

## Endpoints Protegidos (Requieren autenticación)

Todos los demás endpoints requieren el header:
```
Authorization: Bearer <jwt-token>
```

Si no se proporciona el token o es inválido, se retorna un error 401 Unauthorized.

## Notas Importantes

### Contraseñas

- Las contraseñas se hashean automáticamente al crear o actualizar usuarios
- Los tests verifican que las contraseñas NO se almacenen en texto plano
- La contraseña hasheada debe ser diferente a la contraseña original

### Token JWT

- Los tokens tienen una expiración de 24 horas
- Se generan usando la clave secreta definida en `JWT_SECRET`
- Contienen el email y el ID del usuario

### Base de Datos de Prueba

Los tests utilizan la misma configuración de base de datos que el entorno de desarrollo. Asegúrate de tener la base de datos PostgreSQL corriendo antes de ejecutar los tests.

## Troubleshooting

### Error: 401 Unauthorized

Si obtienes errores 401 en los tests:
1. Verifica que el token se esté generando correctamente en el `beforeAll`
2. Asegúrate de que el header `Authorization` esté presente en las requests
3. Revisa que el usuario de prueba se haya creado exitosamente

### Error: 400 Bad Request al crear usuarios

Si obtienes errores 400 "Bad Request" al crear usuarios en los tests:
1. **Causa más común:** Email duplicado - el usuario ya existe en la base de datos
2. **Solución rápida:** Limpia la base de datos antes de ejecutar los tests:
   ```powershell
   # En PowerShell (Windows)
   .\scripts\run-all-tests.ps1
   ```
   ```bash
   # En Bash (Linux/Mac)
   ./scripts/run-all-tests.sh
   ```
3. **Solución manual:** El código ya usa timestamps en los emails para hacerlos únicos:
   ```typescript
   const timestamp = Date.now();
   email: `test-${timestamp}@example.com`
   ```
   Pero si ejecutas los tests múltiples veces muy rápido, los timestamps pueden colisionar.

### Error: Cannot connect to database

Si los tests no pueden conectarse a la base de datos:
1. Verifica que PostgreSQL esté corriendo
2. Revisa las variables de entorno en tu archivo `.env`
3. Asegúrate de que la base de datos exista

### Tests lentos

Si los tests tardan mucho:
- El hasheo de contraseñas con bcrypt es intencional (10 rounds)
- Esto garantiza seguridad en producción
- En tests, el tiempo adicional es aceptable para tener tests realistas

### Mejores Prácticas

1. **Usa el script de limpieza:** Siempre ejecuta `.\scripts\run-all-tests.ps1` (Windows) o `./scripts/run-all-tests.sh` (Linux/Mac) para garantizar un estado limpio
2. **Emails únicos:** El código ya usa timestamps en los emails para evitar duplicados
3. **Limpieza de datos:** El script automático limpia la base de datos antes de ejecutar tests
4. **Aislamiento:** Cada test debe ser independiente y no depender del estado de otros tests

## Scripts Disponibles

### `run-all-tests.ps1` (PowerShell)
- Limpia la base de datos automáticamente
- Ejecuta todos los tests E2E
- Muestra mensajes coloridos de progreso
- Maneja errores de conexión graciosamente

**Uso:**
```powershell
.\scripts\run-all-tests.ps1
```

**Variables de entorno que usa:**
- `DB_HOST` (default: localhost)
- `DB_PORT` (default: 5432)
- `DB_USERNAME` (default: postgres)
- `DB_PASSWORD` (default: postgres)
- `DB_DATABASE` (default: dsi_backend)

