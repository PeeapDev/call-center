import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CallsService } from './calls.service';
import { CallsGateway } from './calls.gateway';
import { Call, CallStatus, CallDirection } from './call.entity';
import { NotFoundException } from '@nestjs/common';

describe('CallsService', () => {
  let service: CallsService;
  let callRepository: Repository<Call>;
  let callsGateway: CallsGateway;

  const mockCallRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    count: jest.fn(),
  };

  const mockCallsGateway = {
    notifyIncomingCall: jest.fn(),
    getConnectedAgents: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CallsService,
        {
          provide: getRepositoryToken(Call),
          useValue: mockCallRepository,
        },
        {
          provide: CallsGateway,
          useValue: mockCallsGateway,
        },
      ],
    }).compile();

    service = module.get<CallsService>(CallsService);
    callRepository = module.get<Repository<Call>>(getRepositoryToken(Call));
    callsGateway = module.get<CallsGateway>(CallsGateway);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initiateCall', () => {
    it('should create a call and notify agents', async () => {
      const initiateCallDto = {
        phoneNumber: '+232 76 123 456',
        ivrOption: '1',
        callerName: 'Test User',
      };

      const mockCall = {
        id: 'test-call-id',
        phoneNumber: initiateCallDto.phoneNumber,
        callerName: initiateCallDto.callerName,
        ivrOption: initiateCallDto.ivrOption,
        queueName: 'Exam Malpractice Queue',
        status: CallStatus.IN_QUEUE,
        queuePosition: 1,
        estimatedWaitMinutes: 3,
        createdAt: new Date(),
      };

      mockCallRepository.create.mockReturnValue(mockCall);
      mockCallRepository.count.mockResolvedValue(0);
      mockCallRepository.save.mockResolvedValue(mockCall);

      const result = await service.initiateCall(initiateCallDto);

      expect(mockCallRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          phoneNumber: initiateCallDto.phoneNumber,
          callerName: initiateCallDto.callerName,
          ivrOption: initiateCallDto.ivrOption,
          status: CallStatus.IN_QUEUE,
        }),
      );

      expect(mockCallRepository.save).toHaveBeenCalled();
      expect(mockCallsGateway.notifyIncomingCall).toHaveBeenCalledWith({
        callId: mockCall.id,
        callerName: mockCall.callerName,
        phoneNumber: mockCall.phoneNumber,
        ivrOption: mockCall.ivrOption,
        queueName: mockCall.queueName,
      });

      expect(result).toEqual({
        success: true,
        callId: mockCall.id,
        queuePosition: 1,
        estimatedWait: 3,
        message: expect.stringContaining('queue'),
      });
    });

    it('should calculate correct queue position', async () => {
      const initiateCallDto = {
        phoneNumber: '+232 76 123 456',
        ivrOption: '1',
        callerName: 'Test User',
      };

      mockCallRepository.count.mockResolvedValue(5); // 5 calls already in queue
      mockCallRepository.create.mockReturnValue({ queuePosition: 0 });
      mockCallRepository.save.mockResolvedValue({
        id: 'test-id',
        queuePosition: 6,
        estimatedWaitMinutes: 15,
      });

      const result = await service.initiateCall(initiateCallDto);

      expect(result.queuePosition).toBe(6);
      expect(result.estimatedWait).toBe(15);
    });
  });

  describe('getCallStatus', () => {
    it('should return call status', async () => {
      const mockCall = {
        id: 'test-call-id',
        phoneNumber: '+232 76 123 456',
        callerName: 'Test User',
        status: CallStatus.IN_QUEUE,
        queuePosition: 2,
        estimatedWaitMinutes: 5,
        createdAt: new Date(),
      };

      mockCallRepository.findOne.mockResolvedValue(mockCall);

      const result = await service.getCallStatus('test-call-id');

      expect(result).toMatchObject({
        callId: mockCall.id,
        status: mockCall.status,
        queuePosition: mockCall.queuePosition,
        createdAt: expect.any(Date),
      });
      expect(result.agent).toBeUndefined();
    });

    it('should throw NotFoundException for non-existent call', async () => {
      mockCallRepository.findOne.mockResolvedValue(null);

      await expect(service.getCallStatus('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('endCall', () => {
    it('should end a call successfully', async () => {
      const mockCall = {
        id: 'test-call-id',
        status: CallStatus.CONNECTED,
        createdAt: new Date(Date.now() - 60000), // 1 minute ago
      };

      mockCallRepository.findOne.mockResolvedValue(mockCall);
      mockCallRepository.save.mockResolvedValue({
        ...mockCall,
        status: CallStatus.ENDED,
        durationSeconds: 60,
      });

      const result = await service.endCall('test-call-id');

      expect(result.success).toBe(true);
      expect(mockCallRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: CallStatus.ENDED,
        }),
      );
    });

    it('should throw NotFoundException for non-existent call', async () => {
      mockCallRepository.findOne.mockResolvedValue(null);

      await expect(service.endCall('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getAvailableAgents', () => {
    it('should return connected agents from gateway', async () => {
      const mockAgents = [
        {
          agentId: 'agent-1',
          agentName: 'John Doe',
          extension: '2000',
          status: 'available',
        },
        {
          agentId: 'agent-2',
          agentName: 'Jane Smith',
          extension: '2001',
          status: 'busy',
        },
      ];

      mockCallsGateway.getConnectedAgents.mockReturnValue(mockAgents);

      const result = await service.getAvailableAgents();

      expect(result).toHaveLength(1); // Only available agents
      expect(result[0]).toEqual({
        id: 'agent-1',
        name: 'John Doe',
        extension: '2000',
        status: 'available',
      });
    });

    it('should return empty array when no agents available', async () => {
      mockCallsGateway.getConnectedAgents.mockReturnValue([]);

      const result = await service.getAvailableAgents();

      expect(result).toEqual([]);
    });
  });

  describe('claimCall', () => {
    it('should allow agent to claim a call', async () => {
      const mockCall = {
        id: 'test-call-id',
        status: CallStatus.IN_QUEUE,
      };

      mockCallRepository.findOne.mockResolvedValue(mockCall);
      mockCallRepository.save.mockResolvedValue({
        ...mockCall,
        assignedAgentName: 'Test Agent',
        assignedAgentExtension: '2000',
        status: CallStatus.CONNECTED,
      });

      const result = await service.claimCall('test-call-id', 'Test Agent', '2000');

      expect(result.success).toBe(true);
      expect(result.message).toContain('Test Agent');
      expect(mockCallRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          assignedAgentName: 'Test Agent',
          assignedAgentExtension: '2000',
          status: CallStatus.CONNECTED,
        }),
      );
    });

    it('should not claim already ended call', async () => {
      const mockCall = {
        id: 'test-call-id',
        status: CallStatus.ENDED,
      };

      mockCallRepository.findOne.mockResolvedValue(mockCall);

      const result = await service.claimCall('test-call-id', 'Test Agent', '2000');

      expect(result.success).toBe(false);
      expect(result.message).toContain('ended');
      expect(mockCallRepository.save).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException for non-existent call', async () => {
      mockCallRepository.findOne.mockResolvedValue(null);

      await expect(
        service.claimCall('non-existent', 'Test Agent', '2000'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getWaitingCalls', () => {
    it('should return calls in queue', async () => {
      const mockCalls = [
        { id: 'call-1', status: CallStatus.IN_QUEUE },
        { id: 'call-2', status: CallStatus.CONNECTED },
      ];

      mockCallRepository.find.mockResolvedValue(mockCalls);

      const result = await service.getWaitingCalls();

      expect(result).toEqual(mockCalls);
      expect(mockCallRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          order: { createdAt: 'ASC' },
        }),
      );
    });
  });

  describe('getAllCalls', () => {
    it('should return all calls with limit', async () => {
      const mockCalls = [
        { id: 'call-1' },
        { id: 'call-2' },
      ];

      mockCallRepository.find.mockResolvedValue(mockCalls);

      const result = await service.getAllCalls(10);

      expect(result).toEqual(mockCalls);
      expect(mockCallRepository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
        take: 10,
      });
    });

    it('should use default limit of 50', async () => {
      mockCallRepository.find.mockResolvedValue([]);

      await service.getAllCalls();

      expect(mockCallRepository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
        take: 50,
      });
    });
  });
});
