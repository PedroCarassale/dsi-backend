# 📚 Ejemplos de Tests y Resultados Esperados

## Estructura de un Test E2E

Cada test sigue este patrón:

```typescript
describe('Nombre del módulo (e2e)', () => {
  let app: INestApplication<App>;
  let createdEntityId: string;

  beforeAll(async () => {
    // Se crea la app NestJS una vez
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    // Se cierra la app al terminar
    await app.close();
  });

  // Tests individuales...
});
```

## Ejemplos de Tests

### 1. Test de Creación (CREATE)

```typescript
it('debería crear un trabajo (article)', async () => {
  const createWorkDto = {
    title: 'Test Article',
    authors: ['John Doe', 'Jane Smith'],
    issn: '1234-5678',
    journal: 'Test Journal',
    year: 2024,
    type: WorkType.ARTICLE,
  };

  const response = await request(app.getHttpServer())
    .post('/works')
    .send(createWorkDto)
    .expect(201);

  expect(response.body).toHaveProperty('message', 'Work created successfully');
  expect(response.body).toHaveProperty('id');
  expect(typeof response.body.id).toBe('string');

  createdWorkId = response.body.id;
});
```

**Verifica:**
- ✅ Código de respuesta 201 (Created)
- ✅ Mensaje de éxito en la respuesta
- ✅ Se devuelve un ID válido (UUID)
- ✅ Los datos se guardan en la base de datos

### 2. Test de Lectura (READ)

```typescript
it('debería obtener un trabajo por ID', async () => {
  const response = await request(app.getHttpServer())
    .get(`/works/${createdWorkId}`)
    .expect(200);

  expect(response.body).toHaveProperty('id', createdWorkId);
  expect(response.body).toHaveProperty('title', 'Test Article');
  expect(response.body.authors).toEqual(['John Doe', 'Jane Smith']);
  expect(response.body).toHaveProperty('issn', '1234-5678');
});
```

**Verifica:**
- ✅ Código de respuesta 200 (OK)
- ✅ Se obtiene la entidad correcta por ID
- ✅ Todos los campos tienen los valores correctos
- ✅ Los arrays y objetos complejos se devuelven correctamente

### 3. Test de Actualización (UPDATE)

```typescript
it('debería actualizar un trabajo', async () => {
  const updateWorkDto = {
    title: 'Updated Test Article',
    year: 2025,
  };

  const response = await request(app.getHttpServer())
    .patch(`/works/${createdWorkId}`)
    .send(updateWorkDto)
    .expect(200);

  expect(response.body).toHaveProperty('title', 'Updated Test Article');
  expect(response.body).toHaveProperty('year', 2025);
  // Los campos no actualizados deben permanecer igual
  expect(response.body.authors).toEqual(['John Doe', 'Jane Smith']);
});
```

**Verifica:**
- ✅ Código de respuesta 200 (OK)
- ✅ Los campos actualizados tienen los nuevos valores
- ✅ Los campos no actualizados permanecen sin cambios
- ✅ Actualizaciones parciales funcionan correctamente

### 4. Test de Eliminación (DELETE)

```typescript
it('debería eliminar un trabajo', async () => {
  await request(app.getHttpServer())
    .delete(`/works/${createdWorkId}`)
    .expect(204);

  // Verificar que el trabajo fue eliminado
  await request(app.getHttpServer())
    .get(`/works/${createdWorkId}`)
    .expect(404);
});
```

**Verifica:**
- ✅ Código de respuesta 204 (No Content) en eliminación
- ✅ La entidad ya no existe (404 al intentar obtenerla)
- ✅ La eliminación es efectiva en la base de datos

### 5. Test de Relaciones Many-to-Many

```typescript
it('debería crear una memoria con works y patents', async () => {
  const createMemoryDto = {
    name: 'Test Memory 2023',
    year: 2023,
    works: [{ id: createdWorkId }],
    patents: [{ id: createdPatentId }],
  };

  const response = await request(app.getHttpServer())
    .post('/memories')
    .send(createMemoryDto)
    .expect(201);

  expect(response.body).toHaveProperty('id');
});
```

**Verifica:**
- ✅ Se pueden crear relaciones many-to-many
- ✅ Las relaciones se guardan correctamente
- ✅ Las entidades relacionadas mantienen su integridad

### 6. Test de Integridad Referencial

