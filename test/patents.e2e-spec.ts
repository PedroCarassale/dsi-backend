import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('Patents (e2e)', () => {
  let app: INestApplication<App>;
  let createdPatentId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
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
      };

      const response = await request(app.getHttpServer())
        .post('/patents')
        .send(createPatentDto)
        .expect(201);

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
        },
        {
          title: 'Patent Three',
          code: 'PAT-2024-003',
          description: 'Third patent description',
          organization: 'Org Three',
        },
      ];

      for (const patent of patents) {
        const response = await request(app.getHttpServer())
          .post('/patents')
          .send(patent)
          .expect(201);

        expect(response.body).toHaveProperty('id');
      }
    });
  });

  describe('GET /patents', () => {
    it('debería obtener todas las patentes', async () => {
      const response = await request(app.getHttpServer())
        .get('/patents')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      const patent = response.body[0];
      expect(patent).toHaveProperty('id');
      expect(patent).toHaveProperty('title');
      expect(patent).toHaveProperty('code');
      expect(patent).toHaveProperty('description');
      expect(patent).toHaveProperty('organization');
    });
  });

  describe('GET /patents/:id', () => {
    it('debería obtener una patente por ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/patents/${createdPatentId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', createdPatentId);
      expect(response.body).toHaveProperty('title', 'Test Patent');
      expect(response.body).toHaveProperty('code', 'PAT-2024-001');
      expect(response.body).toHaveProperty(
        'description',
        'This is a test patent description',
      );
      expect(response.body).toHaveProperty('organization', 'Test Organization');
    });

    it('debería retornar error 404 para ID inexistente', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      await request(app.getHttpServer()).get(`/patents/${fakeId}`).expect(404);
    });
  });

  describe('PATCH /patents/:id', () => {
    it('debería actualizar el título de una patente', async () => {
      const updatePatentDto = {
        title: 'Updated Patent Title',
      };

      const response = await request(app.getHttpServer())
        .patch(`/patents/${createdPatentId}`)
        .send(updatePatentDto)
        .expect(200);

      expect(response.body).toHaveProperty('id', createdPatentId);
      expect(response.body).toHaveProperty('title', 'Updated Patent Title');
      // Los otros campos no deben cambiar
      expect(response.body).toHaveProperty('code', 'PAT-2024-001');
      expect(response.body).toHaveProperty('organization', 'Test Organization');
    });

    it('debería actualizar múltiples campos', async () => {
      const updatePatentDto = {
        description: 'Updated description',
        organization: 'Updated Organization',
      };

      const response = await request(app.getHttpServer())
        .patch(`/patents/${createdPatentId}`)
        .send(updatePatentDto)
        .expect(200);

      expect(response.body).toHaveProperty('description', 'Updated description');
      expect(response.body).toHaveProperty('organization', 'Updated Organization');
    });
  });

  describe('DELETE /patents/:id', () => {
    it('debería eliminar una patente', async () => {
      await request(app.getHttpServer())
        .delete(`/patents/${createdPatentId}`)
        .expect(204);

      // Verificar que la patente fue eliminada
      await request(app.getHttpServer())
        .get(`/patents/${createdPatentId}`)
        .expect(404);
    });
  });
});

