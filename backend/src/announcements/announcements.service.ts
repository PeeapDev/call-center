import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { Announcement } from './announcement.entity';

@Injectable()
export class AnnouncementsService {
  constructor(
    @InjectRepository(Announcement)
    private readonly announcementRepository: Repository<Announcement>,
  ) {}

  async createAnnouncement(data: {
    title: string;
    message: string;
    targetGroup: string;
    type: string;
    createdBy: string;
    expiresAt?: Date;
  }): Promise<Announcement> {
    const announcement = this.announcementRepository.create(data);
    return await this.announcementRepository.save(announcement);
  }

  async getAnnouncements(targetGroup?: string): Promise<Announcement[]> {
    const query: any = {
      isActive: true,
    };

    if (targetGroup) {
      query.targetGroup = targetGroup;
    }

    const announcements = await this.announcementRepository.find({
      where: query,
      order: { createdAt: 'DESC' },
    });

    // Filter out expired announcements
    const now = new Date();
    return announcements.filter(
      (announcement) => !announcement.expiresAt || announcement.expiresAt > now,
    );
  }

  async getAllAnnouncements(): Promise<Announcement[]> {
    return await this.announcementRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async getAnnouncementById(id: string): Promise<Announcement | null> {
    return await this.announcementRepository.findOne({ where: { id } });
  }

  async updateAnnouncement(
    id: string,
    data: Partial<Announcement>,
  ): Promise<Announcement | null> {
    await this.announcementRepository.update(id, data);
    return await this.getAnnouncementById(id);
  }

  async deleteAnnouncement(id: string): Promise<void> {
    await this.announcementRepository.delete(id);
  }

  async deactivateAnnouncement(id: string): Promise<Announcement | null> {
    return await this.updateAnnouncement(id, { isActive: false });
  }
}
