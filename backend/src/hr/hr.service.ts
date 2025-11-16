import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not } from 'typeorm';
import { User, AccountType } from './user.entity';
import { AgentStatus, AgentStatusType } from './agent-status.entity';
import { WebRTCConfig } from './webrtc-config.entity';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class HrService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(AgentStatus)
    private agentStatusRepository: Repository<AgentStatus>,
    @InjectRepository(WebRTCConfig)
    private webrtcConfigRepository: Repository<WebRTCConfig>,
  ) {
    this.initializeDefaultData();
  }

  private async initializeDefaultData() {
    // Create default WebRTC config if it doesn't exist
    const existingConfig = await this.webrtcConfigRepository.findOne({ where: { id: 'default' } });
    if (!existingConfig) {
      const defaultConfig = this.webrtcConfigRepository.create({
        id: 'default',
        stunServer: 'stun:stun.l.google.com:19302',
        asteriskWsUrl: 'ws://localhost:8088/ws',
      });
      await this.webrtcConfigRepository.save(defaultConfig);
    }
  }

  private generateSIPCredentials(name: string) {
    const username = name.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now();
    const password = crypto.randomBytes(16).toString('hex');

    return {
      sipUsername: username,
      sipPassword: password,
    };
  }

  private async generateExtension(): Promise<string> {
    // Generate extension between 1000-9999
    const lastUser = await this.userRepository.findOne({
      where: { sipExtension: Not(IsNull()) },
      order: { sipExtension: 'DESC' },
    });

    if (lastUser?.sipExtension) {
      const lastExt = parseInt(lastUser.sipExtension);
      return (lastExt + 1).toString();
    }

    return '1000'; // Start from 1000
  }

  async createUser(userData: any): Promise<User> {
    try {
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Generate SIP credentials for agents
      let sipCreds = null;
      let sipExtension = null;
      if (userData.accountType === 'agent' || userData.accountType === 'supervisor' || userData.accountType === 'admin') {
        sipCreds = this.generateSIPCredentials(userData.name);
        sipExtension = await this.generateExtension();
      }

      const user = this.userRepository.create({
        phoneNumber: userData.phoneNumber,
        password: hashedPassword,
        name: userData.name,
        accountType: userData.accountType,
        userCategory: userData.userCategory || undefined,
        extension: userData.extension || undefined,
        skills: userData.skills || [],
        isActive: userData.isActive !== undefined ? userData.isActive : true,
        sipUsername: sipCreds?.sipUsername || undefined,
        sipPassword: sipCreds?.sipPassword || undefined,
        sipExtension: sipExtension || undefined,
      });

      const savedUser = await this.userRepository.save(user);

      // Return the user without password
      const { password, ...result } = savedUser;
      return result as any;
    } catch (error) {
      console.error('Error in createUser:', error, { userData });
      throw error;
    }
  }

  async updateUser(id: string, userData: any): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new Error('User not found');
    }

    // Update fields
    if (userData.name !== undefined) user.name = userData.name;
    if (userData.phoneNumber !== undefined) user.phoneNumber = userData.phoneNumber;
    if (userData.accountType !== undefined) user.accountType = userData.accountType as AccountType;
    if (userData.userCategory !== undefined) user.userCategory = userData.userCategory;
    if (userData.extension !== undefined) user.extension = userData.extension;
    if (userData.skills !== undefined) user.skills = userData.skills;
    if (userData.isActive !== undefined) user.isActive = userData.isActive;

    if (userData.password) {
      user.password = await bcrypt.hash(userData.password, 10);
    }

    await this.userRepository.save(user);
    return this.getUserById(id);
  }

  async deleteUser(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new Error('User not found');
    }

    // Return user without password
    const { password, ...result } = user;
    return result as User;
  }

  async getUsers(filters?: any): Promise<User[]> {
    try {
      const queryBuilder = this.userRepository.createQueryBuilder('user');

      if (filters?.accountType) {
        queryBuilder.andWhere('user.accountType = :accountType', { accountType: filters.accountType });
      }

      if (filters?.isActive !== undefined) {
        queryBuilder.andWhere('user.isActive = :isActive', { isActive: filters.isActive });
      }

      if (filters?.userCategory) {
        queryBuilder.andWhere('user.userCategory = :userCategory', { userCategory: filters.userCategory });
      }

      queryBuilder.orderBy('user.createdAt', 'DESC');

      const users = await queryBuilder.getMany();

      // Return users without passwords
      return users.map(user => {
        const { password, ...result } = user;
        return result as User;
      });
    } catch (error) {
      console.error('Error in getUsers:', error, { filters });
      throw error;
    }
  }

  async regenerateSIPCredentials(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    const sipCreds = this.generateSIPCredentials(user.name);
    const extension = await this.generateExtension();

    user.sipUsername = sipCreds.sipUsername;
    user.sipPassword = sipCreds.sipPassword;
    user.sipExtension = extension;

    await this.userRepository.save(user);

    return this.getUserById(userId);
  }

  async getWebRTCConfig(): Promise<any> {
    const config = await this.webrtcConfigRepository.findOne({ where: { id: 'default' } });
    if (!config) {
      throw new Error('WebRTC config not found');
    }

    return {
      stunServer: config.stunServer,
      turnServer: config.turnServer,
      turnUsername: config.turnUsername,
      turnPassword: config.turnPassword,
      asteriskWsUrl: config.asteriskWsUrl,
    };
  }

  async updateWebRTCConfig(config: any): Promise<any> {
    const existingConfig = await this.webrtcConfigRepository.findOne({ where: { id: 'default' } });
    if (!existingConfig) {
      throw new Error('WebRTC config not found');
    }

    existingConfig.stunServer = config.stunServer;
    existingConfig.turnServer = config.turnServer || null;
    existingConfig.turnUsername = config.turnUsername || null;
    existingConfig.turnPassword = config.turnPassword || null;
    existingConfig.asteriskWsUrl = config.asteriskWsUrl;

    await this.webrtcConfigRepository.save(existingConfig);

    return this.getWebRTCConfig();
  }

  // Agent Status Management Methods

  async updateAgentStatus(agentId: string, status: AgentStatusType, currentCallId?: string): Promise<void> {
    const existing = await this.agentStatusRepository.findOne({ where: { agentId } });

    if (existing) {
      existing.status = status;
      existing.currentCallId = currentCallId || undefined;
      existing.lastActivity = new Date();
      await this.agentStatusRepository.save(existing);
    } else {
      const newStatus = this.agentStatusRepository.create({
        agentId,
        status,
        currentCallId: currentCallId || undefined,
        lastActivity: new Date(),
      });
      await this.agentStatusRepository.save(newStatus);
    }
  }

  async getAgentStatus(agentId: string): Promise<AgentStatus | null> {
    return this.agentStatusRepository.findOne({ where: { agentId } });
  }

  async getAllAgentStatuses(): Promise<AgentStatus[]> {
    return this.agentStatusRepository.find({
      order: { updatedAt: 'DESC' },
    });
  }

  async getAvailableAgents(agentIds?: string[]): Promise<User[]> {
    // Validate agentIds to ensure they are strings
    if (agentIds && agentIds.length > 0) {
      agentIds = agentIds.filter(id => id && typeof id === 'string');
    }

    try {
      const queryBuilder = this.userRepository
        .createQueryBuilder('u')
        .leftJoinAndSelect('agent_status', 's', 'u.id = s.agentId')
        .where('u.accountType IN (:...types)', { types: ['agent', 'supervisor', 'admin'] })
        .andWhere('u.isActive = :isActive', { isActive: true })
        .andWhere('(s.status IS NULL OR s.status = :status)', { status: AgentStatusType.AVAILABLE })
        .orderBy('u.name', 'ASC');

      if (agentIds && agentIds.length > 0) {
        queryBuilder.andWhere('u.id IN (:...agentIds)', { agentIds });
      }

      const users = await queryBuilder.getMany();

      // Return users without passwords
      return users.map(user => {
        const { password, ...result } = user;
        return result as User;
      });
    } catch (error) {
      console.error('Error in getAvailableAgents:', error, { agentIds });
      throw error;
    }
  }

  async getNextAvailableAgent(agentIds: string[]): Promise<User | null> {
    const availableAgents = await this.getAvailableAgents(agentIds);
    return availableAgents.length > 0 ? availableAgents[0] : null;
  }

  async markAgentBusy(agentId: string, callId: string): Promise<void> {
    await this.updateAgentStatus(agentId, AgentStatusType.BUSY, callId);
  }

  async markAgentAvailable(agentId: string): Promise<void> {
    await this.updateAgentStatus(agentId, AgentStatusType.AVAILABLE);
  }

  async getAgentsWithStatus(agentIds?: string[]): Promise<(User & { status: string; currentCallId?: string })[]> {
    // Validate agentIds to ensure they are strings
    if (agentIds && agentIds.length > 0) {
      agentIds = agentIds.filter(id => id && typeof id === 'string');
    }

    try {
      const queryBuilder = this.userRepository
        .createQueryBuilder('u')
        .leftJoin('agent_status', 's', 'u.id = s.agentId')
        .addSelect('COALESCE(s.status, :defaultStatus)', 'status')
        .addSelect('s.currentCallId', 'currentCallId')
        .setParameter('defaultStatus', AgentStatusType.OFFLINE)
        .where('u.accountType IN (:...types)', { types: ['agent', 'supervisor', 'admin'] })
        .andWhere('u.isActive = :isActive', { isActive: true })
        .orderBy('u.name', 'ASC');

      if (agentIds && agentIds.length > 0) {
        queryBuilder.andWhere('u.id IN (:...agentIds)', { agentIds });
      }

      const users = await queryBuilder.getRawAndEntities();

      // Combine the results
      return users.entities.map((user, index) => ({
        ...user,
        status: users.raw[index].status,
        currentCallId: users.raw[index].currentCallId,
      })) as (User & { status: string; currentCallId?: string })[];
    } catch (error) {
      console.error('Error in getAgentsWithStatus:', error, { agentIds });
      throw error;
    }
  }
}
