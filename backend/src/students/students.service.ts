import { Injectable, Logger, Inject, forwardRef, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Student, StudentCase, StudentStatus, EducationLevel } from './student.entity';
import { v4 as uuidv4 } from 'uuid';
import { SmsService } from '../sms/sms.service';

@Injectable()
export class StudentsService {
  private readonly logger = new Logger(StudentsService.name);

  constructor(
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(StudentCase)
    private caseRepository: Repository<StudentCase>,
    @Optional() private smsService?: SmsService,
  ) {}

  // Student CRUD
  async createStudent(data: Partial<Student>): Promise<Student> {
    const student = this.studentRepository.create(data);
    return this.studentRepository.save(student);
  }

  async findAllStudents(filters?: {
    search?: string;
    status?: StudentStatus;
    educationLevel?: EducationLevel;
    district?: string;
    schoolCode?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ students: Student[]; total: number }> {
    const query = this.studentRepository.createQueryBuilder('student');

    if (filters?.search) {
      query.andWhere(
        '(student.firstName LIKE :search OR student.lastName LIKE :search OR student.studentId LIKE :search OR student.phoneNumber LIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    if (filters?.status) {
      query.andWhere('student.status = :status', { status: filters.status });
    }

    if (filters?.educationLevel) {
      query.andWhere('student.educationLevel = :level', { level: filters.educationLevel });
    }

    if (filters?.district) {
      query.andWhere('student.district = :district', { district: filters.district });
    }

    if (filters?.schoolCode) {
      query.andWhere('student.schoolCode = :schoolCode', { schoolCode: filters.schoolCode });
    }

    const total = await query.getCount();

    query.orderBy('student.updatedAt', 'DESC');

    if (filters?.limit) {
      query.take(filters.limit);
    }
    if (filters?.offset) {
      query.skip(filters.offset);
    }

    const students = await query.getMany();
    return { students, total };
  }

  async findStudentById(id: string): Promise<Student | null> {
    return this.studentRepository.findOne({ where: { id } });
  }

  async findStudentByStudentId(studentId: string): Promise<Student | null> {
    return this.studentRepository.findOne({ where: { studentId } });
  }

  async findStudentByPhone(phoneNumber: string): Promise<Student | null> {
    return this.studentRepository.findOne({ where: { phoneNumber } });
  }

  async updateStudent(id: string, data: Partial<Student>): Promise<Student> {
    await this.studentRepository.update(id, data);
    return this.findStudentById(id);
  }

  async deleteStudent(id: string): Promise<void> {
    await this.studentRepository.delete(id);
  }

  // Add issue to student record
  async addStudentIssue(
    studentId: string,
    issue: { type: string; description: string },
  ): Promise<Student> {
    const student = await this.findStudentById(studentId);
    if (!student) {
      throw new Error('Student not found');
    }

    const newIssue = {
      id: uuidv4(),
      type: issue.type,
      description: issue.description,
      status: 'open',
      createdAt: new Date().toISOString(),
    };

    student.issues = [...(student.issues || []), newIssue];
    return this.studentRepository.save(student);
  }

  // Link call to student
  async linkCallToStudent(studentId: string, callId: string): Promise<Student> {
    const student = await this.findStudentById(studentId);
    if (!student) {
      throw new Error('Student not found');
    }

    student.callIds = [...(student.callIds || []), callId];
    return this.studentRepository.save(student);
  }

  // Case Management
  async createCase(data: {
    studentId: string;
    category: string;
    subject: string;
    description: string;
    priority?: string;
    assignedAgentId?: string;
    assignedAgentName?: string;
  }): Promise<StudentCase> {
    const caseNumber = `CASE-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    const newCase = this.caseRepository.create({
      ...data,
      caseNumber,
      status: 'open',
      priority: data.priority || 'medium',
    });

    const savedCase = await this.caseRepository.save(newCase);

    // Send SMS notification if student has a phone number
    try {
      const student = await this.findStudentByStudentId(data.studentId);
      if (student?.phoneNumber && this.smsService) {
        await this.smsService.sendFromTemplate({
          templateCode: 'case_created',
          to: student.phoneNumber,
          variables: {
            caseNumber,
            subject: data.subject,
          },
          relatedEntityType: 'case',
          relatedEntityId: savedCase.id,
        });
        this.logger.log(`SMS notification sent for case ${caseNumber}`);
      }
    } catch (error) {
      this.logger.warn(`Failed to send SMS for case ${caseNumber}: ${error.message}`);
    }

    return savedCase;
  }

  async findAllCases(filters?: {
    studentId?: string;
    status?: string;
    category?: string;
    assignedAgentId?: string;
    priority?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ cases: StudentCase[]; total: number }> {
    const query = this.caseRepository.createQueryBuilder('case');

    if (filters?.studentId) {
      query.andWhere('case.studentId = :studentId', { studentId: filters.studentId });
    }

    if (filters?.status) {
      query.andWhere('case.status = :status', { status: filters.status });
    }

    if (filters?.category) {
      query.andWhere('case.category = :category', { category: filters.category });
    }

    if (filters?.assignedAgentId) {
      query.andWhere('case.assignedAgentId = :agentId', { agentId: filters.assignedAgentId });
    }

    if (filters?.priority) {
      query.andWhere('case.priority = :priority', { priority: filters.priority });
    }

    const total = await query.getCount();

    query.orderBy('case.createdAt', 'DESC');

    if (filters?.limit) {
      query.take(filters.limit);
    }
    if (filters?.offset) {
      query.skip(filters.offset);
    }

    const cases = await query.getMany();
    return { cases, total };
  }

  async findCaseById(id: string): Promise<StudentCase | null> {
    return this.caseRepository.findOne({ where: { id } });
  }

  async updateCase(
    id: string,
    data: Partial<StudentCase>,
    agentId?: string,
    agentName?: string,
  ): Promise<StudentCase> {
    const existingCase = await this.findCaseById(id);
    if (!existingCase) {
      throw new Error('Case not found');
    }

    // Add update to history if agent info provided
    if (agentId && agentName && data.status) {
      const update = {
        timestamp: new Date().toISOString(),
        agentId,
        agentName,
        message: `Status changed to ${data.status}`,
      };
      existingCase.updates = [...(existingCase.updates || []), update];
    }

    if (data.status === 'resolved' || data.status === 'closed') {
      existingCase.resolvedAt = new Date();
    }

    Object.assign(existingCase, data);
    return this.caseRepository.save(existingCase);
  }

  async addCaseUpdate(
    caseId: string,
    agentId: string,
    agentName: string,
    message: string,
  ): Promise<StudentCase> {
    const existingCase = await this.findCaseById(caseId);
    if (!existingCase) {
      throw new Error('Case not found');
    }

    const update = {
      timestamp: new Date().toISOString(),
      agentId,
      agentName,
      message,
    };

    existingCase.updates = [...(existingCase.updates || []), update];
    return this.caseRepository.save(existingCase);
  }

  async assignCase(caseId: string, agentId: string, agentName: string): Promise<StudentCase> {
    return this.updateCase(
      caseId,
      { assignedAgentId: agentId, assignedAgentName: agentName, status: 'in_progress' },
      agentId,
      agentName,
    );
  }

  // Statistics
  async getStudentStats(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byLevel: Record<string, number>;
    byDistrict: Record<string, number>;
  }> {
    const total = await this.studentRepository.count();

    const byStatus = await this.studentRepository
      .createQueryBuilder('student')
      .select('student.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('student.status')
      .getRawMany();

    const byLevel = await this.studentRepository
      .createQueryBuilder('student')
      .select('student.educationLevel', 'level')
      .addSelect('COUNT(*)', 'count')
      .groupBy('student.educationLevel')
      .getRawMany();

    const byDistrict = await this.studentRepository
      .createQueryBuilder('student')
      .select('student.district', 'district')
      .addSelect('COUNT(*)', 'count')
      .groupBy('student.district')
      .getRawMany();

    return {
      total,
      byStatus: byStatus.reduce((acc, item) => ({ ...acc, [item.status]: parseInt(item.count) }), {}),
      byLevel: byLevel.reduce((acc, item) => ({ ...acc, [item.level]: parseInt(item.count) }), {}),
      byDistrict: byDistrict.reduce((acc, item) => ({ ...acc, [item.district || 'Unknown']: parseInt(item.count) }), {}),
    };
  }

  async getCaseStats(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byCategory: Record<string, number>;
    byPriority: Record<string, number>;
  }> {
    const total = await this.caseRepository.count();

    const byStatus = await this.caseRepository
      .createQueryBuilder('case')
      .select('case.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('case.status')
      .getRawMany();

    const byCategory = await this.caseRepository
      .createQueryBuilder('case')
      .select('case.category', 'category')
      .addSelect('COUNT(*)', 'count')
      .groupBy('case.category')
      .getRawMany();

    const byPriority = await this.caseRepository
      .createQueryBuilder('case')
      .select('case.priority', 'priority')
      .addSelect('COUNT(*)', 'count')
      .groupBy('case.priority')
      .getRawMany();

    return {
      total,
      byStatus: byStatus.reduce((acc, item) => ({ ...acc, [item.status]: parseInt(item.count) }), {}),
      byCategory: byCategory.reduce((acc, item) => ({ ...acc, [item.category]: parseInt(item.count) }), {}),
      byPriority: byPriority.reduce((acc, item) => ({ ...acc, [item.priority]: parseInt(item.count) }), {}),
    };
  }
}
