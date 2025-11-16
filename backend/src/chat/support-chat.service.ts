import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './conversation.entity';
import { Message } from './message.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class SupportChatService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @Inject(forwardRef(() => NotificationsService))
    private notificationsService: NotificationsService,
  ) {}

  async createConversation(dto: any): Promise<Conversation> {
    // Create conversation
    const conversation = this.conversationRepository.create({
      citizenId: dto.citizenId,
      citizenName: dto.citizenName,
      citizenEmail: dto.citizenEmail,
      status: 'waiting',
      lastMessage: dto.initialMessage,
    });

    const savedConversation = await this.conversationRepository.save(conversation);

    // Add initial message
    if (dto.initialMessage) {
      await this.sendMessage({
        conversationId: savedConversation.id,
        senderId: dto.citizenId,
        senderType: 'citizen',
        content: dto.initialMessage,
      });
    }

    // Send notification to admin
    try {
      await this.notificationsService.createNotification({
        type: 'chat',
        title: '💬 New Chat Message',
        message: `${dto.citizenName} started a new conversation`,
        payload: {
          conversationId: savedConversation.id,
          citizenId: dto.citizenId,
          citizenName: dto.citizenName,
          citizenEmail: dto.citizenEmail,
          message: dto.initialMessage,
          timestamp: savedConversation.createdAt,
        },
      });
    } catch (error) {
      console.error('Failed to send chat notification:', error);
    }

    return savedConversation;
  }

  async getConversations(status?: string): Promise<Conversation[]> {
    const queryBuilder = this.conversationRepository.createQueryBuilder('conversation');

    if (status) {
      queryBuilder.where('conversation.status = :status', { status });
    }

    queryBuilder.orderBy('conversation.updatedAt', 'DESC');

    return queryBuilder.getMany();
  }

  async getConversationById(id: string): Promise<Conversation> {
    const conversation = await this.conversationRepository.findOne({ where: { id } });
    if (!conversation) {
      throw new Error('Conversation not found');
    }
    return conversation;
  }

  async getConversationMessages(conversationId: string): Promise<Message[]> {
    return this.messageRepository.find({
      where: { conversationId },
      order: { createdAt: 'ASC' },
    });
  }

  async sendMessage(dto: any): Promise<Message> {
    // Create and save the message
    const message = this.messageRepository.create({
      conversationId: dto.conversationId,
      senderId: dto.senderId,
      senderType: dto.senderType,
      content: dto.content,
      staffName: dto.staffName || null,
      staffRole: dto.staffRole || null,
      staffNumber: dto.staffNumber || null,
    });

    const savedMessage = await this.messageRepository.save(message);

    // Update conversation last message and timestamp
    await this.conversationRepository.update(
      { id: dto.conversationId },
      { lastMessage: dto.content, updatedAt: new Date() }
    );

    return savedMessage;
  }

  async claimConversation(id: string, dto: any): Promise<Conversation> {
    await this.conversationRepository.update(
      { id },
      {
        status: 'active',
        assignedToId: dto.staffId,
        assignedToName: dto.staffName,
        updatedAt: new Date(),
      }
    );

    return this.getConversationById(id);
  }

  async resolveConversation(id: string): Promise<Conversation> {
    await this.conversationRepository.update(
      { id },
      { status: 'resolved', updatedAt: new Date() }
    );

    return this.getConversationById(id);
  }

  async getCitizenActiveConversation(citizenId: string): Promise<Conversation | null> {
    // Find the most recent non-resolved conversation
    return await this.conversationRepository
      .createQueryBuilder('conversation')
      .where('conversation.citizenId = :citizenId', { citizenId })
      .andWhere('conversation.status != :resolved', { resolved: 'resolved' })
      .orderBy('conversation.updatedAt', 'DESC')
      .limit(1)
      .getOne();
  }
}
