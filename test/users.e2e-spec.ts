import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('Users (e2e)', () => {
  let app: INestApplication<App>;
  let createdUserId: string;

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

  describe('POST /users', () => {
    it('debería crear un usuario', async () => {
      const createUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      const response = await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'User created successfully');
      expect(response.body).toHaveProperty('id');
      expect(typeof response.body.id).toBe('string');

      createdUserId = response.body.id;
    });

    it('debería crear múltiples usuarios', async () => {
      const users = [
        {
          name: 'User Two',
          email: 'user2@example.com',
          password: 'pass123',
        },
        {
          name: 'User Three',
          email: 'user3@example.com',
          password: 'pass456',
        },
      ];

      for (const user of users) {
        const response = await request(app.getHttpServer())
          .post('/users')
          .send(user)
          .expect(201);

        expect(response.body).toHaveProperty('id');
      }
    });
  });

  describe('GET /users', () => {
    it('debería obtener todos los usuarios', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      const user = response.body[0];
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('name');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('password');
    });
  });

  describe('GET /users/:id', () => {
    it('debería obtener un usuario por ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/${createdUserId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', createdUserId);
      expect(response.body).toHaveProperty('name', 'Test User');
      expect(response.body).toHaveProperty('email', 'test@example.com');
      expect(response.body).toHaveProperty('password', 'password123');
    });

    it('debería retornar error 404 para ID inexistente', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      await request(app.getHttpServer()).get(`/users/${fakeId}`).expect(404);
    });
  });

  describe('PATCH /users/:id', () => {
    it('debería actualizar el nombre de un usuario', async () => {
      const updateUserDto = {
        name: 'Updated User Name',
      };

      const response = await request(app.getHttpServer())
        .patch(`/users/${createdUserId}`)
        .send(updateUserDto)
        .expect(200);

      expect(response.body).toHaveProperty('id', createdUserId);
      expect(response.body).toHaveProperty('name', 'Updated User Name');
      // El email no debe cambiar
      expect(response.body).toHaveProperty('email', 'test@example.com');
    });

    it('debería actualizar el email de un usuario', async () => {
      const updateUserDto = {
        email: 'newemail@example.com',
      };

      const response = await request(app.getHttpServer())
        .patch(`/users/${createdUserId}`)
        .send(updateUserDto)
        .expect(200);

      expect(response.body).toHaveProperty('email', 'newemail@example.com');
    });

    it('debería actualizar la contraseña de un usuario', async () => {
      const updateUserDto = {
        password: 'newpassword123',
      };

      const response = await request(app.getHttpServer())
        .patch(`/users/${createdUserId}`)
        .send(updateUserDto)
        .expect(200);

      expect(response.body).toHaveProperty('password', 'newpassword123');
    });
  });

  describe('DELETE /users/:id', () => {
    it('debería eliminar un usuario', async () => {
      await request(app.getHttpServer())
        .delete(`/users/${createdUserId}`)
        .expect(204);

      // Verificar que el usuario fue eliminado
      await request(app.getHttpServer())
        .get(`/users/${createdUserId}`)
        .expect(404);
    });
  });
});

