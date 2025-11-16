import { Injectable } from '@nestjs/common';
import Database from 'better-sqlite3';
import * as path from 'path';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

interface User {
  id: string;
  phoneNumber: string;
  name: string;
  accountType: string;
  userCategory?: string;
  extension?: string;
  skills?: string;
  isActive: boolean;
  sipUsername?: string;
  sipPassword?: string;
  sipExtension?: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class HrService {
  private db: Database.Database;

  constructor() {
    const dbPath = path.join(__dirname, '../../callcenter.db');
    this.db = new Database(dbPath);
    this.initializeDatabase();
  }

  private initializeDatabase() {
    // Add SIP fields to users table if they don't exist
    try {
      this.db.exec(`
        ALTER TABLE users ADD COLUMN sip_username TEXT;
      `);
    } catch (e) {
      // Column might already exist
    }

    try {
      this.db.exec(`
        ALTER TABLE users ADD COLUMN sip_password TEXT;
      `);
    } catch (e) {
      // Column might already exist
    }

    try {
      this.db.exec(`
        ALTER TABLE users ADD COLUMN sip_extension TEXT;
      `);
    } catch (e) {
      // Column might already exist
    }

    // Create WebRTC configuration table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS webrtc_config (
        id TEXT PRIMARY KEY,
        stun_server TEXT,
        turn_server TEXT,
        turn_username TEXT,
        turn_password TEXT,
        asterisk_ws_url TEXT DEFAULT 'ws://localhost:8088/ws',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- Create default config if not exists
      INSERT OR IGNORE INTO webrtc_config (id, stun_server, asterisk_ws_url)
      VALUES ('default', 'stun:stun.l.google.com:19302', 'ws://localhost:8088/ws');
    `);
  }

  private generateSIPCredentials(name: string) {
    const username = name.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now();
    const password = crypto.randomBytes(16).toString('hex');
    const extension = this.generateExtension();

    return {
      sipUsername: username,
      sipPassword: password,
      sipExtension: extension,
    };
  }

  private generateExtension(): string {
    // Generate extension between 1000-9999
    const stmt = this.db.prepare(`
      SELECT sip_extension FROM users WHERE sip_extension IS NOT NULL ORDER BY sip_extension DESC LIMIT 1
    `);
    const result = stmt.get() as any;

    if (result && result.sip_extension) {
      const lastExt = parseInt(result.sip_extension);
      return (lastExt + 1).toString();
    }

    return '1000'; // Start from 1000
  }

  async createUser(userData: any): Promise<User> {
    const id = `user_${Date.now()}`;
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const now = new Date().toISOString();

    // Generate SIP credentials for agents
    let sipCreds = null;
    if (userData.accountType === 'agent' || userData.accountType === 'supervisor' || userData.accountType === 'admin') {
      sipCreds = this.generateSIPCredentials(userData.name);
    }

    const stmt = this.db.prepare(`
      INSERT INTO users 
      (id, phoneNumber, password, name, accountType, userCategory, extension, skills, 
       isActive, sip_username, sip_password, sip_extension, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      userData.phoneNumber,
      hashedPassword,
      userData.name,
      userData.accountType,
      userData.userCategory || null,
      userData.extension || null,
      userData.skills ? JSON.stringify(userData.skills) : null,
      userData.isActive !== undefined ? userData.isActive : true,
      sipCreds?.sipUsername || null,
      sipCreds?.sipPassword || null,
      sipCreds?.sipExtension || null,
      now,
      now,
    );

    return this.getUserById(id);
  }

  async updateUser(id: string, userData: any): Promise<User> {
    const now = new Date().toISOString();
    const updates: string[] = [];
    const values: any[] = [];

    if (userData.name !== undefined) {
      updates.push('name = ?');
      values.push(userData.name);
    }

    if (userData.phoneNumber !== undefined) {
      updates.push('phoneNumber = ?');
      values.push(userData.phoneNumber);
    }

    if (userData.accountType !== undefined) {
      updates.push('accountType = ?');
      values.push(userData.accountType);
    }

    if (userData.userCategory !== undefined) {
      updates.push('userCategory = ?');
      values.push(userData.userCategory);
    }

    if (userData.extension !== undefined) {
      updates.push('extension = ?');
      values.push(userData.extension);
    }

    if (userData.skills !== undefined) {
      updates.push('skills = ?');
      values.push(JSON.stringify(userData.skills));
    }

    if (userData.isActive !== undefined) {
      updates.push('isActive = ?');
      values.push(userData.isActive);
    }

    if (userData.password) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      updates.push('password = ?');
      values.push(hashedPassword);
    }

    updates.push('updatedAt = ?');
    values.push(now);
    values.push(id);

    const stmt = this.db.prepare(`
      UPDATE users SET ${updates.join(', ')} WHERE id = ?
    `);

    stmt.run(...values);

    return this.getUserById(id);
  }

