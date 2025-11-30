import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { WorkType } from '../src/trabajos/enums/work-type.enum';

describe('Memories (e2e)', () => {
  let app: INestApplication<App>;
  let createdMemoryId: string;
  let createdWorkId: string;
  let createdPatentId: string;
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

    const timestamp = Date.now();
    const userDto = {
      name: 'Memories Test User',
      email: `memories-${timestamp}@example.com`,
      password: 'password123',
    };

    await request(app.getHttpServer()).post('/users').send(userDto).expect(201);

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: userDto.email,
        password: userDto.password,
      })
      .expect(201);

    authToken = loginResponse.body.access_token;

    const workResponse = await request(app.getHttpServer())
      .post('/works')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Memory Test Work',
        authors: ['Test Author'],
        issn: '1111-1111',
        journal: 'Test Journal',
        year: 2024,
        type: WorkType.ARTICLE,
      });
    createdWorkId = workResponse.body.id;

    const patentResponse = await request(app.getHttpServer()).post('/patents').set('Authorization', `Bearer ${authToken}`).send({
      title: 'Memory Test Patent',
      code: 'MEM-PAT-001',
      description: 'Test patent for memories',
      organization: 'Test Org',
      year: 2025,
    });
    createdPatentId = patentResponse.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /memories', () => {
    it('debería crear una memoria sin relaciones', async () => {
      const createMemoryDto = {
        name: 'Test Memory 2024',
        year: 2024,
        works: [],
        patents: [],
      };

      const response = await request(app.getHttpServer()).post('/memories').set('Authorization', `Bearer ${authToken}`).send(createMemoryDto).expect(201);

      expect(response.body).toHaveProperty('message', 'Memory created successfully');
      expect(response.body).toHaveProperty('id');
      expect(typeof response.body.id).toBe('string');

      createdMemoryId = response.body.id;
    });

    it('debería crear una memoria con works y patents', async () => {
      const createMemoryDto = {
        name: 'Test Memory 2023',
        year: 2023,
        works: [{ id: createdWorkId }],
        patents: [{ id: createdPatentId }],
      };

      const response = await request(app.getHttpServer()).post('/memories').set('Authorization', `Bearer ${authToken}`).send(createMemoryDto).expect(201);

      expect(response.body).toHaveProperty('id');
    });
  });

  describe('GET /memories', () => {
    it('debería obtener todas las memorias', async () => {
      const response = await request(app.getHttpServer()).get('/memories').set('Authorization', `Bearer ${authToken}`).expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      const memory = response.body[0];
      expect(memory).toHaveProperty('id');
      expect(memory).toHaveProperty('name');
      expect(memory).toHaveProperty('year');
      expect(typeof memory.year).toBe('number');
    });
  });

  describe('GET /memories/:id', () => {
    it('debería obtener una memoria por ID', async () => {
      const response = await request(app.getHttpServer()).get(`/memories/${createdMemoryId}`).set('Authorization', `Bearer ${authToken}`).expect(200);

      expect(response.body).toHaveProperty('id', createdMemoryId);
      expect(response.body).toHaveProperty('name', 'Test Memory 2024');
      expect(response.body).toHaveProperty('year', 2024);
    });

    it('debería retornar error 404 para ID inexistente', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      await request(app.getHttpServer()).get(`/memories/${fakeId}`).set('Authorization', `Bearer ${authToken}`).expect(404);
    });
  });

  describe('PATCH /memories/:id', () => {
    it('debería actualizar el nombre de una memoria', async () => {
      const updateMemoryDto = {
        name: 'Updated Memory Name',
      };

      const response = await request(app.getHttpServer()).patch(`/memories/${createdMemoryId}`).set('Authorization', `Bearer ${authToken}`).send(updateMemoryDto).expect(200);

      expect(response.body).toHaveProperty('id', createdMemoryId);
      expect(response.body).toHaveProperty('name', 'Updated Memory Name');
      expect(response.body).toHaveProperty('year', 2024);
    });

    it('debería actualizar el año de una memoria', async () => {
      const updateMemoryDto = {
        year: 2025,
      };

      const response = await request(app.getHttpServer()).patch(`/memories/${createdMemoryId}`).set('Authorization', `Bearer ${authToken}`).send(updateMemoryDto).expect(200);

      expect(response.body).toHaveProperty('year', 2025);
    });

    it('debería actualizar las relaciones de una memoria', async () => {
      const updateMemoryDto = {
        works: [{ id: createdWorkId }],
        patents: [{ id: createdPatentId }],
      };

      const response = await request(app.getHttpServer()).patch(`/memories/${createdMemoryId}`).set('Authorization', `Bearer ${authToken}`).send(updateMemoryDto).expect(200);

      expect(response.body).toHaveProperty('id', createdMemoryId);
    });
  });

  describe('DELETE /memories/:id', () => {
    it('debería eliminar una memoria', async () => {
      await request(app.getHttpServer()).delete(`/memories/${createdMemoryId}`).set('Authorization', `Bearer ${authToken}`).expect(204);

      await request(app.getHttpServer()).get(`/memories/${createdMemoryId}`).set('Authorization', `Bearer ${authToken}`).expect(404);
    });
  });

  describe('Verificar integridad de datos', () => {
    it('los works y patents relacionados deben seguir existiendo después de eliminar una memoria', async () => {
      const workResponse = await request(app.getHttpServer()).get(`/works/${createdWorkId}`).set('Authorization', `Bearer ${authToken}`).expect(200);
      expect(workResponse.body).toHaveProperty('id', createdWorkId);

      const patentResponse = await request(app.getHttpServer()).get(`/patents/${createdPatentId}`).set('Authorization', `Bearer ${authToken}`).expect(200);
      expect(patentResponse.body).toHaveProperty('id', createdPatentId);
    });
  });
});
