import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @Inject(forwardRef(() => NotificationsGateway))
    private notificationsGateway: NotificationsGateway,
  ) {}

  async createNotification(dto: {
    type: 'call' | 'chat' | 'system';
    title: string;
    message: string;
    payload?: any;
  }): Promise<Notification> {
    const notification = this.notificationRepository.create({
      type: dto.type,
      title: dto.title,
      message: dto.message,
      payload: dto.payload,
      status: 'unread',
    });

    const savedNotification = await this.notificationRepository.save(notification);

    // 🔔 Broadcast to all connected clients via WebSocket
    try {
      // Convert Date to string for WebSocket broadcast
      const notificationPayload = {
        ...savedNotification,
        createdAt: savedNotification.createdAt.toISOString(),
      };
      this.notificationsGateway.broadcastNotification(notificationPayload as any);
      console.log('✅ Broadcasted notification via WebSocket');
    } catch (error) {
      console.error('Failed to broadcast notification:', error);
    }

    return savedNotification;
  }

  async getNotifications(status?: 'unread' | 'read'): Promise<Notification[]> {
    const queryBuilder = this.notificationRepository.createQueryBuilder('notification');

    if (status) {
      queryBuilder.where('notification.status = :status', { status });
    }

    queryBuilder.orderBy('notification.createdAt', 'DESC');

    return queryBuilder.getMany();
  }

  async getNotificationById(id: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({ where: { id } });
    if (!notification) {
      throw new Error('Notification not found');
    }
    return notification;
  }

  async markAsRead(id: string): Promise<Notification> {
    await this.notificationRepository.update({ id }, { status: 'read' });
    return this.getNotificationById(id);
  }

  async markAllAsRead(): Promise<void> {
    await this.notificationRepository.update(
      { status: 'unread' },
      { status: 'read' }
    );
  }

  async getUnreadCount(): Promise<number> {
    const count = await this.notificationRepository.count({ where: { status: 'unread' } });
    return count;
  }

  async deleteNotification(id: string): Promise<void> {
    const notification = await this.notificationRepository.findOne({ where: { id } });
    if (!notification) {
      throw new Error('Notification not found');
    }
    await this.notificationRepository.delete(id);
  }
}