```typescript
it('los works y patents relacionados deben seguir existiendo después de eliminar una memoria', async () => {
  // Eliminar la memoria
  await request(app.getHttpServer())
    .delete(`/memories/${createdMemoryId}`)
    .expect(204);

  // Verificar que el work sigue existiendo
  const workResponse = await request(app.getHttpServer())
    .get(`/works/${createdWorkId}`)
    .expect(200);
  expect(workResponse.body).toHaveProperty('id', createdWorkId);

  // Verificar que la patent sigue existiendo
  const patentResponse = await request(app.getHttpServer())
    .get(`/patents/${createdPatentId}`)
    .expect(200);
  expect(patentResponse.body).toHaveProperty('id', createdPatentId);
});
```

**Verifica:**
- ✅ Las eliminaciones no borran entidades relacionadas
- ✅ Solo se eliminan las relaciones en la tabla intermedia
- ✅ La integridad referencial se mantiene

### 7. Test de Manejo de Errores

```typescript
it('debería retornar error 404 para ID inexistente', async () => {
  const fakeId = '00000000-0000-0000-0000-000000000000';
  await request(app.getHttpServer())
    .get(`/works/${fakeId}`)
    .expect(404);
});
```

**Verifica:**
- ✅ Se manejan correctamente IDs inexistentes
- ✅ Se devuelven códigos de error apropiados
- ✅ La aplicación no crashea con datos inválidos

## Resultado Esperado al Ejecutar

### Cuando todo pasa ✅

```
PASS  test/works.e2e-spec.ts
  Works (e2e)
    POST /works
      ✓ debería crear un trabajo (article) (150ms)
      ✓ debería crear un trabajo (book) (45ms)
      ✓ debería crear un trabajo (book_chapter) (42ms)
    GET /works
      ✓ debería obtener todos los trabajos (38ms)
    GET /works/:id
      ✓ debería obtener un trabajo por ID (35ms)
      ✓ debería retornar error 404 para ID inexistente (32ms)
    PATCH /works/:id
      ✓ debería actualizar un trabajo (40ms)
      ✓ debería actualizar los autores de un trabajo (38ms)
    DELETE /works/:id
      ✓ debería eliminar un trabajo (35ms)

Test Suites: 1 passed, 1 total
Tests:       9 passed, 9 total
Snapshots:   0 total
Time:        2.456s
```

### Cuando algo falla ❌

```
FAIL  test/works.e2e-spec.ts
  Works (e2e)
    POST /works
      ✕ debería crear un trabajo (article) (150ms)

  ● Works (e2e) › POST /works › debería crear un trabajo (article)

    expect(received).toBe(expected) // Object.is equality

    Expected: 201
    Received: 500

      at Object.<anonymous> (test/works.e2e-spec.ts:28:9)
```

**Posibles causas de fallos:**
- ❌ Base de datos no está corriendo
- ❌ Variables de entorno incorrectas
- ❌ Error en el código del controlador/servicio
- ❌ Validaciones que fallan

## Tips para Debugging

### 1. Ejecutar con verbose
```bash
npm run test:e2e:verbose
```

### 2. Ejecutar solo el test que falla
```bash
npm run test:e2e:works
```

### 3. Agregar logs temporales
```typescript
it('debería crear un trabajo', async () => {
  const response = await request(app.getHttpServer())
    .post('/works')
    .send(createWorkDto);
  
  console.log('Response:', response.body);
  console.log('Status:', response.status);
  
  expect(response.status).toBe(201);
});
```

### 4. Usar --detectOpenHandles
```bash
npx jest --config ./test/jest-e2e.json --detectOpenHandles
```

Ayuda a identificar conexiones que no se cerraron correctamente.

## Buenas Prácticas

1. ✅ **Orden de tests**: Los tests se ejecutan en orden, por eso guardamos IDs
2. ✅ **Limpieza**: Cada suite limpia su app en `afterAll`
3. ✅ **Aislamiento**: Cada suite tiene su propio contexto
4. ✅ **Nombres descriptivos**: Los `it()` describen claramente qué se prueba
5. ✅ **Múltiples expects**: Cada test puede tener varias verificaciones

## Más Información

- Ver tests reales en: `test/*.e2e-spec.ts`
- Documentación NestJS Testing: https://docs.nestjs.com/fundamentals/testing
- SuperTest docs: https://github.com/visionmedia/supertest

