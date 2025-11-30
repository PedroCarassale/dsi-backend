import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('Patents (e2e)', () => {
  let app: INestApplication<App>;
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
      name: 'Patents Test User',
      email: `patents-${timestamp}@example.com`,
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
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /patents', () => {
    it('debería crear una patente', async () => {
      const createPatentDto = {
        title: 'Test Patent',
        code: 'PAT-2024-001',
        description: 'This is a test patent description',
        organization: 'Test Organization',
        year: 2024,
      };

      const response = await request(app.getHttpServer()).post('/patents').set('Authorization', `Bearer ${authToken}`).send(createPatentDto).expect(201);

      expect(response.body).toHaveProperty('message', 'Patent created successfully');
      expect(response.body).toHaveProperty('id');
      expect(typeof response.body.id).toBe('string');

      createdPatentId = response.body.id;
    });

    it('debería crear múltiples patentes', async () => {
      const patents = [
        {
          title: 'Patent Two',
          code: 'PAT-2024-002',
          description: 'Second patent description',
          organization: 'Org Two',
          year: 2024,
        },
        {
          title: 'Patent Three',
          code: 'PAT-2024-003',
          description: 'Third patent description',
          organization: 'Org Three',
          year: 2024,
        },
      ];

      for (const patent of patents) {
        const response = await request(app.getHttpServer()).post('/patents').set('Authorization', `Bearer ${authToken}`).send(patent).expect(201);

        expect(response.body).toHaveProperty('id');
      }
    });
  });

  describe('GET /patents', () => {
    it('debería obtener todas las patentes', async () => {
      const response = await request(app.getHttpServer()).get('/patents').set('Authorization', `Bearer ${authToken}`).expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      const patent = response.body[0];
      expect(patent).toHaveProperty('id');
      expect(patent).toHaveProperty('title');
      expect(patent).toHaveProperty('code');
      expect(patent).toHaveProperty('description');
      expect(patent).toHaveProperty('organization');
      expect(patent).toHaveProperty('year');
    });
  });

  describe('GET /patents/:id', () => {
    it('debería obtener una patente por ID', async () => {
      const response = await request(app.getHttpServer()).get(`/patents/${createdPatentId}`).set('Authorization', `Bearer ${authToken}`).expect(200);

      expect(response.body).toHaveProperty('id', createdPatentId);
      expect(response.body).toHaveProperty('title', 'Test Patent');
      expect(response.body).toHaveProperty('code', 'PAT-2024-001');
      expect(response.body).toHaveProperty('description', 'This is a test patent description');
      expect(response.body).toHaveProperty('organization', 'Test Organization');
      expect(response.body).toHaveProperty('year', 2024);
    });

    it('debería retornar error 404 para ID inexistente', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      await request(app.getHttpServer()).get(`/patents/${fakeId}`).set('Authorization', `Bearer ${authToken}`).expect(404);
    });
  });

  describe('PATCH /patents/:id', () => {
    it('debería actualizar el título de una patente', async () => {
      const updatePatentDto = {
        title: 'Updated Patent Title',
      };

      const response = await request(app.getHttpServer()).patch(`/patents/${createdPatentId}`).set('Authorization', `Bearer ${authToken}`).send(updatePatentDto).expect(200);

      expect(response.body).toHaveProperty('id', createdPatentId);
      expect(response.body).toHaveProperty('title', 'Updated Patent Title');
      expect(response.body).toHaveProperty('code', 'PAT-2024-001');
      expect(response.body).toHaveProperty('organization', 'Test Organization');
    });

    it('debería actualizar múltiples campos', async () => {
      const updatePatentDto = {
        description: 'Updated description',
        organization: 'Updated Organization',
        year: 2025,
      };

      const response = await request(app.getHttpServer()).patch(`/patents/${createdPatentId}`).set('Authorization', `Bearer ${authToken}`).send(updatePatentDto).expect(200);

      expect(response.body).toHaveProperty('description', 'Updated description');
      expect(response.body).toHaveProperty('organization', 'Updated Organization');
      expect(response.body).toHaveProperty('year', 2025);
    });
  });

  describe('DELETE /patents/:id', () => {
    it('debería eliminar una patente', async () => {
      await request(app.getHttpServer()).delete(`/patents/${createdPatentId}`).set('Authorization', `Bearer ${authToken}`).expect(204);

      await request(app.getHttpServer()).get(`/patents/${createdPatentId}`).set('Authorization', `Bearer ${authToken}`).expect(404);
    });
  });
});
