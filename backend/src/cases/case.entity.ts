import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('cases')
export class Case {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', default: 'open' }) // open, in_progress, resolved, closed
  status: string;

  @Column({ type: 'varchar', default: 'medium' }) // low, medium, high, urgent, critical
  priority: string;

  @Column()
  category: string; // exam_malpractice, teacher_complaint, facilities, etc.

  @Column({ nullable: true })
  assignedTo: string; // Staff ID

  @Column({ nullable: true })
  reportedBy: string; // Caller name/ID

  @Column({ nullable: true })
  callerPhone: string;

  @Column({ nullable: true })
  callerEmail: string;

  // Link to call recording
  @Column({ nullable: true })
  callId: string;

  @Column({ nullable: true })
  callRecordingUrl: string;

  @Column({ type: 'int', nullable: true })
  callDuration: number; // in seconds

  @Column({ type: 'timestamp', nullable: true })
  callStartTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  callEndTime: Date;

  // Case timeline
  @Column({ type: 'date', nullable: true })
  dueDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt: Date;

  @Column({ type: 'int', default: 0 })
  durationDays: number; // Days to resolve

  // Additional details
  @Column({ type: 'json', nullable: true })
  customFields: any;

  @Column({ type: 'text', nullable: true })
  resolution: string;

  @Column({ type: 'json', nullable: true })
  attachments: string[]; // URLs to documents

  @Column({ type: 'json', nullable: true })
  notes: any[]; // Array of timestamped notes

  @Column({ type: 'int', default: 0 })
  followUpCount: number;

  @Column({ nullable: true })
  referenceNumber: string; // e.g., CASE-2025-0001

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
