import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { WorkType } from '../src/trabajos/enums/work-type.enum';

interface CreationResponse {
  message: string;
  id: string;
}

describe('Integration Tests (e2e)', () => {
  let app: INestApplication<App>;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Crear usuario de prueba y obtener token para autenticación con email único
    const timestamp = Date.now();
    const testUser = {
      name: 'Integration Test User',
      email: `integration-test-${timestamp}@example.com`,
      password: 'testpass123',
    };

    await request(app.getHttpServer()).post('/users').send(testUser).expect(201);

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      })
      .expect(201);

    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  // Helper function para validar respuestas de creación
  const validateCreationResponse = (response: request.Response, expectedMessage: string): string => {
    const body = response.body as CreationResponse;
    expect(body).toHaveProperty('message', expectedMessage);
    expect(body).toHaveProperty('id');
    expect(typeof body.id).toBe('string');
    expect(body.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    return body.id;
  };

  // Helper function para crear un usuario
  const createUser = async (name: string, email: string, password: string): Promise<string> => {
    const response = await request(app.getHttpServer()).post('/users').send({ name, email, password }).expect(201);
    return validateCreationResponse(response, 'User created successfully');
  };

  // Helper function para crear un trabajo
  const createWork = async (title: string, authors: string[], issn: string, journal: string, year: number, type: WorkType): Promise<string> => {
    const response = await request(app.getHttpServer()).post('/works').set('Authorization', `Bearer ${authToken}`).send({ title, authors, issn, journal, year, type }).expect(201);
    return validateCreationResponse(response, 'Work created successfully');
  };

  // Helper function para crear una patente
  const createPatent = async (title: string, code: string, description: string, organization: string): Promise<string> => {
    const response = await request(app.getHttpServer()).post('/patents').set('Authorization', `Bearer ${authToken}`).send({ title, code, description, organization }).expect(201);
    return validateCreationResponse(response, 'Patent created successfully');
  };

  // Helper function para crear una memoria
  const createMemory = async (name: string, year: number, works: { id: string }[], patents: { id: string }[]): Promise<string> => {
    const response = await request(app.getHttpServer()).post('/memories').set('Authorization', `Bearer ${authToken}`).send({ name, year, works, patents }).expect(201);
    return validateCreationResponse(response, 'Memory created successfully');
  };

  // Helper function para crear un grupo
  const createGroup = async (name: string, users: { id: string }[], memories: { id: string }[]): Promise<string> => {
    const response = await request(app.getHttpServer()).post('/groups').set('Authorization', `Bearer ${authToken}`).send({ name, users, memories }).expect(201);
    return validateCreationResponse(response, 'Group created successfully');
  };

  describe('Flujo completo: Crear grupos con usuarios y memorias con trabajos y patentes', () => {
    let userId1: string;
    let userId2: string;
    let workId1: string;
    let workId2: string;
    let patentId1: string;
    let patentId2: string;
    let memoryId1: string;
    let memoryId2: string;
    let groupId: string;

    it('Paso 1: Crear usuarios', async () => {
      const timestamp = Date.now();
      userId1 = await createUser('Integration User 1', `integration1-${timestamp}@test.com`, 'pass123');
      userId2 = await createUser('Integration User 2', `integration2-${timestamp}@test.com`, 'pass456');
    });

    it('Paso 2: Crear trabajos', async () => {
      workId1 = await createWork('Integration Article', ['Author 1', 'Author 2'], '1234-INT1', 'Integration Journal', 2024, WorkType.ARTICLE);
      workId2 = await createWork('Integration Book', ['Book Author'], '5678-INT2', 'Integration Publisher', 2023, WorkType.BOOK);
    });

    it('Paso 3: Crear patentes', async () => {
      patentId1 = await createPatent('Integration Patent 1', 'INT-PAT-001', 'First integration patent', 'Integration Org');
      patentId2 = await createPatent('Integration Patent 2', 'INT-PAT-002', 'Second integration patent', 'Integration Org');
    });

    it('Paso 4: Crear memorias con trabajos y patentes', async () => {
      memoryId1 = await createMemory('Integration Memory 2024', 2024, [{ id: workId1 }], [{ id: patentId1 }]);
      memoryId2 = await createMemory('Integration Memory 2023', 2023, [{ id: workId2 }], [{ id: patentId2 }]);
    });

    it('Paso 5: Crear grupo con usuarios y memorias', async () => {
      groupId = await createGroup('Integration Group', [{ id: userId1 }, { id: userId2 }], [{ id: memoryId1 }, { id: memoryId2 }]);
    });

    it('Paso 6: Verificar que el grupo se creó correctamente', async () => {
      const groupResponse = await request(app.getHttpServer()).get(`/groups/${groupId}`).set('Authorization', `Bearer ${authToken}`).expect(200);

      expect(groupResponse.body).toHaveProperty('name', 'Integration Group');
      expect(groupResponse.body).toHaveProperty('id', groupId);
    });

    it('Paso 7: Verificar que todas las entidades siguen existiendo', async () => {
      // Verificar usuarios
      await request(app.getHttpServer()).get(`/users/${userId1}`).set('Authorization', `Bearer ${authToken}`).expect(200);
      await request(app.getHttpServer()).get(`/users/${userId2}`).set('Authorization', `Bearer ${authToken}`).expect(200);

      // Verificar trabajos
      await request(app.getHttpServer()).get(`/works/${workId1}`).set('Authorization', `Bearer ${authToken}`).expect(200);
      await request(app.getHttpServer()).get(`/works/${workId2}`).set('Authorization', `Bearer ${authToken}`).expect(200);

      // Verificar patentes
      await request(app.getHttpServer()).get(`/patents/${patentId1}`).set('Authorization', `Bearer ${authToken}`).expect(200);
      await request(app.getHttpServer()).get(`/patents/${patentId2}`).set('Authorization', `Bearer ${authToken}`).expect(200);

      // Verificar memorias
      await request(app.getHttpServer()).get(`/memories/${memoryId1}`).set('Authorization', `Bearer ${authToken}`).expect(200);
      await request(app.getHttpServer()).get(`/memories/${memoryId2}`).set('Authorization', `Bearer ${authToken}`).expect(200);
    });

    it('Paso 8: Actualizar el grupo', async () => {
      const updateResponse = await request(app.getHttpServer())
        .patch(`/groups/${groupId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Integration Group',
        })
        .expect(200);

      expect(updateResponse.body).toHaveProperty('name', 'Updated Integration Group');
    });

    it('Paso 9: Limpiar - Eliminar grupo', async () => {
      await request(app.getHttpServer()).delete(`/groups/${groupId}`).set('Authorization', `Bearer ${authToken}`).expect(204);

      // Verificar que el grupo fue eliminado
      await request(app.getHttpServer()).get(`/groups/${groupId}`).set('Authorization', `Bearer ${authToken}`).expect(404);
    });

    it('Paso 10: Verificar que las entidades relacionadas siguen existiendo después de eliminar el grupo', async () => {
      // Los usuarios deben seguir existiendo
      await request(app.getHttpServer()).get(`/users/${userId1}`).set('Authorization', `Bearer ${authToken}`).expect(200);
      await request(app.getHttpServer()).get(`/users/${userId2}`).set('Authorization', `Bearer ${authToken}`).expect(200);

      // Las memorias deben seguir existiendo
      await request(app.getHttpServer()).get(`/memories/${memoryId1}`).set('Authorization', `Bearer ${authToken}`).expect(200);
      await request(app.getHttpServer()).get(`/memories/${memoryId2}`).set('Authorization', `Bearer ${authToken}`).expect(200);
    });
  });

  describe('Verificar validaciones y casos límite', () => {
    it('debería manejar correctamente la creación de múltiples entidades del mismo tipo', async () => {
      const workIds: string[] = [];

      // Crear 5 trabajos usando la función helper
      for (let i = 1; i <= 5; i++) {
        const workId = await createWork(`Bulk Work ${i}`, [`Author ${i}`], `BULK-${i}`, 'Bulk Journal', 2024, WorkType.ARTICLE);
        workIds.push(workId);
      }

      // Verificar que todos se crearon
      const allWorksResponse = await request(app.getHttpServer()).get('/works').set('Authorization', `Bearer ${authToken}`).expect(200);

      expect(Array.isArray(allWorksResponse.body)).toBe(true);
      expect((allWorksResponse.body as unknown[]).length).toBeGreaterThanOrEqual(5);
      expect(workIds).toHaveLength(5);
    });

    it('debería poder actualizar parcialmente cualquier entidad', async () => {
      // Crear un usuario usando la función helper
      const timestamp = Date.now();
      const userEmail = `partial-${timestamp}@test.com`;
      const userId = await createUser('Partial Update User', userEmail, 'password');

      // Actualizar solo el nombre
      const updateResponse = await request(app.getHttpServer()).patch(`/users/${userId}`).set('Authorization', `Bearer ${authToken}`).send({ name: 'New Name Only' }).expect(200);

      expect(updateResponse.body).toHaveProperty('name', 'New Name Only');
      expect(updateResponse.body).toHaveProperty('email', userEmail);
      // La contraseña debe estar hasheada, no en texto plano
      expect(updateResponse.body).toHaveProperty('password');
      expect(updateResponse.body.password).not.toBe('password');
    });
  });
});
