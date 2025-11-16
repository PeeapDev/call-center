import { Injectable } from '@nestjs/common';
import Database from 'better-sqlite3';
import * as path from 'path';

export interface Notification {
  id: string;
  type: 'call' | 'chat' | 'system';
  title: string;
  message: string;
  payload: any;
  status: 'unread' | 'read';
  createdAt: string;
}

@Injectable()
export class NotificationsService {
  private db: Database.Database;

  constructor() {
    const dbPath = path.join(__dirname, '../../callcenter.db');
    this.db = new Database(dbPath);
    this.initializeDatabase();
  }

  private initializeDatabase() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS admin_notifications (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        payload TEXT,
        status TEXT DEFAULT 'unread',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_notifications_status ON admin_notifications(status);
      CREATE INDEX IF NOT EXISTS idx_notifications_created ON admin_notifications(created_at);
    `);
  }

  async createNotification(dto: {
    type: 'call' | 'chat' | 'system';
    title: string;
    message: string;
    payload?: any;
  }): Promise<Notification> {
    const id = `notif_${Date.now()}`;
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO admin_notifications 
      (id, type, title, message, payload, status, created_at)
      VALUES (?, ?, ?, ?, ?, 'unread', ?)
    `);

    stmt.run(
      id,
      dto.type,
      dto.title,
      dto.message,
      dto.payload ? JSON.stringify(dto.payload) : null,
      now,
    );

    return this.getNotificationById(id);
  }

  async getNotifications(status?: 'unread' | 'read'): Promise<Notification[]> {
    let query = `
      SELECT 
        id, type, title, message, payload, status,
        created_at as createdAt
      FROM admin_notifications
    `;

    if (status) {
      query += ` WHERE status = ?`;
      const results = this.db.prepare(query).all(status) as any[];
      return results.map((r) => ({
        ...r,
        payload: r.payload ? JSON.parse(r.payload) : null,
      }));
    }

    query += ` ORDER BY created_at DESC LIMIT 50`;
    const results = this.db.prepare(query).all() as any[];
    return results.map((r) => ({
      ...r,
      payload: r.payload ? JSON.parse(r.payload) : null,
    }));
  }

  async getNotificationById(id: string): Promise<Notification> {
    const stmt = this.db.prepare(`
      SELECT 
        id, type, title, message, payload, status,
        created_at as createdAt
      FROM admin_notifications
      WHERE id = ?
    `);

    const result = stmt.get(id) as any;
    return {
      ...result,
      payload: result.payload ? JSON.parse(result.payload) : null,
    };
  }

  async markAsRead(id: string): Promise<Notification> {
    const stmt = this.db.prepare(`
      UPDATE admin_notifications
      SET status = 'read'
      WHERE id = ?
    `);

    stmt.run(id);
    return this.getNotificationById(id);
  }

  async markAllAsRead(): Promise<void> {
    const stmt = this.db.prepare(`
      UPDATE admin_notifications
      SET status = 'read'
      WHERE status = 'unread'
    `);

    stmt.run();
  }

  async deleteNotification(id: string): Promise<void> {
    const stmt = this.db.prepare(`
      DELETE FROM admin_notifications WHERE id = ?
    `);

    stmt.run(id);
  }

  async getUnreadCount(): Promise<number> {
    const stmt = this.db.prepare(`
      SELECT COUNT(*) as count FROM admin_notifications WHERE status = 'unread'
    `);

    const result = stmt.get() as any;
    return result.count;
  }
}
