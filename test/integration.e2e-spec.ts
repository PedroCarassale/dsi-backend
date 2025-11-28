import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { WorkType } from '../src/trabajos/enums/work-type.enum';

describe('Integration Tests (e2e)', () => {
  let app: INestApplication<App>;

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
      // Usuario 1
      const user1Response = await request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'Integration User 1',
          email: 'integration1@test.com',
          password: 'pass123',
        })
        .expect(201);
      userId1 = user1Response.body.id;
      expect(userId1).toBeDefined();

      // Usuario 2
      const user2Response = await request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'Integration User 2',
          email: 'integration2@test.com',
          password: 'pass456',
        })
        .expect(201);
      userId2 = user2Response.body.id;
      expect(userId2).toBeDefined();
    });

    it('Paso 2: Crear trabajos', async () => {
      // Trabajo 1
      const work1Response = await request(app.getHttpServer())
        .post('/works')
        .send({
          title: 'Integration Article',
          authors: ['Author 1', 'Author 2'],
          issn: '1234-INT1',
          journal: 'Integration Journal',
          year: 2024,
          type: WorkType.ARTICLE,
        })
        .expect(201);
      workId1 = work1Response.body.id;
      expect(workId1).toBeDefined();

      // Trabajo 2
      const work2Response = await request(app.getHttpServer())
        .post('/works')
        .send({
          title: 'Integration Book',
          authors: ['Book Author'],
          issn: '5678-INT2',
          journal: 'Integration Publisher',
          year: 2023,
          type: WorkType.BOOK,
        })
        .expect(201);
      workId2 = work2Response.body.id;
      expect(workId2).toBeDefined();
    });

    it('Paso 3: Crear patentes', async () => {
      // Patente 1
      const patent1Response = await request(app.getHttpServer())
        .post('/patents')
        .send({
          title: 'Integration Patent 1',
          code: 'INT-PAT-001',
          description: 'First integration patent',
          organization: 'Integration Org',
        })
        .expect(201);
      patentId1 = patent1Response.body.id;
      expect(patentId1).toBeDefined();

      // Patente 2
      const patent2Response = await request(app.getHttpServer())
        .post('/patents')
        .send({
          title: 'Integration Patent 2',
          code: 'INT-PAT-002',
          description: 'Second integration patent',
          organization: 'Integration Org',
        })
        .expect(201);
      patentId2 = patent2Response.body.id;
      expect(patentId2).toBeDefined();
    });

    it('Paso 4: Crear memorias con trabajos y patentes', async () => {
      // Memoria 1 con work1 y patent1
      const memory1Response = await request(app.getHttpServer())
        .post('/memories')
        .send({
          name: 'Integration Memory 2024',
          year: 2024,
          works: [{ id: workId1 }],
          patents: [{ id: patentId1 }],
        })
        .expect(201);
      memoryId1 = memory1Response.body.id;
      expect(memoryId1).toBeDefined();

      // Memoria 2 con work2 y patent2
      const memory2Response = await request(app.getHttpServer())
        .post('/memories')
        .send({
          name: 'Integration Memory 2023',
          year: 2023,
          works: [{ id: workId2 }],
          patents: [{ id: patentId2 }],
        })
        .expect(201);
      memoryId2 = memory2Response.body.id;
      expect(memoryId2).toBeDefined();
    });

    it('Paso 5: Crear grupo con usuarios y memorias', async () => {
      const groupResponse = await request(app.getHttpServer())
        .post('/groups')
        .send({
          name: 'Integration Group',
          users: [{ id: userId1 }, { id: userId2 }],
          memories: [{ id: memoryId1 }, { id: memoryId2 }],
        })
        .expect(201);
      groupId = groupResponse.body.id;
      expect(groupId).toBeDefined();
    });

    it('Paso 6: Verificar que el grupo se creó correctamente', async () => {
      const groupResponse = await request(app.getHttpServer())
        .get(`/groups/${groupId}`)
        .expect(200);

      expect(groupResponse.body).toHaveProperty('name', 'Integration Group');
      expect(groupResponse.body).toHaveProperty('id', groupId);
    });

    it('Paso 7: Verificar que todas las entidades siguen existiendo', async () => {
      // Verificar usuarios
      await request(app.getHttpServer()).get(`/users/${userId1}`).expect(200);
      await request(app.getHttpServer()).get(`/users/${userId2}`).expect(200);

      // Verificar trabajos
      await request(app.getHttpServer()).get(`/works/${workId1}`).expect(200);
      await request(app.getHttpServer()).get(`/works/${workId2}`).expect(200);

      // Verificar patentes
      await request(app.getHttpServer())
        .get(`/patents/${patentId1}`)
        .expect(200);
      await request(app.getHttpServer())
        .get(`/patents/${patentId2}`)
        .expect(200);

      // Verificar memorias
      await request(app.getHttpServer())
        .get(`/memories/${memoryId1}`)
        .expect(200);
      await request(app.getHttpServer())
        .get(`/memories/${memoryId2}`)
        .expect(200);
    });

    it('Paso 8: Actualizar el grupo', async () => {
      const updateResponse = await request(app.getHttpServer())
        .patch(`/groups/${groupId}`)
        .send({
          name: 'Updated Integration Group',
        })
        .expect(200);

      expect(updateResponse.body).toHaveProperty(
        'name',
        'Updated Integration Group',
      );
    });

    it('Paso 9: Limpiar - Eliminar grupo', async () => {
      await request(app.getHttpServer())
        .delete(`/groups/${groupId}`)
        .expect(204);

      // Verificar que el grupo fue eliminado
      await request(app.getHttpServer()).get(`/groups/${groupId}`).expect(404);
    });

    it('Paso 10: Verificar que las entidades relacionadas siguen existiendo después de eliminar el grupo', async () => {
      // Los usuarios deben seguir existiendo
      await request(app.getHttpServer()).get(`/users/${userId1}`).expect(200);
      await request(app.getHttpServer()).get(`/users/${userId2}`).expect(200);

      // Las memorias deben seguir existiendo
      await request(app.getHttpServer())
        .get(`/memories/${memoryId1}`)
        .expect(200);
      await request(app.getHttpServer())
        .get(`/memories/${memoryId2}`)
        .expect(200);
    });
  });

  describe('Verificar validaciones y casos límite', () => {
    it('debería manejar correctamente la creación de múltiples entidades del mismo tipo', async () => {
      const works = [];

      // Crear 5 trabajos
      for (let i = 1; i <= 5; i++) {
        const response = await request(app.getHttpServer())
          .post('/works')
          .send({
            title: `Bulk Work ${i}`,
            authors: [`Author ${i}`],
            issn: `BULK-${i}`,
            journal: 'Bulk Journal',
            year: 2024,
            type: WorkType.ARTICLE,
          })
          .expect(201);

        works.push(response.body.id);
      }

      // Verificar que todos se crearon
      const allWorksResponse = await request(app.getHttpServer())
        .get('/works')
        .expect(200);

      expect(allWorksResponse.body.length).toBeGreaterThanOrEqual(5);
    });

    it('debería poder actualizar parcialmente cualquier entidad', async () => {
      // Crear un usuario
      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .send({
          name: 'Partial Update User',
          email: 'partial@test.com',
          password: 'password',
        })
        .expect(201);

      const userId = createResponse.body.id;

      // Actualizar solo el nombre
      const updateResponse = await request(app.getHttpServer())
        .patch(`/users/${userId}`)
        .send({ name: 'New Name Only' })
        .expect(200);

      expect(updateResponse.body).toHaveProperty('name', 'New Name Only');
      expect(updateResponse.body).toHaveProperty('email', 'partial@test.com');
      expect(updateResponse.body).toHaveProperty('password', 'password');
    });
  });
});