  async deleteUser(id: string): Promise<void> {
    const stmt = this.db.prepare('DELETE FROM users WHERE id = ?');
    stmt.run(id);
  }

  async getUserById(id: string): Promise<User> {
    const stmt = this.db.prepare(`
      SELECT 
        id, phoneNumber, name, accountType, userCategory, extension, skills,
        isActive, sip_username as sipUsername, sip_password as sipPassword,
        sip_extension as sipExtension, createdAt, updatedAt
      FROM users
      WHERE id = ?
    `);

    const user = stmt.get(id) as any;

    if (user && user.skills) {
      try {
        user.skills = JSON.parse(user.skills);
      } catch (e) {
        user.skills = [];
      }
    }

    return user;
  }

  async getUsers(filters?: any): Promise<User[]> {
    let query = `
      SELECT 
        id, phoneNumber, name, accountType, userCategory, extension, skills,
        isActive, sip_username as sipUsername, sip_password as sipPassword,
        sip_extension as sipExtension, createdAt, updatedAt
      FROM users
      WHERE 1=1
    `;

    const params: any[] = [];

    if (filters?.accountType) {
      query += ' AND accountType = ?';
      params.push(filters.accountType);
    }

    if (filters?.isActive !== undefined) {
      query += ' AND isActive = ?';
      params.push(filters.isActive);
    }

    if (filters?.userCategory) {
      query += ' AND userCategory = ?';
      params.push(filters.userCategory);
    }

    query += ' ORDER BY createdAt DESC';

    const stmt = this.db.prepare(query);
    const users = stmt.all(...params) as any[];

    return users.map(user => {
      if (user.skills) {
        try {
          user.skills = JSON.parse(user.skills);
        } catch (e) {
          user.skills = [];
        }
      }
      return user;
    });
  }

  async regenerateSIPCredentials(userId: string): Promise<User> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const sipCreds = this.generateSIPCredentials(user.name);

    const stmt = this.db.prepare(`
      UPDATE users 
      SET sip_username = ?, sip_password = ?, sip_extension = ?, updatedAt = ?
      WHERE id = ?
    `);

    stmt.run(
      sipCreds.sipUsername,
      sipCreds.sipPassword,
      sipCreds.sipExtension,
      new Date().toISOString(),
      userId,
    );

    return this.getUserById(userId);
  }

  async getWebRTCConfig(): Promise<any> {
    const stmt = this.db.prepare(`
      SELECT 
        stun_server as stunServer,
        turn_server as turnServer,
        turn_username as turnUsername,
        turn_password as turnPassword,
        asterisk_ws_url as asteriskWsUrl
      FROM webrtc_config
      WHERE id = 'default'
    `);

    return stmt.get();
  }

  async updateWebRTCConfig(config: any): Promise<any> {
    const stmt = this.db.prepare(`
      UPDATE webrtc_config
      SET stun_server = ?, turn_server = ?, turn_username = ?, turn_password = ?, 
          asterisk_ws_url = ?, updated_at = ?
      WHERE id = 'default'
    `);

    stmt.run(
      config.stunServer,
      config.turnServer || null,
      config.turnUsername || null,
      config.turnPassword || null,
      config.asteriskWsUrl,
      new Date().toISOString(),
    );

    return this.getWebRTCConfig();
  }
}
