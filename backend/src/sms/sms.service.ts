import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { SmsMessage, SmsTemplate, SmsStatus, SmsProvider } from './sms.entity';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private provider: SmsProvider;

  constructor(
    @InjectRepository(SmsMessage)
    private smsRepository: Repository<SmsMessage>,
    @InjectRepository(SmsTemplate)
    private templateRepository: Repository<SmsTemplate>,
    private configService: ConfigService,
  ) {
    // Determine SMS provider from environment
    const providerName = this.configService.get<string>('SMS_PROVIDER', 'mock');
    this.provider = SmsProvider[providerName.toUpperCase() as keyof typeof SmsProvider] || SmsProvider.MOCK;
    this.logger.log(`SMS Service initialized with provider: ${this.provider}`);
  }

  // Send SMS
  async sendSms(params: {
    to: string;
    message: string;
    relatedEntityType?: string;
    relatedEntityId?: string;
    triggeredBy?: string;
  }): Promise<SmsMessage> {
    // Normalize phone number (Sierra Leone format)
    const normalizedTo = this.normalizePhoneNumber(params.to);

    // Create SMS record
    const sms = this.smsRepository.create({
      to: normalizedTo,
      message: params.message,
      status: SmsStatus.PENDING,
      provider: this.provider,
      relatedEntityType: params.relatedEntityType,
      relatedEntityId: params.relatedEntityId,
      triggeredBy: params.triggeredBy,
    });

    await this.smsRepository.save(sms);

    // Send via provider
    try {
      const result = await this.sendViaProvider(sms);
      sms.status = SmsStatus.SENT;
      sms.externalId = result.externalId;
      sms.sentAt = new Date();
    } catch (error) {
      sms.status = SmsStatus.FAILED;
      sms.errorMessage = error.message;
      this.logger.error(`Failed to send SMS: ${error.message}`);
    }

    return this.smsRepository.save(sms);
  }

  // Send SMS using template
  async sendFromTemplate(params: {
    templateCode: string;
    to: string;
    variables: Record<string, string>;
    relatedEntityType?: string;
    relatedEntityId?: string;
    triggeredBy?: string;
  }): Promise<SmsMessage | null> {
    const template = await this.templateRepository.findOne({
      where: { code: params.templateCode, isActive: true },
    });

    if (!template) {
      this.logger.warn(`Template not found: ${params.templateCode}`);
      return null;
    }

    // Replace variables in template
    let message = template.template;
    for (const [key, value] of Object.entries(params.variables)) {
      message = message.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }

    return this.sendSms({
      to: params.to,
      message,
      relatedEntityType: params.relatedEntityType,
      relatedEntityId: params.relatedEntityId,
      triggeredBy: params.triggeredBy,
    });
  }

  // Provider-specific sending
  private async sendViaProvider(sms: SmsMessage): Promise<{ externalId: string }> {
    switch (this.provider) {
      case SmsProvider.AFRICAS_TALKING:
        return this.sendViaAfricasTalking(sms);
      case SmsProvider.TWILIO:
        return this.sendViaTwilio(sms);
      default:
        return this.sendViaMock(sms);
    }
  }

  private async sendViaAfricasTalking(sms: SmsMessage): Promise<{ externalId: string }> {
    const apiKey = this.configService.get<string>('AFRICAS_TALKING_API_KEY');
    const username = this.configService.get<string>('AFRICAS_TALKING_USERNAME');
    const senderId = this.configService.get<string>('AFRICAS_TALKING_SENDER_ID', 'MINISTRY');

    if (!apiKey || !username) {
      throw new Error('Africa\'s Talking credentials not configured');
    }

    try {
      const response = await fetch('https://api.africastalking.com/version1/messaging', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
          'apiKey': apiKey,
        },
        body: new URLSearchParams({
          username,
          to: sms.to,
          message: sms.message,
          from: senderId,
        }),
      });

      const data = await response.json();

      if (data.SMSMessageData?.Recipients?.[0]?.status === 'Success') {
        return { externalId: data.SMSMessageData.Recipients[0].messageId };
      }

      throw new Error(data.SMSMessageData?.Recipients?.[0]?.status || 'Unknown error');
    } catch (error) {
      this.logger.error(`Africa's Talking error: ${error.message}`);
      throw error;
    }
  }

  private async sendViaTwilio(sms: SmsMessage): Promise<{ externalId: string }> {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    const fromNumber = this.configService.get<string>('TWILIO_PHONE_NUMBER');

    if (!accountSid || !authToken || !fromNumber) {
      throw new Error('Twilio credentials not configured');
    }

    try {
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            To: sms.to,
            From: fromNumber,
            Body: sms.message,
          }),
        },
      );

      const data = await response.json();

      if (data.sid) {
        return { externalId: data.sid };
      }

      throw new Error(data.message || 'Unknown Twilio error');
    } catch (error) {
      this.logger.error(`Twilio error: ${error.message}`);
      throw error;
    }
  }

  private async sendViaMock(sms: SmsMessage): Promise<{ externalId: string }> {
    this.logger.log(`[MOCK SMS] To: ${sms.to}, Message: ${sms.message}`);
    return { externalId: `mock-${Date.now()}` };
  }

  // Phone number normalization for Sierra Leone
  private normalizePhoneNumber(phone: string): string {
    // Remove spaces and dashes
    let normalized = phone.replace(/[\s\-]/g, '');

    // Sierra Leone numbers
    if (normalized.startsWith('0')) {
      normalized = '+232' + normalized.slice(1);
    } else if (!normalized.startsWith('+')) {
      // Assume Sierra Leone if no country code
      if (normalized.length === 8) {
        normalized = '+232' + normalized;
      } else {
        normalized = '+' + normalized;
      }
    }

    return normalized;
  }

  // Template CRUD
  async createTemplate(data: Partial<SmsTemplate>): Promise<SmsTemplate> {
    const template = this.templateRepository.create(data);
    return this.templateRepository.save(template);
  }

  async findAllTemplates(): Promise<SmsTemplate[]> {
    return this.templateRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findTemplateById(id: string): Promise<SmsTemplate | null> {
    return this.templateRepository.findOne({ where: { id } });
  }

  async updateTemplate(id: string, data: Partial<SmsTemplate>): Promise<SmsTemplate> {
    await this.templateRepository.update(id, data);
    return this.findTemplateById(id);
  }

  async deleteTemplate(id: string): Promise<void> {
    await this.templateRepository.delete(id);
  }

  // SMS History
  async findAllMessages(filters?: {
    status?: SmsStatus;
    relatedEntityType?: string;
    relatedEntityId?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ messages: SmsMessage[]; total: number }> {
    const query = this.smsRepository.createQueryBuilder('sms');

    if (filters?.status) {
      query.andWhere('sms.status = :status', { status: filters.status });
    }

    if (filters?.relatedEntityType) {
      query.andWhere('sms.relatedEntityType = :type', { type: filters.relatedEntityType });
    }

    if (filters?.relatedEntityId) {
      query.andWhere('sms.relatedEntityId = :id', { id: filters.relatedEntityId });
    }

    const total = await query.getCount();

    query.orderBy('sms.createdAt', 'DESC');

    if (filters?.limit) {
      query.take(filters.limit);
    }
    if (filters?.offset) {
      query.skip(filters.offset);
    }

    const messages = await query.getMany();
    return { messages, total };
  }

  async getStats(): Promise<{
    total: number;
    sent: number;
    delivered: number;
    failed: number;
    pending: number;
  }> {
    const stats = await this.smsRepository
      .createQueryBuilder('sms')
      .select('sms.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('sms.status')
      .getRawMany();

    const result = {
      total: 0,
      sent: 0,
      delivered: 0,
      failed: 0,
      pending: 0,
    };

    for (const stat of stats) {
      const count = parseInt(stat.count);
      result.total += count;
      result[stat.status] = count;
    }

    return result;
  }

  // Initialize default templates
  async initializeDefaultTemplates(): Promise<void> {
    const defaultTemplates = [
      {
        code: 'case_created',
        name: 'Case Created Notification',
        template: 'Ministry of Education: Your case #{{caseNumber}} has been registered. Subject: {{subject}}. We will contact you shortly.',
        description: 'Sent when a new case is created for a student',
      },
      {
        code: 'case_assigned',
        name: 'Case Assigned Notification',
        template: 'Ministry of Education: Your case #{{caseNumber}} has been assigned to {{agentName}}. They will contact you soon.',
        description: 'Sent when a case is assigned to an agent',
      },
      {
        code: 'case_resolved',
        name: 'Case Resolved Notification',
        template: 'Ministry of Education: Your case #{{caseNumber}} has been resolved. Resolution: {{resolution}}. Thank you for contacting us.',
        description: 'Sent when a case is marked as resolved',
      },
      {
        code: 'callback_scheduled',
        name: 'Callback Scheduled Notification',
        template: 'Ministry of Education: A callback has been scheduled for {{date}} at {{time}}. Please ensure you are available.',
        description: 'Sent when a callback is scheduled',
      },
      {
        code: 'missed_call',
        name: 'Missed Call Notification',
        template: 'Ministry of Education: We tried to reach you but could not connect. Please call us back at {{callbackNumber}} during office hours.',
        description: 'Sent when a call is missed',
      },
    ];

    for (const template of defaultTemplates) {
      const exists = await this.templateRepository.findOne({
        where: { code: template.code },
      });

      if (!exists) {
        await this.templateRepository.save(this.templateRepository.create(template));
        this.logger.log(`Created default SMS template: ${template.code}`);
      }
    }
  }
}
