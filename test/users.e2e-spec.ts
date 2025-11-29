import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('Users (e2e)', () => {
  let app: INestApplication<App>;
  let createdUserId: string;
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
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /users', () => {
    it('debería crear un usuario', async () => {
      const timestamp = Date.now();
      const createUserDto = {
        name: 'Test User',
        email: `test-${timestamp}@example.com`,
        password: 'password123',
      };

      const response = await request(app.getHttpServer()).post('/users').send(createUserDto).expect(201);

      expect(response.body).toHaveProperty('message', 'User created successfully');
      expect(response.body).toHaveProperty('id');
      expect(typeof response.body.id).toBe('string');

      createdUserId = response.body.id;

      // Hacer login para obtener token
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: createUserDto.email,
          password: createUserDto.password,
        })
        .expect(201);

      expect(loginResponse.body).toHaveProperty('access_token');
      authToken = loginResponse.body.access_token;
    });

    it('debería crear múltiples usuarios', async () => {
      const timestamp = Date.now();
      const users = [
        {
          name: 'User Two',
          email: `user2-${timestamp}@example.com`,
          password: 'pass123',
        },
        {
          name: 'User Three',
          email: `user3-${timestamp}@example.com`,
          password: 'pass456',
        },
      ];

      for (const user of users) {
        const response = await request(app.getHttpServer()).post('/users').send(user).expect(201);

        expect(response.body).toHaveProperty('id');
      }
    });
  });

  describe('GET /users', () => {
    it('debería obtener todos los usuarios con autenticación', async () => {
      const response = await request(app.getHttpServer()).get('/users').set('Authorization', `Bearer ${authToken}`).expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      const user = response.body[0];
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('name');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('password');
    });

    it('debería retornar 401 sin autenticación', async () => {
      await request(app.getHttpServer()).get('/users').expect(401);
    });
  });

  describe('GET /users/:id', () => {
    it('debería obtener un usuario por ID', async () => {
      const response = await request(app.getHttpServer()).get(`/users/${createdUserId}`).set('Authorization', `Bearer ${authToken}`).expect(200);

      expect(response.body).toHaveProperty('id', createdUserId);
      expect(response.body).toHaveProperty('name', 'Test User');
      expect(response.body).toHaveProperty('email');
      expect(response.body.email).toMatch(/^test-\d+@example\.com$/);
      // La contraseña debe estar hasheada, no en texto plano
      expect(response.body).toHaveProperty('password');
      expect(response.body.password).not.toBe('password123');
    });

    it('debería retornar error 404 para ID inexistente', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      await request(app.getHttpServer()).get(`/users/${fakeId}`).set('Authorization', `Bearer ${authToken}`).expect(404);
    });
  });

  describe('PATCH /users/:id', () => {
    it('debería actualizar el nombre de un usuario', async () => {
      const updateUserDto = {
        name: 'Updated User Name',
      };

      const response = await request(app.getHttpServer()).patch(`/users/${createdUserId}`).set('Authorization', `Bearer ${authToken}`).send(updateUserDto).expect(200);

      expect(response.body).toHaveProperty('id', createdUserId);
      expect(response.body).toHaveProperty('name', 'Updated User Name');
      // El email no debe cambiar, solo verificamos que existe
      expect(response.body).toHaveProperty('email');
      expect(response.body.email).toMatch(/^test-\d+@example\.com$/);
    });

    it('debería actualizar el email de un usuario', async () => {
      const timestamp = Date.now();
      const newEmail = `newemail-${timestamp}@example.com`;
      const updateUserDto = {
        email: newEmail,
      };

      const response = await request(app.getHttpServer()).patch(`/users/${createdUserId}`).set('Authorization', `Bearer ${authToken}`).send(updateUserDto).expect(200);

      expect(response.body).toHaveProperty('email', newEmail);
    });

    it('debería actualizar la contraseña de un usuario', async () => {
      const updateUserDto = {
        password: 'newpassword123',
      };

      const response = await request(app.getHttpServer()).patch(`/users/${createdUserId}`).set('Authorization', `Bearer ${authToken}`).send(updateUserDto).expect(200);

      // La contraseña debe estar hasheada
      expect(response.body).toHaveProperty('password');
      expect(response.body.password).not.toBe('newpassword123');
    });
  });

  describe('DELETE /users/:id', () => {
    it('debería eliminar un usuario', async () => {
      await request(app.getHttpServer()).delete(`/users/${createdUserId}`).set('Authorization', `Bearer ${authToken}`).expect(204);

      // Verificar que el usuario fue eliminado
      await request(app.getHttpServer()).get(`/users/${createdUserId}`).set('Authorization', `Bearer ${authToken}`).expect(404);
    });
  });
});
