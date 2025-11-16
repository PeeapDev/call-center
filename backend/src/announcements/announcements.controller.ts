import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';

@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Post()
  async createAnnouncement(
    @Body()
    body: {
      title: string;
      message: string;
      targetGroup: string;
      type: string;
      createdBy: string;
      expiresAt?: string;
    },
  ) {
    const announcement = await this.announcementsService.createAnnouncement({
      ...body,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
    });

    return {
      status: 'ok',
      announcement,
      message: 'Announcement created successfully',
    };
  }

  @Get()
  async getAnnouncements(@Query('targetGroup') targetGroup?: string) {
    const announcements = await this.announcementsService.getAnnouncements(
      targetGroup,
    );

    return {
      status: 'ok',
      announcements,
    };
  }

  @Get('all')
  async getAllAnnouncements() {
    const announcements = await this.announcementsService.getAllAnnouncements();

    return {
      status: 'ok',
      announcements,
    };
  }

  @Get(':id')
  async getAnnouncement(@Param('id') id: string) {
    const announcement = await this.announcementsService.getAnnouncementById(id);

    if (!announcement) {
      return {
        status: 'error',
        message: 'Announcement not found',
      };
    }

    return {
      status: 'ok',
      announcement,
    };
  }

  @Put(':id')
  async updateAnnouncement(
    @Param('id') id: string,
    @Body() body: Partial<any>,
  ) {
    const announcement = await this.announcementsService.updateAnnouncement(
      id,
      body,
    );

    if (!announcement) {
      return {
        status: 'error',
        message: 'Announcement not found',
      };
    }

    return {
      status: 'ok',
      announcement,
      message: 'Announcement updated successfully',
    };
  }

  @Delete(':id')
  async deleteAnnouncement(@Param('id') id: string) {
    await this.announcementsService.deleteAnnouncement(id);

    return {
      status: 'ok',
      message: 'Announcement deleted successfully',
    };
  }

  @Put(':id/deactivate')
  async deactivateAnnouncement(@Param('id') id: string) {
    const announcement = await this.announcementsService.deactivateAnnouncement(
      id,
    );

    if (!announcement) {
      return {
        status: 'error',
        message: 'Announcement not found',
      };
    }

    return {
      status: 'ok',
      announcement,
      message: 'Announcement deactivated successfully',
    };
  }
}
