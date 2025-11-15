import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { CallsService } from '../src/calls/calls.service';
import { CallStatus } from '../src/calls/call.entity';

describe('CallsController (e2e)', () => {
  let app: INestApplication;
  let callsService: CallsService;
  let createdCallId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    callsService = moduleFixture.get<CallsService>(CallsService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/calls/initiate (POST)', () => {
    it('should initiate a call successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/calls/initiate')
        .send({
          phoneNumber: '+232 76 123 456',
          ivrOption: '1',
          callerName: 'Test User',
        })
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('callId');
      expect(response.body).toHaveProperty('queuePosition');
      expect(response.body).toHaveProperty('message');

      createdCallId = response.body.callId;
    });

    it('should reject invalid phone number', async () => {
      await request(app.getHttpServer())
        .post('/calls/initiate')
        .send({
          phoneNumber: 'invalid',
          ivrOption: '1',
          callerName: 'Test User',
        })
        .expect(400);
    });

    it('should reject missing required fields', async () => {
      await request(app.getHttpServer())
        .post('/calls/initiate')
        .send({
          phoneNumber: '+232 76 123 456',
          // Missing ivrOption
        })
        .expect(400);
    });

    it('should reject invalid IVR option', async () => {
      await request(app.getHttpServer())
        .post('/calls/initiate')
        .send({
          phoneNumber: '+232 76 123 456',
          ivrOption: '99', // Invalid option
          callerName: 'Test User',
        })
        .expect(400);
    });
  });

  describe('/calls/:id/status (GET)', () => {
    it('should get call status', async () => {
      const response = await request(app.getHttpServer())
        .get(`/calls/${createdCallId}/status`)
        .expect(200);

      expect(response.body).toHaveProperty('callId', createdCallId);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('queuePosition');
    });

    it('should return 404 for non-existent call', async () => {
      await request(app.getHttpServer())
        .get('/calls/non-existent-id/status')
        .expect(404);
    });
  });

  describe('/calls/agents/available (GET)', () => {
    it('should get list of available agents', async () => {
      const response = await request(app.getHttpServer())
        .get('/calls/agents/available')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      // Initially no agents connected via WebSocket
      expect(response.body.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('/calls (GET)', () => {
    it('should get all calls', async () => {
      const response = await request(app.getHttpServer())
        .get('/calls')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should limit results', async () => {
      const response = await request(app.getHttpServer())
        .get('/calls?limit=5')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeLessThanOrEqual(5);
    });
  });

  describe('/calls/active/waiting (GET)', () => {
    it('should get waiting calls', async () => {
      const response = await request(app.getHttpServer())
        .get('/calls/active/waiting')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      const waitingCall = response.body.find((call: any) => call.id === createdCallId);
      expect(waitingCall).toBeDefined();
      expect(waitingCall.status).toBe(CallStatus.IN_QUEUE);
    });
  });

  describe('/calls/:id/claim (POST)', () => {
    it('should allow agent to claim a call', async () => {
      const response = await request(app.getHttpServer())
        .post(`/calls/${createdCallId}/claim`)
        .send({
          agentName: 'Test Agent',
          agentExtension: '2000',
        })
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Test Agent');
    });

    it('should reject claiming non-existent call', async () => {
      await request(app.getHttpServer())
        .post('/calls/non-existent-id/claim')
        .send({
          agentName: 'Test Agent',
          agentExtension: '2000',
        })
        .expect(404);
    });

    it('should reject claiming without agent info', async () => {
      await request(app.getHttpServer())
        .post(`/calls/${createdCallId}/claim`)
        .send({})
        .expect(400);
    });
  });

  describe('/calls/:id/end (POST)', () => {
    it('should end a call successfully', async () => {
      const response = await request(app.getHttpServer())
        .post(`/calls/${createdCallId}/end`)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 404 for non-existent call', async () => {
      await request(app.getHttpServer())
        .post('/calls/non-existent-id/end')
        .expect(404);
    });

    it('should handle ending already ended call', async () => {
      // Try to end the same call again
      const response = await request(app.getHttpServer())
        .post(`/calls/${createdCallId}/end`)
        .expect(201);

      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('Call Flow Integration', () => {
    it('should handle complete call lifecycle', async () => {
      // 1. Initiate call
      const initiateResponse = await request(app.getHttpServer())
        .post('/calls/initiate')
        .send({
          phoneNumber: '+232 77 999 888',
          ivrOption: '2',
          callerName: 'Integration Test User',
        })
        .expect(201);

      const callId = initiateResponse.body.callId;

      // 2. Check status - should be in queue
      const statusResponse = await request(app.getHttpServer())
        .get(`/calls/${callId}/status`)
        .expect(200);

      expect(statusResponse.body.status).toBe(CallStatus.IN_QUEUE);

      // 3. Agent claims call
      await request(app.getHttpServer())
        .post(`/calls/${callId}/claim`)
        .send({
          agentName: 'Integration Agent',
          agentExtension: '3000',
        })
        .expect(201);

      // 4. Verify call is now connected
      const updatedStatus = await request(app.getHttpServer())
        .get(`/calls/${callId}/status`)
        .expect(200);

      expect(updatedStatus.body.status).toBe(CallStatus.CONNECTED);
      expect(updatedStatus.body.assignedAgentName).toBe('Integration Agent');

      // 5. End call
      await request(app.getHttpServer())
        .post(`/calls/${callId}/end`)
        .expect(201);

      // 6. Verify call is ended
      const finalStatus = await request(app.getHttpServer())
        .get(`/calls/${callId}/status`)
        .expect(200);

      expect(finalStatus.body.status).toBe(CallStatus.ENDED);
      expect(finalStatus.body.duration).toBeGreaterThanOrEqual(0);
    });
  });
});
