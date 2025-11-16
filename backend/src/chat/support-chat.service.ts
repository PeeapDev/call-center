import { Injectable, Inject, forwardRef } from '@nestjs/common';
import Database from 'better-sqlite3';
import * as path from 'path';
import { NotificationsService } from '../notifications/notifications.service';

export interface Conversation {
  id: string;
  citizenId: string;
  citizenName: string;
  citizenEmail: string;
  status: 'waiting' | 'active' | 'resolved';
  assignedToId?: string;
  assignedToName?: string;
  createdAt: string;
  updatedAt: string;
  lastMessage: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: 'citizen' | 'staff';
  content: string;
  staffName?: string;
  staffRole?: string;
  staffNumber?: string;
  createdAt: string;
}

@Injectable()
export class SupportChatService {
  private db: Database.Database;

  constructor(
    @Inject(forwardRef(() => NotificationsService))
    private notificationsService: NotificationsService,
  ) {
    const dbPath = path.join(__dirname, '../../callcenter.db');
    this.db = new Database(dbPath);
    this.initializeDatabase();
  }

  private initializeDatabase() {
    // Create conversations table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS support_conversations (
        id TEXT PRIMARY KEY,
        citizen_id TEXT NOT NULL,
        citizen_name TEXT NOT NULL,
        citizen_email TEXT NOT NULL,
        status TEXT DEFAULT 'waiting',
        assigned_to_id TEXT,
        assigned_to_name TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        last_message TEXT
      );

      CREATE TABLE IF NOT EXISTS support_messages (
        id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL,
        sender_id TEXT NOT NULL,
        sender_type TEXT NOT NULL,
        content TEXT NOT NULL,
        staff_name TEXT,
        staff_role TEXT,
        staff_number TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (conversation_id) REFERENCES support_conversations(id)
      );

      CREATE INDEX IF NOT EXISTS idx_conversations_citizen ON support_conversations(citizen_id);
      CREATE INDEX IF NOT EXISTS idx_conversations_status ON support_conversations(status);
      CREATE INDEX IF NOT EXISTS idx_messages_conversation ON support_messages(conversation_id);
    `);
  }

  async createConversation(dto: any): Promise<Conversation> {
    const id = `conv_${Date.now()}`;
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO support_conversations 
      (id, citizen_id, citizen_name, citizen_email, status, created_at, updated_at, last_message)
      VALUES (?, ?, ?, ?, 'waiting', ?, ?, ?)
    `);

    stmt.run(
      id,
      dto.citizenId,
      dto.citizenName,
      dto.citizenEmail,
      now,
      now,
      dto.initialMessage,
    );

    // Add initial message
    if (dto.initialMessage) {
      await this.sendMessage({
        conversationId: id,
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
          conversationId: id,
          citizenId: dto.citizenId,
          citizenName: dto.citizenName,
          citizenEmail: dto.citizenEmail,
          message: dto.initialMessage,
          timestamp: now,
        },
      });
    } catch (error) {
      console.error('Failed to send chat notification:', error);
    }

    return this.getConversationById(id);
  }

  async getConversations(status?: string): Promise<Conversation[]> {
    let query = `
      SELECT 
        id, citizen_id as citizenId, citizen_name as citizenName,
        citizen_email as citizenEmail, status,
        assigned_to_id as assignedToId, assigned_to_name as assignedToName,
        created_at as createdAt, updated_at as updatedAt, last_message as lastMessage
      FROM support_conversations
    `;

    if (status) {
      query += ` WHERE status = ?`;
      return this.db.prepare(query).all(status) as Conversation[];
    }

    query += ` ORDER BY updated_at DESC`;
    return this.db.prepare(query).all() as Conversation[];
  }

  async getConversationById(id: string): Promise<Conversation> {
    const stmt = this.db.prepare(`
      SELECT 
        id, citizen_id as citizenId, citizen_name as citizenName,
        citizen_email as citizenEmail, status,
        assigned_to_id as assignedToId, assigned_to_name as assignedToName,
        created_at as createdAt, updated_at as updatedAt, last_message as lastMessage
      FROM support_conversations
      WHERE id = ?
    `);

    return stmt.get(id) as Conversation;
  }

  async getConversationMessages(conversationId: string): Promise<Message[]> {
    const stmt = this.db.prepare(`
      SELECT 
        id, conversation_id as conversationId, sender_id as senderId,
        sender_type as senderType, content,
        staff_name as staffName, staff_role as staffRole, staff_number as staffNumber,
        created_at as createdAt
      FROM support_messages
      WHERE conversation_id = ?
      ORDER BY created_at ASC
    `);

    return stmt.all(conversationId) as Message[];
  }

  async sendMessage(dto: any): Promise<Message> {
    const id = `msg_${Date.now()}`;
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO support_messages
      (id, conversation_id, sender_id, sender_type, content, staff_name, staff_role, staff_number, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      dto.conversationId,
      dto.senderId,
      dto.senderType,
      dto.content,
      dto.staffName || null,
      dto.staffRole || null,
      dto.staffNumber || null,
      now,
    );

    // Update conversation last message and timestamp
    const updateStmt = this.db.prepare(`
      UPDATE support_conversations
      SET last_message = ?, updated_at = ?
      WHERE id = ?
    `);

    updateStmt.run(dto.content, now, dto.conversationId);

    return {
      id,
      conversationId: dto.conversationId,
      senderId: dto.senderId,
      senderType: dto.senderType,
      content: dto.content,
      staffName: dto.staffName,
      staffRole: dto.staffRole,
      staffNumber: dto.staffNumber,
      createdAt: now,
    };
  }

  async claimConversation(id: string, dto: any): Promise<Conversation> {
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      UPDATE support_conversations
      SET status = 'active', assigned_to_id = ?, assigned_to_name = ?, updated_at = ?
      WHERE id = ?
    `);

    stmt.run(dto.staffId, dto.staffName, now, id);

    return this.getConversationById(id);
  }

  async resolveConversation(id: string): Promise<Conversation> {
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      UPDATE support_conversations
      SET status = 'resolved', updated_at = ?
      WHERE id = ?
    `);

    stmt.run(now, id);

    return this.getConversationById(id);
  }

  async getCitizenActiveConversation(citizenId: string): Promise<Conversation | null> {
    const stmt = this.db.prepare(`
      SELECT 
        id, citizen_id as citizenId, citizen_name as citizenName,
        citizen_email as citizenEmail, status,
        assigned_to_id as assignedToId, assigned_to_name as assignedToName,
        created_at as createdAt, updated_at as updatedAt, last_message as lastMessage
      FROM support_conversations
      WHERE citizen_id = ? AND status != 'resolved'
      ORDER BY updated_at DESC
      LIMIT 1
    `);

    return stmt.get(citizenId) as Conversation | null;
  }
}
