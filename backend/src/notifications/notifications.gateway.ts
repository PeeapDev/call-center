import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*', // Allow all origins for development
  },
  namespace: '/notifications',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private connectedClients: Set<string> = new Set();

  handleConnection(client: Socket) {
    this.connectedClients.add(client.id);
    this.logger.log(`Notification client connected: ${client.id} (Total: ${this.connectedClients.size})`);
  }

  handleDisconnect(client: Socket) {
    this.connectedClients.delete(client.id);
    this.logger.log(`Notification client disconnected: ${client.id} (Total: ${this.connectedClients.size})`);
  }

  /**
   * Broadcast new notification to all connected admin/agent clients
   */
  broadcastNotification(notification: {
    id: string;
    type: 'call' | 'chat' | 'system';
    title: string;
    message: string;
    payload?: any;
    status: 'unread' | 'read';
    createdAt: string;
  }) {
    this.logger.log(`🔔 Broadcasting notification: ${notification.type} - ${notification.title}`);
    this.logger.log(`   Connected clients: ${this.connectedClients.size}`);
    
    this.server.emit('notification:new', notification);
  }

  /**
   * Broadcast notification update (e.g., marked as read)
   */
  broadcastNotificationUpdate(notificationId: string, status: 'read' | 'unread') {
    this.server.emit('notification:update', {
      id: notificationId,
      status,
    });
  }

  /**
   * Get count of connected clients
   */
  getConnectedCount(): number {
    return this.connectedClients.size;
  }
}
