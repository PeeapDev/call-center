import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { Case } from './case.entity';

@Injectable()
export class CaseService {
  constructor(
    @InjectRepository(Case)
    private caseRepository: Repository<Case>,
  ) {}

  async findAll(filters?: {
    status?: string;
    priority?: string;
    category?: string;
    assignedTo?: string;
  }): Promise<Case[]> {
    const where: any = {};
    
    if (filters?.status) where.status = filters.status;
    if (filters?.priority) where.priority = filters.priority;
    if (filters?.category) where.category = filters.category;
    if (filters?.assignedTo) where.assignedTo = filters.assignedTo;

    return this.caseRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Case | null> {
    return this.caseRepository.findOne({ where: { id } });
  }

  async create(caseData: Partial<Case>): Promise<Case> {
    // Generate reference number
    const year = new Date().getFullYear();
    const count = await this.caseRepository.count();
    const refNumber = `CASE-${year}-${(count + 1).toString().padStart(4, '0')}`;

    const newCase = this.caseRepository.create({
      ...caseData,
      referenceNumber: refNumber,
      status: caseData.status || 'open',
      priority: caseData.priority || 'medium',
    });

    return this.caseRepository.save(newCase);
  }

  async update(id: string, caseData: Partial<Case>): Promise<Case | null> {
    const existingCase = await this.findOne(id);
    
    if (!existingCase) {
      return null;
    }

    // Calculate duration if resolving
    if (caseData.status === 'resolved' && !existingCase.resolvedAt) {
      caseData.resolvedAt = new Date();
      const created = new Date(existingCase.createdAt);
      const resolved = new Date(caseData.resolvedAt);
      const diffTime = Math.abs(resolved.getTime() - created.getTime());
      caseData.durationDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    await this.caseRepository.update(id, caseData);
    return this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    await this.caseRepository.delete(id);
  }

  async linkCall(caseId: string, callData: {
    callId: string;
    callRecordingUrl?: string;
    callDuration?: number;
    callStartTime?: Date;
    callEndTime?: Date;
  }): Promise<Case | null> {
    await this.caseRepository.update(caseId, callData);
    return this.findOne(caseId);
  }

  async addNote(caseId: string, note: string, authorId: string): Promise<Case | null> {
    const caseRecord = await this.findOne(caseId);
    if (!caseRecord) return null;
    const notes = caseRecord.notes || [];
    
    notes.push({
      text: note,
      authorId,
      timestamp: new Date().toISOString(),
    });

    await this.caseRepository.update(caseId, { notes });
    return this.findOne(caseId);
  }

  async getStats(): Promise<any> {
    const total = await this.caseRepository.count();
    const open = await this.caseRepository.count({ where: { status: 'open' } });
    const inProgress = await this.caseRepository.count({ where: { status: 'in_progress' } });
    const resolved = await this.caseRepository.count({ where: { status: 'resolved' } });
    const closed = await this.caseRepository.count({ where: { status: 'closed' } });

    const highPriority = await this.caseRepository.count({ where: { priority: 'high' } });
    const urgent = await this.caseRepository.count({ where: { priority: 'urgent' } });
    const critical = await this.caseRepository.count({ where: { priority: 'critical' } });

    // Average resolution time
    const resolvedCases = await this.caseRepository.find({
      where: { status: 'resolved' },
      select: ['durationDays'],
    });
    
    const avgResolutionDays = resolvedCases.length > 0
      ? resolvedCases.reduce((sum, c) => sum + (c.durationDays || 0), 0) / resolvedCases.length
      : 0;

    return {
      total,
      byStatus: { open, inProgress, resolved, closed },
      byPriority: { high: highPriority, urgent, critical },
      avgResolutionDays: Math.round(avgResolutionDays * 10) / 10,
    };
  }

  async getCasesByDateRange(startDate: Date, endDate: Date): Promise<Case[]> {
    return this.caseRepository.find({
      where: {
        createdAt: Between(startDate, endDate) as any,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async searchCases(searchTerm: string): Promise<Case[]> {
    return this.caseRepository.find({
      where: [
        { title: Like(`%${searchTerm}%`) },
        { description: Like(`%${searchTerm}%`) },
        { referenceNumber: Like(`%${searchTerm}%`) },
        { callerPhone: Like(`%${searchTerm}%`) },
      ],
      order: { createdAt: 'DESC' },
    });
  }
}
