import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

export enum StudentStatus {
  ACTIVE = 'active',
  GRADUATED = 'graduated',
  SUSPENDED = 'suspended',
  TRANSFERRED = 'transferred',
  WITHDRAWN = 'withdrawn',
}

export enum EducationLevel {
  PRIMARY = 'primary',
  JSS = 'jss', // Junior Secondary School
  SSS = 'sss', // Senior Secondary School
  TERTIARY = 'tertiary',
}

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  studentId: string; // Official student ID number

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  middleName?: string;

  @Column()
  dateOfBirth: Date;

  @Column({ nullable: true })
  gender?: string;

  @Column({ nullable: true })
  phoneNumber?: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  district?: string;

  @Column({ nullable: true })
  chiefdom?: string;

  // Guardian/Parent Information
  @Column({ nullable: true })
  guardianName?: string;

  @Column({ nullable: true })
  guardianPhone?: string;

  @Column({ nullable: true })
  guardianRelation?: string;

  // School Information
  @Column({ nullable: true })
  schoolName?: string;

  @Column({ nullable: true })
  schoolCode?: string;

  @Column({
    type: 'varchar',
    default: EducationLevel.PRIMARY,
  })
  educationLevel: EducationLevel;

  @Column({ nullable: true })
  currentClass?: string;

  @Column({ nullable: true })
  enrollmentYear?: number;

  @Column({
    type: 'varchar',
    default: StudentStatus.ACTIVE,
  })
  status: StudentStatus;

  // Academic Information
  @Column({ type: 'simple-json', nullable: true })
  examResults?: Record<string, any>;

  @Column({ type: 'simple-json', nullable: true })
  scholarships?: Array<{
    name: string;
    amount: number;
    startDate: string;
    endDate: string;
    status: string;
  }>;

  // Notes and Issues
  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'simple-json', nullable: true })
  issues?: Array<{
    id: string;
    type: string;
    description: string;
    status: string;
    createdAt: string;
    resolvedAt?: string;
    resolvedBy?: string;
  }>;

  // Call History Reference
  @Column({ type: 'simple-array', nullable: true })
  callIds?: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('student_cases')
export class StudentCase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  studentId: string;

  @Column()
  caseNumber: string;

  @Column()
  category: string; // enrollment, scholarship, exam, transfer, complaint, etc.

  @Column()
  subject: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ default: 'open' })
  status: string; // open, in_progress, resolved, closed

  @Column({ default: 'medium' })
  priority: string; // low, medium, high, urgent

  @Column({ nullable: true })
  assignedAgentId?: string;

  @Column({ nullable: true })
  assignedAgentName?: string;

  @Column({ type: 'simple-json', nullable: true })
  updates?: Array<{
    timestamp: string;
    agentId: string;
    agentName: string;
    message: string;
  }>;

  @Column({ nullable: true })
  resolvedAt?: Date;

  @Column({ nullable: true })
  resolution?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
