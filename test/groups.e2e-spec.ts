import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('Groups (e2e)', () => {
  let app: INestApplication<App>;
  let createdGroupId: string;
  let createdUserId: string;
  let createdMemoryId: string;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    // Crear usuario y obtener token con email único
    const timestamp = Date.now();
    const userDto = {
      name: 'Groups Test User',
      email: `groups-${timestamp}@example.com`,
      password: 'password123',
    };

    const userResponse = await request(app.getHttpServer()).post('/users').send(userDto).expect(201);
    createdUserId = userResponse.body.id;

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: userDto.email,
        password: userDto.password,
      })
      .expect(201);

    authToken = loginResponse.body.access_token;

    // Crear una memoria para usar en los grupos
    const memoryResponse = await request(app.getHttpServer()).post('/memories').set('Authorization', `Bearer ${authToken}`).send({
      name: 'Group Test Memory',
      year: 2024,
      works: [],
      patents: [],
    });
    createdMemoryId = memoryResponse.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /groups', () => {
    it('debería crear un grupo sin relaciones', async () => {
      const createGroupDto = {
        name: 'Test Group',
        users: [],
        memories: [],
      };

      const response = await request(app.getHttpServer()).post('/groups').set('Authorization', `Bearer ${authToken}`).send(createGroupDto).expect(201);

      expect(response.body).toHaveProperty('message', 'Group created successfully');
      expect(response.body).toHaveProperty('id');
      expect(typeof response.body.id).toBe('string');

      createdGroupId = response.body.id;
    });

    it('debería crear un grupo con usuarios y memorias', async () => {
      const createGroupDto = {
        name: 'Test Group with Relations',
        users: [{ id: createdUserId }],
        memories: [{ id: createdMemoryId }],
      };

      const response = await request(app.getHttpServer()).post('/groups').set('Authorization', `Bearer ${authToken}`).send(createGroupDto).expect(201);

      expect(response.body).toHaveProperty('id');
    });
  });

  describe('GET /groups', () => {
    it('debería obtener todos los grupos', async () => {
      const response = await request(app.getHttpServer()).get('/groups').set('Authorization', `Bearer ${authToken}`).expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      const group = response.body[0];
      expect(group).toHaveProperty('id');
      expect(group).toHaveProperty('name');
    });
  });

  describe('GET /groups/:id', () => {
    it('debería obtener un grupo por ID', async () => {
      const response = await request(app.getHttpServer()).get(`/groups/${createdGroupId}`).set('Authorization', `Bearer ${authToken}`).expect(200);

      expect(response.body).toHaveProperty('id', createdGroupId);
      expect(response.body).toHaveProperty('name', 'Test Group');
    });

    it('debería retornar error 404 para ID inexistente', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      await request(app.getHttpServer()).get(`/groups/${fakeId}`).set('Authorization', `Bearer ${authToken}`).expect(404);
    });
  });

  describe('PATCH /groups/:id', () => {
    it('debería actualizar el nombre de un grupo', async () => {
      const updateGroupDto = {
        name: 'Updated Group Name',
      };

      const response = await request(app.getHttpServer()).patch(`/groups/${createdGroupId}`).set('Authorization', `Bearer ${authToken}`).send(updateGroupDto).expect(200);

      expect(response.body).toHaveProperty('id', createdGroupId);
      expect(response.body).toHaveProperty('name', 'Updated Group Name');
    });

    it('debería actualizar las relaciones de un grupo', async () => {
      const updateGroupDto = {
        users: [{ id: createdUserId }],
        memories: [{ id: createdMemoryId }],
      };

      const response = await request(app.getHttpServer()).patch(`/groups/${createdGroupId}`).set('Authorization', `Bearer ${authToken}`).send(updateGroupDto).expect(200);

      expect(response.body).toHaveProperty('id', createdGroupId);
    });

    it('debería poder limpiar las relaciones de un grupo', async () => {
      const updateGroupDto = {
        users: [],
        memories: [],
      };

      const response = await request(app.getHttpServer()).patch(`/groups/${createdGroupId}`).set('Authorization', `Bearer ${authToken}`).send(updateGroupDto).expect(200);

      expect(response.body).toHaveProperty('id', createdGroupId);
    });
  });

  describe('DELETE /groups/:id', () => {
    it('debería eliminar un grupo', async () => {
      await request(app.getHttpServer()).delete(`/groups/${createdGroupId}`).set('Authorization', `Bearer ${authToken}`).expect(204);

      // Verificar que el grupo fue eliminado
      await request(app.getHttpServer()).get(`/groups/${createdGroupId}`).set('Authorization', `Bearer ${authToken}`).expect(404);
    });
  });

  describe('Verificar integridad de datos', () => {
    it('los users y memories relacionados deben seguir existiendo después de eliminar un grupo', async () => {
      // Verificar que el user sigue existiendo
      const userResponse = await request(app.getHttpServer()).get(`/users/${createdUserId}`).set('Authorization', `Bearer ${authToken}`).expect(200);
      expect(userResponse.body).toHaveProperty('id', createdUserId);

      // Verificar que la memory sigue existiendo
      const memoryResponse = await request(app.getHttpServer()).get(`/memories/${createdMemoryId}`).set('Authorization', `Bearer ${authToken}`).expect(200);
      expect(memoryResponse.body).toHaveProperty('id', createdMemoryId);
    });
  });
});
