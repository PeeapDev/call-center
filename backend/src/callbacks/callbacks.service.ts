import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual, Between } from 'typeorm';
import { Callback, CallbackStatus, CallbackPriority } from './callback.entity';
import { SmsService } from '../sms/sms.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class CallbacksService {
  private readonly logger = new Logger(CallbacksService.name);

  constructor(
    @InjectRepository(Callback)
    private callbackRepository: Repository<Callback>,
    private smsService: SmsService,
  ) {}

  // Create callback
  async createCallback(data: {
    phoneNumber: string;
    callerName?: string;
    studentId?: string;
    caseId?: string;
    scheduledDate: Date;
    scheduledTime?: string;
    reason?: string;
    notes?: string;
    priority?: CallbackPriority;
    assignedAgentId?: string;
    assignedAgentName?: string;
    createdByAgentId: string;
    createdByAgentName: string;
  }): Promise<Callback> {
    const callback = this.callbackRepository.create({
      ...data,
      status: CallbackStatus.SCHEDULED,
      priority: data.priority || CallbackPriority.NORMAL,
      timezone: 'Africa/Freetown',
    });

    const saved = await this.callbackRepository.save(callback);

    // Send SMS notification about scheduled callback
    try {
      const formattedDate = new Date(data.scheduledDate).toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      });

      await this.smsService.sendFromTemplate({
        templateCode: 'callback_scheduled',
        to: data.phoneNumber,
        variables: {
          date: formattedDate,
          time: data.scheduledTime || 'during office hours',
        },
        relatedEntityType: 'callback',
        relatedEntityId: saved.id,
      });
    } catch (error) {
      this.logger.warn(`Failed to send callback SMS: ${error.message}`);
    }

    return saved;
  }

  // Get all callbacks with filters
  async findAll(filters?: {
    status?: CallbackStatus;
    assignedAgentId?: string;
    date?: Date;
    priority?: CallbackPriority;
    limit?: number;
    offset?: number;
  }): Promise<{ callbacks: Callback[]; total: number }> {
    const query = this.callbackRepository.createQueryBuilder('callback');

    if (filters?.status) {
      query.andWhere('callback.status = :status', { status: filters.status });
    }

    if (filters?.assignedAgentId) {
      query.andWhere('callback.assignedAgentId = :agentId', { agentId: filters.assignedAgentId });
    }

    if (filters?.date) {
      const startOfDay = new Date(filters.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(filters.date);
      endOfDay.setHours(23, 59, 59, 999);
      query.andWhere('callback.scheduledDate BETWEEN :start AND :end', {
        start: startOfDay,
        end: endOfDay,
      });
    }

    if (filters?.priority) {
      query.andWhere('callback.priority = :priority', { priority: filters.priority });
    }

    const total = await query.getCount();

    query.orderBy('callback.scheduledDate', 'ASC');
    query.addOrderBy('callback.priority', 'DESC');

    if (filters?.limit) {
      query.take(filters.limit);
    }
    if (filters?.offset) {
      query.skip(filters.offset);
    }

    const callbacks = await query.getMany();
    return { callbacks, total };
  }

  // Get callbacks due today
  async getTodaysCallbacks(agentId?: string): Promise<Callback[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const query = this.callbackRepository.createQueryBuilder('callback')
      .where('callback.scheduledDate >= :today', { today })
      .andWhere('callback.scheduledDate < :tomorrow', { tomorrow })
      .andWhere('callback.status IN (:...statuses)', {
        statuses: [CallbackStatus.SCHEDULED, CallbackStatus.IN_PROGRESS],
      });

    if (agentId) {
      query.andWhere('(callback.assignedAgentId = :agentId OR callback.assignedAgentId IS NULL)', { agentId });
    }

    return query.orderBy('callback.scheduledTime', 'ASC').getMany();
  }

  // Get upcoming callbacks (next 7 days)
  async getUpcomingCallbacks(agentId?: string): Promise<Callback[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const query = this.callbackRepository.createQueryBuilder('callback')
      .where('callback.scheduledDate >= :today', { today })
      .andWhere('callback.scheduledDate <= :nextWeek', { nextWeek })
      .andWhere('callback.status = :status', { status: CallbackStatus.SCHEDULED });

    if (agentId) {
      query.andWhere('(callback.assignedAgentId = :agentId OR callback.assignedAgentId IS NULL)', { agentId });
    }

    return query
      .orderBy('callback.scheduledDate', 'ASC')
      .addOrderBy('callback.scheduledTime', 'ASC')
      .getMany();
  }

  // Find by ID
  async findById(id: string): Promise<Callback | null> {
    return this.callbackRepository.findOne({ where: { id } });
  }

  // Update callback
  async updateCallback(id: string, data: Partial<Callback>): Promise<Callback> {
    await this.callbackRepository.update(id, data);
    return this.findById(id);
  }

  // Record attempt
  async recordAttempt(
    id: string,
    attempt: {
      agentId: string;
      agentName: string;
      result: 'answered' | 'no_answer' | 'busy' | 'failed';
      notes?: string;
      duration?: number;
    },
  ): Promise<Callback> {
    const callback = await this.findById(id);
    if (!callback) {
      throw new Error('Callback not found');
    }

    const attemptRecord = {
      timestamp: new Date().toISOString(),
      ...attempt,
    };

    callback.attempts = [...(callback.attempts || []), attemptRecord];
    callback.attemptCount += 1;

    // Update status based on result
    if (attempt.result === 'answered') {
      callback.status = CallbackStatus.COMPLETED;
      callback.completedAt = new Date();
      callback.completedByAgentId = attempt.agentId;
      callback.completedByAgentName = attempt.agentName;
    } else if (callback.attemptCount >= callback.maxAttempts) {
      callback.status = CallbackStatus.MISSED;
      // Send missed call SMS
      try {
        await this.smsService.sendFromTemplate({
          templateCode: 'missed_call',
          to: callback.phoneNumber,
          variables: {
            callbackNumber: '+232 XX XXX XXXX', // Ministry callback number
          },
          relatedEntityType: 'callback',
          relatedEntityId: callback.id,
        });
      } catch (error) {
        this.logger.warn(`Failed to send missed call SMS: ${error.message}`);
      }
    }

    return this.callbackRepository.save(callback);
  }

  // Complete callback
  async completeCallback(
    id: string,
    data: {
      agentId: string;
      agentName: string;
      outcome: string;
      notes?: string;
    },
  ): Promise<Callback> {
    const callback = await this.findById(id);
    if (!callback) {
      throw new Error('Callback not found');
    }

    callback.status = CallbackStatus.COMPLETED;
    callback.outcome = data.outcome;
    callback.notes = data.notes || callback.notes;
    callback.completedAt = new Date();
    callback.completedByAgentId = data.agentId;
    callback.completedByAgentName = data.agentName;

    return this.callbackRepository.save(callback);
  }

  // Cancel callback
  async cancelCallback(id: string, reason?: string): Promise<Callback> {
    const callback = await this.findById(id);
    if (!callback) {
      throw new Error('Callback not found');
    }

    callback.status = CallbackStatus.CANCELLED;
    if (reason) {
      callback.notes = (callback.notes ? callback.notes + '\n' : '') + `Cancelled: ${reason}`;
    }

    return this.callbackRepository.save(callback);
  }

  // Assign to agent
  async assignToAgent(id: string, agentId: string, agentName: string): Promise<Callback> {
    return this.updateCallback(id, {
      assignedAgentId: agentId,
      assignedAgentName: agentName,
    });
  }

  // Reschedule
  async reschedule(id: string, newDate: Date, newTime?: string): Promise<Callback> {
    const callback = await this.findById(id);
    if (!callback) {
      throw new Error('Callback not found');
    }

    callback.scheduledDate = newDate;
    callback.scheduledTime = newTime || callback.scheduledTime;
    callback.status = CallbackStatus.SCHEDULED;

    return this.callbackRepository.save(callback);
  }

  // Get stats
  async getStats(): Promise<{
    total: number;
    scheduled: number;
    completed: number;
    missed: number;
    todayCount: number;
    completionRate: number;
  }> {
    const total = await this.callbackRepository.count();

    const byStatus = await this.callbackRepository
      .createQueryBuilder('callback')
      .select('callback.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('callback.status')
      .getRawMany();

    const statusCounts: Record<string, number> = {};
    for (const stat of byStatus) {
      statusCounts[stat.status] = parseInt(stat.count);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayCount = await this.callbackRepository.count({
      where: {
        scheduledDate: Between(today, tomorrow),
        status: CallbackStatus.SCHEDULED,
      },
    });

    const completed = statusCounts[CallbackStatus.COMPLETED] || 0;
    const missed = statusCounts[CallbackStatus.MISSED] || 0;
    const completionRate = total > 0 ? Math.round((completed / (completed + missed)) * 100) : 0;

    return {
      total,
      scheduled: statusCounts[CallbackStatus.SCHEDULED] || 0,
      completed,
      missed,
      todayCount,
      completionRate,
    };
  }

  // Cron job to send reminders (runs every hour)
  @Cron(CronExpression.EVERY_HOUR)
  async sendReminders() {
    const now = new Date();
    const inOneHour = new Date(now.getTime() + 60 * 60 * 1000);

    // Find callbacks scheduled in the next hour that haven't had reminders sent
    const upcomingCallbacks = await this.callbackRepository.find({
      where: {
        scheduledDate: Between(now, inOneHour),
        status: CallbackStatus.SCHEDULED,
        reminderSent: false,
      },
    });

    for (const callback of upcomingCallbacks) {
      try {
        await this.smsService.sendSms({
          to: callback.phoneNumber,
          message: `Ministry of Education: Reminder - We will be calling you shortly regarding your inquiry. Please ensure you are available.`,
          relatedEntityType: 'callback',
          relatedEntityId: callback.id,
        });

        callback.reminderSent = true;
        await this.callbackRepository.save(callback);
        this.logger.log(`Sent reminder for callback ${callback.id}`);
      } catch (error) {
        this.logger.warn(`Failed to send reminder for callback ${callback.id}: ${error.message}`);
      }
    }
  }
}
