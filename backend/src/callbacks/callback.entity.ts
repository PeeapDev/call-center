import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum CallbackStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  MISSED = 'missed',
  CANCELLED = 'cancelled',
}

export enum CallbackPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

@Entity('callbacks')
export class Callback {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Who to call
  @Column()
  phoneNumber: string;

  @Column({ nullable: true })
  callerName: string;

  @Column({ nullable: true })
  studentId: string; // Link to student record if available

  @Column({ nullable: true })
  caseId: string; // Link to case if related

  // When to call
  @Column()
  scheduledDate: Date;

  @Column({ nullable: true })
  scheduledTime: string; // e.g., "14:00"

  @Column({ nullable: true })
  timezone: string;

  // Assignment
  @Column({ nullable: true })
  assignedAgentId: string;

  @Column({ nullable: true })
  assignedAgentName: string;

  // Details
  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: CallbackStatus.SCHEDULED,
  })
  status: CallbackStatus;

  @Column({
    type: 'varchar',
    length: 10,
    default: CallbackPriority.NORMAL,
  })
  priority: CallbackPriority;

  // Attempt tracking
  @Column({ default: 0 })
  attemptCount: number;

  @Column({ default: 3 })
  maxAttempts: number;

  @Column({ type: 'json', nullable: true })
  attempts: Array<{
    timestamp: string;
    agentId: string;
    agentName: string;
    result: 'answered' | 'no_answer' | 'busy' | 'failed';
    notes?: string;
    duration?: number;
  }>;

  // Outcome
  @Column({ type: 'text', nullable: true })
  outcome: string;

  @Column({ nullable: true })
  completedAt: Date;

  @Column({ nullable: true })
  completedByAgentId: string;

  @Column({ nullable: true })
  completedByAgentName: string;

  // Created by
  @Column()
  createdByAgentId: string;

  @Column()
  createdByAgentName: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // SMS reminder sent
  @Column({ default: false })
  reminderSent: boolean;
}
