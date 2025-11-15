import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

interface AgentConnection {
  socketId: string;
  agentId: string;
  agentName: string;
  extension: string;
  status: 'available' | 'busy' | 'offline';
}

@WebSocketGateway({
  cors: {
    origin: '*', // In production, specify your frontend domain
  },
  namespace: '/calls',
})
export class CallsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(CallsGateway.name);
  private connectedAgents: Map<string, AgentConnection> = new Map();

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    
    // Remove agent from connected list
    for (const [agentId, agent] of this.connectedAgents.entries()) {
      if (agent.socketId === client.id) {
        this.connectedAgents.delete(agentId);
        this.logger.log(`Agent ${agent.agentName} went offline`);
        break;
      }
    }

    // Broadcast updated agent list
    this.broadcastAgentList();
  }

  @SubscribeMessage('agent:register')
  handleAgentRegister(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { agentId: string; agentName: string; extension: string },
  ) {
    const agent: AgentConnection = {
      socketId: client.id,
      agentId: data.agentId,
      agentName: data.agentName,
      extension: data.extension,
      status: 'available',
    };

    this.connectedAgents.set(data.agentId, agent);
    this.logger.log(`Agent registered: ${data.agentName} (${data.extension})`);

    // Send confirmation to agent
    client.emit('agent:registered', {
      success: true,
      message: 'You are now online and ready to receive calls',
    });

    // Broadcast updated agent list
    this.broadcastAgentList();

    return { success: true };
  }

  @SubscribeMessage('agent:status')
  handleAgentStatus(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { status: 'available' | 'busy' | 'offline' },
  ) {
    // Find and update agent status
    for (const [agentId, agent] of this.connectedAgents.entries()) {
      if (agent.socketId === client.id) {
        agent.status = data.status;
        this.logger.log(`Agent ${agent.agentName} status: ${data.status}`);
        break;
      }
    }

    this.broadcastAgentList();
    return { success: true };
  }

  /**
   * Notify all available agents about incoming call from mobile app
   */
  notifyIncomingCall(callData: {
    callId: string;
    callerName: string;
    phoneNumber: string;
    ivrOption: string;
    queueName: string;
  }) {
    this.logger.log(`📞 Broadcasting incoming call: ${callData.callId}`);
    this.logger.log(`   Caller: ${callData.callerName} (${callData.phoneNumber})`);
    this.logger.log(`   Queue: ${callData.queueName} (IVR Option: ${callData.ivrOption})`);

    // Debug: Show all connected agents
    this.logger.log(`👥 Total connected agents: ${this.connectedAgents.size}`);
    this.connectedAgents.forEach((agent, agentId) => {
      this.logger.log(`   - ${agent.agentName} (${agent.extension}): ${agent.status}`);
    });

    // Get available agents
    const availableAgents = Array.from(this.connectedAgents.values()).filter(
      (agent) => agent.status === 'available',
    );

    if (availableAgents.length === 0) {
      this.logger.warn('⚠️ No available agents to receive call - all agents are busy or offline');
      // Still broadcast to ALL agents so they can see the call in queue
      this.server.emit('call:incoming', {
        ...callData,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Broadcast to all connected clients (not just available ones)
    // This ensures the call appears in the queue for all agents
    this.server.emit('call:incoming', {
      ...callData,
      timestamp: new Date().toISOString(),
    });
    
    this.logger.log(`✅ Broadcasted call to ${this.connectedAgents.size} connected agents`);
  }

  /**
   * Agent accepts a call
   */
  @SubscribeMessage('call:accept')
  handleCallAccept(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { callId: string },
  ) {
    // Find the agent
    let agent: AgentConnection | undefined;
    for (const [agentId, a] of this.connectedAgents.entries()) {
      if (a.socketId === client.id) {
        agent = a;
        break;
      }
    }

    if (!agent) {
      return { success: false, message: 'Agent not found' };
    }

    this.logger.log(`✅ Agent ${agent.agentName} accepted call ${data.callId}`);

    // Update agent status
    agent.status = 'busy';

    // Notify other agents that call was taken
    this.server.emit('call:taken', {
      callId: data.callId,
      agentName: agent.agentName,
    });

    return {
      success: true,
      agentName: agent.agentName,
      extension: agent.extension,
    };
  }

  /**
   * Call ended
   */
  @SubscribeMessage('call:ended')
  handleCallEnded(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { callId: string },
  ) {
    // Find the agent and set back to available
    for (const [agentId, agent] of this.connectedAgents.entries()) {
      if (agent.socketId === client.id) {
        agent.status = 'available';
        this.logger.log(`Agent ${agent.agentName} is now available`);
        break;
      }
    }

    this.broadcastAgentList();
    return { success: true };
  }

  /**
   * Get list of online agents
   */
  getConnectedAgents(): AgentConnection[] {
    return Array.from(this.connectedAgents.values());
  }

  /**
   * Broadcast updated agent list to all clients
   */
  private broadcastAgentList() {
    const agents = this.getConnectedAgents();
    this.server.emit('agents:list', agents);
  }
}
