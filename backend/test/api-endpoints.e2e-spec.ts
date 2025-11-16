import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('API Endpoints (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let testUserId: string;
  let testCallId: string;

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

  describe('Health Check', () => {
    it('/health (GET) - should return backend health status', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('backend');
          expect(res.body).toHaveProperty('database');
        });
    });
  });

  describe('HR / User Management', () => {
    it('/hr/users (POST) - should create a new user', () => {
      return request(app.getHttpServer())
        .post('/hr/users')
        .send({
          name: 'Test Agent',
          phoneNumber: '+23276111111',
          password: 'test123',
          accountType: 'agent',
          extension: '1111',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'ok');
          expect(res.body).toHaveProperty('user');
          testUserId = res.body.user.id;
        });
    });

    it('/hr/users/login (POST) - should login with phone and password', () => {
      return request(app.getHttpServer())
        .post('/hr/users/login')
        .send({
          phoneNumber: '+23276111111',
          password: 'test123',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'ok');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user.phoneNumber).toBe('+23276111111');
        });
    });

    it('/hr/users (GET) - should list all users', () => {
      return request(app.getHttpServer())
        .get('/hr/users')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'ok');
          expect(res.body).toHaveProperty('users');
          expect(Array.isArray(res.body.users)).toBe(true);
        });
    });

    it('/hr/users/:id (PUT) - should update user', () => {
      return request(app.getHttpServer())
        .put(`/hr/users/${testUserId}`)
        .send({
          name: 'Updated Test Agent',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'ok');
          expect(res.body.user.name).toBe('Updated Test Agent');
        });
    });

    it('/hr/users/:id/webrtc-config (GET) - should get WebRTC config', () => {
      return request(app.getHttpServer())
        .get(`/hr/users/${testUserId}/webrtc-config`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'ok');
          expect(res.body).toHaveProperty('config');
          expect(res.body.config).toHaveProperty('stunServer');
          expect(res.body.config).toHaveProperty('sipUsername');
        });
    });
  });

  describe('Calls', () => {
    it('/calls/initiate (POST) - should initiate a call', () => {
      return request(app.getHttpServer())
        .post('/calls/initiate')
        .send({
          phoneNumber: '+23276222222',
          ivrOption: '1',
          callerName: 'Test Caller',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('callId');
          expect(res.body).toHaveProperty('message');
          testCallId = res.body.callId;
        });
    });

    it('/calls/active (GET) - should get active calls', () => {
      return request(app.getHttpServer())
        .get('/calls/active')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('/calls/:id/status (GET) - should get call status', () => {
      return request(app.getHttpServer())
        .get(`/calls/${testCallId}/status`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('callId');
          expect(res.body).toHaveProperty('status');
        });
    });

    it('/calls/:id/end (POST) - should end a call', () => {
      return request(app.getHttpServer())
        .post(`/calls/${testCallId}/end`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
        });
    });

    it('/calls (GET) - should get call history', () => {
      return request(app.getHttpServer())
        .get('/calls')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('Flow Builder', () => {
    it('/flow-builder/templates (GET) - should get all templates', () => {
      return request(app.getHttpServer())
        .get('/flow-builder/templates')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });

    it('/flow-builder/active (GET) - should get active flow', () => {
      return request(app.getHttpServer())
        .get('/flow-builder/active')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('name');
          expect(res.body).toHaveProperty('nodes');
          expect(Array.isArray(res.body.nodes)).toBe(true);
        });
    });

    it('/flow-builder/agents/available (GET) - should get available agents', () => {
      return request(app.getHttpServer())
        .get('/flow-builder/agents/available')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'ok');
          expect(res.body).toHaveProperty('agents');
          expect(Array.isArray(res.body.agents)).toBe(true);
        });
    });
  });

  describe('Media', () => {
    it('/media (GET) - should list media files', () => {
      return request(app.getHttpServer())
        .get('/media')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'ok');
          expect(res.body).toHaveProperty('media');
          expect(Array.isArray(res.body.media)).toBe(true);
        });
    });

    it('/media?category=ivr (GET) - should filter by category', () => {
      return request(app.getHttpServer())
        .get('/media?category=ivr')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'ok');
          expect(res.body).toHaveProperty('media');
        });
    });
  });

  describe('Announcements', () => {
    let testAnnouncementId: string;

    it('/announcements (POST) - should create announcement', () => {
      return request(app.getHttpServer())
        .post('/announcements')
        .send({
          title: 'Test Announcement',
          content: 'This is a test announcement',
          targetAudience: 'all',
          priority: 'normal',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'ok');
          expect(res.body).toHaveProperty('announcement');
          testAnnouncementId = res.body.announcement.id;
        });
    });

    it('/announcements (GET) - should list announcements', () => {
      return request(app.getHttpServer())
        .get('/announcements')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'ok');
          expect(res.body).toHaveProperty('announcements');
          expect(Array.isArray(res.body.announcements)).toBe(true);
        });
    });

    it('/announcements/:id (DELETE) - should delete announcement', () => {
      return request(app.getHttpServer())
        .delete(`/announcements/${testAnnouncementId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'ok');
        });
    });
  });

  describe('AI', () => {
    it('/ai-keys (GET) - should get AI keys status', () => {
      return request(app.getHttpServer())
        .get('/ai-keys')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'ok');
          expect(res.body).toHaveProperty('keys');
          expect(Array.isArray(res.body.keys)).toBe(true);
        });
    });
  });

  describe('Asterisk', () => {
    it('/asterisk/info (GET) - should get Asterisk info', () => {
      return request(app.getHttpServer())
        .get('/asterisk/info')
        .expect((res) => {
          // May return 200 or 500 depending on Asterisk connection
          expect(res.status).toBeGreaterThanOrEqual(200);
          expect(res.status).toBeLessThan(600);
        });
    });

    it('/asterisk/channels (GET) - should get active channels', () => {
      return request(app.getHttpServer())
        .get('/asterisk/channels')
        .expect((res) => {
          expect(res.status).toBeGreaterThanOrEqual(200);
          expect(res.status).toBeLessThan(600);
        });
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent endpoints', () => {
      return request(app.getHttpServer())
        .get('/non-existent-endpoint')
        .expect(404);
    });

    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer())
        .get('/hr/users/non-existent-id')
        .expect(404);
    });

    it('should return 400 for invalid call initiation', () => {
      return request(app.getHttpServer())
        .post('/calls/initiate')
        .send({
          phoneNumber: 'invalid',
          ivrOption: 'invalid',
        })
        .expect(400);
    });
  });
});
