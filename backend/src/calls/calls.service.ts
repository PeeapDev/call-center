import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Call, CallStatus, CallDirection } from './call.entity';
import { InitiateCallDto, CallResponseDto, CallStatusDto } from './dto/initiate-call.dto';
import { CallsGateway } from './calls.gateway';
import { AsteriskService } from '../asterisk/asterisk.service';
import { FlowBuilderService } from '../flow-builder/flow-builder.service';

@Injectable()
export class CallsService {
  private queueMappings: { [key: string]: string } = {
    '1': 'Exam Malpractice Queue',
    '2': 'Teacher Complaints Queue',
    '3': 'School Facilities Queue',
    '4': 'General Inquiry Queue',
    '9': 'Urgent Queue',
  };

  constructor(
    @InjectRepository(Call)
    private callRepository: Repository<Call>,
    private readonly callsGateway: CallsGateway,
    private readonly asteriskService: AsteriskService,
    private readonly flowBuilderService: FlowBuilderService,
  ) {}

  async initiateCall(initiateCallDto: InitiateCallDto): Promise<CallResponseDto> {
    const { phoneNumber, ivrOption, callerName, userId } = initiateCallDto;

    // Check if Asterisk is connected
    const isAsteriskConnected = this.asteriskService.isConnected();
    console.log(`🔌 Asterisk connected: ${isAsteriskConnected}`);

    const queueName = this.queueMappings[ivrOption] || 'General Queue';

    // If Asterisk is connected, route through ARI and Flow Builder
    if (isAsteriskConnected) {
      try {
        console.log(`📞 Routing call through Asterisk ARI and Flow Builder...`);
        return await this.initiateCallThroughAsterisk(phoneNumber, ivrOption, callerName || 'Unknown', userId || '', queueName);
      } catch (error: any) {
        console.error(`❌ Asterisk call failed: ${error.message}, falling back to direct queue`);
        // Fall through to queue-based system
      }
    }

    // Create call record - status is IN_QUEUE, no agent assigned yet
    const call = this.callRepository.create({
      phoneNumber,
      callerName,
      userId,
      direction: CallDirection.INBOUND,
      ivrOption,
      queueName,
      priority: ivrOption === '9' ? 'urgent' : 'normal',
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
      message: 'Call initiated successfully',
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

  async getActiveCalls(): Promise<Call[]> {
    // Get all active calls (both connected and waiting)
    return this.callRepository.find({
      where: [
        { status: CallStatus.CONNECTED },
        { status: CallStatus.IN_QUEUE },
        { status: CallStatus.INITIATED },
      ],
      order: { createdAt: 'ASC' },
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

  /**
   * Initiate call through Asterisk ARI and Flow Builder
   */
  private async initiateCallThroughAsterisk(
    phoneNumber: string,
    ivrOption: string,
    callerName: string,
    userId: string,
    queueName: string,
  ): Promise<CallResponseDto> {
    console.log(`🎯 Starting call through Asterisk for ${phoneNumber}`);

    // Get active flow from Flow Builder
    const activeFlow = this.flowBuilderService.getActiveFlow();
    console.log(`📋 Active flow: ${activeFlow.name} (${activeFlow.id})`);

    // Create call record
    const call = this.callRepository.create({
      phoneNumber,
      callerName,
      userId,
      direction: CallDirection.INBOUND,
      ivrOption,
      queueName,
      priority: ivrOption === '9' ? 'urgent' : 'normal',
      status: CallStatus.IN_PROGRESS, // Call is in progress through IVR
      assignedAgentId: undefined,
      assignedAgentName: undefined,
      assignedAgentExtension: undefined,
    });

    const savedCall = await this.callRepository.save(call);
    console.log(`💾 Call record created: ${savedCall.id}`);

    // Get Asterisk ARI client
    const ariClient = this.asteriskService.getClient();

    if (!ariClient) {
      throw new Error('ARI client not available');
    }

    // Create channel through Asterisk
    // This simulates the call coming in and entering the Stasis application
    try {
      console.log(`📡 Creating channel in Asterisk...`);

      // Originate a call that will enter the callcenter Stasis app
      // This will trigger the flow builder
      const channel = await ariClient.channels.originate({
        endpoint: `Local/117@from-internal`, // Call to extension 117
        app: 'callcenter',
        appArgs: ['117', savedCall.id], // Pass call ID
        callerId: phoneNumber,
        variables: {
          CALLERID_NUM: phoneNumber,
          CALLERID_NAME: callerName || 'Unknown',
          CALL_ID: savedCall.id,
          IVR_OPTION: ivrOption,
        },
      });

      console.log(`✅ Channel created: ${channel.id}`);

      // Process through flow builder
      console.log(`🔄 Processing through flow builder...`);
      const welcomeNode = activeFlow.nodes.find((n) => n.type === 'welcome');

      if (welcomeNode) {
        // Play welcome audio
        console.log(`🔊 Playing welcome message: ${welcomeNode.message}`);
        await this.playAudioToChannel(channel.id, welcomeNode.audioUrl || 'welcome');

        // Move to next node (usually menu)
        if (welcomeNode.nextNode) {
          const menuNode = activeFlow.nodes.find((n) => n.id === welcomeNode.nextNode);
          if (menuNode && menuNode.type === 'menu') {
            console.log(`📋 Playing menu: ${menuNode.message}`);
            await this.playAudioToChannel(channel.id, menuNode.audioUrl || 'menu');
          }
        }
      }

      // Notify agents that call is in queue
      setTimeout(async () => {
        call.status = CallStatus.IN_QUEUE;
        await this.callRepository.save(call);

        this.callsGateway.notifyIncomingCall({
          callId: savedCall.id,
          callerName: savedCall.callerName,
          phoneNumber: savedCall.phoneNumber,
          ivrOption: savedCall.ivrOption,
          queueName: savedCall.queueName,
        });
        console.log(`📢 Notified agents about call ${savedCall.id}`);
      }, 3000); // Wait 3 seconds after IVR

      return {
        callId: savedCall.id,
        status: 'in_progress',
        message: 'Call initiated through IVR flow. Please listen to the options.',
      };
    } catch (error) {
      console.error(`❌ Failed to create channel: ${error.message}`);
      throw error;
    }
  }

  /**
   * Play audio to channel (IVR audio)
   */
  private async playAudioToChannel(channelId: string, audioIdentifier: string): Promise<void> {
    const ariClient = this.asteriskService.getClient();
    if (!ariClient) return;

    try {
      // Try to play the audio file
      // Audio files should be in Asterisk's sounds directory
      // Or use uploaded media files
      console.log(`🎵 Playing audio: ${audioIdentifier} to channel ${channelId}`);

      await ariClient.channels.play({
        channelId,
        media: `sound:${audioIdentifier}`,
      });
    } catch (error) {
      console.error(`Failed to play audio: ${error.message}`);
      // Continue even if audio fails
    }
  }
}
