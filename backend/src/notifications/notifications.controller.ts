import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

class CreateNotificationDto {
  type: 'call' | 'chat' | 'system';
  title: string;
  message: string;
  payload?: any;
}

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  async createNotification(@Body() dto: CreateNotificationDto) {
    try {
      const notification = await this.notificationsService.createNotification(dto);
      return {
        status: 'ok',
        notification,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  @Get()
  async getNotifications(@Query('status') status?: 'unread' | 'read') {
    try {
      const notifications = await this.notificationsService.getNotifications(status);
      return {
        status: 'ok',
        notifications,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  @Get('unread-count')
  async getUnreadCount() {
    try {
      const count = await this.notificationsService.getUnreadCount();
      return {
        status: 'ok',
        count,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  @Put(':id/read')
  async markAsRead(@Param('id') id: string) {
    try {
      const notification = await this.notificationsService.markAsRead(id);
      return {
        status: 'ok',
        notification,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  @Put('mark-all-read')
  async markAllAsRead() {
    try {
      await this.notificationsService.markAllAsRead();
      return {
        status: 'ok',
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }

  @Delete(':id')
  async deleteNotification(@Param('id') id: string) {
    try {
      await this.notificationsService.deleteNotification(id);
      return {
        status: 'ok',
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
      };
    }
  }
}
