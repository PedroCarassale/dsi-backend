import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { WorkType } from '../src/trabajos/enums/work-type.enum';

describe('Works (e2e)', () => {
  let app: INestApplication<App>;
  let createdWorkId: string;
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
      name: 'Works Test User',
      email: `works-${timestamp}@example.com`,
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

    authToken = loginResponse.body.access_token as string;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /works', () => {
    it('debería crear un trabajo (article)', async () => {
      const createWorkDto = {
        title: 'Test Article',
        authors: ['John Doe', 'Jane Smith'],
        issn: '1234-5678',
        journal: 'Test Journal',
        year: 2024,
        type: WorkType.ARTICLE,
      };

      const response = await request(app.getHttpServer()).post('/works').set('Authorization', `Bearer ${authToken}`).send(createWorkDto).expect(201);

      expect(response.body).toHaveProperty('message', 'Work created successfully');
      expect(response.body).toHaveProperty('id');
      expect(typeof response.body.id).toBe('string');

      createdWorkId = response.body.id;
    });

    it('debería crear un trabajo (book)', async () => {
      const createWorkDto = {
        title: 'Test Book',
        authors: ['Author Name'],
        issn: '8765-4321',
        journal: 'Test Publisher',
        year: 2023,
        type: WorkType.BOOK,
      };

      const response = await request(app.getHttpServer()).post('/works').set('Authorization', `Bearer ${authToken}`).send(createWorkDto).expect(201);

      expect(response.body).toHaveProperty('id');
    });

    it('debería crear un trabajo (book_chapter)', async () => {
      const createWorkDto = {
        title: 'Test Book Chapter',
        authors: ['Chapter Author'],
        issn: '1111-2222',
        journal: 'Chapter Publisher',
        year: 2022,
        type: WorkType.BOOK_CHAPTER,
      };

      const response = await request(app.getHttpServer()).post('/works').set('Authorization', `Bearer ${authToken}`).send(createWorkDto).expect(201);

      expect(response.body).toHaveProperty('id');
    });
  });

  describe('GET /works', () => {
    it('debería obtener todos los trabajos', async () => {
      const response = await request(app.getHttpServer()).get('/works').set('Authorization', `Bearer ${authToken}`).expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      const work = response.body[0];
      expect(work).toHaveProperty('id');
      expect(work).toHaveProperty('title');
      expect(work).toHaveProperty('authors');
      expect(work).toHaveProperty('issn');
      expect(work).toHaveProperty('journal');
      expect(work).toHaveProperty('year');
      expect(work).toHaveProperty('type');
      expect(Array.isArray(work.authors)).toBe(true);
      expect(Object.values(WorkType)).toContain(work.type);
    });
  });

  describe('GET /works/:id', () => {
    it('debería obtener un trabajo por ID', async () => {
      const response = await request(app.getHttpServer()).get(`/works/${createdWorkId}`).set('Authorization', `Bearer ${authToken}`).expect(200);

      expect(response.body).toHaveProperty('id', createdWorkId);
      expect(response.body).toHaveProperty('title', 'Test Article');
      expect(response.body.authors).toEqual(['John Doe', 'Jane Smith']);
      expect(response.body).toHaveProperty('issn', '1234-5678');
      expect(response.body).toHaveProperty('journal', 'Test Journal');
      expect(response.body).toHaveProperty('year', 2024);
      expect(response.body).toHaveProperty('type', WorkType.ARTICLE);
    });

    it('debería retornar error 404 para ID inexistente', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      await request(app.getHttpServer()).get(`/works/${fakeId}`).set('Authorization', `Bearer ${authToken}`).expect(404);
    });
  });

  describe('PATCH /works/:id', () => {
    it('debería actualizar un trabajo', async () => {
      const updateWorkDto = {
        title: 'Updated Test Article',
        year: 2025,
      };

      const response = await request(app.getHttpServer()).patch(`/works/${createdWorkId}`).set('Authorization', `Bearer ${authToken}`).send(updateWorkDto).expect(200);

      expect(response.body).toHaveProperty('id', createdWorkId);
      expect(response.body).toHaveProperty('title', 'Updated Test Article');
      expect(response.body).toHaveProperty('year', 2025);
      expect(response.body.authors).toEqual(['John Doe', 'Jane Smith']);
      expect(response.body).toHaveProperty('issn', '1234-5678');
    });

    it('debería actualizar los autores de un trabajo', async () => {
      const updateWorkDto = {
        authors: ['New Author 1', 'New Author 2', 'New Author 3'],
      };

      const response = await request(app.getHttpServer()).patch(`/works/${createdWorkId}`).set('Authorization', `Bearer ${authToken}`).send(updateWorkDto).expect(200);

      expect(response.body.authors).toEqual(['New Author 1', 'New Author 2', 'New Author 3']);
    });
  });

  describe('DELETE /works/:id', () => {
    it('debería eliminar un trabajo', async () => {
      await request(app.getHttpServer()).delete(`/works/${createdWorkId}`).set('Authorization', `Bearer ${authToken}`).expect(204);

      await request(app.getHttpServer()).get(`/works/${createdWorkId}`).set('Authorization', `Bearer ${authToken}`).expect(404);
    });
  });
});
