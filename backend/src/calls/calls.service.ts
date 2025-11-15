import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Call, CallStatus, CallDirection } from './call.entity';
import { InitiateCallDto, CallResponseDto, CallStatusDto } from './dto/initiate-call.dto';
import { CallsGateway } from './calls.gateway';

@Injectable()
export class CallsService {
  private queueMappings: { [key: string]: string } = {
    '1': 'Exam Malpractice Queue',
    '2': 'Teacher Complaints Queue',
    '3': 'School Facilities Queue',
    '4': 'General Inquiry Queue',
  };

  constructor(
    @InjectRepository(Call)
    private callRepository: Repository<Call>,
    private readonly callsGateway: CallsGateway,
  ) {}

  async initiateCall(initiateCallDto: InitiateCallDto): Promise<CallResponseDto> {
    const { phoneNumber, ivrOption, callerName, userId } = initiateCallDto;

    // DISABLED MOCK AGENTS - All calls go to real dashboard agents via WebSocket
    // const availableAgent = this.mockAgents.find(
    //   (agent) => agent.status === 'available' && agent.skills.includes(ivrOption),
    // );

    const queueName = this.queueMappings[ivrOption] || 'General Queue';

    // Create call record - status is IN_QUEUE, no agent assigned yet
    const call = this.callRepository.create({
      phoneNumber,
      callerName,
      userId,
      direction: CallDirection.INBOUND,
      ivrOption,
      queueName,
      status: CallStatus.IN_QUEUE, // Always queue, let real agents claim
      assignedAgentId: undefined,
      assignedAgentName: undefined,
      assignedAgentExtension: undefined,
    });

    // Calculate queue position (count calls in same queue)
    const queueCount = await this.callRepository.count({
      where: { queueName, status: CallStatus.IN_QUEUE },
    });
    call.queuePosition = queueCount + 1;
    
    // Position 1 means next in line (minimal wait)
    if (call.queuePosition === 1) {
      call.estimatedWaitMinutes = 0; // Should be answered immediately
    } else {
      call.estimatedWaitMinutes = Math.ceil((call.queuePosition - 1) * 2.5);
    }

    const savedCall = await this.callRepository.save(call);

    // 🔔 NOTIFY ALL CONNECTED AGENTS VIA WEBSOCKET
    this.callsGateway.notifyIncomingCall({
      callId: savedCall.id,
      callerName: savedCall.callerName,
      phoneNumber: savedCall.phoneNumber,
      ivrOption: savedCall.ivrOption,
      queueName: savedCall.queueName,
    });

    console.log(`📢 Notified agents about incoming call ${savedCall.id}`);
    console.log(`⏳ Call ${savedCall.id} placed in queue position ${call.queuePosition}`);

    // Better message for position 1
    const message = call.queuePosition === 1
      ? 'Call connected! An agent will answer shortly.'
      : `Call connected! You are #${call.queuePosition} in queue. Please wait.`;

    // Return success with queue information
    return {
      success: true,
      callId: savedCall.id,
      queuePosition: call.queuePosition,
      estimatedWait: call.estimatedWaitMinutes,
      message,
    };
  }

  async getCallStatus(callId: string): Promise<CallStatusDto> {
    const call = await this.callRepository.findOne({ where: { id: callId } });

    if (!call) {
      throw new NotFoundException(`Call ${callId} not found`);
    }

    const response: CallStatusDto = {
      callId: call.id,
      status: call.status,
      createdAt: call.createdAt,
    };

    if (call.assignedAgentId) {
      response.agent = {
        id: call.assignedAgentId,
        name: call.assignedAgentName,
        extension: call.assignedAgentExtension,
      };
      response.assignedAgentName = call.assignedAgentName;
    }

    if (call.queuePosition) {
      response.queuePosition = call.queuePosition;
    }

    if (call.durationSeconds !== null && call.durationSeconds !== undefined) {
      response.duration = call.durationSeconds;
    }

    if (call.endedAt) {
      response.endedAt = call.endedAt;
    }

    return response;
  }

  async endCall(callId: string): Promise<{ success: boolean; message: string }> {
    const call = await this.callRepository.findOne({ where: { id: callId } });

    if (!call) {
      throw new NotFoundException(`Call ${callId} not found`);
    }

    // Calculate duration
    const endTime = new Date();
    const durationSeconds = Math.floor((endTime.getTime() - call.createdAt.getTime()) / 1000);

    // Update call
    call.status = CallStatus.ENDED;
    call.endedAt = endTime;
    call.durationSeconds = durationSeconds;

    await this.callRepository.save(call);

    // Notify gateway that agent is available again (handled by gateway)
    console.log(`📴 Call ${callId} ended after ${durationSeconds} seconds`);

    return {
      success: true,
      message: `Call ended successfully. Duration: ${Math.floor(durationSeconds / 60)}m ${durationSeconds % 60}s`,
    };
  }

  async getAvailableAgents(queue?: string): Promise<any[]> {
    // Get real connected agents from WebSocket gateway
    const connectedAgents = this.callsGateway.getConnectedAgents();
    
    // Filter by availability status
    const availableAgents = connectedAgents.filter(
      (agent) => agent.status === 'available',
    );

    // Return agent information
    return availableAgents.map((agent) => ({
      id: agent.agentId,
      name: agent.agentName,
      extension: agent.extension,
      status: agent.status,
    }));
  }

  async getAllCalls(limit: number = 50): Promise<Call[]> {
    return this.callRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getWaitingCalls(): Promise<Call[]> {
    // Get calls that are waiting for an agent (connected or in_queue status)
    return this.callRepository.find({
      where: [
        { status: CallStatus.CONNECTED },
        { status: CallStatus.IN_QUEUE },
        { status: CallStatus.INITIATED },
      ],
      order: { createdAt: 'ASC' },
    });
  }

  async claimCall(
    callId: string,
    agentName: string,
    agentExtension: string,
  ): Promise<{ success: boolean; message: string }> {
    const call = await this.callRepository.findOne({ where: { id: callId } });

    if (!call) {
      throw new NotFoundException(`Call ${callId} not found`);
    }

    if (call.status === CallStatus.ENDED) {
      return {
        success: false,
        message: 'Call has already ended',
      };
    }

    // Assign call to the agent
    call.assignedAgentId = `agent_${agentExtension}`;
    call.assignedAgentName = agentName;
    call.assignedAgentExtension = agentExtension;
    call.status = CallStatus.CONNECTED;

    await this.callRepository.save(call);

    console.log(`✅ Call ${callId} claimed by agent ${agentName} (${agentExtension})`);

    return {
      success: true,
      message: `Call assigned to ${agentName}`,
    };
  }
}
